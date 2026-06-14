import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CAM_DIST, IS_MOBILE } from './stage';

/** 태양에서 방사하는 볼류메트릭 갓레이 — 밝은 픽셀(태양)만 광선화 */
const GodRayShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uSun: { value: new THREE.Vector2(0.5, 0.5) },
    uIntensity: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uSun;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      if (uIntensity < 0.001) { gl_FragColor = color; return; }
      vec2 delta = (vUv - uSun) / 28.0;
      vec2 uv = vUv;
      float illum = 1.0;
      vec3 accum = vec3(0.0);
      for (int i = 0; i < 28; i++) {
        uv -= delta;
        vec3 s = texture2D(tDiffuse, uv).rgb;
        float lum = dot(s, vec3(0.299, 0.587, 0.114));
        s *= smoothstep(0.55, 0.95, lum); // 아주 밝은 곳(태양)만
        accum += s * illum;
        illum *= 0.93;
      }
      accum /= 28.0;
      gl_FragColor = vec4(color.rgb + accum * uIntensity, color.a);
    }
  `,
};

/** 필름 그레인 + 미세 색수차 (디스플레이 공간, OutputPass 이후) */
const GrainCAShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uGrain: { value: 0.045 },
    uCA: { value: 1.6 },
    uAspect: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uCA;
    uniform float uAspect;
    varying vec2 vUv;
    float rand(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      vec2 off = d * r2 * uCA * 0.004;
      float r = texture2D(tDiffuse, vUv + off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - off).b;
      vec3 col = vec3(r, g, b);
      float n = rand(vUv * vec2(uAspect, 1.0) + fract(uTime)) - 0.5;
      col += n * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export class Post {
  readonly composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private bokeh: BokehPass | null = null;
  private godray: ShaderPass | null = null;
  private grain: ShaderPass;
  private _sun = new THREE.Vector3();
  private time = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
  ) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    if (!IS_MOBILE) {
      this.bokeh = new BokehPass(scene, camera, { focus: CAM_DIST, aperture: 0.00018, maxblur: 0.006 });
      this.composer.addPass(this.bokeh);
    }

    this.bloom = new UnrealBloomPass(new THREE.Vector2(320, 320), 0.85, 0.5, 0.82);
    this.composer.addPass(this.bloom);

    if (!IS_MOBILE) {
      this.godray = new ShaderPass(GodRayShader);
      this.composer.addPass(this.godray);
    }

    this.composer.addPass(new OutputPass());

    this.grain = new ShaderPass(GrainCAShader);
    if (IS_MOBILE) this.grain.uniforms.uCA.value = 0;
    this.composer.addPass(this.grain);
  }

  resize(w: number, h: number): void {
    this.composer.setSize(w, h);
    this.grain.uniforms.uAspect.value = w / h;
  }

  /**
   * @param sunScene 태양의 씬 좌표
   * @param camera 투영용
   * @param e 줌 지수 (태양 갓레이 가시 구간 게이트)
   */
  render(sunScene: THREE.Vector3, camera: THREE.PerspectiveCamera, e: number, dt: number): void {
    this.time += dt;
    this.grain.uniforms.uTime.value = this.time;

    if (this.godray) {
      this._sun.copy(sunScene).project(camera);
      const onScreen =
        this._sun.z < 1 &&
        this._sun.x > -1.25 &&
        this._sun.x < 1.25 &&
        this._sun.y > -1.25 &&
        this._sun.y < 1.25;
      // 태양이 점/구로 보이는 구간(대략 e 8.5~18.4)에서만
      const eGate = e > 8.5 && e < 18.4 && sunScene.lengthSq() > 1e-8;
      const edge = Math.max(Math.abs(this._sun.x), Math.abs(this._sun.y));
      const edgeFade = 1 - Math.max(0, (edge - 0.6) / 0.65);
      const intensity = onScreen && eGate ? 0.85 * Math.max(0, edgeFade) : 0;
      this.godray.uniforms.uSun.value.set((this._sun.x + 1) / 2, (this._sun.y + 1) / 2);
      this.godray.uniforms.uIntensity.value = intensity;
    }

    this.composer.render();
  }
}
