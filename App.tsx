import React, { useState, useEffect, createContext, useRef, Component, ErrorInfo, ReactNode } from 'react';
import GameScene from './Game';
import UI from './UI';
import { GameState, GameContextType, TimeOfDay, Act, NarrativeMoment, GameMode, AccessibilitySettings, CulturalAnnotation, Language } from './types';
import { INITIAL_SPEED, ACT_STRUCTURE, DEFAULT_ACCESSIBILITY_SETTINGS, ACT_TRANSITIONS, NARRATIVE_MOMENTS, TOTAL_DISTANCE, STORY_MILESTONES } from './constants';
import { audioSystem, playSound } from './audio';

// ================================================================
// ERROR BOUNDARY - Catches WebGL and React errors gracefully
// ================================================================
interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GameErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center">
          <div className="bg-amber-800/50 backdrop-blur-sm rounded-xl p-8 max-w-md text-center border border-amber-600/30">
            <h2 className="text-2xl font-bold text-amber-100 mb-4">⚠️ Something went wrong</h2>
            <p className="text-amber-200/80 mb-6">
              The game encountered an error. This might be due to WebGL issues or browser compatibility.
            </p>
            <button 
              onClick={this.handleReset}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
            <p className="text-amber-300/50 text-sm mt-4">
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const GameContext = createContext<GameContextType>({} as GameContextType);

const App: React.FC = () => {
  const [state, setGameState] = useState<GameState>(GameState.MENU);
  const [gameMode, setGameMode] = useState<GameMode>('STORY');

  // UI State
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  
  // Logic Refs
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);

  const [collectibles, setCollectibles] = useState(0);
  const [lives, setLives] = useState(7);
  const [currentAct, setCurrentAct] = useState<Act>(Act.TRAINING_GROUNDS);
  
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [countdown, setCountdown] = useState(0);
  const [sessionId, setSessionId] = useState(0); 
  const [narrative, setNarrative] = useState<NarrativeMoment | null>(null);
  
  // Time of Day State
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('MORNING');
  const lastTimePeriodRef = useRef<TimeOfDay>('MORNING');
  
  // Juice State
  const [screenFlash, setScreenFlash] = useState(false);
  const [nearMiss, setNearMiss] = useState(false);
  
  // Feature State
  const [gameCompleted, setGameCompleted] = useState(false);
  const [museumItem, setMuseumItem] = useState<string | null>(null);
  
  // Journal State
  const [unlockedJournalPages, setUnlockedJournalPages] = useState<string[]>([]);
  const [newJournalEntry, setNewJournalEntry] = useState(false);

  // New Systems
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [culturalMode, setCulturalMode] = useState(false);
  const [activeAnnotation, setActiveAnnotation] = useState<CulturalAnnotation | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const subtitleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [language, setLanguage] = useState<Language>('en');
  
  // Dive Transition State
  const [isDivingTransition, setIsDivingTransition] = useState(false);
  const [divePhase, setDivePhase] = useState<'running' | 'jumping' | 'splashing' | 'submerging' | 'swimming'>('running');

  // Desert Transition State (Act 3 → Act 4)
  const [isDesertTransition, setIsDesertTransition] = useState(false);
  const [desertPhase, setDesertPhase] = useState<'swimming' | 'surfacing' | 'splashing' | 'landing' | 'running'>('running');
  const desertTransitionTriggeredRef = useRef(false);

  // Harbor Transition State (Act 1 → Act 2)
  const [isHarborTransition, setIsHarborTransition] = useState(false);
  const [harborTransitionPhase, setHarborTransitionPhase] = useState<'none' | 'approaching' | 'entering' | 'active'>('none');
  const harborTransitionTriggeredRef = useRef(false);

  // Homecoming Transition State (Act 4 → Act 5)
  const [isHomecomingTransition, setIsHomecomingTransition] = useState(false);
  const [homecomingPhase, setHomecomingPhase] = useState<'none' | 'traveling' | 'approaching' | 'arriving' | 'active'>('none');
  const homecomingTransitionTriggeredRef = useRef(false);

  // Pearl Challenge State (Act 1 special mode)
  const [pearlChallengeActive, setPearlChallengeActive] = useState(false);
  const [earlyPearlCount, setEarlyPearlCount] = useState(0);
  const pearlChallengeTriggeredRef = useRef(false);

  // Rideable Camel State
  const [isRidingCamel, setIsRidingCamel] = useState(false);
  const [camelRideStartZ, setCamelRideStartZ] = useState(0);

  // Refs
  const shakeRef = useRef(0);
  const nearMissCooldownRef = useRef(0);
  
  // Narrative State Tracking
  const playedNarrativeIds = useRef<Set<string>>(new Set());
  
  // Narrative Queue System
  const narrativeQueue = useRef<NarrativeMoment[]>([]);
  const isNarrativePlaying = useRef(false);

  // Load Saved Data
  useEffect(() => {
    const saved = localStorage.getItem('pearlRunnerHighScore');
    if (saved) setHighScore(parseFloat(saved));
    
    const completed = localStorage.getItem('pearlRunnerCompleted');
    if (completed === 'true') setGameCompleted(true);

    const savedPages = localStorage.getItem('pearlRunnerJournal');
    if (savedPages) {
        setUnlockedJournalPages(JSON.parse(savedPages));
    } else {
        unlockPage('page_start');
    }
  }, []);

  // Sync Audio Volume Settings
  useEffect(() => {
      audioSystem.setMasterVolume(accessibility.masterVolume);
      audioSystem.setMusicVolume(accessibility.musicVolume);
      audioSystem.setSfxVolume(accessibility.sfxVolume);
  }, [accessibility.masterVolume, accessibility.musicVolume, accessibility.sfxVolume]);

  // --- AUDIO STATE MANAGEMENT ---
  useEffect(() => {
      switch (state) {
          case GameState.PLAYING:
              audioSystem.resume(); // Resume if previously stopped
              audioSystem.startMusic();
              break;
          case GameState.COUNTDOWN:
              audioSystem.resume(); // Resume if previously stopped
              audioSystem.startMusic();
              break;
          case GameState.PAUSED:
              audioSystem.pause();
              break;
          case GameState.GAME_OVER:
          case GameState.VICTORY:
          case GameState.MENU:
          case GameState.MUSEUM:
          case GameState.EDUCATION:
          case GameState.JOURNAL:
              // Stop ALL audio immediately (including TTS and oscillators)
              audioSystem.stopAll();
              narrativeQueue.current = [];
              isNarrativePlaying.current = false;
              setNarrative(null);
              break;
          default:
              audioSystem.stopAll();
              break;
      }
  }, [state]);

  const unlockPage = (pageId: string) => {
      setUnlockedJournalPages(prev => {
          if (!prev.includes(pageId)) {
              const newPages = [...prev, pageId];
              localStorage.setItem('pearlRunnerJournal', JSON.stringify(newPages));
              setNewJournalEntry(true);
              triggerSound('collect');
              return newPages;
          }
          return prev;
      });
  };

  // Check Journal Unlocks Logic
  const checkJournalUnlocks = (dist: number, livesVal: number, collectVal: number) => {
      if (dist > 500) unlockPage('page_500m');
      if (dist > 3000) unlockPage('page_harbor');
      if (dist > 7500) unlockPage('page_storm');
      if (dist > 9000) unlockPage('page_desert');
      if (dist > 12000) unlockPage('page_home');
      
      if (livesVal < 7) unlockPage('page_hurt');
      if (collectVal >= 20) unlockPage('page_dates');
  };

  // --- NARRATIVE QUEUE PROCESSOR ---
  const processNarrativeQueue = () => {
      if (isNarrativePlaying.current || narrativeQueue.current.length === 0) return;

      const nextMoment = narrativeQueue.current.shift();
      if (!nextMoment) return;

      isNarrativePlaying.current = true;

      const handlePlay = () => {
          setNarrative(nextMoment);
      };

      const handleEnd = () => {
          setNarrative(null);
          isNarrativePlaying.current = false;
          setTimeout(() => processNarrativeQueue(), 300);
      };

      const textToSpeak = language === 'ar' ? (nextMoment.text_ar || nextMoment.text) : nextMoment.text;

      if (textToSpeak) {
          audioSystem.playTTS(textToSpeak, handlePlay, handleEnd);
      } else {
          handlePlay();
          setTimeout(handleEnd, 3000);
      }
  };

  const queueNarrative = (moment: NarrativeMoment) => {
      narrativeQueue.current.push(moment);
      processNarrativeQueue();
  };
  
  const showNarrative = (moment: NarrativeMoment) => {
      queueNarrative(moment);
  };

  // Check Narrative Triggers
  const checkNarrativeTriggers = (dist: number) => {
      if (gameMode !== 'STORY') return;
      
      const percent = dist / TOTAL_DISTANCE;

      Object.values(ACT_TRANSITIONS).forEach((transition: any) => {
          const id = `transition_${transition.triggerPercent}`;
          if (!playedNarrativeIds.current.has(id) && percent >= transition.triggerPercent) {
              playedNarrativeIds.current.add(id);
              queueNarrative({
                  id,
                  triggerPercent: transition.triggerPercent,
                  text: transition.text,
                  text_ar: transition.text_ar,
                  speaker: "Father",
                  speaker_ar: "الأب",
                  emotion: transition.emotion
              });
          }
      });

      NARRATIVE_MOMENTS.forEach(moment => {
          if (!playedNarrativeIds.current.has(moment.id) && percent >= moment.triggerPercent) {
              playedNarrativeIds.current.add(moment.id);
              queueNarrative(moment);
          }
      });
  };

  // --- PERFORMANCE FIX: UI SYNC LOOP ---
  useEffect(() => {
      if (state === GameState.PLAYING) {
          const interval = setInterval(() => {
              const currDist = distanceRef.current;
              setScore(prev => {
                  const current = Math.floor(scoreRef.current);
                  return prev !== current ? current : prev;
              });
              setDistance(prev => {
                  const current = Math.floor(currDist);
                  return prev !== current ? current : prev;
              });
              
              checkJournalUnlocks(currDist, lives, collectibles);
              checkNarrativeTriggers(currDist);

          }, 100); 
          return () => clearInterval(interval);
      }
  }, [state, lives, collectibles]);

  // Handle Countdown Timer
  useEffect(() => {
    if (state === GameState.COUNTDOWN) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState(GameState.PLAYING);
      }
    }
  }, [state, countdown]);

  // Handle Cultural Annotation Pause
  useEffect(() => {
      if (activeAnnotation) {
          setGameState(GameState.PAUSED);
      } else if (state === GameState.PAUSED && !activeAnnotation) {
          setGameState(GameState.PLAYING);
      }
  }, [activeAnnotation]);

  // Check Progression Logic
  const checkProgression = (currentDist: number) => {
      let act = Act.TRAINING_GROUNDS;
      let newTime: TimeOfDay = 'MORNING';

      if (gameMode === 'STORY') {
          if (currentDist >= ACT_STRUCTURE[Act.HOMECOMING].start) act = Act.HOMECOMING;
          else if (currentDist >= ACT_STRUCTURE[Act.DESERT].start) act = Act.DESERT;
          else if (currentDist >= ACT_STRUCTURE[Act.DIVING].start) act = Act.DIVING;
          else if (currentDist >= ACT_STRUCTURE[Act.HARBOR].start) act = Act.HARBOR;

          if (act === Act.DESERT) newTime = 'SUNSET';
          else if (currentDist < 3000) newTime = 'MORNING'; 
          else if (currentDist < 6000) newTime = 'MIDDAY'; 
          else if (currentDist < 9000) newTime = 'AFTERNOON';
          else if (act === Act.HOMECOMING && currentDist > STORY_MILESTONES.DUSK_START) newTime = 'DUSK';
          else if (act === Act.HOMECOMING && currentDist > STORY_MILESTONES.VILLAGE_NIGHT_START) newTime = 'VILLAGE_NIGHT';
          else if (act === Act.HOMECOMING) newTime = 'EVENING';

      } else {
          const cycleDist = currentDist % 5000;
          
          if (cycleDist < 1000) { act = Act.TRAINING_GROUNDS; newTime = 'MORNING'; }
          else if (cycleDist < 2000) { act = Act.HARBOR; newTime = 'MIDDAY'; }
          else if (cycleDist < 3000) { act = Act.DIVING; newTime = 'AFTERNOON'; }
          else if (cycleDist < 4000) { act = Act.DESERT; newTime = 'SUNSET'; }
          else { act = Act.HOMECOMING; newTime = 'VILLAGE_NIGHT'; }
      }
      
      // HARBOR TRANSITION: Training Grounds to Harbor (Act 1 → Act 2)
      // Transition zone: 1800m - 2200m
      if (gameMode === 'STORY' && currentAct === Act.TRAINING_GROUNDS) {
          // Approaching phase: 1800m - 2000m (smell the salt, see ships in distance)
          if (currentDist >= 1800 && currentDist < 2000 && !harborTransitionTriggeredRef.current) {
              harborTransitionTriggeredRef.current = true;
              setIsHarborTransition(true);
              setHarborTransitionPhase('approaching');
          }
          
          // Entering phase: 2000m - 2100m (crossing into harbor)
          if (currentDist >= 2000 && currentDist < 2100 && harborTransitionPhase === 'approaching') {
              setHarborTransitionPhase('entering');
              setCurrentAct(Act.HARBOR);
              
              // Graceful camel dismount at harbor entrance
              if (isRidingCamel) {
                  setIsRidingCamel(false);
              }
          }
          
          // Active phase: 2100m+ (fully in harbor)
          if (currentDist >= 2100 && harborTransitionPhase === 'entering') {
              setHarborTransitionPhase('active');
              
              // End transition smoothly
              setTimeout(() => {
                  setIsHarborTransition(false);
                  setHarborTransitionPhase('none');
              }, 1500);
          }
      }
      
      // DIVE TRANSITION: Harbor to Diving
      if (gameMode === 'STORY' && currentAct === Act.HARBOR && act === Act.DIVING && !isDivingTransition) {
          setIsDivingTransition(true);
          setDivePhase('jumping');
          
          setTimeout(() => setDivePhase('splashing'), 800);
          setTimeout(() => {
              setDivePhase('submerging');
              setCurrentAct(Act.DIVING);
          }, 1500);
          setTimeout(() => setDivePhase('swimming'), 2500);
          setTimeout(() => {
              setIsDivingTransition(false);
              setDivePhase('running');
          }, 3500);
          
          return;
      }

      // DESERT TRANSITION: Diving to Desert (Act 3 → Act 4) - Surfacing from water
      if (gameMode === 'STORY' && currentAct === Act.DIVING && act === Act.DESERT && !isDesertTransition && !desertTransitionTriggeredRef.current) {
          desertTransitionTriggeredRef.current = true;
          setIsDesertTransition(true);
          setDesertPhase('swimming');
          
          // Phase 1: Still swimming, approaching surface (0-500ms)
          setTimeout(() => setDesertPhase('surfacing'), 500);
          
          // Phase 2: Breaking through water surface with splash (500-1200ms)
          setTimeout(() => setDesertPhase('splashing'), 1200);
          
          // Phase 3: Landing on shore, transitioning to land (1200-2200ms)
          setTimeout(() => {
              setDesertPhase('landing');
              setCurrentAct(Act.DESERT);
          }, 2200);
          
          // Phase 4: Running on desert sand (2200-3000ms)
          setTimeout(() => {
              setDesertPhase('running');
              setIsDesertTransition(false);
          }, 3000);
          
          return;
      }
      
      // HOMECOMING TRANSITION: Desert to Homecoming (Act 4 → Act 5)
      // Transition zone: 11800m - 12200m (seeing village lights in distance)
      if (gameMode === 'STORY' && currentAct === Act.DESERT) {
          // Traveling phase: 11800m - 12000m (sunset glow, silhouettes of village)
          if (currentDist >= 11800 && currentDist < 12000 && !homecomingTransitionTriggeredRef.current) {
              homecomingTransitionTriggeredRef.current = true;
              setIsHomecomingTransition(true);
              setHomecomingPhase('traveling');
          }
          
          // Approaching phase: 12000m - 12100m (lantern lights becoming clearer)
          if (currentDist >= 12000 && currentDist < 12100 && homecomingPhase === 'traveling') {
              setHomecomingPhase('approaching');
          }
          
          // Arriving phase: 12100m - 12200m (entering village)
          if (currentDist >= 12100 && currentDist < 12200 && homecomingPhase === 'approaching') {
              setHomecomingPhase('arriving');
              setCurrentAct(Act.HOMECOMING);
          }
          
          // Active phase: 12200m+ (fully home)
          if (currentDist >= 12200 && homecomingPhase === 'arriving') {
              setHomecomingPhase('active');
              
              // End transition smoothly
              setTimeout(() => {
                  setIsHomecomingTransition(false);
                  setHomecomingPhase('none');
              }, 2000);
          }
      }
      
      // Normal act change (skip if any transition is handling it)
      if (act !== currentAct && !isDivingTransition && !isHarborTransition && !isDesertTransition && !isHomecomingTransition) setCurrentAct(act);
      
      if (newTime !== lastTimePeriodRef.current) {
          setTimeOfDay(newTime);
          lastTimePeriodRef.current = newTime;
      }
  };

  // Audio & Subtitle Sync
  const triggerSound = (type: Parameters<typeof playSound>[0]) => {
      playSound(type);
      if (accessibility.subtitles) {
          let text = '';
          switch(type) {
              case 'collect': text = '[Collection Chime]'; break;
              case 'jump': text = '[Jump Exertion]'; break;
              case 'woosh': text = '[Swoosh]'; break;
              case 'hurt': text = '[Impact Thud]'; break;
              case 'market': text = '[Market Chatter]'; break;
              case 'harbor': text = '[Creaking Wood]'; break;
              case 'land': text = '[Thump]'; break;
          }
          if (text) {
              if (subtitleTimeoutRef.current) clearTimeout(subtitleTimeoutRef.current);
              setCurrentSubtitle(text);
              subtitleTimeoutRef.current = setTimeout(() => setCurrentSubtitle(null), 1500);
          }
      }
  };

  const startGame = (mode: GameMode = 'STORY', startingDistance: number = 0) => {
    audioSystem.init(); 
    setGameMode(mode);
    scoreRef.current = startingDistance * 2;
    distanceRef.current = startingDistance;
    setScore(startingDistance * 2);
    setDistance(startingDistance);
    setCollectibles(0);
    setLives(7);
    
    let startAct = Act.TRAINING_GROUNDS;
    let startTime: TimeOfDay = 'MORNING';
    
    if (startingDistance >= ACT_STRUCTURE[Act.HOMECOMING].start) {
        startAct = Act.HOMECOMING;
        startTime = 'EVENING';
    } else if (startingDistance >= ACT_STRUCTURE[Act.DESERT].start) {
        startAct = Act.DESERT;
        startTime = 'SUNSET';
    } else if (startingDistance >= ACT_STRUCTURE[Act.DIVING].start) {
        startAct = Act.DIVING;
        startTime = 'AFTERNOON';
    } else if (startingDistance >= ACT_STRUCTURE[Act.HARBOR].start) {
        startAct = Act.HARBOR;
        startTime = 'MIDDAY';
    }
    
    setCurrentAct(startAct);
    setTimeOfDay(startTime);
    lastTimePeriodRef.current = startTime;
    
    setSpeed(INITIAL_SPEED);
    setSessionId(prev => prev + 1); 
    setCountdown(3);
    setNarrative(null);
    setActiveAnnotation(null);
    playedNarrativeIds.current.clear();
    narrativeQueue.current = [];
    isNarrativePlaying.current = false;
    
    // Reset harbor transition state
    harborTransitionTriggeredRef.current = false;
    setIsHarborTransition(false);
    setHarborTransitionPhase('none');
    
    // Reset desert transition state
    desertTransitionTriggeredRef.current = false;
    setIsDesertTransition(false);
    setDesertPhase('running');
    
    // Reset homecoming transition state
    homecomingTransitionTriggeredRef.current = false;
    setIsHomecomingTransition(false);
    setHomecomingPhase('none');
    
    setGameState(GameState.COUNTDOWN);
  };

  const endGame = () => {
    setGameState(GameState.GAME_OVER);
    setNarrative(null);
    narrativeQueue.current = [];
    isNarrativePlaying.current = false;
    
    if (scoreRef.current > highScore) {
        setHighScore(Math.floor(scoreRef.current));
        localStorage.setItem('pearlRunnerHighScore', Math.floor(scoreRef.current).toString());
    }
  };

  const resetGame = () => {
    startGame(gameMode);
  };

  const togglePause = () => {
    if (state === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (state === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
  };

  const addScore = (amount: number) => {
    scoreRef.current += amount;
  };

  const updateDistance = (dist: number) => {
      distanceRef.current = dist;
      checkProgression(dist);
  }

  const triggerShake = (intensity: number) => {
      if (accessibility.reduceMotion) return;
      shakeRef.current = intensity;
  };

  const triggerNearMiss = () => {
      const now = Date.now();
      if (nearMiss || now - nearMissCooldownRef.current < 10000) return;
      nearMissCooldownRef.current = now;
      setNearMiss(true);
      triggerSound('woosh');
      setTimeout(() => setNearMiss(false), 2000);
  };

  const collectItem = () => {
    setCollectibles(prev => prev + 1);
    scoreRef.current += 50; 
    
    if (!accessibility.reduceMotion) {
        setScreenFlash(true);
        setTimeout(() => setScreenFlash(false), 50);
    }
    triggerShake(0.5); 
    triggerSound('collect');
  };

  const handleCollision = () => {
      if (accessibility.invincibility) {
          return; 
      }
      
      const newLives = lives - 1;
      
      if (newLives > 0) {
          setLives(newLives);
          triggerShake(1.5);
          triggerSound('hurt');
          if (!accessibility.reduceMotion) {
            setScreenFlash(true);
            setTimeout(() => setScreenFlash(false), 100);
          }
      } else {
          setLives(0);
          triggerShake(2.0);
          triggerSound('hurt');
          endGame();
      }
  };

  const contextValue: GameContextType = {
    state,
    gameMode,
    score, 
    distance, 
    collectibles,
    lives,
    currentAct,
    highScore,
    speed,
    countdown,
    narrative,
    screenFlash,
    nearMiss,
    shakeIntensity: shakeRef.current,
    timeOfDay,
    gameCompleted,
    museumItem,
    setMuseumItem,
    
    unlockedJournalPages,
    newJournalEntry,
    
    accessibility,
    setAccessibility,
    culturalMode,
    setCulturalMode,
    activeAnnotation,
    setActiveAnnotation,
    currentSubtitle,

    language,
    setLanguage,

    startGame,
    endGame,
    resetGame,
    setGameState,
    togglePause,
    addScore,
    updateDistance,
    collectItem,
    handleCollision,
    showNarrative,
    triggerShake,
    triggerNearMiss,
    isDivingTransition,
    divePhase,
    isHarborTransition,
    harborTransitionPhase,
    isDesertTransition,
    desertPhase,
    isHomecomingTransition,
    homecomingPhase,
    
    // Pearl Challenge System
    pearlChallengeActive,
    setPearlChallengeActive,
    earlyPearlCount,
    setEarlyPearlCount,
    
    // Rideable Camel
    isRidingCamel,
    setIsRidingCamel,
    camelRideStartZ,
    setCamelRideStartZ
  };
  
  return (
    <GameContext.Provider value={contextValue}> 
      <div 
        dir={language === 'ar' ? 'rtl' : 'ltr'} 
        className={`relative w-full h-screen bg-[#87CEEB] overflow-hidden ${accessibility.highContrast ? 'grayscale contrast-125' : ''} ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
      >
        <GameErrorBoundary onReset={() => window.location.reload()}>
          <GameScene sessionId={sessionId} shakeRef={shakeRef} /> 
        </GameErrorBoundary>
        <UI />
        {screenFlash && !accessibility.reduceMotion && <div className="absolute inset-0 bg-white opacity-40 z-50 pointer-events-none transition-opacity duration-75" />}
        {screenFlash && lives < 7 && !accessibility.reduceMotion && <div className="absolute inset-0 bg-red-500 opacity-30 z-50 pointer-events-none transition-opacity duration-75" />}
        
        {/* HARBOR TRANSITION - Loading Screen */}
        {isHarborTransition && harborTransitionPhase === 'entering' && (
          <div className="absolute inset-0 z-50 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-8 text-center">
              <div className="text-5xl font-bold text-amber-100 mb-2" style={{textShadow: '0 2px 20px rgba(251, 191, 36, 0.4)', fontFamily: 'serif'}}>
                {language === 'ar' ? 'الميناء' : 'THE HARBOR'}
              </div>
              <div className="text-xl text-amber-200/90 mb-8" style={{textShadow: '0 1px 10px rgba(251, 191, 36, 0.3)'}}>
                {language === 'ar' ? 'الفصل الثاني' : 'Act II'}
              </div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto mb-8" />
              <p className="text-lg text-blue-100/90 leading-relaxed" style={{textShadow: '0 1px 8px rgba(0,0,0,0.5)', fontFamily: 'serif'}}>
                {language === 'ar' 
                  ? 'تصدر المراكب الخشبية صريراً خفيفاً في ميناء جلفار، أشرعتها ملفوفة أمام نسيم الصباح. تجار من فارس والهند وأراضٍ بعيدة يتبادلون التوابل والأقمشة والمعادن الثمينة.'
                  : 'The wooden dhows creak gently in the harbor of Julfar, their sails furled against the morning breeze. Merchants from Persia, India, and distant lands barter spices, textiles, and precious metals.'}
              </p>
            </div>
          </div>
        )}

        {/* DIVE TRANSITION - Loading Screen */}
        {isDivingTransition && divePhase === 'jumping' && (
          <div className="absolute inset-0 z-50 bg-gradient-to-b from-cyan-900 via-blue-950 to-slate-900 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-8 text-center">
              <div className="text-5xl font-bold text-cyan-100 mb-2" style={{textShadow: '0 2px 20px rgba(34, 211, 238, 0.4)', fontFamily: 'serif'}}>
                {language === 'ar' ? 'الأعماق' : 'THE DEEP'}
              </div>
              <div className="text-xl text-cyan-200/90 mb-8" style={{textShadow: '0 1px 10px rgba(34, 211, 238, 0.3)'}}>
                {language === 'ar' ? 'الفصل الثالث' : 'Act III'}
              </div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent mx-auto mb-8" />
              <p className="text-lg text-blue-100/90 leading-relaxed" style={{textShadow: '0 1px 8px rgba(0,0,0,0.5)', fontFamily: 'serif'}}>
                {language === 'ar' 
                  ? 'ينزل راشد في المياه الفيروزية للخليج العربي، حبل القياس مشدود حول خصره. في الأسفل، تتلألأ أسرّة المحار كحديقة مخفية. كل لؤلؤة تحمل قصة—عن الصبر، عن الشجاعة.'
                  : 'Rashid descends into the turquoise waters of the Arabian Gulf, the fathom line tight around his waist. Below, the oyster beds shimmer like a hidden garden. Each pearl holds a story—of patience, of courage.'}
              </p>
            </div>
          </div>
        )}

        {/* DESERT TRANSITION - Loading Screen */}
        {isDesertTransition && desertPhase === 'surfacing' && (
          <div className="absolute inset-0 z-50 bg-gradient-to-b from-amber-900 via-orange-950 to-slate-900 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-8 text-center">
              <div className="text-5xl font-bold text-amber-100 mb-2" style={{textShadow: '0 2px 20px rgba(217, 119, 6, 0.4)', fontFamily: 'serif'}}>
                {language === 'ar' ? 'القافلة' : 'THE CARAVAN'}
              </div>
              <div className="text-xl text-amber-200/90 mb-8" style={{textShadow: '0 1px 10px rgba(217, 119, 6, 0.3)'}}>
                {language === 'ar' ? 'الفصل الرابع' : 'Act IV'}
              </div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto mb-8" />
              <p className="text-lg text-amber-100/90 leading-relaxed" style={{textShadow: '0 1px 8px rgba(0,0,0,0.5)', fontFamily: 'serif'}}>
                {language === 'ar' 
                  ? 'يجب أن تصل اللآلئ إلى تجار الأراضي الداخلية. ينضم راشد إلى القافلة العابرة للكثبان الذهبية في الربع الخالي. يهتدي البدو بالنجوم.'
                  : 'The pearls must reach the merchants of the inner lands. Rashid joins the caravan crossing the golden dunes of the Rub\' al Khali. Bedouin guides navigate by the stars.'}
              </p>
            </div>
          </div>
        )}

        {/* HOMECOMING TRANSITION - Loading Screen */}
        {isHomecomingTransition && homecomingPhase === 'arriving' && (
          <div className="absolute inset-0 z-50 bg-gradient-to-b from-purple-900 via-amber-950 to-slate-900 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-8 text-center">
              <div className="text-5xl font-bold text-amber-100 mb-2" style={{textShadow: '0 2px 20px rgba(251, 191, 36, 0.4)', fontFamily: 'serif'}}>
                {language === 'ar' ? 'العودة للديار' : 'HOMECOMING'}
              </div>
              <div className="text-xl text-amber-200/90 mb-8" style={{textShadow: '0 1px 10px rgba(251, 191, 36, 0.3)'}}>
                {language === 'ar' ? 'الفصل الخامس' : 'Act V'}
              </div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto mb-8" />
              <p className="text-lg text-amber-100/90 leading-relaxed" style={{textShadow: '0 1px 8px rgba(0,0,0,0.5)', fontFamily: 'serif'}}>
                {language === 'ar' 
                  ? 'يحمل نسيم المساء رائحة العود والسمك المشوي. تتمايل بساتين النخيل أمام سماء كهرمانية. يرى راشد الفوانيس من بيت عائلته.'
                  : 'The evening breeze carries the scent of oud and grilled fish. Palm groves sway against an amber sky. Rashid sees the lanterns glowing from his family\'s home.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </GameContext.Provider>
  );
};

export default App;