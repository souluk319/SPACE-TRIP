import { mulberry32 } from '../core/math';
import type { BodyParams, PainterId } from '../scene/types';

export type PaintFn = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  params: BodyParams,
) => void;

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

/* ── 지구 ── */

const paintEarth: PaintFn = (ctx, x, y, r, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;

  // 대기 글로우
  const glow = ctx.createRadialGradient(x, y, r * 0.85, x, y, r * 1.3);
  glow.addColorStop(0, 'rgba(110, 180, 255, 0.45)');
  glow.addColorStop(1, 'rgba(110, 180, 255, 0)');
  ctx.fillStyle = glow;
  circle(ctx, x, y, r * 1.3);
  ctx.fill();

  // 바다
  const ocean = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  ocean.addColorStop(0, '#5db9ff');
  ocean.addColorStop(0.55, '#1f6fd0');
  ocean.addColorStop(1, '#0a2f6e');
  ctx.fillStyle = ocean;
  circle(ctx, x, y, r);
  ctx.fill();

  if (r > 6) {
    ctx.save();
    circle(ctx, x, y, r);
    ctx.clip();

    // 대륙 블롭
    ctx.fillStyle = '#3f9d4f';
    const blobs: Array<[number, number, number, number]> = [
      [-0.32, -0.22, 0.42, 0.3],
      [0.28, 0.12, 0.34, 0.42],
      [-0.05, 0.48, 0.26, 0.18],
      [0.45, -0.4, 0.22, 0.2],
    ];
    for (const [bx, by, bw, bh] of blobs) {
      ctx.beginPath();
      ctx.ellipse(x + bx * r, y + by * r, bw * r, bh * r, bx * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + (bx + 0.12) * r, y + (by - 0.1) * r, bw * r * 0.6, bh * r * 0.7, by, 0, Math.PI * 2);
      ctx.fill();
    }

    // 구름
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    const clouds: Array<[number, number, number, number, number]> = [
      [-0.45, 0.1, 0.5, 0.09, 0.4],
      [0.1, -0.5, 0.45, 0.08, -0.3],
      [0.35, 0.42, 0.38, 0.07, 0.2],
      [-0.15, -0.15, 0.3, 0.06, 0.9],
    ];
    for (const [cx, cy, cw, ch, rot] of clouds) {
      ctx.beginPath();
      ctx.ellipse(x + cx * r, y + cy * r, cw * r, ch * r, rot, 0, Math.PI * 2);
      ctx.fill();
    }

    // 명암 경계 (밤 쪽)
    const night = ctx.createLinearGradient(x - r, y, x + r, y);
    night.addColorStop(0, 'rgba(2, 6, 20, 0)');
    night.addColorStop(0.62, 'rgba(2, 6, 20, 0)');
    night.addColorStop(1, 'rgba(2, 6, 20, 0.6)');
    ctx.fillStyle = night;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    ctx.restore();
  }

  ctx.restore();
};

/* ── 달 ── */

const paintMoon: PaintFn = (ctx, x, y, r, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;

  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#d8d8d2');
  g.addColorStop(0.7, '#9a9a94');
  g.addColorStop(1, '#5e5e5a');
  ctx.fillStyle = g;
  circle(ctx, x, y, r);
  ctx.fill();

  if (r > 4) {
    ctx.save();
    circle(ctx, x, y, r);
    ctx.clip();
    const rand = mulberry32(42);
    ctx.fillStyle = 'rgba(90, 90, 88, 0.5)';
    for (let i = 0; i < 7; i++) {
      const mx = x + (rand() * 1.5 - 0.75) * r;
      const my = y + (rand() * 1.5 - 0.75) * r;
      circle(ctx, mx, my, (0.1 + rand() * 0.2) * r);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
};

/* ── 태양 ── */

const paintSun: PaintFn = (ctx, x, y, r, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;

  const glowR = Math.max(r * 2.6, r + 14);
  const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, glowR);
  glow.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
  glow.addColorStop(0.4, 'rgba(255, 190, 90, 0.35)');
  glow.addColorStop(1, 'rgba(255, 150, 40, 0)');
  ctx.fillStyle = glow;
  circle(ctx, x, y, glowR);
  ctx.fill();

  const body = ctx.createRadialGradient(x, y, 0, x, y, r);
  body.addColorStop(0, '#fffdf2');
  body.addColorStop(0.6, '#ffd95e');
  body.addColorStop(1, '#ff9a2a');
  ctx.fillStyle = body;
  circle(ctx, x, y, r);
  ctx.fill();

  ctx.restore();
};

/* ── 암석 행성 ── */

const paintRocky: PaintFn = (ctx, x, y, r, alpha, params) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  const c1 = String(params.color1 ?? '#caa');
  const c2 = String(params.color2 ?? '#866');

  if (r < 3) {
    ctx.fillStyle = c1;
    circle(ctx, x, y, r);
    ctx.fill();
  } else {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    circle(ctx, x, y, r);
    ctx.fill();
  }
  ctx.restore();
};

/* ── 가스 행성 (+ 고리) ── */

const paintGasGiant: PaintFn = (ctx, x, y, r, alpha, params) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  const c1 = String(params.color1 ?? '#e8caa4');
  const c2 = String(params.color2 ?? '#a87c52');

  if (r < 3) {
    ctx.fillStyle = c1;
    circle(ctx, x, y, r);
    ctx.fill();
    ctx.restore();
    return;
  }

  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  circle(ctx, x, y, r);
  ctx.fill();

  if (r > 6) {
    ctx.save();
    circle(ctx, x, y, r);
    ctx.clip();
    ctx.fillStyle = String(params.stripe ?? 'rgba(120, 90, 60, 1)');
    ctx.globalAlpha = alpha * 0.3;
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(x - r, y + i * r * 0.38 - r * 0.07, r * 2, r * 0.14);
    }
    ctx.restore();
  }

  if (params.ring && r > 4) {
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = 'rgba(214, 196, 150, 1)';
    ctx.lineWidth = r * 0.32;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.9, r * 0.62, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
};

/* ── 궤도 ── */

const paintOrbit: PaintFn = (ctx, x, y, r, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(160, 190, 255, 0.28)';
  ctx.lineWidth = 1;
  circle(ctx, x, y, r);
  ctx.stroke();
  ctx.restore();
};

/* ── 카이퍼대 (도넛 점 산포) ── */

const paintBeltRing: PaintFn = (ctx, x, y, r, alpha, params) => {
  ctx.save();
  ctx.globalAlpha = alpha * 0.75;
  ctx.fillStyle = '#9db4d6';
  const rand = mulberry32(Number(params.seed ?? 7));
  const count = Number(params.count ?? 400);
  const innerRatio = Number(params.innerRatio ?? 0.6);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const rad = r * (innerRatio + (1 - innerRatio) * rand());
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    const s = rand() < 0.85 ? 1 : 1.6;
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();
};

/* ── 오르트 구름 (구형 셸) ── */

const paintOortShell: PaintFn = (ctx, x, y, r, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;

  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
  g.addColorStop(0, 'rgba(140, 170, 220, 0)');
  g.addColorStop(0.55, 'rgba(140, 170, 220, 0.1)');
  g.addColorStop(0.85, 'rgba(140, 170, 220, 0.05)');
  g.addColorStop(1, 'rgba(140, 170, 220, 0)');
  ctx.fillStyle = g;
  circle(ctx, x, y, r);
  ctx.fill();

  const rand = mulberry32(99);
  ctx.fillStyle = 'rgba(180, 200, 235, 0.55)';
  for (let i = 0; i < 260; i++) {
    const a = rand() * Math.PI * 2;
    const rad = r * (0.3 + 0.7 * Math.sqrt(rand()));
    ctx.fillRect(x + Math.cos(a) * rad, y + Math.sin(a) * rad, 1, 1);
  }

  ctx.restore();
};

/* ── 별 (점 + 글로우) ── */

const paintStarDot: PaintFn = (ctx, x, y, r, alpha, params) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  const color = String(params.color ?? '#fff');

  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
  glow.addColorStop(0, color);
  glow.addColorStop(0.35, colorWithAlpha(color, 0.25));
  glow.addColorStop(1, colorWithAlpha(color, 0));
  ctx.fillStyle = glow;
  circle(ctx, x, y, r * 3.2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  circle(ctx, x, y, r * 0.75);
  ctx.fill();
  ctx.restore();
};

function colorWithAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* ── 위치 마커 (보이저, "태양은 여기") ── */

const paintMarker: PaintFn = (ctx, x, y, r, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffd34d';
  circle(ctx, x, y, Math.max(r, 2));
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 211, 77, 0.5)';
  ctx.lineWidth = 1.2;
  circle(ctx, x, y, Math.max(r, 2) * 2.4);
  ctx.stroke();
  ctx.restore();
};

/* ── 우리은하 (오프스크린 캐시) ── */

let mwCache: HTMLCanvasElement | null = null;
const MW_TEX = 1024;
const MW_DISK = 460; // 텍스처 내 은하 원반 반지름(px)

function buildMilkyWay(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = cv.height = MW_TEX;
  const c = cv.getContext('2d')!;
  const cx = MW_TEX / 2;
  const rand = mulberry32(2026);

  // 원반 글로우
  const disk = c.createRadialGradient(cx, cx, 0, cx, cx, MW_DISK);
  disk.addColorStop(0, 'rgba(255, 235, 200, 0.35)');
  disk.addColorStop(0.35, 'rgba(170, 185, 255, 0.14)');
  disk.addColorStop(1, 'rgba(150, 170, 255, 0)');
  c.fillStyle = disk;
  c.fillRect(0, 0, MW_TEX, MW_TEX);

  // 나선팔: 로그 나선을 따라 반투명 원
  for (let arm = 0; arm < 4; arm++) {
    const offset = (arm * Math.PI) / 2;
    for (let t = 0; t < 1; t += 0.006) {
      const ang = offset + t * 4.4;
      const rad = 38 * Math.pow(MW_DISK / 38, t);
      const px = cx + Math.cos(ang) * rad;
      const py = cx + Math.sin(ang) * rad * 0.92;
      const size = 26 * (1 - t) + 7;
      const g = c.createRadialGradient(px, py, 0, px, py, size);
      g.addColorStop(0, `rgba(190, 205, 255, ${0.05 * (1 - t * 0.5)})`);
      g.addColorStop(1, 'rgba(190, 205, 255, 0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(px, py, size, 0, Math.PI * 2);
      c.fill();
    }
  }

  // 별 알갱이
  for (let i = 0; i < 2200; i++) {
    const t = Math.pow(rand(), 1.6);
    const ang = rand() * Math.PI * 2;
    const rad = t * MW_DISK;
    const px = cx + Math.cos(ang) * rad;
    const py = cx + Math.sin(ang) * rad * 0.92;
    c.fillStyle = rand() < 0.2 ? 'rgba(200, 215, 255, 0.9)' : 'rgba(255, 250, 235, 0.7)';
    const s = rand() < 0.92 ? 1 : 2;
    c.fillRect(px, py, s, s);
  }

  // 중심 팽대부
  const core = c.createRadialGradient(cx, cx, 0, cx, cx, 95);
  core.addColorStop(0, 'rgba(255, 245, 220, 0.95)');
  core.addColorStop(0.4, 'rgba(255, 225, 175, 0.45)');
  core.addColorStop(1, 'rgba(255, 215, 160, 0)');
  c.fillStyle = core;
  c.beginPath();
  c.arc(cx, cx, 95, 0, Math.PI * 2);
  c.fill();

  return cv;
}

const paintMilkyWay: PaintFn = (ctx, x, y, r, alpha) => {
  if (!mwCache) mwCache = buildMilkyWay();
  ctx.save();
  ctx.globalAlpha = alpha;
  if (r < 5) {
    // 멀어지면 빛나는 타원으로 강등
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(r * 2, 4));
    g.addColorStop(0, 'rgba(255, 240, 215, 0.95)');
    g.addColorStop(1, 'rgba(200, 210, 255, 0)');
    ctx.fillStyle = g;
    circle(ctx, x, y, Math.max(r * 2, 4));
    ctx.fill();
  } else {
    const size = 2 * r * (MW_TEX / 2 / MW_DISK);
    ctx.translate(x, y);
    ctx.rotate(-0.3);
    ctx.drawImage(mwCache, -size / 2, -size / 2, size, size);
  }
  ctx.restore();
};

/* ── 외부 은하 ── */

const paintGalaxy: PaintFn = (ctx, x, y, r, alpha, params) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(Number(params.tilt ?? 0));
  const squash = params.type === 'spiral' ? 0.45 : 0.7;
  ctx.scale(1, squash);

  const color = String(params.color ?? '#cdd8ff');
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, 'rgba(255, 250, 235, 0.95)');
  g.addColorStop(0.3, colorWithAlpha(color, 0.5));
  g.addColorStop(1, colorWithAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/* ── 우주 그물 (오프스크린 캐시) ── */

let webCache: HTMLCanvasElement | null = null;
const WEB_TEX = 1024;
const WEB_R = 470;

function buildCosmicWeb(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = cv.height = WEB_TEX;
  const c = cv.getContext('2d')!;
  const cx = WEB_TEX / 2;
  const rand = mulberry32(777);

  // 은하단 노드
  const nodes: Array<{ x: number; y: number; s: number }> = [];
  for (let i = 0; i < 90; i++) {
    const a = rand() * Math.PI * 2;
    const rad = Math.sqrt(rand()) * WEB_R;
    nodes.push({ x: cx + Math.cos(a) * rad, y: cx + Math.sin(a) * rad, s: 2.5 + rand() * 7 });
  }

  // 필라멘트: 가까운 노드끼리 곡선 연결
  c.strokeStyle = 'rgba(143, 168, 255, 0.07)';
  c.lineWidth = 2;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 170) {
        const mx = (a.x + b.x) / 2 + (rand() - 0.5) * 60;
        const my = (a.y + b.y) / 2 + (rand() - 0.5) * 60;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.quadraticCurveTo(mx, my, b.x, b.y);
        c.stroke();
      }
    }
  }

  // 노드 글로우
  for (const n of nodes) {
    const edge = Math.hypot(n.x - cx, n.y - cx) / WEB_R;
    const fade = 1 - edge * edge * 0.85;
    const g = c.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.s * 3);
    g.addColorStop(0, `rgba(220, 230, 255, ${0.35 * fade})`);
    g.addColorStop(1, 'rgba(180, 200, 255, 0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(n.x, n.y, n.s * 3, 0, Math.PI * 2);
    c.fill();
  }

  // 점 은하들
  for (let i = 0; i < 1400; i++) {
    const a = rand() * Math.PI * 2;
    const rad = Math.sqrt(rand()) * WEB_R;
    const fade = 1 - (rad / WEB_R) ** 2 * 0.8;
    c.fillStyle = `rgba(205, 218, 255, ${(0.1 + rand() * 0.35) * fade})`;
    c.fillRect(cx + Math.cos(a) * rad, cx + Math.sin(a) * rad, 1, 1);
  }

  return cv;
}

const paintCosmicWeb: PaintFn = (ctx, x, y, r, alpha) => {
  if (!webCache) webCache = buildCosmicWeb();
  ctx.save();
  ctx.globalAlpha = alpha;
  const size = 2 * r * (WEB_TEX / 2 / WEB_R);
  ctx.drawImage(webCache, x - size / 2, y - size / 2, size, size);
  ctx.restore();
};

export const PAINTERS: Record<PainterId, PaintFn> = {
  earth: paintEarth,
  moon: paintMoon,
  sun: paintSun,
  rockyPlanet: paintRocky,
  gasGiant: paintGasGiant,
  orbit: paintOrbit,
  beltRing: paintBeltRing,
  oortShell: paintOortShell,
  starDot: paintStarDot,
  marker: paintMarker,
  milkyWay: paintMilkyWay,
  galaxy: paintGalaxy,
  cosmicWeb: paintCosmicWeb,
};
