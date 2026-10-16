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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Mahasiswa & Akses Akun
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Kelola whitelist, aktivasi akun, dan reset kata sandi mahasiswa angkatan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" size="md">
            {allStudents.length} Mahasiswa Terdaftar
          </Badge>
        </div>
      </div>

      <StudentManagementClient initialStudents={allStudents} query={query} />
    </div>
  );
}
