import { Camera, E_MIN } from '../core/camera';
import { smoothstep } from '../core/math';
import { TOUR_STOPS, type TourStop } from './stops';

const E_HOME = E_MIN + 0.2;
/** 인트로가 시작하는 먼 지점 (태양계 바깥쯤에서 지구로 당겨온다) */
const E_INTRO_FAR = 13.5;
const INTRO_DUR = 5.0;
/** 내레이션이 끝난 뒤 다음 천체로 넘어가기 전 여운 (초) */
const POST_ROLL = 2.6;
/** 내레이션이 없거나 즉시 실패해도 최소한 머무는 시간 */
const MIN_DWELL = 7;
/** 오디오가 끝 이벤트를 안 줘도 강제로 넘기는 상한 */
const MAX_DWELL = 26;

type Phase = 'await' | 'intro' | 'stop' | 'paused' | 'ended';

/**
 * 시네마틱 투어 — 천체를 하나씩 화면 가득 보여주며(이름·사실) 우주의 끝까지 안내.
 * 전환은 시간이 아니라 **내레이션 종료 + 여운**으로 트리거된다.
 * 사용자가 줌/드래그/탭하면 자유 탐험으로 양보(paused), 명시적 '계속'으로 이어 듣는다.
 */
export class CinematicTour {
  private phase: Phase = 'await';
  private introT = 0;
  private idx = -1;
  private dwell = 0;
  /** 현재 챕터 내레이션이 끝났는지 */
  private narrationDone = false;
  private postRoll = 0;
  private released = false;

  /** 천체 진입 시 (자막·내레이션 트리거) */
  onStop: ((stop: TourStop) => void) | null = null;
  onEnd: (() => void) | null = null;
  /** 일시정지/재생 상태 변화 (UI 갱신용) */
  onPauseChange: ((paused: boolean) => void) | null = null;

  get index(): number {
    return this.idx;
  }
  get total(): number {
    return TOUR_STOPS.length;
  }
  get isPaused(): boolean {
    return this.phase === 'paused';
  }
  get inIntro(): boolean {
    return this.phase === 'intro';
  }

  beginIntro(camera: Camera): void {
    this.phase = 'intro';
    this.introT = 0;
    camera.e = camera.eTarget = E_INTRO_FAR;
  }

  /** "여행 시작" — 첫 천체부터 투어 시작 */
  release(camera: Camera): void {
    if (this.phase === 'intro') camera.e = camera.eTarget = E_HOME;
    this.released = true;
    this.goToStop(0, camera);
  }

  reset(camera: Camera): void {
    this.released = true;
    camera.releaseLock();
    this.goToStop(0, camera);
  }

  /** 내레이션이 끝났음을 투어에 알림 (narrator.onNarrationEnd 구독) */
  notifyNarrationEnd(): void {
    this.narrationDone = true;
  }

  /** 사용자 입력 — 투어 일시정지, 자유 탐험에 양보 */
  notifyInput(camera: Camera): void {
    if (this.phase === 'intro' || !this.released) return;
    if (this.phase !== 'paused') {
      this.phase = 'paused';
      camera.releaseLock();
      this.onPauseChange?.(true);
    }
  }

  /** '계속 듣기' — 현재 챕터를 다시 프레이밍하고 이어서 진행 */
  resume(camera: Camera): void {
    if (!this.released) return;
    this.phase = 'stop';
    const stop = TOUR_STOPS[this.idx];
    camera.frameBody(stop.pos, stop.e);
    this.onPauseChange?.(false);
    // 이미 들은 챕터면 곧 다음으로, 아니면 남은 내레이션을 마저
    if (this.narrationDone) {
      this.dwell = MIN_DWELL;
      this.postRoll = POST_ROLL;
    }
  }

  /** 챕터 점프 (‹ ›) */
  go(delta: number, camera: Camera): void {
    if (!this.released) return;
    const next = Math.min(Math.max(this.idx + delta, 0), TOUR_STOPS.length - 1);
    this.goToStop(next, camera);
    this.onPauseChange?.(false);
  }

  private goToStop(i: number, camera: Camera): void {
    this.idx = i;
    this.dwell = 0;
    this.postRoll = 0;
    this.narrationDone = false;
    this.phase = 'stop';
    const stop = TOUR_STOPS[i];
    camera.frameBody(stop.pos, stop.e);
    this.onStop?.(stop);
  }

  private advance(camera: Camera): void {
    if (this.idx < TOUR_STOPS.length - 1) {
      this.goToStop(this.idx + 1, camera);
    } else {
      this.phase = 'ended';
      this.onEnd?.();
    }
  }

  update(dt: number, camera: Camera): void {
    if (this.phase === 'intro') {
      this.introT += dt;
      const k = smoothstep(0, 1, Math.min(this.introT / INTRO_DUR, 1));
      camera.e = camera.eTarget = E_INTRO_FAR + (E_HOME - E_INTRO_FAR) * k;
      if (this.introT >= INTRO_DUR) this.phase = 'await';
      return;
    }

    if (this.phase !== 'stop') return; // await / paused / ended → 정지

    this.dwell += dt;

    // 전환 조건: (내레이션 끝났고 최소 체류 지남) 또는 안전 상한 도달
    const ready = this.narrationDone && this.dwell >= MIN_DWELL;
    if (ready || this.dwell >= MAX_DWELL) {
      this.postRoll += dt;
      if (this.postRoll >= POST_ROLL) this.advance(camera);
    }
  }
}
