'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollPos = window.scrollY;

          setScrolled(currentScrollPos > 40);

          if (currentScrollPos < 15) {
            setVisible(true);
          } else if (currentScrollPos > prevScrollPos && currentScrollPos > 80) {
            setVisible(false); // Scrolling down
          } else if (currentScrollPos < prevScrollPos) {
            setVisible(true); // Scrolling up
          }

          setPrevScrollPos(currentScrollPos);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Header background states:
  // - Reach top on hero pages (home, project detail): completely transparent / hidden background
  // - Scrolled / active: modern luxury glassmorphic frosted overlay
  const hasHeroHeader = isHomePage || pathname.startsWith('/projects/');
  const isTransparent = hasHeroHeader && !scrolled && !menuOpen;

  const headerBg = menuOpen
    ? 'rgba(5, 5, 5, 0.98)'
    : isTransparent
    ? 'transparent'
    : 'rgba(5, 5, 5, 0.65)';

  const headerFilter = isTransparent ? 'none' : 'blur(20px)';
  const headerBorder = isTransparent ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)';

  return (
    <header>
      <nav
        className="navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: 'clamp(84px, 6vw, 96px)',
          background: headerBg,
          backdropFilter: headerFilter,
          WebkitBackdropFilter: headerFilter,
          borderBottom: headerBorder,
          transform: visible || menuOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease, -webkit-backdrop-filter 0.4s ease',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 clamp(20px, 5vw, 64px)',
          boxSizing: 'border-box',
        }}
        aria-label="Main Navigation"
      >
        {/* Left Side Logo (Bold & Prominent) */}
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'opacity 0.25s ease',
            }}
            onClick={() => setMenuOpen(false)}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            aria-label="Attiks Architecture Home"
          >
            <Image
              src="/images/traingle.png"
              alt="Attiks Architecture Logo"
              width={160}
              height={48}
              style={{
                objectFit: 'contain',
                height: 'clamp(36px, 3.2vw, 48px)',
                width: 'auto',
                display: 'block',
              }}
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation Links (Title Case, Minimalist font-weight 400) */}
        <div
          className="nav-links mobile-hide"
          style={{
            display: 'flex',
            gap: 'clamp(36px, 3.8vw, 56px)',
            alignItems: 'center',
          }}
        >
          <Link
            href="/projects"
            className="nav-link"
            style={{
              fontSize: 'clamp(18px, 1.25vw, 20px)',
              letterSpacing: '0.01em',
              color: '#ffffff',
              textDecoration: 'none',
              textTransform: 'none',
              fontWeight: 400,
              fontFamily: 'var(--font-primary)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.55')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className="nav-link"
            style={{
              fontSize: 'clamp(18px, 1.25vw, 20px)',
              letterSpacing: '0.01em',
              color: '#ffffff',
              textDecoration: 'none',
              textTransform: 'none',
              fontWeight: 400,
              fontFamily: 'var(--font-primary)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.55')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            About
          </Link>
          <Link
            href="/media"
            className="nav-link"
            style={{
              fontSize: 'clamp(18px, 1.25vw, 20px)',
              letterSpacing: '0.01em',
              color: '#ffffff',
              textDecoration: 'none',
              textTransform: 'none',
              fontWeight: 400,
              fontFamily: 'var(--font-primary)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.55')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Media
          </Link>
          <Link
            href="/contact"
            className="nav-link"
            style={{
              fontSize: 'clamp(18px, 1.25vw, 20px)',
              letterSpacing: '0.01em',
              color: '#ffffff',
              textDecoration: 'none',
              textTransform: 'none',
              fontWeight: 400,
              fontFamily: 'var(--font-primary)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.55')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="hamburger-btn desktop-hide"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{
            color: '#fff',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`}
        aria-hidden={!menuOpen}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#050505',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      >
        <div
          className="mobile-menu-links"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            textAlign: 'center',
          }}
        >
          <Link
            href="/projects"
            className="mobile-menu-link"
            onClick={() => setMenuOpen(false)}
            style={{
              textTransform: 'none',
              fontSize: 'clamp(2.0rem, 6vw, 2.8rem)',
              fontWeight: 400,
              color: '#ffffff',
              textDecoration: 'none',
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em',
            }}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className="mobile-menu-link"
            onClick={() => setMenuOpen(false)}
            style={{
              textTransform: 'none',
              fontSize: 'clamp(2.0rem, 6vw, 2.8rem)',
              fontWeight: 400,
              color: '#ffffff',
              textDecoration: 'none',
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em',
            }}
          >
            About
          </Link>
          <Link
            href="/media"
            className="mobile-menu-link"
            onClick={() => setMenuOpen(false)}
            style={{
              textTransform: 'none',
              fontSize: 'clamp(2.0rem, 6vw, 2.8rem)',
              fontWeight: 400,
              color: '#ffffff',
              textDecoration: 'none',
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em',
            }}
          >
            Media
          </Link>
          <Link
            href="/contact"
            className="mobile-menu-link"
            onClick={() => setMenuOpen(false)}
            style={{
              textTransform: 'none',
              fontSize: 'clamp(2.0rem, 6vw, 2.8rem)',
              fontWeight: 400,
              color: '#ffffff',
              textDecoration: 'none',
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em',
            }}
          >
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
}
