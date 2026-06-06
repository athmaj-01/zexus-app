'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import MagneticButton from '@/components/ui/MagneticButton';

const GlobeScene = dynamic(() => import('@/components/canvas/GlobeScene'), {
  ssr: false,
  loading: () => null,
});

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const mouseRef = useRef({ x: 0, y: 0 });

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <section className="section-full overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* 3D Globe Canvas — fullscreen behind */}
      <div className="canvas-container" style={{ zIndex: 0 }}>
        <GlobeScene mouseRef={mouseRef} />
      </div>

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.95) 100%)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,1))',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative flex flex-col items-center text-center px-6"
        style={{ zIndex: 2, maxWidth: '900px', margin: '0 auto' }}
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-8">
          <div className="chip">Network Intelligence Platform</div>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={item} className="heading-hero mb-6">
          Measure Speed{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #f5f5f7 30%, #6e6e73)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Beyond Numbers
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={item} className="body-lg mb-12" style={{ maxWidth: '520px' }}>
          Real-time network intelligence with immersive 3D visualization. Powered by Cloudflare
          infrastructure. Built for the future.
        </motion.p>

        {/* CTA */}
        <motion.div variants={item} className="flex items-center gap-4 flex-wrap justify-center">
          <MagneticButton variant="primary" onClick={onStart} id="start-speed-test-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Speed Test
          </MagneticButton>
          <MagneticButton variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            View History
          </MagneticButton>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={item}
          className="mt-20 flex items-center gap-8 flex-wrap justify-center"
        >
          {[
            { label: 'Global Servers', value: '330+' },
            { label: 'Tests Today', value: '2.4M' },
            { label: 'Avg Accuracy', value: '99.2%' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span
                className="text-2xl font-bold"
                style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
              >
                {stat.value}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 2 }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '32px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
          }}
        />
      </motion.div>
    </section>
  );
}
