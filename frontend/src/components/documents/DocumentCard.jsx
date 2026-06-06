import React, { useState } from 'react';
import FileIcon from '../ui/FileIcon';
import CategoryBadge from '../ui/CategoryBadge';
import { formatFileSize, timeAgo } from '../../utils/helpers';

const DocumentCard = ({ document, onDownload, onDelete, onEdit, onView }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card-hover p-4 group relative">
      {/* File Icon + Category */}
      <div className="flex items-start justify-between mb-3">
        <FileIcon
          mimeType={document.mime_type}
          filename={document.original_filename}
          size="md"
          showLabel
        />
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-surface-dark-100 text-slate-500 transition-all"
            aria-label="Document options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-44 card shadow-lg py-1 animate-fade-in">
                <button
                  onClick={() => { onView(document); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-surface-50 dark:hover:bg-surface-dark-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>
                <button
                  onClick={() => { onDownload(document); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-surface-50 dark:hover:bg-surface-dark-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => { onEdit(document); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-surface-50 dark:hover:bg-surface-dark-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Rename
                </button>
                <div className="my-1 border-t border-surface-100 dark:border-surface-dark-200" />
                <button
                  onClick={() => { onDelete(document); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filename */}
      <h3
        className="text-sm font-semibold text-slate-900 dark:text-white mb-1 truncate cursor-pointer hover:text-vault-600 dark:hover:text-vault-400 transition-colors"
        title={document.original_filename}
        onClick={() => onView(document)}
      >
        {document.original_filename}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <CategoryBadge category={document.category} />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{formatFileSize(document.file_size)}</span>
        <span>{timeAgo(document.uploaded_at)}</span>
      </div>
    </div>
  );
};

export default DocumentCard;
