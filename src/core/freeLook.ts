import * as THREE from 'three';
import type { Camera } from './camera';
import type { Vec3 } from '../scene/types';

const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();

/**
 * 포인터 픽셀 → 포커스 평면 월드 좌표 (정확식).
 * 포커스 평면에서 화면 세로 = 정확히 10^e 미터이므로
 * 픽셀 오프셋 × (미터/픽셀)을 카메라 right/up basis로 전개하면 된다.
 * 씬 (x, y높이, z) = 월드 (x, z, y) 매핑 역변환 포함.
 */
export function pointerToWorld(
  px: number,
  py: number,
  center: Vec3,
  e: number,
  threeCam: THREE.PerspectiveCamera,
  viewW: number,
  viewH: number,
): Vec3 {
  const mpp = Math.pow(10, e) / viewH;
  const dx = px - viewW / 2;
  const dy = py - viewH / 2;
  threeCam.matrixWorld.extractBasis(_right, _up, _fwd);
  return {
    x: center.x + mpp * (dx * _right.x - dy * _up.x),
    y: center.y + mpp * (dx * _right.z - dy * _up.z),
    z: center.z + mpp * (dx * _right.y - dy * _up.y),
  };
}

/**
 * 줌-투-포인터 — 휠/핀치 줌 시 포인터 아래 지점이 화면에 고정되도록
 * 매 프레임 실제 적용된 지수 변화(de)만큼 카메라 중심을 보정한다.
 * (이벤트 시점 일괄 적용은 보간 중 미끄러짐을 만든다)
 */
export class FreeLook {
  private anchorX = 0;
  private anchorY = 0;
  private lastInput = -Infinity;

  /** 휠 이벤트의 포인터 좌표 / 핀치의 두 손가락 중점 */
  onZoomAt(px: number, py: number): void {
    this.anchorX = px;
    this.anchorY = py;
    this.lastInput = performance.now();
  }

  /** 메인 루프에서 stepE와 resolveCenter 사이에 호출 */
  applyZoomAnchor(
    camera: Camera,
    eBefore: number,
    centerBefore: Vec3,
    threeCam: THREE.PerspectiveCamera,
    viewW: number,
    viewH: number,
  ): void {
    if (this.lastInput === -Infinity) return;
    const idle = performance.now() - this.lastInput > 300;
    const settled = Math.abs(camera.e - camera.eTarget) <= 0.01;
    if (idle && settled) {
      this.lastInput = -Infinity;
      return;
    }
    const de = camera.e - eBefore;
    if (de === 0) return;

    const w = pointerToWorld(this.anchorX, this.anchorY, centerBefore, eBefore, threeCam, viewW, viewH);
    const ratio = 1 - Math.pow(10, de);
    camera.nudgeUserCenter(
      {
        x: centerBefore.x + ratio * (w.x - centerBefore.x),
        y: centerBefore.y + ratio * (w.y - centerBefore.y),
        z: centerBefore.z + ratio * (w.z - centerBefore.z),
      },
      de < 0,
    );
  }
}
