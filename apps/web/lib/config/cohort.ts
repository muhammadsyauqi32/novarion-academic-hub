/**
 * Konfigurasi Identitas, Filosofi, dan Struktur Pengurus Angkatan Novarion
 * Statistika dan Sains Data · Angkatan 62 · IPB University
 */

export interface CohortLeader {
  name: string;
  nim?: string;
  role: string;
  division?: string;
  photoUrl?: string | null;
  bio?: string;
}

export interface LeadershipDivision {
  divisionName: string;
  description: string;
  members: CohortLeader[];
}

export const COHORT_CONFIG = {
  name: 'NOVARION',
  tagline: 'Kita Satu, Kita Bisa!',
  program: 'Statistika dan Sains Data',
  cohortNumber: 62,
  institution: 'IPB University',
  
  philosophy: {
    title: 'Filosofi Nama NOVARION',
    summary: 'Nova (cahaya bintang yang bersinar sangat terang) dan Orion (rasi bintang penunjuk arah atau pemimpin).',
    nova: {
      term: 'Nova',
      meaning: 'Cahaya bintang yang mengalami ledakan energi hingga bersinar berkali-kali lipat lebih terang. Melambangkan semangat inovatif, kecerdasan analitis, dan pancaran kontribusi setiap mahasiswa Statistika 62.',
    },
    orion: {
      term: 'Orion',
      meaning: 'Rasi bintang legendaris yang sejak zaman kuno menjadi kompas penunjuk arah para pelaut dan penjelajah. Melambangkan kepemimpinan, keteguhan prinsip, dan arah gerak bersama menuju masa depan.',
    },
    synthesis: 'Novarion adalah bintang yang bersinar terang dan siap menjadi pemimpin masa depan. Berlandaskan persaudaraan erat, kami melangkah bersama dengan keyakinan bahwa kekuatan data dan kebersamaan mampu menghadirkan dampak nyata bagi almamater dan bangsa.',
  },

  values: [
    {
      title: 'Kolektivitas & Solidaritas',
      description: 'Tidak ada yang ditinggalkan di belakang. Setiap langkah, tugas akhir, dan perjuangan akademik ditempuh bersama.',
      accent: '#41C2A1',
    },
    {
      title: 'Ketajaman Analitis',
      description: 'Menemukan makna di balik deretan data, menjunjung integritas metodologi, dan berfikir kritis dalam menyelesaikan persoalan nyata.',
      accent: '#FFAE5D',
    },
    {
      title: 'Kepemimpinan Visioner',
      description: 'Menjadi rasi pemandu layaknya Orion, menghadirkan arah baru yang konstruktif dan berdaya guna bagi masyarakat.',
      accent: '#EAEAB7',
    },
  ],

  leadership: [
    {
      divisionName: 'Pengurus Inti',
      description: 'Pengarah kebijakan dan pemegang mandat koordinasi angkatan.',
      members: [
        {
          name: 'Ketua Angkatan',
          role: 'Ketua Angkatan Novarion 62',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Mengkoordinasikan arah gerak kolektif dan representasi resmi angkatan.',
        },
        {
          name: 'Wakil Ketua Angkatan',
          role: 'Wakil Ketua Angkatan',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Menjaga harmoni internal dan efektivitas koordinasi seluruh divisi kerja.',
        },
        {
          name: 'Sekretaris Angkatan',
          role: 'Sekretaris Umum',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Tata kelola persuratan, notulensi rapat akbar, dan inventarisasi data angkatan.',
        },
        {
          name: 'Bendahara Angkatan',
          role: 'Bendahara Umum',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Pengelolaan kas angkatan, transparansi finansial, dan budgeting agenda bersama.',
        },
      ],
    },
    {
      divisionName: 'Divisi Akademik & Riset',
      description: 'Pusat bantuan belajar, repositori modul praktikum, dan kelompok tutor sebaya.',
      members: [
        {
          name: 'Koordinator Akademik',
          role: 'Koordinator Divisi',
          division: 'Akademik & Riset',
          photoUrl: null,
          bio: 'Mengawal sinkronisasi silabus, jadwal responsi, dan repositori materi kuliah.',
        },
        {
          name: 'Tim Responsi & Bank Soal',
          role: 'Staff Divisi',
          division: 'Akademik & Riset',
          photoUrl: null,
          bio: 'Menyusun kompilasi pembahasan latihan soal dan asistensi ujian.',
        },
      ],
    },
    {
      divisionName: 'Divisi Komunikasi, Media & Dokumentasi',
      description: 'Penyalur warta resmi, arsip visual momen angkatan, dan pengelolaan media sosial.',
      members: [
        {
          name: 'Koordinator Media',
          role: 'Koordinator Divisi',
          division: 'Komunikasi & Media',
          photoUrl: null,
          bio: 'Merancang publikasi visual, yearbook angkatan, dan dokumentasi setiap momentum.',
        },
        {
          name: 'Tim Dokumentasi & Kreatif',
          role: 'Staff Divisi',
          division: 'Komunikasi & Media',
          photoUrl: null,
          bio: 'Menghasilkan rekaman visual autentik dari berbagai kegiatan kebersamaan.',
        },
      ],
    },
    {
      divisionName: 'Divisi Kekeluargaan & Sosial',
      description: 'Menjaga kehangatan antarmahasiswa, perayaan milad, dan aksi solidaritas sosial.',
      members: [
        {
          name: 'Koordinator Kekeluargaan',
          role: 'Koordinator Divisi',
          division: 'Kekeluargaan & Sosial',
          photoUrl: null,
          bio: 'Merajut kebersamaan, gathering berkala, dan aksi kepedulian sosial sesama angkatan.',
        },
      ],
    },
  ] as LeadershipDivision[],
};
