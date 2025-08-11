"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Infinite triangle tunnel that morphs into a crisp triangle logo
 * when the page is on Section 2. Smooth damping, parallax & mouse tilt.
 */

const COUNT = 240; // instances
const DEPTH = 120; // tunnel length
const COLOR = 0x82d1ff;
const OPACITY = 0.18;

const LOGO_EDGE = 6.2;
const LOGO_Z = -6;

// helper: critically-damped interpolation (stable across dt)
const damp = (a: number, b: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt));

// Equilateral triangle (single face)
function makeTriangle(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const h = Math.sqrt(3) / 2;
  const verts = new Float32Array([
    0, 2 * h / 3, 0,
    -0.5, -h / 3, 0,
    0.5, -h / 3, 0,
  ]);
  g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  g.computeVertexNormals();
  return g;
}

// Uniformly fill an equilateral triangle (for logo targets)
function logoTriangleTargets(count: number, edge: number) {
  const pts: THREE.Vector3[] = [];
  const h = Math.sqrt(3) * edge / 2;
  const A = new THREE.Vector3(0, h, 0);
  const B = new THREE.Vector3(-edge / 2, 0, 0);
  const C = new THREE.Vector3(edge / 2, 0, 0);

  for (let i = 0; i < count; i++) {
    let r1 = Math.random(), r2 = Math.random();
    if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
    const P = new THREE.Vector3()
      .addScaledVector(A, 1 - r1 - r2)
      .addScaledVector(B, r1)
      .addScaledVector(C, r2);
    P.y -= h / 3; // center
    P.z = LOGO_Z;
    pts.push(P);
  }
  return pts;
}

export default function TriangleTunnel({ activeSection = 0 }: { activeSection?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);

  const geom = useMemo(() => makeTriangle(), []);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLOR, wireframe: true, transparent: true, opacity: OPACITY }),
    []
  );

  // tunnel state
  const positions = useMemo(() => new Float32Array(COUNT), []);
  const scales = useMemo(() => new Float32Array(COUNT), []);
  const rots = useMemo(() => new Float32Array(COUNT), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // logo targets (fixed)
  const logoTargets = useMemo(() => logoTriangleTargets(COUNT, LOGO_EDGE), []);

  useEffect(() => {
    const spacing = DEPTH / COUNT;
    for (let i = 0; i < COUNT; i++) {
      positions[i] = -i * spacing;
      scales[i] = 1 + Math.random() * 0.35;
      rots[i] = (Math.random() - 0.5) * 0.4;
    }
  }, [positions, scales, rots]);

  // inputs: scroll + mouse (refs to avoid stale closures)
  const scrollRef = useRef(0);
  const winHRef = useRef<number>(typeof window !== "undefined" ? window.innerHeight : 1);
  const winWRef = useRef<number>(typeof window !== "undefined" ? window.innerWidth : 1);

  useEffect(() => {
    const onScroll = () => (scrollRef.current = window.scrollY);
    const onResize = () => {
      winHRef.current = window.innerHeight;
      winWRef.current = window.innerWidth;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / winWRef.current) * 2 - 1;
      mouse.current.y = (e.clientY / winHRef.current) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // accumulate morph progress smoothly (0..1)
  const mRef = useRef(0);

  useFrame((_, dt) => {
    // normalize scroll for parallax/speed only (no longer drives morph)
    const scrollNorm = Math.min(1, Math.max(0, scrollRef.current / (winHRef.current * 2)));

    // Section-driven morph: section 2 => 1, else => 0
    const targetM = activeSection === 1 ? 1 : 0;
    mRef.current = damp(mRef.current, targetM, 4, dt);
    const m = mRef.current;

    // Subtle parallax (depth/vertical/rotation) tied to scroll
    const targetZ = THREE.MathUtils.lerp(-2, -4.5, scrollNorm);
    const targetY = THREE.MathUtils.lerp(0, -0.6, scrollNorm);
    const parallaxRz = THREE.MathUtils.lerp(0, 0.15, scrollNorm);

    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.08);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.08);

    // Mouse tilt (a bit stronger deeper on page)
    const tiltScale = THREE.MathUtils.lerp(0.10, 0.18, scrollNorm);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -mouse.current.y * tiltScale, 0.08);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y,  mouse.current.x * tiltScale, 0.08);

    // Combine parallax Z-rotation with a gentle idle spin (reduced near full morph)
    const spinActive = m < 0.1;
    const desiredZ = spinActive ? group.current.rotation.z + dt * 0.05 : parallaxRz;
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, desiredZ, 0.06);

    // Tunnel motion fades as morph nears 1 (never hard stop)
    const baseSpeed = THREE.MathUtils.lerp(3.0, 10.0, scrollNorm);
    const pauseFactor = THREE.MathUtils.smoothstep(m, 0.6, 1.0); // 0 until m≈0.6 → then up to 1
    const speed = baseSpeed * (1 - 0.9 * pauseFactor) * dt;

    for (let i = 0; i < COUNT; i++) {
      // Tunnel position (source)
      let z = positions[i] + speed;
      if (z > 0) z -= DEPTH;
      positions[i] = z;

      const depth01 = 1 - Math.abs(z) / DEPTH;
      const tunnelScale = THREE.MathUtils.lerp(5.5, 13.0, depth01) * scales[i];
      const tunnelRotZ = rots[i] + z * -0.02;

      // Logo position (target)
      const L = logoTargets[i];
      const logoScale = 8.5;

      // Interpolate tunnel -> logo by m
      const posX = THREE.MathUtils.lerp(0, L.x, m);
      const posY = THREE.MathUtils.lerp(0, L.y, m);
      const posZ = THREE.MathUtils.lerp(z, L.z, m);

      const scl  = THREE.MathUtils.lerp(tunnelScale, logoScale, m);
      const rotZ = THREE.MathUtils.lerp(tunnelRotZ, 0, m); // crisp when logo

      dummy.position.set(posX, posY, posZ);
      dummy.scale.setScalar(scl);
      dummy.rotation.set(0, 0, rotZ);
      dummy.updateMatrix();
      inst.current.setMatrixAt(i, dummy.matrix);
    }

    inst.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={[0, 0, -2]}>
      <instancedMesh ref={inst} args={[geom, mat, COUNT]} frustumCulled={false} />
    </group>
  );
}
