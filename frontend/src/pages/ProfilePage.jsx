import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { documentsApi } from '../services/api';
import { formatFileSize, formatDate } from '../utils/helpers';
import Button from '../components/ui/Button';

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-surface-dark-200 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
  </div>
);

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const toast    = useToast();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentsApi.getStats();
        setStats(res.data.data.stats);
      } catch {
        // silently fail — stats aren't critical on profile page
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/login');
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your account details and preferences.
        </p>
      </div>

      {/* Avatar + name card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-400 to-vault-700 flex items-center justify-center text-white text-2xl font-bold shadow-vault flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Account Details</h3>
        <InfoRow label="Full Name"   value={user?.fullName || '—'} />
        <InfoRow label="Email"       value={user?.email || '—'} />
        <InfoRow label="Account ID"  value={user?.id?.slice(0, 18) + '…' || '—'} />
        <InfoRow label="Member Since" value={formatDate(user?.createdAt)} />
      </div>

      {/* Storage stats */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Storage Summary</h3>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map((i) => (
              <div key={i} className="h-8 bg-surface-100 dark:bg-surface-dark-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <InfoRow label="Total Documents" value={stats?.total_documents ?? 0} />
            <InfoRow label="Storage Used"    value={formatFileSize(parseInt(stats?.total_size ?? 0))} />
            <InfoRow label="Recent Uploads (7d)" value={stats?.recent_uploads ?? 0} />
          </>
        )}
      </div>

      {/* Preferences */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Preferences</h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between light and dark theme
            </p>
          </div>
          {/* Toggle switch */}
          <button
            onClick={toggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-vault-400 focus:ring-offset-2 ${isDark ? 'bg-vault-500' : 'bg-surface-200 dark:bg-surface-dark-200'}`}
            role="switch"
            aria-checked={isDark}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl bg-vault-50 dark:bg-vault-900/20 border border-vault-100 dark:border-vault-800">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-vault-600 dark:text-vault-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-vault-800 dark:text-vault-200">Security</p>
            <p className="text-xs text-vault-700 dark:text-vault-300 mt-0.5 leading-relaxed">
              Your password is hashed with bcrypt (12 rounds). Documents are stored securely and only accessible to you.
            </p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-100 dark:border-red-900/40">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">Sign Out</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          You will need to log in again to access your vault.
        </p>
        <Button variant="danger" onClick={handleLogout} icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        }>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
