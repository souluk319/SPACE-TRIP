export interface TargetScreenPos {
  x: number;
  y: number;
  visible: boolean;
}

/** 미션 타깃 — 천체 위에 떠 있는 클릭 가능한 펄스 링 */
export class TargetLayer {
  private container: HTMLDivElement;
  private items = new Map<string, { el: HTMLButtonElement; found: boolean }>();
  private onFound: ((id: string) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'targets';
    document.body.appendChild(this.container);
  }

  set(defs: Array<{ id: string; label: string }>, onFound: (id: string) => void): void {
    this.clear();
    this.onFound = onFound;
    for (const def of defs) {
      const el = document.createElement('button');
      el.className = 'target-marker';
      el.setAttribute('aria-label', `${def.label} 찾기`);
      const label = document.createElement('span');
      label.className = 't-label';
      label.textContent = def.label;
      el.appendChild(label);
      el.addEventListener('click', () => {
        const item = this.items.get(def.id);
        if (!item || item.found) return;
        item.found = true;
        el.classList.add('found');
        this.onFound?.(def.id);
      });
      this.container.appendChild(el);
      this.items.set(def.id, { el, found: false });
    }
  }

  clear(): void {
    this.container.innerHTML = '';
    this.items.clear();
    this.onFound = null;
  }

  /** 매 프레임 — 월드가 계산한 화면 좌표로 마커 배치 */
  update(positions: Map<string, TargetScreenPos>): void {
    for (const [id, item] of this.items) {
      const p = positions.get(id);
      if (!p || !p.visible) {
        item.el.style.display = 'none';
        continue;
      }
      item.el.style.display = 'block';
      item.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`;
    }
  }
}
