import React, { useContext, useEffect, useState } from 'react';
import { GameContext } from './App';
import { GameState, EducationalFact, MuseumSection, AccessibilitySettings, LivingMuseumScene, Achievement, CommunityEvent } from './types';
import { EDUCATIONAL_FACTS, MUSEUM_SECTIONS, JOURNAL_DATA, UI_TRANSLATIONS, CREDITS_DATA, LIVING_MUSEUM_SCENES, ACHIEVEMENTS, COMMUNITY_EVENTS, UI_TRANSLATIONS_EXTENDED } from './constants';

const UI: React.FC = () => {
  const { 
      state, score, distance, collectibles, lives, highScore, countdown, 
      narrative, nearMiss, startGame, resetGame, setGameState,
      togglePause, museumItem, setMuseumItem, gameCompleted, gameMode,
      accessibility, setAccessibility, culturalMode, setCulturalMode, activeAnnotation, setActiveAnnotation, currentSubtitle,
      unlockedJournalPages, newJournalEntry, language, setLanguage
  } = useContext(GameContext);
  
  const [fact, setFact] = useState<EducationalFact | null>(null);
  const [photoFilter, setPhotoFilter] = useState('');
  const [photoFrame, setPhotoFrame] = useState('');
  const [activeSection, setActiveSection] = useState<MuseumSection>(MUSEUM_SECTIONS[0]);

  // Settings Tab State
  const [settingsTab, setSettingsTab] = useState<'GAMEPLAY' | 'VISUAL' | 'AUDIO'>('GAMEPLAY');
  
  // Developer Cheat Code State
  const [cheatCode, setCheatCode] = useState('');
  const [cheatMessage, setCheatMessage] = useState('');
  
  // Journal State
  const [journalPageIndex, setJournalPageIndex] = useState(0);

  // NEW: Award-Winning Feature States
  const [livingMuseumScene, setLivingMuseumScene] = useState<LivingMuseumScene>(LIVING_MUSEUM_SCENES[0]);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'story' | 'skill' | 'cultural' | 'community' | 'accessibility'>('all');
  const [communityTab, setCommunityTab] = useState<'stats' | 'events' | 'achievements'>('stats');
  const [generationMode, setGenerationMode] = useState<'prologue' | 'main' | 'epilogue'>('main');
  
  // Museum Mode: 'encyclopedia' (text-based) or 'explore' (3D scenes)
  const [museumMode, setMuseumMode] = useState<'encyclopedia' | 'explore'>('encyclopedia');
  
  // Journal Mode: 'story' (narrative) or 'generations' (prologue/epilogue)
  const [journalMode, setJournalMode] = useState<'story' | 'generations'>('story');

  // Helper for UI Text - SAFE version (supports extended translations)
  const t = (key: string) => {
      const entry = UI_TRANSLATIONS[key as keyof typeof UI_TRANSLATIONS];
      if (entry) return entry[language];
      const extEntry = UI_TRANSLATIONS_EXTENDED[key as keyof typeof UI_TRANSLATIONS_EXTENDED];
      if (extEntry) return extEntry[language];
      return key;
  };

  useEffect(() => {
    if (state === GameState.GAME_OVER || state === GameState.EDUCATION) {
      const randomFact = EDUCATIONAL_FACTS[Math.floor(Math.random() * EDUCATIONAL_FACTS.length)];
      setFact(randomFact);
    }
    if (state === GameState.MUSEUM) {
        setMuseumItem(activeSection.visualType !== 'NONE' ? activeSection.visualType : null);
    }
  }, [state, activeSection]);

  const toggleMuseum = () => {
      setGameState(GameState.MUSEUM);
      setActiveSection(MUSEUM_SECTIONS[0]);
  }

  const activatePhoto = () => {
      setGameState(GameState.PHOTO);
  }

  const toggleSetting = (key: keyof AccessibilitySettings) => {
      setAccessibility(prev => ({...prev, [key]: !prev[key]}));
  };

  const openJournal = () => {
      setGameState(GameState.JOURNAL);
  };

  const toggleLanguage = () => {
      setLanguage(language === 'en' ? 'ar' : 'en');
  }

  const textScale = accessibility.largeText ? 'scale-125 origin-top-left' : '';
  const largeTextClass = accessibility.largeText ? 'text-lg' : 'text-sm';

  // --- OVERLAY: JOURNAL ---
  if (state === GameState.JOURNAL) {
      const currentPage = JOURNAL_DATA[journalPageIndex];
      const isUnlocked = unlockedJournalPages.includes(currentPage.id);
      
      const title = language === 'ar' && currentPage.title_ar ? currentPage.title_ar : currentPage.title;
      const content = language === 'ar' && currentPage.content_ar ? currentPage.content_ar : currentPage.content;
      const unlockCondition = language === 'ar' && currentPage.unlockCondition_ar ? currentPage.unlockCondition_ar : currentPage.unlockCondition;

      return (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
              <div className="relative w-full max-w-4xl aspect-[4/3] bg-[#fdfbf7] rounded-lg shadow-2xl overflow-hidden flex flex-col border-8 border-[#8B4513]">
                  {/* Spine */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-[#5e3b25] transform -translate-x-1/2 z-10 shadow-inner"></div>
                  
                  {/* Header with Tabs */}
                  <div className="bg-[#8B4513] p-4 flex justify-between items-center text-[#E6C288] border-b border-[#5e3b25] z-20">
                      <div className="flex items-center gap-4">
                          <h2 className="text-2xl font-title">{t('JOURNAL')}</h2>
                          {/* Journal Mode Tabs */}
                          <div className="flex gap-1 bg-black/20 rounded p-1">
                              <button 
                                  onClick={() => setJournalMode('story')}
                                  className={`px-3 py-1 rounded text-xs transition-colors ${journalMode === 'story' ? 'bg-[#FFD700] text-black' : 'text-[#E6C288] hover:bg-white/10'}`}
                              >
                                  📖 {t('STORY')}
                              </button>
                              <button 
                                  onClick={() => setJournalMode('generations')}
                                  className={`px-3 py-1 rounded text-xs transition-colors ${journalMode === 'generations' ? 'bg-[#FFD700] text-black' : 'text-[#E6C288] hover:bg-white/10'}`}
                              >
                                  👨‍👦 {t('THREE_GENERATIONS')}
                              </button>
                          </div>
                      </div>
                      <div className="flex gap-4">
                          {journalMode === 'story' && <span className="font-serif italic text-sm">{unlockedJournalPages.length} / {JOURNAL_DATA.length} {t('COMPLETED')}</span>}
                          <button onClick={() => setGameState(GameState.MENU)} className="hover:text-white font-bold">✕</button>
                      </div>
                  </div>

                  {/* Content - Story Mode */}
                  {journalMode === 'story' && (
                      <div className="flex-1 flex relative">
                          {/* Left Page (Illustration & Meta) */}
                          <div className="flex-1 p-8 border-r border-[#e0dcd5] flex flex-col items-center justify-center text-center">
                              {isUnlocked ? (
                                  <>
                                    <div className="text-8xl mb-6 opacity-80">{currentPage.illustration}</div>
                                    <div className="inline-block px-4 py-1 bg-[#8B4513]/10 rounded-full text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-2">
                                        {currentPage.type}
                                    </div>
                                    <h3 className="text-3xl font-serif text-[#2F1B10] mb-2">{title}</h3>
                                  </>
                              ) : (
                                  <div className="opacity-30 flex flex-col items-center">
                                      <div className="text-6xl mb-4">🔒</div>
                                      <p className="font-serif italic text-xl">{t('LOCKED')}</p>
                                  </div>
                              )}
                          </div>

                          {/* Right Page (Text Content) */}
                          <div className="flex-1 p-8 flex flex-col justify-center">
                              {isUnlocked ? (
                                  <div className="font-serif text-[#2F1B10] text-lg leading-loose italic">
                                      "{content}"
                                  </div>
                              ) : (
                                  <div className="text-center opacity-50">
                                      <p className="font-bold text-[#8B4513] mb-2">UNLOCK CONDITION</p>
                                      <p className="font-serif italic">{unlockCondition}</p>
                                  </div>
                              )}
                              
                              {/* Navigation Controls */}
                              <div className={`absolute bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} flex gap-4`}>
                                  <button 
                                    disabled={journalPageIndex === 0}
                                    onClick={() => setJournalPageIndex(prev => prev - 1)}
                                    className="px-4 py-2 bg-[#8B4513] text-[#E6C288] rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#A0522D]"
                                  >
                                    {language === 'ar' ? '→' : '←'}
                                  </button>
                                  <button 
                                    disabled={journalPageIndex === JOURNAL_DATA.length - 1}
                                    onClick={() => setJournalPageIndex(prev => prev + 1)}
                                    className="px-4 py-2 bg-[#8B4513] text-[#E6C288] rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#A0522D]"
                                  >
                                    {language === 'ar' ? '←' : '→'}
                                  </button>
                              </div>
                              
                              {/* Page Number */}
                              <div className={`absolute bottom-6 ${language === 'ar' ? 'right-6' : 'left-6'} text-[#8B4513]/50 font-serif`}>
                                  {journalPageIndex + 1}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Content - Generations Mode (Prologue/Epilogue) */}
                  {journalMode === 'generations' && (
                      <div className="flex-1 flex relative bg-gradient-to-b from-[#fdfbf7] to-[#f0e8dc]">
                          {/* Left Page - Prologue (Abdullah's Story) */}
                          <div className="flex-1 p-8 border-r border-[#e0dcd5] flex flex-col items-center justify-center text-center">
                              <div className="text-6xl mb-4">👨</div>
                              <h3 className="text-2xl font-serif text-[#2F1B10] mb-2">{t('PROLOGUE')}</h3>
                              <p className="text-[#8B4513]/80 text-sm mb-4 italic max-w-xs">
                                  {language === 'ar' 
                                      ? "عش رحلة عبدالله كغواص شاب، قبل أن يصبح معلم راشد."
                                      : "Experience Abdullah's journey as a young diver, before he became Rashid's mentor."}
                              </p>
                              {gameCompleted ? (
                                  <button 
                                      onClick={() => startGame('STORY', 0)}
                                      className="px-6 py-3 bg-[#8B4513] hover:bg-[#A0522D] text-[#F5F5DC] rounded border border-[#5e3b25] transition-colors font-bold"
                                  >
                                      {t('PLAY_PROLOGUE')}
                                  </button>
                              ) : (
                                  <div className="text-[#8B4513]/50 text-sm">
                                      <span className="text-2xl block mb-2">🔒</span>
                                      {t('COMPLETE_STORY_FIRST')}
                                  </div>
                              )}
                          </div>

                          {/* Right Page - Epilogue (Rashid as Father) */}
                          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                              <div className="text-6xl mb-4">👨‍👦</div>
                              <h3 className="text-2xl font-serif text-[#2F1B10] mb-2">{t('EPILOGUE')}</h3>
                              <p className="text-[#8B4513]/80 text-sm mb-4 italic max-w-xs">
                                  {language === 'ar' 
                                      ? "بعد سنوات، يُعلّم راشد طفله طرق البحر."
                                      : "Years later, Rashid teaches his own child the ways of the sea."}
                              </p>
                              {gameCompleted ? (
                                  <button 
                                      onClick={() => startGame('STORY', 0)}
                                      className="px-6 py-3 bg-[#8B4513] hover:bg-[#A0522D] text-[#F5F5DC] rounded border border-[#5e3b25] transition-colors font-bold"
                                  >
                                      {t('PLAY_EPILOGUE')}
                                  </button>
                              ) : (
                                  <div className="text-[#8B4513]/50 text-sm">
                                      <span className="text-2xl block mb-2">🔒</span>
                                      {t('COMPLETE_STORY_FIRST')}
                                  </div>
                              )}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- OVERLAY: CULTURAL ANNOTATION ---
  if (activeAnnotation) {
      const title = language === 'ar' && activeAnnotation.title_ar ? activeAnnotation.title_ar : activeAnnotation.title;
      const text = language === 'ar' && activeAnnotation.text_ar ? activeAnnotation.text_ar : activeAnnotation.text;
      
      return (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#1a1410] border-2 border-[#FFD700] p-8 max-w-md w-full relative rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <h2 className="text-3xl text-[#FFD700] font-title">{title}</h2>
                      <button 
                        onClick={() => setActiveAnnotation(null)}
                        className="text-white/50 hover:text-white"
                      >
                          ✕
                      </button>
                  </div>
                  <div className="w-full h-1 bg-[#8B4513] mb-6"></div>
                  <p className="text-[#F5F5DC] font-serif text-lg leading-relaxed mb-8">
                      {text}
                  </p>
                  <button 
                      onClick={() => setActiveAnnotation(null)}
                      className="w-full py-3 bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold rounded border border-[#FFD700]/30"
                  >
                      {t('RESUME')}
                  </button>
              </div>
          </div>
      );
  }

  // --- OVERLAY: CREDITS ---
  if (state === GameState.CREDITS) {
      return (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1410] border-2 border-[#E6C288] w-full max-w-2xl h-[80vh] flex flex-col rounded-lg shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#1a1410] to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#1a1410] to-transparent z-10 pointer-events-none"></div>
                  
                  <div className="p-6 border-b border-[#E6C288]/30 flex justify-between items-center z-20 bg-[#1a1410]">
                      <h2 className="text-3xl text-[#E6C288] font-title">{t('CREDITS')}</h2>
                      <button onClick={() => setGameState(GameState.MENU)} className="text-[#E6C288] hover:text-white text-xl">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 text-center space-y-12">
                      <div className="text-sm text-gray-400 italic mb-8 border border-white/10 p-4 rounded bg-white/5">
                          {t('DISCLAIMER')}
                      </div>

                      {CREDITS_DATA.map((section, index) => (
                          <div key={index} className="space-y-4">
                              <h3 className="text-[#E6C288] font-bold text-lg tracking-widest uppercase border-b border-[#E6C288]/20 pb-2 inline-block px-8">
                                  {t(section.role)}
                              </h3>
                              <div className="space-y-4">
                                  {section.content.map((item, i) => (
                                      <div key={i}>
                                          {item.url ? (
                                              <a href={item.url} target="_blank" rel="noreferrer" className="text-[#E6C288] underline hover:text-white block font-serif text-xl mb-1">{item.text}</a>
                                          ) : (
                                              <p className="text-[#F5F5DC] font-serif text-xl">{t(item.text)}</p>
                                          )}
                                          {item.subtext && <p className="text-[#F5F5DC] font-serif text-lg opacity-80">{item.subtext}</p>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                      
                      <div className="pt-8 text-[#E6C288]/40 text-xs">
                          Made with ❤️ for UAE Heritage
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- OVERLAY: SETTINGS MENU ---
  if (state === GameState.SETTINGS) {
      return (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className={`bg-[#1a1410] border border-[#E6C288] w-full max-w-2xl h-[80vh] flex flex-col rounded-lg shadow-2xl ${accessibility.largeText ? 'text-lg' : 'text-sm'}`}>
                  <div className="p-6 border-b border-[#E6C288]/30 flex justify-between items-center">
                      <h2 className="text-3xl text-[#E6C288] font-title">{t('SETTINGS')}</h2>
                      <button onClick={() => setGameState(GameState.MENU)} className="text-[#E6C288] hover:text-white text-xl">✕</button>
                  </div>
                  
                  <div className="flex border-b border-[#E6C288]/30">
                      {['GAMEPLAY', 'VISUAL', 'AUDIO'].map(tab => (
                          <button 
                            key={tab}
                            onClick={() => setSettingsTab(tab as any)}
                            className={`flex-1 py-4 font-bold tracking-widest transition-colors ${settingsTab === tab ? 'bg-[#E6C288] text-black' : 'text-[#E6C288] hover:bg-white/5'}`}
                          >
                              {t(tab as any)}
                          </button>
                      ))}
                  </div>

                  <div className="p-8 overflow-y-auto flex-1 space-y-6">
                      {settingsTab === 'GAMEPLAY' && (
                          <>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                    <span className="text-[#F5F5DC]">Invincibility Mode</span>
                                    <input type="checkbox" checked={accessibility.invincibility} onChange={() => toggleSetting('invincibility')} className="w-6 h-6 accent-[#E6C288]" />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                    <span className="text-[#F5F5DC]">Auto-Collect</span>
                                    <input type="checkbox" checked={accessibility.autoCollect} onChange={() => toggleSetting('autoCollect')} className="w-6 h-6 accent-[#E6C288]" />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                    <span className="text-[#F5F5DC]">Slow Mode</span>
                                    <input type="checkbox" checked={accessibility.slowMode} onChange={() => toggleSetting('slowMode')} className="w-6 h-6 accent-[#E6C288]" />
                                </label>
                            </div>
                            
                            {/* NEW: Award-Winning Enhanced Accessibility */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded border border-green-500/30">
                                <h4 className="text-green-300 font-bold text-sm mb-3 flex items-center gap-2">
                                    <span>♿</span> Enhanced Accessibility
                                </h4>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                        <div>
                                            <span className="text-[#F5F5DC]">{t('ONE_HANDED')}</span>
                                            <p className="text-xs text-gray-400">Tilt controls + auto-advance</p>
                                        </div>
                                        <input type="checkbox" checked={accessibility.oneHandedMode} onChange={() => toggleSetting('oneHandedMode')} className="w-6 h-6 accent-green-400" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                        <div>
                                            <span className="text-[#F5F5DC]">{t('HAPTIC')}</span>
                                            <p className="text-xs text-gray-400">Vibration feedback for events</p>
                                        </div>
                                        <input type="checkbox" checked={accessibility.hapticFeedback} onChange={() => toggleSetting('hapticFeedback')} className="w-6 h-6 accent-green-400" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                        <div>
                                            <span className="text-[#F5F5DC]">{t('AUDIO_DESC')}</span>
                                            <p className="text-xs text-gray-400">Spoken descriptions of visuals</p>
                                        </div>
                                        <input type="checkbox" checked={accessibility.audioDescriptions} onChange={() => toggleSetting('audioDescriptions')} className="w-6 h-6 accent-green-400" />
                                    </label>
                                    
                                    {/* Cognitive Speed Slider */}
                                    <div className="p-3 bg-white/5 rounded">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[#F5F5DC]">{t('COGNITIVE_SPEED')}</span>
                                            <span className="text-green-400 font-mono">{accessibility.cognitiveSpeed}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="50" 
                                            max="150" 
                                            step="10"
                                            value={accessibility.cognitiveSpeed} 
                                            onChange={(e) => setAccessibility(prev => ({...prev, cognitiveSpeed: parseInt(e.target.value)}))}
                                            className="w-full h-3 bg-[#2F1B10] rounded-lg appearance-none cursor-pointer accent-green-400"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Slower</span>
                                            <span>Normal</span>
                                            <span>Faster</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mt-6">
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer border border-[#FFD700]/30">
                                    <span className="text-[#FFD700]">Cultural Learning Mode</span>
                                    <input type="checkbox" checked={culturalMode} onChange={() => setCulturalMode(!culturalMode)} className="w-6 h-6 accent-[#FFD700]" />
                                </label>
                            </div>
                             <div className="space-y-4 mt-6">
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer border border-[#FFD700]/30">
                                    <span className="text-[#FFD700]">{t('LANGUAGE')}</span>
                                    <button onClick={toggleLanguage} className="bg-[#E6C288] text-black px-4 py-1 rounded">
                                        {language === 'en' ? 'English' : 'العربية'}
                                    </button>
                                </label>
                            </div>
                            
                            {/* Developer Cheat Code Section */}
                            <div className="mt-8 p-4 bg-red-900/20 rounded border border-red-500/50">
                                <h3 className="text-red-400 font-bold text-sm mb-3 uppercase tracking-widest">🔧 Developer Mode</h3>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={cheatCode}
                                        onChange={(e) => setCheatCode(e.target.value.toLowerCase())}
                                        placeholder="Enter cheat code..."
                                        className="flex-1 px-3 py-2 bg-black/50 border border-red-500/30 rounded text-white placeholder-gray-500 text-sm font-mono"
                                    />
                                    <button 
                                        onClick={() => {
                                            // Parse cheat codes
                                            const code = cheatCode.trim().toLowerCase();
                                            let startDist = -1; // Use -1 as invalid
                                            let message = '';
                                            
                                            switch(code) {
                                                case 'act1':
                                                    startDist = 0;
                                                    message = '✓ Starting at Act 1 (Training Grounds) - 0m';
                                                    break;
                                                case 'act2':
                                                    startDist = 2000;
                                                    message = '✓ Starting at Act 2 (Harbor) - 2000m';
                                                    break;
                                                case 'act3':
                                                    startDist = 5000;
                                                    message = '✓ Starting at Act 3 (Underwater Diving) - 5000m';
                                                    break;
                                                case 'act4':
                                                    startDist = 8200;
                                                    message = '✓ Starting at Act 4 (Desert) - 8200m';
                                                    break;
                                                case 'act5':
                                                    startDist = 11500;
                                                    message = '✓ Starting at Act 5 (Homecoming) - 11500m';
                                                    break;
                                                case 'victory':
                                                    startDist = 14900;
                                                    message = '✓ Starting near Victory - 14900m';
                                                    break;
                                                case 'storm':
                                                    startDist = 6000;
                                                    message = '✓ Starting at Storm - 6000m';
                                                    break;
                                                default:
                                                    startDist = -1;
                                                    message = '✗ Unknown code. Try: act1, act2, act3, act4, act5, storm, victory';
                                            }
                                            
                                            setCheatMessage(message);
                                            
                                            // Valid code entered (startDist >= 0 means valid)
                                            if (startDist >= 0) {
                                                // Start the game with the cheat distance
                                                console.log(`[CHEAT] Starting game at distance: ${startDist}m`);
                                                setTimeout(() => {
                                                    startGame('STORY', startDist);
                                                    setCheatCode('');
                                                    setCheatMessage('');
                                                }, 300);
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded text-sm"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {cheatMessage && (
                                    <p className={`mt-2 text-xs font-mono ${cheatMessage.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                                        {cheatMessage}
                                    </p>
                                )}
                                <p className="text-gray-500 text-xs mt-2">
                                    Codes: act1, act2, act3, act4, act5, storm, victory
                                </p>
                            </div>
                          </>
                      )}

                      {settingsTab === 'VISUAL' && (
                          <div className="space-y-4">
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                    <span className="text-[#F5F5DC]">High Contrast</span>
                                    <input type="checkbox" checked={accessibility.highContrast} onChange={() => toggleSetting('highContrast')} className="w-6 h-6 accent-[#E6C288]" />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                    <span className="text-[#F5F5DC]">Large Text</span>
                                    <input type="checkbox" checked={accessibility.largeText} onChange={() => toggleSetting('largeText')} className="w-6 h-6 accent-[#E6C288]" />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                    <span className="text-[#F5F5DC]">Reduce Motion</span>
                                    <input type="checkbox" checked={accessibility.reduceMotion} onChange={() => toggleSetting('reduceMotion')} className="w-6 h-6 accent-[#E6C288]" />
                                </label>
                                
                                {/* NEW: Award-Winning Accessibility - Colorblind Mode */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded border border-purple-500/30">
                                    <h4 className="text-purple-300 font-bold text-sm mb-3 flex items-center gap-2">
                                        <span>👁️</span> {t('COLORBLIND_MODE')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['none', 'deuteranopia', 'protanopia', 'tritanopia'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setAccessibility(prev => ({...prev, colorblindMode: mode}))}
                                                className={`p-2 rounded text-sm transition-all ${
                                                    accessibility.colorblindMode === mode 
                                                        ? 'bg-purple-600 text-white border-2 border-purple-300' 
                                                        : 'bg-white/5 text-[#E6C288] hover:bg-white/10 border border-transparent'
                                                }`}
                                            >
                                                {t(mode.toUpperCase())}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                          </div>
                      )}

                      {settingsTab === 'AUDIO' && (
                          <div className="space-y-6">
                                {/* Master Volume */}
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#F5F5DC] font-bold">🔊 Master Volume</span>
                                        <span className="text-[#E6C288] font-mono">{accessibility.masterVolume}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={accessibility.masterVolume} 
                                        onChange={(e) => setAccessibility(prev => ({...prev, masterVolume: parseInt(e.target.value)}))}
                                        className="w-full h-3 bg-[#2F1B10] rounded-lg appearance-none cursor-pointer accent-[#E6C288]"
                                    />
                                </div>
                                
                                {/* Music Volume */}
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#F5F5DC] font-bold">🎵 Music Volume</span>
                                        <span className="text-[#E6C288] font-mono">{accessibility.musicVolume}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={accessibility.musicVolume} 
                                        onChange={(e) => setAccessibility(prev => ({...prev, musicVolume: parseInt(e.target.value)}))}
                                        className="w-full h-3 bg-[#2F1B10] rounded-lg appearance-none cursor-pointer accent-[#E6C288]"
                                    />
                                </div>
                                
                                {/* SFX Volume */}
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#F5F5DC] font-bold">💥 Sound Effects</span>
                                        <span className="text-[#E6C288] font-mono">{accessibility.sfxVolume}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={accessibility.sfxVolume} 
                                        onChange={(e) => setAccessibility(prev => ({...prev, sfxVolume: parseInt(e.target.value)}))}
                                        className="w-full h-3 bg-[#2F1B10] rounded-lg appearance-none cursor-pointer accent-[#E6C288]"
                                    />
                                </div>

                                {/* Subtitles */}
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                                    <span className="text-[#F5F5DC]">📝 {t('SUBTITLES')}</span>
                                    <input type="checkbox" checked={accessibility.subtitles} onChange={() => toggleSetting('subtitles')} className="w-6 h-6 accent-[#E6C288]" />
                                </label>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-6 border-t border-[#E6C288]/30">
                      <button onClick={() => setGameState(GameState.MENU)} className="w-full py-3 bg-[#E6C288] hover:bg-[#f0dcb0] text-black font-bold rounded">
                          {t('SAVE_CLOSE')}
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  // --- COUNTDOWN STATE ---
  if (state === GameState.COUNTDOWN) {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-20">
        <div className="text-9xl font-title text-[#F5F5DC] font-bold drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] animate-pulse">
          {countdown}
        </div>
        {gameMode === 'ENDLESS' && (
             <div className="absolute bottom-1/4 text-2xl font-title text-red-500 animate-pulse">{t('START_ENDLESS')}</div>
        )}
      </div>
    );
  }

  // --- PLAYING STATE ---
  if (state === GameState.PLAYING) {
    return (
      <div className={`absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between z-10 ${textScale}`}>
        {/* Top HUD */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col gap-2 pointer-events-auto">
                {/* Distance */}
                <div className={`bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-amber-500/30 text-white shadow-lg transition-transform transform hover:scale-105 ${accessibility.highContrast ? 'bg-black border-white' : ''}`}>
                    <p className={`font-arabic tracking-wider opacity-80 ${largeTextClass}`}>{t('DISTANCE')}</p>
                    <p className="text-2xl font-bold font-title">{Math.floor(distance)}m</p>
                    {gameMode === 'ENDLESS' && <p className="text-xs text-red-400 font-bold">ENDLESS</p>}
                </div>
                {/* Score */}
                <div className={`bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-amber-500/30 text-white shadow-lg transition-transform transform hover:scale-105 ${accessibility.highContrast ? 'bg-black border-white' : ''}`}>
                    <p className={`font-arabic tracking-wider opacity-80 ${largeTextClass}`}>{t('SCORE')}</p>
                    <p className="text-xl font-bold font-title">{Math.floor(score)}</p>
                </div>
                {/* Collectibles (Dates) */}
                <div className={`bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-amber-500/30 text-white shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105 ${accessibility.highContrast ? 'bg-black border-white' : ''}`}>
                     <div className="w-4 h-4 rounded-full bg-amber-700 border border-amber-500 shadow-[0_0_5px_rgba(255,191,0,0.8)]"></div>
                    <p className="text-xl font-bold">{collectibles}</p>
                </div>
                {/* Cultural Mode Indicator */}
                {culturalMode && (
                    <div className="bg-[#FFD700]/20 backdrop-blur-sm p-2 rounded-lg border border-[#FFD700] text-[#FFD700] flex items-center gap-2">
                        <span>👁️</span>
                        <p className="text-xs font-bold uppercase">{t('LEARNING_MODE')}</p>
                    </div>
                )}
            </div>
            
            {/* Right Side: Pause & Lives */}
            <div className="flex flex-col items-end gap-2">
                {/* Pause Button */}
                <button 
                    onClick={togglePause}
                    className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-sm w-12 h-12 rounded-lg border border-amber-500/30 flex items-center justify-center text-white transition-all shadow-lg active:scale-95"
                    aria-label="Pause Game"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                </button>

                {/* Lives / Chances */}
                <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-red-500/30 text-white shadow-lg flex flex-col items-end">
                     <p className={`font-arabic tracking-wider opacity-80 mb-1 ${largeTextClass}`}>{t('CHANCES')}</p>
                     <div className="flex gap-1">
                         {Array.from({length: 7}).map((_, i) => (
                             <div key={i} className={`w-3 h-3 rounded-full border border-red-400 ${i < lives ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]' : 'bg-transparent opacity-30'}`} />
                         ))}
                     </div>
                </div>
            </div>
        </div>

        {/* Near Miss Overlay */}
        {nearMiss && (
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
                <h2 className="text-4xl md:text-5xl font-arabic text-amber-300 font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce text-center whitespace-nowrap">
                    {t('BE_CAREFUL')}
                </h2>
            </div>
        )}

        {/* Sound Subtitles - MOVED TO CORNER & SCALED DOWN */}
        {currentSubtitle && (
            <div className={`absolute bottom-2 ${language === 'ar' ? 'left-2' : 'right-2'} px-2 py-1 rounded text-white/60 text-[10px] font-mono tracking-widest backdrop-blur-none pointer-events-none`}>
                {currentSubtitle}
            </div>
        )}

        {/* Narrative Layer */}
        <div className={`transition-all duration-1000 ease-in-out flex justify-center w-full mb-12 ${narrative ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {narrative && (
                <div className="bg-gradient-to-t from-black/90 to-transparent px-8 py-6 text-center max-w-3xl w-full">
                     {narrative.speaker && (
                         <p className="text-amber-500 font-title text-sm tracking-widest uppercase mb-1">{language === 'ar' ? (narrative.speaker_ar || narrative.speaker) : narrative.speaker}</p>
                     )}
                    <p className={`text-[#F5F5DC] font-serif leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,1)] ${accessibility.largeText ? 'text-3xl' : 'text-xl md:text-3xl'}`}>
                        "{language === 'ar' ? (narrative.text_ar || narrative.text) : narrative.text}"
                    </p>
                </div>
            )}
        </div>
      </div>
    );
  }

  if (state === GameState.PAUSED) {
      return (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/60 z-30 backdrop-blur-sm">
            <div className="bg-[#1a1410] border-2 border-[#E6C288] p-8 max-w-md w-full text-center relative shadow-2xl rounded-sm">
                <h2 className="text-4xl text-[#E6C288] mb-8 font-title tracking-widest">{t('PAUSE')}</h2>
                
                <div className="space-y-4">
                    <button 
                        onClick={togglePause}
                        className="w-full py-4 bg-[#8B4513] hover:bg-[#A0522D] text-[#F5F5DC] font-bold text-xl transition-all border border-[#E6C288] shadow-lg"
                    >
                        {t('RESUME')}
                    </button>
                    <button 
                        onClick={openJournal}
                        className="w-full py-3 bg-[#5e3b25] hover:bg-[#7a4e32] text-[#E6C288] border border-[#E6C288]/50 transition-all font-bold text-lg flex items-center justify-center gap-2"
                    >
                        <span>📖</span> {t('JOURNAL')}
                    </button>
                    <button 
                        onClick={() => setGameState(GameState.SETTINGS)}
                        className="w-full py-3 bg-[#2F1B10] hover:bg-[#4a2c1a] text-[#E6C288] border border-[#E6C288]/50 transition-all font-bold text-lg"
                    >
                        {t('SETTINGS')}
                    </button>
                    <button 
                        onClick={activatePhoto}
                        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg transition-all border border-gray-500 flex items-center justify-center gap-2"
                    >
                        <span>📷</span> {t('PHOTO_MODE')}
                    </button>
                    <button 
                        onClick={() => setGameState(GameState.MENU)}
                        className="w-full py-4 bg-transparent hover:bg-white/5 text-[#E6C288]/80 hover:text-[#E6C288] border border-[#E6C288]/30 transition-all font-bold text-lg"
                    >
                        {t('MAIN_MENU')}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- PHOTO MODE ---
  if (state === GameState.PHOTO) {
      return (
          <div className={`absolute inset-0 pointer-events-none z-50 ${photoFilter} ${photoFrame}`}>
              <div className="absolute inset-0 pointer-events-none" style={{
                  boxShadow: photoFrame === 'cinema' ? 'inset 0 100px 0 black, inset 0 -100px 0 black' : 
                             photoFrame === 'vignette' ? 'inset 0 0 150px black' : 'none',
                  border: photoFrame === 'border' ? '20px solid #fff' : 'none'
              }}></div>
              
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col gap-4 pointer-events-auto bg-black/80 p-6 rounded-xl backdrop-blur-md w-full max-w-2xl">
                  <div className="flex justify-between items-center text-white mb-2">
                      <h3 className="font-title text-xl text-amber-500">{t('PHOTO_MODE')}</h3>
                      <button onClick={() => setGameState(GameState.PAUSED)} className="text-sm underline opacity-70 hover:opacity-100">Exit</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                      {['', 'sepia', 'grayscale', 'contrast-125', 'brightness-125'].map(f => (
                          <button key={f} onClick={() => setPhotoFilter(f)} className={`px-3 py-1 text-xs border rounded ${photoFilter === f ? 'bg-amber-500 text-black border-amber-500' : 'text-white border-white/30'}`}>
                            {f || 'Normal'}
                          </button>
                      ))}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                      {['', 'cinema', 'vignette', 'border'].map(f => (
                          <button key={f} onClick={() => setPhotoFrame(f)} className={`px-3 py-1 text-xs border rounded ${photoFrame === f ? 'bg-amber-500 text-black border-amber-500' : 'text-white border-white/30'}`}>
                            {f || 'No Frame'}
                          </button>
                      ))}
                  </div>
                  <p className="text-xs text-center text-white/50">Drag to rotate camera • Pinch to zoom</p>
              </div>
          </div>
      )
  }

  // --- MUSEUM MODE (Combined Encyclopedia + 3D Explore) ---
  if (state === GameState.MUSEUM) {
      const sectionTitle = language === 'ar' && activeSection.title_ar ? activeSection.title_ar : activeSection.title;
      const content = language === 'ar' && activeSection.content_ar ? activeSection.content_ar : activeSection.content;
      const facts = language === 'ar' && activeSection.facts_ar ? activeSection.facts_ar : activeSection.facts;
      
      // Living Museum (3D Explore) state
      const sceneName = language === 'ar' && livingMuseumScene.name_ar ? livingMuseumScene.name_ar : livingMuseumScene.name;
      const sceneDesc = language === 'ar' && livingMuseumScene.description_ar ? livingMuseumScene.description_ar : livingMuseumScene.description;
      const currentHotspot = livingMuseumScene.hotspots.find(h => h.id === activeHotspot);
      const hotspotTitle = currentHotspot ? (language === 'ar' && currentHotspot.title_ar ? currentHotspot.title_ar : currentHotspot.title) : '';
      const hotspotDesc = currentHotspot ? (language === 'ar' && currentHotspot.description_ar ? currentHotspot.description_ar : currentHotspot.description) : '';

      return (
          <div className="absolute inset-0 z-50 flex flex-col bg-[#1a1410]">
              {/* Header with Mode Tabs */}
              <div className="p-4 flex justify-between items-center border-b border-[#8B4513] bg-[#1a1410] z-20">
                  <div className="flex items-center gap-4">
                      <h2 className="text-2xl text-[#FFD700] font-title">🏛️ {t('MUSEUM')}</h2>
                      {/* Mode Toggle */}
                      <div className="flex bg-black/30 rounded-lg p-1">
                          <button 
                              onClick={() => setMuseumMode('encyclopedia')}
                              className={`px-4 py-2 rounded text-sm transition-colors ${museumMode === 'encyclopedia' ? 'bg-[#8B4513] text-[#FFD700]' : 'text-[#E6C288] hover:bg-white/10'}`}
                          >
                              📚 {t('ENCYCLOPEDIA')}
                          </button>
                          <button 
                              onClick={() => setMuseumMode('explore')}
                              className={`px-4 py-2 rounded text-sm transition-colors ${museumMode === 'explore' ? 'bg-[#8B4513] text-[#FFD700]' : 'text-[#E6C288] hover:bg-white/10'}`}
                          >
                              🎮 {t('EXPLORE_3D')}
                          </button>
                      </div>
                  </div>
                  <button onClick={() => setGameState(GameState.MENU)} className="text-[#E6C288] hover:text-white text-xl px-3">✕</button>
              </div>

              {/* Encyclopedia Mode */}
              {museumMode === 'encyclopedia' && (
                  <div className="flex-1 flex">
                      <div className="w-1/3 h-full bg-[#1a1410] border-r border-[#8B4513] p-6 flex flex-col overflow-y-auto">
                          <div className="flex flex-col gap-2">
                              {MUSEUM_SECTIONS.map(section => (
                                  <button key={section.id} onClick={() => setActiveSection(section)} className={`text-left p-4 rounded transition-all font-serif ${activeSection.id === section.id ? 'bg-[#8B4513] text-white pl-6 border-l-4 border-[#FFD700]' : 'text-[#D4A574] hover:bg-[#2F1B10]'}`}>
                                      {language === 'ar' && section.title_ar ? section.title_ar : section.title}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="w-2/3 h-full relative pointer-events-none">
                          <div className={`absolute bottom-8 ${language === 'ar' ? 'left-8 border-r-4' : 'right-8 border-l-4'} w-96 bg-black/80 backdrop-blur-md p-6 rounded-lg border-[#FFD700] pointer-events-auto`}>
                               <h3 className="text-2xl text-white font-title mb-4">{sectionTitle}</h3>
                               <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                   {content.map((p, i) => <p key={i} className="text-gray-300 text-sm leading-relaxed border-b border-gray-700/50 pb-2">{p}</p>)}
                               </div>
                               {facts && (
                                   <div className="bg-[#8B4513]/30 p-3 rounded">
                                       <p className="text-[#FFD700] text-xs font-bold mb-1 uppercase">{t('DID_YOU_KNOW')}</p>
                                       <ul className="list-disc list-inside text-xs text-gray-300">
                                           {facts.map((f, i) => <li key={i}>{f}</li>)}
                                       </ul>
                                   </div>
                               )}
                               {activeSection.visualType !== 'NONE' && (
                                   <div className="mt-4 text-center text-white/40 text-xs">
                                       Drag to Rotate 3D Model
                                   </div>
                               )}
                          </div>
                      </div>
                  </div>
              )}

              {/* 3D Explore Mode */}
              {museumMode === 'explore' && (
                  <div className="flex-1 relative bg-gradient-to-b from-[#1a1410] to-[#0d0a08]">
                      {/* Scene Selector */}
                      <div className="absolute top-4 left-4 z-20">
                          <select 
                              value={livingMuseumScene.id}
                              onChange={(e) => {
                                  const scene = LIVING_MUSEUM_SCENES.find(s => s.id === e.target.value);
                                  if (scene) { setLivingMuseumScene(scene); setActiveHotspot(null); }
                              }}
                              className="bg-[#2F1B10] text-[#E6C288] border border-[#E6C288]/50 px-4 py-2 rounded"
                          >
                              {LIVING_MUSEUM_SCENES.map(scene => (
                                  <option key={scene.id} value={scene.id}>
                                      {language === 'ar' && scene.name_ar ? scene.name_ar : scene.name}
                                  </option>
                              ))}
                          </select>
                      </div>

                      {/* Scene Description Banner */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-lg border border-[#E6C288]/30 z-10 max-w-xl text-center">
                          <h3 className="text-[#FFD700] font-title text-lg">{sceneName}</h3>
                          <p className="text-[#E6C288]/80 text-sm">{livingMuseumScene.era}</p>
                      </div>

                      {/* Hotspot Buttons */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-full h-full max-w-4xl max-h-[500px]">
                              {livingMuseumScene.hotspots.map((hotspot, index) => {
                                  const angle = (index / livingMuseumScene.hotspots.length) * Math.PI * 2;
                                  const radius = 35;
                                  const x = 50 + Math.cos(angle) * radius;
                                  const y = 50 + Math.sin(angle) * radius * 0.6;
                                  return (
                                      <button
                                          key={hotspot.id}
                                          onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                                          style={{ left: `${x}%`, top: `${y}%` }}
                                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                                              activeHotspot === hotspot.id 
                                                  ? 'bg-[#FFD700] border-white scale-125 shadow-lg shadow-[#FFD700]/50' 
                                                  : 'bg-[#8B4513]/80 border-[#E6C288] hover:bg-[#A0522D] hover:scale-110'
                                          }`}
                                          aria-label={hotspot.title}
                                      >
                                          <span className="text-xl">{hotspot.artifact === 'DHOW' ? '⛵' : hotspot.artifact === 'PEARL' ? '🦪' : hotspot.artifact === 'GEAR' ? '🤿' : hotspot.artifact === 'CAMEL' ? '🐪' : '📍'}</span>
                                      </button>
                                  );
                              })}
                              {/* Center Info */}
                              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                  <p className="text-[#E6C288]/50 text-sm">{t('HOTSPOT_TAP')}</p>
                              </div>
                          </div>
                      </div>

                      {/* Hotspot Detail Panel */}
                      {currentHotspot && (
                          <div className={`absolute bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-96 bg-black/90 backdrop-blur-md p-6 rounded-lg border border-[#FFD700]/50 z-20`}>
                              <div className="flex justify-between items-start mb-3">
                                  <h4 className="text-xl text-[#FFD700] font-title">{hotspotTitle}</h4>
                                  <button onClick={() => setActiveHotspot(null)} className="text-[#E6C288] hover:text-white">✕</button>
                              </div>
                              <p className="text-[#E6C288] text-sm leading-relaxed mb-4">{hotspotDesc}</p>
                              {currentHotspot.linkedSection && (
                                  <button 
                                      onClick={() => { setMuseumMode('encyclopedia'); }}
                                      className="w-full py-2 bg-[#8B4513] hover:bg-[#A0522D] text-[#F5F5DC] text-sm rounded border border-[#E6C288]/50 transition-colors"
                                  >
                                      📚 {t('LEARN_MORE')} →
                                  </button>
                              )}
                          </div>
                      )}

                      {/* Scene Description */}
                      <div className="absolute bottom-4 left-4 max-w-md bg-black/70 backdrop-blur-sm p-4 rounded-lg border border-[#E6C288]/20">
                          <p className="text-[#E6C288]/80 text-sm italic">{sceneDesc}</p>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  if (state === GameState.MENU) {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/60 z-20 backdrop-blur-sm p-4">
        <div className="bg-[#1a1410] border-2 border-[#E6C288] p-6 max-w-md w-full text-center relative shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#E6C288] opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#E6C288] opacity-50"></div>
          
          <button 
            onClick={toggleLanguage} 
            className="absolute top-4 right-4 bg-[#E6C288]/20 hover:bg-[#E6C288] text-[#E6C288] hover:text-black px-3 py-1 rounded border border-[#E6C288] text-sm transition-colors"
          >
              {language === 'en' ? 'العربية' : 'English'}
          </button>

          <h1 className="text-4xl text-[#E6C288] mb-1 font-title">RUN RASHID</h1>
          <h2 className="text-lg text-[#A0826D] mb-6 font-serif italic">A Father's Wisdom</h2>
          
          <div className="space-y-4 mb-8">
            <div className="bg-black/30 p-4 border-l-2 border-amber-600 text-left">
                <p className="text-[#F5F5DC] text-sm leading-relaxed italic">
                    {language === 'ar' 
                      ? "\"راشد يا بني. قبل أن تواجه البحر، عليك أن تتقن البر. اركض عبر قريتنا. أمنحك سبع فرص—فاستخدمها بحكمة.\"" 
                      : "\"Rashid, my son. Before you face the sea, you must master the land. Run through our village. I give you seven chances—use them wisely.\""}
                </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button onClick={() => startGame('STORY')} className="w-full py-4 bg-[#8B4513] hover:bg-[#A0522D] text-[#F5F5DC] font-bold text-xl transition-all border border-[#E6C288] shadow-[0_4px_0_#5e2f0d] active:shadow-none active:translate-y-1 relative">
                {t('START_STORY')}
                {gameCompleted && <span className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-0.5 rounded-full border border-white">{t('COMPLETED')}</span>}
            </button>
            <button onClick={() => startGame('ENDLESS')} disabled={!gameCompleted} className={`w-full py-4 font-bold text-xl transition-all border shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 relative overflow-hidden ${gameCompleted ? 'bg-red-900 hover:bg-red-800 text-[#F5F5DC] border-red-500' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed grayscale'}`}>
                {t('START_ENDLESS')}
                {!gameCompleted && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><span className="text-xs uppercase tracking-widest text-gray-400">{t('LOCKED')}</span></div>}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={openJournal}
                    className="w-full py-3 bg-[#5e3b25] hover:bg-[#7a4e32] text-[#E6C288] border border-[#E6C288]/50 transition-all font-bold text-sm flex items-center justify-center gap-1 relative"
                >
                    <span>📖</span> {t('JOURNAL')}
                    {newJournalEntry && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </button>
                <button onClick={() => setGameState(GameState.SETTINGS)} className="w-full py-3 bg-[#2F1B10] hover:bg-[#4a2c1a] text-[#E6C288] border border-[#E6C288]/50 transition-all font-bold text-sm">
                    {t('SETTINGS')}
                </button>
            </div>
            
            {/* Cultural Museum & Community */}
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={toggleMuseum} 
                    className="w-full py-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] hover:from-[#A0522D] hover:to-[#8B4513] text-[#FFD700] border border-[#FFD700]/50 transition-all font-title text-sm flex items-center justify-center gap-1"
                >
                    <span>🏛️</span> {t('MUSEUM')}
                </button>
                <button 
                    onClick={() => setGameState(GameState.COMMUNITY)} 
                    className="w-full py-3 bg-gradient-to-r from-[#2F1B10] to-[#4a2c1a] hover:from-[#4a2c1a] hover:to-[#2F1B10] text-[#E6C288] border border-[#E6C288]/50 transition-all font-bold text-sm flex items-center justify-center gap-1"
                >
                    <span>🌍</span> {t('COMMUNITY')}
                </button>
            </div>
            
            <button onClick={() => setGameState(GameState.CREDITS)} className="w-full py-2 text-[#E6C288]/60 hover:text-[#E6C288] text-xs font-serif tracking-widest mt-4">
                {t('CREDITS')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === GameState.GAME_OVER) {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/70 z-20 backdrop-blur-sm">
        <div className="bg-[#1a1410] border-2 border-red-900/50 p-8 max-w-md w-full text-center rounded-sm shadow-2xl">
          <h2 className="text-4xl text-white mb-6 font-title">
              {gameMode === 'ENDLESS' ? t('RUN_COMPLETE') : t('LESSON_LEARNED')}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded">
                <p className="text-xs text-white/50 mb-1">{t('DISTANCE')}</p>
                <p className="text-2xl text-[#E6C288] font-bold">{Math.floor(distance)}m</p>
            </div>
            <div className="bg-white/5 p-4 rounded">
                <p className="text-xs text-white/50 mb-1">{t('SCORE')}</p>
                <p className="text-2xl text-white font-bold">{Math.floor(score)}</p>
            </div>
          </div>
          <p className="text-gray-400 mb-6 italic">
              {language === 'ar' 
                ? "\"استرح الآن يا بني. سنحاول غداً من جديد.\"" 
                : "\"Rest now, son. We will try again tomorrow.\""}
          </p>

          {fact && (
            <div className="bg-[#8B4513]/20 p-4 rounded border border-[#8B4513]/50 mb-6 text-left">
                <p className="text-[#E6C288] text-xs font-bold uppercase mb-1">{t('DID_YOU_KNOW')}</p>
                <h4 className="text-[#F5F5DC] font-bold mb-1">{language === 'ar' ? (fact.title_ar || fact.title) : fact.title}</h4>
                <p className="text-gray-400 text-sm font-serif">{language === 'ar' ? (fact.text_ar || fact.text) : fact.text}</p>
            </div>
          )}
          
          <div className="space-y-3">
             <button onClick={resetGame} className="w-full py-4 bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold text-xl transition-all shadow-lg border border-[#E6C288]">
                 {t('TRY_AGAIN')}
             </button>
             <button onClick={() => setGameState(GameState.MENU)} className="w-full py-3 bg-transparent hover:bg-white/5 text-[#E6C288] border border-[#E6C288]/30 font-bold transition-all">
                 {t('MAIN_MENU')}
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === GameState.VICTORY) {
      return (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/70 z-20 backdrop-blur-sm">
            <div className="bg-[#1a1410] border-2 border-[#FFD700] p-8 max-w-md w-full text-center rounded-sm shadow-2xl overflow-hidden relative">
                 <h2 className="text-4xl text-[#FFD700] mb-2 font-title animate-bounce">{t('RUN_COMPLETE')}</h2>
                 <p className="text-[#F5F5DC] font-serif italic mb-8">
                     {language === 'ar' 
                        ? "\"أحسنت يا راشد! لقد وصلت إلى الديار وأثبت جدارتك.\"" 
                        : "\"Well done, Rashid! You have reached home and proven your worth.\""}
                 </p>

                 <div className="bg-[#FFD700]/10 p-6 rounded border border-[#FFD700]/30 mb-8">
                     <p className="text-sm text-[#FFD700] uppercase tracking-widest mb-2">{t('SCORE')}</p>
                     <p className="text-5xl text-white font-bold font-title drop-shadow-[0_2px_0_rgba(0,0,0,1)]">{Math.floor(score)}</p>
                 </div>

                 <div className="space-y-3">
                    <button onClick={() => setGameState(GameState.MENU)} className="w-full py-4 bg-[#FFD700] hover:bg-[#FFC125] text-black font-bold text-xl transition-all shadow-lg">
                        {t('MAIN_MENU')}
                    </button>
                 </div>
            </div>
          </div>
      );
  }

  if (state === GameState.EDUCATION) {
      return (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1410] border-2 border-[#E6C288] w-full max-w-2xl h-[80vh] flex flex-col rounded-lg shadow-2xl relative">
                   <div className="p-6 border-b border-[#E6C288]/30 flex justify-between items-center bg-[#1a1410] z-10">
                      <h2 className="text-3xl text-[#E6C288] font-title">{t('HISTORY')}</h2>
                      <button onClick={() => setGameState(GameState.MENU)} className="text-[#E6C288] hover:text-white text-xl">✕</button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto space-y-4">
                      {EDUCATIONAL_FACTS.map(f => (
                          <div key={f.id} className="bg-white/5 p-4 rounded border border-[#E6C288]/20 hover:border-[#E6C288]/50 transition-colors">
                              <h3 className="text-[#FFD700] font-bold text-lg mb-2">{language === 'ar' ? (f.title_ar || f.title) : f.title}</h3>
                              <p className="text-gray-300 font-serif leading-relaxed">{language === 'ar' ? (f.text_ar || f.text) : f.text}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // ================================================================
  // AWARD-WINNING FEATURE: COMMUNITY HUB
  // ================================================================
  if (state === GameState.COMMUNITY) {
      const mockCommunityStats = { globalPearlCount: 12847293, globalDistance: 89234567, activePlayersToday: 3421, culturalFactsShared: 45892 };
      const filteredAchievements = ACHIEVEMENTS.filter(a => achievementFilter === 'all' || a.category === achievementFilter);
      const activeEvents = COMMUNITY_EVENTS.filter(e => e.active);

      return (
          <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1a1410] to-[#0d0a08]">
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b border-[#E6C288]/30 bg-[#1a1410]/90">
                  <h2 className="text-2xl text-[#FFD700] font-title flex items-center gap-2">
                      <span>🌍</span> {t('COMMUNITY')}
                  </h2>
                  <button onClick={() => setGameState(GameState.MENU)} className="text-[#E6C288] hover:text-white text-xl">✕</button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-[#E6C288]/20">
                  {(['stats', 'events', 'achievements'] as const).map(tab => (
                      <button
                          key={tab}
                          onClick={() => setCommunityTab(tab)}
                          className={`flex-1 py-3 text-center transition-colors ${communityTab === tab ? 'bg-[#8B4513] text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-[#E6C288]/70 hover:bg-[#2F1B10]'}`}
                      >
                          {tab === 'stats' && '📊'} {tab === 'events' && '🎉'} {tab === 'achievements' && '🏆'}
                          <span className="ml-2">{t(tab.toUpperCase())}</span>
                      </button>
                  ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                  {communityTab === 'stats' && (
                      <div className="space-y-6">
                          <h3 className="text-[#FFD700] font-title text-xl mb-4">{t('GLOBAL_STATS')}</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#2F1B10] p-6 rounded-lg border border-[#E6C288]/30 text-center">
                                  <p className="text-4xl text-[#FFD700] font-bold">{mockCommunityStats.globalPearlCount.toLocaleString()}</p>
                                  <p className="text-[#E6C288]/70 text-sm mt-2">🦪 {t('PEARLS_COLLECTED')}</p>
                              </div>
                              <div className="bg-[#2F1B10] p-6 rounded-lg border border-[#E6C288]/30 text-center">
                                  <p className="text-4xl text-[#FFD700] font-bold">{(mockCommunityStats.globalDistance / 1000000).toFixed(1)}M</p>
                                  <p className="text-[#E6C288]/70 text-sm mt-2">🏃 {t('DISTANCE_RUN')}</p>
                              </div>
                              <div className="bg-[#2F1B10] p-6 rounded-lg border border-[#E6C288]/30 text-center">
                                  <p className="text-4xl text-[#FFD700] font-bold">{mockCommunityStats.activePlayersToday.toLocaleString()}</p>
                                  <p className="text-[#E6C288]/70 text-sm mt-2">👥 {t('ACTIVE_PLAYERS')}</p>
                              </div>
                              <div className="bg-[#2F1B10] p-6 rounded-lg border border-[#E6C288]/30 text-center">
                                  <p className="text-4xl text-[#FFD700] font-bold">{mockCommunityStats.culturalFactsShared.toLocaleString()}</p>
                                  <p className="text-[#E6C288]/70 text-sm mt-2">📚 Facts Shared</p>
                              </div>
                          </div>
                          {/* Ambassador Status */}
                          <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] p-6 rounded-lg border border-[#FFD700]/50">
                              <h4 className="text-[#FFD700] font-title text-lg mb-2">Your Ambassador Status</h4>
                              <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center text-3xl">🌟</div>
                                  <div>
                                      <p className="text-white font-bold text-xl">Cultural Learner</p>
                                      <p className="text-[#E6C288]/80 text-sm">Share 10 facts to become an Explorer!</p>
                                      <div className="mt-2 w-48 h-2 bg-black/30 rounded-full overflow-hidden">
                                          <div className="w-3/10 h-full bg-[#FFD700]"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {communityTab === 'events' && (
                      <div className="space-y-6">
                          <h3 className="text-[#FFD700] font-title text-xl mb-4">{t('EVENT_ACTIVE')}</h3>
                          {activeEvents.length > 0 ? activeEvents.map(event => {
                              const eventName = language === 'ar' && event.name_ar ? event.name_ar : event.name;
                              const eventDesc = language === 'ar' && event.description_ar ? event.description_ar : event.description;
                              const daysRemaining = Math.ceil((new Date(event.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                              return (
                                  <div key={event.id} className="bg-gradient-to-r from-[#8B4513] to-[#5e3b25] p-6 rounded-lg border border-[#FFD700]/50 relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                      <div className="relative z-10">
                                          <div className="flex justify-between items-start">
                                              <h4 className="text-[#FFD700] font-title text-2xl">{eventName}</h4>
                                              <span className="bg-[#FFD700] text-black px-3 py-1 rounded-full text-sm font-bold">
                                                  {daysRemaining} {t('DAYS_REMAINING')}
                                              </span>
                                          </div>
                                          <p className="text-[#E6C288] mt-2">{eventDesc}</p>
                                          <div className="mt-4 flex gap-2">
                                              {event.rewards.map((reward, i) => (
                                                  <span key={i} className="bg-black/30 px-3 py-1 rounded text-[#E6C288] text-sm">🎁 {reward}</span>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              );
                          }) : (
                              <div className="text-center py-12 text-[#E6C288]/50">
                                  <p className="text-4xl mb-4">🎭</p>
                                  <p>No active events. Check back soon!</p>
                              </div>
                          )}
                      </div>
                  )}

                  {communityTab === 'achievements' && (
                      <div className="space-y-6">
                          <div className="flex gap-2 flex-wrap">
                              {(['all', 'story', 'skill', 'cultural', 'community', 'accessibility'] as const).map(filter => (
                                  <button
                                      key={filter}
                                      onClick={() => setAchievementFilter(filter)}
                                      className={`px-4 py-2 rounded-full text-sm transition-colors ${achievementFilter === filter ? 'bg-[#FFD700] text-black' : 'bg-[#2F1B10] text-[#E6C288] hover:bg-[#4a2c1a]'}`}
                                  >
                                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                  </button>
                              ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {filteredAchievements.map(achievement => {
                                  const name = language === 'ar' && achievement.name_ar ? achievement.name_ar : achievement.name;
                                  const desc = language === 'ar' && achievement.description_ar ? achievement.description_ar : achievement.description;
                                  return (
                                      <div 
                                          key={achievement.id} 
                                          className={`p-4 rounded-lg border transition-all ${
                                              achievement.unlocked 
                                                  ? 'bg-gradient-to-r from-[#8B4513] to-[#A0522D] border-[#FFD700]/50' 
                                                  : 'bg-[#1a1410] border-[#E6C288]/20 opacity-60'
                                          }`}
                                      >
                                          <div className="flex items-center gap-4">
                                              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${achievement.unlocked ? 'bg-[#FFD700]/30' : 'bg-black/30 grayscale'}`}>
                                                  {achievement.icon}
                                              </div>
                                              <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                      <p className={`font-bold ${achievement.unlocked ? 'text-[#FFD700]' : 'text-[#E6C288]/50'}`}>{name}</p>
                                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                                          achievement.rarity === 'legendary' ? 'bg-purple-500/30 text-purple-300' :
                                                          achievement.rarity === 'epic' ? 'bg-blue-500/30 text-blue-300' :
                                                          achievement.rarity === 'rare' ? 'bg-green-500/30 text-green-300' :
                                                          'bg-gray-500/30 text-gray-300'
                                                      }`}>{achievement.rarity}</span>
                                                  </div>
                                                  <p className={`text-sm ${achievement.unlocked ? 'text-[#E6C288]' : 'text-[#E6C288]/40'}`}>{desc}</p>
                                              </div>
                                              {achievement.unlocked && <span className="text-[#FFD700] text-xl">✓</span>}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- OVERLAY: CREDITS ---
  if (state === GameState.CREDITS) {
      return (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1410] border-2 border-[#E6C288] w-full max-w-2xl h-[80vh] flex flex-col rounded-lg shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#1a1410] to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#1a1410] to-transparent z-10 pointer-events-none"></div>
                  
                  <div className="p-6 border-b border-[#E6C288]/30 flex justify-between items-center z-20 bg-[#1a1410]">
                      <h2 className="text-3xl text-[#E6C288] font-title">{t('CREDITS')}</h2>
                      <button onClick={() => setGameState(GameState.MENU)} className="text-[#E6C288] hover:text-white text-xl">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 text-center space-y-12">
                      <div className="text-sm text-gray-400 italic mb-8 border border-white/10 p-4 rounded bg-white/5">
                          {t('DISCLAIMER')}
                      </div>

                      {CREDITS_DATA.map((section, index) => (
                          <div key={index} className="space-y-4">
                              <h3 className="text-[#E6C288] font-bold text-lg tracking-widest uppercase border-b border-[#E6C288]/20 pb-2 inline-block px-8">
                                  {t(section.role)}
                              </h3>
                              <div className="space-y-4">
                                  {section.content.map((item, i) => (
                                      <div key={i}>
                                          {item.url ? (
                                              <a href={item.url} target="_blank" rel="noreferrer" className="text-[#E6C288] underline hover:text-white block font-serif text-xl mb-1">{item.text}</a>
                                          ) : (
                                              <p className="text-[#F5F5DC] font-serif text-xl">{t(item.text)}</p>
                                          )}
                                          {item.subtext && <p className="text-[#F5F5DC] font-serif text-lg opacity-80">{item.subtext}</p>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                      
                      <div className="pt-8 text-[#E6C288]/40 text-xs">
                          Made with ❤️ for UAE Heritage
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return null;
};

export default UI;