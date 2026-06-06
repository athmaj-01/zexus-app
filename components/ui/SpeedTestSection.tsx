'use client';

import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import SpeedGauge from '@/components/ui/SpeedGauge';
import MagneticButton from '@/components/ui/MagneticButton';
import { TestPhase } from '@/hooks/useSpeedTest';

const TunnelScene = dynamic(() => import('@/components/canvas/TunnelScene'), {
  ssr: false,
  loading: () => null,
});

interface SpeedTestSectionProps {
  phase: TestPhase;
  progress: number;
  liveSpeed: number;
  onReset: () => void;
}

const PHASE_LABELS: Record<TestPhase, string> = {
  idle: 'Ready',
  starting: 'Initializing...',
  ping: 'Measuring Latency',
  download: 'Testing Download',
  upload: 'Testing Upload',
  done: 'Complete',
};

const PHASE_COLORS: Record<string, string> = {
  ping: '#22c55e',
  download: '#00d4ff',
  upload: '#a855f7',
  starting: '#f5f5f7',
  idle: '#6e6e73',
  done: '#00d4ff',
};

export default function SpeedTestSection({
  phase,
  progress,
  liveSpeed,
  onReset,
}: SpeedTestSectionProps) {
  const color = PHASE_COLORS[phase] || '#00d4ff';
  const maxSpeed = phase === 'ping' ? 200 : 500;

  return (
    <section className="section-full overflow-hidden relative" style={{ minHeight: '100vh' }}>
      {/* Tunnel Canvas */}
      <div className="canvas-container" style={{ zIndex: 0, opacity: 0.85 }}>
        <TunnelScene phase={phase} liveSpeed={liveSpeed} progress={progress} />
      </div>

      {/* Dark gradient sides */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 50% 50%, transparent 40%, rgba(10,10,10,0.85) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center px-6" style={{ zIndex: 2 }}>
        {/* Phase indicator */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: color,
                boxShadow: `0 0 8px ${color}`,
                animation: phase !== 'done' && phase !== 'idle' ? 'pulse-dot 1s ease infinite' : 'none',
              }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {PHASE_LABELS[phase]}
            </span>
          </div>
        </motion.div>

        {/* Speed Gauge */}
        <motion.div
          animate={{ scale: [0.97, 1, 0.97] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <SpeedGauge
            value={liveSpeed}
            max={maxSpeed}
            label={phase === 'ping' ? 'ms' : 'Mbps'}
            color={color}
            size={240}
          />
        </motion.div>

        {/* Live readout */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="text-5xl font-black mb-1"
            style={{ letterSpacing: '-0.05em', color: color, textShadow: `0 0 30px ${color}40` }}
          >
            {liveSpeed > 0 ? (liveSpeed < 10 ? liveSpeed.toFixed(1) : Math.round(liveSpeed)) : '—'}
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {phase === 'ping' ? 'milliseconds' : 'megabits per second'}
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mb-10">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {Math.round(progress)}%
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {phase === 'ping'
                ? 'Latency'
                : phase === 'download'
                ? 'Download'
                : phase === 'upload'
                ? 'Upload'
                : phase === 'starting'
                ? 'Starting'
                : 'Complete'}
            </span>
          </div>
        </div>

        {/* Phase steps */}
        <div className="flex items-center gap-3 mb-8">
          {(['ping', 'download', 'upload'] as const).map((p, i) => {
            const isActive = phase === p;
            const isDone =
              (p === 'ping' && ['download', 'upload', 'done'].includes(phase)) ||
              (p === 'download' && ['upload', 'done'].includes(phase)) ||
              (p === 'upload' && phase === 'done');
            return (
              <div key={p} className="flex items-center gap-3">
                {i > 0 && (
                  <div
                    className="w-8 h-px"
                    style={{
                      background: isDone ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.5s',
                    }}
                  />
                )}
                <div
                  className="flex flex-col items-center gap-1"
                  style={{ opacity: isActive || isDone ? 1 : 0.4 }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: isDone
                        ? 'rgba(0,212,255,0.15)'
                        : isActive
                        ? `${PHASE_COLORS[p]}20`
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${
                        isDone ? 'var(--accent)' : isActive ? PHASE_COLORS[p] : 'rgba(255,255,255,0.1)'
                      }`,
                      color: isDone ? 'var(--accent)' : isActive ? PHASE_COLORS[p] : 'var(--text-muted)',
                      transition: 'all 0.4s ease',
                    }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span
                    className="text-xs font-medium capitalize"
                    style={{ color: isActive ? PHASE_COLORS[p] : 'var(--text-muted)' }}
                  >
                    {p}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel */}
        <MagneticButton variant="ghost" onClick={onReset}>
          Cancel Test
        </MagneticButton>
      </div>
    </section>
  );
}
