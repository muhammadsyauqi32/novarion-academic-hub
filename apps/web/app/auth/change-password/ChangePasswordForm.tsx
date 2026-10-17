'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { changePasswordAction } from '@/actions/auth';
import { AlertCircle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordFormProps {
  mustChangePassword?: boolean;
}

export function ChangePasswordForm({ mustChangePassword }: ChangePasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validasi real-time
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromOld = currentPassword.length > 0 && newPassword !== currentPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await changePasswordAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || 'Gagal mengubah kata sandi.');
        setIsLoading(false);
        return;
      }

      if (res.redirectTo) {
        // Gunakan window.location.assign untuk navigasi penuh yang menjamin
        // seluruh cookie sesi HTTP yang diperbarui dikirimkan ke Server Components
        window.location.assign(res.redirectTo);
      } else {
        window.location.assign('/app');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-danger-surface border border-danger-border flex items-start gap-2.5 text-xs text-danger-text">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Kata Sandi Saat Ini / Sementara */}
      <div className="relative">
        <Input
          name="currentPassword"
          type={showCurrent ? 'text' : 'password'}
          label={mustChangePassword ? 'Kata Sandi Sementara' : 'Kata Sandi Saat Ini'}
          placeholder="Masukkan kata sandi saat ini"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute right-3.5 top-[29px] text-text-muted hover:text-text-primary transition-colors"
        >
          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Kata Sandi Baru */}
      <div className="relative">
        <Input
          name="newPassword"
          type={showNew ? 'text' : 'password'}
          label="Kata Sandi Baru"
          placeholder="Minimal 8 karakter (huruf besar, kecil, angka)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowNew(!showNew)}
          className="absolute right-3.5 top-[29px] text-text-muted hover:text-text-primary transition-colors"
        >
          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Konfirmasi Kata Sandi Baru */}
      <div className="relative">
        <Input
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          label="Konfirmasi Kata Sandi Baru"
          placeholder="Ulangi kata sandi baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3.5 top-[29px] text-text-muted hover:text-text-primary transition-colors"
        >
          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Syarat Keamanan Kata Sandi */}
      <div className="p-3.5 rounded-xl bg-surface-soft border border-border/80 flex flex-col gap-2 text-xs">
        <span className="font-semibold text-text-primary">Standar Keamanan Kata Sandi:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${hasMinLength ? 'text-teal-deep' : 'text-text-muted/50'}`}
            />
            <span className={hasMinLength ? 'text-text-primary font-medium' : 'text-text-muted'}>
              Minimal 8 karakter
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${hasUpperCase ? 'text-teal-deep' : 'text-text-muted/50'}`}
            />
            <span className={hasUpperCase ? 'text-text-primary font-medium' : 'text-text-muted'}>
              Minimal 1 huruf kapital (A-Z)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${hasLowerCase ? 'text-teal-deep' : 'text-text-muted/50'}`}
            />
            <span className={hasLowerCase ? 'text-text-primary font-medium' : 'text-text-muted'}>
              Minimal 1 huruf kecil (a-z)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${hasNumber ? 'text-teal-deep' : 'text-text-muted/50'}`}
            />
            <span className={hasNumber ? 'text-text-primary font-medium' : 'text-text-muted'}>
              Minimal 1 angka (0-9)
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:col-span-2">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${isMatch ? 'text-teal-deep' : 'text-text-muted/50'}`}
            />
            <span className={isMatch ? 'text-text-primary font-medium' : 'text-text-muted'}>
              Konfirmasi kata sandi cocok
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        type="submit"
        isLoading={isLoading}
        className="w-full font-bold gap-2 mt-2"
        disabled={!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !isMatch}
      >
        <Lock className="w-4 h-4" />
        <span>Simpan Kata Sandi Baru</span>
      </Button>
    </form>
  );
}
