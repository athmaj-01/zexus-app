'use client';

import { useEffect, useRef } from 'react';

interface HeroBackgroundProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

// ─── Canvas Particle System ────────────────────────────────────
function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let raf = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle palette — blue / cyan / soft purple
    const PALETTE = [
      [0, 200, 255],   // cyan
      [80, 160, 255],  // blue
      [120, 100, 255], // indigo
      [180, 130, 255], // soft purple
      [0, 230, 220],   // teal
    ];

    // Generate particles
    const COUNT = 180;
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18 - 0.04,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        r, g, b,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.012 + 0.005,
      };
    });

    // Bigger glowing orbs (fewer, larger, softer)
    const ORBS = Array.from({ length: 12 }, () => {
      const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06 - 0.015,
        size: Math.random() * 80 + 40,
        alpha: Math.random() * 0.06 + 0.02,
        r, g, b,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.006 + 0.002,
      };
    });

    let t = 0;

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      const mx = (mouseRef.current.x * 0.5 + 0.5) * W;
      const my = (-mouseRef.current.y * 0.5 + 0.5) * H;

      // ── Draw glow orbs ──────────────────────────────────────
      for (const orb of ORBS) {
        orb.pulse += orb.pulseSpeed;
        const pulseFactor = 0.85 + 0.15 * Math.sin(orb.pulse);
        const size = orb.size * pulseFactor;
        const alpha = orb.alpha * pulseFactor;

        // Mouse attraction — very gentle
        const dx = mx - orb.x;
        const dy = my - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          orb.vx += (dx / dist) * 0.0008;
          orb.vy += (dy / dist) * 0.0008;
        }

        orb.vx *= 0.995;
        orb.vy *= 0.995;
        orb.x = (orb.x + orb.vx + W) % W;
        orb.y = (orb.y + orb.vy + H) % H;

        const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, size);
        grd.addColorStop(0, `rgba(${orb.r},${orb.g},${orb.b},${alpha})`);
        grd.addColorStop(1, `rgba(${orb.r},${orb.g},${orb.b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw particles ──────────────────────────────────────
      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const pulseFactor = 0.7 + 0.3 * Math.sin(p.pulse);
        const size = p.size * pulseFactor;
        const alpha = p.alpha * pulseFactor;

        // Very subtle cursor influence
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += (dx / dist) * 0.001;
          p.vy += (dy / dist) * 0.001;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;

        // Draw point glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
        grd.addColorStop(0, `rgba(${p.r},${p.g},${p.b},${alpha})`);
        grd.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},${alpha * 0.4})`);
        grd.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Bright core dot
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${Math.min(alpha * 2, 1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, mouseRef]);
}

// ─── Main HeroBackground Component ────────────────────────────
export default function HeroBackground({ mouseRef }: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef, mouseRef);

  return (
    <div className="hero-bg-root">

      {/* ── 1. Deep space base ── */}
      <div className="hero-bg-base" />

      {/* ── 2. Aurora bands (pure CSS, animated) ── */}
      <div className="aurora-layer" aria-hidden>
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="aurora aurora-4" />
      </div>

      {/* ── 3. Nebula clouds (CSS blobs) ── */}
      <div className="nebula-layer" aria-hidden>
        <div className="nebula nebula-1" />
        <div className="nebula nebula-2" />
        <div className="nebula nebula-3" />
      </div>

      {/* ── 4. Volumetric light rays (CSS) ── */}
      <div className="rays-layer" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`ray ray-${i + 1}`} />
        ))}
      </div>

      {/* ── 5. Perspective grid floor ── */}
      <div className="grid-floor" aria-hidden>
        <div className="grid-floor-inner" />
      </div>

      {/* ── 6. Canvas particles + glow orbs ── */}
      <canvas
        ref={canvasRef}
        className="hero-particles-canvas"
        aria-hidden
      />

      {/* ── 7. Radial glow behind text area ── */}
      <div className="text-radial-glow" aria-hidden />

      {/* ── 8. Neon edge accents ── */}
      <div className="neon-edge-top" aria-hidden />
      <div className="neon-edge-bottom" aria-hidden />

      {/* ── 9. Final vignette ── */}
      <div className="hero-vignette" aria-hidden />
    </div>
  );
}
