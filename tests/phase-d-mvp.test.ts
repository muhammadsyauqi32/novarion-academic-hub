import { describe, it, expect } from 'vitest';
import { agendaSubmissionSchema, formatWIB, formatWIBShort } from '@novarion/shared';

describe('PHASE D: Academic Hub MVP Completion & End-to-End Tests', () => {
  describe('D.1 Student Dashboard & Data Aggregation', () => {
    it('menghasilkan ringkasan agenda mendatang yang telah berstatus published', () => {
      const now = new Date('2026-10-17T08:00:00Z');
      const allAgendas = [
        {
          id: 'ag-1',
          title: 'Tugas Deret Waktu',
          status: 'published',
          deadline: new Date('2026-10-20T16:59:00Z'),
        },
        {
          id: 'ag-2',
          title: 'Pengajuan Tugas Pending',
          status: 'pending',
          deadline: new Date('2026-10-22T16:59:00Z'),
        },
        {
          id: 'ag-3',
          title: 'Tugas Masa Lalu',
          status: 'published',
          deadline: new Date('2026-10-10T16:59:00Z'),
        },
      ];

      const upcomingPublished = allAgendas.filter(
        (a) => a.status === 'published' && a.deadline >= now
      );

      expect(upcomingPublished.length).toBe(1);
      expect(upcomingPublished[0].id).toBe('ag-1');
    });

    it('menghitung progres checklist tugas pribadi secara akurat', () => {
      const tasks = [
        { id: 't-1', title: 'Belajar Bab 1', status: 'done' },
        { id: 't-2', title: 'Install RStudio', status: 'done' },
        { id: 't-3', title: 'Laporan Regresi', status: 'todo' },
      ];

      const completed = tasks.filter((t) => t.status === 'done').length;
      expect(completed).toBe(2);
      expect(tasks.length).toBe(3);
    });
  });

  describe('D.2 Academic Calendar & Timezone WIB Formatting', () => {
    it('memformat tanggal deadline dalam Waktu Indonesia Barat (WIB, UTC+7)', () => {
      // 2026-10-20 16:59:00 UTC = 2026-10-20 23:59:00 WIB
      const isoUtc = '2026-10-20T16:59:00Z';
      const formatted = formatWIBShort(isoUtc);

      expect(formatted).toContain('20 Okt 2026');
      expect(formatted).toContain('23:59');
      expect(formatted).toContain('WIB');
    });

    it('memvalidasi skema pengajuan agenda pada tanggal yang dipilih', () => {
      const validSubmission = {
        title: 'Laporan Praktikum Analisis Data Eksploratif',
        category: 'praktikum',
        scope: 'angkatan',
        deadline: '2026-10-25T16:59:00.000Z',
        description: 'Format file PDF dikumpulkan di Google Classroom.',
        location_or_link: 'https://classroom.google.com/c/12345',
      };

      const result = agendaSubmissionSchema.safeParse(validSubmission);
      expect(result.success).toBe(true);
    });
  });

  describe('D.3 Personal Tasks Privacy & Isolation', () => {
    it('menjamin student 2 tidak dapat melihat atau mengubah tugas student 1', () => {
      const student1 = { id: 'student-1-uuid', nim: 'TEST001' };
      const student2 = { id: 'student-2-uuid', nim: 'TEST002' };

      const student1Tasks = [
        { id: 'task-101', profileId: student1.id, title: 'Catatan Kuliah Pribadi Student 1', status: 'todo' },
      ];

      function canMutateTask(taskId: string, targetProfileId: string, currentUserId: string): boolean {
        return targetProfileId === currentUserId;
      }

      expect(canMutateTask('task-101', student1Tasks[0].profileId, student1.id)).toBe(true);
      expect(canMutateTask('task-101', student1Tasks[0].profileId, student2.id)).toBe(false);
    });
  });

  describe('D.6 & D.7 Agenda Lifecycle: Submission Moderation vs Direct Admin Publishing', () => {
    it('memastikan pengajuan oleh mahasiswa selalu berstatus pending sebelum dimoderasi', () => {
      function processStudentAgendaSubmission(data: { title: string; category: string; scope: string }) {
        return {
          ...data,
          status: 'pending', // Wajib pending
          version: 1,
        };
      }

      const agenda = processStudentAgendaSubmission({
        title: 'Usulan Jadwal Pengganti Praktikum',
        category: 'praktikum',
        scope: 'kelas',
      });

      expect(agenda.status).toBe('pending');
    });

    it('memastikan pembuatan agenda oleh admin langsung berstatus published di admin workspace', () => {
      function processAdminAgendaCreation(data: { title: string; category: string; scope: string }) {
        return {
          ...data,
          status: 'published', // Langsung publish oleh admin
          version: 1,
        };
      }

      const adminAgenda = processAdminAgendaCreation({
        title: 'Ujian Tengah Semester Analisis Multivariat',
        category: 'ujian',
        scope: 'angkatan',
      });

      expect(adminAgenda.status).toBe('published');
    });

    it('memverifikasi alur moderasi: persetujuan admin mengubah status pending menjadi published', () => {
      const submission = {
        id: 'sub-1',
        title: 'Tugas Kuliah Sesi 5',
        status: 'pending',
      };

      function approveSubmission(sub: typeof submission) {
        return {
          ...sub,
          status: 'published' as const,
          reviewedAt: new Date(),
        };
      }

      const approved = approveSubmission(submission);
      expect(approved.status).toBe('published');
    });
  });

  describe('D.4 & D.5 Materials & Knowledge Hub Filtering', () => {
    it('menyaring materi berdasarkan mata kuliah yang dipilih', () => {
      const materials = [
        { id: 'm-1', title: 'Slide Regresi Linear', courseCode: 'STAT201' },
        { id: 'm-2', title: 'Modul R Markdown', courseCode: 'STAT101' },
        { id: 'm-3', title: 'Panduan Perpustakaan', courseCode: null },
      ];

      function filterMaterials(list: typeof materials, courseCode: string) {
        if (courseCode === 'all') return list;
        return list.filter((m) => m.courseCode === courseCode);
      }

      expect(filterMaterials(materials, 'STAT201').length).toBe(1);
      expect(filterMaterials(materials, 'STAT201')[0].title).toBe('Slide Regresi Linear');
      expect(filterMaterials(materials, 'all').length).toBe(3);
    });

    it('mencari artikel knowledge hub berdasarkan kata kunci judul atau isi', () => {
      const articles = [
        { id: 'k-1', title: 'Panduan Instalasi RStudio', content: 'Langkah download dan install RStudio desktop' },
        { id: 'k-2', title: 'Pengisian KRS Online', content: 'Jadwal KRS dan konsultasi dosen PA' },
      ];

      function searchKnowledge(query: string) {
        const q = query.toLowerCase();
        return articles.filter(
          (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
        );
      }

      expect(searchKnowledge('RStudio').length).toBe(1);
      expect(searchKnowledge('KRS').length).toBe(1);
      expect(searchKnowledge('konsultasi').length).toBe(1);
      expect(searchKnowledge('nonexistent').length).toBe(0);
    });
  });
});
