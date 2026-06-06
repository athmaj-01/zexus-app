'use client';

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ── Network Globe ─────────────────────────────────────
function NetworkGlobe({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const { camera } = useThree();

  // Globe geometry: points on sphere
  const { positions, linePositions, streamPositions } = useMemo(() => {
    const pos: number[] = [];
    const linePts: number[] = [];
    const streamPts: number[] = [];

    // Latitude/longitude grid points
    for (let lat = -90; lat <= 90; lat += 8) {
      for (let lon = 0; lon < 360; lon += 8) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const r = 2.2;
        const x = -r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);
        pos.push(x, y, z);
      }
    }

    // Grid lines - latitude circles
    for (let lat = -80; lat <= 80; lat += 20) {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = 2.2;
      const segments = 64;
      for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;
        linePts.push(
          -r * Math.sin(phi) * Math.cos(theta1),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta1),
          -r * Math.sin(phi) * Math.cos(theta2),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta2)
        );
      }
    }

    // Grid lines - longitude meridians
    for (let lon = 0; lon < 360; lon += 20) {
      const theta = (lon + 180) * (Math.PI / 180);
      const r = 2.2;
      const segments = 48;
      for (let i = 0; i < segments; i++) {
        const phi1 = (i / segments) * Math.PI;
        const phi2 = ((i + 1) / segments) * Math.PI;
        linePts.push(
          -r * Math.sin(phi1) * Math.cos(theta),
          r * Math.cos(phi1),
          r * Math.sin(phi1) * Math.sin(theta),
          -r * Math.sin(phi2) * Math.cos(theta),
          r * Math.cos(phi2),
          r * Math.sin(phi2) * Math.sin(theta)
        );
      }
    }

    // Data stream points (animated along surface)
    for (let i = 0; i < 300; i++) {
      const phi = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;
      const r = 2.22;
      streamPts.push(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    return {
      positions: new Float32Array(pos),
      linePositions: new Float32Array(linePts),
      streamPositions: new Float32Array(streamPts),
    };
  }, []);

  const streamGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(streamPositions.slice(), 3));
    return geo;
  }, [streamPositions]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Slow auto rotation
    groupRef.current.rotation.y = t * 0.08;

    // Mouse parallax on camera
    const targetX = mouseRef.current.x * 0.4;
    const targetY = mouseRef.current.y * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    // Animate stream particles (they drift along surface)
    const posAttr = streamGeo.attributes.position as THREE.BufferAttribute;
    const original = streamPositions;
    for (let i = 0; i < posAttr.count; i++) {
      const idx = i * 3;
      const ox = original[idx];
      const oy = original[idx + 1];
      const oz = original[idx + 2];
      const wave = Math.sin(t * 0.8 + i * 0.3) * 0.015;
      posAttr.setXYZ(i, ox + wave, oy + wave, oz + wave);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {/* Base sphere - very dim */}
      <mesh>
        <sphereGeometry args={[2.18, 64, 64]} />
        <meshStandardMaterial
          color="#0a0a10"
          transparent
          opacity={0.3}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Grid lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#1a2a3a"
          transparent
          opacity={0.4}
          linewidth={1}
        />
      </lineSegments>

      {/* Grid dots */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#00d4ff"
          size={0.018}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Animated data stream */}
      <points geometry={streamGeo}>
        <pointsMaterial
          color="#ffffff"
          size={0.025}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[2.15, 32, 32]} />
        <meshStandardMaterial
          color="#00d4ff"
          transparent
          opacity={0.02}
          roughness={0}
          metalness={1}
          emissive="#00d4ff"
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
}

// ── Floating Particles ────────────────────────────────
function FloatingParticles({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.02 + mouseRef.current.x * 0.05;
    ref.current.rotation.x = mouseRef.current.y * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a1a1a6" size={0.012} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// ── Main Globe Scene ──────────────────────────────────
interface GlobeSceneProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export default function GlobeScene({ mouseRef }: GlobeSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} intensity={0.2} color="#00d4ff" />
      <Suspense fallback={null}>
        <NetworkGlobe mouseRef={mouseRef} />
        <FloatingParticles mouseRef={mouseRef} />
        <Stars radius={30} depth={20} count={800} factor={2} saturation={0} fade speed={0.5} />
      </Suspense>
    </Canvas>
  );
}
