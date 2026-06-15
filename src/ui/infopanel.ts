import { FACTS, type BodyFacts } from '../data/facts';

/**
 * 천체 교육 정보 패널 — 현재 보고 있는 천체의 정확한 데이터·사실·지구 비교를 보여준다.
 * 투어 진입/목적지 선택 시 갱신. 사용자가 접거나 펼 수 있다.
 */
export class InfoPanel {
  private el = document.getElementById('infopanel')!;
  private body = document.getElementById('info-body')!;
  private open = true;

  constructor() {
    document.getElementById('info-toggle')!.addEventListener('click', () => this.toggle());
    document.getElementById('info-close')!.addEventListener('click', () => this.setOpen(false));
  }

  show(id: string): void {
    const f = FACTS[id];
    if (!f) return;
    this.body.innerHTML = this.render(f);
    this.el.classList.add('has-content');
  }

  setOpen(open: boolean): void {
    this.open = open;
    document.body.classList.toggle('info-open', open);
  }

  toggle(): void {
    this.setOpen(!this.open);
  }

  private render(f: BodyFacts): string {
    const stats = f.stats
      .map(
        (s) => `
        <div class="info-stat">
          <div class="is-label">${s.label}</div>
          <div class="is-value">${s.value}</div>
          ${s.sub ? `<div class="is-sub">${s.sub}</div>` : ''}
        </div>`,
      )
      .join('');

    const facts = f.facts.map((t) => `<li>${t}</li>`).join('');

    const light = f.lightTime
      ? `<div class="info-light"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>${f.lightTime}</div>`
      : '';

    const compare = f.compare ? this.renderCompare(f.compare) : '';

    return `
      <div class="info-head">
        <div class="info-kind">${f.kind}</div>
        <h2 class="info-name">${f.name}</h2>
        <div class="info-en">${f.nameEn}</div>
      </div>
      <p class="info-tagline">${f.tagline}</p>
      ${light}
      <p class="info-overview">${f.overview}</p>
      <div class="info-section-label">핵심 정보</div>
      <div class="info-stats">${stats}</div>
      ${compare}
      <div class="info-section-label">알아두기</div>
      <ul class="info-facts">${facts}</ul>
    `;
  }

  private renderCompare(c: { size: number; gravity: number }): string {
    // 지구 대비 — 크기는 원, 중력은 막대
    const sizePct = Math.min(c.size, 12) / 12; // 목성(11)까지 한 칸에
    const earthR = Math.min(1, 12) / 12;
    const bigger = c.size >= 1;
    return `
      <div class="info-section-label">지구와 비교</div>
      <div class="info-compare">
        <div class="cmp-row">
          <span class="cmp-k">크기</span>
          <span class="cmp-bars">
            <span class="cmp-circle earth" style="--r:${earthR}"></span>
            <span class="cmp-circle other" style="--r:${sizePct}"></span>
          </span>
          <span class="cmp-v">${c.size >= 1 ? `${c.size.toFixed(c.size < 10 ? 1 : 0)}배 ${bigger ? '큼' : ''}` : `${(1 / c.size).toFixed(1)}배 작음`}</span>
        </div>
        <div class="cmp-row">
          <span class="cmp-k">중력</span>
          <span class="cmp-bar-track"><span class="cmp-bar-fill" style="width:${Math.min(c.gravity / 2.6, 1) * 100}%"></span><span class="cmp-earth-tick" style="left:${(1 / 2.6) * 100}%"></span></span>
          <span class="cmp-v">${c.gravity.toFixed(2)}배</span>
        </div>
      </div>
    `;
  }
}
