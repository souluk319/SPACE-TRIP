import type { Body, Vec2 } from './types';

/* ── 단위/앵커 상수 (월드 좌표: 미터, 지구 = 원점) ── */
export const AU = 1.496e11;
export const LY = 9.4607e15;

/** 태양 위치 — 지구가 자기 궤도(1 AU) 위에 놓이도록 배치 */
export const SUN_POS: Vec2 = { x: -AU, y: 0 };

/** 은하 중심 — 태양에서 2만 6천 광년 */
const GC_ANGLE = 2.6;
export const GALAXY_CENTER: Vec2 = {
  x: SUN_POS.x + 26000 * LY * Math.cos(GC_ANGLE),
  y: SUN_POS.y + 26000 * LY * Math.sin(GC_ANGLE),
};

/** 국부은하군 구간의 카메라 앵커 (우리은하와 안드로메다 사이) */
export const LOCAL_GROUP_FOCUS: Vec2 = {
  x: GALAXY_CENTER.x + 1.0e22,
  y: GALAXY_CENTER.y - 0.55e22,
};

const fromSun = (distM: number, angle: number): Vec2 => ({
  x: SUN_POS.x + distM * Math.cos(angle),
  y: SUN_POS.y + distM * Math.sin(angle),
});

const fromGC = (dx: number, dy: number): Vec2 => ({
  x: GALAXY_CENTER.x + dx,
  y: GALAXY_CENTER.y + dy,
});

/* ── 행성 (실제 크기/거리 비율) ── */

interface PlanetSpec {
  id: string;
  label: string;
  orbitAU: number;
  angle: number;
  radius: number;
  painter: 'rockyPlanet' | 'gasGiant';
  minE: number;
  params: Record<string, number | string>;
}

const PLANETS: PlanetSpec[] = [
  { id: 'mercury', label: '수성', orbitAU: 0.39, angle: 2.6, radius: 2.44e6, painter: 'rockyPlanet', minE: 10.3, params: { color1: '#bcae9e', color2: '#6e6256' } },
  { id: 'venus', label: '금성', orbitAU: 0.72, angle: 5.4, radius: 6.05e6, painter: 'rockyPlanet', minE: 10.5, params: { color1: '#f0d9a0', color2: '#b08d4f' } },
  { id: 'mars', label: '화성', orbitAU: 1.52, angle: 0.8, radius: 3.39e6, painter: 'rockyPlanet', minE: 10.7, params: { color1: '#e0825a', color2: '#8f4528' } },
  { id: 'jupiter', label: '목성', orbitAU: 5.2, angle: 3.9, radius: 6.99e7, painter: 'gasGiant', minE: 11.4, params: { color1: '#e8caa4', color2: '#a87c52', stripe: '#8c5e3c' } },
  { id: 'saturn', label: '토성', orbitAU: 9.5, angle: 1.9, radius: 5.82e7, painter: 'gasGiant', minE: 11.7, params: { color1: '#ead9b0', color2: '#b39b66', stripe: '#9c8050', ring: 1 } },
  { id: 'uranus', label: '천왕성', orbitAU: 19.2, angle: 4.7, radius: 2.54e7, painter: 'gasGiant', minE: 12.0, params: { color1: '#bfe8ec', color2: '#6fb4c4', stripe: '#8cc8d4' } },
  { id: 'neptune', label: '해왕성', orbitAU: 30.1, angle: 0.4, radius: 2.46e7, painter: 'gasGiant', minE: 12.2, params: { color1: '#7aa3e8', color2: '#3458b0', stripe: '#4a6cc4' } },
];

/* ── 가까운 별 (실거리 기반, 각도는 보기 좋게 배치) ── */

interface StarSpec {
  id: string;
  label?: string;
  ly: number;
  angle: number;
  color: string;
  size?: number;
}

const STARS: StarSpec[] = [
  { id: 'proxima', label: '프록시마 센타우리', ly: 4.25, angle: 0.7, color: '#ff9a76' },
  { id: 'alpha-cen', label: '알파 센타우리', ly: 4.37, angle: 0.85, color: '#ffe9b0', size: 1.6 },
  { id: 'barnard', label: '바너드별', ly: 5.96, angle: 2.3, color: '#ff8866' },
  { id: 'wolf359', ly: 7.86, angle: 3.4, color: '#ff8866' },
  { id: 'lalande', ly: 8.31, angle: 4.4, color: '#ffb088' },
  { id: 'sirius', label: '시리우스', ly: 8.66, angle: 5.6, color: '#cfe2ff', size: 1.9 },
  { id: 'luyten726', ly: 8.79, angle: 1.6, color: '#ff8866' },
  { id: 'ross154', ly: 9.7, angle: 2.9, color: '#ff9a76' },
  { id: 'ross248', ly: 10.3, angle: 0.3, color: '#ff9a76' },
  { id: 'eps-eridani', label: '엡실론 에리다니', ly: 10.5, angle: 5.0, color: '#ffc078' },
  { id: 'lacaille', ly: 10.7, angle: 3.9, color: '#ff9a76' },
  { id: 'ross128', ly: 11.0, angle: 1.2, color: '#ff8866' },
  { id: 'cygni61', label: '백조자리 61', ly: 11.4, angle: 2.0, color: '#ffc078' },
  { id: 'procyon', label: '프로키온', ly: 11.46, angle: 5.9, color: '#fff2cc', size: 1.7 },
  { id: 'eps-indi', ly: 11.8, angle: 4.1, color: '#ffc078' },
  { id: 'tau-ceti', label: '타우 세티', ly: 11.9, angle: 0.0, color: '#ffe9b0' },
  { id: 'gj876', ly: 15.2, angle: 1.45, color: '#ff8866' },
  { id: 'altair', label: '알타이르', ly: 16.7, angle: 2.55, color: '#e8f0ff', size: 1.7 },
  { id: 'gj1245', ly: 14.8, angle: 3.15, color: '#ff8866' },
  { id: 'vega', label: '베가', ly: 25.0, angle: 1.05, color: '#cfe2ff', size: 1.9 },
  { id: 'fomalhaut', label: '포말하우트', ly: 25.1, angle: 4.85, color: '#dce8ff', size: 1.6 },
  { id: 'pollux', label: '폴룩스', ly: 33.8, angle: 5.35, color: '#ffc078', size: 1.7 },
  { id: 'arcturus', label: '아르크투루스', ly: 36.7, angle: 2.1, color: '#ffb060', size: 2.0 },
  { id: 'capella', label: '카펠라', ly: 42.9, angle: 3.6, color: '#ffe9b0', size: 1.9 },
  { id: 'castor', ly: 51.0, angle: 0.5, color: '#cfe2ff', size: 1.5 },
];

/* ── 국부은하군 은하 ── */

interface GalaxySpec {
  id: string;
  label?: string;
  dx: number;
  dy: number;
  radius: number;
  tilt: number;
  type: 'spiral' | 'elliptical';
  color: string;
}

const GALAXIES: GalaxySpec[] = [
  { id: 'andromeda', label: '안드로메다은하', dx: 2.13e22, dy: -1.18e22, radius: 5.2e20, tilt: -0.5, type: 'spiral', color: '#cdd8ff' },
  { id: 'triangulum', label: '삼각형자리은하', dx: 2.4e22, dy: -0.5e22, radius: 2.8e20, tilt: 0.4, type: 'spiral', color: '#c4e0ff' },
  { id: 'lmc', label: '대마젤란은하', dx: 1.2e21, dy: 0.8e21, radius: 7e19, tilt: 0.9, type: 'elliptical', color: '#e0d8ff' },
  { id: 'smc', label: '소마젤란은하', dx: 1.6e21, dy: 1.1e21, radius: 4e19, tilt: 0.2, type: 'elliptical', color: '#d4d0f0' },
  { id: 'dwarf1', dx: -0.5e22, dy: -0.9e22, radius: 1.2e20, tilt: 1.2, type: 'elliptical', color: '#bcc4e8' },
  { id: 'dwarf2', dx: 0.7e22, dy: 0.8e22, radius: 9e19, tilt: 2.1, type: 'elliptical', color: '#c8c0e0' },
  { id: 'dwarf3', dx: 1.7e22, dy: 0.3e22, radius: 1.4e20, tilt: 0.6, type: 'spiral', color: '#b8d0f0' },
  { id: 'dwarf4', dx: -0.2e22, dy: -1.6e22, radius: 1.0e20, tilt: 1.7, type: 'elliptical', color: '#ccd4f0' },
];

/* ── 전체 천체 목록 (배열 순서 = 그리기 순서: 바깥 구조 → 안쪽) ── */

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
      pos: fromGC(g.dx, g.dy),
      radius: g.radius,
      minE: 21.2,
      maxE: 25.8,
      minPixelRadius: 1.5,
      painter: 'galaxy',
      params: { tilt: g.tilt, type: g.type, color: g.color },
    }),
  ),
  {
    id: 'milky-way',
    label: '우리은하',
    pos: GALAXY_CENTER,
    radius: 50000 * LY,
    minE: 18.8,
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
      pos: fromSun(s.ly * LY, s.angle),
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
    pos: { x: 0, y: 0 },
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
    params: { innerRatio: 0.6, seed: 7, count: 480 },
  },
  {
    id: 'voyager1',
    label: '보이저 1호',
    pos: fromSun(167 * AU, -0.76),
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
      painter: p.painter,
      params: p.params,
    }),
  ),
  {
    id: 'moon',
    label: '달',
    pos: { x: 3.0e8, y: -2.4e8 },
    radius: 1.737e6,
    minE: 7.4,
    maxE: 11.6,
    minPixelRadius: 0.8,
    painter: 'moon',
  },
  {
    id: 'earth',
    label: '지구',
    pos: { x: 0, y: 0 },
    radius: 6.371e6,
    minE: 5.5,
    maxE: 11.8,
    minPixelRadius: 1.1,
    painter: 'earth',
  },
];
