'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface SpeedGaugeProps {
  value: number; // 0-1000 Mbps
  max?: number;
  label: string;
  color?: string;
  size?: number;
}

export default function SpeedGauge({
  value,
  max = 500,
  label,
  color = '#00d4ff',
  size = 200,
}: SpeedGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedValue = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    const strokeW = size * 0.04;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = strokeW;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tick marks
      const tickCount = 10;
      for (let i = 0; i <= tickCount; i++) {
        const angle = startAngle + (i / tickCount) * totalAngle;
        const inner = r - strokeW / 2 - 6;
        const outer = r - strokeW / 2 - 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Value arc
      const pct = Math.min(animatedValue.current / max, 1);
      const valueAngle = startAngle + pct * totalAngle;

      if (pct > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, valueAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeW;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tip dot
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(valueAngle) * r,
          cy + Math.sin(valueAngle) * r,
          strokeW / 2 + 2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const animate = () => {
      animatedValue.current += (value - animatedValue.current) * 0.08;
      draw();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, max, color, size]);

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={Math.round(value)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="metric-value"
          style={{ fontSize: size * 0.18 }}
        >
          {value < 10 ? value.toFixed(1) : Math.round(value)}
        </motion.div>
        <div className="metric-unit">{label}</div>
      </div>
    </div>
  );
}
