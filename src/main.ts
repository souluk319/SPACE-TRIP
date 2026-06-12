import './style.css';
import * as THREE from 'three';
import { Camera } from './core/camera';
import { bindInput } from './core/input';
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
bindInput(canvas, camera, rig, onGesture);

/* 시작 오버레이 — 클릭이 TTS unlock 제스처를 겸한다 */
const overlay = document.getElementById('start-overlay')!;
document.getElementById('start-btn')!.addEventListener('click', () => {
  narrator.unlock();
  overlay.classList.add('hidden');
  narrator.requestNarration(currentMilestone(camera.e).narration);
});

const sunVec = new THREE.Vector3();
let currentId = '';
let lastTime = performance.now();

function frame(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (controls.holdDir !== 0) camera.zoomBy(controls.holdDir * 1.2 * dt);
  camera.update(dt, MILESTONES);
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

  hud.updateScale(Math.pow(10, camera.e) * (viewW / viewH));
  hud.updateGauge(camera.e);

  const m = currentMilestone(camera.e);
  if (m.id !== currentId) {
    currentId = m.id;
    hud.showCaption(m);
    controls.highlight(m.id);
    narrator.requestNarration(m.narration);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
