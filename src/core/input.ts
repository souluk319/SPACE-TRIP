import type { Camera } from './camera';

/**
 * 휠 / 터치 핀치 / 키보드 입력을 카메라 지수 변경으로 매핑.
 * onGesture는 모든 사용자 입력에서 호출 (TTS unlock 백업 경로).
 */
export function bindInput(canvas: HTMLCanvasElement, camera: Camera, onGesture: () => void): void {
  canvas.addEventListener(
    'wheel',
    (ev: WheelEvent) => {
      ev.preventDefault();
      onGesture();
      let d = ev.deltaY;
      if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) d *= 16;
      // ctrlKey가 켜진 휠 = 맥 트랙패드 핀치 제스처 → 감도 높임
      const sens = ev.ctrlKey ? 0.005 : 0.0014;
      camera.zoomBy(d * sens);
    },
    { passive: false },
  );

  let lastDist = 0;
  const touchDist = (t: TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  canvas.addEventListener(
    'touchstart',
    (ev: TouchEvent) => {
      onGesture();
      if (ev.touches.length === 2) lastDist = touchDist(ev.touches);
    },
    { passive: true },
  );

  canvas.addEventListener(
    'touchmove',
    (ev: TouchEvent) => {
      ev.preventDefault();
      if (ev.touches.length !== 2) return;
      const d = touchDist(ev.touches);
      if (lastDist > 0 && d > 0) {
        // 손가락 거리 비율을 그대로 로그로 — 두 배 벌리면 log10(2)만큼 줌인
        camera.zoomBy(-Math.log10(d / lastDist));
      }
      lastDist = d;
    },
    { passive: false },
  );

  canvas.addEventListener('touchend', (ev: TouchEvent) => {
    if (ev.touches.length < 2) lastDist = 0;
  });

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
