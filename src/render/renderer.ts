import { smoothstep } from '../core/math';
import type { Camera } from '../core/camera';
import type { Body } from '../scene/types';
import { PAINTERS } from './painters';

/** 가시 지수 구간 경계에서 페이드 인/아웃 */
function lodAlpha(b: Body, e: number): number {
  return smoothstep(b.minE, b.minE + 0.3, e) * (1 - smoothstep(b.maxE - 0.5, b.maxE, e));
}

export function renderBodies(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  bodies: Body[],
  w: number,
  h: number,
): void {
  const mpp = camera.metersPerPixel(h);

  for (const b of bodies) {
    const alpha = lodAlpha(b, camera.e);
    if (alpha <= 0.01) continue;

    const x = (b.pos.x - camera.center.x) / mpp + w / 2;
    const y = (b.pos.y - camera.center.y) / mpp + h / 2;
    let r = b.radius / mpp;

    // 화면 밖 컬링 (글로우/고리 여유 포함)
    const pad = r * 3 + 140;
    if (x < -pad || x > w + pad || y < -pad || y > h + pad) continue;

    if (r < 0.3 && !b.minPixelRadius) continue;
    if (b.minPixelRadius && r < b.minPixelRadius) r = b.minPixelRadius;

    PAINTERS[b.painter](ctx, x, y, r, alpha, b.params ?? {});

    if (b.label && alpha > 0.45 && r >= 2 && r < h) {
      const labelAlpha = alpha * smoothstep(2, 4, r);
      if (labelAlpha > 0.05) {
        ctx.save();
        ctx.globalAlpha = labelAlpha;
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(215, 230, 255, 0.85)';
        ctx.fillText(b.label, x, y + Math.min(r, 56) + 16);
        ctx.restore();
      }
    }
  }
}
