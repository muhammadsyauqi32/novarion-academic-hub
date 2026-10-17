import { redirect } from 'next/navigation';

export default function DeprecatedGlobalImportPage() {
  // Master prompt rule 14: CSV placement separated into 3 modules
  // Student import -> Data Mahasiswa (/admin/students)
  // Mapping import -> Struktur Akademik (/admin/academics)
  // Agenda import -> Kelola Agenda (/admin/agendas)
  redirect('/admin/students');
}
