import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// 1. THE GAS CLOUD (Kept exactly the same)
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

// 2. THE MECHANICAL ASSEMBLY (Piston + Moving Rods + Static Pillars)
function Assembly({ efficiency, thot, material, viewMode, isMelted }) {
  const piston = useRef();
  const rodA = useRef();
  const rodB = useRef();
  const group = useRef();
  
  useFrame((state) => {
    if (isMelted) return;
    const t = state.clock.getElapsedTime();
    const speed = (efficiency / 100) * 12;
    const yPos = Math.sin(t * speed) * 1.6;
    
    // Piston movement
    if (piston.current) piston.current.position.y = yPos + 2.5;
    
    // Rod movement (SYNCED WITH PISTON)
    if (rodA.current) rodA.current.position.y = yPos + 0.5;
    if (rodB.current) rodB.current.position.y = yPos + 0.5;

    // Heat vibration
    if (group.current) group.current.position.x = (thot > 2500) ? (Math.random() - 0.5) * 0.04 : 0;
  });

  const barColor = isMelted ? "#ff3b30" : (material === 'Ceramic' ? "#e5e7eb" : "#adb5bd");

  return (
    <group ref={group}>
      {viewMode === 'gas' ? (
        <GasCloud thot={thot} isMelted={isMelted} />
      ) : (
        <>
          {/* MAIN PISTON HEAD */}
          <mesh ref={piston} castShadow>
            <cylinderGeometry args={[1, 1, 1.4, 32]} />
            <meshStandardMaterial 
              color={isMelted ? "#ff3b30" : (material === 'Ceramic' ? "#fdfcf0" : "#94a3b8")} 
              metalness={0.7} 
              roughness={0.2}
            />
          </mesh>

          {/* MOVING CONNECTING RODS (Inside) */}
          <mesh ref={rodA} position={[0.6, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 4.5, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.9} />
          </mesh>
          <mesh ref={rodB} position={[-0.6, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 4.5, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.9} />
          </mesh>

          {/* STATIC SUPPORT PILLARS (Outside) */}
          <mesh position={[2.5, 0.8, 2.5]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 5, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[-2.5, 0.8, -2.5]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 5, 16]} />
            <meshStandardMaterial color={barColor} metalness={0.4} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* SOLID BASE PLATE */}
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <boxGeometry args={[8, 0.4, 8]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
    </group>
  );
}

// 3. MAIN CANVAS EXPORT
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
