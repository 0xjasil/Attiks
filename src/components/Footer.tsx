'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail.trim(),
          name: 'Newsletter Subscriber',
          source: 'footer_newsletter',
        }),
      }).catch(() => {});
    }
  };

  return (
    <footer className="relative-content" style={{ background: '#000000', borderTop: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', scrollSnapAlign: 'end' }}>
      <div className="footer-inner-wrap" style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(3rem, 5vw, 4.5rem) var(--section-padding)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3.5rem', justifyContent: 'space-between' }}>

          {/* Left Column - Subscription */}
          <div style={{ flex: '1 1 320px', maxWidth: '450px', width: '100%' }}>
            <Image
              src="/images/logo-light.png"
              alt="Attiks Architecture Logo"
              width={160}
              height={40}
              style={{ objectFit: 'contain', height: '36px', width: 'auto', marginBottom: '1.25rem' }}
            />
            <p style={{ fontSize: 'clamp(14px, 1.05vw, 16px)', color: '#cccccc', marginBottom: '1.5rem', lineHeight: '1.6', fontWeight: 350 }}>
              Subscribe for priority access to our finest architectural milestones and timeless design insights.
            </p>
            {subscribed ? (
              <div style={{ color: '#ffffff', background: '#1c1c1c', padding: '12px 18px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px' }}>
                Thank you for subscribing to ATTIKS updates.
              </div>
            ) : (
              <form style={{ display: 'flex', flexWrap: 'wrap', width: '100%', maxWidth: '100%', gap: '8px' }} onSubmit={handleSubscribe}>
                <label htmlFor="footer-email-input" className="sr-only">
                  Email Address
                </label>
                <input
                  id="footer-email-input"
                  name="email"
                  type="email"
                  placeholder="Your Email Address"
                  autoComplete="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: '1 1 200px',
                    minWidth: '180px',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '12px 16px',
                    color: '#ffffff',
                    fontSize: 'clamp(14px, 1vw, 15px)',
                    outline: 'none',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    padding: '12px 20px',
                    fontSize: 'clamp(14px, 1vw, 15px)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#e0e0e0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  Get Notified
                </button>
              </form>
            )}
          </div>

          <div className="footer-links-container">
            {/* Pages */}
            <div style={{ minWidth: '120px' }}>
              <h3 style={{ fontSize: 'clamp(14.5px, 1.1vw, 16px)', fontWeight: 500, marginBottom: '1.25rem', color: '#ffffff', textTransform: 'none' }}>Pages</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Home', path: '/' },
                  { name: 'About', path: '/about' },
                  { name: 'Projects', path: '/projects' },
                  { name: 'Media', path: '/media' },
                  { name: 'Contact', path: '/contact' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.path} style={{ color: '#cccccc', fontSize: 'clamp(13.5px, 0.95vw, 15px)', fontWeight: 400, textDecoration: 'none', transition: 'color 0.3s ease', textTransform: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#cccccc')}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div style={{ minWidth: '120px' }}>
              <h3 style={{ fontSize: 'clamp(14.5px, 1.1vw, 16px)', fontWeight: 500, marginBottom: '1.25rem', color: '#ffffff', textTransform: 'none' }}>Socials</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      rel="noopener noreferrer"
                      style={{ color: '#cccccc', fontSize: 'clamp(13.5px, 0.95vw, 15px)', fontWeight: 400, textDecoration: 'none', transition: 'color 0.3s ease', textTransform: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#cccccc')}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: '200px', maxWidth: '300px' }}>
              <div>
                <h3 style={{ fontSize: 'clamp(14.5px, 1.1vw, 16px)', fontWeight: 500, marginBottom: '0.5rem', color: '#ffffff', textTransform: 'none' }}>Phone</h3>
                <p style={{ color: '#cccccc', fontSize: 'clamp(13.5px, 0.95vw, 15px)', fontWeight: 400, margin: '2px 0' }}>+91 0483 2941308</p>
                <p style={{ color: '#cccccc', fontSize: 'clamp(13.5px, 0.95vw, 15px)', fontWeight: 400, margin: '2px 0' }}>+91 8589 022307</p>
              </div>
              <div>
                <h3 style={{ fontSize: 'clamp(14.5px, 1.1vw, 16px)', fontWeight: 500, marginBottom: '0.5rem', color: '#ffffff', textTransform: 'none' }}>Email</h3>
                <p style={{ color: '#cccccc', fontSize: 'clamp(13.5px, 0.95vw, 15px)', fontWeight: 400, margin: '2px 0' }}>info@attiks.in</p>
                <p style={{ color: '#cccccc', fontSize: 'clamp(13.5px, 0.95vw, 15px)', fontWeight: 400, margin: '2px 0' }}>hello@attiks.ae</p>
              </div>
              <div>
                <h3 style={{ fontSize: 'clamp(14.5px, 1.1vw, 16px)', fontWeight: 500, marginBottom: '0.5rem', color: '#ffffff', textTransform: 'none' }}>Locations</h3>
                <p style={{ color: '#cccccc', fontSize: 'clamp(13.5px, 0.95vw, 15px)', fontWeight: 400, lineHeight: '1.5', margin: '2px 0' }}>
                  Calicut | Dubai
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="footer-bottom">
          <p style={{ fontSize: 'clamp(12px, 0.9vw, 13.5px)', margin: 0 }}>Attiks Architecture Practice</p>
          <p style={{ color: '#ffffff', fontSize: 'clamp(12px, 0.9vw, 13.5px)', margin: 0 }}>Visioned and Crafted by Willowy</p>
          <p style={{ fontSize: 'clamp(12px, 0.9vw, 13.5px)', margin: 0 }}>&copy; {currentYear} All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
