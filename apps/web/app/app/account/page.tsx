import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { User, Mail, Hash, Shield, LogOut, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default async function AccountPage() {
  const user = await requireAuth();

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
          Akun & Profil Mahasiswa
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Identitas akademik terverifikasi pada whitelist Novarion Academic Hub Angkatan 62.
        </p>
      </div>

      <div className="rounded-card bg-surface border border-border p-6 sm:p-7 flex flex-col gap-6 shadow-xs">
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="w-14 h-14 rounded-xl bg-teal-deep text-white font-heading font-bold text-2xl flex items-center justify-center shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="font-heading font-bold text-base sm:text-lg text-text-primary truncate">
              {user.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant={user.role === 'admin' ? 'orange' : 'primary'} size="sm">
                {user.role === 'admin' ? 'Administrator' : 'Mahasiswa'}
              </Badge>
              <span className="text-[11px] font-mono text-text-muted">Status: Aktif</span>
            </div>
          </div>
        </div>

        {/* Details list */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-soft/60 border border-border">
            <div className="flex items-center gap-2.5 text-xs text-text-muted">
              <Hash className="w-4 h-4 text-teal-deep" />
              <span>Nomor Induk Mahasiswa (NIM)</span>
            </div>
            <span className="text-xs font-mono font-bold text-text-primary">{user.nim}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-soft/60 border border-border">
            <div className="flex items-center gap-2.5 text-xs text-text-muted">
              <Mail className="w-4 h-4 text-teal-deep" />
              <span>Email Resmi Apps IPB</span>
            </div>
            <span className="text-xs font-mono font-bold text-text-primary truncate max-w-[200px] sm:max-w-none">
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-soft/60 border border-border">
            <div className="flex items-center gap-2.5 text-xs text-text-muted">
              <Shield className="w-4 h-4 text-teal-deep" />
              <span>Peran Akses</span>
            </div>
            <span className="text-xs font-bold text-text-primary capitalize">{user.role}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <Link href="/auth/change-password">
            <Button variant="secondary" size="sm" type="button" className="text-xs gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ubah Kata Sandi</span>
            </Button>
          </Link>

          <form action="/auth/signout" method="post">
            <Button variant="danger" size="sm" type="submit" className="text-xs gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
