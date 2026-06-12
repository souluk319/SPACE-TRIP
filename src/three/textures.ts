import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

/** /textures/<name> lazy 로딩 + 캐시. 컬러맵은 sRGB로 표시 */
export function getTexture(name: string, srgb = true): THREE.Texture {
  let tex = cache.get(name);
  if (!tex) {
    tex = loader.load(`/textures/${name}`);
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    cache.set(name, tex);
  }
  return tex;
}

let glowTex: THREE.CanvasTexture | null = null;

/** 점광/별용 방사형 글로우 스프라이트 텍스처 (공유) */
export function getGlowTexture(): THREE.CanvasTexture {
  if (!glowTex) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d')!;
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(cv);
  }
  return glowTex;
}

let coronaTex: THREE.CanvasTexture | null = null;

/** 태양 코로나용 — 글로우보다 퍼짐이 넓고 가장자리 섬세 */
export function getCoronaTexture(): THREE.CanvasTexture {
  if (!coronaTex) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const c = cv.getContext('2d')!;
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,235,190,0.9)');
    g.addColorStop(0.25, 'rgba(255,200,110,0.38)');
    g.addColorStop(0.6, 'rgba(255,160,60,0.12)');
    g.addColorStop(1, 'rgba(255,140,40,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    coronaTex = new THREE.CanvasTexture(cv);
  }
  return coronaTex;
}

const galaxySpriteCache = new Map<string, THREE.CanvasTexture>();

/** 외부 은하용 절차적 텍스처 (spiral/elliptical) */
export function getGalaxySpriteTexture(type: 'spiral' | 'elliptical'): THREE.CanvasTexture {
  let tex = galaxySpriteCache.get(type);
  if (tex) return tex;

  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const c = cv.getContext('2d')!;
  const cx = 128;

  if (type === 'spiral') {
    // 원반 글로우
    let g = c.createRadialGradient(cx, cx, 0, cx, cx, 120);
    g.addColorStop(0, 'rgba(255,245,225,0.9)');
    g.addColorStop(0.25, 'rgba(200,215,255,0.4)');
    g.addColorStop(1, 'rgba(170,190,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    // 나선팔 2개
    for (let arm = 0; arm < 2; arm++) {
      const off = arm * Math.PI;
      for (let t = 0; t < 1; t += 0.01) {
        const ang = off + t * 4.0;
        const rad = 12 * Math.pow(10, t);
        const px = cx + Math.cos(ang) * rad;
        const py = cx + Math.sin(ang) * rad;
        const s = 14 * (1 - t) + 4;
        const ag = c.createRadialGradient(px, py, 0, px, py, s);
        ag.addColorStop(0, `rgba(210,222,255,${0.16 * (1 - t * 0.6)})`);
        ag.addColorStop(1, 'rgba(210,222,255,0)');
        c.fillStyle = ag;
        c.beginPath();
        c.arc(px, py, s, 0, Math.PI * 2);
        c.fill();
      }
    }
    // 밝은 코어
    g = c.createRadialGradient(cx, cx, 0, cx, cx, 26);
    g.addColorStop(0, 'rgba(255,250,235,1)');
    g.addColorStop(1, 'rgba(255,240,210,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  } else {
    const g = c.createRadialGradient(cx, cx, 0, cx, cx, 110);
    g.addColorStop(0, 'rgba(255,248,232,1)');
    g.addColorStop(0.3, 'rgba(228,225,255,0.45)');
    g.addColorStop(1, 'rgba(205,205,245,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  }

  tex = new THREE.CanvasTexture(cv);
  galaxySpriteCache.set(type, tex);
  return tex;
}
