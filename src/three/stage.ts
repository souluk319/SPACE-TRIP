import * as THREE from 'three';
import { Post } from './post';

/** 포커스 평면에서 화면 세로가 덮는 씬 유닛 수 — 줌은 세상을 재스케일하는 방식 */
export const VIEW_UNITS = 100;
export const FOV = 50;
/** 카메라 고정 거리 */
export const CAM_DIST = VIEW_UNITS / 2 / Math.tan((FOV / 2) * (Math.PI / 180));

export const IS_MOBILE =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(pointer: coarse)').matches &&
  Math.min(screen.width, screen.height) < 820;

/** 파티클 수 배율 (모바일 절감) */
export const PARTICLE_SCALE = IS_MOBILE ? 0.4 : 1;

export class Stage {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  private post: Post;
  private sunLight: THREE.DirectionalLight;

  constructor(canvas: HTMLCanvasElement) {
    // log depth OFF: rescale.ts가 매 프레임 천체를 ~VIEW_UNITS 규모로 바운드하므로
    // 일반 depth buffer로 충분하며, BokehPass DOF·Lensflare occlusion이 가능해진다.
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 1e5);
    this.camera.position.set(0, 0, CAM_DIST);

    this.scene.add(new THREE.AmbientLight(0x8899bb, 0.26));
    this.sunLight = new THREE.DirectionalLight(0xfff2e0, 2.7);
    this.sunLight.position.set(-50, 8, 20);
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.post = new Post(this.renderer, this.scene, this.camera);
    this.resize(window.innerWidth, window.innerHeight);
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.post.resize(w, h);
  }

  /** 태양의 씬 위치로 조명 방향 갱신 (포커스가 태양 자체면 기존 방향 유지) */
  updateLight(sunScenePos: THREE.Vector3): void {
    if (sunScenePos.lengthSq() > 1e-8) {
      const dir = sunScenePos.clone().normalize().multiplyScalar(80);
      this.sunLight.position.copy(dir);
      this.sunLight.target.position.set(0, 0, 0);
    }
  }

  render(sunScene: THREE.Vector3, e: number, dt: number): void {
    this.post.render(sunScene, this.camera, e, dt);
  }
}
