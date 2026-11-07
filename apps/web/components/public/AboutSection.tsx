'use client';

import React from 'react';
import Image from 'next/image';
import { COHORT_CONFIG } from '@/lib/config/cohort';

export function AboutSection() {
  const pillars = [
    {
      title: 'Belajar Bareng & Saling Bantu',
      description:
        'Kuliah statistika dan komputasi menuntut pemahaman logika matematika yang kuat. Dari latihan soal mingguan sampai persiapan ujian, kita saling berbagi catatan dan belajar bersama.',
      practice: 'Contoh kegiatan: Responsi sebaya sebelum UTS/UAS dan bank soal latihan.',
    },
    {
      title: 'Ketelitian Analisis',
      description:
        'Membiasakan diri mengolah data secara jujur, cermat menguji asumsi metode, dan tekun melatih kemampuan komputasi dengan bahasa pemrograman statistik.',
      practice: 'Contoh kegiatan: Praktikum komputasi R dan Python serta bedah studi kasus nyata.',
    },
    {
      title: 'Aktif & Bermanfaat',
      description:
        'Ilmu statistik yang dipelajari di kelas dipraktikkan langsung lewat kompetisi sains data, proyek analisis mini, dan kegiatan pengabdian mahasiswa.',
      practice: 'Contoh kegiatan: Tim lomba data science, hackathon, dan proyek kebersamaan.',
    },
  ];

  return (
    <section
      id="tentang"
      className="w-full bg-canvas py-16 md:py-24 scroll-mt-16 transition-colors duration-200 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 md:gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight leading-[1.08]">
              Dua Makna di Balik Nama Novarion.
            </h2>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed font-sans max-w-3xl">
              Nama <strong className="text-text-primary font-semibold">Novarion</strong> menggabungkan dua kata: <strong className="text-teal-deep dark:text-brand-primary font-semibold">Nova</strong> dan <strong className="text-[#9E5507] dark:text-brand-orange font-semibold">Orion</strong>. Bagi mahasiswa Statistika dan Sains Data IPB Angkatan 62, nama ini merangkum cara kita belajar dan cara kita melangkah bersama selama masa perkuliahan.
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-card bg-surface border border-border p-5 sm:p-6 flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#0A1311] border border-border shrink-0">
                <Image
                  src="/logo.png"
                  alt="Lambang Resmi Novarion Angkatan 62 Statistika dan Sains Data IPB"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-teal-deep dark:text-brand-primary uppercase tracking-wider">
                  Lambang Angkatan
                </span>
                <h3 className="font-heading font-bold text-base text-text-primary tracking-tight">
                  Novarion Statistika 62
                </h3>
                <p className="text-xs text-text-muted font-sans leading-relaxed">
                  Semboyan: &ldquo;{COHORT_CONFIG.tagline}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-b border-border py-10 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 md:divide-x md:divide-border">
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-deep dark:text-brand-primary">
                Unsur Pertama: Nova
              </span>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                Semangat Belajar dan Mengolah Data
              </h3>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans">
                Nova adalah bintang yang memancarkan kilau terang. Bagi kita di statistika, ini menggambarkan dorongan untuk tekun memahami angka, menelaah sebaran peluang, dan merumuskan kesimpulan yang jujur dari data mentah.
              </p>
            </div>

            <div className="pt-4 border-t border-border/70">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Fokus Belajar Sehari-hari
              </span>
              <p className="text-xs sm:text-sm font-sans font-medium text-text-primary leading-relaxed">
                Pemrograman R &amp; Python, Teori Peluang, Metode Statistika, Aljabar Linear, dan Eksplorasi Visual Data
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 md:pl-12">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9E5507] dark:text-brand-orange">
                Unsur Kedua: Orion
              </span>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                Rasi Pemandu dan Solidaritas Angkatan
              </h3>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans">
                Orion adalah rasi bintang penunjuk arah bagi para pengelana. Di tengah padatnya tugas mingguan, laporan praktikum, dan ujian di Dramaga, kita saling mengingatkan dan saling dukung agar tidak ada kawan yang tertinggal.
              </p>
            </div>

            <div className="pt-4 border-t border-border/70">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Budaya Belajar Bersama
              </span>
              <p className="text-xs sm:text-sm font-sans font-medium text-text-primary leading-relaxed">
                Responsi Terbuka UTS dan UAS, Bank Modul Angkatan, Tutor Sebaya Praktikum, serta Diskusi Tugas Kelompok
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Tiga Pegangan Kuliah dan Kegiatan Angkatan
            </h3>
            <span className="text-xs font-mono text-text-muted">
              Statistika dan Sains Data, FMIPA IPB University
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-border border-t border-border pt-8">
            {pillars.map((pillar, idx) => (
              <div
                key={pillar.title}
                className={`flex flex-col justify-between gap-4 ${idx > 0 ? 'md:pl-8' : ''}`}
              >
                <div className="flex flex-col gap-2.5">
                  <h4 className="font-heading font-bold text-lg sm:text-xl text-text-primary tracking-tight">
                    {pillar.title}
                  </h4>
                  <p className="text-sm text-text-muted leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>

                <p className="text-xs font-sans font-medium text-teal-deep dark:text-brand-primary pt-3 border-t border-border/70">
                  {pillar.practice}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
