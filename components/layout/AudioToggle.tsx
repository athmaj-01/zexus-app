'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioToggle() {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Generate ambient sine wave audio via AudioContext (no file needed)
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = async () => {
    if (!loaded) {
      // Create ambient audio via Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const oscillators: OscillatorNode[] = [];
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);

      // Layered drones
      const freqs = [40, 60, 80, 120, 200];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        g.gain.value = 0.02 / (i + 1);
        osc.connect(g);
        g.connect(gainNode);
        osc.start();
        oscillators.push(osc);
      });

      // Fade in
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);
      setLoaded(true);
      setPlaying(true);

      // Store reference to stop
      (window as any).__zexusAudio = { ctx, gainNode, oscillators };
    } else {
      const { ctx, gainNode } = (window as any).__zexusAudio;
      if (playing) {
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
        setPlaying(false);
      } else {
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);
        setPlaying(true);
      }
    }
  };

  return (
    <motion.button
      onClick={toggle}
      data-cursor
      className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-colors"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: playing ? 'var(--accent)' : 'var(--text-muted)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={playing ? 'Mute ambient sound' : 'Play ambient sound'}
    >
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.span
            key="playing"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-1.5"
          >
            {/* Animated bars */}
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div
                key={i}
                className="w-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
                animate={{ height: ['8px', '16px', '8px'] }}
                transition={{ duration: 0.8, repeat: Infinity, delay }}
              />
            ))}
            <span className="ml-1">Ambient</span>
          </motion.span>
        ) : (
          <motion.span
            key="paused"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <span>Sound</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
