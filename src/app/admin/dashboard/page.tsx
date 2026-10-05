'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  Inbox,
  Quote,
  Database,
  Plus,
  ArrowRight,
  ExternalLink,
  Mail,
  Building,
  Calendar,
  CheckCircle2,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';

interface ProjectItem {
  id: string;
  title: string;
  category?: string;
  status?: string;
  featured?: boolean;
  slug?: string;
  year?: string;
  createdAt?: string;
}

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  projectTitle?: string;
  project?: { title?: string };
  status?: string;
  createdAt: string;
}

interface TestimonialItem {
  id: string;
  author: string;
  designation: string;
  quote: string;
  active?: boolean;
}

interface JobItem {
  id: string;
  title: string;
  status?: string;
}

interface ApplicationItem {
  id: string;
  status?: string;
}

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch live projects, leads, testimonials, careers, applications concurrently
        const [projRes, leadRes, testiRes, jobRes, appRes] = await Promise.all([
          fetch('/api/projects').catch(() => null),
          fetch('/api/leads').catch(() => null),
          fetch('/api/testimonials').catch(() => null),
          fetch('/api/careers?admin=true').catch(() => null),
          fetch('/api/applications').catch(() => null),
        ]);

        if (projRes && projRes.ok) {
          const projJson = await projRes.json();
          const pList = Array.isArray(projJson.data)
            ? projJson.data
            : projJson.data?.items || projJson.data?.projects || [];
          setProjects(pList);
        }

        if (leadRes && leadRes.ok) {
          const leadJson = await leadRes.json();
          const lList = Array.isArray(leadJson.data)
            ? leadJson.data
            : leadJson.data?.items || [];
          setLeads(lList);
        }

        if (testiRes && testiRes.ok) {
          const testiJson = await testiRes.json();
          const tList = Array.isArray(testiJson.data)
            ? testiJson.data
            : testiJson.data?.items || [];
          setTestimonials(tList);
        }

        if (jobRes && jobRes.ok) {
          const jobJson = await jobRes.json();
          const jList = Array.isArray(jobJson.data) ? jobJson.data : [];
          setJobs(jList);
        }

        if (appRes && appRes.ok) {
          const appJson = await appRes.json();
          const aList = Array.isArray(appJson.data) ? appJson.data : [];
          setApplications(aList);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Compute live project metrics
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(
    (p) => (p.status || 'published').toLowerCase() !== 'draft'
  ).length;
  const draftProjects = totalProjects - publishedProjects;

  // Compute live category breakdown
  const categoryBreakdown: Record<string, number> = {};
  projects.forEach((p) => {
    const cat = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Architecture';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });
  const maxCategoryCount = Math.max(...Object.values(categoryBreakdown), 1);

  // Compute live lead metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(
    (l) => (l.status || 'NEW').toUpperCase() === 'NEW'
  ).length;

  if (loading) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <div className="admin-skeleton" style={{ height: 32, width: 200, marginBottom: 24 }} />
        <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-skeleton" style={{ height: 110, borderRadius: 4 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="admin-skeleton" style={{ height: 280, borderRadius: 4 }} />
          <div className="admin-skeleton" style={{ height: 280, borderRadius: 4 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header & Actions */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Dashboard</h1>
          <p className="admin-page-subtitle">Live metrics and portfolio content synced with PostgreSQL database</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link href="/admin/leads" className="admin-btn admin-btn-ghost" style={{ textDecoration: 'none' }}>
            <Inbox size={14} />
            Inquiries
          </Link>
          <Link href="/admin/projects/new" className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={14} />
            New Project
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="admin-stat-grid">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={FolderOpen}
          sub={`${publishedProjects} published • ${draftProjects} draft`}
        />
        <StatCard
          label="Client Inquiries"
          value={totalLeads}
          icon={Inbox}
          sub={`${newLeads} new inquiry${newLeads === 1 ? '' : 'ies'} unread`}
        />
        <StatCard
          label="Open Positions"
          value={jobs.filter((j) => (j.status || 'published') === 'published').length}
          icon={Briefcase}
          sub={`${jobs.length} total roles (${jobs.filter((j) => j.status === 'draft').length} draft)`}
        />
        <StatCard
          label="Job Applications"
          value={applications.length}
          icon={UserCheck}
          sub={`${applications.filter((a) => (a.status || 'NEW').toUpperCase() === 'NEW').length} new candidate${applications.filter((a) => (a.status || 'NEW').toUpperCase() === 'NEW').length === 1 ? '' : 's'}`}
        />
      </div>

      {/* 2-Column Grid: Projects Breakdown & Recent Leads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className="admin-table-wrap" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>
              Projects by Category
            </span>
            <Link href="/admin/projects" style={{ fontSize: '0.75rem', color: 'var(--admin-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          {Object.entries(categoryBreakdown).length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
              No project categories in database
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="admin-cat-bar-row">
                    <span className="admin-cat-bar-label" style={{ minWidth: 100, fontSize: '0.82rem' }}>
                      {cat}
                    </span>
                    <div className="admin-cat-bar-track" style={{ flex: 1, height: 6, background: '#f4f4f5', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        className="admin-cat-bar-fill"
                        style={{
                          width: `${(count / maxCategoryCount) * 100}%`,
                          height: '100%',
                          background: '#09090b',
                          borderRadius: 3,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span className="admin-cat-bar-count" style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: 24, textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Client Inquiries Stream */}
        <div className="admin-table-wrap" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>
              Recent Client Inquiries
            </span>
            <Link href="/admin/leads" style={{ fontSize: '0.75rem', color: 'var(--admin-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all ({totalLeads}) <ArrowRight size={12} />
            </Link>
          </div>

          {leads.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
              No client inquiries received yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leads.slice(0, 4).map((lead) => {
                const isNew = (lead.status || 'NEW').toUpperCase() === 'NEW';
                return (
                  <div
                    key={lead.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--admin-border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--admin-text)' }}>
                        {lead.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span>{lead.email}</span>
                        {(lead.projectTitle || lead.project?.title) && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--admin-text)' }}>{lead.projectTitle || lead.project?.title}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        padding: '2px 8px',
                        borderRadius: 3,
                        background: isNew ? '#ecfdf5' : '#f4f4f5',
                        color: isNew ? '#059669' : '#71717a',
                        border: `1px solid ${isNew ? '#a7f3d0' : '#e4e4e7'}`,
                      }}
                    >
                      {lead.status || 'NEW'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects Table Overview */}
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <span className="admin-table-title">Recent Portfolio Projects ({totalProjects})</span>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link href="/admin/projects" className="admin-btn admin-btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              All Projects &rarr;
            </Link>
          </div>
        </div>

        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Category</th>
                <th>Year</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map((project) => (
                <tr key={project.id}>
                  <td style={{ fontWeight: 500, color: 'var(--admin-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building size={14} style={{ color: 'var(--admin-text-muted)' }} />
                      <span>{project.title}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                      {project.category || 'Architecture'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    {project.year || '2026'}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 3,
                        background: (project.status || 'published').toLowerCase() === 'draft' ? '#fef3c7' : '#ecfdf5',
                        color: (project.status || 'published').toLowerCase() === 'draft' ? '#b45309' : '#059669',
                      }}
                    >
                      {project.status || 'Published'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="admin-btn admin-btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '3px 8px', textDecoration: 'none' }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
