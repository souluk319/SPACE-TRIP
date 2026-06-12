import { clamp, lerp, smoothstep } from './math';
import type { Milestone, Vec2 } from '../scene/types';

/** 지구가 화면을 꽉 채우는 수준 */
export const E_MIN = 6.8;
/** 관측 가능한 우주가 들어오는 수준 */
export const E_MAX = 27.2;

/**
 * 로그 스케일 카메라.
 * 단일 진실 소스는 지수 e — 화면 세로 높이가 나타내는 거리 = 10^e 미터.
 */
export class Camera {
  e = E_MIN + 0.2;
  eTarget = this.e;
  center: Vec2 = { x: 0, y: 0 };

  zoomBy(deltaE: number): void {
    this.eTarget = clamp(this.eTarget + deltaE, E_MIN, E_MAX);
  }

  jumpTo(e: number): void {
    this.eTarget = clamp(e, E_MIN, E_MAX);
  }

  update(dt: number, milestones: Milestone[]): void {
    // 프레임레이트 무관 지수 감쇠 + 점프 시 초당 2.5자릿수 속도 클램프
    const k = 1 - Math.exp(-dt * 6);
    let step = (this.eTarget - this.e) * k;
    const maxStep = 2.5 * dt;
    if (step > maxStep) step = maxStep;
    else if (step < -maxStep) step = -maxStep;
    this.e += step;
    this.center = centerForE(this.e, milestones);
  }

  metersPerPixel(canvasHeightPx: number): number {
    return Math.pow(10, this.e) / canvasHeightPx;
  }
}

/**
 * milestone focus 앵커들을 구간 경계 직전 0.6자릿수 동안 smoothstep으로 보간.
 * 줌아웃 중 다음 구조가 자연스럽게 화면 중앙으로 온다.
 */
export function centerForE(e: number, milestones: Milestone[]): Vec2 {
  let cx = milestones[0].focus.x;
  let cy = milestones[0].focus.y;
  for (let i = 1; i < milestones.length; i++) {
    const t = smoothstep(milestones[i].enterE - 0.6, milestones[i].enterE, e);
    if (t <= 0) break;
    cx = lerp(cx, milestones[i].focus.x, t);
    cy = lerp(cy, milestones[i].focus.y, t);
  }
  return { x: cx, y: cy };
}
