import * as THREE from 'three';
import { clamp } from '../core/math';
import { CAM_DIST } from './stage';

const EL_MAX = 1.4; // ±80°

const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _target = new THREE.Vector3();

/**
 * 커스텀 궤도 리그 — 카메라가 원점을 중심으로 구면 궤도를 돈다.
 * 줌은 e-시스템(세상 재스케일)이 담당하므로 dolly 없음.
 * panX/panY: 포커스 천체를 화면에서 옆으로/위로 비키는 스크린 오프셋(씬 유닛).
 */
export class OrbitRig {
  private az = -0.45;
  private el = 0.34;
  private azT = this.az;
  private elT = this.el;
  private azVel = 0;
  private elVel = 0;
  private idle = 99;
  private panXT = 0;
  private panYT = 0;
  private panX = 0;
  private panY = 0;

  /** 포커스 천체를 화면에서 비키는 오프셋 (씬 유닛, +X=오른쪽 / +Y=위) */
  setPan(x: number, y: number): void {
    this.panXT = x;
    this.panYT = y;
  }

  rotateBy(dAz: number, dEl: number): void {
    this.azT += dAz;
    this.elT = clamp(this.elT + dEl, -EL_MAX, EL_MAX);
    this.idle = 0;
  }

  /** 드래그 릴리즈 관성 */
  fling(vAz: number, vEl: number): void {
    this.azVel = clamp(vAz, -2.5, 2.5);
    this.elVel = clamp(vEl, -2.5, 2.5);
    this.idle = 0;
  }

  update(dt: number, camera: THREE.PerspectiveCamera): void {
    this.idle += dt;

    // 관성 감쇠
    if (Math.abs(this.azVel) > 1e-4 || Math.abs(this.elVel) > 1e-4) {
      this.azT += this.azVel * dt;
      this.elT = clamp(this.elT + this.elVel * dt, -EL_MAX, EL_MAX);
      const decay = Math.exp(-dt * 3);
      this.azVel *= decay;
      this.elVel *= decay;
    }

    // 입력 없을 때 천천히 도는 자동 연출
    if (this.idle > 4) this.azT += 0.0045 * dt * 60 * 0.016;

    const k = 1 - Math.exp(-dt * 8);
    this.az += (this.azT - this.az) * k;
    this.el += (this.elT - this.el) * k;

    camera.position.set(
      CAM_DIST * Math.cos(this.el) * Math.sin(this.az),
      CAM_DIST * Math.sin(this.el),
      CAM_DIST * Math.cos(this.el) * Math.cos(this.az),
    );
    camera.lookAt(0, 0, 0);

    // 패널 오프셋 — 카메라 right/up을 따라 시선을 살짝 틀어 천체를 비킨다
    const pk = 1 - Math.exp(-dt * 6);
    this.panX += (this.panXT - this.panX) * pk;
    this.panY += (this.panYT - this.panY) * pk;
    if (Math.abs(this.panX) > 0.02 || Math.abs(this.panY) > 0.02) {
      _right.setFromMatrixColumn(camera.matrix, 0);
      _up.setFromMatrixColumn(camera.matrix, 1);
      _target.copy(_right).multiplyScalar(-this.panX).addScaledVector(_up, -this.panY);
      camera.lookAt(_target);
    }
  }
}
