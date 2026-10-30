import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import {
  CATEGORIES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  formatFileSize,
  getErrorMessage,
} from '../utils/helpers';
import Button from '../components/ui/Button';
import FileIcon from '../components/ui/FileIcon';

const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'];

const UploadPage = () => {
  const [file, setFile]         = useState(null);
  const [category, setCategory] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors]     = useState({});
  const fileInputRef = useRef(null);
  const toast        = useToast();
  const navigate     = useNavigate();

  const validateFile = (f) => {
    if (!f) return 'Please select a file to ingest.';
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return `Extension .${ext} is blocked by security policy.`;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      return `File size exceeds the ${MAX_FILE_SIZE_MB} MB threshold.`;
    return null;
  };

  const handleFilePick = (f) => {
    const err = validateFile(f);
    if (err) {
      toast.error(err);
      return;
    }
    setFile(f);
    setErrors((prev) => ({ ...prev, file: '' }));
  };

  const onInputChange = (e) => {
    if (e.target.files[0]) handleFilePick(e.target.files[0]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFilePick(dropped);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  const validate = () => {
    const e = {};
    const fe = validateFile(file);
    if (fe) e.file = fe;
    if (!category) e.category = 'Select a document classification category.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpload = async () => {
    if (!validate()) return;
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('originalFilename', file.name);

      await documentsApi.upload(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });

      toast.success(`"${file.name}" verified & stored in S3.`);
      navigate('/documents');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200/80 dark:border-surface-dark-200">
        <div className="flex items-center gap-2 text-[11px] font-mono text-vault-600 dark:text-vault-400 uppercase font-semibold mb-1">
          <span>// SECURE_INGESTION_PIPELINE</span>
          <span>·</span>
          <span>MAX {MAX_FILE_SIZE_MB} MB</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Ingest New Document
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Files undergo 512-byte magic signature verification before streaming to AWS S3.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="card p-5 sm:p-7 space-y-6">
        {/* Step 1: File Drop Zone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="label mb-0">01 / Select Payload</span>
            <span className="text-[11px] font-mono text-slate-400">
              PDF, DOC, DOCX, PNG, JPG, TXT
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES}
            onChange={onInputChange}
            className="hidden"
            id="file-input"
          />

          {!file ? (
            <label
              htmlFor="file-input"
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`flex flex-col items-center justify-center w-full py-10 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150 text-center ${
                dragging
                  ? 'border-vault-500 bg-vault-50/70 dark:bg-vault-950/30'
                  : errors.file
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                  : 'border-slate-300 dark:border-surface-dark-200 hover:border-vault-500 bg-slate-50/50 dark:bg-surface-dark-100/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-surface-dark-100 border border-slate-200 dark:border-surface-dark-200 flex items-center justify-center mb-3 text-vault-600 dark:text-vault-400 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {dragging ? 'Release to stage file' : 'Tap to browse or drag & drop file'}
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                Disguised executables (.exe, .elf, scripts) are automatically rejected
              </p>
              {errors.file && <p className="mt-2 text-xs font-semibold text-red-500">{errors.file}</p>}
            </label>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-surface-dark-100 border border-slate-200/80 dark:border-surface-dark-200 space-y-3">
              <div className="flex items-center gap-3.5">
                <FileIcon mimeType={file.type} filename={file.name} size="lg" showLabel />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>{formatFileSize(file.size)}</span>
                    <span>·</span>
                    <span>{file.type || 'application/octet-stream'}</span>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={clearFile}
                    className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-surface-dark-200 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    aria-label="Remove selected file"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Upload Progress Telemetry */}
              {uploading ? (
                <div className="pt-2 border-t border-slate-200/70 dark:border-surface-dark-200">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-vault-600 dark:text-vault-400 font-semibold">
                      Inspecting header &amp; streaming to S3…
                    </span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-surface-dark-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-vault-600 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200/70 dark:border-surface-dark-200 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span>● Extension check passed</span>
                  <span>Awaiting 512-byte server verification</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: 1-Tap Category Classification Grid */}
        <div>
          <label className="label">02 / Select Classification Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setErrors((prev) => ({ ...prev, category: '' }));
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                    active
                      ? 'border-vault-600 bg-vault-600 text-white shadow-sm'
                      : 'border-slate-200/80 dark:border-surface-dark-200 bg-slate-50/50 dark:bg-surface-dark-100/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      active ? 'bg-white' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="secondary"
            className="w-full sm:w-1/3 justify-center"
            onClick={() => navigate('/documents')}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-2/3 justify-center"
            onClick={handleUpload}
            loading={uploading}
            disabled={!file || !category}
          >
            {uploading ? `Streaming ${progress}%…` : 'Verify & Upload to S3'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
