import { AppPermission } from '@novarion/shared';

export const PERMISSION_PRESETS: Record<string, { label: string; description: string; permissions: AppPermission[] }> = {
  AGENDA_MANAGER: {
    label: 'Agenda Manager (Pengelola Agenda)',
    description: 'Dapat membuat, mengedit, membatalkan, dan mengimpor agenda akademik resmi secara langsung.',
    permissions: ['agenda.create', 'agenda.edit', 'agenda.cancel', 'agenda.import', 'agenda.review'],
  },
  MATERIALS_MANAGER: {
    label: 'Materials Manager (Pengelola Materi)',
    description: 'Dapat mengunggah, memperbarui, dan mengelola berkas materi perkuliahan dalam ruang lingkupnya.',
    permissions: ['materials.manage'],
  },
  KNOWLEDGE_MANAGER: {
    label: 'Knowledge Hub Editor',
    description: 'Dapat menulis dan memperbarui artikel panduan serta FAQ pada Knowledge Hub.',
    permissions: ['knowledge.manage'],
  },
  SUPER_ADMIN: {
    label: 'Super Admin (Otoritas Penuh)',
    description: 'Akses tanpa batas ke seluruh modul sistem, CMS, manajemen mahasiswa, akun, dan WhatsApp.',
    permissions: [
      'agenda.create',
      'agenda.edit',
      'agenda.cancel',
      'agenda.import',
      'agenda.review',
      'materials.manage',
      'knowledge.manage',
      'students.manage',
      'permissions.manage',
      'website.manage',
      'whatsapp.manage',
      'audit.read',
    ],
  },
};
