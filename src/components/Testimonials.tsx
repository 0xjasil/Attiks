'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, ArrowRight } from 'lucide-react';
import { testimonials as fallbackTestimonials, Testimonial } from '@/data/projects';

interface TestimonialsProps {
  initialTestimonials?: Testimonial[];
}

export default function Testimonials({ initialTestimonials }: TestimonialsProps) {
  const [items, setItems] = useState<Testimonial[]>(
    initialTestimonials && initialTestimonials.length > 0 ? initialTestimonials : fallbackTestimonials
  );
  const [current, setCurrent] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ author: '', designation: '', quote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Fetch live testimonials if not passed from server
  useEffect(() => {
    if (!initialTestimonials || initialTestimonials.length === 0) {
      fetch('/api/testimonials')
        .then((res) => res.json())
        .then((json) => {
          const list = Array.isArray(json.data) ? json.data : json.data?.items;
          if (list && list.length > 0) {
            setItems(list);
          }
        })
        .catch(() => {
          // keep fallback
        });
    }
  }, [initialTestimonials]);

  // Auto cycle testimonials every 8 seconds
  useEffect(() => {
    if (items.length <= 1 || modalOpen) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length, modalOpen]);

  const activeIndex = current >= items.length ? 0 : current;
  const t = items[activeIndex] || items[0] || fallbackTestimonials[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.quote.trim()) {
      setError('Please provide your name and testimonial.');
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
          order: items.length + 1,
          active: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to submit testimonial');
      }

      const json = await res.json();
      const newTestimonial: Testimonial = json.data || {
        id: `testi-${Date.now()}`,
        author: form.author.trim(),
        designation: form.designation.trim() || 'Private Client',
        quote: form.quote.trim(),
      };

      setSubmitted(true);
      setTimeout(() => {
        setItems((prev) => [...prev, newTestimonial]);
        setCurrent(items.length); // jump to newly added testimonial
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

  return (
    <section
      style={{
        position: 'relative',
        background: '#ffffff',
        minHeight: '75vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '90px clamp(24px, 5vw, 64px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      aria-label="Client Testimonials"
    >
      {/* Main Centered Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Title in Canela upright serif */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="font-display"
          style={{
            fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
            fontWeight: 300,
            fontFamily: 'var(--font-canela), Georgia, serif',
            color: '#000000',
            marginBottom: '20px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Client Testimonials
        </motion.h2>

        {/* Refined Architectural Quotation Mark Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{ marginBottom: '28px' }}
          aria-hidden="true"
        >
          <svg
            width="32"
            height="24"
            viewBox="0 0 38 30"
            fill="#000000"
            style={{ display: 'block', opacity: 0.85 }}
          >
            <path d="M0 18C0 8.05 6.08 1.82 13.55 0L15.36 4.5C10.38 5.85 8.13 9 8.13 12.6H15.36V30H0V18ZM22.64 18C22.64 8.05 28.72 1.82 36.19 0L38 4.5C33.02 5.85 30.77 9 30.77 12.6H38V30H22.64V18Z" />
          </svg>
        </motion.div>

        {/* Quote text & author with AnimatePresence */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '170px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <blockquote
                style={{
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  fontSize: 'clamp(19px, 2.2vw, 27px)',
                  lineHeight: 1.5,
                  fontWeight: 350,
                  color: '#111111',
                  letterSpacing: '-0.015em',
                  marginBottom: '26px',
                  maxWidth: '860px',
                  fontFamily: 'inherit',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author & Project / Location Citation */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 500,
                    color: '#000000',
                    letterSpacing: '0.01em',
                  }}
                >
                  {t.author}
                </span>
                {t.designation && (
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 400,
                      color: '#71717a',
                      letterSpacing: '0.01em',
                    }}
                  >
                    &mdash; {t.designation}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimalist Indicator Dashes (Hidden on Mobile Screens) */}
        <div className="testimonials-dots-container" style={{ display: 'flex', gap: '6px', marginTop: '32px' }}>
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              style={{
                width: idx === activeIndex ? '20px' : '6px',
                height: '3px',
                borderRadius: '2px',
                background: idx === activeIndex ? '#000000' : 'rgba(0, 0, 0, 0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>

        {/* Elegant Share Experience Option */}
        <div style={{ marginTop: '22px' }}>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid #e5e5e5',
              color: '#666666',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.76rem',
              fontWeight: 400,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000000';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e5e5';
              e.currentTarget.style.color = '#666666';
            }}
          >
            <Plus size={12} />
            <span>Share Experience</span>
          </button>
        </div>
      </div>

      {/* Add Testimonial Modal (Tailored for Architectural Clients) */}
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
                maxWidth: '430px',
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                padding: 'clamp(24px, 5vw, 32px)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
                boxSizing: 'border-box',
                color: '#000000',
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
                  background: '#f4f4f5',
                  border: '1px solid #e5e5e5',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#555555',
                }}
              >
                <X size={14} />
              </button>

              {!submitted ? (
                <>
                  <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#777777',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Client Testimonial
                    </span>
                    <h2
                      className="font-display"
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 400,
                        fontFamily: 'var(--font-canela), Georgia, serif',
                        color: '#000000',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Share Your Experience
                    </h2>
                    <p style={{ color: '#666666', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
                      Tell us about your collaboration with Attiks Architecture.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }} className="testi-grid-cols">
                      <div>
                        <label htmlFor="testi-author" className="sr-only">Your Name (required)</label>
                        <input
                          id="testi-author"
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
                            background: '#fcfcfc',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            color: '#000000',
                            fontSize: '0.86rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="testi-designation" className="sr-only">Project or Location</label>
                        <input
                          id="testi-designation"
                          name="designation"
                          aria-label="Project or Location"
                          type="text"
                          placeholder="Project / Location (e.g. Private Villa, Kochi)"
                          value={form.designation}
                          onChange={(e) => setForm({ ...form, designation: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#fcfcfc',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            color: '#000000',
                            fontSize: '0.86rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="testi-quote" className="sr-only">Your Review (required)</label>
                      <textarea
                        id="testi-quote"
                        name="quote"
                        aria-label="Your architectural experience or review"
                        required
                        rows={3}
                        placeholder="Your architectural experience or review *"
                        value={form.quote}
                        onChange={(e) => setForm({ ...form, quote: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#fcfcfc',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          color: '#000000',
                          fontSize: '0.86rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          resize: 'none',
                        }}
                      />
                    </div>

                    {error && (
                      <div style={{ color: '#dc2626', fontSize: '0.78rem', background: '#fef2f2', padding: '6px 10px', borderRadius: '4px' }}>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: '100%',
                        padding: '11px 18px',
                        background: '#000000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.88rem',
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
                      color: '#ffffff',
                    }}
                  >
                    <Check size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#000000', margin: '0 0 4px 0' }}>
                    Thank You
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.82rem', margin: 0 }}>
                    Your testimonial has been submitted and added to the showcase.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .testimonials-dots-container {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
