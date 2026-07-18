import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Ephemeral Download Tokens',
    description: 'Downloads stream securely using short-lived (60s) cryptographic tokens. Session JWTs are never exposed in URL query parameters.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Bank-Grade Security',
    description: 'JWT session authorization, bcrypt password hashing, and encrypted file storage keep your documents safe.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'Smart Categories',
    description: 'Organize Aadhaar, PAN, Passport, Education, Resume and more with one-click categorization.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Instant Search',
    description: 'Find any document in seconds by filename or category.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: 'Easy Uploads',
    description: 'Drag and drop PDFs, Word docs, images and text files up to 10 MB.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Dashboard Analytics',
    description: 'Track storage usage, recent uploads, and document breakdown at a glance.',
  },
];

const LandingPage = () => {
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark flex flex-col">
      {/* Navbar */}
      <header className="border-b border-surface-100 dark:border-surface-dark-200 sticky top-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center shadow-vault">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Document Vault</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link to="/login"
              className="btn-md btn-ghost text-slate-700 dark:text-slate-300 font-medium"
            >
              Login
            </Link>
            <Link to="/register"
              className="btn-md btn-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-10 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vault-50/80 dark:bg-vault-900/30 border border-vault-100 dark:border-vault-800/80 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-vault-500 animate-pulse-slow" />
            <span className="text-xs font-semibold text-vault-700 dark:text-vault-300">
              Secure · Private · Cloud-Ready
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 text-balance tracking-tight">
            Store Your Important Documents
            <span className="gradient-text"> Securely</span>
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload, organize, and access your important documents from anywhere.
            Keep certificates, IDs, resumes, and personal records secure in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-lg btn-primary shadow-vault-lg hover:-translate-y-0.5 transition-transform duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Create Free Vault
            </Link>
            <Link to="/login" className="btn-lg btn-secondary hover:-translate-y-0.5 transition-transform duration-200">
              Sign In
            </Link>
          </div>

          {/* Interactive CSS Mock Dashboard */}
          <div className="max-w-4xl mx-auto mt-16 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-surface-dark-50 shadow-2xl overflow-hidden flex flex-col text-left transition-all duration-300 hover:border-vault-300 dark:hover:border-vault-700">
            {/* Window bar */}
            <div className="h-11 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-surface-dark-100/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/90 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/90 shadow-sm"></div>
              <div className="h-6 px-4 rounded-lg bg-slate-200/40 dark:bg-surface-dark-200/40 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mx-auto w-1/3 justify-center select-none border border-slate-200/10">
                <svg className="w-3 h-3 text-vault-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-mono tracking-tight">vault.secure/dashboard</span>
              </div>
              <div className="w-16"></div>
            </div>

            {/* Application Main Layout */}
            <div className="flex flex-1 min-h-[360px] divide-x divide-slate-100 dark:divide-slate-800/80">
              {/* Mock Sidebar */}
              <div className="w-1/4 hidden md:flex flex-col p-4 bg-slate-50/20 dark:bg-surface-dark-50/10">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-vault-500/10 text-vault-500 flex items-center justify-center font-bold text-xs">
                    JD
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Nikita J.</span>
                    <span className="text-[9px] text-slate-400">Personal Plan</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-vault-50 dark:bg-vault-950/40 text-vault-600 dark:text-vault-400 text-xs font-semibold select-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Dashboard
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-dark-100/50 text-xs transition-colors select-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    My Documents
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-dark-100/50 text-xs transition-colors select-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Upload New
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-dark-100/50 text-xs transition-colors select-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Security Vault
                  </div>
                </div>

                {/* Storage info mockup */}
                <div className="mt-auto p-3 rounded-xl bg-slate-50 dark:bg-surface-dark-100 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1 text-[10px] text-slate-500 font-medium">
                    <span>Storage Used</span>
                    <span>4.8%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-vault-500 rounded-full w-[4.8%]"></div>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-1">4.8 MB of 100 MB free plan</span>
                </div>
              </div>

              {/* Mock Content */}
              <div className="flex-1 p-5 flex flex-col overflow-x-auto">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quick Dashboard</h3>
                    <p className="text-[10px] text-slate-400">All system integrity is active.</p>
                  </div>
                  <button className="text-[10.5px] font-semibold text-white bg-vault-500 hover:bg-vault-600 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1 select-none pointer-events-none">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Upload File
                  </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-surface-dark-100/10">
                    <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Total Stored</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">3 Documents</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-surface-dark-100/10">
                    <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Download Security</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 inline-flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      60s Ephemeral Link
                    </span>
                  </div>
                </div>

                {/* Document Table Mock */}
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Stored Files</div>
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50/80 dark:bg-surface-dark-100/80 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500">Name</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500">Category</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500">Security</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">Aadhaar_Card.pdf</td>
                          <td className="px-3 py-2 text-slate-400">Aadhaar</td>
                          <td className="px-3 py-2"><span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-medium border border-green-100 dark:border-green-900/30">60s Token Download</span></td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-vault-500 hover:text-vault-600 font-semibold cursor-pointer text-[10px]">Download</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">Passport_Main.jpg</td>
                          <td className="px-3 py-2 text-slate-400">Passport</td>
                          <td className="px-3 py-2"><span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-medium border border-green-100 dark:border-green-900/30">60s Token Download</span></td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-vault-500 hover:text-vault-600 font-semibold cursor-pointer text-[10px]">Download</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">Resume_Nikita.pdf</td>
                          <td className="px-3 py-2 text-slate-400">Resume</td>
                          <td className="px-3 py-2"><span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-900/30">Stored Encrypted</span></td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-vault-500 hover:text-vault-600 font-semibold cursor-pointer text-[10px]">Download</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-16 text-xs text-slate-400 dark:text-slate-500">
            {['JWT Auth', 'bcrypt Passwords', '60s Ephemeral Links', 'Rate Limited', 'SQL Injection Protection', 'Fast Uploads'].map((t) => (
              <span key={t} className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-350 transition-colors">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-surface-50 dark:bg-surface-dark-50 py-20 border-t border-surface-100 dark:border-surface-dark-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Everything you need
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Built with production best practices from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-vault transition-all duration-300 hover:-translate-y-0.5 hover:border-vault-200 dark:hover:border-vault-800">
                <div className="w-12 h-12 rounded-2xl bg-vault-50 dark:bg-vault-900/20 text-vault-600 dark:text-vault-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-vault-600 to-vault-800">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to secure your documents?</h2>
          <p className="text-vault-200 mb-8">Free to use. No credit card required.</p>
          <Link to="/register" className="btn-lg bg-white text-vault-700 hover:bg-vault-50 font-bold shadow-vault-lg inline-flex items-center gap-2 rounded-xl px-8 py-3 transition-transform hover:-translate-y-0.5 duration-200">
            Start for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-100 dark:border-surface-dark-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4 text-vault-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Document Vault — Production-grade document storage
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            React · Node.js · PostgreSQL · Docker
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
