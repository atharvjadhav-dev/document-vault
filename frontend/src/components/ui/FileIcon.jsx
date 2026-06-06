import React from 'react';
import { getFileIcon } from '../../utils/helpers';

const icons = {
  pdf: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    color: 'text-red-500',
    label: 'PDF',
    path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
  doc: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    color: 'text-blue-500',
    label: 'DOC',
    path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  img: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    color: 'text-green-500',
    label: 'IMG',
    path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  txt: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    color: 'text-slate-500',
    label: 'TXT',
    path: 'M9 12h6m-6 4h6M5 5h14M5 9h14',
  },
  file: {
    bg: 'bg-vault-50 dark:bg-vault-900/20',
    color: 'text-vault-500',
    label: 'FILE',
    path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
};

const FileIcon = ({ mimeType, filename, size = 'md', showLabel = false }) => {
  const type = getFileIcon(mimeType, filename);
  const icon = icons[type] || icons.file;

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

  return (
    <div className={`${sizes[size]} rounded-xl ${icon.bg} flex items-center justify-center flex-shrink-0 relative`}>
      <svg
        className={`${iconSizes[size]} ${icon.color}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
      </svg>
      {showLabel && (
        <span className={`absolute -bottom-1 -right-1 text-[8px] font-bold ${icon.color} bg-white dark:bg-surface-dark-50 px-0.5 rounded shadow-sm`}>
          {icon.label}
        </span>
      )}
    </div>
  );
};

export default FileIcon;
