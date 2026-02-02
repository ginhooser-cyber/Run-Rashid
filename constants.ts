

import { EducationalFact, ObstacleType, NarrativeMoment, TimeOfDay, Act, PatternDef, Lane, ActiveBlessing, MuseumSection, CulturalAnnotation, AccessibilitySettings, JournalPage } from './types';

// World Dimensions
export const LANE_WIDTH = -2.5; 
export const PATH_WIDTH = 10;
export const PLAYER_HEIGHT = 1.8;
export const JUMP_HEIGHT = 3.0;
export const JUMP_DURATION = 0.6; 
export const SLIDE_DURATION = 0.6; 
export const INVULNERABILITY_DURATION = 1500; // ms

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
  
  // Act 4
  desertSand: '#E0B580', // Slightly richer but matte
  desertShrub: '#6B5B3E',
  duneShadow: '#B89060',
  sunsetTop: '#E9967A',
  sunsetBottom: '#F5DEB3',
  fabricBlue: '#4682B4',
  spiceRed: '#A52A2A',

  // Act 5 Phase 1
  act5SkyTop: '#E6A8D7', 
  act5SkyBottom: '#FFDAB9', 
  dirtPath: '#C2B280',
  goldCoin: '#FFD700',
  
  // Act 5 Phase 2
  villageSkyTop: '#CD5C5C',
  villageSkyBottom: '#FFE4B5',

  // Act 5 Phase 3
  duskSkyTop: '#483D8B', 
  duskSkyBottom: '#DB7093', 
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
    sky: '#FF7F50',
    fog: '#FF6347',
    light: '#FF4500',
    intensity: 0.9,
    ambient: '#FFA07A',
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
    sky: '#DB7093',
    fog: '#FFB6C1',
    light: '#FFD700',
    intensity: 0.8,
    ambient: '#FFC0CB',
    message: 'The settlement lights up'
  },
  VILLAGE_NIGHT: {
    sky: '#191970',
    fog: '#483D8B',
    light: '#FFD700',
    intensity: 0.7,
    ambient: '#483D8B',
    message: 'The village celebrates'
  },
  DUSK: {
    sky: '#4B0082',
    fog: '#800080',
    light: '#FF69B4',
    intensity: 0.6,
    ambient: '#9932CC',
    message: 'Home at last'
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

  // Act 4: The Desert Crossing
  [ObstacleType.SAND_DUNE]: { width: 2.4, height: 1.4, depth: 1.5, color: '#F4A460', label: 'Sand Dune' },
  [ObstacleType.DESERT_SHRUB]: { width: 2.0, height: 1.2, depth: 1.0, color: '#8B7355', label: 'Desert Shrub' },
  [ObstacleType.ROCK_FORMATION]: { width: 2.2, height: 1.5, depth: 1.2, color: '#A0826D', label: 'Rock Formation' },
  [ObstacleType.CAMEL_RESTING]: { width: 2.3, height: 1.6, depth: 1.8, color: '#C19A6B', label: 'Camel' },
  [ObstacleType.LOW_TENT]: { width: 7.5, height: 0.8, depth: 0.3, color: '#D2691E', isTall: true, label: 'Low Tent' },
  [ObstacleType.HANGING_FABRIC]: { width: 7.5, height: 0.9, depth: 0.2, color: '#F5DEB3', isTall: true, label: 'Hanging Fabric' },
  [ObstacleType.ROPE_LINE]: { width: 7.5, height: 0.5, depth: 0.1, color: '#8B7355', isTall: true, label: 'Rope Line' },
  [ObstacleType.TALL_CACTUS]: { width: 1.5, height: 3.5, depth: 1.5, color: '#556B2F', label: 'Cactus' },
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
  [ObstacleType.DHOW]: { width: 2.5, height: 4.5, depth: 15.0, color: COLORS.wood, label: 'Dhow' }
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

export const INITIAL_SPEED = 18; // Slowed down from 30
export const MAX_SPEED = 80;     
export const SPEED_ACCELERATION = 0.005; // Increased from 0.003
export const SPAWN_DISTANCE_BUFFER = 60; 
export const TOTAL_DISTANCE = 15000;

// --- REBALANCED FOR 15,000m GRAND VOYAGE ---
export const ACT_STRUCTURE = {
  [Act.TRAINING_GROUNDS]: {
    start: 0,
    end: 3000,
    name: "Act I: The Training Grounds",
    collectible: 'DATE',
    difficultyMultiplier: 1.0,
    // Replaced BOXES (LOW_WALL/WATER_JAR/MARKET_STALL) with FALAJ_CROSSING and PALM_TRUNK
    obstacles: [ObstacleType.FALAJ_CROSSING, ObstacleType.CAMEL_WALKING, ObstacleType.LAUNDRY, ObstacleType.PALM_TRUNK]
  },
  [Act.HARBOR]: {
    start: 3000,
    end: 6000,
    name: "Act II: The Harbor",
    collectible: 'DIVING_GEAR',
    difficultyMultiplier: 1.4,
    obstacles: [ObstacleType.CARGO_CRATE, ObstacleType.ROPE_COIL, ObstacleType.HANGING_NET, ObstacleType.DHOW, ObstacleType.WOODEN_BEAM, ObstacleType.DOCK_POST]
  },
  [Act.DIVING]: {
    start: 6000,
    end: 9000, 
    name: "Act III: The Deep",
    collectible: 'PEARL_WHITE',
    difficultyMultiplier: 1.6,
    obstacles: [ObstacleType.OYSTER_BASKET, ObstacleType.DIVING_WEIGHTS, ObstacleType.SAIL_CANVAS, ObstacleType.MAIN_MAST, ObstacleType.CREW_GROUP, ObstacleType.WOODEN_CHEST]
  },
  [Act.DESERT]: {
    start: 9000,
    end: 12000,
    name: "Act IV: The Desert",
    collectible: 'TRADE_GOOD',
    difficultyMultiplier: 2.2,
    obstacles: [ObstacleType.SAND_DUNE, ObstacleType.DESERT_SHRUB, ObstacleType.ROCK_FORMATION, ObstacleType.LOW_TENT, ObstacleType.CAMEL_RESTING, ObstacleType.TALL_CACTUS]
  },
  [Act.HOMECOMING]: {
    start: 12000,
    end: 15000, 
    name: "Act V: Homecoming",
    collectible: 'COIN_GOLD',
    difficultyMultiplier: 2.4,
    obstacles: [ObstacleType.FARM_FENCE, ObstacleType.WATER_CHANNEL, ObstacleType.HARVEST_BASKET, ObstacleType.TREE_BRANCH, ObstacleType.DRYING_ROPE, ObstacleType.FARM_WORKER]
  }
};

// ... (Narrative and other exports unchanged)
export const ACT_TRANSITIONS = {
  [Act.TRAINING_GROUNDS]: {
    triggerPercent: 0,
    text: "Bismillāh. The journey of a thousand miles begins with a single step. Show me your heart, Rashid.",
    text_ar: "بسم الله. رحلة الألف ميل تبدأ بخطوة. أرني ما في قلبك يا راشد.",
    emotion: "calm"
  },
  [Act.HARBOR]: {
    triggerPercent: 0.2, // 20%
    text: "You have learned the ways of the land. Now, the harbor calls. The smell of salt and opportunity fills the air.",
    text_ar: "لقد تعلمت دروب البر. الآن يناديك الميناء. عبق الملح والفرص يملأ الأجواء.",
    emotion: "encouraging"
  },
  [Act.DIVING]: {
    triggerPercent: 0.4, // 40%
    text: "To the deep we go. The dhow is strong, but the sea is stronger. Respect her, and she may grant you her pearls.",
    text_ar: "إلى الأعماق نمضي. المحمل قوي، لكن البحر أقوى. احترمه، فقد يهبك لآلئه.",
    emotion: "warning"
  },
  [Act.DESERT]: {
    triggerPercent: 0.6, // 60%
    text: "We leave the blue for the gold. The desert is a sea of sand. It tests endurance, not breath. Keep moving.",
    text_ar: "نترك الأزرق إلى الذهب. الصحراء بحر من رمال، تختبر الصبر لا النفس. واصل المسير.",
    emotion: "weary"
  },
  [Act.HOMECOMING]: {
    triggerPercent: 0.8, // 80%
    text: "Do you smell the burning oud? Do you hear the laughter? The village is near. Run, my son! Run home!",
    text_ar: "هل تشم رائحة العود؟ هل تسمع الضحكات؟ القرية قريبة. اركض يا بني! اركض نحو الديار!",
    emotion: "joyful"
  }
};

export const NARRATIVE_MOMENTS: NarrativeMoment[] = [
  // ACT 1
  { id: 'act1_start', triggerPercent: 0.01, text: "I must not be late. Father is waiting.", text_ar: "يجب ألا أتأخر. أبي في الانتظار.", speaker: "Rashid", speaker_ar: "راشد", emotion: "anxious" },
  { id: 'act1_mid', triggerPercent: 0.1, text: "Focus, Rashid. Your father watches.", text_ar: "ركز يا راشد. والدك يراقبك.", speaker: "Father", speaker_ar: "الأب", emotion: "calm" },
  
  // ACT 2
  { id: 'act2_start', triggerPercent: 0.25, text: "The ships are so big... will I truly dive from them?", text_ar: "السفن ضخمة جداً... هل سأغوص منها حقاً؟", speaker: "Rashid", speaker_ar: "راشد", emotion: "wonder" },
  { id: 'act2_mid', triggerPercent: 0.35, text: "Check your ropes. A diver's life hangs by a thread.", text_ar: "تفقد حبالك. حياة الغواص معلقة بخيط.", speaker: "Father", speaker_ar: "الأب", emotion: "stern" },

  // ACT 3
  { id: 'act3_storm_warn', triggerPercent: 0.48, text: "The sky turns dark...", text_ar: "السماء تظلم...", speaker: "Rashid", speaker_ar: "راشد", emotion: "fear" },
  { id: 'act3_storm_start', triggerPercent: 0.50, text: "THE STORM IS UPON US! HOLD FAST!", text_ar: "العاصفة داهمتنا! اثبتوا!", speaker: "Father", speaker_ar: "الأب", emotion: "shouting" },
  { id: 'act3_storm_end', triggerPercent: 0.55, text: "It passes... we are safe. You did well.", text_ar: "لقد مرت... نحن بخير. أحسنت صنعاً.", speaker: "Father", speaker_ar: "الأب", emotion: "relief" },

  // ACT 4
  { id: 'act4_heat', triggerPercent: 0.65, text: "The sun... it is relentless.", text_ar: "الشمس... حرارتها لا ترحم.", speaker: "Rashid", speaker_ar: "راشد", emotion: "exhausted" },
  { id: 'act4_oasis', triggerPercent: 0.70, text: "Look! Water! An oasis in the burning sands.", text_ar: "انظر! ماء! واحة وسط الرمال الحارقة.", speaker: "Father", speaker_ar: "الأب", emotion: "hopeful" },

  // ACT 5
  { id: 'act5_home', triggerPercent: 0.90, text: "I can see the village lights!", text_ar: "أرى أضواء القرية!", speaker: "Rashid", speaker_ar: "راشد", emotion: "excited" },
  { id: 'act5_family', triggerPercent: 0.95, text: "Mother! Sisters! I have returned!", text_ar: "أمي! أخواتي! لقد عدت!", speaker: "Rashid", speaker_ar: "راشد", emotion: "joyful" },
  { id: 'act5_end', triggerPercent: 0.99, text: "Almost there...", text_ar: "اقتربنا...", speaker: "Father", speaker_ar: "الأب", emotion: "proud" }
];

export const FATHERS_BLESSINGS: Record<number, { name: string, name_ar?: string, effectType: ActiveBlessing['effectType'], visual: string, fatherSays: string, fatherSays_ar?: string, duration: number }> = {
    6: {
        name: 'FATHER\'S GUIDANCE',
        name_ar: 'توجيه الأب',
        effectType: 'SLOW_MO',
        visual: 'Golden aura',
        fatherSays: "You stumbled, my son, but you did not fall. The date palm bends in the storm yet remains rooted. Rise.",
        fatherSays_ar: "تعثرت يا بني، لكنك لم تسقط. النخلة تنحني للعاصفة وتظل راسخة. انهض.",
        duration: 3000
    },
    5: {
        name: 'WIND AT YOUR BACK',
        name_ar: 'رياح العزم',
        effectType: 'SPEED_BOOST',
        visual: 'Wind particles',
        fatherSays: "A smooth sea never made a skilled sailor. Mistakes are the stones upon which we build experience.",
        fatherSays_ar: "البحر الهادئ لا يصنع بحاراً ماهراً. الأخطاء هي الحجارة التي نبني عليها الخبرة.",
        duration: 5000
    },
    4: {
        name: 'PEARL MAGNET',
        name_ar: 'جاذب اللؤلؤ',
        effectType: 'MAGNET',
        visual: 'Magnetic shimmer',
        fatherSays: "Patience is the key to relief. (As-sabr miftah al-faraj). What is hidden will be revealed to the patient heart.",
        fatherSays_ar: "الصبر مفتاح الفرج. ما خفي سينكشف للقلب الصبور.",
        duration: 8000
    },
    3: {
        name: 'ROOTS OF STRENGTH',
        name_ar: 'جذور القوة',
        effectType: 'INVINCIBILITY',
        visual: 'Golden shield',
        fatherSays: "He who does not endure the heat will not savor the shade. Keep moving forward.",
        fatherSays_ar: "من لا يتحمل الحر لا يتذوق الظل. واصل المسير.",
        duration: 4000
    },
    2: {
        name: 'SECOND WIND',
        name_ar: 'النفس الثاني',
        effectType: 'SCREEN_CLEAR',
        visual: 'Divine wind',
        fatherSays: "Fall seven times, stand up eight. Your will is your strongest muscle, Rashid.",
        fatherSays_ar: "إن سقطت سبعاً، فقم ثمانياً. إرادتك هي أقوى عضلاتك يا راشد.",
        duration: 5000
    },
    1: {
        name: 'NAVIGATOR\'S SIGHT',
        name_ar: 'بصيرة النوخذة',
        effectType: 'NAVIGATOR_SIGHT',
        visual: 'Golden outlines',
        fatherSays: "One last chance. Trust your heart, for it knows the way home better than your eyes.",
        fatherSays_ar: "فرصة أخيرة. ثق بقلبك، فهو يعرف طريق العودة أفضل من عينيك.",
        duration: 10000
    },
    0: {
        name: 'FATHER\'S EMBRACE',
        name_ar: 'حضن الأب',
        effectType: 'GHOST_COMPANION',
        visual: 'Ghost companion',
        fatherSays: "Rest now. The body fails, but the spirit remains. We shall try again tomorrow.",
        fatherSays_ar: "استرح الآن. الجسد يكل، لكن الروح باقية. سنحاول غداً من جديد.",
        duration: 8000
    }
};

export const OBSTACLE_PATTERNS: PatternDef[] = [
  // ... (Patterns remain unchanged)
  // --- ACT 1: TRAINING GROUNDS ---
  {
    id: 'SINGLE_STALL_L',
    complexity: 'SIMPLE',
    act: Act.TRAINING_GROUNDS,
    length: 15,
    obstacles: [{ lane: Lane.LEFT, type: 'random', zOffset: 0 }]
  },
  {
    id: 'SINGLE_STALL_C',
    complexity: 'SIMPLE',
    act: Act.TRAINING_GROUNDS,
    length: 15,
    obstacles: [{ lane: Lane.CENTER, type: 'random', zOffset: 0 }]
  },
  {
    id: 'ACT1_PALM_WEAVE',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.PALM_TRUNK, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 15 },
      { lane: Lane.RIGHT, type: ObstacleType.PALM_TRUNK, zOffset: 30 }
    ]
  },
  {
    id: 'ACT1_FALAJ_SLALOM',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 50,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 }, // Center open
      { lane: 'all', type: ObstacleType.FALAJ_CROSSING, zOffset: 25 }, // Jump required
      { lane: Lane.CENTER, type: ObstacleType.PALM_TRUNK, zOffset: 45 } // Must dodge after jump
    ]
  },
  {
    id: 'LAUNDRY_CORRIDOR',
    complexity: 'MEDIUM',
    act: Act.TRAINING_GROUNDS,
    length: 25,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.LAUNDRY, zOffset: 0 }, 
      { lane: Lane.RIGHT, type: ObstacleType.CAMEL_WALKING, zOffset: 0 }
    ]
  },
  {
    id: 'ZIGZAG_PALM',
    complexity: 'HARD',
    act: Act.TRAINING_GROUNDS,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: 'random', zOffset: 0 },
      { lane: Lane.CENTER, type: 'random', zOffset: 12 },
      { lane: Lane.RIGHT, type: 'random', zOffset: 24 }
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

  // ... (Rest of patterns remain unchanged)
  // --- ACT 3: THE BIG DIVE (REBALANCED) ---
  // Simple / Medium
  {
    id: 'ACT3_BASKET_JUMP',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 35,
    obstacles: [{ lane: 'random', type: ObstacleType.OYSTER_BASKET, zOffset: 0 }]
  },
  {
    id: 'ACT3_SAIL_SLIDE',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 35,
    // Provide an open lane option instead of blocking all
    obstacles: [
        { lane: Lane.LEFT, type: ObstacleType.SAIL_CANVAS, zOffset: 0 },
        { lane: Lane.CENTER, type: ObstacleType.SAIL_CANVAS, zOffset: 0 }
    ]
  },
  {
    id: 'ACT3_MAST_AVOID',
    complexity: 'SIMPLE',
    act: Act.DIVING,
    length: 40,
    obstacles: [{ lane: 'random', type: ObstacleType.MAIN_MAST, zOffset: 0 }]
  },
  {
    id: 'ACT3_DOUBLE_BASKET',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 45,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.OYSTER_BASKET, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.WOODEN_CHEST, zOffset: 0 }
    ]
  },
  // Hard (Post Storm)
  {
    id: 'ACT3_JUMP_SLIDE_SEQ',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 65,
    obstacles: [
      { lane: 'all', type: ObstacleType.OYSTER_BASKET, zOffset: 0 },
      { lane: 'all', type: ObstacleType.SAIL_CANVAS, zOffset: 30 } 
    ]
  },
  {
    id: 'ACT3_TRIPLE_LANE',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 80,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.DIVING_WEIGHTS, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.COILED_DIVING_ROPE, zOffset: 25 }, 
      { lane: Lane.RIGHT, type: ObstacleType.OYSTER_BASKET, zOffset: 50 } 
    ]
  },
  {
    id: 'ACT3_CREW_WEAVE',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 60,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.CREW_GROUP, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CREW_GROUP, zOffset: 30 }
    ]
  },
  {
    id: 'ACT3_OVERHEAD_CHALLENGE',
    complexity: 'HARD',
    act: Act.DIVING,
    length: 60,
    obstacles: [
      { lane: Lane.CENTER, type: ObstacleType.MAIN_MAST, zOffset: 0 },
      { lane: Lane.LEFT, type: ObstacleType.OVERHEAD_RIGGING, zOffset: 25 },
      { lane: Lane.RIGHT, type: ObstacleType.OVERHEAD_RIGGING, zOffset: 25 }
    ]
  },
  // Extreme / Storm
  {
    id: 'ACT3_FULL_DECK_CHAOS',
    complexity: 'EXTREME',
    act: Act.DIVING,
    length: 100, 
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.OYSTER_BASKET, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.WOODEN_CHEST, zOffset: 25 },
      { lane: Lane.RIGHT, type: ObstacleType.DIVING_WEIGHTS, zOffset: 50 },
      { lane: Lane.LEFT, type: ObstacleType.SAIL_CANVAS, zOffset: 75 },
      { lane: Lane.CENTER, type: ObstacleType.SAIL_CANVAS, zOffset: 75 }
    ]
  },
  {
    id: 'ACT3_ZIGZAG_EXTREME',
    complexity: 'EXTREME',
    act: Act.DIVING,
    length: 80,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.MAIN_MAST, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.CREW_GROUP, zOffset: 25 },
      { lane: Lane.CENTER, type: ObstacleType.CAPTAIN_STATION, zOffset: 50 }
    ]
  },
  // Storm Patterns
  {
    id: 'STORM_BASKET_FAST',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 25,
    obstacles: [{ lane: 'random', type: ObstacleType.OYSTER_BASKET, zOffset: 0 }]
  },
  {
    id: 'STORM_CHAOS',
    complexity: 'MEDIUM',
    act: Act.DIVING,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.DIVING_WEIGHTS, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.WOODEN_CHEST, zOffset: 15 } 
    ]
  },

  // --- ACT 4: THE DESERT CROSSING ---
  // Simple
  {
    id: 'ACT4_SINGLE_DUNE',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 30,
    obstacles: [{ lane: 'random', type: ObstacleType.SAND_DUNE, zOffset: 0 }]
  },
  {
    id: 'ACT4_TENT_SLIDE',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 30,
    obstacles: [{ lane: 'all', type: ObstacleType.LOW_TENT, zOffset: 0 }]
  },
  {
    id: 'ACT4_SHRUB_JUMP',
    complexity: 'SIMPLE',
    act: Act.DESERT,
    length: 25,
    obstacles: [{ lane: 'random', type: ObstacleType.DESERT_SHRUB, zOffset: 0 }]
  },
  // Medium
  {
    id: 'ACT4_TWO_LANE_CHOICE',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 40,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SAND_DUNE, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.ROCK_FORMATION, zOffset: 0 }
    ]
  },
  {
    id: 'ACT4_JUMP_THEN_SLIDE',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 50,
    obstacles: [
      { lane: 'all', type: ObstacleType.DESERT_SHRUB, zOffset: 0 },
      { lane: 'all', type: ObstacleType.LOW_TENT, zOffset: 25 }
    ]
  },
  {
    id: 'ACT4_CAMEL_ENCOUNTER',
    complexity: 'MEDIUM',
    act: Act.DESERT,
    length: 45,
    obstacles: [{ lane: 'random', type: ObstacleType.CAMEL_RESTING, zOffset: 0 }]
  },
  // Hard
  {
    id: 'ACT4_TRIPLE_STAGGER',
    complexity: 'HARD',
    act: Act.DESERT,
    length: 70,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.SAND_DUNE, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROCK_FORMATION, zOffset: 20 },
      { lane: Lane.RIGHT, type: ObstacleType.DESERT_SHRUB, zOffset: 40 }
    ]
  },
  {
    id: 'ACT4_OASIS_CORRIDOR',
    complexity: 'HARD',
    act: Act.DESERT,
    length: 60,
    obstacles: [
      { lane: Lane.LEFT, type: ObstacleType.TALL_CACTUS, zOffset: 0 },
      { lane: Lane.RIGHT, type: ObstacleType.TALL_CACTUS, zOffset: 0 },
      { lane: Lane.CENTER, type: ObstacleType.ROPE_LINE, zOffset: 20 }
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
        id: 'DHOW',
        title: "The Dhow",
        title_ar: "المحمل (السفينة)",
        visualType: 'DHOW',
        content: [
            "The Dhow is the lifeline of the pearl trade.",
            "Constructed from teak wood, traditionally without any metal nails.",
            "Ropes made from coconut fiber were used to stitch the planks together.",
            "Cotton sails propelled them across the Arabian Gulf."
        ],
        content_ar: [
            "المحمل هو شريان حياة تجارة اللؤلؤ.",
            "صُنع من خشب الساج، تقليدياً دون مسامير معدنية.",
            "استخدمت حبال من ألياف جوز الهند لخياطة الألواح معاً.",
            "دفعتها أشرعة قطنية عبر الخليج العربي."
        ],
        facts: ["A large dhow could carry over 60 men.", "The captain (Nokhada) navigated by stars and landmarks."],
        facts_ar: ["يمكن للمحمل الكبير أن يحمل أكثر من 60 رجلاً.", "ملاح السفينة (النوخذة) يبحر مستعيناً بالنجوم والمعالم."]
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
        ]
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
