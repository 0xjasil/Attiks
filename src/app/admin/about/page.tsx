'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  UploadCloud,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
  Image as ImageIcon,
  BookOpen,
  Layers,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  AboutPageData,
  AboutDirector,
  AboutTeamMember,
  defaultAboutData,
} from '@/data/about';
import { getAboutDataAction, updateAboutDataAction } from '@/actions/about.actions';

export default function AboutAdminPage() {
  const [data, setData] = useState<AboutPageData>(defaultAboutData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero_philosophy' | 'foundation' | 'team'>('hero_philosophy');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Director modal state
  const [directorModalOpen, setDirectorModalOpen] = useState(false);
  const [editingDirectorIndex, setEditingDirectorIndex] = useState<number | null>(null);
  const [directorForm, setDirectorForm] = useState<AboutDirector>({
    id: '',
    name: '',
    role: '',
    image: '',
  });

  // Team member modal state
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeamIndex, setEditingTeamIndex] = useState<number | null>(null);
  const [teamForm, setTeamForm] = useState<AboutTeamMember>({
    id: '',
    name: '',
    role: '',
    image: '',
  });

  // File upload refs
  const heroFileRef = useRef<HTMLInputElement | null>(null);
  const philosophyFileRef = useRef<HTMLInputElement | null>(null);
  const directorFileRef = useRef<HTMLInputElement | null>(null);
  const teamFileRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAboutDataAction();
      if (res && res.hero) {
        setData(res);
      } else {
        setData(defaultAboutData);
      }
    } catch {
      showToast('Failed to load About page data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Upload helper
  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          onSuccess(json.data.url);
          showToast('Image uploaded successfully');
          return;
        }
      }
    } catch {
      // Fallback
    }

    const reader = new FileReader();
    reader.onload = () => {
      onSuccess(reader.result as string);
      showToast('Image loaded');
    };
    reader.readAsDataURL(file);
  };

  // Save all CMS data
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAboutDataAction(data);
      if (res.success) {
        showToast('About Studio content saved and published successfully!');
      } else {
        showToast('Save failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      showToast('Save failed: ' + (err.message || 'Network error'));
    } finally {
      setSaving(false);
    }
  };

  // Reset to default data
  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to restore the default studio content? You must click "Save Changes" afterwards to commit.')) {
      setData(defaultAboutData);
      showToast('Restored default content.');
    }
  };

  // Director operations
  const openAddDirector = () => {
    setEditingDirectorIndex(null);
    setDirectorForm({
      id: `dir-${Date.now()}`,
      name: '',
      role: '',
      image: '/images/about/team_placeholder.webp',
    });
    setDirectorModalOpen(true);
  };

  const openEditDirector = (index: number) => {
    setEditingDirectorIndex(index);
    setDirectorForm({ ...data.foundation.directors[index] });
    setDirectorModalOpen(true);
  };

  const handleSaveDirector = () => {
    if (!directorForm.name.trim()) {
      showToast('Director name is required');
      return;
    }
    const updated = [...data.foundation.directors];
    if (editingDirectorIndex !== null) {
      updated[editingDirectorIndex] = directorForm;
    } else {
      updated.push(directorForm);
    }
    setData({
      ...data,
      foundation: {
        ...data.foundation,
        directors: updated,
      },
    });
    setDirectorModalOpen(false);
    showToast(editingDirectorIndex !== null ? 'Director updated' : 'Director added');
  };

  const handleDeleteDirector = (index: number) => {
    const updated = data.foundation.directors.filter((_, i) => i !== index);
    setData({
      ...data,
      foundation: {
        ...data.foundation,
        directors: updated,
      },
    });
    showToast('Director removed');
  };

  const handleMoveDirector = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === data.foundation.directors.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...data.foundation.directors];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setData({
      ...data,
      foundation: {
        ...data.foundation,
        directors: updated,
      },
    });
  };

  // Team member operations
  const openAddTeamMember = () => {
    setEditingTeamIndex(null);
    setTeamForm({
      id: `team-${Date.now()}`,
      name: '',
      role: 'Design Associate',
      image: '/images/about/team_placeholder.webp',
    });
    setTeamModalOpen(true);
  };

  const openEditTeamMember = (index: number) => {
    setEditingTeamIndex(index);
    setTeamForm({ ...data.team.members[index] });
    setTeamModalOpen(true);
  };

  const handleSaveTeamMember = () => {
    const updated = [...data.team.members];
    if (editingTeamIndex !== null) {
      updated[editingTeamIndex] = teamForm;
    } else {
      updated.push(teamForm);
    }
    setData({
      ...data,
      team: {
        ...data.team,
        members: updated,
      },
    });
    setTeamModalOpen(false);
    showToast(editingTeamIndex !== null ? 'Team member updated' : 'Team member added');
  };

  const handleDeleteTeamMember = (index: number) => {
    const updated = data.team.members.filter((_, i) => i !== index);
    setData({
      ...data,
      team: {
        ...data.team,
        members: updated,
      },
    });
    showToast('Team member removed');
  };

  const handleMoveTeamMember = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === data.team.members.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...data.team.members];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setData({
      ...data,
      team: {
        ...data.team,
        members: updated,
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#71717a' }}>
          <RefreshCw className="animate-spin" size={24} />
          <span style={{ fontSize: '0.9rem' }}>Loading About Studio CMS...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#18181b',
            color: '#fafafa',
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 9999,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            border: '1px solid #27272a',
          }}
        >
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--admin-text, #18181b)', margin: 0 }}>
            About Studio Content Management
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted, #71717a)', margin: '4px 0 0 0' }}>
            Control hero imagery, philosophy storytelling, founding partners, and team collective on the public /about page.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadData}
            className="admin-btn admin-btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
            title="Reload current data"
          >
            <RefreshCw size={14} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="admin-btn admin-btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#71717a' }}
            title="Reset form to default studio text and images"
          >
            <RotateCcw size={14} />
            <span>Defaults</span>
          </button>

          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            <span>View Live /about</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.84rem',
              backgroundColor: '#09090b',
              color: '#ffffff',
              padding: '0.55rem 1.15rem',
            }}
          >
            <Save size={15} />
            <span>{saving ? 'Publishing...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--admin-border, #e4e4e7)',
          marginBottom: '1.75rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('hero_philosophy')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: activeTab === 'hero_philosophy' ? '#09090b' : '#71717a',
            borderBottom: activeTab === 'hero_philosophy' ? '2px solid #09090b' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={16} />
          <span>Hero & Philosophy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('foundation')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: activeTab === 'foundation' ? '#09090b' : '#71717a',
            borderBottom: activeTab === 'foundation' ? '2px solid #09090b' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Users size={16} />
          <span>The Foundation ({data.foundation.directors.length} Directors)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: activeTab === 'team' ? '#09090b' : '#71717a',
            borderBottom: activeTab === 'team' ? '2px solid #09090b' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} />
          <span>People of Attiks ({data.team.members.length} Members)</span>
        </button>
      </div>

      {/* TAB 1: Hero & Philosophy */}
      {activeTab === 'hero_philosophy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Hero Banner */}
          <div className="admin-table-wrap" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={18} color="#09090b" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--admin-text, #18181b)' }}>
                1. Hero Banner Media
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '0 0 1.25rem 0' }}>
              The full-width cinematic photograph displayed at the very top of the About page.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              {/* Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                    Banner Image URL or Local Path
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.hero.bannerImage}
                      onChange={(e) =>
                        setData({
                          ...data,
                          hero: { ...data.hero, bannerImage: e.target.value },
                        })
                      }
                      placeholder="/images/about/small_SBCL2379265.webp"
                      style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem' }}
                    />
                    <input
                      type="file"
                      ref={heroFileRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => {
                            setData((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, bannerImage: url },
                            }));
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => heroFileRef.current?.click()}
                      className="admin-btn admin-btn-ghost"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                    >
                      <UploadCloud size={14} />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                    Accessibility Alt Text (SEO)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={data.hero.bannerAlt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        hero: { ...data.hero, bannerAlt: e.target.value },
                      })
                    }
                    placeholder="Attiks Architecture studio team gathered at the practice atelier"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px', display: 'block' }}>
                    Descriptive text consumed by screen readers and Google image search indexing.
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                  Live Preview
                </label>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    backgroundColor: '#18181b',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e4e4e7',
                  }}
                >
                  {data.hero.bannerImage ? (
                    <Image
                      src={data.hero.bannerImage}
                      alt={data.hero.bannerAlt || 'Hero Banner Preview'}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized={data.hero.bannerImage.startsWith('data:')}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#71717a', fontSize: '0.8rem' }}>
                      No hero image set
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Philosophy & Atelier */}
          <div className="admin-table-wrap" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BookOpen size={18} color="#09090b" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--admin-text, #18181b)' }}>
                2. Philosophy & Atelier Story
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '0 0 1.25rem 0' }}>
              The 2-column narrative detailing Attiks&apos; architectural philosophy alongside a collective studio photograph.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              {/* Text Paragraphs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                    Paragraph 1 (Core Philosophy & Spatial Approach)
                  </label>
                  <textarea
                    rows={5}
                    value={data.philosophy.paragraph1}
                    onChange={(e) =>
                      setData({
                        ...data,
                        philosophy: { ...data.philosophy, paragraph1: e.target.value },
                      })
                    }
                    placeholder="Attiks Architecture approaches architecture as a contextual and evolving discipline..."
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                    Paragraph 2 (History, Founding & Legacy)
                  </label>
                  <textarea
                    rows={5}
                    value={data.philosophy.paragraph2}
                    onChange={(e) =>
                      setData({
                        ...data,
                        philosophy: { ...data.philosophy, paragraph2: e.target.value },
                      })
                    }
                    placeholder="This philosophy forms the foundation of Attiks Architecture, established in 2014..."
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Photo & Alt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                    Story Photo URL or Local Path
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.philosophy.image}
                      onChange={(e) =>
                        setData({
                          ...data,
                          philosophy: { ...data.philosophy, image: e.target.value },
                        })
                      }
                      placeholder="/images/about/partners_group.webp"
                      style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem' }}
                    />
                    <input
                      type="file"
                      ref={philosophyFileRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => {
                            setData((prev) => ({
                              ...prev,
                              philosophy: { ...prev.philosophy, image: url },
                            }));
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => philosophyFileRef.current?.click()}
                      className="admin-btn admin-btn-ghost"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                    >
                      <UploadCloud size={14} />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                    Story Photo Alt Text
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={data.philosophy.imageAlt}
                    onChange={(e) =>
                      setData({
                        ...data,
                        philosophy: { ...data.philosophy, imageAlt: e.target.value },
                      })
                    }
                    placeholder="Attiks Architecture leadership partners discussion in Calicut"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
                    Photo Preview
                  </label>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4 / 3',
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e4e4e7',
                    }}
                  >
                    {data.philosophy.image ? (
                      <Image
                        src={data.philosophy.image}
                        alt={data.philosophy.imageAlt || 'Story Photo'}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized={data.philosophy.image.startsWith('data:')}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#71717a', fontSize: '0.8rem' }}>
                        No story photo set
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: The Foundation (Directors) */}
      {activeTab === 'foundation' && (
        <div className="admin-table-wrap" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="#09090b" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--admin-text, #18181b)' }}>
                  3. The Foundation (Leadership &amp; Directors)
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '4px 0 0 0' }}>
                Principals and founders rendered in 4-column portrait cards with grayscale/color hover interactions.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddDirector}
              className="admin-btn admin-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', backgroundColor: '#09090b', color: '#fff' }}
            >
              <Plus size={15} />
              <span>Add Director</span>
            </button>
          </div>

          {/* Section Title field */}
          <div style={{ marginBottom: '1.5rem', maxWidth: '420px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
              Section Display Heading
            </label>
            <input
              type="text"
              className="admin-input"
              value={data.foundation.sectionTitle}
              onChange={(e) =>
                setData({
                  ...data,
                  foundation: { ...data.foundation, sectionTitle: e.target.value },
                })
              }
              placeholder="The Foundation"
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* Directors List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {data.foundation.directors.map((director, index) => (
              <div
                key={director.id || index}
                style={{
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                {/* Portrait */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 4.8',
                    backgroundColor: '#f4f4f5',
                  }}
                >
                  <Image
                    src={director.image || '/images/about/team_placeholder.webp'}
                    alt={director.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized={director.image.startsWith('data:')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    #{index + 1}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0', color: '#09090b' }}>
                    {director.name || 'Untitled Director'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#71717a', margin: 0, flex: 1 }}>
                    {director.role || 'Designation'}
                  </p>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f4f4f5',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveDirector(index, 'up')}
                        disabled={index === 0}
                        title="Move left/up"
                        style={{
                          background: '#f4f4f5',
                          border: 'none',
                          padding: '5px 7px',
                          borderRadius: 4,
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.4 : 1,
                        }}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDirector(index, 'down')}
                        disabled={index === data.foundation.directors.length - 1}
                        title="Move right/down"
                        style={{
                          background: '#f4f4f5',
                          border: 'none',
                          padding: '5px 7px',
                          borderRadius: 4,
                          cursor: index === data.foundation.directors.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === data.foundation.directors.length - 1 ? 0.4 : 1,
                        }}
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => openEditDirector(index)}
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDirector(index)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: People of Attiks (Team) */}
      {activeTab === 'team' && (
        <div className="admin-table-wrap" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#09090b" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--admin-text, #18181b)' }}>
                  4. People of Attiks (Design Associates &amp; Team)
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '4px 0 0 0' }}>
                Studio architects and team members rendered in a sleek 4-column 1:1 square grid.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddTeamMember}
              className="admin-btn admin-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', backgroundColor: '#09090b', color: '#fff' }}
            >
              <Plus size={15} />
              <span>Add Team Member</span>
            </button>
          </div>

          {/* Section Title field */}
          <div style={{ marginBottom: '1.5rem', maxWidth: '420px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: '#27272a' }}>
              Section Display Heading
            </label>
            <input
              type="text"
              className="admin-input"
              value={data.team.sectionTitle}
              onChange={(e) =>
                setData({
                  ...data,
                  team: { ...data.team, sectionTitle: e.target.value },
                })
              }
              placeholder="People of Attiks"
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* Members List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {data.team.members.map((member, index) => (
              <div
                key={member.id || index}
                style={{
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Square Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#e6e6e6',
                  }}
                >
                  <Image
                    src={member.image || '/images/about/team_placeholder.webp'}
                    alt={member.name || `Team Member ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized={member.image.startsWith('data:')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    #{index + 1}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 600, margin: '0 0 4px 0', color: '#09090b' }}>
                    {member.name || 'Architect'}
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: '#71717a', margin: 0, flex: 1 }}>
                    {member.role || 'Design Associate'}
                  </p>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f4f4f5',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveTeamMember(index, 'up')}
                        disabled={index === 0}
                        title="Move left/up"
                        style={{
                          background: '#f4f4f5',
                          border: 'none',
                          padding: '5px 7px',
                          borderRadius: 4,
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.4 : 1,
                        }}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTeamMember(index, 'down')}
                        disabled={index === data.team.members.length - 1}
                        title="Move right/down"
                        style={{
                          background: '#f4f4f5',
                          border: 'none',
                          padding: '5px 7px',
                          borderRadius: 4,
                          cursor: index === data.team.members.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === data.team.members.length - 1 ? 0.4 : 1,
                        }}
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => openEditTeamMember(index)}
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeamMember(index)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Director Form */}
      {directorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e4e4e7',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#09090b' }}>
                {editingDirectorIndex !== null ? 'Edit Director Profile' : 'Add New Director'}
              </h3>
              <button
                type="button"
                onClick={() => setDirectorModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px' }}>
                  Full Name &amp; Title
                </label>
                <input
                  type="text"
                  value={directorForm.name}
                  onChange={(e) => setDirectorForm({ ...directorForm, name: e.target.value })}
                  placeholder="e.g. Ar. Mohamed Aslam P K"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px' }}>
                  Designation / Practice Role
                </label>
                <input
                  type="text"
                  value={directorForm.role}
                  onChange={(e) => setDirectorForm({ ...directorForm, role: e.target.value })}
                  placeholder="e.g. Principal Architect"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px' }}>
                  Portrait Photo (4:4.8 aspect ratio)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={directorForm.image}
                    onChange={(e) => setDirectorForm({ ...directorForm, image: e.target.value })}
                    placeholder="/images/about/partner_aslam.webp"
                    style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem' }}
                  />
                  <input
                    type="file"
                    ref={directorFileRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, (url) => setDirectorForm((prev) => ({ ...prev, image: url })));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => directorFileRef.current?.click()}
                    className="admin-btn admin-btn-ghost"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    <UploadCloud size={14} />
                    <span>Upload</span>
                  </button>
                </div>

                {directorForm.image && (
                  <div
                    style={{
                      position: 'relative',
                      width: '120px',
                      aspectRatio: '4 / 4.8',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #e4e4e7',
                    }}
                  >
                    <Image
                      src={directorForm.image}
                      alt={directorForm.name || 'Preview'}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized={directorForm.image.startsWith('data:')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e4e4e7',
                background: '#fafafa',
              }}
            >
              <button
                type="button"
                onClick={() => setDirectorModalOpen(false)}
                className="admin-btn admin-btn-ghost"
                style={{ fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDirector}
                className="admin-btn admin-btn-primary"
                style={{ fontSize: '0.82rem', backgroundColor: '#09090b', color: '#fff' }}
              >
                Apply to List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Team Member Form */}
      {teamModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e4e4e7',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#09090b' }}>
                {editingTeamIndex !== null ? 'Edit Team Member' : 'Add New Team Member'}
              </h3>
              <button
                type="button"
                onClick={() => setTeamModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px' }}>
                  Full Name / Title
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="e.g. Ar. Razeen Jawad"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px' }}>
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={teamForm.role}
                  onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                  placeholder="e.g. Senior Partner / Design Associate"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px' }}>
                  Square Portrait Photo (1:1 aspect ratio)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={teamForm.image}
                    onChange={(e) => setTeamForm({ ...teamForm, image: e.target.value })}
                    placeholder="/images/about/partner_razeen.webp"
                    style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '0.85rem' }}
                  />
                  <input
                    type="file"
                    ref={teamFileRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, (url) => setTeamForm((prev) => ({ ...prev, image: url })));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => teamFileRef.current?.click()}
                    className="admin-btn admin-btn-ghost"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    <UploadCloud size={14} />
                    <span>Upload</span>
                  </button>
                </div>

                {teamForm.image && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100px',
                      aspectRatio: '1 / 1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #e4e4e7',
                    }}
                  >
                    <Image
                      src={teamForm.image}
                      alt={teamForm.name || 'Preview'}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized={teamForm.image.startsWith('data:')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e4e4e7',
                background: '#fafafa',
              }}
            >
              <button
                type="button"
                onClick={() => setTeamModalOpen(false)}
                className="admin-btn admin-btn-ghost"
                style={{ fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeamMember}
                className="admin-btn admin-btn-primary"
                style={{ fontSize: '0.82rem', backgroundColor: '#09090b', color: '#fff' }}
              >
                Apply to List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
