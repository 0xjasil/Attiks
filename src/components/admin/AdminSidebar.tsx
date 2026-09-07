'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  FolderOpen,
  Inbox,
  Image as ImageIcon,
  Quote,
  Sparkles,
  Settings,
  Layers,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Hero Section', path: '/admin/hero', icon: Sparkles },
  { title: 'Projects', path: '/admin/projects', icon: FolderOpen },
  { title: 'Categories & Portfolios', path: '/admin/categories', icon: Layers },
  { title: 'Inquiries', path: '/admin/leads', icon: Inbox },
  { title: 'Media & Gallery', path: '/admin/gallery', icon: ImageIcon },
  { title: 'Testimonials', path: '/admin/testimonials', icon: Quote },
];

const systemNavItems: NavItem[] = [
  { title: 'Settings', path: '/admin/settings', icon: Settings },
];

import { logoutAction } from '@/actions/auth.actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();

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
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          style={{ display: 'block' }}
        />
      )}

      <aside className={`admin-sidebar${isOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <Image
              src="/images/Trblack.png"
              alt="Attiks Logo"
              width={100}
              height={30}
              style={{ objectFit: 'contain', height: '24px', width: 'auto' }}
            />
            <span style={{ fontSize: '0.65rem', color: '#71717a', letterSpacing: '0.12em', textTransform: 'uppercase', borderLeft: '1px solid #e4e4e7', paddingLeft: '0.5rem', fontWeight: 400 }}>
              Admin
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          <div className="admin-nav-section">
            <span className="admin-nav-label">Management</span>
            {mainNavItems.map((item) => {
              const isActive =
                item.path === '/admin/dashboard'
                  ? pathname === '/admin' || pathname === '/admin/dashboard'
                  : pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`admin-nav-link${isActive ? ' active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon size={16} />
                  {item.title}
                </Link>
              );
            })}
          </div>

          <div className="admin-divider" style={{ margin: '0.75rem 0.75rem' }} />

          <div className="admin-nav-section">
            <span className="admin-nav-label">System & Access</span>
            {systemNavItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`admin-nav-link${isActive ? ' active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon size={16} />
                  {item.title}
                </Link>
              );
            })}
          </div>

          <div className="admin-divider" style={{ margin: '0.75rem 0.75rem' }} />

          <div className="admin-nav-section">
            <span className="admin-nav-label">Public Website</span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-nav-link"
            >
              <ExternalLink size={16} />
              View Live Site
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <button
            className="admin-nav-link"
            onClick={handleLogout}
            style={{ width: '100%', color: '#71717a' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
