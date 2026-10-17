import Papa from 'papaparse';
import { z } from 'zod';
import {
  getDb,
  agendas,
  agendaTargets,
  courses,
  academicTerms,
  courseOfferings,
  classSections,
  studyGroups,
  auditLogs,
  eq,
  and,
} from '@novarion/db';
import { parseWIBToUTC } from '@novarion/shared';
import { syncReminderJobsForAgenda } from '@/lib/reminders/scheduler';

export const agendaCsvRowSchema = z.object({
  external_id: z.string().min(1, 'External ID wajib diisi').max(100),
  judul: z.string().min(3, 'Judul agenda minimal 3 karakter').max(200),
  kategori: z
    .string()
    .min(1, 'Kategori wajib diisi')
    .refine((v) => ['tugas', 'praktikum', 'kuis', 'ujian', 'kuliah', 'kegiatan', 'pengumuman'].includes(v.toLowerCase()), {
      message: 'Kategori harus salah satu dari: tugas, praktikum, kuis, ujian, kuliah, kegiatan, pengumuman',
    }),
  waktu_mulai: z.string().optional(),
  deadline: z.string().min(1, 'Deadline wajib diisi'),
  kode_mata_kuliah: z.string().optional(),
  kelas: z.string().optional(),
  kelompok: z.string().optional(),
  deskripsi: z.string().optional(),
  warna: z
    .string()
    .optional()
    .refine((v) => !v || /^#[0-9A-Fa-f]{6}$/.test(v), {
      message: 'Format warna harus HEX valid contoh #41C2A1',
    }),
});

export type AgendaCsvRow = z.infer<typeof agendaCsvRowSchema>;

export interface AgendaCsvError {
  row: number;
  externalId?: string;
  judul?: string;
  message: string;
}

export interface AgendaImportPreview {
  fileName: string;
  totalRows: number;
  validRows: Array<{
    externalId: string;
    title: string;
    category: string;
    startTime: string | null;
    deadline: string;
    scope: 'angkatan' | 'mata_kuliah' | 'kelas' | 'kelompok';
    courseId?: string | null;
    courseCode?: string;
    classSectionId?: string | null;
    studyGroupId?: string | null;
    description?: string | null;
    color: string;
    action: 'insert' | 'update';
  }>;
  duplicateCount: number;
  errors: AgendaCsvError[];
}

export interface AgendaImportResult {
  success: boolean;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  remindersScheduledCount: number;
  errorCount: number;
  errors: AgendaCsvError[];
}

function normalizeHeader(header: string): string {
  const cleaned = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
  if (['external_id', 'id_eksternal', 'id', 'kode_agenda'].includes(cleaned)) return 'external_id';
  if (['judul', 'title', 'nama_agenda', 'nama_tugas'].includes(cleaned)) return 'judul';
  if (['kategori', 'category', 'jenis'].includes(cleaned)) return 'kategori';
  if (['waktu_mulai', 'start_time', 'mulai', 'waktu_pelaksanaan'].includes(cleaned)) return 'waktu_mulai';
  if (['deadline', 'batas_waktu', 'selesai', 'end_time', 'due_date'].includes(cleaned)) return 'deadline';
  if (['kode_mata_kuliah', 'kode_matkul', 'kode_mk', 'course_code'].includes(cleaned)) return 'kode_mata_kuliah';
  if (['kelas', 'kelas_paralel', 'section'].includes(cleaned)) return 'kelas';
  if (['kelompok', 'kelompok_praktikum', 'group'].includes(cleaned)) return 'kelompok';
  if (['deskripsi', 'description', 'keterangan', 'catatan'].includes(cleaned)) return 'deskripsi';
  if (['warna', 'color', 'hex_color', 'warna_kalender'].includes(cleaned)) return 'warna';
  return cleaned;
}

/**
 * Parsing dan normalisasi string waktu ke Date UTC dengan asumsi zona waktu Asia/Jakarta (WIB)
 */
function parseDatetimeWIB(datetimeStr: string): Date | null {
  if (!datetimeStr || !datetimeStr.trim()) return null;
  const trimmed = datetimeStr.trim();

  // Bila ISO dengan timezone atau Z
  if (trimmed.includes('Z') || trimmed.includes('+')) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  // Jika format YYYY-MM-DD HH:mm:ss atau YYYY-MM-DDTHH:mm:ss (WIB)
  const formatted = trimmed.replace(' ', 'T');
  const d = new Date(`${formatted}+07:00`);
  return isNaN(d.getTime()) ? null : d;
}

export async function parseAndValidateAgendaCSV(
  csvContent: string,
  fileName = 'agenda_akademik.csv'
): Promise<AgendaImportPreview> {
  const db = getDb();

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  });

  const errors: AgendaCsvError[] = [];
  const validRows: AgendaImportPreview['validRows'] = [];
  const seenExternalIds = new Set<string>();
  let duplicateCount = 0;

  // Master data lookups
  const [allCourses, allAgendas, activeTerms, allSections, allGroups] = await Promise.all([
    db.select({ id: courses.id, code: courses.code }).from(courses),
    db.select({ id: agendas.id, externalId: agendas.externalId }).from(agendas),
    db.select().from(academicTerms).where(eq(academicTerms.isActive, true)).limit(1),
    db.select({ id: classSections.id, name: classSections.name, offeringId: classSections.offeringId }).from(classSections),
    db.select({ id: studyGroups.id, name: studyGroups.name, classSectionId: studyGroups.classSectionId }).from(studyGroups),
  ]);

  const courseMap = new Map(allCourses.map((c) => [c.code.trim().toUpperCase(), c]));
  const existingAgendaExternalIdMap = new Map(
    allAgendas.filter((a) => a.externalId).map((a) => [a.externalId!.trim(), a.id])
  );

  parsed.data.forEach((rawRow, index) => {
    const rowNumber = index + 2;

    const validation = agendaCsvRowSchema.safeParse({
      external_id: rawRow.external_id?.trim() || '',
      judul: rawRow.judul?.trim() || '',
      kategori: rawRow.kategori?.trim()?.toLowerCase() || '',
      waktu_mulai: rawRow.waktu_mulai?.trim() || undefined,
      deadline: rawRow.deadline?.trim() || '',
      kode_mata_kuliah: rawRow.kode_mata_kuliah?.trim() || undefined,
      kelas: rawRow.kelas?.trim() || undefined,
      kelompok: rawRow.kelompok?.trim() || undefined,
      deskripsi: rawRow.deskripsi?.trim() || undefined,
      warna: rawRow.warna?.trim() || undefined,
    });

    if (!validation.success) {
      errors.push({
        row: rowNumber,
        externalId: rawRow.external_id,
        judul: rawRow.judul,
        message: validation.error.errors.map((e) => e.message).join('; '),
      });
      return;
    }

    const {
      external_id,
      judul,
      kategori,
      waktu_mulai,
      deadline,
      kode_mata_kuliah,
      kelas,
      kelompok,
      deskripsi,
      warna,
    } = validation.data;

    // Check duplicate external_id within CSV
    if (seenExternalIds.has(external_id)) {
      duplicateCount++;
      errors.push({
        row: rowNumber,
        externalId: external_id,
        judul,
        message: `External ID "${external_id}" duplikat di dalam berkas CSV.`,
      });
      return;
    }
    seenExternalIds.add(external_id);

    // Validate deadline format
    const deadlineDate = parseDatetimeWIB(deadline);
    if (!deadlineDate) {
      errors.push({
        row: rowNumber,
        externalId: external_id,
        judul,
        message: `Format batas waktu (deadline) tidak valid: "${deadline}". Gunakan format YYYY-MM-DD HH:mm:ss.`,
      });
      return;
    }

    // Validate start time format (if provided)
    let startDate: Date | null = null;
    if (waktu_mulai) {
      startDate = parseDatetimeWIB(waktu_mulai);
      if (!startDate) {
        errors.push({
          row: rowNumber,
          externalId: external_id,
          judul,
          message: `Format waktu mulai tidak valid: "${waktu_mulai}". Gunakan format YYYY-MM-DD HH:mm:ss.`,
        });
        return;
      }
      if (startDate > deadlineDate) {
        errors.push({
          row: rowNumber,
          externalId: external_id,
          judul,
          message: `Waktu mulai tidak boleh lebih lambat daripada batas waktu (deadline).`,
        });
        return;
      }
    }

    // Scope and Target Resolution
    let scope: 'angkatan' | 'mata_kuliah' | 'kelas' | 'kelompok' = 'angkatan';
    let targetCourseId: string | undefined;

    if (kode_mata_kuliah) {
      const course = courseMap.get(kode_mata_kuliah.toUpperCase());
      if (!course) {
        errors.push({
          row: rowNumber,
          externalId: external_id,
          judul,
          message: `Mata kuliah "${kode_mata_kuliah}" tidak terdaftar di sistem.`,
        });
        return;
      }
      targetCourseId = course.id;

      if (kelompok) {
        scope = 'kelompok';
      } else if (kelas) {
        scope = 'kelas';
      } else {
        scope = 'mata_kuliah';
      }
    }

    const action = existingAgendaExternalIdMap.has(external_id) ? 'update' : 'insert';

    validRows.push({
      externalId: external_id,
      title: judul,
      category: kategori,
      startTime: startDate ? startDate.toISOString() : null,
      deadline: deadlineDate.toISOString(),
      scope,
      courseId: targetCourseId,
      courseCode: kode_mata_kuliah ? kode_mata_kuliah.toUpperCase() : undefined,
      description: deskripsi || null,
      color: warna || '#41C2A1',
      action,
    });
  });

  return {
    fileName,
    totalRows: parsed.data.length,
    validRows,
    duplicateCount,
    errors,
  };
}

export async function executeAgendaImport(
  validRows: AgendaImportPreview['validRows'],
  actorId: string
): Promise<AgendaImportResult> {
  const db = getDb();
  let insertedCount = 0;
  let updatedCount = 0;
  let remindersScheduledCount = 0;
  const errors: AgendaCsvError[] = [];

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];

    try {
      const existing = await db
        .select()
        .from(agendas)
        .where(eq(agendas.externalId, row.externalId))
        .limit(1);

      let agendaId: string;

      if (existing.length > 0) {
        agendaId = existing[0].id;
        // Update existing agenda
        await db
          .update(agendas)
          .set({
            title: row.title,
            category: row.category,
            description: row.description,
            startTime: row.startTime ? new Date(row.startTime) : null,
            deadline: new Date(row.deadline),
            scope: row.scope,
            color: row.color,
            updatedAt: new Date(),
          })
          .where(eq(agendas.id, agendaId));

        // Update target course if changed
        if (row.courseId) {
          const existingTarget = await db
            .select()
            .from(agendaTargets)
            .where(eq(agendaTargets.agendaId, agendaId))
            .limit(1);

          if (existingTarget.length > 0) {
            await db
              .update(agendaTargets)
              .set({ courseId: row.courseId })
              .where(eq(agendaTargets.agendaId, agendaId));
          } else {
            await db.insert(agendaTargets).values({
              agendaId,
              courseId: row.courseId,
            });
          }
        }

        updatedCount++;
      } else {
        // Insert new official agenda directly (status: 'published')
        const inserted = await db
          .insert(agendas)
          .values({
            title: row.title,
            category: row.category,
            description: row.description,
            startTime: row.startTime ? new Date(row.startTime) : null,
            deadline: new Date(row.deadline),
            scope: row.scope,
            color: row.color,
            externalId: row.externalId,
            status: 'published',
            createdBy: actorId,
          })
          .returning({ id: agendas.id });

        agendaId = inserted[0].id;

        if (row.courseId) {
          await db.insert(agendaTargets).values({
            agendaId,
            courseId: row.courseId,
          });
        }

        insertedCount++;
      }

      // Automatically sync and schedule H-7, H-3, H-1, T-3h WhatsApp reminder jobs
      await syncReminderJobsForAgenda({
        agendaId,
        deadline: new Date(row.deadline),
        status: 'published',
        courseId: row.courseId,
        classSectionId: row.classSectionId,
        studyGroupId: row.studyGroupId,
      });
      remindersScheduledCount++;
    } catch (err) {
      errors.push({
        row: i + 1,
        externalId: row.externalId,
        judul: row.title,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Audit log
  await db.insert(auditLogs).values({
    actorId,
    action: 'CSV_AGENDA_IMPORT_EXECUTED',
    entityType: 'agendas',
    entityId: actorId,
    newValues: {
      totalSubmitted: validRows.length,
      insertedCount,
      updatedCount,
      remindersScheduledCount,
      errorCount: errors.length,
    },
  });

  return {
    success: errors.length === 0,
    totalRows: validRows.length,
    insertedCount,
    updatedCount,
    remindersScheduledCount,
    errorCount: errors.length,
    errors,
  };
}
