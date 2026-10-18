'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  MessageSquare, 
  FolderDown, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from './Badge';

export function LandingInteractivePreview() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'whatsapp' | 'materials' | 'tasks'>('calendar');

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col">
      {/* Top browser/window chrome */}
      <div className="px-4 py-3 bg-surface-soft border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger-border border border-danger-text/20" />
          <div className="w-3 h-3 rounded-full bg-warning-border border border-warning-text/20" />
          <div className="w-3 h-3 rounded-full bg-success-border border border-success-text/20" />
          <span className="text-[11px] font-mono font-medium text-text-muted ml-2">
            hub.novarion.web.id/preview
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface p-1 rounded-xl border border-border shadow-2xs">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'calendar'
                ? 'bg-teal-deep text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kalender</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-teal-deep text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bot WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'materials'
                ? 'bg-teal-deep text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bank Materi</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-teal-deep text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Checklist Saya</span>
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="p-5 sm:p-7 min-h-[340px] flex flex-col justify-center bg-canvas/40">
        {activeTab === 'calendar' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold text-teal-deep uppercase tracking-wider">Tampilan Kalender Terpadu</span>
                <h4 className="font-heading font-extrabold text-base text-text-primary">Jadwal Kuliah & Batas Tugas</h4>
              </div>
              <Badge variant="mint" size="sm">Sinkronisasi Otomatis</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-surface border border-warning-border/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-warning-text">Tugas Kuliah</span>
                    <Badge variant="orange" size="sm">H-1</Badge>
                  </div>
                  <h5 className="font-heading font-bold text-xs text-text-primary mt-1">Laporan Praktikum Regresi</h5>
                  <p className="text-[11px] text-text-muted mt-0.5">Batas: Besok, 23:59 WIB</p>
                </div>
                <span className="text-[10px] text-teal-deep font-semibold mt-2">Cakupan: Seluruh Angkatan</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-brand-primary/40 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-teal-deep">Praktikum</span>
                    <Badge variant="mint" size="sm">H-3</Badge>
                  </div>
                  <h5 className="font-heading font-bold text-xs text-text-primary mt-1">Komputasi Statistika R</h5>
                  <p className="text-[11px] text-text-muted mt-0.5">Batas: Senin, 08:00 WIB</p>
                </div>
                <span className="text-[10px] text-teal-deep font-semibold mt-2">Cakupan: Kelas Paralel B</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-text-muted">Kuis Online</span>
                    <Badge variant="neutral" size="sm">H-7</Badge>
                  </div>
                  <h5 className="font-heading font-bold text-xs text-text-primary mt-1">Teori Peluang & Sebaran</h5>
                  <p className="text-[11px] text-text-muted mt-0.5">Jadwal: Kamis Depan</p>
                </div>
                <span className="text-[10px] text-teal-deep font-semibold mt-2">Cakupan: Kelas Paralel A & B</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="max-w-md mx-auto w-full p-4 rounded-2xl bg-[#0B141A] text-white shadow-xl animate-in fade-in duration-300 font-sans">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#222E35]">
              <div className="w-8 h-8 rounded-full bg-teal-deep text-white flex items-center justify-center font-bold text-xs">
                NV
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#E9EDEF]">Novarion Reminder Bot</h5>
                <p className="text-[10px] text-[#8696A0]">Grup Resmi Angkatan Statistika</p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-[#202C33] text-xs leading-relaxed text-[#D1D7DB] border border-[#2A3942]">
              <p className="font-bold text-[#25D366]">🔔 PENGINGAT DEADLINE [H-1]</p>
              <p className="font-semibold text-white mt-1">Tugas: Laporan Praktikum Modul 3</p>
              <p className="text-[11px] text-[#AEC8D6] mt-0.5">Mata Kuliah: Analisis Regresi Terapan</p>
              <p className="mt-1">⏰ <strong>Batas:</strong> Jumat, 23:59 WIB</p>
              <p>📍 <strong>Pengumpulan:</strong> Google Classroom</p>
              <div className="mt-2 pt-2 border-t border-[#2A3942] text-[10px] text-[#8696A0] flex justify-between">
                <span>Novarion Academic Hub</span>
                <span>08.00 WIB ✓✓</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold text-teal-deep uppercase tracking-wider">Bank Dokumen Terverifikasi</span>
                <h4 className="font-heading font-extrabold text-base text-text-primary">Materi & Modul Kuliah Resmi</h4>
              </div>
              <Badge variant="primary" size="sm">Format Resmi Dosen</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between hover:border-brand-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-mint-soft text-teal-deep flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-text-primary">Modul Praktikum R Sesi 4</h5>
                    <p className="text-[10px] text-text-muted">Analisis Regresi Terapan • 2.4 MB</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-deep hover:underline">Unduh</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between hover:border-brand-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-cream text-text-primary flex items-center justify-center font-bold text-xs">
                    PPT
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-text-primary">Slide Kuliah Pengantar Peluang</h5>
                    <p className="text-[10px] text-text-muted">Teori Peluang • 5.1 MB</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-deep hover:underline">Unduh</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3 animate-in fade-in duration-300 max-w-xl mx-auto w-full">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold text-teal-deep uppercase tracking-wider">Privasi Terjaga</span>
                <h4 className="font-heading font-extrabold text-base text-text-primary">Checklist Tugas Pribadi</h4>
              </div>
              <Badge variant="success" size="sm">2 / 3 Selesai</Badge>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-teal-deep text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-through text-text-muted">Install RStudio versi terbaru di laptop</span>
                </div>
                <span className="text-[10px] text-success-text font-bold">Selesai</span>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-teal-deep text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-through text-text-muted">Unduh dataset praktikum dari Novarion Hub</span>
                </div>
                <span className="text-[10px] text-success-text font-bold">Selesai</span>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-warning-border flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md border border-border bg-surface" />
                  <span className="font-semibold text-text-primary">Menyusun laporan analisis regresi multivariat</span>
                </div>
                <span className="text-[10px] text-warning-text font-bold">Batas: Besok</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="p-3.5 bg-surface-soft border-t border-border flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center gap-1.5 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-teal-deep" />
          Akses terlindungi khusus mahasiswa dengan NIM terdaftar
        </span>
        <span className="text-[11px] font-bold text-teal-deep">Novarion Academic Hub V3</span>
      </div>
    </div>
  );
}
