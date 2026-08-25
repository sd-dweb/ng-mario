import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  public soundEnabled = signal<boolean>(true);
  public musicEnabled = signal<boolean>(true);

  private audioCtx: AudioContext | null = null;
  private musicInterval: any = null;
  private currentTrack: string | null = null;
  private musicStep = 0;
  private isMuted = false;

  constructor() {
    // Initialized lazily on first user gesture
  }

  private initContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public unlockAudio(): void {
    this.initContext();
  }

  public toggleSound(): boolean {
    const next = !this.soundEnabled();
    this.soundEnabled.set(next);
    return next;
  }

  public toggleMusic(): boolean {
    const next = !this.musicEnabled();
    this.musicEnabled.set(next);
    if (!next) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.playMusic(this.currentTrack, true);
    }
    return next;
  }

  // --- Chiptune Sound Effects ---

  public playJump(isSuper = false): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isSuper ? 'triangle' : 'square';
    const now = ctx.currentTime;
    const startFreq = isSuper ? 180 : 150;
    const endFreq = isSuper ? 580 : 440;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playCoin(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.setValueAtTime(0.18, now + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
  }

  public playStomp(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playKick(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playPowerUp(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [330, 392, 659, 523, 587, 784, 988, 1046];
    const duration = 0.05;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.18, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * duration);
      osc.stop(now + (idx + 1) * duration);
    });
  }

  public playPowerDown(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659, 587, 523, 440, 392, 330, 261];
    const duration = 0.06;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.18, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * duration);
      osc.stop(now + (idx + 1) * duration);
    });
  }

  public playFireball(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playBlockBump(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playBlockBreak(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Noise blast for brick shatter
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);
  }

  public playPipe(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [160, 200, 240, 200, 280, 240];
    const dur = 0.06;

    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * dur);

      gain.gain.setValueAtTime(0.2, now + idx * dur);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * dur);
      osc.stop(now + (idx + 1) * dur);
    });
  }

  public playFlagpole(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 494, 523, 587, 659, 698, 784, 880, 988, 1046];
    const dur = 0.07;

    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * dur);

      gain.gain.setValueAtTime(0.18, now + idx * dur);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * dur);
      osc.stop(now + (idx + 1) * dur);
    });
  }

  public playDie(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopMusic();
    const now = ctx.currentTime;
    const notes = [500, 400, 350, 300, 250, 200, 150];
    const dur = 0.08;

    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + idx * dur);

      gain.gain.setValueAtTime(0.2, now + idx * dur);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * dur);
      osc.stop(now + (idx + 1) * dur);
    });
  }

  public playStageClear(): void {
    if (!this.soundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopMusic();
    const now = ctx.currentTime;
    const fanfare = [
      { f: 392, d: 0.12 }, { f: 523, d: 0.12 }, { f: 659, d: 0.12 },
      { f: 784, d: 0.2 },  { f: 659, d: 0.12 }, { f: 784, d: 0.35 }
    ];

    let t = now;
    fanfare.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d + 0.02;
    });
  }

  // --- Background Music Engine ---

  public playMusic(track: string, force = false): void {
    if (this.currentTrack === track && !force) return;
    this.stopMusic();
    this.currentTrack = track;

    if (!this.musicEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.musicStep = 0;

    // 8-bit NES theme song patterns:
    if (track === 'overworld') {
      const notes = [
        659, 659, 0, 659, 0, 523, 659, 0, 784, 0, 0, 0, 392, 0, 0, 0,
        523, 0, 0, 392, 0, 0, 330, 0, 0, 440, 0, 494, 0, 466, 440, 0,
        392, 659, 784, 880, 0, 698, 784, 0, 659, 0, 523, 587, 494, 0, 0, 0
      ];
      const tempo = 125;
      this.musicInterval = setInterval(() => {
        if (!this.musicEnabled()) return;
        const note = notes[this.musicStep % notes.length];
        if (note > 0) {
          this.playBeep(note, 'square', 0.08, 0.07);
          // Simple bass harmony
          if (this.musicStep % 4 === 0) {
            this.playBeep(note / 2, 'triangle', 0.1, 0.08);
          }
        }
        this.musicStep++;
      }, tempo);

    } else if (track === 'underground') {
      const notes = [
        130, 260, 116, 233, 110, 220, 0, 0,
        130, 260, 116, 233, 110, 220, 0, 0,
        220, 207, 196, 185, 174, 164, 155, 146
      ];
      const tempo = 140;
      this.musicInterval = setInterval(() => {
        if (!this.musicEnabled()) return;
        const note = notes[this.musicStep % notes.length];
        if (note > 0) {
          this.playBeep(note * 2, 'triangle', 0.09, 0.08);
        }
        this.musicStep++;
      }, tempo);

    } else if (track === 'castle') {
      const notes = [
        220, 207, 196, 185, 220, 207, 196, 185,
        174, 164, 155, 146, 293, 277, 261, 246
      ];
      const tempo = 150;
      this.musicInterval = setInterval(() => {
        if (!this.musicEnabled()) return;
        const note = notes[this.musicStep % notes.length];
        if (note > 0) {
          this.playBeep(note, 'sawtooth', 0.1, 0.06);
        }
        this.musicStep++;
      }, tempo);

    } else if (track === 'star') {
      const notes = [
        523, 659, 784, 1046, 523, 659, 784, 1046,
        587, 740, 880, 1174, 587, 740, 880, 1174
      ];
      const tempo = 80;
      this.musicInterval = setInterval(() => {
        if (!this.musicEnabled()) return;
        const note = notes[this.musicStep % notes.length];
        if (note > 0) {
          this.playBeep(note, 'square', 0.05, 0.08);
        }
        this.musicStep++;
      }, tempo);
    }
  }

  public stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private playBeep(freq: number, type: OscillatorType, duration: number, vol = 0.08): void {
    const ctx = this.audioCtx;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio node cleanup
    }
  }
}
