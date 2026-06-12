import { mulberry32 } from '../core/math';

interface BgStar {
  x: number; // 0~1 비율 좌표
  y: number;
  r: number;
  a: number;
  layer: 0 | 1;
}

/**
 * 화면 고정 배경 별밭. 줌 지수에 따라 두 레이어가 교차 페이드되어
 * 어느 스케일에서도 미세한 깊이감이 유지된다.
 */
export class Starfield {
  private stars: BgStar[] = [];

  constructor() {
    const rand = mulberry32(314);
    for (let i = 0; i < 320; i++) {
      this.stars.push({
        x: rand(),
        y: rand(),
        r: 0.4 + rand() * 1.1,
        a: 0.15 + rand() * 0.6,
        layer: rand() < 0.5 ? 0 : 1,
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, e: number): void {
    // 삼각파 교차 페이드 (위상 반대인 두 레이어)
    const phase = (e * 0.45) % 1;
    const tri = (u: number) => 1 - Math.abs(2 * (u - Math.floor(u)) - 1);
    const layerAlpha = [0.35 + 0.65 * tri(phase), 0.35 + 0.65 * tri(phase + 0.5)];

    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (const s of this.stars) {
      ctx.globalAlpha = s.a * layerAlpha[s.layer];
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
