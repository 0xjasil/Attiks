'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginAction } from '@/actions/auth.actions';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';

  const [email, setEmail] = useState('admin@attiks.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter email and password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });
      if (res.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('attiks_admin_session', 'authenticated');
          if (res.user) {
            localStorage.setItem('attiks_admin_user', JSON.stringify(res.user));
          }
        }
        router.push(redirectUrl);
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fbfbfb',
        padding: '20px',
        color: '#09090b',
        fontFamily: 'var(--font-admin, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '12px',
          padding: '36px 28px',
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.05)',
          boxSizing: 'border-box',
        }}
      >
        {/* Studio Logo */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <Image
            src="/images/logogb.png"
            alt="Attiks Logo"
            width={120}
            height={34}
            style={{ objectFit: 'contain', height: '30px', width: 'auto', margin: '0 auto 16px', display: 'block' }}
            priority
          />
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 500,
              color: '#09090b',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Sign In
          </h1>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#b91c1c',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#71717a',
                marginBottom: 5,
              }}
            >
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@attiks.in"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 34px',
                  background: '#fcfcfc',
                  border: '1px solid #e4e4e7',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  color: '#09090b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#09090b')}
                onBlur={(e) => (e.target.style.borderColor = '#e4e4e7')}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#71717a',
                marginBottom: 5,
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  pointerEvents: 'none',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 34px',
                  background: '#fcfcfc',
                  border: '1px solid #e4e4e7',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  color: '#09090b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#09090b')}
                onBlur={(e) => (e.target.style.borderColor = '#e4e4e7')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 9,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '10px 16px',
              background: '#09090b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.86rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#27272a';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#09090b';
            }}
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '18px', borderTop: '1px solid #f4f4f5', paddingTop: '14px' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.8rem',
              color: '#71717a',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#09090b')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
          >
            &larr; Back
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fbfbfb' }} />}>
      <AdminLoginForm />
    </Suspense>
  );
}
