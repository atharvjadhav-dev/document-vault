import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { documentsApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { CATEGORIES, getErrorMessage } from '../utils/helpers';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentRow from '../components/documents/DocumentRow';
import EditDocumentModal from '../components/documents/EditDocumentModal';
import DeleteConfirmModal from '../components/documents/DeleteConfirmModal';
import DocumentDetailModal from '../components/documents/DocumentDetailModal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const DocumentsPage = () => {
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchRaw, setSearchRaw] = useState('');
  const [category, setCategory]   = useState('');
  const [viewMode, setViewMode]   = useState(() => localStorage.getItem('vault_view') || 'grid');

  const [editDoc,    setEditDoc]    = useState(null);
  const [deleteDoc,  setDeleteDoc]  = useState(null);
  const [viewDoc,    setViewDoc]    = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const search = useDebounce(searchRaw, 300);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)   params.search   = search;
      if (category) params.category = category;
      const res = await documentsApi.getAll(params);
      setDocuments(res.data.data.documents);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const setView = (v) => {
    setViewMode(v);
    localStorage.setItem('vault_view', v);
  };

  const handleDownload = async (doc) => {
    try {
      await documentsApi.download(doc.id, doc.original_filename);
      toast.success(`"${doc.original_filename}" downloaded.`);
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  const handleSaveEdit = async (id, data) => {
    const res = await documentsApi.update(id, data);
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...res.data.data.document } : d))
    );
    toast.success('Document metadata updated.');
  };

  const handleDelete = async (id) => {
    await documentsApi.delete(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document permanently deleted.');
  };

  const hasFilters = Boolean(searchRaw || category);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-surface-dark-200">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-vault-600 dark:text-vault-400 uppercase font-semibold mb-1">
            <span>// OBJECT_REPOSITORY</span>
            <span>·</span>
            <span>{loading ? 'SYNCING' : `${documents.length} ITEMS`}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Vault Documents
          </h1>
        </div>

        <Link to="/upload" className="w-full sm:w-auto">
          <Button
            variant="primary"
            className="w-full sm:w-auto justify-center"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Ingest Document
          </Button>
        </Link>
      </div>

      {/* Filter & Search Command Bar */}
      <div className="card p-3.5 sm:p-4 space-y-3">
        {/* Top Row: Search Input + View Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search-documents"
              name="search"
              aria-label="Search documents"
              type="search"
              placeholder="Search by filename…"
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              className="input pl-10 pr-9"
            />
            {searchRaw && (
              <button
                onClick={() => setSearchRaw('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Grid / List View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-surface-dark-100 rounded-xl border border-slate-200/70 dark:border-surface-dark-200 shrink-0">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-surface-dark-50 shadow-sm text-vault-600 dark:text-vault-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-surface-dark-50 shadow-sm text-vault-600 dark:text-vault-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Row: 1-Tap Scrollable Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              category === ''
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-surface-dark-100 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Files
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-vault-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-surface-dark-100 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid / List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" message="Querying encrypted repository…" />
        </div>
      ) : documents.length === 0 ? (
        <div className="card">
          <EmptyState
            title={hasFilters ? 'No matching documents' : 'Your vault repository is empty'}
            description={
              hasFilters
                ? 'Adjust your search query or reset the active category filter.'
                : 'Ingest your first PDF, image, or document to verify and encrypt it in AWS S3.'
            }
            action={
              !hasFilters ? (
                <Link to="/upload">
                  <Button variant="primary">Ingest First Document</Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchRaw('');
                    setCategory('');
                  }}
                >
                  Reset Filters
                </Button>
              )
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDownload={handleDownload}
              onDelete={(d) => setDeleteDoc(d)}
              onEdit={(d) => setEditDoc(d)}
              onView={(d) => setViewDoc(d)}
              onPreview={(d) => setPreviewDoc(d)}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-surface-dark-200 bg-slate-50/70 dark:bg-surface-dark-100/60 text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 hidden md:table-cell">Size</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Ingested</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-dark-200">
                {documents.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    onDownload={handleDownload}
                    onDelete={(d) => setDeleteDoc(d)}
                    onEdit={(d) => setEditDoc(d)}
                    onView={(d) => setViewDoc(d)}
                    onPreview={(d) => setPreviewDoc(d)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditDocumentModal
        document={editDoc}
        onSave={handleSaveEdit}
        onClose={() => setEditDoc(null)}
      />
      <DeleteConfirmModal
        document={deleteDoc}
        onConfirm={handleDelete}
        onClose={() => setDeleteDoc(null)}
      />
      <DocumentDetailModal
        document={viewDoc}
        onClose={() => setViewDoc(null)}
        onDownload={handleDownload}
        onEdit={(d) => {
          setViewDoc(null);
          setEditDoc(d);
        }}
        onPreview={(d) => setPreviewDoc(d)}
      />
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default DocumentsPage;
