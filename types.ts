
import React from 'react';

export enum GameState {
  MENU = 'MENU',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  EDUCATION = 'EDUCATION',
  VICTORY = 'VICTORY',
  MUSEUM = 'MUSEUM',              // Combined encyclopedia + 3D explore
  PHOTO = 'PHOTO',
  SETTINGS = 'SETTINGS',
  JOURNAL = 'JOURNAL',            // Includes generational stories (Prologue/Epilogue)
  CREDITS = 'CREDITS',
  COMMUNITY = 'COMMUNITY'         // Community hub with stats, events, achievements
}

export type GameMode = 'STORY' | 'ENDLESS';
export type Language = 'en' | 'ar';

export enum Lane {
  LEFT = -1,
  CENTER = 0,
  RIGHT = 1
}

export enum Act {
  TRAINING_GROUNDS = 'TRAINING_GROUNDS',
  HARBOR = 'HARBOR', 
  DIVING = 'DIVING',
  DESERT = 'DESERT',
  HOMECOMING = 'HOMECOMING'
}

export enum ObstacleType {
  // Act 1: Training Grounds
  WATER_JAR = 'WATER_JAR',
  LAUNDRY = 'LAUNDRY',
  MARKET_STALL = 'MARKET_STALL',
  CAMEL_WALKING = 'CAMEL_WALKING', 
  PALM_TRUNK = 'PALM_TRUNK',
  LOW_WALL = 'LOW_WALL',
  FALAJ_CROSSING = 'FALAJ_CROSSING',
  
  // Act 2: Harbor (Authentic 1500 CE)
  CARGO_CRATE = 'CARGO_CRATE',
  ROPE_COIL = 'ROPE_COIL',
  HANGING_NET = 'HANGING_NET',
  WOODEN_BEAM = 'WOODEN_BEAM',
  DOCK_POST = 'DOCK_POST',
  WAREHOUSE_ENTRY = 'WAREHOUSE_ENTRY',
  JALBOOT = 'JALBOOT',         // Small pearl diving boat
  SAMBUK = 'SAMBUK',           // Larger trading vessel
  FISH_DRYING_RACK = 'FISH_DRYING_RACK',
  PEARL_BASKET = 'PEARL_BASKET',
  MOORING_POST = 'MOORING_POST',
  CARGO_SACKS = 'CARGO_SACKS',   // Spice/date sacks
  
  // Act 3: Underwater Swimming (Pearl Diving)
  CORAL_REEF = 'CORAL_REEF',
  JELLYFISH = 'JELLYFISH',
  SEA_TURTLE = 'SEA_TURTLE',
  STINGRAY = 'STINGRAY',
  OYSTER_BED = 'OYSTER_BED',
  SEAWEED_TALL = 'SEAWEED_TALL',
  ROCK_UNDERWATER = 'ROCK_UNDERWATER',
  HAMOUR_FISH = 'HAMOUR_FISH',   // Grouper
  SAFI_FISH = 'SAFI_FISH',       // Rabbitfish
  SHAARI_FISH = 'SHAARI_FISH',   // Spangled emperor
  ANCHOR_CHAIN = 'ANCHOR_CHAIN',
  DIVING_ROPE = 'DIVING_ROPE',   // Rope from surface
  
  // Legacy Act 3 (keep for compatibility)
  OYSTER_BASKET = 'OYSTER_BASKET',
  DIVING_WEIGHTS = 'DIVING_WEIGHTS',
  WOODEN_CHEST = 'WOODEN_CHEST',
  COILED_DIVING_ROPE = 'COILED_DIVING_ROPE',
  SAIL_CANVAS = 'SAIL_CANVAS',
  DRYING_NETS = 'DRYING_NETS',
  MAST_BOOM = 'MAST_BOOM',
  OVERHEAD_RIGGING = 'OVERHEAD_RIGGING',
  MAIN_MAST = 'MAIN_MAST',
  CREW_GROUP = 'CREW_GROUP',
  CAPTAIN_STATION = 'CAPTAIN_STATION',

  // Act 4: The Caravan Trail (Desert Crossing)
  SAND_DUNE = 'SAND_DUNE',
  GHAF_TREE = 'GHAF_TREE',           // UAE national tree (replaces cactus)
  ROCK_FORMATION = 'ROCK_FORMATION',
  CAMEL_RESTING = 'CAMEL_RESTING',
  CAMEL_CARAVAN = 'CAMEL_CARAVAN',   // Multiple loaded camels
  BEDOUIN_TENT = 'BEDOUIN_TENT',     // Beit Al Sha'ar (black goat-hair tent)
  TRADE_ROUTE_MARKER = 'TRADE_ROUTE_MARKER', // Stone cairn
  DESERT_WELL = 'DESERT_WELL',       // Bir (stone-lined well)
  WATER_SKIN = 'WATER_SKIN',         // Qirba (leather water container)
  SPICE_SACKS = 'SPICE_SACKS',       // Frankincense, saffron
  CARAVAN_CAMPFIRE = 'CARAVAN_CAMPFIRE', // Resting area
  FALCON_PERCH = 'FALCON_PERCH',     // Falconry element
  ARABIAN_ORYX = 'ARABIAN_ORYX',     // Iconic desert animal
  HANGING_TRADE_FABRIC = 'HANGING_TRADE_FABRIC', // Slide under (isTall)
  TENT_ROPE_LINES = 'TENT_ROPE_LINES',           // Slide under (isTall)
  LOW_CAMEL_SADDLE = 'LOW_CAMEL_SADDLE',         // Slide under (isTall)
  WADI_CROSSING = 'WADI_CROSSING',   // Dried stream bed (jump over)
  FALLEN_TRADE_GOODS = 'FALLEN_TRADE_GOODS',     // Jump over
  BEDOUIN_TRADER = 'BEDOUIN_TRADER', // NPC in proper attire
  
  // Legacy Act 4 (keep for compatibility)
  DESERT_SHRUB = 'DESERT_SHRUB',
  LOW_TENT = 'LOW_TENT',
  HANGING_FABRIC = 'HANGING_FABRIC',
  ROPE_LINE = 'ROPE_LINE',
  TALL_CACTUS = 'TALL_CACTUS',       // Deprecated - don't use
  SUPPLY_PILE = 'SUPPLY_PILE',
  RESTING_TRAVELER = 'RESTING_TRAVELER',

  // Act 5: Homecoming Phase 1 (Outskirts)
  FARM_FENCE = 'FARM_FENCE',
  WATER_CHANNEL = 'WATER_CHANNEL',
  HARVEST_BASKET = 'HARVEST_BASKET',
  TREE_BRANCH = 'TREE_BRANCH',
  DRYING_ROPE = 'DRYING_ROPE',
  FARM_WORKER = 'FARM_WORKER',
  STACKED_SUPPLIES = 'STACKED_SUPPLIES',

  // Act 5: Homecoming Phase 2 (Village)
  MARKET_GOODS = 'MARKET_GOODS',
  CHILDREN_PLAYING = 'CHILDREN_PLAYING',
  WATER_JAR_GROUP = 'WATER_JAR_GROUP',
  CELEBRATION_BANNER = 'CELEBRATION_BANNER',
  LANTERN_STRING = 'LANTERN_STRING',
  GREETING_ELDER = 'GREETING_ELDER',
  VILLAGE_STALL = 'VILLAGE_STALL',

  // Act 5: Homecoming Phase 3 (Family)
  CELEBRATION_DRUM = 'CELEBRATION_DRUM',
  FLOWER_GARLAND = 'FLOWER_GARLAND',

  // Generic
  CRATE = 'CRATE',
  DHOW = 'DHOW',
  
  // Special Pearl Challenge
  SITTING_CAMEL = 'SITTING_CAMEL'   // Rideable camel for Pearl Challenge
}

export interface ObstacleData {
  id: string;
  type: ObstacleType;
  lane: Lane;
  z: number;
  passed?: boolean;
  breakable?: boolean;  // Can be destroyed by player jump
  broken?: boolean;     // Has been broken
  isRideableCamel?: boolean;  // Special sitting camel that can be ridden
}

export interface CollectibleData {
  id: string;
  lane: Lane;
  z: number;
  y: number;
  type: 'DATE' | 'PEARL_WHITE' | 'PEARL_PINK' | 'PEARL_GOLDEN' | 'DIVING_GEAR' | 'TRADE_GOOD' | 'COIN_GOLD';
}

export interface NarrativeMoment {
  id: string;
  triggerPercent: number; // 0 to 1
  text: string;
  text_ar?: string;
  speaker?: string;
  speaker_ar?: string;
  emotion?: string;
  played?: boolean;
}

export type TimeOfDay = 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'SUNSET' | 'STORM' | 'EVENING' | 'VILLAGE_NIGHT' | 'DUSK';

export interface AccessibilitySettings {
    invincibility: boolean;
    autoCollect: boolean;
    slowMode: boolean;
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    subtitles: boolean;
    // Audio Settings
    masterVolume: number;  // 0-100
    musicVolume: number;   // 0-100
    sfxVolume: number;     // 0-100
    // NEW: Enhanced Accessibility (Award-Winning)
    colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
    oneHandedMode: boolean;
    cognitiveSpeed: number; // 50-150 (percentage of normal speed)
    hapticFeedback: boolean;
    screenReaderMode: boolean;
    audioDescriptions: boolean;
}

export interface CulturalAnnotation {
    id: string;
    title: string;
    title_ar?: string;
    text: string;
    text_ar?: string;
    triggerTypes: ObstacleType[];
}

export type JournalPageType = 'STORY' | 'CULTURAL' | 'WISDOM' | 'COLLECTION';

export interface JournalPage {
    id: string;
    title: string;
    title_ar?: string;
    type: JournalPageType;
    content: string;
    content_ar?: string;
    unlockCondition: string;
    unlockCondition_ar?: string;
    illustration?: string;
}

export interface GameContextType {
  state: GameState;
  gameMode: GameMode;
  score: number;
  distance: number;
  collectibles: number; 
  lives: number;
  currentAct: Act;
  highScore: number;
  speed: number;
  countdown: number;
  narrative: NarrativeMoment | null;
  timeOfDay: TimeOfDay;
  
  screenFlash: boolean;
  nearMiss: boolean;
  shakeIntensity: number;

  gameCompleted: boolean;
  museumItem: string | null; 
  setMuseumItem: (item: string | null) => void;
  
  unlockedJournalPages: string[];
  newJournalEntry: boolean;
  
  accessibility: AccessibilitySettings;
  setAccessibility: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  culturalMode: boolean;
  setCulturalMode: (v: boolean) => void;
  activeAnnotation: CulturalAnnotation | null;
  setActiveAnnotation: (a: CulturalAnnotation | null) => void;
  currentSubtitle: string | null;

  language: Language;
  setLanguage: (lang: Language) => void;

  startGame: (mode?: GameMode, startingDistance?: number) => void;
  endGame: () => void;
  resetGame: () => void;
  setGameState: (state: GameState) => void;
  togglePause: () => void;
  addScore: (amount: number) => void;
  updateDistance: (dist: number) => void;
  collectItem: () => void;
  handleCollision: () => void;
    showNarrative: (moment: NarrativeMoment) => void;
    triggerShake: (intensity: number) => void;
    triggerNearMiss: () => void;
    isDivingTransition: boolean;
    divePhase: 'running' | 'jumping' | 'splashing' | 'submerging' | 'swimming';
    isHarborTransition: boolean;
    harborTransitionPhase: 'none' | 'approaching' | 'entering' | 'active';
    isDesertTransition: boolean;
    desertPhase: 'swimming' | 'surfacing' | 'splashing' | 'landing' | 'running';
    // Homecoming transition (Act 4 → Act 5)
    isHomecomingTransition: boolean;
    homecomingPhase: 'none' | 'traveling' | 'approaching' | 'arriving' | 'active';
    // Pearl Challenge system (Act 1)
    pearlChallengeActive: boolean;
    setPearlChallengeActive: (active: boolean) => void;
    earlyPearlCount: number;
    setEarlyPearlCount: React.Dispatch<React.SetStateAction<number>>;
    // Rideable Camel system
    isRidingCamel: boolean;
    setIsRidingCamel: (riding: boolean) => void;
    camelRideStartZ: number;
    setCamelRideStartZ: (z: number) => void;
}

export interface EducationalFact {
  id: number;
  title: string;
  title_ar?: string;
  text: string;
  text_ar?: string;
}

export type Complexity = 'TRIVIAL' | 'SIMPLE' | 'MEDIUM' | 'HARD' | 'EXTREME';

export interface PatternObstacleDef {
  lane: Lane | 'random' | 'all';
  type: ObstacleType | 'random';
  zOffset: number;
}

export interface PatternDef {
  id: string;
  complexity: Complexity;
  act?: Act;
  length: number;
  obstacles: PatternObstacleDef[];
  description?: string;
}

export interface MuseumSection {
  id: string;
  title: string;
  title_ar?: string;
  content: string[];
  content_ar?: string[];
  visualType: 'DHOW' | 'PEARL' | 'GEAR' | 'FISH' | 'UNDERWATER' | 'PALM' | 'CAMEL' | 'ARISH' | 'NPC' | 'HARBOR' | 'NONE'; 
  facts?: string[];
  facts_ar?: string[];
}
// ================================================================
// NEW: Award-Winning Feature Types
// ================================================================

// Living Museum - 3D Explorable Diorama
export interface LivingMuseumHotspot {
  id: string;
  position: [number, number, number];
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  artifact?: string;
  audio?: string;
  linkedSection?: string;
}

export interface LivingMuseumScene {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  era: string;
  hotspots: LivingMuseumHotspot[];
  ambientSound?: string;
}

// Adaptive Difficulty System
export interface PlayerSkillProfile {
  reactionTimeAvg: number;     // ms
  failureRate: number;         // 0-1
  jumpAccuracy: number;        // 0-1
  slideAccuracy: number;       // 0-1
  laneChangeSpeed: number;     // ms
  sessionCount: number;
  totalPlayTime: number;       // seconds
  bestDistance: number;
  averageDistance: number;
  lastUpdated: number;         // timestamp
}

export interface AdaptiveDifficultyState {
  currentMultiplier: number;   // 0.5-1.5
  obstacleSpacing: number;     // Relative spacing
  patternComplexity: Complexity;
  speedCap: number;
  recommendedMode: 'easy' | 'normal' | 'challenging';
}

// Community Features
export interface CommunityStats {
  globalPearlCount: number;
  globalDistance: number;
  activePlayersToday: number;
  culturalFactsShared: number;
}

export interface CulturalAmbassador {
  level: 'learner' | 'explorer' | 'ambassador' | 'master';
  factsShared: number;
  factsSaved: number;
  languagesLearned: string[];
  badgesEarned: string[];
}

export interface CommunityEvent {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  type: 'ramadan' | 'eid' | 'national_day' | 'cultural_week' | 'seasonal';
  startDate: string;
  endDate: string;
  rewards: string[];
  active: boolean;
}

// Generational Story Mode
export type GenerationStory = 'PROLOGUE' | 'MAIN' | 'EPILOGUE';

export interface GenerationProgress {
  prologueCompleted: boolean;
  mainStoryCompleted: boolean;
  epilogueUnlocked: boolean;
  epilogueCompleted: boolean;
  totalGenerationsPlayed: number;
}

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  icon: string;
  category: 'story' | 'skill' | 'cultural' | 'community' | 'accessibility';
  requirement: string;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}