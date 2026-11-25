'use client';

import { Menu, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/actions/auth.actions';

const titles: Record<string, string> = {
  '/admin/dashboard':    'Dashboard',
  '/admin/about':        'About Studio Page',
  '/admin/hero':         'Hero Section',
  '/admin/projects/new': 'New Project',
  '/admin/projects':     'Projects Portfolio',
  '/admin/leads':        'Client Enquiries',
  '/admin/gallery':      'Media & Gallery Showcase',
  '/admin/media':        'Media Library',
  '/admin/testimonials': 'Client Testimonials',
  '/admin/categories':   'Project Categories',
  '/admin/services':     'Services & Disciplines',
  '/admin/team':         'Team & Leadership',
  '/admin/blog':         'Articles & Insights',
  '/admin/users':        'User Accounts & Access',
  '/admin/roles':        'Roles & Permissions',
  '/admin/settings':     'General Settings',
  '/admin':              'Overview',
};

interface Props {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const title = Object.entries(titles).findLast(([key]) => pathname.startsWith(key))?.[1] ?? 'Admin';

  async function handleLogout() {
    try {
      await logoutAction();
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'attiks_admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/admin/login');
  }

  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="admin-btn-icon desktop-hide"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {title}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          onClick={handleLogout}
          className="admin-btn-icon"
          title="Sign Out (Clear Session)"
          style={{
            background: '#f4f4f5',
            border: '1px solid #e4e4e7',
            borderRadius: 4,
            padding: '6px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            color: '#71717a',
            cursor: 'pointer',
            height: 'auto',
            width: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#71717a';
            e.currentTarget.style.borderColor = '#e4e4e7';
          }}
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>

        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--admin-accent, #09090b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 500,
            color: '#fff',
            flexShrink: 0,
          }}
          title="Studio Admin"
        >
          A
        </div>
      </div>
    </header>
  );
}
