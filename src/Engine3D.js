import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GasParticles({ thot, efficiency, isMelted }) {
  const points = useRef();
  const count = 1000; // Restored high density

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.8;
      pos[i * 3 + 1] = Math.random() * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const speed = isMelted ? 0 : (thot / 3500) * 0.5;
    const time = state.clock.getElapsedTime();
    if (points.current) {
      points.current.rotation.y += speed * 0.1;
      points.current.position.y = Math.sin(time * (efficiency / 10)) * 0.1;
    }
  });

  return (
    <Points ref={points} positions={positions} stride={3}>
      <PointMaterial 
        transparent 
        color={thot > 2000 ? "#ff4400" : "#3498db"} 
        size={0.06} 
        sizeAttenuation={true} 
        depthWrite={false} 
        opacity={0.6}
      />
    </Points>
  );
}

function Assembly({ efficiency, thot, material, isMelted, friction, viewMode }) {
  const piston = useRef();
  const mainGroup = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = isMelted ? 0 : (efficiency / 100) * 10;
    const yPos = Math.sin(t * speed) * 1.5;

    if (piston.current) piston.current.position.y = yPos + 2.5;

    if (mainGroup.current) {
      const vibration = (isMelted || (friction && friction > 0.2)) ? (Math.random() - 0.5) * 0.04 : 0;
      mainGroup.current.position.x = vibration;
    }
  });

  const getMatColor = () => {
    if (material === 'Ceramic') return '#fdfcf0';
    if (material === 'Titanium') return '#334155';
    return '#94a3b8';
  };

  const barColor = isMelted ? "#ff3b30" : "#adb5bd";

  return (
    <group ref={mainGroup} position={[0, -1, 0]}>
      {/* 1. GAS PARTICLES (Restored movement) */}
      <GasParticles thot={thot} efficiency={efficiency} isMelted={isMelted} />

      {/* 2. PISTON HEAD */}
      <mesh ref={piston} castShadow>
        <cylinderGeometry args={[1, 1, 1.2, 32]} />
        <meshStandardMaterial 
          color={isMelted ? "#ff2200" : getMatColor()} 
          emissive={isMelted ? "#ff0000" : (thot > 2000 ? "#440000" : "#000")}
          metalness={0.9} 
          roughness={0.2}
        />
      </mesh>

      {/* 3. THE GLASS-LIKE EXTERNAL CHAMBER (The "moving" wireframe vibe) */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 6, 32, 1, true]} />
        <meshStandardMaterial color="#0066cc" transparent opacity={0.1} wireframe />
      </mesh>

      {/* 4. SOLID STRUCTURAL PILLARS (The bars you wanted) */}
      <mesh position={[2.5, 2, 2.5]}>
        <cylinderGeometry args={[0.2, 0.2, 7, 16]} />
        <meshStandardMaterial color={barColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2.5, 2, -2.5]}>
        <cylinderGeometry args={[0.2, 0.2, 7, 16]} />
        <meshStandardMaterial color={barColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 5. BASE UNIT */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 8]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
    </group>
  );
}

export default function Engine3D(props) {
  return (
    <Canvas shadows camera={{ position: [10, 8, 10], fov: 35 }}>
      <color attach="background" args={['#fcfcfc']} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 10, 5]} intensity={1} castShadow />
      <Assembly {...props} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      <ContactShadows opacity={0.2} scale={20} blur={2.5} far={10} />
    </Canvas>
  );
}
