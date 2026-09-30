'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, Check, ArrowRight } from 'lucide-react';
import { testimonials as fallbackTestimonials, Testimonial } from '@/data/projects';

interface TestimonialItem {
  id: string;
  author: string;
  designation: string;
  quote: string;
  rating?: number;
  initials?: string;
  bgColor?: string;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testi-1',
    author: 'Arjun Menon',
    designation: 'Director, Greenfield Developments',
    quote: 'Attiks Architecture creates architecture that responds thoughtfully to context, material, climate and the experience of space.',
    rating: 5,
    initials: 'AM',
    bgColor: '#1E293B',
  },
  {
    id: 'testi-2',
    author: 'Priya Nair',
    designation: 'Founder, Bayshore Hospitality',
    quote: 'Their ability to translate complex requirements into elegant, timeless forms is what sets them apart. Every detail is considered.',
    rating: 5,
    initials: 'PN',
    bgColor: '#334155',
  },
  {
    id: 'testi-3',
    author: 'Ravi Shankar',
    designation: 'Trustee, Kerala Arts Foundation',
    quote: 'Working with the Attiks team was a deeply collaborative experience. They brought genuine vision and sensitivity to our project.',
    rating: 5,
    initials: 'RS',
    bgColor: '#0F172A',
  },
];

const AVATAR_COLORS = ['#1E293B', '#334155', '#0F172A', '#27272A', '#18181B', '#3F3F46'];

function getInitials(name: string): string {
  if (!name) return 'CL';
  return name
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface TestimonialsProps {
  initialTestimonials?: Testimonial[];
}

export default function Testimonials({ initialTestimonials }: TestimonialsProps) {
  const [items, setItems] = useState<TestimonialItem[]>(() => {
    const source =
      initialTestimonials && initialTestimonials.length > 0
        ? initialTestimonials
        : fallbackTestimonials;
    return (source && source.length > 0 ? source : DEFAULT_TESTIMONIALS).map((item, idx) => ({
      id: item.id || `testi-${idx}`,
      author: item.author,
      designation: item.designation,
      quote: item.quote,
      rating: 5,
      initials: getInitials(item.author),
      bgColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    }));
  });

  // Active slide index for small screens
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ author: '', designation: '', quote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Fetch live testimonials if available
  useEffect(() => {
    if (!initialTestimonials || initialTestimonials.length === 0) {
      fetch('/api/testimonials')
        .then((res) => res.json())
        .then((json) => {
          const list: Testimonial[] = Array.isArray(json.data) ? json.data : json.data?.items;
          if (list && list.length > 0) {
            const parsed = list.map((item, idx) => ({
              id: item.id || `api-testi-${idx}`,
              author: item.author,
              designation: item.designation,
              quote: item.quote,
              rating: 5,
              initials: getInitials(item.author),
              bgColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
            }));
            setItems(parsed);
          }
        })
        .catch(() => {
          // Keep current testimonials
        });
    }
  }, [initialTestimonials]);

  // Gentle auto-advance for small screens (pauses if modal is open)
  useEffect(() => {
    if (modalOpen || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [modalOpen, items.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.quote.trim()) {
      setError('Please provide your name and review.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: form.author.trim(),
          designation: form.designation.trim() || 'Private Client',
          quote: form.quote.trim(),
          order: 1,
          active: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to submit review');
      }

      const newCard: TestimonialItem = {
        id: `custom-${Date.now()}`,
        author: form.author.trim(),
        designation: form.designation.trim() || 'Private Client',
        quote: form.quote.trim(),
        rating: 5,
        initials: getInitials(form.author),
        bgColor: '#1E293B',
      };

      setSubmitted(true);
      setTimeout(() => {
        setItems((prev) => [newCard, ...prev]);
        setCurrentIndex(0);
        setTimeout(() => {
          setModalOpen(false);
          setSubmitted(false);
          setForm({ author: '', designation: '', quote: '' });
        }, 800);
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasMoreThanThree = items.length > 3;
  const activeMobileCard = items[currentIndex % items.length] || items[0];

  // If 4 or more cards exist, duplicate for a seamless infinite marquee loop
  const marqueeCards = hasMoreThanThree ? [...items, ...items] : items;
  // Calculate dynamic animation duration: ~8s per unique card for a consistent 30px/s flow
  const marqueeDuration = `${Math.max(24, items.length * 8)}s`;

  return (
    <section
      style={{
        position: 'relative',
        backgroundColor: '#F5F5F5',
        width: '100%',
        maxWidth: '100%',
        padding: 'clamp(32px, 4vw, 48px) clamp(20px, 5vw, 64px) clamp(44px, 5.5vw, 64px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      aria-label="Client Testimonials"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          margin: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* ========================================================
            DESKTOP VIEW:
            - If <= 3 cards: Clean static 3-column grid
            - If >= 4 cards: Smooth horizontal infinite auto-scrolling marquee
            ======================================================== */}
        {hasMoreThanThree ? (
          <div
            className="testimonials-marquee-viewport"
            style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Left & Right Soft Fade Masks */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '60px',
                background: 'linear-gradient(to right, #F5F5F5 10%, rgba(245, 245, 245, 0) 100%)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '60px',
                background: 'linear-gradient(to left, #F5F5F5 10%, rgba(245, 245, 245, 0) 100%)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            />

            <div
              className="testimonials-marquee-track"
              style={{ animationDuration: marqueeDuration }}
            >
              {marqueeCards.map((item, idx) => (
                <div
                  key={`marquee-${item.id}-${idx}`}
                  className="testimonial-clean-card testimonial-marquee-card-item"
                >
                  <CardContent item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="testimonials-desktop-grid">
            {items.map((item, idx) => (
              <div
                key={`desktop-${item.id || idx}`}
                className="testimonial-clean-card"
              >
                <CardContent item={item} />
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            MOBILE VIEW: SMOOTH FADE CAROUSEL (NO OVERFLOW / NO ARROWS)
            ======================================================== */}
        <div className="testimonials-mobile-slider">
          <div className="testimonials-mobile-card-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-${activeMobileCard.id}-${currentIndex}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="testimonial-clean-card"
                style={{ width: '100%' }}
              >
                <CardContent item={activeMobileCard} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Minimal Bottom Action: Consistent with "know more" and "view all projects" */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: 'clamp(16px, 1.8vw, 24px)',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#000000',
              cursor: 'pointer',
              fontSize: 'clamp(15px, 1.05vw, 17px)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              textTransform: 'lowercase',
              fontFamily: 'var(--font-primary), sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.6';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            <Plus size={13} />
            <span>share your experience</span>
          </button>
        </div>
      </div>

      {/* Add Testimonial Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '16px',
              boxSizing: 'border-box',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 'min(440px, 92vw)',
                background: '#FFFFFF',
                border: '1px solid #E4E4E7',
                borderRadius: '0px',
                padding: 'clamp(24px, 5vw, 32px)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
                boxSizing: 'border-box',
                color: '#111111',
              }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#F4F4F5',
                  border: '1px solid #E4E4E7',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#52525B',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={14} />
              </button>

              {!submitted ? (
                <>
                  <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 500,
                        fontFamily: 'var(--font-primary), sans-serif',
                        color: '#000000',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Share Your Experience
                    </h3>
                    <p style={{ color: '#71717A', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
                      Tell us about your architectural collaboration with Attiks.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label htmlFor="testi-author-input" className="sr-only">Your Name (required)</label>
                      <input
                        id="testi-author-input"
                        name="author"
                        aria-label="Your Name"
                        type="text"
                        required
                        placeholder="Your Name *"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#FAFAFA',
                          border: '1px solid #E4E4E7',
                          borderRadius: '0px',
                          color: '#000000',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="testi-designation-input" className="sr-only">Role or Project</label>
                      <input
                        id="testi-designation-input"
                        name="designation"
                        aria-label="Role or Project"
                        type="text"
                        placeholder="Role / Project (e.g. Director, Greenfield)"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#FAFAFA',
                          border: '1px solid #E4E4E7',
                          borderRadius: '0px',
                          color: '#000000',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="testi-quote-input" className="sr-only">Your Review (required)</label>
                      <textarea
                        id="testi-quote-input"
                        name="quote"
                        aria-label="Your review"
                        required
                        rows={3}
                        placeholder="Your review or testimonial *"
                        value={form.quote}
                        onChange={(e) => setForm({ ...form, quote: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#FAFAFA',
                          border: '1px solid #E4E4E7',
                          borderRadius: '0px',
                          color: '#000000',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          resize: 'none',
                        }}
                      />
                    </div>

                    {error && (
                      <div style={{ color: '#DC2626', fontSize: '12px', background: '#FEF2F2', padding: '6px 10px', borderRadius: '0px' }}>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        background: '#000000',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        fontWeight: 500,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginTop: '4px',
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      color: '#FFFFFF',
                    }}
                  >
                    <Check size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#000000', margin: '0 0 4px 0' }}>
                    Thank You
                  </h4>
                  <p style={{ color: '#71717A', fontSize: '13px', margin: 0 }}>
                    Your testimonial has been submitted.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .testimonials-desktop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(16px, 1.6vw, 24px);
          width: 100%;
          box-sizing: border-box;
        }

        /* Auto-scrolling Marquee (when > 3 cards exist) */
        @keyframes dynamicMarqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .testimonials-marquee-track {
          display: flex;
          width: max-content;
          gap: clamp(16px, 1.6vw, 24px);
          animation-name: dynamicMarqueeScroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        .testimonials-marquee-viewport:hover .testimonials-marquee-track {
          animation-play-state: paused;
        }

        .testimonial-marquee-card-item {
          width: 380px;
          min-width: 320px;
          max-width: 440px;
          flex-shrink: 0;
        }

        .testimonials-mobile-slider {
          display: none;
          width: 100%;
        }

        .testimonial-clean-card {
          background: #FFFFFF;
          border-radius: 0px;
          padding: 24px 22px;
          box-sizing: border-box;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #EDEDED;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          min-height: 220px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
          user-select: none;
        }

        .testimonial-clean-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.03);
        }

        @media (max-width: 900px) {
          .testimonials-desktop-grid,
          .testimonials-marquee-viewport {
            display: none !important;
          }

          .testimonials-mobile-slider {
            display: flex !important;
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

// Reusable Testimonial Card Content
function CardContent({ item }: { item: TestimonialItem }) {
  return (
    <>
      <div>
        {/* 5 Gold Stars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            marginBottom: '14px',
          }}
          aria-label={`${item.rating || 5} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              color="#F59E0B"
              fill={i < (item.rating || 5) ? '#F59E0B' : 'none'}
              strokeWidth={1.5}
            />
          ))}
        </div>

        {/* Quote Text in Quotes */}
        <blockquote
          style={{
            margin: 0,
            padding: 0,
            fontSize: 'clamp(13.5px, 1.05vw, 15px)',
            lineHeight: 1.6,
            color: '#222222',
            fontWeight: 400,
            fontFamily: 'var(--font-primary), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          &ldquo;{item.quote}&rdquo;
        </blockquote>
      </div>

      <div>
        {/* Subtle Horizontal Divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #F0F0F0',
            margin: '18px 0 14px 0',
            width: '100%',
          }}
        />

        {/* Author Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Avatar Circle (40px, Initials) */}
          <div
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              borderRadius: '50%',
              backgroundColor: item.bgColor || '#1E293B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              fontFamily: 'var(--font-primary), sans-serif',
            }}
          >
            {item.initials}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Name (Bold 14px) */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#000000',
                lineHeight: 1.3,
                fontFamily: 'var(--font-primary), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.author}
            </span>

            {/* Role / Company (12px Gray) */}
            {item.designation && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#71717A',
                  lineHeight: 1.35,
                  fontFamily: 'var(--font-primary), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
                }}
              >
                {item.designation}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
