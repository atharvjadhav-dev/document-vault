import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-vault-100 dark:border-vault-900/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-vault-500 animate-spin" />
      </div>
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      )}
    </div>
  );
};

export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-dark">
    <LoadingSpinner size="lg" message={message} />
  </div>
);

export default LoadingSpinner;
