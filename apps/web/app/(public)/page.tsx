import React from 'react';
import type { Metadata } from 'next';
import { getPublicWebsiteData } from '@/lib/public-data';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { LeadershipSection } from '@/components/public/LeadershipSection';
import { NewsSection } from '@/components/public/NewsSection';
import { GallerySection } from '@/components/public/GallerySection';
import { AchievementsSection } from '@/components/public/AchievementsSection';
import { AcademicHubCtaSection } from '@/components/public/AcademicHubCtaSection';
import { COHORT_CONFIG } from '@/lib/config/cohort';

export const metadata: Metadata = {
  title: 'NOVARION — Angkatan 62 Statistika dan Sains Data IPB University',
  description:
    'Portal resmi Angkatan 62 Statistika dan Sains Data IPB University (NOVARION). "Kita Satu, Kita Bisa!" — Warta kegiatan, kepengurusan, galeri momen, dan prestasi angkatan.',
  alternates: {
    canonical: 'https://novarion.web.id',
  },
  openGraph: {
    title: 'NOVARION — Statistika dan Sains Data 62 IPB',
    description: 'Portal resmi Angkatan 62 Statistika dan Sains Data IPB University. "Kita Satu, Kita Bisa!"',
    url: 'https://novarion.web.id',
    siteName: 'NOVARION Academic Hub',
    locale: 'id_ID',
    type: 'website',
  },
};

// Revalidate public CMS content periodically (ISR 60s)
export const revalidate = 60;

export default async function LandingPage() {
  const { hero, news, albums, achievements } = await getPublicWebsiteData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'NOVARION — Statistika dan Sains Data 62 IPB',
    alternateName: 'Novarion Academic Hub',
    url: 'https://novarion.web.id',
    description:
      'Portal resmi Angkatan 62 Statistika dan Sains Data IPB University. "Kita Satu, Kita Bisa!" — Menyatukan cahaya inovasi dan arah kepemimpinan masa depan.',
    keywords: 'Statistika, Sains Data, Novarion, IPB University, Angkatan 62, Kalender Akademik',
    inLanguage: 'id-ID',
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'IPB University',
      url: 'https://ipb.ac.id',
    },
  };

  return (
    <div className="flex flex-col w-full overflow-hidden min-h-screen bg-canvas text-text-primary">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Section 1 — Hero / The Collective */}
      <HeroSection hero={hero} />

      {/* Section 2 — Tentang Novarion (Nova + Orion Philosophy) */}
      <AboutSection />

      {/* Section 3 — Struktur Pengurus Angkatan */}
      <LeadershipSection />

      {/* Section 4 — Berita & Kegiatan (Update Singkat & Artikel Lengkap) */}
      <NewsSection news={news} />

      {/* Section 5 — Galeri & Dokumentasi (Hybrid Collage & Lightbox) */}
      <GallerySection albums={albums} />

      {/* Section 6 — Prestasi Angkatan */}
      <AchievementsSection achievements={achievements} />

      {/* Section 7 — Academic Hub Access CTA */}
      <AcademicHubCtaSection />
    </div>
  );
}
