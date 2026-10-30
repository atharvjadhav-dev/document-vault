import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const HEX_SAMPLES = [
  {
    id: 'pdf',
    filename: 'Passport_Scan_2026.pdf',
    claimedMime: 'application/pdf',
    size: '1.84 MB',
    hex: '25 50 44 46 2D 31 2E 37 0A 25 E2 E3 CF D3 0A 31',
    ascii: '%PDF-1.7.%....1',
    signature: '0x25504446 (PDF Header)',
    verdict: 'VERIFIED',
    action: 'Streamed to s3://document-vault-files/uploads/',
    safe: true,
  },
  {
    id: 'exe',
    filename: 'Tax_Invoice_2026.pdf',
    claimedMime: 'application/pdf (Spoofed)',
    size: '412.0 KB',
    hex: '4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00',
    ascii: 'MZ..............',
    signature: '0x4D5A (Windows PE Executable)',
    verdict: 'BLOCKED',
    action: 'fs.unlinkSync() executed · IP logged · Upload aborted',
    safe: false,
  },
  {
    id: 'elf',
    filename: 'Salary_Slip_Oct.docx',
    claimedMime: 'application/vnd.openxmlformats',
    size: '88.5 KB',
    hex: '7F 45 4C 46 02 01 01 00 00 00 00 00 00 00 00 00',
    ascii: '.ELF............',
    signature: '0x7F454C46 (Linux ELF Binary)',
    verdict: 'BLOCKED',
    action: 'fs.unlinkSync() executed · Payload neutralized',
    safe: false,
  },
  {
    id: 'png',
    filename: 'PAN_Card_Front.png',
    claimedMime: 'image/png',
    size: '640.2 KB',
    hex: '89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52',
    ascii: '.PNG........IHDR',
    signature: '0x89504E47 (PNG Signature)',
    verdict: 'VERIFIED',
    action: 'Streamed to s3://document-vault-files/uploads/',
    safe: true,
  },
];

const RUNBOOK_TABS = [
  {
    id: 'ingress',
    label: '01 / Ingress & TLS',
    badge: 'AWS Route 53 + Host NGINX',
    title: 'Hardened Perimeter & Loopback Reverse Proxy',
    description:
      'Public traffic resolves via AWS Route 53 to our Mumbai EC2 node (65.1.139.188). The AWS Security Group drops all non-TLS application ports at the perimeter; NGINX terminates TLS 1.3 and proxies strictly over 127.0.0.1 loopback.',
    specs: [
      { k: 'Primary DNS', v: 'doc.atharvjadhav.xyz (Route 53 A)' },
      { k: 'Exposed Ports', v: '443 (TLS 1.3), 80 (301 Redirect), 22' },
      { k: 'Revoked Ports', v: '5000 & 5173 blocked at Security Group' },
      { k: 'Cert Authority', v: 'Let’s Encrypt SAN Auto-Renew Timer' },
    ],
    file: '/etc/nginx/sites-available/default',
    code: `server {
  listen 443 ssl http2;
  server_name doc.atharvjadhav.xyz
              document-vault.atharvjadhav.xyz;

  ssl_certificate     /etc/letsencrypt/live/.../fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;

  location / {
    proxy_pass http://127.0.0.1:5173;
    proxy_set_header Host $host;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header X-Real-IP $remote_addr;
  }
}`,
  },
  {
    id: 'security',
    label: '02 / Magic-Byte Guard',
    badge: 'Zero-Trust Binary Inspection',
    title: '512-Byte Raw Disk Header Verification',
    description:
      'Client-supplied MIME types and file extensions are untrusted input. Before any file is committed to AWS S3 or PostgreSQL, the backend reads the first 512 bytes directly from the file descriptor to detect disguised executables.',
    specs: [
      { k: 'Inspection Depth', v: 'First 512 raw bytes on disk' },
      { k: 'Rejected Signatures', v: 'MZ (PE), 0x7F454C46 (ELF), #!, CAFEBABE' },
      { k: 'Allowed Formats', v: 'PDF, PNG, JPEG, DOCX, DOC, TXT' },
      { k: 'Remediation', v: 'Immediate synchronous fs.unlinkSync()' },
    ],
    file: 'backend/src/middleware/upload.js',
    code: `const validateFileContent = (filePath, ext) => {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(512);
  const bytesRead = fs.readSync(fd, buf, 0, 512, 0);
  fs.closeSync(fd);

  // Block Windows PE (MZ) & Linux ELF (0x7F 'E' 'L' 'F')
  if ((buf[0] === 0x4D && buf[1] === 0x5A) ||
      (buf[0] === 0x7F && buf[1] === 0x45 &&
       buf[2] === 0x4C && buf[3] === 0x46)) {
    fs.unlinkSync(filePath);
    throw new AppError('Disguised executable blocked', 400);
  }
  return true;
};`,
  },
  {
    id: 'backup',
    label: '03 / S3 Disaster Recovery',
    badge: 'Automated Snapshot Pipeline',
    title: 'Nightly PostgreSQL Snapshots to AWS S3',
    description:
      'Stateful container volumes are backed up nightly via system cron. Database dumps are streamed out of the isolated Postgres 15 container, compressed via gzip, uploaded to S3 in ap-south-1, and pruned on a 30-day rolling window.',
    specs: [
      { k: 'Schedule', v: '02:00 UTC Daily System Cron' },
      { k: 'Target Bucket', v: 's3://document-vault-files/backups/db/' },
      { k: 'Compression', v: 'gzip -9 stream pipe' },
      { k: 'Retention Policy', v: 'Automated 30-day lifecycle pruning' },
    ],
    file: 'scripts/backup-db.sh',
    code: `#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="/tmp/db_backup_\${TIMESTAMP}.sql.gz"

docker exec vault_postgres pg_dump \\
  -U "\${DB_USER}" -d "\${DB_NAME}" --clean --if-exists \\
  | gzip -9 > "\${BACKUP_FILE}"

aws s3 cp "\${BACKUP_FILE}" \\
  "s3://\${AWS_BUCKET_NAME}/backups/db/" \\
  --region ap-south-1 --only-show-errors

rm -f "\${BACKUP_FILE}"`,
  },
  {
    id: 'cicd',
    label: '04 / CI/CD & Health Gate',
    badge: 'GitHub Actions Automation',
    title: 'Deterministic Deployments with Loopback Verification',
    description:
      'Pushing to main triggers an automated SSH deployment workflow. After rebuilding the Docker Compose stack, a mandatory verification gate probes both the Express API and frontend ingress before marking the release healthy.',
    specs: [
      { k: 'Trigger', v: 'Git push to origin/main' },
      { k: 'Orchestration', v: 'docker compose up -d --build' },
      { k: 'Health Gate', v: 'curl -f http://127.0.0.1:5000/api/health' },
      { k: 'Disk Hygiene', v: 'Automated docker image prune -af' },
    ],
    file: '.github/workflows/deploy.yml',
    code: `- name: Deploy & Verify on AWS EC2
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: \${{ secrets.EC2_HOST }}
    username: ubuntu
    key: \${{ secrets.EC2_SSH_KEY }}
    script: |
      cd ~/document-vault
      git fetch origin main
      git reset --hard origin/main
      docker compose up -d --build
      sleep 10
      curl -f http://127.0.0.1:5000/api/health
      curl -f http://127.0.0.1:5173/`,
  },
];

const MOCK_VAULT_FILES = [
  {
    name: 'Aadhaar_Identity_Verified.pdf',
    category: 'Aadhaar',
    size: '1.2 MB',
    magic: '0x25504446 (%PDF-1.7)',
    storage: 'ap-south-1 · S3',
    updated: '2m ago',
    ext: 'PDF',
  },
  {
    name: 'AWS_Solutions_Architect_Cert.pdf',
    category: 'Certificates',
    size: '2.4 MB',
    magic: '0x25504446 (%PDF-1.6)',
    storage: 'ap-south-1 · S3',
    updated: '1d ago',
    ext: 'PDF',
  },
  {
    name: 'Passport_Bio_Page_HD.png',
    category: 'Passport',
    size: '845 KB',
    magic: '0x89504E47 (PNG)',
    storage: 'ap-south-1 · S3',
    updated: '3d ago',
    ext: 'PNG',
  },
  {
    name: 'Atharv_Jadhav_DevOps_CV.pdf',
    category: 'Resume',
    size: '410 KB',
    magic: '0x25504446 (%PDF-1.7)',
    storage: 'ap-south-1 · S3',
    updated: '5d ago',
    ext: 'PDF',
  },
];

const LandingPage = () => {
  const { isDark, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consoleMode, setConsoleMode] = useState('vault'); // 'vault' | 'hex' | 'topology'
  const [selectedSample, setSelectedSample] = useState(HEX_SAMPLES[0]);
  const [activeRunbook, setActiveRunbook] = useState('ingress');
  const [copied, setCopied] = useState(false);

  const currentRunbook = RUNBOOK_TABS.find((t) => t.id === activeRunbook) || RUNBOOK_TABS[0];

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentRunbook.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-vault-500 selection:text-white overflow-x-hidden">
      {/* ── Top System Telemetry Bar ───────────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-[#050609] text-slate-300 border-b border-slate-800/80 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PROD_ONLINE
            </span>
            <span className="text-slate-600 hidden xs:inline">|</span>
            <span className="truncate text-slate-400 hidden xs:inline">
              AWS EC2 <span className="text-slate-200">ap-south-1</span> · Route 53 · S3
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="text-slate-400 hidden md:inline">
              Engineered by <strong className="text-white font-semibold">Atharv Jadhav</strong>
            </span>
            <a
              href="https://github.com/atharvjadhav-dev/document-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <span>github/document-vault</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Sticky Navigation Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-surface-dark-200/80 bg-white/85 dark:bg-surface-dark/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-sm group-hover:bg-vault-600 dark:group-hover:bg-vault-500 dark:group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-slate-900 dark:text-white tracking-tight text-base leading-none">
                  Document Vault
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-surface-dark-100 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-surface-dark-200">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                doc.atharvjadhav.xyz
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#console" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-100 transition-colors">
              Interactive Console
            </a>
            <a href="#bento" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-100 transition-colors">
              Security Architecture
            </a>
            <a href="#runbook" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-100 transition-colors">
              Production Runbook
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl border border-slate-200/80 dark:border-surface-dark-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100 text-slate-600 dark:text-slate-400 transition-colors"
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
              to="/login"
              className="hidden sm:inline-flex btn-md btn-ghost text-slate-700 dark:text-slate-300"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="btn-sm sm:btn-md btn-primary"
            >
              <span>Open Vault</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="md:hidden p-2 rounded-xl border border-slate-200/80 dark:border-surface-dark-200 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-dark-100"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-surface-dark-200 bg-white dark:bg-surface-dark-50 px-4 pt-3 pb-5 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 gap-1">
              <a
                href="#console"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100"
              >
                01 / Interactive Console
              </a>
              <a
                href="#bento"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100"
              >
                02 / Security Architecture
              </a>
              <a
                href="#runbook"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark-100"
              >
                03 / Production Runbook
              </a>
            </div>
            <div className="pt-2 border-t border-slate-200/70 dark:border-surface-dark-200 grid grid-cols-2 gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-md btn-secondary w-full justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-md btn-primary w-full justify-center"
              >
                Create Vault
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative bg-grid-pattern border-b border-slate-200/80 dark:border-surface-dark-200">
        {/* Subtle radial spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(70,101,255,0.12),transparent_65%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-20 pb-14 sm:pb-20 relative z-10">
          <div className="max-w-3xl">
            {/* Technical Eyebrow */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-surface-dark-100 border border-slate-200/90 dark:border-surface-dark-200 shadow-sm mb-6">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                SHA-256 / TLS 1.3
              </span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                Zero-Trust Document Storage on AWS
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-950 dark:text-white tracking-tight leading-[1.08] mb-5">
              Cryptographic document storage with{' '}
              <span className="text-vault-600 dark:text-vault-400 underline decoration-vault-500/30 decoration-2 underline-offset-8">
                deep byte inspection.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mb-8">
              Engineered to defeat spoofed extensions and unauthorized link sharing. Every upload undergoes{' '}
              <span className="text-slate-900 dark:text-slate-200 font-semibold">512-byte binary header verification</span> on disk before streaming to encrypted{' '}
              <span className="text-slate-900 dark:text-slate-200 font-semibold">AWS S3</span> buckets with 60-second ephemeral access tokens.
            </p>

            {/* Primary CTAs — Full width on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/register"
                className="btn-lg btn-primary justify-center"
              >
                <span>Deploy Personal Vault</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="btn-lg btn-secondary justify-center"
              >
                <span>Sign In to Console</span>
              </Link>
              <a
                href="#console"
                className="btn-lg btn-ghost justify-center border border-transparent hover:border-slate-200 dark:hover:border-surface-dark-200"
              >
                <span className="font-mono text-xs">Test Hex Scanner ↓</span>
              </a>
            </div>

            {/* Key Engineering Specs Strip */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 dark:border-surface-dark-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 dark:text-slate-500">Inspection</div>
                <div className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">512-Byte Raw</div>
                <div className="text-[11px] text-slate-500">Blocks MZ / ELF / #!</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 dark:text-slate-500">Object Store</div>
                <div className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">AWS S3 Mumbai</div>
                <div className="text-[11px] text-slate-500">60s Presigned Streams</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 dark:text-slate-500">Ingress</div>
                <div className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">Route 53 + NGINX</div>
                <div className="text-[11px] text-slate-500">Strict 127.0.0.1 Proxy</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 dark:text-slate-500">Recovery</div>
                <div className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">02:00 UTC Cron</div>
                <div className="text-[11px] text-slate-500">30-Day S3 Snapshots</div>
              </div>
            </div>
          </div>

          {/* ── Interactive Live Engineering Console ────────────────────── */}
          <div id="console" className="mt-12 sm:mt-16 scroll-mt-24">
            <div className="rounded-2xl border border-slate-200 dark:border-surface-dark-200 bg-white dark:bg-surface-dark-50 shadow-2xl overflow-hidden">
              {/* Console Top Chrome + Interactive Mode Switcher */}
              <div className="border-b border-slate-200/80 dark:border-surface-dark-200 bg-slate-50/90 dark:bg-[#0b0e15] px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-white dark:bg-surface-dark-100 border border-slate-200/80 dark:border-surface-dark-200 flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>https://doc.atharvjadhav.xyz</span>
                  </div>
                </div>

                {/* Interactive Console Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-surface-dark-100 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'vault', label: '01 / Vault Explorer' },
                    { id: 'hex', label: '02 / Hex Byte Scanner' },
                    { id: 'topology', label: '03 / AWS Telemetry' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setConsoleMode(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                        consoleMode === tab.id
                          ? 'bg-white dark:bg-surface-dark-50 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console Mode 1: Vault Explorer */}
              {consoleMode === 'vault' && (
                <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-surface-dark-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                          Encrypted Object Repository
                        </h3>
                        <span className="badge-green font-mono">S3_CONNECTED</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Every file verified via 512-byte magic signature prior to S3 ingestion.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-surface-dark-100 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-surface-dark-200">
                        Bucket: <strong className="text-vault-600 dark:text-vault-400">document-vault-files</strong>
                      </span>
                    </div>
                  </div>

                  {/* Mobile Card List (< sm) */}
                  <div className="space-y-2.5 sm:hidden">
                    {MOCK_VAULT_FILES.map((file) => (
                      <div
                        key={file.name}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-surface-dark-200 bg-slate-50/60 dark:bg-surface-dark-100/50 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-vault-500/10 text-vault-600 dark:text-vault-400 border border-vault-500/20 shrink-0">
                              {file.ext}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {file.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">{file.size}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-200/50 dark:border-surface-dark-200/60">
                          <span className="text-emerald-600 dark:text-emerald-400">{file.magic}</span>
                          <span className="text-slate-400">{file.storage}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table (>= sm) */}
                  <div className="hidden sm:block rounded-xl border border-slate-200/80 dark:border-surface-dark-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-surface-dark-100/80 border-b border-slate-200/80 dark:border-surface-dark-200 text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                          <th className="py-3 px-4">Object Key</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Binary Header Signature</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4 text-right">Storage State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-surface-dark-200 text-xs">
                        {MOCK_VAULT_FILES.map((file) => (
                          <tr key={file.name} className="hover:bg-slate-50/80 dark:hover:bg-surface-dark-100/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-vault-500/10 text-vault-600 dark:text-vault-400 border border-vault-500/20">
                                {file.ext}
                              </span>
                              <span>{file.name}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{file.category}</td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                              {file.magic}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">{file.size}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {file.storage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Console Mode 2: Interactive Hex Byte Scanner */}
              {consoleMode === 'hex' && (
                <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Sample File Selector */}
                    <div className="lg:w-5/12 space-y-3">
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                          Test the 512-Byte Malware Blocker
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Select a payload below to inspect its raw disk bytes:
                        </p>
                      </div>

                      <div className="space-y-2">
                        {HEX_SAMPLES.map((sample) => {
                          const active = selectedSample.id === sample.id;
                          return (
                            <button
                              key={sample.id}
                              onClick={() => setSelectedSample(sample)}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                active
                                  ? 'border-vault-500 bg-vault-50/60 dark:bg-vault-950/30'
                                  : 'border-slate-200/80 dark:border-surface-dark-200 hover:bg-slate-50 dark:hover:bg-surface-dark-100'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                  {sample.filename}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500 truncate">
                                  MIME: {sample.claimedMime}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                  sample.safe
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                }`}
                              >
                                {sample.verdict}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Live Hex Dump Inspector */}
                    <div className="lg:w-7/12 rounded-xl bg-slate-950 text-slate-200 p-4 sm:p-5 font-mono text-xs border border-slate-800 flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="text-slate-400">fs.readSync(fd, buf, 0, 512, 0)</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedSample.safe
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {selectedSample.verdict}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 mb-1">Offset 0x00000000 (Raw Hex)</div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 tracking-wider overflow-x-auto whitespace-nowrap">
                            {selectedSample.hex}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[10px] uppercase text-slate-500">ASCII Decode</div>
                            <div className="text-slate-200 mt-1">{selectedSample.ascii}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[10px] uppercase text-slate-500">Detected Magic Header</div>
                            <div className={selectedSample.safe ? 'text-emerald-400 mt-1' : 'text-red-400 mt-1'}>
                              {selectedSample.signature}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border text-[11px] flex items-center gap-2 ${
                          selectedSample.safe
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                            : 'bg-red-950/30 border-red-800/60 text-red-300'
                        }`}
                      >
                        <span className="font-bold">Pipeline Action:</span>
                        <span>{selectedSample.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Console Mode 3: AWS Telemetry */}
              {consoleMode === 'topology' && (
                <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                      {
                        step: '01 / DNS_INGRESS',
                        name: 'AWS Route 53',
                        detail: 'doc.atharvjadhav.xyz → 65.1.139.188',
                        meta: 'Hosted Zone Z0765186R160ULWLRWZ5',
                        state: 'INSYNC',
                      },
                      {
                        step: '02 / TLS_TERMINATION',
                        name: 'Host NGINX 1.28',
                        detail: 'TLS 1.3 · HSTS · SAN Certificate',
                        meta: 'Ports 5000/5173 closed externally',
                        state: 'ACTIVE',
                      },
                      {
                        step: '03 / DOCKER_BRIDGE',
                        name: '3 Isolated Containers',
                        detail: 'Frontend · Express API · Postgres 15',
                        meta: 'Bound to 127.0.0.1 loopback',
                        state: '3/3 HEALTHY',
                      },
                      {
                        step: '04 / CLOUD_STORAGE',
                        name: 'AWS S3 + Nightly Cron',
                        detail: 's3://document-vault-files',
                        meta: 'ap-south-1 · 30-day pg_dump retention',
                        state: 'ENCRYPTED',
                      },
                    ].map((node) => (
                      <div
                        key={node.step}
                        className="p-4 rounded-xl border border-slate-200/80 dark:border-surface-dark-200 bg-slate-50/50 dark:bg-surface-dark-100/50 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono text-vault-600 dark:text-vault-400 font-bold">
                              {node.step}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {node.state}
                            </span>
                          </div>
                          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                            {node.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{node.detail}</p>
                        </div>
                        <div className="mt-4 pt-2.5 border-t border-slate-200/60 dark:border-surface-dark-200 text-[11px] font-mono text-slate-400">
                          {node.meta}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Asymmetric Bento Architecture Grid ─────────────────────────── */}
      <section id="bento" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-16">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <div className="text-xs font-mono uppercase tracking-wider text-vault-600 dark:text-vault-400 font-semibold mb-2">
            // System Defense-in-Depth
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Built like production infrastructure, not a toy CRUD app.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Every layer—from DNS resolution and security group firewall rules to binary file validation and S3 token streaming—is hardened for zero-trust isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bento Card 1: 2 Columns wide */}
          <div className="lg:col-span-2 card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="badge-blue font-mono">LAYER 01 · PAYLOAD SANITIZATION</span>
                <span className="text-xs font-mono text-slate-400">512-Byte Inspection</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Zero-Trust Magic-Byte Malware Blocker
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Attackers routinely rename <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-dark-100 text-red-500">trojan.exe</code> to{' '}
                <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-dark-100">invoice.pdf</code>. Our ingestion pipeline inspects raw hexadecimal file headers on disk before S3 upload, unlinking disguised PE, ELF, and shell payloads immediately.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-surface-dark-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="text-[10px] text-red-500 font-bold">BLOCKED</div>
                <div className="text-slate-900 dark:text-white font-semibold mt-0.5">0x4D 0x5A</div>
                <div className="text-[10px] text-slate-400">Windows PE (.exe)</div>
              </div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="text-[10px] text-red-500 font-bold">BLOCKED</div>
                <div className="text-slate-900 dark:text-white font-semibold mt-0.5">0x7F 45 4C 46</div>
                <div className="text-[10px] text-slate-400">Linux ELF Binary</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-500 font-bold">VERIFIED</div>
                <div className="text-slate-900 dark:text-white font-semibold mt-0.5">0x25 50 44 46</div>
                <div className="text-[10px] text-slate-400">Adobe PDF (%PDF-)</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-500 font-bold">VERIFIED</div>
                <div className="text-slate-900 dark:text-white font-semibold mt-0.5">0x89 50 4E 47</div>
                <div className="text-[10px] text-slate-400">PNG Image Stream</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: 1 Column */}
          <div className="card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="badge-green font-mono">LAYER 02 · ACCESS CONTROL</span>
                <span className="text-xs font-mono text-slate-400">TTL = 60s</span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
                Ephemeral Download Tokens
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Long-lived JWTs are never exposed in browser URLs. File previews and downloads mint a single-use cryptographic token that expires in 60 seconds.
              </p>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>GET /api/documents/:id/download-token</span>
                <span className="text-emerald-400">200</span>
              </div>
              <div className="text-vault-400 truncate">
                token: &quot;eyJhbGciOiJIUzI1NiIsInR5c...&quot;
              </div>
              <div className="text-amber-400">expiresIn: &quot;60s&quot; // S3 Presigned</div>
            </div>
          </div>

          {/* Bento Card 3: 1 Column */}
          <div className="card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="badge-purple font-mono">LAYER 03 · RESILIENCE</span>
                <span className="text-xs font-mono text-slate-400">02:00 UTC</span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
                Automated S3 Disaster Recovery
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Nightly cron jobs execute <code className="font-mono text-xs">pg_dump</code> inside the PostgreSQL container, pipe through gzip, and stream backups to AWS S3 with 30-day pruning.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-surface-dark-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Snapshot Target</span>
                <span className="text-slate-900 dark:text-slate-200">s3://.../backups/db/</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Retention Window</span>
                <span className="text-emerald-600 dark:text-emerald-400">30 Days Rolling</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: 2 Columns wide */}
          <div className="lg:col-span-2 card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="badge-orange font-mono">LAYER 04 · CLOUD PERIMETER</span>
                <span className="text-xs font-mono text-slate-400">ap-south-1</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Loopback-Isolated Containers & CI/CD Health Gates
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Application containers bind strictly to <code className="font-mono text-xs">127.0.0.1</code> and are unreachable from the public internet. Every GitHub Actions deployment verifies container health via local loopback probes before completing.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-surface-dark-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-dark-100 border border-slate-200/70 dark:border-surface-dark-200">
                <div className="text-slate-400 text-[10px]">FRONTEND_CONTAINER</div>
                <div className="text-slate-900 dark:text-white font-semibold mt-0.5">127.0.0.1:5173:80</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-dark-100 border border-slate-200/70 dark:border-surface-dark-200">
                <div className="text-slate-400 text-[10px]">BACKEND_CONTAINER</div>
                <div className="text-slate-900 dark:text-white font-semibold mt-0.5">127.0.0.1:5000:5000</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-dark-100 border border-slate-200/70 dark:border-surface-dark-200">
                <div className="text-slate-400 text-[10px]">POSTGRES_CONTAINER</div>
                <div className="text-slate-900 dark:text-white font-semibold mt-0.5">Internal Bridge :5432</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Production Runbook & Code Inspector ────────────────────────── */}
      <section id="runbook" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-surface-dark-200 bg-white dark:bg-surface-dark-50/40 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-vault-600 dark:text-vault-400 font-semibold mb-2">
                // Verified Configuration
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Production Architecture Runbook
              </h2>
            </div>

            {/* Horizontally Scrollable Tabs on Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {RUNBOOK_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRunbook(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                    activeRunbook === tab.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-surface-dark-100 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Specs Column */}
              <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-surface-dark-200">
                <div>
                  <span className="badge-blue font-mono mb-3">{currentRunbook.badge}</span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {currentRunbook.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {currentRunbook.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-surface-dark-200">
                  {currentRunbook.specs.map((s) => (
                    <div key={s.k} className="p-3 rounded-xl bg-slate-50 dark:bg-surface-dark-100/70 border border-slate-200/60 dark:border-surface-dark-200">
                      <div className="text-[10px] font-mono uppercase text-slate-400">{s.k}</div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Code Terminal Column */}
              <div className="lg:col-span-6 bg-slate-950 text-slate-100 p-5 sm:p-8 font-mono text-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="truncate">{currentRunbook.file}</span>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors shrink-0"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-emerald-400 overflow-x-auto leading-relaxed text-[11px] sm:text-xs flex-1">
                  <code>{currentRunbook.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Minimalist Footer CTA ──────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-surface-dark-200 bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-slate-200/70 dark:border-surface-dark-200">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Ready to initialize your vault?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create an encrypted account in seconds or inspect the full source code on GitHub.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <Link to="/register" className="btn-md btn-primary justify-center">
                Create Free Account
              </Link>
              <Link to="/login" className="btn-md btn-secondary justify-center">
                Sign In
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div>
              Engineered & Deployed by <strong className="text-slate-900 dark:text-white">Atharv Jadhav</strong> · doc.atharvjadhav.xyz
            </div>
            <div className="flex items-center gap-5">
              <a
                href="https://github.com/atharvjadhav-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://atharvjadhav.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Portfolio
              </a>
              <a
                href="mailto:atharvjadhav2024@gmail.com"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
