'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Department } from '@/types/careers';
import '@/app/careers/careers.css';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  jobId?: string;
  jobTitle?: string;
  jobSlug?: string;
  department?: Department | string;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  jobId,
  jobTitle,
  jobSlug,
  department,
}: ApplicationModalProps) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: jobTitle || 'General open application',
    portfolioUrl: '',
    yearsOfExperience: '',
    coverNote: '',
    honeypot: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (jobTitle) {
      setForm((prev) => ({ ...prev, position: jobTitle }));
    }
  }, [jobTitle]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF document.');
      setSelectedFile(null);
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('File size exceeds the 10 MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const uploadResumeFile = async (): Promise<{ url?: string; fileName?: string } | null> => {
    if (!selectedFile) return null;

    setUploadProgress(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const json = await res.json();
      const uploadedUrl = json.data?.url || json.url || json.data?.urls?.[0];

      return {
        url: uploadedUrl,
        fileName: selectedFile.name,
      };
    } catch (err) {
      console.warn('Resume upload error:', err);
      return null;
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please provide your full name, email address, and phone number.');
      return;
    }

    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      let resumeData: { url?: string; fileName?: string } | null = null;
      if (selectedFile) {
        resumeData = await uploadResumeFile();
      }

      const payload = {
        jobId,
        jobTitle: form.position || jobTitle || 'General open application',
        jobSlug,
        department,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience || '1-3 Years',
        coverNote: form.coverNote.trim() || undefined,
        resumeUrl: resumeData?.url,
        resumeFileName: resumeData?.fileName || selectedFile?.name,
        honeypot: form.honeypot,
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json().catch(() => ({}));

      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || 'Failed to submit application. Please try again.');
      }

      setSubmitted(true);

      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        setTimeout(() => {
          setSubmitted(false);
          setForm({
            fullName: '',
            email: '',
            phone: '',
            position: jobTitle || 'General open application',
            portfolioUrl: '',
            yearsOfExperience: '',
            coverNote: '',
            honeypot: '',
          });
          setSelectedFile(null);
          onClose();
        }, 1200);
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to submit application at this moment.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || uploadProgress;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="bf-careers bf-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="career-modal-title" onClick={onClose}>
          <motion.div
            ref={modalRef}
            className="bf-modal"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeRef} type="button" className="bf-modal__close" onClick={onClose} aria-label="Close application dialog">
              <X size={16} />
            </button>

            {submitted ? (
              <div className="bf-success">
                <div className="bf-success__mark">
                  <Check size={20} />
                </div>
                <h3 id="career-modal-title" className="bf-label">
                  Application received
                </h3>
                <p className="bf-copy" style={{ margin: 'var(--space-2) auto 0' }}>
                  Thank you for sharing your portfolio. The studio will review your work and reach out if there is alignment.
                </p>
              </div>
            ) : (
              <div>
                <p className="bf-kicker">Attiks studio careers</p>
                <h2 id="career-modal-title" className="bf-label">
                  {jobTitle ? `Apply for ${jobTitle}` : 'Studio application'}
                </h2>
                <p className="bf-copy" style={{ margin: 'var(--space-2) 0 var(--space-4)' }}>
                  Submit your credentials and a work sample to be considered.
                </p>

                {error && (
                  <div className="bf-error" role="alert">
                    <AlertCircle size={16} aria-hidden="true" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <label htmlFor="modal-honeypot">Leave blank</label>
                    <input
                      id="modal-honeypot"
                      name="honeypot"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.honeypot}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bf-grid-2">
                    <label className="bf-field" htmlFor="app-name">
                      <span>
                        Full name <span className="bf-req">*</span>
                      </span>
                      <input
                        id="app-name"
                        name="fullName"
                        type="text"
                        required
                        placeholder="Maya Thomas"
                        value={form.fullName}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="bf-field" htmlFor="app-email">
                      <span>
                        Email address <span className="bf-req">*</span>
                      </span>
                      <input
                        id="app-email"
                        name="email"
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <div className="bf-grid-2">
                    <label className="bf-field" htmlFor="app-phone">
                      <span>
                        Phone number <span className="bf-req">*</span>
                      </span>
                      <input
                        id="app-phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+91 98470 00000"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="bf-field" htmlFor="app-experience">
                      <span>Experience level</span>
                      <select
                        id="app-experience"
                        name="yearsOfExperience"
                        value={form.yearsOfExperience}
                        onChange={handleChange}
                      >
                        <option value="">Select experience level</option>
                        <option value="Student / Intern">Student / internship seeking</option>
                        <option value="1 - 3 Years">1 - 3 years</option>
                        <option value="4 - 6 Years">4 - 6 years</option>
                        <option value="7+ Years">7+ years</option>
                      </select>
                    </label>
                  </div>

                  <label className="bf-field" htmlFor="app-portfolio" style={{ marginBottom: 'var(--space-2)' }}>
                    <span>Portfolio link</span>
                    <input
                      id="app-portfolio"
                      name="portfolioUrl"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={form.portfolioUrl}
                      onChange={handleChange}
                    />
                  </label>

                  <div className="bf-field" style={{ marginBottom: 'var(--space-2)' }}>
                    <span>Resume / work sample (PDF, max 10 MB)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      id="resume-pdf-upload"
                    />
                    <button type="button" className="bf-upload" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={16} aria-hidden="true" />{' '}
                      {selectedFile ? selectedFile.name : 'Upload your CV / portfolio PDF'}
                    </button>
                    {uploadError && (
                      <span className="bf-error" role="alert">
                        {uploadError}
                      </span>
                    )}
                  </div>

                  <label className="bf-field" htmlFor="app-cover" style={{ marginBottom: 'var(--space-4)' }}>
                    <span>Cover note</span>
                    <textarea
                      id="app-cover"
                      name="coverNote"
                      rows={3}
                      placeholder="Share why you want to join Attiks."
                      value={form.coverNote}
                      onChange={handleChange}
                    />
                  </label>

                  <button type="submit" className="bf-btn" disabled={busy} aria-busy={busy}>
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} aria-hidden="true" />}
                    {busy ? 'Processing application' : 'Submit application'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
