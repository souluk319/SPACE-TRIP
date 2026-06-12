import * as THREE from 'three';
import { mulberry32, smoothstep } from '../core/math';
import { getTexture } from './textures';

const SKY_RADIUS = 4.5e4;

function makeStarLayer(seed: number, size: number, count: number): THREE.Points {
  const rand = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const ph = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = 2.2e4 + rand() * 1.6e4;
    pos[i * 3] = s * Math.cos(ph) * r;
    pos[i * 3 + 1] = u * r;
    pos[i * 3 + 2] = s * Math.sin(ph) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: '#dce6ff',
    size,
    sizeAttenuation: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  pts.renderOrder = -9;
  return pts;
}

/**
 * 우주 배경 — 은하수 파노라마 스카이박스 + 배경 별 2레이어.
 * 스카이박스는 e 18.4~19.6에서 페이드아웃 (은하 밖에서 은하수가 보이는 오류 방지),
 * 별 레이어는 줌 지수에 따라 교차 페이드되어 어느 스케일에서도 깊이감 유지.
 */
export class Environment {
  private sky: THREE.Mesh;
  private skyMat: THREE.MeshBasicMaterial;
  private layer1: THREE.Points;
  private layer2: THREE.Points;

  constructor(scene: THREE.Scene) {
    this.skyMat = new THREE.MeshBasicMaterial({
      map: getTexture('2k_stars_milky_way.jpg'),
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(SKY_RADIUS, 48, 32), this.skyMat);
    this.sky.rotation.x = 0.35;
    this.sky.renderOrder = -10;
    scene.add(this.sky);

    this.layer1 = makeStarLayer(11, 1.6, 700);
    this.layer2 = makeStarLayer(22, 2.4, 500);
    scene.add(this.layer1, this.layer2);
  }

  update(dt: number, e: number): void {
    const skyAlpha = 1 - smoothstep(18.4, 19.6, e);
    this.skyMat.opacity = skyAlpha;
    this.sky.visible = skyAlpha > 0.01;
    this.sky.rotation.y += dt * 0.0008;

    const tri = (u: number) => 1 - Math.abs(2 * (u - Math.floor(u)) - 1);
    const phase = (e * 0.45) % 1;
    (this.layer1.material as THREE.PointsMaterial).opacity = 0.2 + 0.6 * tri(phase);
    (this.layer2.material as THREE.PointsMaterial).opacity = 0.2 + 0.6 * tri(phase + 0.5);
  }
}
