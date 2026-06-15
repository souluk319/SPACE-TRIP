import { clamp, lerp, smoothstep } from './math';
import type { Milestone, Vec3 } from '../scene/types';

/**
 * 최소 줌 지수. 작은 천체(달·수성)도 화면을 채울 수 있게 낮춘다.
 * 6.85 = 화면 세로 ~710만 m. 지구(지름 1,270만 m)는 화면을 꽉 채우지만
 * 카메라(CAM_DIST≈107유닛)가 표면 안으로 들어가지 않는 한계선. 달 프레이밍(e6.88)도 통과.
 */
export const E_MIN = 6.85;
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

  /** 자유 탐험 사용자 포커스 (null = 앵커 경로). 지속형 — 줌해도 천체에 머문다 */
  private userCenter: Vec3 | null = null;
  private userTarget: Vec3 | null = null;
  /** 시네마틱 투어가 특정 천체에 고정 (앵커·userFocus 무시) */
  private lockCenter: Vec3 | null = null;
  private lockTarget: Vec3 | null = null;

  /** 투어 — 천체를 화면에 크게 프레이밍 (중심 고정 + 줌) */
  frameBody(pos: Vec3, e: number): void {
    this.lockTarget = { ...pos };
    if (!this.lockCenter) this.lockCenter = { ...this.center };
    this.eTarget = clamp(e, E_MIN, E_MAX);
  }

  releaseLock(): void {
    this.lockCenter = null;
    this.lockTarget = null;
  }

  zoomBy(deltaE: number): void {
    this.eTarget = clamp(this.eTarget + deltaE, E_MIN, E_MAX);
  }

  jumpTo(e: number): void {
    this.eTarget = clamp(e, E_MIN, E_MAX);
    this.clearUserFocus();
    this.releaseLock();
  }

  /** 탭-투-포커스 / 목적지 선택: 천체로 부드럽게 센터링 (지속) */
  focusOn(p: Vec3): void {
    this.userTarget = { ...p };
    if (!this.userCenter) this.userCenter = { ...this.center };
  }

  /** 현재 중심에서 자유 탐험 시작 (앵커로 튀지 않게 시드) */
  beginExploreFromCurrent(): void {
    if (!this.userCenter) {
      this.userCenter = { ...this.center };
      this.userTarget = { ...this.center };
    }
  }

  /** 줌-투-포인터 보정 — FreeLook이 계산한 새 중심을 즉시 반영 */
  nudgeUserCenter(p: Vec3, _isZoomIn: boolean): void {
    this.userCenter = { ...p };
    this.userTarget = { ...p };
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

  /** 2단계: 중심 확정 (투어 고정 > 사용자 포커스 > 앵커 경로) */
  resolveCenter(dt: number, milestones: Milestone[]): void {
    // 투어 고정 — 천체에 단단히 센터링 (앵커·userFocus 무시)
    if (this.lockCenter && this.lockTarget) {
      const lk = 1 - Math.exp(-dt * 3.5);
      this.lockCenter.x += (this.lockTarget.x - this.lockCenter.x) * lk;
      this.lockCenter.y += (this.lockTarget.y - this.lockCenter.y) * lk;
      this.lockCenter.z += (this.lockTarget.z - this.lockCenter.z) * lk;
      this.center = { ...this.lockCenter };
      return;
    }

    // 자유 탐험 포커스 — 선택한 천체에 지속적으로 머문다 (줌아웃해도 유지)
    if (this.userCenter && this.userTarget) {
      const k = 1 - Math.exp(-dt * 4);
      this.userCenter.x += (this.userTarget.x - this.userCenter.x) * k;
      this.userCenter.y += (this.userTarget.y - this.userCenter.y) * k;
      this.userCenter.z += (this.userTarget.z - this.userCenter.z) * k;
      this.center = { ...this.userCenter };
      return;
    }

    this.center = centerForE(this.e, milestones);
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
