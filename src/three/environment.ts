import * as THREE from 'three';
import { mulberry32, smoothstep } from '../core/math';
import { getGalaxySpriteTexture, getTexture } from './textures';
import { PARTICLE_SCALE } from './stage';

const SKY_RADIUS = 4.5e4;

/** 별 색온도 팔레트 (청백 우세 + 소수의 황·적색 거성) */
const STAR_TEMPS: [number, number, number][] = [
  [0.78, 0.85, 1.0], // 청백
  [0.88, 0.92, 1.0],
  [1.0, 1.0, 1.0], // 백색
  [1.0, 0.98, 0.92],
  [1.0, 0.93, 0.78], // 황백
  [1.0, 0.82, 0.62], // 주황
  [1.0, 0.7, 0.55], // 적색 거성
];

function makeStarLayer(seed: number, size: number, count: number): THREE.Points {
  const rand = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const ph = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = 2.2e4 + rand() * 1.7e4;
    pos[i * 3] = s * Math.cos(ph) * r;
    pos[i * 3 + 1] = u * r;
    pos[i * 3 + 2] = s * Math.sin(ph) * r;
    // 색온도 — 청백에 가중 (낮은 인덱스), 가끔 따뜻한 색
    const t = STAR_TEMPS[Math.floor(Math.pow(rand(), 1.7) * STAR_TEMPS.length)];
    const b = 0.6 + rand() * 0.4;
    col[i * 3] = t[0] * b;
    col[i * 3 + 1] = t[1] * b;
    col[i * 3 + 2] = t[2] * b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    vertexColors: true,
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
  private layers: THREE.Points[] = [];
  private deepField: Array<{ mat: THREE.SpriteMaterial; base: number }> = [];
  private deepGroup = new THREE.Group();

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

    // 4레이어 — 크기·밀도 다양 + 위상 분산 트윈클
    const ps = Math.max(PARTICLE_SCALE, 0.5);
    this.layers = [
      makeStarLayer(11, 1.0, Math.round(2600 * ps)),
      makeStarLayer(22, 1.5, Math.round(1500 * ps)),
      makeStarLayer(33, 2.2, Math.round(650 * ps)),
      makeStarLayer(44, 3.0, Math.round(220 * ps)),
    ];
    for (const l of this.layers) scene.add(l);

    // 딥필드 — 거대 스케일에서 페이드인되는 원거리 은하들 (허블 딥필드 느낌)
    const rand = mulberry32(404);
    const tints = ['#cdd8ff', '#ffe6c8', '#d8c8ff', '#c8e4ff', '#f0d8e8'];
    const count = Math.round(130 * Math.max(PARTICLE_SCALE, 0.5));
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1;
      const ph = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 2.6e4 + rand() * 1.5e4;
      const mat = new THREE.SpriteMaterial({
        map: getGalaxySpriteTexture(rand() < 0.6 ? 'spiral' : 'elliptical'),
        color: tints[Math.floor(rand() * tints.length)],
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        rotation: rand() * Math.PI * 2,
        opacity: 0,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(s * Math.cos(ph) * r, u * r * 0.9, s * Math.sin(ph) * r);
      // 거리 ~3e4 유닛에서 화면상 10~90px 정도가 되도록
      const scale = 600 + Math.pow(rand(), 2.2) * 4200;
      sprite.scale.set(scale, scale * (0.45 + rand() * 0.5), 1);
      this.deepGroup.add(sprite);
      this.deepField.push({ mat, base: 0.12 + rand() * 0.3 });
    }
    this.deepGroup.visible = false;
    scene.add(this.deepGroup);
  }

  update(dt: number, e: number): void {
    const skyAlpha = 1 - smoothstep(18.4, 19.6, e);
    this.skyMat.opacity = skyAlpha;
    this.sky.visible = skyAlpha > 0.01;
    this.sky.rotation.y += dt * 0.0008;

    const tri = (u: number) => 1 - Math.abs(2 * (u - Math.floor(u)) - 1);
    const phase = (e * 0.4) % 1;
    this.layers.forEach((l, i) => {
      (l.material as THREE.PointsMaterial).opacity = 0.32 + 0.55 * tri(phase + i * 0.27);
    });

    // 딥필드는 은하 스케일부터
    const deep = smoothstep(20.2, 21.6, e);
    this.deepGroup.visible = deep > 0.01;
    if (this.deepGroup.visible) {
      for (const d of this.deepField) d.mat.opacity = d.base * deep;
    }
  }
}
