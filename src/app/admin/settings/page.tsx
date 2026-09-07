'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle, Lock, AlertCircle, KeyRound } from 'lucide-react';
import { siteSettings as defaultSettings, SiteSettings } from '@/data/projects';
import { changePasswordAction } from '@/actions/auth.actions';

export default function SettingsAdminPage() {
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('attiks_admin_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSavedSuccess(false);

    try {
      localStorage.setItem('attiks_admin_settings', JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePasswordAction({ currentPassword, newPassword });
      if (res.success) {
        setPasswordMessage({ type: 'success', text: 'Admin password updated successfully in PostgreSQL database!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: res.error || 'Failed to update password' });
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Admin Settings</h1>
            <p className="admin-page-subtitle">Configure website branding, admin credentials, and notifications</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="admin-table-wrap" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.25rem', borderColor: 'var(--admin-success)', background: 'rgba(76,175,125,0.12)', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={16} />
            <span>Site settings successfully updated and saved!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-table-wrap" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#fff' }}>General Website Information</h2>

          <div className="admin-field" style={{ marginBottom: '1.25rem' }}>
            <label className="admin-label">Website Title Tag</label>
            <input
              type="text"
              className="admin-input"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              required
            />
          </div>

          <div className="admin-field" style={{ marginBottom: '1.25rem' }}>
            <label className="admin-label">Brand Tagline</label>
            <input
              type="text"
              className="admin-input"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="admin-field">
              <label className="admin-label">Contact Email</label>
              <input
                type="email"
                className="admin-input"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Contact Phone</label>
              <input
                type="text"
                className="admin-input"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-field" style={{ marginBottom: '1.5rem' }}>
            <label className="admin-label">Office Address</label>
            <textarea
              className="admin-textarea"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'var(--admin-surface-2)', borderRadius: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={settings.enableLeadsNotification}
                onChange={(e) => setSettings({ ...settings, enableLeadsNotification: e.target.checked })}
              />
              <span>Enable instant notifications for new website enquiries</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              <span>Enable Maintenance Banner on Public Site</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              <Save size={14} />
              {submitting ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Reset Password Section */}
      <div className="admin-table-wrap" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <KeyRound size={20} style={{ color: '#fff' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Admin Password Reset</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
          Update your administrator login password stored securely in the PostgreSQL database.
        </p>

        {passwordMessage && (
          <div
            style={{
              padding: '0.875rem 1.25rem',
              marginBottom: '1.25rem',
              borderRadius: 4,
              border: `1px solid ${passwordMessage.type === 'success' ? 'var(--admin-success, #4caf7d)' : '#ff5555'}`,
              background: passwordMessage.type === 'success' ? 'rgba(76,175,125,0.12)' : 'rgba(255,85,85,0.12)',
              color: passwordMessage.type === 'success' ? 'var(--admin-success, #4caf7d)' : '#ff5555',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.88rem',
            }}
          >
            {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="admin-field" style={{ marginBottom: '1.25rem' }}>
            <label className="admin-label">Current Password</label>
            <input
              type="password"
              className="admin-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current admin password"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="admin-field">
              <label className="admin-label">New Password</label>
              <input
                type="password"
                className="admin-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Confirm New Password</label>
              <input
                type="password"
                className="admin-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={passwordLoading}>
              <Lock size={14} />
              {passwordLoading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

