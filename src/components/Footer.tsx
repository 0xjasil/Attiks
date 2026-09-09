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
    <footer
      className="relative-content"
      style={{
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        color: '#ffffff',
        scrollSnapAlign: 'end',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(3.5rem, 6vw, 5rem) var(--section-padding)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2.5rem, 4vw, 4rem)', justifyContent: 'space-between' }}>

          {/* Left Column - Subscription & Brand */}
          <div style={{ flex: '1 1 320px', maxWidth: '440px', width: '100%' }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '1.5rem', textDecoration: 'none' }}>
              <Image
                src="/images/logo-light.png"
                alt="Attiks Architecture Logo"
                width={160}
                height={40}
                style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
              />
            </Link>
            <p style={{ fontSize: 'clamp(16px, 1.05vw, 18px)', color: '#b3b3b3', marginBottom: '1.75rem', lineHeight: '1.65', fontWeight: 350 }}>
              Subscribe for priority access to our finest architectural milestones and timeless design insights.
            </p>
            {subscribed ? (
              <div style={{ color: '#ffffff', background: '#171717', padding: '14px 20px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '15px' }}>
                Thank you for subscribing to ATTIKS updates.
              </div>
            ) : (
              <form style={{ display: 'flex', flexWrap: 'wrap', width: '100%', gap: '10px' }} onSubmit={handleSubscribe}>
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
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.18)',
                    padding: '13px 16px',
                    color: '#ffffff',
                    fontSize: 'clamp(15px, 1.0vw, 17px)',
                    outline: 'none',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.25s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
                />
                <button
                  type="submit"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    padding: '13px 22px',
                    fontSize: 'clamp(15px, 1.0vw, 17px)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.25s ease, transform 0.25s ease',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e2e2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  Get Notified
                </button>
              </form>
            )}
          </div>

          {/* Right Column - Navigation & Contact */}
          <div className="footer-links-container">
            {/* Pages */}
            <div style={{ minWidth: '110px' }}>
              <h3 className="footer-column-heading">Pages</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Home', path: '/' },
                  { name: 'About', path: '/about' },
                  { name: 'Projects', path: '/projects' },
                  { name: 'Media', path: '/media' },
                  { name: 'Contact', path: '/contact' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.path} className="footer-link-item">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div style={{ minWidth: '110px' }}>
              <h3 className="footer-column-heading">Socials</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Instagram', url: 'https://www.instagram.com/attiksarchitecture/' },
                  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/attiks-architecture/' },
                  { name: 'YouTube', url: 'https://www.youtube.com/channel/UCMUd9NCYkx5af5xbCwIr-sg' },
                  { name: 'Facebook', url: 'https://www.facebook.com/attiks.in/' }
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link-item"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-contact-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: '220px', maxWidth: '320px' }}>
              <div>
                <h3 className="footer-column-heading" style={{ marginBottom: '0.5rem' }}>Phone</h3>
                <p style={{ margin: '2px 0' }}>
                  <a href="tel:+918589022307" className="footer-link-item">
                    +91 85890 22307
                  </a>
                </p>
                <p style={{ margin: '2px 0' }}>
                  <a href="tel:+9104832941308" className="footer-link-item">
                    +91 0483 2941308
                  </a>
                </p>
              </div>
              <div>
                <h3 className="footer-column-heading" style={{ marginBottom: '0.5rem' }}>Email</h3>
                <p style={{ margin: '2px 0' }}>
                  <a href="mailto:info@attiks.in" className="footer-link-item">
                    info@attiks.in
                  </a>
                </p>
                <p style={{ margin: '2px 0' }}>
                  <a href="mailto:hello@attiks.ae" className="footer-link-item">
                    hello@attiks.ae
                  </a>
                </p>
              </div>
              <div>
                <h3 className="footer-column-heading" style={{ marginBottom: '0.5rem' }}>Locations</h3>
                <p style={{ color: '#a3a3a3', fontSize: 'clamp(14px, 0.95vw, 16px)', fontWeight: 400, lineHeight: '1.6', margin: '2px 0' }}>
                  Krishna Tower, NH 66, Near Raviz Kadavu Resort, Calicut &bull; Bangalore &bull; Dubai
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="footer-bottom">
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Attiks Architecture Practice</p>
          <p style={{ color: '#ffffff', fontWeight: 400, margin: 0 }}>Visioned and Crafted by Willowy</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>&copy; {currentYear} All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}

