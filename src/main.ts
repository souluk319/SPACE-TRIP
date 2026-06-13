import './style.css';
import * as THREE from 'three';
import { Camera, E_MIN } from './core/camera';
import { bindInput } from './core/input';
import { FreeLook } from './core/freeLook';
import { MILESTONES, currentMilestone } from './scene/milestones';
import { SUN_POS } from './scene/bodies';
import { Narrator } from './audio/narrator';
import { Hud } from './ui/hud';
import { Controls } from './ui/controls';
import { Stage, VIEW_UNITS } from './three/stage';
import { OrbitRig } from './three/orbitRig';
import { World } from './three/rescale';
import { Environment } from './three/environment';
import { LabelLayer } from './three/labels';
import { sunDirUniform } from './three/objects/earth';
import { Journey } from './journey/journey';
import { JOURNEY_STAGES } from './journey/stages';
import { TargetLayer } from './ui/targets';
import { Tori } from './ui/tori';
import { DebugPanel } from './ui/debug';

const canvas = document.getElementById('space') as HTMLCanvasElement;

const stage = new Stage(canvas);
const world = new World(stage.scene);
const env = new Environment(stage.scene);
const rig = new OrbitRig();
const labels = new LabelLayer();

let viewW = window.innerWidth;
let viewH = window.innerHeight;
window.addEventListener('resize', () => {
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  stage.resize(viewW, viewH);
});

const camera = new Camera();
const narrator = new Narrator();
narrator.init();

const onGesture = () => narrator.unlock();

const hud = new Hud(MILESTONES, (m) => {
  onGesture();
  camera.jumpTo(m.enterE + 0.4);
});
const controls = new Controls(camera, narrator, MILESTONES, onGesture);

const guideTori = new Tori();
const avatarEl = document.getElementById('guide-avatar')!;
avatarEl.textContent = '';
avatarEl.appendChild(guideTori.el);

const targets = new TargetLayer();
const journey = new Journey(camera, narrator, targets, (ids) => world.setTracked(ids), guideTori);

const freeLook = new FreeLook();
bindInput(canvas, camera, rig, onGesture, {
  isFree: () => journey.mode === 'free',
  onZoomAt: (px, py) => freeLook.onZoomAt(px, py),
  onTap: (px, py) => {
    const hit = world.pickAt(px, py, camera.e, camera.center, stage.camera, viewW, viewH);
    if (hit) camera.focusOn(hit.pos);
  },
});

/* 지구로 돌아가기 (자유 탐험 전용) */
document.getElementById('home-btn')!.addEventListener('click', () => {
  onGesture();
  camera.jumpTo(E_MIN + 0.2);
});

if (import.meta.env.DEV) {
  (window as unknown as { __st?: object }).__st = { camera, world, journey };
}

const debugPanel = new DebugPanel();

/* ── 오프닝 초대장 — 토리가 지구 앞에 떠서 말을 건다 ── */
const overlay = document.getElementById('start-overlay')!;
const inviteTori = new Tori('tori-float');
document.getElementById('invite-tori')!.appendChild(inviteTori.el);

const OPEN_LINES = [
  { id: 'j-open1', text: '안녕, 우주여행은 처음이지?' },
  { id: 'j-open2', text: '오늘은 지구에서 출발해서 은하까지 가볼 거야.' },
  { id: 'j-open3', text: '걱정 마. 내가 길을 알려줄게.' },
];
const inviteText = document.getElementById('invite-text')!;
let openIdx = 0;

function showOpenLine(i: number, voice: boolean): void {
  openIdx = i;
  inviteText.textContent = OPEN_LINES[i].text;
  if (voice) narrator.requestNarration(OPEN_LINES[i].id, OPEN_LINES[i].text);
}
showOpenLine(0, false);

const openTimer = window.setInterval(() => {
  if (openIdx < OPEN_LINES.length - 1) showOpenLine(openIdx + 1, true);
  else window.clearInterval(openTimer);
}, 3000);

document.getElementById('invite-bubble')!.addEventListener('click', () => {
  narrator.unlock(); // 탭 진행 = TTS unlock 제스처
  inviteTori.setState('excited', 1300);
  showOpenLine((openIdx + 1) % OPEN_LINES.length, true);
});

document.getElementById('start-btn')!.addEventListener('click', () => {
  window.clearInterval(openTimer);
  narrator.unlock();
  narrator.preload([
    'j-open1',
    'j-open2',
    'j-open3',
    'j-correct',
    'j-wrong',
    'j-complete',
    ...JOURNEY_STAGES.flatMap((s) => [s.audio.stage, s.audio.quiz, s.audio.explain]),
    ...MILESTONES.map((m) => m.id),
  ]);
  overlay.classList.add('hidden');
  journey.start();
});

const sunVec = new THREE.Vector3();
let currentId = '';
let lastTime = performance.now();

function frame(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (controls.holdDir !== 0) camera.zoomBy(controls.holdDir * 1.2 * dt);

  const eBefore = camera.e;
  const centerBefore = camera.center;
  camera.stepE(dt);
  if (journey.mode === 'free') {
    freeLook.applyZoomAnchor(camera, eBefore, centerBefore, stage.camera, viewW, viewH);
  }
  camera.resolveCenter(dt, MILESTONES);
  rig.update(dt, stage.camera);

  // 태양 → 포커스 조명 방향
  const m2u = VIEW_UNITS / Math.pow(10, camera.e);
  sunVec.set(
    (SUN_POS.x - camera.center.x) * m2u,
    (SUN_POS.z - camera.center.z) * m2u,
    (SUN_POS.y - camera.center.y) * m2u,
  );
  stage.updateLight(sunVec);

  // 지구 셰이더의 태양 방향 (지구 = 월드 원점 기준)
  if (sunVec.lengthSq() > 1e-8) {
    sunDirUniform.value
      .set(
        sunVec.x + camera.center.x * m2u,
        sunVec.y + camera.center.z * m2u,
        sunVec.z + camera.center.y * m2u,
      )
      .normalize();
  }

  world.update(dt, camera, stage.camera, labels, viewW, viewH);
  env.update(dt, camera.e);
  stage.render();

  journey.update();
  targets.update(world.trackedPos);

  hud.updateScale(Math.pow(10, camera.e) * (viewW / viewH));
  hud.updateGauge(camera.e);

  const dbg = journey.debugInfo();
  debugPanel.update({
    stage: dbg.stage,
    state: dbg.state,
    e: camera.e.toFixed(2),
    focus: camera.hasUserFocus ? 'user' : 'anchor',
    viewport: `${viewW}x${viewH}`,
    audio: narrator.enabled ? 'on' : 'off',
  });

  const m = currentMilestone(camera.e);
  if (m.id !== currentId) {
    currentId = m.id;
    controls.highlight(m.id);
    // 가이드 여정 중에는 토리가 안내 — 자유 탐험 모드에서만 구간 내레이션
    if (journey.mode === 'free') {
      hud.showCaption(m);
      narrator.requestNarration(m.id, m.narration);
    }
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
