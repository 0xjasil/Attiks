'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, User, Mail, Phone, MessageSquare, Download, FileText, Loader2 } from 'lucide-react';
import { generatePortfolioPdf } from '@/lib/generatePortfolioPdf';
import { Project } from '@/data/projects';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  projectTitle?: string;
  projectId?: string;
  category?: string;
  categoryLabel?: string;
  customPdfUrl?: string;
  projects?: Project[];
  mode?: 'project' | 'download';
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  projectTitle,
  projectId,
  category,
  categoryLabel,
  customPdfUrl,
  projects = [],
  mode = 'download',
}: LeadCaptureModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const formattedCategory = categoryLabel
    ? categoryLabel
    : category && category !== 'all'
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Complete Studio';

  const modalHeading = mode === 'download'
    ? `${formattedCategory} Portfolio Lookbook`
    : (projectTitle || 'Project Inquiry');

  const modalSubtitle = mode === 'download'
    ? `Enter your details to download the curated ${formattedCategory} architecture portfolio (.PDF).`
    : 'Enter your details to view full architectural specifications and project lookbook.';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const triggerPortfolioDownload = async () => {
    setGeneratingPdf(true);
    try {
      if (customPdfUrl && customPdfUrl.trim()) {
        const link = document.createElement('a');
        link.href = customPdfUrl;
        const cleanCatName = formattedCategory.replace(/\s+/g, '-');
        link.download = `Attiks-${cleanCatName}-Portfolio.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        await generatePortfolioPdf({
          category: category || 'all',
          projects: projects,
        });
      }
    } catch (err) {
      console.error('Failed to generate / download PDF:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please provide your name and email.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim() || undefined,
        source: mode === 'download' ? 'portfolio_download' : 'project_inquiry',
        projectTitle: mode === 'download' ? `${formattedCategory} Architecture Portfolio PDF` : (projectTitle || `${formattedCategory} Project`),
      };

      // Only pass projectId if it is a valid UUID or existing project ID
      if (projectId && !projectId.startsWith('category-') && !projectId.startsWith('general-')) {
        payload.projectId = projectId;
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn('API error logging lead:', errJson);
      }

      setSubmitted(true);
      if (mode === 'download') {
        await triggerPortfolioDownload();
      }

      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        setTimeout(() => {
          setSubmitted(false);
          setForm({ name: '', email: '', phone: '', message: '' });
          onClose();
        }, 1200);
      }, 1000);
    } catch (err: any) {
      console.error('Lead submission error:', err);
      setSubmitted(true);
      if (mode === 'download') {
        await triggerPortfolioDownload();
      }
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    // If user filled in their email/name before skipping, record it in database
    if (form.email.trim() && form.name.trim()) {
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            message: form.message.trim() || undefined,
            source: mode === 'download' ? 'portfolio_download' : 'project_inquiry',
            projectTitle: mode === 'download' ? `${formattedCategory} Architecture Portfolio PDF` : (projectTitle || `${formattedCategory} Project`),
          }),
        });
      } catch {
        // ignore
      }
    }

    if (mode === 'download') {
      await triggerPortfolioDownload();
    }
    if (onSubmitSuccess) onSubmitSuccess();
    setForm({ name: '', email: '', phone: '', message: '' });
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
              maxWidth: '440px',
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              padding: 'clamp(24px, 5vw, 36px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              boxSizing: 'border-box',
              color: '#000000',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f4f4f5',
                border: '1px solid #e5e5e5',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#555555',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f4f4f5';
                e.currentTarget.style.color = '#555555';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }}
            >
              <X size={15} />
            </button>

            {!submitted ? (
              <>
                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    {mode === 'download' ? (
                      <Download size={13} style={{ color: '#000000' }} />
                    ) : (
                      <FileText size={13} style={{ color: '#000000' }} />
                    )}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#777777',
                      }}
                    >
                      {mode === 'download' ? 'Portfolio PDF Download' : 'Project Inquiry'}
                    </span>
                  </div>

                  <h2
                    className="font-display"
                    style={{
                      fontSize: 'clamp(1.4rem, 3.5vw, 1.75rem)',
                      fontWeight: 400,
                      fontFamily: 'var(--font-canela), Georgia, serif',
                      color: '#000000',
                      margin: '0 0 8px 0',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    {modalHeading}
                  </h2>
                  <p
                    style={{
                      color: '#666666',
                      fontSize: '0.85rem',
                      margin: 0,
                      lineHeight: 1.45,
                      fontWeight: 400,
                    }}
                  >
                    {modalSubtitle}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="lead-grid-cols">
                    <div style={{ position: 'relative' }}>
                      <label htmlFor="lead-name" className="sr-only">Your Name (required)</label>
                      <User size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#999999', pointerEvents: 'none' }} />
                      <input
                        id="lead-name"
                        type="text"
                        name="name"
                        aria-label="Your Name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name *"
                        required
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 34px',
                          background: '#fcfcfc',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          color: '#000000',
                          fontSize: '0.88rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#000000')}
                        onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                      />
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label htmlFor="lead-phone" className="sr-only">Phone Number</label>
                      <Phone size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#999999', pointerEvents: 'none' }} />
                      <input
                        id="lead-phone"
                        type="tel"
                        name="phone"
                        aria-label="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 34px',
                          background: '#fcfcfc',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          color: '#000000',
                          fontSize: '0.88rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#000000')}
                        onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                      />
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label htmlFor="lead-email" className="sr-only">Email Address (required)</label>
                    <Mail size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#999999', pointerEvents: 'none' }} />
                    <input
                      id="lead-email"
                      type="email"
                      name="email"
                      aria-label="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address *"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 12px 11px 34px',
                        background: '#fcfcfc',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        color: '#000000',
                        fontSize: '0.88rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#000000')}
                      onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label htmlFor="lead-message" className="sr-only">Project Location / Message (optional)</label>
                    <MessageSquare size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#999999', pointerEvents: 'none' }} />
                    <textarea
                      id="lead-message"
                      name="message"
                      aria-label="Project Location / Message (optional)"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Project location / message (optional)"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '11px 12px 11px 34px',
                        background: '#fcfcfc',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        color: '#000000',
                        fontSize: '0.88rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#000000')}
                      onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                    />
                  </div>

                  {error && (
                    <div
                      style={{
                        color: '#dc2626',
                        fontSize: '0.8rem',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '8px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Actions: Submit & Direct Download */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="submit"
                      disabled={submitting || generatingPdf}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #000000',
                        borderRadius: '6px',
                        fontSize: '0.92rem',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                        cursor: submitting || generatingPdf ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: submitting || generatingPdf ? 0.75 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting && !generatingPdf) e.currentTarget.style.background = '#222222';
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting && !generatingPdf) e.currentTarget.style.background = '#000000';
                      }}
                    >
                      {submitting || generatingPdf ? (
                        <Loader2 size={15} className="spin" />
                      ) : mode === 'download' ? (
                        <Download size={15} />
                      ) : (
                        <ArrowRight size={15} />
                      )}
                      <span>
                        {submitting || generatingPdf
                          ? 'Generating PDF Brochure...'
                          : mode === 'download'
                          ? `Download ${formattedCategory} Portfolio (.PDF)`
                          : 'Submit Inquiry'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={generatingPdf}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#777777',
                        fontSize: '0.82rem',
                        fontWeight: 400,
                        cursor: generatingPdf ? 'not-allowed' : 'pointer',
                        padding: '6px 0',
                        letterSpacing: '0.02em',
                        transition: 'color 0.2s ease',
                        textAlign: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#000000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#777777';
                      }}
                    >
                      {generatingPdf
                        ? 'Preparing PDF...'
                        : mode === 'download'
                        ? 'Download PDF directly without submitting'
                        : 'Skip & View Project'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ textAlign: 'center', padding: '24px 0' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#ffffff',
                  }}
                >
                  <Check size={22} />
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: '#000000',
                    margin: '0 0 6px 0',
                    fontFamily: 'var(--font-canela), Georgia, serif',
                  }}
                >
                  {mode === 'download' ? 'PDF Portfolio Downloaded' : 'Inquiry Received'}
                </h3>
                <p
                  style={{
                    color: '#666666',
                    fontSize: '0.86rem',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {mode === 'download'
                    ? `Your multi-page ${formattedCategory} architecture lookbook PDF has been generated and saved.`
                    : `Thank you. We have received your inquiry for ${modalHeading}.`}
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
