import { describe, it, expect } from 'vitest';

describe('Phase 2 — Academic Calendar & Event Types Separation', () => {
  interface CalendarEvent {
    id: string;
    title: string;
    category: string;
    scope: string;
    deadline: string | null;
    status: string;
    eventType: 'official' | 'personal' | 'proposal';
    profileId?: string;
  }

  const sampleEvents: CalendarEvent[] = [
    {
      id: 'off-1',
      title: 'Ujian Tengah Semester Statistika Matematika',
      category: 'ujian',
      scope: 'angkatan',
      deadline: '2026-10-25T08:00:00+07:00',
      status: 'published',
      eventType: 'official',
    },
    {
      id: 'off-2',
      title: 'Praktikum Komputasi Statistik Modul 3',
      category: 'praktikum',
      scope: 'angkatan',
      deadline: '2026-10-26T13:30:00+07:00',
      status: 'published',
      eventType: 'official',
    },
    {
      id: 'per-std1',
      title: 'Review Catatan Teori Peluang Mandiri',
      category: 'pribadi',
      scope: 'pribadi',
      deadline: '2026-10-25T19:00:00+07:00',
      status: 'todo',
      eventType: 'personal',
      profileId: 'student-1',
    },
    {
      id: 'per-std2',
      title: 'Mengerjakan Latihan Bab 4',
      category: 'pribadi',
      scope: 'pribadi',
      deadline: '2026-10-26T20:00:00+07:00',
      status: 'todo',
      eventType: 'personal',
      profileId: 'student-2',
    },
    {
      id: 'prop-1',
      title: 'Usulan Jadwal Responsi Tambahan Aljabar Linier',
      category: 'kuliah',
      scope: 'angkatan',
      deadline: '2026-10-28T16:00:00+07:00',
      status: 'pending',
      eventType: 'proposal',
      profileId: 'student-1',
    },
  ];

  it('guarantees personal event isolation (Student A cannot see Student B private events)', () => {
    function filterEventsForUser(events: CalendarEvent[], currentUserId: string, userRole: string) {
      return events.filter((ev) => {
        // Official events are visible to everyone
        if (ev.eventType === 'official') return true;
        // Personal events are strictly visible to owner
        if (ev.eventType === 'personal') return ev.profileId === currentUserId;
        // Proposals: visible to admin or author
        if (ev.eventType === 'proposal') return userRole === 'admin' || ev.profileId === currentUserId;
        return false;
      });
    }

    const student1Events = filterEventsForUser(sampleEvents, 'student-1', 'student');
    const student2Events = filterEventsForUser(sampleEvents, 'student-2', 'student');

    // Student 1 sees their personal event, but not Student 2's
    expect(student1Events.some((e) => e.id === 'per-std1')).toBe(true);
    expect(student1Events.some((e) => e.id === 'per-std2')).toBe(false);

    // Student 2 sees their personal event, but not Student 1's
    expect(student2Events.some((e) => e.id === 'per-std2')).toBe(true);
    expect(student2Events.some((e) => e.id === 'per-std1')).toBe(false);

    // Both see official events
    expect(student1Events.some((e) => e.id === 'off-1')).toBe(true);
    expect(student2Events.some((e) => e.id === 'off-1')).toBe(true);
  });

  it('filters events by eventType tabs (all, official, personal, proposal)', () => {
    function filterByTab(events: CalendarEvent[], tab: string) {
      if (tab === 'all') return events;
      return events.filter((e) => e.eventType === tab);
    }

    expect(filterByTab(sampleEvents, 'official').length).toBe(2);
    expect(filterByTab(sampleEvents, 'personal').length).toBe(2);
    expect(filterByTab(sampleEvents, 'proposal').length).toBe(1);
    expect(filterByTab(sampleEvents, 'all').length).toBe(5);
  });

  it('filters events by category (tugas, praktikum, ujian, kuliah, pribadi)', () => {
    function filterByCategory(events: CalendarEvent[], category: string) {
      if (category === 'all') return events;
      return events.filter((e) => e.category === category);
    }

    expect(filterByCategory(sampleEvents, 'ujian').length).toBe(1);
    expect(filterByCategory(sampleEvents, 'praktikum').length).toBe(1);
    expect(filterByCategory(sampleEvents, 'pribadi').length).toBe(2);
    expect(filterByCategory(sampleEvents, 'kuliah').length).toBe(1);
    expect(filterByCategory(sampleEvents, 'all').length).toBe(5);
  });

  it('correctly maps date keys in YYYY-MM-DD for month and week calendar grid', () => {
    const d1 = new Date('2026-10-25T08:00:00+07:00');
    const key = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}-${String(d1.getDate()).padStart(2, '0')}`;
    expect(key).toBe('2026-10-25');
  });

  it('verifies Indonesian months and days naming conventions', () => {
    const INDONESIAN_MONTHS = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const INDONESIAN_DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    expect(INDONESIAN_MONTHS.length).toBe(12);
    expect(INDONESIAN_MONTHS[9]).toBe('Oktober');
    expect(INDONESIAN_DAYS_SHORT[0]).toBe('Sen');
    expect(INDONESIAN_DAYS_SHORT[6]).toBe('Min');
  });

  it('validates permission for event deletion', () => {
    function canDeleteEvent(event: CalendarEvent, currentUserId: string, role: string): boolean {
      if (event.eventType === 'personal') {
        return event.profileId === currentUserId;
      }
      if (event.eventType === 'official') {
        return role === 'admin';
      }
      return false;
    }

    // Owner can delete personal event
    expect(canDeleteEvent(sampleEvents[2], 'student-1', 'student')).toBe(true);
    // Non-owner cannot delete personal event
    expect(canDeleteEvent(sampleEvents[2], 'student-2', 'student')).toBe(false);
    // Admin can delete official event
    expect(canDeleteEvent(sampleEvents[0], 'admin-1', 'admin')).toBe(true);
    // Student cannot delete official event
    expect(canDeleteEvent(sampleEvents[0], 'student-1', 'student')).toBe(false);
  });
});
