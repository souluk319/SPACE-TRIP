import * as THREE from 'three';
import type { Body } from '../../scene/types';
import { getGlowTexture } from '../textures';

/** 단위 구 지오메트리 공유 (반지름 1 — 스케일은 World가 관리) */
export const SPHERE = new THREE.SphereGeometry(1, 48, 24);
export const SPHERE_HI = new THREE.SphereGeometry(1, 64, 32);

/** 페이드 대상 머티리얼 묶음 — base 불투명도 × LOD alpha */
export class AlphaGroup {
  private entries: Array<{ m: THREE.Material & { opacity: number }; base: number }> = [];

  add<T extends THREE.Material & { opacity: number }>(m: T, base = 1): T {
    m.transparent = true;
    this.entries.push({ m, base });
    return m;
  }

  apply(a: number): void {
    for (const e of this.entries) e.m.opacity = e.base * a;
  }
}

/** 원거리 점광 스프라이트 (additive 글로우) */
export function makeDot(color: string): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map: getGlowTexture(),
    color,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.visible = false;
  return sprite;
}

export interface WorldObject {
  body: Body;
  /** 단위 반지름(=body.radius) 기준으로 만들어진 루트. 위치/스케일/가시성은 World가 관리 */
  root: THREE.Object3D | null;
  /** 원거리 점 표시 (선택) — 픽셀 크기·불투명도는 World가 관리 */
  dot: THREE.Sprite | null;
  setAlpha(a: number): void;
  animate?(dt: number): void;
  /** 텍스처 lazy 로딩 트리거 (가시화 0.5자릿수 전 1회) */
  warm?(): void;
}

export type Builder = (body: Body) => WorldObject;
