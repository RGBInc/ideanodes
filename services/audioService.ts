
export class AudioService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy init
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(on: boolean) {
    this.enabled = on;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() {
    this.playTone(800, 'sine', 0.1, 0.05);
  }

  playHover() {
    // Very subtle high freq
    if (!this.enabled) return;
    this.playTone(400, 'triangle', 0.05, 0.01);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Arpeggio
    [440, 554, 659].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.05, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }

  playDelete() {
    this.playTone(150, 'sawtooth', 0.2, 0.05);
  }

  playGenerate() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    // Sci-fi scanner sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 1.5);
    
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
  }
}

export const audio = new AudioService();
