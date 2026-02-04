
import React, { useRef, useState, useEffect, useContext, Suspense, MutableRefObject, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GameContext } from './App';
import { GameState, Lane, ObstacleType, ObstacleData, CollectibleData, Act, Complexity, PatternDef, GameMode } from './types';
import { LANE_WIDTH, OBSTACLE_MODELS, INITIAL_SPEED, MAX_SPEED, SPEED_ACCELERATION, COLORS, PATH_WIDTH, NARRATIVE_MOMENTS, TIME_PERIODS, ACT_STRUCTURE, OBSTACLE_PATTERNS, SPAWN_DISTANCE_BUFFER, INVULNERABILITY_DURATION, JUMP_DURATION, SLIDE_DURATION, CULTURAL_ANNOTATIONS } from './constants';
import Player from './Player';
import { PalmTree, DhowBoat, MarketStall, Building, PearlMesh, DateMesh, DivingGearMesh, WaterJar, LaundryLine, NPC, CargoCrate, RopeCoil, HangingNet, DockPost, OysterBasket, DivingWeights, WoodenChest, SailCanvas, DryingNets, MastBoom, OverheadRigging, MainMast, CrewGroup, CaptainStation, SandDune, DesertShrub, RockFormation, CamelResting, LowTent, GhafTree, RopeLine, SupplyPile, FarmFence, WaterChannel, HarvestBasket, TreeBranch, DryingRope, FarmWorker, StackedSupplies, MarketGoods, ChildrenPlaying, CelebrationBanner, LanternString, GreetingElder, Mosque, CelebrationDrum, FlowerGarland, RoadChunk, ArishHouse, Camel, Gazelle, FalajCrossing, HijabWoman, KanduraMan, Jalboot, Sambuk, CoralReef, Jellyfish, SeaTurtle, Stingray, OysterBed, SeaweedTall, RockUnderwater, HamourFish, SafiFish, ShaariFish, FishDryingRack, PearlBasket, MooringPost, CargoSacks, EmiratiMan, EmiratiChild, BedouinTent, CamelCaravan, TradeRouteMarker, DesertWell, SpiceSacks, ArabianOryx, HangingTradeFabric, WadiCrossing, TentRopeLines, FallenTradeGoods, BedouinTrader, CaravanCampfire, FalconPerch, LowCamelSaddle, WaterSkin, SittingCamelWithSaddle } from './AssetLibrary';
import Effects, { EffectsHandle } from './Effects';
import { audioSystem, playSound } from './audio';

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

// --- Difficulty & Spawning Logic ---
const getPatternComplexity = (distance: number, act: Act, mode: GameMode): Complexity => {
    if (mode === 'ENDLESS') {
        return 'EXTREME';  // EXTREME only from 1m!
    }

    // Act 1: Training (0 - 2000m) - EXTREME ONLY!
    if (act === Act.TRAINING_GROUNDS) {
        return 'EXTREME';  // EXTREME from 1m!
    }
    // Act 2: Harbor (2000 - 5000m)
    if (act === Act.HARBOR) {
        if (distance < 2800) return 'SIMPLE'; 
        if (distance < 4000) return 'MEDIUM'; 
        return 'HARD'; 
    }
    // Act 3: Diving (5000 - 8200m) - Storm at 6000-7000m
    if (act === Act.DIVING) {
        if (distance < 5500) return 'SIMPLE';
        if (distance >= 6000 && distance < 7000) return 'EXTREME'; // Storm Peak
        if (distance < 7500) return 'HARD';
        return 'MEDIUM';
    }
    // Act 4: Desert (8200 - 11500m)
    if (act === Act.DESERT) {
        if (distance < 9000) return 'SIMPLE';
        if (distance < 10500) return 'MEDIUM';
        return 'HARD';
    }
    // Act 5: Homecoming (11500 - 15000m)
    if (act === Act.HOMECOMING) {
        if (distance >= 14200) return 'TRIVIAL'; // Final celebration
        if (distance < 12500) return 'SIMPLE';
        if (distance < 13500) return 'MEDIUM';
        return 'SIMPLE'; // Ease up near the end
    }
    return 'MEDIUM'; 
};

const getGapForAct = (act: Act, distance: number, mode: GameMode): number => {
    if (mode === 'ENDLESS') {
        return Math.max(10, 30 - (distance / 1000));
    }

    // Act 1: Training (0 - 2000m) - Generous gaps for learning
    if (act === Act.TRAINING_GROUNDS) return 26;
    
    // Act 2: Harbor (2000 - 5000m) - Slightly tighter than Act 1
    if (act === Act.HARBOR) {
        return 26;
    }
    
    // Act 3: Diving (5000 - 8200m) - Tighter during storm
    if (act === Act.DIVING) {
        if (distance >= 6000 && distance < 7000) return 20; // Storm - tighter
        return 35; 
    }
    
    // Act 4: Desert (8200 - 11500m)
    if (act === Act.DESERT) {
        return 30; 
    }
    
    // Act 5: Homecoming (11500 - 15000m)
    if (act === Act.HOMECOMING) {
        if (distance >= 14200) return 50; // Celebration - easier
        return 28;
    }
    return 25; 
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

// --- SKY COMPONENT (Enhanced with 3-band gradient support for Desert) ---
const SkyGradient: React.FC<{ 
    topColor: string; 
    bottomColor: string;
    midColor?: string;  // Optional middle color for 3-band gradient
    midPosition?: number; // Position of middle band (0-1, default 0.5)
}> = ({ topColor, bottomColor, midColor, midPosition = 0.5 }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const hasMidColor = !!midColor;
  
  // Update shader uniforms when props change
  useEffect(() => {
      if (mesh.current) {
          const material = mesh.current.material as THREE.ShaderMaterial;
          material.uniforms.topColor.value.set(topColor);
          material.uniforms.bottomColor.value.set(bottomColor);
          if (hasMidColor && material.uniforms.midColor) {
              material.uniforms.midColor.value.set(midColor);
              material.uniforms.midPosition.value = midPosition;
          }
      }
  }, [topColor, bottomColor, midColor, midPosition, hasMidColor]);

  const shaderArgs = useMemo(() => ({
      uniforms: {
          topColor: { value: new THREE.Color(topColor) },
          bottomColor: { value: new THREE.Color(bottomColor) },
          midColor: { value: new THREE.Color(midColor || topColor) },
          midPosition: { value: midPosition },
          useMidColor: { value: hasMidColor ? 1.0 : 0.0 },
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
          uniform vec3 midColor;
          uniform float midPosition;
          uniform float useMidColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          
          void main() {
              float h = normalize( vWorldPosition + offset ).y;
              float t = max( pow( max( h, 0.0 ), exponent ), 0.0 );
              
              vec3 color;
              if (useMidColor > 0.5) {
                  // 3-band gradient: bottom -> mid -> top
                  if (t < midPosition) {
                      // Bottom to mid
                      float localT = t / midPosition;
                      color = mix(bottomColor, midColor, smoothstep(0.0, 1.0, localT));
                  } else {
                      // Mid to top
                      float localT = (t - midPosition) / (1.0 - midPosition);
                      color = mix(midColor, topColor, smoothstep(0.0, 1.0, localT));
                  }
              } else {
                  // Standard 2-band gradient
                  color = mix(bottomColor, topColor, t);
              }
              
              gl_FragColor = vec4(color, 1.0);
          }
      `,
      side: THREE.BackSide
  }), [hasMidColor]);

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

        // Smoother, deeper fog for better horizon blending
        const fogColor = new THREE.Color(config.fog);
        scene.fog = new THREE.Fog(fogColor, 20, 80);
        
        // FIX: Use the actual sky gradient's TOP color for scene.background
        // This prevents the orange flash during act transitions
        let backgroundFallbackColor: string;
        
        if (isStorm) {
            backgroundFallbackColor = '#3d3d5c'; // Storm sky top
        } else if (act === Act.DESERT) {
            backgroundFallbackColor = COLORS.desertSkyTop; // '#4A7BA7' dusty blue-grey
        } else if (act === Act.HOMECOMING) {
            if (currentDistance >= 14600) {
                backgroundFallbackColor = COLORS.duskSkyTop; // '#2B1B4E' deep indigo
            } else if (currentDistance >= 14000) {
                backgroundFallbackColor = COLORS.villageSkyTop; // '#1A1A3A' deep night
            } else {
                backgroundFallbackColor = COLORS.act5SkyTop; // '#5D4E6D' purple-grey
            }
        } else if (act === Act.TRAINING_GROUNDS && timeOfDay === 'MORNING') {
            backgroundFallbackColor = COLORS.skyTop; // '#87CEEB' light blue
        } else {
            backgroundFallbackColor = config.sky;
        }
        
        scene.background = new THREE.Color(backgroundFallbackColor);

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

    // Act 4 Desert: Use beautiful 3-band gradient (dusty blue → warm amber → pale cream)
    const useDesertSky = act === Act.DESERT && !isStorm;
    const desertSkyTop = COLORS.desertSkyTop;     // '#4A7BA7' dusty blue-grey
    const desertSkyMid = COLORS.desertSkyMid;     // '#D4956A' warm amber
    const desertSkyBottom = COLORS.desertSkyBottom; // '#F5E6D3' pale cream

    // Act 5 Homecoming: Use 3-band gradient with phase-based colors
    const useAct5Sky = act === Act.HOMECOMING && !isStorm;
    const getAct5SkyColors = () => {
        if (currentDistance >= 14600) {
            // Phase 3: Dusk - magical twilight reunion
            return {
                top: COLORS.duskSkyTop,      // '#2B1B4E' deep indigo
                mid: COLORS.duskSkyMid,      // '#6B4984' rich purple
                bottom: COLORS.duskSkyBottom // '#E88D72' salmon pink
            };
        } else if (currentDistance >= 14000) {
            // Phase 2: Village Night - lantern-lit celebration
            return {
                top: COLORS.villageSkyTop,    // '#1A1A3A' deep night
                mid: COLORS.villageSkyMid,    // '#4A3B6B' purple twilight
                bottom: COLORS.villageSkyBottom // '#8B5A5A' warm glow
            };
        } else {
            // Phase 1: Evening - warm sunset approach
            return {
                top: COLORS.act5SkyTop,      // '#5D4E6D' purple-grey
                mid: COLORS.act5SkyMid,      // '#E8846B' coral sunset
                bottom: COLORS.act5SkyBottom // '#FFD4A3' golden horizon
            };
        }
    };
    const act5Sky = getAct5SkyColors();

    return (
        <group>
            {!highContrast && (
                useDesertSky ? (
                    <SkyGradient 
                        topColor={desertSkyTop} 
                        bottomColor={desertSkyBottom}
                        midColor={desertSkyMid}
                        midPosition={0.4}
                    />
                ) : useAct5Sky ? (
                    <SkyGradient 
                        topColor={act5Sky.top} 
                        bottomColor={act5Sky.bottom}
                        midColor={act5Sky.mid}
                        midPosition={0.45}
                    />
                ) : (
                    <SkyGradient topColor={skyTop} bottomColor={skyBottom} />
                )
            )}

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
        triggerNearMiss, triggerShake, score, currentAct, endGame, 
        setGameState, museumItem, gameMode, accessibility, culturalMode, setActiveAnnotation,
        distance, isHarborTransition, harborTransitionPhase, isDesertTransition, desertPhase,
        isHomecomingTransition, homecomingPhase,
        // Pearl Challenge System
        pearlChallengeActive, setPearlChallengeActive, earlyPearlCount, setEarlyPearlCount,
        // Rideable Camel
        isRidingCamel, setIsRidingCamel, camelRideStartZ, setCamelRideStartZ
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
    const initializedRef = useRef(false);
    const speedRef = useRef(INITIAL_SPEED);
    const isStormRef = useRef(false);
    const mosqueSpawnedRef = useRef(false);
    const lastObstacleZ = useRef(50);
    const diveTransitionTriggeredRef = useRef(false);
    const desertTransitionTriggeredRef = useRef(false);
    const prevActRef = useRef<Act>(Act.TRAINING_GROUNDS);

    // Pearl Challenge refs
    const pearlChallengeMessageShownRef = useRef(false);
    const rideableCamelSpawnedRef = useRef(false);
    const rideableCamelRef = useRef<{ id: string; z: number; lane: Lane } | null>(null);

    const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
    const [collectibles, setCollectibles] = useState<CollectibleData[]>([]);
    const [buildings, setBuildings] = useState<{id: string, x: number, z: number, type: number}[]>([]);
    const [npcs, setNpcs] = useState<{id: string, x: number, z: number, type: 'merchant'|'villager'|'gazelle'|'hijab_woman'|'kandura_man'}[]>([]);
    const [roadChunks, setRoadChunks] = useState<{id: string, z: number, type: 'sand' | 'harbor' | 'stone' | 'transition' | 'desert' | 'village'}[]>([]);

    const interactedRef = useRef<Set<string>>(new Set());

    useEffect(() => { isJumpingRef.current = isJumping; }, [isJumping]);
    useEffect(() => { isSlidingRef.current = isSliding; }, [isSliding]);
    useEffect(() => { isHitRef.current = isHit; }, [isHit]);

    // --- INITIALIZATION ---
    // Sync distance from context on mount (for cheat codes)
    useEffect(() => {
        if (!initializedRef.current && distance > 0) {
            distanceTraveledRef.current = distance;
            lastObstacleZ.current = distance + 50;
            initializedRef.current = true;
        }
    }, [distance]);
    
    // Ensure road chunks exist on mount so the scene isn't empty during countdown
    useEffect(() => {
        const CHUNK_LENGTH = 20;
        const DRAW_DISTANCE = 100;
        const initialChunks = [];
        for(let z = -20; z < DRAW_DISTANCE; z+=CHUNK_LENGTH) {
            // Determine chunk type based on current act and transition state
            let chunkType: 'sand' | 'harbor' | 'stone' | 'transition' = 'sand';
            if (currentAct === Act.HARBOR) chunkType = 'harbor';
            else if (currentAct === Act.DIVING) chunkType = 'stone';
            else if (isHarborTransition) chunkType = 'transition';
            
            initialChunks.push({
                id: Math.random().toString(),
                z: z,
                type: chunkType
            });
        }
        setRoadChunks(initialChunks as any);
    }, [currentAct, isHarborTransition]);


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
        const effectiveDelta = delta * timeScale;

        // --- 1. Physics Update ---
        const currentDistance = distanceTraveledRef.current;

        // Victory at 15000m
        if (gameMode === 'STORY' && currentDistance >= 15000) {
            audioSystem.playSound('collect'); 
            setGameState(GameState.VICTORY);
            return;
        }

        const actMultiplier = ACT_STRUCTURE[currentAct].difficultyMultiplier;
        
        // Storm occurs during Act 3 (Diving) between 6000-7000m
        if (gameMode === 'STORY') {
             isStormRef.current = currentDistance > 6000 && currentDistance < 7000; 
        } else {
             isStormRef.current = currentAct === Act.DIVING && (currentDistance % 1000 > 600);
        }

        const stormSpeedMult = isStormRef.current ? 1.5 : 1.0;
        const phase3SpeedMult = (gameMode === 'STORY' && currentDistance >= 14200) ? 1.1 : 1.0;

        const rawSpeed = INITIAL_SPEED + (currentDistance * SPEED_ACCELERATION);
        const cap = gameMode === 'ENDLESS' ? 120 : MAX_SPEED;
        const targetSpeed = Math.min(rawSpeed, cap) * actMultiplier * stormSpeedMult * phase3SpeedMult;
        
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

        // --- DIVE TRANSITION: Act 2 → Act 3 (Harbor to Underwater) ---
        // Trigger splash effect when crossing into Act 3 (5000m)
        if (gameMode === 'STORY' && prevActRef.current === Act.HARBOR && currentAct === Act.DIVING && !diveTransitionTriggeredRef.current) {
            // Player is diving into the water!
            diveTransitionTriggeredRef.current = true;
            
            // End camel ride if active (camel cannot swim!)
            if (isRidingCamel) {
                setIsRidingCamel(false);
                showNarrative({
                    id: 'camel_farewell',
                    triggerPercent: 0,
                    text: "Your loyal companion waits on the shore as you dive into the depths..."
                });
            }
            
            // Spawn big water splash at player position
            const splashPos = new THREE.Vector3(playerPosRef.current.x, 0, playerPosRef.current.z + 5);
            effectsRef.current?.spawnDiveSplash(splashPos);
            
            // Camera shake for impact
            triggerShake(0.8);
            
            // Play splash sound
            playSound('collect'); // Using collect as placeholder, would be splash
        }

        // --- DESERT TRANSITION: Act 3 → Act 4 (Underwater to Desert) ---
        // Trigger surface splash effect when crossing into Act 4 (8200m)
        if (gameMode === 'STORY' && prevActRef.current === Act.DIVING && currentAct === Act.DESERT && !desertTransitionTriggeredRef.current) {
            // Player is surfacing from the water!
            desertTransitionTriggeredRef.current = true;
            
            // Spawn dramatic surface splash at player position
            const splashPos = new THREE.Vector3(playerPosRef.current.x, 2, playerPosRef.current.z + 3);
            effectsRef.current?.spawnSurfaceSplash(splashPos);
            
            // Strong camera shake for dramatic emergence
            triggerShake(1.0);
            
            // Play splash sound for surfacing
            playSound('collect'); // Using collect as placeholder, would be splash/surface sound
        }

        prevActRef.current = currentAct;

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
            
            // Special handling for rideable camel
            if (obs.isRideableCamel && obs.type === ObstacleType.SITTING_CAMEL) {
                // Check if player is jumping onto the camel
                if (!isRidingCamel && 
                    isJumpingRef.current && 
                    currentZ > -2 && currentZ < 3 &&
                    Math.abs(playerPosRef.current.x - obs.lane * LANE_WIDTH) < 2) {
                    // Mount the camel!
                    setIsRidingCamel(true);
                    setCamelRideStartZ(distanceTraveledRef.current);
                    playSound('collect');
                    showNarrative({
                        id: 'camel_mounted',
                        triggerPercent: 0,
                        text: "The camel rises with you aboard! Your journey continues swift and sure..."
                    });
                    interactedRef.current.add(obs.id);
                    return; // Skip normal collision
                }
            }
            
            if (!isHitRef.current && checkCollision(playerPosRef.current, currentZ, obs.lane, obs.type, isSlidingRef.current, isJumpingRef.current)) {
                // Skip collision if riding camel (invulnerable to ground obstacles)
                if (isRidingCamel) return;
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
             
             let currentZ = p.z - distanceTraveledRef.current;

             if (checkCollection(playerPosRef.current, currentZ, p.lane, p.y, accessibility.autoCollect)) {
                effectsRef.current?.spawnPearlBurst(playerPosRef.current);
                collectItem();
                interactedRef.current.add(p.id);
                
                // Pearl Challenge: Track early pearls in Act 1 (first 50 meters)
                if (currentAct === Act.TRAINING_GROUNDS && 
                    distanceTraveledRef.current < 50 && 
                    !pearlChallengeActive &&
                    p.type === 'PEARL_WHITE') {
                    const newCount = earlyPearlCount + 1;
                    setEarlyPearlCount(newCount);
                    
                    // Activate Pearl Challenge at 5 pearls
                    if (newCount >= 5 && !pearlChallengeMessageShownRef.current) {
                        pearlChallengeMessageShownRef.current = true;
                        setPearlChallengeActive(true);
                        // Show story-appropriate activation message
                        showNarrative({
                            id: 'pearl_challenge_activated',
                            triggerPercent: 0,
                            text: "The ancient merchant's blessing awakens! A loyal companion waits ahead..."
                        });
                    }
                }
             }
        });

        // --- 3. CLEANUP & SPAWNING ---
        // Road Chunk Logic (For ALL acts including DIVING - underwater environment depends on this!)
        const CHUNK_LENGTH = 20;
        const DRAW_DISTANCE = 100;
        
        // Determine road chunk type based on act and harbor transition
        const getChunkType = (): 'sand' | 'harbor' | 'stone' | 'transition' | 'desert' | 'village' => {
            // During harbor transition (1800m-2100m), use transition chunks
            if (isHarborTransition) {
                if (harborTransitionPhase === 'approaching') return 'transition';
                if (harborTransitionPhase === 'entering') return 'harbor';
                return 'harbor';
            }
            if (currentAct === Act.HARBOR) return 'harbor';
            if (currentAct === Act.DIVING) return 'stone';
            if (currentAct === Act.DESERT) return 'desert';  // Act 4: Beautiful desert with dunes
            if (currentAct === Act.HOMECOMING) return 'village'; // Act 5: Village path with lanterns
            return 'sand';
        };
        
        // Init Chunks if empty (Fail-safe, primarily done in useEffect now)
        if (roadChunks.length === 0) {
            const initialChunks = [];
            for(let z = -20; z < DRAW_DISTANCE; z+=CHUNK_LENGTH) {
                initialChunks.push({
                    id: Math.random().toString(),
                    z: z,
                    type: getChunkType()
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
                        type: getChunkType()
                    } as any
                ]);
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
            
            // Spawn the rideable camel at ~1000m if Pearl Challenge is active
            if (pearlChallengeActive && 
                !rideableCamelSpawnedRef.current && 
                distanceTraveledRef.current > 900 && 
                distanceTraveledRef.current < 1100) {
                // Spawn special rideable camel in center lane
                rideableCamelSpawnedRef.current = true;
                rideableCamelRef.current = {
                    id: 'rideable_camel_' + Math.random().toString(),
                    z: distanceTraveledRef.current + 80,  // Spawn ahead
                    lane: Lane.CENTER
                };
                newObstacles.push({
                    id: rideableCamelRef.current.id,
                    type: ObstacleType.SITTING_CAMEL,  // Will add this type
                    lane: Lane.CENTER,
                    z: rideableCamelRef.current.z,
                    passed: false,
                    isRideableCamel: true
                });
            }
            
            if (Math.random() > 0.4 || distanceTraveledRef.current > 14900) { 
                 const lane = Math.floor(Math.random() * 3) - 1;
                 let type: CollectibleData['type'] = 'DATE';
                 if (currentAct === Act.TRAINING_GROUNDS) type = 'PEARL_WHITE';  // Pearl Challenge
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
            const newNpcs: {id: string, x: number, z: number, type: 'merchant'|'villager'|'gazelle'|'hijab_woman'|'kandura_man'}[] = [];

            if(Math.random() > 0.3) {
                 if (currentAct === Act.TRAINING_GROUNDS || currentAct === Act.HARBOR) {
                     // Act 1: Spawn Arish Houses instead of Generic Buildings
                     const buildingType = currentAct === Act.TRAINING_GROUNDS ? 2 : Math.floor(Math.random()*2);
                     newBuildings.push(
                        { id: Math.random().toString(), x: -12, z: baseSpawnZ, type: buildingType },
                        { id: Math.random().toString(), x: 12, z: baseSpawnZ, type: buildingType }
                     );
                     
                     if (Math.random() > 0.5) {
                        // Spawn beautiful NPCs on the sides
                        const npcRoll = Math.random();
                        let npcType: 'merchant'|'villager'|'gazelle'|'hijab_woman'|'kandura_man';
                        if (npcRoll > 0.7) npcType = 'hijab_woman';
                        else if (npcRoll > 0.4) npcType = 'kandura_man';
                        else if (npcRoll > 0.2) npcType = 'merchant';
                        else npcType = 'villager';
                        
                        newNpcs.push({
                            id: Math.random().toString(),
                            x: (Math.random() > 0.5 ? -6 : 6) + (Math.random() - 0.5),
                            z: baseSpawnZ + 5,
                            type: npcType
                        });
                    }
                    
                    // Act 1: Spawn Gazelles and more NPCs on the side
                    if (currentAct === Act.TRAINING_GROUNDS && Math.random() > 0.6) {
                        newNpcs.push({
                            id: Math.random().toString(),
                            x: (Math.random() > 0.5 ? -12 : 12),
                            z: baseSpawnZ + Math.random() * 5,
                            type: 'gazelle'
                        });
                    }
                    
                    // Spawn HijabWoman on far sides for ambiance
                    if (Math.random() > 0.7) {
                        newNpcs.push({
                            id: Math.random().toString(),
                            x: (Math.random() > 0.5 ? -8 : 8),
                            z: baseSpawnZ + 10,
                            type: 'hijab_woman'
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
                
                {/* Traditional Boats */}
                {museumItem === 'DHOW' && (
                    <group rotation={[0, -Math.PI/4, 0]} scale={0.4}>
                        <DhowBoat position={[-3, -2, 0]} />
                        <Jalboot position={[5, -2, 3]} />
                        <Sambuk position={[-8, -2, -5]} />
                    </group>
                )}
                
                {/* Pearls Display */}
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

                {/* Diving Gear */}
                {museumItem === 'GEAR' && (
                     <group scale={2}>
                        <DivingGearMesh />
                        <group position={[1.5, 0, 0]}>
                             <DivingWeights position={[0,-0.5,0]} />
                        </group>
                        <group position={[-1.5, -0.3, 0]}>
                             <OysterBasket position={[0,0,0]} />
                        </group>
                     </group>
                )}

                {/* Gulf Fish Species */}
                {museumItem === 'FISH' && (
                    <group scale={1.5}>
                        <HamourFish position={[-2, 0, 0]} />
                        <SafiFish position={[0, 0.5, 0]} />
                        <ShaariFish position={[2, 0, 0]} />
                    </group>
                )}

                {/* Underwater Life */}
                {museumItem === 'UNDERWATER' && (
                    <group scale={1}>
                        <CoralReef position={[-3, -1, 0]} />
                        <Jellyfish position={[0, 1, 0]} />
                        <SeaTurtle position={[3, 0, 0]} />
                        <Stingray position={[0, -1, 2]} />
                        <SeaweedTall position={[-2, -1, 1]} />
                    </group>
                )}

                {/* Palm Tree */}
                {museumItem === 'PALM' && (
                    <group scale={0.8}>
                        <PalmTree position={[0, -3, 0]} scale={1} />
                    </group>
                )}

                {/* Camel */}
                {museumItem === 'CAMEL' && (
                    <group scale={1}>
                        <Camel position={[0, -1, 0]} isWalking={false} />
                    </group>
                )}

                {/* Arish House */}
                {museumItem === 'ARISH' && (
                    <group scale={0.6}>
                        <ArishHouse position={[0, -2, 0]} height={3} lightsOn={true} />
                    </group>
                )}

                {/* Traditional NPCs */}
                {museumItem === 'NPC' && (
                    <group scale={1.5}>
                        <KanduraMan position={[-1.5, -1, 0]} isTrader={false} />
                        <HijabWoman position={[1.5, -1, 0]} />
                    </group>
                )}

                {/* Harbor Life */}
                {museumItem === 'HARBOR' && (
                    <group scale={0.8}>
                        <FishDryingRack position={[-2, -1, 0]} />
                        <PearlBasket position={[0, -1, 0]} />
                        <MooringPost position={[2, -1, 0]} />
                        <CargoSacks position={[0, -1, 2]} />
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
                isSwimming={currentAct === Act.DIVING && !isDesertTransition}
                isSurfacing={isDesertTransition}
                surfacePhase={desertPhase}
                isRidingCamel={isRidingCamel}
                isHarborTransition={isHarborTransition}
                harborPhase={harborTransitionPhase}
                isHomecomingTransition={isHomecomingTransition}
                homecomingPhase={homecomingPhase}
                onPositionUpdate={(pos) => playerPosRef.current.copy(pos)}
            />
            
            {(gameMode === 'STORY' && distanceTraveledRef.current > 14900) && (
                <group position={[playerPosRef.current.x - 2, 0, playerPosRef.current.z]}>
                     <NPC position={[0,0,0]} type="villager" />
                     <mesh position={[0, 1, 0]}>
                        <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
                        <meshBasicMaterial color="#FFD700" transparent opacity={0.4} wireframe />
                     </mesh>
                     {/* Emissive glow halo - replaces point light */}
                     <mesh position={[0, 1, 0]}>
                        <sphereGeometry args={[0.8, 8, 8]} />
                        <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
                     </mesh>
                </group>
            )}

            <Effects ref={effectsRef} />

            {/* Obstacles Rendering (Same as before) */}
            {obstacles.map(obs => {
                // Hide the sitting camel once the player is riding it
                if (isRidingCamel && obs.isRideableCamel) return null;
                
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
                    case ObstacleType.LOW_WALL: Component = <mesh position={[0, 0.4, 0]}><boxGeometry args={[2.5, 0.8, 0.5]} /><meshBasicMaterial color={COLORS.stone} /></mesh>; break;
                    
                    case ObstacleType.CARGO_CRATE: Component = <CargoCrate position={[0, 0, 0]} />; break;
                    case ObstacleType.ROPE_COIL: Component = <RopeCoil position={[0, 0, 0]} />; break;
                    case ObstacleType.HANGING_NET: Component = <HangingNet position={[0, 0, 0]} />; break;
                    case ObstacleType.WOODEN_BEAM: Component = <mesh position={[0, 1.4, 0]}><boxGeometry args={[7.5, 0.6, 0.6]} /><meshBasicMaterial color={COLORS.wood} /></mesh>; break;
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
                    case ObstacleType.GHAF_TREE: Component = <GhafTree position={[0, 0, 0]} />; break;
                    case ObstacleType.ROPE_LINE: Component = <RopeLine position={[0, 0, 0]} />; break;
                    case ObstacleType.SUPPLY_PILE: Component = <SupplyPile position={[0, 0, 0]} />; break;
                    
                    // Act 4: The Caravan Trail - Beautiful 1500 CE UAE Desert
                    case ObstacleType.BEDOUIN_TENT: Component = <BedouinTent position={[0, 0, 0]} />; break;
                    case ObstacleType.CAMEL_CARAVAN: Component = <CamelCaravan position={[0, 0, 0]} />; break;
                    case ObstacleType.TRADE_ROUTE_MARKER: Component = <TradeRouteMarker position={[0, 0, 0]} />; break;
                    case ObstacleType.DESERT_WELL: Component = <DesertWell position={[0, 0, 0]} />; break;
                    case ObstacleType.SPICE_SACKS: Component = <SpiceSacks position={[0, 0, 0]} />; break;
                    case ObstacleType.ARABIAN_ORYX: Component = <ArabianOryx position={[0, 0, 0]} />; break;
                    case ObstacleType.HANGING_TRADE_FABRIC: Component = <HangingTradeFabric position={[0, 0, 0]} />; break;
                    case ObstacleType.WADI_CROSSING: Component = <WadiCrossing position={[0, 0, 0]} />; break;
                    case ObstacleType.TENT_ROPE_LINES: Component = <TentRopeLines position={[0, 0, 0]} />; break;
                    case ObstacleType.FALLEN_TRADE_GOODS: Component = <FallenTradeGoods position={[0, 0, 0]} />; break;
                    case ObstacleType.BEDOUIN_TRADER: Component = <BedouinTrader position={[0, 0, 0]} />; break;
                    case ObstacleType.CARAVAN_CAMPFIRE: Component = <CaravanCampfire position={[0, 0, 0]} />; break;
                    case ObstacleType.FALCON_PERCH: Component = <FalconPerch position={[0, 0, 0]} />; break;
                    case ObstacleType.LOW_CAMEL_SADDLE: Component = <LowCamelSaddle position={[0, 0, 0]} />; break;
                    case ObstacleType.WATER_SKIN: Component = <WaterSkin position={[0, 0, 0]} />; break;

                    case ObstacleType.FARM_FENCE: Component = <FarmFence position={[0, 0, 0]} />; break;
                    case ObstacleType.WATER_CHANNEL: Component = <WaterChannel position={[0, 0, 0]} />; break;
                    case ObstacleType.HARVEST_BASKET: Component = <HarvestBasket position={[0, 0, 0]} />; break;
                    case ObstacleType.TREE_BRANCH: Component = <TreeBranch position={[0, 0, 0]} />; break;
                    case ObstacleType.DRYING_ROPE: Component = <DryingRope position={[0, 0, 0]} />; break;
                    case ObstacleType.FARM_WORKER: Component = <EmiratiMan position={[0, 0, 0]} variant="farmer" />; break;
                    case ObstacleType.STACKED_SUPPLIES: Component = <StackedSupplies position={[0, 0, 0]} />; break;

                    case ObstacleType.MARKET_GOODS: Component = <MarketGoods position={[0, 0, 0]} />; break;
                    case ObstacleType.CHILDREN_PLAYING: Component = <group><EmiratiChild position={[-0.5, 0, 0]} gender="boy" isRunning /><EmiratiChild position={[0.5, 0, 0]} gender="girl" /></group>; break;
                    case ObstacleType.WATER_JAR_GROUP: Component = <WaterJar position={[0, 0, 0]} />; break;
                    case ObstacleType.CELEBRATION_BANNER: Component = <CelebrationBanner position={[0, 0, 0]} />; break;
                    case ObstacleType.LANTERN_STRING: Component = <LanternString position={[0, 0, 0]} />; break;
                    case ObstacleType.GREETING_ELDER: Component = <EmiratiMan position={[0, 0, 0]} variant="elder" />; break;
                    case ObstacleType.VILLAGE_STALL: Component = <MarketStall position={[0, 0, 0]} />; break;

                    case ObstacleType.CELEBRATION_DRUM: Component = <CelebrationDrum position={[0, 0, 0]} />; break;
                    case ObstacleType.FLOWER_GARLAND: Component = <FlowerGarland position={[0, 0, 0]} />; break;

                    // Act 2: Authentic 1500 CE Harbor
                    case ObstacleType.JALBOOT: Component = <Jalboot position={[0, 0, 0]} />; break;
                    case ObstacleType.SAMBUK: Component = <Sambuk position={[0, 0, 0]} />; break;
                    case ObstacleType.FISH_DRYING_RACK: Component = <FishDryingRack position={[0, 0, 0]} />; break;
                    case ObstacleType.PEARL_BASKET: Component = <PearlBasket position={[0, 0, 0]} />; break;
                    case ObstacleType.MOORING_POST: Component = <MooringPost position={[0, 0, 0]} />; break;
                    case ObstacleType.CARGO_SACKS: Component = <CargoSacks position={[0, 0, 0]} />; break;

                    // Act 3: Underwater Swimming
                    case ObstacleType.CORAL_REEF: Component = <CoralReef position={[0, 0, 0]} />; break;
                    case ObstacleType.JELLYFISH: Component = <Jellyfish position={[0, 0, 0]} />; break;
                    case ObstacleType.SEA_TURTLE: Component = <SeaTurtle position={[0, 0, 0]} />; break;
                    case ObstacleType.STINGRAY: Component = <Stingray position={[0, 0, 0]} />; break;
                    case ObstacleType.OYSTER_BED: Component = <OysterBed position={[0, 0, 0]} />; break;
                    case ObstacleType.SEAWEED_TALL: Component = <SeaweedTall position={[0, 0, 0]} />; break;
                    case ObstacleType.ROCK_UNDERWATER: Component = <RockUnderwater position={[0, 0, 0]} />; break;
                    case ObstacleType.HAMOUR_FISH: Component = <HamourFish position={[0, 0, 0]} />; break;
                    case ObstacleType.SAFI_FISH: Component = <SafiFish position={[0, 0, 0]} />; break;
                    case ObstacleType.SHAARI_FISH: Component = <ShaariFish position={[0, 0, 0]} />; break;
                    
                    // Special Pearl Challenge
                    case ObstacleType.SITTING_CAMEL: Component = <SittingCamelWithSaddle position={[0, 0, 0]} glowing={true} />; break;

                    default: 
                        Component = <mesh position={[0, model.height/2, 0]}><boxGeometry args={[model.width, model.height, model.depth]} /><meshBasicMaterial color={model.color} /></mesh>;
                }
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
            
            {npcs.map(n => {
                // Check if player is near this NPC (within 15 units)
                const npcZ = n.z - distanceTraveledRef.current;
                const playerNear = npcZ > -5 && npcZ < 15;
                
                // Determine NPC variant based on act
                const getEmiratiVariant = () => {
                    if (currentAct === Act.HARBOR) return Math.random() > 0.5 ? 'fisherman' : 'worker';
                    if (currentAct === Act.DESERT) return 'bedouin';
                    if (currentAct === Act.HOMECOMING) return Math.random() > 0.7 ? 'elder' : 'farmer';
                    return Math.random() > 0.5 ? 'villager' : 'trader';
                };
                
                return (
                    <MovableObject key={n.id} initialZ={n.z} offsetX={n.x} distanceRef={distanceTraveledRef}>
                        {n.type === 'gazelle' ? (
                            <Gazelle position={[0,0,0]} />
                        ) : n.type === 'hijab_woman' ? (
                            <HijabWoman position={[0, 0, 0]} playerNear={playerNear} />
                        ) : n.type === 'kandura_man' ? (
                            <EmiratiMan position={[0, 0, 0]} variant={getEmiratiVariant() as any} playerNear={playerNear} />
                        ) : n.type === 'merchant' ? (
                            <EmiratiMan position={[0, 0, 0]} variant="trader" playerNear={playerNear} />
                        ) : (
                            <EmiratiMan position={[0, 0, 0]} variant="villager" playerNear={playerNear} />
                        )}
                    </MovableObject>
                );
            })}

            {/* Scrolling Road Segments */}
            {roadChunks.map(chunk => (
                <MovableObject key={chunk.id} initialZ={chunk.z} offsetX={0} distanceRef={distanceTraveledRef}>
                    <RoadChunk type={chunk.type} length={20} />
                </MovableObject>
            ))}

            {/* UNDERWATER ENVIRONMENT for Act 3 (Swimming/Diving) - Pearl Diving in Arabian Gulf 1500 CE */}
            {currentAct === Act.DIVING && (
                 <group>
                    {/* ===== FIXED UNDERWATER ATMOSPHERE ===== */}
                    {/* Water Surface Above (shimmer effect) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 12, 40]}>
                         <planeGeometry args={[100, 150]} />
                         <meshBasicMaterial 
                            color="#1E90FF" 
                            transparent 
                            opacity={0.25} 
                            side={THREE.DoubleSide}
                         />
                    </mesh>
                    
                    {/* Underwater Lighting - Blue-green ambient */}
                    <ambientLight intensity={0.4} color="#1E6B8F" />
                    <directionalLight position={[0, 20, 10]} intensity={0.6} color="#87CEEB" />
                    
                    {/* ===== SCROLLING SEABED & CORAL REEF SIDES ===== */}
                    {roadChunks.map((chunk, idx) => (
                        <MovableObject key={`ocean-${chunk.id}`} initialZ={chunk.z} offsetX={0} distanceRef={distanceTraveledRef}>
                            {/* ===== SANDY SEABED (Ground) ===== */}
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 10]}>
                                <planeGeometry args={[25, 25]} />
                                <meshBasicMaterial color="#D4B896" />
                            </mesh>
                            
                            {/* Seabed texture - sand ripples */}
                            {[0, 1, 2, 3].map((r) => (
                                <mesh key={`ripple-${r}`} rotation={[-Math.PI / 2, 0, 0]} position={[(r - 1.5) * 5, -1.95, 8 + r * 4]}>
                                    <ringGeometry args={[0.5, 0.8, 12]} />
                                    <meshBasicMaterial color="#C9A882" />
                                </mesh>
                            ))}
                            
                            {/* Scattered oyster shells on seabed */}
                            {[0, 1, 2, 3].map((s) => (
                                <mesh key={`shell-${s}`} position={[(s - 1.5) * 3 + (idx % 2), -1.8, 5 + s * 5]} rotation={[0.3, s * 0.5, 0]}>
                                    <sphereGeometry args={[0.15, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2]} />
                                    <meshBasicMaterial color="#E8DCC8" />
                                </mesh>
                            ))}
                            
                            {/* ===== LEFT CORAL REEF WALL ===== */}
                            <group position={[-10, 0, 10]}>
                                {/* Brain Coral (rounded, grooved) */}
                                <mesh position={[0, 0.5, 0]} scale={[1.2, 0.8, 1.2]}>
                                    <sphereGeometry args={[1, 8, 8]} />
                                    <meshBasicMaterial color="#CD853F" />
                                </mesh>
                                
                                {/* Staghorn Coral (branching) */}
                                <group position={[-1, 0.5, 3]}>
                                    {[0, 1, 2].map((b) => (
                                        <mesh key={b} position={[b * 0.3, b * 0.5, 0]} rotation={[0, 0, b * 0.3 - 0.3]}>
                                            <cylinderGeometry args={[0.05, 0.12, 1.5 + b * 0.3]} />
                                            <meshBasicMaterial color="#E8B87D" />
                                        </mesh>
                                    ))}
                                </group>
                                
                                {/* Fan Coral (flat, delicate) */}
                                <mesh position={[1, 1.5, -2]} rotation={[0, 0.5, 0]}>
                                    <circleGeometry args={[1, 12]} />
                                    <meshBasicMaterial color="#FF6B6B" side={THREE.DoubleSide} />
                                </mesh>
                                
                                {/* Fire Coral (reddish) */}
                                <mesh position={[-0.5, 0.3, 5]}>
                                    <dodecahedronGeometry args={[0.6]} />
                                    <meshBasicMaterial color="#B22222" />
                                </mesh>
                                
                                {/* Tube Sponges */}
                                {[0, 1, 2].map((t) => (
                                    <mesh key={`tube-${t}`} position={[0.5 + t * 0.4, 0.8 + t * 0.3, 7 + t]}>
                                        <cylinderGeometry args={[0.1, 0.15, 1 + t * 0.3, 6, 1, true]} />
                                        <meshBasicMaterial color="#FFD700" />
                                    </mesh>
                                ))}
                                
                                {/* Tall Seaweed Forest */}
                                {[0, 1, 2, 3].map((sw) => (
                                    <group key={`seaweed-l-${sw}`} position={[-1 + sw * 0.5, 0, sw * 4]}>
                                        {[0, 1, 2].map((blade) => (
                                            <mesh key={blade} position={[blade * 0.2, 1.5 + blade * 0.5, 0]} rotation={[0.1, 0, (blade - 1) * 0.2]}>
                                                <cylinderGeometry args={[0.04, 0.08, 3 + blade * 0.5]} />
                                                <meshBasicMaterial color="#2E8B57" />
                                            </mesh>
                                        ))}
                                    </group>
                                ))}
                                
                                {/* Rock formations */}
                                <mesh position={[0, -0.5, 10]} scale={[2, 1, 1.5]}>
                                    <dodecahedronGeometry args={[0.8]} />
                                    <meshBasicMaterial color="#696969" />
                                </mesh>
                            </group>
                            
                            {/* ===== RIGHT CORAL REEF WALL ===== */}
                            <group position={[10, 0, 12]}>
                                {/* Brain Coral */}
                                <mesh position={[0.5, 0.6, 2]} scale={[1, 0.7, 1]}>
                                    <sphereGeometry args={[1.2, 8, 8]} />
                                    <meshBasicMaterial color="#DAA520" />
                                </mesh>
                                
                                {/* Staghorn Coral */}
                                <group position={[1, 0.4, 5]}>
                                    {[0, 1, 2].map((b) => (
                                        <mesh key={b} position={[-b * 0.25, b * 0.4, 0]} rotation={[0, 0, -b * 0.25 + 0.25]}>
                                            <cylinderGeometry args={[0.06, 0.1, 1.3 + b * 0.2]} />
                                            <meshBasicMaterial color="#F5DEB3" />
                                        </mesh>
                                    ))}
                                </group>
                                
                                {/* Fan Coral */}
                                <mesh position={[-0.5, 1.8, 0]} rotation={[0, -0.4, 0]}>
                                    <circleGeometry args={[0.8, 12]} />
                                    <meshBasicMaterial color="#FF4500" side={THREE.DoubleSide} />
                                </mesh>
                                
                                {/* Sea Anemone */}
                                <group position={[0, 0.3, 8]}>
                                    {Array.from({ length: 8 }).map((_, t) => (
                                        <mesh key={t} position={[Math.cos(t * 0.8) * 0.3, 0.4, Math.sin(t * 0.8) * 0.3]} rotation={[0.5, 0, t * 0.2]}>
                                            <cylinderGeometry args={[0.03, 0.05, 0.6]} />
                                            <meshBasicMaterial color="#FF69B4" />
                                        </mesh>
                                    ))}
                                    <mesh position={[0, 0, 0]}>
                                        <sphereGeometry args={[0.3, 6, 6]} />
                                        <meshBasicMaterial color="#FF1493" />
                                    </mesh>
                                </group>
                                
                                {/* Tall Seaweed Forest */}
                                {[0, 1, 2, 3].map((sw) => (
                                    <group key={`seaweed-r-${sw}`} position={[1 - sw * 0.4, 0, sw * 3 + 1]}>
                                        {[0, 1, 2].map((blade) => (
                                            <mesh key={blade} position={[-blade * 0.15, 1.3 + blade * 0.4, 0]} rotation={[0.15, 0, -(blade - 1) * 0.15]}>
                                                <cylinderGeometry args={[0.05, 0.09, 2.5 + blade * 0.4]} />
                                                <meshBasicMaterial color="#228B22" />
                                            </mesh>
                                        ))}
                                    </group>
                                ))}
                                
                                {/* Underwater Rock */}
                                <mesh position={[-0.5, -0.3, 14]} scale={[1.5, 0.8, 1.2]}>
                                    <dodecahedronGeometry args={[0.9]} />
                                    <meshBasicMaterial color="#5A5A5A" />
                                </mesh>
                            </group>
                            
                            {/* ===== LIGHT RAYS FROM SURFACE (reduced for performance) ===== */}
                            {idx % 3 === 0 && (
                                <mesh key={`ray-single`} position={[0, 6, 12]} rotation={[0.1, 0, 0]}>
                                    <cylinderGeometry args={[0.1, 2.5, 10, 6]} />
                                    <meshBasicMaterial color="#87CEEB" transparent opacity={0.04} />
                                </mesh>
                            )}
                            
                            {/* ===== RISING BUBBLES (reduced for performance) ===== */}
                            {[0, 1].map((b) => (
                                <mesh 
                                    key={`bubble-${b}`}
                                    position={[(b - 0.5) * 6 + (idx % 2), 0.5 + b * 2, 8 + b * 4]}
                                >
                                    <sphereGeometry args={[0.05 + b * 0.02, 6, 6]} />
                                    <meshBasicMaterial color="#ADD8E6" transparent opacity={0.3} />
                                </mesh>
                            ))}
                            
                            {/* ===== SMALL FISH SCHOOLS ON SIDES (optimized) ===== */}
                            {idx % 2 === 0 && (
                                <group position={[-12, 1, 8]}>
                                    {[0, 1, 2].map((f) => (
                                        <mesh key={f} position={[f * 0.4, Math.sin(f * 0.8) * 0.3, f * 0.2]} rotation={[0, 0.3, 0]}>
                                            <coneGeometry args={[0.1, 0.3, 3]} />
                                            <meshBasicMaterial color="#4682B4" />
                                        </mesh>
                                    ))}
                                </group>
                            )}
                            {idx % 2 === 1 && (
                                <group position={[12, 1.5, 12]}>
                                    {[0, 1, 2].map((f) => (
                                        <mesh key={f} position={[-f * 0.35, Math.sin(f * 1.2) * 0.25, f * 0.2]} rotation={[0, -0.4, 0]}>
                                            <coneGeometry args={[0.1, 0.3, 3]} />
                                            <meshBasicMaterial color="#5F9EA0" />
                                        </mesh>
                                    ))}
                                </group>
                            )}
                            
                            {/* ===== PASSING SEA LIFE - Sea Turtle (optimized, authentic 1500 CE UAE) ===== */}
                            {idx % 4 === 0 && (
                                <group position={[-14, 1.5, 10]}>
                                    {/* Sea Turtle silhouette */}
                                    <mesh position={[0, 0, 0]}>
                                        <sphereGeometry args={[0.5, 6, 4]} />
                                        <meshBasicMaterial color="#2F4F4F" />
                                    </mesh>
                                    {/* Flippers */}
                                    <mesh position={[-0.5, 0, 0.2]} rotation={[0, 0, 0.3]}>
                                        <boxGeometry args={[0.4, 0.08, 0.25]} />
                                        <meshBasicMaterial color="#3D5C5C" />
                                    </mesh>
                                    <mesh position={[0.5, 0, 0.2]} rotation={[0, 0, -0.3]}>
                                        <boxGeometry args={[0.4, 0.08, 0.25]} />
                                        <meshBasicMaterial color="#3D5C5C" />
                                    </mesh>
                                </group>
                            )}
                            {/* Small fish group on right */}
                            {idx % 5 === 0 && (
                                <group position={[14, 1, 8]}>
                                    {[0, 1, 2].map((f) => (
                                        <mesh key={f} position={[-f * 0.3, Math.cos(f) * 0.2, f * 0.2]}>
                                            <coneGeometry args={[0.08, 0.25, 3]} />
                                            <meshBasicMaterial color="#48D1CC" />
                                        </mesh>
                                    ))}
                                </group>
                            )}
                        </MovableObject>
                    ))}
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
