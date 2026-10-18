'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { 
  Image as ImageIcon, 
  Newspaper, 
  Layers, 
  Trophy, 
  FolderPlus, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Eye,
  Calendar,
  Tag,
  UploadCloud,
  Check
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
      showFeedback('error', 'Silakan masukkan URL foto hero (dapat disalin dari Media Library).');
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
      showFeedback('success', status === 'published' ? 'Foto hero berhasil dipublikasikan ke novarion.web.id!' : 'Draft hero tersimpan.');
      setHeroes((prev) => [res.data as unknown as CMSHero, ...prev.filter((h) => h.id !== (res.data as any).id)]);
      setHeroForm({ title: '', subtitle: '', imageUrl: '', focalPointX: '50%', focalPointY: '50%' });
    } else {
      showFeedback('error', res.error || 'Gagal menyimpan foto hero.');
    }
  };

  const handlePublishHero = async (id: string) => {
    setIsSubmitting(true);
    const res = await publishHeroAction(id);
    setIsSubmitting(false);
    if (res.success && res.data) {
      showFeedback('success', 'Foto hero berhasil diaktifkan!');
      setHeroes((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, status: 'published' as PublishStatus } : h.status === 'published' ? { ...h, status: 'archived' as PublishStatus } : h
        )
      );
    } else {
      showFeedback('error', res.error || 'Gagal mengaktifkan hero.');
    }
  };

  /* ------------------------------------------------------------------------- */
  /* TAB 2: NEWS STATE                                                        */
  /* ------------------------------------------------------------------------- */
  const [newsForm, setNewsForm] = useState<{
    id?: string;
    type: CMSContentType;
    title: string;
    excerpt: string;
    content: string;
    coverImageUrl: string;
    category: string;
    isFeatured: boolean;
    status: PublishStatus;
  }>({
    type: 'article',
    title: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    category: 'Akademik',
    isFeatured: false,
    status: 'published',
  });
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const handleSaveNews = async () => {
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      showFeedback('error', 'Judul dan konten warta wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    const res = await saveNewsAction({
      id: editingNewsId || undefined,
      ...newsForm,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      showFeedback('success', editingNewsId ? 'Warta berhasil diperbarui!' : 'Warta baru berhasil disimpan!');
      if (editingNewsId) {
        setNewsList((prev) => prev.map((n) => (n.id === editingNewsId ? (res.data as unknown as CMSNews) : n)));
      } else {
        setNewsList((prev) => [res.data as unknown as CMSNews, ...prev]);
      }
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
    } else {
      showFeedback('error', res.error || 'Gagal menyimpan warta.');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus warta ini? Tindakan tidak dapat dibatalkan.')) return;
    setIsSubmitting(true);
    const res = await deleteNewsAction(id);
    setIsSubmitting(false);
    if (res.success) {
      showFeedback('success', 'Warta berhasil dihapus.');
      setNewsList((prev) => prev.filter((n) => n.id !== id));
    } else {
      showFeedback('error', res.error || 'Gagal menghapus warta.');
    }
  };

  /* ------------------------------------------------------------------------- */
  /* TAB 3: GALLERY STATE                                                     */
  /* ------------------------------------------------------------------------- */
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    eventDate: '',
    isFeatured: false,
  });
  const [selectedAlbumForPhotos, setSelectedAlbumForPhotos] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  const handleCreateAlbum = async () => {
    if (!albumForm.title.trim()) {
      showFeedback('error', 'Nama album kegiatan wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    const res = await saveAlbumAction({
      title: albumForm.title,
      description: albumForm.description,
      coverImageUrl: albumForm.coverImageUrl,
      eventDate: albumForm.eventDate || undefined,
      isFeatured: albumForm.isFeatured,
      status: 'published',
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      showFeedback('success', 'Album baru berhasil dibuat!');
      setAlbums((prev) => [res.data as unknown as CMSAlbum, ...prev]);
      setAlbumForm({ title: '', description: '', coverImageUrl: '', eventDate: '', isFeatured: false });
    } else {
      showFeedback('error', res.error || 'Gagal membuat album.');
    }
  };

  const handleAddPhotoToAlbum = async () => {
    if (!selectedAlbumForPhotos || !newPhotoUrl.trim()) {
      showFeedback('error', 'Pilih album dan masukkan URL foto.');
      return;
    }
    setIsSubmitting(true);
    const res = await addPhotoToAlbumAction({
      albumId: selectedAlbumForPhotos,
      imageUrl: newPhotoUrl,
      caption: newPhotoCaption,
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      showFeedback('success', 'Foto berhasil ditambahkan ke album!');
      setAlbums((prev) =>
        prev.map((alb) =>
          alb.id === selectedAlbumForPhotos
            ? { ...alb, photos: [...(alb.photos || []), res.data as any] }
            : alb
        )
      );
      setNewPhotoUrl('');
      setNewPhotoCaption('');
    } else {
      showFeedback('error', res.error || 'Gagal menambahkan foto.');
    }
  };

  const handleDeletePhoto = async (photoId: string, albumId: string) => {
    const res = await deletePhotoAction(photoId);
    if (res.success) {
      showFeedback('success', 'Foto dihapus dari album.');
      setAlbums((prev) =>
        prev.map((alb) =>
          alb.id === albumId
            ? { ...alb, photos: (alb.photos || []).filter((p) => p.id !== photoId) }
            : alb
        )
      );
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Hapus album beserta seluruh foto di dalamnya?')) return;
    const res = await deleteAlbumAction(albumId);
    if (res.success) {
      showFeedback('success', 'Album berhasil dihapus.');
      setAlbums((prev) => prev.filter((a) => a.id !== albumId));
      if (selectedAlbumForPhotos === albumId) setSelectedAlbumForPhotos(null);
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
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-[#C9FBD4]/60 text-teal-deep border border-[#41C2A1]/40'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hero'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Manager</span>
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'news'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Warta & Berita ({newsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Galeri & Album ({albums.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'achievements'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Prestasi Angkatan ({achievements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'media'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Media Library ({mediaList.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: HERO MANAGER                                                 */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Hero Preview & Controls */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Foto Hero Aktif di Landing Page
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C9FBD4]/60 text-teal-deep border border-[#41C2A1]/30">
                  {activeHero ? 'Aktif (Published)' : 'Belum Ada (Mode Fallback)'}
                </span>
              </div>

              {activeHero ? (
                <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden border border-border bg-surface-soft">
                  <Image
                    src={activeHero.imageUrl}
                    alt={activeHero.title || 'Foto Hero'}
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: `${activeHero.focalPointX || '50%'} ${activeHero.focalPointY || '50%'}`,
                    }}
                  />
                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs">
                    <p className="font-semibold">{activeHero.title || 'Foto Utama Angkatan'}</p>
                    <p className="text-[10px] text-white/70">
                      Focal Point: X: {activeHero.focalPointX}, Y: {activeHero.focalPointY}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-surface-soft border border-dashed border-border text-center text-xs text-text-muted">
                  Belum ada foto hero aktif. Menggunakan placeholder editorial netral.
                </div>
              )}
            </div>

            {/* Past / Archived Heroes */}
            <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4">
              <h3 className="font-heading font-bold text-base text-text-primary">
                Riwayat Foto Hero ({heroes.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {heroes.map((h) => (
                  <div
                    key={h.id}
                    className={`p-3 rounded-xl border flex flex-col gap-2 ${
                      h.status === 'published' ? 'border-teal-deep bg-[#41C2A1]/5' : 'border-border bg-surface-soft'
                    }`}
                  >
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-black/5">
                      <Image
                        src={h.imageUrl}
                        alt={h.title || 'Hero'}
                        fill
                        className="object-cover"
                        style={{ objectPosition: `${h.focalPointX || '50%'} ${h.focalPointY || '50%'}` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="font-semibold text-text-primary truncate">{h.title || 'Foto'}</span>
                      <span className="text-[10px] font-bold uppercase text-text-muted">{h.status}</span>
                    </div>
                    {h.status !== 'published' && (
                      <Button
                        variant="secondary"
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
            <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-5 sticky top-20">
              <h3 className="font-heading font-bold text-base text-text-primary">
                Unggah / Atur Foto Hero Baru
              </h3>
              <p className="text-xs text-text-muted">
                Masukkan URL gambar (dapat disalin dari tab Media Library di atas).
              </p>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    URL Foto Hero (Wajib)
                  </label>
                  <Input
                    placeholder="https://... atau paste dari Media Library"
                    value={heroForm.imageUrl}
                    onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Judul Foto / Keterangan
                  </label>
                  <Input
                    placeholder="Contoh: Malam Keakraban Novarion 62"
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Sub-keterangan
                  </label>
                  <Input
                    placeholder="Contoh: Gedung Rektorat IPB Dramaga"
                    value={heroForm.subtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Focal Point X: {heroForm.focalPointX}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(heroForm.focalPointX)}
                      onChange={(e) => setHeroForm({ ...heroForm, focalPointX: `${e.target.value}%` })}
                      className="w-full accent-[#41C2A1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Focal Point Y: {heroForm.focalPointY}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(heroForm.focalPointY)}
                      onChange={(e) => setHeroForm({ ...heroForm, focalPointY: `${e.target.value}%` })}
                      className="w-full accent-[#41C2A1]"
                    />
                  </div>
                </div>

                {/* Instant Live Preview */}
                {heroForm.imageUrl && (
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold text-text-muted block mb-1">
                      Preview Komposisi:
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

                <div className="flex gap-2 pt-3 border-t border-border mt-2">
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
                    variant="secondary"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* News List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-base text-text-primary">
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
                  className="text-xs text-text-muted hover:underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {newsList.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada warta yang dibuat. Gunakan formulir di samping untuk menulis warta pertama.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {newsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      {item.coverImageUrl && (
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-surface-soft">
                          <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-deep px-2 py-0.5 rounded bg-surface-soft border border-border">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-text-muted uppercase font-semibold">
                            {item.type === 'update' ? 'Update Singkat' : 'Artikel'}
                          </span>
                          {item.isFeatured && (
                            <span className="text-[10px] font-bold text-[#B54708] bg-[#FFAE5D]/15 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <h4 className="font-heading font-bold text-sm text-text-primary mt-1 line-clamp-1">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
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
                        className="text-xs font-semibold py-1.5 px-3"
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
            <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4 sticky top-20">
              <h3 className="font-heading font-bold text-base text-text-primary">
                {editingNewsId ? 'Edit Warta Angkatan' : 'Tulis Warta / Artikel Baru'}
              </h3>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Format Konten
                    </label>
                    <select
                      value={newsForm.type}
                      onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value as CMSContentType })}
                      className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary font-medium"
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
                      className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary font-medium"
                    >
                      <option value="Akademik">Akademik</option>
                      <option value="Kegiatan">Kegiatan</option>
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Opini & Sains">Opini & Sains</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Judul Warta (Wajib)
                  </label>
                  <Input
                    placeholder="Contoh: Welcoming Party Statistika 62"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Cover Image URL (Opsional)
                  </label>
                  <Input
                    placeholder="URL gambar (dari Media Library)"
                    value={newsForm.coverImageUrl}
                    onChange={(e) => setNewsForm({ ...newsForm, coverImageUrl: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Ringkasan Singkat (Excerpt)
                  </label>
                  <Input
                    placeholder="1-2 kalimat pengantar ringkas"
                    value={newsForm.excerpt}
                    onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Isi Konten (Wajib)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tuliskan berita lengkap atau rincian kegiatan..."
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-text-primary font-medium leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsForm.isFeatured}
                      onChange={(e) => setNewsForm({ ...newsForm, isFeatured: e.target.checked })}
                      className="accent-[#41C2A1]"
                    />
                    <span>Jadikan Warta Pilihan (Featured)</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border mt-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Albums & Photos List */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Album Kegiatan & Galeri Momen ({albums.length})
            </h3>

            {albums.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada album kegiatan. Buat album baru menggunakan formulir di samping.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="p-5 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-black text-lg text-text-primary">
                            {album.title}
                          </h4>
                          {album.isFeatured && (
                            <span className="text-[10px] font-bold text-[#B54708] bg-[#FFAE5D]/15 px-2 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        {album.eventDate && (
                          <p className="text-xs text-text-muted mt-0.5">
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
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedAlbumForPhotos(album.id)}
                          className="text-xs font-semibold"
                        >
                          + Tambah Foto
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus album"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Photos in Album */}
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-text-muted block mb-2">
                        Foto dalam Album ({(album.photos || []).length}):
                      </span>
                      {(album.photos || []).length === 0 ? (
                        <p className="text-xs text-text-muted/70 italic">
                          Belum ada foto dalam album ini.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {(album.photos || []).map((p) => (
                            <div
                              key={p.id}
                              className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                            >
                              <Image src={p.imageUrl} alt={p.caption || 'Foto'} fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(p.id, album.id)}
                                className="absolute top-1 right-1 p-1 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
            {/* Create Album */}
            <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4">
              <h3 className="font-heading font-bold text-base text-text-primary">
                Buat Album Kegiatan Baru
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Nama Album (Wajib)
                  </label>
                  <Input
                    placeholder="Contoh: Makrab & Outing Angkatan 62"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Tanggal Kegiatan
                  </label>
                  <Input
                    type="date"
                    value={albumForm.eventDate}
                    onChange={(e) => setAlbumForm({ ...albumForm, eventDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Deskripsi Ringkas
                  </label>
                  <Input
                    placeholder="Keterangan singkat momen ini..."
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Cover Image URL (Opsional)
                  </label>
                  <Input
                    placeholder="URL cover (dari Media Library)"
                    value={albumForm.coverImageUrl}
                    onChange={(e) => setAlbumForm({ ...albumForm, coverImageUrl: e.target.value })}
                  />
                </div>
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

            {/* Add Photo to Selected Album */}
            {selectedAlbumForPhotos && (
              <div className="p-6 rounded-card bg-surface border border-teal-deep/50 shadow-xs flex flex-col gap-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-teal-deep">
                    Tambah Foto ke Album
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumForPhotos(null)}
                    className="text-xs text-text-muted hover:underline"
                  >
                    Tutup
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      URL Foto (Wajib)
                    </label>
                    <Input
                      placeholder="Paste link dari Media Library"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Caption / Keterangan Foto
                    </label>
                    <Input
                      placeholder="Contoh: Sesi foto bersama di lapangan rektorat"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                    />
                  </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Daftar Prestasi Mahasiswa ({achievements.length})
            </h3>

            {achievements.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada data prestasi. Tambahkan melalui formulir di samping.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {achievements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#B54708] bg-[#FFAE5D]/15 px-2 py-0.5 rounded">
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
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus prestasi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Achievement Form */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4 sticky top-20">
              <h3 className="font-heading font-bold text-base text-text-primary">
                Catat Prestasi Mahasiswa Baru
              </h3>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Judul Karya / Prestasi (Wajib)
                  </label>
                  <Input
                    placeholder="Contoh: Juara 1 Data Mining Competition"
                    value={achieveForm.title}
                    onChange={(e) => setAchieveForm({ ...achieveForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Penerima / Tim (Wajib)
                  </label>
                  <Input
                    placeholder="Contoh: Tim Alpha (Ahmad, Budi, Siti)"
                    value={achieveForm.recipient}
                    onChange={(e) => setAchieveForm({ ...achieveForm, recipient: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Nama Kompetisi / Penyelenggara
                  </label>
                  <Input
                    placeholder="Contoh: Statistika Ria IPB 2026"
                    value={achieveForm.competition}
                    onChange={(e) => setAchieveForm({ ...achieveForm, competition: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Capaian / Peringkat
                    </label>
                    <Input
                      placeholder="Juara 1 / Medali Emas"
                      value={achieveForm.rank}
                      onChange={(e) => setAchieveForm({ ...achieveForm, rank: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1">
                      Tingkat
                    </label>
                    <select
                      value={achieveForm.level}
                      onChange={(e) => setAchieveForm({ ...achieveForm, level: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary font-medium"
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
                    className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary font-medium"
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
          <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Unggah Media Baru ke Repositori
            </h3>
            <form onSubmit={handleUploadMedia} className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-deep file:text-white hover:file:opacity-90"
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
          <div className="p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col gap-4">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Berkas Media Tersimpan ({mediaList.length})
            </h3>
            <p className="text-xs text-text-muted">
              Klik &ldquo;Salin URL&rdquo; untuk menempelkan link gambar ini ke Hero Manager, Warta, Galeri, atau Prestasi.
            </p>

            {mediaList.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface-soft border border-dashed border-border text-center text-xs text-text-muted">
                Belum ada media terunggah. Unggah gambar pertama Anda di atas.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-xl border border-border bg-surface-soft flex flex-col gap-2 group shadow-2xs"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black/5 border border-border/50">
                      <Image src={m.fileUrl} alt={m.altText || m.fileName} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] font-semibold text-text-primary truncate" title={m.fileName}>
                        {m.fileName}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {(m.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(m.fileUrl)}
                      className="text-[11px] font-semibold py-1 px-2 justify-center w-full"
                    >
                      {copiedUrl === m.fileUrl ? (
                        <span className="flex items-center gap-1 text-teal-deep">
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
