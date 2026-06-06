'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TestPhase } from '@/hooks/useSpeedTest';

// ── Tunnel Rings ──────────────────────────────────────
function TunnelRings({ phase }: { phase: TestPhase }) {
  const groupRef = useRef<THREE.Group>(null!);
  const RING_COUNT = 32;

  const rings = useMemo(() => {
    return Array.from({ length: RING_COUNT }, (_, i) => ({
      z: -i * 2.5,
      scale: 0.6 + i * 0.035,
      opacity: Math.max(0, 1 - i * 0.04),
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const speed = phase === 'download' ? 2.5 : phase === 'upload' ? 2.0 : phase === 'ping' ? 1.0 : 1.2;
    groupRef.current.children.forEach((ring, i) => {
      const z = ((-i * 2.5 + t * speed * 2.5) % (RING_COUNT * 2.5)) - 2.5;
      ring.position.z = z;
      (ring as THREE.Mesh).rotation.z = t * 0.2 + i * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, (i * Math.PI) / RING_COUNT]}>
          <torusGeometry args={[ring.scale * 2.5, 0.008, 6, 120]} />
          <meshBasicMaterial
            color={i % 4 === 0 ? '#00d4ff' : '#2a3a4a'}
            transparent
            opacity={ring.opacity * (i % 4 === 0 ? 0.9 : 0.3)}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Energy Wave ────────────────────────────────────────
function EnergyWave({ phase }: { phase: TestPhase }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const shader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: 0 },
        uColor: { value: new THREE.Color('#00d4ff') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPhase;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float wave = sin((vUv.x * 20.0 - uTime * 4.0)) * 0.5 + 0.5;
          float pulse = sin((vUv.y * 8.0 + uTime * 2.0)) * 0.5 + 0.5;
          float alpha = wave * pulse * 0.25 * uPhase;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    const targetPhase = ['download', 'upload'].includes(phase) ? 1 : 0;
    mat.uniforms.uPhase.value += (targetPhase - mat.uniforms.uPhase.value) * 0.05;
    if (phase === 'upload') {
      mat.uniforms.uColor.value.set('#a855f7');
    } else {
      mat.uniforms.uColor.value.set('#00d4ff');
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <cylinderGeometry args={[2.49, 2.49, 80, 64, 1, true]} />
      <shaderMaterial args={[shader]} transparent side={THREE.BackSide} />
    </mesh>
  );
}

// ── Speed Particles ────────────────────────────────────
function SpeedParticles({ phase }: { phase: TestPhase }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.8;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, []);

  const speedRef = useRef(0);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const targetSpeed = ['download', 'upload'].includes(phase) ? 8 : phase === 'ping' ? 3 : 0.5;
    speedRef.current += (targetSpeed - speedRef.current) * 0.06;

    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      let z = posAttr.getZ(i) + speedRef.current * 0.16;
      if (z > 5) z -= 80;
      posAttr.setZ(i, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={phase === 'upload' ? '#a855f7' : '#00d4ff'}
        size={0.04}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// ── Main Tunnel Scene ──────────────────────────────────
interface TunnelSceneProps {
  phase: TestPhase;
  liveSpeed: number;
  progress: number;
}

export default function TunnelScene({ phase, liveSpeed, progress }: TunnelSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 70 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 2]} intensity={2} color="#00d4ff" />
      <Suspense fallback={null}>
        <TunnelRings phase={phase} />
        <EnergyWave phase={phase} />
        <SpeedParticles phase={phase} />
      </Suspense>
    </Canvas>
  );
}
