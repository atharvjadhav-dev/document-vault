import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentsApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { formatFileSize, formatDate, getCategoryBadge, CATEGORY_COLORS } from '../utils/helpers';
import FileIcon from '../components/ui/FileIcon';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CategoryBadge from '../components/ui/CategoryBadge';
import Button from '../components/ui/Button';

const MAX_STORAGE_MB = 500; // Display cap for progress bar

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="rounded-2xl p-4 sm:p-5 border border-surface-100 dark:border-surface-dark-200 bg-white dark:bg-surface-dark-50 shadow-sm sm:shadow-card">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const toast    = useToast();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentsApi.getStats();
        setStats(res.data.data.stats);
        setRecent(res.data.data.recentDocuments);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading dashboard…" />
      </div>
    );
  }

  const totalDocs    = stats?.total_documents ?? 0;
  const totalSizeRaw = parseInt(stats?.total_size ?? 0);
  const recentCount  = stats?.recent_uploads  ?? 0;
  const storageUsedMB  = totalSizeRaw / (1024 * 1024);
  const storagePercent = Math.min((storageUsedMB / MAX_STORAGE_MB) * 100, 100);

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's in your vault today.
          </p>
        </div>
        <Link to="/upload">
          <Button variant="primary" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Upload
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Documents"
          value={totalDocs}
          sub="In your vault"
          color="bg-vault-50 dark:bg-vault-900/20 text-vault-600 dark:text-vault-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Storage Used"
          value={formatFileSize(totalSizeRaw)}
          sub={`${MAX_STORAGE_MB} MB limit`}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
        />
        <StatCard
          label="Recent Uploads"
          value={recentCount}
          sub="Last 7 days"
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={stats?.categories?.length ?? 0}
          sub="Document types"
          color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
      </div>

      {/* Storage bar */}
      <div className="rounded-2xl p-4 sm:p-5 border-0 sm:border border-surface-100 dark:border-surface-dark-200 bg-transparent sm:bg-white dark:bg-transparent dark:sm:bg-surface-dark-50 shadow-none sm:shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Storage Usage</h3>
            <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(totalSizeRaw)} of {MAX_STORAGE_MB} MB used</p>
          </div>
          <span className="text-sm font-bold text-vault-600 dark:text-vault-400">
            {storagePercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-surface-100 dark:bg-surface-dark-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vault-400 to-vault-600 transition-all duration-700"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent documents */}
        <div className="lg:col-span-3 rounded-2xl p-4 sm:p-5 border-0 sm:border border-surface-100 dark:border-surface-dark-200 bg-transparent sm:bg-white dark:bg-transparent dark:sm:bg-surface-dark-50 shadow-none sm:shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Documents</h2>
            <Link to="/documents" className="text-xs text-vault-600 dark:text-vault-400 hover:underline font-medium">
              View all →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-50 dark:bg-surface-dark-100 flex items-center justify-center mb-3 text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No documents yet</p>
              <Link to="/upload" className="mt-3 text-xs text-vault-600 dark:text-vault-400 hover:underline">
                Upload your first document →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((doc) => (
                <div key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-dark-100 transition-colors group"
                >
                  <FileIcon mimeType={doc.mime_type} filename={doc.original_filename} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {doc.original_filename}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={doc.category} />
                      <span className="text-xs text-slate-400">{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                    {formatFileSize(doc.file_size)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="lg:col-span-2 rounded-2xl p-4 sm:p-5 border-0 sm:border border-surface-100 dark:border-surface-dark-200 bg-transparent sm:bg-white dark:bg-transparent dark:sm:bg-surface-dark-50 shadow-none sm:shadow-card">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">By Category</h2>
          {!stats?.categories?.length ? (
            <p className="text-sm text-slate-400 text-center py-8">No categories yet</p>
          ) : (
            <div className="space-y-3">
              {stats.categories.map((cat) => {
                const pct = totalDocs > 0 ? (cat.count / totalDocs) * 100 : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <CategoryBadge category={cat.category} />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {cat.count} doc{cat.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-dark-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-vault-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default DashboardPage;
