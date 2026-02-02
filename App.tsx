import React, { useState, useEffect, createContext, useRef } from 'react';
import GameScene from './components/Game';
import UI from './components/UI';
import { GameState, GameContextType, TimeOfDay, Act, NarrativeMoment, ActiveBlessing, GameMode, AccessibilitySettings, CulturalAnnotation, Language } from './types';
import { INITIAL_SPEED, ACT_STRUCTURE, TIME_PERIODS, FATHERS_BLESSINGS, DEFAULT_ACCESSIBILITY_SETTINGS, JOURNAL_DATA, ACT_TRANSITIONS, NARRATIVE_MOMENTS, TOTAL_DISTANCE } from './constants';
import { audioSystem, playSound } from './audio';

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
  
  // Blessing State
  const [activeBlessing, setActiveBlessing] = useState<ActiveBlessing | null>(null);
  
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
        // Unlock first page by default
        unlockPage('page_start');
    }
  }, []);

  // --- AUDIO STATE MANAGEMENT ---
  // Strictly controls when music plays or stops based on Game State
  useEffect(() => {
      switch (state) {
          case GameState.PLAYING:
          case GameState.COUNTDOWN:
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
              audioSystem.stopMusic();
              // Clear queue on exit
              narrativeQueue.current = [];
              isNarrativePlaying.current = false;
              setNarrative(null);
              break;
          default:
              audioSystem.stopMusic();
              break;
      }
  }, [state]);

  const unlockPage = (pageId: string) => {
      setUnlockedJournalPages(prev => {
          if (!prev.includes(pageId)) {
              const newPages = [...prev, pageId];
              localStorage.setItem('pearlRunnerJournal', JSON.stringify(newPages));
              setNewJournalEntry(true);
              triggerSound('collect'); // Sound cue for unlock
              return newPages;
          }
          return prev;
      });
  };

  // Check Journal Unlocks Logic (Updated for 15km Marathon)
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

      // Handle audio playback logic
      const handlePlay = () => {
          setNarrative(nextMoment);
      };

      const handleEnd = () => {
          setNarrative(null);
          isNarrativePlaying.current = false;
          // Small delay before next line to breathe
          setTimeout(() => processNarrativeQueue(), 300);
      };

      // Play audio if text exists (Use the correct language text)
      const textToSpeak = language === 'ar' ? (nextMoment.text_ar || nextMoment.text) : nextMoment.text;

      if (textToSpeak) {
          audioSystem.playTTS(textToSpeak, handlePlay, handleEnd);
      } else {
          // Fallback if no text (shouldn't happen often for narrative moments)
          handlePlay();
          setTimeout(handleEnd, 3000);
      }
  };

  // Use this function to add to queue
  const queueNarrative = (moment: NarrativeMoment) => {
      narrativeQueue.current.push(moment);
      processNarrativeQueue();
  };
  
  // Needed for context, but internal logic uses queueNarrative
  const showNarrative = (moment: NarrativeMoment) => {
      queueNarrative(moment);
  };

  // Check Narrative Triggers (Percentage based)
  const checkNarrativeTriggers = (dist: number) => {
      if (gameMode !== 'STORY') return;
      
      const percent = dist / TOTAL_DISTANCE;

      // 1. Check Act Transitions
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

      // 2. Check Story Popups
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
              
              // Periodically check journal unlocks
              checkJournalUnlocks(currDist, lives, collectibles);
              
              // Check Narrative
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
          // Check Act Transitions based on updated Structure
          if (currentDist >= ACT_STRUCTURE[Act.HOMECOMING].start) act = Act.HOMECOMING;
          else if (currentDist >= ACT_STRUCTURE[Act.DESERT].start) act = Act.DESERT;
          else if (currentDist >= ACT_STRUCTURE[Act.DIVING].start) act = Act.DIVING;
          else if (currentDist >= ACT_STRUCTURE[Act.HARBOR].start) act = Act.HARBOR;

          // Time of Day Transitions (Rebalanced for 15km)
          if (act === Act.DESERT) newTime = 'SUNSET';
          else if (currentDist < 3000) newTime = 'MORNING'; 
          else if (currentDist < 6000) newTime = 'MIDDAY'; 
          else if (currentDist < 9000) newTime = 'AFTERNOON';
          else if (act === Act.HOMECOMING && currentDist > 14600) newTime = 'DUSK';
          else if (act === Act.HOMECOMING && currentDist > 14000) newTime = 'VILLAGE_NIGHT';
          else if (act === Act.HOMECOMING) newTime = 'EVENING';

      } else {
          // --- ENDLESS MODE LOGIC ---
          const cycleDist = currentDist % 5000;
          
          if (cycleDist < 1000) { act = Act.TRAINING_GROUNDS; newTime = 'MORNING'; }
          else if (cycleDist < 2000) { act = Act.HARBOR; newTime = 'MIDDAY'; }
          else if (cycleDist < 3000) { act = Act.DIVING; newTime = 'AFTERNOON'; }
          else if (cycleDist < 4000) { act = Act.DESERT; newTime = 'SUNSET'; }
          else { act = Act.HOMECOMING; newTime = 'VILLAGE_NIGHT'; }
      }
      
      if (act !== currentAct) setCurrentAct(act);
      
      if (newTime !== lastTimePeriodRef.current) {
          setTimeOfDay(newTime);
          lastTimePeriodRef.current = newTime;
      }
  };
  
  // Handle Blessing Timer
  useEffect(() => {
      if (activeBlessing && state === GameState.PLAYING) {
          const timer = setTimeout(() => {
              setActiveBlessing(null);
          }, activeBlessing.duration);
          return () => clearTimeout(timer);
      }
  }, [activeBlessing, state]);

  // Audio & Subtitle Sync
  const triggerSound = (type: Parameters<typeof playSound>[0]) => {
      playSound(type);
      if (accessibility.subtitles) {
          let text = '';
          // Simple English subtitles for sound effects are acceptable in mixed UI, or can be localized later.
          // For now we keep them English to match current system.
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

  const startGame = (mode: GameMode = 'STORY') => {
    audioSystem.init(); 
    setGameMode(mode);
    scoreRef.current = 0;
    distanceRef.current = 0;
    setScore(0);
    setDistance(0);
    setCollectibles(0);
    setLives(7);
    setCurrentAct(Act.TRAINING_GROUNDS);
    setSpeed(INITIAL_SPEED);
    setSessionId(prev => prev + 1); 
    setCountdown(3);
    setNarrative(null);
    setActiveBlessing(null);
    setActiveAnnotation(null);
    setTimeOfDay('MORNING');
    lastTimePeriodRef.current = 'MORNING';
    playedNarrativeIds.current.clear(); // Reset narrative
    narrativeQueue.current = [];
    isNarrativePlaying.current = false;
    setGameState(GameState.COUNTDOWN);
  };

  const endGame = () => {
    // Music is stopped via useEffect on state change
    setGameState(GameState.GAME_OVER);
    setNarrative(null);
    narrativeQueue.current = [];
    isNarrativePlaying.current = false;
    
    // Trigger Game Over Speech?
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
      // Audio pause handled by useEffect
    } else if (state === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
      // Audio resume handled by useEffect
    }
  };

  // High-performance updates (No re-renders)
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
      if (activeBlessing?.effectType === 'INVINCIBILITY' || activeBlessing?.effectType === 'GHOST_COMPANION' || accessibility.invincibility) {
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
          
          const blessingConfig = FATHERS_BLESSINGS[newLives];
          if (blessingConfig) {
              setActiveBlessing({
                  id: Math.random().toString(),
                  name: language === 'ar' && blessingConfig.name_ar ? blessingConfig.name_ar : blessingConfig.name,
                  effectType: blessingConfig.effectType,
                  duration: blessingConfig.duration,
                  startTime: Date.now()
              });
              
              if (gameMode === 'STORY' || gameMode === 'ENDLESS') {
                const moment = {
                    id: `blessing_${newLives}`,
                    triggerPercent: 0,
                    speaker: "Father",
                    speaker_ar: "الأب",
                    text: blessingConfig.fatherSays,
                    text_ar: blessingConfig.fatherSays_ar,
                    emotion: 'calm'
                };
                queueNarrative(moment);
              }
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
    activeBlessing,
    gameCompleted,
    museumItem,
    setMuseumItem,
    
    // Journal
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
    triggerNearMiss
  };
  
  return (
    <GameContext.Provider value={contextValue}> 
      <div 
        dir={language === 'ar' ? 'rtl' : 'ltr'} 
        className={`relative w-full h-screen bg-[#87CEEB] overflow-hidden ${accessibility.highContrast ? 'grayscale contrast-125' : ''} ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
      >
        <GameScene sessionId={sessionId} shakeRef={shakeRef} /> 
        <UI />
        {screenFlash && !accessibility.reduceMotion && <div className="absolute inset-0 bg-white opacity-40 z-50 pointer-events-none transition-opacity duration-75" />}
        {screenFlash && lives < 7 && !accessibility.reduceMotion && <div className="absolute inset-0 bg-red-500 opacity-30 z-50 pointer-events-none transition-opacity duration-75" />}
        {activeBlessing && <div className="absolute inset-0 bg-yellow-500 opacity-10 z-40 pointer-events-none animate-pulse" />}
      </div>
    </GameContext.Provider>
  );
};

export default App;