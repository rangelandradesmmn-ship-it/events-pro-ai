'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// A simple chair component built with primitives
function Chair({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.8, -0.175]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.175, 0.2, -0.175]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#d4c3b3" />
      </mesh>
      <mesh position={[0.175, 0.2, -0.175]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#d4c3b3" />
      </mesh>
      <mesh position={[-0.175, 0.2, 0.175]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#d4c3b3" />
      </mesh>
      <mesh position={[0.175, 0.2, 0.175]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#d4c3b3" />
      </mesh>
    </group>
  );
}

// Altar Component
function Altar() {
  return (
    <group position={[0, 0, -8]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#e0d7cf" roughness={0.9} />
      </mesh>
      
      {/* Arch Left Pillar */}
      <mesh position={[-1.5, 1.5, -0.5]} castShadow>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* Arch Right Pillar */}
      <mesh position={[1.5, 1.5, -0.5]} castShadow>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* Arch Top */}
      <mesh position={[0, 3.1, -0.5]} castShadow>
        <boxGeometry args={[3.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      
      {/* Celebrant Table */}
      <mesh position={[0, 0.6, 0.5]} castShadow>
        <boxGeometry args={[1, 0.8, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

interface CeremonyMapProps {
  totalGuests: number;
  scenario: 'jardim' | 'praia' | 'salao';
}

export default function CeremonyMap({ totalGuests, scenario }: CeremonyMapProps) {
  const seatsPerSide = Math.ceil(totalGuests / 2);
  const colsPerBlock = 6; 
  
  const chairs = useMemo(() => {
    const chairArray = [];
    let row = 0;
    
    // Left side (Bride)
    for (let i = 0; i < seatsPerSide; i++) {
      const col = i % colsPerBlock;
      row = Math.floor(i / colsPerBlock);
      const x = -1.2 - (col * 0.7);
      const z = -4 + (row * 0.9);
      chairArray.push({ id: `left-${i}`, position: [x, 0, z] as [number, number, number] });
    }
    
    // Right side (Groom)
    for (let i = 0; i < seatsPerSide; i++) {
      const col = i % colsPerBlock;
      row = Math.floor(i / colsPerBlock);
      const x = 1.2 + (col * 0.7);
      const z = -4 + (row * 0.9);
      chairArray.push({ id: `right-${i}`, position: [x, 0, z] as [number, number, number] });
    }
    
    return chairArray;
  }, [seatsPerSide]);

  // Determine colors based on scenario
  let bgColor = '#87CEEB';
  let groundColor = '#557a2b';
  let carpetColor = '#e6d4c5';

  if (scenario === 'praia') {
    bgColor = '#a2d5f2';
    groundColor = '#f2e8c9'; // Sand
    carpetColor = '#ffffff'; // White carpet
  } else if (scenario === 'salao') {
    bgColor = '#2a2a2a'; // Dark walls
    groundColor = '#3d2314'; // Wood floor
    carpetColor = '#800020'; // Red carpet
  }

  return (
    <div className="relative w-full h-[500px] md:h-[700px] rounded-3xl overflow-hidden shadow-sm border border-zinc-200">
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }} className="w-full h-full">
        <color attach="background" args={[bgColor]} />
        
        {/* Lighting */}
        <ambientLight intensity={scenario === 'salao' ? 0.6 : 0.4} />
        {scenario !== 'salao' && <Sky sunPosition={[10, 20, 10]} turbidity={0.1} rayleigh={0.5} />}
        
        <directionalLight 
          castShadow 
          position={scenario === 'salao' ? [0, 15, 0] : [10, 20, 10]} 
          intensity={scenario === 'salao' ? 0.8 : 1.2} 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        
        {/* Controls */}
        <OrbitControls 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2 - 0.05} 
          maxDistance={30}
          target={[0, 0, -2]}
        />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color={groundColor} roughness={scenario === 'salao' ? 0.4 : 1} />
        </mesh>
        
        {/* Sea for Beach Scenario */}
        {scenario === 'praia' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.00, -60]} receiveShadow>
            <planeGeometry args={[200, 100]} />
            <meshStandardMaterial color="#4f9bc2" roughness={0.1} metalness={0.3} />
          </mesh>
        )}
        
        {/* Aisle Carpet */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2]} receiveShadow>
          <planeGeometry args={[1.6, 20]} />
          <meshStandardMaterial color={carpetColor} roughness={0.8} />
        </mesh>

        <Altar />

        {/* Chairs - rotated 180deg (Math.PI) to face the altar (-Z) */}
        {chairs.map((chair) => (
          <Chair key={chair.id} position={chair.position} rotation={[0, Math.PI, 0]} />
        ))}
      </Canvas>
    </div>
  );
}
