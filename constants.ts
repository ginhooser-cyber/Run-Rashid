

import { EducationalFact, ObstacleType, NarrativeMoment, TimeOfDay, Act, PatternDef, Lane, MuseumSection, CulturalAnnotation, AccessibilitySettings, JournalPage } from './types';

// World Dimensions
export const LANE_WIDTH = -2.5; 
export const PATH_WIDTH = 10;
export const PLAYER_HEIGHT = 1.8;
export const JUMP_HEIGHT = 3.0;
export const JUMP_DURATION = 0.6; 
export const SLIDE_DURATION = 0.6; 
export const INVULNERABILITY_DURATION = 1500; // ms

// Story Milestone Distances (meters)
export const STORY_MILESTONES = {
  VILLAGE_NIGHT_START: 14000,   // Act 5: When village night phase begins
  DUSK_START: 14600,            // Act 5: When dusk phase begins
  CELEBRATION_START: 14800,     // Act 5: When celebration/finale begins
  VICTORY_DISTANCE: 15000,      // Total distance for game completion
} as const;

// Colors - Earthy, Historical Palette (Refined for Premium Matte Look)
export const COLORS = {
  skyTop: '#5CACEE', // Deep Sky Blue
  skyBottom: '#FFDAB9', // Peach Puff
  
  // Act 1: Training Grounds (More desaturated limestone/sand)
  sand: '#E3C98B', // Premium Warm Sand (Gold/Beige)
  sandDark: '#C7A66B', // Shadows
  path: '#E8D095', // Packed Sand (Slightly lighter than base sand)
  stone: '#C4A888', 
  
  wood: '#6D543E', // Matte Teak
  woodLight: '#9E8C7A', // Weathered Wood
  palmGreen: '#5F7348', // Desaturated Olive
  ghafGreen: '#4A5D23', // Darker, greyish green for Ghaf
  ghafBark: '#5D4037', // Grey-brown bark
  lyciumGreen: '#6B8E23', // Olive Drab for shrubs
  
  water: '#3A6B8E',
  harborWater: '#1A4B6E', // Darker, deeper blue for Harbor sea
  pearl: '#FDFDF5',
  pearlPink: '#FFE4E1',
  pearlGold: '#FFD700',
  date: '#4A2511', 
  
  clothWhite: '#F0F0EE', 
  clothRed: '#964B4B', // Faded Madder
  clothBlue: '#5A7D9A', // Faded Indigo
  
  skin: '#BFA07A', 
  lantern: '#FFA500',
  mashrabiya: '#3E2723',
  pottery: '#A67B5B',
  harborWood: '#4E342E',
  rope: '#C2A676', // Hemp color
  silver: '#C0C0C0',
  stormSky: '#2F3336',
  stormFog: '#3E4447',
  
  // Act 4 - BEAUTIFUL GOLDEN HOUR Desert Palette
  // Sky gradient (top to bottom)
  desertSkyTop: '#6A9ECF',    // Soft clear blue
  desertSkyMid: '#F0C878',    // Rich warm gold
  desertSkyBottom: '#FFF5E6', // Pale warm cream (horizon glow)
  
  // Ground & sand tones
  desertSand: '#E8D4A8',      // Warm base sand
  desertSandLight: '#F5EBD6', // Highlighted sand (path, distant dunes)
  desertSandWarm: '#DABB7A',  // Sunlit golden sand
  desertGold: '#D4A860',      // Deep sunset gold (near objects)
  duneShadow: '#B8986C',      // Warm shadow on dunes
  duneHighlight: '#F8E8C8',   // Sun-kissed dune tops
  horizonHaze: '#E8DCC8',     // Pale haze at horizon
  
  // Environment objects
  desertShrub: '#8B9B68',     // Muted olive (Ghaf leaves)
  desertRock: '#9A8A70',      // Warm grey-tan rocks
  camelBrown: '#C4A060',      // Golden camel fur
  camelShadow: '#8B7040',     // Darker camel accent
  tentBrown: '#5A4830',       // Rich warm brown tent
  tentFabric: '#3A2820',      // Dark goat-hair tent
  
  // Trade goods & accents
  fabricGold: '#D4A040',      // Golden silk
  fabricBlue: '#7AA8C8',      // Sky blue fabric (trade)
  fabricCream: '#F0E8D0',     // Cream linen
  spiceGold: '#C89830',       // Rich golden spice
  spiceWarm: '#B88040',       // Warm amber spice
  
  // Wood & rope
  desertWood: '#6B5030',      // Warm dark wood
  desertRope: '#B89868',      // Hemp/palm rope
  
  // Path & trail
  caravanPath: '#E8D8B8',     // Packed sand trail
  caravanTrack: '#C8B080',    // Wheel/hoof tracks

  // Act 5 Phase 1: Evening Approach (warm sunset glow)
  act5SkyTop: '#5D4E6D',      // Soft purple-grey dusk
  act5SkyMid: '#E8846B',      // Warm coral sunset
  act5SkyBottom: '#FFD4A3',   // Golden horizon glow
  dirtPath: '#B8976E',        // Warm packed earth
  farmField: '#8B9A5B',       // Olive-green crops
  goldCoin: '#FFD700',
  
  // Act 5 Phase 2: Village Night (warm lantern-lit celebration)
  villageSkyTop: '#1A1A3A',   // Deep night blue
  villageSkyMid: '#4A3B6B',   // Purple twilight
  villageSkyBottom: '#8B5A5A', // Warm reflected glow from village
  lanternGlow: '#FFB347',     // Warm orange lantern light
  celebrationBanner: '#C41E3A', // Deep red celebration banners
  
  // Act 5 Phase 3: Dusk Reunion (magical twilight)
  duskSkyTop: '#2B1B4E',      // Deep indigo
  duskSkyMid: '#6B4984',      // Rich purple
  duskSkyBottom: '#E88D72',   // Salmon pink horizon
  homeGlow: '#FFE4B5',        // Warm home light 
};

export const TIME_PERIODS: Record<TimeOfDay, { sky: string, fog: string, light: string, intensity: number, ambient: string, message: string }> = {
  MORNING: {
    sky: '#87CEEB', // Fallback
    fog: '#E3C98B', // Match new sand
    light: '#FFFACD',
    intensity: 1.0, // Softer
    ambient: '#F2E8C9',
    message: 'Fajr prayer echoes across the settlement'
  },
  MIDDAY: {
    sky: '#4CA3D9',
    fog: '#D9CBA3', 
    light: '#FFFFF0',
    intensity: 1.2,
    ambient: '#E6DCC3',
    message: 'The sun climbs high'
  },
  AFTERNOON: {
    sky: '#3A6B8E',
    fog: '#A4B8C4', 
    light: '#FFF8DC',
    intensity: 1.0,
    ambient: '#B0C4DE',
    message: 'Traders pack their goods'
  },
  SUNSET: {
    sky: '#F5B041',
    fog: '#F7DC6F',
    light: '#D4AC0D',
    intensity: 0.9,
    ambient: '#F8C471',
    message: 'Maghrib approaches'
  },
  STORM: {
    sky: '#2F3336',
    fog: '#2F3336',
    light: '#778899',
    intensity: 0.5,
    ambient: '#2F3336',
    message: 'The storm rages!'
  },
  EVENING: {
    sky: '#5D4E6D',
    fog: '#E8846B',
    light: '#FFB347',
    intensity: 0.85,
    ambient: '#D4A574',
    message: 'The familiar hills emerge on the horizon'
  },
  VILLAGE_NIGHT: {
    sky: '#1A1A3A',
    fog: '#4A3B6B',
    light: '#FFB347',
    intensity: 0.75,
    ambient: '#6B4984',
    message: 'Lanterns illuminate the village celebration'
  },
  DUSK: {
    sky: '#2B1B4E',
    fog: '#6B4984',
    light: '#FFE4B5',
    intensity: 0.8,
    ambient: '#8B6B8B',
    message: 'Father\'s arms await'
  }
};

export const OBSTACLE_MODELS: Record<ObstacleType, { width: number, height: number, depth: number, color: string, isTall?: boolean, isLow?: boolean, label: string }> = {
  // Act 1
  [ObstacleType.WATER_JAR]: { width: 0.8, height: 1.0, depth: 0.8, color: COLORS.pottery, label: 'Water Jar' },
  [ObstacleType.LAUNDRY]: { width: 3.0, height: 1.5, depth: 0.1, color: COLORS.clothWhite, isTall: true, label: 'Laundry' },
  [ObstacleType.MARKET_STALL]: { width: 2.2, height: 1.5, depth: 1.5, color: COLORS.wood, label: 'Market Stall' },
  [ObstacleType.CAMEL_WALKING]: { width: 2.3, height: 1.8, depth: 2.0, color: '#C19A6B', label: 'Walking Camel' },
  [ObstacleType.PALM_TRUNK]: { width: 2.0, height: 3.0, depth: 2.0, color: COLORS.wood, label: 'Palm Tree' }, 
  [ObstacleType.LOW_WALL]: { width: 2.5, height: 0.8, depth: 0.5, color: COLORS.stone, label: 'Low Wall' },
  [ObstacleType.FALAJ_CROSSING]: { width: 8.0, height: 0.2, depth: 2.0, color: COLORS.stone, isLow: true, label: 'Falaj Channel' },
  
  // Act 2
  [ObstacleType.CARGO_CRATE]: { width: 2.4, height: 1.6, depth: 1.2, color: '#A0826D', label: 'Cargo Crate' },
  [ObstacleType.ROPE_COIL]: { width: 2.2, height: 1.3, depth: 1.0, color: COLORS.rope, label: 'Rope Coil' },
  [ObstacleType.HANGING_NET]: { width: 7.5, height: 1.0, depth: 0.3, color: '#8B7355', isTall: true, label: 'Hanging Net' },
  [ObstacleType.WOODEN_BEAM]: { width: 7.5, height: 0.6, depth: 0.6, color: COLORS.wood, isTall: true, label: 'Wooden Beam' },
  [ObstacleType.DOCK_POST]: { width: 2.2, height: 3.0, depth: 1.5, color: '#654321', label: 'Dock Posts' },
  [ObstacleType.WAREHOUSE_ENTRY]: { width: 2.5, height: 3.5, depth: 2.0, color: '#D4A574', label: 'Warehouse' },
  
  // Act 3
  [ObstacleType.OYSTER_BASKET]: { width: 2.3, height: 1.5, depth: 1.0, color: '#CD853F', label: 'Oyster Basket' },
  [ObstacleType.DIVING_WEIGHTS]: { width: 2.0, height: 1.2, depth: 0.8, color: '#696969', label: 'Diving Weights' },
  [ObstacleType.WOODEN_CHEST]: { width: 2.2, height: 1.4, depth: 1.0, color: '#8B4513', label: 'Wooden Chest' },
  [ObstacleType.COILED_DIVING_ROPE]: { width: 2.1, height: 1.3, depth: 0.9, color: '#D2691E', label: 'Diving Rope' },
  [ObstacleType.SAIL_CANVAS]: { width: 7.5, height: 1.2, depth: 0.3, color: '#F5F5DC', isTall: true, label: 'Sail Canvas' },
  [ObstacleType.DRYING_NETS]: { width: 7.5, height: 0.9, depth: 0.2, color: '#8B7355', isTall: true, label: 'Drying Nets' },
  [ObstacleType.MAST_BOOM]: { width: 7.5, height: 0.7, depth: 0.5, color: '#A0522D', isTall: true, label: 'Mast Boom' },
  [ObstacleType.OVERHEAD_RIGGING]: { width: 7.5, height: 0.6, depth: 0.3, color: '#D2691E', isTall: true, label: 'Overhead Rigging' },
  [ObstacleType.MAIN_MAST]: { width: 1.8, height: 6.0, depth: 1.8, color: '#8B4513', label: 'Main Mast' },
  [ObstacleType.CREW_GROUP]: { width: 2.3, height: 1.8, depth: 1.5, color: '#F5F5DC', label: 'Crew' },
  [ObstacleType.CAPTAIN_STATION]: { width: 2.4, height: 2.5, depth: 2.0, color: '#8B7355', label: 'Captain Station' },

  // Act 4: The Caravan Trail (Desert Crossing) - Culturally Accurate 1500 CE
  [ObstacleType.SAND_DUNE]: { width: 2.4, height: 1.4, depth: 1.5, color: '#E0B580', label: 'Sand Dune' },
  [ObstacleType.GHAF_TREE]: { width: 2.5, height: 3.5, depth: 2.5, color: '#4A5D23', label: 'Ghaf Tree' },
  [ObstacleType.ROCK_FORMATION]: { width: 2.2, height: 1.5, depth: 1.2, color: '#A0826D', label: 'Rock Formation' },
  [ObstacleType.CAMEL_RESTING]: { width: 2.3, height: 1.6, depth: 1.8, color: '#C19A6B', label: 'Resting Camel' },
  [ObstacleType.CAMEL_CARAVAN]: { width: 3.5, height: 2.8, depth: 6.0, color: '#C19A6B', label: 'Camel Caravan' },
  [ObstacleType.BEDOUIN_TENT]: { width: 4.0, height: 2.5, depth: 3.5, color: '#2F1B10', label: 'Bedouin Tent' },
  [ObstacleType.TRADE_ROUTE_MARKER]: { width: 1.5, height: 2.0, depth: 1.5, color: '#8B7355', label: 'Route Marker' },
  [ObstacleType.DESERT_WELL]: { width: 2.0, height: 1.2, depth: 2.0, color: '#696969', label: 'Desert Well' },
  [ObstacleType.WATER_SKIN]: { width: 1.2, height: 1.0, depth: 0.8, color: '#8B4513', label: 'Water Skin' },
  [ObstacleType.SPICE_SACKS]: { width: 2.0, height: 1.3, depth: 1.5, color: '#CD853F', label: 'Spice Sacks' },
  [ObstacleType.CARAVAN_CAMPFIRE]: { width: 2.5, height: 0.8, depth: 2.5, color: '#FF4500', label: 'Camp Fire' },
  [ObstacleType.FALCON_PERCH]: { width: 1.5, height: 2.2, depth: 1.0, color: '#5D4037', label: 'Falcon Perch' },
  [ObstacleType.ARABIAN_ORYX]: { width: 2.0, height: 1.8, depth: 2.5, color: '#F5F5F5', label: 'Arabian Oryx' },
  [ObstacleType.HANGING_TRADE_FABRIC]: { width: 7.5, height: 0.9, depth: 0.2, color: '#4682B4', isTall: true, label: 'Trade Fabric' },
  [ObstacleType.TENT_ROPE_LINES]: { width: 7.5, height: 0.5, depth: 0.1, color: '#C2A676', isTall: true, label: 'Tent Ropes' },
  [ObstacleType.LOW_CAMEL_SADDLE]: { width: 7.5, height: 0.8, depth: 0.4, color: '#8B4513', isTall: true, label: 'Camel Saddle' },
  [ObstacleType.WADI_CROSSING]: { width: 8.0, height: 0.3, depth: 2.0, color: '#C2B280', isLow: true, label: 'Wadi Crossing' },
  [ObstacleType.FALLEN_TRADE_GOODS]: { width: 3.0, height: 0.6, depth: 2.0, color: '#CD853F', isLow: true, label: 'Fallen Goods' },
  [ObstacleType.BEDOUIN_TRADER]: { width: 2.0, height: 1.8, depth: 1.2, color: '#C2A676', label: 'Bedouin Trader' },
  
  // Legacy Act 4 (kept for compatibility)
  [ObstacleType.DESERT_SHRUB]: { width: 2.0, height: 1.2, depth: 1.0, color: '#6B8E23', label: 'Desert Shrub' },
  [ObstacleType.LOW_TENT]: { width: 7.5, height: 0.8, depth: 0.3, color: '#2F1B10', isTall: true, label: 'Low Tent' },
  [ObstacleType.HANGING_FABRIC]: { width: 7.5, height: 0.9, depth: 0.2, color: '#F5DEB3', isTall: true, label: 'Hanging Fabric' },
  [ObstacleType.ROPE_LINE]: { width: 7.5, height: 0.5, depth: 0.1, color: '#8B7355', isTall: true, label: 'Rope Line' },
  [ObstacleType.TALL_CACTUS]: { width: 1.5, height: 3.5, depth: 1.5, color: '#556B2F', label: 'Cactus (Deprecated)' },
  [ObstacleType.SUPPLY_PILE]: { width: 2.2, height: 2.0, depth: 1.5, color: '#CD853F', label: 'Supplies' },
  [ObstacleType.RESTING_TRAVELER]: { width: 2.0, height: 1.8, depth: 1.2, color: '#F5F5DC', label: 'Traveler' },

  // Act 5 Phase 1: Outskirts
  [ObstacleType.FARM_FENCE]: { width: 2.3, height: 1.3, depth: 1.0, color: '#8B7355', label: 'Farm Fence' },
  [ObstacleType.WATER_CHANNEL]: { width: 2.5, height: 1.1, depth: 1.4, color: '#4682B4', label: 'Falaj Channel' },
  [ObstacleType.HARVEST_BASKET]: { width: 2.2, height: 1.4, depth: 1.1, color: '#CD853F', label: 'Harvest Basket' },
  [ObstacleType.TREE_BRANCH]: { width: 7.5, height: 0.8, depth: 0.4, color: '#228B22', isTall: true, label: 'Palm Branch' },
  [ObstacleType.DRYING_ROPE]: { width: 7.5, height: 0.6, depth: 0.2, color: '#D2691E', isTall: true, label: 'Drying Rope' },
  [ObstacleType.FARM_WORKER]: { width: 2.0, height: 1.8, depth: 1.3, color: '#F5F5DC', label: 'Farm Worker' },
  [ObstacleType.STACKED_SUPPLIES]: { width: 2.2, height: 2.0, depth: 1.4, color: '#8B7355', label: 'Farm Supplies' },

  // Act 5 Phase 2: Village
  [ObstacleType.MARKET_GOODS]: { width: 2.1, height: 1.2, depth: 0.9, color: '#CD853F', label: 'Market Goods' },
  [ObstacleType.CHILDREN_PLAYING]: { width: 2.0, height: 1.0, depth: 1.0, color: '#FFD700', label: 'Playing Children' },
  [ObstacleType.WATER_JAR_GROUP]: { width: 2.2, height: 1.3, depth: 1.0, color: '#CD853F', label: 'Water Jars' },
  [ObstacleType.CELEBRATION_BANNER]: { width: 7.5, height: 0.7, depth: 0.2, color: '#FF6347', isTall: true, label: 'Celebration Banner' },
  [ObstacleType.LANTERN_STRING]: { width: 7.5, height: 0.6, depth: 0.2, color: '#FFD700', isTall: true, label: 'Lanterns' },
  [ObstacleType.GREETING_ELDER]: { width: 2.0, height: 1.8, depth: 1.2, color: '#F5F5DC', label: 'Village Elder' },
  [ObstacleType.VILLAGE_STALL]: { width: 2.3, height: 2.2, depth: 1.3, color: '#8B7355', label: 'Village Stall' },

  // Act 5 Phase 3: Family
  [ObstacleType.CELEBRATION_DRUM]: { width: 1.8, height: 1.0, depth: 1.0, color: '#8B4513', label: 'Drums' },
  [ObstacleType.FLOWER_GARLAND]: { width: 7.5, height: 0.5, depth: 0.2, color: '#FF69B4', isTall: true, label: 'Garland' },

  // Generic
  [ObstacleType.CRATE]: { width: 1.5, height: 1.2, depth: 1.5, color: COLORS.woodLight, label: 'Crate' },
  [ObstacleType.DHOW]: { width: 2.5, height: 4.5, depth: 15.0, color: COLORS.wood, label: 'Dhow' },

  // Act 2: Authentic 1500 CE Harbor Boats
  [ObstacleType.JALBOOT]: { width: 2.0, height: 2.5, depth: 8.0, color: '#5D4037', label: 'Jalboot' },
  [ObstacleType.SAMBUK]: { width: 3.0, height: 4.0, depth: 12.0, color: '#4E342E', label: 'Sambuk' },
  [ObstacleType.FISH_DRYING_RACK]: { width: 3.0, height: 2.5, depth: 1.5, color: '#8B7355', isTall: true, label: 'Fish Drying Rack' },
  [ObstacleType.PEARL_BASKET]: { width: 1.5, height: 1.0, depth: 1.5, color: '#CD853F', label: 'Pearl Basket' },
  [ObstacleType.MOORING_POST]: { width: 0.8, height: 2.0, depth: 0.8, color: '#3E2723', label: 'Mooring Post' },
  [ObstacleType.CARGO_SACKS]: { width: 2.0, height: 1.2, depth: 1.5, color: '#C2A676', label: 'Cargo Sacks' },

  // Act 3: Underwater Swimming
  [ObstacleType.CORAL_REEF]: { width: 3.0, height: 1.5, depth: 2.0, color: '#FF6B6B', label: 'Coral Reef' },
  [ObstacleType.JELLYFISH]: { width: 1.5, height: 2.0, depth: 1.5, color: '#E6E6FA', isTall: true, label: 'Jellyfish' },
  [ObstacleType.SEA_TURTLE]: { width: 2.0, height: 1.2, depth: 2.5, color: '#228B22', label: 'Sea Turtle' },
  [ObstacleType.STINGRAY]: { width: 2.5, height: 0.3, depth: 3.0, color: '#696969', isLow: true, label: 'Stingray' },
  [ObstacleType.OYSTER_BED]: { width: 4.0, height: 0.8, depth: 3.0, color: '#8B8B83', isLow: true, label: 'Oyster Bed' },
  [ObstacleType.SEAWEED_TALL]: { width: 2.0, height: 3.0, depth: 1.0, color: '#2F4F2F', isTall: true, label: 'Seaweed' },
  [ObstacleType.ROCK_UNDERWATER]: { width: 2.5, height: 2.0, depth: 2.5, color: '#4A4A4A', label: 'Underwater Rock' },
  [ObstacleType.HAMOUR_FISH]: { width: 2.0, height: 1.5, depth: 3.0, color: '#8B4513', label: 'Hamour (Grouper)' },
  [ObstacleType.SAFI_FISH]: { width: 1.5, height: 1.0, depth: 2.0, color: '#4682B4', label: 'Safi (Rabbitfish)' },
  [ObstacleType.SHAARI_FISH]: { width: 1.8, height: 1.2, depth: 2.5, color: '#DAA520', label: 'Shaari (Emperor)' },
  [ObstacleType.ANCHOR_CHAIN]: { width: 1.0, height: 4.0, depth: 1.0, color: '#2F2F2F', isTall: true, label: 'Anchor Chain' },
  [ObstacleType.DIVING_ROPE]: { width: 0.5, height: 5.0, depth: 0.5, color: '#C2A676', isTall: true, label: 'Diving Rope' },
  
  // Special Pearl Challenge
  [ObstacleType.SITTING_CAMEL]: { width: 3.0, height: 2.5, depth: 4.0, color: '#C9A85C', label: 'Rideable Camel' }
};

// ... (Rest of file unchanged)
export const UI_TRANSLATIONS = {
    SCORE: { en: 'SCORE', ar: 'النقاط' },
    DISTANCE: { en: 'DISTANCE', ar: 'المسافة' },
    CHANCES: { en: 'CHANCES', ar: 'الفرص' },
    PAUSE: { en: 'PAUSE', ar: 'إيقاف مؤقت' },
    RESUME: { en: 'RESUME', ar: 'استئناف' },
    JOURNAL: { en: 'JOURNAL', ar: 'المذكرات' },
    SETTINGS: { en: 'SETTINGS', ar: 'الإعدادات' },
    PHOTO_MODE: { en: 'PHOTO MODE', ar: 'وضع التصوير' },
    MAIN_MENU: { en: 'MAIN MENU', ar: 'القائمة الرئيسية' },
    GAME_OVER: { en: 'GAME OVER', ar: 'انتهت اللعبة' },
    RUN_COMPLETE: { en: 'RUN COMPLETE', ar: 'اكتملت الرحلة' },
    LESSON_LEARNED: { en: 'LESSON LEARNED', ar: 'درس مستفاد' },
    TRY_AGAIN: { en: 'TRY AGAIN', ar: 'حاول مجدداً' },
    START_STORY: { en: 'STORY MODE', ar: 'قصة راشد' },
    START_ENDLESS: { en: 'ENDLESS MODE', ar: 'الركض الحر' },
    HISTORY: { en: 'HISTORY', ar: 'تاريخنا' },
    MUSEUM: { en: 'MUSEUM', ar: 'المتحف' },
    LOCKED: { en: 'Locked', ar: 'مغلق' },
    COMPLETED: { en: 'COMPLETED', ar: 'مكتمل' },
    EXIT_MUSEUM: { en: 'EXIT MUSEUM', ar: 'خروج من المتحف' },
    DID_YOU_KNOW: { en: 'Did You Know?', ar: 'هل تعلم؟' },
    BACK_TO_MENU: { en: 'Back to Menu', ar: 'عودة للقائمة' },
    SAVE_CLOSE: { en: 'SAVE & CLOSE', ar: 'حفظ وإغلاق' },
    GAMEPLAY: { en: 'GAMEPLAY', ar: 'اللعب' },
    VISUAL: { en: 'VISUAL', ar: 'بصريات' },
    AUDIO: { en: 'AUDIO', ar: 'صوتيات' },
    SUBTITLES: { en: 'Subtitles', ar: 'الترجمة' },
    LANGUAGE: { en: 'Language / اللغة', ar: 'اللغة / Language' },
    BLESSING_ACTIVE: { en: 'BLESSING ACTIVE', ar: 'بركة نشطة' },
    LEARNING_MODE: { en: 'Learning Mode ON', ar: 'نمط التعلم مفعل' },
    BE_CAREFUL: { en: 'Be careful, son!', ar: 'احذر يا بني!' },
    // CREDITS
    CREDITS: { en: 'CREDITS', ar: 'فريق العمل' },
    DEVELOPED_BY: { en: 'Development Team', ar: 'فريق التطوير' },
    SPECIAL_THANKS: { en: 'Special Thanks', ar: 'شكر خاص' },
    CONTACT_SUPPORT: { en: 'Contact Support', ar: 'الدعم الفني' },
    LEAD_DEVELOPER: { en: 'Lead Developer', ar: 'المطور الرئيسي' },
    DISCLAIMER: { en: 'Inspired by UAE Heritage', ar: 'مستوحى من تراث الإمارات' },
};

export const CREDITS_DATA = [
    {
        role: "DEVELOPED_BY",
        content: [
            { text: "launchdaystudio.com", url: "https://launchdaystudio.com" },
            { text: "LEAD_DEVELOPER", subtext: "Bejie Paulo Aclao" }
        ]
    },
    {
        role: "SPECIAL_THANKS",
        content: [
            { text: "Diane R. A." }
        ]
    },
    {
        role: "CONTACT_SUPPORT",
        content: [
            { text: "info@launchdaystudio.com", url: "mailto:info@launchdaystudio.com" }
        ]
    }
];

// --- Difficulty Configuration ---

export const INITIAL_SPEED = 30; // Engaging but fair start speed
export const MAX_SPEED = 85;     
export const SPEED_ACCELERATION = 0.005; // Gradual ramp-up
export const SPAWN_DISTANCE_BUFFER = 35; // Enough time to react between patterns
export const TOTAL_DISTANCE = 15000;

// --- REBALANCED ACT DISTANCES ---
// Act 1: 2,000m | Act 2: 3,000m | Act 3: 3,200m | Act 4: 3,300m | Act 5: 3,500m
// Total: 15,000m
export const ACT_STRUCTURE = {
  [Act.TRAINING_GROUNDS]: {
    start: 0,
    end: 2000,
    name: "Act I: The Training Grounds",
    collectible: 'DATE',
    difficultyMultiplier: 1.0,
    obstacles: [ObstacleType.WATER_JAR, ObstacleType.LOW_WALL, ObstacleType.MARKET_STALL, ObstacleType.CAMEL_WALKING, ObstacleType.LAUNDRY, ObstacleType.PALM_TRUNK, ObstacleType.FALAJ_CROSSING]
  },
  [Act.HARBOR]: {
    start: 2000,
    end: 5000,
    name: "Act II: The Harbor",
    collectible: 'DIVING_GEAR',
    difficultyMultiplier: 1.3,
    obstacles: [ObstacleType.CARGO_CRATE, ObstacleType.ROPE_COIL, ObstacleType.JALBOOT, ObstacleType.SAMBUK, ObstacleType.MOORING_POST, ObstacleType.CARGO_SACKS]
  },
  [Act.DIVING]: {
    start: 5000,
    end: 8200, 
    name: "Act III: The Deep (Swimming)",
    collectible: 'PEARL_WHITE',
    difficultyMultiplier: 1.4,
    obstacles: [
      ObstacleType.CORAL_REEF, 
      ObstacleType.JELLYFISH, 
      ObstacleType.SEA_TURTLE, 
      ObstacleType.STINGRAY, 
      ObstacleType.OYSTER_BED, 
      ObstacleType.SEAWEED_TALL, 
      ObstacleType.ROCK_UNDERWATER, 
      ObstacleType.HAMOUR_FISH, 
      ObstacleType.SHAARI_FISH
    ]
  },
  [Act.DESERT]: {
    start: 8200,
    end: 11500,
    name: "Act IV: The Caravan Trail",
    collectible: 'TRADE_GOOD',
    difficultyMultiplier: 1.8,
    obstacles: [
      ObstacleType.SAND_DUNE, 
      ObstacleType.GHAF_TREE,
      ObstacleType.ROCK_FORMATION, 
      ObstacleType.CAMEL_RESTING,
      ObstacleType.CAMEL_CARAVAN,
      ObstacleType.BEDOUIN_TENT,
      ObstacleType.TRADE_ROUTE_MARKER,
      ObstacleType.SPICE_SACKS,
      ObstacleType.HANGING_TRADE_FABRIC,
      ObstacleType.TENT_ROPE_LINES,
      ObstacleType.WADI_CROSSING,
      ObstacleType.ARABIAN_ORYX
    ]
  },
  [Act.HOMECOMING]: {
    start: 11500,
    end: 15000, 
    name: "Act V: Homecoming",
    collectible: 'COIN_GOLD',
    difficultyMultiplier: 2.0,
    obstacles: [ObstacleType.FARM_FENCE, ObstacleType.WATER_CHANNEL, ObstacleType.HARVEST_BASKET, ObstacleType.TREE_BRANCH, ObstacleType.DRYING_ROPE, ObstacleType.FARM_WORKER]
  }
};

// Act transition loading screens with culturally accurate 1500 CE UAE stories
export const ACT_TRANSITIONS = {
  [Act.TRAINING_GROUNDS]: {
    triggerPercent: 0,
    title: "THE VILLAGE",
    title_ar: "القرية",
    subtitle: "Act I",
    subtitle_ar: "الفصل الأول",
    story: "Young Rashid awakens before dawn in his family's palm-frond barasti. The scent of frankincense drifts from his mother's morning prayers. Today, his father will begin teaching him the ways of the ghais—the pearl diver. A journey that will take him from these humble shores to the great trading ports of the Gulf.",
    story_ar: "يستيقظ راشد الصغير قبل الفجر في بيت عائلته من سعف النخيل. تتسرب رائحة اللبان من صلاة أمه الصباحية. اليوم، سيبدأ والده بتعليمه طرق الغيص—الغواص. رحلة ستأخذه من هذه الشواطئ المتواضعة إلى موانئ التجارة العظيمة في الخليج."
  },
  [Act.HARBOR]: {
    triggerPercent: 0.133,
    title: "THE HARBOR",
    title_ar: "الميناء",
    subtitle: "Act II",
    subtitle_ar: "الفصل الثاني",
    story: "The wooden dhows creak gently in the harbor of Julfar, their sails furled against the morning breeze. Merchants from Persia, India, and distant lands barter spices, textiles, and precious metals. Rashid's heart pounds with wonder as he witnesses the rhythm of trade that has sustained his people for generations.",
    story_ar: "تصدر المراكب الخشبية صريراً خفيفاً في ميناء جلفار، أشرعتها ملفوفة أمام نسيم الصباح. تجار من فارس والهند وأراضٍ بعيدة يتبادلون التوابل والأقمشة والمعادن الثمينة. يخفق قلب راشد بالدهشة وهو يشاهد إيقاع التجارة الذي أعال شعبه لأجيال."
  },
  [Act.DIVING]: {
    triggerPercent: 0.333,
    title: "THE DEEP",
    title_ar: "الأعماق",
    subtitle: "Act III",
    subtitle_ar: "الفصل الثالث",
    story: "Rashid descends into the turquoise waters of the Arabian Gulf, the fathom line tight around his waist. Below, the oyster beds shimmer like a hidden garden. Each pearl holds a story—of patience, of courage, of the ancestors who dove these same waters. The sea embraces him as one of her own.",
    story_ar: "ينزل راشد في المياه الفيروزية للخليج العربي، حبل القياس مشدود حول خصره. في الأسفل، تتلألأ أسرّة المحار كحديقة مخفية. كل لؤلؤة تحمل قصة—عن الصبر، عن الشجاعة، عن الأجداد الذين غاصوا في هذه المياه ذاتها. يحتضنه البحر كواحد من أبنائه."
  },
  [Act.DESERT]: {
    triggerPercent: 0.547,
    title: "THE CARAVAN",
    title_ar: "القافلة",
    subtitle: "Act IV",
    subtitle_ar: "الفصل الرابع",
    story: "The pearls must reach the merchants of the inner lands. Rashid joins the caravan crossing the golden dunes of the Rub' al Khali. Bedouin guides navigate by the stars, their camels moving like ships across a sea of sand. Around evening campfires, elders share tales of djinn and ancient kingdoms buried beneath the sands.",
    story_ar: "يجب أن تصل اللآلئ إلى تجار الأراضي الداخلية. ينضم راشد إلى القافلة العابرة للكثبان الذهبية في الربع الخالي. يهتدي البدو بالنجوم، جمالهم تتحرك كالسفن عبر بحر من الرمال. حول نيران المساء، يشارك الشيوخ حكايات الجن والممالك القديمة المدفونة تحت الرمال."
  },
  [Act.HOMECOMING]: {
    triggerPercent: 0.767,
    title: "HOMECOMING",
    title_ar: "العودة للديار",
    subtitle: "Act V",
    subtitle_ar: "الفصل الخامس",
    story: "The evening breeze carries the scent of oud and grilled fish. Palm groves sway against an amber sky as the village comes into view. Rashid sees the lanterns glowing from his family's home, hears his sisters' laughter in the distance. The journey has made him a man. Now, he returns to share all he has learned.",
    story_ar: "يحمل نسيم المساء رائحة العود والسمك المشوي. تتمايل بساتين النخيل أمام سماء كهرمانية مع ظهور القرية. يرى راشد الفوانيس متوهجة من بيت عائلته، يسمع ضحكات أخواته في البعيد. الرحلة جعلته رجلاً. الآن، يعود ليشارك كل ما تعلمه."
  }
};

// Narrative moments removed - stories now shown in act loading screens
export const NARRATIVE_MOMENTS: NarrativeMoment[] = [];


export const OBSTACLE_PATTERNS: PatternDef[] = [
  // --- ACT 1: TRAINING GROUNDS (ENGAGING FROM 100m!) ---
  
  // TRIVIAL: First 100m - Brief tutorial with simple combos (not solo!)
  {
    id: 'ACT1_INTRO_ZIGZAG',
    complexity: 'TRIVIAL',
    act: Act.TRAINING_GROUNDS,
    length: 50,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 20 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 40 }
    ]
  },
  {
    id: 'ACT1_INTRO_SLIDE_DODGE',
    complexity: 'TRIVIAL',
    act: Act.TRAINING_GROUNDS,
    length: 55,
    obstacles: [
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 25 },
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 45 }
    ]
  },
  {
    id: 'ACT1_INTRO_JUMP_WEAVE',
    complexity: 'TRIVIAL',
    act: Act.TRAINING_GROUNDS,
    length: 60,
    obstacles: [
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 0 },
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 25 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 45 }
    ]
  },

  // SIMPLE: 100-400m - Continuous dodging with plenty of reaction time (15-25 unit spacing)
  {
    id: 'SIMPLE_WEAVE_3',
    complexity: 'SIMPLE',
    act: Act.TRAINING_GROUNDS,
    length: 60,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 20 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 40 }
    ]
  },
  {
    id: 'SIMPLE_JUMP_ZIGZAG',
    complexity: 'SIMPLE',
    act: Act.TRAINING_GROUNDS,
    length: 70,
    obstacles: [
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 0 },
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 20 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 40 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 60 }
    ]
  },
  {
    id: 'SIMPLE_DUCK_WEAVE',
    complexity: 'SIMPLE',
    act: Act.TRAINING_GROUNDS,
    length: 65,
    obstacles: [
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 22 },
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 44 }
    ]
  },
  {
    id: 'SIMPLE_CAMEL_SLALOM',
    complexity: 'SIMPLE',
    act: Act.TRAINING_GROUNDS,
    length: 80,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 25 },
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 50 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 50 }
    ]
  },
  {
    id: 'SIMPLE_PALM_CORRIDOR',
    complexity: 'SIMPLE',
    act: Act.TRAINING_GROUNDS,
    length: 75,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 25 },
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 50 }
    ]
  },

  // MEDIUM: 700-1400m - Two obstacles, combinations
  {
    id: 'ACT1_PALM_WEAVE',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 35,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 14 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 28 }
    ]
  },
  {
    id: 'ACT1_TWO_JARS',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 25,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 0 }
    ]
  },
  {
    id: 'ACT1_STALL_THEN_CAMEL',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 35,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 15 }
    ]
  },
  {
    id: 'ACT1_JUMP_INTRO',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 30,
    obstacles: [
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 0 }
    ]
  },
  {
    id: 'LAUNDRY_CORRIDOR',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 28,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.LAUNDRY, zOffset: 0 }, 
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 }
    ]
  },
  {
    id: 'ACT1_CAMEL_PAIR',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 30,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 0 }
    ]
  },

  // HARD: From 100m - Continuous patterns with PLENTY of room (25-40 unit spacing)
  {
    id: 'ACT1_FALAJ_SLALOM',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 100,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 30 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 60 },
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 90 }
    ]
  },
  {
    id: 'ACT1_MARKET_RUSH',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 120,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 30 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 60 },
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 90 }
    ]
  },
  {
    id: 'ZIGZAG_PALM',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 100,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 35 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 70 }
    ]
  },
  {
    id: 'ACT1_JUMP_SLIDE_COMBO',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 110,
    obstacles: [
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 0 },
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 40 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 75 }
    ]
  },
  {
    id: 'ACT1_CAMEL_RUSH',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 90,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 45 }
    ]
  },
  {
    id: 'ACT1_WEAVE_JUMP_DUCK',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 130,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.MARKET_STALL, zOffset: 35 },
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 70 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 100 }
    ]
  },
  {
    id: 'ACT1_CORRIDOR_RUN',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 100,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 40 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 40 },
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 80 }
    ]
  },
  {
    id: 'ACT1_ZIGZAG_WIDE',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 140,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 35 },
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 70 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 105 }
    ]
  },


  // EXTREME: Strategic lane blocking - NO SAFE LANES! Constant movement required!
  // Design principles: Always block 2 lanes, force lane changes every 14-17 units (more spacious)
  
  // Pattern A: Forced Zigzag (L→C→R→C→L→C→R repeat)
  {
    id: 'ACT1_FORCED_ZIGZAG',
    complexity: 'EXTREME',
    act: Act.TRAINING_GROUNDS,
    length: 160,
    obstacles: [
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 0 },
      // Block R+C, go LEFT
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 15 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 15 },
      // Block L+R, go CENTER + JUMP
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 30 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 30 },
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 45 },
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 60 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 60 },
      // Block R+C, go LEFT + DUCK
      { lane: Lane.RIGHT, type: ObstacleType.MARKET_STALL, zOffset: 75 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 75 },
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 90 },
      // Block L+R, go CENTER
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 105 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 105 },
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 120 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 120 },
      // Block R+C, go LEFT + JUMP
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 135 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 135 },
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 150 }
    ]
  },
  
  // Pattern B: Jump-Weave-Duck Combo (vertical + horizontal movement)
  {
    id: 'ACT1_VERTICAL_HORIZONTAL',
    complexity: 'EXTREME',
    act: Act.TRAINING_GROUNDS,
    length: 140,
    obstacles: [
      // JUMP then lane change
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 0 },
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 15 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 15 },
      // DUCK then lane change
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 30 },
      { lane: Lane.RIGHT, type: ObstacleType.MARKET_STALL, zOffset: 45 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 45 },
      // JUMP + lane change
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 60 },
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 75 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 75 },
      // DUCK + lane change
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 90 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 105 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 105 },
      // Final JUMP + weave
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 120 },
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 135 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 135 }
    ]
  },

  // Pattern C: Corridor Runner (forced center with lane changes)
  {
    id: 'ACT1_CORRIDOR_RUNNER',
    complexity: 'EXTREME',
    act: Act.TRAINING_GROUNDS,
    length: 170,
    obstacles: [
      // Corridor left, force RIGHT then CENTER
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 15 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 15 },
      // Corridor right, force LEFT then CENTER  
      { lane: Lane.RIGHT, type: ObstacleType.MARKET_STALL, zOffset: 30 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 30 },
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 45 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 45 },
      // Full width JUMP
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 60 },
      // Corridor left again
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 75 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 75 },
      { lane: Lane.RIGHT, type: ObstacleType.MARKET_STALL, zOffset: 90 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 90 },
      // Full width DUCK
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 105 },
      // Corridor right
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 120 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 120 },
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 135 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 135 },
      // Final JUMP
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 150 },
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 165 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 165 }
    ]
  },

  // Pattern D: No Rest Zone (every lane blocked at alternating times)
  {
    id: 'ACT1_NO_REST_ZONE',
    complexity: 'EXTREME',
    act: Act.TRAINING_GROUNDS,
    length: 155,
    obstacles: [
      // Phase 1: L blocked
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      // Phase 2: C blocked (was safe, now not)
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 15 },
      // Phase 3: R blocked
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 30 },
      // Phase 4: L+C blocked
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 45 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 45 },
      // Phase 5: JUMP
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 60 },
      // Phase 6: R blocked
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 75 },
      // Phase 7: C blocked
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 90 },
      // Phase 8: L blocked
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 105 },
      // Phase 9: R+C blocked
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 120 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 120 },
      // Phase 10: DUCK
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 135 },
      // Phase 11: L blocked final
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 150 }
    ]
  },

  // Pattern E: Wave Pattern (L→C→R→C→L continuous)
  {
    id: 'ACT1_WAVE_PATTERN',
    complexity: 'EXTREME',
    act: Act.TRAINING_GROUNDS,
    length: 150,
    obstacles: [
      // Wave 1: Block L+C
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      // Wave 2: Block C+R (player was R, must go L)
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 15 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 15 },
      // Wave 3: Block L+R (player must go C)
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 30 },
      { lane: Lane.RIGHT, type: ObstacleType.MARKET_STALL, zOffset: 30 },
      // Wave 4: Block C+L (player must go R)
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 45 },
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 45 },
      // JUMP break
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 60 },
      // Wave 5: Block R+C
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 75 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 75 },
      // Wave 6: Block L+C
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 90 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 90 },
      // DUCK break
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 105 },
      // Wave 7: Block R+C
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 120 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 120 },
      // Wave 8: Block L+R
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 135 },
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 135 }
    ]
  },

  // Pattern F: Pinball (direction changes with more breathing room)
  {
    id: 'ACT1_PINBALL',
    complexity: 'EXTREME',
    act: Act.TRAINING_GROUNDS,
    length: 140,
    obstacles: [
      // Sequence 1
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 15 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 15 },
      { lane: Lane.LEFT, type: ObstacleType.MARKET_STALL, zOffset: 30 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 30 },
      // JUMP
      { lane: 'all', type: ObstacleType.LOW_WALL, zOffset: 45 },
      // Sequence 2
      { lane: Lane.RIGHT, type: ObstacleType.WATER_JAR, zOffset: 60 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 60 },
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 75 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_WALKING, zOffset: 75 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 90 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 90 },
      // DUCK
      { lane: 'all', type: ObstacleType.LAUNDRY, zOffset: 105 },
      // Sequence 3
      { lane: Lane.LEFT, type: ObstacleType.WATER_JAR, zOffset: 120 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_JAR, zOffset: 120 },
      { lane: Lane.RIGHT, type: ObstacleType.MARKET_STALL, zOffset: 135 },
      { lane: Lane.CENTER, type: ObstacleType.MARKET_STALL, zOffset: 135 }
    ]
  },

  // --- ACT 2: HARBOR ---
  {
    id: 'ACT2_SINGLE_CRATE',
    complexity: 'SIMPLE',
    act: Act.HARBOR,
    length: 25,
    obstacles: [{ lane: 'random', type: ObstacleType.CARGO_CRATE, zOffset: 0 }]
  },
  {
    id: 'ACT2_SINGLE_NET',
    complexity: 'SIMPLE',
    act: Act.HARBOR,
    length: 25,
    obstacles: [{ lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 0 }]
  },
  {
    id: 'ACT2_ONE_DHOW',
    complexity: 'SIMPLE',
    act: Act.HARBOR,
    length: 30,
    obstacles: [{ lane: 'random', type: ObstacleType.DHOW, zOffset: 0 }]
  },
  {
    id: 'ACT2_ROPE_JUMP',
    complexity: 'SIMPLE',
    act: Act.HARBOR,
    length: 25,
    obstacles: [{ lane: 'random', type: ObstacleType.ROPE_COIL, zOffset: 0 }]
  },
  {
    id: 'ACT2_TWO_LANES_BLOCKED',
    complexity: 'MEDIUM',
    act: Act.HARBOR,
    length: 30,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 0 }
    ]
  },
  {
    id: 'ACT2_JUMP_THEN_SLIDE',
    complexity: 'MEDIUM',
    act: Act.HARBOR,
    length: 50, 
    obstacles: [
      { lane: 'all', type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 25 }
    ]
  },
  {
    id: 'ACT2_TWO_DHOWS',
    complexity: 'MEDIUM',
    act: Act.HARBOR,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.DHOW, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.DHOW, zOffset: 0 }
    ]
  },
  {
    id: 'ACT2_STAGGERED_EASY',
    complexity: 'MEDIUM',
    act: Act.HARBOR,
    length: 45,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 22 }
    ]
  },
  {
    id: 'ACT2_TRIPLE_STAGGER',
    complexity: 'HARD',
    act: Act.HARBOR,
    length: 65,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 22 }, 
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_CRATE, zOffset: 44 }
    ]
  },
  {
    id: 'ACT2_DHOW_CORRIDOR_NET',
    complexity: 'HARD',
    act: Act.HARBOR,
    length: 60,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.DHOW, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.DHOW, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.HANGING_NET, zOffset: 30 }
    ]
  },
  {
    id: 'ACT2_JUMP_SLIDE_JUMP_SPACED',
    complexity: 'HARD',
    act: Act.HARBOR,
    length: 75,
    obstacles: [
      { lane: 'all', type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: 'all', type: ObstacleType.WOODEN_BEAM, zOffset: 25 },
      { lane: 'all', type: ObstacleType.ROPE_COIL, zOffset: 50 }
    ]
  },
  {
    id: 'ACT2_THREE_DHOWS_GENTLE',
    complexity: 'HARD',
    act: Act.HARBOR,
    length: 70,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.DHOW, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.DHOW, zOffset: 25 },
      { lane: Lane.RIGHT, type: ObstacleType.DHOW, zOffset: 50 }
    ]
  },

  // =====================================================================
  // ACT 2 EXTREME PATTERNS - 1500 CE HARBOR (16-19 unit spacing)
  // Design: Block 2 lanes, force constant movement, faster than Act 1
  // Cultural assets: Cargo crates, rope coils, fishing nets, dhows, sacks
  // =====================================================================

  // Pattern A: Forced Dock Zigzag (L→R→C→L→R continuous)
  {
    id: 'ACT2_DOCK_ZIGZAG',
    complexity: 'EXTREME',
    act: Act.HARBOR,
    length: 180,
    obstacles: [
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_SACKS, zOffset: 0 },
      // Block R+C, go LEFT
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 16 },
      { lane: Lane.CENTER, type: ObstacleType.MOORING_POST, zOffset: 16 },
      // Block L+R, go CENTER + DUCK
      { lane: Lane.LEFT, type: ObstacleType.CARGO_SACKS, zOffset: 32 },
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_CRATE, zOffset: 32 },
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 48 },
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.JALBOOT, zOffset: 64 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 64 },
      // Block R+C, go LEFT + DUCK
      { lane: Lane.RIGHT, type: ObstacleType.SAMBUK, zOffset: 80 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 80 },
      { lane: 'all', type: ObstacleType.WOODEN_BEAM, zOffset: 96 },
      // Block L+R, go CENTER
      { lane: Lane.LEFT, type: ObstacleType.CARGO_SACKS, zOffset: 112 },
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 112 },
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.MOORING_POST, zOffset: 128 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 128 },
      // Block R+C, go LEFT + DUCK
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_SACKS, zOffset: 144 },
      { lane: Lane.CENTER, type: ObstacleType.JALBOOT, zOffset: 144 },
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 160 }
    ]
  },

  // Pattern B: Loading Bay Gauntlet (Jump-Duck-Weave combo)
  {
    id: 'ACT2_LOADING_BAY',
    complexity: 'EXTREME',
    act: Act.HARBOR,
    length: 170,
    obstacles: [
      // DUCK then lane change
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 0 },
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 16 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 16 },
      // DUCK then lane change
      { lane: 'all', type: ObstacleType.WOODEN_BEAM, zOffset: 32 },
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 48 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_SACKS, zOffset: 48 },
      // DUCK + lane change
      { lane: 'all', type: ObstacleType.FISH_DRYING_RACK, zOffset: 64 },
      { lane: Lane.LEFT, type: ObstacleType.JALBOOT, zOffset: 80 },
      { lane: Lane.RIGHT, type: ObstacleType.MOORING_POST, zOffset: 80 },
      // DUCK + lane change
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 96 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 112 },
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_SACKS, zOffset: 112 },
      // Final DUCK + weave
      { lane: 'all', type: ObstacleType.WOODEN_BEAM, zOffset: 128 },
      { lane: Lane.LEFT, type: ObstacleType.ROPE_COIL, zOffset: 144 },
      { lane: Lane.CENTER, type: ObstacleType.SAMBUK, zOffset: 144 }
    ]
  },

  // Pattern C: Dhow Corridor Runner (boat corridors with nets)
  {
    id: 'ACT2_DHOW_CORRIDOR',
    complexity: 'EXTREME',
    act: Act.HARBOR,
    length: 190,
    obstacles: [
      // Corridor left (dhows), force RIGHT then CENTER
      { lane: Lane.LEFT, type: ObstacleType.DHOW, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 16 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_SACKS, zOffset: 16 },
      // Corridor right, force LEFT then CENTER
      { lane: Lane.RIGHT, type: ObstacleType.SAMBUK, zOffset: 32 },
      { lane: Lane.CENTER, type: ObstacleType.MOORING_POST, zOffset: 32 },
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 48 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 48 },
      // Full width DUCK
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 64 },
      // Corridor left again
      { lane: Lane.LEFT, type: ObstacleType.JALBOOT, zOffset: 80 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_SACKS, zOffset: 80 },
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_CRATE, zOffset: 96 },
      { lane: Lane.CENTER, type: ObstacleType.MOORING_POST, zOffset: 96 },
      // Full width DUCK
      { lane: 'all', type: ObstacleType.WOODEN_BEAM, zOffset: 112 },
      // Corridor right
      { lane: Lane.RIGHT, type: ObstacleType.DHOW, zOffset: 128 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 128 },
      { lane: Lane.LEFT, type: ObstacleType.CARGO_SACKS, zOffset: 144 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 144 },
      // Final DUCK
      { lane: 'all', type: ObstacleType.FISH_DRYING_RACK, zOffset: 160 },
      { lane: Lane.LEFT, type: ObstacleType.JALBOOT, zOffset: 176 },
      { lane: Lane.RIGHT, type: ObstacleType.SAMBUK, zOffset: 176 }
    ]
  },

  // Pattern D: Fisherman's Gauntlet (fish racks + cargo rotation)
  {
    id: 'ACT2_FISHERMAN_GAUNTLET',
    complexity: 'EXTREME',
    act: Act.HARBOR,
    length: 170,
    obstacles: [
      // Phase 1: L blocked
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      // Phase 2: C blocked
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 16 },
      // Phase 3: R blocked
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_SACKS, zOffset: 32 },
      // Phase 4: L+C blocked
      { lane: Lane.LEFT, type: ObstacleType.MOORING_POST, zOffset: 48 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 48 },
      // Phase 5: DUCK
      { lane: 'all', type: ObstacleType.FISH_DRYING_RACK, zOffset: 64 },
      // Phase 6: R blocked
      { lane: Lane.RIGHT, type: ObstacleType.JALBOOT, zOffset: 80 },
      // Phase 7: C blocked
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 96 },
      // Phase 8: L blocked
      { lane: Lane.LEFT, type: ObstacleType.CARGO_SACKS, zOffset: 112 },
      // Phase 9: R+C blocked
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_CRATE, zOffset: 128 },
      { lane: Lane.CENTER, type: ObstacleType.SAMBUK, zOffset: 128 },
      // Phase 10: DUCK
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 144 },
      // Phase 11: L blocked final
      { lane: Lane.LEFT, type: ObstacleType.MOORING_POST, zOffset: 160 }
    ]
  },

  // Pattern E: Wave of Trade (cargo wave pattern L→C→R→C→L)
  {
    id: 'ACT2_TRADE_WAVE',
    complexity: 'EXTREME',
    act: Act.HARBOR,
    length: 180,
    obstacles: [
      // Wave 1: Block L+C
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 0 },
      // Wave 2: Block C+R
      { lane: Lane.CENTER, type: ObstacleType.CARGO_SACKS, zOffset: 16 },
      { lane: Lane.RIGHT, type: ObstacleType.MOORING_POST, zOffset: 16 },
      // Wave 3: Block L+R
      { lane: Lane.LEFT, type: ObstacleType.JALBOOT, zOffset: 32 },
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_CRATE, zOffset: 32 },
      // Wave 4: Block C+L
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 48 },
      { lane: Lane.LEFT, type: ObstacleType.CARGO_SACKS, zOffset: 48 },
      // DUCK break
      { lane: 'all', type: ObstacleType.WOODEN_BEAM, zOffset: 64 },
      // Wave 5: Block R+C
      { lane: Lane.RIGHT, type: ObstacleType.SAMBUK, zOffset: 80 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 80 },
      // Wave 6: Block L+C
      { lane: Lane.LEFT, type: ObstacleType.MOORING_POST, zOffset: 96 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 96 },
      // DUCK break
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 112 },
      // Wave 7: Block R+C
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_SACKS, zOffset: 128 },
      { lane: Lane.CENTER, type: ObstacleType.JALBOOT, zOffset: 128 },
      // Wave 8: Block L+R
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 144 },
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 144 },
      // Final DUCK
      { lane: 'all', type: ObstacleType.FISH_DRYING_RACK, zOffset: 160 }
    ]
  },

  // Pattern F: Harbor Pinball (rapid cargo dodging)
  {
    id: 'ACT2_HARBOR_PINBALL',
    complexity: 'EXTREME',
    act: Act.HARBOR,
    length: 160,
    obstacles: [
      // Sequence 1
      { lane: Lane.LEFT, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROPE_COIL, zOffset: 16 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_SACKS, zOffset: 16 },
      { lane: Lane.LEFT, type: ObstacleType.MOORING_POST, zOffset: 32 },
      { lane: Lane.CENTER, type: ObstacleType.JALBOOT, zOffset: 32 },
      // DUCK
      { lane: 'all', type: ObstacleType.HANGING_NET, zOffset: 48 },
      // Sequence 2
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_CRATE, zOffset: 64 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_COIL, zOffset: 64 },
      { lane: Lane.LEFT, type: ObstacleType.CARGO_SACKS, zOffset: 80 },
      { lane: Lane.CENTER, type: ObstacleType.MOORING_POST, zOffset: 80 },
      { lane: Lane.RIGHT, type: ObstacleType.SAMBUK, zOffset: 96 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_CRATE, zOffset: 96 },
      // DUCK
      { lane: 'all', type: ObstacleType.WOODEN_BEAM, zOffset: 112 },
      // Sequence 3
      { lane: Lane.LEFT, type: ObstacleType.ROPE_COIL, zOffset: 128 },
      { lane: Lane.CENTER, type: ObstacleType.CARGO_SACKS, zOffset: 128 },
      { lane: Lane.RIGHT, type: ObstacleType.CARGO_CRATE, zOffset: 144 },
      { lane: Lane.CENTER, type: ObstacleType.JALBOOT, zOffset: 144 }
    ]
  },

  // --- ACT 3: UNDERWATER SWIMMING ---
  // Simple - Learn the underwater environment
  {
    id: 'ACT3_CORAL_DODGE',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 30,
    obstacles: [{ lane: 'random', type: ObstacleType.CORAL_REEF, zOffset: 0 }]
  },
  {
    id: 'ACT3_JELLYFISH_FLOAT',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 30,
    obstacles: [{ lane: 'random', type: ObstacleType.JELLYFISH, zOffset: 0 }]
  },
  {
    id: 'ACT3_TURTLE_PASS',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 35,
    obstacles: [{ lane: 'random', type: ObstacleType.SEA_TURTLE, zOffset: 0 }]
  },
  {
    id: 'ACT3_OYSTER_BED_LOW',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 35,
    obstacles: [{ lane: 'random', type: ObstacleType.OYSTER_BED, zOffset: 0 }]
  },
  {
    id: 'ACT3_ROCK_DODGE',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 35,
    obstacles: [{ lane: 'random', type: ObstacleType.ROCK_UNDERWATER, zOffset: 0 }]
  },
  {
    id: 'ACT3_SEAWEED_TALL',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 35,
    obstacles: [
        { lane: Lane.LEFT, type: ObstacleType.SEAWEED_TALL, zOffset: 0 },
        { lane: Lane.CENTER, type: ObstacleType.SEAWEED_TALL, zOffset: 0 }
    ]
  },
  {
    id: 'ACT3_STINGRAY_SLIDE',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 40,
    obstacles: [{ lane: 'random', type: ObstacleType.STINGRAY, zOffset: 0 }]
  },
  {
    id: 'ACT3_DOUBLE_CORAL',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 45,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CORAL_REEF, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CORAL_REEF, zOffset: 0 }
    ]
  },
  {
    id: 'ACT3_JELLYFISH_CORRIDOR',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 50,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.JELLYFISH, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.JELLYFISH, zOffset: 0 }
    ]
  },
  {
    id: 'ACT3_FISH_SCHOOL',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 50,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.HAMOUR_FISH, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.SAFI_FISH, zOffset: 15 },
      { lane: Lane.RIGHT, type: ObstacleType.SHAARI_FISH, zOffset: 30 }
    ]
  },
  // Hard
  {
    id: 'ACT3_REEF_GAUNTLET',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 65,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CORAL_REEF, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_UNDERWATER, zOffset: 25 },
      { lane: Lane.RIGHT, type: ObstacleType.CORAL_REEF, zOffset: 50 }
    ]
  },
  {
    id: 'ACT3_TURTLE_JELLYFISH',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 60,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SEA_TURTLE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.JELLYFISH, zOffset: 25 },
      { lane: Lane.RIGHT, type: ObstacleType.SEA_TURTLE, zOffset: 50 }
    ]
  },
  {
    id: 'ACT3_OYSTER_ROCK_WEAVE',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 60,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.OYSTER_BED, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROCK_UNDERWATER, zOffset: 25 }
    ]
  },
  {
    id: 'ACT3_SEAWEED_CORRIDOR',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 60,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SEAWEED_TALL, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.SEAWEED_TALL, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.STINGRAY, zOffset: 25 }
    ]
  },
  // Extreme / Storm
  {
    id: 'ACT3_DEEP_CHAOS',
    complexity: 'EXTREME',
    act: Act.DIVING,
    length: 120, 
    obstacles: [
      // Phase 1: Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.CORAL_REEF, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_UNDERWATER, zOffset: 0 },
      // Phase 2: Block R+C, go LEFT
      { lane: Lane.RIGHT, type: ObstacleType.JELLYFISH, zOffset: 20 },
      { lane: Lane.CENTER, type: ObstacleType.SEAWEED_TALL, zOffset: 20 },
      // Phase 3: Block L+R, go CENTER
      { lane: Lane.LEFT, type: ObstacleType.SEA_TURTLE, zOffset: 40 },
      { lane: Lane.RIGHT, type: ObstacleType.CORAL_REEF, zOffset: 40 },
      // Phase 4: Block C+L, go RIGHT
      { lane: Lane.CENTER, type: ObstacleType.STINGRAY, zOffset: 60 },
      { lane: Lane.LEFT, type: ObstacleType.ROCK_UNDERWATER, zOffset: 60 },
      // Phase 5: Block R+C, go LEFT
      { lane: Lane.RIGHT, type: ObstacleType.SEAWEED_TALL, zOffset: 80 },
      { lane: Lane.CENTER, type: ObstacleType.JELLYFISH, zOffset: 80 },
      // Phase 6: Block L+R, go CENTER
      { lane: Lane.LEFT, type: ObstacleType.CORAL_REEF, zOffset: 100 },
      { lane: Lane.RIGHT, type: ObstacleType.SEA_TURTLE, zOffset: 100 }
    ]
  },
  {
    id: 'ACT3_ZIGZAG_EXTREME',
    complexity: 'EXTREME',
    act: Act.DIVING,
    length: 100,
    obstacles: [
      // Zigzag forcing lane changes with 20-unit gaps
      { lane: Lane.LEFT, type: ObstacleType.CORAL_REEF, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CORAL_REEF, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.SEA_TURTLE, zOffset: 20 },
      { lane: Lane.CENTER, type: ObstacleType.JELLYFISH, zOffset: 20 },
      { lane: Lane.LEFT, type: ObstacleType.ROCK_UNDERWATER, zOffset: 40 },
      { lane: Lane.CENTER, type: ObstacleType.STINGRAY, zOffset: 40 },
      { lane: Lane.RIGHT, type: ObstacleType.SEAWEED_TALL, zOffset: 60 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_UNDERWATER, zOffset: 60 },
      { lane: Lane.LEFT, type: ObstacleType.JELLYFISH, zOffset: 80 },
      { lane: Lane.CENTER, type: ObstacleType.CORAL_REEF, zOffset: 80 }
    ]
  },
  // Storm Patterns (Underwater Currents / Turbulence)
  {
    id: 'STORM_JELLYFISH_SWARM',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 25,
    obstacles: [{ lane: 'random', type: ObstacleType.JELLYFISH, zOffset: 0 }]
  },
  {
    id: 'STORM_REEF_CHAOS',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CORAL_REEF, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROCK_UNDERWATER, zOffset: 15 } 
    ]
  },

  // =====================================================================
  // ACT 4: THE CARAVAN TRAIL - Culturally Accurate 1500 CE UAE Desert
  // Design: Trading pearls across the desert, Ghaf trees (not cacti!),
  // Bedouin camps, camel caravans, spice trade, falconry
  // =====================================================================

  // TRIVIAL: First impressions of the desert (gentle introduction)
  {
    id: 'ACT4_INTRO_DUNE',
    complexity: 'TRIVIAL',
    act: Act.DESERT,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SAND_DUNE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.GHAF_TREE, zOffset: 20 }
    ]
  },
  {
    id: 'ACT4_INTRO_MARKER',
    complexity: 'TRIVIAL',
    act: Act.DESERT,
    length: 35,
    obstacles: [
      { lane: 'random', type: ObstacleType.TRADE_ROUTE_MARKER, zOffset: 0 },
      { lane: 'random', type: ObstacleType.SPICE_SACKS, zOffset: 20 }
    ]
  },

  // SIMPLE: Basic desert obstacles
  {
    id: 'ACT4_SINGLE_DUNE',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 30,
    obstacles: [{ lane: 'random', type: ObstacleType.SAND_DUNE, zOffset: 0 }]
  },
  {
    id: 'ACT4_GHAF_TREE',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 35,
    obstacles: [{ lane: 'random', type: ObstacleType.GHAF_TREE, zOffset: 0 }]
  },
  {
    id: 'ACT4_FABRIC_SLIDE',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 30,
    obstacles: [{ lane: 'all', type: ObstacleType.HANGING_TRADE_FABRIC, zOffset: 0 }]
  },
  {
    id: 'ACT4_WADI_JUMP',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 30,
    obstacles: [{ lane: 'all', type: ObstacleType.WADI_CROSSING, zOffset: 0 }]
  },
  {
    id: 'ACT4_ORYX_SIGHTING',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 35,
    obstacles: [{ lane: 'random', type: ObstacleType.ARABIAN_ORYX, zOffset: 0 }]
  },

  // MEDIUM: Two obstacles, combinations
  {
    id: 'ACT4_DUNE_AND_ROCK',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SAND_DUNE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROCK_FORMATION, zOffset: 0 }
    ]
  },
  {
    id: 'ACT4_CAMEL_REST',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 45,
    obstacles: [
      { lane: 'random', type: ObstacleType.CAMEL_RESTING, zOffset: 0 },
      { lane: 'random', type: ObstacleType.SPICE_SACKS, zOffset: 20 }
    ]
  },
  {
    id: 'ACT4_TENT_APPROACH',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 50,
    obstacles: [
      { lane: Lane.CENTER, type: ObstacleType.BEDOUIN_TENT, zOffset: 0 },
      { lane: 'all', type: ObstacleType.TENT_ROPE_LINES, zOffset: 25 }
    ]
  },
  {
    id: 'ACT4_WELL_STOP',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 45,
    obstacles: [
      { lane: Lane.CENTER, type: ObstacleType.DESERT_WELL, zOffset: 0 },
      { lane: Lane.LEFT, type: ObstacleType.WATER_SKIN, zOffset: 20 }
    ]
  },
  {
    id: 'ACT4_TRADE_GOODS',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 50,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SPICE_SACKS, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.FALLEN_TRADE_GOODS, zOffset: 20 }
    ]
  },

  // HARD: Three obstacles, longer patterns
  {
    id: 'ACT4_CARAVAN_PASS',
    complexity: 'HARD',
    act: Act.DESERT,
    length: 80,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_CARAVAN, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_CARAVAN, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.TRADE_ROUTE_MARKER, zOffset: 40 },
      { lane: 'all', type: ObstacleType.WADI_CROSSING, zOffset: 65 }
    ]
  },
  {
    id: 'ACT4_GHAF_CORRIDOR',
    complexity: 'HARD',
    act: Act.DESERT,
    length: 70,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.GHAF_TREE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.GHAF_TREE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ARABIAN_ORYX, zOffset: 30 },
      { lane: 'all', type: ObstacleType.HANGING_TRADE_FABRIC, zOffset: 55 }
    ]
  },
  {
    id: 'ACT4_BEDOUIN_CAMP',
    complexity: 'HARD',
    act: Act.DESERT,
    length: 85,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.BEDOUIN_TENT, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CARAVAN_CAMPFIRE, zOffset: 0 },
      { lane: 'all', type: ObstacleType.TENT_ROPE_LINES, zOffset: 30 },
      { lane: Lane.CENTER, type: ObstacleType.BEDOUIN_TRADER, zOffset: 55 }
    ]
  },
  {
    id: 'ACT4_FALCON_HUNT',
    complexity: 'HARD',
    act: Act.DESERT,
    length: 75,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.FALCON_PERCH, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_RESTING, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_FORMATION, zOffset: 30 },
      { lane: 'all', type: ObstacleType.LOW_CAMEL_SADDLE, zOffset: 55 }
    ]
  },
  {
    id: 'ACT4_SPICE_TRAIL',
    complexity: 'HARD',
    act: Act.DESERT,
    length: 80,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SPICE_SACKS, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.FALLEN_TRADE_GOODS, zOffset: 25 },
      { lane: Lane.RIGHT, type: ObstacleType.SAND_DUNE, zOffset: 50 }
    ]
  },

  // EXTREME: Caravan Trail Gauntlet - No rest for traders!
  {
    id: 'ACT4_CARAVAN_GAUNTLET',
    complexity: 'EXTREME',
    act: Act.DESERT,
    length: 180,
    obstacles: [
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_CARAVAN, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.SAND_DUNE, zOffset: 0 },
      // Block R+C, go LEFT
      { lane: Lane.RIGHT, type: ObstacleType.GHAF_TREE, zOffset: 18 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_FORMATION, zOffset: 18 },
      // Block L+R, go CENTER + DUCK
      { lane: Lane.LEFT, type: ObstacleType.BEDOUIN_TENT, zOffset: 36 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_RESTING, zOffset: 36 },
      { lane: 'all', type: ObstacleType.HANGING_TRADE_FABRIC, zOffset: 54 },
      // Block L+C, go RIGHT
      { lane: Lane.LEFT, type: ObstacleType.SPICE_SACKS, zOffset: 72 },
      { lane: Lane.CENTER, type: ObstacleType.ARABIAN_ORYX, zOffset: 72 },
      // Block R+C, go LEFT + JUMP
      { lane: Lane.RIGHT, type: ObstacleType.FALCON_PERCH, zOffset: 90 },
      { lane: Lane.CENTER, type: ObstacleType.TRADE_ROUTE_MARKER, zOffset: 90 },
      { lane: 'all', type: ObstacleType.WADI_CROSSING, zOffset: 108 },
      // Block L+R, go CENTER
      { lane: Lane.LEFT, type: ObstacleType.GHAF_TREE, zOffset: 126 },
      { lane: Lane.RIGHT, type: ObstacleType.SAND_DUNE, zOffset: 126 },
      // Block L+C, go RIGHT + DUCK
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_CARAVAN, zOffset: 144 },
      { lane: Lane.CENTER, type: ObstacleType.BEDOUIN_TRADER, zOffset: 144 },
      { lane: 'all', type: ObstacleType.TENT_ROPE_LINES, zOffset: 162 }
    ]
  },
  {
    id: 'ACT4_OASIS_APPROACH',
    complexity: 'EXTREME',
    act: Act.DESERT,
    length: 170,
    obstacles: [
      // Phase 1: Desert obstacles
      { lane: Lane.LEFT, type: ObstacleType.SAND_DUNE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_FORMATION, zOffset: 17 },
      { lane: Lane.RIGHT, type: ObstacleType.GHAF_TREE, zOffset: 34 },
      // Phase 2: Trade camp
      { lane: Lane.LEFT, type: ObstacleType.CARAVAN_CAMPFIRE, zOffset: 51 },
      { lane: Lane.CENTER, type: ObstacleType.SPICE_SACKS, zOffset: 51 },
      { lane: 'all', type: ObstacleType.LOW_CAMEL_SADDLE, zOffset: 68 },
      // Phase 3: Animals
      { lane: Lane.RIGHT, type: ObstacleType.ARABIAN_ORYX, zOffset: 85 },
      { lane: Lane.CENTER, type: ObstacleType.CAMEL_RESTING, zOffset: 102 },
      { lane: Lane.LEFT, type: ObstacleType.FALCON_PERCH, zOffset: 119 },
      // Phase 4: Oasis well
      { lane: Lane.RIGHT, type: ObstacleType.DESERT_WELL, zOffset: 136 },
      { lane: Lane.CENTER, type: ObstacleType.WATER_SKIN, zOffset: 136 },
      { lane: 'all', type: ObstacleType.HANGING_TRADE_FABRIC, zOffset: 153 }
    ]
  },
  {
    id: 'ACT4_BEDOUIN_VILLAGE',
    complexity: 'EXTREME',
    act: Act.DESERT,
    length: 190,
    obstacles: [
      // Tent row 1
      { lane: Lane.LEFT, type: ObstacleType.BEDOUIN_TENT, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.CARAVAN_CAMPFIRE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.BEDOUIN_TRADER, zOffset: 18 },
      { lane: Lane.CENTER, type: ObstacleType.SPICE_SACKS, zOffset: 18 },
      // Rope lines (duck)
      { lane: 'all', type: ObstacleType.TENT_ROPE_LINES, zOffset: 36 },
      // Animals
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_CARAVAN, zOffset: 54 },
      { lane: Lane.RIGHT, type: ObstacleType.FALCON_PERCH, zOffset: 54 },
      { lane: Lane.CENTER, type: ObstacleType.ARABIAN_ORYX, zOffset: 72 },
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_RESTING, zOffset: 72 },
      // Fabric (duck)
      { lane: 'all', type: ObstacleType.HANGING_TRADE_FABRIC, zOffset: 90 },
      // Tent row 2
      { lane: Lane.RIGHT, type: ObstacleType.BEDOUIN_TENT, zOffset: 108 },
      { lane: Lane.CENTER, type: ObstacleType.DESERT_WELL, zOffset: 108 },
      { lane: Lane.LEFT, type: ObstacleType.TRADE_ROUTE_MARKER, zOffset: 126 },
      { lane: Lane.CENTER, type: ObstacleType.GHAF_TREE, zOffset: 126 },
      // Wadi (jump)
      { lane: 'all', type: ObstacleType.WADI_CROSSING, zOffset: 144 },
      // Exit obstacles
      { lane: Lane.RIGHT, type: ObstacleType.SAND_DUNE, zOffset: 162 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_FORMATION, zOffset: 162 },
      { lane: 'all', type: ObstacleType.LOW_CAMEL_SADDLE, zOffset: 180 }
    ]
  },


  // --- ACT 5: HOMECOMING ---
  // Phase 1 Patterns
  {
    id: 'ACT5_SIMPLE_PATH',
    complexity: 'SIMPLE',
    act: Act.HOMECOMING,
    length: 30,
    obstacles: [{ lane: 'random', type: ObstacleType.FARM_FENCE, zOffset: 0 }]
  },
  {
    id: 'ACT5_FALAJ_JUMP',
    complexity: 'MEDIUM',
    act: Act.HOMECOMING,
    length: 40,
    obstacles: [
        { lane: 'all', type: ObstacleType.WATER_CHANNEL, zOffset: 0 },
        { lane: 'random', type: ObstacleType.TREE_BRANCH, zOffset: 25 }
    ]
  },
  {
    id: 'ACT5_HOME_STRETCH',
    complexity: 'MEDIUM',
    act: Act.HOMECOMING,
    length: 50,
    obstacles: [
        { lane: Lane.LEFT, type: ObstacleType.FARM_WORKER, zOffset: 0 },
        { lane: Lane.RIGHT, type: ObstacleType.STACKED_SUPPLIES, zOffset: 15 },
        { lane: Lane.CENTER, type: ObstacleType.HARVEST_BASKET, zOffset: 30 }
    ]
  },
  // Phase 2 Patterns (Village)
  {
      id: 'VILLAGE_WELCOME',
      complexity: 'SIMPLE',
      act: Act.HOMECOMING,
      length: 40,
      obstacles: [
          { lane: Lane.LEFT, type: ObstacleType.MARKET_GOODS, zOffset: 0 },
          { lane: Lane.RIGHT, type: ObstacleType.MARKET_GOODS, zOffset: 0 },
          { lane: Lane.CENTER, type: ObstacleType.CELEBRATION_BANNER, zOffset: 20 }
      ]
  },
  {
      id: 'CELEBRATION_ARC',
      complexity: 'MEDIUM',
      act: Act.HOMECOMING,
      length: 50,
      obstacles: [
          { lane: Lane.LEFT, type: ObstacleType.CHILDREN_PLAYING, zOffset: 0 },
          { lane: Lane.RIGHT, type: ObstacleType.CHILDREN_PLAYING, zOffset: 0 },
          { lane: 'all', type: ObstacleType.LANTERN_STRING, zOffset: 25 }
      ]
  },
  {
      id: 'VILLAGE_PATH',
      complexity: 'MEDIUM',
      act: Act.HOMECOMING,
      length: 45,
      obstacles: [
          { lane: Lane.LEFT, type: ObstacleType.GREETING_ELDER, zOffset: 0 },
          { lane: Lane.RIGHT, type: ObstacleType.VILLAGE_STALL, zOffset: 20 }
      ]
  },
  // Phase 3 Patterns (Family/Trivial)
  {
      id: 'FAMILY_PATH_SIMPLE',
      complexity: 'TRIVIAL',
      act: Act.HOMECOMING,
      length: 40,
      obstacles: [
          { lane: Lane.CENTER, type: ObstacleType.FLOWER_GARLAND, zOffset: 0 }
      ]
  },
  {
      id: 'FAMILY_DRUMS',
      complexity: 'TRIVIAL',
      act: Act.HOMECOMING,
      length: 40,
      obstacles: [
          { lane: Lane.LEFT, type: ObstacleType.CELEBRATION_DRUM, zOffset: 0 },
          { lane: Lane.RIGHT, type: ObstacleType.CELEBRATION_DRUM, zOffset: 0 }
      ]
  }
];

export const EDUCATIONAL_FACTS: EducationalFact[] = [
  { id: 1, title: "7 Chances", title_ar: "٧ فرص", text: "Apprenticeship was rigorous. A young diver (Ghais) had to prove his discipline before being allowed on the boat.", text_ar: "كان التدريب صارماً. كان على الغواص الشاب (الغيص) إثبات انضباطه قبل السماح له بركوب القارب." },
  { id: 2, title: "Dates (Rutab)", title_ar: "الرطب", text: "Dates were a primary source of energy. They provided the stamina needed for the grueling diving season (Ghous).", text_ar: "كان التمر مصدراً رئيسياً للطاقة. وفّر القوة اللازمة لموسم الغوص الشاق." },
  { id: 3, title: "Diving Gear", title_ar: "أدوات الغوص", text: "Divers used a 'Ftaam' (nose clip) made of turtle shell and a 'Khbat' (finger guard) of leather.", text_ar: "استخدم الغواصون 'الفطام' (مشبك الأنف) المصنوع من صدف السلاحف و'الخبط' (واقي الأصابع) من الجلد." },
  { id: 4, title: "The Dhow", title_ar: "المحمل", text: "These majestic ships were stitched together with coconut rope, not nails, to better withstand the waves.", text_ar: "خيطت هذه السفن المهيبة بحبال من ألياف جوز الهند، لا المسامير، لتقاوم الأمواج بشكل أفضل." },
  { id: 5, title: "Stone Weights", title_ar: "الحجارة (الحصاة)", text: "Divers used heavy stones (Hajar) attached to ropes to descend quickly to the seabed.", text_ar: "استخدم الغواصون حجارة ثقيلة (الحصاة) مربوطة بحبال للهبوط بسرعة إلى قاع البحر." },
  { id: 6, title: "Hoyamal", title_ar: "الهويامال", text: "Singing 'Hoyamal' songs helped the crew keep rhythm while hauling up divers and setting sails.", text_ar: "ساعد غناء 'الهويامال' الطاقم على ضبط الإيقاع أثناء سحب الغواصين ورفع الأشرعة." },
  { id: 7, title: "Pearls", title_ar: "اللؤلؤ", text: "The most prized pearls were perfectly round and lustrous (Dana). A single golden pearl could feed a family for a year.", text_ar: "أغلى اللآلئ كانت المستديرة واللامعة (الدانات). لؤلؤة ذهبية واحدة قد تطعم عائلة لعام كامل." },
  { id: 8, title: "Desert Trade", title_ar: "تجارة الصحراء", text: "Pearls were traded for pottery, spices, and fabrics. Trade routes connected the coast to inland cities.", text_ar: "قويض اللؤلؤ بالفخار والتوابل والأقمشة. ربطت طرق التجارة الساحل بالمدن الداخلية." },
  { id: 9, title: "Oases", title_ar: "الواحات", text: "Oases were vital rest stops with palm trees and fresh water for desert travelers.", text_ar: "كانت الواحات محطات راحة حيوية بها نخيل وماء عذب للمسافرين في الصحراء." },
  { id: 10, title: "Falaj System", title_ar: "نظام الفلاج", text: "Ancient irrigation channels (Falaj) brought water from mountains to settlements, allowing agriculture to flourish in arid lands.", text_ar: "قنوات ري قديمة (الفلاج) جلبت المياه من الجبال إلى المستوطنات، مما سمح بازدهار الزراعة في الأراضي القاحلة." }
];

export const MUSEUM_SECTIONS: MuseumSection[] = [
    {
        id: 'DIVER_LIFE',
        title: "The Pearl Diver's Life",
        title_ar: "حياة غواص اللؤلؤ",
        visualType: 'GEAR',
        content: [
            "The life of a pearl diver was one of incredible hardship and discipline.",
            "Divers (Ghais) would dive from sunrise to sunset, often completing over 50 dives a day.",
            "They relied on the Saib (puller) to haul them up safely after each dive.",
            "Their diet was strict, mostly coffee and dates, to prevent cramps underwater."
        ],
        content_ar: [
            "كانت حياة غواص اللؤلؤ مليئة بالمشقة والانضباط.",
            "يغوص الغيص من الشروق للغروب، وغالباً ما يكمل أكثر من 50 غطسة يومياً.",
            "اعتمدوا على السيب لسحبهم بأمان بعد كل غطسة.",
            "كان نظامهم الغذائي صارماً، معظمه قهوة وتمر، لتجنب التقلصات تحت الماء."
        ],
        facts: ["Divers used no oxygen tanks, only a breath-hold.", "Diving season (Al Ghaus Al Kabir) lasted 4 months and 10 days."],
        facts_ar: ["لم يستخدم الغواصون خزانات أكسجين، بل حبس الأنفاس فقط.", "استمر موسم الغوص (الغوص الكبير) 4 أشهر و10 أيام."]
    },
    {
        id: 'BOATS',
        title: "Traditional Boats of 1500 CE",
        title_ar: "قوارب تقليدية من ١٥٠٠م",
        visualType: 'DHOW',
        content: [
            "Jalboot: A small, agile pearl diving boat holding 10-15 divers. Used for shallow waters near the coast.",
            "Sambuk: A larger trading vessel with a distinctive curved stern. Could carry cargo and crew for long voyages to India.",
            "Baqara: A small coastal fishing boat used near shores.",
            "All boats were built from teak wood imported from India, stitched with coconut coir rope, not nails."
        ],
        content_ar: [
            "الجلبوت: قارب غوص صغير ورشيق يحمل ١٠-١٥ غواصاً. يُستخدم للمياه الضحلة قرب الساحل.",
            "السنبوك: سفينة تجارية أكبر بمؤخرة منحنية مميزة. تحمل البضائع والطاقم لرحلات طويلة للهند.",
            "البقارة: قارب صيد ساحلي صغير يُستخدم قرب الشواطئ.",
            "جميع القوارب صُنعت من خشب الساج المستورد من الهند، وخُيطت بحبال جوز الهند، لا بالمسامير."
        ],
        facts: ["The Jalboot was the workhorse of pearl diving.", "A Sambuk could travel to India and back in monsoon season."],
        facts_ar: ["الجلبوت كان حصان العمل في الغوص.", "السنبوك يمكنه السفر للهند والعودة في موسم الرياح الموسمية."]
    },
    {
        id: 'GULF_FISH',
        title: "Fish of the Arabian Gulf (1500 CE)",
        title_ar: "أسماك الخليج العربي (١٥٠٠م)",
        visualType: 'FISH',
        content: [
            "Hamour (Grouper): The most prized fish, brown with spots. A staple food for coastal families.",
            "Safi (Rabbitfish): A silver-blue fish, popular grilled or dried. Found in coral reefs.",
            "Shaari (Spangled Emperor): A golden-scaled fish, considered a delicacy for celebrations.",
            "Jesh (Trevally): A strong, silver fish. Caught with hand lines from dhows.",
            "Sultan Ibrahim (Red Mullet): A reddish fish caught in sandy shallows."
        ],
        content_ar: [
            "الهامور: أثمن الأسماك، بني مرقط. غذاء أساسي للعائلات الساحلية.",
            "الصافي: سمك فضي مزرق، يُشوى أو يُجفف. يوجد في الشعاب المرجانية.",
            "الشعري: سمك بحراشف ذهبية، يُعتبر طعاماً فاخراً للاحتفالات.",
            "الجش: سمك فضي قوي. يُصاد بالخيوط اليدوية من المحامل.",
            "السلطان إبراهيم: سمك أحمر يُصاد في المياه الضحلة الرملية."
        ],
        facts: ["Fish was dried and salted for desert trade caravans.", "Fishing was done at dawn and dusk when fish were active."],
        facts_ar: ["كان السمك يُجفف ويُملح لقوافل التجارة الصحراوية.", "كان الصيد يتم عند الفجر والغسق عندما تنشط الأسماك."]
    },
    {
        id: 'DATE_PALM',
        title: "The Date Palm (Nakhla)",
        title_ar: "النخلة",
        visualType: 'PALM',
        content: [
            "The date palm was called 'the tree of life' - every part was used.",
            "Dates (Rutab/Tamr): Primary source of sugar, energy, and nutrition.",
            "Fronds: Woven into baskets, mats, and roofing for Arish houses.",
            "Trunk: Used for building and fuel.",
            "Date syrup (Dibs): A sweet syrup traded across the region."
        ],
        content_ar: [
            "سُميت النخلة 'شجرة الحياة' - كل جزء منها كان يُستخدم.",
            "التمر (الرطب/التمر): مصدر رئيسي للسكر والطاقة والغذاء.",
            "السعف: يُنسج في سلال وحصائر وأسقف بيوت العريش.",
            "الجذع: يُستخدم للبناء والوقود.",
            "دبس التمر: شراب حلو يُتاجر به عبر المنطقة."
        ],
        facts: ["A single palm could produce 100+ kg of dates yearly.", "Dates were portable energy for pearl divers and desert travelers."],
        facts_ar: ["نخلة واحدة تنتج أكثر من ١٠٠ كيلو تمر سنوياً.", "التمر كان طاقة محمولة للغواصين والمسافرين في الصحراء."]
    },
    {
        id: 'CAMELS',
        title: "The Arabian Camel",
        title_ar: "الجمل العربي",
        visualType: 'CAMEL',
        content: [
            "Camels were essential for desert trade and travel.",
            "They carried pearls from the coast to inland markets.",
            "Could travel 40+ km daily with heavy loads in extreme heat.",
            "Provided milk, meat, wool for tents, and leather for goods.",
            "A wealthy merchant might own 50+ camels for trade caravans."
        ],
        content_ar: [
            "الجمال كانت أساسية للتجارة والسفر في الصحراء.",
            "حملت اللؤلؤ من الساحل إلى الأسواق الداخلية.",
            "تسافر أكثر من ٤٠ كيلومتراً يومياً بأحمال ثقيلة في الحر الشديد.",
            "توفر الحليب واللحم والصوف للخيام والجلد للبضائع.",
            "التاجر الثري قد يملك أكثر من ٥٠ جملاً لقوافل التجارة."
        ],
        facts: ["Camels can drink 100 liters of water in 10 minutes.", "They were the 'ships of the desert' connecting coast to inland."],
        facts_ar: ["الجمال تشرب ١٠٠ لتر من الماء في ١٠ دقائق.", "كانت 'سفن الصحراء' تربط الساحل بالداخل."]
    },
    {
        id: 'ARISH_HOUSES',
        title: "Arish Houses (Palm Frond Homes)",
        title_ar: "بيوت العريش",
        visualType: 'ARISH',
        content: [
            "Arish houses were made entirely from palm fronds and trunks.",
            "They were cool in summer as wind passed through the woven walls.",
            "Built to be temporary - families moved seasonally for fishing and grazing.",
            "Barasti (palm frond) mats covered floors and made sleeping areas.",
            "Wealthy families had larger compounds with separate areas for men and women."
        ],
        content_ar: [
            "بيوت العريش صُنعت بالكامل من سعف وجذوع النخيل.",
            "كانت باردة صيفاً حيث يمر الهواء عبر الجدران المنسوجة.",
            "بُنيت لتكون مؤقتة - العائلات تنتقل موسمياً للصيد والرعي.",
            "حصائر البراستي (سعف النخيل) تغطي الأرضيات وتصنع مناطق النوم.",
            "العائلات الثرية لها مجمعات أكبر بمناطق منفصلة للرجال والنساء."
        ],
        facts: ["An Arish house could be built in one day by a family.", "They were rebuilt each year before summer."],
        facts_ar: ["بيت العريش يمكن بناؤه في يوم واحد من قبل العائلة.", "كانت تُعاد بناؤها كل عام قبل الصيف."]
    },
    {
        id: 'COSTUMES',
        title: "Traditional Dress (1500 CE)",
        title_ar: "الملابس التقليدية (١٥٠٠م)",
        visualType: 'NPC',
        content: [
            "Men's Kandura/Dishdasha: A long white cotton robe, ankle-length, for coolness.",
            "Ghutra: White or checkered headcloth, held by the Agal (black cord ring).",
            "Women's Abaya: A loose black outer garment covering the body.",
            "Hijab/Sheila: Head covering worn by women in public.",
            "Burqa: A gold or indigo face mask worn by some women, made of fabric."
        ],
        content_ar: [
            "كندورة/دشداشة الرجال: ثوب قطني أبيض طويل حتى الكاحل، للبرودة.",
            "الغترة: قماش رأس أبيض أو مخطط، يُثبت بالعقال (حلقة سوداء).",
            "عباءة النساء: ثوب أسود فضفاض يغطي الجسم.",
            "الحجاب/الشيلة: غطاء الرأس الذي ترتديه النساء في الأماكن العامة.",
            "البرقع: قناع وجه ذهبي أو نيلي ترتديه بعض النساء، مصنوع من القماش."
        ],
        facts: ["White was preferred as it reflects the sun's heat.", "Indigo dye was imported from India for special garments."],
        facts_ar: ["الأبيض كان مفضلاً لأنه يعكس حرارة الشمس.", "صبغة النيلي استُوردت من الهند للملابس الخاصة."]
    },
    {
        id: 'PEARLS',
        title: "Treasures of the Deep",
        title_ar: "كنوز الأعماق",
        visualType: 'PEARL',
        content: [
            "Pearls were the primary source of wealth before oil.",
            "They were graded by size, shape, luster, and color.",
            "Dana: The most valuable, perfectly round pearl.",
            "Hasbah: A large, irregular pearl.",
            "Badla: A small, irregular pearl often used for medicine or decoration."
        ],
        content_ar: [
            "كان اللؤلؤ المصدر الرئيسي للثروة قبل النفط.",
            "صُنف حسب الحجم والشكل واللمعان واللون.",
            "الدانة: أغلى لؤلؤة، مستديرة تماماً.",
            "الحصباة: لؤلؤة كبيرة غير منتظمة.",
            "البدلة: لؤلؤة صغيرة غير منتظمة تستخدم غالباً للزينة أو الدواء."
        ],
        facts: ["A perfect Dana pearl could buy a house.", "Pearl merchants (Tawaweesh) traveled to India and Persia to sell."],
        facts_ar: ["لؤلؤة دانة مثالية يمكن أن تشتري منزلاً.", "تجار اللؤلؤ (الطواويش) سافروا للهند وفارس للبيع."]
    },
    {
        id: 'DIVING_GEAR',
        title: "Pearl Diving Equipment",
        title_ar: "أدوات غوص اللؤلؤ",
        visualType: 'GEAR',
        content: [
            "Ftaam: A nose clip made from turtle shell or sheep bone to block water.",
            "Khbat: Leather finger guards to protect hands while opening oysters.",
            "Diyeen (Hajar): A heavy stone tied to a rope to help divers descend quickly.",
            "Yda: A woven basket hung around the neck to collect oysters.",
            "Idaal: The lifeline rope connecting the diver to the Saib (puller) above."
        ],
        content_ar: [
            "الفطام: مشبك أنف من صدف السلاحف أو عظام الغنم لمنع الماء.",
            "الخبط: واقيات جلدية للأصابع لحماية اليدين عند فتح المحار.",
            "الديين (الحجر): حجر ثقيل مربوط بحبل لمساعدة الغواص على الهبوط سريعاً.",
            "اليدا: سلة منسوجة تُعلق حول الرقبة لجمع المحار.",
            "الإيدال: حبل النجاة الذي يربط الغواص بالسيب (الساحب) فوق."
        ],
        facts: ["Divers could hold their breath for 2-3 minutes.", "The Diyeen stone weighed 5-7 kg."],
        facts_ar: ["الغواصون يمكنهم حبس أنفاسهم لدقيقتين أو ثلاث.", "حجر الديين كان يزن ٥-٧ كيلوغرامات."]
    }
];

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
    invincibility: false,
    autoCollect: false,
    slowMode: false,
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    subtitles: true,
    // Audio defaults
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 80,
    // Enhanced Accessibility (Award-Winning)
    colorblindMode: 'none',
    oneHandedMode: false,
    cognitiveSpeed: 100,
    hapticFeedback: true,
    screenReaderMode: false,
    audioDescriptions: false
};

export const CULTURAL_ANNOTATIONS: Record<string, CulturalAnnotation> = {
  [ObstacleType.DHOW]: {
    id: 'dhow',
    title: 'The Dhow',
    title_ar: 'المحمل',
    text: 'The traditional dhow was constructed from teak and stitched together with coconut rope (coir) rather than nails, allowing it to flex with the waves.',
    text_ar: 'صُنع المحمل التقليدي من خشب الساج وخُيط بحبال جوز الهند بدلاً من المسامير، مما سمح له بالمرونة مع الأمواج.',
    triggerTypes: [ObstacleType.DHOW]
  },
  [ObstacleType.WATER_JAR]: {
    id: 'jahla',
    title: 'Jahla',
    title_ar: 'الجحلة',
    text: 'A clay vessel used for storing and cooling water. It was often hung in the shade where the wind could aid evaporation.',
    text_ar: 'وعاء طيني يستخدم لتخزين وتبريد الماء. غالباً ما كان يُعلق في الظل حيث يساعد الرياح على التبخر.',
    triggerTypes: [ObstacleType.WATER_JAR]
  },
  [ObstacleType.MARKET_STALL]: {
    id: 'souq',
    title: 'Souq Stall',
    title_ar: 'دكان السوق',
    text: 'Trade was vital. Merchants sold spices, fabrics, and pottery brought from across the Indian Ocean.',
    text_ar: 'كانت التجارة حيوية. باع التجار التوابل والأقمشة والفخار المجلوبة من عبر المحيط الهندي.',
    triggerTypes: [ObstacleType.MARKET_STALL]
  }
};

export const JOURNAL_DATA: JournalPage[] = [
  {
    id: 'page_start',
    title: 'The Journey Begins',
    title_ar: 'بداية الرحلة',
    type: 'STORY',
    content: 'Father says the sea gives and takes. I must prove I am strong enough to take what it offers without being taken myself.',
    content_ar: 'يقول أبي إن البحر يعطي ويأخذ. يجب أن أثبت أنني قوي بما يكفي لآخذ ما يقدمه دون أن يأخذني.',
    unlockCondition: 'Start your journey',
    unlockCondition_ar: 'ابدأ رحلتك',
    illustration: '🌅'
  },
  {
    id: 'page_500m',
    title: 'Endurance',
    title_ar: 'التحمل',
    type: 'WISDOM',
    content: 'The sand is heavy, but my will is lighter. I run not just with my legs, but with my heart.',
    content_ar: 'الرمل ثقيل، لكن إرادتي أخف. لا أركض بساقي فقط، بل بقلبي.',
    unlockCondition: 'Run 500m',
    unlockCondition_ar: 'اركض 500 متر',
    illustration: '🏃'
  },
  {
      id: 'page_harbor',
      title: 'The Harbor',
      title_ar: 'الميناء',
      type: 'STORY',
      content: 'The harbor is alive. Ships from distant lands, the smell of spices and salt. The world is bigger than I thought.',
      content_ar: 'الميناء ينبض بالحياة. سفن من أراض بعيدة، رائحة التوابل والملح. العالم أكبر مما ظننت.',
      unlockCondition: 'Reach the Harbor',
      unlockCondition_ar: 'صل إلى الميناء',
      illustration: '⚓'
  },
  {
      id: 'page_storm',
      title: 'The Storm',
      title_ar: 'العاصفة',
      type: 'STORY',
      content: 'The sky broke open. Rain like stones. We held the ropes until our hands bled. We survived.',
      content_ar: 'انشقت السماء. مطر كالحجارة. تمسكنا بالحبال حتى دمت أيدينا. نجونا.',
      unlockCondition: 'Survive the Storm',
      unlockCondition_ar: 'انجُ من العاصفة',
      illustration: '⚡'
  },
  {
      id: 'page_desert',
      title: 'Desert Crossing',
      title_ar: 'عبر الصحراء',
      type: 'STORY',
      content: 'The oasis was a mirage, but the heat is real. We trade pearls for dates here. The desert is a dry ocean.',
      content_ar: 'كانت الواحة سراباً، لكن الحرارة حقيقية. نقايض اللؤلؤ بالتمر هنا. الصحراء محيط جاف.',
      unlockCondition: 'Reach the Desert',
      unlockCondition_ar: 'صل إلى الصحراء',
      illustration: '🐪'
  },
  {
      id: 'page_home',
      title: 'Homecoming',
      title_ar: 'العودة للديار',
      type: 'STORY',
      content: 'I see the palm trees of my village. I hear my mother\'s voice. The journey has changed me.',
      content_ar: 'أرى نخيل قريتي. أسمع صوت أمي. لقد غيرتني الرحلة.',
      unlockCondition: 'Return Home',
      unlockCondition_ar: 'عُد إلى الديار',
      illustration: '🏘️'
  },
  {
      id: 'page_hurt',
      title: 'Resilience',
      title_ar: 'المرونة',
      type: 'WISDOM',
      content: 'A scar is just a reminder that you survived. Stand up, Rashid.',
      content_ar: 'الندبة مجرد تذكير بأنك نجوت. انهض يا راشد.',
      unlockCondition: 'Lose a life',
      unlockCondition_ar: 'افقد محاولة',
      illustration: '🩹'
  },
  {
      id: 'page_dates',
      title: 'Sweet Sustenance',
      title_ar: 'الزاد الحلو',
      type: 'COLLECTION',
      content: 'Dates provide the sugar and energy to keep going when the body wants to stop.',
      content_ar: 'يوفر التمر السكر والطاقة لمواصلة المسير عندما يريد الجسد التوقف.',
      unlockCondition: 'Collect 20 Dates',
      unlockCondition_ar: 'اجمع 20 تمرة',
      illustration: '🌴'
  }
];
// ================================================================
// AWARD-WINNING FEATURES: Living Museum, Accessibility, Community
// ================================================================

import { LivingMuseumScene, Achievement, CommunityEvent, PlayerSkillProfile, AdaptiveDifficultyState, GenerationProgress } from './types';

// Living Museum: 3D Explorable Historical Diorama
export const LIVING_MUSEUM_SCENES: LivingMuseumScene[] = [
  {
    id: 'harbor_1500',
    name: 'Pearl Harbor, 1500 CE',
    name_ar: 'ميناء اللؤلؤ، ١٥٠٠م',
    description: 'Walk through a bustling pearl trading harbor. Dhows creak at their moorings as divers prepare for the season.',
    description_ar: 'تجول في ميناء تجارة اللؤلؤ الصاخب. تصرّ المراكب عند مراسيها بينما يستعد الغواصون للموسم.',
    era: '1500 CE',
    hotspots: [
      { id: 'dhow_main', position: [0, 0, 5], title: 'The Jalboot', title_ar: 'الجالبوت', description: 'A traditional pearl diving boat, typically carrying 10-15 divers and crew. The hull is stitched with coconut fiber rope, not nails.', description_ar: 'مركب صيد اللؤلؤ التقليدي، يحمل عادة ١٠-١٥ غواصاً وطاقماً. الهيكل مخيط بحبال ألياف جوز الهند، وليس المسامير.', artifact: 'DHOW', linkedSection: 'boats' },
      { id: 'diver_prep', position: [-3, 0, 2], title: 'Diver\'s Station', title_ar: 'محطة الغواص', description: 'Here divers prepare their equipment: the ftaam (nose clip), khbat (finger guards), and diyeen (diving stone).', description_ar: 'هنا يجهز الغواصون معداتهم: الفطام (مشبك الأنف)، الخبط (واقيات الأصابع)، والديين (حجر الغوص).', artifact: 'GEAR' },
      { id: 'pearl_merchant', position: [4, 0, 3], title: 'Pearl Merchant', title_ar: 'تاجر اللؤلؤ', description: 'The tawwash (pearl merchant) evaluates each pearl. A single dana (perfect round pearl) could feed a family for a year.', description_ar: 'يقيّم الطواش (تاجر اللؤلؤ) كل لؤلؤة. دانة واحدة (لؤلؤة مستديرة مثالية) يمكن أن تطعم عائلة لمدة عام.', artifact: 'PEARL' },
      { id: 'nahham_singer', position: [2, 0, -2], title: 'The Nahham', title_ar: 'النهّام', description: 'The ship\'s singer leads work songs that synchronize the crew\'s rowing and lifting. His voice carries across the harbor.', description_ar: 'مغني السفينة يقود أغاني العمل التي تنسق تجديف الطاقم ورفعهم. صوته يصل عبر الميناء.' },
      { id: 'water_seller', position: [-2, 0, -3], title: 'Water Carrier', title_ar: 'السقّاء', description: 'Fresh water is precious. The saqqa carries goatskin water bags to ships departing for weeks at sea.', description_ar: 'المياه العذبة ثمينة. يحمل السقّاء قرب الماء من جلد الماعز إلى السفن المغادرة لأسابيع في البحر.' }
    ],
    ambientSound: 'harbor_ambient'
  },
  {
    id: 'diving_site',
    name: 'The Diving Grounds',
    name_ar: 'مغاصات اللؤلؤ',
    description: 'Descend to the pearl beds where divers spend up to 2 minutes underwater, collecting oysters in woven baskets.',
    description_ar: 'انزل إلى مغاصات اللؤلؤ حيث يقضي الغواصون دقيقتين تحت الماء، يجمعون المحار في سلال منسوجة.',
    era: '1500 CE',
    hotspots: [
      { id: 'oyster_bed', position: [0, -3, 0], title: 'Oyster Bed (Heer)', title_ar: 'الهير', description: 'The heer are oyster banks where pearl-producing shellfish cluster. Divers memorize their locations generation after generation.', description_ar: 'الهير هي ضفاف المحار حيث تتجمع الأصداف المنتجة للؤلؤ. يحفظ الغواصون مواقعها جيلاً بعد جيل.', artifact: 'UNDERWATER' },
      { id: 'diving_stone', position: [2, -2, 1], title: 'Diving Stone (Hajar)', title_ar: 'حجر الغوص', description: 'A heavy stone tied to the diver\'s foot to help descend quickly. The puller (saib) holds the rope above.', description_ar: 'حجر ثقيل مربوط بقدم الغواص للمساعدة في النزول بسرعة. يمسك الساحب (السيب) الحبل من فوق.' },
      { id: 'coral_garden', position: [-3, -4, 2], title: 'Coral Gardens', title_ar: 'حدائق المرجان', description: 'Living coral provides shelter for fish and oysters. Divers learn to navigate without damaging this fragile ecosystem.', description_ar: 'يوفر المرجان الحي مأوى للأسماك والمحار. يتعلم الغواصون التنقل دون الإضرار بهذا النظام البيئي الهش.' }
    ],
    ambientSound: 'underwater_ambient'
  },
  {
    id: 'desert_caravan',
    name: 'The Caravan Trail',
    name_ar: 'طريق القوافل',
    description: 'Join a trading caravan crossing the golden dunes. Camels carry pearls, spices, and hopes across the desert.',
    description_ar: 'انضم إلى قافلة تجارية تعبر الكثبان الذهبية. تحمل الجمال اللؤلؤ والتوابل والآمال عبر الصحراء.',
    era: '1500 CE',
    hotspots: [
      { id: 'camel_train', position: [0, 0, 3], title: 'Camel Caravan', title_ar: 'قافلة الجمال', description: 'Ships of the desert carry up to 200 kg each. A caravan of 50 camels could transport an entire season\'s pearl harvest.', description_ar: 'سفن الصحراء تحمل ما يصل إلى ٢٠٠ كجم لكل منها. قافلة من ٥٠ جملاً يمكنها نقل محصول موسم كامل من اللؤلؤ.', artifact: 'CAMEL' },
      { id: 'bedouin_tent', position: [-4, 0, 0], title: 'Beit Al Sha\'ar', title_ar: 'بيت الشَعر', description: 'The black tent of goat hair has housed Bedouin families for millennia. It breathes in summer and insulates in winter.', description_ar: 'بيت الشَعر الأسود المصنوع من شعر الماعز أوى عائلات البدو لآلاف السنين. يتنفس في الصيف ويعزل في الشتاء.', artifact: 'ARISH' },
      { id: 'well_station', position: [3, 0, -2], title: 'Desert Well (Bir)', title_ar: 'البئر', description: 'Wells are lifelines in the desert. Their locations are closely guarded secrets, passed down through tribal knowledge.', description_ar: 'الآبار شريان حياة في الصحراء. مواقعها أسرار محروسة بعناية، تُورَّث عبر المعرفة القبلية.' },
      { id: 'ghaf_shade', position: [5, 0, 1], title: 'Ghaf Tree', title_ar: 'شجرة الغاف', description: 'The UAE\'s national tree. Its deep roots find water others cannot. Its shade saves lives.', description_ar: 'الشجرة الوطنية للإمارات. جذورها العميقة تجد الماء حيث لا يستطيع غيرها. ظلها ينقذ الأرواح.', artifact: 'PALM' }
    ],
    ambientSound: 'desert_wind'
  },
  {
    id: 'village_home',
    name: 'The Village Home',
    name_ar: 'بيت القرية',
    description: 'Return to the coastal village where families await. Palm-frond houses echo with stories of the sea.',
    description_ar: 'عُد إلى القرية الساحلية حيث تنتظر العائلات. بيوت سعف النخيل تردد قصص البحر.',
    era: '1500 CE',
    hotspots: [
      { id: 'arish_house', position: [0, 0, 2], title: 'Arish House', title_ar: 'بيت العريش', description: 'Built from date palm fronds, the arish provides natural cooling. Families gather in the courtyard for meals.', description_ar: 'مبني من سعف النخيل، يوفر العريش تبريداً طبيعياً. تتجمع العائلات في الفناء لتناول الطعام.', artifact: 'ARISH' },
      { id: 'falaj_water', position: [3, 0, 0], title: 'Falaj System', title_ar: 'نظام الفلج', description: 'Ancient irrigation channels carry mountain water to farms and homes. A UNESCO-recognized engineering marvel.', description_ar: 'قنوات الري القديمة تحمل مياه الجبال إلى المزارع والبيوت. أعجوبة هندسية معترف بها من اليونسكو.' },
      { id: 'date_grove', position: [-3, 0, 1], title: 'Date Palm Grove', title_ar: 'بستان النخيل', description: 'Each tree is named and known. Dates ripen in stages: kimri, khalal, rutab, tamr. Nothing is wasted.', description_ar: 'كل شجرة لها اسم ومعروفة. ينضج التمر على مراحل: كمري، خلال، رطب، تمر. لا شيء يُهدر.', artifact: 'PALM' },
      { id: 'mother_waiting', position: [0, 0, -3], title: 'Mother\'s Welcome', title_ar: 'ترحيب الأم', description: 'Mothers scan the horizon for returning sails. The cry of "Al-awwal!" (First sighting!) brings the village running.', description_ar: 'تتفحص الأمهات الأفق بحثاً عن أشرعة العائدين. صرخة "الأول!" (أول مشاهدة!) تجعل القرية تهرع.', artifact: 'NPC' }
    ],
    ambientSound: 'village_ambient'
  }
];

// Enhanced Accessibility Defaults
export const ENHANCED_ACCESSIBILITY_DEFAULTS: import('./types').AccessibilitySettings = {
  ...DEFAULT_ACCESSIBILITY_SETTINGS,
  colorblindMode: 'none',
  oneHandedMode: false,
  cognitiveSpeed: 100,
  hapticFeedback: true,
  screenReaderMode: false,
  audioDescriptions: false
};

// Colorblind Filter Matrices (CSS filter values)
export const COLORBLIND_FILTERS = {
  none: 'none',
  deuteranopia: 'url(#deuteranopia-filter)',
  protanopia: 'url(#protanopia-filter)',
  tritanopia: 'url(#tritanopia-filter)'
};

// Achievements System
export const ACHIEVEMENTS: Achievement[] = [
  // Story Achievements
  { id: 'first_dive', name: 'First Breath Below', name_ar: 'أول نفس تحت الماء', description: 'Complete your first dive', description_ar: 'أكمل غوصتك الأولى', icon: '🌊', category: 'story', requirement: 'reach_act_3', unlocked: false, rarity: 'common' },
  { id: 'desert_crossed', name: 'Dune Walker', name_ar: 'عابر الكثبان', description: 'Cross the desert successfully', description_ar: 'اعبر الصحراء بنجاح', icon: '🐪', category: 'story', requirement: 'reach_act_5', unlocked: false, rarity: 'common' },
  { id: 'story_complete', name: 'A Father\'s Pride', name_ar: 'فخر الأب', description: 'Complete Rashid\'s journey', description_ar: 'أكمل رحلة راشد', icon: '🏆', category: 'story', requirement: 'complete_main_story', unlocked: false, rarity: 'rare' },
  { id: 'prologue_complete', name: 'Like Father, Like Son', name_ar: 'الولد سر أبيه', description: 'Complete Abdullah\'s prologue', description_ar: 'أكمل مقدمة عبدالله', icon: '👨', category: 'story', requirement: 'complete_prologue', unlocked: false, rarity: 'rare' },
  { id: 'epilogue_complete', name: 'Full Circle', name_ar: 'دائرة مكتملة', description: 'Complete all three generations', description_ar: 'أكمل الأجيال الثلاثة', icon: '👨‍👦‍👦', category: 'story', requirement: 'complete_epilogue', unlocked: false, rarity: 'legendary' },
  
  // Skill Achievements
  { id: 'perfect_run', name: 'Untouchable', name_ar: 'لا يُمس', description: 'Complete a run without taking damage', description_ar: 'أكمل جولة بدون أي ضرر', icon: '✨', category: 'skill', requirement: 'no_damage_run', unlocked: false, rarity: 'epic' },
  { id: 'speed_demon', name: 'Swift as the Falcon', name_ar: 'سريع كالصقر', description: 'Reach maximum speed', description_ar: 'صل إلى السرعة القصوى', icon: '🦅', category: 'skill', requirement: 'max_speed', unlocked: false, rarity: 'rare' },
  { id: 'close_calls', name: 'Dancing with Danger', name_ar: 'رقص مع الخطر', description: 'Trigger 50 near-misses', description_ar: 'نجّذ ٥٠ تفادياً ضيقاً', icon: '💃', category: 'skill', requirement: 'near_miss_50', unlocked: false, rarity: 'rare' },
  { id: 'endless_master', name: 'Eternal Runner', name_ar: 'العداء الأبدي', description: 'Reach 50,000m in Endless mode', description_ar: 'اقطع ٥٠،٠٠٠ متر في الوضع اللانهائي', icon: '♾️', category: 'skill', requirement: 'endless_50k', unlocked: false, rarity: 'legendary' },
  
  // Cultural Achievements
  { id: 'museum_explorer', name: 'Seeker of Knowledge', name_ar: 'طالب العلم', description: 'Visit all Living Museum scenes', description_ar: 'زر جميع مشاهد المتحف الحي', icon: '🏛️', category: 'cultural', requirement: 'all_museum_scenes', unlocked: false, rarity: 'rare' },
  { id: 'bilingual', name: 'Bridge of Languages', name_ar: 'جسر اللغات', description: 'Play in both English and Arabic', description_ar: 'العب بالإنجليزية والعربية', icon: '🌍', category: 'cultural', requirement: 'both_languages', unlocked: false, rarity: 'common' },
  { id: 'journal_complete', name: 'Chronicler', name_ar: 'المؤرخ', description: 'Unlock all journal pages', description_ar: 'افتح جميع صفحات المذكرات', icon: '📖', category: 'cultural', requirement: 'all_journal', unlocked: false, rarity: 'epic' },
  { id: 'cultural_ambassador', name: 'Cultural Ambassador', name_ar: 'سفير الثقافة', description: 'Share 10 cultural facts', description_ar: 'شارك ١٠ حقائق ثقافية', icon: '🤝', category: 'cultural', requirement: 'share_10_facts', unlocked: false, rarity: 'rare' },
  
  // Community Achievements
  { id: 'first_share', name: 'Storyteller', name_ar: 'راوي القصص', description: 'Share your first cultural fact', description_ar: 'شارك أول حقيقة ثقافية', icon: '📢', category: 'community', requirement: 'first_share', unlocked: false, rarity: 'common' },
  { id: 'community_pearl', name: 'Community Pearl', name_ar: 'لؤلؤة المجتمع', description: 'Contribute to global pearl count', description_ar: 'ساهم في عدد اللؤلؤ العالمي', icon: '🫂', category: 'community', requirement: 'contribute_pearls', unlocked: false, rarity: 'common' },
  
  // Accessibility Achievements
  { id: 'accessibility_hero', name: 'Inclusive Champion', name_ar: 'بطل الشمولية', description: 'Complete the game using accessibility features', description_ar: 'أكمل اللعبة باستخدام ميزات إمكانية الوصول', icon: '♿', category: 'accessibility', requirement: 'accessibility_complete', unlocked: false, rarity: 'rare' }
];

// Community Events (Example seasonal content)
export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: 'ramadan_2026',
    name: 'Ramadan Reflections',
    name_ar: 'تأملات رمضانية',
    description: 'Special Ramadan-themed content celebrating the holy month',
    description_ar: 'محتوى خاص بشهر رمضان المبارك',
    type: 'ramadan',
    startDate: '2026-02-28',
    endDate: '2026-03-30',
    rewards: ['ramadan_trail', 'iftar_collectible', 'lantern_skin'],
    active: true
  },
  {
    id: 'uae_national_day_2026',
    name: 'Spirit of the Union',
    name_ar: 'روح الاتحاد',
    description: 'Celebrate UAE National Day with special heritage content',
    description_ar: 'احتفل باليوم الوطني الإماراتي بمحتوى تراثي خاص',
    type: 'national_day',
    startDate: '2026-12-02',
    endDate: '2026-12-03',
    rewards: ['flag_trail', 'union_badge', 'heritage_costume'],
    active: false
  }
];

// Default Adaptive Difficulty Profile
export const DEFAULT_SKILL_PROFILE: PlayerSkillProfile = {
  reactionTimeAvg: 400,
  failureRate: 0.3,
  jumpAccuracy: 0.7,
  slideAccuracy: 0.7,
  laneChangeSpeed: 300,
  sessionCount: 0,
  totalPlayTime: 0,
  bestDistance: 0,
  averageDistance: 0,
  lastUpdated: Date.now()
};

export const DEFAULT_ADAPTIVE_DIFFICULTY: AdaptiveDifficultyState = {
  currentMultiplier: 1.0,
  obstacleSpacing: 1.0,
  patternComplexity: 'MEDIUM',
  speedCap: 85,
  recommendedMode: 'normal'
};

// Generation Progress Default
export const DEFAULT_GENERATION_PROGRESS: GenerationProgress = {
  prologueCompleted: false,
  mainStoryCompleted: false,
  epilogueUnlocked: false,
  epilogueCompleted: false,
  totalGenerationsPlayed: 0
};

// Generational Story Narratives
export const PROLOGUE_NARRATIVES: import('./types').NarrativeMoment[] = [
  { id: 'prologue_1', triggerPercent: 0.05, text: 'My name is Abdullah. I was once like you, Rashid—young, eager, afraid.', text_ar: 'اسمي عبدالله. كنت يوماً مثلك يا راشد—شاباً، متحمساً، خائفاً.', speaker: 'Abdullah (Young)', speaker_ar: 'عبدالله (شاباً)', emotion: 'reflective' },
  { id: 'prologue_2', triggerPercent: 0.25, text: 'My father, your grandfather, taught me to read the sea. Now I understand his silence was not coldness—it was concentration.', text_ar: 'أبي، جدك، علمني قراءة البحر. الآن أفهم أن صمته لم يكن برودة—بل كان تركيزاً.', speaker: 'Abdullah (Young)', speaker_ar: 'عبدالله (شاباً)', emotion: 'nostalgic' },
  { id: 'prologue_3', triggerPercent: 0.50, text: 'The first pearl I found, I gave to your grandmother. She still wears it.', text_ar: 'أول لؤلؤة وجدتها، أهديتها لجدتك. لا تزال ترتديها.', speaker: 'Abdullah (Young)', speaker_ar: 'عبدالله (شاباً)', emotion: 'tender' },
  { id: 'prologue_4', triggerPercent: 0.75, text: 'I dreamed of you before you were born, running through these same lanes.', text_ar: 'حلمت بك قبل أن تولد، تركض عبر هذه الممرات ذاتها.', speaker: 'Abdullah (Young)', speaker_ar: 'عبدالله (شاباً)', emotion: 'prophetic' },
  { id: 'prologue_5', triggerPercent: 0.95, text: 'And now, years later, I watch you run. The circle continues.', text_ar: 'والآن، بعد سنوات، أراقبك تركض. الدائرة تستمر.', speaker: 'Abdullah', speaker_ar: 'عبدالله', emotion: 'proud' }
];

export const EPILOGUE_NARRATIVES: import('./types').NarrativeMoment[] = [
  { id: 'epilogue_1', triggerPercent: 0.05, text: 'Baba, was it scary? Your first journey?', text_ar: 'بابا، هل كان مخيفاً؟ رحلتك الأولى؟', speaker: 'Your Child', speaker_ar: 'طفلك', emotion: 'curious' },
  { id: 'epilogue_2', triggerPercent: 0.20, text: 'Yes, habibi. But fear is a compass. It shows you where courage is needed.', text_ar: 'نعم، حبيبي. لكن الخوف بوصلة. يُريك أين الشجاعة مطلوبة.', speaker: 'Rashid (Father)', speaker_ar: 'راشد (أباً)', emotion: 'wise' },
  { id: 'epilogue_3', triggerPercent: 0.45, text: 'My father gave me seven chances. I give you the same. Use them wisely.', text_ar: 'أعطاني أبي سبع فرص. أعطيك إياها. استخدمها بحكمة.', speaker: 'Rashid (Father)', speaker_ar: 'راشد (أباً)', emotion: 'loving' },
  { id: 'epilogue_4', triggerPercent: 0.70, text: 'I see your grandfather in your eyes. He would be proud.', text_ar: 'أرى جدك في عينيك. كان سيكون فخوراً.', speaker: 'Rashid (Father)', speaker_ar: 'راشد (أباً)', emotion: 'nostalgic' },
  { id: 'epilogue_5', triggerPercent: 0.95, text: 'Run, my child. The sea awaits the next generation.', text_ar: 'اركض، يا ولدي. البحر ينتظر الجيل القادم.', speaker: 'Rashid (Father)', speaker_ar: 'راشد (أباً)', emotion: 'hopeful' }
];

// UI Translations for new features
export const UI_TRANSLATIONS_EXTENDED = {
  LIVING_MUSEUM: { en: 'Living Museum', ar: 'المتحف الحي' },
  EXPLORE_3D: { en: '3D Explore', ar: 'استكشف ثلاثي الأبعاد' },
  ENCYCLOPEDIA: { en: 'Encyclopedia', ar: 'الموسوعة' },
  HOTSPOT_TAP: { en: 'Tap hotspots to learn', ar: 'اضغط على النقاط للتعلم' },
  COMMUNITY: { en: 'Community', ar: 'المجتمع' },
  ACHIEVEMENTS: { en: 'Achievements', ar: 'الإنجازات' },
  GLOBAL_STATS: { en: 'Global Statistics', ar: 'إحصائيات عالمية' },
  SHARE_FACT: { en: 'Share This Fact', ar: 'شارك هذه الحقيقة' },
  COLORBLIND_MODE: { en: 'Colorblind Mode', ar: 'وضع عمى الألوان' },
  ONE_HANDED: { en: 'One-Handed Mode', ar: 'وضع يد واحدة' },
  COGNITIVE_SPEED: { en: 'Game Speed', ar: 'سرعة اللعبة' },
  HAPTIC: { en: 'Haptic Feedback', ar: 'الاستجابة اللمسية' },
  SCREEN_READER: { en: 'Screen Reader', ar: 'قارئ الشاشة' },
  AUDIO_DESC: { en: 'Audio Descriptions', ar: 'الوصف الصوتي' },
  PROLOGUE: { en: 'Prologue: Abdullah\'s Journey', ar: 'المقدمة: رحلة عبدالله' },
  EPILOGUE: { en: 'Epilogue: Teaching Your Child', ar: 'الخاتمة: تعليم طفلك' },
  THREE_GENERATIONS: { en: 'Generations', ar: 'الأجيال' },
  PLAY_PROLOGUE: { en: 'Play as Young Abdullah', ar: 'العب كعبدالله الشاب' },
  PLAY_EPILOGUE: { en: 'Teach Your Child', ar: 'علّم طفلك' },
  COMPLETE_STORY_FIRST: { en: 'Complete main story first', ar: 'أكمل القصة الرئيسية أولاً' },
  STORY: { en: 'Story', ar: 'القصة' },
  ADAPTIVE_DIFF: { en: 'Smart Difficulty', ar: 'صعوبة ذكية' },
  SKILL_RATING: { en: 'Your Skill Level', ar: 'مستوى مهارتك' },
  DEUTERANOPIA: { en: 'Deuteranopia (Green-Blind)', ar: 'عمى اللون الأخضر' },
  PROTANOPIA: { en: 'Protanopia (Red-Blind)', ar: 'عمى اللون الأحمر' },
  TRITANOPIA: { en: 'Tritanopia (Blue-Blind)', ar: 'عمى اللون الأزرق' },
  NONE: { en: 'None', ar: 'لا شيء' },
  PEARLS_COLLECTED: { en: 'Pearls Collected Globally', ar: 'اللؤلؤ المجمّع عالمياً' },
  DISTANCE_RUN: { en: 'Distance Run Globally', ar: 'المسافة المقطوعة عالمياً' },
  ACTIVE_PLAYERS: { en: 'Active Players Today', ar: 'اللاعبون النشطون اليوم' },
  EVENT_ACTIVE: { en: 'Active Event', ar: 'حدث نشط' },
  DAYS_REMAINING: { en: 'Days Remaining', ar: 'الأيام المتبقية' },
  STATS: { en: 'Stats', ar: 'إحصائيات' },
  EVENTS: { en: 'Events', ar: 'الأحداث' }
};