'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Check,
  Plus
} from 'lucide-react';
import { 
  saveHeroAction, 
  publishHeroAction, 
  saveNewsAction, 
  deleteNewsAction, 
  saveAlbumAction, 
  addPhotoToAlbumAction, 
  deletePhotoAction, 
  deleteAlbumAction,
  saveAchievementAction,
  deleteAchievementAction,
  uploadMediaAction
} from '@/actions/cms';
import { CMSHero, CMSNews, CMSAlbum, CMSAchievement, CMSMedia, PublishStatus, CMSContentType } from '@novarion/shared';

interface CmsClientProps {
  initialHeroes: any[];
  initialNews: any[];
  initialAlbums: any[];
  initialAchievements: any[];
  initialMedia: any[];
}

export function CmsClient({
  initialHeroes,
  initialNews,
  initialAlbums,
  initialAchievements,
  initialMedia,
}: CmsClientProps) {
  const [activeTab, setActiveTab] = useState<'hero' | 'news' | 'gallery' | 'achievements' | 'media'>('hero');

  // Lists
  const [heroes, setHeroes] = useState<CMSHero[]>(initialHeroes);
  const [newsList, setNewsList] = useState<CMSNews[]>(initialNews);
  const [albums, setAlbums] = useState<CMSAlbum[]>(initialAlbums);
  const [achievements, setAchievements] = useState<CMSAchievement[]>(initialAchievements);
  const [mediaList, setMediaList] = useState<CMSMedia[]>(initialMedia);

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  /* ------------------------------------------------------------------------- */
  /* TAB 1: HERO STATE                                                        */
  /* ------------------------------------------------------------------------- */
  const activeHero = heroes.find((h) => h.status === 'published') || null;
  const [heroForm, setHeroForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    focalPointX: '50%',
    focalPointY: '50%',
  });

  const handleSaveHero = async (status: PublishStatus = 'draft') => {
    if (!heroForm.imageUrl.trim()) {
      showFeedback('error', 'Silakan masukkan URL foto hero (dapat disalin dari tab Media Library di atas).');
      return;
    }
    setIsSubmitting(true);
    const res = await saveHeroAction({
      title: heroForm.title,
      subtitle: heroForm.subtitle,
      imageUrl: heroForm.imageUrl,
      focalPointX: heroForm.focalPointX,
      focalPointY: heroForm.focalPointY,
      status,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      showFeedback('success', status === 'published' ? 'Foto hero berhasil dipublikasikan ke Landing Page!' : 'Draft hero berhasil disimpan.');
      if (status === 'published') {
        setHeroes((prev) =>
          prev.map((h) => ({ ...h, status: h.id === res.data.id ? 'published' : 'draft' }))
        );
        if (!heroes.some((h) => h.id === res.data.id)) {
          setHeroes((prev) => [res.data as unknown as CMSHero, ...prev]);
        }
      } else {
        setHeroes((prev) => [res.data as unknown as CMSHero, ...prev]);
      }
      setHeroForm({ title: '', subtitle: '', imageUrl: '', focalPointX: '50%', focalPointY: '50%' });
    } else {
      showFeedback('error', res.error || 'Gagal menyimpan foto hero.');
    }
  };

  const handlePublishHero = async (id: string) => {
    setIsSubmitting(true);
    const res = await publishHeroAction(id);
    setIsSubmitting(false);
    if (res.success) {
      showFeedback('success', 'Foto hero berhasil diaktifkan di Landing Page!');
      setHeroes((prev) =>
        prev.map((h) => ({ ...h, status: h.id === id ? 'published' : 'draft' }))
      );
    } else {
      showFeedback('error', res.error || 'Gagal mengaktifkan hero.');
    }
  };

  /* ------------------------------------------------------------------------- */
  /* TAB 2: NEWS STATE                                                        */
  /* ------------------------------------------------------------------------- */
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    type: 'article' as CMSContentType,
    title: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    category: 'Akademik',
    isFeatured: false,
    status: 'published' as PublishStatus,
  });

  const handleSaveNews = async () => {
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      showFeedback('error', 'Judul dan isi warta wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    const res = await saveNewsAction({
      id: editingNewsId || undefined,
      ...newsForm,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      showFeedback('success', editingNewsId ? 'Warta berhasil diperbarui!' : 'Warta baru berhasil dipublikasikan!');
      if (editingNewsId) {
        setNewsList((prev) => prev.map((n) => (n.id === editingNewsId ? (res.data as unknown as CMSNews) : n)));
        setEditingNewsId(null);
      } else {
        setNewsList((prev) => [res.data as unknown as CMSNews, ...prev]);
      }
      setNewsForm({
        type: 'article',
        title: '',
        excerpt: '',
        content: '',
        coverImageUrl: '',
        category: 'Akademik',
        isFeatured: false,
        status: 'published',
      });
    } else {
      showFeedback('error', res.error || 'Gagal menyimpan warta.');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Hapus warta ini secara permanen?')) return;
    const res = await deleteNewsAction(id);
    if (res.success) {
      showFeedback('success', 'Warta berhasil dihapus.');
      setNewsList((prev) => prev.filter((n) => n.id !== id));
    } else {
      showFeedback('error', res.error || 'Gagal menghapus warta.');
    }
  };

  /* ------------------------------------------------------------------------- */
  /* TAB 3: GALLERY & ALBUM STATE                                             */
  /* ------------------------------------------------------------------------- */
  const [selectedAlbumForPhotos, setSelectedAlbumForPhotos] = useState<string | null>(null);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    coverImageUrl: '',
    isFeatured: false,
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  const handleCreateAlbum = async () => {
    if (!albumForm.title.trim()) {
      showFeedback('error', 'Nama album kegiatan wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    const res = await saveAlbumAction({
      ...albumForm,
      status: 'published',
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      showFeedback('success', 'Album kegiatan berhasil dibuat!');
      setAlbums((prev) => [{ ...(res.data as unknown as CMSAlbum), photos: [] }, ...prev]);
      setAlbumForm({ title: '', description: '', eventDate: '', coverImageUrl: '', isFeatured: false });
    } else {
      showFeedback('error', res.error || 'Gagal membuat album.');
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Hapus album dan seluruh foto di dalamnya?')) return;
    const res = await deleteAlbumAction(id);
    if (res.success) {
      showFeedback('success', 'Album berhasil dihapus.');
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      if (selectedAlbumForPhotos === id) setSelectedAlbumForPhotos(null);
    }
  };

  const handleAddPhotoToAlbum = async () => {
    if (!selectedAlbumForPhotos || !newPhotoUrl.trim()) {
      showFeedback('error', 'Pilih album dan masukkan link foto.');
      return;
    }
    setIsSubmitting(true);
    const res = await addPhotoToAlbumAction({
      albumId: selectedAlbumForPhotos,
      imageUrl: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || undefined,
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      showFeedback('success', 'Foto berhasil ditambahkan ke album!');
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === selectedAlbumForPhotos ? { ...a, photos: [...(a.photos || []), res.data as any] } : a
        )
      );
      setNewPhotoUrl('');
      setNewPhotoCaption('');
    } else {
      showFeedback('error', res.error || 'Gagal menambahkan foto ke album.');
    }
  };

  const handleDeletePhoto = async (photoId: string, albumId: string) => {
    if (!confirm('Hapus foto ini dari album?')) return;
    const res = await deletePhotoAction(photoId);
    if (res.success) {
      showFeedback('success', 'Foto berhasil dihapus.');
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === albumId ? { ...a, photos: (a.photos || []).filter((p) => p.id !== photoId) } : a
        )
      );
    }
  };

  /* ------------------------------------------------------------------------- */
  /* TAB 4: ACHIEVEMENTS STATE                                                */
  /* ------------------------------------------------------------------------- */
  const [achieveForm, setAchieveForm] = useState({
    title: '',
    recipient: '',
    competition: '',
    rank: 'Juara 1',
    category: 'Akademik',
    level: 'Nasional',
    eventDate: '',
    description: '',
    imageUrl: '',
    isFeatured: false,
  });

  const handleSaveAchievement = async () => {
    if (!achieveForm.title.trim() || !achieveForm.recipient.trim() || !achieveForm.competition.trim()) {
      showFeedback('error', 'Judul, penerima, dan kompetisi wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    const res = await saveAchievementAction({
      ...achieveForm,
      status: 'published',
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      showFeedback('success', 'Data prestasi berhasil ditambahkan!');
      setAchievements((prev) => [res.data as unknown as CMSAchievement, ...prev]);
      setAchieveForm({
        title: '',
        recipient: '',
        competition: '',
        rank: 'Juara 1',
        category: 'Akademik',
        level: 'Nasional',
        eventDate: '',
        description: '',
        imageUrl: '',
        isFeatured: false,
      });
    } else {
      showFeedback('error', res.error || 'Gagal menyimpan prestasi.');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Hapus data prestasi ini?')) return;
    const res = await deleteAchievementAction(id);
    if (res.success) {
      showFeedback('success', 'Prestasi berhasil dihapus.');
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  /* ------------------------------------------------------------------------- */
  /* TAB 5: MEDIA UPLOAD STATE                                                */
  /* ------------------------------------------------------------------------- */
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaAlt, setMediaAlt] = useState('');

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      showFeedback('error', 'Silakan pilih berkas gambar terlebih dahulu.');
      return;
    }
    const formData = new FormData();
    formData.append('file', mediaFile);
    formData.append('altText', mediaAlt);

    setIsSubmitting(true);
    const res = await uploadMediaAction(formData);
    setIsSubmitting(false);

    if (res.success && res.data) {
      showFeedback('success', 'Gambar berhasil diunggah ke Media Library!');
      setMediaList((prev) => [res.data, ...prev]);
      setMediaFile(null);
      setMediaAlt('');
    } else {
      showFeedback('error', res.error || 'Gagal mengunggah gambar.');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-teal-deep border border-emerald-200'
              : 'bg-danger-surface text-danger-text border border-danger-border'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-deep" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-danger-text" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Sleek Segmented Studio Tabs */}
      <div className="flex items-center bg-surface border border-border/80 p-1 rounded-card overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'hero'
              ? 'bg-teal-deep text-white shadow-2xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-soft/60'
          }`}
        >
          Hero Manager
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'news'
              ? 'bg-teal-deep text-white shadow-2xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-soft/60'
          }`}
        >
          Warta & Berita ({newsList.length})
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'bg-teal-deep text-white shadow-2xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-soft/60'
          }`}
        >
          Galeri & Album ({albums.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'achievements'
              ? 'bg-teal-deep text-white shadow-2xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-soft/60'
          }`}
        >
          Prestasi Angkatan ({achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'media'
              ? 'bg-teal-deep text-white shadow-2xs'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-soft/60'
          }`}
        >
          Media Library ({mediaList.length})
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: HERO MANAGER                                                 */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Hero Preview & Gallery History */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-text-primary">
                    Foto Hero Aktif
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Tampilan visual paling pertama yang dilihat publik pada landing page.
                  </p>
                </div>
                <Badge variant={activeHero ? 'success' : 'neutral'} size="sm">
                  {activeHero ? 'Aktif (Published)' : 'Fallback Otomatis'}
                </Badge>
              </div>

              {activeHero ? (
                <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden border border-border bg-surface-soft">
                  <Image
                    src={activeHero.imageUrl}
                    alt={activeHero.title || 'Foto Hero'}
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: `${activeHero.focalPointX || '50%'} ${activeHero.focalPointY || '50%'}`,
                    }}
                  />
                  <div className="absolute bottom-2 left-2 right-2 p-2.5 bg-black/75 backdrop-blur-xs rounded-md text-white text-xs flex items-center justify-between">
                    <div>
                      <p className="font-heading font-bold text-xs">{activeHero.title || 'Foto Utama Angkatan'}</p>
                      <p className="text-[10px] text-white/70 font-mono">
                        Focal Point: X: {activeHero.focalPointX}, Y: {activeHero.focalPointY}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-lg bg-surface-soft border border-dashed border-border text-center text-xs text-text-muted">
                  Belum ada foto hero kustom yang diaktifkan. Landing page menggunakan fallback editorial bawaan.
                </div>
              )}
            </div>

            {/* Riwayat Foto Hero */}
            <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <h3 className="font-heading font-extrabold text-base text-text-primary">
                  Riwayat Foto Hero ({heroes.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {heroes.map((h) => (
                  <div
                    key={h.id}
                    className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors ${
                      h.status === 'published' ? 'border-teal-deep bg-emerald-50/30' : 'border-border bg-surface-soft/40'
                    }`}
                  >
                    <div className="relative aspect-[16/9] rounded overflow-hidden bg-black/5">
                      <Image
                        src={h.imageUrl}
                        alt={h.title || 'Hero'}
                        fill
                        className="object-cover"
                        style={{ objectPosition: `${h.focalPointX || '50%'} ${h.focalPointY || '50%'}` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="font-semibold text-text-primary truncate">{h.title || 'Foto Hero'}</span>
                      <span className="text-[10px] font-mono font-bold uppercase text-text-muted">{h.status}</span>
                    </div>
                    {h.status !== 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishHero(h.id)}
                        disabled={isSubmitting}
                        className="text-xs font-semibold mt-1 w-full justify-center"
                      >
                        Aktifkan Foto Ini
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Hero Form */}
          <div className="lg:col-span-5">
            <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4 sticky top-20">
              <div className="pb-3 border-b border-border/60">
                <h3 className="font-heading font-extrabold text-base text-text-primary">
                  Atur Foto Hero Baru
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Salin tautan dari tab Media Library lalu atur titik fokus gambar.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Input
                  label="URL Foto Hero (Wajib)"
                  placeholder="https://... atau tempel dari Media Library"
                  value={heroForm.imageUrl}
                  onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                />

                <Input
                  label="Judul Foto / Keterangan"
                  placeholder="Contoh: Malam Keakraban Novarion 62"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                />

                <Input
                  label="Sub-keterangan"
                  placeholder="Contoh: Gedung Rektorat IPB Dramaga"
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted block mb-1">
                      Focal Point X: {heroForm.focalPointX}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(heroForm.focalPointX)}
                      onChange={(e) => setHeroForm({ ...heroForm, focalPointX: `${e.target.value}%` })}
                      className="w-full accent-[#176C5B] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted block mb-1">
                      Focal Point Y: {heroForm.focalPointY}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(heroForm.focalPointY)}
                      onChange={(e) => setHeroForm({ ...heroForm, focalPointY: `${e.target.value}%` })}
                      className="w-full accent-[#176C5B] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Instant Live Preview */}
                {heroForm.imageUrl && (
                  <div className="mt-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block mb-1">
                      Pratinjau Komposisi:
                    </span>
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border bg-black/10">
                      <Image
                        src={heroForm.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        style={{ objectPosition: `${heroForm.focalPointX} ${heroForm.focalPointY}` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-border/60 mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveHero('published')}
                    disabled={isSubmitting}
                    className="flex-1 font-bold text-xs justify-center"
                  >
                    Publikasikan Langsung
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveHero('draft')}
                    disabled={isSubmitting}
                    className="text-xs font-semibold"
                  >
                    Simpan Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: NEWS MANAGER                                                 */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* News List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Daftar Warta & Kegiatan ({newsList.length})
              </h3>
              {editingNewsId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNewsId(null);
                    setNewsForm({
                      type: 'article',
                      title: '',
                      excerpt: '',
                      content: '',
                      coverImageUrl: '',
                      category: 'Akademik',
                      isFeatured: false,
                      status: 'published',
                    });
                  }}
                  className="text-xs font-semibold text-teal-deep hover:underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {newsList.length === 0 ? (
              <div className="p-8 rounded-card bg-surface border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada warta yang dibuat. Gunakan formulir di samping untuk menulis warta pertama.
              </div>
            ) : (
              <div className="rounded-card bg-surface border border-border/80 divide-y divide-border/60 overflow-hidden shadow-2xs">
                {newsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.coverImageUrl && (
                        <div className="relative w-16 h-12 rounded overflow-hidden border border-border shrink-0 bg-surface-soft">
                          <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" size="sm">{item.category}</Badge>
                          <span className="text-[10px] text-text-muted uppercase font-mono">
                            {item.type === 'update' ? 'Update' : 'Artikel'}
                          </span>
                          {item.isFeatured && (
                            <span className="text-[10px] font-bold text-[#B54708] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <h4 className="font-heading font-bold text-sm text-text-primary mt-1 truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingNewsId(item.id);
                          setNewsForm({
                            type: item.type,
                            title: item.title,
                            excerpt: item.excerpt || '',
                            content: item.content,
                            coverImageUrl: item.coverImageUrl || '',
                            category: item.category,
                            isFeatured: item.isFeatured,
                            status: item.status,
                          });
                        }}
                        className="text-xs font-semibold py-1 px-2.5"
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1.5 rounded text-danger-text hover:bg-danger-surface transition-colors"
                        title="Hapus warta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create / Edit News Form */}
          <div className="lg:col-span-5">
            <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4 sticky top-20">
              <div className="pb-3 border-b border-border/60">
                <h3 className="font-heading font-extrabold text-base text-text-primary">
                  {editingNewsId ? 'Edit Warta Angkatan' : 'Tulis Warta Baru'}
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Format Konten
                    </label>
                    <select
                      value={newsForm.type}
                      onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value as CMSContentType })}
                      className="w-full text-xs p-2 rounded-input border border-border/80 bg-surface text-text-primary font-medium focus:border-teal-deep focus:outline-none"
                    >
                      <option value="article">Artikel Lengkap</option>
                      <option value="update">Update Singkat</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Kategori
                    </label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      className="w-full text-xs p-2 rounded-input border border-border/80 bg-surface text-text-primary font-medium focus:border-teal-deep focus:outline-none"
                    >
                      <option value="Akademik">Akademik</option>
                      <option value="Kegiatan">Kegiatan</option>
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Opini & Sains">Opini & Sains</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Judul Warta (Wajib)"
                  placeholder="Contoh: Welcoming Party Statistika 62"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                />

                <Input
                  label="Cover Image URL (Opsional)"
                  placeholder="URL gambar (dari Media Library)"
                  value={newsForm.coverImageUrl}
                  onChange={(e) => setNewsForm({ ...newsForm, coverImageUrl: e.target.value })}
                />

                <Input
                  label="Ringkasan Singkat (Excerpt)"
                  placeholder="1-2 kalimat pengantar ringkas"
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    Isi Konten (Wajib)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tuliskan berita lengkap atau rincian kegiatan..."
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-input border border-border/80 bg-surface text-text-primary font-medium leading-relaxed focus:border-teal-deep focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsForm.isFeatured}
                      onChange={(e) => setNewsForm({ ...newsForm, isFeatured: e.target.checked })}
                      className="accent-[#176C5B]"
                    />
                    <span>Jadikan Warta Pilihan (Featured)</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/60 mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveNews}
                    disabled={isSubmitting}
                    className="w-full font-bold text-xs justify-center"
                  >
                    {editingNewsId ? 'Perbarui Warta' : 'Publikasikan Warta'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: GALLERY & ALBUM MANAGER                                      */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Album Kegiatan & Galeri Momen ({albums.length})
              </h3>
            </div>

            {albums.length === 0 ? (
              <div className="p-8 rounded-card bg-surface border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada album kegiatan. Buat album baru menggunakan formulir di samping.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="p-5 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-extrabold text-base text-text-primary">
                            {album.title}
                          </h4>
                          {album.isFeatured && (
                            <span className="text-[10px] font-bold text-[#B54708] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        {album.eventDate && (
                          <p className="text-xs font-mono text-text-muted mt-0.5">
                            Tanggal: {album.eventDate}
                          </p>
                        )}
                        {album.description && (
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {album.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAlbumForPhotos(album.id)}
                          className="text-xs font-semibold gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Foto</span>
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="p-1.5 text-danger-text hover:bg-danger-surface rounded transition-colors"
                          title="Hapus album"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Photos in Album */}
                    <div className="pt-2 border-t border-border/60">
                      <span className="text-xs font-mono uppercase tracking-wider text-text-muted block mb-2">
                        Foto dalam Album ({(album.photos || []).length}):
                      </span>
                      {(album.photos || []).length === 0 ? (
                        <p className="text-xs text-text-muted italic">
                          Belum ada foto dalam album ini.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {(album.photos || []).map((p) => (
                            <div
                              key={p.id}
                              className="relative aspect-square rounded overflow-hidden border border-border group bg-black/5"
                            >
                              <Image src={p.imageUrl} alt={p.caption || 'Foto'} fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(p.id, album.id)}
                                className="absolute top-1 right-1 p-1 rounded bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Hapus foto"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Album & Photo Forms */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4">
              <h3 className="font-heading font-extrabold text-base text-text-primary pb-2 border-b border-border/60">
                Buat Album Baru
              </h3>
              <div className="flex flex-col gap-3">
                <Input
                  label="Nama Album (Wajib)"
                  placeholder="Contoh: Makrab & Outing Angkatan 62"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                />
                <Input
                  type="date"
                  label="Tanggal Kegiatan"
                  value={albumForm.eventDate}
                  onChange={(e) => setAlbumForm({ ...albumForm, eventDate: e.target.value })}
                />
                <Input
                  label="Deskripsi Ringkas"
                  placeholder="Keterangan singkat momen ini..."
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                />
                <Input
                  label="Cover Image URL (Opsional)"
                  placeholder="URL cover (dari Media Library)"
                  value={albumForm.coverImageUrl}
                  onChange={(e) => setAlbumForm({ ...albumForm, coverImageUrl: e.target.value })}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateAlbum}
                  disabled={isSubmitting}
                  className="font-bold text-xs mt-2 justify-center"
                >
                  Buat Album
                </Button>
              </div>
            </div>

            {selectedAlbumForPhotos && (
              <div className="p-5 sm:p-6 rounded-card bg-surface border border-teal-deep/50 shadow-2xs flex flex-col gap-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <h3 className="font-heading font-bold text-sm text-teal-deep">
                    Tambah Foto ke Album
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumForPhotos(null)}
                    className="text-xs font-semibold text-text-muted hover:underline"
                  >
                    Tutup
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <Input
                    label="URL Foto (Wajib)"
                    placeholder="Tempel link dari Media Library"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                  />
                  <Input
                    label="Caption Foto"
                    placeholder="Contoh: Sesi foto bersama di rektorat"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddPhotoToAlbum}
                    disabled={isSubmitting}
                    className="font-bold text-xs justify-center"
                  >
                    Simpan Foto ke Album
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 4: ACHIEVEMENT MANAGER                                          */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Daftar Prestasi Mahasiswa ({achievements.length})
              </h3>
            </div>

            {achievements.length === 0 ? (
              <div className="p-8 rounded-card bg-surface border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada data prestasi. Tambahkan melalui formulir di samping.
              </div>
            ) : (
              <div className="rounded-card bg-surface border border-border/80 divide-y divide-border/60 overflow-hidden shadow-2xs">
                {achievements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#B54708] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                          {item.rank}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-deep px-2 py-0.5 rounded bg-surface-soft border border-border">
                          {item.level}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-sm text-text-primary mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.competition} • Oleh: <span className="font-semibold">{item.recipient}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAchievement(item.id)}
                      className="p-1.5 text-danger-text hover:bg-danger-surface rounded transition-colors"
                      title="Hapus prestasi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-5">
            <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4 sticky top-20">
              <h3 className="font-heading font-extrabold text-base text-text-primary pb-2 border-b border-border/60">
                Catat Prestasi Mahasiswa
              </h3>

              <div className="flex flex-col gap-3">
                <Input
                  label="Judul Karya / Prestasi (Wajib)"
                  placeholder="Contoh: Juara 1 Data Mining Competition"
                  value={achieveForm.title}
                  onChange={(e) => setAchieveForm({ ...achieveForm, title: e.target.value })}
                />

                <Input
                  label="Penerima / Tim (Wajib)"
                  placeholder="Contoh: Tim Alpha (Ahmad, Budi, Siti)"
                  value={achieveForm.recipient}
                  onChange={(e) => setAchieveForm({ ...achieveForm, recipient: e.target.value })}
                />

                <Input
                  label="Nama Kompetisi / Penyelenggara"
                  placeholder="Contoh: Statistika Ria IPB 2026"
                  value={achieveForm.competition}
                  onChange={(e) => setAchieveForm({ ...achieveForm, competition: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Peringkat"
                    placeholder="Juara 1 / Medali Emas"
                    value={achieveForm.rank}
                    onChange={(e) => setAchieveForm({ ...achieveForm, rank: e.target.value })}
                  />
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Tingkat
                    </label>
                    <select
                      value={achieveForm.level}
                      onChange={(e) => setAchieveForm({ ...achieveForm, level: e.target.value })}
                      className="w-full text-xs p-2 rounded-input border border-border/80 bg-surface text-text-primary font-medium focus:border-teal-deep focus:outline-none"
                    >
                      <option value="Internasional">Internasional</option>
                      <option value="Nasional">Nasional</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Universitas">Universitas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Kategori Bidang
                  </label>
                  <select
                    value={achieveForm.category}
                    onChange={(e) => setAchieveForm({ ...achieveForm, category: e.target.value })}
                    className="w-full text-xs p-2 rounded-input border border-border/80 bg-surface text-text-primary font-medium focus:border-teal-deep focus:outline-none"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Kepenulisan">Kepenulisan / Essay</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Seni">Seni & Kreatif</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAchievement}
                  disabled={isSubmitting}
                  className="font-bold text-xs mt-2 justify-center"
                >
                  Simpan Prestasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 5: MEDIA LIBRARY                                                */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'media' && (
        <div className="flex flex-col gap-6">
          {/* Upload Box */}
          <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-3">
            <h3 className="font-heading font-extrabold text-base text-text-primary">
              Unggah Media Baru ke Repositori
            </h3>
            <form onSubmit={handleUploadMedia} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-deep file:text-white hover:file:opacity-90 cursor-pointer"
              />
              <Input
                placeholder="Alt text / deskripsi foto"
                value={mediaAlt}
                onChange={(e) => setMediaAlt(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmitting || !mediaFile}
                className="shrink-0 font-bold text-xs"
              >
                Unggah Berkas
              </Button>
            </form>
          </div>

          {/* Media Grid */}
          <div className="p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs flex flex-col gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Berkas Media Tersimpan ({mediaList.length})
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Salin tautan gambar untuk disematkan pada warta, album galeri, atau hero banner.
              </p>
            </div>

            {mediaList.length === 0 ? (
              <div className="p-8 rounded-lg bg-surface-soft border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada media terunggah. Unggah gambar pertama Anda di atas.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-lg border border-border/80 bg-surface flex flex-col gap-2 group shadow-2xs hover:border-teal-deep/40 transition-colors"
                  >
                    <div className="relative aspect-square rounded overflow-hidden bg-black/5 border border-border/50">
                      <Image src={m.fileUrl} alt={m.altText || m.fileName} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-[11px] font-medium text-text-primary truncate" title={m.fileName}>
                        {m.fileName}
                      </p>
                      <p className="text-[10px] font-mono text-text-muted">
                        {(m.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(m.fileUrl)}
                      className="text-[11px] font-semibold py-1 px-2 justify-center w-full"
                    >
                      {copiedUrl === m.fileUrl ? (
                        <span className="flex items-center gap-1 text-teal-deep font-bold">
                          <Check className="w-3 h-3" />
                          <span>Tersalin!</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" />
                          <span>Salin URL</span>
                        </span>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
