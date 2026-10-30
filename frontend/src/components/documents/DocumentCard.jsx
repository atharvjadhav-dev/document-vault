import React, { useState } from 'react';
import FileIcon from '../ui/FileIcon';
import CategoryBadge from '../ui/CategoryBadge';
import { formatFileSize, timeAgo } from '../../utils/helpers';

const DocumentCard = ({ document, onDownload, onDelete, onEdit, onView, onPreview }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card-hover p-4 flex flex-col justify-between group relative">
      {/* Top Row: Icon + Category + Always-accessible Menu Button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            onClick={() => onPreview(document)}
            className="cursor-pointer"
          >
            <FileIcon
              mimeType={document.mime_type}
              filename={document.original_filename}
              size="md"
              showLabel
            />
          </div>

          <div className="flex items-center gap-1.5">
            <CategoryBadge category={document.category} />

            {/* Action Menu Trigger — Always visible on mobile, subtle on desktop */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-surface-dark-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Document options"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.75" />
                  <circle cx="12" cy="12" r="1.75" />
                  <circle cx="12" cy="19" r="1.75" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-9 z-30 w-44 card shadow-xl py-1.5 animate-fade-in">
                    <button
                      onClick={() => { onPreview(document); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100"
                    >
                      <svg className="w-4 h-4 text-vault-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview File
                    </button>
                    <button
                      onClick={() => { onView(document); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Metadata Details
                    </button>
                    <button
                      onClick={() => { onEdit(document); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Rename / Recategorize
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-surface-dark-200" />
                    <button
                      onClick={() => { onDelete(document); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Permanently
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filename (Single tap/click opens preview) */}
        <h3
          onClick={() => onPreview(document)}
          title={document.original_filename}
          className="text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-vault-600 dark:hover:text-vault-400 transition-colors"
        >
          {document.original_filename}
        </h3>

        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
          <span>{formatFileSize(document.file_size)}</span>
          <span>·</span>
          <span>{timeAgo(document.uploaded_at)}</span>
        </div>
      </div>

      {/* Bottom Action Bar — Touch-friendly 1-tap Preview & Download */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-surface-dark-200 flex items-center gap-2">
        <button
          onClick={() => onPreview(document)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-100/80 hover:bg-slate-200/70 dark:bg-surface-dark-100 dark:hover:bg-surface-dark-200 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-vault-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Preview</span>
        </button>

        <button
          onClick={() => onDownload(document)}
          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-vault-50 hover:bg-vault-100 dark:bg-vault-950/50 dark:hover:bg-vault-900/60 text-vault-600 dark:text-vault-400 border border-vault-200/60 dark:border-vault-800/60 transition-colors"
          title="Download File"
          aria-label="Download File"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
