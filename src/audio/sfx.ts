/**
 * 디자인된 UI 사운드 (WebAudio 합성, 에셋 0).
 * 게임 효과음 대신 차분한 시네마틱 신호음: 챕터 전환 whoosh + soft tick.
 * 사용자 제스처 이후에만 재생.
 */
class Sfx {
  enabled = true;
  private ctx: AudioContext | null = null;
  private reverb: ConvolverNode | null = null;

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      const rate = this.ctx.sampleRate;
      const len = Math.floor(rate * 1.4);
      const buf = this.ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
      this.reverb = this.ctx.createConvolver();
      this.reverb.buffer = buf;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** 챕터 전환 — 필터드 노이즈 스윕 whoosh */
  transition(): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const dur = 1.1;
    const len = Math.floor(ctx.sampleRate * dur);
    const noise = ctx.createBufferSource();
    const nb = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noise.buffer = nb;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(280, t0);
    bp.frequency.exponentialRampToValueAtTime(1400, t0 + dur * 0.5);
    bp.frequency.exponentialRampToValueAtTime(220, t0 + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.09, t0 + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

    noise.connect(bp).connect(g);
    g.connect(ctx.destination);
    if (this.reverb) {
      const wet = ctx.createGain();
      wet.gain.value = 0.5;
      g.connect(this.reverb).connect(wet).connect(ctx.destination);
    }
    noise.start(t0);
    noise.stop(t0 + dur + 0.05);
  }

  /** 부드러운 reverbed tick (UI 확인음) */
  tick(): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t0);
    osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.07, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    osc.connect(g);
    g.connect(ctx.destination);
    if (this.reverb) {
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      g.connect(this.reverb).connect(wet).connect(ctx.destination);
    }
    osc.start(t0);
    osc.stop(t0 + 0.24);
  }
}

export const sfx = new Sfx();
