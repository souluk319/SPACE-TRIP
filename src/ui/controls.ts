import type { Camera } from '../core/camera';
import type { Narrator } from '../audio/narrator';
import { sfx } from '../audio/sfx';
import { ambient } from '../audio/ambient';

/** 줌 버튼(홀드) + 마스터 음소거 토글 */
export class Controls {
  /** 줌 버튼을 누르고 있는 방향 (-1 확대 / +1 축소 / 0). 메인 루프가 dt와 곱해 적용 */
  holdDir = 0;

  constructor(_camera: Camera, narrator: Narrator, onGesture: () => void) {
    const bindHold = (id: string, dir: number) => {
      const btn = document.getElementById(id)!;
      const start = (ev: Event) => {
        ev.preventDefault();
        onGesture();
        this.holdDir = dir;
      };
      const stop = () => {
        this.holdDir = 0;
      };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', stop);
      btn.addEventListener('pointerleave', stop);
      btn.addEventListener('pointercancel', stop);
      window.addEventListener('pointerup', stop);
      window.addEventListener('blur', stop);
    };
    bindHold('zoom-in', -1);
    bindHold('zoom-out', 1);

    // 마스터 음소거 (음성·음악·효과음 전부)
    const muteBtn = document.getElementById('mute-btn')!;
    const use = muteBtn.querySelector('use')!;
    let muted = false;
    muteBtn.addEventListener('click', () => {
      onGesture();
      muted = !muted;
      narrator.setEnabled(!muted);
      sfx.enabled = !muted;
      ambient.setEnabled(!muted);
      muteBtn.setAttribute('aria-pressed', String(muted));
      muteBtn.setAttribute('aria-label', muted ? '소리 켜기' : '소리 끄기');
      use.setAttribute('href', muted ? '#ic-audio-off' : '#ic-audio-on');
    });
  }
}
