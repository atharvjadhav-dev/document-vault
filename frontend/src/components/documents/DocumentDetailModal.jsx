import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FileIcon from '../ui/FileIcon';
import CategoryBadge from '../ui/CategoryBadge';
import { formatFileSize, formatDateTime } from '../../utils/helpers';

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-surface-100 dark:border-surface-dark-200 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-white text-right max-w-[60%] truncate">{value}</span>
  </div>
);

const DocumentDetailModal = ({ document, onClose, onDownload, onEdit, onPreview }) => {
  if (!document) return null;

  return (
    <Modal isOpen={!!document} onClose={onClose} title="Document Details" size="md">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-dark-100 rounded-xl">
          <FileIcon
            mimeType={document.mime_type}
            filename={document.original_filename}
            size="lg"
            showLabel
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {document.original_filename}
            </h3>
            <div className="mt-1">
              <CategoryBadge category={document.category} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <DetailRow label="File Size"    value={formatFileSize(document.file_size)} />
          <DetailRow label="Category"     value={document.category} />
          <DetailRow label="MIME Type"    value={document.mime_type || '—'} />
          <DetailRow label="Uploaded"     value={formatDateTime(document.uploaded_at)} />
          <DetailRow label="Last Updated" value={formatDateTime(document.updated_at)} />
          <DetailRow label="Document ID"  value={document.id?.slice(0, 18) + '...'} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => { onPreview(document); onClose(); }}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => { onEdit(document); onClose(); }}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Rename
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onDownload(document)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentDetailModal;
