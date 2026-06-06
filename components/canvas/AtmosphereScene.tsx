'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── Aurora Bands ─────────────────────────────────────────────
function AuroraBands({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const mesh1 = useRef<THREE.Mesh>(null!);
  const mesh2 = useRef<THREE.Mesh>(null!);
  const mesh3 = useRef<THREE.Mesh>(null!);

  const auroraMat = (color1: string, color2: string, offset: number) =>
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uOffset: { value: offset },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uOffset;
        uniform vec2 uMouse;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave1 = sin(pos.x * 1.2 + uTime * 0.4 + uOffset) * 0.35;
          float wave2 = sin(pos.x * 0.7 - uTime * 0.3 + uOffset * 1.5) * 0.2;
          float wave3 = cos(pos.x * 0.5 + uTime * 0.25) * 0.15;
          float mouseInfluence = uMouse.x * 0.08 * (1.0 - abs(pos.x / 6.0));
          pos.y += wave1 + wave2 + wave3 + mouseInfluence;
          vWave = (wave1 + wave2) * 0.5 + 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          float alpha = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
          alpha *= 0.45;
          float band = sin(vUv.x * 8.0 + uTime * 0.5) * 0.5 + 0.5;
          vec3 color = mix(uColor1, uColor2, band * vWave);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

  const mat1 = useMemo(() => auroraMat('#00d4ff', '#7c3aed', 0.0), []);
  const mat2 = useMemo(() => auroraMat('#7c3aed', '#06b6d4', 2.1), []);
  const mat3 = useMemo(() => auroraMat('#0ea5e9', '#8b5cf6', 4.2), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const mx = mouseRef.current.x;
    [mat1, mat2, mat3].forEach((mat) => {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uMouse.value.set(mx, mouseRef.current.y);
    });
    if (mesh1.current) mesh1.current.position.x = mx * 0.15;
    if (mesh2.current) mesh2.current.position.x = -mx * 0.1;
    if (mesh3.current) mesh3.current.position.x = mx * 0.08;
  });

  return (
    <group>
      <mesh ref={mesh1} position={[0, 1.2, -3]} material={mat1}>
        <planeGeometry args={[14, 3, 80, 1]} />
      </mesh>
      <mesh ref={mesh2} position={[0.5, 0.4, -4]} material={mat2}>
        <planeGeometry args={[12, 2.5, 60, 1]} />
      </mesh>
      <mesh ref={mesh3} position={[-0.3, 2.0, -5]} material={mat3}>
        <planeGeometry args={[16, 2, 60, 1]} />
      </mesh>
    </group>
  );
}

// ── Nebula Clouds ──────────────────────────────────────────────
function NebulaClouds() {
  const groupRef = useRef<THREE.Group>(null!);

  const cloudMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#1e1b4b') },
          uAccent: { value: new THREE.Color('#0c4a6e') },
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
          uniform vec3 uColor;
          uniform vec3 uAccent;
          varying vec2 vUv;
          
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i), hash(i + vec2(1,0)), f.x),
              mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
              f.y
            );
          }
          
          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for(int i = 0; i < 5; i++) {
              v += a * noise(p);
              p = p * 2.1 + vec2(1.7, 9.2);
              a *= 0.5;
            }
            return v;
          }
          
          void main() {
            vec2 uv = vUv - 0.5;
            float t = uTime * 0.06;
            float n = fbm(uv * 2.5 + t);
            float n2 = fbm(uv * 1.8 - t * 0.7 + vec2(3.2, 1.1));
            float cloud = smoothstep(0.4, 0.65, n * 0.6 + n2 * 0.4);
            float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x)
                       * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
            vec3 color = mix(uColor, uAccent, n2);
            gl_FragColor = vec4(color, cloud * edge * 0.35);
          }
        `,
      }),
    []
  );

  useFrame((state) => {
    cloudMat.uniforms.uTime.value = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.04) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-2, 0, -6]} material={cloudMat}>
        <planeGeometry args={[10, 7]} />
      </mesh>
      <mesh position={[3, 1, -7]} material={cloudMat} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[8, 5]} />
      </mesh>
    </group>
  );
}

// ── Volumetric Light Rays ──────────────────────────────────────
function LightRays({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null!);

  const rayMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.12 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float ray = smoothstep(0.45, 0.5, vUv.x) * smoothstep(0.55, 0.5, vUv.x);
            float fade = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.4, vUv.y);
            float flicker = 0.85 + 0.15 * sin(uTime * 1.2 + vUv.y * 8.0);
            gl_FragColor = vec4(0.4, 0.85, 1.0, ray * fade * flicker * uOpacity);
          }
        `,
      }),
    []
  );

  const rays = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: (i - 3.5) * 1.1,
        rotation: (i - 3.5) * 0.06,
        scale: 0.6 + Math.random() * 0.8,
        delay: i * 0.3,
      })),
    []
  );

  useFrame((state) => {
    rayMat.uniforms.uTime.value = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.x += (mouseRef.current.x * 0.3 - groupRef.current.position.x) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, -2]}>
      {rays.map((ray, i) => (
        <mesh
          key={i}
          position={[ray.x, 2, 0]}
          rotation={[0, 0, ray.rotation]}
          material={rayMat}
          scale={[ray.scale, 5, 1]}
        >
          <planeGeometry args={[0.6, 1]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Floating Glow Particles ────────────────────────────────────
function GlowParticles({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Points>(null!);

  const { positions, colors, sizes } = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const palette = [
      new THREE.Color('#00d4ff'),
      new THREE.Color('#7c3aed'),
      new THREE.Color('#0ea5e9'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#06b6d4'),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      sz[i] = Math.random() * 0.04 + 0.008;
    }
    return { positions: pos, colors: col, sizes: sz };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < 600; i++) {
      const ix = i * 3;
      const originalY = positions[ix + 1];
      posAttr.setY(i, originalY + Math.sin(t * 0.4 + i * 0.15) * 0.12);
      posAttr.setX(i, positions[ix] + Math.cos(t * 0.3 + i * 0.1) * 0.06);
    }
    posAttr.needsUpdate = true;

    ref.current.rotation.y = mouseRef.current.x * 0.04;
    ref.current.rotation.x = -mouseRef.current.y * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        size={0.025}
      />
    </points>
  );
}

// ── Perspective Grid Floor ─────────────────────────────────────
function PerspectiveGrid() {
  const ref = useRef<THREE.Mesh>(null!);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          varying vec2 vUv;
          varying float vFog;
          void main() {
            vUv = uv;
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vFog = 1.0 - smoothstep(-6.0, 0.0, mvPos.z);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec2 vUv;
          varying float vFog;
          
          float grid(vec2 uv, float spacing) {
            vec2 g = abs(fract(uv / spacing - 0.5) - 0.5) / fwidth(uv / spacing);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }
          
          void main() {
            vec2 uv = vUv * vec2(20.0, 10.0);
            float scroll = uTime * 0.3;
            uv.y += scroll;
            
            float g1 = grid(uv, 1.0) * 0.6;
            float g2 = grid(uv, 5.0) * 0.3;
            float lines = max(g1, g2);
            
            float fadeX = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
            float fadeY = smoothstep(0.0, 0.5, vUv.y);
            
            vec3 color = mix(vec3(0.0, 0.5, 0.8), vec3(0.4, 0.1, 0.8), vUv.x);
            gl_FragColor = vec4(color, lines * fadeX * fadeY * vFog * 0.5);
          }
        `,
      }),
    []
  );

  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -3.2, -1]} material={mat}>
      <planeGeometry args={[20, 12, 1, 1]} />
    </mesh>
  );
}

// ── Neon Edge Rings ────────────────────────────────────────────
function NeonRings({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    if (r1.current) {
      r1.current.rotation.z = t * 0.1;
      r1.current.rotation.x = my * 0.08;
      r1.current.position.x = mx * 0.3;
    }
    if (r2.current) {
      r2.current.rotation.z = -t * 0.07;
      r2.current.rotation.y = mx * 0.06;
    }
    if (r3.current) {
      r3.current.rotation.x = t * 0.05;
      r3.current.position.y = Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <group position={[0, 0, -1]}>
      <mesh ref={r1}>
        <torusGeometry args={[5.5, 0.006, 3, 200]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.25} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[6.2, 0.004, 3, 200]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.18} />
      </mesh>
      <mesh ref={r3} rotation={[Math.PI / 5, Math.PI / 6, 0]}>
        <torusGeometry args={[7, 0.003, 3, 200]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// ── Main Atmosphere Scene ──────────────────────────────────────
interface AtmosphereSceneProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

export default function AtmosphereScene({ mouseRef }: AtmosphereSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <NebulaClouds />
      <AuroraBands mouseRef={mouseRef} />
      <LightRays mouseRef={mouseRef} />
      <GlowParticles mouseRef={mouseRef} />
      <PerspectiveGrid />
      <NeonRings mouseRef={mouseRef} />
    </Canvas>
  );
}
