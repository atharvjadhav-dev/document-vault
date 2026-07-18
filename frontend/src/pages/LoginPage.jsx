import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const toast     = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = 'Email is required.';
    if (!password)        e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-dark transition-colors duration-200">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-vault-600 via-vault-700 to-vault-900 relative overflow-hidden items-center justify-center p-12 select-none">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-vault-400/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

        {/* Diagonal stripes */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative text-center text-white max-w-sm">
          {/* Mock Floating Widget */}
          <div className="w-48 h-48 mx-auto mb-10 relative flex items-center justify-center animate-pulse-slow">
            {/* Background glass board */}
            <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rotate-6 transform scale-95" />
            {/* Main glass board */}
            <div className="absolute inset-0 rounded-3xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl flex flex-col p-5 text-left justify-between">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-vault-500 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-semibold uppercase tracking-wider border border-green-500/30">
                  AES-256
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-white/90">Identity_Verification.pdf</span>
                <span className="block text-[9px] text-vault-200 mt-0.5">Updated just now · 1.4 MB</span>
              </div>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[100%]" />
                </div>
                <div className="flex justify-between text-[8px] text-vault-200">
                  <span>Vault Synchronized</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Document Vault</h2>
          <p className="text-vault-200 text-sm leading-relaxed max-w-xs mx-auto font-medium">
            Access your secure credentials, resume portfolios, and personal records safely.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 text-xs">
            {[
              'Secure Download URLs',
              'AES-256 Server Encryption',
              'Short-Lived Link Expiry',
              'Rate Limit Shield'
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/95 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-slate-50 dark:bg-surface-dark transition-colors duration-200">
        {/* Animated Wrapper Container */}
        <div className="w-full max-w-md card p-8 sm:p-10 shadow-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-surface-dark-50/95 backdrop-blur-md border-t-4 border-t-vault-500 animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center shadow-vault">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">Document Vault</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            Sign in to access your secure document vault.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Your password"
              autoComplete="current-password"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-450 hover:text-slate-600 dark:hover:text-slate-350 transition-colors focus:outline-none">
                  {showPw
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              }
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2 hover:shadow-vault-lg active:scale-[0.99] transition-all">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-vault-600 dark:text-vault-400 hover:underline transition-all">
              Create one free
            </Link>
          </p>

          <p className="mt-5 text-center">
            <Link to="/" className="text-xs text-slate-405 hover:text-vault-500 dark:text-slate-500 dark:hover:text-vault-400 transition-colors font-medium">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
