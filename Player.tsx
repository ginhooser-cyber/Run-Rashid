
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import { Lane, GameState } from './types';
import { COLORS, LANE_WIDTH, JUMP_HEIGHT, JUMP_DURATION, SLIDE_DURATION } from './constants';

interface PlayerProps {
  gameState: GameState;
  currentLane: Lane;
  isJumping: boolean;
  isSliding: boolean;
  isHit: boolean; // Invulnerability state
  isSwimming?: boolean; // Act 3 underwater mode
  isSurfacing?: boolean; // Act 3 → Act 4 surfacing transition
  surfacePhase?: 'swimming' | 'surfacing' | 'splashing' | 'landing' | 'running';
  isRidingCamel?: boolean; // Pearl Challenge camel ride
  isHarborTransition?: boolean; // Act 1 → Act 2 transition
  harborPhase?: 'none' | 'approaching' | 'entering' | 'active';
  isHomecomingTransition?: boolean; // Act 4 → Act 5 transition
  homecomingPhase?: 'none' | 'traveling' | 'approaching' | 'arriving' | 'active';
  onPositionUpdate: (pos: Vector3) => void;
}

const Player: React.FC<PlayerProps> = ({ gameState, currentLane, isJumping, isSliding, isHit, isSwimming = false, isSurfacing = false, surfacePhase = 'running', isRidingCamel = false, isHarborTransition = false, harborPhase = 'none', isHomecomingTransition = false, homecomingPhase = 'none', onPositionUpdate }) => {
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

    groupRef.current.position.y = yOffset + (isRidingCamel ? 1.5 : 0);

    // 4. Procedural Running/Swimming/Surfacing Animation
    if ((gameState === GameState.PLAYING || gameState === GameState.COUNTDOWN) && !isJumping && !isSliding) {
        
        // SURFACING TRANSITION ANIMATION (Act 3 → Act 4)
        if (isSurfacing && surfacePhase !== 'running') {
            const time = state.clock.elapsedTime * 5;
            
            if (surfacePhase === 'swimming') {
                // Still swimming but approaching surface - slightly tilting up
                if (groupRef.current) {
                    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, Math.PI, 6 * delta);
                    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, Math.PI * 0.25, 6 * delta); // Less horizontal
                }
                yOffset = 2.8 + Math.sin(time * 0.8) * 0.15;
                groupRef.current!.position.y = yOffset;
                
                // Swimming legs and arms
                if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * 2) * 0.4;
                if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * 2 + Math.PI) * 0.4;
                if(leftArmRef.current) leftArmRef.current.rotation.x = -2.5 + Math.sin(time) * 1.0;
                if(rightArmRef.current) rightArmRef.current.rotation.x = -2.5 + Math.sin(time + Math.PI) * 1.0;
            }
            else if (surfacePhase === 'surfacing') {
                // Breaking through water surface - dramatic upward thrust
                if (groupRef.current) {
                    // Rotate from horizontal swimming to more vertical
                    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, 0, 4 * delta);
                    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, -0.3, 4 * delta); // Slight backward lean
                    groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, 0, 4 * delta);
                }
                // Jump arc out of water
                yOffset = 3.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
                groupRef.current!.position.y = yOffset;
                
                // Arms reaching up as if pushing through water
                if(leftArmRef.current) leftArmRef.current.rotation.x = -2.8;
                if(rightArmRef.current) rightArmRef.current.rotation.x = -2.8;
                if(leftLegRef.current) leftLegRef.current.rotation.x = 0.3;
                if(rightLegRef.current) rightLegRef.current.rotation.x = -0.2;
            }
            else if (surfacePhase === 'splashing') {
                // Peak of jump - water cascading off
                if (groupRef.current) {
                    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, 0, 8 * delta);
                    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, 0, 8 * delta);
                    groupRef.current.rotation.z = 0;
                }
                // High point of arc
                yOffset = 5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
                groupRef.current!.position.y = yOffset;
                
                // Victory pose at peak
                if(leftArmRef.current) leftArmRef.current.rotation.x = -2.5;
                if(rightArmRef.current) rightArmRef.current.rotation.x = -2.5;
                if(leftLegRef.current) leftLegRef.current.rotation.x = 0.5;
                if(rightLegRef.current) rightLegRef.current.rotation.x = -0.3;
            }
            else if (surfacePhase === 'landing') {
                // Descending and landing on shore - fast and snappy
                if (groupRef.current) {
                    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, 0, 15 * delta);
                    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, 0, 15 * delta);
                    groupRef.current.rotation.z = 0;
                }
                // Fast descent to ground - snap when close to prevent floating
                const currentY = groupRef.current!.position.y;
                const newY = MathUtils.lerp(currentY, 0, 15 * delta);
                yOffset = newY < 0.2 ? 0 : newY; // Snap to ground when close
                groupRef.current!.position.y = yOffset;
                
                // Prepare for running pose with smooth transition
                const runTime = state.clock.elapsedTime * 8;
                if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(runTime) * 0.6;
                if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(runTime + Math.PI) * 0.6;
                if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(runTime + Math.PI) * 0.5;
                if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(runTime) * 0.5;
            }
        }
        else if (isSwimming) {
            // SWIMMING ANIMATION - Horizontal freestyle/crawl stroke
            const time = state.clock.elapsedTime * 5; // Swimming rhythm
            
            // ROTATE ENTIRE PLAYER TO HORIZONTAL SWIMMING POSITION
            // Character swims AWAY from viewer (facing into the screen, back to camera)
            if (groupRef.current) {
                // Rotate 180 degrees on Y-axis so character faces away from viewer (back to camera)
                groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, Math.PI, 8 * delta);
                // Tilt body forward so swimmer is horizontal (face down)
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, Math.PI * 0.4, 8 * delta);
                // Slight body roll during swim
                const bodyRoll = Math.sin(time) * 0.06;
                groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, bodyRoll, 8 * delta);
            }
            
            // Raise swimmer up to be in the water (swimming level - near sea floor)
            yOffset = 0.8 + Math.sin(time * 0.8) * 0.15; // Near seabed swimming
            groupRef.current!.position.y = yOffset;
            
            // Body position adjustments for horizontal swim
            if (bodyGroupRef.current) {
                // Slight forward lean already applied by group rotation
                bodyGroupRef.current.rotation.x = 0;
                bodyGroupRef.current.position.y = 0;
            }
            
            // Legs - Flutter kick (alternating up/down)
            if(leftLegRef.current) {
                leftLegRef.current.rotation.x = Math.sin(time * 2) * 0.4;
            }
            if(rightLegRef.current) {
                rightLegRef.current.rotation.x = Math.sin(time * 2 + Math.PI) * 0.4;
            }

            // Arms - Freestyle crawl stroke (alternating)
            if(leftArmRef.current) {
                // Left arm: reaching forward then pulling back
                const leftPhase = (time % (Math.PI * 2)) / (Math.PI * 2);
                leftArmRef.current.rotation.x = -2.5 + Math.sin(time) * 1.2; // Reaching forward and pulling
                leftArmRef.current.rotation.z = 0.3 + Math.sin(time) * 0.2;
            }
            if(rightArmRef.current) {
                // Right arm: opposite phase
                rightArmRef.current.rotation.x = -2.5 + Math.sin(time + Math.PI) * 1.2;
                rightArmRef.current.rotation.z = -0.3 - Math.sin(time + Math.PI) * 0.2;
            }

            // Head stays relatively still, looking forward
            if(headRef.current) {
                headRef.current.position.y = 1.45;
                headRef.current.rotation.x = 0.2; // Looking slightly down
                // Slight head turn with breathing motion
                headRef.current.rotation.y = Math.sin(time * 0.5) * 0.15;
            }
            
            // Dishdasha billows in water
            if(dishdashaRef.current) {
                dishdashaRef.current.rotation.z = Math.sin(time * 0.5) * 0.08;
                dishdashaRef.current.scale.x = 1.0 + Math.sin(time * 0.3) * 0.03;
                dishdashaRef.current.scale.z = 1.0 + Math.sin(time * 0.4) * 0.05; // Flowing behind
            }
        } else {
            // RUNNING / RIDING / TRANSITION ANIMATION
            const time = state.clock.elapsedTime * 10; 
            
            // Ensure player is grounded when running (prevent floating)
            if (groupRef.current && !isRidingCamel) {
                // Smooth Y position to ground level during normal running
                const targetY = 0;
                const currentY = groupRef.current.position.y;
                if (currentY > 0.1) {
                    groupRef.current.position.y = MathUtils.lerp(currentY, targetY, 12 * delta);
                    if (groupRef.current.position.y < 0.1) groupRef.current.position.y = 0;
                }
            }
            
            // Reset group rotation from swimming mode (back to facing forward)
            if (groupRef.current) {
                groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, 0, 8 * delta);
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, 0, 8 * delta);
                groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, 0, 8 * delta);
            }
            
            // HARBOR TRANSITION - Slightly different dock-walking animation
            if (isHarborTransition && harborPhase !== 'none') {
                const harborTime = state.clock.elapsedTime * 9; // Slightly faster cadence on docks
                
                // Cautious dock walking - less arm swing, careful steps
                if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(harborTime) * 0.8;
                if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(harborTime + Math.PI) * 0.8;
                if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(harborTime + Math.PI) * 0.5;
                if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(harborTime) * 0.5;
                
                // Look around during approaching phase
                if (harborPhase === 'approaching' && headRef.current) {
                    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
                }
            }
            // HOMECOMING TRANSITION - Eager running home animation
            else if (isHomecomingTransition && homecomingPhase !== 'none') {
                const homeTime = state.clock.elapsedTime * 11; // Faster, eager running
                
                // Excited running - more energy
                if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(homeTime) * 1.2;
                if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(homeTime + Math.PI) * 1.2;
                if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(homeTime + Math.PI) * 1.0;
                if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(homeTime) * 1.0;
                
                // Head up, looking towards home
                if(headRef.current) headRef.current.position.y = 1.5 + Math.abs(Math.sin(homeTime)) * 0.08;
            }
            else if (isRidingCamel) {
                // RIDING CAMEL POSE - Sitting position with gentle sway
                const swayTime = state.clock.elapsedTime * 3;
                
                // Legs bent in riding position
                if(leftLegRef.current) leftLegRef.current.rotation.x = -1.2 + Math.sin(swayTime) * 0.1;
                if(rightLegRef.current) rightLegRef.current.rotation.x = -1.2 + Math.sin(swayTime + 0.5) * 0.1;
                
                // Arms holding reins
                if(leftArmRef.current) leftArmRef.current.rotation.x = -0.4;
                if(rightArmRef.current) rightArmRef.current.rotation.x = -0.4;
                
                // Gentle body sway with camel movement
                if(bodyGroupRef.current) {
                    bodyGroupRef.current.rotation.z = Math.sin(swayTime) * 0.05;
                    bodyGroupRef.current.position.y = Math.sin(swayTime * 2) * 0.1;
                }
                
                // Head looks forward
                if(headRef.current) headRef.current.position.y = 1.45 + Math.sin(swayTime) * 0.03;
                
            } else {
                // NORMAL RUNNING ANIMATION
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
                     dishdashaRef.current.scale.x = 1.0 - Math.abs(Math.sin(time)) * 0.02;
                }
            }
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
                <mesh position={[0, -0.35, 0]}>
                    <cylinderGeometry args={[0.07, 0.06, 0.7]} />
                    <meshLambertMaterial color={COLORS.clothWhite} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.7, 0.05]}>
                    <boxGeometry args={[0.1, 0.08, 0.2]} />
                    <meshLambertMaterial color={COLORS.skin} />
                </mesh>
            </group>

            {/* Right Leg Pivot */}
            <group ref={rightLegRef} position={[0.15, 0, 0]}>
                <mesh position={[0, -0.35, 0]}>
                    <cylinderGeometry args={[0.07, 0.06, 0.7]} />
                    <meshLambertMaterial color={COLORS.clothWhite} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.7, 0.05]}>
                    <boxGeometry args={[0.1, 0.08, 0.2]} />
                    <meshLambertMaterial color={COLORS.skin} />
                </mesh>
            </group>
        </group>

        {/* --- TORSO & CLOTHING --- */}
        <group position={[0, 0.8, 0]} ref={dishdashaRef}>
            {/* Main Dishdasha Body */}
            <mesh position={[0, 0.1, 0]}>
                 <cylinderGeometry args={[0.22, 0.35, 0.9, 10]} />
                 <meshLambertMaterial color={COLORS.clothWhite} />
            </mesh>
            {/* Chest Detail */}
            <mesh position={[0, 0.3, 0.21]} rotation={[0,0,0]}>
                 <planeGeometry args={[0.15, 0.3]} />
                 <meshBasicMaterial color="#ddd" side={2} />
            </mesh>
        </group>

        {/* --- HEAD --- */}
        <group ref={headRef} position={[0, 1.45, 0]}>
             {/* Face */}
             <mesh>
                 <sphereGeometry args={[0.18, 12, 12]} />
                 <meshLambertMaterial color={COLORS.skin} />
             </mesh>
             {/* Headscarf (Ghutra) - Full rounded white cloth covering head */}
             <mesh position={[0, 0.05, 0]}>
                 <sphereGeometry args={[0.21, 10, 10]} />
                 <meshLambertMaterial color={COLORS.clothWhite} />
             </mesh>
             {/* Agal (Black Ring) */}
             <mesh position={[0, 0.15, 0]} rotation={[Math.PI/2, 0, 0]}>
                 <torusGeometry args={[0.16, 0.03, 6, 16]} />
                 <meshBasicMaterial color="#111" />
             </mesh>
             {/* Ghutra Tail (Back) */}
             <mesh position={[0, -0.1, -0.15]} rotation={[0.2, 0, 0]}>
                 <boxGeometry args={[0.25, 0.4, 0.05]} />
                 <meshBasicMaterial color={COLORS.clothWhite} />
             </mesh>
        </group>

        {/* --- ARMS --- */}
        <group position={[0, 1.35, 0]}>
            {/* Left Arm Pivot */}
            <group ref={leftArmRef} position={[-0.28, 0, 0]}>
                 <mesh position={[0, -0.25, 0]} rotation={[0, 0, 0.1]}>
                     <cylinderGeometry args={[0.06, 0.05, 0.5]} />
                     <meshLambertMaterial color={COLORS.clothWhite} />
                 </mesh>
                 {/* Hand */}
                 <mesh position={[0, -0.52, 0]}>
                     <sphereGeometry args={[0.06]} />
                     <meshLambertMaterial color={COLORS.skin} />
                 </mesh>
            </group>
            
            {/* Right Arm Pivot */}
            <group ref={rightArmRef} position={[0.28, 0, 0]}>
                 <mesh position={[0, -0.25, 0]} rotation={[0, 0, -0.1]}>
                     <cylinderGeometry args={[0.06, 0.05, 0.5]} />
                     <meshLambertMaterial color={COLORS.clothWhite} />
                 </mesh>
                 {/* Hand */}
                 <mesh position={[0, -0.52, 0]}>
                     <sphereGeometry args={[0.06]} />
                     <meshLambertMaterial color={COLORS.skin} />
                 </mesh>
            </group>
        </group>

      </group>
      
      {/* Shadow Blob (Simple Projected Shadow) */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isRidingCamel ? 0.8 : 0.35, 32]} />
        <meshBasicMaterial color="#000" opacity={0.3} transparent />
      </mesh>
      
      {/* Riding Camel - visible when player is riding */}
      {isRidingCamel && (
        <group position={[0, -0.5, 0]}>
          {/* Camel Body */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[1.2, 0.8, 2.0]} />
            <meshLambertMaterial color="#C9A85C" />
          </mesh>
          
          {/* Hump */}
          <mesh position={[0, 1.35, 0]} castShadow>
            <sphereGeometry args={[0.5, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshLambertMaterial color="#C9A85C" />
          </mesh>
          
          {/* Neck */}
          <mesh position={[0, 1.1, 1.0]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.26, 1.1]} />
            <meshLambertMaterial color="#C9A85C" />
          </mesh>
          
          {/* Head */}
          <mesh position={[0, 1.8, 1.4]} castShadow>
            <boxGeometry args={[0.3, 0.35, 0.7]} />
            <meshLambertMaterial color="#C9A85C" />
          </mesh>
          
          {/* Running Legs - Front Left */}
          <mesh position={[-0.35, 0.35, 0.7]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.8]} />
            <meshLambertMaterial color="#A68B4B" />
          </mesh>
          {/* Front Right */}
          <mesh position={[0.35, 0.35, 0.7]} rotation={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.8]} />
            <meshLambertMaterial color="#A68B4B" />
          </mesh>
          {/* Back Left */}
          <mesh position={[-0.35, 0.35, -0.7]} rotation={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.8]} />
            <meshLambertMaterial color="#A68B4B" />
          </mesh>
          {/* Back Right */}
          <mesh position={[0.35, 0.35, -0.7]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.8]} />
            <meshLambertMaterial color="#A68B4B" />
          </mesh>
          
          {/* Saddle */}
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[0.9, 0.15, 1.0]} />
            <meshBasicMaterial color="#8B2323" />
          </mesh>
          {/* Saddle Gold Trim */}
          <mesh position={[0, 1.35, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.6]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Player;
