import * as THREE from 'three';
import { smoothstep } from '../core/math';
import type { Camera } from '../core/camera';
import type { Body, PainterId } from '../scene/types';
import { BODIES } from '../scene/bodies';
import { VIEW_UNITS } from './stage';
import type { LabelLayer } from './labels';
import type { Builder, WorldObject } from './objects/common';
import { buildEarth } from './objects/earth';
import { buildSun } from './objects/sun';
import { buildPlanet } from './objects/planets';
import {
  buildBeltRing,
  buildMarker,
  buildOortShell,
  buildOrbit,
  buildStarDot,
} from './objects/simple';
import { buildMilkyWay } from './objects/galaxy';
import { buildGalaxy } from './objects/localGroup';
import { buildCosmicWeb } from './objects/cosmicWeb';

const BUILDERS: Record<PainterId, Builder> = {
  earth: buildEarth,
  moon: buildPlanet,
  sun: buildSun,
  rockyPlanet: buildPlanet,
  gasGiant: buildPlanet,
  orbit: buildOrbit,
  beltRing: buildBeltRing,
  oortShell: buildOortShell,
  starDot: buildStarDot,
  marker: buildMarker,
  milkyWay: buildMilkyWay,
  galaxy: buildGalaxy,
  cosmicWeb: buildCosmicWeb,
};

/** 글로우 텍스처에서 밝은 코어가 차지하는 비율 보정 (코어 ≈ 요청 픽셀 크기가 되도록) */
const GLOW_MULT = 3.5;

/** 가시 지수 구간 경계 페이드 (v1 공식 그대로) */
function lodAlpha(b: Body, e: number): number {
  return smoothstep(b.minE, b.minE + 0.3, e) * (1 - smoothstep(b.maxE - 0.5, b.maxE, e));
}

interface Entry extends WorldObject {
  warmed: boolean;
}

/**
 * 부동 원점 + 매 프레임 재스케일.
 * 씬 1유닛 = 10^e/VIEW_UNITS 미터. 모든 천체는 단위 반지름으로 만들어져
 * float64 좌표 차이를 씬 유닛으로 환산해 배치된다 — GPU float32 정밀도 안전.
 */
export class World {
  private objects: Entry[] = [];
  private labelVec = new THREE.Vector3();
  private tracked = new Set<string>();
  /** 미션 타깃용 — 추적 중인 천체의 화면 좌표 (매 프레임 갱신) */
  readonly trackedPos = new Map<string, { x: number; y: number; visible: boolean }>();

  setTracked(ids: string[]): void {
    this.tracked = new Set(ids);
    this.trackedPos.clear();
  }

  /**
   * 탭-투-포커스 히트테스트 — 탭 시점에 1회만 라벨 보유 + 현재 가시 천체를
   * 투영해 탭 픽셀 근처(터치 타깃 최소 28px) 최근접 천체를 찾는다.
   */
  pickAt(
    px: number,
    py: number,
    e: number,
    center: { x: number; y: number; z: number },
    threeCam: THREE.PerspectiveCamera,
    viewW: number,
    viewH: number,
  ): Body | null {
    const m2u = VIEW_UNITS / Math.pow(10, e);
    const unitsPerPx = VIEW_UNITS / viewH;
    let best: Body | null = null;
    let bestDist = Infinity;

    for (const obj of this.objects) {
      const b = obj.body;
      if (!b.label) continue;
      if (lodAlpha(b, e) <= 0.3) continue;
      this.labelVec
        .set((b.pos.x - center.x) * m2u, (b.pos.z - center.z) * m2u, (b.pos.y - center.y) * m2u)
        .project(threeCam);
      if (this.labelVec.z > 1 || this.labelVec.z < -1) continue;
      const sx = ((this.labelVec.x + 1) / 2) * viewW;
      const sy = (1 - (this.labelVec.y + 1) / 2) * viewH;
      const pxRad = (b.radius * m2u) / unitsPerPx;
      const r = Math.max(pxRad * 1.2, 28);
      const d = Math.hypot(px - sx, py - sy);
      if (d < r && d < bestDist) {
        best = b;
        bestDist = d;
      }
    }
    return best;
  }

  constructor(scene: THREE.Scene) {
    for (const body of BODIES) {
      const obj = BUILDERS[body.painter](body);
      if (obj.root) {
        obj.root.visible = false;
        scene.add(obj.root);
      }
      if (obj.dot) scene.add(obj.dot);
      this.objects.push({ ...obj, warmed: false });
    }
  }

  update(
    dt: number,
    camera: Camera,
    threeCam: THREE.PerspectiveCamera,
    labels: LabelLayer,
    viewW: number,
    viewH: number,
  ): void {
    const e = camera.e;
    const c = camera.center;
    const m2u = VIEW_UNITS / Math.pow(10, e);
    const unitsPerPx = VIEW_UNITS / viewH;

    for (const obj of this.objects) {
      const b = obj.body;

      if (!obj.warmed && obj.warm && e > b.minE - 0.5) {
        obj.warmed = true;
        obj.warm();
      }

      const a = lodAlpha(b, e);
      // 월드(x/y 황도면, z 높이) → 씬(x, y=높이, z=황도면 y)
      const sx = (b.pos.x - c.x) * m2u;
      const sy = (b.pos.z - c.z) * m2u;
      const sz = (b.pos.y - c.y) * m2u;
      const s = b.radius * m2u;
      const dist = Math.sqrt(sx * sx + sy * sy + sz * sz);
      const hidden = a <= 0.01 || dist - s > 6e4;
      const pxRad = s / unitsPerPx;
      const meshT = obj.root ? (obj.dot ? smoothstep(3, 6, pxRad) : 1) : 0;

      if (obj.root) {
        const meshAlpha = a * meshT;
        const vis = !hidden && meshAlpha > 0.01 && s > 1e-4 && s < 8e4;
        obj.root.visible = vis;
        if (vis) {
          obj.root.position.set(sx, sy, sz);
          obj.root.scale.setScalar(s);
          obj.setAlpha(meshAlpha);
          obj.animate?.(dt);
        }
      }

      if (obj.dot) {
        const dotAlpha = obj.root ? a * (1 - meshT) : a;
        const vis = !hidden && dotAlpha > 0.01;
        obj.dot.visible = vis;
        if (vis) {
          obj.dot.position.set(sx, sy, sz);
          const px = Math.max(pxRad, b.minPixelRadius ?? 1);
          const sc = px * unitsPerPx * GLOW_MULT;
          obj.dot.scale.set(sc, sc, 1);
          (obj.dot.material as THREE.SpriteMaterial).opacity = dotAlpha * 0.9;
        }
      }

      if (this.tracked.has(b.id)) {
        this.labelVec.set(sx, sy, sz).project(threeCam);
        const onScreen = this.labelVec.z <= 1 && this.labelVec.z >= -1;
        this.trackedPos.set(b.id, {
          x: ((this.labelVec.x + 1) / 2) * viewW,
          y: (1 - (this.labelVec.y + 1) / 2) * viewH,
          visible: !hidden && onScreen,
        });
      }

      if (b.label && !hidden && a > 0.4 && pxRad < 240) {
        const dispPx = Math.max(pxRad, obj.dot ? (b.minPixelRadius ?? 1) * 2.2 : 0);
        const la = a * smoothstep(2.2, 4, dispPx);
        if (la > 0.05) {
          labels.request(
            b.id,
            b.label,
            this.labelVec.set(sx, sy, sz),
            la,
            Math.min(Math.max(pxRad, 4), 60) + 14,
          );
        }
      }
    }

    labels.commit(threeCam, viewW, viewH);
  }
}
