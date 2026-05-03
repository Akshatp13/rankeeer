import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ count = 2000 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, [count]);

  const ref = useRef();
  const { mouse } = useThree();

  useFrame((state) => {
    if (ref.current) {
      // Parallax movement based on mouse
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, mouse.y * 0.1, 0.05);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.1, 0.05);
      
      // Constant slow drift
      ref.current.rotation.z += 0.0005;
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const UniverseBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black overflow-hidden pointer-events-none">
      {/* 3D Universe Layer */}
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={['#030305']} />
        
        <ambientLight intensity={0.5} />
        
        {/* Core Stars */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        {/* Reactive Particle Field */}
        <ParticleField count={1500} />
        
        {/* Floating Nebula Light Spots */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <mesh position={[10, 5, -10]}>
             <sphereGeometry args={[5, 32, 32]} />
             <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} />
           </mesh>
        </Float>
        
        <Float speed={3} rotationIntensity={1} floatIntensity={2}>
           <mesh position={[-10, -5, -15]}>
             <sphereGeometry args={[8, 32, 32]} />
             <meshBasicMaterial color="#8b5cf6" transparent opacity={0.03} />
           </mesh>
        </Float>
      </Canvas>

      {/* 2D CSS Overlays for nebula/grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(3,3,5,0.8)_100%)]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      
      {/* Aurora Rays Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[1000px] bg-primary/20 blur-[150px] rotate-45 -translate-y-1/2 animate-glow-slow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[800px] bg-purple-600/10 blur-[180px] -rotate-12 translate-y-1/2 animate-glow-slow" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default UniverseBackground;
