/** ?debug=1 — 실폰 검증용 내부 상태 패널 */
export class DebugPanel {
  private el: HTMLDivElement | null = null;

  constructor() {
    if (new URLSearchParams(location.search).get('debug') !== '1') return;
    this.el = document.createElement('div');
    this.el.id = 'debug-panel';
    document.body.appendChild(this.el);
  }

  update(info: Record<string, string>): void {
    if (!this.el) return;
    this.el.textContent = Object.entries(info)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  }
}
