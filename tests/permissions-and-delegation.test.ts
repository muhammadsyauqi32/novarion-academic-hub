import { describe, it, expect } from 'vitest';
import {
  PERMISSION_PRESETS,
  hasPermission,
} from '../apps/web/lib/auth/permissions';
import { UserProfile } from '../apps/web/lib/auth/guards';

describe('Granular Permissions & Delegation System', () => {
  const superAdminUser: UserProfile = {
    id: '00000000-0000-0000-0000-000000000001',
    nim: 'ADMIN01',
    fullName: 'Super Administrator',
    email: 'admin@novarion.web.id',
    role: 'admin',
    mustChangePassword: false,
    isActive: true,
  };

  it('recognizes Super Admin presets and unrestricted administrative capabilities', () => {
    expect(PERMISSION_PRESETS.SUPER_ADMIN).toBeDefined();
    expect(PERMISSION_PRESETS.SUPER_ADMIN.permissions).toContain('permissions.manage');
    expect(PERMISSION_PRESETS.SUPER_ADMIN.permissions).toContain('website.manage');
    expect(PERMISSION_PRESETS.SUPER_ADMIN.permissions).toContain('whatsapp.manage');
  });

  it('defines Agenda Manager preset with scoped permissions but strictly blocks administrative secrets', () => {
    const agendaPreset = PERMISSION_PRESETS.AGENDA_MANAGER;
    expect(agendaPreset).toBeDefined();
    expect(agendaPreset.permissions).toContain('agenda.create');
    expect(agendaPreset.permissions).toContain('agenda.edit');
    expect(agendaPreset.permissions).toContain('agenda.import');

    // Strictly blocked from Super Admin capabilities
    expect(agendaPreset.permissions).not.toContain('permissions.manage');
    expect(agendaPreset.permissions).not.toContain('website.manage');
    expect(agendaPreset.permissions).not.toContain('whatsapp.manage');
    expect(agendaPreset.permissions).not.toContain('students.manage');
  });

  it('defines Materials Manager preset scoped strictly to file materials', () => {
    const materialsPreset = PERMISSION_PRESETS.MATERIALS_MANAGER;
    expect(materialsPreset).toBeDefined();
    expect(materialsPreset.permissions).toContain('materials.manage');
    expect(materialsPreset.permissions).not.toContain('website.manage');
    expect(materialsPreset.permissions).not.toContain('permissions.manage');
  });

  it('grants full authority to Super Admin without requiring granular grants', async () => {
    const canManageWebsite = await hasPermission(superAdminUser, 'website.manage');
    const canCreateAgenda = await hasPermission(superAdminUser, 'agenda.create');
    const canManageStudents = await hasPermission(superAdminUser, 'students.manage');

    expect(canManageWebsite).toBe(true);
    expect(canCreateAgenda).toBe(true);
    expect(canManageStudents).toBe(true);
  });
});
