
import React from 'react';

export enum GameState {
  MENU = 'MENU',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  EDUCATION = 'EDUCATION',
  VICTORY = 'VICTORY',
  MUSEUM = 'MUSEUM',
  PHOTO = 'PHOTO',
  SETTINGS = 'SETTINGS',
  JOURNAL = 'JOURNAL',
  CREDITS = 'CREDITS'
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
  FALAJ_CROSSING = 'FALAJ_CROSSING', // New obstacle for Act 1
  
  // Act 2: Harbor
  CARGO_CRATE = 'CARGO_CRATE',
  ROPE_COIL = 'ROPE_COIL',
  HANGING_NET = 'HANGING_NET',
  WOODEN_BEAM = 'WOODEN_BEAM',
  DOCK_POST = 'DOCK_POST',
  WAREHOUSE_ENTRY = 'WAREHOUSE_ENTRY',
  
  // Act 3: The Big Dive
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

  // Act 4: The Desert Crossing
  SAND_DUNE = 'SAND_DUNE',
  DESERT_SHRUB = 'DESERT_SHRUB',
  ROCK_FORMATION = 'ROCK_FORMATION',
  CAMEL_RESTING = 'CAMEL_RESTING',
  LOW_TENT = 'LOW_TENT',
  HANGING_FABRIC = 'HANGING_FABRIC',
  ROPE_LINE = 'ROPE_LINE',
  TALL_CACTUS = 'TALL_CACTUS',
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
  DHOW = 'DHOW'
}

export interface ObstacleData {
  id: string;
  type: ObstacleType;
  lane: Lane;
  z: number;
  passed?: boolean;
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

export interface ActiveBlessing {
  id: string;
  name: string;
  effectType: 'SLOW_MO' | 'SPEED_BOOST' | 'MAGNET' | 'INVINCIBILITY' | 'SCREEN_CLEAR' | 'NAVIGATOR_SIGHT' | 'GHOST_COMPANION';
  duration: number; // ms
  startTime: number;
}

export interface AccessibilitySettings {
    invincibility: boolean;
    autoCollect: boolean;
    slowMode: boolean;
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    subtitles: boolean;
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
  
  activeBlessing: ActiveBlessing | null;

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

  startGame: (mode?: GameMode) => void;
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
}

export interface EducationalFact {
  id: number;
  title: string;
  title_ar?: string;
  text: string;
  text_ar?: string;
}

export type Complexity = 'SIMPLE' | 'MEDIUM' | 'HARD' | 'EXTREME' | 'TRIVIAL';

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
  visualType: 'DHOW' | 'PEARL' | 'GEAR' | 'NONE'; 
  facts?: string[];
  facts_ar?: string[];
}
