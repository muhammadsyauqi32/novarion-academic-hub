import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Novarion Academic Hub V3 — Satu Angkatan, Satu Ruang',
  description: 'Pusat agenda, materi perkuliahan, dan pengingat deadline WhatsApp otomatis untuk angkatan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas text-text-primary antialiased selection:bg-brand-mint-soft selection:text-text-primary">
        {children}
      </body>
    </html>
  );
}
