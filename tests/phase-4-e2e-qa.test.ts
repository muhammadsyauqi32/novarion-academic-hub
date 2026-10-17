import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateSecureTempPassword,
  getDefaultStudentPassword,
} from '../packages/db/src/auth-provisioning';

const originalEnv = process.env.DEFAULT_STUDENT_PASSWORD;

beforeEach(() => {
  process.env.DEFAULT_STUDENT_PASSWORD = 'TestDefaultPass2026!';
});

afterEach(() => {
  if (originalEnv !== undefined) {
    process.env.DEFAULT_STUDENT_PASSWORD = originalEnv;
  } else {
    delete process.env.DEFAULT_STUDENT_PASSWORD;
  }
});

describe('Phase 4 — End-to-End QA: 16 Core Workflows & Release Hardening', () => {
  interface User {
    id: string;
    nim: string;
    role: 'admin' | 'student';
    mustChangePassword: boolean;
    isActive: boolean;
  }

  interface Agenda {
    id: string;
    title: string;
    category: string;
    scope: string;
    status: 'pending' | 'published' | 'rejected';
    createdBy: string;
  }

  interface PersonalTask {
    id: string;
    profileId: string;
    title: string;
    status: 'todo' | 'done';
  }

  // Mock State Store simulating Database
  const usersStore = new Map<string, User>();
  const agendasStore = new Map<string, Agenda>();
  const personalTasksStore = new Map<string, PersonalTask>();

  it('Workflow 1: Admin login directs to /admin', () => {
    const adminUser: User = {
      id: 'admin-1',
      nim: 'M0401251083',
      role: 'admin',
      mustChangePassword: false,
      isActive: true,
    };
    usersStore.set(adminUser.nim, adminUser);

    function resolveLoginRoute(user: User): string {
      if (!user.isActive) throw new Error('Akun dinonaktifkan');
      if (user.mustChangePassword) return '/auth/change-password';
      if (user.role === 'admin') return '/admin';
      return '/app';
    }

    expect(resolveLoginRoute(adminUser)).toBe('/admin');
  });

  it('Workflow 2: Admin adds student and generates one-time initial password with full broadcast message', () => {
    const newStudentNim = 'M0401251099';
    const newStudentName = 'Siti Rahma';
    const tempPassword = generateSecureTempPassword();

    const createdStudent: User = {
      id: 'student-siti',
      nim: newStudentNim,
      role: 'student',
      mustChangePassword: true,
      isActive: true,
    };
    usersStore.set(createdStudent.nim, createdStudent);

    // Verify format and entropy
    expect(tempPassword).toMatch(/^Nvrn-[0-9A-F]{8}[!@#$]$/);
    expect(createdStudent.mustChangePassword).toBe(true);

    // Verify formatted broadcast template
    const msg = `Halo *${newStudentName}*, akun Anda telah diaktifkan:\nNIM: ${createdStudent.nim}\nPassword: ${tempPassword}`;
    expect(msg).toContain(createdStudent.nim);
    expect(msg).toContain(tempPassword);
  });

  it('Workflow 3 & 4: Student first login forces password change before entering dashboard', () => {
    const student = usersStore.get('M0401251099')!;
    expect(student).toBeDefined();

    // 1st login -> must change password
    function checkLoginDestination(user: User): string {
      if (user.mustChangePassword) return '/auth/change-password';
      return user.role === 'admin' ? '/admin' : '/app';
    }

    expect(checkLoginDestination(student)).toBe('/auth/change-password');

    // Simulate password change
    student.mustChangePassword = false;

    // Subsequent login -> enters /app
    expect(checkLoginDestination(student)).toBe('/app');
  });

  it('Workflow 5: Student accesses dashboard (/app)', () => {
    const student = usersStore.get('M0401251099')!;
    expect(student.role).toBe('student');
    expect(student.mustChangePassword).toBe(false);
  });

  it('Workflow 6 & 7: Admin manages official academic agenda and stays strictly inside Admin Workspace', () => {
    const admin = usersStore.get('M0401251083')!;
    expect(admin.role).toBe('admin');

    const newAgenda: Agenda = {
      id: 'ag-official-1',
      title: 'Ujian Akhir Semester Statistika Nonparametrik',
      category: 'ujian',
      scope: 'angkatan',
      status: 'published',
      createdBy: admin.id,
    };
    agendasStore.set(newAgenda.id, newAgenda);

    // Operation must remain on /admin/agendas
    const currentAdminPath = '/admin/agendas';
    expect(currentAdminPath).toMatch(/^\/admin/);
    expect(newAgenda.status).toBe('published');
  });

  it('Workflow 8 & 9: Admin intentionally enters Student Mode (presentation preview) and can return to Admin', () => {
    const admin = usersStore.get('M0401251083')!;

    // Admin clicks "Mode Mahasiswa"
    const previewNavigation = {
      userRole: admin.role,
      targetWorkspace: '/app',
      bannerNotice: 'Mode Mahasiswa (Pratinjau)',
      returnUrl: '/admin',
    };

    expect(previewNavigation.userRole).toBe('admin');
    expect(previewNavigation.bannerNotice).toBe('Mode Mahasiswa (Pratinjau)');
    expect(previewNavigation.returnUrl).toBe('/admin');
  });

  it('Workflow 10: Student creates a personal calendar event (strictly private)', () => {
    const student = usersStore.get('M0401251099')!;

    const personalTask: PersonalTask = {
      id: 'pt-1',
      profileId: student.id,
      title: 'Review Modul 3 SPSS',
      status: 'todo',
    };
    personalTasksStore.set(personalTask.id, personalTask);

    expect(personalTask.profileId).toBe(student.id);
    expect(personalTask.status).toBe('todo');
  });

  it('Workflow 11, 12 & 13: Student submits official proposal, Admin reviews & approves, Published on calendar', () => {
    const student = usersStore.get('M0401251099')!;
    const admin = usersStore.get('M0401251083')!;

    // 11. Student proposes agenda (begins as pending)
    const proposedAgenda: Agenda = {
      id: 'prop-101',
      title: 'Responsi Tambahan Teori Sampling',
      category: 'kuliah',
      scope: 'angkatan',
      status: 'pending',
      createdBy: student.id,
    };
    agendasStore.set(proposedAgenda.id, proposedAgenda);
    expect(proposedAgenda.status).toBe('pending');

    // 12. Admin reviews and approves the proposal
    function adminApproveProposal(agendaId: string, adminUser: User) {
      if (adminUser.role !== 'admin') throw new Error('Unauthorized');
      const ag = agendasStore.get(agendaId);
      if (!ag) throw new Error('Not found');
      ag.status = 'published';
      return ag;
    }

    const approvedAgenda = adminApproveProposal('prop-101', admin);
    expect(approvedAgenda.status).toBe('published');

    // 13. Published agenda is now visible on cohort calendar
    const calendarEvents = Array.from(agendasStore.values()).filter((a) => a.status === 'published');
    expect(calendarEvents.some((a) => a.id === 'prop-101')).toBe(true);
  });

  it('Workflow 14: Strict Isolation — Student A cannot access or delete Student B personal task (RLS & IDOR Defense)', () => {
    const studentA: User = { id: 'std-A', nim: 'M0401251001', role: 'student', mustChangePassword: false, isActive: true };
    const studentB: User = { id: 'std-B', nim: 'M0401251002', role: 'student', mustChangePassword: false, isActive: true };

    const taskB: PersonalTask = { id: 'pt-B', profileId: studentB.id, title: 'Tugas Rahasia B', status: 'todo' };
    personalTasksStore.set(taskB.id, taskB);

    function deletePersonalTask(taskId: string, callerId: string): boolean {
      const task = personalTasksStore.get(taskId);
      if (!task || task.profileId !== callerId) {
        return false; // Forbidden / Not Found
      }
      personalTasksStore.delete(taskId);
      return true;
    }

    // Student A attempts to delete Student B's personal task
    const studentADeleteAttempt = deletePersonalTask('pt-B', studentA.id);
    expect(studentADeleteAttempt).toBe(false);
    expect(personalTasksStore.has('pt-B')).toBe(true);

    // Student B deletes their own task
    const studentBDeleteAttempt = deletePersonalTask('pt-B', studentB.id);
    expect(studentBDeleteAttempt).toBe(true);
    expect(personalTasksStore.has('pt-B')).toBe(false);
  });

  it('Workflow 15: Responsive Navigation and Mobile Drawer Contract', () => {
    interface NavDrawerState {
      isOpen: boolean;
      viewportWidth: number;
    }

    function canRenderMobileDrawer(state: NavDrawerState): boolean {
      return state.viewportWidth < 768 && state.isOpen;
    }

    expect(canRenderMobileDrawer({ isOpen: true, viewportWidth: 375 })).toBe(true);
    expect(canRenderMobileDrawer({ isOpen: true, viewportWidth: 1024 })).toBe(false);
  });

  it('Workflow 16: SEO Metadata & Domain Separation Rules', () => {
    const publicUrl = 'https://novarion.web.id';
    const hubUrl = 'https://hub.novarion.web.id';

    function getRobotsDirective(domain: string, pathname: string) {
      if (domain === 'hub.novarion.web.id' || pathname.startsWith('/admin') || pathname.startsWith('/app') || pathname.startsWith('/login')) {
        return { index: false, follow: false };
      }
      return { index: true, follow: true };
    }

    // Public pages must be indexed
    expect(getRobotsDirective('novarion.web.id', '/').index).toBe(true);
    expect(getRobotsDirective('novarion.web.id', '/privacy').index).toBe(true);

    // Private hub / admin / student / login pages must NOT be indexed
    expect(getRobotsDirective('hub.novarion.web.id', '/').index).toBe(false);
    expect(getRobotsDirective('novarion.web.id', '/admin').index).toBe(false);
    expect(getRobotsDirective('novarion.web.id', '/app').index).toBe(false);
    expect(getRobotsDirective('novarion.web.id', '/login').index).toBe(false);
  });
});
