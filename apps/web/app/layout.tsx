import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { TopProgressBar } from '@/components/TopProgressBar';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://novarion.web.id'),
  title: {
    default: 'Novarion — Academic Hub Angkatan Statistika',
    template: '%s | Novarion Academic Hub',
  },
  description:
    'Satu angkatan, satu ruang. Platform terpadu agenda perkuliahan, kalender akademik, akses file materi, dan pengingat deadline WhatsApp otomatis berbiaya Rp0.',
  keywords: [
    'Novarion',
    'Academic Hub',
    'Statistika',
    'Kalender Perkuliahan',
    'Reminder WhatsApp Mahasiswa',
    'Agenda Kuliah',
    'Tugas Kuliah',
  ],
  authors: [{ name: 'Pengurus Angkatan Novarion' }],
  creator: 'Novarion Academic Hub Team',
  publisher: 'Novarion',
  applicationName: 'Novarion Academic Hub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Novarion — Academic Hub Angkatan Statistika',
    description:
      'Satu angkatan, satu ruang. Platform terpadu agenda perkuliahan, bank materi, dan bot pengingat deadline WhatsApp otomatis.',
    url: 'https://novarion.web.id',
    siteName: 'Novarion Academic Hub',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Novarion — Academic Hub Angkatan Statistika',
    description:
      'Platform terpadu agenda perkuliahan, kalender akademik, dan bot pengingat deadline WhatsApp otomatis angkatan.',
  },
};

export const viewport: Viewport = {
  themeColor: '#176C5B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas text-text-primary antialiased selection:bg-brand-mint-soft selection:text-text-primary">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

