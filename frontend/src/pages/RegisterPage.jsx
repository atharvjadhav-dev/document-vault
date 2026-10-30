import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { getErrorMessage } from '../utils/helpers';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const passwordRules = [
  { test: (p) => p.length >= 8,   label: '8+ chars' },
  { test: (p) => /[A-Z]/.test(p), label: 'Uppercase' },
  { test: (p) => /[a-z]/.test(p), label: 'Lowercase' },
  { test: (p) => /[0-9]/.test(p), label: 'Number' },
];

const PasswordStrength = ({ password }) => {
  const passed = passwordRules.filter((r) => r.test(password)).length;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-500'];
  const activeColor = password ? (colors[passed - 1] || 'bg-slate-200') : 'bg-slate-200';

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-200 ${
              i < passed ? activeColor : 'bg-slate-200 dark:bg-surface-dark-200'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
        {passwordRules.map((r) => {
          const isPassed = r.test(password);
          return (
            <div
              key={r.label}
              className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
                isPassed
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <span>{r.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [form, setForm]     = useState({ fullName: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { isDark, toggle } = useTheme();
  const toast        = useToast();
  const navigate     = useNavigate();

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = 'Full name must be at least 2 characters.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Please enter a valid email address.';
    if (passwordRules.some((r) => !r.test(form.password)))
      e.password = 'Password must satisfy all 4 complexity requirements.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.fullName.trim(), form.email.trim(), form.password);
      toast.success('Vault initialized! Welcome aboard.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      else toast.error(msg);
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
          <Link to="/" className="flex items-center gap-2.5">
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
            500 MB QUOTA
          </span>
        </div>

        {/* Center Spec */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-vault-400">
            <span>// PROVISION ISOLATED VAULT NAMESPACE</span>
          </div>
          <h2 className="font-display text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
            Zero-trust storage for your critical documents.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Store Aadhaar, PAN, Passports, Certificates, and Resumes with strict binary validation and automated nightly S3 disaster recovery.
          </p>

          <div className="space-y-2.5">
            {[
              ['512-Byte Payload Inspection', 'Blocks disguised .exe, .elf, and script uploads'],
              ['AWS S3 Object Isolation', 'Stored in ap-south-1 with 60s presigned URLs'],
              ['Nightly PostgreSQL Backups', 'Automated 02:00 UTC gzipped S3 snapshots'],
            ].map(([title, sub]) => (
              <div key={title} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">{title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>AWS EC2 · S3 · PostgreSQL 15</span>
          <span>Engineered by Atharv Jadhav</span>
        </div>
      </div>

      {/* ── Right Form Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto">
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

        <div className="w-full max-w-md mx-auto my-6">
          <div className="card p-6 sm:p-8 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-vault-600 text-white flex items-center justify-center shadow-vault">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                New Vault Provisioning
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Initialize your personal encrypted document repository.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Full Name"
                type="text"
                value={form.fullName}
                onChange={set('fullName')}
                error={errors.fullName}
                placeholder="Atharv Jadhav"
                autoComplete="name"
                autoFocus
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                placeholder="name@domain.com"
                autoComplete="email"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              <div>
                <Input
                  label="Master Password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  error={errors.password}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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
                {form.password && <PasswordStrength password={form.password} />}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                {loading ? 'Provisioning vault…' : 'Create My Vault'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-surface-dark-200 text-center">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-vault-600 dark:text-vault-400 hover:underline"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-slate-400 dark:text-slate-500">
          bcrypt-12 hashed · S3 ap-south-1 isolated storage
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
