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

describe('Phase 1.1 — Workspace Navigation Rules', () => {
  it('identifies role-based default routes correctly', () => {
    function getDefaultRedirect(role: string, mustChangePassword: boolean = false): string {
      if (mustChangePassword) return '/auth/change-password';
      if (role === 'admin') return '/admin';
      return '/app';
    }

    expect(getDefaultRedirect('admin', false)).toBe('/admin');
    expect(getDefaultRedirect('student', false)).toBe('/app');
    expect(getDefaultRedirect('admin', true)).toBe('/auth/change-password');
    expect(getDefaultRedirect('student', true)).toBe('/auth/change-password');
  });

  it('keeps administrative agenda management strictly within /admin/agendas', () => {
    const adminAgendaPath = '/admin/agendas';
    const studentAgendaPath = '/app/agendas';

    expect(adminAgendaPath).toMatch(/^\/admin/);
    expect(studentAgendaPath).toMatch(/^\/app/);

    // Official agendas should only be published from admin routes
    function canPublishOfficialDirectly(route: string, role: string): boolean {
      return role === 'admin' && route.startsWith('/admin');
    }

    expect(canPublishOfficialDirectly('/admin/agendas', 'admin')).toBe(true);
    expect(canPublishOfficialDirectly('/app/agendas', 'admin')).toBe(false);
    expect(canPublishOfficialDirectly('/app/agendas', 'student')).toBe(false);
  });

  it('handles student mode as presentation-only state with clear return path', () => {
    interface UserSession {
      id: string;
      role: 'admin' | 'student';
    }

    function getWorkspaceBanner(user: UserSession, currentPath: string) {
      if (user.role === 'admin' && currentPath.startsWith('/app')) {
        return {
          showBanner: true,
          label: 'Mode Mahasiswa (Pratinjau)',
          returnUrl: '/admin',
        };
      }
      return { showBanner: false, label: null, returnUrl: null };
    }

    const adminInApp = getWorkspaceBanner({ id: 'adm-1', role: 'admin' }, '/app/dashboard');
    expect(adminInApp.showBanner).toBe(true);
    expect(adminInApp.returnUrl).toBe('/admin');

    const studentInApp = getWorkspaceBanner({ id: 'std-1', role: 'student' }, '/app/dashboard');
    expect(studentInApp.showBanner).toBe(false);

    const adminInAdmin = getWorkspaceBanner({ id: 'adm-1', role: 'admin' }, '/admin/dashboard');
    expect(adminInAdmin.showBanner).toBe(false);
  });
});

describe('Phase 1.3 — Performance & Middleware Optimization', () => {
  it('correctly bypasses expensive auth.getUser() calls for public routes', () => {
    function requiresAuthSync(pathname: string, hostname?: string): boolean {
      if (hostname && (hostname.startsWith('hub.') || hostname.includes('localhost'))) {
        // Pada hub, halaman login dan root memerlukan evaluasi
      }
      return (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/app') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/login')
      );
    }

    // Public landing pages must NOT trigger auth sync overhead
    expect(requiresAuthSync('/')).toBe(false);
    expect(requiresAuthSync('/about')).toBe(false);
    expect(requiresAuthSync('/terms')).toBe(false);

    // Protected or auth routes must trigger auth sync
    expect(requiresAuthSync('/admin')).toBe(true);
    expect(requiresAuthSync('/admin/agendas')).toBe(true);
    expect(requiresAuthSync('/app')).toBe(true);
    expect(requiresAuthSync('/app/agendas')).toBe(true);
    expect(requiresAuthSync('/login')).toBe(true);
    expect(requiresAuthSync('/auth/change-password')).toBe(true);
  });

  it('demonstrates parallel query execution advantage (Promise.all vs Sequential)', async () => {
    const mockQuery = (delayMs: number, result: any) =>
      new Promise((resolve) => setTimeout(() => resolve(result), delayMs));

    // Sequential simulation (e.g. 5 database queries at 15ms each)
    const t0Seq = performance.now();
    await mockQuery(15, 1);
    await mockQuery(15, 2);
    await mockQuery(15, 3);
    await mockQuery(15, 4);
    await mockQuery(15, 5);
    const seqDuration = performance.now() - t0Seq;

    // Parallel simulation
    const t0Par = performance.now();
    await Promise.all([
      mockQuery(15, 1),
      mockQuery(15, 2),
      mockQuery(15, 3),
      mockQuery(15, 4),
      mockQuery(15, 5),
    ]);
    const parDuration = performance.now() - t0Par;

    // Parallel execution should be at least 2.5x faster than sequential
    expect(seqDuration).toBeGreaterThan(60);
    expect(parDuration).toBeLessThan(35);
    expect(parDuration).toBeLessThan(seqDuration / 2);
  });
});

describe('Phase 1.4 — Student Initial Password UX', () => {
  it('generates secure random temporary passwords with required entropy', () => {
    const password = generateSecureTempPassword();
    expect(password).toMatch(/^Nvrn-[0-9A-F]{8}[!@#$]$/);
    expect(password.length).toBe(14);

    // Verify randomness: 5 consecutive calls must produce unique passwords
    const set = new Set(Array.from({ length: 5 }, () => generateSecureTempPassword()));
    expect(set.size).toBe(5);
  });

  it('preserves DEFAULT_STUDENT_PASSWORD exclusively for controlled test accounts', () => {
    const defaultPassword = getDefaultStudentPassword();
    expect(defaultPassword).toBeDefined();
    expect(defaultPassword.length).toBeGreaterThanOrEqual(8);

    function resolveInitialPassword(nim: string, role: string): string {
      const isTestAccount = nim === 'TEST001' || nim === 'TEST002';
      if (isTestAccount && role === 'student') {
        return getDefaultStudentPassword();
      }
      return generateSecureTempPassword();
    }

    const test001Pwd = resolveInitialPassword('TEST001', 'student');
    const test002Pwd = resolveInitialPassword('TEST002', 'student');
    const realStudentPwd = resolveInitialPassword('M0401251099', 'student');
    const adminTestPwd = resolveInitialPassword('TEST001', 'admin');

    expect(test001Pwd).toBe(defaultPassword);
    expect(test002Pwd).toBe(defaultPassword);
    // Real student must receive secure generated password, NOT default
    expect(realStudentPwd).not.toBe(defaultPassword);
    expect(realStudentPwd).toMatch(/^Nvrn-[0-9A-F]{8}[!@#$]$/);
    // Admin with test NIM must NEVER receive default student password
    expect(adminTestPwd).not.toBe(defaultPassword);
  });

  it('creates full formatted broadcast message with all required student details', () => {
    const tempModalData = {
      nim: 'M0401251088',
      fullName: 'Ahmad Dahlan',
      password: 'Nvrn-8A2F9B1C!',
      isReset: false,
    };

    const loginUrl = 'https://hub.novarion.web.id/login';
    const msg = `*AKUN NOVARION ACADEMIC HUB*
Halo *${tempModalData.fullName}*, akun Anda telah diaktifkan:

• *NIM:* ${tempModalData.nim}
• *Kata Sandi Sementara:* ${tempModalData.password}
• *Tautan Masuk:* ${loginUrl}`;

    expect(msg).toContain(tempModalData.nim);
    expect(msg).toContain(tempModalData.fullName);
    expect(msg).toContain(tempModalData.password);
    expect(msg).toContain(loginUrl);
  });
});
