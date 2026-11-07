'use client';

import React, { useState } from 'react';
import { getHubLoginUrl } from '@/lib/links';

type PreviewTab = 'calendar' | 'whatsapp' | 'materials' | 'tasks';

export function AcademicHubCtaSection() {
  const hubLoginUrl = getHubLoginUrl();
  const [activeTab, setActiveTab] = useState<PreviewTab>('calendar');

  const tabs: Array<{ id: PreviewTab; label: string; summary: string }> = [
    {
      id: 'calendar',
      label: 'Jadwal & Kalender',
      summary: 'Jadwal kuliah harian, agenda responsi mingguan, dan batas pengumpulan tugas per kelas paralel.',
    },
    {
      id: 'whatsapp',
      label: 'Pengingat WhatsApp',
      summary: 'Pemberitahuan otomatis H-7, H-3, H-1, dan 3 jam sebelum tenggat ke grup resmi angkatan.',
    },
    {
      id: 'materials',
      label: 'Bank Materi',
      summary: 'Kumpulan slide kuliah, modul praktikum R dan Python, serta latihan soal dari dosen dan komti.',
    },
    {
      id: 'tasks',
      label: 'Daftar Tugas',
      summary: 'Catatan tugas pribadi yang bisa kamu tandai selesai setelah dikerjakan.',
    },
  ];

  return (
    <section
      id="academic-hub"
      className="w-full bg-canvas py-16 md:py-24 scroll-mt-16 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-card bg-[#0A1311] text-[#FAF9F5] border border-[#1E3B33] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#41C2A1]">
                  Portal Belajar Mahasiswa
                </span>
                <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight leading-tight text-[#FAF9F5]">
                  Academic Hub Novarion.
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#FAF9F5]/80 leading-relaxed font-sans">
                Portal belajar mandiri untuk mahasiswa Statistika 62. Masuk menggunakan akun NIM untuk mengecek jadwal kuliah, mengunduh bahan praktikum, dan mengelola tenggat tugas.
              </p>

              <div
                className="flex flex-col divide-y divide-white/10 border-t border-b border-white/10"
                role="tablist"
                aria-label="Fitur Academic Hub"
              >
                {tabs.map((t) => {
                  const isSelected = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveTab(t.id)}
                      className={`text-left py-3.5 px-3 transition-colors duration-150 flex flex-col gap-1 focus-visible:outline-2 focus-visible:outline-teal-deep ${
                        isSelected
                          ? 'bg-white/[0.06] text-[#FAF9F5]'
                          : 'text-[#FAF9F5]/70 hover:text-[#FAF9F5] hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading font-bold text-sm text-[#FAF9F5]">
                          {t.label}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            isSelected ? 'text-[#41C2A1]' : 'text-[#FAF9F5]/40'
                          }`}
                        >
                          {isSelected ? 'Ditampilkan' : 'Lihat'}
                        </span>
                      </div>
                      <p className="text-xs text-[#FAF9F5]/70 font-sans leading-relaxed">
                        {t.summary}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href={hubLoginUrl}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-input bg-brand-primary text-brand-foreground font-sans text-xs sm:text-sm font-bold hover:bg-[#C9FBD4] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep"
                >
                  Masuk ke Academic Hub
                </a>
                <span className="text-xs font-mono text-[#EAEAB7]/85">
                  Akses khusus mahasiswa Angkatan 62
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 w-full">
              <div className="rounded-card border border-white/15 bg-[#0F1E1A] p-6 sm:p-8 min-h-[380px] flex flex-col justify-between gap-6">
                {activeTab === 'calendar' && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#41C2A1] uppercase tracking-wider block">
                          Jadwal Kuliah &amp; Tugas
                        </span>
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FAF9F5] mt-1">
                          Agenda Perkuliahan dan Praktikum Minggu Ini
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[#C9FBD4]">
                        Semester Berjalan
                      </span>
                    </div>

                    <div className="divide-y divide-white/10 border-b border-white/10">
                      <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#FFAE5D] uppercase">
                            Tugas Kuliah / Seluruh Kelas
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5] mt-0.5">
                            Laporan Praktikum Regresi Terapan
                          </h4>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-xs font-mono font-bold text-[#FFAE5D] block">
                            H-1 (Besok, 23:59 WIB)
                          </span>
                          <span className="text-[11px] text-[#FAF9F5]/65">
                            Pengumpulan via LMS IPB
                          </span>
                        </div>
                      </div>

                      <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#41C2A1] uppercase">
                            Praktikum Lab / Kelas Paralel P2
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5] mt-0.5">
                            Komputasi Statistika menggunakan R
                          </h4>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-xs font-mono font-bold text-[#C9FBD4] block">
                            Senin, 08:00 WIB
                          </span>
                          <span className="text-[11px] text-[#FAF9F5]/65">
                            Lab Komputer Dramaga
                          </span>
                        </div>
                      </div>

                      <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#EAEAB7] uppercase">
                            Responsi Sebaya / Divisi Akademik
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5] mt-0.5">
                            Latihan Soal Teori Peluang
                          </h4>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-xs font-mono font-bold text-[#EAEAB7] block">
                            Kamis, 16:00 WIB
                          </span>
                          <span className="text-[11px] text-[#FAF9F5]/65">
                            Ruang Kuliah FMIPA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'whatsapp' && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#FFAE5D] uppercase tracking-wider block">
                          Bot WhatsApp Angkatan
                        </span>
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FAF9F5] mt-1">
                          Pemberitahuan Otomatis ke Grup Angkatan
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[#FFAE5D]">
                        Waktu: H-7 / H-3 / H-1 / 3 Jam Sebelum
                      </span>
                    </div>

                    <div className="p-5 rounded-card bg-[#0A1412] border border-white/10 flex flex-col gap-3 text-xs font-sans">
                      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                        <div>
                          <span className="font-bold text-[#FAF9F5] block">
                            Pengingat Tugas Novarion 62
                          </span>
                          <span className="text-[11px] text-[#FAF9F5]/60">
                            Pesan diteruskan ke grup WhatsApp resmi angkatan
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#41C2A1]">
                          Terkirim Otomatis
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[#FAF9F5]/90 leading-relaxed pt-1">
                        <p className="font-mono font-bold text-[#41C2A1]">
                          [PENGINGAT H-1 / STATISTIKA 62]
                        </p>
                        <p className="font-bold text-sm text-[#FAF9F5]">
                          Tugas: Laporan Praktikum Modul 3 (Regresi Terapan)
                        </p>
                        <p className="text-xs text-[#EAEAB7]">
                          Batas Pengumpulan: Jumat, 23:59 WIB lewat LMS IPB. Jangan lupa cek kelengkapan berkas RMarkdown dan PDF.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#C9FBD4] uppercase tracking-wider block">
                          Bank Materi Kuliah
                        </span>
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FAF9F5] mt-1">
                          Slide Dosen, Modul Praktikum, dan Latihan Soal
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[#EAEAB7]">
                        Dikelola Komti &amp; Divisi Akademik
                      </span>
                    </div>

                    <div className="divide-y divide-white/10 border-b border-white/10">
                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#41C2A1] uppercase">
                            Berkas PDF / 2.4 MB
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5] mt-0.5">
                            Modul Praktikum Komputasi R: Sesi 4 (Analisis Regresi)
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#41C2A1] shrink-0">
                          Tersedia di Hub
                        </span>
                      </div>

                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#EAEAB7] uppercase">
                            Arsip ZIP / Divisi Akademik
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5] mt-0.5">
                            Pembahasan Soal UTS Teori Peluang Tahun Lalu
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#41C2A1] shrink-0">
                          Tersedia di Hub
                        </span>
                      </div>

                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#C9FBD4] uppercase">
                            Dataset CSV / Praktikum
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5] mt-0.5">
                            Dataset Latihan Eksplorasi dan Visualisasi Data
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#41C2A1] shrink-0">
                          Tersedia di Hub
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#41C2A1] uppercase tracking-wider block">
                          Checklist Tugas Pribadi
                        </span>
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FAF9F5] mt-1">
                          Tersusun Berdasarkan Batas Waktu Terdekat
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[#C9FBD4]">
                        Status: 2 dari 3 Selesai
                      </span>
                    </div>

                    <div className="divide-y divide-white/10 border-b border-white/10">
                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#FFAE5D] uppercase">
                            Belum Selesai / Prioritas
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5] mt-0.5">
                            Laporan analisis regresi multivariat
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#FFAE5D] shrink-0">
                          Besok, 23:59 WIB
                        </span>
                      </div>

                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#41C2A1] uppercase">
                            Selesai
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5]/60 line-through mt-0.5">
                            Unduh dataset praktikum dari Bank Materi Hub
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-[#41C2A1] shrink-0">
                          Tercatat
                        </span>
                      </div>

                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#41C2A1] uppercase">
                            Selesai
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-[#FAF9F5]/60 line-through mt-0.5">
                            Konfirmasi pembagian kelompok praktikum
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-[#41C2A1] shrink-0">
                          Tercatat
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#FAF9F5]/70">
                  <span>Sinkronisasi otomatis dengan kelas paralel &amp; praktikum</span>
                  <a
                    href={hubLoginUrl}
                    className="text-[#41C2A1] hover:text-[#C9FBD4] font-bold transition-colors"
                  >
                    Buka Portal Academic Hub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
