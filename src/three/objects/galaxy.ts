import * as THREE from 'three';
import { mulberry32 } from '../../core/math';
import type { Body } from '../../scene/types';
import { getCoronaTexture, getGlowTexture } from '../textures';
import { PARTICLE_SCALE } from '../stage';
import { AlphaGroup, makeDot, type WorldObject } from './common';

/** 우리은하 — 로그 나선팔 파티클 디스크 (단위 반지름 1) */
export function buildMilkyWay(body: Body): WorldObject {
  const rand = mulberry32(2026);
  const root = new THREE.Group();
  const alpha = new AlphaGroup();

  const armCount = Math.round(34000 * PARTICLE_SCALE);
  const haloCount = Math.round(5000 * PARTICLE_SCALE);
  const total = armCount + haloCount;
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);

  const cCore = new THREE.Color('#ffe3b4');
  const cArm = new THREE.Color('#9fc0ff');
  const tmp = new THREE.Color();

  for (let i = 0; i < armCount; i++) {
    const arm = i % 4;
    const off = (arm * Math.PI) / 2;
    const t = Math.pow(rand(), 0.62);
    // 로그 나선: r = 0.05 → 1.0
    let r = 0.05 * Math.pow(20, t);
    r *= 1 + (rand() - 0.5) * 0.22;
    const ang = off + t * 4.6 + (rand() - 0.5) * 0.55 * (1 - t * 0.5);
    const thick = 0.028 * (1.7 - t);
    const y = (rand() + rand() + rand() - 1.5) * thick;

    pos[i * 3] = Math.cos(ang) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(ang) * r;

    tmp.copy(cCore).lerp(cArm, Math.min(1, t * 1.35));
    const b = 0.2 + rand() * 0.3;
    col[i * 3] = tmp.r * b;
    col[i * 3 + 1] = tmp.g * b;
    col[i * 3 + 2] = tmp.b * b;
  }

  for (let i = armCount; i < total; i++) {
    // 헤일로/원반 산포
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    const y = (rand() + rand() + rand() - 1.5) * 0.05 * (1.4 - r);
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r;
    const b = 0.1 + rand() * 0.18;
    tmp.copy(cArm);
    col[i * 3] = tmp.r * b;
    col[i * 3 + 1] = tmp.g * b;
    col[i * 3 + 2] = tmp.b * b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = alpha.add(
    new THREE.PointsMaterial({
      vertexColors: true,
      size: 1.5,
      sizeAttenuation: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.75,
  );
  root.add(new THREE.Points(geo, mat));

  // 더스트 레인 — 나선팔 안쪽 가장자리를 따라가는 어두운 입자 (normal 블렌딩이 빛을 가림)
  const dustCount = Math.round(9000 * PARTICLE_SCALE);
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const arm = i % 4;
    const off = (arm * Math.PI) / 2;
    const t = 0.15 + Math.pow(rand(), 0.7) * 0.8;
    let r = 0.05 * Math.pow(20, t);
    r *= 1 + (rand() - 0.5) * 0.1;
    const ang = off + t * 4.6 + 0.22 + (rand() - 0.5) * 0.2;
    dustPos[i * 3] = Math.cos(ang) * r;
    dustPos[i * 3 + 1] = (rand() + rand() - 1) * 0.012;
    dustPos[i * 3 + 2] = Math.sin(ang) * r;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = alpha.add(
    new THREE.PointsMaterial({
      color: '#070510',
      size: 2.2,
      sizeAttenuation: false,
      depthWrite: false,
    }),
    0.4,
  );
  root.add(new THREE.Points(dustGeo, dustMat));

  // HII 영역 — 나선팔의 분홍/푸른 성운 글로우
  const hiiCount = Math.round(46 * Math.max(PARTICLE_SCALE, 0.6));
  for (let i = 0; i < hiiCount; i++) {
    const arm = i % 4;
    const off = (arm * Math.PI) / 2;
    const t = 0.3 + rand() * 0.62;
    const r = 0.05 * Math.pow(20, t) * (1 + (rand() - 0.5) * 0.14);
    const ang = off + t * 4.6 + (rand() - 0.5) * 0.3;
    const hiiMat = alpha.add(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: rand() < 0.55 ? '#ff9ec8' : '#9cc4ff',
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      0.1 + rand() * 0.14,
    );
    const hii = new THREE.Sprite(hiiMat);
    hii.position.set(Math.cos(ang) * r, (rand() - 0.5) * 0.02, Math.sin(ang) * r);
    hii.scale.setScalar(0.03 + rand() * 0.06);
    root.add(hii);
  }

  // 코어 글로우 + 벌지
  const coreMat = alpha.add(
    new THREE.SpriteMaterial({
      map: getCoronaTexture(),
      color: '#ffe6bc',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.5,
  );
  const core = new THREE.Sprite(coreMat);
  core.scale.setScalar(0.42);
  root.add(core);

  const bulgeMat = alpha.add(
    new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: '#fff2da',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.55,
  );
  const bulge = new THREE.Sprite(bulgeMat);
  bulge.scale.setScalar(0.15);
  root.add(bulge);

  return {
    body,
    root,
    dot: makeDot('#ffe2b8'),
    setAlpha: (a) => alpha.apply(a),
    animate: (dt) => {
      root.rotation.y += dt * 0.0035;
    },
  };
}
