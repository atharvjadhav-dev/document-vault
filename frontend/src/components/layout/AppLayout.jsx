import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Sidebar, { NAV_ITEMS } from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { user } = useAuth();

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 border-r border-slate-200/80 dark:border-surface-dark-200 bg-white dark:bg-surface-dark-50 sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-72 max-w-[82vw] h-full bg-white dark:bg-surface-dark-50 border-r border-slate-200 dark:border-surface-dark-200 animate-slide-right shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Sticky Top Header */}
        <header className="lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-surface-dark-200">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-dark-100 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Open navigation drawer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-display font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                Document Vault
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl border border-slate-200/80 dark:border-surface-dark-200 text-slate-600 dark:text-slate-400"
            >
              {isDark ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              to="/profile"
              className="w-8 h-8 rounded-lg bg-vault-600 text-white flex items-center justify-center text-xs font-mono font-bold"
              title="Account Profile"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Page Content with bottom padding on mobile so Bottom Dock never overlaps */}
        <main className="flex-1 overflow-x-hidden pb-24 lg:pb-8">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-surface-dark-50/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-surface-dark-200 px-2 py-1.5"
        >
          <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-vault-600 dark:text-vault-400 bg-vault-50/80 dark:bg-vault-950/40 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`
                }
              >
                {item.icon}
                <span className="text-[10px] mt-1 tracking-tight">{item.shortLabel}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
