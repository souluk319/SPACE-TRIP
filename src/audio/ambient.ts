/**
 * 절차적 앰비언트 우주 패드 (WebAudio, 에셋 0).
 * 디튠된 저음 오실레이터 다층 + 느린 LFO + lowpass + 절차적 리버브.
 * 줌 깊이(e)에 따라 필터 컷오프/음정을 아주 천천히 이동시켜 "더 깊은 우주" 감각.
 * 사용자 제스처 이후에만 소리가 난다(AudioContext suspended → resume).
 */
class Ambient {
  enabled = true;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private started = false;
  private targetCutoff = 700;

  /** 첫 제스처 이후 호출 — 패드 시작 */
  start(): void {
    if (this.started || !this.enabled) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.started = true;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 6); // 천천히 페이드인

    const reverb = ctx.createConvolver();
    reverb.buffer = this.makeImpulse(ctx, 3.6, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.5;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.targetCutoff;
    filter.Q.value = 0.7;
    this.filter = filter;

    // 디튠 보이스 (A1 루트 + 5도 + 옥타브 + 약한 고음 패드)
    const freqs = [55, 82.4, 110, 164.8];
    const gains = [0.5, 0.32, 0.28, 0.12];
    freqs.forEach((f, i) => {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = i === 3 ? 'triangle' : 'sawtooth';
        osc.frequency.value = f;
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.value = gains[i] / 2;
        osc.connect(g).connect(filter);
        osc.start();
      }
    });

    // 느린 트레몰로 LFO (게인 흔들기)
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    const trem = ctx.createGain();
    trem.gain.value = 1;
    lfo.connect(lfoGain).connect(trem.gain);
    lfo.start();

    filter.connect(trem);
    trem.connect(master); // dry
    trem.connect(reverb);
    reverb.connect(wet).connect(master);
    master.connect(ctx.destination);
    this.master = master;
  }

  /** 줌 지수 → 필터 컷오프 (가까울수록 밝게, 멀수록 어둡고 깊게) */
  setDepth(e: number): void {
    if (!this.ctx || !this.filter) return;
    // e 7(지구)~27(우주): 컷오프 900Hz → 320Hz
    const t = Math.min(Math.max((e - 7) / 20, 0), 1);
    const cutoff = 900 - t * 580;
    this.filter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 1.5);
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!this.master || !this.ctx) {
      if (on) this.start();
      return;
    }
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(on ? 0.16 : 0, now, 0.6);
  }

  private makeImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }
}

export const ambient = new Ambient();
