
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
  }

  playMove() {
    this.playTone(440, 'sine', 0.1);
  }

  playAiMove() {
    this.playTone(330, 'square', 0.15, 0.05);
  }

  playWin() {
    this.playTone(523.25, 'sine', 0.5);
    setTimeout(() => this.playTone(659.25, 'sine', 0.5), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.8), 200);
  }

  playDraw() {
    this.playTone(220, 'triangle', 0.4);
    setTimeout(() => this.playTone(196, 'triangle', 0.6), 200);
  }

  playModeSwitch() {
    this.playTone(200, 'sine', 0.2, 0.05);
    setTimeout(() => this.playTone(300, 'sine', 0.2, 0.05), 50);
  }

  playDifficultySelect() {
    this.playTone(600, 'sine', 0.1, 0.03);
  }
}

export const sounds = new SoundEngine();
