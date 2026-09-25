import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const ARCHITECTURE_TABS = [
  {
    id: 'ingress',
    label: 'Cloud & Ingress',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    badge: 'AWS EC2 + Host NGINX',
    title: 'Dual-Layer Ingress & SSL Termination',
    description:
      'Incoming HTTPS traffic on document-vault.atharvjadhav.xyz resolves to AWS EC2 in Mumbai (ap-south-1). The host NGINX proxy terminates TLS 1.3 with Let’s Encrypt certificates, enforces 301 HTTPS redirection, and reverse-proxies requests into isolated Docker Compose bridge networks.',
    points: [
      'Port 80 automatically upgraded to Port 443 with HSTS headers',
      'Reverse proxy routing: "/" to React Vite (5173) and "/api/" to Express (5000)',
      'Automated SSL certificate renewals managed by Certbot systemd timer',
      'Container isolation with custom IPv4 healthcheck probes',
    ],
  },
  {
    id: 'security',
    label: 'Zero-Trust Malware Blocker',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    badge: 'Deep Magic-Byte Inspection',
    title: 'Neutralizing Disguised Executable Payloads',
    description:
      'Standard web applications rely on file extensions or client MIME types, which attackers easily bypass by renaming malware.exe to invoice.pdf. Our custom validation pipeline reads the initial 512 raw binary bytes from disk before storage.',
    points: [
      'Blocks Windows PE binaries ("MZ" / 0x4D5A) and Linux ELF executables (0x7F454C46)',
      'Detects shell scripts ("#!"), Java bytecode (0xCAFEBABE), and script tags (<?php, <script)',
      'Verifies genuine magic bytes for PDF (%PDF-), PNG, JPEG, and MS Office OpenXML',
      'Instant Disk Scrub: Rejected files are immediately unlinked from disk with zero leakage',
    ],
  },
  {
    id: 'backup',
    label: 'Disaster Recovery',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16m-5 4v6m-4-6v6" />
      </svg>
    ),
    badge: 'AWS S3 Snapshot Cron',
    title: 'Automated Cloud Database Backups',
    description:
      'A resilient production vault must survive catastrophic node failure. A scheduled cron job executes nightly database snapshots, compresses data with gzip, and streams snapshots directly to encrypted AWS S3 storage with retention pruning.',
    points: [
      'Nightly 2:00 AM UTC system cron triggers automated pg_dump inside postgres container',
      'High-ratio gzip compression reduces bandwidth and cloud storage costs',
      'Direct upload to AWS S3 bucket "document-vault-files/database-backups/" via AWS SDK v3',
      'Automated retention policy purges database snapshots older than 30 days',
    ],
  },
  {
    id: 'cicd',
    label: 'CI/CD Pipeline',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    badge: 'GitHub Actions to EC2',
    title: 'Continuous Delivery on Git Push',
    description:
      'Every push to the main branch triggers automated remote SSH deployment. The pipeline synchronizes the working tree, orchestrates parallel Docker builds, executes health checks, and purges dangling layers with zero manual intervention.',
    points: [
      'Secure SSH authentication using repository secrets (EC2_HOST, EC2_SSH_KEY)',
      'Deterministic deployments via "git fetch && git reset --hard origin/main"',
      'Automated container re-compilation with "docker compose up -d --build"',
      'Dangling Docker image pruning ("docker image prune -af") keeps disk clean',
    ],
  },
];

const INFRASTRUCTURE_METRICS = [
  {
    label: 'Cloud Compute',
    value: 'AWS EC2',
    sub: 'Ubuntu 22.04 LTS · ap-south-1',
    status: 'Healthy',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
  },
  {
    label: 'Ingress & SSL',
    value: 'NGINX + Certbot',
    sub: 'TLS 1.3 · Let’s Encrypt Auto-Renew',
    status: 'Verified',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Container Stack',
    value: 'Docker Compose',
    sub: '3 Microservices · Bridge Net',
    status: '3/3 Up',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Object Storage',
    value: 'AWS S3',
    sub: 'document-vault-files Bucket',
    status: 'Connected',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16" />
      </svg>
    ),
  },
  {
    label: 'Disaster Recovery',
    value: 'Daily S3 Cron',
    sub: 'Gzip SQL Snapshots · 2:00 AM UTC',
    status: 'Active',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'CI/CD Pipeline',
    value: 'GitHub Actions',
    sub: 'Deploy to EC2 on Push to Main',
    status: 'Passing',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Zero-Trust Magic-Byte Defense',
    description: 'Inspects raw disk byte headers to block disguised Windows executables (.exe), Linux ELF binaries, and shell scripts before storage.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Ephemeral Download Tokens',
    description: 'Downloads stream using 60-second cryptographic tokens. Session JWT tokens are never exposed in URL query parameters.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16" />
      </svg>
    ),
    title: 'Automated S3 Disaster Recovery',
    description: 'Daily PostgreSQL database dumps are gzip-compressed and streamed directly to AWS S3 with automatic 30-day snapshot pruning.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'Smart Categorization & Search',
    description: 'Organize Aadhaar, PAN, Passport, Education, Resumes, and Certificates with instant full-text filtering and tag management.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Automated CI/CD Deployment',
    description: 'Every git push triggers GitHub Actions, running remote SSH updates, container re-compilation, and zero-downtime image cleanup.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Live Storage Analytics',
    description: 'Real-time dashboard summarizing total document count, category allocations, and storage consumption quotas.',
  },
];

const LandingPage = () => {
  const { isDark, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState('ingress');

  const selectedTab = ARCHITECTURE_TABS.find((t) => t.id === activeTab) || ARCHITECTURE_TABS[0];

  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark flex flex-col font-sans transition-colors duration-200">
      {/* ── Top Engineer Ribbon ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-vault-800 via-vault-700 to-indigo-900 text-white text-xs py-2 px-4 border-b border-vault-600/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
              DevOps Portfolio
            </span>
            <span className="font-medium text-slate-100">
              Engineered & Deployed by <strong className="text-white font-semibold">Atharv Jadhav</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-vault-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live on AWS EC2 (ap-south-1)
            </span>
            <a
              href="https://github.com/atharvjadhav-dev/document-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-vault-200 font-semibold inline-flex items-center gap-1 underline underline-offset-2 transition-colors"
            >
              <span>GitHub Repo</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Header / Navbar ────────────────────────────────────────────── */}
      <header className="border-b border-surface-100 dark:border-surface-dark-200 sticky top-0 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center shadow-vault">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">Document Vault</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-vault-100 dark:bg-vault-900/50 text-vault-700 dark:text-vault-300 border border-vault-200 dark:border-vault-800">
                  v1.2 Prod
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Cloud-Native Storage</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#infrastructure" className="hover:text-vault-600 dark:hover:text-vault-400 transition-colors">
              Cloud Stack
            </a>
            <a href="#architecture" className="hover:text-vault-600 dark:hover:text-vault-400 transition-colors">
              DevOps Architecture
            </a>
            <a href="#features" className="hover:text-vault-600 dark:hover:text-vault-400 transition-colors">
              Security & Features
            </a>
            <a
              href="https://github.com/atharvjadhav-dev/document-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-vault-600 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-dark-100 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link to="/login" className="btn-md btn-ghost text-slate-700 dark:text-slate-300 font-medium">
              Sign In
            </Link>
            <Link to="/register" className="btn-md btn-primary">
              Launch Vault
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-vault-500/10 via-indigo-500/5 to-transparent blur-[90px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vault-50/90 dark:bg-vault-950/60 border border-vault-200/80 dark:border-vault-800/80 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-vault-700 dark:text-vault-300">
              AWS EC2 · AWS S3 · Docker Compose · NGINX SSL · GitHub Actions
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.15] mb-6 text-balance tracking-tight">
            Cloud-Native Document Vault
            <br />
            <span className="gradient-text">Engineered for Zero-Trust Security</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            A containerized microservices platform running live on <strong>AWS EC2</strong>. Built with deep magic-byte malware detection, automated daily database disaster recovery to <strong>AWS S3</strong>, and continuous delivery via GitHub Actions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <Link
              to="/register"
              className="btn-lg btn-primary shadow-vault-lg hover:-translate-y-0.5 transition-transform duration-200 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Free Vault</span>
            </Link>

            <Link
              to="/login"
              className="btn-lg btn-secondary hover:-translate-y-0.5 transition-transform duration-200 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-vault-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Explore Live Demo</span>
            </Link>

            <a
              href="https://github.com/atharvjadhav-dev/document-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lg btn-ghost border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-dark-100 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>View Source</span>
            </a>
          </div>

          {/* ── Interactive CSS Mock Dashboard ─────────────────────────── */}
          <div className="max-w-4xl mx-auto mt-14 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-surface-dark-50 shadow-2xl overflow-hidden flex flex-col text-left transition-all duration-300 hover:border-vault-300 dark:hover:border-vault-700">
            {/* Window bar */}
            <div className="h-11 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-surface-dark-100/80 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400/90 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-sm" />
              <div className="h-6 px-4 rounded-lg bg-slate-200/50 dark:bg-surface-dark-200/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mx-auto w-1/2 sm:w-1/3 justify-center select-none border border-slate-200/20">
                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-mono tracking-tight font-medium text-[10.5px]">document-vault.atharvjadhav.xyz</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:flex items-center gap-1">
                <span>TLS 1.3</span>
              </div>
            </div>

            {/* Layout */}
            <div className="flex flex-1 min-h-[360px] divide-x divide-slate-100 dark:divide-slate-800/80">
              {/* Mock Sidebar */}
              <div className="w-1/4 hidden md:flex flex-col p-4 bg-slate-50/30 dark:bg-surface-dark-50/20">
                <div className="flex items-center gap-2.5 px-2 py-1.5 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vault-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    AJ
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Atharv Jadhav</span>
                    <span className="text-[10px] text-vault-600 dark:text-vault-400 font-medium">DevOps Admin</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-vault-50 dark:bg-vault-950/50 text-vault-600 dark:text-vault-400 text-xs font-semibold select-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    <span>Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-dark-100/50 text-xs transition-colors select-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span>Vault Files</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-dark-100/50 text-xs transition-colors select-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span>Security Scanner</span>
                  </div>
                </div>

                {/* S3 Storage status mockup */}
                <div className="mt-auto p-3 rounded-xl bg-slate-50 dark:bg-surface-dark-100 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      AWS S3 Bucket
                    </span>
                    <span>Active</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-vault-500 rounded-full w-[28%]" />
                  </div>
                  <span className="block text-[9px] text-slate-400 mt-1 font-mono">s3://document-vault-files</span>
                </div>
              </div>

              {/* Mock Content */}
              <div className="flex-1 p-5 flex flex-col overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Production Vault</h3>
                    <p className="text-[10px] text-slate-400">Zero-trust binary signature validation active.</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Magic-Byte Guard: Active
                  </span>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-surface-dark-100/20">
                    <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Cloud Storage</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">AWS S3 (Mumbai)</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-surface-dark-100/20">
                    <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Disaster Recovery</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Daily 2 AM UTC</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-surface-dark-100/20">
                    <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Download Security</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">60s Token Auth</span>
                  </div>
                </div>

                {/* Document Table Mock */}
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Files in Storage</div>
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50/80 dark:bg-surface-dark-100/80 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Filename</th>
                          <th className="px-3 py-2 text-left font-semibold">Category</th>
                          <th className="px-3 py-2 text-left font-semibold">Security Check</th>
                          <th className="px-3 py-2 text-right font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">Aadhaar_Card.pdf</td>
                          <td className="px-3 py-2 text-slate-400">Aadhaar</td>
                          <td className="px-3 py-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800/50">
                              Magic-Byte: Verified (%PDF-)
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-slate-500 font-mono text-[10px]">S3 Stored</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">AWS_Solutions_Architect.pdf</td>
                          <td className="px-3 py-2 text-slate-400">Certificates</td>
                          <td className="px-3 py-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800/50">
                              Encrypted Stream
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-slate-500 font-mono text-[10px]">S3 Stored</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">Resume_Atharv_Jadhav.pdf</td>
                          <td className="px-3 py-2 text-slate-400">Resume</td>
                          <td className="px-3 py-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-medium border border-purple-200 dark:border-purple-800/50">
                              Ephemeral Token (60s)
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-slate-500 font-mono text-[10px]">S3 Stored</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Production Infrastructure Metrics ──────────────────────────── */}
      <section id="infrastructure" className="bg-slate-50 dark:bg-surface-dark-50 py-16 border-t border-b border-surface-100 dark:border-surface-dark-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-vault-600 dark:text-vault-400">
              Live AWS & Docker Topology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Production Infrastructure Health
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
              Every microservice, storage bucket, and automated cron running in active production.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INFRASTRUCTURE_METRICS.map((m) => (
              <div
                key={m.label}
                className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-dark-100 border border-slate-100 dark:border-slate-800">
                    {m.icon}
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {m.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{m.label}</h3>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{m.value}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive DevOps Architecture Tabs ───────────────────────── */}
      <section id="architecture" className="py-20 bg-white dark:bg-surface-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-vault-600 dark:text-vault-400">
              Systems Engineering Deep-Dive
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              DevOps & Cloud Architecture
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-2">
              Explore the design decisions, automated pipelines, and defensive layers powering the vault.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-surface-dark-100 max-w-2xl mx-auto mb-10 border border-slate-200/60 dark:border-slate-800/80">
            {ARCHITECTURE_TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white dark:bg-surface-dark text-vault-600 dark:text-vault-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Card */}
          <div className="card p-8 sm:p-10 border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-surface-dark-50 shadow-xl rounded-3xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-vault-50 dark:bg-vault-950/60 text-vault-600 dark:text-vault-300 border border-vault-200 dark:border-vault-800 mb-3">
                  {selectedTab.badge}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {selectedTab.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {selectedTab.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedTab.points.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-surface-dark-100/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2.5"
                    >
                      <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="w-full lg:w-96 rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-xs border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    verified-runbook.sh
                  </span>
                  <span>AWS Mumbai</span>
                </div>
                {activeTab === 'ingress' && (
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed text-[11px]">
{`# NGINX Host Ingress
server {
  listen 443 ssl http2;
  server_name document-vault.atharvjadhav.xyz;

  ssl_certificate /etc/letsencrypt/live/...;
  
  location / {
    proxy_pass http://localhost:5173;
  }
  location /api/ {
    proxy_pass http://localhost:5000;
  }
}`}
                  </pre>
                )}
                {activeTab === 'security' && (
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed text-[11px]">
{`// Magic-Byte Validation
const buf = Buffer.alloc(512);
fs.readSync(fd, buf, 0, 512, 0);

// Reject Windows PE executable
if (buf[0] === 0x4D && buf[1] === 0x5A) {
  fs.unlinkSync(filePath);
  throw new Error("Prohibited PE executable");
}`}
                  </pre>
                )}
                {activeTab === 'backup' && (
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed text-[11px]">
{`# Nightly S3 Backup Cron (2 AM UTC)
docker exec vault_postgres pg_dump \\
  -U vault_user -d document_vault \\
  | gzip > /tmp/$BACKUP_NAME

aws s3 cp /tmp/$BACKUP_NAME \\
  s3://document-vault-files/backups/`}
                  </pre>
                )}
                {activeTab === 'cicd' && (
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed text-[11px]">
{`# GitHub Actions Deploy
- name: Deploy to EC2
  run: |
    cd ~/document-vault
    git reset --hard origin/main
    docker compose up -d --build
    docker image prune -af`}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────── */}
      <section id="features" className="bg-surface-50 dark:bg-surface-dark-50 py-20 border-t border-surface-100 dark:border-surface-dark-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-vault-600 dark:text-vault-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Engineered with Production Best Practices
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto mt-2">
              Every feature adheres to enterprise security, high availability, and least-privilege principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card p-6 hover:shadow-vault transition-all duration-300 hover:-translate-y-0.5 hover:border-vault-200 dark:hover:border-vault-800"
              >
                <div className="w-12 h-12 rounded-2xl bg-vault-50 dark:bg-vault-900/30 text-vault-600 dark:text-vault-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action ─────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-vault-700 via-vault-800 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium mb-6">
            <span>Ready to explore the vault?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
            Try the Cloud-Native Vault Live
          </h2>
          <p className="text-vault-200 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Create an account in seconds or explore the repository source code, Docker configs, and disaster recovery scripts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link
              to="/register"
              className="btn-lg bg-white text-vault-800 hover:bg-vault-50 font-bold shadow-vault-lg inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 transition-transform hover:-translate-y-0.5 duration-200"
            >
              <span>Create Account</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="https://github.com/atharvjadhav-dev/document-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 transition-all"
            >
              <span>View GitHub Source</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-100 dark:border-surface-dark-200 py-8 bg-white dark:bg-surface-dark">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-vault-500 flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span>
              Engineered by <strong className="text-slate-900 dark:text-white font-semibold">Atharv Jadhav</strong>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a
              href="https://github.com/atharvjadhav-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-vault-600 dark:hover:text-vault-300 transition-colors font-medium"
            >
              GitHub Profile
            </a>
            <a
              href="https://github.com/atharvjadhav-dev/document-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-vault-600 dark:hover:text-vault-300 transition-colors font-medium"
            >
              Repository
            </a>
            <a
              href="mailto:atharvjadhav2024@gmail.com"
              className="hover:text-vault-600 dark:hover:text-vault-300 transition-colors font-medium"
            >
              atharvjadhav2024@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
