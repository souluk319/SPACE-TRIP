import * as THREE from 'three';
import type { Body } from '../../scene/types';
import { getTexture } from '../textures';
import { IS_MOBILE } from '../stage';
import { AlphaGroup, SPHERE_HI, makeDot, type WorldObject } from './common';

/** 메인 루프가 매 프레임 갱신 — 지구→태양 방향 (씬 월드 좌표, 정규화) */
export const sunDirUniform = { value: new THREE.Vector3(-0.9, 0.15, 0.4).normalize() };

/** ShaderMaterial.opacity ↔ uniform 중계 (AlphaGroup 호환) */
function bindOpacityUniform(mat: THREE.ShaderMaterial): void {
  Object.defineProperty(mat, 'opacity', {
    get: () => mat.uniforms.opacity.value as number,
    set: (v: number) => {
      if (mat.uniforms) mat.uniforms.opacity.value = v;
    },
  });
}

/**
 * 지구 표면 — 태양 방향 기반 주/야 혼합 커스텀 셰이더.
 * (Three.js Journey Earth Shaders 기법: 주야 혼합 + 황혼대 + 바다 반사)
 */
function makeSurfaceMaterial(alpha: AlphaGroup): THREE.ShaderMaterial {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uDay: { value: null },
      uNight: { value: null },
      uHasTex: { value: 0 },
      uSunDir: sunDirUniform,
      opacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        vUv = uv;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uDay;
      uniform sampler2D uNight;
      uniform float uHasTex;
      uniform vec3 uSunDir;
      uniform float opacity;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        #include <logdepthbuf_fragment>
        vec3 n = normalize(vNormalW);
        float sunDot = dot(n, uSunDir);

        vec3 day = mix(vec3(0.12, 0.32, 0.65), texture2D(uDay, vUv).rgb, uHasTex);
        vec3 night = texture2D(uNight, vUv).rgb * uHasTex;

        // 주/야 혼합 — 도시 불빛은 어두운 면에만
        float dayMix = smoothstep(-0.1, 0.3, sunDot);
        vec3 lit = day * (0.16 + 0.95 * max(sunDot, 0.0));
        vec3 dark = night * vec3(1.7, 1.4, 1.0);
        vec3 color = mix(dark, lit, dayMix);

        // 황혼대 붉은 기
        float tw = smoothstep(0.25, 0.02, abs(sunDot));
        color *= mix(vec3(1.0), vec3(1.2, 0.92, 0.76), tw);

        // 바다 태양 반사 (주간맵 파랑 우세 영역)
        float ocean = smoothstep(0.02, 0.18, day.b - day.r);
        vec3 viewDir = normalize(cameraPosition - vPosW);
        vec3 h = normalize(uSunDir + viewDir);
        float spec = pow(max(dot(n, h), 0.0), 56.0) * ocean * max(sunDot, 0.0);
        color += vec3(1.0, 0.93, 0.8) * spec * 0.6;

        gl_FragColor = vec4(color, opacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
  });
  bindOpacityUniform(mat);
  alpha.add(mat, 1);
  return mat;
}

export function buildEarth(body: Body): WorldObject {
  const root = new THREE.Group();
  const alpha = new AlphaGroup();

  const surfaceMat = makeSurfaceMaterial(alpha);
  const surface = new THREE.Mesh(SPHERE_HI, surfaceMat);
  root.add(surface);

  const cloudMat = alpha.add(
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 1,
      metalness: 0,
      depthWrite: false,
    }),
    0.82,
  );
  const clouds = new THREE.Mesh(SPHERE_HI, cloudMat);
  clouds.scale.setScalar(1.012);
  clouds.visible = false; // alphaMap 로드 후 표시
  root.add(clouds);


  // 지구 자전축 기울기 23.4°
  root.rotation.z = 0.41;

  let warmed = false;
  return {
    body,
    root,
    dot: makeDot('#4f9be8'),
    setAlpha: (a) => alpha.apply(a),
    animate: (dt) => {
      surface.rotation.y += ((Math.PI * 2) / 95) * dt;
      clouds.rotation.y += ((Math.PI * 2) / 72) * dt;
    },
    warm: () => {
      if (warmed) return;
      warmed = true;
      const res = IS_MOBILE ? '2k' : '8k';
      surfaceMat.uniforms.uDay.value = getTexture(`${res}_earth_daymap.jpg`, true, 8);
      surfaceMat.uniforms.uNight.value = getTexture(`${res}_earth_nightmap.jpg`, true, 8);
      surfaceMat.uniforms.uHasTex.value = 1;
      cloudMat.alphaMap = getTexture('2k_earth_clouds.jpg', false);
      cloudMat.needsUpdate = true;
      clouds.visible = true;
    },
  };
}
