

import { GoogleGenAI, Modality } from "@google/genai";
import { Act, GameMode } from './types';
import { ACT_STRUCTURE } from './constants';

// --- MUSIC THEORY CONSTANTS ---

// Frequencies for Maqam Hijaz on D (D, Eb, F#, G, A, Bb, C, D)
// Note: We use specific frequencies to approximate microtones/feel
const SCALE_HIJAZ = {
    D3: 146.83,
    Eb3: 155.56,
    Fs3: 185.00, 
    G3: 196.00,
    A3: 220.00,
    Bb3: 233.08,
    C4: 261.63,
    D4: 293.66,
    Eb4: 311.13,
    Fs4: 369.99,
    G4: 392.00,
    A4: 440.00
};

// Act Configurations based on Spec
const ACT_THEMES = {
    [Act.TRAINING_GROUNDS]: {
        bpm: 90,
        instruments: ['oud', 'light_perc'],
        scale: SCALE_HIJAZ,
        density: 0.3 // Sparse
    },
    [Act.HARBOR]: {
        bpm: 105,
        instruments: ['oud', 'strings', 'perc'],
        scale: SCALE_HIJAZ,
        density: 0.5
    },
    [Act.DIVING]: {
        bpm: 120,
        instruments: ['vocals_synth', 'full_perc'],
        scale: SCALE_HIJAZ,
        density: 0.8
    },
    [Act.DESERT]: {
        bpm: 95,
        instruments: ['ney', 'drone'],
        scale: SCALE_HIJAZ,
        density: 0.4
    },
    [Act.HOMECOMING]: {
        bpm: 130,
        instruments: ['full_ensemble', 'ululation_synth'],
        scale: SCALE_HIJAZ,
        density: 1.0
    }
};

class AudioController {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  
  // Mixers
  musicGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  
  // State
  isPlaying: boolean = false;
  currentAct: Act = Act.TRAINING_GROUNDS;
  currentMode: GameMode = 'STORY';
  
  // Scheduler
  nextNoteTime: number = 0;
  beatCount: number = 0;
  
  // Buffers
  noiseBuffer: AudioBuffer | null = null;
  
  // GenAI
  genAI: GoogleGenAI | null = null;
  currentTTSSource: AudioBufferSourceNode | null = null;

  constructor() {}

  init() {
    if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isPlaying = true; 
        return;
    }
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master Mix
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.4;
    this.masterGain.connect(this.ctx.destination);

    // Sub-mixers
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.6;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.8;
    this.sfxGain.connect(this.masterGain);

    // Noise Buffer for Percussion/Wind
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    try {
        this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.error("GenAI Init Failed", e);
    }

    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduler();
  }

  // --- SYNTHESIZER INSTRUMENTS ---

  // 1. Oud (Plucked, woody, fast decay)
  playOud(time: number, freq: number, velocity: number) {
      if (!this.ctx || !this.musicGain) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle'; // Warmer than saw
      osc.frequency.value = freq;
      
      // Filter to simulate wooden body resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      
      // Envelope: Sharp attack, exponential decay (pluck)
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(velocity, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      
      osc.start(time);
      osc.stop(time + 0.5);
  }

  // 2. Ney (Flute: Breathy, slow attack, sine/noise mix)
  playNey(time: number, freq: number, duration: number, velocity: number) {
      if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;

      // Tone (Sine)
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Breath (Filtered Noise)
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = freq + 100;
      noiseFilter.Q.value = 1;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = velocity * 0.1;

      // Envelope: Slow attack (swelling), sustain
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(velocity, time + 0.2); // Breath-in
      gain.gain.linearRampToValueAtTime(velocity * 0.8, time + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc.connect(gain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);
      noise.start(time);
      noise.stop(time + duration);
  }

  // 3. Strings (Pad: Sawtooth, slow attack, ensemble feel)
  playStrings(time: number, freq: number, duration: number, velocity: number) {
      if (!this.ctx || !this.musicGain) return;

      // Use 2 oscillators slightly detuned for chorus effect
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.value = freq;
      osc2.frequency.value = freq + 2; // Detune

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800; // Mellow

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(velocity * 0.5, time + 0.5); // Slow swell
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration);
      osc2.stop(time + duration);
  }

  // 4. Percussion (Darbuka: Dum/Tek)
  playPercussion(time: number, type: 'dum' | 'tek' | 'clap', velocity: number) {
      if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;

      const gain = this.ctx.createGain();
      gain.connect(this.musicGain);

      if (type === 'dum') {
          // Bass hit: Pitch dropping sine
          const osc = this.ctx.createOscillator();
          osc.frequency.setValueAtTime(120, time);
          osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
          
          gain.gain.setValueAtTime(velocity, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
          
          osc.connect(gain);
          osc.start(time);
          osc.stop(time + 0.3);
      } else if (type === 'tek') {
          // High hit: High-passed noise
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 2000;
          
          gain.gain.setValueAtTime(velocity * 0.7, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08); // Sharp
          
          src.connect(filter);
          filter.connect(gain);
          src.start(time);
          src.stop(time + 0.1);
      } else if (type === 'clap') {
          // Clap: Bandpassed noise with slightly longer tail
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1500;
          filter.Q.value = 1;

          gain.gain.setValueAtTime(velocity, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

          src.connect(filter);
          filter.connect(gain);
          src.start(time);
          src.stop(time + 0.2);
      }
  }

  // --- MUSIC SCHEDULER (The Composer) ---
  
  scheduler() {
      if (!this.ctx || !this.isPlaying) return;

      // Schedule ahead 100ms
      while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
          this.playBeat(this.nextNoteTime);
          this.advanceBeat();
      }
      setTimeout(() => this.scheduler(), 25);
  }

  advanceBeat() {
      const theme = ACT_STRUCTURE[this.currentAct] ? ACT_THEMES[this.currentAct] : ACT_THEMES[Act.TRAINING_GROUNDS];
      const secondsPerBeat = 60.0 / theme.bpm;
      this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note resolution
      this.beatCount++;
  }

  playBeat(time: number) {
      const theme = ACT_THEMES[this.currentAct];
      if (!theme) return;

      const beat16 = this.beatCount % 16; // 1 bar loop of 16th notes
      const beat4 = this.beatCount % 4;   // Quarter note check

      const scaleKeys = Object.keys(theme.scale);
      const randomNote = theme.scale[scaleKeys[Math.floor(Math.random() * scaleKeys.length)] as keyof typeof theme.scale];
      const rootNote = theme.scale['D3'];

      // --- LAYER 1: PERCUSSION (Rhythm) ---
      // Maqsoum Rhythm Variation (Dum - - Tek - Dum - Tek -)
      if (theme.instruments.includes('light_perc') || theme.instruments.includes('perc') || theme.instruments.includes('full_perc')) {
          if (beat16 === 0) this.playPercussion(time, 'dum', 0.6); // Beat 1
          if (beat16 === 3) this.playPercussion(time, 'tek', 0.3); // "and" of 1
          if (beat16 === 6) this.playPercussion(time, 'dum', 0.5); // "and" of 2
          if (beat16 === 8) this.playPercussion(time, 'tek', 0.4); // Beat 3
          if (beat16 === 10) this.playPercussion(time, 'tek', 0.2); // ghost note
          if (beat16 === 12) this.playPercussion(time, 'tek', 0.4); // Beat 4
      }

      // Claps for Homecoming
      if (theme.instruments.includes('full_ensemble') && (beat16 === 4 || beat16 === 12)) {
          this.playPercussion(time, 'clap', 0.4);
      }

      // --- LAYER 2: OUD (Melody/Arpeggio) ---
      if (theme.instruments.includes('oud')) {
          // Play on main beats or syncopated depending on density
          const shouldPlay = beat16 % 2 === 0 && Math.random() < theme.density;
          if (shouldPlay) {
              // Bias towards root notes on beat 1
              const note = (beat16 === 0) ? rootNote : randomNote;
              this.playOud(time, note, 0.2);
          }
      }

      // --- LAYER 3: NEY (Atmosphere/Lead) ---
      if (theme.instruments.includes('ney')) {
          // Long flowing notes
          if (beat16 === 0 && Math.random() > 0.4) {
              const note = theme.scale['A4'] || theme.scale['G4']; // High register
              this.playNey(time, note, 1.5, 0.15);
          }
      }

      // --- LAYER 4: STRINGS (Background Harmony) ---
      if (theme.instruments.includes('strings') || theme.instruments.includes('full_ensemble')) {
          if (beat16 === 0) {
              // Drone bass note
              this.playStrings(time, theme.scale['D3'], 2.0, 0.1); 
              // Harmony
              if (Math.random() > 0.5) {
                  this.playStrings(time, theme.scale['G3'], 2.0, 0.08);
              }
          }
      }

      // --- LAYER 5: STORM DRAMA ---
      if (this.currentAct === Act.DIVING && theme.instruments.includes('full_perc')) {
          // Random chaotic heavy drum hits
          if (Math.random() < 0.1) {
              this.playPercussion(time, 'dum', 0.8);
          }
      }
  }

  // --- STATE MANAGEMENT ---
  
  update(delta: number, act: Act, mode: GameMode) {
      this.currentAct = act;
      this.currentMode = mode;
  }

  startMusic() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      this.isPlaying = true;
      this.nextNoteTime = this.ctx?.currentTime || 0 + 0.1;
  }

  stopMusic() {
      this.isPlaying = false;
      // Stop TTS if talking
      if (this.currentTTSSource) {
          try { this.currentTTSSource.stop(); } catch(e){}
          this.currentTTSSource = null;
      }
  }

  pause() {
      if (this.ctx) this.ctx.suspend();
      this.isPlaying = false;
  }

  // --- TTS ---
  async playTTS(text: string, onPlay?: () => void, onEnd?: () => void, retryCount = 0) {
      if (!this.genAI || !this.ctx) {
          if(onPlay) onPlay();
          if(onEnd) setTimeout(onEnd, 2000);
          return;
      }

      try {
          const response = await this.genAI.models.generateContent({
              model: 'gemini-2.5-flash-preview-tts',
              contents: [{ parts: [{ text: text }] }],
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
              }
          });

          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
              const audioBuffer = await this.decodeAudioData(this.base64ToUint8Array(base64Audio), this.ctx);
              const source = this.ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.masterGain); // Route to master
              source.onended = () => { if(onEnd) onEnd(); this.currentTTSSource = null; };
              if(onPlay) onPlay();
              source.start();
              this.currentTTSSource = source;
          } else {
              throw new Error("No audio data received");
          }
      } catch (e: any) {
          console.error(`TTS Failed (Attempt ${retryCount + 1}):`, e);
          
          if (e.status === 503 || (e.message && e.message.includes('503'))) {
              if (retryCount < 3) {
                  const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                  setTimeout(() => this.playTTS(text, onPlay, onEnd, retryCount + 1), delay);
                  return;
              }
          }
          
          // Fallback if failed after retries
          if(onPlay) onPlay();
          if(onEnd) setTimeout(onEnd, 2000);
      }
  }

  // --- SFX TRIGGERS ---
  playSound(type: 'collect' | 'jump' | 'land' | 'woosh' | 'market' | 'harbor' | 'hurt') {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      
      switch(type) {
          case 'collect':
              // High pitched chime (Pearl)
              const osc = this.ctx.createOscillator();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, t);
              osc.frequency.exponentialRampToValueAtTime(1760, t + 0.1);
              const g = this.ctx.createGain();
              g.gain.setValueAtTime(0.3, t);
              g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
              osc.connect(g); g.connect(this.sfxGain);
              osc.start(t); osc.stop(t + 0.5);
              break;
          case 'jump':
              // Effort sound (Breath/Grunt approx) + Cloth movement
              const noise = this.ctx.createBufferSource();
              noise.buffer = this.noiseBuffer;
              const f = this.ctx.createBiquadFilter();
              f.type = 'lowpass';
              f.frequency.setValueAtTime(600, t);
              const g2 = this.ctx.createGain();
              g2.gain.setValueAtTime(0.2, t);
              g2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
              noise.connect(f); f.connect(g2); g2.connect(this.sfxGain);
              noise.start(t); noise.stop(t + 0.2);
              break;
          case 'hurt':
              // Heavy thud
              const osc2 = this.ctx.createOscillator();
              osc2.frequency.setValueAtTime(100, t);
              osc2.frequency.exponentialRampToValueAtTime(20, t + 0.3);
              const g3 = this.ctx.createGain();
              g3.gain.setValueAtTime(0.5, t);
              g3.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
              osc2.connect(g3); g3.connect(this.sfxGain);
              osc2.start(t); osc2.stop(t + 0.3);
              break;
          default:
              // Generic woosh
              if(this.noiseBuffer) {
                  const src = this.ctx.createBufferSource();
                  src.buffer = this.noiseBuffer;
                  const fil = this.ctx.createBiquadFilter();
                  fil.type = 'bandpass';
                  fil.frequency.setValueAtTime(400, t);
                  fil.frequency.linearRampToValueAtTime(200, t + 0.2);
                  const gn = this.ctx.createGain();
                  gn.gain.setValueAtTime(0.1, t);
                  gn.gain.linearRampToValueAtTime(0, t + 0.2);
                  src.connect(fil); fil.connect(gn); gn.connect(this.sfxGain);
                  src.start(t); src.stop(t+0.2);
              }
      }
  }

  // --- HELPERS ---
  private base64ToUint8Array(base64: string): Uint8Array {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      return bytes;
  }

  // Decodes raw PCM data from Gemini 2.5 TTS (24kHz, 16-bit, Mono)
  // Replaces browser's native decodeAudioData which expects headers
  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
      const sampleRate = 24000;
      const numChannels = 1;
      
      // Create a copy of the buffer to ensure we have a clean ArrayBuffer for the view
      const bufferCopy = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      const dataInt16 = new Int16Array(bufferCopy);
      
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          // Normalize 16-bit integer to float range [-1.0, 1.0]
          channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
      }
      return buffer;
  }
}

export const audioSystem = new AudioController();
export const playSound = (type: any) => audioSystem.playSound(type);
