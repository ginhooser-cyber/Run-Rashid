import { GoogleGenAI, Modality } from "@google/genai";
import { Act, GameMode } from './types';

// ================================================================
// AUTHENTIC ARABIAN MAQAMAT (Musical Scales)
// ================================================================
const SCALE_BAYATI = [146.83, 160, 174.61, 196, 220, 233.08, 261.63, 293.66, 320, 349.23, 392, 440];
const SCALE_NAHAWAND = [146.83, 164.81, 174.61, 196, 220, 233.08, 261.63, 293.66, 329.63, 349.23, 392, 440];
const SCALE_HIJAZ = [146.83, 155.56, 185, 196, 220, 233.08, 261.63, 293.66, 311.13, 370, 392, 440];
const SCALE_SABA = [146.83, 160, 174.61, 185, 220, 233.08, 261.63, 293.66, 320, 349.23, 370, 440];
const SCALE_RAST = [130.81, 146.83, 160, 174.61, 196, 220, 245, 261.63, 293.66, 320, 349.23, 392];

// ================================================================
// PRE-COMPOSED MELODIC PHRASES (8-bar motifs per act)
// Each array is [note_index, duration_beats]
// ================================================================
const MELODIES = {
    ACT1_OUD_MAIN: [[0,2], [4,2], [2,1], [4,1], [5,2], [4,2], [2,2], [0,4]], // Contemplative
    ACT1_NEY_ANSWER: [[7,4], [5,2], [4,2], [2,4], [0,4]], // Gentle response
    ACT2_OUD_DRIVE: [[0,1], [2,1], [4,1], [5,1], [4,1], [2,1], [4,2], [5,1], [7,1], [5,2], [4,2], [2,2], [0,2]], // Work rhythm
    ACT2_RABABA_CALL: [[4,4], [5,4], [7,4], [5,8]], // Sailors' call
    ACT3_NEY_FLOAT: [[7,8], [9,4], [7,4], [5,8], [4,8]], // Underwater ethereal
    ACT3_OUD_RIPPLE: [[0,2], [4,2], [7,2], [4,2], [0,2], [2,2], [5,2], [2,2]], // Shimmering
    ACT4_RABABA_LAMENT: [[4,8], [5,4], [4,4], [2,8], [0,8]], // Desert sadness
    ACT4_NEY_WIND: [[7,8], [5,8], [2,16]], // Vast emptiness
    ACT5_OUD_TRIUMPH: [[0,1], [2,1], [4,1], [5,1], [7,1], [9,1], [7,1], [5,1], [7,2], [9,2], [11,4]], // Celebration
    ACT5_NEY_JOY: [[11,2], [9,2], [11,2], [9,2], [7,4], [9,4], [11,8]], // Homecoming joy
};

// ================================================================
// ACT CONFIGURATIONS
// ================================================================
const ACT_THEMES: Record<Act, { bpm: number; scale: number[]; root: number; name: string }> = {
    [Act.TRAINING_GROUNDS]: { bpm: 95, scale: SCALE_BAYATI, root: 146.83, name: "Morning Overture" },
    [Act.HARBOR]: { bpm: 115, scale: SCALE_NAHAWAND, root: 146.83, name: "Sea Chant March" },
    [Act.DIVING]: { bpm: 70, scale: SCALE_HIJAZ, root: 146.83, name: "Underwater Ballet" },
    [Act.DESERT]: { bpm: 80, scale: SCALE_SABA, root: 146.83, name: "Caravan Elegy" },
    [Act.HOMECOMING]: { bpm: 140, scale: SCALE_RAST, root: 130.81, name: "Triumphant Finale" }
};

// ================================================================
// AUDIO CONTROLLER - OPERA LEVEL
// ================================================================
class AudioController {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    musicGain: GainNode | null = null;
    sfxGain: GainNode | null = null;
    droneGain: GainNode | null = null;
    padGain: GainNode | null = null;
    
    isPlaying = false;
    currentAct: Act = Act.TRAINING_GROUNDS;
    currentMode: GameMode = 'STORY';
    nextNoteTime = 0;
    beatCount = 0;
    barCount = 0;
    phraseCount = 0;
    intensity = 0.5; // 0-1 dynamic intensity
    noiseBuffer: AudioBuffer | null = null;
    
    // Continuous oscillators
    droneOsc1: OscillatorNode | null = null;
    droneOsc2: OscillatorNode | null = null;
    droneOsc3: OscillatorNode | null = null;
    
    // Pad oscillators (harmony layer)
    padOscs: OscillatorNode[] = [];
    
    genAI: GoogleGenAI | null = null;
    currentTTSSource: AudioBufferSourceNode | null = null;

    init() {
        if (this.ctx) {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            this.isPlaying = true;
            return;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();

        // MASTER MIX - OPERA LEVEL LOUD
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.85;
        this.masterGain.connect(this.ctx.destination);

        // Music submix
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.9;
        this.musicGain.connect(this.masterGain);

        // Drone bass submix
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.35;
        this.droneGain.connect(this.masterGain);

        // Pad harmony submix
        this.padGain = this.ctx.createGain();
        this.padGain.gain.value = 0.25;
        this.padGain.connect(this.masterGain);

        // SFX submix
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.8;
        this.sfxGain.connect(this.masterGain);

        // Noise buffer
        const bufferSize = this.ctx.sampleRate * 2;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        try { this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY }); } catch(e){}

        // START LAYERS
        this.startDrone();
        this.startPads();
        this.playGrandOpening();

        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.scheduler();
    }

    // ================================================================
    // LAYER 1: BASS DRONE (Root + Fifth + Octave - always playing)
    // ================================================================
    startDrone() {
        if (!this.ctx || !this.droneGain) return;
        const theme = ACT_THEMES[this.currentAct];
        const root = theme.root / 2;

        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc2 = this.ctx.createOscillator();
        this.droneOsc3 = this.ctx.createOscillator();
        
        this.droneOsc1.type = 'triangle';
        this.droneOsc2.type = 'sine';
        this.droneOsc3.type = 'sine';
        
        this.droneOsc1.frequency.value = root;
        this.droneOsc2.frequency.value = root * 1.5;
        this.droneOsc3.frequency.value = root * 2;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        [this.droneOsc1, this.droneOsc2, this.droneOsc3].forEach(o => o.connect(filter));
        filter.connect(this.droneGain);
        
        this.droneOsc1.start();
        this.droneOsc2.start();
        this.droneOsc3.start();
    }

    updateDrone() {
        if (!this.ctx) return;
        const theme = ACT_THEMES[this.currentAct];
        const root = theme.root / 2;
        const t = this.ctx.currentTime;
        
        this.droneOsc1?.frequency.setTargetAtTime(root, t, 3);
        this.droneOsc2?.frequency.setTargetAtTime(root * 1.5, t, 3);
        this.droneOsc3?.frequency.setTargetAtTime(root * 2, t, 3);
    }

    // ================================================================
    // LAYER 2: STRING PADS (Sustained harmony - 4 voices)
    // ================================================================
    startPads() {
        if (!this.ctx || !this.padGain) return;
        const theme = ACT_THEMES[this.currentAct];
        const chord = [theme.root, theme.scale[4], theme.scale[7], theme.root * 2];
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.connect(this.padGain);

        chord.forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(filter);
            osc.start();
            this.padOscs.push(osc);
        });
    }

    updatePads() {
        if (!this.ctx) return;
        const theme = ACT_THEMES[this.currentAct];
        const chord = [theme.root, theme.scale[4], theme.scale[7], theme.root * 2];
        
        this.padOscs.forEach((osc, i) => {
            if (chord[i]) osc.frequency.setTargetAtTime(chord[i], this.ctx!.currentTime, 2);
        });
    }

    // ================================================================
    // GRAND OPENING (Opera overture - first 2 seconds)
    // ================================================================
    playGrandOpening() {
        if (!this.ctx || !this.musicGain) return;
        const t = this.ctx.currentTime;
        const theme = ACT_THEMES[this.currentAct];
        const s = theme.scale;

        // DRAMATIC OUD FLOURISH (fast ascending)
        this.playOud(t, s[0], 0.8, 0.15);
        this.playOud(t + 0.08, s[2], 0.7, 0.15);
        this.playOud(t + 0.16, s[4], 0.75, 0.15);
        this.playOud(t + 0.24, s[5], 0.7, 0.15);
        this.playOud(t + 0.32, s[7], 0.85, 0.4);
        
        // FULL CHORD STRUM
        this.playOudChord(t + 0.5, s[0], 0.9);
        this.playOudChord(t + 0.52, s[4], 0.8);
        this.playOudChord(t + 0.54, s[7], 0.75);
        
        // NEY ENTRANCE (high, dramatic)
        this.playNey(t + 0.3, s[7] * 2, 2.5, 0.65);
        
        // RABABA SWEEP
        this.playRababa(t + 0.4, s[4], 3, 0.5);
        
        // PERCUSSION FANFARE
        this.playTabl(t, 1.0);
        this.playTabl(t + 0.25, 0.7);
        this.playTabl(t + 0.5, 0.9);
        this.playDaf(t + 0.12, 0.8);
        this.playDaf(t + 0.37, 0.7);
        this.playManjur(t + 0.6, 0.7);
        this.playManjur(t + 0.8, 0.6);
        this.playCrash(t + 0.5, 0.8);
    }

    // ================================================================
    // INSTRUMENTS
    // ================================================================
    
    // OUD - Rich plucked with harmonics
    playOud(time: number, freq: number, vel: number, decay = 0.5) {
        if (!this.ctx || !this.musicGain) return;
        
        // Main + octave + slight detune for richness
        [freq, freq * 2, freq * 1.002].forEach((f, i) => {
            const osc = this.ctx!.createOscillator();
            osc.type = i < 2 ? 'triangle' : 'sawtooth';
            osc.frequency.value = f;
            
            const filter = this.ctx!.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, time);
            filter.frequency.exponentialRampToValueAtTime(800, time + decay);
            
            const gain = this.ctx!.createGain();
            const v = vel * (i === 0 ? 1 : i === 1 ? 0.4 : 0.15);
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(v, time + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.01, time + decay);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain!);
            osc.start(time);
            osc.stop(time + decay + 0.1);
        });
    }

    // OUD CHORD (3-note spread)
    playOudChord(time: number, rootFreq: number, vel: number) {
        this.playOud(time, rootFreq, vel, 0.8);
        this.playOud(time + 0.01, rootFreq * 1.5, vel * 0.8, 0.8);
        this.playOud(time + 0.02, rootFreq * 2, vel * 0.6, 0.8);
    }

    // NEY - Breathy with vibrato
    playNey(time: number, freq: number, dur: number, vel: number) {
        if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        // Vibrato LFO
        const vib = this.ctx.createOscillator();
        const vibG = this.ctx.createGain();
        vib.frequency.value = 5.5;
        vibG.gain.value = freq * 0.02;
        vib.connect(vibG);
        vibG.connect(osc.frequency);

        // Breath noise
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const nf = this.ctx.createBiquadFilter();
        nf.type = 'bandpass';
        nf.frequency.value = freq;
        nf.Q.value = 3;
        const ng = this.ctx.createGain();
        ng.gain.value = vel * 0.15;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vel, time + 0.2);
        gain.gain.setValueAtTime(vel * 0.85, time + dur - 0.3);
        gain.gain.linearRampToValueAtTime(0, time + dur);

        osc.connect(gain);
        noise.connect(nf);
        nf.connect(ng);
        ng.connect(gain);
        gain.connect(this.musicGain);

        vib.start(time);
        osc.start(time);
        noise.start(time);
        vib.stop(time + dur);
        osc.stop(time + dur);
        noise.stop(time + dur);
    }

    // RABABA - Bowed with heavy vibrato
    playRababa(time: number, freq: number, dur: number, vel: number) {
        if (!this.ctx || !this.musicGain) return;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const vib = this.ctx.createOscillator();
        const vibG = this.ctx.createGain();
        vib.frequency.value = 6;
        vibG.gain.value = freq * 0.03;
        vib.connect(vibG);
        vibG.connect(osc.frequency);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq * 2;
        filter.Q.value = 4;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vel, time + 0.1);
        gain.gain.setValueAtTime(vel * 0.8, time + dur - 0.2);
        gain.gain.linearRampToValueAtTime(0, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        vib.start(time);
        osc.start(time);
        vib.stop(time + dur);
        osc.stop(time + dur);
    }

    // TABL - Deep bass drum
    playTabl(time: number, vel: number) {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(90, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vel, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    // DAF - Frame drum
    playDaf(time: number, vel: number) {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vel * 0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.35);
    }

    // TEK - High snap
    playTek(time: number, vel: number) {
        if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const f = this.ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 3000;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vel * 0.6, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        src.connect(f);
        f.connect(g);
        g.connect(this.musicGain);
        src.start(time);
        src.stop(time + 0.06);
    }

    // MANJUR - Jingling
    playManjur(time: number, vel: number) {
        if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const f = this.ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 6000;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vel * 0.5, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        src.connect(f);
        f.connect(g);
        g.connect(this.musicGain);
        src.start(time);
        src.stop(time + 0.12);
    }

    // CLAP
    playClap(time: number, vel: number) {
        if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const f = this.ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 2000;
        f.Q.value = 1;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vel * 0.8, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        src.connect(f);
        f.connect(g);
        g.connect(this.musicGain);
        src.start(time);
        src.stop(time + 0.12);
    }

    // CRASH (cymbal-like)
    playCrash(time: number, vel: number) {
        if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const f = this.ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 4000;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vel * 0.6, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        src.connect(f);
        f.connect(g);
        g.connect(this.musicGain);
        src.start(time);
        src.stop(time + 1);
    }

    // ================================================================
    // SCHEDULER
    // ================================================================
    scheduler() {
        if (!this.ctx || !this.isPlaying) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playBeat(this.nextNoteTime);
            this.advanceBeat();
        }
        setTimeout(() => this.scheduler(), 15);
    }

    advanceBeat() {
        const theme = ACT_THEMES[this.currentAct];
        this.nextNoteTime += (60 / theme.bpm) * 0.25;
        this.beatCount++;
        if (this.beatCount % 16 === 0) this.barCount++;
        if (this.barCount % 4 === 0 && this.beatCount % 16 === 0) {
            this.phraseCount++;
            this.intensity = 0.4 + Math.sin(this.phraseCount * 0.5) * 0.3 + Math.random() * 0.2;
        }
    }

    // ================================================================
    // MAIN BEAT - FULL ORCHESTRA PER ACT
    // ================================================================
    playBeat(t: number) {
        const theme = ACT_THEMES[this.currentAct];
        const s = theme.scale;
        const b16 = this.beatCount % 16;
        const bar = this.barCount % 4;
        const phrase = this.phraseCount % 8;
        const int = this.intensity;

        // === UNIVERSAL PERCUSSION (all acts) ===
        if (b16 === 0) this.playTabl(t, 0.8 * int);
        if (b16 === 8) this.playTabl(t, 0.6 * int);
        if (b16 === 4 || b16 === 12) this.playDaf(t, 0.6 * int);
        if (b16 % 4 === 2) this.playTek(t, 0.5 * int);
        if (b16 % 8 === 6) this.playManjur(t, 0.4 * int);

        // === ACT 1: MORNING OVERTURE ===
        if (this.currentAct === Act.TRAINING_GROUNDS) {
            // Oud melodic phrase
            const melody = MELODIES.ACT1_OUD_MAIN;
            const noteIdx = b16 % melody.length;
            if (b16 % 2 === 0) this.playOud(t, s[melody[noteIdx][0] % s.length], 0.65 * int);
            
            // Ney answers every 4 bars
            if (b16 === 0 && bar === 2) {
                MELODIES.ACT1_NEY_ANSWER.forEach((n, i) => {
                    this.playNey(t + i * 0.5, s[n[0] % s.length] * 2, 1.5, 0.45 * int);
                });
            }
            
            // Build: Add rababa in later phrases
            if (phrase > 2 && b16 === 0) this.playRababa(t, s[4], 4, 0.35 * int);
        }

        // === ACT 2: SEA CHANT MARCH ===
        else if (this.currentAct === Act.HARBOR) {
            // Driving oud rhythm
            if (b16 % 2 === 0) {
                const m = MELODIES.ACT2_OUD_DRIVE;
                this.playOud(t, s[m[b16 % m.length][0] % s.length], 0.7 * int);
            }
            
            // Oud chords on downbeats
            if (b16 === 0) this.playOudChord(t, s[0], 0.75 * int);
            if (b16 === 8) this.playOudChord(t, s[4], 0.65 * int);
            
            // Rababa call every 2 bars
            if (b16 === 0 && bar % 2 === 0) this.playRababa(t, s[4], 3, 0.5 * int);
            
            // Extra manjur (sailors)
            if (b16 % 4 === 0) this.playManjur(t, 0.5 * int);
            
            // Ney harmonies
            if (b16 === 4 && bar === 1) this.playNey(t, s[7] * 2, 3, 0.4 * int);
        }

        // === ACT 3: UNDERWATER BALLET ===
        else if (this.currentAct === Act.DIVING) {
            // Ethereal ney floating
            if (b16 === 0 && bar % 2 === 0) {
                this.playNey(t, s[7] * 2, 6, 0.5 * int);
            }
            if (b16 === 8 && bar % 2 === 1) {
                this.playNey(t, s[5] * 2, 5, 0.4 * int);
            }
            
            // Sparse oud ripples
            const ripple = MELODIES.ACT3_OUD_RIPPLE;
            if (b16 % 4 === 0) this.playOud(t, s[ripple[bar % ripple.length][0] % s.length], 0.4 * int, 1);
            
            // Mysterious rababa
            if (b16 === 0 && bar === 0 && phrase % 2 === 0) {
                this.playRababa(t, s[2], 8, 0.35 * int);
            }
            
            // Less percussion underwater
            if (b16 === 0) this.playTabl(t, 0.3 * int);
        }

        // === ACT 4: CARAVAN ELEGY ===
        else if (this.currentAct === Act.DESERT) {
            // Mournful rababa lead
            if (b16 === 0 && bar === 0) {
                MELODIES.ACT4_RABABA_LAMENT.forEach((n, i) => {
                    if (i < 3) this.playRababa(t + i * 1.5, s[n[0] % s.length], 4, 0.55 * int);
                });
            }
            
            // Ney wind
            if (b16 === 8 && bar === 2) this.playNey(t, s[7] * 2, 5, 0.45 * int);
            
            // Steady oud heartbeat
            if (b16 === 0) this.playOud(t, s[0], 0.55 * int);
            if (b16 === 8) this.playOud(t, s[4], 0.45 * int);
            
            // Sparse texture
            if (b16 === 12 && bar % 2 === 1) this.playOud(t, s[2], 0.35 * int);
        }

        // === ACT 5: TRIUMPHANT FINALE ===
        else if (this.currentAct === Act.HOMECOMING) {
            // FULL TUTTI - EVERYTHING PLAYS
            
            // Triumphant oud melody
            const m = MELODIES.ACT5_OUD_TRIUMPH;
            if (b16 % 2 === 0) this.playOud(t, s[m[b16 % m.length][0] % s.length], 0.75 * int);
            
            // Chord stabs
            if (b16 === 0) this.playOudChord(t, s[0], 0.9);
            if (b16 === 4) this.playOudChord(t, s[4], 0.8);
            if (b16 === 8) this.playOudChord(t, s[7], 0.85);
            if (b16 === 12) this.playOudChord(t, s[4], 0.8);
            
            // Joyful ney
            if (b16 === 0 && bar % 2 === 0) this.playNey(t, s[11] * 2, 3, 0.6);
            
            // Rababa harmonies
            if (b16 === 0 && bar === 0) this.playRababa(t, s[4], 4, 0.5);
            if (b16 === 0 && bar === 2) this.playRababa(t, s[7], 4, 0.45);
            
            // FULL PERCUSSION
            if (b16 % 2 === 0) this.playManjur(t, 0.6);
            if (b16 === 4 || b16 === 12) this.playClap(t, 0.7);
            if (b16 === 0 && bar === 3) this.playCrash(t, 0.7);
        }
    }

    // ================================================================
    // STATE
    // ================================================================
    update(delta: number, act: Act, mode: GameMode) {
        if (this.currentAct !== act) {
            this.currentAct = act;
            this.updateDrone();
            this.updatePads();
            this.playGrandOpening(); // Play intro for new act
        }
        this.currentMode = mode;
    }

    startMusic() {
        if (!this.ctx) this.init();
        if (this.ctx?.state === 'suspended') this.ctx.resume();
        this.isPlaying = true;
        this.nextNoteTime = this.ctx?.currentTime || 0 + 0.05;
    }

    stopMusic() { this.isPlaying = false; }
    pause() { if (this.ctx) this.ctx.suspend(); this.isPlaying = false; }
    
    // Stop ALL audio immediately - for menu/game over transitions
    stopAll() {
        this.isPlaying = false;
        
        // Stop TTS if playing
        if (this.currentTTSSource) {
            try {
                this.currentTTSSource.stop();
            } catch(e) {}
            this.currentTTSSource = null;
        }
        
        // Suspend the audio context to immediately silence everything
        if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend();
        }
    }
    
    // Resume audio after stopAll
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Volume controls (0-100 range)
    setMasterVolume(value: number) {
        if (this.masterGain) this.masterGain.gain.value = value / 100;
    }
    setMusicVolume(value: number) {
        if (this.musicGain) this.musicGain.gain.value = value / 100;
        if (this.droneGain) this.droneGain.gain.value = (value / 100) * 0.35;
        if (this.padGain) this.padGain.gain.value = (value / 100) * 0.25;
    }
    setSfxVolume(value: number) {
        if (this.sfxGain) this.sfxGain.gain.value = value / 100;
    }

    // ================================================================
    // TTS
    // ================================================================
    async playTTS(text: string, onPlay?: () => void, onEnd?: () => void, retryCount = 0) {
        if (!this.genAI || !this.ctx) { if(onPlay) onPlay(); if(onEnd) setTimeout(onEnd, 2000); return; }
        try {
            const response = await this.genAI.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text }] }],
                config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } } }
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await this.decodeAudioData(this.base64ToUint8Array(base64Audio), this.ctx);
                const source = this.ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.masterGain!);
                source.onended = () => { if(onEnd) onEnd(); this.currentTTSSource = null; };
                if(onPlay) onPlay();
                source.start();
                this.currentTTSSource = source;
            } else throw new Error("No audio");
        } catch (e: any) {
            if ((e.status === 503 || e.message?.includes('503')) && retryCount < 3) {
                setTimeout(() => this.playTTS(text, onPlay, onEnd, retryCount + 1), Math.pow(2, retryCount) * 1000);
                return;
            }
            if(onPlay) onPlay(); if(onEnd) setTimeout(onEnd, 2000);
        }
    }

    // ================================================================
    // SFX
    // ================================================================
    playSound(type: 'collect' | 'jump' | 'land' | 'woosh' | 'market' | 'harbor' | 'hurt') {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime;
        switch(type) {
            case 'collect':
                const o = this.ctx.createOscillator();
                o.type = 'sine';
                o.frequency.setValueAtTime(880, t);
                o.frequency.exponentialRampToValueAtTime(1760, t + 0.1);
                const g = this.ctx.createGain();
                g.gain.setValueAtTime(0.5, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                o.connect(g); g.connect(this.sfxGain);
                o.start(t); o.stop(t + 0.5);
                break;
            case 'hurt':
                const o2 = this.ctx.createOscillator();
                o2.frequency.setValueAtTime(100, t);
                o2.frequency.exponentialRampToValueAtTime(20, t + 0.3);
                const g2 = this.ctx.createGain();
                g2.gain.setValueAtTime(0.7, t);
                g2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                o2.connect(g2); g2.connect(this.sfxGain);
                o2.start(t); o2.stop(t + 0.35);
                break;
            case 'jump': {
                // Quick ascending whoosh sound
                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.connect(gain); gain.connect(this.sfxGain);
                osc.start(t); osc.stop(t + 0.25);
                break;
            }
            case 'land': {
                // Soft thud sound
                const osc = this.ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.connect(gain); gain.connect(this.sfxGain);
                osc.start(t); osc.stop(t + 0.2);
                break;
            }
            case 'woosh': {
                // Fast swoosh for lane change/slide
                const noise = this.ctx.createBufferSource();
                if (this.noiseBuffer) noise.buffer = this.noiseBuffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(2000, t);
                filter.frequency.exponentialRampToValueAtTime(500, t + 0.15);
                filter.Q.value = 0.5;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                noise.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
                noise.start(t); noise.stop(t + 0.2);
                break;
            }
            case 'market': {
                // Market ambiance - brief jingling coins
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.value = 2000;
                osc2.frequency.value = 2500;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                osc1.connect(gain); osc2.connect(gain); gain.connect(this.sfxGain);
                osc1.start(t); osc2.start(t + 0.05);
                osc1.stop(t + 0.35); osc2.stop(t + 0.4);
                break;
            }
            case 'harbor': {
                // Harbor ambiance - low horn-like sound
                const osc = this.ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.value = 110;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 300;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
                osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
                osc.start(t); osc.stop(t + 0.7);
                break;
            }
        }
    }

    private base64ToUint8Array(base64: string): Uint8Array {
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
        const sampleRate = 24000;
        const bufferCopy = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const dataInt16 = new Int16Array(bufferCopy);
        const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        return buffer;
    }
}

export type SoundType = 'collect' | 'jump' | 'land' | 'woosh' | 'market' | 'harbor' | 'hurt';
export const audioSystem = new AudioController();
export const playSound = (type: SoundType) => audioSystem.playSound(type);