import { E_MIN, E_MAX } from '../core/camera';
import type { Milestone } from '../scene/types';
import { formatLength } from './format';

export class Hud {
  private scaleLabel = document.getElementById('scale-label')!;
  private gauge = document.getElementById('gauge')!;
  private gaugeMarker = document.getElementById('gauge-marker')!;
  private captionCard = document.getElementById('caption-card')!;
  private captionTitle = document.getElementById('caption-title')!;
  private captionText = document.getElementById('caption-text')!;
  private swapTimer: number | null = null;

  constructor(milestones: Milestone[], onJump: (m: Milestone) => void) {
    for (const m of milestones) {
      const dot = document.createElement('button');
      dot.className = 'gauge-dot';
      dot.title = m.title;
      dot.setAttribute('aria-label', `${m.title} 구간으로 이동`);
      dot.style.left = `${this.toPct(m.enterE)}%`;
      dot.addEventListener('click', () => onJump(m));
      this.gauge.appendChild(dot);
    }
  }

  private toPct(e: number): number {
    const pct = ((e - E_MIN) / (E_MAX - E_MIN)) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }

  updateScale(widthMeters: number): void {
    this.scaleLabel.textContent = `화면 폭: ${formatLength(widthMeters)}`;
  }

  updateGauge(e: number): void {
    this.gaugeMarker.style.left = `${this.toPct(e)}%`;
  }

  showCaption(m: Milestone): void {
    // 짧은 페이드로 전환
    this.captionCard.classList.add('swap');
    if (this.swapTimer !== null) clearTimeout(this.swapTimer);
    this.swapTimer = window.setTimeout(() => {
      this.captionTitle.textContent = m.title;
      this.captionText.textContent = m.caption;
      this.captionCard.classList.remove('swap');
      this.swapTimer = null;
    }, 180);
  }
}
