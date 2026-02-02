
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { COLORS, PATH_WIDTH } from '../constants';

// --- Helper Components ---

export const Lantern: React.FC<{ position: [number, number, number], lightsOn?: boolean }> = ({ position, lightsOn = false }) => {
  return (
    <group position={position}>
      <mesh position={[0, -0.2, 0]}>
         <cylinderGeometry args={[0.1, 0.15, 0.4]} />
         <meshStandardMaterial color="#4A3C31" />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
         <cylinderGeometry args={[0.08, 0.13, 0.35]} />
         <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={lightsOn ? 2 : 0} />
      </mesh>
      {lightsOn && <pointLight color="#FFD700" distance={5} intensity={1} decay={2} />}
    </group>
  );
};

// --- Reusable Geometric Components for Performance ---

export const PalmTree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.5, 4, 7]} />
        <meshStandardMaterial color={COLORS.wood} />
      </mesh>
      {/* Date Clusters */}
      <group position={[0, 3.5, 0]}>
          <mesh position={[0.4, 0, 0]}>
              <sphereGeometry args={[0.3, 4, 4]} />
              <meshStandardMaterial color="#4A2511" />
          </mesh>
          <mesh position={[-0.4, -0.1, 0]}>
              <sphereGeometry args={[0.3, 4, 4]} />
              <meshStandardMaterial color="#4A2511" />
          </mesh>
          <mesh position={[0, -0.1, 0.4]}>
              <sphereGeometry args={[0.3, 4, 4]} />
              <meshStandardMaterial color="#4A2511" />
          </mesh>
      </group>
      {/* Leaves */}
      <group position={[0, 4, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[0.5, i * (Math.PI * 2) / 5, 0]} position={[0, 0, 0]}>
            <coneGeometry args={[0.5, 2.5, 4]} />
            <meshStandardMaterial color={COLORS.palmGreen} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const GhafTree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Twisted Trunk */}
            <mesh position={[0, 1.2, 0]} rotation={[0.2, 0, 0.1]} castShadow receiveShadow>
                <cylinderGeometry args={[0.25, 0.35, 2.5, 6]} />
                <meshStandardMaterial color={COLORS.ghafBark} />
            </mesh>
            <mesh position={[0.2, 2.5, 0.2]} rotation={[0.4, 0, -0.3]} castShadow>
                <cylinderGeometry args={[0.15, 0.25, 1.5, 5]} />
                <meshStandardMaterial color={COLORS.ghafBark} />
            </mesh>
            
            {/* Umbrella Canopy - Scattered low-poly foliage */}
            <group position={[0, 3.2, 0]}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <mesh key={i} position={[Math.sin(i)*1.5, Math.random()*0.5, Math.cos(i)*1.5]} scale={[2, 0.8, 2]} castShadow>
                        <dodecahedronGeometry args={[0.8, 0]} />
                        <meshStandardMaterial color={COLORS.ghafGreen} />
                    </mesh>
                ))}
                {/* Central foliage */}
                <mesh position={[0, 0.5, 0]} scale={[2.5, 1, 2.5]} castShadow>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color={COLORS.ghafGreen} />
                </mesh>
            </group>
        </group>
    );
};

export const LyciumShawii: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            {/* Irregular small thorny bush */}
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} position={[Math.sin(i)*0.4, 0.3 + Math.random()*0.2, Math.cos(i)*0.4]} rotation={[Math.random(), Math.random(), Math.random()]} scale={0.4}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color={COLORS.lyciumGreen} />
                </mesh>
            ))}
        </group>
    );
};

export const FalajCrossing: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            {/* Water */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[12, 1.8]} />
                <meshStandardMaterial color={COLORS.water} roughness={0.1} metalness={0.6} />
            </mesh>
            {/* Banks */}
            <mesh position={[0, 0.1, -1]}>
                <boxGeometry args={[12, 0.2, 0.4]} />
                <meshStandardMaterial color={COLORS.stone} />
            </mesh>
            <mesh position={[0, 0.1, 1]}>
                <boxGeometry args={[12, 0.2, 0.4]} />
                <meshStandardMaterial color={COLORS.stone} />
            </mesh>
        </group>
    );
};

export const Pebble: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
    return (
        <mesh position={position} scale={[scale, scale*0.6, scale]} rotation={[Math.random(), Math.random(), Math.random()]} receiveShadow>
            <dodecahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color={Math.random() > 0.5 ? COLORS.stone : "#A0826D"} />
        </mesh>
    );
};

export const ArishHouse: React.FC<{ position: [number, number, number], height?: number, lightsOn?: boolean }> = ({ position, height = 3, lightsOn = false }) => {
    return (
      <group position={position}>
        {/* Main Structure - Palm Frond Walls */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, height, 4]} />
          <meshStandardMaterial color="#C19A6B" /> {/* Dried palm color */}
        </mesh>
        {/* Wireframe overlay to simulate woven texture */}
        <mesh position={[0, height / 2, 0]}>
             <boxGeometry args={[4.05, height, 4.05]} />
             <meshBasicMaterial color="#8B5A2B" wireframe opacity={0.3} transparent />
        </mesh>
        
        {/* Roof - Slightly slanted */}
        <group position={[0, height + 0.1, 0]}>
           <mesh rotation={[0.05, 0, 0]}>
              <boxGeometry args={[4.4, 0.2, 4.4]} />
              <meshStandardMaterial color="#8B5A2B" />
           </mesh>
        </group>
        
        {/* Doorway */}
        <mesh position={[0, 1, 2.01]}>
           <planeGeometry args={[1.2, 2]} />
           <meshStandardMaterial color="#2F1B10" />
        </mesh>
        
        {/* Lantern */}
        <Lantern position={[0.8, 1.8, 2.2]} lightsOn={lightsOn} />
      </group>
    );
};

export const Camel: React.FC<{ position: [number, number, number], isWalking?: boolean }> = ({ position, isWalking = true }) => {
    const groupRef = useRef<Group>(null);
    const headRef = useRef<Mesh>(null);
    const legFL = useRef<Mesh>(null);
    const legFR = useRef<Mesh>(null);
    const legBL = useRef<Mesh>(null);
    const legBR = useRef<Mesh>(null);

    useFrame(({ clock }) => {
        if (!isWalking || !groupRef.current) return;
        const t = clock.getElapsedTime() * 8;
        
        // Bob body
        groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.05;
        
        // Bob head independent
        if (headRef.current) headRef.current.rotation.x = Math.sin(t) * 0.1;

        // Walk cycle
        if (legFL.current) legFL.current.rotation.x = Math.sin(t) * 0.4;
        if (legBR.current) legBR.current.rotation.x = Math.sin(t) * 0.4;
        
        if (legFR.current) legFR.current.rotation.x = Math.sin(t + Math.PI) * 0.4;
        if (legBL.current) legBL.current.rotation.x = Math.sin(t + Math.PI) * 0.4;
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Body */}
            <mesh position={[0, 1.4, 0]} castShadow>
                <boxGeometry args={[1.2, 1.0, 2.2]} />
                <meshStandardMaterial color="#C19A6B" />
            </mesh>
            {/* Hump */}
            <mesh position={[0, 2.0, 0]} castShadow>
                <sphereGeometry args={[0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
                <meshStandardMaterial color="#C19A6B" />
            </mesh>
            {/* Neck */}
            <mesh position={[0, 2.0, 1.4]} rotation={[0.5, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 1.2]} />
                <meshStandardMaterial color="#C19A6B" />
            </mesh>
            {/* Head */}
            <mesh ref={headRef} position={[0, 2.6, 1.8]} castShadow>
                <boxGeometry args={[0.4, 0.5, 0.8]} />
                <meshStandardMaterial color="#C19A6B" />
            </mesh>
            {/* Legs */}
            <group position={[0, 1, 0]}>
                <mesh ref={legFL} position={[-0.4, 0, 0.8]}>
                    <cylinderGeometry args={[0.15, 0.12, 1.4]} />
                    <meshStandardMaterial color="#A0826D" />
                </mesh>
                <mesh ref={legFR} position={[0.4, 0, 0.8]}>
                    <cylinderGeometry args={[0.15, 0.12, 1.4]} />
                    <meshStandardMaterial color="#A0826D" />
                </mesh>
                <mesh ref={legBL} position={[-0.4, 0, -0.8]}>
                    <cylinderGeometry args={[0.15, 0.12, 1.4]} />
                    <meshStandardMaterial color="#A0826D" />
                </mesh>
                <mesh ref={legBR} position={[0.4, 0, -0.8]}>
                    <cylinderGeometry args={[0.15, 0.12, 1.4]} />
                    <meshStandardMaterial color="#A0826D" />
                </mesh>
            </group>
            {/* Saddle/Blanket */}
            <mesh position={[0, 1.91, 0]}>
                <boxGeometry args={[1.25, 0.1, 1.2]} />
                <meshStandardMaterial color={COLORS.clothRed} />
            </mesh>
        </group>
    );
};

export const Gazelle: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const groupRef = useRef<Group>(null);
    const headRef = useRef<Group>(null);

    useFrame(({ clock }) => {
        if (headRef.current) {
            // Grazing animation
            headRef.current.rotation.x = 0.5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
        }
    });

    // Scaled up for better visibility
    return (
        <group ref={groupRef} position={position} scale={1.2}>
            {/* Body */}
            <mesh position={[0, 0.8, 0]}>
                <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
                <meshStandardMaterial color="#D2B48C" />
            </mesh>
            {/* Neck & Head Group */}
            <group ref={headRef} position={[0, 0.8, 0.4]}>
                {/* Neck */}
                <mesh position={[0, 0.4, 0.1]} rotation={[0.5, 0, 0]}>
                    <cylinderGeometry args={[0.08, 0.12, 0.6]} />
                    <meshStandardMaterial color="#D2B48C" />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.7, 0.2]}>
                    <coneGeometry args={[0.15, 0.4, 4]} />
                    <meshStandardMaterial color="#D2B48C" />
                </mesh>
                {/* Horns */}
                <mesh position={[0.1, 0.9, 0.15]} rotation={[-0.2, 0, 0.2]}>
                    <cylinderGeometry args={[0.02, 0.04, 0.5]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[-0.1, 0.9, 0.15]} rotation={[-0.2, 0, -0.2]}>
                    <cylinderGeometry args={[0.02, 0.04, 0.5]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>
            {/* Legs */}
            <mesh position={[-0.15, 0.4, 0.3]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.8]} />
                <meshStandardMaterial color="#D2B48C" />
            </mesh>
            <mesh position={[0.15, 0.4, 0.3]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.8]} />
                <meshStandardMaterial color="#D2B48C" />
            </mesh>
            <mesh position={[-0.15, 0.4, -0.3]} rotation={[-0.1, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.8]} />
                <meshStandardMaterial color="#D2B48C" />
            </mesh>
            <mesh position={[0.15, 0.4, -0.3]} rotation={[-0.1, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.8]} />
                <meshStandardMaterial color="#D2B48C" />
            </mesh>
        </group>
    );
};

export const RoadChunk: React.FC<{ type: 'sand' | 'harbor' | 'stone', length: number }> = ({ type, length }) => {
    // Sparse Side Decorations (Trees/Shrubs)
    const sideDecor = useMemo(() => {
        if (type !== 'sand') return [];
        const items = [];
        
        // 20% chance for Ghaf tree
        if (Math.random() > 0.8) {
            items.push({
                type: 'GHAF',
                x: Math.random() > 0.5 ? -18 : 18,
                z: Math.random() * length,
                scale: 0.8 + Math.random() * 0.4
            });
        }
        // Increased chance for Date Palm (side only) for "Oasis" density
        // Spawn multiple per chunk to feel fuller
        const palmCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 palms per chunk side
        for(let p=0; p<palmCount; p++) {
             items.push({
                type: 'PALM',
                x: Math.random() > 0.5 ? -22 - (Math.random()*5) : 22 + (Math.random()*5),
                z: Math.random() * length,
                scale: 1.2 + Math.random() * 0.3
            });
        }

        // 50% chance for Lycium shrubs (scattered)
        if (Math.random() > 0.5) {
            for(let k=0; k<3; k++) {
                items.push({
                    type: 'LYCIUM',
                    x: (Math.random() > 0.5 ? -12 : 12) + (Math.random() * 4 - 2),
                    z: Math.random() * length,
                    scale: 1
                });
            }
        }
        return items;
    }, [type, length]);

    const harborDecor = useMemo(() => {
        if (type !== 'harbor') return [];
        const items = [];
        // Side Dhows floating in water
        if (Math.random() > 0.6) {
            items.push({
                type: 'DHOW',
                x: Math.random() > 0.5 ? -18 : 18,
                z: Math.random() * length,
                rotation: Math.PI / 8 * (Math.random() - 0.5)
            });
        }
        // Dock Clutter (Crates, Ropes)
        for(let i=0; i<2; i++) {
            if(Math.random() > 0.5) {
                const itemType = Math.random() > 0.6 ? 'CRATE' : (Math.random() > 0.5 ? 'ROPE' : 'BASKET');
                items.push({
                    type: itemType,
                    x: Math.random() > 0.5 ? -6.5 : 6.5, // Edge of dock
                    z: Math.random() * length,
                    scale: 0.8
                });
            }
        }
        return items;
    }, [type, length]);

    // Pebbles on Main Road
    const pebbles = useMemo(() => {
        if (type !== 'sand') return [];
        const p = [];
        for(let i=0; i<8; i++) {
            p.push({
                x: (Math.random() - 0.5) * PATH_WIDTH * 0.9, // Keep on path
                z: Math.random() * length,
                scale: 0.5 + Math.random() * 0.5
            });
        }
        return p;
    }, [type, length]);

    // Procedural Dunes for Sand Type - Pushed much further out (x +/- 45) to avoid blocking view
    const duneShapes = useMemo(() => {
        if (type !== 'sand') return [];
        return [
            { x: -45, z: length * 0.3, scale: [20, 6, 25] },
            { x: 45, z: length * 0.7, scale: [20, 8, 30] },
            { x: -50, z: length * 0.8, scale: [15, 5, 20] },
            { x: 48, z: length * 0.2, scale: [25, 6, 25] },
        ];
    }, [type, length]);

    if (type === 'harbor') {
        return (
            <group>
                {/* Main Wooden Deck (Center) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, length/2]} receiveShadow>
                    <planeGeometry args={[14, length]} />
                    <meshStandardMaterial color={COLORS.harborWood} roughness={0.8} /> 
                </mesh>
                
                {/* Dock Edges (Beams) */}
                <mesh position={[-7, 0.2, length/2]}>
                    <boxGeometry args={[0.5, 0.4, length]} />
                    <meshStandardMaterial color={COLORS.wood} />
                </mesh>
                <mesh position={[7, 0.2, length/2]}>
                    <boxGeometry args={[0.5, 0.4, length]} />
                    <meshStandardMaterial color={COLORS.wood} />
                </mesh>

                {/* Planks visual overlay */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, length/2]} receiveShadow>
                    <planeGeometry args={[13, length, 1, Math.floor(length)]} />
                    <meshStandardMaterial color="#332211" wireframe={true} opacity={0.2} transparent /> 
                </mesh>

                {/* Water Planes (Left and Right) - Fixes "Sky" look */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-27, -0.5, length/2]}>
                    <planeGeometry args={[40, length]} />
                    <meshStandardMaterial color={COLORS.harborWater} roughness={0.1} metalness={0.1} transparent opacity={0.9} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[27, -0.5, length/2]}>
                    <planeGeometry args={[40, length]} />
                    <meshStandardMaterial color={COLORS.harborWater} roughness={0.1} metalness={0.1} transparent opacity={0.9} />
                </mesh>

                {/* Decor: Ships & Clutter */}
                {harborDecor.map((item, i) => {
                    if (item.type === 'DHOW') {
                        return (
                            <group key={`dhow-${i}`} position={[item.x, -0.5, item.z]} rotation={[0, (item.x < 0 ? 1 : -1) * 0.2 + (item.rotation || 0), Math.sin(item.z)*0.05]}>
                                <DhowBoat position={[0, 0, 0]} />
                            </group>
                        );
                    }
                    if (item.type === 'CRATE') return <group key={`decor-${i}`} position={[item.x, 0, item.z]} scale={0.7}><CargoCrate position={[0,0,0]} /></group>;
                    if (item.type === 'ROPE') return <group key={`decor-${i}`} position={[item.x, 0, item.z]} scale={0.7}><RopeCoil position={[0,0,0]} /></group>;
                    if (item.type === 'BASKET') return <group key={`decor-${i}`} position={[item.x, 0, item.z]} scale={0.7}><OysterBasket position={[0,0,0]} /></group>;
                    return null;
                })}
            </group>
        )
    }

    // Default Sand/Stone Road
    const baseColor = COLORS.sand; // Outer sand
    const pathColor = "#E0CBA1"; // Blended Sand Path Color (less distinct than before)

    return (
        <group>
            {/* 1. Deep Sand Base (Wide) - Extended width to cover horizon gap */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, length/2]} receiveShadow>
                <planeGeometry args={[120, length]} />
                <meshStandardMaterial color={baseColor} roughness={1} metalness={0} />
            </mesh>

            {/* 2. Raised Packed Path (Center) - Sandy Look */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, length/2]} receiveShadow>
                <planeGeometry args={[PATH_WIDTH, length]} />
                <meshStandardMaterial color={pathColor} roughness={1.0} metalness={0} />
            </mesh>

            {/* 3. Side Berms (Slopes for shading) */}
            <mesh rotation={[0, 0, Math.PI/6]} position={[-PATH_WIDTH/2 - 0.5, 0.1, length/2]} receiveShadow>
                 <boxGeometry args={[1.5, 0.2, length]} />
                 <meshStandardMaterial color={baseColor} roughness={1} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI/6]} position={[PATH_WIDTH/2 + 0.5, 0.1, length/2]} receiveShadow>
                 <boxGeometry args={[1.5, 0.2, length]} />
                 <meshStandardMaterial color={baseColor} roughness={1} />
            </mesh>

            {/* 4. Pebbles on Path */}
            {pebbles.map((p, i) => (
                <Pebble key={`pebble-${i}`} position={[p.x, 0.05, p.z]} scale={p.scale} />
            ))}

            {/* 5. Procedural Dunes (Distant Background) */}
            {duneShapes.map((d, i) => (
                <mesh key={`dune-${i}`} position={[d.x, -2, d.z]} scale={d.scale as any} receiveShadow>
                    <sphereGeometry args={[1, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                    <meshStandardMaterial color={baseColor} roughness={1} />
                </mesh>
            ))}

            {/* 6. Side Decoration (Ghaf, Palm, Lycium) */}
            {sideDecor.map((item, i) => {
                if (item.type === 'GHAF') return <GhafTree key={`ghaf-${i}`} position={[item.x, 0, item.z]} scale={item.scale} />;
                if (item.type === 'PALM') return <PalmTree key={`palm-${i}`} position={[item.x, 0, item.z]} scale={item.scale} />;
                if (item.type === 'LYCIUM') return <LyciumShawii key={`lyc-${i}`} position={[item.x, 0, item.z]} />;
                return null;
            })}
        </group>
    );
};

export const PearlMesh: React.FC<{type?: 'PEARL_WHITE' | 'PEARL_PINK' | 'PEARL_GOLDEN' | 'TRADE_GOOD' | 'COIN_GOLD'}> = ({type = 'PEARL_WHITE'}) => {
  const ref = useRef<Mesh>(null);
  
  // Trade Goods visualization
  if (type === 'TRADE_GOOD') {
      return (
          <mesh ref={ref} castShadow position={[0,0.5,0]}>
              <dodecahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color={COLORS.pottery} />
          </mesh>
      );
  }

  // Gold Coin visualization
  if (type === 'COIN_GOLD') {
      useFrame((state) => {
          if (ref.current) {
              ref.current.rotation.y += 0.05;
              ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
          }
      });
      return (
          <mesh ref={ref} castShadow rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
              <meshStandardMaterial color={COLORS.goldCoin} metalness={1} roughness={0.3} emissive={COLORS.goldCoin} emissiveIntensity={0.4} />
          </mesh>
      );
  }

  const color = type === 'PEARL_GOLDEN' ? COLORS.pearlGold : type === 'PEARL_PINK' ? COLORS.pearlPink : COLORS.pearl;
  const emissiveIntensity = type === 'PEARL_GOLDEN' ? 0.8 : 0.5;

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      if (type === 'PEARL_GOLDEN') {
         ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
      }
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <icosahedronGeometry args={[0.3, 2]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} roughness={0.1} metalness={0.9} />
    </mesh>
  );
};

export const DateMesh: React.FC = () => {
    const ref = useRef<Group>(null);
    useFrame((state) => {
        if(ref.current) {
            ref.current.rotation.y += 0.01;
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });
    
    return (
        <group ref={ref}>
            <mesh position={[0,0,0]}>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshStandardMaterial color={COLORS.date} />
            </mesh>
            <mesh position={[0.1, 0.1, 0]} rotation={[0,0,0.5]}>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshStandardMaterial color={COLORS.date} />
            </mesh>
             <mesh position={[-0.1, 0.1, 0]} rotation={[0,0,-0.5]}>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshStandardMaterial color={COLORS.date} />
            </mesh>
        </group>
    );
};

export const DivingGearMesh: React.FC = () => {
    const ref = useRef<Group>(null);
    useFrame((state) => {
        if(ref.current) {
            ref.current.rotation.y += 0.03;
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
        }
    });
    
    return (
        <group ref={ref}>
            {/* Nose Clip Shape */}
            <mesh position={[0,0,0]} rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI * 1.5]} />
                <meshStandardMaterial color={COLORS.silver} metalness={0.8} roughness={0.2} emissive="#444" />
            </mesh>
        </group>
    );
};

export const WaterJar: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            <mesh position={[0, 0.4, 0]} castShadow>
                <sphereGeometry args={[0.4, 8, 8, 0, Math.PI*2, 0, 2]} />
                <meshStandardMaterial color={COLORS.pottery} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.4]} />
                <meshStandardMaterial color={COLORS.pottery} />
            </mesh>
             <mesh position={[0, 1.0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[0.2, 0.05, 4, 12]} />
                <meshStandardMaterial color={COLORS.pottery} />
            </mesh>
        </group>
    );
};

export const LaundryLine: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            <mesh position={[-1.4, 1.5, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 3]} />
                <meshStandardMaterial color={COLORS.woodLight} />
            </mesh>
             <mesh position={[1.4, 1.5, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 3]} />
                <meshStandardMaterial color={COLORS.woodLight} />
            </mesh>
            <mesh position={[0, 2.8, 0]} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.01, 0.01, 2.8]} />
                 <meshStandardMaterial color="#ccc" />
            </mesh>
            <mesh position={[0, 2.0, 0]}>
                <boxGeometry args={[2.0, 1.4, 0.05]} />
                <meshStandardMaterial color={COLORS.clothWhite} side={2} />
            </mesh>
        </group>
    );
};

// --- Missing Components Implementation ---

export const DhowBoat: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position} rotation={[0, Math.PI, 0]}>
        {/* Hull */}
        <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2.5, 2, 8]} />
            <meshStandardMaterial color={COLORS.wood} />
        </mesh>
        {/* Deck details */}
        <mesh position={[0, 2.1, 0]}>
             <boxGeometry args={[2.2, 0.2, 7.5]} />
             <meshStandardMaterial color={COLORS.woodLight} />
        </mesh>
        <mesh position={[0, 4, 1]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[4, 5, 0.1]} />
            <meshStandardMaterial color={COLORS.clothWhite} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 4, 1]}>
            <cylinderGeometry args={[0.1, 0.1, 7]} />
            <meshStandardMaterial color={COLORS.wood} />
        </mesh>
    </group>
);

export const MarketStall: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 1, 0]}>
             <boxGeometry args={[2.2, 1, 1.5]} />
             <meshStandardMaterial color={COLORS.wood} />
        </mesh>
        <mesh position={[0, 2, 0]}>
             <coneGeometry args={[1.5, 1, 4]} />
             <meshStandardMaterial color={COLORS.clothRed} />
        </mesh>
    </group>
);

export const Building: React.FC<{ position: [number, number, number], height?: number, lightsOn?: boolean }> = ({ position, height = 3, lightsOn = false }) => (
    <group position={position}>
        <mesh position={[0, height/2, 0]}>
            <boxGeometry args={[3, height, 3]} />
            <meshStandardMaterial color={COLORS.stone} />
        </mesh>
        {[0, 1].map(i => (
            <mesh key={i} position={[0.8 * (i===0?1:-1), height/2, 1.51]}>
                <planeGeometry args={[0.8, 0.8]} />
                <meshStandardMaterial color={lightsOn ? "#FFD700" : "#222"} emissive={lightsOn ? "#FFD700" : "black"} />
            </mesh>
        ))}
    </group>
);

export const NPC: React.FC<{ position: [number, number, number], type?: 'merchant'|'villager' }> = ({ position, type='villager' }) => (
    <group position={position}>
        <mesh position={[0, 0.9, 0]}>
            <capsuleGeometry args={[0.3, 1.2]} />
            <meshStandardMaterial color={type === 'merchant' ? COLORS.clothBlue : COLORS.clothWhite} />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color={COLORS.skin} />
        </mesh>
    </group>
);

export const CargoCrate: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.5, 1.6, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
    </mesh>
);

export const RopeCoil: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.5, 0.2, 8, 16]} />
        <meshStandardMaterial color={COLORS.rope} />
    </mesh>
);

export const HangingNet: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2, 2, 0.1]} />
        <meshStandardMaterial color="#555" wireframe />
    </mesh>
);

export const DockPost: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 3]} />
        <meshStandardMaterial color={COLORS.wood} />
    </mesh>
);

export const OysterBasket: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 1]} />
        <meshStandardMaterial color={COLORS.woodLight} />
    </mesh>
);

export const DivingWeights: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color="#555" />
        </mesh>
    </group>
);

export const WoodenChest: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 0.6]} />
        <meshStandardMaterial color={COLORS.wood} />
    </mesh>
);

export const SailCanvas: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color={COLORS.clothWhite} />
    </mesh>
);

export const DryingNets: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#8B7355" wireframe />
    </mesh>
);

export const MastBoom: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 2, 0]} rotation={[0, 0, 1.57]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color={COLORS.wood} />
    </mesh>
);

export const OverheadRigging: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshStandardMaterial color={COLORS.rope} />
    </mesh>
);

export const MainMast: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 6]} />
        <meshStandardMaterial color={COLORS.wood} />
    </mesh>
);

export const CrewGroup: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <NPC position={[-0.5, 0, 0]} />
        <NPC position={[0.5, 0, 0]} />
    </group>
);

export const CaptainStation: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[1, 1, 2]} />
            <meshStandardMaterial color={COLORS.wood} />
        </mesh>
        <NPC position={[0, 1.5, 0]} type="merchant" />
    </group>
);

export const SandDune: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]} scale={[2, 1, 2]}>
        <sphereGeometry args={[1, 8, 8, 0, 6.28, 0, 1.5]} />
        <meshStandardMaterial color={COLORS.sand} />
    </mesh>
);

export const DesertShrub: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <LyciumShawii position={position} />
);

export const RockFormation: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]}>
        <dodecahedronGeometry args={[1]} />
        <meshStandardMaterial color={COLORS.stone} />
    </mesh>
);

export const CamelResting: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 0.5, 0]} scale={[1.5, 0.8, 1]}>
            <sphereGeometry args={[0.8]} />
            <meshStandardMaterial color="#C19A6B" />
        </mesh>
    </group>
);

export const LowTent: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]} rotation={[0, 0.78, 0]}>
        <coneGeometry args={[2, 1.5, 4]} />
        <meshStandardMaterial color={COLORS.clothWhite} />
    </mesh>
);

export const TallCactus: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3]} />
        <meshStandardMaterial color="green" />
    </mesh>
);

export const RopeLine: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]} rotation={[0, 0, 1.57]}>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshStandardMaterial color={COLORS.rope} />
    </mesh>
);

export const SupplyPile: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={COLORS.wood} />
        </mesh>
    </group>
);

export const FarmFence: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color={COLORS.woodLight} />
    </mesh>
);

export const WaterChannel: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <FalajCrossing position={position} />
);

export const HarvestBasket: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.8]} />
        <meshStandardMaterial color={COLORS.woodLight} />
    </mesh>
);

export const TreeBranch: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]} rotation={[0, 0, 1.57]}>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <meshStandardMaterial color={COLORS.palmGreen} />
    </mesh>
);

export const DryingRope: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <LaundryLine position={position} />
);

export const FarmWorker: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <NPC position={position} />
);

export const StackedSupplies: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <SupplyPile position={position} />
);

export const MarketGoods: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 0.5, 0]}>
             <boxGeometry args={[1, 1, 1]} />
             <meshStandardMaterial color={COLORS.pottery} />
        </mesh>
    </group>
);

export const ChildrenPlaying: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial color={COLORS.skin} />
        </mesh>
    </group>
);

export const CelebrationBanner: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3, 1, 0.1]} />
        <meshStandardMaterial color={COLORS.clothRed} />
    </mesh>
);

export const LanternString: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
         <mesh position={[0, 2.5, 0]} rotation={[0, 0, 1.57]}>
             <cylinderGeometry args={[0.02, 0.02, 3]} />
             <meshStandardMaterial color="#000" />
         </mesh>
         <Lantern position={[-1, 2.3, 0]} lightsOn={true} />
         <Lantern position={[1, 2.3, 0]} lightsOn={true} />
    </group>
);

export const GreetingElder: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <NPC position={position} type="villager" />
);

export const Mosque: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 2, 0]}>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial color={COLORS.stone} />
        </mesh>
        <mesh position={[0, 4.5, 0]}>
            <sphereGeometry args={[2]} />
            <meshStandardMaterial color={COLORS.pearl} />
        </mesh>
        <mesh position={[3, 4, 3]}>
            <cylinderGeometry args={[0.5, 0.8, 8]} />
            <meshStandardMaterial color={COLORS.stone} />
        </mesh>
    </group>
);

export const CelebrationDrum: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]} rotation={[1.57, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
    </mesh>
);

export const FlowerGarland: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <mesh position={[0, 0.5, 0]} rotation={[1.57, 0, 0]}>
        <torusGeometry args={[0.5, 0.1]} />
        <meshStandardMaterial color="#FF69B4" />
    </mesh>
);
