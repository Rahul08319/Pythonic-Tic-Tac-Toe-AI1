
class SoundEngine {
  private ctx: AudioContext | null = null;
  public volumeMultiplier: number = 1.0;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      const finalVolume = volume * this.volumeMultiplier;
      gain.gain.setValueAtTime(finalVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API warning:", e);
    }
  }

  playClick() {
    this.playTone(1200, 'sine', 0.05, 0.08);
  }

  playMove() {
    this.playTone(880, 'sine', 0.08, 0.1);
  }

  playAiMove() {
    this.playTone(440, 'triangle', 0.12, 0.08);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.06, 0.06), 40);
  }

  playWin() {
    this.playTone(523.25, 'sine', 0.2, 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.1), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.1), 200);
    setTimeout(() => this.playTone(1046.50, 'sine', 0.4, 0.12), 300);
  }

  playDraw() {
    this.playTone(293.66, 'triangle', 0.3, 0.12);
    setTimeout(() => this.playTone(277.18, 'triangle', 0.3, 0.1), 150);
    setTimeout(() => this.playTone(220.00, 'triangle', 0.5, 0.08), 300);
  }

  playModeSwitch() {
    this.playTone(587.33, 'sine', 0.1, 0.06);
    setTimeout(() => this.playTone(880.00, 'sine', 0.15, 0.06), 60);
  }

  playDifficultySelect() {
    this.playTone(1046.50, 'sine', 0.08, 0.05);
  }
}

export const sounds = new SoundEngine();
