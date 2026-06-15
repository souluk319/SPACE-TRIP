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
  private navIdx = document.getElementById('nav-idx')!;
  private navTotal = document.getElementById('nav-total')!;
  private swapTimer: number | null = null;

  constructor(stops: number) {
    // 챕터 수만큼 균등 분할 눈금
    for (let i = 0; i < stops; i++) {
      const notch = document.createElement('div');
      notch.className = 'timeline-notch';
      notch.style.left = `${stops > 1 ? (i / (stops - 1)) * 100 : 0}%`;
      this.timeline.appendChild(notch);
    }
    this.lower.style.opacity = '0';
  }

  updateScale(widthMeters: number): void {
    this.scaleLabel.textContent = formatLength(widthMeters);
  }

  /** 챕터 진행도 (천체 idx/total) — 타임라인을 균등 분할로 갱신 */
  updateChapter(idx: number, total: number): void {
    this.navIdx.textContent = String(idx + 1);
    this.navTotal.textContent = String(total);
    const pct = total > 1 ? (idx / (total - 1)) * 100 : 0;
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
