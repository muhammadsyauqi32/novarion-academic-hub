'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { parseAndValidateCSV, executeCSVImport, CSVImportPreview, CSVImportResult } from '@/lib/csv/importer';
import { revalidatePath } from 'next/cache';

export async function previewCSVAction(csvContent: string, fileName: string): Promise<CSVImportPreview> {
  await requireAdmin();
  return parseAndValidateCSV(csvContent, fileName);
}

export async function executeCSVAction(preview: CSVImportPreview): Promise<CSVImportResult> {
  const admin = await requireAdmin();
  const result = await executeCSVImport(preview, admin.id);
  revalidatePath('/admin/students');
  revalidatePath('/admin/imports');
  return result;
}
