import React from 'react';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/guards';
import { isSuperAdmin } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { getStudentsPermissionsListAction } from '@/actions/permissions';
import { getDb, courses, classSections } from '@novarion/db';
import { PermissionsClient } from './PermissionsClient';

export const metadata: Metadata = {
  title: 'Role & Permission — Novarion Admin',
};

export default async function PermissionsPage() {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);

  if (!superAdmin) {
    redirect('/admin');
  }

  const [studentsRes, courseRows, classRows] = await Promise.all([
    getStudentsPermissionsListAction(),
    getDb().select().from(courses),
    getDb().select().from(classSections),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-deep uppercase tracking-wider">
          <span>Manajemen Angkatan</span>
          <span>•</span>
          <span>Otoritas & Delegasi</span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Role & Granular Permissions
        </h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Delegasikan tanggung jawab kepada mahasiswa tertentu (Agenda Manager, Materials Manager, dll.) dengan cakupan spesifik tanpa memberikan akses Super Admin tanpa batas.
        </p>
      </div>

      <PermissionsClient
        initialStudents={studentsRes.data || []}
        courses={courseRows}
        classSections={classRows}
      />
    </div>
  );
}
