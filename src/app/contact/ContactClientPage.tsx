'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';

export default function ContactClientPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      setError('Please provide your first name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const payload = {
        name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        message: formData.message.trim() || undefined,
        source: 'contact_page',
        projectTitle: 'Contact Page Inquiry',
        notes: 'Inquiry submitted from Contact Page form',
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || 'Submission failed. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Unable to submit your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
    });
    setSubmitted(false);
    setError('');
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Main Content */}
        <section style={{ padding: '160px var(--section-padding) 120px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '80px' }}>
              <PageHeader 
                label="Contact Us"
                title={<>Let&apos;s shape your{' '}<br />vision together</>}
              />
              <p style={{ fontSize: 'clamp(18px, 1.3vw, 21px)', color: '#333333', maxWidth: '580px', marginTop: '2rem', lineHeight: '1.75', fontWeight: 350 }}>
                Whether you are looking to commission an architectural landmark or design a private sanctuary, our practice provides personalized, expert guidance at every stage.
              </p>
            </div>

            <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'stretch' }}>
              {/* Map Section */}
              <div className="contact-map-container" style={{ minHeight: '440px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                <iframe 
                  title="Attiks Architecture Studio Locations"
                  src="https://www.google.com/maps/d/embed?mid=1AGNpIWX6rbzzsTDXTef1uOw5ItpvBRRW&ehbc=2E312F" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '440px' }} 
                  allowFullScreen 
                  loading="lazy"
                />
              </div>

              {/* Form Section */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        background: '#fafafa',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        padding: '48px 36px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                    >
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: '#111111',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <Check size={28} />
                      </div>
                      <h3 style={{ fontSize: 'clamp(22px, 1.8vw, 26px)', fontFamily: 'var(--font-canela), serif', margin: 0 }}>
                        Message Sent Successfully
                      </h3>
                      <p style={{ color: '#555555', fontSize: '17px', lineHeight: '1.6', maxWidth: '420px', margin: 0 }}>
                        Thank you for reaching out. An architectural partner from our studio will review your inquiry and connect with you shortly.
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="btn-premium"
                        style={{
                          marginTop: '16px',
                          padding: '12px 28px',
                          background: '#111111',
                          color: '#ffffff',
                          borderRadius: '4px',
                          border: 'none',
                          fontSize: '16px',
                          cursor: 'pointer',
                        }}
                      >
                        Send Another Inquiry
                      </button>
                    </motion.div>
                  ) : (
                    <form
                      key="form"
                      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                      onSubmit={handleSubmit}
                      noValidate
                    >
                      {error && (
                        <div
                          role="alert"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <AlertCircle size={18} />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="form-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                          <label htmlFor="first-name" className="sr-only">
                            First Name (required)
                          </label>
                          <input
                            id="first-name"
                            name="firstName"
                            type="text"
                            placeholder="First Name *"
                            value={formData.firstName}
                            onChange={handleChange}
                            autoComplete="given-name"
                            required
                            aria-required="true"
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: '1.5px solid #cccccc',
                              padding: '14px 0',
                              color: '#111111',
                              fontSize: 'clamp(18px, 1.1vw, 20px)',
                              outline: 'none',
                              transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderBottomColor = '#111111')}
                            onBlur={(e) => (e.target.style.borderBottomColor = '#cccccc')}
                          />
                        </div>
                        <div>
                          <label htmlFor="last-name" className="sr-only">
                            Last Name
                          </label>
                          <input
                            id="last-name"
                            name="lastName"
                            type="text"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            autoComplete="family-name"
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: '1.5px solid #cccccc',
                              padding: '14px 0',
                              color: '#111111',
                              fontSize: 'clamp(18px, 1.1vw, 20px)',
                              outline: 'none',
                              transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderBottomColor = '#111111')}
                            onBlur={(e) => (e.target.style.borderBottomColor = '#cccccc')}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="sr-only">
                          Email Address (required)
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder="Email Address *"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="email"
                          required
                          aria-required="true"
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1.5px solid #cccccc',
                            padding: '14px 0',
                            color: '#111111',
                            fontSize: 'clamp(18px, 1.1vw, 20px)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#111111')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#cccccc')}
                        />
                      </div>

                      <div>
                        <label htmlFor="phone-number" className="sr-only">
                          Phone Number
                        </label>
                        <input
                          id="phone-number"
                          name="phone"
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1.5px solid #cccccc',
                            padding: '14px 0',
                            color: '#111111',
                            fontSize: 'clamp(18px, 1.1vw, 20px)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#111111')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#cccccc')}
                        />
                      </div>

                      <div>
                        <label htmlFor="project-desc" className="sr-only">
                          Tell us about your project or inquiry
                        </label>
                        <textarea
                          id="project-desc"
                          name="message"
                          placeholder="Tell us about your project or inquiry"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1.5px solid #cccccc',
                            padding: '14px 0',
                            color: '#111111',
                            fontSize: 'clamp(18px, 1.1vw, 20px)',
                            outline: 'none',
                            resize: 'vertical',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#111111')}
                          onBlur={(e) => (e.target.style.borderBottomColor = '#cccccc')}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-premium"
                        style={{
                          width: '100%',
                          marginTop: '0.5rem',
                          height: '56px',
                          background: '#000000',
                          color: '#ffffff',
                          borderColor: '#000000',
                          borderRadius: '4px',
                          fontSize: 'clamp(18px, 1.15vw, 20px)',
                          fontWeight: 400,
                          textTransform: 'none',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          opacity: submitting ? 0.75 : 1,
                        }}
                      >
                        <span>{submitting ? 'Sending message...' : 'Send message'}</span>
                        {!submitting && <ArrowRight size={18} />}
                      </button>
                    </form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Addresses Section */}
            <div className="grid-responsive-3" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '60px', 
              marginTop: '120px', 
              borderTop: '1px solid #e5e5e5', 
              paddingTop: '80px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'clamp(18px, 1.2vw, 21px)', fontWeight: 400, marginBottom: '1.5rem', color: '#000000', textTransform: 'none', letterSpacing: '-0.01em' }}>Calicut</h3>
                <address style={{ color: '#555555', fontSize: 'clamp(18px, 1.1vw, 19.5px)', fontWeight: 400, lineHeight: '1.8', fontStyle: 'normal' }}>
                  Krishna Tower, NH 66<br />
                  Near Raviz Kadavu Resort<br />
                  Calicut, Kerala &ndash; 673632<br />
                  <a href="tel:+918589022307" style={{ color: '#000000', fontWeight: 400, display: 'block', marginTop: '10px', textDecoration: 'none' }}>+91 85890 22307</a>
                </address>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'clamp(18px, 1.2vw, 21px)', fontWeight: 400, marginBottom: '1.5rem', color: '#000000', textTransform: 'none', letterSpacing: '-0.01em' }}>Bangalore</h3>
                <address style={{ color: '#555555', fontSize: 'clamp(18px, 1.1vw, 19.5px)', fontWeight: 400, lineHeight: '1.8', fontStyle: 'normal' }}>
                  No.1DC-121, 1st D Cross<br />
                  2nd Main, Kasturinagar<br />
                  Bangalore &ndash; 560 043<br />
                  <span style={{ color: '#000000', fontWeight: 400, display: 'block', marginTop: '10px' }}>+91 8589 011307</span>
                </address>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'clamp(18px, 1.2vw, 21px)', fontWeight: 400, marginBottom: '1.5rem', color: '#000000', textTransform: 'none', letterSpacing: '-0.01em' }}>Dubai</h3>
                <address style={{ color: '#555555', fontSize: 'clamp(18px, 1.1vw, 19.5px)', fontWeight: 400, lineHeight: '1.8', fontStyle: 'normal' }}>
                  Aspect Tower 906<br />
                  Business Bay, Dubai<br />
                  UAE<br />
                  <span style={{ color: '#000000', fontWeight: 400, display: 'block', marginTop: '10px' }}>hello@attiks.ae</span>
                </address>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
