import { E_MIN, E_MAX } from '../core/camera';
import type { Milestone } from '../scene/types';
import { formatLength } from './format';

/** 스케일 표시 + 챕터 타임라인 + lower-third 내레이션 자막 */
export class Hud {
  private scaleLabel = document.getElementById('scale-label')!;
  private timeline = document.getElementById('timeline')!;
  private fill = document.getElementById('timeline-fill')!;
  private marker = document.getElementById('timeline-marker')!;
  private lower = document.getElementById('lowerthird')!;
  private chapter = document.getElementById('lt-chapter')!;
  private caption = document.getElementById('lt-caption')!;
  private swapTimer: number | null = null;

  constructor(milestones: Milestone[], onJump: (m: Milestone) => void) {
    for (const m of milestones) {
      const notch = document.createElement('button');
      notch.className = 'timeline-notch';
      notch.title = m.title;
      notch.setAttribute('aria-label', `${m.title}(으)로 이동`);
      notch.style.left = `${this.toPct(m.enterE)}%`;
      notch.addEventListener('click', () => onJump(m));
      this.timeline.appendChild(notch);
    }
    // 시작 시 자막 숨김
    this.lower.style.opacity = '0';
  }

  private toPct(e: number): number {
    return Math.min(Math.max(((e - E_MIN) / (E_MAX - E_MIN)) * 100, 0), 100);
  }

  updateScale(widthMeters: number): void {
    this.scaleLabel.textContent = formatLength(widthMeters);
  }

  updateGauge(e: number): void {
    const pct = this.toPct(e);
    this.marker.style.left = `${pct}%`;
    this.fill.style.width = `${pct}%`;
  }

  showCaption(c: { title: string; caption: string }): void {
    this.lower.style.opacity = '1';
    this.lower.classList.add('swap');
    if (this.swapTimer !== null) clearTimeout(this.swapTimer);
    this.swapTimer = window.setTimeout(() => {
      this.chapter.textContent = c.title;
      this.caption.textContent = c.caption;
      this.lower.classList.remove('swap');
      this.swapTimer = null;
    }, 260);
  }
}
