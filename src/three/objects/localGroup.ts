import * as THREE from 'three';
import type { Body } from '../../scene/types';
import { getGalaxySpriteTexture } from '../textures';
import { AlphaGroup, makeDot, type WorldObject } from './common';

let planeGeo: THREE.PlaneGeometry | null = null;

/** 국부은하군 외부 은하 — 절차적 텍스처 평면 (3D 기울기로 입체 배치) */
export function buildGalaxy(body: Body): WorldObject {
  if (!planeGeo) planeGeo = new THREE.PlaneGeometry(2, 2);
  const params = body.params ?? {};
  const type = (params.type === 'elliptical' ? 'elliptical' : 'spiral') as
    | 'spiral'
    | 'elliptical';
  const color = String(params.color ?? '#cdd8ff');

  const alpha = new AlphaGroup();
  const mat = alpha.add(
    new THREE.MeshBasicMaterial({
      map: getGalaxySpriteTexture(type),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    0.95,
  );
  const mesh = new THREE.Mesh(planeGeo, mat);
  // 기본 face-up(원반이 황도면) 후 3D 기울기
  mesh.rotation.set(-Math.PI / 2 + Number(params.tiltX ?? 0) * 0.6, 0, Number(params.tiltZ ?? 0));

  return { body, root: mesh, dot: makeDot(color), setAlpha: (a) => alpha.apply(a) };
}
