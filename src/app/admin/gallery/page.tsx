'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  Image as ImageIcon,
  MapPin,
  Check,
  X,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Layers,
  UploadCloud,
  CheckSquare,
  Square,
} from 'lucide-react';
import { GalleryPost } from '@/data/gallery';
import {
  getAllGalleryPostsAdminAction,
  createGalleryPostAction,
  createBatchGalleryPostsAction,
  updateGalleryPostAction,
  deleteGalleryPostAction,
} from '@/actions/gallery.actions';

export default function GalleryAdminPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);

  // Form states (Single)
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Batch states
  const [batchQueue, setBatchQueue] = useState<Array<{ image: string; caption: string; altText?: string; location: string }>>([]);
  const [batchUploading, setBatchUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllGalleryPostsAdminAction();
      setPosts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? p.active !== false
          : p.active === false;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  const activeCount = useMemo(() => posts.filter((p) => p.active !== false).length, [posts]);
  const draftCount = useMemo(() => posts.filter((p) => p.active === false).length, [posts]);

  // Single Modal Open
  const openNewModal = () => {
    setEditingPost(null);
    setCaption('');
    setAltText('');
    setDescription('');
    setLocation('');
    setImageUrl('');
    setSingleModalOpen(true);
  };

  const openEditModal = (post: GalleryPost) => {
    setEditingPost(post);
    setCaption(post.caption || '');
    setAltText(post.altText || post.caption || '');
    setDescription(post.description || '');
    setLocation(post.location || '');
    setImageUrl(post.image || '');
    setSingleModalOpen(true);
  };

  // Upload Single File
  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.webp') && file.type !== 'image/webp') {
      alert('Only .webp image files below 2MB are supported. Please upload a .webp image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit. Please upload an image under 2MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setImageUrl(json.data.url);
        const autoCaption = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        if (!caption) {
          setCaption(autoCaption);
        }
        if (!altText) {
          setAltText(`${autoCaption} architecture showcase detail by Attiks`);
        }
      } else {
        alert('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Upload Batch Files
  const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.name.toLowerCase().endsWith('.webp') && f.type !== 'image/webp') {
        alert(`"${f.name}" is not a .webp file. Only .webp images below 2MB are permitted.`);
        if (batchFileInputRef.current) batchFileInputRef.current.value = '';
        return;
      }
      if (f.size > 2 * 1024 * 1024) {
        alert(`"${f.name}" exceeds the 2MB limit. Maximum allowed size is 2MB.`);
        if (batchFileInputRef.current) batchFileInputRef.current.value = '';
        return;
      }
    }

    setBatchUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data?.urls)) {
        const newQueue = json.data.urls.map((url: string, index: number) => {
          const originalFile = files[index];
          const autoName = originalFile
            ? originalFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
            : `Showcase Photo ${index + 1}`;
          return {
            image: url,
            caption: autoName,
            altText: `${autoName} architectural showcase view by Attiks`,
            location: location || 'Kerala, India',
          };
        });
        setBatchQueue((prev) => [...prev, ...newQueue]);
        setBatchModalOpen(true);
      } else {
        alert('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Batch upload error: ' + err.message);
    } finally {
      setBatchUploading(false);
    }
  };

  // Save Single Post
  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload an image first');
      return;
    }

    if (!altText.trim()) {
      alert('Mandatory: Please provide descriptive Image Alt Text for SEO and accessibility before saving');
      return;
    }

    setSaving(true);
    try {
      if (editingPost) {
        const res = await updateGalleryPostAction(editingPost.id, {
          image: imageUrl,
          caption,
          altText: altText.trim(),
          description,
          location,
        });
        if (res.success) {
          setSingleModalOpen(false);
          loadPosts();
        } else {
          alert('Update failed: ' + res.error);
        }
      } else {
        const res = await createGalleryPostAction({
          image: imageUrl,
          caption: caption || 'Architectural Highlight',
          altText: altText.trim(),
          description,
          location,
          aspectRatio: 'square',
          active: true,
        });
        if (res.success) {
          setSingleModalOpen(false);
          loadPosts();
        } else {
          alert('Create failed: ' + res.error);
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save Batch Posts
  const handleSaveBatch = async () => {
    if (batchQueue.length === 0) return;
    setSaving(true);
    try {
      const res = await createBatchGalleryPostsAction(batchQueue);
      if (res.success) {
        setBatchModalOpen(false);
        setBatchQueue([]);
        loadPosts();
      } else {
        alert('Batch save failed: ' + res.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Single Post
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await deleteGalleryPostAction(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle Active Status
  const toggleActive = async (post: GalleryPost) => {
    const newStatus = !post.active;
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, active: newStatus } : p)));
    await updateGalleryPostAction(post.id, { active: newStatus });
  };

  // Multi-Select Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBatchDeleteSelected = async () => {
    if (!confirm(`Delete all ${selectedIds.length} selected photos?`)) return;
    for (const id of selectedIds) {
      await deleteGalleryPostAction(id);
    }
    setPosts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 20px', minHeight: '85vh' }}>
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/webp" onChange={handleSingleFileUpload} style={{ display: 'none' }} />
      <input ref={batchFileInputRef} type="file" accept="image/webp" multiple onChange={handleBatchFileUpload} style={{ display: 'none' }} />

      {/* ============================================================
          TOP COMPACT HEADER BAR
          ============================================================ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#0f172a', margin: '0 0 2px 0' }}>
              Media Showcase Manager
            </h1>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#64748b' }}>
              <span>
                <strong>{posts.length}</strong> photos
              </span>
              <span>•</span>
              <span style={{ color: '#059669' }}>
                <strong>{activeCount}</strong> active
              </span>
              {draftCount > 0 && (
                <>
                  <span>•</span>
                  <span style={{ color: '#d97706' }}>
                    <strong>{draftCount}</strong> draft
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={loadPosts}
            title="Refresh"
            style={{
              padding: '7px 11px',
              borderRadius: '7px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={14} />
          </button>

          {/* Bulk Multi-Photo Upload Button */}
          <button
            type="button"
            onClick={() => batchFileInputRef.current?.click()}
            disabled={batchUploading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <UploadCloud size={15} />
            {batchUploading ? 'Uploading...' : 'Batch Upload (Multi)'}
          </button>

          {/* Single Upload Modal */}
          <button
            type="button"
            onClick={openNewModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '7px',
              border: 'none',
              background: '#000000',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={15} />
            Add Photo
          </button>
        </div>
      </div>

      {/* ============================================================
          SEARCH & FILTER TOOLBAR (SPACE-SAVING)
          ============================================================ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        {/* Left: Search input & Status pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: 'clamp(200px, 25vw, 320px)' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search caption, location..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.82rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                background: '#ffffff',
              }}
            />
          </div>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', fontSize: '0.78rem' }}>
            {(['all', 'active', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: statusFilter === filter ? '#ffffff' : 'transparent',
                  color: statusFilter === filter ? '#0f172a' : '#64748b',
                  fontWeight: statusFilter === filter ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  boxShadow: statusFilter === filter ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Multi-select tools */}
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 500 }}>
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={handleBatchDeleteSelected}
              style={{
                padding: '3px 8px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Trash2 size={12} /> Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ============================================================
          COMPACT DENSE PHOTO GRID (SPACE-CONSUME MINIMAL)
          ============================================================ */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
          Loading photos...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px dashed #cbd5e1',
            padding: '48px 20px',
            textAlign: 'center',
          }}
        >
          <ImageIcon size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 4px 0' }}>
            No photos found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 14px 0' }}>
            {searchQuery ? 'Try another search query' : 'Upload photos to start your showcase feed'}
          </p>
          <button
            type="button"
            onClick={() => batchFileInputRef.current?.click()}
            style={{
              padding: '6px 16px',
              background: '#000000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            + Upload Photos
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px',
          }}
        >
          {filteredPosts.map((post) => {
            const isSelected = selectedIds.includes(post.id);
            const isActive = post.active !== false;

            return (
              <div
                key={post.id}
                className="gallery-admin-card"
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: '#0f172a',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  opacity: isActive ? 1 : 0.65,
                  cursor: 'pointer',
                }}
              >
                {/* Image */}
                <Image
                  src={post.image}
                  alt={post.caption}
                  fill
                  sizes="(max-width: 768px) 33vw, 15vw"
                  style={{ objectFit: 'cover' }}
                />

                {/* Status Indicator Dot (Top Right) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    zIndex: 10,
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: isActive ? '#10b981' : '#f59e0b',
                    boxShadow: '0 0 4px rgba(0,0,0,0.4)',
                  }}
                  title={isActive ? 'Active on Feed' : 'Draft'}
                />

                {/* Multi-select checkbox (Top Left) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectOne(post.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    zIndex: 10,
                    background: isSelected ? '#3b82f6' : 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '3px',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {isSelected && <Check size={12} />}
                </button>

                {/* Permanent / Hover Bottom Caption Chip */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '16px 6px 5px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                    zIndex: 8,
                    pointerEvents: 'none',
                  }}
                >
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {post.caption}
                  </p>
                  {post.location && (
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.62rem',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {post.location}
                    </p>
                  )}
                </div>

                {/* Quick Hover Overlay Actions */}
                <div
                  className="card-hover-actions"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.65)',
                    zIndex: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}
                  onClick={() => openEditModal(post)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(post);
                    }}
                    title="Edit Post"
                    style={{
                      padding: '5px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      border: 'none',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(post);
                    }}
                    title={isActive ? 'Deactivate' : 'Activate'}
                    style={{
                      padding: '5px',
                      borderRadius: '4px',
                      background: isActive ? '#fef3c7' : '#dcfce7',
                      border: 'none',
                      color: isActive ? '#b45309' : '#15803d',
                      cursor: 'pointer',
                    }}
                  >
                    {isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id, post.caption);
                    }}
                    title="Delete Post"
                    style={{
                      padding: '5px',
                      borderRadius: '4px',
                      background: '#fee2e2',
                      border: 'none',
                      color: '#b91c1c',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          SINGLE PHOTO EDIT / ADD MODAL (MINIMAL, NO RATIO PICKERS)
          ============================================================ */}
      {singleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setSingleModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              padding: '20px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                {editingPost ? 'Edit Photo' : 'Upload Showcase Photo'}
              </h2>
              <button
                type="button"
                onClick={() => setSingleModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSingle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Image Preview / Upload Box */}
              <div>
                {imageUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '180px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#0f172a',
                    }}
                  >
                    <Image src={imageUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: '#f8fafc',
                    }}
                  >
                    <Upload size={24} style={{ color: '#94a3b8', margin: '0 auto 6px' }} />
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: '#1e293b', margin: 0 }}>
                      {uploading ? 'Uploading...' : 'Click to select photo'}
                    </p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>
                  Caption / Title *
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Biennale Pavilion Exhibition"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Image Alt Text (Required for SEO & Accessibility) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: '#475569' }}>
                    Image Alt Text <span style={{ color: '#ef4444' }}>* (Required for SEO)</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {altText?.length || 0}/120
                  </span>
                </div>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Contemporary timber pavilion with ambient natural daylight at Kochi Biennale"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0' }}>
                  Describe what is visible in the architecture scene for screen readers & search crawlers.
                </p>
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>
                  Location / Place
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Fort Kochi, Kerala"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#000000',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : editingPost ? 'Save' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          BATCH MULTI-UPLOAD REVIEW MODAL
          ============================================================ */}
      {batchModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setBatchModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              padding: '20px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  Batch Upload ({batchQueue.length} Photos)
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0 }}>
                  Review captions before publishing to the homepage feed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBatchModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Queue List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '6px',
                marginBottom: '16px',
              }}
            >
              {batchQueue.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <Image src={item.image} alt="" fill style={{ objectFit: 'cover' }} />
                  </div>

                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBatchQueue((prev) => prev.map((q, i) => (i === idx ? { ...q, caption: val } : q)));
                    }}
                    placeholder="Caption"
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                    }}
                  />

                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBatchQueue((prev) => prev.map((q, i) => (i === idx ? { ...q, location: val } : q)));
                    }}
                    placeholder="Location"
                    style={{
                      width: '140px',
                      padding: '6px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setBatchQueue((prev) => prev.filter((_, i) => i !== idx))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => batchFileInputRef.current?.click()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                + Add More Files
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatch}
                  disabled={saving || batchQueue.length === 0}
                  style={{
                    padding: '7px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#000000',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {saving ? 'Publishing...' : `Publish All ${batchQueue.length} Photos`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover interaction CSS */}
      <style jsx global>{`
        .gallery-admin-card:hover .card-hover-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
