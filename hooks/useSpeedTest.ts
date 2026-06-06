'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type TestPhase = 'idle' | 'starting' | 'ping' | 'download' | 'upload' | 'done';

export interface SpeedResult {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  isp?: string;
  server?: string;
}

export function useSpeedTest() {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const abortRef = useRef(false);
  const animRef = useRef<number>(0);

  const animateValue = useCallback(
    (
      from: number,
      to: number,
      duration: number,
      onUpdate: (v: number) => void,
      onDone?: () => void
    ) => {
      const start = performance.now();
      const step = (now: number) => {
        if (abortRef.current) return;
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        onUpdate(from + (to - from) * eased);
        if (t < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          onDone?.();
        }
      };
      animRef.current = requestAnimationFrame(step);
    },
    []
  );

  const measurePing = useCallback(async (): Promise<{ ping: number; jitter: number }> => {
    const times: number[] = [];
    for (let i = 0; i < 5; i++) {
      const t0 = performance.now();
      try {
        await fetch('https://1.1.1.1/cdn-cgi/trace', { cache: 'no-store', mode: 'no-cors' });
      } catch {}
      times.push(performance.now() - t0);
      await new Promise((r) => setTimeout(r, 100));
    }
    const sorted = [...times].sort((a, b) => a - b).slice(1, 4);
    const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;
    const jitter = Math.max(...sorted) - Math.min(...sorted);
    return { ping: Math.round(avg), jitter: Math.round(jitter) };
  }, []);

  const measureDownload = useCallback(
    async (onProgress: (mbps: number, pct: number) => void): Promise<number> => {
      const sizes = [1, 2, 5, 10, 25];
      let totalBytes = 0;
      let totalTime = 0;
      let pct = 0;

      for (let i = 0; i < sizes.length; i++) {
        if (abortRef.current) break;
        const mb = sizes[i];
        const url = `https://speed.cloudflare.com/__down?bytes=${mb * 1024 * 1024}`;
        const t0 = performance.now();
        try {
          const resp = await fetch(url, { cache: 'no-store' });
          const buf = await resp.arrayBuffer();
          const elapsed = (performance.now() - t0) / 1000;
          totalBytes += buf.byteLength;
          totalTime += elapsed;
          const mbps = (buf.byteLength * 8) / elapsed / 1e6;
          pct = ((i + 1) / sizes.length) * 100;
          onProgress(mbps, pct);
        } catch {
          // network error, use previous
        }
      }

      return totalTime > 0 ? (totalBytes * 8) / totalTime / 1e6 : 50;
    },
    []
  );

  const measureUpload = useCallback(
    async (onProgress: (mbps: number, pct: number) => void): Promise<number> => {
      const sizes = [512 * 1024, 1024 * 1024, 2 * 1024 * 1024];
      let totalBytes = 0;
      let totalTime = 0;

      for (let i = 0; i < sizes.length; i++) {
        if (abortRef.current) break;
        const size = sizes[i];
        const data = new Uint8Array(size);
        crypto.getRandomValues(data);
        const blob = new Blob([data]);
        const t0 = performance.now();
        try {
          await fetch('https://speed.cloudflare.com/__up', {
            method: 'POST',
            body: blob,
            cache: 'no-store',
          });
          const elapsed = (performance.now() - t0) / 1000;
          totalBytes += size;
          totalTime += elapsed;
          const mbps = (size * 8) / elapsed / 1e6;
          const pct = ((i + 1) / sizes.length) * 100;
          onProgress(mbps, pct);
        } catch {}
      }

      return totalTime > 0 ? (totalBytes * 8) / totalTime / 1e6 : 20;
    },
    []
  );

  const startTest = useCallback(async () => {
    abortRef.current = false;
    setResult(null);
    setPhase('starting');
    setProgress(0);
    setLiveSpeed(0);

    await new Promise((r) => setTimeout(r, 800));

    // PING
    setPhase('ping');
    const { ping, jitter } = await measurePing();
    setProgress(10);

    // DOWNLOAD
    setPhase('download');
    let downloadMbps = 0;
    downloadMbps = await measureDownload((mbps, pct) => {
      setLiveSpeed(Math.round(mbps * 10) / 10);
      setProgress(10 + pct * 0.5);
    });

    // UPLOAD
    setPhase('upload');
    let uploadMbps = 0;
    uploadMbps = await measureUpload((mbps, pct) => {
      setLiveSpeed(Math.round(mbps * 10) / 10);
      setProgress(60 + pct * 0.4);
    });

    setProgress(100);
    setPhase('done');
    setLiveSpeed(0);
    setResult({
      download: Math.round(downloadMbps * 10) / 10,
      upload: Math.round(uploadMbps * 10) / 10,
      ping,
      jitter,
      server: 'Cloudflare Network',
    });
  }, [measurePing, measureDownload, measureUpload]);

  const reset = useCallback(() => {
    abortRef.current = true;
    cancelAnimationFrame(animRef.current);
    setPhase('idle');
    setProgress(0);
    setLiveSpeed(0);
    setResult(null);
  }, []);

  return { phase, progress, liveSpeed, result, startTest, reset };
}
