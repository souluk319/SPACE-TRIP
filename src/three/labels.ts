import * as THREE from 'three';

interface LabelRequest {
  id: string;
  text: string;
  pos: THREE.Vector3;
  alpha: number;
  offsetPx: number;
}

/** Vector3.project() 기반 DOM 한글 라벨 레이어 */
export class LabelLayer {
  private container: HTMLDivElement;
  private pool = new Map<string, HTMLDivElement>();
  private requests: LabelRequest[] = [];
  private v = new THREE.Vector3();

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'labels';
    document.body.appendChild(this.container);
  }

  request(id: string, text: string, pos: THREE.Vector3, alpha: number, offsetPx: number): void {
    this.requests.push({ id, text, pos: pos.clone(), alpha, offsetPx });
  }

  commit(camera: THREE.PerspectiveCamera, w: number, h: number): void {
    const used = new Set<string>();
    const placed: Array<{ x: number; y: number }> = [];

    for (const r of this.requests) {
      this.v.copy(r.pos).project(camera);
      if (this.v.z > 1 || this.v.z < -1) continue;
      const x = ((this.v.x + 1) / 2) * w;
      const y = (1 - (this.v.y + 1) / 2) * h + r.offsetPx;
      if (x < -80 || x > w + 80 || y < -40 || y > h + 40) continue;
      // 화면상 겹침 제거 — 가까운 라벨이 이미 있으면 생략
      if (placed.some((p) => Math.abs(p.x - x) < 64 && Math.abs(p.y - y) < 20)) continue;
      placed.push({ x, y });

      let el = this.pool.get(r.id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'obj-label';
        this.container.appendChild(el);
        this.pool.set(r.id, el);
      }
      if (el.textContent !== r.text) el.textContent = r.text;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translateX(-50%)`;
      el.style.opacity = String(Math.min(r.alpha, 0.9));
      el.style.display = 'block';
      used.add(r.id);
    }

    for (const [id, el] of this.pool) {
      if (!used.has(id)) el.style.display = 'none';
    }
    this.requests.length = 0;
  }
}
