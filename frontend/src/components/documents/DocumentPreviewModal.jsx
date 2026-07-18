import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FileIcon from '../ui/FileIcon';
import LoadingSpinner from '../ui/LoadingSpinner';
import { documentsApi } from '../../services/api';
import { getErrorMessage } from '../../utils/helpers';

const DocumentPreviewModal = ({ document, onClose, onDownload }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document) {
      setPreviewUrl('');
      setTextContent('');
      setError('');
      return;
    }

    const fetchPreviewData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch the temporary 60-second secure download URL
        const res = await documentsApi.getSecureDownloadUrl(document.id);
        const url = res.data.downloadUrl;
        setPreviewUrl(url);

        // If it's a plain text file, fetch the content directly to show in code block
        if (document.mime_type === 'text/plain') {
          const textRes = await axios.get(url);
          setTextContent(textRes.data);
        }
      } catch (err) {
        console.error('Error generating preview:', err);
        setError(getErrorMessage(err) || 'Could not load preview. The secure link may have expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [document]);

  if (!document) return null;

  const mime = document.mime_type || '';
  const name = document.original_filename || '';
  const isImage = mime.startsWith('image/');
  const isPDF = mime === 'application/pdf';
  const isText = mime === 'text/plain';
  const isPreviewable = isImage || isPDF || isText;

  // Choose modal display size based on content type
  const modalSize = isPreviewable ? '5xl' : 'lg';

  return (
    <Modal
      isOpen={!!document}
      onClose={onClose}
      title={`Preview: ${name}`}
      size={modalSize}
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" message="Loading secure preview..." />
          </div>
        ) : error ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Failed to load preview</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <Button variant="secondary" onClick={onClose} size="sm">Close</Button>
          </div>
        ) : (
          <div className="relative">
            {/* Render based on file type */}
            {isPDF && (
              <iframe
                src={previewUrl}
                className="w-full h-[65vh] border-0 rounded-xl bg-white"
                title="PDF Preview"
              />
            )}

            {isImage && (
              <div className="flex items-center justify-center bg-slate-50 dark:bg-surface-dark-100 p-4 rounded-xl h-[65vh] overflow-hidden">
                <img
                  src={previewUrl}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  alt={name}
                />
              </div>
            )}

            {isText && (
              <pre className="w-full h-[65vh] overflow-auto p-4 rounded-xl bg-slate-50 dark:bg-surface-dark-100 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {textContent}
              </pre>
            )}

            {!isPreviewable && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <FileIcon mimeType={mime} filename={name} size="lg" />
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">Preview not supported</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  This file type ({mime || 'unknown'}) cannot be previewed directly in your browser. Please download it to view the content.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button
                    variant="primary"
                    onClick={() => { onDownload(document); onClose(); }}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    }
                  >
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer controls for previewable content */}
        {isPreviewable && !loading && !error && (
          <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-dark-200">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Secured with Ephemeral Token
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose} size="sm">
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => { onDownload(document); onClose(); }}
                size="sm"
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
        )}
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;
