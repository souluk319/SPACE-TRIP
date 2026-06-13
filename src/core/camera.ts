import { clamp, lerp, smoothstep } from './math';
import type { Milestone, Vec3 } from '../scene/types';

/** 지구가 화면 높이의 ~85%를 차지하는 수준 (원근 카메라 기준 — 더 들어가면 표면 안) */
export const E_MIN = 7.25;
/** 관측 가능한 우주가 들어오는 수준 */
export const E_MAX = 27.2;

/**
 * 로그 스케일 카메라.
 * 단일 진실 소스는 지수 e — 화면 세로 높이가 나타내는 거리 = 10^e 미터.
 *
 * 중심은 기본적으로 milestone focus 앵커 경로(centerForE)를 따르고,
 * 자유 탐험에서 줌-투-포인터/탭-투-포커스가 userCenter로 오버라이드한다.
 * 줌아웃하면 eFocus 기준 smoothstep으로 앵커 경로에 자연 복귀.
 */
export class Camera {
  e = E_MIN + 0.2;
  eTarget = this.e;
  center: Vec3 = { x: 0, y: 0, z: 0 };

  /** 자유 탐험 사용자 포커스 (null = 앵커 경로) */
  private userCenter: Vec3 | null = null;
  private userTarget: Vec3 | null = null;
  /** 포커스 의도가 시작된 시점의 e — 줌아웃 복귀 기준 */
  private eFocus = 0;

  zoomBy(deltaE: number): void {
    this.eTarget = clamp(this.eTarget + deltaE, E_MIN, E_MAX);
  }

  jumpTo(e: number): void {
    this.eTarget = clamp(e, E_MIN, E_MAX);
    this.clearUserFocus();
  }

  /** 탭-투-포커스: 천체로 부드럽게 센터링 */
  focusOn(p: Vec3): void {
    this.userTarget = { ...p };
    if (!this.userCenter) this.userCenter = { ...this.center };
    this.eFocus = this.e;
  }

  /** 줌-투-포인터 보정 — FreeLook이 계산한 새 중심을 즉시 반영 */
  nudgeUserCenter(p: Vec3, isZoomIn: boolean): void {
    const wasNull = this.userCenter === null;
    this.userCenter = { ...p };
    this.userTarget = { ...p };
    if (wasNull) this.eFocus = this.e;
    else if (isZoomIn) this.eFocus = Math.max(this.eFocus, this.e);
  }

  clearUserFocus(): void {
    this.userCenter = null;
    this.userTarget = null;
  }

  get hasUserFocus(): boolean {
    return this.userCenter !== null;
  }

  /** 1단계: 지수 진행 (지수감쇠 + 점프 시 초당 2.5자릿수 클램프) */
  stepE(dt: number): void {
    const k = 1 - Math.exp(-dt * 6);
    let step = (this.eTarget - this.e) * k;
    const maxStep = 2.5 * dt;
    if (step > maxStep) step = maxStep;
    else if (step < -maxStep) step = -maxStep;
    this.e += step;
  }

  /** 2단계: 중심 확정 (앵커 경로 ↔ 사용자 포커스 블렌딩) */
  resolveCenter(dt: number, milestones: Milestone[]): void {
    const anchor = centerForE(this.e, milestones);
    if (!this.userCenter || !this.userTarget) {
      this.center = anchor;
      return;
    }

    // 탭 센터링 이징
    const k = 1 - Math.exp(-dt * 4);
    this.userCenter.x += (this.userTarget.x - this.userCenter.x) * k;
    this.userCenter.y += (this.userTarget.y - this.userCenter.y) * k;
    this.userCenter.z += (this.userTarget.z - this.userCenter.z) * k;

    // 줌아웃 복귀 가중치 — eFocus에서 0.8자릿수 위부터 점진 복귀, 2.3자릿수에서 완전 복귀
    const w = 1 - smoothstep(this.eFocus + 0.8, this.eFocus + 2.3, this.e);
    if (w <= 0.001) {
      this.clearUserFocus();
      this.center = anchor;
      return;
    }
    this.center = {
      x: lerp(anchor.x, this.userCenter.x, w),
      y: lerp(anchor.y, this.userCenter.y, w),
      z: lerp(anchor.z, this.userCenter.z, w),
    };
  }

  update(dt: number, milestones: Milestone[]): void {
    this.stepE(dt);
    this.resolveCenter(dt, milestones);
  }

  metersPerPixel(canvasHeightPx: number): number {
    return Math.pow(10, this.e) / canvasHeightPx;
  }
}

/**
 * milestone focus 앵커들을 구간 경계 직전 0.6자릿수 동안 smoothstep으로 보간.
 * 줌아웃 중 다음 구조가 자연스럽게 화면 중앙으로 온다.
 */
export function centerForE(e: number, milestones: Milestone[]): Vec3 {
  let cx = milestones[0].focus.x;
  let cy = milestones[0].focus.y;
  let cz = milestones[0].focus.z;
  for (let i = 1; i < milestones.length; i++) {
    const t = smoothstep(milestones[i].enterE - 0.6, milestones[i].enterE, e);
    if (t <= 0) break;
    cx = lerp(cx, milestones[i].focus.x, t);
    cy = lerp(cy, milestones[i].focus.y, t);
    cz = lerp(cz, milestones[i].focus.z, t);
  }
  return { x: cx, y: cy, z: cz };
}
