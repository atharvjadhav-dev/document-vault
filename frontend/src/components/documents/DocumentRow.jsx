import React from 'react';
import FileIcon from '../ui/FileIcon';
import CategoryBadge from '../ui/CategoryBadge';
import { formatFileSize, formatDate } from '../../utils/helpers';

const DocumentRow = ({ document, onDownload, onDelete, onEdit, onView }) => {
  return (
    <tr className="hover:bg-surface-50 dark:hover:bg-surface-dark-100 transition-colors group">
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <FileIcon mimeType={document.mime_type} filename={document.original_filename} size="sm" />
          <button
            onClick={() => onView(document)}
            className="text-sm font-medium text-slate-900 dark:text-white hover:text-vault-600 dark:hover:text-vault-400 text-left truncate max-w-[200px] transition-colors"
            title={document.original_filename}
          >
            {document.original_filename}
          </button>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <CategoryBadge category={document.category} />
      </td>

      {/* Size */}
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
        {formatFileSize(document.file_size)}
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
        {formatDate(document.uploaded_at)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDownload(document)}
            title="Download"
            className="p-1.5 rounded-lg hover:bg-vault-50 dark:hover:bg-vault-900/20 text-slate-500 hover:text-vault-600 dark:hover:text-vault-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(document)}
            title="Rename"
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-dark-100 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(document)}
            title="Delete"
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;
