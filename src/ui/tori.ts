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
      <stop offset="0.6" stop-color="#eef2f8"/>
      <stop offset="1" stop-color="#c8d2e0"/>
    </linearGradient>
    <radialGradient id="t-visor" cx="0.42" cy="0.3" r="0.85">
      <stop offset="0" stop-color="#ffe39a"/>
      <stop offset="0.5" stop-color="#eaa53e"/>
      <stop offset="1" stop-color="#9c5e18"/>
    </radialGradient>
  </defs>

  <!-- 응원 별 파티클 (cheering) -->
  <g class="t-stars" fill="#ffd34d">
    <polygon class="ts1" points="14,38 16.5,44 23,44.5 18,48.5 19.8,55 14,51 8.2,55 10,48.5 5,44.5 11.5,44"/>
    <polygon class="ts2" points="104,30 106,35 111,35.4 107.2,38.6 108.6,44 104,40.8 99.4,44 100.8,38.6 97,35.4 102,35"/>
    <polygon class="ts3" points="96,72 97.6,76 102,76.3 98.8,79 99.9,83.5 96,80.8 92.1,83.5 93.2,79 90,76.3 94.4,76"/>
  </g>

  <!-- 배낭(PLSS) -->
  <rect x="34" y="74" width="52" height="44" rx="14" fill="#cfd8e4"/>

  <!-- 팔 (기본: 내림) — 빨간 관절 -->
  <g class="t-arms-down">
    <rect x="25" y="82" width="15" height="34" rx="7.5" fill="url(#t-suit)" stroke="#b0bcce" stroke-width="1.5" transform="rotate(13 32 82)"/>
    <rect x="80" y="82" width="15" height="34" rx="7.5" fill="url(#t-suit)" stroke="#b0bcce" stroke-width="1.5" transform="rotate(-13 88 82)"/>
    <rect x="27" y="88" width="11" height="6" rx="2" fill="#3a6cc0" transform="rotate(13 32 82)"/>
    <rect x="82" y="88" width="11" height="6" rx="2" fill="#d83a3a" transform="rotate(-13 88 82)"/>
    <circle cx="25" cy="118" r="7.5" fill="#e8462e"/>
    <circle cx="95" cy="118" r="7.5" fill="#e8462e"/>
    <circle cx="25" cy="118" r="4" fill="#b02a18"/>
    <circle cx="95" cy="118" r="4" fill="#b02a18"/>
  </g>

  <!-- 팔 (응원: 만세) -->
  <g class="t-arms-up">
    <rect x="18" y="54" width="15" height="34" rx="7.5" fill="url(#t-suit)" stroke="#b0bcce" stroke-width="1.5" transform="rotate(146 25 70)"/>
    <rect x="87" y="54" width="15" height="34" rx="7.5" fill="url(#t-suit)" stroke="#b0bcce" stroke-width="1.5" transform="rotate(-146 95 70)"/>
    <circle cx="15" cy="52" r="7.5" fill="#e8462e"/>
    <circle cx="105" cy="52" r="7.5" fill="#e8462e"/>
    <circle cx="15" cy="52" r="4" fill="#b02a18"/>
    <circle cx="105" cy="52" r="4" fill="#b02a18"/>
  </g>

  <!-- 다리 -->
  <rect x="42" y="120" width="16" height="26" rx="8" fill="url(#t-suit)" stroke="#b0bcce" stroke-width="1.5"/>
  <rect x="62" y="120" width="16" height="26" rx="8" fill="url(#t-suit)" stroke="#b0bcce" stroke-width="1.5"/>
  <rect x="40" y="140" width="20" height="11" rx="4" fill="#e8462e"/>
  <rect x="60" y="140" width="20" height="11" rx="4" fill="#e8462e"/>

  <!-- 몸통 -->
  <rect x="34" y="74" width="52" height="50" rx="18" fill="url(#t-suit)" stroke="#b0bcce" stroke-width="1.8"/>
  <!-- 가슴 컨트롤 패널 -->
  <rect x="44" y="84" width="32" height="26" rx="5" fill="#d8e0ec" stroke="#a8b4c8" stroke-width="1.2"/>
  <rect x="47" y="88" width="13" height="8" rx="2" fill="#4a8c5a"/>
  <circle cx="50.5" cy="92" r="1.5" fill="#7dffa3"/>
  <rect x="47" y="99" width="26" height="2.6" rx="1.3" fill="#9aa8be"/>
  <rect x="47" y="103.5" width="18" height="2.6" rx="1.3" fill="#9aa8be"/>
  <circle cx="69" cy="90" r="3" fill="#3a6cc0"/>
  <circle cx="69" cy="100" r="3" fill="#eaa53e"/>
  <!-- 어깨 카메라/조명 -->
  <rect x="28" y="76" width="9" height="22" rx="3.5" fill="#d0d8e4" stroke="#a8b4c8" stroke-width="1.2"/>
  <rect x="83" y="76" width="9" height="22" rx="3.5" fill="#d0d8e4" stroke="#a8b4c8" stroke-width="1.2"/>

  <!-- 목 링 -->
  <rect x="36" y="62" width="48" height="13" rx="6.5" fill="#dfe6f0" stroke="#a8b4c8" stroke-width="1.5"/>

  <!-- 안테나 -->
  <line x1="60" y1="13" x2="60" y2="5" stroke="#b0bcce" stroke-width="2.5"/>
  <circle cx="60" cy="4" r="3.5" fill="#ff5a3d"/>

  <!-- 헬멧 -->
  <circle cx="60" cy="44" r="34" fill="#f4f7fc" stroke="#c0ccdc" stroke-width="3"/>
  <!-- 사이드 라이트 -->
  <rect x="20" y="32" width="10" height="26" rx="4" fill="#d0d8e4" stroke="#a8b4c8" stroke-width="1.2"/>
  <rect x="90" y="32" width="10" height="26" rx="4" fill="#d0d8e4" stroke="#a8b4c8" stroke-width="1.2"/>
  <!-- 금색 바이저 (위쪽 절반) -->
  <path d="M34 46 a26 26 0 0 1 52 0 a26 19 0 0 1 -52 0Z" fill="url(#t-visor)" stroke="#8c5618" stroke-width="2"/>
  <ellipse cx="48" cy="36" rx="11" ry="7" fill="#fff" opacity="0.42"/>

  <!-- 얼굴 (바이저 아래로 보임) -->
  <circle cx="60" cy="52" r="19" fill="#ffd9b8"/>
  <path d="M44 47 q4 -11 16 -11 q12 0 16 11 q-8 -5 -16 -5 q-8 0 -16 5Z" fill="#6b4a36"/>
  <ellipse cx="49" cy="56" rx="3.2" ry="2" fill="#ffb3a0" opacity="0.8"/>
  <ellipse cx="71" cy="56" rx="3.2" ry="2" fill="#ffb3a0" opacity="0.8"/>

  <!-- 눈: normal -->
  <g class="t-eyes-normal" fill="#2b2320">
    <circle cx="53" cy="51" r="2.7"/>
    <circle cx="67" cy="51" r="2.7"/>
    <circle cx="54" cy="50" r="0.9" fill="#fff"/>
    <circle cx="68" cy="50" r="0.9" fill="#fff"/>
  </g>
  <!-- 눈: excited (반짝) -->
  <g class="t-eyes-excited" fill="#2b2320">
    <polygon points="53,46.5 54.6,50 58,50.6 55.5,53 56.2,56.5 53,54.6 49.8,56.5 50.5,53 48,50.6 51.4,50"/>
    <polygon points="67,46.5 68.6,50 72,50.6 69.5,53 70.2,56.5 67,54.6 63.8,56.5 64.5,53 62,50.6 65.4,50"/>
  </g>
  <!-- 눈: cheering (행복하게 감김) -->
  <g class="t-eyes-cheer" fill="none" stroke="#2b2320" stroke-width="2.2" stroke-linecap="round">
    <path d="M49 52 q4 -5 8 0"/>
    <path d="M63 52 q4 -5 8 0"/>
  </g>

  <!-- 입: normal -->
  <path class="t-mouth-normal" d="M55 60 q5 4.5 10 0" fill="none" stroke="#a05a44" stroke-width="2" stroke-linecap="round"/>
  <!-- 입: excited (오! 벌어짐) -->
  <ellipse class="t-mouth-excited" cx="60" cy="61.5" rx="4.2" ry="5" fill="#8a4434"/>
  <!-- 입: cheering (활짝) -->
  <path class="t-mouth-cheer" d="M52 59 q8 9 16 0 Z" fill="#8a4434"/>
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
