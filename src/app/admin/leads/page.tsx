'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Search,
  Trash2,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  Building,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  projectTitle?: string | null;
  projectId?: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ARCHIVED' | string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  project?: {
    id: string;
    title: string;
    slug?: string;
  } | null;
}

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LeadItem | null>(null);
  const [activeLead, setActiveLead] = useState<LeadItem | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');

  async function loadLeads() {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : json.data?.items || [];
        setLeads(data);
      }
    } catch (e) {
      console.error('Failed to load leads from database:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleStatusChange(leadId: string, newStatus: string) {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (activeLead && activeLead.id === leadId) {
      setActiveLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update lead status:', err);
      loadLeads();
    }
  }

  async function handleSaveNotes() {
    if (!activeLead) return;
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const res = await fetch(`/api/leads/${activeLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: currentNotes }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === activeLead.id ? { ...l, notes: currentNotes } : l))
        );
        setActiveLead((prev) => (prev ? { ...prev, notes: currentNotes } : null));
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
    setLeads((prev) => prev.filter((l) => l.id !== targetId));
    setDeleteTarget(null);
    if (activeLead && activeLead.id === targetId) {
      setActiveLead(null);
    }

    try {
      await fetch(`/api/leads/${targetId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete lead from database:', err);
      loadLeads();
    }
  }

  // Export to standard Excel CSV with UTF-8 BOM
  function handleDownloadExcel() {
    if (leads.length === 0) return;

    const headers = [
      'Lead ID',
      'Client Name',
      'Email Address',
      'Phone Number',
      'Interested Project',
      'Status',
      'Enquiry Message',
      'Internal Notes',
      'Received Date',
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.projectTitle || l.project?.title || '').replace(/"/g, '""')}"`,
      `"${(l.status || 'NEW').toUpperCase()}"`,
      `"${(l.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(l.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${new Date(l.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `attiks_client_leads_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.phone && l.phone.includes(search)) ||
      (l.projectTitle && l.projectTitle.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      !statusFilter || String(l.status).toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const totalCount = leads.length;
  const newCount = leads.filter((l) => String(l.status).toUpperCase() === 'NEW').length;
  const contactedCount = leads.filter((l) => String(l.status).toUpperCase() === 'CONTACTED').length;
  const qualifiedCount = leads.filter((l) => String(l.status).toUpperCase() === 'QUALIFIED').length;

  const getStatusColor = (st: string) => {
    const upper = (st || 'NEW').toUpperCase();
    switch (upper) {
      case 'NEW':
        return { bg: 'rgba(212,175,55,0.12)', text: '#d4af37', border: 'rgba(212,175,55,0.3)' };
      case 'CONTACTED':
        return { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' };
      case 'QUALIFIED':
        return { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' };
      case 'CONVERTED':
        return { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' };
      default:
        return { bg: 'rgba(255,255,255,0.06)', text: 'var(--admin-text-muted)', border: 'var(--admin-border)' };
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Client Inquiries &amp; Leads</span>
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
              Live Database
            </span>
          </h1>
          <p className="admin-page-subtitle">
            Manage inquiries submitted via portfolio showcase modals &amp; website contact touchpoints
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={loadLeads}
            title="Refresh from PostgreSQL Database"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleDownloadExcel}
            title="Download client inquiries formatted for Microsoft Excel & Google Sheets"
            disabled={leads.length === 0}
            style={{
              background: 'linear-gradient(135deg, #107c41 0%, #0c5c30 100%)',
              borderColor: '#107c41',
              color: '#ffffff',
            }}
          >
            <FileSpreadsheet size={15} />
            Download Excel (.csv)
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Temporarily Hidden)
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="admin-table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Inquiries
            </span>
            <Building size={16} style={{ color: 'var(--admin-gold)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--admin-text)' }}>{totalCount}</div>
        </div>

        <div className="admin-table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              New Leads
            </span>
            <Clock size={16} style={{ color: '#d4af37' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#d4af37' }}>{newCount}</div>
        </div>

        <div className="admin-table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contacted
            </span>
            <UserCheck size={16} style={{ color: '#60a5fa' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#60a5fa' }}>{contactedCount}</div>
        </div>

        <div className="admin-table-wrap" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Qualified
            </span>
            <CheckCircle2 size={16} style={{ color: '#c084fc' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#c084fc' }}>{qualifiedCount}</div>
        </div>
      </div>
      */}

      {/* Main Table Card */}
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <span className="admin-table-title">{filteredLeads.length} Inquiries</span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Filter (Temporarily Hidden)
            <select
              className="admin-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            */}

            <label className="admin-search">
              <Search size={14} style={{ color: 'var(--admin-text-muted)' }} />
              <input
                placeholder="Search by name, email, project…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Contact Details</th>
                <th>Project of Interest</th>
                {/* <th>Status</th> */}
                <th>Received</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <div className="admin-skeleton" style={{ height: 36, width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty">
                      <span>No client inquiries found matching your search.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  return (
                    <tr key={lead.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{lead.name}</div>
                        {lead.message && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--admin-text-muted)',
                              maxWidth: 240,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: 2,
                            }}
                          >
                            &ldquo;{lead.message}&rdquo;
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.8rem' }}>
                          <a
                            href={`mailto:${lead.email}`}
                            style={{ color: 'var(--admin-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Mail size={12} /> {lead.email}
                          </a>
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              style={{ color: 'var(--admin-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Phone size={12} /> {lead.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        {lead.projectTitle || lead.project?.title ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.82rem',
                              color: 'var(--admin-text)',
                            }}
                          >
                            <Building size={13} style={{ color: 'var(--admin-gold)' }} />
                            {lead.projectTitle || lead.project?.title}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                            General Inquiry
                          </span>
                        )}
                      </td>
                      {/* Status Cell (Temporarily Hidden) */}
                      <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="admin-btn-icon"
                            onClick={() => {
                              setActiveLead(lead);
                              setCurrentNotes(lead.notes || '');
                            }}
                            title="View Full Inquiry Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="admin-btn-icon danger"
                            onClick={() => setDeleteTarget(lead)}
                            title="Delete Inquiry"
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

      {/* Inquiry Detail Modal */}
      {activeLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
            padding: '20px',
          }}
          onClick={() => setActiveLead(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              padding: '2.25rem',
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: 8,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              color: '#09090b',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveLead(null)}
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e4e4e7';
                e.currentTarget.style.color = '#09090b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f4f4f5';
                e.currentTarget.style.color = '#71717a';
              }}
              aria-label="Close modal"
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
                  color: '#71717a',
                  background: '#f4f4f5',
                  border: '1px solid #e4e4e7',
                  padding: '2px 8px',
                  borderRadius: 3,
                  marginBottom: 8,
                }}
              >
                Client Inquiry Details
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0 0 4px 0', color: '#09090b', letterSpacing: '-0.01em' }}>
                {activeLead.name}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                Received on {new Date(activeLead.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Contact Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: 4, border: '1px solid #e4e4e7' }}>
                <span style={{ fontSize: '0.7rem', color: '#71717a', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Email Address
                </span>
                <a
                  href={`mailto:${activeLead.email}`}
                  style={{ color: '#09090b', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Mail size={13} style={{ color: '#71717a' }} /> {activeLead.email}
                </a>
              </div>
              <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: 4, border: '1px solid #e4e4e7' }}>
                <span style={{ fontSize: '0.7rem', color: '#71717a', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Phone Number
                </span>
                <a
                  href={`tel:${activeLead.phone}`}
                  style={{ color: '#09090b', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Phone size={13} style={{ color: '#71717a' }} /> {activeLead.phone || 'Not provided'}
                </a>
              </div>
            </div>

            {/* Project Interest */}
            {(activeLead.projectTitle || activeLead.project?.title) && (
              <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: 4, border: '1px solid #e4e4e7', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#71717a', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Interested Architectural Project
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#09090b', fontSize: '0.92rem', fontWeight: 500 }}>
                  <Building size={14} style={{ color: '#71717a' }} />
                  <span>{activeLead.projectTitle || activeLead.project?.title}</span>
                </div>
              </div>
            )}

            {/* Client Message */}
            {activeLead.message && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="admin-label" style={{ color: '#71717a', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Message / Project Vision
                </label>
                <div
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e4e4e7',
                    borderLeft: '3px solid #09090b',
                    padding: '0.85rem 1rem',
                    borderRadius: 4,
                    fontSize: '0.88rem',
                    color: '#18181b',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {activeLead.message}
                </div>
              </div>
            )}

            {/* Internal Architect Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label" style={{ color: '#71717a', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: 6 }}>
                Internal Architect Notes &amp; Follow-up
              </label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder="Record consultation notes, meeting dates, or quote follow-ups..."
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
                  outline: 'none',
                }}
              />
            </div>

            {/* Footer Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #e4e4e7' }}>
              {/* Status Selector (Temporarily Hidden)
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Status:</span>
                <select
                  className="admin-select"
                  style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem', background: '#f4f4f5', border: '1px solid #e4e4e7', color: '#09090b' }}
                  value={(activeLead.status || 'NEW').toUpperCase()}
                  onChange={(e) => handleStatusChange(activeLead.id, e.target.value)}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              */}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setActiveLead(null)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{
                    padding: '0.5rem 1.15rem',
                    fontSize: '0.82rem',
                    background: notesSaved ? '#16a34a' : '#09090b',
                    color: '#ffffff',
                    borderColor: notesSaved ? '#16a34a' : '#09090b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
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
          title="Delete Client Inquiry"
          message={`Are you sure you want to delete the inquiry from "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
