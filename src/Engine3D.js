import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function GasCloud({ thot, isMelted }) {
  const points = useRef();
  const count = 1500;

  const [coords, colors] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 2.2;
      p[i * 3 + 1] = Math.random() * 5;
      p[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
      color.set(thot > 2200 ? "#ff8800" : "#3498db");
      c[i * 3] = color.r; 
      c[i * 3 + 1] = color.g; 
      c[i * 3 + 2] = color.b;
    }
    return [p, c];
  }, [thot]);

  useFrame((state) => {
    if (isMelted) return;
    const t = state.clock.getElapsedTime();
    points.current.rotation.y = t * (thot / 4000);
    points.current.position.y = Math.sin(t * 4) * 0.08;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={coords} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Assembly({ efficiency, thot, material, viewMode, isMelted }) {
  const piston = useRef();
  const group = useRef();
  
  useFrame((state) => {
    if (isMelted) return;
    const t = state.clock.getElapsedTime();
    const speed = (efficiency / 100) * 12;
    const yPos = Math.sin(t * speed) * 1.6;
    if (piston.current) piston.current.position.y = yPos + 2.5;
    if (group.current) group.current.position.x = (thot > 2500) ? (Math.random() - 0.5) * 0.04 : 0;
  });

  const barColor = isMelted ? "#ff3b30" : (material === 'Ceramic' ? "#e5e7eb" : "#adb5bd");

  return (
    <group ref={group}>
      {viewMode === 'gas' ? (
        <GasCloud thot={thot} isMelted={isMelted} />
      ) : (
        <>
          {/* THE PISTON */}
          <mesh ref={piston} castShadow>
            <cylinderGeometry args={[1, 1, 1.4, 32]} />
            <meshStandardMaterial 
              color={isMelted ? "#ff3b30" : (material === 'Ceramic' ? "#fdfcf0" : "#94a3b8")} 
              metalness={0.7} 
              roughness={0.2}
            />
          </mesh>

          {/* STRUCTURAL PILLARS - Thickened radius to 0.3 for a solid look */}
          <mesh position={[2.5, 0.8, 2.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[-2.5, 0.8, 2.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[2.5, 0.8, -2.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[-2.5, 0.8, -2.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}

      {/* BASE PLATE - Widened to support the new pillar layout */}
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <boxGeometry args={[8, 0.4, 8]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
    </group>
  );
}

export default function Engine3D(props) {
  return (
    <Canvas shadows camera={{ position: [10, 8, 10], fov: 35 }} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={['#fcfcfc']} />
      <Environment preset="studio" />
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 15, 10]} intensity={1} castShadow />
      <Assembly {...props} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      <ContactShadows opacity={0.2} scale={20} blur={3} far={10} />
    </Canvas>
  );
}
