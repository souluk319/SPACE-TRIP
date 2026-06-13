/**
 * 토리 — 오리지널 2D 우주인 가이드 캐릭터 (인라인 SVG).
 * 표정 3상태: normal(설명) / excited(도착·새 스테이지) / cheering(정답·미션 완료).
 * 시작 오버레이(대형)와 가이드 패널 아바타(소형)에서 같은 컴포넌트를 재사용한다.
 */

export type ToriState = 'normal' | 'excited' | 'cheering';

const TORI_SVG = /* svg */ `
<svg viewBox="0 0 120 156" xmlns="http://www.w3.org/2000/svg" aria-label="우주 안내원 토리">
  <defs>
    <linearGradient id="t-suit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#dde6f5"/>
    </linearGradient>
    <radialGradient id="t-glass" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0" stop-color="#dff1ff"/>
      <stop offset="1" stop-color="#a8ccf0"/>
    </radialGradient>
  </defs>

  <!-- 응원 별 파티클 (cheering) -->
  <g class="t-stars" fill="#ffd34d">
    <polygon class="ts1" points="14,38 16.5,44 23,44.5 18,48.5 19.8,55 14,51 8.2,55 10,48.5 5,44.5 11.5,44"/>
    <polygon class="ts2" points="104,30 106,35 111,35.4 107.2,38.6 108.6,44 104,40.8 99.4,44 100.8,38.6 97,35.4 102,35"/>
    <polygon class="ts3" points="96,68 97.6,72 102,72.3 98.8,75 99.9,79.5 96,76.8 92.1,79.5 93.2,75 90,72.3 94.4,72"/>
  </g>

  <!-- 배낭 -->
  <rect x="30" y="74" width="14" height="34" rx="6" fill="#c4d2e8"/>

  <!-- 팔 (기본: 내림) -->
  <g class="t-arms-down">
    <rect x="26" y="84" width="13" height="30" rx="6.5" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5" transform="rotate(14 32 84)"/>
    <rect x="81" y="84" width="13" height="30" rx="6.5" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5" transform="rotate(-14 88 84)"/>
    <circle cx="27" cy="116" r="6.5" fill="#ff8a3d"/>
    <circle cx="93" cy="116" r="6.5" fill="#ff8a3d"/>
  </g>

  <!-- 팔 (응원: 만세) -->
  <g class="t-arms-up">
    <rect x="20" y="58" width="13" height="30" rx="6.5" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5" transform="rotate(145 26 73)"/>
    <rect x="87" y="58" width="13" height="30" rx="6.5" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5" transform="rotate(-145 94 73)"/>
    <circle cx="17" cy="56" r="6.5" fill="#ff8a3d"/>
    <circle cx="103" cy="56" r="6.5" fill="#ff8a3d"/>
  </g>

  <!-- 몸통 -->
  <rect x="36" y="76" width="48" height="46" rx="17" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5"/>
  <!-- 가슴 패널 -->
  <rect x="48" y="88" width="24" height="15" rx="4" fill="#ff8a3d"/>
  <circle cx="54" cy="95.5" r="2.6" fill="#ffe2c4"/>
  <rect x="60" y="93" width="9" height="5" rx="2" fill="#ffe2c4"/>

  <!-- 다리 -->
  <rect x="42" y="118" width="15" height="26" rx="7" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5"/>
  <rect x="63" y="118" width="15" height="26" rx="7" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5"/>
  <rect x="40" y="138" width="19" height="10" rx="5" fill="#ff8a3d"/>
  <rect x="61" y="138" width="19" height="10" rx="5" fill="#ff8a3d"/>

  <!-- 안테나 -->
  <line x1="60" y1="14" x2="60" y2="6" stroke="#b9c8e2" stroke-width="2.5"/>
  <circle cx="60" cy="5" r="3.5" fill="#ffd34d"/>

  <!-- 헬멧 -->
  <circle cx="60" cy="46" r="33" fill="url(#t-suit)" stroke="#b9c8e2" stroke-width="1.5"/>
  <circle cx="60" cy="47" r="26" fill="url(#t-glass)"/>

  <!-- 얼굴 -->
  <circle cx="60" cy="50" r="20" fill="#ffd9b8"/>
  <path d="M42 44 q4 -12 18 -12 q14 0 18 12 q-9 -6 -18 -6 q-9 0 -18 6Z" fill="#6b4a36"/>
  <ellipse cx="48" cy="55" rx="3.4" ry="2" fill="#ffb3a0" opacity="0.8"/>
  <ellipse cx="72" cy="55" rx="3.4" ry="2" fill="#ffb3a0" opacity="0.8"/>

  <!-- 눈: normal -->
  <g class="t-eyes-normal" fill="#2b2320">
    <circle cx="52" cy="49" r="2.8"/>
    <circle cx="68" cy="49" r="2.8"/>
    <circle cx="53" cy="48" r="0.9" fill="#fff"/>
    <circle cx="69" cy="48" r="0.9" fill="#fff"/>
  </g>
  <!-- 눈: excited (반짝) -->
  <g class="t-eyes-excited" fill="#2b2320">
    <polygon points="52,44.5 53.6,48 57,48.6 54.5,51 55.2,54.5 52,52.6 48.8,54.5 49.5,51 47,48.6 50.4,48"/>
    <polygon points="68,44.5 69.6,48 73,48.6 70.5,51 71.2,54.5 68,52.6 64.8,54.5 65.5,51 63,48.6 66.4,48"/>
  </g>
  <!-- 눈: cheering (행복하게 감김) -->
  <g class="t-eyes-cheer" fill="none" stroke="#2b2320" stroke-width="2.2" stroke-linecap="round">
    <path d="M48 50 q4 -5 8 0"/>
    <path d="M64 50 q4 -5 8 0"/>
  </g>

  <!-- 입: normal -->
  <path class="t-mouth-normal" d="M55 58 q5 4.5 10 0" fill="none" stroke="#a05a44" stroke-width="2" stroke-linecap="round"/>
  <!-- 입: excited (오! 벌어짐) -->
  <ellipse class="t-mouth-excited" cx="60" cy="59.5" rx="4.4" ry="5.2" fill="#8a4434"/>
  <!-- 입: cheering (활짝) -->
  <path class="t-mouth-cheer" d="M52 57 q8 9 16 0 Z" fill="#8a4434"/>

  <!-- 헬멧 하이라이트 -->
  <path d="M42 34 q5 -8 14 -9" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export class Tori {
  readonly el: HTMLDivElement;
  private revertTimer: number | null = null;

  constructor(className = '') {
    this.el = document.createElement('div');
    this.el.className = `tori is-normal ${className}`.trim();
    this.el.innerHTML = TORI_SVG;
  }

  setState(state: ToriState, revertMs?: number): void {
    if (this.revertTimer !== null) {
      clearTimeout(this.revertTimer);
      this.revertTimer = null;
    }
    this.el.classList.remove('is-normal', 'is-excited', 'is-cheering');
    this.el.classList.add(`is-${state}`);
    if (revertMs !== undefined && state !== 'normal') {
      this.revertTimer = window.setTimeout(() => {
        this.revertTimer = null;
        this.setState('normal');
      }, revertMs);
    }
  }
}
