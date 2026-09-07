'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  FileText,
  Download,
  Check,
  X,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CategoryItem } from '@/data/categories';
import {
  getAllCategoriesAdminAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/actions/category.actions';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [portfolioPdf, setPortfolioPdf] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeUploadCatId, setActiveUploadCatId] = useState<string | null>(null);

  // Success / Error banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const directFileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoriesAdminAction();
      setCategories(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? c.active !== false
          : c.active === false;
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const activeCount = useMemo(() => categories.filter((c) => c.active !== false).length, [categories]);
  const customPdfCount = useMemo(() => categories.filter((c) => !!c.portfolioPdf).length, [categories]);

  // Open Add Modal
  const openNewModal = () => {
    setEditingCategory(null);
    setLabel('');
    setValue('');
    setDescription('');
    setPortfolioPdf('');
    setPdfFileName('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setLabel(cat.label);
    setValue(cat.value);
    setDescription(cat.description || '');
    setPortfolioPdf(cat.portfolioPdf || '');
    setPdfFileName(cat.portfolioPdf ? cat.portfolioPdf.split('/').pop() || 'portfolio.pdf' : '');
    setModalOpen(true);
  };

  // Handle PDF upload in Modal
  const handleModalPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Only .pdf files are supported. Please select a valid PDF document.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 35 * 1024 * 1024) {
      alert('File size exceeds the 35MB limit. Please upload a smaller PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setPortfolioPdf(json.data.url);
        setPdfFileName(file.name);
        showNotification('success', `PDF "${file.name}" uploaded successfully!`);
      } else {
        alert('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  // Direct Card PDF Upload
  const handleDirectPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadCatId) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Only .pdf files are supported.');
      if (directFileInputRef.current) directFileInputRef.current.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        const updateRes = await updateCategoryAction(activeUploadCatId, {
          portfolioPdf: json.data.url,
        });

        if (updateRes.success) {
          showNotification('success', `Portfolio PDF for category updated successfully!`);
          loadCategories();
        } else {
          alert('Failed to update category: ' + updateRes.error);
        }
      } else {
        alert('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActiveUploadCatId(null);
      if (directFileInputRef.current) directFileInputRef.current.value = '';
    }
  };

  // Save Category (Add / Edit)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert('Category label is required');
      return;
    }

    setSaving(true);
    try {
      const cleanVal = (value || label)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (editingCategory) {
        const res = await updateCategoryAction(editingCategory.id, {
          label: label.trim(),
          value: cleanVal,
          description: description.trim(),
          portfolioPdf: portfolioPdf.trim(),
        });
        if (res.success) {
          showNotification('success', `Category "${label}" updated successfully!`);
          setModalOpen(false);
          loadCategories();
        } else {
          alert('Update failed: ' + res.error);
        }
      } else {
        const res = await createCategoryAction({
          label: label.trim(),
          value: cleanVal,
          description: description.trim(),
          portfolioPdf: portfolioPdf.trim(),
          active: true,
        });
        if (res.success) {
          showNotification('success', `Category "${label}" created successfully!`);
          setModalOpen(false);
          loadCategories();
        } else {
          alert('Create failed: ' + res.error);
        }
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active
  const toggleActive = async (cat: CategoryItem) => {
    const newStatus = !cat.active;
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, active: newStatus } : c)));
    await updateCategoryAction(cat.id, { active: newStatus });
  };

  // Remove PDF
  const handleRemovePdf = async (cat: CategoryItem) => {
    if (!confirm(`Remove custom PDF for category "${cat.label}"? It will fallback to the dynamic generated PDF lookbook.`)) {
      return;
    }
    const res = await updateCategoryAction(cat.id, { portfolioPdf: '' });
    if (res.success) {
      showNotification('success', `Custom PDF removed from "${cat.label}".`);
      loadCategories();
    }
  };

  // Delete Category
  const handleDelete = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category "${cat.label}"?`)) return;
    try {
      const res = await deleteCategoryAction(cat.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        showNotification('success', `Category "${cat.label}" deleted.`);
      } else {
        alert('Delete failed: ' + res.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px', minHeight: '85vh' }}>
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleModalPdfUpload} style={{ display: 'none' }} />
      <input ref={directFileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleDirectPdfUpload} style={{ display: 'none' }} />

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: notification.type === 'success' ? '#0f172a' : '#991b1b',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontSize: '0.88rem',
            fontWeight: 500,
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} style={{ color: '#10b981' }} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
            Categories & Portfolio PDF Manager
          </h1>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
            Manage project categories and upload dedicated PDF portfolios for instant download & lead capture on{' '}
            <a href="/projects" target="_blank" style={{ color: '#0f172a', fontWeight: 500, textDecoration: 'underline' }}>
              /projects
            </a>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={loadCategories}
            title="Refresh categories"
            style={{
              padding: '8px 12px',
              borderRadius: '7px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openNewModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '7px',
              border: 'none',
              background: '#000000',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={15} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Categories</span>
            <Layers size={16} style={{ color: '#0f172a' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{categories.length}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Active in Filters</span>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{activeCount}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Custom Uploaded PDFs</span>
            <FileText size={16} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{customPdfCount}</div>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div style={{ position: 'relative', width: 'clamp(240px, 30vw, 360px)' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              fontSize: '0.84rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '6px', fontSize: '0.8rem' }}>
          {(['all', 'active', 'draft'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '4px 12px',
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

      {/* Category List Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
          Loading categories and portfolios...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px dashed #cbd5e1',
            padding: '48px 20px',
            textAlign: 'center',
          }}
        >
          <FolderOpen size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 4px 0' }}>
            No categories found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 14px 0' }}>
            {searchQuery ? 'No category matches your search filter' : 'Create your first project category to get started'}
          </p>
          <button
            type="button"
            onClick={openNewModal}
            style={{
              padding: '7px 18px',
              background: '#000000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            + Add Category
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCategories.map((cat, idx) => {
            const isActive = cat.active !== false;
            const hasCustomPdf = !!cat.portfolioPdf;

            return (
              <div
                key={cat.id || cat.value}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                {/* Left info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: '240px', flex: 1 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    0{idx + 1}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        {cat.label}
                      </h3>
                      <code
                        style={{
                          fontSize: '0.72rem',
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {cat.value}
                      </code>
                    </div>

                    {cat.description && (
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle: Portfolio PDF Badge & Upload Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: hasCustomPdf ? '#f0fdf4' : '#f8fafc',
                    border: hasCustomPdf ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} style={{ color: hasCustomPdf ? '#16a34a' : '#64748b' }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: hasCustomPdf ? '#166534' : '#334155' }}>
                        {hasCustomPdf ? 'Custom PDF Uploaded' : 'Dynamic Lookbook (Fallback)'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: hasCustomPdf ? '#15803d' : '#64748b' }}>
                        {hasCustomPdf ? cat.portfolioPdf?.split('/').pop() : 'Generates multi-page PDF dynamically'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                    {hasCustomPdf ? (
                      <>
                        <a
                          href={cat.portfolioPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download & View PDF"
                          style={{
                            padding: '4px 8px',
                            background: '#16a34a',
                            color: '#ffffff',
                            borderRadius: '5px',
                            fontSize: '0.74rem',
                            fontWeight: 500,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Download size={12} /> Test Download
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveUploadCatId(cat.id || cat.value);
                            directFileInputRef.current?.click();
                          }}
                          title="Replace PDF"
                          style={{
                            padding: '4px 8px',
                            background: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            borderRadius: '5px',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Upload size={12} /> Replace
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemovePdf(cat)}
                          title="Remove custom PDF"
                          style={{
                            padding: '4px 6px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUploadCatId(cat.id || cat.value);
                          directFileInputRef.current?.click();
                        }}
                        style={{
                          padding: '5px 10px',
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Upload size={12} /> Upload PDF Brochure
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    title="Edit Category"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleActive(cat)}
                    title={isActive ? 'Deactivate' : 'Activate'}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: isActive ? '#fef3c7' : '#dcfce7',
                      border: 'none',
                      color: isActive ? '#b45309' : '#15803d',
                      cursor: 'pointer',
                    }}
                  >
                    {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    title="Delete Category"
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: '#fee2e2',
                      border: 'none',
                      color: '#b91c1c',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
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
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              boxSizing: 'border-box',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', margin: '0 0 2px 0' }}>
                  {editingCategory ? 'Edit Category & Portfolio' : 'Add New Category'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Define category name and attach a downloadable portfolio PDF.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Category Label *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    if (!editingCategory) {
                      setValue(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '')
                      );
                    }
                  }}
                  placeholder="e.g. Residential, Commercial, Interior Architecture"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Category Slug (Value) *
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. residential"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of projects in this category"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* PDF Upload Section */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                  Portfolio PDF Document (.PDF)
                </label>

                {portfolioPdf ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      border: '1px solid #bbf7d0',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                      <FileText size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFileName || portfolioPdf.split('/').pop()}
                        </div>
                        <a
                          href={portfolioPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.72rem', color: '#16a34a', textDecoration: 'underline' }}
                        >
                          Preview PDF link
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPdf}
                        style={{
                          padding: '4px 8px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingPdf ? 'Uploading...' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPortfolioPdf('');
                          setPdfFileName('');
                        }}
                        style={{
                          padding: '4px 6px',
                          background: '#fee2e2',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#b91c1c',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Upload an official architectural lookbook PDF for this category. If left blank, the website will generate a dynamic PDF brochure on demand.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPdf}
                      style={{
                        padding: '7px 16px',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        cursor: uploadingPdf ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploadingPdf ? 'Uploading PDF...' : 'Choose .PDF File'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPdf}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#000000',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    cursor: saving || uploadingPdf ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
