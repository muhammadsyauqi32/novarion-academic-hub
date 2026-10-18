import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, studentWhitelist } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Badge } from '@/components/Badge';
import { StudentManagementClient } from './StudentManagementClient';

export default async function StudentsWhitelistPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  const db = getDb();

  const query = searchParams.q || '';

  const allStudents = await db
    .select()
    .from(studentWhitelist)
    .orderBy(desc(studentWhitelist.createdAt));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-card bg-surface border border-border">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Mahasiswa & Akses Akun
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Kelola whitelist, aktivasi akun, dan reset kata sandi mahasiswa angkatan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-teal-deep/10 text-teal-deep border border-teal-deep/20">
            {allStudents.length} Mahasiswa Terdaftar
          </span>
        </div>
      </div>

      <StudentManagementClient initialStudents={allStudents} query={query} />
    </div>
  );
}
