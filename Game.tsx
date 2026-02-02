
import React, { useRef, useState, useEffect, useContext, Suspense, MutableRefObject, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GameContext } from '../App';
import { GameState, Lane, ObstacleType, ObstacleData, CollectibleData, Act, Complexity, PatternDef, GameMode } from '../types';
import { LANE_WIDTH, OBSTACLE_MODELS, INITIAL_SPEED, MAX_SPEED, SPEED_ACCELERATION, COLORS, PATH_WIDTH, NARRATIVE_MOMENTS, TIME_PERIODS, ACT_STRUCTURE, OBSTACLE_PATTERNS, SPAWN_DISTANCE_BUFFER, INVULNERABILITY_DURATION, JUMP_DURATION, SLIDE_DURATION, CULTURAL_ANNOTATIONS } from '../constants';
import Player from './Player';
import { PalmTree, DhowBoat, MarketStall, Building, PearlMesh, DateMesh, DivingGearMesh, WaterJar, LaundryLine, NPC, CargoCrate, RopeCoil, HangingNet, DockPost, OysterBasket, DivingWeights, WoodenChest, SailCanvas, DryingNets, MastBoom, OverheadRigging, MainMast, CrewGroup, CaptainStation, SandDune, DesertShrub, RockFormation, CamelResting, LowTent, TallCactus, RopeLine, SupplyPile, FarmFence, WaterChannel, HarvestBasket, TreeBranch, DryingRope, FarmWorker, StackedSupplies, MarketGoods, ChildrenPlaying, CelebrationBanner, LanternString, GreetingElder, Mosque, CelebrationDrum, FlowerGarland, RoadChunk, ArishHouse, Camel, Gazelle, FalajCrossing } from './AssetLibrary';
import Effects, { EffectsHandle } from './Effects';
import { audioSystem, playSound } from '../audio';

// --- PERFORMANCE WRAPPER ---
const MovableObject: React.FC<{
    initialZ: number;
    offsetX: number;
    distanceRef: MutableRefObject<number>;
    children: React.ReactNode;
    annotationId?: string;
    onAnnotationClick?: (id: string) => void;
    highlight?: boolean;
}> = ({ initialZ, offsetX, distanceRef, children, annotationId, onAnnotationClick, highlight }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.position.z = initialZ - distanceRef.current;
            groupRef.current.position.x = offsetX;
        }
    });

    const handleClick = (e: any) => {
        if (annotationId && onAnnotationClick) {
            e.stopPropagation();
            onAnnotationClick(annotationId);
        }
    };

    return (
        <group 
            ref={groupRef}
            onClick={handleClick}
            onPointerOver={() => annotationId && setHover(true)}
            onPointerOut={() => annotationId && setHover(false)}
        >
            {children}
            {(highlight || annotationId) && (
                <group position={[0, 4, 0]} visible={true}>
                    <mesh position={[0, Math.sin(Date.now() / 200) * 0.2, 0]} scale={hovered ? 1.5 : 1}>
                        <octahedronGeometry args={[0.3, 0]} />
                        <meshBasicMaterial color="#FFD700" wireframe />
                    </mesh>
                    {hovered && (
                        <mesh position={[0, 0.8, 0]}>
                             <planeGeometry args={[1.5, 0.5]} />
                             <meshBasicMaterial color="black" transparent opacity={0.7} />
                        </mesh>
                    )}
                </group>
            )}
        </group>
    );
};

// --- Helper: Collision Detection ---
const checkCollision = (playerPos: THREE.Vector3, obstacleZ: number, obstacleLane: Lane, obstacleType: ObstacleType, isSliding: boolean, isJumping: boolean): boolean => {
    if (obstacleZ > 2 || obstacleZ < -2) return false;
    const obstacleX = obstacleLane * LANE_WIDTH;
    // Falaj crossing is wide, check if player is jumping over it
    if (obstacleType === ObstacleType.FALAJ_CROSSING) {
        // Player needs to jump
        if (isJumping && playerPos.y > 0.5) return false;
        return true; // Hit if not jumping
    }

    if (Math.abs(playerPos.x - obstacleX) > 1.0) return false;
    const modelInfo = OBSTACLE_MODELS[obstacleType];
    
    // Logic for passing
    if (modelInfo.isTall && isSliding) return false; 
    if (modelInfo.isLow && isJumping && playerPos.y > 1.5) return false; 
    
    if (!modelInfo.isTall && !modelInfo.isLow) {
        if (isJumping && playerPos.y > modelInfo.height) return false;
    }
    return true;
};

const checkCollection = (playerPos: THREE.Vector3, itemZ: number, itemLane: Lane, itemY: number, autoCollect: boolean): boolean => {
    const radius = autoCollect ? 5.0 : 1.0;
    
    if (itemZ > radius || itemZ < -radius) return false;
    const itemX = itemLane * LANE_WIDTH;
    
    if (autoCollect) return true;

    if (Math.abs(playerPos.x - itemX) > 1.0) return false;
    if (itemY > 1.0 && playerPos.y < 1.0) return false;
    return true;
};

// --- Difficulty & Spawning Logic (Same as before) ---
const getPatternComplexity = (distance: number, act: Act, mode: GameMode): Complexity => {
    if (mode === 'ENDLESS') {
        if (distance < 2000) return 'SIMPLE';
        if (distance < 5000) return 'MEDIUM';
        if (distance < 10000) return 'HARD';
        return 'EXTREME';
    }

    if (act === Act.TRAINING_GROUNDS) {
        if (distance < 500) return 'SIMPLE';
        if (distance < 1500) return 'MEDIUM';
    }
    if (act === Act.HARBOR) {
        if (distance < 2500) return 'SIMPLE'; 
        if (distance < 3500) return 'MEDIUM'; 
        return 'HARD'; 
    }
    if (act === Act.DIVING) {
        if (distance < 6500) return 'MEDIUM';
        if (distance >= 6500 && distance < 8000) return 'EXTREME'; // Storm Peak
        return 'HARD';
    }
    if (act === Act.DESERT) {
        if (distance < 10000) return 'SIMPLE';
        if (distance < 11500) return 'MEDIUM';
        return 'HARD';
    }
    if (act === Act.HOMECOMING) {
        if (distance >= 14600) return 'TRIVIAL';
        if (distance < 14000) return 'SIMPLE';
        return 'MEDIUM';
    }
    return 'HARD'; 
};

const getGapForAct = (act: Act, distance: number, mode: GameMode): number => {
    if (mode === 'ENDLESS') {
        return Math.max(10, 30 - (distance / 1000));
    }

    if (act === Act.TRAINING_GROUNDS) return 15;
    if (act === Act.HARBOR) {
        return 35;
    }
    if (act === Act.DIVING) {
        if (distance >= 6500 && distance < 8000) return 25; 
        return 45; 
    }
    if (act === Act.DESERT) {
        return 35; 
    }
    if (act === Act.HOMECOMING) {
        if (distance >= 14600) return 60;
        return 30;
    }
    return 20; 
};

const getRandomPattern = (complexity: Complexity, act: Act, isStorm: boolean, distance: number, mode: GameMode): PatternDef => {
    if (isStorm) {
        const stormPatterns = OBSTACLE_PATTERNS.filter(p => p.id.includes('STORM'));
        if (stormPatterns.length > 0) return stormPatterns[Math.floor(Math.random() * stormPatterns.length)];
    }
    
    if (mode === 'STORY') {
        if (act === Act.HOMECOMING && distance >= 14600) {
            const familyPatterns = OBSTACLE_PATTERNS.filter(p => p.id === 'FAMILY_PATH_SIMPLE' || p.id === 'FAMILY_DRUMS');
            if (familyPatterns.length > 0) return familyPatterns[Math.floor(Math.random() * familyPatterns.length)];
        }
        if (act === Act.HOMECOMING && distance >= 14000 && distance < 14600) {
            const villagePatterns = OBSTACLE_PATTERNS.filter(p => p.id === 'VILLAGE_WELCOME' || p.id === 'CELEBRATION_ARC' || p.id === 'VILLAGE_PATH');
            if (villagePatterns.length > 0) return villagePatterns[Math.floor(Math.random() * villagePatterns.length)];
        }
    }

    const validPatterns = OBSTACLE_PATTERNS.filter(p => 
        p.complexity === complexity && 
        (!p.act || p.act === act)
    );
    if (validPatterns.length === 0) {
        const fallback = OBSTACLE_PATTERNS.filter(p => p.act === act);
        if (fallback.length > 0) return fallback[0];
        return OBSTACLE_PATTERNS[0];
    }
    return validPatterns[Math.floor(Math.random() * validPatterns.length)];
};

const resolveLane = (defLane: Lane | 'random' | 'all'): Lane[] => {
    if (defLane === 'all') return [Lane.LEFT, Lane.CENTER, Lane.RIGHT];
    if (defLane === 'random') {
        const lanes = [Lane.LEFT, Lane.CENTER, Lane.RIGHT];
        return [lanes[Math.floor(Math.random() * lanes.length)]];
    }
    return [defLane];
};

const resolveType = (defType: ObstacleType | 'random', act: Act, distance: number, mode: GameMode): ObstacleType => {
    if (defType !== 'random') return defType;
    
    if (mode === 'STORY' && act === Act.HOMECOMING) {
        if (distance >= 14600) {
             return Math.random() > 0.5 ? ObstacleType.FLOWER_GARLAND : ObstacleType.CELEBRATION_DRUM;
        }
        if (distance >= 14000) {
            const villageObstacles = [
                ObstacleType.MARKET_GOODS, ObstacleType.CHILDREN_PLAYING, ObstacleType.CELEBRATION_BANNER, 
                ObstacleType.LANTERN_STRING, ObstacleType.GREETING_ELDER, ObstacleType.VILLAGE_STALL
            ];
            return villageObstacles[Math.floor(Math.random() * villageObstacles.length)];
        }
    }
    const actObstacles = ACT_STRUCTURE[act].obstacles;
    return actObstacles[Math.floor(Math.random() * actObstacles.length)];
};

// --- SKY COMPONENT ---
const SkyGradient: React.FC<{ topColor: string; bottomColor: string }> = ({ topColor, bottomColor }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Update shader uniforms when props change
  useEffect(() => {
      if (mesh.current) {
          (mesh.current.material as THREE.ShaderMaterial).uniforms.topColor.value.set(topColor);
          (mesh.current.material as THREE.ShaderMaterial).uniforms.bottomColor.value.set(bottomColor);
      }
  }, [topColor, bottomColor]);

  const shaderArgs = useMemo(() => ({
      uniforms: {
          topColor: { value: new THREE.Color(topColor) },
          bottomColor: { value: new THREE.Color(bottomColor) },
          offset: { value: 33 },
          exponent: { value: 0.6 }
      },
      vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
              vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
      `,
      fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
              float h = normalize( vWorldPosition + offset ).y;
              gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
          }
      `,
      side: THREE.BackSide
  }), []);

  return (
      <mesh ref={mesh}>
          <sphereGeometry args={[100, 32, 15]} />
          <shaderMaterial args={[shaderArgs]} />
      </mesh>
  );
};

// --- Environment Controller (Enhanced for Visuals) ---
const EnvironmentController: React.FC<{isStorm: boolean, currentDistance: number, mode: GameState, gameMode: GameMode, act: Act, highContrast: boolean}> = ({isStorm, currentDistance, mode, gameMode, act, highContrast}) => {
    const { timeOfDay } = useContext(GameContext);
    const { scene } = useThree();
    
    useEffect(() => {
        let config = isStorm ? TIME_PERIODS['STORM'] : TIME_PERIODS[timeOfDay];
        
        if (gameMode === 'STORY') {
            if (act === Act.DESERT) {
                 config = TIME_PERIODS['SUNSET'];
            } else if (act === Act.HOMECOMING) {
                 if (currentDistance >= 14600) config = TIME_PERIODS['DUSK'];
                 else if (currentDistance >= 14000) config = { ...TIME_PERIODS['VILLAGE_NIGHT'] };
                 else config = TIME_PERIODS['EVENING'];
            }
        }
        
        if (mode === GameState.MUSEUM) {
            scene.background = new THREE.Color('#1a1410');
            scene.fog = null;
            return;
        }

        if (highContrast) {
            scene.background = new THREE.Color('#111');
            scene.fog = null;
            return;
        }

        // Smoother, deeper fog for better horizon blending
        const fogColor = new THREE.Color(config.fog);
        scene.fog = new THREE.Fog(fogColor, 20, 80);
        
        // Background color fallback (in case SkyGradient is off, though it's active now)
        scene.background = new THREE.Color(config.sky);

    }, [timeOfDay, scene, isStorm, act, currentDistance, mode, gameMode, highContrast]);

    if (mode === GameState.MUSEUM) {
        return (
            <group>
                <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFF" />
                <ambientLight intensity={0.5} color="#FFF" />
                <spotLight position={[0, 10, 0]} intensity={1} penumbra={0.5} />
            </group>
        );
    }

    const config = TIME_PERIODS[timeOfDay] || TIME_PERIODS['MORNING'];
    const groundColor = isStorm ? '#2F4F4F' : (act === Act.DIVING || act === Act.HARBOR) ? COLORS.water : COLORS.sand;

    // Use refined gradient colors for Act 1, else use config
    const skyTop = (act === Act.TRAINING_GROUNDS && timeOfDay === 'MORNING') ? COLORS.skyTop : config.sky;
    const skyBottom = (act === Act.TRAINING_GROUNDS && timeOfDay === 'MORNING') ? COLORS.skyBottom : config.fog;

    return (
        <group>
            {!highContrast && <SkyGradient topColor={skyTop} bottomColor={skyBottom} />}

            {/* Sun/Moon Light - Softened Shadows */}
            <directionalLight 
                position={[-20, 30, -10]} 
                intensity={highContrast ? 1.5 : (isStorm ? 0.4 : config.intensity)} 
                color={highContrast ? '#FFF' : (isStorm ? '#A0A0FF' : config.light)}
                castShadow 
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={100}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-bias={-0.001} // Fix shadow acne
            />
            
            {/* Hemisphere Light for Realistic Ambient Fill */}
            {!highContrast && (
                <hemisphereLight 
                    args={[skyTop, groundColor, isStorm ? 0.3 : 0.6]} 
                />
            )}
            
            {/* Subtle fill for shadows */}
            <ambientLight intensity={highContrast ? 0.8 : 0.2} color={config.ambient} />
        </group>
    );
};


// --- The World Component ---
interface WorldContentProps {
    shakeRef: MutableRefObject<number>;
}

const WorldContent: React.FC<WorldContentProps> = ({ shakeRef }) => {
    const { 
        state, handleCollision, addScore, updateDistance, collectItem, showNarrative, 
        triggerNearMiss, triggerShake, score, currentAct, activeBlessing, endGame, 
        setGameState, museumItem, gameMode, accessibility, culturalMode, setActiveAnnotation 
    } = useContext(GameContext);
    const { camera } = useThree();
    
    // Player State
    const [currentLane, setCurrentLane] = useState<Lane>(Lane.CENTER);
    const [isJumping, setIsJumping] = useState(false);
    const [isSliding, setIsSliding] = useState(false);
    const [isHit, setIsHit] = useState(false); 
    const playerPosRef = useRef(new THREE.Vector3());
    const prevJumpingRef = useRef(false);
    const hitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isHitRef = useRef(false);
    
    const jumpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const slideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isJumpingRef = useRef(false);
    const isSlidingRef = useRef(false);

    // Juice Refs
    const effectsRef = useRef<EffectsHandle>(null);
    // Lowered camera height from 5 to 4 for a more grounded feel
    const baseCameraPos = useRef(new THREE.Vector3(0, 4, -8));

    // --- GAME LOOP STATE (REFS for Performance) ---
    const distanceTraveledRef = useRef(0);
    const speedRef = useRef(INITIAL_SPEED);
    const isStormRef = useRef(false);
    const mosqueSpawnedRef = useRef(false);
    const lastObstacleZ = useRef(50);

    const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
    const [collectibles, setCollectibles] = useState<CollectibleData[]>([]);
    const [buildings, setBuildings] = useState<{id: string, x: number, z: number, type: number}[]>([]);
    const [npcs, setNpcs] = useState<{id: string, x: number, z: number, type: 'merchant'|'villager'|'gazelle'}[]>([]);
    const [roadChunks, setRoadChunks] = useState<{id: string, z: number, type: 'sand' | 'harbor' | 'stone'}[]>([]);

    const interactedRef = useRef<Set<string>>(new Set());

    useEffect(() => { isJumpingRef.current = isJumping; }, [isJumping]);
    useEffect(() => { isSlidingRef.current = isSliding; }, [isSliding]);
    useEffect(() => { isHitRef.current = isHit; }, [isHit]);

    // --- INITIALIZATION ---
    // Ensure road chunks exist on mount so the scene isn't empty during countdown
    useEffect(() => {
        if (currentAct !== Act.DIVING) {
            const CHUNK_LENGTH = 20;
            const DRAW_DISTANCE = 100;
            const initialChunks = [];
            for(let z = -20; z < DRAW_DISTANCE; z+=CHUNK_LENGTH) {
                initialChunks.push({
                    id: Math.random().toString(),
                    z: z,
                    type: currentAct === Act.HARBOR ? 'harbor' : 'sand'
                });
            }
            setRoadChunks(initialChunks as any);
        }
    }, []);

    useEffect(() => {
        if (activeBlessing?.effectType === 'SCREEN_CLEAR') {
            setObstacles([]);
            interactedRef.current.clear();
        }
    }, [activeBlessing]);

    // Input Handling (Same as before)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (state !== GameState.PLAYING) return;
            switch(e.key) {
                case 'ArrowLeft': case 'a': 
                    setCurrentLane(prev => Math.max(prev - 1, Lane.LEFT)); 
                    playSound('woosh'); 
                    break;
                case 'ArrowRight': case 'd': 
                    setCurrentLane(prev => Math.min(prev + 1, Lane.RIGHT)); 
                    playSound('woosh'); 
                    break;
                case 'ArrowUp': case 'w': case ' ': 
                    if (!isJumpingRef.current) {
                        if (isSlidingRef.current) {
                            setIsSliding(false);
                            if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
                        }
                        setIsJumping(true);
                        playSound('jump');
                        if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
                        jumpTimeoutRef.current = setTimeout(() => setIsJumping(false), JUMP_DURATION * 1000);
                    }
                    break;
                case 'ArrowDown': case 's': 
                    if (isJumpingRef.current) {
                        setIsJumping(false);
                        if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
                    }
                    setIsSliding(true);
                    playSound('woosh');
                    if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
                    slideTimeoutRef.current = setTimeout(() => setIsSliding(false), SLIDE_DURATION * 1000);
                    break;
            }
        };

        let touchStartX = 0; let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; };
        const handleTouchEnd = (e: TouchEvent) => {
            if (state !== GameState.PLAYING) return;
            const diffX = touchStartX - e.changedTouches[0].clientX;
            const diffY = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 30) {
                    if (diffX > 0) setCurrentLane(prev => Math.max(prev - 1, Lane.LEFT)); else setCurrentLane(prev => Math.min(prev + 1, Lane.RIGHT));
                    playSound('woosh');
                }
            } else {
                if (Math.abs(diffY) > 30) {
                    if (diffY > 0) {
                        if (!isJumpingRef.current) {
                            if (isSlidingRef.current) {
                                setIsSliding(false);
                                if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
                            }
                            setIsJumping(true);
                            playSound('jump');
                            if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
                            jumpTimeoutRef.current = setTimeout(() => setIsJumping(false), JUMP_DURATION * 1000);
                        }
                    } else {
                        if (isJumpingRef.current) {
                            setIsJumping(false);
                            if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
                        }
                        setIsSliding(true);
                        playSound('woosh');
                        if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
                        slideTimeoutRef.current = setTimeout(() => setIsSliding(false), SLIDE_DURATION * 1000);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [state]);

    const onPlayerHit = () => {
        if (activeBlessing?.effectType === 'INVINCIBILITY' || activeBlessing?.effectType === 'GHOST_COMPANION') return;
        if (gameMode === 'STORY' && distanceTraveledRef.current > 14900) return;

        if (isHitRef.current) return;
        isHitRef.current = true;
        setIsHit(true);
        handleCollision();
        
        if (hitTimeoutRef.current) clearTimeout(hitTimeoutRef.current);
        hitTimeoutRef.current = setTimeout(() => {
            setIsHit(false);
            isHitRef.current = false;
        }, INVULNERABILITY_DURATION);
    };

    // Main Game Loop
    useFrame((stateThree, delta) => {
        if (state === GameState.MUSEUM) return;
        if (state !== GameState.PLAYING) return;

        let timeScale = accessibility.slowMode ? 0.7 : 1.0;
        if (activeBlessing?.effectType === 'SLOW_MO') timeScale = 0.5;
        const effectiveDelta = delta * timeScale;

        // --- 1. Physics Update ---
        const currentDistance = distanceTraveledRef.current;

        if (gameMode === 'STORY' && currentDistance > 15000) {
            audioSystem.playSound('collect'); 
            setGameState(GameState.VICTORY);
            return;
        }

        const actMultiplier = ACT_STRUCTURE[currentAct].difficultyMultiplier;
        
        if (gameMode === 'STORY') {
             isStormRef.current = currentDistance > 6500 && currentDistance < 8000; 
        } else {
             isStormRef.current = currentAct === Act.DIVING && (currentDistance % 1000 > 600);
        }

        const stormSpeedMult = isStormRef.current ? 1.5 : 1.0;
        const blessingSpeedMult = activeBlessing?.effectType === 'SPEED_BOOST' ? 1.2 : 1.0;
        const phase3SpeedMult = (gameMode === 'STORY' && currentDistance >= 14600) ? 1.15 : 1.0;

        const rawSpeed = INITIAL_SPEED + (currentDistance * SPEED_ACCELERATION);
        const cap = gameMode === 'ENDLESS' ? 120 : MAX_SPEED;
        const targetSpeed = Math.min(rawSpeed, cap) * actMultiplier * stormSpeedMult * blessingSpeedMult * phase3SpeedMult;
        
        speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, effectiveDelta * 0.5);

        const moveAmount = speedRef.current * effectiveDelta;
        distanceTraveledRef.current += moveAmount * 0.5;
        
        updateDistance(distanceTraveledRef.current);
        
        const endlessMult = gameMode === 'ENDLESS' ? 1 + (currentDistance / 2000) : 1;
        addScore(moveAmount * endlessMult);
        
        audioSystem.update(effectiveDelta, currentAct, gameMode);

        if (prevJumpingRef.current && !isJumping) {
            effectsRef.current?.spawnDust(playerPosRef.current);
            triggerShake(0.2);
            playSound('land');
        }
        prevJumpingRef.current = isJumping;

        // Camera
        if (shakeRef.current > 0) {
            const intensity = shakeRef.current;
            camera.position.x = baseCameraPos.current.x + (Math.random() - 0.5) * intensity;
            camera.position.y = baseCameraPos.current.y + (Math.random() - 0.5) * intensity;
            shakeRef.current = THREE.MathUtils.lerp(shakeRef.current, 0, effectiveDelta * 5);
        } else {
             if (currentAct === Act.DIVING && !accessibility.reduceMotion) {
                 const rock = Math.sin(stateThree.clock.elapsedTime * 2) * 0.05;
                 const heave = Math.sin(stateThree.clock.elapsedTime * 1.5) * 0.1;
                 camera.position.y = baseCameraPos.current.y + heave;
                 camera.rotation.z = rock;
             } else {
                 camera.position.lerp(baseCameraPos.current, effectiveDelta * 2);
                 camera.rotation.z = 0;
             }
        }
        camera.lookAt(0, 3, 20);

        // --- 2. Collision & Logic ---
        
        obstacles.forEach(obs => {
            const currentZ = obs.z - distanceTraveledRef.current;
            
            if (!isHitRef.current && checkCollision(playerPosRef.current, currentZ, obs.lane, obs.type, isSlidingRef.current, isJumpingRef.current)) {
                onPlayerHit();
            }

            if (!interactedRef.current.has(obs.id)) {
                 if (currentZ < 1 && currentZ > -1) { 
                     if (obs.type === ObstacleType.MARKET_STALL) playSound('market');
                     if (obs.type === ObstacleType.DHOW) playSound('harbor');
                     interactedRef.current.add(obs.id); 
                 }
                 if (currentZ > -1 && currentZ < 1 && !isHitRef.current) {
                     const obstacleX = obs.lane * LANE_WIDTH;
                     if (Math.abs(playerPosRef.current.x - obstacleX) < 1.8) { triggerNearMiss(); interactedRef.current.add(obs.id); }
                     if (Math.abs(playerPosRef.current.x - obstacleX) < 0.5 && isJumping && playerPosRef.current.y < 2.0) { triggerNearMiss(); interactedRef.current.add(obs.id); }
                 }
            }
        });

        collectibles.forEach(p => {
             if (interactedRef.current.has(p.id)) return;
             
             const isMagnet = activeBlessing?.effectType === 'MAGNET' || activeBlessing?.effectType === 'GHOST_COMPANION';
             let currentZ = p.z - distanceTraveledRef.current;
             let currentX = p.lane * LANE_WIDTH;

             if (isMagnet && currentZ < 15 && currentZ > -2) {
                 const dx = currentX - playerPosRef.current.x;
                 const dz = currentZ - playerPosRef.current.z;
                 if (Math.sqrt(dx*dx + dz*dz) < 1.5) {
                     effectsRef.current?.spawnPearlBurst(playerPosRef.current);
                     collectItem();
                     interactedRef.current.add(p.id);
                 }
             } else {
                 if (checkCollection(playerPosRef.current, currentZ, p.lane, p.y, accessibility.autoCollect)) {
                    effectsRef.current?.spawnPearlBurst(playerPosRef.current);
                    collectItem();
                    interactedRef.current.add(p.id);
                 }
             }
        });

        // --- 3. CLEANUP & SPAWNING ---
        // Road Chunk Logic (Replacing Infinite Plane for Act 1, 2, 4, 5)
        if (currentAct !== Act.DIVING) {
            const CHUNK_LENGTH = 20;
            const DRAW_DISTANCE = 100;
            
            // Init Chunks if empty (Fail-safe, primarily done in useEffect now)
            if (roadChunks.length === 0) {
                const initialChunks = [];
                for(let z = -20; z < DRAW_DISTANCE; z+=CHUNK_LENGTH) {
                    initialChunks.push({
                        id: Math.random().toString(),
                        z: z,
                        type: currentAct === Act.HARBOR ? 'harbor' : 'sand'
                    });
                }
                setRoadChunks(initialChunks as any);
            } else {
                // Check if we need new chunks
                const lastChunk = roadChunks[roadChunks.length - 1];
                const lastChunkZ = lastChunk.z - distanceTraveledRef.current;
                
                if (lastChunkZ < DRAW_DISTANCE) {
                    const newChunkZ = lastChunk.z + CHUNK_LENGTH;
                    setRoadChunks(prev => [
                        ...prev.filter(c => (c.z - distanceTraveledRef.current) > -30), // Cleanup old
                        {
                            id: Math.random().toString(),
                            z: newChunkZ,
                            type: currentAct === Act.HARBOR ? 'harbor' : 'sand'
                        } as any
                    ]);
                }
            }
        }

        if (lastObstacleZ.current - distanceTraveledRef.current < SPAWN_DISTANCE_BUFFER) {
            const complexity = getPatternComplexity(distanceTraveledRef.current, currentAct, gameMode);
            const pattern = getRandomPattern(complexity, currentAct, isStormRef.current, distanceTraveledRef.current, gameMode);
            const baseSpawnZ = lastObstacleZ.current + 20; 

            const newObstacles: ObstacleData[] = [];
            pattern.obstacles.forEach((obsDef) => {
                const lanes = resolveLane(obsDef.lane);
                lanes.forEach(lane => {
                    newObstacles.push({
                        id: Math.random().toString(),
                        type: resolveType(obsDef.type, currentAct, distanceTraveledRef.current, gameMode),
                        lane: lane,
                        z: baseSpawnZ + obsDef.zOffset,
                        passed: false
                    });
                });
            });

            const newCollectibles: CollectibleData[] = [];
            if (Math.random() > 0.4 || distanceTraveledRef.current > 14900) { 
                 const lane = Math.floor(Math.random() * 3) - 1;
                 let type: CollectibleData['type'] = 'DATE';
                 if (currentAct === Act.TRAINING_GROUNDS) type = 'DATE';
                 else if (currentAct === Act.HARBOR) type = 'DIVING_GEAR';
                 else if (currentAct === Act.DIVING) {
                     const r = Math.random();
                     if (r > 0.98) type = 'PEARL_GOLDEN';
                     else if (r > 0.90) type = 'PEARL_PINK';
                     else type = 'PEARL_WHITE';
                 } else if (currentAct === Act.DESERT) type = 'TRADE_GOOD';
                 else if (currentAct === Act.HOMECOMING) {
                     if (gameMode === 'STORY') {
                        if (distanceTraveledRef.current > 14600) type = 'COIN_GOLD';
                        else if (distanceTraveledRef.current > 14000) type = Math.random() > 0.3 ? 'COIN_GOLD' : 'TRADE_GOOD';
                        else type = Math.random() > 0.4 ? 'TRADE_GOOD' : 'COIN_GOLD';
                     } else {
                         type = 'COIN_GOLD';
                     }
                 }

                 newCollectibles.push({
                    id: Math.random().toString(),
                    lane: lane as Lane,
                    z: baseSpawnZ + (Math.random() * pattern.length),
                    y: 0.5,
                    type: type
                 });
            }

            const newBuildings: {id: string, x: number, z: number, type: number}[] = [];
            const newNpcs: {id: string, x: number, z: number, type: 'merchant'|'villager'|'gazelle'}[] = [];

            if(Math.random() > 0.3) {
                 if (currentAct === Act.TRAINING_GROUNDS || currentAct === Act.HARBOR) {
                     // Act 1: Spawn Arish Houses instead of Generic Buildings
                     const buildingType = currentAct === Act.TRAINING_GROUNDS ? 2 : Math.floor(Math.random()*2);
                     newBuildings.push(
                        { id: Math.random().toString(), x: -12, z: baseSpawnZ, type: buildingType },
                        { id: Math.random().toString(), x: 12, z: baseSpawnZ, type: buildingType }
                     );
                     
                     if (Math.random() > 0.5) {
                        newNpcs.push({
                            id: Math.random().toString(),
                            x: (Math.random() > 0.5 ? -6 : 6) + (Math.random() - 0.5),
                            z: baseSpawnZ + 5,
                            type: Math.random() > 0.5 ? 'merchant' : 'villager'
                        });
                    }
                    
                    // Act 1: Spawn Gazelles on the side
                    if (currentAct === Act.TRAINING_GROUNDS && Math.random() > 0.6) {
                        newNpcs.push({
                            id: Math.random().toString(),
                            x: (Math.random() > 0.5 ? -12 : 12), // Closer to road
                            z: baseSpawnZ + Math.random() * 5,
                            type: 'gazelle'
                        });
                    }

                 } else if (currentAct === Act.DIVING) {
                      if (Math.random() > 0.8) {
                        newBuildings.push({ id: Math.random().toString(), x: (Math.random() > 0.5 ? -30 : 30), z: baseSpawnZ, type: 0 });
                      }
                 } else if (currentAct === Act.DESERT) {
                     if (Math.random() > 0.8) {
                        newBuildings.push({ id: Math.random().toString(), x: (Math.random() > 0.5 ? -20 : 20), z: baseSpawnZ, type: 0 });
                      }
                 } else if (currentAct === Act.HOMECOMING) {
                     if (gameMode === 'STORY' && distanceTraveledRef.current > 14000) {
                         newBuildings.push(
                            { id: Math.random().toString(), x: -10, z: baseSpawnZ, type: 1 },
                            { id: Math.random().toString(), x: 10, z: baseSpawnZ, type: 1 }
                         );
                         if (distanceTraveledRef.current > 14200 && !mosqueSpawnedRef.current) {
                             newBuildings.push({ id: 'mosque', x: 20, z: baseSpawnZ + 20, type: 99 });
                             mosqueSpawnedRef.current = true;
                         }
                     } else {
                         newBuildings.push(
                            { id: Math.random().toString(), x: -12, z: baseSpawnZ, type: Math.floor(Math.random()*3) },
                            { id: Math.random().toString(), x: 12, z: baseSpawnZ, type: Math.floor(Math.random()*3) }
                         );
                     }
                 }
            }

            const cutoff = distanceTraveledRef.current - 20;

            setObstacles(prev => [...prev.filter(o => o.z > cutoff), ...newObstacles]);
            setCollectibles(prev => [...prev.filter(c => c.z > cutoff), ...newCollectibles]);
            setBuildings(prev => [...prev.filter(b => b.z > cutoff), ...newBuildings]);
            setNpcs(prev => [...prev.filter(n => n.z > cutoff), ...newNpcs]);

            const gap = getGapForAct(currentAct, distanceTraveledRef.current, gameMode);
            lastObstacleZ.current = baseSpawnZ + pattern.length + gap;
        }
    });
    
    // Environment Colors
    let groundColor = COLORS.sand;
    let pathColor = "#D9B985";
    
    if (currentAct === Act.HARBOR) {
        groundColor = COLORS.harborWood;
        pathColor = "#8B7355";
    } else if (currentAct === Act.DIVING) {
        groundColor = "#8B7355";
        pathColor = "#A0826D";
    } else if (currentAct === Act.DESERT) {
        groundColor = COLORS.desertSand;
        pathColor = "#DEB887";
    } else if (currentAct === Act.HOMECOMING) {
        groundColor = COLORS.sand;
        pathColor = COLORS.dirtPath;
    }

    const isStorm = isStormRef.current;
    const lightsOn = (currentAct === Act.HOMECOMING && gameMode === 'STORY' && distanceTraveledRef.current > 13500) || (gameMode === 'ENDLESS' && currentAct === Act.HOMECOMING);

    if (state === GameState.MUSEUM) {
        return (
            <group>
                <EnvironmentController isStorm={false} currentDistance={0} mode={state} gameMode={gameMode} act={currentAct} highContrast={false} />
                <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 6} />
                
                {museumItem === 'DHOW' && (
                    <group rotation={[0, -Math.PI/4, 0]} scale={0.5}>
                        <DhowBoat position={[0, -2, 0]} />
                    </group>
                )}
                
                {museumItem === 'PEARL' && (
                    <group scale={3}>
                        <PearlMesh type="PEARL_WHITE" />
                        <group position={[1.5, 0, 0]}>
                            <PearlMesh type="PEARL_PINK" />
                        </group>
                        <group position={[-1.5, 0, 0]}>
                            <PearlMesh type="PEARL_GOLDEN" />
                        </group>
                    </group>
                )}

                {museumItem === 'GEAR' && (
                     <group scale={2}>
                        <DivingGearMesh />
                        <group position={[0, 0, -1]}>
                             <DivingWeights position={[0,-0.5,0]} />
                        </group>
                     </group>
                )}
            </group>
        );
    }

    const handleAnnotationClick = (id: string) => {
        if (!culturalMode) return;
        const annotation = Object.values(CULTURAL_ANNOTATIONS).find(a => a.id === id);
        if (annotation) {
            setActiveAnnotation(annotation);
        }
    };

    return (
        <group>
            <EnvironmentController isStorm={isStorm} currentDistance={distanceTraveledRef.current} mode={state} gameMode={gameMode} act={currentAct} highContrast={accessibility.highContrast} />
            
            {(state === GameState.PHOTO || state === GameState.PAUSED) && (
                <OrbitControls target={[0, 1.5, 0]} enablePan={true} />
            )}

            <Player 
                gameState={state}
                currentLane={currentLane} 
                isJumping={isJumping} 
                isSliding={isSliding}
                isHit={isHit}
                onPositionUpdate={(pos) => playerPosRef.current.copy(pos)}
            />
            
            {(activeBlessing?.effectType === 'GHOST_COMPANION' || (gameMode === 'STORY' && distanceTraveledRef.current > 14900)) && (
                <group position={[playerPosRef.current.x - 2, 0, playerPosRef.current.z]}>
                     <NPC position={[0,0,0]} type="villager" />
                     <mesh position={[0, 1, 0]}>
                        <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
                        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} wireframe />
                     </mesh>
                     <pointLight color="#FFD700" intensity={1} distance={3} />
                </group>
            )}

            <Effects ref={effectsRef} />

            {/* Obstacles Rendering (Same as before) */}
            {obstacles.map(obs => {
                const model = OBSTACLE_MODELS[obs.type];
                let Component = null;
                const annotationKey = Object.keys(CULTURAL_ANNOTATIONS).find(key => key === obs.type);
                const annotation = annotationKey ? CULTURAL_ANNOTATIONS[annotationKey] : undefined;

                switch(obs.type) {
                    case ObstacleType.DHOW: Component = <DhowBoat position={[0, 0, 0]} />; break;
                    case ObstacleType.MARKET_STALL: Component = <MarketStall position={[0, 0, 0]} />; break;
                    case ObstacleType.CAMEL_WALKING: Component = <Camel position={[0, 0, 0]} isWalking={true} />; break;
                    case ObstacleType.PALM_TRUNK: Component = <PalmTree position={[0, 0, 0]} scale={1.0} />; break; // Renders full tree
                    case ObstacleType.FALAJ_CROSSING: Component = <FalajCrossing position={[0, 0, 0]} />; break; // New
                    case ObstacleType.LAUNDRY: Component = <LaundryLine position={[0, 0, 0]} />; break;
                    case ObstacleType.WATER_JAR: Component = <WaterJar position={[0, 0, 0]} />; break;
                    case ObstacleType.LOW_WALL: Component = <mesh position={[0, 0.4, 0]}><boxGeometry args={[2.5, 0.8, 0.5]} /><meshStandardMaterial color={COLORS.stone} /></mesh>; break;
                    
                    case ObstacleType.CARGO_CRATE: Component = <CargoCrate position={[0, 0, 0]} />; break;
                    case ObstacleType.ROPE_COIL: Component = <RopeCoil position={[0, 0, 0]} />; break;
                    case ObstacleType.HANGING_NET: Component = <HangingNet position={[0, 0, 0]} />; break;
                    case ObstacleType.WOODEN_BEAM: Component = <mesh position={[0, 1.4, 0]}><boxGeometry args={[7.5, 0.6, 0.6]} /><meshStandardMaterial color={COLORS.wood} /></mesh>; break;
                    case ObstacleType.DOCK_POST: Component = <DockPost position={[0, 0, 0]} />; break;

                    case ObstacleType.OYSTER_BASKET: Component = <OysterBasket position={[0, 0, 0]} />; break;
                    case ObstacleType.DIVING_WEIGHTS: Component = <DivingWeights position={[0, 0, 0]} />; break;
                    case ObstacleType.WOODEN_CHEST: Component = <WoodenChest position={[0, 0, 0]} />; break;
                    case ObstacleType.COILED_DIVING_ROPE: Component = <RopeCoil position={[0, 0, 0]} />; break;
                    case ObstacleType.SAIL_CANVAS: Component = <SailCanvas position={[0, 0, 0]} />; break;
                    case ObstacleType.DRYING_NETS: Component = <DryingNets position={[0, 0, 0]} />; break;
                    case ObstacleType.MAST_BOOM: Component = <MastBoom position={[0, 0, 0]} />; break;
                    case ObstacleType.OVERHEAD_RIGGING: Component = <OverheadRigging position={[0, 0, 0]} />; break;
                    case ObstacleType.MAIN_MAST: Component = <MainMast position={[0, 0, 0]} />; break;
                    case ObstacleType.CREW_GROUP: Component = <CrewGroup position={[0, 0, 0]} />; break;
                    case ObstacleType.CAPTAIN_STATION: Component = <CaptainStation position={[0, 0, 0]} />; break;
                    
                    case ObstacleType.SAND_DUNE: Component = <SandDune position={[0, 0, 0]} />; break;
                    case ObstacleType.DESERT_SHRUB: Component = <DesertShrub position={[0, 0, 0]} />; break;
                    case ObstacleType.ROCK_FORMATION: Component = <RockFormation position={[0, 0, 0]} />; break;
                    case ObstacleType.CAMEL_RESTING: Component = <CamelResting position={[0, 0, 0]} />; break;
                    case ObstacleType.LOW_TENT: Component = <LowTent position={[0, 0, 0]} />; break;
                    case ObstacleType.TALL_CACTUS: Component = <TallCactus position={[0, 0, 0]} />; break;
                    case ObstacleType.ROPE_LINE: Component = <RopeLine position={[0, 0, 0]} />; break;
                    case ObstacleType.SUPPLY_PILE: Component = <SupplyPile position={[0, 0, 0]} />; break;

                    case ObstacleType.FARM_FENCE: Component = <FarmFence position={[0, 0, 0]} />; break;
                    case ObstacleType.WATER_CHANNEL: Component = <WaterChannel position={[0, 0, 0]} />; break;
                    case ObstacleType.HARVEST_BASKET: Component = <HarvestBasket position={[0, 0, 0]} />; break;
                    case ObstacleType.TREE_BRANCH: Component = <TreeBranch position={[0, 0, 0]} />; break;
                    case ObstacleType.DRYING_ROPE: Component = <DryingRope position={[0, 0, 0]} />; break;
                    case ObstacleType.FARM_WORKER: Component = <FarmWorker position={[0, 0, 0]} />; break;
                    case ObstacleType.STACKED_SUPPLIES: Component = <StackedSupplies position={[0, 0, 0]} />; break;

                    case ObstacleType.MARKET_GOODS: Component = <MarketGoods position={[0, 0, 0]} />; break;
                    case ObstacleType.CHILDREN_PLAYING: Component = <ChildrenPlaying position={[0, 0, 0]} />; break;
                    case ObstacleType.WATER_JAR_GROUP: Component = <WaterJar position={[0, 0, 0]} />; break;
                    case ObstacleType.CELEBRATION_BANNER: Component = <CelebrationBanner position={[0, 0, 0]} />; break;
                    case ObstacleType.LANTERN_STRING: Component = <LanternString position={[0, 0, 0]} />; break;
                    case ObstacleType.GREETING_ELDER: Component = <GreetingElder position={[0, 0, 0]} />; break;
                    case ObstacleType.VILLAGE_STALL: Component = <MarketStall position={[0, 0, 0]} />; break;

                    case ObstacleType.CELEBRATION_DRUM: Component = <CelebrationDrum position={[0, 0, 0]} />; break;
                    case ObstacleType.FLOWER_GARLAND: Component = <FlowerGarland position={[0, 0, 0]} />; break;

                    default: 
                        Component = <mesh position={[0, model.height/2, 0]} castShadow><boxGeometry args={[model.width, model.height, model.depth]} /><meshStandardMaterial color={model.color} /></mesh>;
                }
                const showIndicator = activeBlessing?.effectType === 'NAVIGATOR_SIGHT';

                return (
                    <MovableObject 
                        key={obs.id} 
                        initialZ={obs.z} 
                        offsetX={obs.lane * LANE_WIDTH} 
                        distanceRef={distanceTraveledRef}
                        annotationId={culturalMode && annotation ? annotation.id : undefined}
                        onAnnotationClick={handleAnnotationClick}
                        highlight={culturalMode && !!annotation}
                    >
                        {Component}
                        {showIndicator && (
                             <group position={[0, 3.5, 0]}>
                                 <mesh rotation={[Math.PI, 0, 0]}>
                                     <coneGeometry args={[0.3, 0.6, 4]} />
                                     <meshBasicMaterial color="#FFD700" />
                                 </mesh>
                                 <pointLight color="#FFD700" intensity={0.5} distance={2} />
                             </group>
                        )}
                    </MovableObject>
                );
            })}

            {collectibles.map(p => {
                if (interactedRef.current.has(p.id)) return null;
                return (
                    <MovableObject key={p.id} initialZ={p.z} offsetX={p.lane * LANE_WIDTH} distanceRef={distanceTraveledRef}>
                        <group position={[0, p.y, 0]}>
                            {p.type === 'DATE' ? <DateMesh /> : 
                            p.type === 'DIVING_GEAR' ? <DivingGearMesh /> : 
                            <PearlMesh type={p.type as any} />}
                        </group>
                    </MovableObject>
                );
            })}

            {buildings.map(b => (
                 <MovableObject key={b.id} initialZ={b.z} offsetX={b.x} distanceRef={distanceTraveledRef}>
                    {currentAct === Act.DIVING ? (
                        <DhowBoat position={[0, 0, 0]} />
                    ) : b.type === 99 ? (
                         <Mosque position={[0, 0, 0]} />
                    ) : (
                        b.type === 0 ? <PalmTree position={[0, 0, 0]} scale={1.5} /> : 
                        b.type === 2 ? <ArishHouse position={[0,0,0]} height={2.5} lightsOn={lightsOn} /> :
                        <Building position={[0, 0, 0]} height={b.type === 1 ? 5 : 3} lightsOn={lightsOn} />
                    )}
                 </MovableObject>
            ))}
            
            {npcs.map(n => (
                <MovableObject key={n.id} initialZ={n.z} offsetX={n.x} distanceRef={distanceTraveledRef}>
                    {n.type === 'gazelle' ? (
                        <Gazelle position={[0,0,0]} />
                    ) : (
                        <NPC position={[0, 0, 0]} type={n.type as any} />
                    )}
                </MovableObject>
            ))}

            {/* Scrolling Road Segments */}
            {roadChunks.map(chunk => (
                <MovableObject key={chunk.id} initialZ={chunk.z} offsetX={0} distanceRef={distanceTraveledRef}>
                    <RoadChunk type={chunk.type} length={20} />
                </MovableObject>
            ))}

            {/* Static Sea Floor for Act 3 (Diving) */}
            {currentAct === Act.DIVING && (
                 <group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                        <planeGeometry args={[12, 200]} />
                        <meshStandardMaterial color="#8B7355" roughness={0.9} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-50, -0.5, 0]}>
                         <planeGeometry args={[80, 200]} />
                         <meshStandardMaterial color={COLORS.water} roughness={0.1} metalness={0.6} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, -0.5, 0]}>
                         <planeGeometry args={[80, 200]} />
                         <meshStandardMaterial color={COLORS.water} roughness={0.1} metalness={0.6} />
                    </mesh>
                 </group>
            )}
        </group>
    );
};

const GameScene: React.FC<{ sessionId: number; shakeRef: MutableRefObject<number> }> = ({ sessionId, shakeRef }) => {
    const gameContext = useContext(GameContext);

    return (
        <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 4, -8], fov: 60 }}>
            <GameContext.Provider value={gameContext}>
                <Suspense fallback={null}>
                    <WorldContent shakeRef={shakeRef} key={sessionId} />
                </Suspense>
            </GameContext.Provider>
        </Canvas>
    );
};

export default GameScene;
