'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  MoveLeft,
  MoveRight,
  Star,
  Layers,
  AlertCircle,
  FileText,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isMainDragOver, setIsMainDragOver] = useState(false);
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  const [formValues, setFormValues] = useState({
    title: '',
    category: 'residential',
    location: '',
    year: String(new Date().getFullYear()),
    image: '',
    imageAlt: '',
    scope: 'Architecture & Interior Design',
    area: '',
    description: '',
    gallery: [] as string[],
    galleryAlts: [] as string[],
    status: 'PUBLISHED',
    featured: true,
    order: 0,
  });

  // Upload helper using /api/upload (with client-side fallback)
  async function uploadFiles(files: FileList | File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 10MB limit.`);
        }
        formData.append('files', file);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.urls) && json.data.urls.length > 0) {
          return json.data.urls;
        }
      }
    } catch {
      // Server upload unavailable/read-only, fallback to client-side data URLs
    }

    const dataUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      dataUrls.push(dataUrl);
    }
    return dataUrls;
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
          imageAlt: prev.imageAlt || `${prev.title || 'Architectural project'} cover view`,
        }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload cover image.');
    } finally {
      setUploadingMain(false);
    }
  }

  // Handle Gallery Images Upload
  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    setErrorMsg(null);

    try {
      const urls = await uploadFiles(files);
      if (urls.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ...urls],
          galleryAlts: [
            ...prev.galleryAlts,
            ...urls.map((_, i) => `${prev.title || 'Project'} visual showcase detail 0${prev.gallery.length + i + 1}`),
          ],
        }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload gallery images.');
    } finally {
      setUploadingGallery(false);
    }
  }

  function handleRemoveGalleryImage(index: number) {
    setFormValues((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
      galleryAlts: prev.galleryAlts.filter((_, i) => i !== index),
    }));
  }

  function handleMoveGalleryImage(index: number, direction: 'left' | 'right') {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formValues.gallery.length) return;

    const newGallery = [...formValues.gallery];
    const item = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = item;

    const newAlts = [...(formValues.galleryAlts || [])];
    const altItem = newAlts[index];
    newAlts[index] = newAlts[targetIdx];
    newAlts[targetIdx] = altItem;

    setFormValues((prev) => ({
      ...prev,
      gallery: newGallery,
      galleryAlts: newAlts,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!formValues.title.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }

    if (!formValues.image) {
      setErrorMsg('Please upload a cover image for the project.');
      return;
    }

    setSubmitting(true);

    try {
      const slug =
        formValues.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `project-${Date.now()}`;

      const payload = {
        title: formValues.title.trim(),
        slug,
        category: formValues.category,
        location: formValues.location.trim() || 'Kerala, India',
        year: formValues.year.trim() || String(new Date().getFullYear()),
        image: formValues.image,
        imageAlt: formValues.imageAlt.trim() || `${formValues.title} architecture`,
        description: formValues.description.trim(),
        gallery: formValues.gallery,
        galleryAlts: formValues.galleryAlts || [],
        scope: formValues.scope.trim(),
        area: formValues.area.trim(),
        status: formValues.status,
        featured: formValues.featured,
        order: Number(formValues.order) || 0,
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

      // Update local storage cache
      try {
        const saved = localStorage.getItem('attiks_admin_projects');
        const existing = saved ? JSON.parse(saved) : [];
        const updated = [newProject, ...existing.filter((p: any) => p.id !== newProject.id && p.slug !== newProject.slug)];
        localStorage.setItem('attiks_admin_projects', JSON.stringify(updated));
      } catch {}

      setSuccessMsg('Project created and published successfully!');
      setTimeout(() => {
        router.push('/admin/projects');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving project.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Top Navigation & Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--admin-border)',
        }}
      >
        <div>
          <Link
            href="/admin/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--admin-text-muted)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              marginBottom: 8,
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={14} /> Back to Projects
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="admin-page-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>
              Create New Project
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '3px 8px',
                borderRadius: '999px',
                background: formValues.status === 'PUBLISHED' ? '#ecfdf5' : '#f4f4f5',
                color: formValues.status === 'PUBLISHED' ? '#059669' : '#71717a',
                border: formValues.status === 'PUBLISHED' ? '1px solid #a7f3d0' : '1px solid #e4e4e7',
                textTransform: 'uppercase',
              }}
            >
              {formValues.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/admin/projects"
            className="btn-admin-secondary"
            style={{ textDecoration: 'none' }}
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-admin-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Save size={15} />
            {submitting ? 'Saving Project...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            color: '#dc2626',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 6,
            color: '#16a34a',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hidden File Inputs */}
        <input
          ref={mainFileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleMainImageUpload(e.target.files)}
        />
        <input
          ref={galleryFileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleGalleryUpload(e.target.files)}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1.15fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN: MAIN CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: Core Project Information */}
            <div
              className="admin-table-wrap"
              style={{
                padding: '24px',
                background: 'var(--admin-surface)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '20px' }}>
                <Layers size={18} style={{ color: 'var(--admin-accent)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Project Overview
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="admin-field">
                  <label className="admin-label" style={{ fontWeight: 500 }}>
                    Project Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Soori Residence"
                    value={formValues.title}
                    onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                    required
                    style={{ fontSize: '1rem', padding: '10px 14px' }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <div className="admin-field">
                    <label className="admin-label" style={{ fontWeight: 500 }}>
                      Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="admin-select"
                      value={formValues.category}
                      onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                      style={{ padding: '9px 12px' }}
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="interior">Interior</option>
                      <option value="institutional">Institutional</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="landscape">Landscape</option>
                      <option value="masterplanning">Masterplanning</option>
                    </select>
                  </div>

                  <div className="admin-field">
                    <label className="admin-label" style={{ fontWeight: 500 }}>
                      Location
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Coimbatore, Tamil Nadu"
                      value={formValues.location}
                      onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                      style={{ padding: '9px 12px' }}
                    />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label" style={{ fontWeight: 500 }}>
                      Completion Year
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. 2026"
                      value={formValues.year}
                      onChange={(e) => setFormValues({ ...formValues, year: e.target.value })}
                      style={{ padding: '9px 12px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Architectural Story / Description */}
            <div
              className="admin-table-wrap"
              style={{
                padding: '24px',
                background: 'var(--admin-surface)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} style={{ color: 'var(--admin-accent)' }} />
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                    Architectural Story & Narrative
                  </h2>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  Displayed prominently on project page
                </span>
              </div>

              <div className="admin-field">
                <textarea
                  className="admin-input"
                  rows={8}
                  placeholder="Describe the architectural concept, context, climate responsiveness, materiality, and spatial experience..."
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  style={{
                    lineHeight: '1.6',
                    fontSize: '0.95rem',
                    padding: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Card 3: Visual Showcase Gallery */}
            <div
              className="admin-table-wrap"
              style={{
                padding: '24px',
                background: 'var(--admin-surface)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ImageIcon size={18} style={{ color: 'var(--admin-accent)' }} />
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                    Visual Showcase Gallery ({formValues.gallery.length})
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="btn-admin-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.85rem',
                    padding: '6px 12px',
                  }}
                >
                  <Upload size={14} />
                  {uploadingGallery ? 'Uploading...' : 'Upload Gallery Photos'}
                </button>
              </div>

              {/* Gallery Dropzone */}
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
                  border: isGalleryDragOver ? '2px dashed var(--admin-accent)' : '2px dashed var(--admin-border)',
                  borderRadius: '6px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: isGalleryDragOver ? 'var(--admin-surface-2)' : '#fafafa',
                  cursor: 'pointer',
                  marginBottom: formValues.gallery.length > 0 ? '20px' : '0',
                  transition: 'all 0.2s ease',
                }}
              >
                <Upload size={24} style={{ color: 'var(--admin-text-muted)', marginBottom: 8 }} />
                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 500 }}>
                  Drag & drop project showcase photos here, or <span style={{ textDecoration: 'underline' }}>browse files</span>
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Supports WebP, JPG, JPEG, PNG (High resolution up to 10MB each)
                </p>
              </div>

              {/* Gallery Images Grid */}
              {formValues.gallery.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {formValues.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        aspectRatio: '1 / 1',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#111',
                        border: '1px solid var(--admin-border)',
                      }}
                      className="group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery item ${idx + 1}`}
                        fill
                        sizes="160px"
                        style={{ objectFit: 'cover' }}
                      />

                      {/* Number Badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 3,
                        }}
                      >
                        #{idx + 1}
                      </span>

                      {/* Action Bar Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          insetInline: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 6px 4px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 2 }}>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveGalleryImage(idx, 'left');
                              }}
                              title="Move backward"
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: '#fff',
                                padding: '3px',
                                borderRadius: 3,
                                cursor: 'pointer',
                              }}
                            >
                              <MoveLeft size={12} />
                            </button>
                          )}
                          {idx < formValues.gallery.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveGalleryImage(idx, 'right');
                              }}
                              title="Move forward"
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: '#fff',
                                padding: '3px',
                                borderRadius: 3,
                                cursor: 'pointer',
                              }}
                            >
                              <MoveRight size={12} />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveGalleryImage(idx);
                          }}
                          title="Delete image"
                          style={{
                            background: 'rgba(239, 68, 68, 0.8)',
                            border: 'none',
                            color: '#fff',
                            padding: '3px 5px',
                            borderRadius: 3,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR & PUBLISHING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: Publish & Visibility */}
            <div
              className="admin-table-wrap"
              style={{
                padding: '20px',
                background: 'var(--admin-surface)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '16px' }}>
                <Eye size={17} style={{ color: 'var(--admin-accent)' }} />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                  Publish & Visibility
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-field">
                  <label className="admin-label" style={{ fontWeight: 500 }}>
                    Publication Status
                  </label>
                  <select
                    className="admin-select"
                    value={formValues.status}
                    onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
                  >
                    <option value="PUBLISHED">Published (Live on Website)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                  </select>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--admin-surface-2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setFormValues({ ...formValues, featured: !formValues.featured })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star
                      size={16}
                      style={{
                        color: formValues.featured ? '#eab308' : 'var(--admin-text-muted)',
                        fill: formValues.featured ? '#eab308' : 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Featured Project</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formValues.featured}
                    onChange={(e) => setFormValues({ ...formValues, featured: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" style={{ fontWeight: 500 }}>
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="0"
                    value={formValues.order}
                    onChange={(e) => setFormValues({ ...formValues, order: Number(e.target.value) || 0 })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
                    Lower number appears earlier in portfolios
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-admin-primary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 6,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  <Save size={16} />
                  {submitting ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </div>

            {/* Card 2: Cover Photo */}
            <div
              className="admin-table-wrap"
              style={{
                padding: '20px',
                background: 'var(--admin-surface)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ImageIcon size={17} style={{ color: 'var(--admin-accent)' }} />
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                    Main Cover Photo <span style={{ color: '#ef4444' }}>*</span>
                  </h2>
                </div>
              </div>

              {/* Cover Image Preview / Dropzone */}
              {formValues.image ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16 / 10',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#111',
                      border: '1px solid var(--admin-border)',
                    }}
                  >
                    <Image
                      src={formValues.image}
                      alt={formValues.imageAlt || 'Cover image preview'}
                      fill
                      sizes="340px"
                      style={{ objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormValues({ ...formValues, image: '' })}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(239, 68, 68, 0.9)',
                        border: 'none',
                        color: '#fff',
                        padding: '5px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      title="Remove cover image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="admin-field">
                    <label className="admin-label" style={{ fontSize: '0.78rem' }}>
                      Image Alt Text (SEO)
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Modern residential villa facade in Coimbatore"
                      value={formValues.imageAlt}
                      onChange={(e) => setFormValues({ ...formValues, imageAlt: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current?.click()}
                    className="btn-admin-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: '0.82rem',
                    }}
                  >
                    <Upload size={13} /> Change Cover Image
                  </button>
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
                    border: isMainDragOver ? '2px dashed var(--admin-accent)' : '2px dashed var(--admin-border)',
                    borderRadius: '6px',
                    padding: '36px 16px',
                    textAlign: 'center',
                    background: isMainDragOver ? 'var(--admin-surface-2)' : '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Upload size={28} style={{ color: 'var(--admin-text-muted)', marginBottom: 8 }} />
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 500 }}>
                    {uploadingMain ? 'Uploading cover...' : 'Upload Cover Image'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    High-resolution hero visual (WebP, JPG, PNG)
                  </p>
                </div>
              )}
            </div>

            {/* Card 3: Optional Technical Specifications */}
            <div
              className="admin-table-wrap"
              style={{
                padding: '20px',
                background: 'var(--admin-surface)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '14px' }}>
                <Sliders size={16} style={{ color: 'var(--admin-accent)' }} />
                <h2 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0 }}>
                  Optional Specifications
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-field">
                  <label className="admin-label" style={{ fontSize: '0.8rem' }}>
                    Project Scope
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Masterplanning & Architecture"
                    value={formValues.scope}
                    onChange={(e) => setFormValues({ ...formValues, scope: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" style={{ fontSize: '0.8rem' }}>
                    Built-up Area
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 7,800 sq.ft"
                    value={formValues.area}
                    onChange={(e) => setFormValues({ ...formValues, area: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
