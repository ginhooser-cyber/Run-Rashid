import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, ShaderMaterial, Color, Vector3 } from 'three';
import * as THREE from 'three';
import { COLORS, PATH_WIDTH } from './constants';

// =====================================================
// CUSTOM SHADERS FOR BEAUTIFUL VISUALS
// =====================================================

// --- Animated Water Shader ---
const WaterShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new Color('#1A4B6E') },
    uColor2: { value: new Color('#3A6B8E') },
    uFoamColor: { value: new Color('#FFFFFF') },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Create realistic waves
      float wave1 = sin(pos.x * 0.5 + uTime * 0.8) * 0.15;
      float wave2 = sin(pos.y * 0.3 + uTime * 0.6) * 0.1;
      float wave3 = sin((pos.x + pos.y) * 0.4 + uTime * 1.2) * 0.08;
      
      pos.z = wave1 + wave2 + wave3;
      vElevation = pos.z;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uFoamColor;
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      // Blend between deep and shallow water
      vec3 color = mix(uColor1, uColor2, vUv.y * 0.5 + 0.5);
      
      // Add foam on wave peaks
      float foam = smoothstep(0.15, 0.25, vElevation);
      color = mix(color, uFoamColor, foam * 0.3);
      
      // Add shimmer
      float shimmer = sin(vUv.x * 50.0 + uTime * 2.0) * sin(vUv.y * 50.0 + uTime * 1.5);
      shimmer = shimmer * 0.5 + 0.5;
      color += shimmer * 0.05;
      
      // Fresnel-like edge glow
      float fresnel = pow(1.0 - abs(vElevation * 2.0), 2.0);
      color += fresnel * 0.1;
      
      gl_FragColor = vec4(color, 0.9);
    }
  `
};

// --- Sand Shader with Wind Animation (Golden Hour Palette) ---
const SandShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new Color(COLORS.desertSand || '#E8D4A8') },  // Warm base sand
    uColor2: { value: new Color(COLORS.desertSandWarm || '#DABB7A') },  // Sunlit golden sand
    uWindIntensity: { value: 0.1 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uWindIntensity;
    varying vec2 vUv;
    varying float vNoise;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Create dune-like undulations
      float noise = snoise(vec2(pos.x * 0.02 + uTime * 0.02, pos.y * 0.02));
      vNoise = noise;
      pos.z += noise * uWindIntensity * 2.0;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uTime;
    varying vec2 vUv;
    varying float vNoise;
    
    void main() {
      // Blend colors based on position and noise
      vec3 color = mix(uColor1, uColor2, vNoise * 0.5 + 0.5);
      
      // Add subtle grain texture
      float grain = fract(sin(dot(vUv * 500.0, vec2(12.9898, 78.233))) * 43758.5453);
      color += (grain - 0.5) * 0.03;
      
      // Darker in valleys
      color *= 0.9 + vNoise * 0.2;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// =====================================================
// ENHANCED VISUAL COMPONENTS
// =====================================================

// --- Animated Water Plane ---
export const AnimatedWater: React.FC<{ position: [number, number, number], size?: [number, number] }> = ({ position, size = [100, 100] }) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size[0], size[1], 24, 24]} />
      <shaderMaterial
        ref={materialRef}
        args={[WaterShaderMaterial]}
        transparent
      />
    </mesh>
  );
};

// --- Animated Sand Plane ---
export const AnimatedSand: React.FC<{ position: [number, number, number], size?: [number, number] }> = ({ position, size = [120, 100] }) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size[0], size[1], 16, 16]} />
      <shaderMaterial
        ref={materialRef}
        args={[SandShaderMaterial]}
      />
    </mesh>
  );
};

// --- Enhanced Lantern with Glow ---
export const Lantern: React.FC<{ position: [number, number, number], lightsOn?: boolean }> = ({ position, lightsOn = false }) => {
  const glowRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (glowRef.current && lightsOn) {
      // Flickering flame effect
      const flicker = 1.8 + Math.sin(clock.getElapsedTime() * 10) * 0.3 + Math.sin(clock.getElapsedTime() * 7) * 0.2;
      glowRef.current.scale.setScalar(flicker);
    }
  });

  return (
    <group position={position}>
      {/* Brass Frame */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.08, 6]} />
        <meshBasicMaterial color="#B8860B" />
      </mesh>
      {/* Glass Body */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.35, 6]} />
        <meshBasicMaterial 
          color={lightsOn ? "#FFE4B5" : "#444"} 
          transparent 
          opacity={0.7}
        />
      </mesh>
      {/* Flame Core - emissive glow without point light */}
      {lightsOn && (
        <group position={[0, -0.2, 0]}>
          <mesh ref={glowRef}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#FF9933" />
          </mesh>
          {/* Outer glow halo */}
          <mesh>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshBasicMaterial color="#FFA500" transparent opacity={0.3} />
          </mesh>
        </group>
      )}
      {/* Bottom Cap */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.05, 6]} />
        <meshBasicMaterial color="#B8860B" />
      </mesh>
    </group>
  );
};

// --- Beautiful Palm Tree with Sway ---
export const PalmTree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
  const leavesRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (leavesRef.current) {
      // Gentle sway in wind
      leavesRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      leavesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.7) * 0.03;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Textured Trunk with Segments */}
      {[0, 0.8, 1.6, 2.4, 3.2].map((y, i) => (
        <mesh key={i} position={[0, y + 0.4, 0]}>
          <cylinderGeometry args={[0.35 - i * 0.04, 0.4 - i * 0.04, 0.8, 6]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#6D543E" : "#5D4037"} />
        </mesh>
      ))}
      
      {/* Date Clusters */}
      <group position={[0, 3.8, 0]}>
        {[0, 120, 240].map((angle, i) => (
          <mesh key={i} position={[Math.sin(angle * Math.PI / 180) * 0.5, -0.3, Math.cos(angle * Math.PI / 180) * 0.5]}>
            <sphereGeometry args={[0.25, 4, 4]} />
            <meshBasicMaterial color="#4A2511" />
          </mesh>
        ))}
      </group>
      
      {/* Animated Fronds */}
      <group ref={leavesRef} position={[0, 4.2, 0]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <group key={i} rotation={[0.6, i * (Math.PI * 2) / 8, 0]}>
            {/* Main Stem */}
            <mesh position={[0, 0.8, 0]} rotation={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.04, 2.5, 4]} />
              <meshBasicMaterial color="#2F4F2F" />
            </mesh>
            {/* Leaflets */}
            <mesh position={[0, 1.2, 0]} rotation={[0.5, 0, 0]}>
              <coneGeometry args={[0.6, 2.0, 4]} />
              <meshBasicMaterial color="#5F7348" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// --- Enhanced Dhow Boat with Details ---
export const DhowBoat: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const boatRef = useRef<Group>(null);
  const sailRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (boatRef.current) {
      // Gentle bobbing
      boatRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.15;
      boatRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
      boatRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.6) * 0.01;
    }
    if (sailRef.current) {
      // Billowing sail
      const billowScale = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
      sailRef.current.scale.x = billowScale;
    }
  });

  return (
    <group ref={boatRef} position={position} rotation={[0, Math.PI, 0]}>
      {/* Hull - Curved Shape */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.8, 1.8, 10]} />
        <meshBasicMaterial color="#5D4037" />
      </mesh>
      {/* Hull Details - Planking */}
      {[-0.8, 0, 0.8].map((y, i) => (
        <mesh key={i} position={[1.41, y + 0.8, 0]}>
          <boxGeometry args={[0.02, 0.3, 9.5]} />
          <meshBasicMaterial color="#3E2723" />
        </mesh>
      ))}
      {/* Bow (Pointed Front) */}
      <mesh position={[0, 1, 5.5]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[1.4, 2, 4]} />
        <meshBasicMaterial color="#5D4037" />
      </mesh>
      {/* Stern Decoration */}
      <mesh position={[0, 2, -5]}>
        <boxGeometry args={[2.5, 1.5, 0.3]} />
        <meshBasicMaterial color="#6D4C41" />
      </mesh>
      {/* Deck */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.6, 0.15, 9]} />
        <meshBasicMaterial color="#8D6E63" />
      </mesh>
      {/* Main Mast */}
      <mesh position={[0, 5, 1]}>
        <cylinderGeometry args={[0.12, 0.15, 8, 6]} />
        <meshBasicMaterial color="#4E342E" />
      </mesh>
      {/* Lateen Sail */}
      <group position={[0, 5, 1]} rotation={[0.1, 0, 0]}>
        {/* Yard (Diagonal Spar) */}
        <mesh rotation={[0, 0, 0.3]} position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 7, 6]} />
          <meshBasicMaterial color="#4E342E" />
        </mesh>
        {/* Sail Fabric */}
        <mesh ref={sailRef} position={[1.5, 1, 0.5]} rotation={[0.1, 0, 0.3]}>
          <planeGeometry args={[5, 6, 2, 2]} />
          <meshBasicMaterial color="#F5F5DC" side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Ropes */}
      <mesh position={[0.8, 3, 3]} rotation={[1.2, 0, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 4]} />
        <meshBasicMaterial color="#8B7355" />
      </mesh>
    </group>
  );
};

// --- Enhanced Ghaf Tree (UAE National Tree - OPTIMIZED) ---
export const GhafTree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
  const canopyRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (canopyRef.current) {
      canopyRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.02;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Gnarled Trunk */}
      <mesh position={[0, 1.5, 0]} rotation={[0.1, 0, 0.15]}>
        <cylinderGeometry args={[0.25, 0.4, 3, 5]} />
        <meshBasicMaterial color="#5D4037" />
      </mesh>
      {/* Secondary Branch */}
      <mesh position={[0.3, 2.8, 0.2]} rotation={[0.3, 0, -0.4]}>
        <cylinderGeometry args={[0.12, 0.2, 1.8, 4]} />
        <meshBasicMaterial color="#5D4037" />
      </mesh>
      
      {/* Umbrella Canopy */}
      <group ref={canopyRef} position={[0, 3.5, 0]}>
        {/* Central dome */}
        <mesh position={[0, 0.5, 0]} scale={[3, 1.2, 3]}>
          <sphereGeometry args={[1, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#4A5D23" />
        </mesh>
        {/* Outer foliage clusters - fixed positions */}
        {[[0, 0.3], [60, 0.4], [120, 0.25], [180, 0.35], [240, 0.45], [300, 0.3]].map(([angle, yOffset], i) => (
          <mesh 
            key={i} 
            position={[
              Math.sin(angle * Math.PI / 180) * 2, 
              0.2 + yOffset, 
              Math.cos(angle * Math.PI / 180) * 2
            ]}
            scale={[1.5, 0.8, 1.5]}
          >
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#4A5D23" : "#3D4F1D"} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// --- Enhanced Market Stall (OPTIMIZED) ---
export const MarketStall: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Wooden Frame */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.5, 1.2, 1.8]} />
        <meshBasicMaterial color="#6D543E" />
      </mesh>
      {/* Counter Top */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[2.6, 0.1, 2.0]} />
        <meshBasicMaterial color="#8B7355" />
      </mesh>
      {/* Awning Poles */}
      {[-1.1, 1.1].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 0.9]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 4]} />
          <meshBasicMaterial color="#5D4037" />
        </mesh>
      ))}
      {/* Colorful Awning */}
      <mesh position={[0, 2.4, 0.5]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[1.8, 1, 4]} />
        <meshBasicMaterial color={COLORS.pottery} />
      </mesh>
      {/* Goods on Display */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0]}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshBasicMaterial color={['#FFA500', '#8B4513', '#CD853F'][i]} />
        </mesh>
      ))}
    </group>
  );
};

// --- Road Chunk with Enhanced Visuals ---
export const RoadChunk: React.FC<{ type: 'sand' | 'harbor' | 'stone' | 'transition' | 'desert' | 'village', length: number }> = ({ type, length }) => {
  const waterRef = useRef<Mesh>(null);
  const sandShaderRef = useRef<ShaderMaterial>(null);
  
  useFrame(({ clock }) => {
    if (waterRef.current && (type === 'harbor' || type === 'transition')) {
      // Animate water
      const material = waterRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms?.uTime) {
        material.uniforms.uTime.value = clock.getElapsedTime();
      }
    }
    // Animate desert sand shader
    if (sandShaderRef.current && type === 'desert') {
      sandShaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  // Generate decorations
  const sideDecor = useMemo(() => {
    if (type !== 'sand' && type !== 'transition' && type !== 'desert') return [];
    const items = [];
    
    // Palm trees on sides
    for (let i = 0; i < 2; i++) {
      items.push({
        type: 'PALM',
        x: Math.random() > 0.5 ? -18 - Math.random() * 8 : 18 + Math.random() * 8,
        z: Math.random() * length,
        scale: 0.8 + Math.random() * 0.4
      });
    }
    
    // Ghaf trees occasionally
    if (Math.random() > 0.6) {
      items.push({
        type: 'GHAF',
        x: Math.random() > 0.5 ? -15 : 15,
        z: Math.random() * length,
        scale: 0.8 + Math.random() * 0.3
      });
    }
    
    return items;
  }, [type, length]);

  // TRANSITION: Blend between Sand and Harbor (Act 1 → Act 2)
  if (type === 'transition') {
    return (
      <group>
        {/* Base Sand (fading out) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, length/2]}>
          <planeGeometry args={[120, length]} />
          <meshBasicMaterial color={COLORS.sand} transparent opacity={0.7} />
        </mesh>
        
        {/* Packed Path (transitioning to dock) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, length/2]}>
          <planeGeometry args={[PATH_WIDTH, length]} />
          <meshBasicMaterial color="#D4B896" />
        </mesh>
        
        {/* Harbor wooden planks appearing */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, length/2]}>
          <planeGeometry args={[12, length]} />
          <meshBasicMaterial color={COLORS.harborWood} transparent opacity={0.5} />
        </mesh>
        
        {/* Water starting to appear on sides */}
        <mesh 
          ref={waterRef}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[-25, -0.2, length/2]}
        >
          <planeGeometry args={[30, length, 16, 16]} />
          <shaderMaterial args={[WaterShaderMaterial]} transparent />
        </mesh>
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[25, -0.2, length/2]}
        >
          <planeGeometry args={[30, length, 16, 16]} />
          <shaderMaterial args={[WaterShaderMaterial]} transparent />
        </mesh>
        
        {/* Scattered dock posts appearing */}
        {[-5, 5].map((x, i) => 
          [length/4, length*3/4].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, -0.5, z]}>
              <cylinderGeometry args={[0.12, 0.15, 2, 8]} />
              <meshBasicMaterial color="#4E342E" />
            </mesh>
          ))
        )}
        
        {/* Seagulls flying (visual cue of approaching coast) */}
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 8 - 8, 8 + i, length/2 + i * 3]}>
            <mesh rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.15, 0.5, 3]} />
              <meshBasicMaterial color="#FFF" />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, -0.6]}>
              <boxGeometry args={[0.4, 0.02, 0.1]} />
              <meshBasicMaterial color="#FFF" />
            </mesh>
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, 0.6]}>
              <boxGeometry args={[0.4, 0.02, 0.1]} />
              <meshBasicMaterial color="#FFF" />
            </mesh>
          </group>
        ))}
        
        {/* Path edges transitioning */}
        {[-PATH_WIDTH/2 - 0.3, PATH_WIDTH/2 + 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.08, length/2]}>
            <boxGeometry args={[1, 0.15, length]} />
            <meshBasicMaterial color="#A08060" />
          </mesh>
        ))}
        
        {/* Side Decorations (fewer than sand, transitioning) */}
        {sideDecor.slice(0, 1).map((item, i) => {
          if (item.type === 'PALM') return <PalmTree key={i} position={[item.x, 0, item.z]} scale={item.scale} />;
          return null;
        })}
      </group>
    );
  }

  // DESERT: Act 4 - Beautiful Caravan Trail with Parallax Dunes
  if (type === 'desert') {
    return (
      <group>
        {/* Base Desert Sand with Shader Animation */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, length/2]} receiveShadow>
          <planeGeometry args={[120, length, 16, 16]} />
          <shaderMaterial ref={sandShaderRef} args={[SandShaderMaterial]} />
        </mesh>

        {/* Caravan Path - Packed dry sand trail */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, length/2]}>
          <planeGeometry args={[PATH_WIDTH, length]} />
          <meshBasicMaterial color={COLORS.caravanPath || '#E8D8B8'} />
        </mesh>

        {/* Path edge markings - subtle caravan tracks */}
        {[-PATH_WIDTH/2 - 0.3, PATH_WIDTH/2 + 0.3].map((x, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, length/2]}>
            <planeGeometry args={[0.8, length]} />
            <meshBasicMaterial color={COLORS.caravanTrack || '#C8B080'} />
          </mesh>
        ))}

        {/* PARALLAX DUNE LAYERS - All grounded at Y=0 */}
        {/* Layer 1: Distant dunes (furthest, largest - background hills) */}
        <group position={[-50, 0, length/2]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[i * 15, 0, i * 5]} scale={[12, 4, 6]} rotation={[0, 0.2, 0]}>
              <sphereGeometry args={[1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color={COLORS.duneHighlight || '#F8E8C8'} />
            </mesh>
          ))}
        </group>
        <group position={[50, 0, length/2]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-i * 15, 0, i * 5]} scale={[12, 4, 6]} rotation={[0, -0.2, 0]}>
              <sphereGeometry args={[1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color={COLORS.duneHighlight || '#F8E8C8'} />
            </mesh>
          ))}
        </group>

        {/* Layer 2: Mid-distance dunes - grounded */}
        <group position={[-30, 0, length/2]}>
          {[0, 1].map((i) => (
            <mesh key={i} position={[i * 10, 0, i * 8]} scale={[6, 2.5, 4]} rotation={[0, 0.15, 0]}>
              <sphereGeometry args={[1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color={COLORS.desertSandLight || '#F5EBD6'} />
            </mesh>
          ))}
        </group>
        <group position={[30, 0, length/2]}>
          {[0, 1].map((i) => (
            <mesh key={i} position={[-i * 10, 0, i * 8]} scale={[6, 2.5, 4]} rotation={[0, -0.15, 0]}>
              <sphereGeometry args={[1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color={COLORS.desertSandLight || '#F5EBD6'} />
            </mesh>
          ))}
        </group>

        {/* Layer 3: Near dunes - grounded, detailed */}
        {[-18, 18].map((x, i) => (
          <mesh key={i} position={[x, 0, length * 0.3]} scale={[4, 1.5, 3]} rotation={[0, i === 0 ? 0.1 : -0.1, 0]}>
            <sphereGeometry args={[1, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color={COLORS.desertSandWarm || '#DABB7A'} />
          </mesh>
        ))}
        {[-15, 15].map((x, i) => (
          <mesh key={i} position={[x, 0, length * 0.7]} scale={[3.5, 1.2, 2.5]} rotation={[0, i === 0 ? -0.1 : 0.1, 0]}>
            <sphereGeometry args={[1, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color={COLORS.desertGold || '#D4A860'} />
          </mesh>
        ))}

        {/* Dune shadows (soft) */}
        {[-20, 20].map((x, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x + (i === 0 ? 2 : -2), 0.01, length/2]}>
            <planeGeometry args={[4, 8]} />
            <meshBasicMaterial color={COLORS.duneShadow || '#B8986C'} transparent opacity={0.15} />
          </mesh>
        ))}

        {/* Desert shrubs scattered */}
        {sideDecor.map((item, idx) => {
          if (item.type === 'GHAF') return <GhafTree key={idx} position={[item.x, 0, item.z]} scale={item.scale} />;
          return null;
        })}

        {/* Scattered rocks on sides - fixed positions */}
        {[[-14, 0.2, length * 0.2, 0.35], [13, 0.2, length * 0.4, 0.4], [-11, 0.2, length * 0.6, 0.3], [12, 0.2, length * 0.8, 0.45]].map(([x, y, z, size], i) => (
          <mesh key={i} position={[x, y, z]}>
            <dodecahedronGeometry args={[size]} />
            <meshBasicMaterial color={COLORS.desertRock || '#9A8A70'} />
          </mesh>
        ))}

        {/* Wind-blown sand particles effect - fixed positions */}
        {[[-8, 1.0, length * 0.15, 0.2], [5, 1.5, length * 0.3, 0.8], [-3, 2.0, length * 0.5, 1.4], [9, 0.8, length * 0.7, 2.1], [-6, 1.2, length * 0.85, 0.5], [2, 1.8, length * 0.95, 1.9]].map(([x, y, z, rot], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, rot, 0]}>
            <planeGeometry args={[0.8, 0.02]} />
            <meshBasicMaterial color="#E8D4B8" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'harbor') {
    return (
      <group>
        {/* Wooden Dock with Planks */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, length/2]} receiveShadow>
          <planeGeometry args={[14, length]} />
          <meshBasicMaterial color={COLORS.harborWood} />
        </mesh>
        
        {/* Dock Edge Beams */}
        {[-7, 7].map((x, i) => (
          <mesh key={i} position={[x, 0.3, length/2]}>
            <boxGeometry args={[0.6, 0.5, length]} />
            <meshBasicMaterial color="#5D4037" />
          </mesh>
        ))}
        
        {/* Animated Water on both sides */}
        <mesh 
          ref={waterRef}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[-35, -0.3, length/2]}
        >
          <planeGeometry args={[50, length, 16, 16]} />
          <shaderMaterial args={[WaterShaderMaterial]} transparent />
        </mesh>
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[35, -0.3, length/2]}
        >
          <planeGeometry args={[50, length, 16, 16]} />
          <shaderMaterial args={[WaterShaderMaterial]} transparent />
        </mesh>
        
        {/* Dock Posts */}
        {[-6.5, 6.5].map((x, i) => 
          [0, length/3, length*2/3, length].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, -1, z]}>
              <cylinderGeometry args={[0.15, 0.2, 3, 8]} />
              <meshBasicMaterial color="#3E2723" />
            </mesh>
          ))
        )}
      </group>
    );
  }

  // VILLAGE: Act 5 - Homecoming path (OPTIMIZED for 60fps)
  if (type === 'village') {
    return (
      <group>
        {/* Base terrain - warm evening farm fields */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, length/2]} receiveShadow>
          <planeGeometry args={[120, length]} />
          <meshBasicMaterial color={COLORS.farmField || '#8B9A5B'} />
        </mesh>

        {/* Gradient overlay for depth - darker edges */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, -0.05, length/2]}>
          <planeGeometry args={[40, length]} />
          <meshBasicMaterial color="#5A6B3B" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, -0.05, length/2]}>
          <planeGeometry args={[40, length]} />
          <meshBasicMaterial color="#5A6B3B" transparent opacity={0.5} />
        </mesh>

        {/* Main Village Path - packed warm dirt */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, length/2]} receiveShadow>
          <planeGeometry args={[PATH_WIDTH, length]} />
          <meshBasicMaterial color={COLORS.dirtPath || '#B8976E'} />
        </mesh>

        {/* Path edge - simple continuous strip */}
        {[-PATH_WIDTH/2 - 0.5, PATH_WIDTH/2 + 0.5].map((x, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, length/2]}>
            <planeGeometry args={[1, length]} />
            <meshBasicMaterial color="#8B7355" />
          </mesh>
        ))}

        {/* Celebration Lantern Posts - simplified, no point lights */}
        {[-PATH_WIDTH/2 - 2.5, PATH_WIDTH/2 + 2.5].map((x, i) => (
          <group key={i} position={[x, 0, length * 0.5]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 3, 6]} />
              <meshBasicMaterial color="#5D4037" />
            </mesh>
            <mesh position={[i === 0 ? 0.4 : -0.4, 2.8, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 4]} />
              <meshBasicMaterial color="#5D4037" />
            </mesh>
            <mesh position={[i === 0 ? 0.6 : -0.6, 2.5, 0]}>
              <octahedronGeometry args={[0.2]} />
              <meshBasicMaterial color="#FFB347" />
            </mesh>
            <mesh position={[i === 0 ? 0.6 : -0.6, 2.5, 0]}>
              <sphereGeometry args={[0.4, 6, 6]} />
              <meshBasicMaterial color="#FF8C00" transparent opacity={0.3} />
            </mesh>
          </group>
        ))}

        {/* Celebration Banner - single per chunk */}
        <group position={[0, 3.5, length * 0.5]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, PATH_WIDTH + 4, 4]} />
            <meshBasicMaterial color="#8B4513" />
          </mesh>
          {[-2.4, -0.8, 0.8, 2.4].map((xPos, i) => (
            <mesh key={i} position={[xPos, -0.3, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.25, 0.5, 3]} />
              <meshBasicMaterial color={['#C41E3A', '#FFD700', '#228B22', '#FF6347'][i]} />
            </mesh>
          ))}
        </group>

        {/* Farm field stripes - simplified */}
        {[-22, -19, 19, 22].map((x, i) => (
          <mesh key={i} position={[x, 0.02, length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, length]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#7A8B4A' : '#6B7C3B'} />
          </mesh>
        ))}

        {/* Arish houses - simplified, no point lights */}
        {[-35, 35].map((x, i) => (
          <group key={i} position={[x, 0, length * 0.5]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[4, 3, 3]} />
              <meshBasicMaterial color="#D4C4A8" />
            </mesh>
            <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI/4, 0]}>
              <coneGeometry args={[3.5, 1.5, 4]} />
              <meshBasicMaterial color="#8B7355" />
            </mesh>
            <mesh position={[i === 0 ? 2.01 : -2.01, 1.5, 0]}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshBasicMaterial color="#FFE4B5" />
            </mesh>
          </group>
        ))}

        {/* Fixed position trees - no random */}
        <PalmTree position={[-18, 0, length * 0.3]} scale={0.9} />
        <PalmTree position={[18, 0, length * 0.7]} scale={0.9} />
        <GhafTree position={[-15, 0, length * 0.6]} scale={1.0} />
      </group>
    );
  }

  // Default Sand Road (OPTIMIZED)
  return (
    <group>
      {/* Base Sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, length/2]}>
        <planeGeometry args={[120, length]} />
        <meshBasicMaterial color={COLORS.sand} />
      </mesh>

      {/* Packed Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, length/2]}>
        <planeGeometry args={[PATH_WIDTH, length]} />
        <meshBasicMaterial color="#E0CBA1" />
      </mesh>

      {/* Path Edges */}
      {[-PATH_WIDTH/2 - 0.5, PATH_WIDTH/2 + 0.5].map((x, i) => (
        <mesh key={i} rotation={[0, 0, i === 0 ? 0.2 : -0.2]} position={[x, 0.1, length/2]}>
          <boxGeometry args={[1.5, 0.2, length]} />
          <meshBasicMaterial color={COLORS.sandDark || COLORS.sand} />
        </mesh>
      ))}

      {/* Scattered Pebbles - fixed positions */}
      {[[-1.5, 0.05, length * 0.1, 0.35], [1.2, 0.05, length * 0.25, 0.4], [-0.8, 0.05, length * 0.45, 0.3], [1.8, 0.05, length * 0.6, 0.45], [-1.0, 0.05, length * 0.75, 0.38], [0.5, 0.05, length * 0.9, 0.32]].map(([x, y, z, s], i) => (
        <mesh 
          key={i} 
          position={[x, y, z]}
          scale={s}
        >
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshBasicMaterial color="#A0826D" />
        </mesh>
      ))}

      {/* Side Decorations */}
      {sideDecor.map((item, i) => {
        if (item.type === 'PALM') return <PalmTree key={i} position={[item.x, 0, item.z]} scale={item.scale} />;
        if (item.type === 'GHAF') return <GhafTree key={i} position={[item.x, 0, item.z]} scale={item.scale} />;
        return null;
      })}
    </group>
  );
};

// --- Rest of the existing components with minor enhancements ---

export const LyciumShawii: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const offsets = useMemo(() => [0, 1, 2, 3].map(i => ({
    pos: [Math.sin(i) * 0.4, 0.3 + i * 0.05, Math.cos(i) * 0.4] as [number, number, number],
    rot: [i * 0.3, i * 0.5, i * 0.2] as [number, number, number]
  })), []);
  return (
    <group position={position}>
      {offsets.map((o, i) => (
        <mesh key={i} position={o.pos} rotation={o.rot} scale={0.4}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#6B8E23" />
        </mesh>
      ))}
    </group>
  );
};

export const FalajCrossing: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 1.8]} />
      <meshBasicMaterial color={COLORS.water} />
    </mesh>
    {[-1, 1].map((z, i) => (
      <mesh key={i} position={[0, 0.15, z]}>
        <boxGeometry args={[12, 0.3, 0.4]} />
        <meshBasicMaterial color={COLORS.stone} />
      </mesh>
    ))}
  </group>
);

export const Pebble: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => (
  <mesh position={position} scale={[scale, scale * 0.6, scale]}>
    <dodecahedronGeometry args={[0.1, 0]} />
    <meshBasicMaterial color={COLORS.stone} />
  </mesh>
);

export const ArishHouse: React.FC<{ position: [number, number, number], height?: number, lightsOn?: boolean }> = ({ position, height = 3, lightsOn = false }) => (
  <group position={position}>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[4, height, 4]} />
      <meshBasicMaterial color="#C19A6B" />
    </mesh>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[4.05, height, 4.05]} />
      <meshBasicMaterial color="#8B5A2B" wireframe opacity={0.3} transparent />
    </mesh>
    <mesh position={[0, height + 0.1, 0]} rotation={[0.05, 0, 0]}>
      <boxGeometry args={[4.4, 0.2, 4.4]} />
      <meshBasicMaterial color="#8B5A2B" />
    </mesh>
    <mesh position={[0, 1, 2.01]}>
      <planeGeometry args={[1.2, 2]} />
      <meshBasicMaterial color="#2F1B10" />
    </mesh>
    <Lantern position={[1.5, 2.5, 2.2]} lightsOn={lightsOn} />
  </group>
);

export const Camel: React.FC<{ position: [number, number, number], isWalking?: boolean }> = ({ position, isWalking = true }) => {
  const groupRef = useRef<Group>(null);
  const legFL = useRef<Mesh>(null);
  const legFR = useRef<Mesh>(null);
  const legBL = useRef<Mesh>(null);
  const legBR = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!isWalking || !groupRef.current) return;
    const t = clock.getElapsedTime() * 6;
    groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.05;
    if (legFL.current) legFL.current.rotation.x = Math.sin(t) * 0.4;
    if (legBR.current) legBR.current.rotation.x = Math.sin(t) * 0.4;
    if (legFR.current) legFR.current.rotation.x = Math.sin(t + Math.PI) * 0.4;
    if (legBL.current) legBL.current.rotation.x = Math.sin(t + Math.PI) * 0.4;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[1.2, 1.0, 2.2]} />
        <meshLambertMaterial color={COLORS.camelBrown || '#C4A060'} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry args={[0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color={COLORS.camelBrown || '#C4A060'} />
      </mesh>
      <mesh position={[0, 2.0, 1.4]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.2]} />
        <meshLambertMaterial color={COLORS.camelBrown || '#C4A060'} />
      </mesh>
      <mesh position={[0, 2.6, 1.8]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.8]} />
        <meshLambertMaterial color={COLORS.camelBrown || '#C4A060'} />
      </mesh>
      <group position={[0, 1, 0]}>
        <mesh ref={legFL} position={[-0.4, 0, 0.8]}>
          <cylinderGeometry args={[0.15, 0.12, 1.4]} />
          <meshLambertMaterial color={COLORS.camelShadow || '#8B7040'} />
        </mesh>
        <mesh ref={legFR} position={[0.4, 0, 0.8]}>
          <cylinderGeometry args={[0.15, 0.12, 1.4]} />
          <meshLambertMaterial color={COLORS.camelShadow || '#8B7040'} />
        </mesh>
        <mesh ref={legBL} position={[-0.4, 0, -0.8]}>
          <cylinderGeometry args={[0.15, 0.12, 1.4]} />
          <meshLambertMaterial color={COLORS.camelShadow || '#8B7040'} />
        </mesh>
        <mesh ref={legBR} position={[0.4, 0, -0.8]}>
          <cylinderGeometry args={[0.15, 0.12, 1.4]} />
          <meshLambertMaterial color={COLORS.camelShadow || '#8B7040'} />
        </mesh>
      </group>
      <mesh position={[0, 1.91, 0]}>
        <boxGeometry args={[1.25, 0.1, 1.2]} />
        <meshLambertMaterial color={COLORS.tentBrown || '#5A4830'} />
      </mesh>
    </group>
  );
};

export const Gazelle: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const headRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (headRef.current) {
      headRef.current.rotation.x = 0.5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
    }
  });

  return (
    <group position={position} scale={1.2}>
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
        <meshLambertMaterial color="#D2B48C" />
      </mesh>
      <group ref={headRef} position={[0, 0.8, 0.4]}>
        <mesh position={[0, 0.4, 0.1]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.6]} />
          <meshLambertMaterial color="#D2B48C" />
        </mesh>
        <mesh position={[0, 0.7, 0.2]}>
          <coneGeometry args={[0.15, 0.4, 4]} />
          <meshLambertMaterial color="#D2B48C" />
        </mesh>
        {[-0.1, 0.1].map((x, i) => (
          <mesh key={i} position={[x, 0.9, 0.15]} rotation={[-0.2, 0, i === 0 ? -0.2 : 0.2]}>
            <cylinderGeometry args={[0.02, 0.04, 0.5]} />
            <meshBasicMaterial color="#333" />
          </mesh>
        ))}
      </group>
      {[[-0.15, 0.3], [0.15, 0.3], [-0.15, -0.3], [0.15, -0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.4, z]} rotation={[i < 2 ? 0.1 : -0.1, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.8]} />
          <meshLambertMaterial color="#D2B48C" />
        </mesh>
      ))}
    </group>
  );
};

// --- Collectible Meshes (Optimized: single useFrame, meshBasicMaterial) ---
export const PearlMesh: React.FC<{ type?: 'PEARL_WHITE' | 'PEARL_PINK' | 'PEARL_GOLDEN' | 'TRADE_GOOD' | 'COIN_GOLD' }> = ({ type = 'PEARL_WHITE' }) => {
  const ref = useRef<Mesh>(null);

  // Single consolidated useFrame for all types
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      if (type === 'COIN_GOLD') {
        ref.current.rotation.y += 0.05;
        ref.current.position.y = 0.5 + Math.sin(t * 4) * 0.1;
      } else {
        ref.current.rotation.y += 0.02;
        ref.current.position.y = Math.sin(t * 3) * 0.1;
        if (type === 'PEARL_GOLDEN') {
          ref.current.scale.setScalar(1 + Math.sin(t * 5) * 0.1);
        }
      }
    }
  });

  if (type === 'TRADE_GOOD') {
    return (
      <mesh ref={ref} position={[0, 0.5, 0]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color={COLORS.pottery} />
      </mesh>
    );
  }

  if (type === 'COIN_GOLD') {
    return (
      <mesh ref={ref} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 12]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    );
  }

  const color = type === 'PEARL_GOLDEN' ? COLORS.pearlGold : type === 'PEARL_PINK' ? COLORS.pearlPink : COLORS.pearl;

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.3, 1]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export const DateMesh: React.FC = () => {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {[[0, 0, 0], [0.1, 0.1, 0], [-0.1, 0.1, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, i === 1 ? 0.5 : i === 2 ? -0.5 : 0]}>
          <capsuleGeometry args={[0.08, 0.2, 4, 6]} />
          <meshBasicMaterial color={COLORS.date} />
        </mesh>
      ))}
    </group>
  );
};

export const DivingGearMesh: React.FC = () => {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.03;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.05, 6, 12, Math.PI * 1.5]} />
        <meshBasicMaterial color={COLORS.silver} />
      </mesh>
    </group>
  );
};

// --- All remaining simple components ---
export const WaterJar: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.4, 0]}>
      <sphereGeometry args={[0.4, 6, 6, 0, Math.PI * 2, 0, 2]} />
      <meshBasicMaterial color={COLORS.pottery} />
    </mesh>
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
      <meshBasicMaterial color={COLORS.pottery} />
    </mesh>
    <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.2, 0.05, 4, 8]} />
      <meshBasicMaterial color={COLORS.pottery} />
    </mesh>
  </group>
);

export const LaundryLine: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {[-1.4, 1.4].map((x, i) => (
      <mesh key={i} position={[x, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshBasicMaterial color={COLORS.woodLight} />
      </mesh>
    ))}
    <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.01, 0.01, 2.8]} />
      <meshBasicMaterial color="#888" />
    </mesh>
    <mesh position={[0, 2.0, 0]}>
      <boxGeometry args={[2.0, 1.4, 0.05]} />
      <meshBasicMaterial color={COLORS.clothWhite} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

export const Building: React.FC<{ position: [number, number, number], height?: number, lightsOn?: boolean }> = ({ position, height = 3, lightsOn = false }) => (
  <group position={position}>
    <mesh position={[0, height / 2, 0]} castShadow>
      <boxGeometry args={[3, height, 3]} />
      <meshLambertMaterial color={COLORS.stone} />
    </mesh>
    {[0, 1].map(i => (
      <mesh key={i} position={[0.8 * (i === 0 ? 1 : -1), height / 2, 1.51]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color={lightsOn ? "#FFD700" : "#222"} />
      </mesh>
    ))}
  </group>
);

// --- Enhanced NPC with proper head and features ---
export const NPC: React.FC<{ position: [number, number, number], type?: 'merchant' | 'villager' }> = ({ position, type = 'villager' }) => (
  <group position={position}>
    {/* Body - Traditional Kandura/Thobe */}
    <mesh position={[0, 0.9, 0]} castShadow>
      <cylinderGeometry args={[0.25, 0.4, 1.6, 12]} />
      <meshLambertMaterial color={type === 'merchant' ? COLORS.clothBlue : COLORS.clothWhite} />
    </mesh>
    
    {/* Proper Head - Rounded sphere, skin tone */}
    <mesh position={[0, 1.75, 0]} castShadow>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshLambertMaterial color={COLORS.skin} />
    </mesh>
    
    {/* Ghutra (White Headscarf) - Full rounded, not pointed */}
    <mesh position={[0, 1.9, 0]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshLambertMaterial color={type === 'merchant' ? "#F5F5DC" : COLORS.clothWhite} />
    </mesh>
    {/* Ghutra drape behind head */}
    <mesh position={[0, 1.75, -0.1]} rotation={[0.2, 0, 0]}>
      <boxGeometry args={[0.25, 0.35, 0.06]} />
      <meshLambertMaterial color={type === 'merchant' ? "#F5F5DC" : COLORS.clothWhite} />
    </mesh>
    
    {/* Agal (Black Ring) */}
    <mesh position={[0, 1.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.16, 0.02, 6, 16]} />
      <meshBasicMaterial color="#111" />
    </mesh>
    
    {/* Face features - Eyes */}
    <mesh position={[-0.05, 1.77, 0.14]}>
      <sphereGeometry args={[0.02]} />
      <meshBasicMaterial color="#2a1a0a" />
    </mesh>
    <mesh position={[0.05, 1.77, 0.14]}>
      <sphereGeometry args={[0.02]} />
      <meshBasicMaterial color="#2a1a0a" />
    </mesh>
    
    {/* Arms */}
    <mesh position={[-0.28, 1.1, 0.05]} rotation={[0.2, 0, 0.3]}>
      <cylinderGeometry args={[0.05, 0.04, 0.5]} />
      <meshLambertMaterial color={type === 'merchant' ? COLORS.clothBlue : COLORS.clothWhite} />
    </mesh>
    <mesh position={[0.28, 1.1, 0.05]} rotation={[0.2, 0, -0.3]}>
      <cylinderGeometry args={[0.05, 0.04, 0.5]} />
      <meshLambertMaterial color={type === 'merchant' ? COLORS.clothBlue : COLORS.clothWhite} />
    </mesh>
    
    {/* Hands */}
    <mesh position={[-0.32, 0.85, 0.1]}>
      <sphereGeometry args={[0.05]} />
      <meshLambertMaterial color={COLORS.skin} />
    </mesh>
    <mesh position={[0.32, 0.85, 0.1]}>
      <sphereGeometry args={[0.05]} />
      <meshLambertMaterial color={COLORS.skin} />
    </mesh>
    
    {/* Shadow */}
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.35, 12]} />
      <meshBasicMaterial color="#000" opacity={0.2} transparent />
    </mesh>
  </group>
);

// --- Obstacle Components ---
export const CargoCrate: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.8, position[2]]} castShadow>
    <boxGeometry args={[1.5, 1.6, 1.5]} />
    <meshLambertMaterial color="#8B4513" />
  </mesh>
);

export const RopeCoil: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.3, position[2]]}>
    <torusGeometry args={[0.5, 0.2, 8, 16]} />
    <meshBasicMaterial color={COLORS.rope} />
  </mesh>
);

export const HangingNet: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 2, position[2]]}>
    <boxGeometry args={[2, 2, 0.1]} />
    <meshBasicMaterial color="#555" wireframe />
  </mesh>
);

export const DockPost: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 1.5, position[2]]} castShadow>
    <cylinderGeometry args={[0.2, 0.2, 3]} />
    <meshLambertMaterial color={COLORS.wood} />
  </mesh>
);

export const OysterBasket: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} castShadow>
    <cylinderGeometry args={[0.5, 0.4, 1]} />
    <meshBasicMaterial color={COLORS.woodLight} />
  </mesh>
);

export const DivingWeights: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.2, position[2]]} castShadow>
    <boxGeometry args={[0.5, 0.4, 0.5]} />
    <meshLambertMaterial color="#444" />
  </mesh>
);

export const WoodenChest: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} castShadow>
    <boxGeometry args={[1, 1, 0.6]} />
    <meshLambertMaterial color={COLORS.wood} />
  </mesh>
);

export const SailCanvas: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 1.5, position[2]]}>
    <boxGeometry args={[3, 2, 0.1]} />
    <meshBasicMaterial color={COLORS.clothWhite} />
  </mesh>
);

export const DryingNets: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 1.5, position[2]]}>
    <boxGeometry args={[3, 2, 0.1]} />
    <meshBasicMaterial color="#8B7355" wireframe />
  </mesh>
);

export const MastBoom: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 2, position[2]]} rotation={[0, 0, 1.57]}>
    <cylinderGeometry args={[0.1, 0.1, 4]} />
    <meshBasicMaterial color={COLORS.wood} />
  </mesh>
);

export const OverheadRigging: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 2.5, position[2]]}>
    <cylinderGeometry args={[0.05, 0.05, 4]} />
    <meshBasicMaterial color={COLORS.rope} />
  </mesh>
);

export const MainMast: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 3, position[2]]} castShadow>
    <cylinderGeometry args={[0.2, 0.3, 6]} />
    <meshLambertMaterial color={COLORS.wood} />
  </mesh>
);

export const CrewGroup: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <NPC position={[-0.5, 0, 0]} />
    <NPC position={[0.5, 0, 0]} type="merchant" />
  </group>
);

export const CaptainStation: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1, 0]} castShadow>
      <cylinderGeometry args={[1, 1, 2]} />
      <meshLambertMaterial color={COLORS.wood} />
    </mesh>
    <NPC position={[0, 1.5, 0]} type="merchant" />
  </group>
);

export const SandDune: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} scale={[2, 1, 2]} castShadow>
    <sphereGeometry args={[1, 8, 8, 0, 6.28, 0, 1.5]} />
    <meshBasicMaterial color={COLORS.sand} />
  </mesh>
);

export const DesertShrub: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <LyciumShawii position={position} />
);

export const RockFormation: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} castShadow>
    <dodecahedronGeometry args={[1]} />
    <meshBasicMaterial color={COLORS.stone} />
  </mesh>
);

// Special Rideable Camel - Sitting with ornate saddle for Pearl Challenge
export const SittingCamelWithSaddle: React.FC<{ position: [number, number, number], glowing?: boolean }> = ({ position, glowing = true }) => {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    // Gentle breathing animation
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 1.5) * 0.02;
    }
    // Pulsing glow effect
    if (glowRef.current && glowing) {
      const pulse = 0.8 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Glow ring around camel */}
      {glowing && (
        <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[2.5, 3.2, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Sitting camel body - lower and wider */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.4, 0.9, 2.4]} />
        <meshLambertMaterial color="#C9A85C" />
      </mesh>
      
      {/* Hump */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.65, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color="#C9A85C" />
      </mesh>
      
      {/* Neck - more upright for sitting pose */}
      <mesh position={[0, 1.1, 1.2]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 1.4]} />
        <meshLambertMaterial color="#C9A85C" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.9, 1.6]} castShadow>
        <boxGeometry args={[0.35, 0.45, 0.9]} />
        <meshLambertMaterial color="#C9A85C" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.18, 1.95, 1.9]}>
        <sphereGeometry args={[0.06]} />
        <meshBasicMaterial color="#2C1810" />
      </mesh>
      <mesh position={[0.18, 1.95, 1.9]}>
        <sphereGeometry args={[0.06]} />
        <meshBasicMaterial color="#2C1810" />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.18, 2.15, 1.5]} rotation={[0.3, -0.2, 0]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshLambertMaterial color="#C9A85C" />
      </mesh>
      <mesh position={[0.18, 2.15, 1.5]} rotation={[0.3, 0.2, 0]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshLambertMaterial color="#C9A85C" />
      </mesh>
      
      {/* Folded legs (sitting position) */}
      {/* Front legs - folded under */}
      <mesh position={[-0.4, 0.25, 0.9]} rotation={[1.4, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.12, 1.0]} />
        <meshLambertMaterial color="#A68B4B" />
      </mesh>
      <mesh position={[0.4, 0.25, 0.9]} rotation={[1.4, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.12, 1.0]} />
        <meshLambertMaterial color="#A68B4B" />
      </mesh>
      {/* Back legs - folded under */}
      <mesh position={[-0.4, 0.25, -0.9]} rotation={[-1.4, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.12, 1.0]} />
        <meshLambertMaterial color="#A68B4B" />
      </mesh>
      <mesh position={[0.4, 0.25, -0.9]} rotation={[-1.4, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.12, 1.0]} />
        <meshLambertMaterial color="#A68B4B" />
      </mesh>
      
      {/* === ORNATE SADDLE === */}
      {/* Base blanket - rich red with gold trim */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.8, 0.08, 2.2]} />
        <meshBasicMaterial color="#8B2323" />
      </mesh>
      
      {/* Gold trim edges */}
      <mesh position={[-0.85, 1.28, 0]}>
        <boxGeometry args={[0.12, 0.04, 2.2]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      <mesh position={[0.85, 1.28, 0]}>
        <boxGeometry args={[0.12, 0.04, 2.2]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      {/* Wooden saddle frame */}
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[1.2, 0.25, 1.6]} />
        <meshBasicMaterial color="#5D3A1A" />
      </mesh>
      
      {/* Pommel (front rise) - ornate */}
      <mesh position={[0, 1.75, 0.65]}>
        <boxGeometry args={[0.35, 0.5, 0.25]} />
        <meshBasicMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[0, 1.95, 0.65]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      {/* Cantle (back rise) - ornate */}
      <mesh position={[0, 1.65, -0.65]}>
        <boxGeometry args={[0.45, 0.4, 0.2]} />
        <meshBasicMaterial color="#5D3A1A" />
      </mesh>
      
      {/* Seat cushion */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[1.0, 0.15, 1.1]} />
        <meshBasicMaterial color="#DC143C" />
      </mesh>
      
      {/* Decorative geometric pattern */}
      <mesh position={[0, 1.71, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.7]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      {/* Hanging saddlebags */}
      <mesh position={[-0.95, 0.9, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.8]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.95, 0.9, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.8]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>
      
      {/* Decorative tassels */}
      {[-0.8, 0.8].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.4, 0.8]}>
            <cylinderGeometry args={[0.04, 0.06, 0.35]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <mesh position={[x, 0.4, -0.8]}>
            <cylinderGeometry args={[0.04, 0.06, 0.35]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      ))}
      
      {/* Bridle/reins */}
      <mesh position={[0, 1.85, 2.0]} rotation={[0.8, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshBasicMaterial color="#4A3728" />
      </mesh>
      
      {/* Decorative headpiece */}
      <mesh position={[0, 2.2, 1.5]}>
        <cylinderGeometry args={[0.03, 0.08, 0.15]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export const CamelResting: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.5, 0]} scale={[1.5, 0.8, 1]} castShadow>
      <sphereGeometry args={[0.8]} />
      <meshBasicMaterial color="#C19A6B" />
    </mesh>
  </group>
);

export const LowTent: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} rotation={[0, 0.78, 0]} castShadow>
    <coneGeometry args={[2, 1.5, 4]} />
    <meshBasicMaterial color="#8B7355" side={THREE.DoubleSide} />
  </mesh>
);

export const TallCactus: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.5, 0]} castShadow>
      <cylinderGeometry args={[0.25, 0.3, 3]} />
      <meshBasicMaterial color="#228B22" />
    </mesh>
    <mesh position={[0.4, 2, 0]} rotation={[0, 0, -0.5]}>
      <cylinderGeometry args={[0.15, 0.2, 1]} />
      <meshBasicMaterial color="#228B22" />
    </mesh>
  </group>
);

export const RopeLine: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} rotation={[0, 0, 1.57]}>
    <cylinderGeometry args={[0.05, 0.05, 4]} />
    <meshBasicMaterial color={COLORS.rope} />
  </mesh>
);

export const SupplyPile: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={COLORS.wood} />
    </mesh>
  </group>
);

export const FarmFence: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} castShadow>
    <boxGeometry args={[2, 1, 0.1]} />
    <meshBasicMaterial color={COLORS.woodLight} />
  </mesh>
);

export const WaterChannel: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <FalajCrossing position={position} />
);

export const HarvestBasket: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} castShadow>
    <cylinderGeometry args={[0.5, 0.4, 0.8]} />
    <meshBasicMaterial color={COLORS.woodLight} />
  </mesh>
);

export const TreeBranch: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} rotation={[0, 0, 1.57]}>
    <cylinderGeometry args={[0.1, 0.1, 3]} />
    <meshBasicMaterial color={COLORS.palmGreen} />
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
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={COLORS.pottery} />
    </mesh>
  </group>
);

export const ChildrenPlaying: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.4]} />
      <meshBasicMaterial color={COLORS.skin} />
    </mesh>
  </group>
);

export const CelebrationBanner: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 2, position[2]]}>
    <boxGeometry args={[3, 1, 0.1]} />
    <meshBasicMaterial color={COLORS.fabricGold || '#D4A040'} />
  </mesh>
);

export const LanternString: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 2.5, 0]} rotation={[0, 0, 1.57]}>
      <cylinderGeometry args={[0.02, 0.02, 3]} />
      <meshBasicMaterial color="#000" />
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
    <mesh position={[0, 2, 0]} castShadow>
      <boxGeometry args={[4, 4, 4]} />
      <meshLambertMaterial color={COLORS.stone} />
    </mesh>
    <mesh position={[0, 4.5, 0]}>
      <sphereGeometry args={[2]} />
      <meshBasicMaterial color="#F5F5DC" />
    </mesh>
    <mesh position={[3, 4, 3]} castShadow>
      <cylinderGeometry args={[0.5, 0.8, 8]} />
      <meshLambertMaterial color={COLORS.stone} />
    </mesh>
    <mesh position={[3, 8.5, 3]}>
      <coneGeometry args={[0.6, 1.5, 6]} />
      <meshBasicMaterial color="#FFD700" />
    </mesh>
  </group>
);

export const CelebrationDrum: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} rotation={[1.57, 0, 0]} castShadow>
    <cylinderGeometry args={[0.5, 0.5, 0.5]} />
    <meshBasicMaterial color="#8B4513" />
  </mesh>
);

export const FlowerGarland: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]} rotation={[1.57, 0, 0]}>
    <torusGeometry args={[0.5, 0.1]} />
    <meshBasicMaterial color="#FF69B4" />
  </mesh>
);

// =====================================================
// BEAUTIFUL NPCs - Culturally Accurate 1500 CE UAE
// =====================================================

// --- ENCOURAGEMENT MESSAGES for NPCs ---
const ENCOURAGEMENT_MESSAGES = [
  { en: "Mashallah!", ar: "!ماشاء الله" },
  { en: "You can do it!", ar: "!يمكنك فعلها" },
  { en: "Keep going!", ar: "!واصل" },
  { en: "Well done!", ar: "!أحسنت" },
  { en: "Allah is with you!", ar: "!الله معك" },
  { en: "Don't give up!", ar: "!لا تستسلم" },
  { en: "Run, my son!", ar: "!اركض يا بني" },
  { en: "You're close!", ar: "!أنت قريب" },
  { en: "Blessings upon you!", ar: "!البركة فيك" },
  { en: "Stay strong!", ar: "!ابق قوياً" },
  { en: "Almost there!", ar: "!اقتربت" },
  { en: "Go Rashid!", ar: "!هيا راشد" },
  { en: "You're doing great!", ar: "!ممتاز" },
  { en: "Swift as a falcon!", ar: "!سريع كالصقر" },
  { en: "May Allah guide you!", ar: "!هداك الله" },
];

// --- UNIFIED EMIRATI MAN - Beautiful 1500 CE Attire ---
export const EmiratiMan: React.FC<{ 
  position: [number, number, number], 
  variant?: 'villager' | 'trader' | 'elder' | 'fisherman' | 'captain' | 'worker' | 'bedouin' | 'farmer',
  playerNear?: boolean 
}> = ({ position, variant = 'villager', playerNear = false }) => {
  const groupRef = useRef<Group>(null);
  const armsRef = useRef<Group>(null);
  const rightArmRef = useRef<Mesh>(null);
  const [message, setMessage] = useState<{en: string, ar: string} | null>(null);
  const [hasWaved, setHasWaved] = useState(false);
  
  useEffect(() => {
    if (playerNear && !hasWaved) {
      const randomMsg = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
      setMessage(randomMsg);
      setHasWaved(true);
      setTimeout(() => setMessage(null), 2500);
    }
  }, [playerNear, hasWaved]);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.015;
    }
    if (armsRef.current && !playerNear) {
      armsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.2) * 0.08;
    }
    if (rightArmRef.current && playerNear) {
      rightArmRef.current.rotation.z = -2.2 + Math.sin(clock.getElapsedTime() * 6) * 0.4;
    }
  });

  // Variant-specific colors and details
  const getVariantStyle = () => {
    switch(variant) {
      case 'trader':
        return { robeColor: '#F5F5DC', hasBisht: true, bishtColor: '#4A2C2A', hasBeard: true, beardColor: '#2a1a0a', headwear: 'ghutra' };
      case 'elder':
        return { robeColor: '#FFFAF0', hasBisht: true, bishtColor: '#1a1a1a', hasBeard: true, beardColor: '#888', headwear: 'ghutra', hasStaff: true };
      case 'fisherman':
        return { robeColor: '#E8DCC8', hasBisht: false, hasBeard: false, headwear: 'simple', shortRobe: true };
      case 'captain':
        return { robeColor: '#F0E6D3', hasBisht: true, bishtColor: '#2F1B10', hasBeard: true, beardColor: '#333', headwear: 'turban' };
      case 'worker':
        return { robeColor: '#D4C4A8', hasBisht: false, hasBeard: false, headwear: 'none', bareArms: true };
      case 'bedouin':
        return { robeColor: '#C2A676', hasBisht: false, hasBeard: true, beardColor: '#333', headwear: 'keffiyeh' };
      case 'farmer':
        return { robeColor: '#E0D5C0', hasBisht: false, hasBeard: false, headwear: 'simple', rolledSleeves: true };
      default: // villager
        return { robeColor: COLORS.clothWhite, hasBisht: false, hasBeard: false, headwear: 'ghutra' };
    }
  };

  const style = getVariantStyle();
  const robeHeight = style.shortRobe ? 1.4 : 1.8;

  return (
    <group ref={groupRef} position={position}>
      {/* Speech Bubble */}
      {message && (
        <group position={[0, 2.6, 0]}>
          <mesh>
            <planeGeometry args={[1.8, 0.5]} />
            <meshBasicMaterial color="#FFF" />
          </mesh>
          <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.12, 0.2, 3]} />
            <meshBasicMaterial color="#FFF" />
          </mesh>
        </group>
      )}
      
      {/* Kandura/Thobe (Main Robe) */}
      <mesh position={[0, robeHeight/2 + 0.1, 0]}>
        <cylinderGeometry args={[0.25, style.shortRobe ? 0.35 : 0.45, robeHeight, 12]} />
        <meshBasicMaterial color={style.robeColor} />
      </mesh>
      
      {/* Kandura collar detail */}
      <mesh position={[0, robeHeight - 0.05, 0.12]}>
        <boxGeometry args={[0.12, 0.08, 0.02]} />
        <meshBasicMaterial color="#DDD" />
      </mesh>
      
      {/* Bisht (Ceremonial Cloak) - for traders, elders, captains */}
      {style.hasBisht && (
        <group>
          {/* Cloak body */}
          <mesh position={[0, robeHeight/2 + 0.15, -0.05]}>
            <boxGeometry args={[0.7, robeHeight - 0.2, 0.08]} />
            <meshBasicMaterial color={style.bishtColor} />
          </mesh>
          {/* Gold trim */}
          <mesh position={[0, robeHeight/2 + 0.15, 0.0]}>
            <boxGeometry args={[0.72, robeHeight - 0.15, 0.01]} />
            <meshBasicMaterial color="#D4AF37" />
          </mesh>
        </group>
      )}
      
      {/* Head */}
      <mesh position={[0, robeHeight + 0.25, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshLambertMaterial color={COLORS.skin} />
      </mesh>
      
      {/* Face details - Eyes */}
      <mesh position={[-0.06, robeHeight + 0.28, 0.14]}>
        <sphereGeometry args={[0.025]} />
        <meshBasicMaterial color="#2a1a0a" />
      </mesh>
      <mesh position={[0.06, robeHeight + 0.28, 0.14]}>
        <sphereGeometry args={[0.025]} />
        <meshBasicMaterial color="#2a1a0a" />
      </mesh>
      
      {/* Eyebrows */}
      <mesh position={[-0.06, robeHeight + 0.32, 0.14]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.05, 0.01, 0.01]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh position={[0.06, robeHeight + 0.32, 0.14]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.05, 0.01, 0.01]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, robeHeight + 0.24, 0.16]}>
        <boxGeometry args={[0.03, 0.06, 0.03]} />
        <meshBasicMaterial color={COLORS.skin} />
      </mesh>
      
      {/* Smile when player near */}
      {playerNear && (
        <mesh position={[0, robeHeight + 0.18, 0.15]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.04, 0.01, 8, 8, Math.PI]} />
          <meshBasicMaterial color="#6B4423" />
        </mesh>
      )}
      
      {/* Beard */}
      {style.hasBeard && (
        <mesh position={[0, robeHeight + 0.12, 0.08]}>
          <boxGeometry args={[0.14, 0.18, 0.1]} />
          <meshBasicMaterial color={style.beardColor || '#333'} />
        </mesh>
      )}
      
      {/* HEADWEAR OPTIONS */}
      {style.headwear === 'ghutra' && (
        <>
          {/* Ghutra (White Headscarf) */}
          <mesh position={[0, robeHeight + 0.38, 0]}>
            <sphereGeometry args={[0.22, 8, 8, 0, Math.PI * 2, 0, 1.5]} />
            <meshBasicMaterial color={variant === 'trader' ? "#F5F5DC" : COLORS.clothWhite} />
          </mesh>
          {/* Agal (Black Ring) */}
          <mesh position={[0, robeHeight + 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.025, 6, 16]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          {/* Ghutra drape */}
          <mesh position={[0, robeHeight + 0.1, -0.12]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.22, 0.35, 0.04]} />
            <meshBasicMaterial color={variant === 'trader' ? "#F5F5DC" : COLORS.clothWhite} />
          </mesh>
        </>
      )}
      
      {style.headwear === 'turban' && (
        <mesh position={[0, robeHeight + 0.4, 0]}>
          <sphereGeometry args={[0.22, 6, 6]} />
          <meshBasicMaterial color="#F5F5DC" />
        </mesh>
      )}
      
      {style.headwear === 'keffiyeh' && (
        <>
          <mesh position={[0, robeHeight + 0.35, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#C2A676" />
          </mesh>
          {/* Black agal */}
          <mesh position={[0, robeHeight + 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.02, 6, 12]} />
            <meshBasicMaterial color="#222" />
          </mesh>
        </>
      )}
      
      {style.headwear === 'simple' && (
        <mesh position={[0, robeHeight + 0.32, 0]}>
          <sphereGeometry args={[0.15, 6, 6, 0, Math.PI * 2, 0, 1.2]} />
          <meshBasicMaterial color="#D4C4A8" />
        </mesh>
      )}
      
      {/* Arms */}
      <group ref={armsRef} position={[0, robeHeight - 0.4, 0]}>
        {/* Left Arm */}
        <mesh position={[-0.28, 0, 0.08]} rotation={[0.15, 0, 0.25]}>
          <cylinderGeometry args={[0.05, 0.045, 0.45]} />
          <meshBasicMaterial color={style.bareArms ? COLORS.skin : style.robeColor} />
        </mesh>
        <mesh position={[-0.32, -0.22, 0.12]}>
          <sphereGeometry args={[0.055]} />
          <meshBasicMaterial color={COLORS.skin} />
        </mesh>
        
        {/* Right Arm (waves when near) */}
        <mesh ref={rightArmRef} position={[0.28, 0, 0.08]} rotation={[0.15, 0, -0.25]}>
          <cylinderGeometry args={[0.05, 0.045, 0.45]} />
          <meshBasicMaterial color={style.bareArms ? COLORS.skin : style.robeColor} />
        </mesh>
        <mesh position={[0.32, -0.22, 0.12]}>
          <sphereGeometry args={[0.055]} />
          <meshBasicMaterial color={COLORS.skin} />
        </mesh>
      </group>
      
      {/* Staff for elders */}
      {style.hasStaff && (
        <mesh position={[0.4, 0.9, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.03, 0.04, 1.8]} />
          <meshBasicMaterial color="#5D4037" />
        </mesh>
      )}
      
      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshBasicMaterial color="#000" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};

// --- EMIRATI CHILD - Smaller, simpler attire ---
export const EmiratiChild: React.FC<{ 
  position: [number, number, number], 
  gender?: 'boy' | 'girl',
  isRunning?: boolean 
}> = ({ position, gender = 'boy', isRunning = false }) => {
  const groupRef = useRef<Group>(null);
  const legsRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (isRunning) {
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(clock.getElapsedTime() * 8)) * 0.1;
      } else {
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      }
    }
    if (legsRef.current && isRunning) {
      legsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 10) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.6}>
      {/* Small Kandura/Dress */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.2, 8]} />
        <meshBasicMaterial color={gender === 'boy' ? COLORS.clothWhite : "#FFB6C1"} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshBasicMaterial color={COLORS.skin} />
      </mesh>
      
      {/* Hair */}
      {gender === 'boy' ? (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.14, 6, 6, 0, Math.PI * 2, 0, 1.2]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ) : (
        <>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.16, 6, 6]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          {/* Braids */}
          {[-0.12, 0.12].map((x, i) => (
            <mesh key={i} position={[x, 1.2, -0.05]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </>
      )}
      
      {/* Eyes */}
      <mesh position={[-0.05, 1.42, 0.14]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#2a1a0a" />
      </mesh>
      <mesh position={[0.05, 1.42, 0.14]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#2a1a0a" />
      </mesh>
      
      {/* Happy smile */}
      <mesh position={[0, 1.32, 0.15]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.04, 0.01, 6, 8, Math.PI]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>
      
      {/* Arms */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.9, 0.05]} rotation={[0.2, 0, x > 0 ? -0.3 : 0.3]}>
            <cylinderGeometry args={[0.04, 0.035, 0.35]} />
            <meshBasicMaterial color={gender === 'boy' ? COLORS.clothWhite : "#FFB6C1"} />
          </mesh>
          <mesh position={[x * 1.1, 0.72, 0.08]}>
            <sphereGeometry args={[0.04]} />
            <meshBasicMaterial color={COLORS.skin} />
          </mesh>
        </group>
      ))}
      
      {/* Legs */}
      <group ref={legsRef}>
        {[-0.08, 0.08].map((x, i) => (
          <mesh key={i} position={[x, 0.15, 0]}>
            <cylinderGeometry args={[0.05, 0.04, 0.3]} />
            <meshBasicMaterial color={COLORS.skin} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// --- Woman in Full Hijab and Abaya (Waves when player passes) ---
// Fixed: Proper rounded head with niqab (only eyes visible)
export const HijabWoman: React.FC<{ position: [number, number, number], playerNear?: boolean }> = ({ position, playerNear = false }) => {
  const groupRef = useRef<Group>(null);
  const rightArmRef = useRef<Mesh>(null);
  const [message, setMessage] = useState<{en: string, ar: string} | null>(null);
  const [hasWaved, setHasWaved] = useState(false);
  
  useEffect(() => {
    if (playerNear && !hasWaved) {
      // Pick random encouragement
      const randomMsg = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
      setMessage(randomMsg);
      setHasWaved(true);
      // Hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  }, [playerNear, hasWaved]);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle swaying
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
    // Waving animation when player is near
    if (rightArmRef.current) {
      if (playerNear) {
        // Wave up and down
        const wave = Math.sin(clock.getElapsedTime() * 8) * 0.5;
        rightArmRef.current.rotation.z = -2.5 + wave;
        rightArmRef.current.rotation.x = -0.3;
      } else {
        // Arm at rest (folded position)
        rightArmRef.current.rotation.z = 0;
        rightArmRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Speech Bubble with Encouragement - Dark themed to match abaya */}
      {message && (
        <group position={[0, 2.5, 0]}>
          {/* Bubble background - dark with gold border appearance */}
          <mesh>
            <planeGeometry args={[2, 0.6]} />
            <meshBasicMaterial color="#2a2420" />
          </mesh>
          {/* Bubble tail - hidden, no pointed cone */}
        </group>
      )}
      
      {/* Abaya (Full Black Flowing Robe) */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.35, 0.55, 1.8, 12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Head and Niqab (Face covering with only eyes visible) */}
      <group position={[0, 1.85, 0]}>
        {/* Base Head - Proper rounded sphere, not pointed */}
        <mesh>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Hijab/Niqab cloth wrapping - covers entire head */}
        <mesh position={[0, 0.02, 0]} scale={[1.05, 1.1, 1.05]}>
          <sphereGeometry args={[0.2, 10, 10]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        
        {/* Eye slit opening - horizontal band where eyes show */}
        <mesh position={[0, 0.02, 0.18]}>
          <boxGeometry args={[0.18, 0.05, 0.02]} />
          <meshBasicMaterial color={COLORS.skin} />
        </mesh>
        
        {/* Beautiful Eyes - Only feature visible */}
        <mesh position={[-0.045, 0.02, 0.195]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshBasicMaterial color="#2a1a0a" />
        </mesh>
        <mesh position={[0.045, 0.02, 0.195]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshBasicMaterial color="#2a1a0a" />
        </mesh>
        
        {/* Eye whites (slight) */}
        <mesh position={[-0.045, 0.02, 0.19]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#FFF" />
        </mesh>
        <mesh position={[0.045, 0.02, 0.19]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#FFF" />
        </mesh>
        
        {/* Eyelashes / Eye expression lines */}
        <mesh position={[-0.045, 0.035, 0.19]} rotation={[0.3, 0, 0.1]}>
          <boxGeometry args={[0.03, 0.003, 0.003]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.045, 0.035, 0.19]} rotation={[0.3, 0, -0.1]}>
          <boxGeometry args={[0.03, 0.003, 0.003]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Smiling eyes when player near (eyes crinkle) */}
        {playerNear && (
          <>
            <mesh position={[-0.045, 0.04, 0.195]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.02, 0.005, 0.005]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.045, 0.04, 0.195]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.02, 0.005, 0.005]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          </>
        )}
        
        {/* Hijab drape flowing down to shoulders */}
        <mesh position={[0, -0.25, 0]}>
          <coneGeometry args={[0.4, 0.6, 10]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Extra cloth layer for depth */}
        <mesh position={[0, -0.12, -0.08]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.35, 0.35, 0.05]} />
          <meshBasicMaterial color="#111" />
        </mesh>
      </group>
      
      {/* Left Arm (at rest, folded elegantly) */}
      <mesh position={[-0.3, 1.15, 0.08]} rotation={[0.3, 0, 0.4]}>
        <cylinderGeometry args={[0.055, 0.045, 0.5]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.35, 0.9, 0.12]}>
        <sphereGeometry args={[0.055]} />
        <meshBasicMaterial color={COLORS.skin} />
      </mesh>
      
      {/* Right Arm (waves when near) */}
      <mesh ref={rightArmRef} position={[0.3, 1.15, 0.08]} rotation={[0.3, 0, -0.4]}>
        <cylinderGeometry args={[0.055, 0.045, 0.5]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.35, 0.9, 0.12]}>
        <sphereGeometry args={[0.055]} />
        <meshBasicMaterial color={COLORS.skin} />
      </mesh>
      
      {/* Shadow on ground */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 16]} />
        <meshBasicMaterial color="#000" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};

// --- Man in Kandura (Traditional White Robe) - Beautiful Version ---
export const KanduraMan: React.FC<{ position: [number, number, number], isTrader?: boolean }> = ({ position, isTrader = false }) => {
  const groupRef = useRef<Group>(null);
  const armsRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle breathing animation
      groupRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.02;
    }
    if (armsRef.current) {
      // Gentle arm movement
      armsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Kandura (White Dishdasha) */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 1.8, 10]} />
        <meshBasicMaterial color={COLORS.clothWhite} />
      </mesh>
      
      {/* Kandura collar detail */}
      <mesh position={[0, 1.6, 0.15]}>
        <planeGeometry args={[0.15, 0.3]} />
        <meshBasicMaterial color="#ddd" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshLambertMaterial color={COLORS.skin} />
      </mesh>
      
      {/* Ghutra (White Headscarf) */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.22, 8, 8, 0, Math.PI * 2, 0, 1.5]} />
        <meshBasicMaterial color={isTrader ? "#F5F5DC" : COLORS.clothWhite} />
      </mesh>
      
      {/* Agal (Black Ring) */}
      <mesh position={[0, 1.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.025, 6, 16]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      
      {/* Ghutra tail/drape */}
      <mesh position={[0, 1.6, -0.15]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.25, 0.4, 0.05]} />
        <meshBasicMaterial color={isTrader ? "#F5F5DC" : COLORS.clothWhite} />
      </mesh>
      
      {/* Arms */}
      <group ref={armsRef} position={[0, 1.3, 0]}>
        {[-0.32, 0.32].map((x, i) => (
          <mesh key={i} position={[x, -0.2, 0]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
            <cylinderGeometry args={[0.06, 0.05, 0.5]} />
            <meshBasicMaterial color={COLORS.clothWhite} />
          </mesh>
        ))}
        {/* Hands */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={i} position={[x, -0.45, 0]}>
            <sphereGeometry args={[0.06]} />
            <meshBasicMaterial color={COLORS.skin} />
          </mesh>
        ))}
      </group>
      
      {/* Beard (if trader) */}
      {isTrader && (
        <mesh position={[0, 1.65, 0.1]}>
          <boxGeometry args={[0.12, 0.15, 0.08]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      )}
      
      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshBasicMaterial color="#000" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};

// =====================================================
// AUTHENTIC 1500 CE BOATS
// =====================================================

// --- Jalboot (Small Pearl Diving Boat) ---
export const Jalboot: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const boatRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (boatRef.current) {
      // Gentle bobbing
      boatRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 1) * 0.1;
      boatRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.7) * 0.02;
    }
  });

  return (
    <group ref={boatRef} position={position}>
      {/* Hull - Traditional shape */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.8, 1, 6]} />
        <meshBasicMaterial color="#5D4037" />
      </mesh>
      
      {/* Curved bow */}
      <mesh position={[0, 0.7, 3.2]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.9, 1.5, 4]} />
        <meshBasicMaterial color="#5D4037" />
      </mesh>
      
      {/* Stern */}
      <mesh position={[0, 0.8, -3]}>
        <boxGeometry args={[1.6, 0.8, 0.2]} />
        <meshBasicMaterial color="#4E342E" />
      </mesh>
      
      {/* Deck */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.6, 0.1, 5.5]} />
        <meshBasicMaterial color="#8D6E63" />
      </mesh>
      
      {/* Small mast */}
      <mesh position={[0, 2.5, 0.5]}>
        <cylinderGeometry args={[0.06, 0.08, 3.5]} />
        <meshBasicMaterial color="#4E342E" />
      </mesh>
      
      {/* Coconut rope stitching detail (dark lines) */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0]}>
          <boxGeometry args={[0.02, 0.8, 5.5]} />
          <meshBasicMaterial color="#3E2723" />
        </mesh>
      ))}
      
      {/* Diving rope coiled on deck */}
      <mesh position={[0.5, 1.15, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.05, 8, 12]} />
        <meshBasicMaterial color={COLORS.rope} />
      </mesh>
    </group>
  );
};

// --- Sambuk (Large Trading Vessel) ---
export const Sambuk: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const boatRef = useRef<Group>(null);
  const sailRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (boatRef.current) {
      boatRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.6) * 0.15;
      boatRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.4) * 0.015;
    }
    if (sailRef.current) {
      sailRef.current.scale.x = 1 + Math.sin(clock.getElapsedTime() * 1.2) * 0.05;
    }
  });

  return (
    <group ref={boatRef} position={position} rotation={[0, Math.PI, 0]}>
      {/* Large Hull */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[3, 2, 10]} />
        <meshBasicMaterial color="#4E342E" />
      </mesh>
      
      {/* Distinctive curved stern (Sambuk characteristic) */}
      <mesh position={[0, 2, -5.5]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[2.8, 2, 1.5]} />
        <meshBasicMaterial color="#5D4037" />
      </mesh>
      
      {/* Stern decoration */}
      <mesh position={[0, 3, -5.8]}>
        <boxGeometry args={[2.5, 1.2, 0.3]} />
        <meshBasicMaterial color="#6D4C41" />
      </mesh>
      
      {/* Bow */}
      <mesh position={[0, 1.2, 5.8]} rotation={[0.35, 0, 0]}>
        <coneGeometry args={[1.5, 2.5, 4]} />
        <meshBasicMaterial color="#4E342E" />
      </mesh>
      
      {/* Deck */}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[2.8, 0.15, 9]} />
        <meshBasicMaterial color="#8D6E63" />
      </mesh>
      
      {/* Main Mast */}
      <mesh position={[0, 6, 1]}>
        <cylinderGeometry args={[0.12, 0.18, 9]} />
        <meshBasicMaterial color="#4E342E" />
      </mesh>
      
      {/* Lateen Sail */}
      <group position={[0, 6, 1]} rotation={[0.1, 0, 0]}>
        <mesh rotation={[0, 0, 0.35]} position={[0, 2, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 8]} />
          <meshBasicMaterial color="#4E342E" />
        </mesh>
        <mesh ref={sailRef} position={[2, 1.5, 0.5]} rotation={[0.1, 0, 0.35]}>
          <planeGeometry args={[6, 7, 4, 4]} />
          <meshBasicMaterial color="#F5F5DC" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* Cargo on deck */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 2.5, -2]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshBasicMaterial color={i === 0 ? COLORS.pottery : COLORS.woodLight} />
        </mesh>
      ))}
    </group>
  );
};

// =====================================================
// UNDERWATER OBSTACLES - Act 3 Swimming
// =====================================================

// --- Coral Reef ---
export const CoralReef: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const coralRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (coralRef.current) {
      // Gentle underwater sway
      coralRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.03;
    }
  });

  return (
    <group ref={coralRef} position={position}>
      {/* Main coral branches */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i} 
          position={[Math.sin(i * 1.2) * 0.8, 0.5 + i * 0.2, Math.cos(i * 1.2) * 0.8]}
          rotation={[i * 0.15, i * 0.5, 0]}
        >
          <cylinderGeometry args={[0.08, 0.15, 0.8 + i * 0.1, 6]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#FF6B6B' : '#FF8E8E'} />
        </mesh>
      ))}
      {/* Coral base */}
      <mesh position={[0, 0.2, 0]}>
        <dodecahedronGeometry args={[0.5]} />
        <meshBasicMaterial color="#CD5C5C" />
      </mesh>
    </group>
  );
};

// --- Jellyfish (Floating, translucent) ---
export const Jellyfish: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const jellyRef = useRef<Group>(null);
  const tentaclesRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (jellyRef.current) {
      // Pulsing movement
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.1;
      jellyRef.current.scale.set(1 + pulse, 1 - pulse * 0.5, 1 + pulse);
      jellyRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
    }
    if (tentaclesRef.current) {
      tentaclesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.5) * 0.2;
    }
  });

  return (
    <group position={position}>
      <group ref={jellyRef}>
        {/* Bell (dome) */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial 
            color="#E6E6FA" 
            transparent 
            opacity={0.6}
          />
        </mesh>
        
        {/* Inner glow */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial color="#DDA0DD" transparent opacity={0.5} />
        </mesh>
        
        {/* Tentacles */}
        <group ref={tentaclesRef} position={[0, 0, 0]}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh 
              key={i} 
              position={[Math.sin(i * 1.05) * 0.3, -0.5, Math.cos(i * 1.05) * 0.3]}
              rotation={[0.3, 0, 0]}
            >
              <cylinderGeometry args={[0.02, 0.01, 1.2, 4]} />
              <meshBasicMaterial color="#DDA0DD" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// --- Sea Turtle ---
export const SeaTurtle: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const turtleRef = useRef<Group>(null);
  const flipperLRef = useRef<Mesh>(null);
  const flipperRRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (turtleRef.current) {
      // Swimming motion
      turtleRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.15;
      turtleRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
    if (flipperLRef.current && flipperRRef.current) {
      const flipAngle = Math.sin(clock.getElapsedTime() * 3) * 0.4;
      flipperLRef.current.rotation.z = flipAngle;
      flipperRRef.current.rotation.z = -flipAngle;
    }
  });

  return (
    <group ref={turtleRef} position={position}>
      {/* Shell */}
      <mesh position={[0, 0.3, 0]} scale={[1.2, 0.6, 1.5]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#228B22" />
      </mesh>
      
      {/* Shell pattern */}
      <mesh position={[0, 0.5, 0]} scale={[1.1, 0.3, 1.4]}>
        <sphereGeometry args={[0.5, 6, 6]} />
        <meshBasicMaterial color="#2E8B57" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.3, 0.8]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#3CB371" />
      </mesh>
      
      {/* Flippers */}
      <mesh ref={flipperLRef} position={[-0.6, 0.2, 0.3]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshBasicMaterial color="#3CB371" />
      </mesh>
      <mesh ref={flipperRRef} position={[0.6, 0.2, 0.3]} rotation={[0, -0.5, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshBasicMaterial color="#3CB371" />
      </mesh>
      
      {/* Back flippers */}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.15, -0.6]}>
          <boxGeometry args={[0.2, 0.03, 0.25]} />
          <meshBasicMaterial color="#3CB371" />
        </mesh>
      ))}
    </group>
  );
};

// --- Stingray ---
export const Stingray: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const rayRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (rayRef.current) {
      // Gliding motion
      rayRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.1;
      rayRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.6) * 0.1;
    }
  });

  return (
    <group ref={rayRef} position={position}>
      {/* Body (flat diamond) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1.5, 0.2]}>
        <circleGeometry args={[0.8, 4]} />
        <meshBasicMaterial color="#696969" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Tail */}
      <mesh position={[0, 0.05, -1]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.01, 1.5, 4]} />
        <meshBasicMaterial color="#555" />
      </mesh>
      
      {/* Eyes */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0.3]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
};

// --- Oyster Bed ---
export const OysterBed: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const oysterPositions = useMemo(() => 
    [0, 1, 2, 3, 4, 5].map((i) => ({
      pos: [(i % 3 - 1) * 0.5, 0.1, Math.floor(i / 3) * 0.4 - 0.2] as [number, number, number],
      rot: [i * 0.25, i * 0.5, 0] as [number, number, number]
    })), 
  []);
  
  return (
    <group position={position}>
      {oysterPositions.map((o, i) => (
        <mesh key={i} position={o.pos} rotation={o.rot}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshBasicMaterial color="#8B8B83" />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial color="#C2B280" />
      </mesh>
    </group>
  );
};

// --- Tall Seaweed ---
export const SeaweedTall: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const weedRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (weedRef.current) {
      weedRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.5 + position[0]) * 0.15;
      weedRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.2) * 0.1;
    }
  });

  return (
    <group ref={weedRef} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.3 - 0.3, 1, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 2 + i * 0.3, 6]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#2F4F2F' : '#3D5C3D'} />
        </mesh>
      ))}
    </group>
  );
};

// --- Underwater Rock ---
export const RockUnderwater: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={[position[0], 0.5, position[2]]}>
    <dodecahedronGeometry args={[0.8]} />
    <meshBasicMaterial color="#4A4A4A" />
  </mesh>
);

// --- Gulf Fish: Hamour (Grouper) ---
export const HamourFish: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const fishRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (fishRef.current) {
      fishRef.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * 2) * 0.3;
      fishRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 3) * 0.1;
    }
  });

  return (
    <group ref={fishRef} position={position}>
      {/* Body */}
      <mesh scale={[1.2, 0.8, 0.5]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>
      {/* Spots */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.1 * i - 0.1, 0.1, 0.26]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.3, 0.4, 4]} />
        <meshBasicMaterial color="#A0522D" />
      </mesh>
      {/* Eye */}
      <mesh position={[0.35, 0.1, 0.2]}>
        <sphereGeometry args={[0.06]} />
        <meshBasicMaterial color="#111" />
      </mesh>
    </group>
  );
};

// --- Gulf Fish: Safi (Rabbitfish) ---
export const SafiFish: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const fishRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (fishRef.current) {
      fishRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 3 + position[0]) * 0.15;
    }
  });

  return (
    <group ref={fishRef} position={position}>
      <mesh scale={[1, 0.6, 0.3]}>
        <sphereGeometry args={[0.4, 10, 10]} />
        <meshBasicMaterial color="#4682B4" />
      </mesh>
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.3, 4]} />
        <meshBasicMaterial color="#5F9EA0" />
      </mesh>
    </group>
  );
};

// --- Gulf Fish: Shaari (Spangled Emperor) ---
export const ShaariFish: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const fishRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (fishRef.current) {
      fishRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 2.5) * 0.15;
    }
  });

  return (
    <group ref={fishRef} position={position}>
      <mesh scale={[1.1, 0.7, 0.4]}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshBasicMaterial color="#DAA520" />
      </mesh>
      {/* Golden scales shimmer */}
      <mesh scale={[1.05, 0.65, 0.35]}>
        <sphereGeometry args={[0.45, 8, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.35, 4]} />
        <meshBasicMaterial color="#B8860B" />
      </mesh>
    </group>
  );
};

// --- Anchor Chain (Hanging from surface) ---
export const AnchorChain: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <mesh key={i} position={[0, 3 - i * 0.4, 0]} rotation={[Math.PI / 2, 0, i % 2 === 0 ? 0 : Math.PI / 2]}>
        <torusGeometry args={[0.12, 0.04, 6, 8]} />
        <meshBasicMaterial color="#2F2F2F" />
      </mesh>
    ))}
  </group>
);

// --- Diving Rope (From surface) ---
export const DivingRopeObstacle: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const ropeRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ropeRef.current) {
      ropeRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.8) * 0.1;
    }
  });

  return (
    <mesh ref={ropeRef} position={[position[0], 2.5, position[2]]}>
      <cylinderGeometry args={[0.03, 0.03, 5]} />
      <meshBasicMaterial color={COLORS.rope} />
    </mesh>
  );
};

// --- Fish Drying Rack (Harbor) ---
export const FishDryingRack: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Frame */}
    {[-1, 1].map((x, i) => (
      <mesh key={i} position={[x, 1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2.5]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
    ))}
    {/* Cross beams */}
    {[0.5, 1, 1.5, 2].map((y, i) => (
      <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 2.2]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
    ))}
    {/* Hanging fish */}
    {[-0.5, 0, 0.5].map((x, i) => (
      <mesh key={i} position={[x, 1.3, 0.1]} rotation={[0, 0, Math.PI / 4]}>
        <capsuleGeometry args={[0.08, 0.25, 4, 6]} />
        <meshBasicMaterial color="#A0826D" />
      </mesh>
    ))}
  </group>
);

// --- Pearl Basket (Harbor) ---
export const PearlBasket: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.5, 0.35, 0.8, 12]} />
      <meshBasicMaterial color="#CD853F" />
    </mesh>
    {/* Pearls inside */}
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0.1 * i - 0.1, 0.7, 0.1]}>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color={COLORS.pearl} />
      </mesh>
    ))}
  </group>
);

// --- Mooring Post (Harbor) ---
export const MooringPost: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 2]} />
      <meshBasicMaterial color="#3E2723" />
    </mesh>
    {/* Rope wrapped around */}
    <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.2, 0.04, 6, 12]} />
      <meshBasicMaterial color={COLORS.rope} />
    </mesh>
  </group>
);

// --- Cargo Sacks (Harbor) ---
export const CargoSacks: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {[[-0.3, 0], [0.3, 0], [0, 0.5]].map(([x, y], i) => (
      <mesh key={i} position={[x, 0.4 + y, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color={i === 2 ? "#A0826D" : "#C2A676"} />
      </mesh>
    ))}
  </group>
);

// =====================================================
// ACT 4: THE CARAVAN TRAIL - Desert Crossing 1500 CE UAE
// =====================================================

// --- Bedouin Tent (Beit Al Sha'ar - Black Goat-Hair Tent) ---
export const BedouinTent: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const fabricRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (fabricRef.current) {
      // Gentle wind movement
      fabricRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });

  return (
    <group position={position}>
      {/* Main tent structure - Traditional low rectangular shape */}
      <mesh ref={fabricRef} position={[0, 1.2, 0]}>
        <boxGeometry args={[4, 0.15, 3.5]} />
        <meshBasicMaterial color={COLORS.tentFabric || '#3A2820'} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Tent peak (slightly raised center) */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshBasicMaterial color={COLORS.tentFabric || '#3A2820'} />
      </mesh>
      
      {/* Support poles */}
      {[[-1.5, 0], [1.5, 0], [0, -1.2], [0, 1.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.7, z]}>
          <cylinderGeometry args={[0.06, 0.08, 1.6]} />
          <meshBasicMaterial color="#5D4037" />
        </mesh>
      ))}
      
      {/* Side drapes */}
      <mesh position={[2, 0.6, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.1, 1.2, 3]} />
        <meshBasicMaterial color={COLORS.tentBrown || '#5A4830'} />
      </mesh>
      <mesh position={[-2, 0.6, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.1, 1.2, 3]} />
        <meshBasicMaterial color={COLORS.tentBrown || '#5A4830'} />
      </mesh>
      
      {/* Rope ties */}
      {[[2.5, 0.1, -1.5], [2.5, 0.1, 1.5], [-2.5, 0.1, -1.5], [-2.5, 0.1, 1.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, i < 2 ? 0.5 : -0.5, Math.PI / 4]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5]} />
          <meshBasicMaterial color={COLORS.rope} />
        </mesh>
      ))}
      
      {/* Ground carpet */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshBasicMaterial color={COLORS.tentBrown || '#5A4830'} />
      </mesh>
      
      {/* Decorative pattern on carpet */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 2]} />
        <meshBasicMaterial color="#CD853F" />
      </mesh>
    </group>
  );
};

// --- Camel Caravan (Multiple loaded camels) ---
export const CamelCaravan: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const caravanRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (caravanRef.current) {
      // Subtle swaying motion
      caravanRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.03;
    }
  });

  const SingleLoadedCamel: React.FC<{ offset: number }> = ({ offset }) => (
    <group position={[0, 0, offset]}>
      {/* Camel body */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[1.2, 1.0, 2.2]} />
        <meshBasicMaterial color="#C19A6B" />
      </mesh>
      {/* Hump */}
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#C19A6B" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 2.0, 1.4]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.2]} />
        <meshBasicMaterial color="#C19A6B" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.6, 1.8]}>
        <boxGeometry args={[0.4, 0.5, 0.8]} />
        <meshBasicMaterial color="#C19A6B" />
      </mesh>
      {/* Legs */}
      {[[-0.4, 0.8], [0.4, 0.8], [-0.4, -0.8], [0.4, -0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.7, z]}>
          <cylinderGeometry args={[0.15, 0.12, 1.4]} />
          <meshBasicMaterial color="#A0826D" />
        </mesh>
      ))}
      {/* Trade goods on back - Saddlebags */}
      <mesh position={[0.6, 1.8, 0]}>
        <boxGeometry args={[0.5, 0.6, 1.2]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.6, 1.8, 0]}>
        <boxGeometry args={[0.5, 0.6, 1.2]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>
      {/* Decorative blanket */}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[1.3, 0.08, 1.8]} />
        <meshBasicMaterial color={COLORS.spiceWarm || '#B88040'} />
      </mesh>
      {/* Lead rope */}
      <mesh position={[0, 2.3, 2.3]} rotation={[0.8, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.5]} />
        <meshBasicMaterial color={COLORS.rope} />
      </mesh>
    </group>
  );

  return (
    <group ref={caravanRef} position={position}>
      <SingleLoadedCamel offset={0} />
      <SingleLoadedCamel offset={-4} />
    </group>
  );
};

// --- Trade Route Marker (Stone Cairn) ---
export const TradeRouteMarker: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Stacked stones - traditional cairn */}
    <mesh position={[0, 0.3, 0]}>
      <dodecahedronGeometry args={[0.5]} />
      <meshBasicMaterial color="#8B7355" />
    </mesh>
    <mesh position={[0.1, 0.8, 0.05]}>
      <dodecahedronGeometry args={[0.35]} />
      <meshBasicMaterial color="#7A6548" />
    </mesh>
    <mesh position={[-0.05, 1.2, 0]}>
      <dodecahedronGeometry args={[0.25]} />
      <meshBasicMaterial color="#6D5A3A" />
    </mesh>
    <mesh position={[0, 1.5, 0.02]}>
      <dodecahedronGeometry args={[0.18]} />
      <meshBasicMaterial color="#8B7355" />
    </mesh>
    {/* Directional indicator at top */}
    <mesh position={[0.15, 1.7, 0]} rotation={[0, 0, 0.5]}>
      <coneGeometry args={[0.08, 0.2, 4]} />
      <meshBasicMaterial color="#5D4E37" />
    </mesh>
  </group>
);

// --- Desert Well (Bir - Stone-lined well) ---
export const DesertWell: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Stone ring */}
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[1, 1.1, 1, 12]} />
      <meshBasicMaterial color="#696969" />
    </mesh>
    {/* Inner well (dark) */}
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.7, 0.7, 0.9, 12]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
    {/* Water glint at bottom */}
    <mesh position={[0, 0.2, 0]}>
      <circleGeometry args={[0.6, 12]} />
      <meshBasicMaterial color="#1A4B6E" />
    </mesh>
    {/* Wooden crossbar */}
    <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 2.4]} />
      <meshBasicMaterial color={COLORS.wood} />
    </mesh>
    {/* Support posts */}
    {[-0.9, 0.9].map((x, i) => (
      <mesh key={i} position={[x, 1, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 1.5]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
    ))}
    {/* Bucket */}
    <mesh position={[0, 0.8, 0.3]}>
      <cylinderGeometry args={[0.15, 0.12, 0.25, 8]} />
      <meshBasicMaterial color={COLORS.woodLight} />
    </mesh>
    {/* Rope */}
    <mesh position={[0, 1.2, 0.2]}>
      <cylinderGeometry args={[0.02, 0.02, 0.8]} />
      <meshBasicMaterial color={COLORS.rope} />
    </mesh>
  </group>
);

// --- Spice Sacks (Frankincense, Saffron trade goods) ---
export const SpiceSacks: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Arrangement of cloth sacks */}
    {([[0, 0, 0, '#C19A6B'], [-0.4, 0, 0.3, '#8B4513'], [0.4, 0, 0.2, '#CD853F'],
      [0.2, 0.4, 0.1, '#DEB887'], [-0.2, 0.4, 0.2, '#D2691E']] as [number, number, number, string][]).map(([x, y, z, color], i) => (
      <mesh key={i} position={[x, 0.25 + y * 0.6, z]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    ))}
    {/* Tied tops */}
    {[[0, 0.4], [-0.4, 0.4], [0.4, 0.35]].map(([x, y], i) => (
      <mesh key={i} position={[x, y, 0.1 + i * 0.05]}>
        <cylinderGeometry args={[0.08, 0.12, 0.15]} />
        <meshBasicMaterial color={COLORS.rope} />
      </mesh>
    ))}
    {/* Spilled spice (golden/amber) */}
    <mesh position={[0.5, 0.02, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.15, 8]} />
      <meshBasicMaterial color="#FFD700" />
    </mesh>
  </group>
);

// --- Arabian Oryx (Iconic desert animal) ---
export const ArabianOryx: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const oryxRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (oryxRef.current) {
      oryxRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={oryxRef} position={position}>
      {/* Body - White/cream colored */}
      <mesh position={[0, 1, 0]} scale={[0.8, 0.7, 1.2]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshBasicMaterial color="#F5F5F5" />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.3, 0.7]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8]} />
        <meshBasicMaterial color="#F5F5F5" />
      </mesh>
      
      {/* Head */}
      <group ref={headRef} position={[0, 1.6, 1]}>
        <mesh>
          <boxGeometry args={[0.25, 0.3, 0.5]} />
          <meshBasicMaterial color="#F5F5F5" />
        </mesh>
        {/* Dark face markings */}
        <mesh position={[0, -0.05, 0.2]}>
          <boxGeometry args={[0.2, 0.1, 0.15]} />
          <meshBasicMaterial color="#2F1B10" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.05, 0.2]}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.2]}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        {/* Long straight horns - Distinctive feature */}
        <mesh position={[-0.08, 0.4, 0]} rotation={[-0.2, 0, -0.1]}>
          <cylinderGeometry args={[0.02, 0.03, 0.9]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.08, 0.4, 0]} rotation={[-0.2, 0, 0.1]}>
          <cylinderGeometry args={[0.02, 0.03, 0.9]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* Dark leg markings */}
      {[[-0.25, 0.4, 0.5], [0.25, 0.4, 0.5], [-0.25, 0.4, -0.5], [0.25, 0.4, -0.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.08, 0.1, 0.8]} />
          <meshBasicMaterial color="#2F1B10" />
        </mesh>
      ))}
      
      {/* Tail */}
      <mesh position={[0, 0.9, -0.9]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.02, 0.4]} />
        <meshBasicMaterial color="#F5F5F5" />
      </mesh>
    </group>
  );
};

// --- Hanging Trade Fabric (Slide under - isTall) ---
export const HangingTradeFabric: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const fabricRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (fabricRef.current) {
      // Wind billowing effect
      fabricRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
      fabricRef.current.position.y = 2.5 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Support poles on sides */}
      {[-3.5, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 3.5]} />
          <meshBasicMaterial color={COLORS.wood} />
        </mesh>
      ))}
      
      {/* Crossbeam */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 7.5]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
      
      {/* Hanging fabric - Multiple colorful pieces */}
      {[[-2, '#4682B4'], [0, COLORS.fabricGold || '#D4A040'], [2, '#DAA520']].map(([x, color], i) => (
        <mesh key={i} ref={i === 1 ? fabricRef : null} position={[x as number, 2.5, 0]}>
          <boxGeometry args={[1.8, 0.8, 0.05]} />
          <meshBasicMaterial color={color as string} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Fringe detail */}
      {[-2, 0, 2].map((x, i) => (
        <mesh key={i} position={[x, 2.05, 0]}>
          <boxGeometry args={[1.6, 0.1, 0.02]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ))}
    </group>
  );
};

// --- Wadi Crossing (Dried stream bed - Jump over) ---
export const WadiCrossing: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Sunken channel */}
    <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 2]} />
      <meshBasicMaterial color="#C2B280" />
    </mesh>
    
    {/* Cracked mud texture */}
    {Array.from({ length: 8 }).map((_, i) => (
      <mesh key={i} position={[(i - 3.5) * 1, -0.1, (i % 2 - 0.5) * 0.8]} rotation={[-Math.PI / 2, 0, i * 0.7 + 0.3]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshBasicMaterial color="#B8A87A" />
      </mesh>
    ))}
    
    {/* Banks on sides */}
    <mesh position={[0, 0.1, 1.2]}>
      <boxGeometry args={[8, 0.4, 0.4]} />
      <meshBasicMaterial color={COLORS.sand} />
    </mesh>
    <mesh position={[0, 0.1, -1.2]}>
      <boxGeometry args={[8, 0.4, 0.4]} />
      <meshBasicMaterial color={COLORS.sand} />
    </mesh>
    
    {/* Scattered pebbles */}
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[(i - 2.5) * 1.2, -0.05, (i % 3 - 1) * 0.5]}>
        <dodecahedronGeometry args={[0.1]} />
        <meshBasicMaterial color="#8B7355" />
      </mesh>
    ))}
  </group>
);

// --- Tent Rope Lines (Slide under - isTall) ---
export const TentRopeLines: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Multiple rope lines at low height */}
    {[-2, 0, 2].map((x, i) => (
      <mesh key={i} position={[x, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 6]} />
        <meshBasicMaterial color={COLORS.rope} />
      </mesh>
    ))}
    
    {/* Stakes in ground */}
    {[[-3, -2], [-3, 2], [3, -2], [3, 2]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.15, z]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.03, 0.4]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
    ))}
    
    {/* Diagonal support ropes */}
    {[[-2.5, 0.5, -1.5], [2.5, 0.5, 1.5]].map(([x, y, z], i) => (
      <mesh key={i} position={[x, y, z]} rotation={[0.5, i === 0 ? 0.3 : -0.3, 0.8]}>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshBasicMaterial color={COLORS.rope} />
      </mesh>
    ))}
  </group>
);

// --- Fallen Trade Goods (Jump over obstacle) ---
export const FallenTradeGoods: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Overturned crate */}
    <mesh position={[0, 0.4, 0]} rotation={[0.3, 0.2, 0]}>
      <boxGeometry args={[1.2, 0.8, 1]} />
      <meshBasicMaterial color="#8B4513" />
    </mesh>
    
    {/* Spilled contents - cloth rolls */}
    <mesh position={[0.8, 0.2, 0.3]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.15, 0.15, 0.8]} />
      <meshBasicMaterial color="#4682B4" />
    </mesh>
    <mesh position={[-0.6, 0.15, 0.5]} rotation={[0.2, 0.5, Math.PI / 2]}>
      <cylinderGeometry args={[0.12, 0.12, 0.7]} />
      <meshBasicMaterial color={COLORS.fabricBlue || '#7AA8C8'} />
    </mesh>
    
    {/* Scattered pottery */}
    <mesh position={[0.4, 0.15, -0.5]}>
      <sphereGeometry args={[0.2, 6, 6]} />
      <meshBasicMaterial color={COLORS.pottery} />
    </mesh>
    <mesh position={[-0.8, 0.1, -0.3]}>
      <cylinderGeometry args={[0.12, 0.08, 0.25]} />
      <meshBasicMaterial color={COLORS.pottery} />
    </mesh>
    
    {/* Broken pottery shards */}
    {[[-0.3, 0.02, 0.6], [0.5, 0.02, 0.4]].map(([x, y, z], i) => (
      <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, i * 1.2 + 0.5]}>
        <circleGeometry args={[0.1, 3]} />
        <meshBasicMaterial color="#CD853F" />
      </mesh>
    ))}
  </group>
);

// --- Bedouin Trader (NPC in proper period attire) ---
export const BedouinTrader: React.FC<{ position: [number, number, number], playerNear?: boolean }> = ({ position, playerNear = false }) => (
  <EmiratiMan position={position} variant="bedouin" playerNear={playerNear} />
);

// --- Caravan Campfire (Resting area with embers) ---
export const CaravanCampfire: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const flameRef = useRef<Mesh>(null);
  const emberRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (flameRef.current) {
      flameRef.current.scale.y = 0.8 + Math.sin(clock.getElapsedTime() * 8) * 0.2;
      flameRef.current.scale.x = 1 + Math.sin(clock.getElapsedTime() * 6) * 0.1;
    }
    if (emberRef.current) {
      emberRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Stone ring */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[Math.sin(i * Math.PI / 4) * 0.6, 0.1, Math.cos(i * Math.PI / 4) * 0.6]}>
          <dodecahedronGeometry args={[0.15]} />
          <meshBasicMaterial color="#555" />
        </mesh>
      ))}
      
      {/* Ash bed */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 10]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Glowing embers */}
      <group ref={emberRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.sin(i) * 0.2, 0.08, Math.cos(i) * 0.2]}>
            <sphereGeometry args={[0.08]} />
            <meshBasicMaterial color="#FF4500" />
          </mesh>
        ))}
      </group>
      
      {/* Small flame */}
      <mesh ref={flameRef} position={[0, 0.25, 0]}>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={0.8} />
      </mesh>
      
      {/* Emissive glow halo - replaces point light */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={0.25} />
      </mesh>
      
      {/* Firewood */}
      {[[0.2, 0.1, 0.1, 0.3], [-0.15, 0.1, -0.1, -0.4]].map(([x, y, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, rot, 0.2]}>
          <cylinderGeometry args={[0.04, 0.05, 0.5]} />
          <meshBasicMaterial color="#3E2723" />
        </mesh>
      ))}
      
      {/* Coffee pot (Dallah) nearby */}
      <group position={[0.8, 0, 0.3]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.25]} />
          <meshBasicMaterial color="#B8860B" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.08, 0.08]} />
          <meshBasicMaterial color="#B8860B" />
        </mesh>
        <mesh position={[0.12, 0.2, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.15]} />
          <meshBasicMaterial color="#B8860B" />
        </mesh>
      </group>
    </group>
  );
};

// --- Falcon Perch (Falconry element - Cultural) ---
export const FalconPerch: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const falconRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (falconRef.current) {
      falconRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Perch stand */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
      
      {/* Crossbar */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 6]} />
        <meshBasicMaterial color={COLORS.wood} />
      </mesh>
      
      {/* Falcon */}
      <group ref={falconRef} position={[0, 1.35, 0]}>
        {/* Body */}
        <mesh scale={[0.6, 0.8, 1]}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshBasicMaterial color="#4A3728" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.2, 0.1]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshBasicMaterial color="#3A2718" />
        </mesh>
        {/* Beak */}
        <mesh position={[0, 0.18, 0.18]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.03, 0.08, 4]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.04, 0.22, 0.15]}>
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.04, 0.22, 0.15]}>
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        {/* Wings (folded) */}
        {[-0.12, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0, -0.05]} scale={[0.3, 0.6, 0.8]}>
            <sphereGeometry args={[0.2, 4, 4]} />
            <meshBasicMaterial color="#5A4738" />
          </mesh>
        ))}
        {/* Tail */}
        <mesh position={[0, -0.1, -0.2]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.15]} />
          <meshBasicMaterial color="#4A3728" />
        </mesh>
        {/* Hood (traditional falcon hood) */}
        <mesh position={[0, 0.25, 0.08]}>
          <sphereGeometry args={[0.08, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color={COLORS.pottery || '#B87333'} />
        </mesh>
      </group>
    </group>
  );
};

// --- Low Camel Saddle (Slide under - isTall) ---
export const LowCamelSaddle: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Wooden saddle frame */}
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1.5, 0.3, 2]} />
      <meshBasicMaterial color={COLORS.wood} />
    </mesh>
    
    {/* Pommel (front rise) */}
    <mesh position={[0, 0.8, 0.8]}>
      <boxGeometry args={[0.4, 0.5, 0.3]} />
      <meshBasicMaterial color={COLORS.wood} />
    </mesh>
    
    {/* Cantle (back rise) */}
    <mesh position={[0, 0.7, -0.8]}>
      <boxGeometry args={[0.5, 0.4, 0.25]} />
      <meshBasicMaterial color={COLORS.wood} />
    </mesh>
    
    {/* Decorative blanket */}
    <mesh position={[0, 0.68, 0]}>
      <boxGeometry args={[1.6, 0.05, 2.1]} />
      <meshBasicMaterial color={COLORS.spiceWarm || '#B88040'} />
    </mesh>
    
    {/* Geometric pattern on blanket */}
    <mesh position={[0, 0.69, 0]}>
      <boxGeometry args={[0.8, 0.02, 1.5]} />
      <meshBasicMaterial color="#FFD700" />
    </mesh>
    
    {/* Hanging tassels */}
    {[-0.7, 0.7].map((x, i) => (
      <mesh key={i} position={[x, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.3]} />
        <meshBasicMaterial color={COLORS.spiceWarm || '#B88040'} />
      </mesh>
    ))}
  </group>
);

// --- Water Skin (Qirba - Leather container) ---
export const WaterSkin: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Main body - goatskin shape */}
    <mesh position={[0, 0.4, 0]} scale={[0.8, 1, 0.6]}>
      <sphereGeometry args={[0.35, 8, 8]} />
      <meshBasicMaterial color="#6B4423" />
    </mesh>
    
    {/* Neck/spout */}
    <mesh position={[0, 0.75, 0]}>
      <cylinderGeometry args={[0.06, 0.1, 0.2]} />
      <meshBasicMaterial color="#5D3A1A" />
    </mesh>
    
    {/* Tie cord */}
    <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.08, 0.015, 4, 8]} />
      <meshBasicMaterial color={COLORS.rope} />
    </mesh>
    
    {/* Carrying strap */}
    <mesh position={[0.25, 0.5, 0]} rotation={[0, 0, 0.8]}>
      <cylinderGeometry args={[0.02, 0.02, 0.8]} />
      <meshBasicMaterial color="#4A3423" />
    </mesh>
    
    {/* Stitching detail */}
    <mesh position={[0, 0.4, 0.22]}>
      <boxGeometry args={[0.02, 0.5, 0.02]} />
      <meshBasicMaterial color="#3D2817" />
    </mesh>
  </group>
);
