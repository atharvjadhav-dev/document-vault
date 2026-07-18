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

  const [editDoc,   setEditDoc]   = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [viewDoc,   setViewDoc]   = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const search = useDebounce(searchRaw, 350);

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

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

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
      prev.map((d) => d.id === id ? { ...d, ...res.data.data.document } : d)
    );
    toast.success('Document updated.');
  };

  const handleDelete = async (id) => {
    await documentsApi.delete(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document deleted.');
  };

  const hasFilters = searchRaw || category;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {loading ? 'Loading…' : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
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

      {/* Search & Filters */}
      <div className="rounded-2xl p-0 sm:p-4 border-0 sm:border border-surface-100 dark:border-surface-dark-200 bg-transparent sm:bg-white dark:bg-transparent dark:sm:bg-surface-dark-50 shadow-none sm:shadow-card flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search documents…"
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            className="input pl-9 pr-4"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* View toggle */}
        <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-dark-100 rounded-xl self-start sm:self-center flex-shrink-0">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-surface-dark-50 shadow text-vault-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-dark-50 shadow text-vault-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="List view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setSearchRaw(''); setCategory(''); }}
            className="btn-md btn-ghost text-slate-500 self-start sm:self-center flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" message="Loading documents…" />
        </div>
      ) : documents.length === 0 ? (
        <div className="card">
          <EmptyState
            title={hasFilters ? 'No documents match your search' : 'Your vault is empty'}
            description={
              hasFilters
                ? 'Try adjusting your search terms or clearing filters.'
                : 'Upload your first document to get started.'
            }
            action={
              !hasFilters ? (
                <Link to="/upload">
                  <Button variant="primary">Upload Document</Button>
                </Link>
              ) : (
                <Button variant="secondary" onClick={() => { setSearchRaw(''); setCategory(''); }}>
                  Clear Filters
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-dark-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50 dark:divide-surface-dark-100">
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
        onEdit={(d) => { setViewDoc(null); setEditDoc(d); }}
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
