'use server';

import { requireAuth, requireAdmin } from '@/lib/auth/guards';
import { isSuperAdmin, hasPermission } from '@/lib/auth/permissions';
import {
  parseAndValidateStudentCSV,
  executeStudentImport,
} from '@/lib/csv/student-import';
import {
  parseAndValidateAcademicMappingCSV,
  executeAcademicMappingImport,
} from '@/lib/csv/academic-mapping-import';
import {
  parseAndValidateAgendaCSV,
  executeAgendaImport,
} from '@/lib/csv/agenda-import';
import { revalidatePath } from 'next/cache';

// ==========================================
// MODULE A: STUDENT DATA IMPORT
// ==========================================

export async function previewStudentCsvAction(csvContent: string, fileName?: string) {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);
  if (!superAdmin) {
    return { success: false, error: 'Akses ditolak: Hanya Super Admin yang dapat mengimpor Data Mahasiswa.' };
  }

  try {
    const preview = await parseAndValidateStudentCSV(csvContent, fileName);
    return { success: true, preview };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function executeStudentCsvAction(csvContent: string, fileName?: string) {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);
  if (!superAdmin) {
    return { success: false, error: 'Akses ditolak: Hanya Super Admin yang dapat mengimpor Data Mahasiswa.' };
  }

  try {
    // Server-side revalidation of raw CSV content to prevent forged client preview
    const preview = await parseAndValidateStudentCSV(csvContent, fileName);
    if (preview.errors.length > 0) {
      return {
        success: false,
        error: `Terdapat ${preview.errors.length} baris bermasalah. Perbaiki berkas CSV sebelum melanjutkan.`,
        errors: preview.errors,
      };
    }

    const result = await executeStudentImport(preview.validRows, user.id);
    revalidatePath('/admin/students');
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ==========================================
// MODULE B: ACADEMIC MAPPING IMPORT
// ==========================================

export async function previewAcademicMappingCsvAction(csvContent: string, fileName?: string) {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);
  if (!superAdmin) {
    return { success: false, error: 'Akses ditolak: Hanya Super Admin yang dapat mengimpor Pemetaan Akademik.' };
  }

  try {
    const preview = await parseAndValidateAcademicMappingCSV(csvContent, fileName);
    return { success: true, preview };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function executeAcademicMappingCsvAction(csvContent: string, fileName?: string) {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);
  if (!superAdmin) {
    return { success: false, error: 'Akses ditolak: Hanya Super Admin yang dapat mengimpor Pemetaan Akademik.' };
  }

  try {
    const preview = await parseAndValidateAcademicMappingCSV(csvContent, fileName);
    if (preview.errors.length > 0) {
      return {
        success: false,
        error: `Terdapat ${preview.errors.length} baris bermasalah dalam mapping. Perbaiki sebelum mengeksekusi.`,
        errors: preview.errors,
      };
    }

    const result = await executeAcademicMappingImport(preview.validRows, user.id);
    revalidatePath('/admin/academics');
    revalidatePath('/app/calendar');
    revalidatePath('/app');
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ==========================================
// MODULE C: ACADEMIC AGENDA IMPORT
// ==========================================

export async function previewAgendaCsvAction(csvContent: string, fileName?: string) {
  const user = await requireAuth();
  const canImport = user.role === 'admin' || (await hasPermission(user, 'agenda.import'));
  if (!canImport) {
    return { success: false, error: 'Akses ditolak: Anda tidak memiliki izin agenda.import.' };
  }

  try {
    const preview = await parseAndValidateAgendaCSV(csvContent, fileName);
    return { success: true, preview };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function executeAgendaCsvAction(csvContent: string, fileName?: string) {
  const user = await requireAuth();
  const canImport = user.role === 'admin' || (await hasPermission(user, 'agenda.import'));
  if (!canImport) {
    return { success: false, error: 'Akses ditolak: Anda tidak memiliki izin agenda.import.' };
  }

  try {
    const preview = await parseAndValidateAgendaCSV(csvContent, fileName);
    if (preview.errors.length > 0) {
      return {
        success: false,
        error: `Terdapat ${preview.errors.length} baris tidak valid dalam CSV agenda.`,
        errors: preview.errors,
      };
    }

    const result = await executeAgendaImport(preview.validRows, user.id);
    revalidatePath('/admin/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app/agendas');
    revalidatePath('/app');
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
