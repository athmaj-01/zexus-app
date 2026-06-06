'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpeedResult } from '@/hooks/useSpeedTest';

// ── Animated Bar Chart ────────────────────────────────
function BarChart({ result }: { result: SpeedResult }) {
  const downloadRef = useRef<THREE.Mesh>(null!);
  const uploadRef = useRef<THREE.Mesh>(null!);
  const pingRef = useRef<THREE.Mesh>(null!);
  const scalesRef = useRef({ dl: 0, ul: 0, ping: 0 });

  const maxDl = Math.max(result.download, 1);
  const maxUl = Math.max(result.upload, 1);
  const maxPing = 150;

  const targetDl = Math.min(result.download / 200, 1) * 2.5;
  const targetUl = Math.min(result.upload / 100, 1) * 2.5;
  const targetPing = Math.max(0, (1 - result.ping / maxPing)) * 2.5;

  useFrame(() => {
    scalesRef.current.dl += (targetDl - scalesRef.current.dl) * 0.04;
    scalesRef.current.ul += (targetUl - scalesRef.current.ul) * 0.04;
    scalesRef.current.ping += (targetPing - scalesRef.current.ping) * 0.04;

    if (downloadRef.current) {
      downloadRef.current.scale.y = Math.max(0.01, scalesRef.current.dl);
      downloadRef.current.position.y = scalesRef.current.dl / 2 - 1.2;
    }
    if (uploadRef.current) {
      uploadRef.current.scale.y = Math.max(0.01, scalesRef.current.ul);
      uploadRef.current.position.y = scalesRef.current.ul / 2 - 1.2;
    }
    if (pingRef.current) {
      pingRef.current.scale.y = Math.max(0.01, scalesRef.current.ping);
      pingRef.current.position.y = scalesRef.current.ping / 2 - 1.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Download bar */}
      <mesh ref={downloadRef} position={[-1.6, -1.2, 0]}>
        <boxGeometry args={[0.6, 1, 0.2]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Upload bar */}
      <mesh ref={uploadRef} position={[0, -1.2, 0]}>
        <boxGeometry args={[0.6, 1, 0.2]} />
        <meshStandardMaterial color="#a855f7" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Ping bar */}
      <mesh ref={pingRef} position={[1.6, -1.2, 0]}>
        <boxGeometry args={[0.6, 1, 0.2]} />
        <meshStandardMaterial color="#22c55e" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -1.22, -0.12]}>
        <boxGeometry args={[5, 0.02, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

// ── Orbit Rings ───────────────────────────────────────
function OrbitRings({ result }: { result: SpeedResult }) {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.2;
    if (ring3Ref.current) ring3Ref.current.rotation.x = t * 0.15;
  });

  return (
    <group position={[0, 0.5, -1]}>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.8, 0.006, 4, 200]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.2, 0.004, 4, 200]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <torusGeometry args={[3.6, 0.003, 4, 200]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// ── Burst Particles ───────────────────────────────────
function BurstParticles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(500 * 3);
    const velocities = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      velocities[i * 3] = (Math.random() - 0.5) * 0.15;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }
    return { pos, velocities };
  }, []);

  const started = useRef(false);
  const posArr = useMemo(() => positions.pos.slice(), [positions.pos]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < 500; i++) {
      const factor = Math.min(t * 0.8, 1);
      posArr[i * 3] = positions.velocities[i * 3] * t * 5 * factor;
      posArr[i * 3 + 1] = positions.velocities[i * 3 + 1] * t * 5 * factor - t * t * 0.05;
      posArr[i * 3 + 2] = positions.velocities[i * 3 + 2] * t * 5 * factor;
    }

    posAttr.set(posArr);
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00d4ff" size={0.05} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// ── Result Scene ──────────────────────────────────────
interface ResultSceneProps {
  result: SpeedResult;
}

export default function ResultScene({ result }: ResultSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 5, 3]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#00d4ff" />
      <pointLight position={[0, 0, 4]} intensity={0.5} color="#a855f7" />
      <Suspense fallback={null}>
        <BarChart result={result} />
        <OrbitRings result={result} />
        <BurstParticles />
      </Suspense>
    </Canvas>
  );
}
