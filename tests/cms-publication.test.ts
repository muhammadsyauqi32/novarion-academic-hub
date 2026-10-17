import { describe, it, expect } from 'vitest';
import { getPublicWebsiteData } from '../apps/web/lib/public-data';
import { COHORT_CONFIG } from '../apps/web/lib/config/cohort';

describe('Public Identity & CMS Data Model', () => {
  it('preserves authentic Novarion cohort branding, tagline, and philosophy', () => {
    expect(COHORT_CONFIG.name).toBe('NOVARION');
    expect(COHORT_CONFIG.cohortNumber).toBe(62);
    expect(COHORT_CONFIG.tagline).toBe('Kita Satu, Kita Bisa!');
    expect(COHORT_CONFIG.program).toBe('Statistika dan Sains Data');
    expect(COHORT_CONFIG.institution).toBe('IPB University');

    // Philosophy definitions
    expect(COHORT_CONFIG.philosophy.nova.meaning).toContain('Cahaya bintang');
    expect(COHORT_CONFIG.philosophy.orion.meaning).toContain('penunjuk arah');
  });

  it('provides structured leadership configuration without synthetic portraits', () => {
    expect(COHORT_CONFIG.leadership.length).toBeGreaterThan(0);
    const ketuaDivision = COHORT_CONFIG.leadership.find((d) => d.divisionName.toLowerCase().includes('inti'));
    expect(ketuaDivision).toBeDefined();
    expect(ketuaDivision?.members.length).toBeGreaterThan(0);
  });

  it('fetches published public landing data safely with database fallback', async () => {
    const data = await getPublicWebsiteData();
    expect(data).toBeDefined();
    expect(Array.isArray(data.news)).toBe(true);
    expect(Array.isArray(data.albums)).toBe(true);
    expect(Array.isArray(data.achievements)).toBe(true);
  });
});
