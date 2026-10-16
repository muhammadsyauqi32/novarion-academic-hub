import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { User, Mail, Hash, Shield, LogOut } from 'lucide-react';

export default async function AccountPage() {
  const user = await requireAuth();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          Akun & Profil
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Identitas akademik terverifikasi pada whitelist Novarion Academic Hub.
        </p>
      </div>

      <Card className="p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary text-text-primary font-heading font-black text-2xl flex items-center justify-center shadow-sm">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="font-heading font-bold text-lg text-text-primary">
              {user.fullName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.role === 'admin' ? 'orange' : 'primary'} size="sm">
                {user.role === 'admin' ? 'Administrator' : 'Mahasiswa'}
              </Badge>
              <span className="text-xs text-text-muted">Status: Aktif</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-soft border border-border">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-teal-deep" />
              <span className="text-xs font-medium text-text-muted">Nomor Induk Mahasiswa (NIM)</span>
            </div>
            <span className="text-xs font-bold text-text-primary">{user.nim}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-soft border border-border">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-teal-deep" />
              <span className="text-xs font-medium text-text-muted">Email Terdaftar Kampus</span>
            </div>
            <span className="text-xs font-bold text-text-primary">{user.email}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-soft border border-border">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-teal-deep" />
              <span className="text-xs font-medium text-text-muted">Peran Hak Akses</span>
            </div>
            <span className="text-xs font-bold text-text-primary capitalize">{user.role}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
          <a href="/auth/change-password">
            <Button variant="secondary" size="sm" type="button">
              <span>Ubah Kata Sandi</span>
            </Button>
          </a>

          <form action="/auth/signout" method="post">
            <Button variant="danger" size="sm" type="submit">
              <LogOut className="w-4 h-4 mr-1.5" />
              <span>Keluar dari Akun</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
