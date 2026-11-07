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
    title: 'Dua Makna Nama NOVARION',
    summary: 'Nova (bintang yang bersinar terang) dan Orion (rasi bintang penunjuk arah navigasi).',
    nova: {
      term: 'Nova',
      meaning: 'Bintang yang memancarkan kilau terang. Melambangkan semangat belajar, ketajaman analisis, dan ketekunan mahasiswa Statistika 62 dalam mengolah data.',
    },
    orion: {
      term: 'Orion',
      meaning: 'Rasi bintang penunjuk arah bagi para pengelana. Melambangkan kebersamaan dan kompas solidaritas agar saling dukung selama masa kuliah di Dramaga.',
    },
    synthesis: 'Novarion menyatukan semangat belajar di bidang sains data dengan rasa persaudaraan yang erat agar seluruh mahasiswa Angkatan 62 dapat melangkah dan sukses bersama.',
  },

  values: [
    {
      title: 'Solidaritas & Saling Bantu',
      description: 'Saling berbagi catatan kuliah, belajar bareng, dan memastikan teman seangkatan bisa melewati masa kuliah bersama.',
      accent: '#41C2A1',
    },
    {
      title: 'Ketelitian Analitis',
      description: 'Mengolah data secara jujur, cermat memahami metodologi, dan tekun melatih kemampuan komputasi statistik.',
      accent: '#FFAE5D',
    },
    {
      title: 'Aktif & Bermanfaat',
      description: 'Menerapkan ilmu sains data untuk kompetisi akademik, riset mini, dan kegiatan kepedulian mahasiswa.',
      accent: '#EAEAB7',
    },
  ],

  leadership: [
    {
      divisionName: 'Pengurus Inti',
      description: 'Pengurus harian yang mengoordinasikan kegiatan angkatan dan administrasi bersama.',
      members: [
        {
          name: 'Ketua Angkatan',
          role: 'Ketua Angkatan Novarion 62',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Mengoordinasikan kegiatan angkatan dan menjadi narahubung utama ke departemen dan organisasi kampus.',
        },
        {
          name: 'Wakil Ketua Angkatan',
          role: 'Wakil Ketua Angkatan',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Membantu koordinasi internal antar-divisi dan memastikan agenda angkatan terlaksana dengan lancar.',
        },
        {
          name: 'Sekretaris Angkatan',
          role: 'Sekretaris Umum',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Mengelola administrasi surat-menyurat, notulensi musyawarah, dan arsip data angkatan.',
        },
        {
          name: 'Bendahara Angkatan',
          role: 'Bendahara Umum',
          division: 'Pengurus Inti',
          photoUrl: null,
          bio: 'Mengelola uang kas angkatan secara transparan dan mengatur kebutuhan anggaran kegiatan bersama.',
        },
      ],
    },
    {
      divisionName: 'Divisi Akademik & Riset',
      description: 'Mengoordinasikan bank materi kuliah, jadwal responsi sebelum UTS/UAS, dan kelompok belajar praktikum.',
      members: [
        {
          name: 'Koordinator Akademik',
          role: 'Koordinator Divisi',
          division: 'Akademik & Riset',
          photoUrl: null,
          bio: 'Mengawal sinkronisasi silabus, jadwal responsi, dan repositori bahan kuliah.',
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
      description: 'Mengelola media sosial resmi angkatan, publikasi warta kegiatan, dan dokumentasi foto mahasiswa.',
      members: [
        {
          name: 'Koordinator Media',
          role: 'Koordinator Divisi',
          division: 'Komunikasi & Media',
          photoUrl: null,
          bio: 'Merancang publikasi visual, pengelolaan media sosial, dan dokumentasi setiap kegiatan angkatan.',
        },
        {
          name: 'Tim Dokumentasi & Kreatif',
          role: 'Staff Divisi',
          division: 'Komunikasi & Media',
          photoUrl: null,
          bio: 'Mendokumentasikan berbagai kegiatan perkuliahan dan temu bersama angkatan.',
        },
      ],
    },
    {
      divisionName: 'Divisi Kekeluargaan & Sosial',
      description: 'Menyelenggarakan temu angkatan, ucapan selamat ulang tahun teman seangkatan, dan aksi peduli sesama.',
      members: [
        {
          name: 'Koordinator Kekeluargaan',
          role: 'Koordinator Divisi',
          division: 'Kekeluargaan & Sosial',
          photoUrl: null,
          bio: 'Merajut kebersamaan, agenda gathering santai, dan aksi kepedulian sosial sesama teman seangkatan.',
        },
      ],
    },
  ] as LeadershipDivision[],
};
