import * as THREE from 'three';
import type { Body } from '../../scene/types';
import { getTexture } from '../textures';
import { AlphaGroup, SPHERE_HI, makeDot, type WorldObject } from './common';

/** 대기 프레넬 림 셰이더 — logarithmicDepthBuffer 청크 포함 필수 */
function makeAtmosphereMaterial(alpha: AlphaGroup): THREE.ShaderMaterial {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#6eb4ff') },
      opacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying float vF;
      void main() {
        vec3 n = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 v = normalize(-mv.xyz);
        vF = pow(1.0 - abs(dot(n, v)), 2.6);
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uColor;
      uniform float opacity;
      varying float vF;
      void main() {
        #include <logdepthbuf_fragment>
        gl_FragColor = vec4(uColor, vF * opacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
  // ShaderMaterial의 opacity 세터를 uniform으로 중계 → AlphaGroup이 일반 머티리얼처럼 다룸
  Object.defineProperty(mat, 'opacity', {
    get: () => mat.uniforms.opacity.value as number,
    set: (v: number) => {
      if (mat.uniforms) mat.uniforms.opacity.value = v;
    },
  });
  alpha.add(mat, 0.9);
  return mat;
}

export function buildEarth(body: Body): WorldObject {
  const root = new THREE.Group();
  const alpha = new AlphaGroup();

  const surfaceMat = alpha.add(
    new THREE.MeshStandardMaterial({
      color: '#4f9be8',
      roughness: 1,
      metalness: 0,
      emissive: new THREE.Color('#ffd9a0'),
      emissiveIntensity: 0.0,
    }),
  );
  const surface = new THREE.Mesh(SPHERE_HI, surfaceMat);
  root.add(surface);

  const cloudMat = alpha.add(
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 1,
      metalness: 0,
      depthWrite: false,
    }),
    0.85,
  );
  const clouds = new THREE.Mesh(SPHERE_HI, cloudMat);
  clouds.scale.setScalar(1.012);
  clouds.visible = false; // alphaMap 로드 후 표시
  root.add(clouds);

  const atmo = new THREE.Mesh(SPHERE_HI, makeAtmosphereMaterial(alpha));
  atmo.scale.setScalar(1.055);
  root.add(atmo);

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
      surfaceMat.map = getTexture('2k_earth_daymap.jpg');
      surfaceMat.emissiveMap = getTexture('2k_earth_nightmap.jpg');
      surfaceMat.emissiveIntensity = 0.85;
      surfaceMat.color.set('#ffffff');
      surfaceMat.needsUpdate = true;
      cloudMat.alphaMap = getTexture('2k_earth_clouds.jpg', false);
      cloudMat.needsUpdate = true;
      clouds.visible = true;
    },
  };
}
