import * as THREE from 'three';
import type { Body } from '../../scene/types';
import { getTexture } from '../textures';
import { AlphaGroup, SPHERE, makeDot, type WorldObject } from './common';

/** 토성 고리 — RingGeometry 기본 UV는 고리 띠 텍스처와 안 맞아 반지름 기반으로 재계산 */
function makeRing(texName: string, alpha: AlphaGroup): THREE.Mesh {
  const inner = 1.24;
  const outer = 2.27;
  const geo = new THREE.RingGeometry(inner, outer, 96);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  const mat = alpha.add(
    new THREE.MeshBasicMaterial({
      map: getTexture(texName),
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    0.92,
  );
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function buildPlanet(body: Body): WorldObject {
  const params = body.params ?? {};
  const tint = String(params.tint ?? '#cfd8ff');
  const root = new THREE.Group();
  const alpha = new AlphaGroup();

  const mat = alpha.add(
    new THREE.MeshStandardMaterial({ color: tint, roughness: 1, metalness: 0 }),
  );
  const mesh = new THREE.Mesh(SPHERE, mat);
  root.add(mesh);

  let ring: THREE.Mesh | null = null;
  if (params.ring) {
    // 고리는 warm에서 텍스처와 함께 생성 (PNG 알파 필요)
    root.rotation.z = 0.466; // 토성 자전축 26.7°
  }

  const spin = (Math.PI * 2) / Number(params.spin ?? 120);
  let warmed = false;

  return {
    body,
    root,
    dot: makeDot(tint),
    setAlpha: (a) => alpha.apply(a),
    animate: (dt) => {
      mesh.rotation.y += spin * dt;
    },
    warm: () => {
      if (warmed) return;
      warmed = true;
      if (params.tex) {
        mat.map = getTexture(String(params.tex));
        mat.color.set('#ffffff');
        mat.needsUpdate = true;
      }
      if (params.ring && !ring) {
        ring = makeRing(String(params.ringTex), alpha);
        root.add(ring);
      }
    },
  };
}
