'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Settings,
  UploadCloud,
  Film,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Sliders,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { HeroSlide, HeroSettings } from '@/data/hero';
import {
  getAllHeroSlidesAdminAction,
  createHeroSlideAction,
  updateHeroSlideAction,
  deleteHeroSlideAction,
  toggleHeroSlideActiveAction,
  reorderHeroSlidesAction,
  updateHeroSettingsAction,
} from '@/actions/hero.actions';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const DEFAULT_PRESET_VIDEOS = [
  { label: 'Architectural Monolith Scene 1', src: '/3735-173719892_medium.mp4' },
  { label: 'Spatial Light Pavilion Scene 2', src: '/3967-175963622_medium.mp4' },
  { label: 'Vernacular Craft Scene 3', src: '/85348-590746467_medium.mp4' },
  { label: 'Biophilic Form Scene 4', src: '/16199324_3840_2160_30fps.mp4' },
];

export default function HeroAdminPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [settings, setSettings] = useState<HeroSettings>({
    autoPlayInterval: 6500,
    showPagination: true,
    showCta: true,
    defaultCtaText: 'view projects',
    defaultCtaLink: '/projects',
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    mediaType: 'video' as 'video' | 'image',
    mediaUrl: '',
    posterUrl: '',
    altText: '',
    title: '',
    subtitle: '',
    ctaText: 'view projects',
    ctaLink: '/projects',
    active: true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview cycle state
  const [previewIndex, setPreviewIndex] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadHeroData = async () => {
    setLoading(true);
    try {
      const data = await getAllHeroSlidesAdminAction();
      setSlides(data.slides || []);
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch {
      showToast('Failed to load hero data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeroData();
  }, []);

  // Lock body & html scroll when modal or dialog is open
  useEffect(() => {
    const isModalOpen = slideModalOpen || settingsModalOpen || previewModalOpen || !!deleteTarget;
    if (isModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [slideModalOpen, settingsModalOpen, previewModalOpen, deleteTarget]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      mediaType: 'video',
      mediaUrl: '',
      posterUrl: '',
      altText: '',
      title: '',
      subtitle: '',
      ctaText: settings.defaultCtaText || 'view projects',
      ctaLink: settings.defaultCtaLink || '/projects',
      active: true,
    });
    setSlideModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      mediaType: slide.mediaType || 'video',
      mediaUrl: slide.mediaUrl || '',
      posterUrl: slide.posterUrl || '',
      altText: slide.altText || slide.title || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      ctaText: slide.ctaText || settings.defaultCtaText || 'view projects',
      ctaLink: slide.ctaLink || settings.defaultCtaLink || '/projects',
      active: slide.active !== false,
    });
    setSlideModalOpen(true);
  };

  // Upload Video or Image File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = /\.(mp4|webm)$/i.test(file.name) || file.type?.startsWith('video/');
    if (!isVideo && !file.name.toLowerCase().endsWith('.webp') && file.type !== 'image/webp') {
      showToast('Only .webp image files (or .mp4/.webm videos) below 2MB are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (!isVideo && file.size > 2 * 1024 * 1024) {
      showToast('Image file size exceeds 2MB limit. Please upload an image under 2MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        const url = json.data.url;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setFormData((prev) => ({
          ...prev,
          mediaUrl: url,
          mediaType: isVideo ? 'video' : 'image',
          title: prev.title || cleanName,
          altText: prev.altText || `${cleanName} architectural scene by Attiks`,
        }));
        showToast('Media uploaded successfully!');
      } else {
        showToast('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      showToast('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Save Slide with Alt Text Validation
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mediaUrl.trim()) {
      showToast('Please upload or enter a Media URL');
      return;
    }

    const isVideo = formData.mediaType === 'video' || /\.(mp4|webm|mov|mkv)$/i.test(formData.mediaUrl);
    if (!isVideo && !formData.altText?.trim()) {
      showToast('Mandatory: Please provide meaningful image Alt Text for SEO and accessibility');
      return;
    }

    setSaving(true);
    try {
      if (editingSlide) {
        const res = await updateHeroSlideAction(editingSlide.id, formData);
        if (res.success && res.data) {
          setSlides((prev) =>
            prev.map((s) => (s.id === editingSlide.id ? (res.data as HeroSlide) : s))
          );
          setSlideModalOpen(false);
          showToast('Slide updated successfully');
        } else {
          showToast('Failed to update: ' + res.error);
        }
      } else {
        const res = await createHeroSlideAction(formData);
        if (res.success && res.data) {
          setSlides((prev) => [...prev, res.data as HeroSlide]);
          setSlideModalOpen(false);
          showToast('New slide created');
        } else {
          showToast('Failed to create: ' + res.error);
        }
      }
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active/Draft
  const handleToggleActive = async (slide: HeroSlide) => {
    const newStatus = !slide.active;
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, active: newStatus } : s))
    );

    try {
      await toggleHeroSlideActiveAction(slide.id);
      showToast(newStatus ? 'Slide activated' : 'Slide moved to draft');
    } catch {
      loadHeroData();
    }
  };

  // Move Slide Order Up / Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...slides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update order values locally
    const updated = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(updated);

    try {
      await reorderHeroSlidesAction(updated.map((s) => s.id));
      showToast('Order updated');
    } catch {
      loadHeroData();
    }
  };

  // Delete Slide
  const handleDeleteSlide = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setSlides((prev) => prev.filter((s) => s.id !== targetId));
    setDeleteTarget(null);

    try {
      const res = await deleteHeroSlideAction(targetId);
      if (res.success) {
        showToast('Slide deleted');
      } else {
        loadHeroData();
      }
    } catch {
      loadHeroData();
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateHeroSettingsAction(settings);
      if (res.success) {
        setSettingsModalOpen(false);
        showToast('Hero settings saved successfully');
      } else {
        showToast('Failed to save settings: ' + res.error);
      }
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeSlides = slides.filter((s) => s.active !== false);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#09090b',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontSize: '0.86rem',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid #27272a',
          }}
        >
          <Sparkles size={16} style={{ color: '#e4e4e7' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input (Supports WebP, GIF, Images & Videos) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,image/webp,image/gif,image/jpeg,image/png,image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 600, margin: 0, color: 'var(--admin-text)' }}>
              Homepage Hero Showcase
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                background: '#ecfdf5',
                color: '#059669',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid #a7f3d0',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Dynamic CRUD
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: 4 }}>
            Manage full-screen architectural video scenes, images, CTA links, and playback duration for the homepage hero.
          </span>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadHeroData}
            className="admin-btn admin-btn-ghost"
            title="Refresh"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewIndex(0);
              setPreviewModalOpen(true);
            }}
            className="admin-btn admin-btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            <Maximize2 size={14} />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="admin-btn admin-btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            <Sliders size={14} />
            <span>Hero Settings</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="admin-btn admin-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}
          >
            <Plus size={15} />
            <span>Add Hero Slide</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="admin-table-wrap" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Total Hero Slides
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--admin-text)', marginTop: 4 }}>
            {slides.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            {activeSlides.length} active in homepage rotation
          </span>
        </div>

        <div className="admin-table-wrap" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Cycle Duration
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--admin-text)', marginTop: 4 }}>
            {(settings.autoPlayInterval / 1000).toFixed(1)}s
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            Auto-advances between videos
          </span>
        </div>

        <div className="admin-table-wrap" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Default CTA
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--admin-text)', marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            &ldquo;{settings.defaultCtaText}&rdquo;
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            Links to: {settings.defaultCtaLink}
          </span>
        </div>

        <div className="admin-table-wrap" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Pagination Pill
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: settings.showPagination ? '#059669' : '#71717a', marginTop: 8 }}>
            {settings.showPagination ? 'Enabled' : 'Hidden'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            Vertical side indicator pill
          </span>
        </div>
      </div>

      {/* Main Slides List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-table-wrap" style={{ padding: '1.5rem', height: 260 }}>
              <div className="admin-skeleton" style={{ height: 140, width: '100%', marginBottom: 12 }} />
              <div className="admin-skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
              <div className="admin-skeleton" style={{ height: 16, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="admin-table-wrap" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Film size={36} style={{ color: 'var(--admin-text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--admin-text)' }}>
            No Hero Slides Added
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', margin: '0 0 18px', maxWidth: 460, marginInline: 'auto' }}>
            Add architectural videos or imagery to showcase on the homepage hero section.
          </p>
          <button onClick={handleOpenAdd} className="admin-btn admin-btn-primary">
            + Add First Hero Slide
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {slides.map((slide, index) => {
            const isPlaying = playingVideoId === slide.id;
            const isVideo = slide.mediaType === 'video' || /\.(mp4|webm|mov|mkv)$/i.test(slide.mediaUrl);

            return (
              <div
                key={slide.id}
                className="admin-table-wrap"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: slide.active === false ? '1px dashed #cbd5e1' : '1px solid var(--admin-border)',
                  opacity: slide.active === false ? 0.72 : 1,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Media Container (16:9) */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    background: '#09090b',
                    overflow: 'hidden',
                  }}
                >
                  {isVideo ? (
                    <video
                      src={slide.mediaUrl}
                      poster={slide.posterUrl}
                      autoPlay={isPlaying}
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Image
                      src={slide.mediaUrl}
                      alt={slide.title || 'Hero slide image'}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  )}

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: 'rgba(0,0,0,0.75)',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: 4,
                        backdropFilter: 'blur(4px)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      #{index + 1}
                    </span>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        background: isVideo ? 'rgba(30, 58, 138, 0.85)' : 'rgba(88, 28, 135, 0.85)',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: 4,
                        backdropFilter: 'blur(4px)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {isVideo ? <Film size={11} /> : <ImageIcon size={11} />}
                      {isVideo ? 'VIDEO' : 'IMAGE'}
                    </span>
                  </div>

                  {/* Status Badge Top Right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: slide.active !== false ? 'rgba(5, 150, 105, 0.9)' : 'rgba(217, 119, 6, 0.9)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {slide.active !== false ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                      {slide.active !== false ? 'ACTIVE' : 'DRAFT'}
                    </span>
                  </div>

                  {/* Play / Pause Video Overlay for Videos */}
                  {isVideo && (
                    <button
                      type="button"
                      onClick={() => setPlayingVideoId(isPlaying ? null : slide.id)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: isPlaying ? 'transparent' : 'rgba(0,0,0,0.3)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#ffffff',
                        transition: 'background 0.2s ease',
                      }}
                      title={isPlaying ? 'Pause preview' : 'Play video preview'}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.65)',
                          backdropFilter: 'blur(6px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
                      </div>
                    </button>
                  )}
                </div>

                {/* Content Details */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--admin-text)' }}>
                      {slide.title || `Hero Slide ${index + 1}`}
                    </h3>

                    {slide.subtitle && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', margin: '0 0 10px' }}>
                        {slide.subtitle}
                      </p>
                    )}

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#71717a',
                        background: '#f4f4f5',
                        padding: '6px 10px',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 8,
                        wordBreak: 'break-all',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>CTA: &ldquo;{slide.ctaText || settings.defaultCtaText}&rdquo;</span>
                      <span style={{ color: '#09090b', fontWeight: 600 }}>{slide.ctaLink || settings.defaultCtaLink}</span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: slide.altText ? '#16a34a' : '#ea580c', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600 }}>Alt:</span> {slide.altText ? `"${slide.altText}"` : '⚠️ Missing Alt Text'}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Src: {slide.mediaUrl}
                    </div>
                  </div>

                  {/* Card Actions Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--admin-border)',
                      paddingTop: '0.85rem',
                      marginTop: '1rem',
                    }}
                  >
                    {/* Order Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="admin-btn-icon"
                        title="Move Up"
                        style={{ opacity: index === 0 ? 0.35 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === slides.length - 1}
                        className="admin-btn-icon"
                        title="Move Down"
                        style={{ opacity: index === slides.length - 1 ? 0.35 : 1, cursor: index === slides.length - 1 ? 'not-allowed' : 'pointer' }}
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    {/* Edit, Visibility, Delete Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide)}
                        className="admin-btn-icon"
                        title={slide.active !== false ? 'Deactivate (Draft)' : 'Activate (Publish)'}
                        style={{
                          background: slide.active !== false ? '#fef3c7' : '#dcfce7',
                          color: slide.active !== false ? '#b45309' : '#15803d',
                        }}
                      >
                        {slide.active !== false ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(slide)}
                        className="admin-btn-icon"
                        title="Edit Slide"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(slide)}
                        className="admin-btn-icon danger"
                        title="Delete Slide"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          ADD / EDIT SLIDE MODAL
          ============================================================ */}
      {slideModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            padding: 'clamp(20px, 4vh, 48px) 16px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
          onClick={() => setSlideModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              maxHeight: 'min(90vh, 850px)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              margin: 'auto 0',
              padding: '2rem',
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 10,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              color: '#09090b',
            }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSlideModalOpen(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#f4f4f5',
                border: '1px solid #e4e4e7',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.25rem', color: '#09090b' }}>
              {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
            </h2>

            <form onSubmit={handleSaveSlide} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/webp,video/mp4,video/webm"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              {/* Media Type Selector */}
              <div>
                <label className="admin-label">Media Type</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: 'video' })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: formData.mediaType === 'video' ? '2px solid #09090b' : '1px solid #e4e4e7',
                      background: formData.mediaType === 'video' ? '#09090b' : '#ffffff',
                      color: formData.mediaType === 'video' ? '#ffffff' : '#71717a',
                      fontWeight: 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Film size={15} /> Video (MP4 / WebM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: formData.mediaType === 'image' ? '2px solid #09090b' : '1px solid #e4e4e7',
                      background: formData.mediaType === 'image' ? '#09090b' : '#ffffff',
                      color: formData.mediaType === 'image' ? '#ffffff' : '#71717a',
                      fontWeight: 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <ImageIcon size={15} /> Photo / WebP / GIF
                  </button>
                </div>
              </div>

              {/* Upload or Preset Picker */}
              <div>
                <label className="admin-label">Media Source (File Upload or URL) *</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      background: '#f4f4f5',
                      border: '1px solid #e4e4e7',
                      color: '#09090b',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <UploadCloud size={15} />
                    {uploading ? 'Uploading media...' : 'Upload Video / Image File'}
                  </button>

                  <select
                    className="admin-input"
                    style={{ flex: 1, fontSize: '0.82rem', padding: '7px 10px' }}
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData((prev) => ({
                          ...prev,
                          mediaUrl: e.target.value,
                          mediaType: 'video',
                        }));
                      }
                    }}
                    value=""
                  >
                    <option value="">Or select built-in stock video...</option>
                    {DEFAULT_PRESET_VIDEOS.map((preset) => (
                      <option key={preset.src} value={preset.src}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  className="admin-input"
                  required
                  placeholder="e.g. /3735-173719892_medium.mp4 or /uploads/video_...mp4"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Media Preview Box */}
              {formData.mediaUrl && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: '#09090b',
                    border: '1px solid #e4e4e7',
                  }}
                >
                  {formData.mediaType === 'video' || /\.(mp4|webm|mov|mkv)$/i.test(formData.mediaUrl) ? (
                    <video
                      src={formData.mediaUrl}
                      controls
                      autoPlay
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Image
                      src={formData.mediaUrl}
                      alt="Preview"
                      fill
                      sizes="100vw"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
              )}

              {/* Image Alt Text (Mandatory for SEO & Accessibility on Images/GIFs/WebP) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="admin-label">
                    Image Alt Text {formData.mediaType === 'image' || !/\.(mp4|webm|mov|mkv)$/i.test(formData.mediaUrl) ? <span style={{ color: '#ef4444' }}>* (Required for SEO)</span> : <span style={{ color: '#71717a' }}>(Optional for videos)</span>}
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#71717a' }}>
                    {formData.altText?.length || 0}/120 characters
                  </span>
                </div>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Modern tropical villa facade in Calicut with monolithic concrete walls"
                  value={formData.altText}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  maxLength={160}
                />
                <p style={{ fontSize: '0.72rem', color: '#71717a', margin: '4px 0 0' }}>
                  Describe the actual scene accurately for search engines & screen readers. Avoid keyword stuffing.
                </p>
              </div>

              {/* Title & Subtitle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="admin-label">Scene Title (Optional)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Monolithic Residence"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label className="admin-label">Subtitle / Tag (Optional)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Calicut, Kerala"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* CTA Link & Label */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="admin-label">CTA Text</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. view projects"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label className="admin-label">CTA Link</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. /projects or /projects/soori-residence"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="slideActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="slideActive" style={{ fontSize: '0.84rem', cursor: 'pointer', color: '#09090b', fontWeight: 500 }}>
                  Active in Live Homepage Rotation
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setSlideModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="admin-btn admin-btn-primary"
                  style={{ background: '#09090b', color: '#fff' }}
                >
                  {saving ? 'Saving...' : editingSlide ? 'Update Hero Slide' : 'Save Hero Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          GLOBAL HERO SETTINGS MODAL
          ============================================================ */}
      {settingsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            padding: 'clamp(20px, 4vh, 48px) 16px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
          onClick={() => setSettingsModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: 'min(90vh, 850px)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              margin: 'auto 0',
              padding: '2rem',
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 10,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              color: '#09090b',
            }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSettingsModalOpen(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#f4f4f5',
                border: '1px solid #e4e4e7',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.25rem', color: '#09090b' }}>
              Hero Section Global Settings
            </h2>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* AutoPlay Duration */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="admin-label">Slide Auto-Rotation Interval</label>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#09090b' }}>
                    {(settings.autoPlayInterval / 1000).toFixed(1)} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="15000"
                  step="500"
                  value={settings.autoPlayInterval}
                  onChange={(e) =>
                    setSettings({ ...settings, autoPlayInterval: Number(e.target.value) })
                  }
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.74rem', color: '#71717a' }}>
                  Time spent on each video/image scene before advancing to the next.
                </span>
              </div>

              {/* Default CTA Text & Link */}
              <div>
                <label className="admin-label">Default CTA Text</label>
                <input
                  type="text"
                  className="admin-input"
                  value={settings.defaultCtaText}
                  onChange={(e) => setSettings({ ...settings, defaultCtaText: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label className="admin-label">Default CTA Link Target</label>
                <input
                  type="text"
                  className="admin-input"
                  value={settings.defaultCtaLink}
                  onChange={(e) => setSettings({ ...settings, defaultCtaLink: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Pagination Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="showPagination"
                  checked={settings.showPagination}
                  onChange={(e) =>
                    setSettings({ ...settings, showPagination: e.target.checked })
                  }
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="showPagination" style={{ fontSize: '0.84rem', cursor: 'pointer', color: '#09090b', fontWeight: 500 }}>
                  Show Vertical Pagination Pill on Right Side
                </label>
              </div>

              {/* Show CTA Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="showCta"
                  checked={settings.showCta}
                  onChange={(e) =>
                    setSettings({ ...settings, showCta: e.target.checked })
                  }
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="showCta" style={{ fontSize: '0.84rem', cursor: 'pointer', color: '#09090b', fontWeight: 500 }}>
                  Display Bottom-Left CTA Button (&ldquo;{settings.defaultCtaText}&rdquo;)
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setSettingsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                  style={{ background: '#09090b', color: '#fff' }}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          HOMEPAGE LIVE SIMULATOR / PREVIEW MODAL
          ============================================================ */}
      {previewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Control Bar */}
          <div
            style={{
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(10,10,10,0.8)',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hero Showcase Live Simulator</span>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                Active Scene {previewIndex + 1} of {activeSlides.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.1)',
                }}
              >
                <ExternalLink size={13} /> Open Live Site
              </a>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              padding: 'clamp(20px, 5vw, 64px)',
              overflow: 'hidden',
            }}
          >
            {activeSlides.length > 0 ? (
              <>
                {/* Background Video / Image */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                  {activeSlides[previewIndex]?.mediaType === 'video' ||
                  /\.(mp4|webm|mov|mkv)$/i.test(activeSlides[previewIndex]?.mediaUrl) ? (
                    <video
                      key={activeSlides[previewIndex]?.id + previewIndex}
                      src={activeSlides[previewIndex]?.mediaUrl}
                      autoPlay
                      muted
                      playsInline
                      loop
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Image
                      key={activeSlides[previewIndex]?.id + previewIndex}
                      src={activeSlides[previewIndex]?.mediaUrl}
                      alt="Hero slide preview"
                      fill
                      sizes="100vw"
                      style={{ objectFit: 'cover' }}
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.8) 100%)',
                    }}
                  />
                </div>

                {/* Bottom Left CTA */}
                {settings.showCta && (
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    {activeSlides[previewIndex]?.title && (
                      <div style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 500, marginBottom: 6, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                        {activeSlides[previewIndex].title}
                      </div>
                    )}
                    <a
                      href={activeSlides[previewIndex]?.ctaLink || settings.defaultCtaLink || '/projects'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: 'clamp(20px, 1.55vw, 26px)',
                        fontWeight: 350,
                        textTransform: 'lowercase',
                        textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      <span>{activeSlides[previewIndex]?.ctaText || settings.defaultCtaText || 'view projects'}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <polyline points="14 6 20 12 14 18" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Right Pagination Pill */}
                {settings.showPagination && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '32px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(25, 25, 25, 0.55)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      padding: '12px 6px',
                      borderRadius: '9999px',
                      zIndex: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '9px',
                    }}
                  >
                    {activeSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewIndex(idx)}
                        style={{
                          background: idx === previewIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                          border: 'none',
                          width: '6px',
                          height: idx === previewIndex ? '20px' : '6px',
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.35s ease',
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#fff', margin: 'auto', textAlign: 'center' }}>
                No active slides to preview. Activate at least one slide.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Hero Slide"
          message={`Are you sure you want to delete this hero slide "${deleteTarget.title || deleteTarget.id}"?`}
          onConfirm={handleDeleteSlide}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
