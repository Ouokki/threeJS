"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const TriangleTunnel = dynamic(() => import("../components/TriangleTunnel"), { ssr: false,loading: () => null });

export default function BackgroundScene() {
  const [min, setMin] = useState(0.75);

  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
      dpr={[min, 2]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 200 }}
    >
      <PerformanceMonitor onDecline={() => setMin(0.5)} />
      <AdaptiveDpr />
      <Suspense fallback={null}>
        <TriangleTunnel />
        {/*<EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.15} luminanceSmoothing={0.2} mipmapBlur />
        </EffectComposer>*/}
      </Suspense>
    </Canvas>
  );
}