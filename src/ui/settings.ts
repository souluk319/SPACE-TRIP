import { VOICE_OPTIONS, type Narrator } from '../audio/narrator';
import { sfx } from '../audio/sfx';

/** 설정 패널 — 토리 목소리 선택 + 음성/효과음 토글 */
export class Settings {
  private overlay = document.getElementById('settings-overlay')!;
  private grid = document.getElementById('voice-grid')!;
  private voiceChips = new Map<string, HTMLButtonElement>();

  constructor(narrator: Narrator, onGesture: () => void) {
    const open = document.getElementById('settings-btn')!;
    const close = document.getElementById('settings-close')!;
    open.addEventListener('click', () => {
      onGesture();
      this.overlay.classList.remove('hidden');
    });
    close.addEventListener('click', () => this.overlay.classList.add('hidden'));
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
        this.highlightVoice(v.id);
      });
      this.grid.appendChild(chip);
      this.voiceChips.set(v.id, chip);
    }

    const voiceToggle = document.getElementById('set-voice') as HTMLInputElement;
    const sfxToggle = document.getElementById('set-sfx') as HTMLInputElement;
    const sideVoiceBtn = document.getElementById('voice-toggle')!;

    voiceToggle.checked = narrator.enabled;
    sfxToggle.checked = sfx.enabled;

    voiceToggle.addEventListener('change', () => {
      onGesture();
      narrator.setEnabled(voiceToggle.checked);
      sideVoiceBtn.setAttribute('aria-pressed', String(voiceToggle.checked));
      sideVoiceBtn.textContent = voiceToggle.checked ? '🔊' : '🔇';
    });
    sfxToggle.addEventListener('change', () => {
      sfx.enabled = sfxToggle.checked;
    });

    // 사이드 음성 버튼과 설정 체크박스 동기화
    sideVoiceBtn.addEventListener('click', () => {
      voiceToggle.checked = narrator.enabled;
      sfxToggle.checked = sfx.enabled;
    });
  }

  private highlightVoice(id: string): void {
    for (const [vid, chip] of this.voiceChips) chip.classList.toggle('active', vid === id);
  }
}
