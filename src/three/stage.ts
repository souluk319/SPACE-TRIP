import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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
  private composer: EffectComposer;
  private sunLight: THREE.DirectionalLight;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 2e5);
    this.camera.position.set(0, 0, CAM_DIST);

    this.scene.add(new THREE.AmbientLight(0x8899bb, 0.28));
    this.sunLight = new THREE.DirectionalLight(0xfff2e0, 2.6);
    this.sunLight.position.set(-50, 8, 20);
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.45, 0.88);
    this.composer.addPass(bloom);
    this.composer.addPass(new OutputPass());

    this.resize(window.innerWidth, window.innerHeight);
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    const bloomScale = IS_MOBILE ? 0.5 : 1;
    this.composer.setSize(Math.round(w * bloomScale), Math.round(h * bloomScale));
  }

  /** 태양의 씬 위치로 조명 방향 갱신 (포커스가 태양 자체면 기존 방향 유지) */
  updateLight(sunScenePos: THREE.Vector3): void {
    if (sunScenePos.lengthSq() > 1e-8) {
      const dir = sunScenePos.clone().normalize().multiplyScalar(80);
      this.sunLight.position.copy(dir);
      this.sunLight.target.position.set(0, 0, 0);
    }
  }

  render(): void {
    this.composer.render();
  }
}
