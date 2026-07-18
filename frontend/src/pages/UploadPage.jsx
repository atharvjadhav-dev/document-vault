import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { CATEGORIES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB, formatFileSize, getErrorMessage } from '../utils/helpers';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import FileIcon from '../components/ui/FileIcon';

const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'];

const UploadPage = () => {
  const [file, setFile]           = useState(null);
  const [category, setCategory]   = useState('');
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [errors, setErrors]       = useState({});
  const fileInputRef = useRef(null);
  const toast    = useToast();
  const navigate = useNavigate();

  const validateFile = (f) => {
    if (!f) return 'Please select a file.';
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return `File type .${ext} is not allowed.`;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_FILE_SIZE_MB} MB.`;
    return null;
  };

  const handleFilePick = (f) => {
    const err = validateFile(f);
    if (err) { toast.error(err); return; }
    setFile(f);
    setErrors({});
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

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const validate = () => {
    const e = {};
    const fe = validateFile(file);
    if (fe) e.file = fe;
    if (!category) e.category = 'Please select a category.';
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

      toast.success(`"${file.name}" uploaded successfully!`);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Document</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add a new document to your vault. Max {MAX_FILE_SIZE_MB} MB per file.
        </p>
      </div>

      <div className="rounded-2xl p-5 sm:p-6 border-0 sm:border border-surface-100 dark:border-surface-dark-200 bg-transparent sm:bg-white dark:bg-transparent dark:sm:bg-surface-dark-50 shadow-none sm:shadow-card space-y-6">
        {/* Drop zone */}
        <div>
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
              className={`
                flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer
                transition-all duration-200
                ${dragging
                  ? 'border-vault-400 bg-vault-50 dark:bg-vault-900/20 scale-[1.01]'
                  : errors.file
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                  : 'border-surface-200 dark:border-surface-dark-200 hover:border-vault-300 hover:bg-vault-50/50 dark:hover:bg-vault-900/10'
                }
              `}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors
                ${dragging ? 'bg-vault-100 dark:bg-vault-900/40 text-vault-600' : 'bg-surface-100 dark:bg-surface-dark-100 text-slate-400'}`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dragging ? 'Drop it here!' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG, TXT — up to {MAX_FILE_SIZE_MB} MB
              </p>
              {errors.file && <p className="mt-2 text-xs text-red-500">{errors.file}</p>}
            </label>
          ) : (
            /* File preview card */
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-dark-100 border border-surface-200 dark:border-surface-dark-200">
              <FileIcon mimeType={file.type} filename={file.name} size="lg" showLabel />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
                {uploading && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-dark-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-vault-500 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{progress}% uploaded</p>
                  </div>
                )}
              </div>
              {!uploading && (
                <button
                  onClick={clearFile}
                  className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-dark-200 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category select */}
        <Select
          label="Category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setErrors((prev) => ({ ...prev, category: '' })); }}
          options={CATEGORIES}
          placeholder="Select a category…"
          error={errors.category}
        />

        {/* Allowed formats info */}
        <div className="p-4 rounded-xl bg-vault-50 dark:bg-vault-900/20 border border-vault-100 dark:border-vault-800">
          <p className="text-xs font-medium text-vault-700 dark:text-vault-300 mb-2">Supported formats</p>
          <div className="flex flex-wrap gap-1.5">
            {['PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG', 'TXT'].map((fmt) => (
              <span key={fmt} className="px-2 py-0.5 rounded-md bg-white dark:bg-surface-dark-100 border border-vault-200 dark:border-vault-800 text-xs text-vault-700 dark:text-vault-300 font-medium">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/documents')}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleUpload}
            loading={uploading}
            disabled={!file || !category}
          >
            {uploading ? `Uploading ${progress}%…` : 'Upload Document'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
