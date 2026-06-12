/**
 * Web Speech API 기반 한국어 내레이터.
 *
 * 브라우저 제약 대응:
 * - 사용자 제스처 전 발화 불가 → unlock()에서 무음 utterance로 워밍업
 * - getVoices() 비동기 로딩 → voiceschanged 구독 + speak 시점 lazy 재확인
 * - 빠른 줌 → 큐 없이 "마지막 구간 하나만": cancel 후 600ms 디바운스
 */
export class Narrator {
  enabled = true;
  unlocked = false;

  private voice: SpeechSynthesisVoice | null = null;
  private timer: number | null = null;
  /** 요청 세대 — 재시도 워치독이 낡은 텍스트를 말하지 않도록 */
  private gen = 0;
  private readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  init(): void {
    if (!this.supported) return;
    this.pickVoice();
    speechSynthesis.addEventListener('voiceschanged', () => this.pickVoice());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) speechSynthesis.cancel();
    });
  }

  /** 첫 사용자 제스처에서 호출 — iOS Safari 등에서 음성 엔진 워밍업 */
  unlock(): void {
    if (!this.supported || this.unlocked) return;
    this.unlocked = true;
    const warmup = new SpeechSynthesisUtterance('');
    warmup.volume = 0;
    speechSynthesis.speak(warmup);
  }

  requestNarration(text: string): void {
    if (!this.supported) return;
    this.gen++;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    speechSynthesis.cancel();
    if (!this.enabled || !this.unlocked) return;
    const gen = this.gen;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.speak(text, gen);
    }, 600);
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on && this.supported) {
      this.gen++;
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      speechSynthesis.cancel();
    }
  }

  private pickVoice(): void {
    const voices = speechSynthesis.getVoices();
    this.voice =
      voices.find((v) => v.lang === 'ko-KR' && v.localService) ??
      voices.find((v) => v.lang.startsWith('ko')) ??
      null;
  }

  private speak(text: string, gen: number, isRetry = false): void {
    if (!this.voice) this.pickVoice(); // Chrome: 첫 speak 전까지 voices가 빈 배열인 경우 대비
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    if (this.voice) u.voice = this.voice;
    u.rate = 1.0;
    u.pitch = 1.0;
    let started = false;
    u.onstart = () => {
      started = true;
    };
    speechSynthesis.speak(u);

    // Chrome 결함 대응: 빠른 cancel/speak 반복 뒤 speak가 조용히 무시되는
    // 경우가 있어, 1초 안에 발화가 시작되지 않으면 한 번만 재시도한다.
    if (!isRetry) {
      window.setTimeout(() => {
        if (!started && this.enabled && this.gen === gen) {
          speechSynthesis.cancel();
          this.speak(text, gen, true);
        }
      }, 1000);
    }
  }
}
