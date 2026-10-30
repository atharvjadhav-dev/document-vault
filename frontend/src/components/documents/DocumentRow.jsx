import React from 'react';
import FileIcon from '../ui/FileIcon';
import CategoryBadge from '../ui/CategoryBadge';
import { formatFileSize, formatDate } from '../../utils/helpers';

const DocumentRow = ({ document, onDownload, onDelete, onEdit, onView, onPreview }) => {
  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-surface-dark-100/50 transition-colors group">
      {/* Name + Mobile Sub-metadata */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div onClick={() => onPreview(document)} className="cursor-pointer shrink-0">
            <FileIcon mimeType={document.mime_type} filename={document.original_filename} size="sm" />
          </div>
          <div className="min-w-0">
            <button
              onClick={() => onPreview(document)}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:text-vault-600 dark:hover:text-vault-400 text-left truncate max-w-[170px] sm:max-w-[260px] md:max-w-xs block transition-colors"
              title={document.original_filename}
            >
              {document.original_filename}
            </button>
            <div className="flex items-center gap-2 mt-0.5 sm:hidden text-[11px] font-mono text-slate-400">
              <span>{document.category}</span>
              <span>·</span>
              <span>{formatFileSize(document.file_size)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <CategoryBadge category={document.category} />
      </td>

      {/* Size */}
      <td className="px-4 py-3.5 text-xs font-mono text-slate-500 dark:text-slate-400 hidden md:table-cell">
        {formatFileSize(document.file_size)}
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 text-xs font-mono text-slate-500 dark:text-slate-400 hidden lg:table-cell">
        {formatDate(document.uploaded_at)}
      </td>

      {/* Actions — Always accessible on touch devices */}
      <td className="px-4 py-3.5 text-right">
        <div className="inline-flex items-center justify-end gap-1">
          <button
            onClick={() => onPreview(document)}
            title="Preview"
            className="p-1.5 rounded-lg hover:bg-vault-50 dark:hover:bg-vault-950/40 text-slate-500 hover:text-vault-600 dark:hover:text-vault-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onDownload(document)}
            title="Download"
            className="p-1.5 rounded-lg hover:bg-vault-50 dark:hover:bg-vault-950/40 text-slate-500 hover:text-vault-600 dark:hover:text-vault-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={() => onView(document)}
            title="Details"
            className="hidden sm:inline-flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark-100 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(document)}
            title="Rename"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark-100 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(document)}
            title="Delete"
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;
