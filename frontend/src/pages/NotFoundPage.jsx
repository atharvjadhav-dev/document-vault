import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-dark p-6">
    <div className="text-center max-w-md">
      <div className="w-24 h-24 rounded-3xl bg-vault-50 dark:bg-vault-900/20 flex items-center justify-center mx-auto mb-6">
        <span className="text-5xl font-extrabold text-vault-300 dark:text-vault-700">?</span>
      </div>
      <h1 className="text-6xl font-extrabold text-vault-500 mb-3">404</h1>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Page not found</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-md btn-primary inline-flex">
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
