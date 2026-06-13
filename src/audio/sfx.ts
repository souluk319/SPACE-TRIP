/**
 * WebAudio 합성 효과음 — 파일 0개.
 * 짧고 부드러운 신호음만: 발견 pop / 정답 아르페지오 / 오답 low boop /
 * 스테이지 전환 swell / 배지 sparkle. 사용자 제스처 전에는 재생되지 않는다
 * (AudioContext가 suspended 상태로 시작 → resume는 제스처 이후에만 성공).
 */
class Sfx {
  enabled = true;
  private ctx: AudioContext | null = null;

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** freq에서 시작해 (옵션) freqEnd로 미끄러지는 단일 톤 */
  private tone(
    freq: number,
    startIn: number,
    dur: number,
    opts: { type?: OscillatorType; gain?: number; freqEnd?: number } = {},
  ): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + startIn;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t0 + dur);
    const peak = opts.gain ?? 0.15;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /** 타깃 발견 — 경쾌한 pop 두 번 */
  found(): void {
    this.tone(660, 0, 0.12, { type: 'triangle', gain: 0.18 });
    this.tone(990, 0.09, 0.16, { type: 'triangle', gain: 0.16 });
  }

  /** 정답 — 상승 아르페지오 (C-E-G) */
  correct(): void {
    this.tone(523, 0, 0.18, { type: 'triangle', gain: 0.16 });
    this.tone(659, 0.1, 0.18, { type: 'triangle', gain: 0.16 });
    this.tone(784, 0.2, 0.3, { type: 'triangle', gain: 0.18 });
  }

  /** 오답 — 부드러운 low boop (벌칙 느낌 없이) */
  wrong(): void {
    this.tone(220, 0, 0.25, { type: 'sine', gain: 0.13, freqEnd: 180 });
  }

  /** 스테이지 전환 — 낮게 차오르는 swell */
  transition(): void {
    this.tone(180, 0, 0.55, { type: 'sine', gain: 0.1, freqEnd: 420 });
    this.tone(360, 0.1, 0.5, { type: 'sine', gain: 0.06, freqEnd: 840 });
  }

  /** 배지 획득 — sparkle */
  badge(): void {
    this.tone(880, 0, 0.14, { type: 'triangle', gain: 0.14 });
    this.tone(1175, 0.09, 0.14, { type: 'triangle', gain: 0.13 });
    this.tone(1568, 0.18, 0.32, { type: 'triangle', gain: 0.15 });
  }
}

export const sfx = new Sfx();
