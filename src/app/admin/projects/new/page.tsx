'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  MoveLeft,
  MoveRight,
  Star,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMainDragOver, setIsMainDragOver] = useState(false);
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  const [newHighlight, setNewHighlight] = useState('');
  const [formValues, setFormValues] = useState({
    title: '',
    category: 'residential',
    location: '',
    year: '2026',
    image: '',
    imageAlt: '',
    scope: 'Architecture & Interior Design',
    area: '',
    description: '',
    highlights: [] as string[],
    gallery: [] as string[],
    galleryAlts: [] as string[],
    status: 'published',
    featured: true,
  });

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      year: String(new Date().getFullYear()),
    }));
  }, []);

  // Upload helper using /api/upload
  async function uploadFiles(files: FileList | File[]): Promise<string[]> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.webp') && file.type !== 'image/webp') {
        throw new Error(`"${file.name}" is not a WebP image. Only .webp files below 2MB are supported.`);
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error(`"${file.name}" exceeds the 2MB limit. Maximum allowed size is 2MB.`);
      }
      formData.append('files', file);
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload images');
    }

    const json = await res.json();
    return json.data?.urls || [];
  }

  // Handle Cover Image Upload
  async function handleMainImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingMain(true);
    setErrorMsg(null);

    try {
      const urls = await uploadFiles([files[0]]);
      if (urls.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          image: urls[0],
          imageAlt: prev.imageAlt || `${prev.title || 'Architectural project'} exterior architecture view by Attiks`,
        }));
      }
    } catch (err: any) {
      console.error('Main image upload error:', err);
      setErrorMsg(err.message || 'Error uploading cover image');
    } finally {
      setUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = '';
    }
  }

  // Handle Gallery Multi-Image Upload
  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    setUploadProgress(20);
    setErrorMsg(null);

    try {
      const interval = setInterval(() => {
        setUploadProgress((p) => (p < 90 ? p + 15 : p));
      }, 100);

      const urls = await uploadFiles(files);
      clearInterval(interval);
      setUploadProgress(100);

      setFormValues((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...urls],
      }));
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      setErrorMsg(err.message || 'Error uploading gallery images');
    } finally {
      setTimeout(() => {
        setUploadingGallery(false);
        setUploadProgress(0);
      }, 300);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  }

  function handleRemoveGalleryItem(index: number) {
    setFormValues((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }

  function handleSetAsCover(url: string) {
    setFormValues((prev) => ({ ...prev, image: url }));
  }

  function handleMoveGalleryItem(index: number, direction: 'left' | 'right') {
    setFormValues((prev) => {
      const list = [...prev.gallery];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const [moved] = list.splice(index, 1);
      list.splice(targetIndex, 0, moved);
      return { ...prev, gallery: list };
    });
  }

  function handleAddHighlight(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const val = newHighlight.trim();
    if (!val) return;
    setFormValues((prev) => ({
      ...prev,
      highlights: [...prev.highlights, val],
    }));
    setNewHighlight('');
  }

  function handleUpdateHighlight(index: number, val: string) {
    setFormValues((prev) => {
      const updated = [...prev.highlights];
      updated[index] = val;
      return { ...prev, highlights: updated };
    });
  }

  function handleRemoveHighlight(index: number) {
    setFormValues((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!formValues.image) {
      setErrorMsg('Please upload or select a main cover image for the project.');
      return;
    }

    if (!formValues.imageAlt?.trim()) {
      setErrorMsg('Mandatory: Please provide a descriptive Cover Image Alt Text for SEO and accessibility.');
      return;
    }

    setSubmitting(true);

    try {
      const slug =
        formValues.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `proj-${Date.now()}`;

      const highlightsArray = formValues.highlights
        .map((h) => (typeof h === 'string' ? h.trim() : ''))
        .filter((h) => h.length > 0);

      const payload = {
        title: formValues.title,
        slug,
        category: formValues.category,
        location: formValues.location,
        year: formValues.year,
        image: formValues.image,
        imageAlt: formValues.imageAlt.trim(),
        description: formValues.description,
        highlights: highlightsArray,
        gallery: formValues.gallery,
        galleryAlts: formValues.galleryAlts || [],
        scope: formValues.scope,
        area: formValues.area,
        status: formValues.status.toUpperCase(),
        featured: formValues.featured,
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to create project in database');
      }

      const created = await res.json();
      const newProject = created.data || { id: slug, ...payload };

      // Also save to localStorage for client fallback consistency
      const saved = localStorage.getItem('attiks_admin_projects');
      const existing = saved ? JSON.parse(saved) : [];
      const updated = [
        newProject,
        ...existing.filter((p: any) => p.id !== newProject.id && p.slug !== newProject.slug),
      ];
      localStorage.setItem('attiks_admin_projects', JSON.stringify(updated));

      router.push('/admin/projects');
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setErrorMsg(err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={mainFileInputRef}
        onChange={(e) => handleMainImageUpload(e.target.files)}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={galleryFileInputRef}
        onChange={(e) => handleGalleryUpload(e.target.files)}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/projects"
            style={{
              fontSize: '0.78rem',
              color: 'var(--admin-text-muted)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: 8,
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={14} /> Back to Projects Directory
          </Link>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Add New Project</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: 3,
                background: 'rgba(212,175,55,0.12)',
                color: 'var(--admin-gold)',
                border: '1px solid rgba(212,175,55,0.3)',
                textTransform: 'uppercase',
              }}
            >
              PostgreSQL Sync
            </span>
          </h1>
          <p className="admin-page-subtitle">Publish a new architectural masterpiece with high-resolution visual assets</p>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 4,
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hidden File Inputs */}
        <input
          ref={mainFileInputRef}
          type="file"
          accept="image/webp"
          style={{ display: 'none' }}
          onChange={(e) => handleMainImageUpload(e.target.files)}
        />
        <input
          ref={galleryFileInputRef}
          type="file"
          accept="image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleGalleryUpload(e.target.files)}
        />

        {/* SECTION 1: MAIN DETAILS */}
        <div className="admin-table-wrap" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <Layers size={16} style={{ color: 'var(--admin-gold)' }} />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
              General Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="admin-field" style={{ gridColumn: 'span 2' }}>
              <label className="admin-label">Project Title *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Soori Residence"
                value={formValues.title}
                onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Category *</label>
              <select
                className="admin-select"
                value={formValues.category}
                onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="hospitality">Hospitality</option>
                <option value="institutional">Institutional</option>
                <option value="interior">Interior</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label">Location</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Coimbatore, Tamil Nadu"
                value={formValues.location}
                onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Completion Year</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. 2026"
                value={formValues.year}
                onChange={(e) => setFormValues({ ...formValues, year: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Built Area</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. 7,800 sq.ft"
                value={formValues.area}
                onChange={(e) => setFormValues({ ...formValues, area: e.target.value })}
              />
            </div>

            <div className="admin-field" style={{ gridColumn: 'span 2' }}>
              <label className="admin-label">Project Scope</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Masterplanning, Architecture & Interior Design"
                value={formValues.scope}
                onChange={(e) => setFormValues({ ...formValues, scope: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: HIGH-SPEED IMAGE UPLOADER */}
        <div className="admin-table-wrap" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: 'var(--admin-gold)' }} />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                Visual Media & Assets
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              Instant Multi-Threaded Uploads
            </span>
          </div>

          {/* 1. Main Cover Image Dropzone */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="admin-label" style={{ marginBottom: 8, display: 'block' }}>
              Main Cover Image *
            </label>

            {formValues.image ? (
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  background: 'var(--admin-surface-2)',
                  border: '1px solid var(--admin-border)',
                  padding: '1rem',
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    width: 140,
                    height: 90,
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0a0a0a',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={formValues.image}
                    alt={formValues.imageAlt || `${formValues.title || 'Project'} cover preview`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      background: 'rgba(0,0,0,0.7)',
                      padding: '2px 6px',
                      borderRadius: 2,
                      fontSize: '0.65rem',
                      color: 'var(--admin-gold)',
                      border: '1px solid var(--admin-gold)',
                    }}
                  >
                    Primary Cover
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--admin-text)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      marginBottom: 4,
                    }}
                  >
                    {formValues.image}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    Shown on Home Showcase, Portfolio Cards & Hero Banner
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={() => mainFileInputRef.current?.click()}
                    disabled={uploadingMain}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    <Upload size={13} />
                    Change Image
                  </button>
                  <button
                    type="button"
                    className="admin-btn-icon danger"
                    onClick={() => setFormValues({ ...formValues, image: '' })}
                    title="Remove Cover Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsMainDragOver(true);
                }}
                onDragLeave={() => setIsMainDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsMainDragOver(false);
                  handleMainImageUpload(e.dataTransfer.files);
                }}
                onClick={() => mainFileInputRef.current?.click()}
                style={{
                  border: isMainDragOver
                    ? '2px dashed var(--admin-gold)'
                    : '1px dashed var(--admin-border)',
                  background: isMainDragOver ? 'rgba(212,175,55,0.06)' : 'var(--admin-surface-2)',
                  borderRadius: 4,
                  padding: '2.25rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: 'var(--admin-gold)',
                  }}
                >
                  <Upload size={20} />
                </div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--admin-text)', marginBottom: 4 }}>
                  {uploadingMain ? 'Uploading Cover Image...' : 'Click to Browse or Drag & Drop Cover Image'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Supports high-res JPG, PNG, WEBP (Landscape 16:9 Recommended)
                </span>
              </div>
            )}

            {/* Cover Image Alt Text (Required for SEO & Screen Readers) */}
            <div style={{ marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="admin-label" style={{ fontSize: '0.8rem', color: 'var(--admin-text)' }}>
                  Cover Image Alt Text <span style={{ color: '#ef4444' }}>* (Required for SEO)</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                  {formValues.imageAlt?.length || 0}/120 characters
                </span>
              </div>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Modern tropical villa facade in Coimbatore with monolithic proportions"
                value={formValues.imageAlt}
                onChange={(e) => setFormValues({ ...formValues, imageAlt: e.target.value })}
                required
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>
                Accurately describe what is depicted in the cover image for search indexers and screen readers.
              </p>
            </div>
          </div>

          {/* 2. Multi-Image Gallery Dropzone */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="admin-label" style={{ margin: 0 }}>
                Project Gallery ({formValues.gallery.length} Images)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {formValues.gallery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormValues({ ...formValues, gallery: [] })}
                    className="admin-btn admin-btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', color: '#ef4444' }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  style={{ padding: '4px 12px', fontSize: '0.75rem', color: 'var(--admin-gold)' }}
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={uploadingGallery}
                >
                  <Plus size={13} />
                  {uploadingGallery ? `Uploading... ${uploadProgress}%` : 'Add Gallery Images'}
                </button>
              </div>
            </div>

            {/* Gallery Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsGalleryDragOver(true);
              }}
              onDragLeave={() => setIsGalleryDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsGalleryDragOver(false);
                handleGalleryUpload(e.dataTransfer.files);
              }}
              onClick={() => galleryFileInputRef.current?.click()}
              style={{
                border: isGalleryDragOver
                  ? '2px dashed var(--admin-gold)'
                  : '1px dashed var(--admin-border)',
                background: isGalleryDragOver ? 'rgba(212,175,55,0.06)' : 'var(--admin-surface-2)',
                borderRadius: 4,
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: formValues.gallery.length > 0 ? '1.25rem' : 0,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                  color: 'var(--admin-gold)',
                }}
              >
                <ImageIcon size={18} />
              </div>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text)', marginBottom: 2 }}>
                {uploadingGallery
                  ? `Fast Uploading Gallery Images (${uploadProgress}%)...`
                  : 'Drag & Drop Multiple Gallery Photos or Click to Select'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                Select 10, 20 or more images simultaneously with instant parallel upload
              </span>

              {uploadingGallery && (
                <div
                  style={{
                    width: '60%',
                    height: 4,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    margin: '12px auto 0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'var(--admin-gold)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Visual Gallery Grid */}
            {formValues.gallery.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.85rem',
                  marginTop: '1rem',
                }}
              >
                {formValues.gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      height: 110,
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid var(--admin-border)',
                      background: '#0a0a0a',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Order Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 5,
                        left: 5,
                        background: 'rgba(0,0,0,0.8)',
                        color: 'var(--admin-text-muted)',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      #{idx + 1}
                    </div>

                    {/* Overlay Actions */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '6px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(idx)}
                          style={{
                            background: 'rgba(239,68,68,0.85)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 3,
                            width: 22,
                            height: 22,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Delete photo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button
                            type="button"
                            onClick={() => handleMoveGalleryItem(idx, 'left')}
                            disabled={idx === 0}
                            style={{
                              background: 'rgba(0,0,0,0.7)',
                              color: idx === 0 ? '#555' : '#fff',
                              border: 'none',
                              borderRadius: 2,
                              width: 20,
                              height: 20,
                              cursor: idx === 0 ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Move left"
                          >
                            <MoveLeft size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveGalleryItem(idx, 'right')}
                            disabled={idx === formValues.gallery.length - 1}
                            style={{
                              background: 'rgba(0,0,0,0.7)',
                              color: idx === formValues.gallery.length - 1 ? '#555' : '#fff',
                              border: 'none',
                              borderRadius: 2,
                              width: 20,
                              height: 20,
                              cursor: idx === formValues.gallery.length - 1 ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Move right"
                          >
                            <MoveRight size={11} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSetAsCover(imgUrl)}
                          style={{
                            background: formValues.image === imgUrl ? 'var(--admin-gold)' : 'rgba(0,0,0,0.8)',
                            color: formValues.image === imgUrl ? '#000' : 'var(--admin-gold)',
                            border: 'none',
                            borderRadius: 2,
                            padding: '2px 5px',
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                          title="Set as Main Cover Photo"
                        >
                          <Star size={10} /> Cover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: EDITORIAL CONTENT & HIGHLIGHTS */}
        <div className="admin-table-wrap" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div className="admin-field" style={{ marginBottom: '1.5rem' }}>
            <label className="admin-label">Detailed Project Narrative</label>
            <textarea
              className="admin-textarea"
              placeholder="Describe architectural concept, contextual dialogue, spatial flow, climate adaptation, and structural materiality..."
              rows={5}
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            />
          </div>

          {/* Key Highlights & Innovations */}
          <div className="admin-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div>
                <label className="admin-label" style={{ marginBottom: 2 }}>Key Highlights & Innovations</label>
                <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', margin: 0 }}>
                  Add points highlighting distinctive architectural features, materials, or structural innovations
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'var(--admin-surface-2)', padding: '2px 8px', borderRadius: 4, color: 'var(--admin-text-muted)', border: '1px solid var(--admin-border)' }}>
                {formValues.highlights.length} {formValues.highlights.length === 1 ? 'Point' : 'Points'}
              </span>
            </div>

            {/* List of points */}
            {formValues.highlights.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
                {formValues.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: 'var(--admin-surface-2)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: 4,
                      padding: '0.35rem 0.6rem 0.35rem 0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-text-muted)', minWidth: 20 }}>
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      className="admin-input"
                      value={item}
                      onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                      placeholder="e.g. Passive Cooling Central Courtyards"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        padding: '0.35rem 0.25rem',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      title="Remove highlight"
                      className="admin-btn-icon"
                      style={{
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--admin-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 3,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--admin-text-muted)')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input + Plus Button to Add New Point */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                background: 'var(--admin-surface)',
                border: '1px dashed var(--admin-border-focus, #3b82f6)',
                borderRadius: 4,
                padding: '0.35rem 0.5rem 0.35rem 0.75rem',
              }}
            >
              <Plus size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
                placeholder="Type a key highlight & press Enter or click Add..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: 'inherit',
                  padding: '0.4rem 0.25rem',
                }}
              />
              <button
                type="button"
                onClick={() => handleAddHighlight()}
                disabled={!newHighlight.trim()}
                className="btn-admin-secondary"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: newHighlight.trim() ? 'pointer' : 'default',
                  opacity: newHighlight.trim() ? 1 : 0.5,
                  borderRadius: 3,
                }}
              >
                <Plus size={14} />
                <span>Add Point</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: PUBLISHING CONTROLS & SUBMIT */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.75rem',
            background: 'var(--admin-surface-2)',
            border: '1px solid var(--admin-border)',
            borderRadius: 4,
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={formValues.featured}
                onChange={(e) => setFormValues({ ...formValues, featured: e.target.checked })}
                style={{ accentColor: 'var(--admin-gold)', width: 16, height: 16 }}
              />
              <span style={{ fontWeight: 500 }}>Hero Spotlight (Feature in Homepage Showcase)</span>
            </label>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formValues.status === 'published'}
                  onChange={() => setFormValues({ ...formValues, status: 'published' })}
                />
                <span style={{ color: 'var(--admin-success)' }}>Published</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formValues.status === 'draft'}
                  onChange={() => setFormValues({ ...formValues, status: 'draft' })}
                />
                <span style={{ color: 'var(--admin-text-muted)' }}>Draft</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/admin/projects" className="admin-btn admin-btn-ghost">
              Cancel
            </Link>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting || uploadingMain || uploadingGallery}
              style={{ minWidth: 150 }}
            >
              <Save size={14} />
              {submitting ? 'Publishing to DB...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
