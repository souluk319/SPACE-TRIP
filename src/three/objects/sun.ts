import * as THREE from 'three';
import type { Body } from '../../scene/types';
import { getCoronaTexture, getStarSpikeTexture, getSunRaysTexture, getTexture } from '../textures';
import { AlphaGroup, SPHERE, makeDot, type WorldObject } from './common';

export function buildSun(body: Body): WorldObject {
  const root = new THREE.Group();
  const alpha = new AlphaGroup();

  const mat = alpha.add(
    new THREE.MeshBasicMaterial({ color: '#ffd95e' }),
  );
  const mesh = new THREE.Mesh(SPHERE, mat);
  root.add(mesh);

  const corona1Mat = alpha.add(
    new THREE.SpriteMaterial({
      map: getCoronaTexture(),
      color: '#ffcf80',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.95,
  );
  const corona1 = new THREE.Sprite(corona1Mat);
  corona1.scale.setScalar(3.6);
  root.add(corona1);

  const corona2Mat = alpha.add(
    new THREE.SpriteMaterial({
      map: getCoronaTexture(),
      color: '#ffb050',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.5,
  );
  const corona2 = new THREE.Sprite(corona2Mat);
  corona2.scale.setScalar(5.4);
  root.add(corona2);

  const raysMat = alpha.add(
    new THREE.SpriteMaterial({
      map: getSunRaysTexture(),
      color: '#ffe2a8',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    0.75,
  );
  const rays = new THREE.Sprite(raysMat);
  rays.scale.setScalar(7.5);
  root.add(rays);

  let warmed = false;
  return {
    body,
    root,
    dot: makeDot('#ffd95e', getStarSpikeTexture()),
    setAlpha: (a) => alpha.apply(a),
    animate: (dt) => {
      mesh.rotation.y += dt * 0.025;
      corona1Mat.rotation += dt * 0.015;
      corona2Mat.rotation -= dt * 0.01;
      raysMat.rotation += dt * 0.006;
    },
    warm: () => {
      if (warmed) return;
      warmed = true;
      mat.map = getTexture('2k_sun.jpg');
      mat.color.set('#ffffff');
      mat.needsUpdate = true;
    },
  };
}
