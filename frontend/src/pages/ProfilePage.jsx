import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { documentsApi } from '../services/api';
import { formatFileSize, formatDate } from '../utils/helpers';
import Button from '../components/ui/Button';

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 py-3 border-b border-slate-100 dark:border-surface-dark-200 last:border-0">
    <span className="text-xs font-mono uppercase text-slate-400 dark:text-slate-500">{label}</span>
    <span className={`text-sm font-semibold text-slate-900 dark:text-white truncate ${mono ? 'font-mono text-xs' : ''}`}>
      {value}
    </span>
  </div>
);

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const toast    = useToast();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentsApi.getStats();
        setStats(res.data.data.stats);
      } catch {
        // Non-blocking
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('Session terminated.');
    navigate('/login');
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200/80 dark:border-surface-dark-200">
        <div className="flex items-center gap-2 text-[11px] font-mono text-vault-600 dark:text-vault-400 uppercase font-semibold mb-1">
          <span>// OPERATOR_IDENTITY</span>
          <span>·</span>
          <span className="text-emerald-600 dark:text-emerald-400">AUTHENTICATED</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Account &amp; Security
        </h1>
      </div>

      {/* Operator Identity Card */}
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-vault-600 text-white flex items-center justify-center text-xl font-mono font-bold shadow-vault shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                {user?.fullName}
              </h2>
              <span className="badge-green font-mono">ACTIVE</span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          size="md"
          onClick={handleLogout}
          className="w-full sm:w-auto justify-center"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
        >
          Sign Out
        </Button>
      </div>

      {/* Account Telemetry & Storage Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5 sm:p-6">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-3">
            Identity Record
          </h3>
          <InfoRow label="Operator Name" value={user?.fullName || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} mono />
          <InfoRow label="UUID" value={user?.id ? `${user.id.slice(0, 18)}…` : '—'} mono />
          <InfoRow label="Provisioned" value={formatDate(user?.createdAt)} mono />
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-3">
            Repository Metrics
          </h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-slate-100 dark:bg-surface-dark-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <InfoRow label="Stored Objects" value={stats?.total_documents ?? 0} mono />
              <InfoRow
                label="S3 Volume Used"
                value={formatFileSize(parseInt(stats?.total_size ?? 0, 10))}
                mono
              />
              <InfoRow label="7d Ingestions" value={stats?.recent_uploads ?? 0} mono />
              <InfoRow label="S3 Region" value="ap-south-1 (Mumbai)" mono />
            </>
          )}
        </div>
      </div>

      {/* Interface Preferences */}
      <div className="card p-5 sm:p-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Interface Appearance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Toggle between Obsidian Dark and High-Contrast Light theme
          </p>
        </div>

        <button
          onClick={toggle}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 shrink-0 ${
            isDark ? 'bg-vault-600' : 'bg-slate-200'
          }`}
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle Dark Mode"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              isDark ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Cryptographic Posture Notice */}
      <div className="card p-5 bg-slate-950 text-slate-300 border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
          <span>// SECURITY_SPECIFICATION</span>
          <span>ENFORCED</span>
        </div>
        <p className="text-slate-400 leading-relaxed font-sans text-xs">
          Credentials are hashed using <code className="font-mono text-slate-200">bcrypt (12 rounds)</code>. File downloads use single-use 60-second signed tokens and never expose session JWTs in query parameters.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
