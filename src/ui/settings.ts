import { VOICE_OPTIONS, type Narrator } from '../audio/narrator';
import { sfx } from '../audio/sfx';
import { ambient } from '../audio/ambient';

/** 설정 패널 — 내레이터 음성 선택 + 음성/음악/효과음 토글 */
export class Settings {
  private overlay = document.getElementById('settings-overlay')!;
  private grid = document.getElementById('voice-grid')!;
  private voiceChips = new Map<string, HTMLButtonElement>();

  constructor(narrator: Narrator, onGesture: () => void) {
    document.getElementById('settings-btn')!.addEventListener('click', () => {
      onGesture();
      this.overlay.classList.remove('hidden');
    });
    document.getElementById('settings-close')!.addEventListener('click', () =>
      this.overlay.classList.add('hidden'),
    );
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.overlay.classList.add('hidden');
    });

    for (const v of VOICE_OPTIONS) {
      const chip = document.createElement('button');
      chip.className = 'voice-chip' + (v.id === narrator.voiceId ? ' active' : '');
      chip.innerHTML = `<strong>${v.id}</strong><span>${v.label}</span>`;
      chip.addEventListener('click', () => {
        onGesture();
        narrator.setVoice(v.id);
        for (const [vid, c] of this.voiceChips) c.classList.toggle('active', vid === v.id);
      });
      this.grid.appendChild(chip);
      this.voiceChips.set(v.id, chip);
    }

    const voiceToggle = document.getElementById('set-voice') as HTMLInputElement;
    const musicToggle = document.getElementById('set-music') as HTMLInputElement;
    const sfxToggle = document.getElementById('set-sfx') as HTMLInputElement;

    voiceToggle.checked = narrator.enabled;
    musicToggle.checked = ambient.enabled;
    sfxToggle.checked = sfx.enabled;

    voiceToggle.addEventListener('change', () => {
      onGesture();
      narrator.setEnabled(voiceToggle.checked);
    });
    musicToggle.addEventListener('change', () => {
      onGesture();
      ambient.setEnabled(musicToggle.checked);
    });
    sfxToggle.addEventListener('change', () => {
      sfx.enabled = sfxToggle.checked;
    });
  }
}
