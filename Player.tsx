
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import { Lane, GameState } from '../types';
import { COLORS, LANE_WIDTH, JUMP_HEIGHT, JUMP_DURATION, SLIDE_DURATION } from '../constants';

interface PlayerProps {
  gameState: GameState;
  currentLane: Lane;
  isJumping: boolean;
  isSliding: boolean;
  isHit: boolean; // Invulnerability state
  onPositionUpdate: (pos: Vector3) => void;
}

const Player: React.FC<PlayerProps> = ({ gameState, currentLane, isJumping, isSliding, isHit, onPositionUpdate }) => {
  const groupRef = useRef<Group>(null);
  const bodyGroupRef = useRef<Group>(null);
  
  // Limbs Refs for Animation
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const dishdashaRef = useRef<Group>(null);

  // Animation state
  const [jumpTime, setJumpTime] = useState(0);
  const [slideTime, setSlideTime] = useState(0);

  // Smooth lane transition
  const targetX = currentLane * LANE_WIDTH;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Handle Lateral Movement (Lerp) & Leaning
    const xDiff = targetX - groupRef.current.position.x;
    groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, targetX, 10 * delta);
    
    // Lean into the turn
    if (bodyGroupRef.current) {
        const targetLean = -xDiff * 0.1; // Lean towards movement
        bodyGroupRef.current.rotation.z = MathUtils.lerp(bodyGroupRef.current.rotation.z, targetLean, 10 * delta);
    }

    // 2. Handle Jump Logic
    let yOffset = 0;
    if (isJumping) {
      const t = jumpTime / JUMP_DURATION;
      if (t <= 1) {
        yOffset = 4 * JUMP_HEIGHT * t * (1 - t);
        setJumpTime((prev) => prev + delta);
        
        // Jump Pose
        if(leftLegRef.current) leftLegRef.current.rotation.x = 0.5;
        if(rightLegRef.current) rightLegRef.current.rotation.x = -0.2;
        if(leftArmRef.current) leftArmRef.current.rotation.x = -2.5; // Arms up
        if(rightArmRef.current) rightArmRef.current.rotation.x = -2.5;
      }
    } else {
      if (jumpTime !== 0) setJumpTime(0);
    }
    
    // 3. Handle Slide Logic
    if (isSliding) {
        const t = slideTime / SLIDE_DURATION;
        if (t <= 1) {
             if (bodyGroupRef.current) {
                 // Slide Rotation (Backwards lean)
                 bodyGroupRef.current.rotation.x = MathUtils.lerp(-0.5, -1.2, Math.sin(t * Math.PI));
                 // Crouch down (lower than standing)
                 bodyGroupRef.current.position.y = MathUtils.lerp(0, -0.5, Math.sin(t * Math.PI));
                 
                 // Legs forward
                 if(leftLegRef.current) leftLegRef.current.rotation.x = -1.5;
                 if(rightLegRef.current) rightLegRef.current.rotation.x = -1.5;
             }
             setSlideTime((prev) => prev + delta);
        }
    } else {
        if (slideTime !== 0) {
            setSlideTime(0);
        }
        // Reset body rotation from slide
        if(bodyGroupRef.current && !isJumping) {
             bodyGroupRef.current.rotation.x = MathUtils.lerp(bodyGroupRef.current.rotation.x, 0, 10 * delta);
             // Reset to standing height (0, which puts feet on ground)
             bodyGroupRef.current.position.y = MathUtils.lerp(bodyGroupRef.current.position.y, 0, 10 * delta);
        }
    }

    groupRef.current.position.y = yOffset;

    // 4. Procedural Running Animation
    if ((gameState === GameState.PLAYING || gameState === GameState.COUNTDOWN) && !isJumping && !isSliding) {
        // Slower animation speed to match reduced movement speed (10 instead of 18)
        const time = state.clock.elapsedTime * 10; 
        
        // Legs
        if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time) * 1.0;
        if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time + Math.PI) * 1.0;

        // Arms (Opposite to legs)
        if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
        if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time) * 0.8;

        // Head Bob
        if(headRef.current) headRef.current.position.y = 1.45 + Math.abs(Math.sin(time)) * 0.05;
        
        // Dishdasha Sway
        if(dishdashaRef.current) {
             dishdashaRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
             dishdashaRef.current.scale.x = 1.0 - Math.abs(Math.sin(time)) * 0.02; // Squash/Stretch
        }
    } else if (gameState === GameState.MENU || gameState === GameState.PAUSED) {
        // Idle Animation
        const time = state.clock.elapsedTime * 2;
        if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.1;
        if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time + 0.5) * 0.1;
        if(headRef.current) headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        
        // Ensure grounded during idle
        if(bodyGroupRef.current) {
             bodyGroupRef.current.position.y = 0;
        }
    }

    // Invulnerability Pulse
    if(groupRef.current) {
        if (isHit) {
            const pulse = Math.sin(state.clock.elapsedTime * 15);
            groupRef.current.visible = pulse > -0.5;
        } else {
            groupRef.current.visible = true;
        }
    }

    onPositionUpdate(groupRef.current.position.clone());
  });

  return (
    <group ref={groupRef}>
      {/* 
          Body Group centered at [0,0,0]. 
          Legs pivot at 0.8 up. Feet are -0.7 down from legs. 
          Net foot position = 0.1. Foot height 0.08 (radius 0.04).
          Foot bottom ≈ 0.06. Perfect for slight ground clearance or touching.
      */}
      <group ref={bodyGroupRef} position={[0, 0, 0]}>
        
        {/* --- LEGS --- */}
        <group position={[0, 0.8, 0]}>
            {/* Left Leg Pivot */}
            <group ref={leftLegRef} position={[-0.15, 0, 0]}>
                <mesh position={[0, -0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.07, 0.06, 0.7]} />
                    <meshStandardMaterial color={COLORS.clothWhite} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.7, 0.05]} castShadow>
                    <boxGeometry args={[0.1, 0.08, 0.2]} />
                    <meshStandardMaterial color={COLORS.skin} />
                </mesh>
            </group>

            {/* Right Leg Pivot */}
            <group ref={rightLegRef} position={[0.15, 0, 0]}>
                <mesh position={[0, -0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.07, 0.06, 0.7]} />
                    <meshStandardMaterial color={COLORS.clothWhite} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.7, 0.05]} castShadow>
                    <boxGeometry args={[0.1, 0.08, 0.2]} />
                    <meshStandardMaterial color={COLORS.skin} />
                </mesh>
            </group>
        </group>

        {/* --- TORSO & CLOTHING --- */}
        <group position={[0, 0.8, 0]} ref={dishdashaRef}>
            {/* Main Dishdasha Body */}
            <mesh position={[0, 0.1, 0]} castShadow>
                 <cylinderGeometry args={[0.22, 0.35, 0.9, 12]} />
                 <meshStandardMaterial color={COLORS.clothWhite} roughness={0.9} />
            </mesh>
            {/* Chest Detail */}
            <mesh position={[0, 0.3, 0.21]} rotation={[0,0,0]}>
                 <planeGeometry args={[0.15, 0.3]} />
                 <meshStandardMaterial color="#ddd" side={2} />
            </mesh>
        </group>

        {/* --- HEAD --- */}
        <group ref={headRef} position={[0, 1.45, 0]}>
             {/* Face */}
             <mesh castShadow>
                 <sphereGeometry args={[0.18, 16, 16]} />
                 <meshStandardMaterial color={COLORS.skin} />
             </mesh>
             {/* Headscarf (Ghutra) White part */}
             <mesh position={[0, 0.08, 0]} castShadow>
                 <sphereGeometry args={[0.20, 16, 16, 0, Math.PI * 2, 0, 1.5]} />
                 <meshStandardMaterial color={COLORS.clothWhite} />
             </mesh>
             {/* Agal (Black Ring) */}
             <mesh position={[0, 0.15, 0]} rotation={[Math.PI/2, 0, 0]}>
                 <torusGeometry args={[0.16, 0.03, 8, 24]} />
                 <meshStandardMaterial color="#111" roughness={0.8} />
             </mesh>
             {/* Ghutra Tail (Back) */}
             <mesh position={[0, -0.1, -0.15]} rotation={[0.2, 0, 0]}>
                 <boxGeometry args={[0.25, 0.4, 0.05]} />
                 <meshStandardMaterial color={COLORS.clothWhite} />
             </mesh>
        </group>

        {/* --- ARMS --- */}
        <group position={[0, 1.35, 0]}>
            {/* Left Arm Pivot */}
            <group ref={leftArmRef} position={[-0.28, 0, 0]}>
                 <mesh position={[0, -0.25, 0]} rotation={[0, 0, 0.1]} castShadow>
                     <cylinderGeometry args={[0.06, 0.05, 0.5]} />
                     <meshStandardMaterial color={COLORS.clothWhite} />
                 </mesh>
                 {/* Hand */}
                 <mesh position={[0, -0.52, 0]}>
                     <sphereGeometry args={[0.06]} />
                     <meshStandardMaterial color={COLORS.skin} />
                 </mesh>
            </group>
            
            {/* Right Arm Pivot */}
            <group ref={rightArmRef} position={[0.28, 0, 0]}>
                 <mesh position={[0, -0.25, 0]} rotation={[0, 0, -0.1]} castShadow>
                     <cylinderGeometry args={[0.06, 0.05, 0.5]} />
                     <meshStandardMaterial color={COLORS.clothWhite} />
                 </mesh>
                 {/* Hand */}
                 <mesh position={[0, -0.52, 0]}>
                     <sphereGeometry args={[0.06]} />
                     <meshStandardMaterial color={COLORS.skin} />
                 </mesh>
            </group>
        </group>

      </group>
      
      {/* Shadow Blob (Simple Projected Shadow) */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

export default Player;
