import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth';
import * as api from '../../services/api';
import {
  FiCpu,
  FiArrowLeft,
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiCalendar,
  FiShield,
} from 'react-icons/fi';

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const updates = {};
    if (name !== user?.name) updates.name = name;
    if (email !== user?.email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      setError('No changes to save.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateProfile(updates);
      setUser(res.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiCpu className="text-primary-500 text-2xl" />
            <span className="text-white font-bold text-xl">SysDesign AI</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-dark-800"
          >
            <FiArrowLeft />
            <span className="text-sm">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ─── Profile Header Card ─── */}
        <section
          className="relative overflow-hidden rounded-2xl border border-dark-700"
          style={{
            background: 'linear-gradient(135deg, #0c1222 0%, #111d35 50%, #162040 100%)',
          }}
        >
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
          />
          <div className="relative px-8 py-8 flex items-center gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
              }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name || 'User'}</h1>
              <p className="text-dark-300 text-sm flex items-center gap-1.5 mt-1">
                <FiMail style={{ fontSize: 13 }} />
                {user?.email}
              </p>
              <p className="text-dark-400 text-xs flex items-center gap-1.5 mt-1.5">
                <FiCalendar style={{ fontSize: 12 }} />
                Member since {formatDate(user?.created_at || user?.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* ─── Status Messages ─── */}
        {success && (
          <div
            className="flex items-center gap-3 rounded-xl px-5 py-3 border"
            style={{ borderColor: '#22c55e30', background: '#22c55e08' }}
          >
            <FiCheck className="text-green-400 shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}
        {error && (
          <div
            className="flex items-center gap-3 rounded-xl px-5 py-3 border"
            style={{ borderColor: '#ef444430', background: '#ef444408' }}
          >
            <FiAlertCircle className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ─── Edit Profile ─── */}
          <section
            className="rounded-2xl border border-dark-700 p-6"
            style={{ background: '#0f172a' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FiUser className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Personal Info</h2>
                <p className="text-dark-400 text-xs">Update your name and email</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-dark-300 text-xs font-medium mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-xs font-medium mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors w-full justify-center mt-2"
              >
                <FiSave className="text-sm" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* ─── Change Password ─── */}
          <section
            className="rounded-2xl border border-dark-700 p-6"
            style={{ background: '#0f172a' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <FiShield className="text-yellow-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Change Password</h2>
                <p className="text-dark-400 text-xs">Secure your account</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-dark-300 text-xs font-medium mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-xs font-medium mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-xs font-medium mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors w-full justify-center mt-2"
              >
                <FiLock className="text-sm" />
                {saving ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </section>

        </div>

      </main>
    </div>
  );
}
