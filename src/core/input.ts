import type { Camera } from './camera';
import type { OrbitRig } from '../three/orbitRig';

const ROT = 0.0052; // rad/px

/**
 * 입력 라우팅:
 * - 휠 / ctrl+휠(트랙패드 핀치) → 줌 지수 e
 * - 포인터 1개 드래그 → 시점 궤도 회전 (임계 4px, 릴리즈 관성)
 * - 포인터 2개 핀치 → 줌 지수 e (로그 비율)
 * - 키보드 +/- → e
 */
export function bindInput(
  canvas: HTMLCanvasElement,
  camera: Camera,
  rig: OrbitRig,
  onGesture: () => void,
): void {
  canvas.addEventListener(
    'wheel',
    (ev: WheelEvent) => {
      ev.preventDefault();
      onGesture();
      let d = ev.deltaY;
      if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) d *= 16;
      const sens = ev.ctrlKey ? 0.005 : 0.0014;
      camera.zoomBy(d * sens);
    },
    { passive: false },
  );

  const pointers = new Map<number, { x: number; y: number }>();
  let dragging = false;
  let downX = 0;
  let downY = 0;
  let pinchDist = 0;
  let vAz = 0;
  let vEl = 0;
  let lastMove = 0;

  canvas.addEventListener('pointerdown', (ev: PointerEvent) => {
    onGesture();
    canvas.setPointerCapture(ev.pointerId);
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pointers.size === 1) {
      dragging = false;
      downX = ev.clientX;
      downY = ev.clientY;
      vAz = 0;
      vEl = 0;
      lastMove = performance.now();
    } else if (pointers.size === 2) {
      dragging = false;
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });

  canvas.addEventListener('pointermove', (ev: PointerEvent) => {
    const p = pointers.get(ev.pointerId);
    if (!p) return;

    if (pointers.size === 1) {
      const dx = ev.clientX - p.x;
      const dy = ev.clientY - p.y;
      if (!dragging && Math.hypot(ev.clientX - downX, ev.clientY - downY) > 4) dragging = true;
      if (dragging && (dx !== 0 || dy !== 0)) {
        rig.rotateBy(-dx * ROT, -dy * ROT);
        const now = performance.now();
        const dtm = Math.max((now - lastMove) / 1000, 0.008);
        lastMove = now;
        vAz = 0.7 * vAz + 0.3 * ((-dx * ROT) / dtm);
        vEl = 0.7 * vEl + 0.3 * ((-dy * ROT) / dtm);
      }
      p.x = ev.clientX;
      p.y = ev.clientY;
    } else if (pointers.size === 2) {
      p.x = ev.clientX;
      p.y = ev.clientY;
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0 && d > 0) camera.zoomBy(-Math.log10(d / pinchDist));
      pinchDist = d;
    }
  });

  const release = (ev: PointerEvent) => {
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0 && dragging) {
      rig.fling(vAz, vEl);
      dragging = false;
    }
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key === '+' || ev.key === '=' || ev.key === 'ArrowUp') {
      onGesture();
      camera.zoomBy(-0.12);
    } else if (ev.key === '-' || ev.key === '_' || ev.key === 'ArrowDown') {
      onGesture();
      camera.zoomBy(0.12);
    }
  });
}
