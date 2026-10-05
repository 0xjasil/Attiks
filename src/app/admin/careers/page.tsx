'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Briefcase,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FieldDef } from '@/components/admin/FormModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusBadge from '@/components/admin/StatusBadge';
import { JobPosting, Department, JobType } from '@/types/careers';

const FORM_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g. Senior Project Architect' },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    options: ['Architecture', 'Interior Design', 'Landscape', 'Visualization', 'Admin', 'Internship'],
    required: true,
  },
  { key: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g. Kochi, Kerala (Studio)' },
  {
    key: 'type',
    label: 'Job Type',
    type: 'select',
    options: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: true,
  },
  { key: 'experienceLevel', label: 'Experience Level', type: 'text', placeholder: 'e.g. 5+ Years Experience' },
  { key: 'summary', label: 'Short Summary', type: 'textarea', required: true, placeholder: 'One-sentence highlight of the role...' },
  { key: 'description', label: 'Full Description', type: 'textarea', required: true, placeholder: 'Detailed narrative of the position...' },
  { key: 'responsibilities', label: 'Key Responsibilities (One per line)', type: 'textarea', placeholder: '• Lead master planning...\n• Coordinate consultants...' },
  { key: 'requirements', label: 'Qualifications & Requirements (One per line)', type: 'textarea', placeholder: '• B.Arch degree...\n• 5+ years experience...' },
  { key: 'benefits', label: 'Benefits & Perks (One per line)', type: 'textarea', placeholder: '• Competitive compensation...\n• Research excursions...' },
  {
    key: 'status',
    label: 'Publishing Status',
    type: 'select',
    options: ['published', 'draft', 'archived'],
    required: true,
  },
  { key: 'order', label: 'Display Order', type: 'number', placeholder: '1' },
];

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobPosting | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadCareers() {
    setLoading(true);
    try {
      const res = await fetch('/api/careers?admin=true');
      if (res.ok) {
        const json = await res.json();
        setJobs(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err) {
      console.error('Failed to load careers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCareers();
  }, []);

  function handleOpenAdd() {
    setEditingJob(null);
    setFormValues({
      title: '',
      department: 'Architecture',
      location: 'Kochi, Kerala (Studio)',
      type: 'Full-time',
      experienceLevel: '3+ Years',
      summary: '',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      status: 'published',
      order: String(jobs.length + 1),
    });
    setFormError(null);
    setModalOpen(true);
  }

  function handleOpenEdit(job: JobPosting) {
    setEditingJob(job);
    setFormValues({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experienceLevel: job.experienceLevel || '',
      summary: job.summary || '',
      description: job.description || '',
      responsibilities: (job.responsibilities || []).join('\n'),
      requirements: (job.requirements || []).join('\n'),
      benefits: (job.benefits || []).join('\n'),
      status: job.status || 'published',
      order: String(job.order || 1),
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleFormSubmit() {
    if (!formValues.title?.trim()) {
      setFormError('Job title is required');
      return;
    }
    if (!formValues.summary?.trim() || !formValues.description?.trim()) {
      setFormError('Summary and full description are required');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      title: formValues.title.trim(),
      department: formValues.department as Department,
      location: formValues.location.trim(),
      type: formValues.type as JobType,
      experienceLevel: formValues.experienceLevel.trim(),
      summary: formValues.summary.trim(),
      description: formValues.description.trim(),
      responsibilities: formValues.responsibilities,
      requirements: formValues.requirements,
      benefits: formValues.benefits,
      status: (formValues.status as 'published' | 'draft' | 'archived') || 'published',
      order: parseInt(formValues.order, 10) || 1,
    };

    try {
      let res;
      if (editingJob) {
        res = await fetch(`/api/careers/${editingJob.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/careers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || 'Failed to save job posting');
        return;
      }

      setModalOpen(false);
      loadCareers();
    } catch (err: any) {
      setFormError(err.message || 'Error communicating with server');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/careers/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadCareers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  const columns: Column<JobPosting>[] = [
    {
      key: 'title',
      label: 'Role Title',
      sortable: true,
      render: (job) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{job.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
            /careers/{job.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Discipline',
      sortable: true,
      render: (job) => (
        <span
          style={{
            fontSize: '0.8rem',
            padding: '2px 8px',
            borderRadius: 3,
            background: 'var(--admin-surface-2)',
            color: 'var(--admin-text)',
            border: '1px solid var(--admin-border)',
          }}
        >
          {job.department}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Location & Type',
      render: (job) => (
        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
          <div>{job.location}</div>
          <div style={{ color: 'var(--admin-text-subtle)', fontSize: '0.72rem' }}>{job.type}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (job) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 3,
            background: job.status === 'published' ? '#ecfdf5' : '#f4f4f5',
            color: job.status === 'published' ? '#059669' : '#71717a',
            border: `1px solid ${job.status === 'published' ? '#a7f3d0' : '#e4e4e7'}`,
          }}
        >
          {job.status}
        </span>
      ),
    },
    {
      key: 'order',
      label: 'Order',
      sortable: true,
      render: (job) => <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>#{job.order}</span>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Careers &amp; Job Postings</span>
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
              Recruitment
            </span>
          </h1>
          <p className="admin-page-subtitle">
            Manage studio positions, discipline categories, requirements, and job listing statuses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="admin-btn admin-btn-ghost" onClick={loadCareers}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href="/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-ghost"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            View Careers Page
          </a>
          <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} />
            New Position
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        title="Open Studio Postings"
        data={jobs}
        columns={columns}
        loading={loading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(job) => setDeleteTarget(job)}
        addLabel="Add Job"
      />

      {/* Form Modal */}
      {modalOpen && (
        <FormModal
          title={editingJob ? `Edit: ${editingJob.title}` : 'Create Job Opening'}
          fields={FORM_FIELDS}
          values={formValues}
          onChange={(key, val) => setFormValues((prev) => ({ ...prev, [key]: val }))}
          onSubmit={handleFormSubmit}
          onClose={() => setModalOpen(false)}
          loading={saving}
          error={formError}
          submitLabel={editingJob ? 'Update Position' : 'Publish Position'}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Job Posting"
          message={`Are you sure you want to delete the role "${deleteTarget.title}"? Candidates will no longer be able to view or apply for this opening.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
