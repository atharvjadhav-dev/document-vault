import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { getErrorMessage } from '../utils/helpers';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const passwordRules = [
  { test: (p) => p.length >= 8,       label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),     label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p),     label: 'One lowercase letter' },
  { test: (p) => /[0-9]/.test(p),     label: 'One number' },
];

const PasswordStrength = ({ password }) => {
  const passed = passwordRules.filter((r) => r.test(password)).length;
  const colors = ['bg-red-405', 'bg-orange-405', 'bg-yellow-405', 'bg-green-500'];
  const color  = password ? (colors[passed - 1] || 'bg-surface-200') : 'bg-surface-200';

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < passed ? color : 'bg-slate-200 dark:bg-surface-dark-200'}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        {passwordRules.map((r) => {
          const isPassed = r.test(password);
          return (
            <div key={r.label} className={`flex items-center gap-1.5 text-xs transition-colors ${isPassed ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isPassed ? 'bg-green-500/10 border-green-500 text-green-500' : 'border-slate-300 dark:border-slate-700 text-slate-300'}`}>
                <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  {isPassed
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  }
                </svg>
              </div>
              <span>{r.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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
      e.email = 'Please enter a valid email.';
    if (passwordRules.some((r) => !r.test(form.password)))
      e.password = 'Password does not meet requirements.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.fullName.trim(), form.email.trim(), form.password);
      toast.success('Account created! Welcome to your vault.');
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
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-dark transition-colors duration-200">
      {/* Left panel */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-semibold uppercase tracking-wider border border-green-500/30">
                  SHIELD ACTIVE
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-white/90">Personal_Vault_Key.key</span>
                <span className="block text-[9px] text-vault-200 mt-0.5">Protected by Cryptography</span>
              </div>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[100%]" />
                </div>
                <div className="flex justify-between text-[8px] text-vault-200">
                  <span>AES-256 Vault Initialized</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Your Documents. Always Protected.</h2>
          <p className="text-vault-200 text-sm leading-relaxed max-w-xs mx-auto font-medium">
            Store certificates, IDs, resumes, and personal records securely in one place. Only you hold the access key.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              ['Secure Cloud Storage', 'All files are automatically stored securely'],
              ['Access From Anywhere', 'Retrieve files securely on any mobile or desktop device'],
              ['Rate Limit Shields', 'Strict request throttling to block access attacks'],
              ['Private By Design', 'Designed around standard single-use download tokens'],
            ].map(([title, sub]) => (
              <div key={title} className="flex items-center gap-3 bg-white/10 dark:bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-xs">{title}</p>
                  <p className="text-vault-300 text-[10px]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-slate-50 dark:bg-surface-dark transition-colors duration-200 overflow-y-auto">
        {/* Animated Wrapper Container */}
        <div className="w-full max-w-md card p-8 sm:p-10 shadow-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-surface-dark-50/95 backdrop-blur-md border-t-4 border-t-vault-500 my-8 animate-slide-up">
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

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            Free forever. Stays fully confidential.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              type="text"
              value={form.fullName}
              onChange={set('fullName')}
              error={errors.fullName}
              placeholder="Jane Doe"
              autoComplete="name"
              autoFocus
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <div>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                placeholder="Create a strong password"
                autoComplete="new-password"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                    {showPw
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                }
              />
              {form.password && <PasswordStrength password={form.password} />}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-4 hover:shadow-vault-lg active:scale-[0.99] transition-all">
              {loading ? 'Creating vault…' : 'Create My Vault'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-vault-600 dark:text-vault-400 hover:underline transition-all">
              Sign in
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

export default RegisterPage;
