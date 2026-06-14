import { Camera, E_MIN } from '../core/camera';
import { smoothstep } from '../core/math';
import { TOUR_STOPS, type TourStop } from './stops';

const E_HOME = E_MIN + 0.2;
/** 인트로가 시작하는 먼 지점 (태양계 바깥쯤에서 지구로 당겨온다) */
const E_INTRO_FAR = 13.5;
const INTRO_DUR = 5.0;
/** 각 천체에 머무는 시간 (초) */
const DWELL = 9;
/** 사용자 입력 후 투어 재개까지 대기 */
const RESUME_IDLE = 8;

type Phase = 'await' | 'intro' | 'stop' | 'ended';

/**
 * 시네마틱 투어 — 천체를 하나씩 화면 가득 보여주며(이름·사실) 우주의 끝까지 안내.
 * 사용자가 줌/드래그/탭하면 자유 탐험으로 양보, 무입력 idle 후 자동 재개.
 */
export class CinematicTour {
  private phase: Phase = 'await';
  private introT = 0;
  private idx = -1;
  private dwell = 0;
  private idle = 0;
  private paused = false;
  private released = false;
  /** 천체 진입 시 (자막·내레이션 트리거) */
  onStop: ((stop: TourStop) => void) | null = null;
  onEnd: (() => void) | null = null;

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

  /** 사용자 입력 — 투어 일시정지, 자유 탐험에 양보 */
  notifyInput(camera: Camera): void {
    if (this.phase === 'intro') return;
    this.paused = true;
    this.idle = 0;
    camera.releaseLock();
    if (this.phase === 'ended') this.phase = 'stop';
  }

  get inIntro(): boolean {
    return this.phase === 'intro';
  }

  private goToStop(i: number, camera: Camera): void {
    this.idx = i;
    this.dwell = 0;
    this.paused = false;
    this.phase = 'stop';
    const stop = TOUR_STOPS[i];
    camera.frameBody(stop.pos, stop.e);
    this.onStop?.(stop);
  }

  update(dt: number, camera: Camera): void {
    if (this.phase === 'intro') {
      this.introT += dt;
      const k = smoothstep(0, 1, Math.min(this.introT / INTRO_DUR, 1));
      camera.e = camera.eTarget = E_INTRO_FAR + (E_HOME - E_INTRO_FAR) * k;
      if (this.introT >= INTRO_DUR) this.phase = 'await';
      return;
    }

    if (this.phase !== 'stop' || !this.released) return;

    if (this.paused) {
      this.idle += dt;
      if (this.idle >= RESUME_IDLE) this.goToStop(this.idx, camera); // 현재 천체로 복귀
      return;
    }

    this.dwell += dt;
    if (this.dwell >= DWELL) {
      if (this.idx < TOUR_STOPS.length - 1) {
        this.goToStop(this.idx + 1, camera);
      } else {
        this.phase = 'ended';
        this.onEnd?.();
      }
    }
  }
}
