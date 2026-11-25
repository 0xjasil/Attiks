'use client';

import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Trash2,
  Eye,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  FileText,
  Globe,
  Filter,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { JobApplication, ApplicationStatus } from '@/types/careers';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string; border: string }> = {
  NEW: { label: 'New', bg: 'rgba(212,175,55,0.12)', text: '#d4af37', border: 'rgba(212,175,55,0.3)' },
  REVIEWING: { label: 'Reviewing', bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  SHORTLISTED: { label: 'Shortlisted', bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  INTERVIEW: { label: 'Interview', bg: 'rgba(234,179,8,0.12)', text: '#eab308', border: 'rgba(234,179,8,0.3)' },
  REJECTED: { label: 'Rejected', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  HIRED: { label: 'Hired', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobApplication | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const json = await res.json();
        setApplications(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (activeApp && activeApp.id === id) {
      setActiveApp((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      loadApplications();
    }
  }

  async function handleSaveNotes() {
    if (!activeApp) return;
    setSavingNotes(true);
    setNotesSaved(false);

    try {
      const res = await fetch(`/api/applications/${activeApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: currentNotes }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === activeApp.id ? { ...a, notes: currentNotes } : a))
        );
        setActiveApp((prev) => (prev ? { ...prev, notes: currentNotes } : null));
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setApplications((prev) => prev.filter((a) => a.id !== targetId));
    setDeleteTarget(null);
    if (activeApp && activeApp.id === targetId) {
      setActiveApp(null);
    }

    try {
      await fetch(`/api/applications/${targetId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete application:', err);
      loadApplications();
    }
  }

  // Export Excel CSV with UTF-8 BOM
  function handleDownloadCSV() {
    if (applications.length === 0) return;

    const headers = [
      'Application ID',
      'Candidate Name',
      'Email Address',
      'Phone',
      'Role Applied For',
      'Experience Level',
      'Status',
      'Portfolio Link',
      'Resume URL',
      'Cover Note',
      'Internal Notes',
      'Submitted Date',
    ];

    const rows = applications.map((a) => [
      a.id,
      `"${(a.fullName || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      `"${(a.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(a.yearsOfExperience || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${(a.portfolioUrl || '').replace(/"/g, '""')}"`,
      `"${(a.resumeUrl || '').replace(/"/g, '""')}"`,
      `"${(a.coverNote || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(a.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${new Date(a.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `attiks_job_applications_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const uniqueJobTitles = Array.from(new Set(applications.map((a) => a.jobTitle).filter(Boolean)));

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      app.fullName.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.phone.includes(search) ||
      app.jobTitle.toLowerCase().includes(q);

    const matchesStatus = !statusFilter || app.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesJob = !jobFilter || app.jobTitle === jobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Job Applications &amp; Resumes</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: 3,
                background: 'rgba(196,112,63,0.12)',
                color: '#C4703F',
                border: '1px solid rgba(196,112,63,0.3)',
                textTransform: 'uppercase',
              }}
            >
              Candidate Pipeline
            </span>
          </h1>
          <p className="admin-page-subtitle">
            Review candidate portfolios, CV documents, status stages, and internal architect review notes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="admin-btn admin-btn-ghost" onClick={loadApplications}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleDownloadCSV}
            disabled={applications.length === 0}
            style={{
              background: 'linear-gradient(135deg, #107c41 0%, #0c5c30 100%)',
              borderColor: '#107c41',
              color: '#ffffff',
            }}
          >
            <FileSpreadsheet size={15} />
            Download Excel CSV
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="admin-table-wrap">
        {/* Toolbar */}
        <div className="admin-table-toolbar">
          <span className="admin-table-title">{filtered.length} Applications</span>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              className="admin-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="REJECTED">Rejected</option>
              <option value="HIRED">Hired</option>
            </select>

            {/* Job Filter */}
            {uniqueJobTitles.length > 0 && (
              <select
                className="admin-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                <option value="">All Positions</option>
                {uniqueJobTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            )}

            {/* Search */}
            <label className="admin-search">
              <Search size={14} style={{ color: 'var(--admin-text-muted)' }} />
              <input
                placeholder="Search candidate, email, role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role Applied</th>
                <th>Experience</th>
                <th>Portfolio / CV</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className="admin-skeleton" style={{ height: 38, width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">
                      <span>No applications found matching the criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
                  return (
                    <tr key={app.id}>
                      {/* Candidate Name & Email */}
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--admin-text)' }}>
                          {app.fullName}
                        </div>
                        <div style={{ display: 'flex', gap: 6, fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                          <a
                            href={`mailto:${app.email}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {app.email}
                          </a>
                          <span>•</span>
                          <span>{app.phone}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--admin-text)' }}>
                          {app.jobTitle}
                        </div>
                      </td>

                      {/* Experience */}
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                          {app.yearsOfExperience || '1-3 Years'}
                        </span>
                      </td>

                      {/* Assets */}
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.75rem',
                                color: '#C4703F',
                                textDecoration: 'none',
                                background: 'rgba(196,112,63,0.1)',
                                padding: '2px 8px',
                                borderRadius: 3,
                                border: '1px solid rgba(196,112,63,0.25)',
                              }}
                            >
                              <FileText size={12} />
                              <span>Resume PDF</span>
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>No PDF</span>
                          )}

                          {app.portfolioUrl && (
                            <a
                              href={app.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={app.portfolioUrl}
                              style={{
                                color: 'var(--admin-text-muted)',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Globe size={14} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            padding: '3px 8px',
                            borderRadius: 3,
                            background: cfg.bg,
                            color: cfg.text,
                            border: `1px solid ${cfg.border}`,
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="NEW">NEW</option>
                          <option value="REVIEWING">REVIEWING</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="INTERVIEW">INTERVIEW</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="HIRED">HIRED</option>
                        </select>
                      </td>

                      {/* Received Date */}
                      <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="admin-btn-icon"
                            onClick={() => {
                              setActiveApp(app);
                              setCurrentNotes(app.notes || '');
                            }}
                            title="View Full Application"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="admin-btn-icon danger"
                            onClick={() => setDeleteTarget(app)}
                            title="Delete Application"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {activeApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            padding: '20px',
          }}
          onClick={() => setActiveApp(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 6,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              color: '#09090b',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveApp(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#f4f4f5',
                border: '1px solid #e4e4e7',
                borderRadius: '50%',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#C4703F',
                  background: 'rgba(196,112,63,0.1)',
                  border: '1px solid rgba(196,112,63,0.25)',
                  padding: '2px 8px',
                  borderRadius: 3,
                  marginBottom: 8,
                }}
              >
                {activeApp.jobTitle}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0 0 4px 0', color: '#09090b' }}>
                {activeApp.fullName}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                Applied on {new Date(activeApp.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Contact Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: 4, border: '1px solid #e4e4e7' }}>
                <span style={{ fontSize: '0.7rem', color: '#71717a', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Email Address
                </span>
                <a
                  href={`mailto:${activeApp.email}`}
                  style={{ color: '#09090b', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Mail size={13} style={{ color: '#71717a' }} /> {activeApp.email}
                </a>
              </div>

              <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: 4, border: '1px solid #e4e4e7' }}>
                <span style={{ fontSize: '0.7rem', color: '#71717a', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Phone Number
                </span>
                <a
                  href={`tel:${activeApp.phone}`}
                  style={{ color: '#09090b', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Phone size={13} style={{ color: '#71717a' }} /> {activeApp.phone}
                </a>
              </div>
            </div>

            {/* Experience & Portfolio */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: 4, border: '1px solid #e4e4e7' }}>
                <span style={{ fontSize: '0.7rem', color: '#71717a', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Experience Level
                </span>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#09090b' }}>
                  {activeApp.yearsOfExperience || 'Not specified'}
                </div>
              </div>

              <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: 4, border: '1px solid #e4e4e7' }}>
                <span style={{ fontSize: '0.7rem', color: '#71717a', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Portfolio Link
                </span>
                {activeApp.portfolioUrl ? (
                  <a
                    href={activeApp.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#C4703F', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Globe size={13} /> View Online Portfolio
                  </a>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: '#71717a' }}>No URL provided</span>
                )}
              </div>
            </div>

            {/* Resume / CV Document */}
            {activeApp.resumeUrl && (
              <div style={{ background: '#f4f4f5', padding: '1rem', borderRadius: 4, border: '1px solid #e4e4e7', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={20} style={{ color: '#C4703F' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#09090b' }}>
                      {activeApp.resumeFileName || 'Candidate Resume / Portfolio.pdf'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a' }}>PDF Document</div>
                  </div>
                </div>
                <a
                  href={activeApp.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="admin-btn admin-btn-primary"
                  style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  Download CV
                </a>
              </div>
            )}

            {/* Cover Note */}
            {activeApp.coverNote && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="admin-label" style={{ color: '#71717a', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Cover Note / Architectural Ethos
                </label>
                <div
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e4e4e7',
                    borderLeft: '3px solid #C4703F',
                    padding: '0.85rem 1rem',
                    borderRadius: 4,
                    fontSize: '0.88rem',
                    color: '#18181b',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {activeApp.coverNote}
                </div>
              </div>
            )}

            {/* Internal Architect Review Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label" style={{ color: '#71717a', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: 6 }}>
                Internal Review Notes &amp; Interview Records
              </label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder="Record candidate review feedback, portfolio critique, interview schedule..."
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #e4e4e7',
                  color: '#09090b',
                  fontSize: '0.88rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 4,
                }}
              />
            </div>

            {/* Modal Footer Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #e4e4e7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Stage:</span>
                <select
                  className="admin-select"
                  style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }}
                  value={activeApp.status}
                  onChange={(e) => handleStatusChange(activeApp.id, e.target.value as ApplicationStatus)}
                >
                  <option value="NEW">NEW</option>
                  <option value="REVIEWING">REVIEWING</option>
                  <option value="SHORTLISTED">SHORTLISTED</option>
                  <option value="INTERVIEW">INTERVIEW</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="HIRED">HIRED</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setActiveApp(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{
                    background: notesSaved ? '#16a34a' : '#09090b',
                    borderColor: notesSaved ? '#16a34a' : '#09090b',
                    color: '#ffffff',
                  }}
                >
                  {savingNotes ? (
                    'Saving...'
                  ) : notesSaved ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Notes Saved</span>
                    </>
                  ) : (
                    'Save Notes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Application"
          message={`Are you sure you want to delete the application from "${deleteTarget.fullName}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
