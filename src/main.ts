import './style.css';
import * as THREE from 'three';
import { Camera, E_MIN } from './core/camera';
import { bindInput } from './core/input';
import { FreeLook } from './core/freeLook';
import { MILESTONES } from './scene/milestones';
import { SUN_POS } from './scene/bodies';
import { Narrator } from './audio/narrator';
import { ambient } from './audio/ambient';
import { sfx } from './audio/sfx';
import { Hud } from './ui/hud';
import { Controls } from './ui/controls';
import { Settings } from './ui/settings';
import { InfoPanel } from './ui/infopanel';
import { DebugPanel } from './ui/debug';
import { Stage, VIEW_UNITS, IS_MOBILE } from './three/stage';
import { OrbitRig } from './three/orbitRig';
import { World } from './three/rescale';
import { Environment } from './three/environment';
import { LabelLayer } from './three/labels';
import { sunDirUniform } from './three/objects/earth';
import { CinematicTour } from './cinematic/tour';
import { TOUR_STOPS } from './cinematic/stops';
import { preloadBodyTextures } from './three/textures';

const canvas = document.getElementById('space') as HTMLCanvasElement;

// 행성 텍스처를 즉시 받기 시작 (타이틀·인트로 동안 다운로드 완료)
preloadBodyTextures();

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
const tour = new CinematicTour();

/** 모든 사용자 입력 진입점 — 오디오 언락 + 투어 일시정지 */
const onGesture = () => {
  narrator.unlock();
  ambient.start();
  tour.notifyInput(camera);
};

const hud = new Hud(TOUR_STOPS.length);
const controls = new Controls(camera, narrator, onGesture);
new Settings(narrator, onGesture);
const infoPanel = new InfoPanel();

const freeLook = new FreeLook();
bindInput(canvas, camera, rig, onGesture, {
  isFree: () => true,
  onZoomAt: (px, py) => freeLook.onZoomAt(px, py),
  onTap: (px, py) => {
    const hit = world.pickAt(px, py, camera.e, camera.center, stage.camera, viewW, viewH);
    if (hit) camera.focusOn(hit.pos);
  },
});

document.getElementById('home-btn')!.addEventListener('click', () => {
  onGesture();
  camera.jumpTo(E_MIN + 0.2);
});

if (import.meta.env.DEV) {
  (window as unknown as { __st?: object }).__st = { camera, world, tour, narrator };
}
const debugPanel = new DebugPanel();

/* ── 시작 오버레이 + 인트로 돌리인 ── */
const startOverlay = document.getElementById('start-overlay')!;
const endOverlay = document.getElementById('end-overlay')!;
tour.beginIntro(camera);

tour.onStop = (stop) => {
  hud.showCaption(stop);
  hud.updateChapter(tour.index, tour.total);
  infoPanel.show(stop.id);
  narrator.requestNarration(stop.id, stop.narration);
  if (started) sfx.transition();
};
// 내레이션이 끝나면 투어가 여운 뒤 다음으로
narrator.onNarrationEnd = () => tour.notifyNarrationEnd();

const playUse = document.getElementById('nav-play')!.querySelector('use')!;
tour.onPauseChange = (paused) => {
  document.body.classList.toggle('tour-paused', paused);
  playUse.setAttribute('href', paused ? '#ic-play' : '#ic-pause');
};

// 챕터 내비 (‹ ⏯ ›) + 계속 듣기
const resumeAll = () => {
  narrator.unlock();
  ambient.start();
  tour.resume(camera);
};
document.getElementById('nav-prev')!.addEventListener('click', () => {
  resumeAll();
  tour.go(-1, camera);
});
document.getElementById('nav-next')!.addEventListener('click', () => {
  resumeAll();
  tour.go(1, camera);
});
document.getElementById('nav-play')!.addEventListener('click', () => {
  if (tour.isPaused) resumeAll();
  else tour.notifyInput(camera);
});

// 목적지 메뉴 — 어느 천체든 바로 이동
const destOverlay = document.getElementById('dest-overlay')!;
const destList = document.getElementById('dest-list')!;
TOUR_STOPS.forEach((stop, i) => {
  const item = document.createElement('button');
  item.className = 'dest-item';
  item.innerHTML = `<span class="d-idx">${String(i + 1).padStart(2, '0')}</span><span class="d-name">${stop.title}</span>`;
  item.addEventListener('click', () => {
    narrator.unlock();
    ambient.start();
    if (!started) {
      startOverlay.classList.add('hidden');
      document.body.classList.add('started');
      started = true;
      tour.release(camera);
    }
    tour.goTo(i, camera);
    destOverlay.classList.add('hidden');
  });
  destList.appendChild(item);
});
document.getElementById('dest-btn')!.addEventListener('click', () => {
  onGesture();
  destOverlay.classList.remove('hidden');
});
document.getElementById('dest-close')!.addEventListener('click', () =>
  destOverlay.classList.add('hidden'),
);
destOverlay.addEventListener('click', (e) => {
  if (e.target === destOverlay) destOverlay.classList.add('hidden');
});

document.getElementById('start-btn')!.addEventListener('click', () => {
  narrator.unlock();
  ambient.start();
  narrator.preload(TOUR_STOPS.map((s) => s.id));
  startOverlay.classList.add('hidden');
  document.body.classList.add('started');
  started = true;
  infoPanel.setOpen(!IS_MOBILE); // 모바일은 행성을 가리지 않게 기본 닫힘
  tour.release(camera);
});

tour.onEnd = () => endOverlay.classList.remove('hidden');
document.getElementById('restart-btn')!.addEventListener('click', () => {
  endOverlay.classList.add('hidden');
  tour.reset(camera);
});

const sunVec = new THREE.Vector3();
const keyDir = new THREE.Vector3();
const keyLeft = new THREE.Vector3();
let started = false;
let lastTime = performance.now();

function frame(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (controls.holdDir !== 0) {
    onGesture();
    camera.zoomBy(controls.holdDir * 1.2 * dt);
  }

  tour.update(dt, camera);

  const eBefore = camera.e;
  const centerBefore = camera.center;
  camera.stepE(dt);
  freeLook.applyZoomAnchor(camera, eBefore, centerBefore, stage.camera, viewW, viewH);
  camera.resolveCenter(dt, MILESTONES);
  rig.update(dt, stage.camera);

  // 갓레이용 — 실제 태양의 씬 좌표
  const m2u = VIEW_UNITS / Math.pow(10, camera.e);
  sunVec.set(
    (SUN_POS.x - camera.center.x) * m2u,
    (SUN_POS.z - camera.center.z) * m2u,
    (SUN_POS.y - camera.center.y) * m2u,
  );

  // 쇼케이스 조명 — 카메라 기준 상단-좌측 키 라이트로 어느 천체든 일관되게 밝게
  keyDir.copy(stage.camera.position).normalize();
  keyDir.y += 0.55;
  keyLeft.set(0, 1, 0).cross(keyDir).normalize();
  keyDir.addScaledVector(keyLeft, 0.42).normalize();
  stage.updateLight(keyDir);
  sunDirUniform.value.copy(keyDir);

  // 정보 패널이 가린 영역에서 포커스 천체를 비킴 (넓은 화면=오른쪽, 좁은 화면=위)
  let panX = 0;
  let panY = 0;
  if (started && document.body.classList.contains('info-open')) {
    if (viewW > 1024) panX = (188 * VIEW_UNITS) / viewH; // 좌측 패널 → 오른쪽으로
    else panY = (0.24 * viewH * VIEW_UNITS) / viewH; // 하단 시트 → 위로
  }
  rig.setPan(panX, panY);

  world.update(dt, camera, stage.camera, labels, viewW, viewH);
  env.update(dt, camera.e);
  ambient.setDepth(camera.e);
  stage.render(sunVec, camera.e, dt);

  hud.updateScale(Math.pow(10, camera.e) * (viewW / viewH));

  debugPanel.update({
    e: camera.e.toFixed(2),
    focus: camera.hasUserFocus ? 'user' : 'anchor',
    intro: String(tour.inIntro),
    viewport: `${viewW}x${viewH}`,
    audio: narrator.enabled ? 'on' : 'off',
  });

  // 자막·내레이션은 tour.onStop이 구동 (행성 쇼케이스 단위)
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
