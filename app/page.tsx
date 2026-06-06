'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import CinematicTransition from '@/components/effects/CinematicTransition';
import MagneticButton from '@/components/ui/MagneticButton';
import SpeedGauge from '@/components/ui/SpeedGauge';
import GlassCard from '@/components/ui/GlassCard';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import dynamic from 'next/dynamic';

const GlobeScene = dynamic(() => import('@/components/canvas/GlobeScene'), { ssr: false, loading: () => null });

/* ─── Scroll-driven background gradient ───────────────────────── */
function ScrollBackground() {
  const { scrollYProgress } = useScroll();

  // Map scroll 0→1 through cinematic color stops
  const bg = useTransform(
    scrollYProgress,
    [0, 0.2, 0.45, 0.7, 1],
    [
      // Hero: deep space — almost pure black, tiny blue aurora at top
      'radial-gradient(ellipse 120% 60% at 50% -10%, rgba(6,18,40,0.95) 0%, rgba(8,8,12,1) 55%)',
      // Features: deep indigo shift
      'radial-gradient(ellipse 120% 70% at 30% 20%, rgba(15,10,40,0.98) 0%, rgba(8,8,12,1) 60%)',
      // Mid: subtle graphite-blue
      'radial-gradient(ellipse 100% 80% at 70% 40%, rgba(5,15,30,0.98) 0%, rgba(8,8,12,1) 60%)',
      // CTA: warm charcoal, slight warmth
      'radial-gradient(ellipse 100% 60% at 50% 60%, rgba(14,10,10,0.98) 0%, rgba(8,8,12,1) 55%)',
      // Footer: pure black
      'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(8,8,12,1) 0%, rgba(6,6,8,1) 100%)',
    ]
  );

  // Subtle hue accent layer — slides across as you scroll
  const accentX = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const accentOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.07, 0.05, 0]);

  return (
    <>
      {/* Base background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ background: bg, zIndex: 0 }}
      />

      {/* Thin accent light that drifts across horizontally */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 80% at ${accentX} 30%, rgba(0,180,255,1) 0%, transparent 70%)`,
          opacity: accentOpacity,
          zIndex: 0,
        }}
      />

      {/* Persistent very-subtle grain */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          zIndex: 0,
        }}
      />
    </>
  );
}

/* ─── Floating orbs that parallax on scroll ───────────────────── */
function ParallaxOrbs() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 3000], [0, -400]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -200]);
  const y3 = useTransform(scrollY, [0, 3000], [0, -600]);
  const opacity1 = useTransform(scrollY, [0, 800, 1600], [1, 0.4, 0]);
  const opacity2 = useTransform(scrollY, [200, 900, 2000], [0, 0.6, 0]);
  const opacity3 = useTransform(scrollY, [600, 1400, 2400], [0, 0.5, 0]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Top-left deep blue orb */}
      <motion.div
        style={{ y: y1, opacity: opacity1 }}
        className="absolute"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20vh',
            left: '-15vw',
            width: '70vw',
            height: '70vh',
            background: 'radial-gradient(circle, rgba(0,100,200,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Center-right indigo orb — appears mid-scroll */}
      <motion.div style={{ y: y2, opacity: opacity2 }} className="absolute inset-0">
        <div
          style={{
            position: 'absolute',
            top: '30vh',
            right: '-20vw',
            width: '60vw',
            height: '60vh',
            background: 'radial-gradient(circle, rgba(80,30,180,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
          }}
        />
      </motion.div>

      {/* Bottom warm orb */}
      <motion.div style={{ y: y3, opacity: opacity3 }} className="absolute inset-0">
        <div
          style={{
            position: 'absolute',
            bottom: '-10vh',
            left: '20vw',
            width: '50vw',
            height: '50vh',
            background: 'radial-gradient(circle, rgba(0,180,200,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />
      </motion.div>
    </div>
  );
}

/* ─── Section divider — faint horizontal shimmer line ────────── */
function SectionDivider() {
  return (
    <div className="w-full relative py-0 overflow-hidden" style={{ height: 1 }}>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(0,212,255,0.15) 50%, rgba(255,255,255,0.06) 70%, transparent 100%)',
          transformOrigin: 'left',
        }}
      />
    </div>
  );
}

/* ─── Speed Test Overlay (modal-style, not full page) ────────── */
type TestPhase = 'idle' | 'starting' | 'ping' | 'download' | 'upload' | 'done';

function SpeedTestOverlay({
  onClose,
  phase,
  progress,
  liveSpeed,
  result,
}: {
  onClose: () => void;
  phase: TestPhase;
  progress: number;
  liveSpeed: number;
  result: any;
}) {
  const PHASE_COLORS: Record<string, string> = {
    ping: '#22c55e', download: '#00d4ff', upload: '#a855f7',
    starting: '#f5f5f7', idle: '#6e6e73', done: '#00d4ff',
  };
  const color = PHASE_COLORS[phase] || '#00d4ff';

  const phaseLabel: Record<string, string> = {
    idle: 'Ready', starting: 'Initializing…', ping: 'Measuring Latency',
    download: 'Testing Download', upload: 'Testing Upload', done: 'Complete',
  };

  function getQuality(dl: number) {
    if (dl >= 300) return { label: 'Ultra Fast', color: '#00d4ff' };
    if (dl >= 100) return { label: 'Excellent', color: '#22c55e' };
    if (dl >= 50) return { label: 'Good', color: '#84cc16' };
    if (dl >= 25) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Slow', color: '#ef4444' };
  }

  function getInsights(r: any): string[] {
    const ins: string[] = [];
    if (r.download >= 100) ins.push('Supports 4K streaming on multiple devices simultaneously.');
    if (r.upload >= 50) ins.push('Upload speed is optimal for video conferencing and cloud backup.');
    if (r.ping < 20) ins.push('Ultra-low latency — ideal for online gaming and live trading.');
    else if (r.ping < 50) ins.push('Low latency — excellent for real-time applications.');
    if (r.jitter < 5) ins.push('Network stability is exceptional with near-zero jitter.');
    if (!ins.length) ins.push('Your connection meets standard requirements for modern internet.');
    return ins;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 200, background: 'rgba(6,6,10,0.85)', backdropFilter: 'blur(24px)' }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-2xl mx-4"
        style={{
          background: 'rgba(12,12,18,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '40px',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)',
          borderRadius: '1px',
        }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-muted)', cursor: 'none', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        {/* ── TESTING STATE ── */}
        {phase !== 'done' && (
          <div className="flex flex-col items-center text-center">
            <div className="chip mb-6">{phaseLabel[phase]}</div>

            {/* Gauge */}
            <SpeedGauge
              value={liveSpeed}
              max={phase === 'ping' ? 200 : 500}
              label={phase === 'ping' ? 'ms' : 'Mbps'}
              color={color}
              size={220}
            />

            {/* Live number */}
            <motion.div
              className="mt-4 font-black"
              style={{ fontSize: '3.5rem', letterSpacing: '-0.05em', color, textShadow: `0 0 40px ${color}30` }}
            >
              {liveSpeed > 0 ? (liveSpeed < 10 ? liveSpeed.toFixed(1) : Math.round(liveSpeed)) : '—'}
            </motion.div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem' }}>
              {phase === 'ping' ? 'milliseconds' : 'megabits per second'}
            </div>

            {/* Progress */}
            <div style={{ width: '100%', maxWidth: 320 }}>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(progress)}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{phase}</span>
              </div>
            </div>

            {/* Phase steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
              {(['ping', 'download', 'upload'] as const).map((p, i) => {
                const isActive = phase === p;
                const isDone = (p === 'ping' && ['download','upload','done'].includes(phase as string))
                  || (p === 'download' && ['upload','done'].includes(phase as string))
                  || (p === 'upload' && (phase as string) === 'done');
                return (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {i > 0 && <div style={{ width: 24, height: 1, background: isDone ? 'var(--accent)' : 'rgba(255,255,255,0.1)', transition: 'background 0.5s' }} />}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: isActive || isDone ? 1 : 0.35 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700,
                        background: isDone ? 'rgba(0,212,255,0.12)' : isActive ? `${PHASE_COLORS[p]}18` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isDone ? 'var(--accent)' : isActive ? PHASE_COLORS[p] : 'rgba(255,255,255,0.08)'}`,
                        color: isDone ? 'var(--accent)' : isActive ? PHASE_COLORS[p] : 'var(--text-muted)',
                        transition: 'all 0.4s ease',
                      }}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', color: isActive ? PHASE_COLORS[p] : 'var(--text-muted)' }}>{p}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RESULTS STATE ── */}
        {phase === 'done' && result && (() => {
          const q = getQuality(result.download);
          const insights = getInsights(result);
          return (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div className="chip" style={{ marginBottom: 12 }}>Test Complete</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
                  Your Network is <span style={{ color: q.color }}>{q.label}</span>
                </div>
              </div>

              {/* Metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Download', value: result.download, unit: 'Mbps', color: '#00d4ff' },
                  { label: 'Upload', value: result.upload, unit: 'Mbps', color: '#a855f7' },
                  { label: 'Ping', value: result.ping, unit: 'ms', color: '#22c55e' },
                  { label: 'Jitter', value: result.jitter, unit: 'ms', color: '#f59e0b' },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 + 0.1 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${m.color}20`,
                      borderRadius: 16, padding: '16px 12px', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', color: m.color, lineHeight: 1 }}>
                      {m.value < 10 ? m.value.toFixed(1) : Math.round(m.value)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{m.unit}</div>
                  </motion.div>
                ))}
              </div>

              {/* Bars */}
              <div style={{ marginBottom: 20 }}>
                {[
                  { label: 'Your Download', value: result.download, max: 1000, color: '#00d4ff' },
                  { label: 'Global Average', value: 100, max: 1000, color: '#3d3d3f' },
                  { label: 'Your Upload', value: result.upload, max: 500, color: '#a855f7' },
                ].map((b) => (
                  <div key={b.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.color }}>{Math.round(b.value)} Mbps</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((b.value / b.max) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ height: '100%', background: b.color, borderRadius: '100px', boxShadow: `0 0 8px ${b.color}50` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 14, padding: '14px 16px', marginBottom: 24 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>AI Insight</div>
                {insights.slice(0, 2).map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 1 ? 6 : 0 }}>
                    <div style={{ width: 5, height: 5, background: 'var(--accent)', borderRadius: '50%', marginTop: 5, flexShrink: 0 }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <MagneticButton variant="primary" onClick={onClose} id="results-test-again">Test Again</MagneticButton>
                <MagneticButton variant="secondary" onClick={onClose}>Close</MagneticButton>
              </div>
            </div>
          );
        })()}
      </motion.div>
    </motion.div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */
export default function HomePage() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const [testOpen, setTestOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const { phase, progress, liveSpeed, result, startTest, reset } = useSpeedTest();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const handleStart = useCallback(async () => {
    setTransitioning(true);
    await new Promise(r => setTimeout(r, 500));
    setTransitioning(false);
    setTestOpen(true);
    await startTest();
  }, [startTest]);

  const handleClose = useCallback(() => {
    reset();
    setTestOpen(false);
  }, [reset]);

  /* ── scroll-driven text reveals ── */
  const { scrollY } = useScroll();
  const heroGlobeY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroGlobeOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 400], [0, -60]);
  const heroTextOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const FEATURES = [
    { icon: '⚡', title: 'Real-Time Analysis', desc: 'Live visualization as your test runs. WebGL-powered, frame-perfect.' },
    { icon: '🌐', title: 'Global Infrastructure', desc: 'Tested via Cloudflare\'s edge network across 330+ cities worldwide.' },
    { icon: '🧠', title: 'AI Insights', desc: 'Intelligent analysis of your results against millions of anonymized tests.' },
    { icon: '📊', title: 'Deep Metrics', desc: 'Download, upload, ping, jitter — all measured with scientific precision.' },
    { icon: '🔒', title: 'Privacy First', desc: 'No tracking. No cookies. No PII. Everything stays in your browser.' },
    { icon: '🎯', title: 'Accuracy Guaranteed', desc: 'Multi-stream methodology eliminates throttling and sampling artifacts.' },
  ];

  return (
    <>
      {/* Fixed scroll-driven background */}
      <ScrollBackground />
      <ParallaxOrbs />

      <Navbar />
      <CinematicTransition isVisible={transitioning} />

      {/* Test overlay */}
      <AnimatePresence>
        {testOpen && (
          <SpeedTestOverlay
            onClose={handleClose}
            phase={phase as TestPhase}
            progress={progress}
            liveSpeed={liveSpeed}
            result={result}
          />
        )}
      </AnimatePresence>

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════════════════ */}
        <section
          id="hero"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '0 24px',
          }}
        >
          {/* 3D Globe — parallaxes up as you scroll */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              y: heroGlobeY,
              opacity: heroGlobeOpacity,
              zIndex: 0,
            }}
          >
            <GlobeScene mouseRef={mouseRef} />
          </motion.div>

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 25%, rgba(6,6,10,0.75) 70%, rgba(6,6,10,0.97) 100%)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40vh', zIndex: 1, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, transparent, rgba(6,6,10,1))',
          }} />

          {/* Hero text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 860, y: heroTextY, opacity: heroTextOpacity }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
              <div className="chip">Network Intelligence Platform</div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="heading-hero" style={{ marginBottom: 24 }}>
              Measure Speed<br />
              <span style={{
                background: 'linear-gradient(135deg, #ffffff 20%, rgba(255,255,255,0.45) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Beyond Numbers
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="body-lg" style={{ maxWidth: 500, margin: '0 auto 44px' }}>
              Real-time network intelligence with cinematic 3D visualization.
              Powered by Cloudflare. Built for the future.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <MagneticButton variant="primary" onClick={handleStart} id="start-speed-test-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Start Speed Test
              </MagneticButton>
              <MagneticButton variant="secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
                View History
              </MagneticButton>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} style={{ marginTop: 72, display: 'flex', gap: 56, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[{ label: 'Global Servers', value: '330+' }, { label: 'Tests Today', value: '2.4M' }, { label: 'Avg Accuracy', value: '99.2%' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
            style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)' }}
            />
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2 — CAPABILITIES
        ══════════════════════════════════════════════ */}
        <SectionDivider />

        <section id="capabilities" style={{ padding: '140px 24px', maxWidth: 1080, margin: '0 auto' }}>
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: 72 }}
          >
            <div className="chip" style={{ marginBottom: 20 }}>Platform Capabilities</div>
            <h2 className="heading-xl" style={{ marginBottom: 16 }}>
              Intelligence at{' '}
              <span style={{
                background: 'linear-gradient(135deg, #f5f5f7 30%, rgba(255,255,255,0.35))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Every Layer
              </span>
            </h2>
            <p className="body-lg" style={{ maxWidth: 460, margin: '0 auto' }}>
              Zexus goes beyond raw numbers to deliver actionable network intelligence.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -5, transition: { duration: 0.22 } }}
                className="metric-card"
                style={{ padding: '28px' }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 3 — HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <SectionDivider />

        <section id="how" style={{ padding: '140px 24px', maxWidth: 900, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: 80 }}
          >
            <div className="chip" style={{ marginBottom: 20 }}>How It Works</div>
            <h2 className="heading-xl">
              Three Steps.{' '}
              <span style={{ color: 'var(--accent)', opacity: 0.9 }}>One Truth.</span>
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                step: '01',
                title: 'Latency Check',
                desc: 'We send small probe packets to Cloudflare\'s edge nodes to measure your true round-trip time and jitter.',
                color: '#22c55e',
              },
              {
                step: '02',
                title: 'Download Test',
                desc: 'We download progressively larger files — from 1MB to 25MB — to saturate your connection and find your peak throughput.',
                color: '#00d4ff',
              },
              {
                step: '03',
                title: 'Upload Test',
                desc: 'We upload randomized buffers to eliminate caching, measuring your sustained upload bandwidth accurately.',
                color: '#a855f7',
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex', gap: 32, alignItems: 'flex-start',
                  padding: '36px 32px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 20,
                  position: 'relative', overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                {/* Left accent bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: step.color, opacity: 0.6 }} />

                <div style={{
                  fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
                  color: step.color, opacity: 0.25, flexShrink: 0, minWidth: 60,
                }}>
                  {step.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 10 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4 — CTA
        ══════════════════════════════════════════════ */}
        <SectionDivider />

        <section id="cta" style={{ padding: '160px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Soft radial glow behind CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,180,255,0.05) 0%, transparent 70%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}
          >
            <div className="chip" style={{ marginBottom: 24, display: 'inline-flex' }}>30 seconds. Free. Private.</div>
            <h2 className="heading-xl" style={{ marginBottom: 20 }}>
              Know Your{' '}
              <span style={{ color: 'var(--accent)' }}>True Speed</span>
            </h2>
            <p className="body-lg" style={{ marginBottom: 44 }}>
              No account required. No tracking. Your data never leaves your browser.
            </p>

            <MagneticButton variant="primary" onClick={handleStart} id="bottom-start-btn">
              Run Speed Test
            </MagneticButton>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <SectionDivider />

        <footer style={{ padding: '32px 40px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: 'var(--accent-dim)',
                border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#00d4ff" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="2.5" fill="#00d4ff" opacity="0.8" />
                </svg>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ZEXUS</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Network Intelligence Platform</span>
            </div>
            <div style={{ display: 'flex', gap: 28, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>© 2025 Zexus</span>
              <a href="#" style={{ cursor: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Privacy</a>
              <a href="#" style={{ cursor: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>GitHub</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
