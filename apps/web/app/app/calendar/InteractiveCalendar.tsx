'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  ExternalLink,
  Info,
  CalendarDays,
  ListFilter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { submitAgendaAction } from '@/actions/agendas';
import { formatWIBShort, formatWIB } from '@novarion/shared';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  scope: string;
  deadline: string | null; // ISO string
  locationOrLink: string | null;
  sourceReference: string | null;
  status: string;
}

interface InteractiveCalendarProps {
  initialEvents: CalendarEvent[];
  userRole?: string;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const INDONESIAN_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function InteractiveCalendar({ initialEvents, userRole }: InteractiveCalendarProps) {
  const router = useRouter();
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Month & Year calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day index 0 = Senin, 6 = Minggu
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const totalDaysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Filter events
  const filteredEvents = initialEvents.filter((ev) => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  // Map events to date key YYYY-MM-DD
  const eventsByDate = new Map<string, CalendarEvent[]>();
  filteredEvents.forEach((ev) => {
    if (!ev.deadline) return;
    const dateObj = new Date(ev.deadline);
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const list = eventsByDate.get(dateKey) || [];
    list.push(ev);
    eventsByDate.set(dateKey, list);
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dayStr: string) => {
    setSelectedDateForAdd(`${dayStr}T23:59`);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await submitAgendaAction(formData);
      setIsAddModalOpen(false);
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      // submitAgendaAction might redirect, handled gracefully
      setIsSubmitting(false);
    }
  };

  // Helper untuk warna pill agenda
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'tugas':
        return 'bg-warning-surface text-warning-text border-warning-border';
      case 'praktikum':
        return 'bg-brand-mint-soft text-teal-deep border-brand-primary/40';
      case 'ujian':
      case 'kuis':
        return 'bg-danger-surface text-danger-text border-danger-border';
      case 'kuliah':
        return 'bg-surface-soft text-text-primary border-border';
      default:
        return 'bg-brand-primary/10 text-teal-deep border-brand-primary/30';
    }
  };

  // Build calendar matrix cells (weeks x 7)
  const calendarCells: {
    day: number;
    monthOffset: number; // -1 = prev, 0 = current, 1 = next
    dateKey: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      monthOffset: -1,
      dateKey,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 2. Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    calendarCells.push({
      day,
      monthOffset: 0,
      dateKey,
      isCurrentMonth: true,
      isToday,
    });
  }

  // 3. Next month leading days to complete grid (multiples of 7)
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDate = new Date(year, month + 1, day);
    const dateKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      monthOffset: 1,
      dateKey,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Kalender Akademik Angkatan
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Klik pada tanggal manapun untuk melihat detail atau mengajukan agenda perkuliahan baru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch View */}
          <div className="flex items-center bg-surface-soft p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-surface text-teal-deep shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface text-teal-deep shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const d = new Date();
              const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T23:59`;
              setSelectedDateForAdd(todayStr);
              setFormError(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Ajukan Agenda</span>
          </Button>
        </div>
      </div>

      {/* Month Navigation & Category Filter Strip */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-surface-soft text-text-primary transition-colors border border-border"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg hover:bg-surface-soft text-xs font-bold text-teal-deep transition-colors border border-border"
            >
              Hari Ini
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-surface-soft text-text-primary transition-colors border border-border"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-heading font-extrabold text-base sm:text-lg text-text-primary tracking-tight">
            {INDONESIAN_MONTHS[month]} {year}
          </h2>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'tugas', 'praktikum', 'ujian', 'kuis', 'kuliah', 'kegiatan'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-deep text-white font-bold shadow-xs'
                  : 'bg-surface-soft text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </Card>

      {/* VIEW 1: GOOGLE CALENDAR STYLE MONTH GRID */}
      {viewMode === 'calendar' ? (
        <Card className="p-0 overflow-hidden border border-border bg-surface shadow-xs">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-soft text-center py-2.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            {INDONESIAN_DAYS.map((d, idx) => (
              <div key={d} className={idx >= 5 ? 'text-brand-orange font-black' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border bg-border/20">
            {calendarCells.map((cell, idx) => {
              const dayEvents = eventsByDate.get(cell.dateKey) || [];

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(cell.dateKey)}
                  className={`min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 bg-surface flex flex-col justify-between cursor-pointer transition-colors group hover:bg-brand-mint-soft/15 ${
                    !cell.isCurrentMonth ? 'opacity-40 bg-surface-soft/40' : ''
                  }`}
                >
                  {/* Top Bar of Cell: Day Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        cell.isToday
                          ? 'w-6 h-6 rounded-full bg-teal-deep text-white flex items-center justify-center font-bold shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-text-primary group-hover:text-teal-deep'
                          : 'text-text-muted'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* Quick Add icon visible on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-teal-deep font-bold hidden sm:inline">
                      + Agenda
                    </span>
                  </div>

                  {/* Event Chips List */}
                  <div className="flex flex-col gap-1 my-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className={`text-left px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium truncate border transition-all hover:scale-[1.02] ${getCategoryStyles(
                          ev.category
                        )}`}
                        title={ev.title}
                      >
                        <span className="font-bold mr-1">
                          {ev.deadline ? new Date(ev.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        {ev.title}
                      </button>
                    ))}

                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-teal-deep font-bold pl-1">
                        +{dayEvents.length - 3} agenda lagi
                      </span>
                    )}
                  </div>

                  <div className="h-0.5" />
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* VIEW 2: AGENDA LIST VIEW */
        <Card className="p-0 overflow-hidden divide-y divide-border">
          <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">
              Daftar Agenda ({filteredEvents.length})
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted">
              Tidak ada agenda perkuliahan untuk filter yang dipilih.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-soft/50 cursor-pointer transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{ev.category}</Badge>
                    <span className="text-[11px] text-text-muted capitalize">• {ev.scope}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    {ev.title}
                  </h3>
                  {ev.description && (
                    <p className="text-xs text-text-muted line-clamp-1">{ev.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-text-muted block">Batas Waktu:</span>
                    <span className="text-xs font-bold text-[#9E5507]">
                      {ev.deadline ? formatWIBShort(ev.deadline) : 'Tidak ada deadline'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Detail
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {/* MODAL 1: DETAIL AGENDA */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-modal border border-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-soft">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">{selectedEvent.category}</Badge>
                <span className="text-xs text-text-muted capitalize">• Cakupan {selectedEvent.scope}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-text-muted hover:bg-border/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-text-primary">
                  {selectedEvent.title}
                </h3>
                {selectedEvent.deadline && (
                  <p className="text-xs font-bold text-[#9E5507] flex items-center gap-1.5 mt-2">
                    <Clock className="w-4 h-4" />
                    <span>Batas Waktu: {formatWIB(selectedEvent.deadline)}</span>
                  </p>
                )}
              </div>

              {selectedEvent.description && (
                <div className="p-3.5 rounded-xl bg-surface-soft border border-border text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description}
                </div>
              )}

              {selectedEvent.locationOrLink && (
                <a
                  href={selectedEvent.locationOrLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-deep hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Tautan Tugas / Google Classroom</span>
                </a>
              )}

              {selectedEvent.sourceReference && (
                <p className="text-[11px] text-text-muted">
                  Sumber Referensi: <em>{selectedEvent.sourceReference}</em>
                </p>
              )}
            </div>

            <div className="p-4 border-t border-border bg-surface-soft flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUKAN AGENDA PADA TANGGAL YANG DIKLIK (GOOGLE CALENDAR BEHAVIOR) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-modal border border-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-soft">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-deep" />
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  Ajukan Agenda Perkuliahan
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:bg-border/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-brand-mint-soft/40 border border-brand-primary/30 flex items-start gap-2.5 text-xs text-text-primary">
                <Info className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                <span>
                  Pengajuan agenda akan diverifikasi oleh admin angkatan sebelum dipublikasikan ke reminder grup WhatsApp.
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Input
                name="title"
                label="Judul Agenda / Tugas"
                placeholder="Contoh: Laporan Praktikum Modul 4"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Kategori</label>
                  <select
                    name="category"
                    defaultValue="tugas"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                  >
                    <option value="tugas">Tugas Kuliah</option>
                    <option value="praktikum">Praktikum</option>
                    <option value="kuis">Kuis</option>
                    <option value="ujian">Ujian (UTS / UAS)</option>
                    <option value="kuliah">Jadwal Kuliah</option>
                    <option value="kegiatan">Kegiatan Angkatan</option>
                    <option value="pengumuman">Pengumuman</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Cakupan (Scope)</label>
                  <select
                    name="scope"
                    defaultValue="angkatan"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                  >
                    <option value="angkatan">Seluruh Angkatan</option>
                    <option value="mata_kuliah">Mata Kuliah Tertentu</option>
                    <option value="kelas">Kelas Paralel</option>
                    <option value="kelompok">Kelompok Praktikum</option>
                  </select>
                </div>
              </div>

              <Input
                name="deadline"
                type="datetime-local"
                label="Batas Waktu (Deadline WIB)"
                defaultValue={selectedDateForAdd}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Deskripsi Tugas</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Format file, petunjuk pengerjaan, atau catatan dosen..."
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                />
              </div>

              <Input
                name="location_or_link"
                label="Tautan Classroom / Lokasi (Opsional)"
                placeholder="https://classroom.google.com/..."
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
