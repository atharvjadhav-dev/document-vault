import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentsApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { formatFileSize, formatDate } from '../utils/helpers';
import FileIcon from '../components/ui/FileIcon';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CategoryBadge from '../components/ui/CategoryBadge';
import Button from '../components/ui/Button';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';

const MAX_STORAGE_MB = 500;

const StatCard = ({ code, label, value, sub }) => (
  <div className="card p-4 sm:p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between gap-2 mb-3">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
        {code}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-vault-500" />
    </div>
    <div>
      <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value}
      </p>
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{label}</p>
      {sub && <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const toast    = useToast();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentsApi.getStats();
        setStats(res.data.data.stats);
        setRecent(res.data.data.recentDocuments);
      } catch {
        toast.error('Failed to load vault telemetry.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownload = async (doc) => {
    try {
      await documentsApi.download(doc.id, doc.original_filename);
      toast.success(`"${doc.original_filename}" downloaded.`);
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <LoadingSpinner size="lg" message="Synchronizing vault telemetry…" />
      </div>
    );
  }

  const totalDocs      = stats?.total_documents ?? 0;
  const totalSizeRaw   = parseInt(stats?.total_size ?? 0, 10);
  const recentCount    = stats?.recent_uploads ?? 0;
  const storageUsedMB  = totalSizeRaw / (1024 * 1024);
  const storagePercent = Math.min((storageUsedMB / MAX_STORAGE_MB) * 100, 100);
  const firstName      = user?.fullName?.split(' ')[0] || 'Operator';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-surface-dark-200">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-vault-600 dark:text-vault-400 uppercase font-semibold mb-1">
            <span>// WORKSPACE_OVERVIEW</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400">S3 ap-south-1</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {firstName}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/documents" className="btn-md btn-secondary flex-1 sm:flex-initial justify-center">
            Browse Files
          </Link>
          <Link to="/upload" className="flex-1 sm:flex-initial">
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Ingest File
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Column Bento Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          code="01 / OBJECTS"
          label="Stored Documents"
          value={totalDocs}
          sub="Verified signatures"
        />
        <StatCard
          code="02 / VOLUME"
          label="Storage Consumed"
          value={formatFileSize(totalSizeRaw)}
          sub={`of ${MAX_STORAGE_MB} MB allocation`}
        />
        <StatCard
          code="03 / VELOCITY"
          label="7-Day Ingestions"
          value={recentCount}
          sub="Recent uploads"
        />
        <StatCard
          code="04 / TAXONOMY"
          label="Active Categories"
          value={stats?.categories?.length ?? 0}
          sub="Indexed classifications"
        />
      </div>

      {/* Storage Allocation Bar */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                S3 Bucket Quota Allocation
              </h2>
              <span className="badge-green font-mono">ENCRYPTED</span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              {formatFileSize(totalSizeRaw)} used of {MAX_STORAGE_MB} MB capacity
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-vault-600 dark:text-vault-400">
            {storagePercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-surface-dark-100 rounded-full overflow-hidden border border-slate-200/60 dark:border-surface-dark-200">
          <div
            className="h-full rounded-full bg-vault-600 transition-all duration-700"
            style={{ width: `${Math.max(storagePercent, totalDocs > 0 ? 2 : 0)}%` }}
          />
        </div>
      </div>

      {/* Lower Split Grid: Recent Documents + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Documents (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 card p-4 sm:p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-surface-dark-200">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Recent Ingestions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap any file to launch ephemeral preview
              </p>
            </div>
            <Link
              to="/documents"
              className="text-xs font-mono font-semibold text-vault-600 dark:text-vault-400 hover:underline"
            >
              View all →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-surface-dark-100 flex items-center justify-center mb-3 text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No documents ingested yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-xs">
                Upload your first PDF, image, or Word document to verify and store it in AWS S3.
              </p>
              <Link to="/upload" className="btn-sm btn-primary">
                Upload First Document
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-surface-dark-200">
              {recent.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-dark-100/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileIcon mimeType={doc.mime_type} filename={doc.original_filename} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-vault-600 dark:group-hover:text-vault-400 transition-colors">
                        {doc.original_filename}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge category={doc.category} />
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDate(doc.uploaded_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                      {formatFileSize(doc.file_size)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc);
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-vault-50 dark:bg-surface-dark-100 dark:hover:bg-vault-950/50 text-slate-600 hover:text-vault-600 dark:text-slate-300 dark:hover:text-vault-400 transition-colors"
                      title="Download"
                      aria-label="Download"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Distribution (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 card p-4 sm:p-6">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-surface-dark-200">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Category Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Classification breakdown across vault
            </p>
          </div>

          {!stats?.categories?.length ? (
            <p className="text-xs font-mono text-slate-400 text-center py-10">
              NO_CATEGORIES_INDEXED
            </p>
          ) : (
            <div className="space-y-3.5">
              {stats.categories.map((cat) => {
                const pct = totalDocs > 0 ? (cat.count / totalDocs) * 100 : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <CategoryBadge category={cat.category} />
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {cat.count} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-surface-dark-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-vault-500 transition-all duration-500"
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

      {/* Preview Modal from Dashboard */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default DashboardPage;
