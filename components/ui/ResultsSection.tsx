'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { SpeedResult } from '@/hooks/useSpeedTest';

const ResultScene = dynamic(() => import('@/components/canvas/ResultScene'), {
  ssr: false,
  loading: () => null,
});

interface ResultsSectionProps {
  result: SpeedResult;
  onReset: () => void;
}

function getQuality(download: number): { label: string; color: string; desc: string } {
  if (download >= 300) return { label: 'Ultra Fast', color: '#00d4ff', desc: 'Exceeds 4K streaming requirements' };
  if (download >= 100) return { label: 'Excellent', color: '#22c55e', desc: 'Perfect for all modern use cases' };
  if (download >= 50) return { label: 'Good', color: '#84cc16', desc: 'Suitable for HD streaming and video calls' };
  if (download >= 25) return { label: 'Fair', color: '#f59e0b', desc: 'Adequate for basic browsing and SD streaming' };
  return { label: 'Slow', color: '#ef4444', desc: 'May struggle with video calls and streaming' };
}

function getInsights(result: SpeedResult): string[] {
  const insights: string[] = [];
  if (result.download >= 100) insights.push('Your connection supports 4K streaming on multiple devices.');
  if (result.upload >= 50) insights.push('Upload speed is optimal for video conferencing and cloud backup.');
  if (result.ping < 20) insights.push('Ultra-low latency — ideal for online gaming and trading.');
  else if (result.ping < 50) insights.push('Low latency — excellent for real-time applications.');
  if (result.jitter < 5) insights.push('Network stability is exceptional with near-zero jitter.');
  if (result.download > result.upload * 5) insights.push('Asymmetric connection detected — typical for residential ISPs.');
  return insights.length ? insights : ['Your connection meets standard requirements for modern internet usage.'];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function ResultsSection({ result, onReset }: ResultsSectionProps) {
  const quality = getQuality(result.download);
  const insights = getInsights(result);

  return (
    <section className="section-full relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* 3D Result Scene */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, opacity: 0.6 }}
      >
        <ResultScene result={result} />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(10,10,10,0.7) 70%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-4xl mx-auto px-6 py-20"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <motion.div variants={item} className="text-center mb-12">
          <div className="chip mb-4">Test Complete</div>
          <h2 className="heading-xl mb-3">
            Your Network is{' '}
            <span style={{ color: quality.color }}>{quality.label}</span>
          </h2>
          <p className="body-lg">{quality.desc}</p>
        </motion.div>

        {/* Main Metrics */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Download',
              value: result.download,
              unit: 'Mbps',
              color: '#00d4ff',
              icon: '↓',
              desc: 'Peak speed',
            },
            {
              label: 'Upload',
              value: result.upload,
              unit: 'Mbps',
              color: '#a855f7',
              icon: '↑',
              desc: 'Sustained throughput',
            },
            {
              label: 'Ping',
              value: result.ping,
              unit: 'ms',
              color: '#22c55e',
              icon: '◎',
              desc: 'Round-trip time',
            },
            {
              label: 'Jitter',
              value: result.jitter,
              unit: 'ms',
              color: '#f59e0b',
              icon: '≈',
              desc: 'Variation in latency',
            },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={item}
              className="metric-card"
              style={{
                borderColor: `${metric.color}20`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="metric-label">{metric.label}</div>
                <span style={{ color: metric.color, fontSize: '1.1rem', fontWeight: 700 }}>
                  {metric.icon}
                </span>
              </div>
              <motion.div
                className="metric-value"
                style={{
                  background: `linear-gradient(135deg, ${metric.color}, ${metric.color}80)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {metric.value < 10 ? metric.value.toFixed(1) : Math.round(metric.value)}
              </motion.div>
              <div className="metric-unit">{metric.unit}</div>
              <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {metric.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress bars comparison */}
        <motion.div variants={item}>
          <GlassCard className="p-6 mb-6">
            <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Speed Comparison
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Your Download', value: result.download, max: 1000, color: '#00d4ff' },
                { label: 'Global Average', value: 100, max: 1000, color: '#6e6e73' },
                { label: 'Your Upload', value: result.upload, max: 500, color: '#a855f7' },
                { label: 'Upload Average', value: 40, max: 500, color: '#6e6e73' },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {bar.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: bar.color }}>
                      {Math.round(bar.value)} Mbps
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: bar.color, boxShadow: `0 0 8px ${bar.color}60` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }}
                      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={item}>
          <GlassCard className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'var(--accent-dim)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#00d4ff">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                AI Network Insights
              </h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  className="insight-card flex items-start gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: 'var(--accent)' }}
                  />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {insight}
                  </p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Server info */}
        <motion.div
          variants={item}
          className="flex items-center justify-center gap-6 mb-10 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {result.server || 'Cloudflare Network'}
          </span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
          <span>•</span>
          <span>IPv4</span>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="flex items-center justify-center gap-4 flex-wrap">
          <MagneticButton variant="primary" onClick={onReset} id="test-again-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Test Again
          </MagneticButton>
          <MagneticButton variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
            Share Results
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
