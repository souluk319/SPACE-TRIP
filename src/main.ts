import './style.css';
import { Camera } from './core/camera';
import { bindInput } from './core/input';
import { MILESTONES, currentMilestone } from './scene/milestones';
import { BODIES } from './scene/bodies';
import { renderBodies } from './render/renderer';
import { Starfield } from './render/starfield';
import { Narrator } from './audio/narrator';
import { Hud } from './ui/hud';
import { Controls } from './ui/controls';

const canvas = document.getElementById('space') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let viewW = 0;
let viewH = 0;

function resize(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const camera = new Camera();
const narrator = new Narrator();
narrator.init();

const starfield = new Starfield();

const onGesture = () => narrator.unlock();

const hud = new Hud(MILESTONES, (m) => {
  onGesture();
  camera.jumpTo(m.enterE + 0.4);
});
const controls = new Controls(camera, narrator, MILESTONES, onGesture);
bindInput(canvas, camera, onGesture);

/* 시작 오버레이 — 클릭이 TTS unlock 제스처를 겸한다 */
const overlay = document.getElementById('start-overlay')!;
document.getElementById('start-btn')!.addEventListener('click', () => {
  narrator.unlock();
  overlay.classList.add('hidden');
  // 시작 구간 안내를 즉시 재생
  narrator.requestNarration(currentMilestone(camera.e).narration);
});

let currentId = '';
let lastTime = performance.now();

function frame(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (controls.holdDir !== 0) camera.zoomBy(controls.holdDir * 1.2 * dt);
  camera.update(dt, MILESTONES);

  ctx.fillStyle = '#05070f';
  ctx.fillRect(0, 0, viewW, viewH);
  starfield.draw(ctx, viewW, viewH, camera.e);
  renderBodies(ctx, camera, BODIES, viewW, viewH);

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
