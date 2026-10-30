import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { getErrorMessage } from '../utils/helpers';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const { isDark, toggle } = useTheme();
  const toast     = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email    = 'Email address is required.';
    if (!password)     e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Authenticated successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100 bg-grid-pattern">
      {/* ── Left Architectural Telemetry Panel (Desktop) ───────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-slate-950 text-white border-r border-slate-800/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(70,101,255,0.16),transparent_60%)] pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-white text-base tracking-tight block leading-none">
                Document Vault
              </span>
              <span className="text-[10px] font-mono text-slate-400">doc.atharvjadhav.xyz</span>
            </div>
          </Link>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            TLS 1.3 ACTIVE
          </span>
        </div>

        {/* Center Specification Artifact */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-vault-400">
            <span>// ZERO-TRUST AUTHENTICATION GATEWAY</span>
          </div>
          <h2 className="font-display text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
            Cryptographic access to your personal cloud repository.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every session is rate-limited at the edge, verified via signed JWT tokens, and isolated to your private S3 object namespace in AWS Mumbai (<code className="font-mono text-slate-300">ap-south-1</code>).
          </p>

          {/* Terminal Pipeline Readout */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 font-mono text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-2">
              <span>SECURITY_POSTURE</span>
              <span className="text-emerald-400">ENFORCED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Password Hashing</span>
              <span className="text-slate-200">bcrypt (12 salt rounds)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Brute-Force Shield</span>
              <span className="text-slate-200">10 req / 15m per IP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Download Stream</span>
              <span className="text-emerald-400">60s Ephemeral Token</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>AWS EC2 · S3 · PostgreSQL 15</span>
          <span>Engineered by Atharv Jadhav</span>
        </div>
      </div>

      {/* ── Right Form Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12">
        {/* Top bar (Mobile & Desktop) */}
        <div className="flex items-center justify-between max-w-md w-full mx-auto lg:max-w-none">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1.5 px-2.5 rounded-lg border border-slate-200/80 dark:border-surface-dark-200 bg-white dark:bg-surface-dark-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to home</span>
          </Link>

          <button
            onClick={toggle}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-slate-200/80 dark:border-surface-dark-200 bg-white dark:bg-surface-dark-50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark-100 transition-colors"
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
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md mx-auto my-8">
          <div className="card p-6 sm:p-8 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-vault-600 text-white flex items-center justify-center shadow-vault">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Vault Console Login
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign in to your vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Enter your credentials to decrypt and manage your documents.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="name@domain.com"
                autoComplete="email"
                autoFocus
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••••••"
                autoComplete="current-password"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                {loading ? 'Authenticating…' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-surface-dark-200 text-center">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have a vault yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-vault-600 dark:text-vault-400 hover:underline"
                >
                  Initialize account →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom mobile caption */}
        <div className="text-center text-[11px] font-mono text-slate-400 dark:text-slate-500">
          Protected by TLS 1.3 &amp; 512-byte payload inspection
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
