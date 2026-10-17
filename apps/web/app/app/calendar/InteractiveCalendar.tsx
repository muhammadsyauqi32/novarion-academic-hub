'use client';

import React, { useState, useMemo } from 'react';
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
  CalendarRange,
  Calendar as CalendarDayIcon,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldCheck,
  Trash2,
  Search,
  Pencil,
} from 'lucide-react';
import {
  submitAgendaAction,
  createAdminAgendaAction,
  deleteAgendaAction,
  updateAdminAgendaAction,
} from '@/actions/agendas';
import {
  addPersonalTaskAction,
  deletePersonalTaskAction,
  updatePersonalTaskAction,
} from '@/actions/tasks';
import { formatWIBShort, formatWIB } from '@novarion/shared';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  category: string; // 'tugas' | 'kuis' | 'ujian' | 'praktikum' | 'kuliah' | 'kegiatan' | 'pribadi'
  scope: string; // 'angkatan' | 'mata_kuliah' | 'kelas' | 'kelompok' | 'pribadi'
  startTime?: string | null;
  deadline: string | null; // ISO string
  color?: string | null; // Hex color e.g. '#41C2A1'
  courseId?: string | null;
  locationOrLink: string | null;
  sourceReference: string | null;
  status: string; // 'published' | 'pending' | 'todo' | 'done'
  eventType: 'official' | 'personal' | 'proposal';
  isOwner?: boolean;
}

interface CourseItem {
  id: string;
  code: string;
  name: string;
}

interface InteractiveCalendarProps {
  initialEvents: CalendarEvent[];
  userRole?: string;
  userId?: string;
  canCreateOfficialAgenda?: boolean;
  courses?: CourseItem[];
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const INDONESIAN_DAYS_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const INDONESIAN_DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const CURATED_CALENDAR_COLORS = [
  { label: 'Mint Novarion', hex: '#41C2A1' },
  { label: 'Warm Orange', hex: '#FFAE5D' },
  { label: 'Soft Green', hex: '#22C55E' },
  { label: 'Sky Blue', hex: '#0EA5E9' },
  { label: 'Indigo', hex: '#6366F1' },
  { label: 'Purple', hex: '#8B5CF6' },
  { label: 'Rose / Coral', hex: '#F43F5E' },
  { label: 'Amber / Gold', hex: '#F59E0B' },
];

export function InteractiveCalendar({
  initialEvents,
  userRole = 'student',
  userId,
  canCreateOfficialAgenda = false,
  courses = [],
}: InteractiveCalendarProps) {
  const router = useRouter();
  const today = new Date();

  // Navigation & View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');

  // Filter state
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'official' | 'personal' | 'proposal'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string>('');
  const [creationType, setCreationType] = useState<'personal' | 'official' | 'proposal'>(
    userRole === 'admin' || canCreateOfficialAgenda ? 'official' : 'personal'
  );
  const [selectedColor, setSelectedColor] = useState<string>('#41C2A1');
  const [editColor, setEditColor] = useState<string>('#41C2A1');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Quick lookup for courses
  const courseMap = useMemo(() => {
    const map = new Map<string, CourseItem>();
    courses.forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

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

  // Helper date key YYYY-MM-DD
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Helper to format ISO to datetime-local value (YYYY-MM-DDTHH:mm)
  const formatForDateTimeLocal = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${day}T${hours}:${mins}`;
    } catch {
      return '';
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((ev) => {
      // Event Type filter
      if (eventTypeFilter !== 'all' && ev.eventType !== eventTypeFilter) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
        return false;
      }
      // Course filter
      if (selectedCourse !== 'all' && ev.courseId !== selectedCourse) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description?.toLowerCase().includes(q) ?? false;
        const matchCategory = ev.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCategory) return false;
      }
      return true;
    });
  }, [initialEvents, eventTypeFilter, selectedCategory, selectedCourse, searchQuery]);

  // Map events to date key YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((ev) => {
      if (!ev.deadline) return;
      const dateObj = new Date(ev.deadline);
      const dateKey = getDateKey(dateObj);
      const list = map.get(dateKey) || [];
      list.push(ev);
      map.set(dateKey, list);
    });
    return map;
  }, [filteredEvents]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (viewMode === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (viewMode === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenAddForDate = (dateKey: string) => {
    setSelectedDateForAdd(`${dateKey}T23:59`);
    setCreationType(userRole === 'admin' ? 'official' : 'personal');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Event Creation Handler
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('no_redirect', 'true');

    try {
      if (creationType === 'personal') {
        // Save as private task / personal calendar event
        const res = await addPersonalTaskAction(formData);
        if (!res.success) {
          setFormError(res.error || 'Gagal menyimpan agenda pribadi.');
          setIsSubmitting(false);
          return;
        }
      } else if (creationType === 'official') {
        // Admin direct official agenda
        const res = await createAdminAgendaAction(formData);
        if (!res.success) {
          setFormError(res.error || 'Gagal mempublikasikan agenda resmi.');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Student official agenda proposal
        const res = await submitAgendaAction(formData);
        if (res && !res.success) {
          setFormError(res.error || 'Gagal mengajukan agenda perkuliahan.');
          setIsSubmitting(false);
          return;
        }
      }

      setIsAddModalOpen(false);
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
      setIsSubmitting(false);
    }
  };

  // Event Deletion Handler
  const handleDeleteEvent = async (ev: CalendarEvent) => {
    if (!confirm(`Hapus agenda "${ev.title}"?`)) return;

    setIsDeleting(true);
    try {
      if (ev.eventType === 'personal') {
        const res = await deletePersonalTaskAction(ev.id);
        if (!res.success) {
          alert(res.error || 'Gagal menghapus acara pribadi.');
          return;
        }
      } else {
        const res = await deleteAgendaAction(ev.id);
        if (!res.success) {
          alert('Gagal menghapus agenda.');
          return;
        }
      }

      setSelectedEvent(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Event Edit Handler
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingEdit || !selectedEvent) return;

    setIsSubmittingEdit(true);
    setEditFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (selectedEvent.eventType === 'personal') {
        formData.append('task_id', selectedEvent.id);
        const res = await updatePersonalTaskAction(formData);
        if (!res.success) {
          setEditFormError(res.error || 'Gagal memperbarui catatan pribadi.');
          setIsSubmittingEdit(false);
          return;
        }
      } else {
        formData.append('agenda_id', selectedEvent.id);
        const res = await updateAdminAgendaAction(formData);
        if (!res.success) {
          setEditFormError(res.error || 'Gagal memperbarui agenda resmi.');
          setIsSubmittingEdit(false);
          return;
        }
      }

      setIsEditingEvent(false);
      setSelectedEvent(null);
      setIsSubmittingEdit(false);
      router.refresh();
    } catch (err) {
      setEditFormError(err instanceof Error ? err.message : String(err));
      setIsSubmittingEdit(false);
    }
  };

  // Category Styling Helper
  const getCategoryStyles = (category: string, eventType: string) => {
    if (eventType === 'personal') {
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30';
    }
    if (eventType === 'proposal') {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    }

    switch (category) {
      case 'tugas':
        return 'bg-warning-surface text-warning-text border-warning-border';
      case 'praktikum':
        return 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30';
      case 'ujian':
      case 'kuis':
        return 'bg-danger-surface text-danger-text border-danger-border';
      case 'kuliah':
        return 'bg-surface-soft text-text-primary border-border';
      default:
        return 'bg-brand-mint-soft text-teal-deep border-brand-primary/30';
    }
  };

  // Custom Color Styling Helper
  const getEventStyle = (ev: CalendarEvent): React.CSSProperties | undefined => {
    if (ev.color && ev.color.startsWith('#')) {
      return {
        backgroundColor: `${ev.color}15`,
        borderColor: `${ev.color}70`,
        color: ev.color,
      };
    }
    return undefined;
  };

  // Build Month Calendar Cells
  const calendarCells = useMemo(() => {
    const cells: {
      day: number;
      monthOffset: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, day);
      cells.push({
        day,
        monthOffset: -1,
        dateKey: getDateKey(prevDate),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // 2. Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const curDate = new Date(year, month, day);
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;

      cells.push({
        day,
        monthOffset: 0,
        dateKey: getDateKey(curDate),
        isCurrentMonth: true,
        isToday,
      });
    }

    // 3. Next month leading days (multiples of 7 up to 35 or 42)
    const totalCellsTarget = cells.length > 35 ? 42 : 35;
    const remaining = totalCellsTarget - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      cells.push({
        day,
        monthOffset: 1,
        dateKey: getDateKey(nextDate),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [year, month, firstDayIndex, prevMonthLastDay, totalDaysInMonth]);

  // Week View Days Calculation
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay(); // 0 = Sun
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Align to Monday
    startOfWeek.setDate(diff);

    const days: { date: Date; dateKey: string; isToday: boolean; dayName: string; dayNumber: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday =
        today.getFullYear() === d.getFullYear() &&
        today.getMonth() === d.getMonth() &&
        today.getDate() === d.getDate();
      days.push({
        date: d,
        dateKey: getDateKey(d),
        isToday,
        dayName: INDONESIAN_DAYS_SHORT[i],
        dayNumber: d.getDate(),
      });
    }
    return days;
  }, [currentDate]);

  // Day View Events
  const currentDayKey = getDateKey(currentDate);
  const currentDayEvents = eventsByDate.get(currentDayKey) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Kalender Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Jadwal kuliah, ujian, praktikum, tugas resmi, dan catatan agenda pribadi Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switch View Buttons */}
          <div className="flex items-center bg-surface-soft p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'month'
                  ? 'bg-surface text-teal-deep shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Bulan"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Bulan</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'week'
                  ? 'bg-surface text-teal-deep shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Minggu"
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Minggu</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'day'
                  ? 'bg-surface text-teal-deep shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Hari"
            >
              <CalendarDayIcon className="w-3.5 h-3.5" />
              <span>Hari</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface text-teal-deep shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Daftar Agenda"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddForDate(getDateKey(new Date()))}
            className="font-semibold text-xs py-2 px-3.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>{userRole === 'admin' ? 'Buat Agenda' : 'Tambah Agenda'}</span>
          </Button>
        </div>
      </div>

      {/* Navigation Bar & Filters */}
      <Card className="p-4 flex flex-col gap-4 bg-surface border-border shadow-xs">
        {/* Navigation Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-surface-soft text-text-primary transition-colors border border-border"
                title="Sebelumnya"
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
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-surface-soft text-text-primary transition-colors border border-border"
                title="Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="font-heading font-extrabold text-base sm:text-lg text-text-primary tracking-tight">
              {viewMode === 'day'
                ? `${INDONESIAN_DAYS_FULL[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]}, ${currentDate.getDate()} ${INDONESIAN_MONTHS[month]} ${year}`
                : `${INDONESIAN_MONTHS[month]} ${year}`}
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, kategori..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-soft border border-border rounded-lg text-text-primary focus:outline-none focus:border-teal-deep transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Strip: Event Types, Categories & Courses */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-border">
          {/* Event Type Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-muted mr-1">Tipe:</span>
            {[
              { key: 'all', label: 'Semua' },
              { key: 'official', label: 'Resmi Angkatan' },
              { key: 'personal', label: 'Catatan Pribadi' },
              { key: 'proposal', label: 'Pengajuan' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setEventTypeFilter(t.key as any)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  eventTypeFilter === t.key
                    ? 'bg-teal-deep text-white shadow-xs'
                    : 'bg-surface-soft text-text-muted hover:text-text-primary border border-border'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Course Filter Dropdown */}
            {courses.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-text-muted">Mata Kuliah:</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-2 py-1 text-xs bg-surface-soft border border-border rounded-lg text-text-primary focus:outline-none focus:border-teal-deep"
                >
                  <option value="all">Semua Mata Kuliah</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-text-muted mr-1">Kategori:</span>
              {['all', 'tugas', 'praktikum', 'ujian', 'kuis', 'kuliah', 'kegiatan'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    selectedCategory === cat
                      ? 'bg-surface text-teal-deep border border-teal-deep/50 font-bold'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-soft'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* VIEW 1: MONTH GRID (DEFAULT) */}
      {viewMode === 'month' && (
        <Card className="p-0 overflow-hidden border border-border bg-surface shadow-xs">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-soft text-center py-2.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            {INDONESIAN_DAYS_SHORT.map((d, idx) => (
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
                  onClick={() => handleOpenAddForDate(cell.dateKey)}
                  className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 bg-surface flex flex-col justify-between cursor-pointer transition-colors group hover:bg-brand-mint-soft/10 ${
                    !cell.isCurrentMonth ? 'opacity-40 bg-surface-soft/40' : ''
                  }`}
                >
                  {/* Top Bar of Cell */}
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

                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-teal-deep font-bold hidden sm:inline">
                      + Tambah
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
                          setEditColor(ev.color || '#41C2A1');
                        }}
                        style={getEventStyle(ev)}
                        className={`text-left px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium truncate border transition-all hover:scale-[1.01] flex items-center gap-1 ${
                          ev.color && ev.color.startsWith('#')
                            ? ''
                            : getCategoryStyles(ev.category, ev.eventType)
                        }`}
                        title={ev.title}
                      >
                        {ev.eventType === 'personal' && <Lock className="w-2.5 h-2.5 shrink-0 opacity-80" />}
                        {ev.eventType === 'proposal' && <Clock className="w-2.5 h-2.5 shrink-0 text-amber-500" />}
                        <span className="truncate">{ev.title}</span>
                      </button>
                    ))}

                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-teal-deep font-bold pl-1">
                        +{dayEvents.length - 3} lagi
                      </span>
                    )}
                  </div>

                  <div className="h-0.5" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {viewMode === 'week' && (
        <Card className="p-0 overflow-hidden border border-border bg-surface shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-border">
            {weekDays.map((wDay) => {
              const dayEvents = eventsByDate.get(wDay.dateKey) || [];

              return (
                <div key={wDay.dateKey} className="min-h-[300px] flex flex-col bg-surface">
                  {/* Day Header */}
                  <div
                    onClick={() => handleOpenAddForDate(wDay.dateKey)}
                    className={`p-3 border-b border-border text-center cursor-pointer transition-colors hover:bg-surface-soft ${
                      wDay.isToday ? 'bg-teal-500/10' : 'bg-surface-soft/40'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      {wDay.dayName}
                    </span>
                    <span
                      className={`text-base font-extrabold inline-block mt-0.5 ${
                        wDay.isToday ? 'text-teal-deep' : 'text-text-primary'
                      }`}
                    >
                      {wDay.dayNumber}
                    </span>
                  </div>

                  {/* Day Events Column */}
                  <div className="p-2 flex flex-col gap-2 flex-1 overflow-y-auto">
                    {dayEvents.length === 0 ? (
                      <div
                        onClick={() => handleOpenAddForDate(wDay.dateKey)}
                        className="flex-1 flex items-center justify-center text-[11px] text-text-muted cursor-pointer hover:text-teal-deep transition-colors p-4 text-center border border-dashed border-transparent hover:border-border rounded-lg"
                      >
                        + Tambah agenda
                      </div>
                    ) : (
                      dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setEditColor(ev.color || '#41C2A1');
                          }}
                          style={getEventStyle(ev)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-xs ${
                            ev.color && ev.color.startsWith('#')
                              ? ''
                              : getCategoryStyles(ev.category, ev.eventType)
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold opacity-80 mb-1">
                            <span className="uppercase">{ev.category}</span>
                            {ev.startTime && ev.deadline ? (
                              <span className="font-mono">
                                {new Date(ev.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : ev.deadline ? (
                              <span className="font-mono">
                                {new Date(ev.deadline).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : null}
                          </div>
                          <h4 className="font-semibold text-xs leading-snug line-clamp-2">
                            {ev.title}
                          </h4>
                          {ev.eventType === 'personal' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
                              <Lock className="w-2.5 h-2.5" /> Pribadi
                            </span>
                          )}
                          {ev.eventType === 'proposal' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                              <Clock className="w-2.5 h-2.5" /> Menunggu Review
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* VIEW 3: DAY VIEW */}
      {viewMode === 'day' && (
        <Card className="p-5 flex flex-col gap-4 bg-surface border-border shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Jadwal & Agenda Hari Ini
              </span>
              <h3 className="font-heading font-extrabold text-lg text-text-primary mt-0.5">
                {INDONESIAN_DAYS_FULL[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]}, {currentDate.getDate()} {INDONESIAN_MONTHS[month]} {year}
              </h3>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAddForDate(currentDayKey)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Tambah di Hari Ini</span>
            </Button>
          </div>

          {currentDayEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center gap-3">
              <CalendarDays className="w-8 h-8 text-text-muted/60" />
              <span>Tidak ada agenda terjadwal pada hari ini.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddForDate(currentDayKey)}
              >
                + Buat Agenda Sekarang
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setEditColor(ev.color || '#41C2A1');
                  }}
                  style={getEventStyle(ev)}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-xs transition-all ${
                    ev.color && ev.color.startsWith('#')
                      ? ''
                      : getCategoryStyles(ev.category, ev.eventType)
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">{ev.category}</Badge>
                      {ev.eventType === 'personal' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                          <Lock className="w-3 h-3" /> Catatan Pribadi
                        </span>
                      )}
                      {ev.eventType === 'official' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                          <ShieldCheck className="w-3 h-3" /> Resmi Angkatan
                        </span>
                      )}
                      {ev.eventType === 'proposal' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                          <Clock className="w-3 h-3" /> Menunggu Persetujuan
                        </span>
                      )}
                      <span className="text-[11px] text-text-muted">• Cakupan {ev.scope}</span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-text-primary">
                      {ev.title}
                    </h4>

                    {ev.description && (
                      <p className="text-xs text-text-muted line-clamp-1">{ev.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {ev.deadline && (
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-text-muted block">Waktu:</span>
                        <span className="text-xs font-bold font-mono">
                          {ev.startTime ? (
                            <>
                              {new Date(ev.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – {new Date(ev.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </>
                          ) : (
                            <>
                              {new Date(ev.deadline).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} WIB
                            </>
                          )}
                        </span>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* VIEW 4: AGENDA LIST VIEW */}
      {viewMode === 'list' && (
        <Card className="p-0 overflow-hidden divide-y divide-border bg-surface border-border shadow-xs">
          <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">
              Semua Agenda Terjadwal ({filteredEvents.length})
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
                onClick={() => {
                  setSelectedEvent(ev);
                  setEditColor(ev.color || '#41C2A1');
                }}
                style={ev.color && ev.color.startsWith('#') ? { borderLeft: `4px solid ${ev.color}` } : undefined}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-soft/50 cursor-pointer transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" size="sm">{ev.category}</Badge>
                    {ev.eventType === 'personal' && (
                      <Badge variant="neutral" size="sm" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                        <Lock className="w-2.5 h-2.5 mr-1" /> Pribadi
                      </Badge>
                    )}
                    {ev.eventType === 'proposal' && (
                      <Badge variant="orange" size="sm">
                        <Clock className="w-2.5 h-2.5 mr-1" /> Pengajuan
                      </Badge>
                    )}
                    <span className="text-[11px] text-text-muted capitalize">• {ev.scope}</span>
                    {ev.courseId && courseMap.has(ev.courseId) && (
                      <span className="text-[11px] font-semibold text-teal-deep">
                        • {courseMap.get(ev.courseId)?.code}
                      </span>
                    )}
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
                    <span className="text-[10px] text-text-muted block">Batas Waktu / Jadwal:</span>
                    <span className="text-xs font-bold text-[#9E5507]">
                      {ev.startTime && ev.deadline
                        ? `${formatWIBShort(ev.startTime)} – ${formatWIBShort(ev.deadline)}`
                        : ev.deadline
                        ? formatWIBShort(ev.deadline)
                        : 'Tidak ada deadline'}
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

      {/* MODAL 1: DETAIL & EDIT AGENDA */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-modal border border-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-soft">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">{selectedEvent.category}</Badge>
                {selectedEvent.eventType === 'personal' && (
                  <Badge variant="neutral" size="sm" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                    <Lock className="w-2.5 h-2.5 mr-1" /> Catatan Pribadi
                  </Badge>
                )}
                {selectedEvent.eventType === 'official' && (
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Resmi Angkatan
                  </Badge>
                )}
                {selectedEvent.eventType === 'proposal' && (
                  <Badge variant="orange" size="sm">
                    <Clock className="w-2.5 h-2.5 mr-1" /> Menunggu Persetujuan
                  </Badge>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEditingEvent(false);
                }}
                className="p-1 rounded-lg text-text-muted hover:bg-border/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isEditingEvent ? (
              /* EDIT MODE FORM */
              <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    Edit {selectedEvent.eventType === 'personal' ? 'Catatan Pribadi' : 'Agenda Resmi'}
                  </h4>
                  <span className="text-xs text-text-muted">ID: {selectedEvent.id.slice(0, 8)}...</span>
                </div>

                {editFormError && (
                  <div className="p-3 rounded-lg bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editFormError}</span>
                  </div>
                )}

                <Input
                  name="title"
                  label="Judul Agenda / Tugas"
                  defaultValue={selectedEvent.title}
                  required
                />

                {selectedEvent.eventType !== 'personal' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-primary">Kategori</label>
                      <select
                        name="category"
                        defaultValue={selectedEvent.category}
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
                        defaultValue={selectedEvent.scope}
                        className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                      >
                        <option value="angkatan">Seluruh Angkatan</option>
                        <option value="mata_kuliah">Mata Kuliah Tertentu</option>
                        <option value="kelas">Kelas Paralel</option>
                        <option value="kelompok">Kelompok Praktikum</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedEvent.eventType !== 'personal' && courses.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary">Mata Kuliah (Opsional)</label>
                    <select
                      name="course_id"
                      defaultValue={selectedEvent.courseId || ''}
                      className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                    >
                      <option value="">Pilih Mata Kuliah (Bila Terkait)...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedEvent.eventType !== 'personal' && (
                    <Input
                      name="start_time"
                      type="datetime-local"
                      label="Waktu Mulai (Opsional)"
                      defaultValue={formatForDateTimeLocal(selectedEvent.startTime)}
                    />
                  )}
                  <Input
                    name="deadline"
                    type="datetime-local"
                    label="Batas Waktu / Selesai (WIB)"
                    defaultValue={formatForDateTimeLocal(selectedEvent.deadline)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    {selectedEvent.eventType === 'personal' ? 'Catatan Pribadi' : 'Deskripsi & Petunjuk'}
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={selectedEvent.description || ''}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Warna Penanda Kalender</label>
                  <input type="hidden" name="color" value={editColor} />
                  <div className="flex flex-wrap items-center gap-2">
                    {CURATED_CALENDAR_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setEditColor(c.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                          editColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'border-text-primary ring-2 ring-teal-deep/50 scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                    <div className="flex items-center gap-1.5 ml-2">
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                        title="Pilih Warna Kustom"
                      />
                      <span className="text-[11px] font-mono text-text-muted">{editColor}</span>
                    </div>
                  </div>
                </div>

                {selectedEvent.eventType !== 'personal' && (
                  <>
                    <Input
                      name="location_or_link"
                      label="Tautan Classroom / Lokasi (Opsional)"
                      defaultValue={selectedEvent.locationOrLink || ''}
                    />
                    <Input
                      name="source_reference"
                      label="Sumber Referensi (Opsional)"
                      defaultValue={selectedEvent.sourceReference || ''}
                    />
                  </>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingEvent(false)}
                    disabled={isSubmittingEdit}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmittingEdit}
                    disabled={isSubmittingEdit}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            ) : (
              /* VIEW MODE DETAILS */
              <>
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-text-primary">
                      {selectedEvent.title}
                    </h3>

                    {selectedEvent.courseId && courseMap.has(selectedEvent.courseId) && (
                      <p className="text-xs font-semibold text-teal-deep mt-1">
                        Mata Kuliah: {courseMap.get(selectedEvent.courseId)?.code} - {courseMap.get(selectedEvent.courseId)?.name}
                      </p>
                    )}

                    {selectedEvent.startTime && selectedEvent.deadline ? (
                      <p className="text-xs font-bold text-[#9E5507] flex items-center gap-1.5 mt-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Jadwal: {formatWIB(selectedEvent.startTime)} – {formatWIB(selectedEvent.deadline)}</span>
                      </p>
                    ) : selectedEvent.deadline ? (
                      <p className="text-xs font-bold text-[#9E5507] flex items-center gap-1.5 mt-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Batas Waktu: {formatWIB(selectedEvent.deadline)}</span>
                      </p>
                    ) : null}
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
                      <span>Buka Tautan Tugas / Google Classroom / Lab</span>
                    </a>
                  )}

                  {selectedEvent.sourceReference && (
                    <p className="text-[11px] text-text-muted">
                      Sumber Referensi: <em>{selectedEvent.sourceReference}</em>
                    </p>
                  )}

                  {selectedEvent.eventType === 'personal' && (
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs">
                      🔒 Acara pribadi ini hanya dapat dilihat oleh Anda dan tidak mengirimkan pengingat WhatsApp ke angkatan.
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border bg-surface-soft flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Edit button: Personal tasks (by owner) or official agendas (by admin) */}
                    {((selectedEvent.eventType === 'personal' && selectedEvent.isOwner) ||
                      (selectedEvent.eventType === 'official' && userRole === 'admin')) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditFormError(null);
                          setIsEditingEvent(true);
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                    )}

                    {/* Delete button: Personal tasks (by owner) or official agendas (by admin) */}
                    {((selectedEvent.eventType === 'personal' && selectedEvent.isOwner) ||
                      (selectedEvent.eventType === 'official' && userRole === 'admin')) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteEvent(selectedEvent)}
                        disabled={isDeleting}
                        className="gap-1.5 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(null);
                      setIsEditingEvent(false);
                    }}
                  >
                    Tutup
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: FORM TAMBAH AGENDA PADA TANGGAL (GOOGLE CALENDAR STYLE) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-modal border border-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-soft">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-deep" />
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  {userRole === 'admin' ? 'Buat Agenda Perkuliahan' : 'Tambah ke Kalender'}
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
              {/* Type Switcher: Pribadi vs Resmi/Pengajuan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Jenis Agenda</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-surface-soft rounded-xl border border-border">
                  {userRole === 'admin' || canCreateOfficialAgenda ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCreationType('official')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          creationType === 'official'
                            ? 'bg-surface text-teal-deep shadow-xs border border-teal-deep/30'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Resmi Angkatan
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreationType('personal')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          creationType === 'personal'
                            ? 'bg-surface text-purple-600 shadow-xs border border-purple-500/30'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Catatan Pribadi
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setCreationType('personal')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          creationType === 'personal'
                            ? 'bg-surface text-purple-600 shadow-xs border border-purple-500/30'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Catatan Pribadi
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreationType('proposal')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          creationType === 'proposal'
                            ? 'bg-surface text-teal-deep shadow-xs border border-teal-deep/30'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Ajukan ke Angkatan
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Informational banner based on type */}
              {creationType === 'personal' && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2.5 text-xs text-purple-800 dark:text-purple-300">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Agenda pribadi hanya terlihat oleh Anda dan langsung tersimpan tanpa membutuhkan verifikasi admin.
                  </span>
                </div>
              )}

              {creationType === 'official' && (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-2.5 text-xs text-teal-800 dark:text-teal-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Agenda resmi akan langsung dipublikasikan ke kalender seluruh angkatan dan dijadwalkan pengingat WhatsApp.
                  </span>
                </div>
              )}

              {creationType === 'proposal' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Pengajuan agenda akan diverifikasi oleh admin angkatan sebelum dipublikasikan ke seluruh mahasiswa.
                  </span>
                </div>
              )}

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

              {creationType !== 'personal' && (
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
              )}

              {creationType !== 'personal' && courses.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Mata Kuliah (Bila Terkait)</label>
                  <select
                    name="course_id"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                  >
                    <option value="">Pilih Mata Kuliah (Opsional)...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {creationType !== 'personal' && (
                  <Input
                    name="start_time"
                    type="datetime-local"
                    label="Waktu Mulai (Opsional)"
                  />
                )}
                <Input
                  name="deadline"
                  type="datetime-local"
                  label={creationType === 'personal' ? 'Batas Waktu (WIB)' : 'Batas Waktu / Selesai (WIB)'}
                  defaultValue={selectedDateForAdd}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  {creationType === 'personal' ? 'Catatan Pribadi' : 'Deskripsi & Petunjuk'}
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder={
                    creationType === 'personal'
                      ? 'Catatan khusus untuk pengerjaan Anda...'
                      : 'Format pengumpulan, tautan materi, atau catatan dosen...'
                  }
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Warna Penanda Kalender</label>
                <input type="hidden" name="color" value={selectedColor} />
                <div className="flex flex-wrap items-center gap-2">
                  {CURATED_CALENDAR_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                        selectedColor.toLowerCase() === c.hex.toLowerCase()
                          ? 'border-text-primary ring-2 ring-teal-deep/50 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                      title="Pilih Warna Kustom"
                    />
                    <span className="text-[11px] font-mono text-text-muted">{selectedColor}</span>
                  </div>
                </div>
              </div>

              {creationType !== 'personal' && (
                <>
                  <Input
                    name="location_or_link"
                    label="Tautan Classroom / Lokasi (Opsional)"
                    placeholder="https://classroom.google.com/..."
                  />
                  <Input
                    name="source_reference"
                    label="Sumber Referensi (Opsional)"
                    placeholder="Contoh: Silabus atau Pengumuman Dosen"
                  />
                </>
              )}

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
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Menyimpan...'
                    : creationType === 'personal'
                    ? 'Simpan Catatan Pribadi'
                    : creationType === 'official'
                    ? 'Publikasikan Agenda'
                    : 'Kirim Pengajuan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
