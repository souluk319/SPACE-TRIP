/**
 * 내레이터 — Supertonic 3(오픈소스 온디바이스 TTS)로 사전 생성한
 * 고품질 음성 파일(/audio/<milestone-id>.m4a)을 재생한다.
 * 파일이 없거나 재생이 막히면 Web Speech API(ko-KR)로 폴백.
 *
 * 정책은 v1과 동일: 큐 없음 — 항상 마지막 구간 하나만.
 * 구간 변경 → 즉시 정지 → 600ms 디바운스 후 재생.
 */
export class Narrator {
  enabled = true;
  unlocked = false;

  private voice: SpeechSynthesisVoice | null = null;
  private timer: number | null = null;
  /** 요청 세대 — 폴백/재시도가 낡은 텍스트를 말하지 않도록 */
  private gen = 0;
  private audioCache = new Map<string, HTMLAudioElement>();
  private current: HTMLAudioElement | null = null;
  private readonly speechSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  init(): void {
    if (this.speechSupported) {
      this.pickVoice();
      speechSynthesis.addEventListener('voiceschanged', () => this.pickVoice());
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopPlayback();
    });
  }

  /** 첫 사용자 제스처에서 호출 — 음성 엔진/오디오 재생 권한 워밍업 */
  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    if (this.speechSupported) {
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      speechSynthesis.speak(warmup);
    }
  }

  /** 내레이션 파일 미리 받기 (시작 버튼 클릭 시 호출) */
  preload(ids: string[]): void {
    for (const id of ids) this.getAudio(id);
  }

  requestNarration(id: string, text: string): void {
    this.gen++;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.stopPlayback();
    if (!this.enabled || !this.unlocked) return;
    const gen = this.gen;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.playFile(id, text, gen);
    }, 600);
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) {
      this.gen++;
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.stopPlayback();
    }
  }

  private stopPlayback(): void {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this.current = null;
    }
    if (this.speechSupported) speechSynthesis.cancel();
  }

  private getAudio(id: string): HTMLAudioElement {
    let a = this.audioCache.get(id);
    if (!a) {
      a = new Audio(`/audio/${id}.m4a`);
      a.preload = 'auto';
      this.audioCache.set(id, a);
    }
    return a;
  }

  private playFile(id: string, text: string, gen: number): void {
    const a = this.getAudio(id);
    a.currentTime = 0;
    this.current = a;
    a.play().catch(() => {
      // 파일 없음/자동재생 차단 → Web Speech 폴백
      if (this.gen === gen && this.enabled) this.speakTTS(text, gen);
    });
  }

  /* ── Web Speech 폴백 (v1 검증 로직 유지) ── */

  private pickVoice(): void {
    const voices = speechSynthesis.getVoices();
    this.voice =
      voices.find((v) => v.lang === 'ko-KR' && v.localService) ??
      voices.find((v) => v.lang.startsWith('ko')) ??
      null;
  }

  private speakTTS(text: string, gen: number, isRetry = false): void {
    if (!this.speechSupported) return;
    if (!this.voice) this.pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    if (this.voice) u.voice = this.voice;
    let started = false;
    u.onstart = () => {
      started = true;
    };
    speechSynthesis.speak(u);

    // Chrome 결함 대응: 빠른 cancel/speak 반복 뒤 speak가 무시되면 1회 재시도
    if (!isRetry) {
      window.setTimeout(() => {
        if (!started && this.enabled && this.gen === gen) {
          speechSynthesis.cancel();
          this.speakTTS(text, gen, true);
        }
      }, 1000);
    }
  }
}
