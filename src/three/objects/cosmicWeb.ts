import * as THREE from 'three';
import { mulberry32 } from '../../core/math';
import type { Body } from '../../scene/types';
import { PARTICLE_SCALE } from '../stage';
import { AlphaGroup, type WorldObject } from './common';

/** 우주 거대구조 — 은하단 노드 + 필라멘트 (단위 구 반지름 1) */
export function buildCosmicWeb(body: Body): WorldObject {
  const rand = mulberry32(777);
  const root = new THREE.Group();
  const alpha = new AlphaGroup();

  // 은하단 중심들 (3D 구 내부)
  const clusters: THREE.Vector3[] = [];
  for (let i = 0; i < 110; i++) {
    const u = rand() * 2 - 1;
    const ph = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = Math.cbrt(rand());
    clusters.push(new THREE.Vector3(s * Math.cos(ph) * r, u * r * 0.85, s * Math.sin(ph) * r));
  }

  // 노드 주변 은하 산포
  const perCluster = Math.round(130 * PARTICLE_SCALE);
  const total = clusters.length * perCluster;
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const c1 = new THREE.Color('#b9c8ff');
  const c2 = new THREE.Color('#d6b8ff');
  const tmp = new THREE.Color();

  let i = 0;
  for (const c of clusters) {
    const edgeFade = 1 - Math.min(1, c.length()) ** 2 * 0.7;
    for (let k = 0; k < perCluster; k++) {
      const g = () => (rand() + rand() + rand() - 1.5) * 0.055;
      pos[i * 3] = c.x + g();
      pos[i * 3 + 1] = c.y + g();
      pos[i * 3 + 2] = c.z + g();
      tmp.copy(rand() < 0.5 ? c1 : c2);
      const b = (0.25 + rand() * 0.6) * edgeFade;
      col[i * 3] = tmp.r * b;
      col[i * 3 + 1] = tmp.g * b;
      col[i * 3 + 2] = tmp.b * b;
      i++;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pointsMat = alpha.add(
    new THREE.PointsMaterial({
      vertexColors: true,
      size: 1.6,
      sizeAttenuation: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.85,
  );
  root.add(new THREE.Points(geo, pointsMat));

  // 필라멘트 — 가까운 은하단 연결
  const linePts: number[] = [];
  for (let a = 0; a < clusters.length; a++) {
    for (let b = a + 1; b < clusters.length; b++) {
      if (clusters[a].distanceTo(clusters[b]) < 0.3) {
        linePts.push(
          clusters[a].x, clusters[a].y, clusters[a].z,
          clusters[b].x, clusters[b].y, clusters[b].z,
        );
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
  const lineMat = alpha.add(
    new THREE.LineBasicMaterial({
      color: '#8fa8ff',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.14,
  );
  root.add(new THREE.LineSegments(lineGeo, lineMat));

  return {
    body,
    root,
    dot: null,
    setAlpha: (a) => alpha.apply(a),
    animate: (dt) => {
      root.rotation.y += dt * 0.0015;
    },
  };
}
