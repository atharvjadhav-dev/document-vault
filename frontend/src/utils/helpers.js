// Format bytes to human-readable string
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Relative time (e.g., "2 hours ago")
export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

// Get file extension
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop()?.toUpperCase() || '';
};

// Get MIME type icon class
export const getFileIcon = (mimeType, filename) => {
  const ext = filename ? filename.split('.').pop()?.toLowerCase() : '';
  if (mimeType?.includes('pdf') || ext === 'pdf') return 'pdf';
  if (mimeType?.includes('word') || ext === 'doc' || ext === 'docx') return 'doc';
  if (mimeType?.includes('image') || ['jpg','jpeg','png','gif','webp'].includes(ext)) return 'img';
  if (mimeType?.includes('text') || ext === 'txt') return 'txt';
  return 'file';
};

// Category colors
export const CATEGORY_COLORS = {
  Aadhaar:      { bg: 'bg-blue-100',   text: 'text-blue-700',   dark: 'dark:bg-blue-900/30 dark:text-blue-300' },
  PAN:          { bg: 'bg-orange-100', text: 'text-orange-700', dark: 'dark:bg-orange-900/30 dark:text-orange-300' },
  Passport:     { bg: 'bg-green-100',  text: 'text-green-700',  dark: 'dark:bg-green-900/30 dark:text-green-300' },
  Education:    { bg: 'bg-purple-100', text: 'text-purple-700', dark: 'dark:bg-purple-900/30 dark:text-purple-300' },
  Resume:       { bg: 'bg-teal-100',   text: 'text-teal-700',   dark: 'dark:bg-teal-900/30 dark:text-teal-300' },
  Certificates: { bg: 'bg-yellow-100', text: 'text-yellow-700', dark: 'dark:bg-yellow-900/30 dark:text-yellow-300' },
  Personal:     { bg: 'bg-pink-100',   text: 'text-pink-700',   dark: 'dark:bg-pink-900/30 dark:text-pink-300' },
  Other:        { bg: 'bg-slate-100',  text: 'text-slate-700',  dark: 'dark:bg-slate-800 dark:text-slate-300' },
};

// Get Tailwind badge classes for category
export const getCategoryBadge = (category) => {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return `${c.bg} ${c.text} ${c.dark}`;
};

// Extract error message from axios error
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors?.[0]?.message) return error.response.data.errors[0].message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred.';
};

// Valid categories list
export const CATEGORIES = [
  'Aadhaar', 'PAN', 'Passport', 'Education',
  'Resume', 'Certificates', 'Personal', 'Other',
];

// Allowed file types for upload input
export const ALLOWED_FILE_TYPES = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt';
export const MAX_FILE_SIZE_MB = 10;
