import type { Body, Vec3 } from './types';

/* ── 단위/앵커 상수 (월드 좌표: 미터, 지구 = 원점, x/y = 황도면, z = 높이) ── */
export const AU = 1.496e11;
export const LY = 9.4607e15;

/** 태양 위치 — 지구가 자기 궤도(1 AU) 위에 놓이도록 배치 */
export const SUN_POS: Vec3 = { x: -AU, y: 0, z: 0 };

/** 은하 중심 — 태양에서 2만 6천 광년 */
const GC_ANGLE = 2.6;
export const GALAXY_CENTER: Vec3 = {
  x: SUN_POS.x + 26000 * LY * Math.cos(GC_ANGLE),
  y: SUN_POS.y + 26000 * LY * Math.sin(GC_ANGLE),
  z: 0,
};

/** 국부은하군 구간의 카메라 앵커 (우리은하와 안드로메다 사이) */
export const LOCAL_GROUP_FOCUS: Vec3 = {
  x: GALAXY_CENTER.x + 1.0e22,
  y: GALAXY_CENTER.y - 0.55e22,
  z: 0,
};

const fromSun = (distM: number, angle: number, elev = 0): Vec3 => ({
  x: SUN_POS.x + distM * Math.cos(elev) * Math.cos(angle),
  y: SUN_POS.y + distM * Math.cos(elev) * Math.sin(angle),
  z: distM * Math.sin(elev),
});

const fromGC = (dx: number, dy: number, dz = 0): Vec3 => ({
  x: GALAXY_CENTER.x + dx,
  y: GALAXY_CENTER.y + dy,
  z: dz,
});

/* ── 행성 (실제 크기/거리 비율, 실사 텍스처) ── */

interface PlanetSpec {
  id: string;
  label: string;
  orbitAU: number;
  angle: number;
  radius: number;
  minE: number;
  tex: string;
  /** 자전 주기(초, 시각 연출용 — 실제 비율 반영하되 체감 가능하게 압축) */
  spin: number;
  /** 텍스처 로딩 전/원거리 점 표시 색 */
  tint: string;
  ring?: number;
  ringTex?: string;
}

const PLANETS: PlanetSpec[] = [
  { id: 'mercury', label: '수성', orbitAU: 0.39, angle: 2.6, radius: 2.44e6, minE: 10.3, tex: '2k_mercury.jpg', spin: 200, tint: '#bcae9e' },
  { id: 'venus', label: '금성', orbitAU: 0.72, angle: 5.4, radius: 6.05e6, minE: 10.5, tex: '2k_venus_atmosphere.jpg', spin: 240, tint: '#f0d9a0' },
  { id: 'mars', label: '화성', orbitAU: 1.52, angle: 0.8, radius: 3.39e6, minE: 10.7, tex: '2k_mars.jpg', spin: 62, tint: '#e0825a' },
  { id: 'jupiter', label: '목성', orbitAU: 5.2, angle: 3.9, radius: 6.99e7, minE: 11.4, tex: '2k_jupiter.jpg', spin: 25, tint: '#e8caa4' },
  { id: 'saturn', label: '토성', orbitAU: 9.5, angle: 1.9, radius: 5.82e7, minE: 11.7, tex: '2k_saturn.jpg', spin: 27, tint: '#ead9b0', ring: 1, ringTex: '2k_saturn_ring_alpha.png' },
  { id: 'uranus', label: '천왕성', orbitAU: 19.2, angle: 4.7, radius: 2.54e7, minE: 12.0, tex: '2k_uranus.jpg', spin: 43, tint: '#bfe8ec' },
  { id: 'neptune', label: '해왕성', orbitAU: 30.1, angle: 0.4, radius: 2.46e7, minE: 12.2, tex: '2k_neptune.jpg', spin: 40, tint: '#7aa3e8' },
];

/* ── 가까운 별 (실거리 기반, 각도/고도각은 입체 분포로 배치) ── */

interface StarSpec {
  id: string;
  label?: string;
  ly: number;
  angle: number;
  elev: number;
  color: string;
  size?: number;
}

const STARS: StarSpec[] = [
  { id: 'proxima', label: '프록시마 센타우리', ly: 4.25, angle: 0.7, elev: -0.18, color: '#ff9a76' },
  { id: 'alpha-cen', label: '알파 센타우리', ly: 4.37, angle: 0.85, elev: -0.14, color: '#ffe9b0', size: 1.6 },
  { id: 'barnard', label: '바너드별', ly: 5.96, angle: 2.3, elev: 0.28, color: '#ff8866' },
  { id: 'wolf359', ly: 7.86, angle: 3.4, elev: 0.42, color: '#ff8866' },
  { id: 'lalande', ly: 8.31, angle: 4.4, elev: 0.51, color: '#ffb088' },
  { id: 'sirius', label: '시리우스', ly: 8.66, angle: 5.6, elev: -0.31, color: '#cfe2ff', size: 1.9 },
  { id: 'luyten726', ly: 8.79, angle: 1.6, elev: -0.45, color: '#ff8866' },
  { id: 'ross154', ly: 9.7, angle: 2.9, elev: -0.06, color: '#ff9a76' },
  { id: 'ross248', ly: 10.3, angle: 0.3, elev: 0.55, color: '#ff9a76' },
  { id: 'eps-eridani', label: '엡실론 에리다니', ly: 10.5, angle: 5.0, elev: -0.52, color: '#ffc078' },
  { id: 'lacaille', ly: 10.7, angle: 3.9, elev: -0.6, color: '#ff9a76' },
  { id: 'ross128', ly: 11.0, angle: 1.2, elev: 0.08, color: '#ff8866' },
  { id: 'cygni61', label: '백조자리 61', ly: 11.4, angle: 2.0, elev: 0.6, color: '#ffc078' },
  { id: 'procyon', label: '프로키온', ly: 11.46, angle: 5.9, elev: 0.21, color: '#fff2cc', size: 1.7 },
  { id: 'eps-indi', ly: 11.8, angle: 4.1, elev: -0.66, color: '#ffc078' },
  { id: 'tau-ceti', label: '타우 세티', ly: 11.9, angle: 0.0, elev: -0.27, color: '#ffe9b0' },
  { id: 'gj876', ly: 15.2, angle: 1.45, elev: -0.09, color: '#ff8866' },
  { id: 'altair', label: '알타이르', ly: 16.7, angle: 2.55, elev: 0.16, color: '#e8f0ff', size: 1.7 },
  { id: 'gj1245', ly: 14.8, angle: 3.15, elev: 0.69, color: '#ff8866' },
  { id: 'vega', label: '베가', ly: 25.0, angle: 1.05, elev: 0.38, color: '#cfe2ff', size: 1.9 },
  { id: 'fomalhaut', label: '포말하우트', ly: 25.1, angle: 4.85, elev: -0.42, color: '#dce8ff', size: 1.6 },
  { id: 'pollux', label: '폴룩스', ly: 33.8, angle: 5.35, elev: 0.31, color: '#ffc078', size: 1.7 },
  { id: 'arcturus', label: '아르크투루스', ly: 36.7, angle: 2.1, elev: -0.22, color: '#ffb060', size: 2.0 },
  { id: 'capella', label: '카펠라', ly: 42.9, angle: 3.6, elev: 0.47, color: '#ffe9b0', size: 1.9 },
  { id: 'castor', ly: 51.0, angle: 0.5, elev: -0.35, color: '#cfe2ff', size: 1.5 },
];

/* ── 국부은하군 은하 ── */

interface GalaxySpec {
  id: string;
  label?: string;
  dx: number;
  dy: number;
  dz: number;
  radius: number;
  tiltX: number;
  tiltZ: number;
  type: 'spiral' | 'elliptical';
  color: string;
}

const GALAXIES: GalaxySpec[] = [
  { id: 'andromeda', label: '안드로메다은하', dx: 2.13e22, dy: -1.18e22, dz: 0.3e22, radius: 5.2e20, tiltX: 1.1, tiltZ: -0.5, type: 'spiral', color: '#cdd8ff' },
  { id: 'triangulum', label: '삼각형자리은하', dx: 2.4e22, dy: -0.5e22, dz: -0.25e22, radius: 2.8e20, tiltX: 0.5, tiltZ: 0.4, type: 'spiral', color: '#c4e0ff' },
  { id: 'lmc', label: '대마젤란은하', dx: 1.2e21, dy: 0.8e21, dz: -0.4e21, radius: 7e19, tiltX: 0.9, tiltZ: 0.9, type: 'elliptical', color: '#e0d8ff' },
  { id: 'smc', label: '소마젤란은하', dx: 1.6e21, dy: 1.1e21, dz: 0.5e21, radius: 4e19, tiltX: 0.3, tiltZ: 0.2, type: 'elliptical', color: '#d4d0f0' },
  { id: 'dwarf1', dx: -0.5e22, dy: -0.9e22, dz: 0.45e22, radius: 1.2e20, tiltX: 1.4, tiltZ: 1.2, type: 'elliptical', color: '#bcc4e8' },
  { id: 'dwarf2', dx: 0.7e22, dy: 0.8e22, dz: -0.5e22, radius: 9e19, tiltX: 0.8, tiltZ: 2.1, type: 'elliptical', color: '#c8c0e0' },
  { id: 'dwarf3', dx: 1.7e22, dy: 0.3e22, dz: 0.6e22, radius: 1.4e20, tiltX: 1.7, tiltZ: 0.6, type: 'spiral', color: '#b8d0f0' },
  { id: 'dwarf4', dx: -0.2e22, dy: -1.6e22, dz: -0.35e22, radius: 1.0e20, tiltX: 0.2, tiltZ: 1.7, type: 'elliptical', color: '#ccd4f0' },
];

/* ── 전체 천체 목록 ── */

export const BODIES: Body[] = [
  {
    id: 'cosmic-web',
    pos: LOCAL_GROUP_FOCUS,
    radius: 4.4e26,
    minE: 22.6,
    maxE: 28.5,
    painter: 'cosmicWeb',
  },
  ...GALAXIES.map(
    (g): Body => ({
      id: g.id,
      label: g.label,
      pos: fromGC(g.dx, g.dy, g.dz),
      radius: g.radius,
      minE: 21.2,
      maxE: 25.8,
      minPixelRadius: 1.5,
      painter: 'galaxy',
      params: { tiltX: g.tiltX, tiltZ: g.tiltZ, type: g.type, color: g.color },
    }),
  ),
  {
    id: 'milky-way',
    label: '우리은하',
    pos: GALAXY_CENTER,
    radius: 50000 * LY,
    minE: 18.6,
    maxE: 25.2,
    minPixelRadius: 2,
    painter: 'milkyWay',
  },
  {
    id: 'oort-cloud',
    pos: SUN_POS,
    radius: 0.8 * LY,
    minE: 14.8,
    maxE: 18.0,
    painter: 'oortShell',
  },
  ...STARS.map(
    (s): Body => ({
      id: s.id,
      label: s.label,
      pos: fromSun(s.ly * LY, s.angle, s.elev),
      radius: 7e8,
      minE: 16.2,
      maxE: 21.0,
      minPixelRadius: 1.3 * (s.size ?? 1),
      painter: 'starDot',
      params: { color: s.color },
    }),
  ),
  {
    id: 'sun-here',
    label: '태양은 여기',
    pos: { x: 0, y: 0, z: 0 },
    radius: 1e15,
    minE: 19.3,
    maxE: 21.8,
    minPixelRadius: 2.5,
    painter: 'marker',
  },
  {
    id: 'kuiper-belt',
    pos: SUN_POS,
    radius: 50 * AU,
    minE: 12.8,
    maxE: 15.5,
    painter: 'beltRing',
    params: { innerRatio: 0.6, seed: 7 },
  },
  {
    id: 'voyager1',
    label: '보이저 1호',
    pos: fromSun(167 * AU, -0.76, 0.12),
    radius: 1e10,
    minE: 13.2,
    maxE: 15.2,
    minPixelRadius: 2,
    painter: 'marker',
  },
  ...PLANETS.map(
    (p): Body => ({
      id: `orbit-${p.id}`,
      pos: SUN_POS,
      radius: p.orbitAU * AU,
      minE: Math.log10(2 * p.orbitAU * AU) - 0.55,
      maxE: 14.5,
      painter: 'orbit',
    }),
  ),
  {
    id: 'orbit-earth',
    pos: SUN_POS,
    radius: AU,
    minE: Math.log10(2 * AU) - 0.55,
    maxE: 14.5,
    painter: 'orbit',
  },
  {
    id: 'sun',
    label: '태양',
    pos: SUN_POS,
    radius: 6.96e8,
    minE: 9.5,
    maxE: 18.6,
    minPixelRadius: 2.2,
    painter: 'sun',
    params: { tex: '2k_sun.jpg', spin: 180, tint: '#ffd95e' },
  },
  ...PLANETS.map(
    (p): Body => ({
      id: p.id,
      label: p.label,
      pos: fromSun(p.orbitAU * AU, p.angle),
      radius: p.radius,
      minE: p.minE,
      maxE: 14.2,
      minPixelRadius: 1.1,
      painter: p.ring ? 'gasGiant' : 'rockyPlanet',
      params: {
        tex: p.tex,
        spin: p.spin,
        tint: p.tint,
        ...(p.ring ? { ring: 1, ringTex: p.ringTex! } : {}),
      },
    }),
  ),
  {
    id: 'moon',
    label: '달',
    pos: { x: 3.0e8, y: -2.4e8, z: 0 },
    radius: 1.737e6,
    minE: 7.4,
    maxE: 11.6,
    minPixelRadius: 0.8,
    painter: 'moon',
    params: { tex: '2k_moon.jpg', spin: 320, tint: '#9a9a94' },
  },
  {
    id: 'earth',
    label: '지구',
    pos: { x: 0, y: 0, z: 0 },
    radius: 6.371e6,
    minE: 5.5,
    maxE: 11.8,
    minPixelRadius: 1.1,
    painter: 'earth',
    params: { tint: '#4f9be8' },
  },
];
