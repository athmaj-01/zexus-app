'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AudioToggle from '@/components/layout/AudioToggle';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,212,255,0.25)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
              stroke="#00d4ff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" fill="#00d4ff" opacity="0.8" />
          </svg>
        </div>
        <span
          className="text-sm font-bold tracking-tight"
          style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
        >
          ZEXUS
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            border: '1px solid rgba(0,212,255,0.15)',
            fontSize: '0.65rem',
            letterSpacing: '0.06em',
          }}
        >
          BETA
        </span>
      </div>

      {/* Center nav links */}
      <div className="hidden md:flex items-center gap-8">
        {['Speed Test', 'Analytics', 'Network', 'About'].map((item) => (
          <button
            key={item}
            data-cursor
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)', cursor: 'none' }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = 'var(--text-muted)')}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <AudioToggle />
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-muted)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          All systems operational
        </div>
      </div>
    </motion.nav>
  );
}
