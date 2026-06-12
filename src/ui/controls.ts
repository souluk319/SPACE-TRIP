import type { Camera } from '../core/camera';
import type { Narrator } from '../audio/narrator';
import type { Milestone } from '../scene/types';

export class Controls {
  /** 줌 버튼을 누르고 있는 방향 (-1 확대 / +1 축소 / 0). 메인 루프가 dt와 곱해 적용 */
  holdDir = 0;

  private chipsEl = document.getElementById('chips')!;
  private chipById = new Map<string, HTMLButtonElement>();

  constructor(camera: Camera, narrator: Narrator, milestones: Milestone[], onGesture: () => void) {
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
    };
    bindHold('zoom-in', -1);
    bindHold('zoom-out', 1);

    const voiceBtn = document.getElementById('voice-toggle')!;
    voiceBtn.addEventListener('click', () => {
      onGesture();
      const on = !narrator.enabled;
      narrator.setEnabled(on);
      voiceBtn.setAttribute('aria-pressed', String(on));
      voiceBtn.textContent = on ? '🔊' : '🔇';
    });

    for (const m of milestones) {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = m.title;
      chip.addEventListener('click', () => {
        onGesture();
        camera.jumpTo(m.enterE + 0.4);
      });
      this.chipsEl.appendChild(chip);
      this.chipById.set(m.id, chip);
    }
  }

  highlight(milestoneId: string): void {
    for (const [id, chip] of this.chipById) {
      const active = id === milestoneId;
      chip.classList.toggle('active', active);
      if (active) chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
}
