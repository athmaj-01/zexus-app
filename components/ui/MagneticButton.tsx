'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  className?: string;
}

export default function MagneticButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 25 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springRotX = useSpring(rotX, springConfig);
  const springRotY = useSpring(rotY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    x.set(dx * 0.25);
    y.set(dy * 0.25);
    rotX.set(-dy * 0.08);
    rotY.set(dx * 0.08);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    rotX.set(0);
    rotY.set(0);
  };

  const baseClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : 'text-text-muted hover:text-text-primary transition-colors text-sm font-medium';

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        rotateX: springRotX,
        rotateY: springRotY,
        transformPerspective: 600,
        display: 'inline-block',
      }}
    >
      <button className={`${baseClass} ${className}`} {...props}>
        {children}
      </button>
    </motion.div>
  );
}
