'use client';

import React, { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit3,
  Search,
  MousePointerClick,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Globe,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  createShortLinkAction,
  deleteShortLinkAction,
  updateShortLinkAction,
  checkSlugAvailabilityAction,
} from '@/actions/links';
import { formatWIBShort, shortLinkSlugRegex, RESERVED_SLUGS } from '@novarion/shared';

export interface ShortLinkItem {
  id: string;
  originalUrl: string;
  slug: string;
  title: string | null;
  description: string | null;
  clickCount: number;
  userId: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ShortLinksClientProps {
  initialLinks: ShortLinkItem[];
  userRole?: string;
  currentUserId?: string;
}

export function ShortLinksClient({ initialLinks, userRole, currentUserId }: ShortLinksClientProps) {
  const [links, setLinks] = useState<ShortLinkItem[]>(initialLinks);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ShortLinkItem | null>(null);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form states for creation
  const [formOriginalUrl, setFormOriginalUrl] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);

  // Slug availability state
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    status: 'idle' | 'valid' | 'invalid' | 'checking';
    message?: string;
  }>({ status: 'idle' });

  // Detect active host origin in browser (e.g., http://localhost:3000 or https://hub.novarion.web.id)
  const [activeOrigin, setActiveOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveOrigin(window.location.origin);
    }
  }, []);

  const displayHost = useMemo(() => {
    if (!activeOrigin) return 'novarion.web.id';
    try {
      const u = new URL(activeOrigin);
      // Jika diakses dari hub, tampilkan domain publik utama agar link lebih ringkas
      if (u.host.startsWith('hub.novarion.web.id')) {
        return 'novarion.web.id';
      }
      return u.host;
    } catch {
      return 'novarion.web.id';
    }
  }, [activeOrigin]);

  const getWorkingUrl = (slug: string) => {
    if (activeOrigin.includes('hub.novarion.web.id')) {
      return `https://novarion.web.id/${slug}`;
    }
    if (activeOrigin) {
      return `${activeOrigin}/${slug}`;
    }
    return `https://novarion.web.id/${slug}`;
  };

  const [isPending, startTransition] = useTransition();

  // Debounced slug check
  useEffect(() => {
    if (!formSlug.trim()) {
      setSlugStatus({ status: 'idle' });
      setSlugChecking(false);
      return;
    }

    const cleanSlug = formSlug.trim().toLowerCase();

    // Local syntax checks first
    if (cleanSlug.length < 2) {
      setSlugStatus({ status: 'invalid', message: 'Slug minimal 2 karakter' });
      return;
    }
    if (cleanSlug.length > 64) {
      setSlugStatus({ status: 'invalid', message: 'Slug maksimal 64 karakter' });
      return;
    }
    if (!shortLinkSlugRegex.test(cleanSlug)) {
      setSlugStatus({
        status: 'invalid',
        message: 'Hanya huruf kecil (a-z), angka (0-9), dan tanda hubung (-).',
      });
      return;
    }
    if (RESERVED_SLUGS.includes(cleanSlug as any)) {
      setSlugStatus({
        status: 'invalid',
        message: 'Slug ini dicadangkan untuk sistem internal Novarion.',
      });
      return;
    }

    setSlugChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkSlugAvailabilityAction(cleanSlug);
        if (res.available) {
          setSlugStatus({ status: 'valid', message: 'Slug tersedia!' });
        } else {
          setSlugStatus({ status: 'invalid', message: res.reason || 'Slug sudah dipakai.' });
        }
      } catch {
        setSlugStatus({ status: 'idle' });
      } finally {
        setSlugChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formSlug]);

  // Copy to clipboard helper (copies active working URL by default)
  const handleCopy = async (slug: string, format: 'working' | 'nova' = 'working') => {
    const fullUrl = format === 'working' ? getWorkingUrl(slug) : `https://nova.link/${slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(slug);
      setTimeout(() => {
        setCopiedSlug(null);
      }, 2000);
    } catch {
      prompt('Salin tautan:', fullUrl);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormOriginalUrl('');
    setFormSlug('');
    setFormTitle('');
    setFormDescription('');
    setFormError(null);
    setSlugStatus({ status: 'idle' });
    setIsCreateModalOpen(true);
  };

  // Handle Create Link
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let dest = formOriginalUrl.trim();
    if (!dest) {
      setFormError('URL tujuan wajib diisi.');
      return;
    }
    if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
      dest = 'https://' + dest;
    }

    const cleanSlug = formSlug.trim().toLowerCase();
    if (!cleanSlug) {
      setFormError('Custom back-half / slug wajib diisi.');
      return;
    }

    if (slugStatus.status === 'invalid') {
      setFormError(slugStatus.message || 'Format slug tidak valid atau sudah digunakan.');
      return;
    }

    startTransition(async () => {
      const res = await createShortLinkAction({
        originalUrl: dest,
        slug: cleanSlug,
        title: formTitle.trim() || undefined,
        description: formDescription.trim() || undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'Gagal membuat tautan.');
        return;
      }

      // Prepend to state
      if (res.link) {
        const newRecord: ShortLinkItem = {
          id: res.link.id,
          originalUrl: res.link.originalUrl,
          slug: res.link.slug,
          title: res.link.title,
          description: formDescription.trim() || null,
          clickCount: 0,
          userId: currentUserId || null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setLinks((prev) => [newRecord, ...prev]);
      }

      setIsCreateModalOpen(false);
    });
  };

  // Open Edit Modal
  const openEditModal = (link: ShortLinkItem) => {
    setEditingLink(link);
    setEditTitle(link.title || '');
    setEditOriginalUrl(link.originalUrl);
    setEditDescription(link.description || '');
    setEditIsActive(link.isActive);
    setEditError(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    setEditError(null);

    let dest = editOriginalUrl.trim();
    if (!dest) {
      setEditError('URL tujuan wajib diisi.');
      return;
    }
    if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
      dest = 'https://' + dest;
    }

    startTransition(async () => {
      const res = await updateShortLinkAction(editingLink.id, {
        title: editTitle.trim() || undefined,
        originalUrl: dest,
        description: editDescription.trim() || undefined,
        isActive: editIsActive,
      });

      if (!res.success) {
        setEditError(res.error || 'Gagal memperbarui tautan.');
        return;
      }

      setLinks((prev) =>
        prev.map((l) =>
          l.id === editingLink.id
            ? {
                ...l,
                title: editTitle.trim() || null,
                originalUrl: dest,
                description: editDescription.trim() || null,
                isActive: editIsActive,
                updatedAt: new Date().toISOString(),
              }
            : l
        )
      );

      setEditingLink(null);
    });
  };

  // Handle Delete
  const handleDeleteConfirm = () => {
    if (!deletingLinkId) return;
    const targetId = deletingLinkId;

    startTransition(async () => {
      const res = await deleteShortLinkAction(targetId);
      if (res.success) {
        setLinks((prev) => prev.filter((l) => l.id !== targetId));
      }
      setDeletingLinkId(null);
    });
  };

  // Filtered links
  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) =>
        l.slug.toLowerCase().includes(q) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        l.originalUrl.toLowerCase().includes(q)
    );
  }, [links, search]);

  // Total metrics
  const totalClicks = useMemo(() => {
    return links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  }, [links]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-card border border-border">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-input bg-brand-primary/15 text-teal-deep flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
              Shortlink Kustom (nova.link)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl">
            Buat dan kelola tautan singkat angkatan untuk kemudahan berbagi materi, formulir pendaftaran kegiatan, dan berkas penting.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          className="self-start md:self-center shrink-0 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Buat Tautan Baru</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">
            Total Tautan
          </span>
          <span className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
            {links.length}
          </span>
        </div>
        <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">
            Total Klik Akumulatif
          </span>
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-teal-deep" />
            <span className="text-xl sm:text-2xl font-heading font-bold text-teal-deep">
              {totalClicks.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">
            Format Tautan Aktif
          </span>
          <span className="text-sm sm:text-base font-mono font-bold text-text-primary truncate">
            {displayHost}/[slug]
          </span>
        </div>
      </div>

      {/* Info Callout Banner */}
      <div className="p-4 rounded-card bg-surface border border-border flex items-start gap-3 text-xs leading-relaxed">
        <div className="w-8 h-8 rounded-input bg-brand-primary/20 text-teal-deep flex items-center justify-center shrink-0 mt-0.5">
          <Globe className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-text-primary text-sm">
            Format Tautan Siap Pakai &amp; Opsi Domain Pendek
          </span>
          <p className="text-text-muted">
            Tautan yang <strong>langsung aktif</strong> dan siap disebarkan ke mahasiswa/peserta adalah format ringkas{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-soft border border-border font-mono text-teal-deep font-semibold">
              {displayHost}/[slug]
            </code>
            .
          </p>
          <p className="text-text-muted text-[11px]">
            * Ingin domain super pendek seperti <code className="font-mono">ipb.link</code>? Anda dapat mendaftarkan domain pendek murah (misal: <code className="font-mono font-semibold">nova.my.id</code> seharga ~Rp12rb/tahun atau <code className="font-mono font-semibold">s.novarion.web.id</code>) lalu mengarahkan DNS ke hosting Novarion. Sistem sudah 100% siap mengenali domain pendek tersebut secara otomatis.
          </p>
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-surface rounded-card border border-border overflow-hidden flex flex-col">
        {/* Controls Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, slug, atau link tujuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-surface-soft border border-border rounded-input text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-teal-deep focus:bg-surface transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-text-muted self-end sm:self-center font-medium">
            Menampilkan {filteredLinks.length} dari {links.length} tautan
          </div>
        </div>

        {/* Links List / Table */}
        {filteredLinks.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-soft border border-border flex items-center justify-center text-text-muted mb-3">
              <Link2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1">
              {search ? 'Tidak ada tautan yang cocok' : 'Belum ada tautan singkat dibuat'}
            </p>
            <p className="text-xs text-text-muted max-w-sm mb-4">
              {search
                ? 'Coba gunakan kata kunci pencarian yang berbeda.'
                : 'Mulai buat tautan kustom pertama Anda dengan domain nova.link untuk kegiatan angkatan.'}
            </p>
            {!search && (
              <Button onClick={openCreateModal} variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                <span>Buat Tautan Pertama</span>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-soft/60 text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tautan Singkat</th>
                    <th className="py-3 px-4">URL Tujuan</th>
                    <th className="py-3 px-4 text-center">Klik</th>
                    <th className="py-3 px-4">Dibuat</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLinks.map((link) => {
                    const isCopied = copiedSlug === link.slug;
                    return (
                      <tr
                        key={link.id}
                        className="hover:bg-surface-soft/40 transition-colors group"
                      >
                        {/* Title & Short URL */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-text-primary text-sm">
                              {link.title || 'Tanpa Judul'}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-teal-deep font-semibold">
                              <span>{displayHost}/{link.slug}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(link.slug, 'working')}
                                title="Salin tautan aktif"
                                className="p-1 rounded text-text-muted hover:text-teal-deep hover:bg-teal-deep/10 transition-colors"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-success-text" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <a
                                href={`/${link.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buka tautan (test redirect)"
                                className="p-1 rounded text-text-muted hover:text-teal-deep hover:bg-teal-deep/10 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              {isCopied && (
                                <span className="text-[10px] text-success-text font-sans font-medium">
                                  Tersalin!
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-text-muted font-mono">
                              Alias: nova.link/{link.slug}
                            </div>
                            {link.description && (
                              <p className="text-text-muted text-[11px] line-clamp-1 mt-0.5">
                                {link.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Destination URL */}
                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary hover:underline line-clamp-2 break-all"
                            title={link.originalUrl}
                          >
                            <span className="truncate">{link.originalUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        {/* Click Count */}
                        <td className="py-3.5 px-4 align-top text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-soft font-mono font-semibold text-text-primary border border-border">
                            <MousePointerClick className="w-3 h-3 text-teal-deep" />
                            {link.clickCount}
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-4 align-top text-text-muted whitespace-nowrap">
                          {formatWIBShort(link.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(link)}
                              title="Edit tautan"
                              className="p-1.5 rounded-input text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingLinkId(link.id)}
                              title="Hapus tautan"
                              className="p-1.5 rounded-input text-text-muted hover:text-danger-text hover:bg-danger-surface transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-border">
              {filteredLinks.map((link) => {
                const isCopied = copiedSlug === link.slug;
                return (
                  <div key={link.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm text-text-primary">
                          {link.title || 'Tanpa Judul'}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-teal-deep">
                          <span>{displayHost}/{link.slug}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(link.slug, 'working')}
                            className="p-1 rounded text-text-muted hover:text-teal-deep"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-success-text" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={`/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-text-muted hover:text-teal-deep"
                            title="Buka tautan (test redirect)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {isCopied && (
                            <span className="text-[10px] text-success-text font-sans font-medium">
                              Tersalin!
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-muted font-mono">
                          Alias: nova.link/{link.slug}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-soft font-mono text-xs font-semibold text-text-primary border border-border shrink-0">
                        <MousePointerClick className="w-3 h-3 text-teal-deep" />
                        {link.clickCount}
                      </span>
                    </div>

                    <div className="text-xs text-text-muted break-all">
                      <span className="font-medium text-text-primary">Tujuan: </span>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-text-muted inline-flex items-center gap-1"
                      >
                        <span className="line-clamp-1">{link.originalUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-text-muted">
                      <span>Dibuat {formatWIBShort(link.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(link)}
                          className="px-2.5 py-1 rounded text-text-primary font-medium hover:bg-surface-soft"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLinkId(link.id)}
                          className="px-2.5 py-1 rounded text-danger-text font-medium hover:bg-danger-surface"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* CREATE LINK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface rounded-modal border border-border shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-input bg-brand-primary/15 text-teal-deep flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Buat Tautan Singkat Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-input"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 flex flex-col gap-4">
              {formError && (
                <div className="p-3 rounded-input bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Destination URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                  <span>URL Tujuan (Destination URL) *</span>
                </label>
                <input
                  type="text"
                  placeholder="https://forms.gle/... atau link drive/dokumen"
                  value={formOriginalUrl}
                  onChange={(e) => setFormOriginalUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-teal-deep transition-colors"
                />
                <span className="text-[11px] text-text-muted">
                  Tautan lengkap yang dituju ketika seseorang membuka link singkat Anda.
                </span>
              </div>

              {/* Custom Back-half */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                  <span>Custom Back-half (Slug Kustom) *</span>
                  {slugChecking && (
                    <span className="text-[10px] text-text-muted inline-flex items-center gap-1 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" /> Memeriksa...
                    </span>
                  )}
                  {!slugChecking && slugStatus.status === 'valid' && (
                    <span className="text-[10px] text-success-text inline-flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> {slugStatus.message}
                    </span>
                  )}
                </label>
                <div className="flex items-center rounded-input border border-border bg-surface focus-within:border-teal-deep overflow-hidden">
                  <span className="px-3 py-2 bg-surface-soft border-r border-border text-xs font-mono font-semibold text-text-muted select-none">
                    {displayHost}/
                  </span>
                  <input
                    type="text"
                    placeholder="pendaftaran-makrab"
                    value={formSlug}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
                      setFormSlug(val);
                    }}
                    required
                    className="flex-1 px-3 py-2 text-xs sm:text-sm font-mono bg-transparent text-text-primary placeholder:text-text-muted/60 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-0.5 text-[11px] text-text-muted">
                  <span>Tautan aktif: <strong className="font-mono text-teal-deep">{getWorkingUrl(formSlug || 'slug')}</strong></span>
                  <span>Alias kustom: <span className="font-mono">nova.link/{formSlug || 'slug'}</span></span>
                </div>
                {slugStatus.status === 'invalid' && (
                  <span className="text-[11px] text-danger-text font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {slugStatus.message}
                  </span>
                )}
                {slugStatus.status !== 'invalid' && (
                  <span className="text-[11px] text-text-muted">
                    Hanya gunakan huruf kecil (a-z), angka (0-9), dan tanda hubung (-).
                  </span>
                )}
              </div>

              {/* Title / Label */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Judul / Label Tautan <span className="text-text-muted font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Form Pendaftaran Makrab 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={255}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-teal-deep transition-colors"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Catatan Keterangan <span className="text-text-muted font-normal">(Opsional)</span>
                </label>
                <textarea
                  placeholder="Catatan tambahan untuk tim / panitia..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-teal-deep transition-colors resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPending}
                  disabled={slugStatus.status === 'invalid' || isPending}
                >
                  <span>Buat Tautan</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LINK MODAL */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface rounded-modal border border-border shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-input bg-surface-soft text-text-primary flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Edit Tautan: nova.link/{editingLink.slug}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-input"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 flex flex-col gap-4">
              {editError && (
                <div className="p-3 rounded-input bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Readonly Slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Tautan Singkat (Slug)
                </label>
                <input
                  type="text"
                  value={`nova.link/${editingLink.slug}`}
                  disabled
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono bg-surface-soft border border-border rounded-input text-text-muted cursor-not-allowed"
                />
              </div>

              {/* Destination URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  URL Tujuan *
                </label>
                <input
                  type="text"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:border-teal-deep transition-colors"
                />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Judul / Label
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:border-teal-deep transition-colors"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Keterangan
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:border-teal-deep transition-colors resize-none"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-input bg-surface-soft border border-border">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">Status Aktif</span>
                  <span className="text-[11px] text-text-muted">
                    Jika nonaktif, pengunjung akan dialihkan ke halaman 404.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-deep accent-teal-deep focus:ring-teal-deep"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLink(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPending}
                >
                  <span>Simpan Perubahan</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLinkId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface rounded-modal border border-border shadow-xl max-w-sm w-full p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-danger-surface border border-danger-border flex items-center justify-center text-danger-text shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  Hapus Tautan Singkat?
                </h3>
                <span className="text-xs text-text-muted">
                  Tautan ini tidak akan dapat diakses kembali oleh pengunjung.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingLinkId(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isPending}
                onClick={handleDeleteConfirm}
              >
                <span>Hapus Sekarang</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

