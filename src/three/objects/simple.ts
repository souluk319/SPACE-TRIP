import * as THREE from 'three';
import { mulberry32 } from '../../core/math';
import type { Body } from '../../scene/types';
import { PARTICLE_SCALE } from '../stage';
import { AlphaGroup, makeDot, type WorldObject } from './common';

/* ── 궤도 라인 (단위 원, XZ 평면) ── */

let orbitGeo: THREE.BufferGeometry | null = null;

export function buildOrbit(body: Body): WorldObject {
  if (!orbitGeo) {
    const pts: number[] = [];
    for (let i = 0; i < 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(Math.cos(a), 0, Math.sin(a));
    }
    orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  }
  const alpha = new AlphaGroup();
  const mat = alpha.add(
    new THREE.LineBasicMaterial({ color: '#a8c0ff', depthWrite: false }),
    0.3,
  );
  const line = new THREE.LineLoop(orbitGeo, mat);
  return { body, root: line, dot: null, setAlpha: (a) => alpha.apply(a) };
}

/* ── 별/마커 — 점광 전용 ── */

export function buildStarDot(body: Body): WorldObject {
  const color = String(body.params?.color ?? '#ffd34d');
  return { body, root: null, dot: makeDot(color), setAlpha: () => {} };
}

export function buildMarker(body: Body): WorldObject {
  return { body, root: null, dot: makeDot('#ffd34d'), setAlpha: () => {} };
}

/* ── 카이퍼대 (도넛 파티클) ── */

export function buildBeltRing(body: Body): WorldObject {
  const rand = mulberry32(Number(body.params?.seed ?? 7));
  const innerRatio = Number(body.params?.innerRatio ?? 0.6);
  const count = Math.round(3200 * PARTICLE_SCALE);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = innerRatio + (1 - innerRatio) * rand();
    const y = (rand() + rand() + rand() - 1.5) * 0.045;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const alpha = new AlphaGroup();
  const mat = alpha.add(
    new THREE.PointsMaterial({
      color: '#9db4d6',
      size: 1.7,
      sizeAttenuation: false,
      depthWrite: false,
    }),
    0.85,
  );
  return { body, root: new THREE.Points(geo, mat), dot: null, setAlpha: (a) => alpha.apply(a) };
}

/* ── 오르트 구름 (구형 셸 파티클) ── */

export function buildOortShell(body: Body): WorldObject {
  const rand = mulberry32(99);
  const count = Math.round(2600 * PARTICLE_SCALE);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // 균일 구면 방향 + 셸 반경
    const u = rand() * 2 - 1;
    const ph = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = 0.35 + 0.65 * Math.cbrt(rand());
    pos[i * 3] = s * Math.cos(ph) * r;
    pos[i * 3 + 1] = u * r;
    pos[i * 3 + 2] = s * Math.sin(ph) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const alpha = new AlphaGroup();
  const mat = alpha.add(
    new THREE.PointsMaterial({
      color: '#b4c8e6',
      size: 1.4,
      sizeAttenuation: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.55,
  );
  return { body, root: new THREE.Points(geo, mat), dot: null, setAlpha: (a) => alpha.apply(a) };
}
