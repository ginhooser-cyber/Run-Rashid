import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

// --- Types ---
export interface EffectsHandle {
  spawnPearlBurst: (position: THREE.Vector3) => void;
  spawnDust: (position: THREE.Vector3) => void;
}

const PARTICLE_COUNT = 50;
const DUST_COUNT = 20;

const Effects = forwardRef<EffectsHandle>((_, ref) => {
  // --- Pearl Burst System ---
  const pearlMeshRef = useRef<THREE.InstancedMesh>(null);
  const pearlParticles = useMemo(() => {
    return new Array(PARTICLE_COUNT).fill(0).map(() => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      active: false,
      scale: 0
    }));
  }, []);

  // --- Dust System ---
  const dustMeshRef = useRef<THREE.InstancedMesh>(null);
  const dustParticles = useMemo(() => {
    return new Array(DUST_COUNT).fill(0).map(() => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      active: false,
      scale: 0
    }));
  }, []);

  const dummy = new THREE.Object3D();

  useImperativeHandle(ref, () => ({
    spawnPearlBurst: (pos: THREE.Vector3) => {
      let spawned = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (!pearlParticles[i].active && spawned < 15) { // Spawn batch
          pearlParticles[i].active = true;
          pearlParticles[i].life = 1.0;
          pearlParticles[i].position.copy(pos);
          // Explode outward
          pearlParticles[i].velocity.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          );
          spawned++;
        }
      }
    },
    spawnDust: (pos: THREE.Vector3) => {
      let spawned = 0;
      for (let i = 0; i < DUST_COUNT; i++) {
        if (!dustParticles[i].active && spawned < 8) {
          dustParticles[i].active = true;
          dustParticles[i].life = 1.0;
          dustParticles[i].position.set(pos.x + (Math.random()-0.5), 0.1, pos.z + (Math.random()-0.5));
          dustParticles[i].velocity.set(
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            (Math.random() - 0.5) * 2
          );
          spawned++;
        }
      }
    }
  }));

  useFrame((state, delta) => {
    // Update Pearl Particles
    if (pearlMeshRef.current) {
      pearlParticles.forEach((p, i) => {
        if (p.active) {
          p.life -= delta * 2; // Fade speed
          p.velocity.y -= delta * 5; // Gravity
          p.position.addScaledVector(p.velocity, delta);
          p.scale = p.life; // Shrink

          if (p.life <= 0) {
            p.active = false;
            p.scale = 0;
          }

          dummy.position.copy(p.position);
          dummy.scale.setScalar(p.scale * 0.3);
          dummy.updateMatrix();
          pearlMeshRef.current!.setMatrixAt(i, dummy.matrix);
        } else {
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          pearlMeshRef.current!.setMatrixAt(i, dummy.matrix);
        }
      });
      pearlMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Dust Particles
    if (dustMeshRef.current) {
        dustParticles.forEach((p, i) => {
          if (p.active) {
            p.life -= delta * 1.5;
            p.position.addScaledVector(p.velocity, delta);
            // Expand then fade
            const scale = (1 - p.life) * 2 * p.life; 
  
            if (p.life <= 0) {
              p.active = false;
            }
  
            dummy.position.copy(p.position);
            dummy.scale.setScalar(scale);
            dummy.updateMatrix();
            dustMeshRef.current!.setMatrixAt(i, dummy.matrix);
          } else {
            dummy.scale.setScalar(0);
            dummy.updateMatrix();
            dustMeshRef.current!.setMatrixAt(i, dummy.matrix);
          }
        });
        dustMeshRef.current.instanceMatrix.needsUpdate = true;
      }
  });

  return (
    <group>
      {/* Pearls: Glowing spheres */}
      <instancedMesh ref={pearlMeshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#FFF" toneMapped={false} />
      </instancedMesh>

      {/* Dust: Sand clouds */}
      <instancedMesh ref={dustMeshRef} args={[undefined, undefined, DUST_COUNT]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={COLORS.sand} transparent opacity={0.6} />
      </instancedMesh>
    </group>
  );
});

export default Effects;