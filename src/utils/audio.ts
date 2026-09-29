// VELORA Private Island — Environmental Audio Engine
// Multi-bus procedural synthesis: Low Swell, Mid Surf, High Foam, Tropical Wind, and Spatial Detail
// Off by default. Zero external network assets. Fully reactive to island chapters and concierge focus.

export type IslandSoundZone =
  | 'arrival'
  | 'stay'
  | 'morning'
  | 'dive'
  | 'wellness'
  | 'sunset'
  | 'dinner'
  | 'dining'
  | 'spa'
  | 'experiences'
  | 'night'
  | 'ocean'
  | 'villa';

export type SoundscapeZone = IslandSoundZone;

class IslandSoundscapeMixer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isDucked = false;

  // Audio Buses
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private oceanBus: GainNode | null = null;
  private windBus: GainNode | null = null;
  private detailBus: GainNode | null = null;

  // Ocean Nodes
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private waveLfo: OscillatorNode | null = null;
  private waveLfoGain: GainNode | null = null;
  private swellOsc: OscillatorNode | null = null;
  private swellFilter: BiquadFilterNode | null = null;
  private swellGain: GainNode | null = null;
  private foamFilter: BiquadFilterNode | null = null;
  private foamGain: GainNode | null = null;

  // Wind Nodes
  private windOsc: OscillatorNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;

  private currentZone: IslandSoundZone = 'arrival';
  private listeners: Set<(active: boolean) => void> = new Set();

  private init() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    // Suspend/resume on document visibility to conserve CPU
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx || !this.isPlaying) return;
        if (document.hidden) {
          if (this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
        } else {
          if (this.ctx.state === 'suspended' && this.isPlaying) {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  public subscribe(listener: (active: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isPlaying));
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // 1. Master Output Bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.38, now + 2.4);
      this.masterGain.connect(this.ctx.destination);

      // Ducking gain (used when Concierge opens)
      this.duckGain = this.ctx.createGain();
      this.duckGain.gain.setValueAtTime(1.0, now);
      this.duckGain.connect(this.masterGain);

      // Sub-buses
      this.oceanBus = this.ctx.createGain();
      this.oceanBus.gain.setValueAtTime(0.85, now);
      this.oceanBus.connect(this.duckGain);

      this.windBus = this.ctx.createGain();
      this.windBus.gain.setValueAtTime(0.4, now);
      this.windBus.connect(this.duckGain);

      this.detailBus = this.ctx.createGain();
      this.detailBus.gain.setValueAtTime(0.3, now);
      this.detailBus.connect(this.duckGain);

      // 2. High-Fidelity 12-second Pink Noise Wash
      const bufferLength = this.ctx.sampleRate * 12;
      const noiseBuffer = this.ctx.createBuffer(2, bufferLength, this.ctx.sampleRate);
      const left = noiseBuffer.getChannelData(0);
      const right = noiseBuffer.getChannelData(1);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let rb0 = 0, rb1 = 0, rb2 = 0, rb3 = 0, rb4 = 0, rb5 = 0, rb6 = 0;

      for (let i = 0; i < bufferLength; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;

        b0 = 0.99886 * b0 + whiteL * 0.0555179;
        b1 = 0.99332 * b1 + whiteL * 0.0750759;
        b2 = 0.96900 * b2 + whiteL * 0.1538520;
        b3 = 0.86650 * b3 + whiteL * 0.3104856;
        b4 = 0.55000 * b4 + whiteL * 0.5329522;
        b5 = -0.7616 * b5 - whiteL * 0.0168980;
        left[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteL * 0.5362) * 0.045;
        b6 = whiteL * 0.115926;

        rb0 = 0.99886 * rb0 + whiteR * 0.0555179;
        rb1 = 0.99332 * rb1 + whiteR * 0.0750759;
        rb2 = 0.96900 * rb2 + whiteR * 0.1538520;
        rb3 = 0.86650 * rb3 + whiteR * 0.3104856;
        rb4 = 0.55000 * rb4 + whiteR * 0.5329522;
        rb5 = -0.7616 * rb5 - whiteR * 0.0168980;
        right[i] = (rb0 + rb1 + rb2 + rb3 + rb4 + rb5 + rb6 + whiteR * 0.5362) * 0.045;
        rb6 = whiteR * 0.115926;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      // Filter: sweeps smoothly with tidal swell (~0.08Hz, 12.5-second tidal rhythm)
      this.noiseFilter = this.ctx.createBiquadFilter();
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setValueAtTime(420, now);
      this.noiseFilter.Q.setValueAtTime(1.8, now);

      this.waveLfo = this.ctx.createOscillator();
      this.waveLfo.type = 'sine';
      this.waveLfo.frequency.setValueAtTime(0.08, now);
      this.waveLfoGain = this.ctx.createGain();
      this.waveLfoGain.gain.setValueAtTime(260, now);

      this.waveLfo.connect(this.waveLfoGain);
      this.waveLfoGain.connect(this.noiseFilter.frequency);

      // 3. Oceanic Sub-Bass Swell (46Hz warm resonant marine fundamental)
      this.swellOsc = this.ctx.createOscillator();
      this.swellOsc.type = 'sine';
      this.swellOsc.frequency.setValueAtTime(46, now);
      this.swellFilter = this.ctx.createBiquadFilter();
      this.swellFilter.type = 'lowpass';
      this.swellFilter.frequency.setValueAtTime(90, now);
      this.swellGain = this.ctx.createGain();
      this.swellGain.gain.setValueAtTime(0.042, now);

      this.swellOsc.connect(this.swellFilter);
      this.swellFilter.connect(this.swellGain);
      this.swellGain.connect(this.oceanBus);

      // 4. Soft Shoreline Foam Texture (1350Hz bandpass)
      this.foamFilter = this.ctx.createBiquadFilter();
      this.foamFilter.type = 'bandpass';
      this.foamFilter.frequency.setValueAtTime(1350, now);
      this.foamFilter.Q.setValueAtTime(2.0, now);
      this.foamGain = this.ctx.createGain();
      this.foamGain.gain.setValueAtTime(0.018, now);

      // 5. Equatorial Breeze (soft triangle oscillation filtered at 180Hz)
      this.windOsc = this.ctx.createOscillator();
      this.windOsc.type = 'triangle';
      this.windOsc.frequency.setValueAtTime(58, now);
      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'lowpass';
      this.windFilter.frequency.setValueAtTime(180, now);
      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.018, now);

      this.windOsc.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.windBus);

      // Noise connections to buses
      this.noiseSource.connect(this.noiseFilter);
      this.noiseFilter.connect(this.oceanBus);

      this.noiseSource.connect(this.foamFilter);
      this.foamFilter.connect(this.foamGain);
      this.foamGain.connect(this.detailBus);

      // Start sound generation
      this.noiseSource.start(now);
      this.waveLfo.start(now);
      this.swellOsc.start(now);
      this.windOsc.start(now);

      this.isPlaying = true;
      this.applyZone(this.currentZone);
      this.notify();
    } catch (e) {
      console.warn('Audio autoplay or WebAudio initialization restriction', e);
    }
  }

  public setSoundscapeZone(zone: IslandSoundZone) {
    this.currentZone = zone;
    if (this.isPlaying) {
      this.applyZone(zone);
    }
  }

  public setConciergeFocus(active: boolean) {
    this.isDucked = active;
    if (!this.ctx || !this.duckGain) return;
    const now = this.ctx.currentTime;
    // Smooth 1.8s fade down to 0.62 when concierge opens, restoring to 1.0 when closed
    const targetGain = active ? 0.62 : 1.0;
    this.duckGain.gain.cancelScheduledValues(now);
    this.duckGain.gain.linearRampToValueAtTime(targetGain, now + 1.8);
  }

  public playSubtleTexture() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(261.63, now); // Middle C warm tone
      chimeOsc.frequency.exponentialRampToValueAtTime(523.25, now + 1.4);

      chimeGain.gain.setValueAtTime(0.0001, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.018, now + 0.3);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.masterGain);

      chimeOsc.start(now);
      chimeOsc.stop(now + 2.1);
    } catch {
      // Ignore
    }
  }

  private applyZone(zone: IslandSoundZone) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const rampTime = 3.0; // Paced 3-second natural crossfade

    switch (zone) {
      case 'stay':
        // Gentler water under teak stilts, softer surf
        this.noiseFilter?.frequency.linearRampToValueAtTime(320, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.028, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.014, now + rampTime);
        this.windGain?.gain.linearRampToValueAtTime(0.014, now + rampTime);
        break;

      case 'morning':
        // Crisp, clear morning ocean wash
        this.noiseFilter?.frequency.linearRampToValueAtTime(440, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.038, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.022, now + rampTime);
        this.windGain?.gain.linearRampToValueAtTime(0.02, now + rampTime);
        break;

      case 'dive':
        // Deeper marine resonance, reduced high frequencies
        this.noiseFilter?.frequency.linearRampToValueAtTime(220, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.05, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.004, now + rampTime);
        break;

      case 'wellness':
        // Stillness, breathing breeze, minimal high frequency
        this.noiseFilter?.frequency.linearRampToValueAtTime(240, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.018, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.006, now + rampTime);
        this.windGain?.gain.linearRampToValueAtTime(0.024, now + rampTime);
        break;

      case 'sunset':
        // Calming tidal rhythm, warm wind
        this.noiseFilter?.frequency.linearRampToValueAtTime(360, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.035, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.012, now + rampTime);
        this.windGain?.gain.linearRampToValueAtTime(0.016, now + rampTime);
        break;

      case 'dinner':
        // Intimate whisper bed
        this.noiseFilter?.frequency.linearRampToValueAtTime(280, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.022, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.008, now + rampTime);
        break;

      case 'night':
        // Deep nocturnal ocean murmur under stars
        this.noiseFilter?.frequency.linearRampToValueAtTime(260, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.042, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.004, now + rampTime);
        this.windGain?.gain.linearRampToValueAtTime(0.012, now + rampTime);
        break;

      case 'arrival':
      default:
        // Open turquoise lagoon horizon
        this.noiseFilter?.frequency.linearRampToValueAtTime(420, now + rampTime);
        this.swellGain?.gain.linearRampToValueAtTime(0.042, now + rampTime);
        this.foamGain?.gain.linearRampToValueAtTime(0.018, now + rampTime);
        this.windGain?.gain.linearRampToValueAtTime(0.018, now + rampTime);
        break;
    }
  }

  public stop() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    if (this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      } catch {
        // Fallback
      }
    }

    setTimeout(() => {
      try {
        this.noiseSource?.stop();
        this.waveLfo?.stop();
        this.swellOsc?.stop();
        this.windOsc?.stop();

        this.noiseSource?.disconnect();
        this.waveLfo?.disconnect();
        this.swellOsc?.disconnect();
        this.windOsc?.disconnect();
      } catch {
        // No-op
      }
      this.isPlaying = false;
      this.notify();
    }, 1900);
  }

  public getActive(): boolean {
    return this.isPlaying;
  }
}

export const oceanAudio = new IslandSoundscapeMixer();
