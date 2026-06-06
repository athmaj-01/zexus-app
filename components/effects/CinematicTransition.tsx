'use client';

import { motion } from 'framer-motion';

interface CinematicTransitionProps {
  isVisible: boolean;
}

export default function CinematicTransition({ isVisible }: CinematicTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    >
      {/* Horizontal wipe lines */}
      {isVisible && (
        <>
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.4, 0.6, 1], ease: 'easeInOut' }}
            className="absolute top-1/2 left-0 right-0"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)',
              transformOrigin: 'left',
            }}
          />
          <motion.div
            initial={{ scaleX: 0, originX: 1 }}
            animate={{ scaleX: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.4, 0.6, 1], ease: 'easeInOut', delay: 0.1 }}
            className="absolute top-[48%] left-0 right-0"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transformOrigin: 'right',
            }}
          />

          {/* Vignette flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />

          {/* Center lens flare */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
        </>
      )}
    </motion.div>
  );
}
