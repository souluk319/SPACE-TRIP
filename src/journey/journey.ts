import type { Camera } from '../core/camera';
import type { Narrator } from '../audio/narrator';
import type { TargetLayer } from '../ui/targets';
import {
  COMPLETE_TEXT,
  CORRECT_TEXT,
  INTRO_TEXT,
  JOURNEY_STAGES,
  WRONG_TEXT,
  type JourneyStage,
} from './stages';

type State =
  | 'idle'
  | 'intro'
  | 'travel' // 스테이지 시점으로 이동 중
  | 'mission' // find 미션 진행 중
  | 'mission-travel' // goto 미션 이동 중
  | 'quiz-travel' // 퀴즈 지점으로 이동 중 (스테이지 3)
  | 'quiz'
  | 'explain'
  | 'complete';

/**
 * 가이드형 학습 여정 상태 머신.
 * 시작 → 4개 스테이지(안내 → 미션 → 퀴즈) → 완료 카드 → 자유 탐험.
 */
export class Journey {
  mode: 'journey' | 'free' = 'journey';

  private state: State = 'idle';
  private idx = -1;
  private foundLeft = 0;
  private chainTimer: number | null = null;

  // DOM
  private guideText = document.getElementById('guide-text')!;
  private missionRow = document.getElementById('mission-row')!;
  private missionText = document.getElementById('mission-text')!;
  private quizBox = document.getElementById('quiz-box')!;
  private quizQ = document.getElementById('quiz-q')!;
  private quizChoices = document.getElementById('quiz-choices')!;
  private quizExplain = document.getElementById('quiz-explain')!;
  private nextBtn = document.getElementById('journey-next') as HTMLButtonElement;
  private progressEl = document.getElementById('journey-progress')!;
  private completeOverlay = document.getElementById('complete-overlay')!;

  private camera: Camera;
  private narrator: Narrator;
  private targets: TargetLayer;
  private setTracked: (ids: string[]) => void;

  constructor(
    camera: Camera,
    narrator: Narrator,
    targets: TargetLayer,
    setTracked: (ids: string[]) => void,
  ) {
    this.camera = camera;
    this.narrator = narrator;
    this.targets = targets;
    this.setTracked = setTracked;
    this.nextBtn.addEventListener('click', () => this.onNext());
    document.getElementById('restart-btn')!.addEventListener('click', () => location.reload());
    document.getElementById('explore-btn')!.addEventListener('click', () => this.enterFreeMode());
  }

  /** 시작 오버레이의 "여행 시작" 클릭 직후 */
  start(): void {
    document.body.classList.add('journey-mode');
    this.state = 'intro';
    this.setBubble(INTRO_TEXT);
    this.narrator.requestNarration('j-intro', INTRO_TEXT);
    this.showNext('출발!');
    this.updateProgress();
  }

  /** 매 프레임 — 카메라 도착 감지 */
  update(): void {
    if (this.mode === 'free') return;
    const arrived = Math.abs(this.camera.e - this.camera.eTarget) < 0.06;
    if (!arrived) return;

    if (this.state === 'travel') this.onStageArrived();
    else if (this.state === 'mission-travel') this.onMissionComplete();
    else if (this.state === 'quiz-travel') this.showQuiz();
  }

  private get stage(): JourneyStage {
    return JOURNEY_STAGES[this.idx];
  }

  private beginStage(i: number): void {
    this.idx = i;
    this.state = 'travel';
    const s = this.stage;
    this.hideQuiz();
    this.hideNext();
    this.setBubble(s.guideText);
    this.setMission(s.mission);
    this.narrator.requestNarration(s.audio.stage, s.guideText);
    this.camera.jumpTo(s.viewE);
    // find 미션 타깃은 도착 전에 미리 깔아 화면에 나타나게
    if (s.missionType === 'find' && s.targets) {
      this.setTracked(s.targets.map((t) => t.id));
    }
    this.updateProgress();
  }

  private onStageArrived(): void {
    const s = this.stage;
    if (s.missionType === 'goto') {
      this.state = 'mission-travel';
      if (s.targets) this.setTracked(s.targets.map((t) => t.id));
      if (s.targets) this.targets.set(s.targets, () => {});
      this.camera.jumpTo(s.missionE ?? s.viewE);
    } else if (s.missionType === 'find') {
      this.state = 'mission';
      this.foundLeft = s.targets?.length ?? 0;
      this.targets.set(s.targets ?? [], () => this.onTargetFound());
    } else {
      // watch — 도착 자체가 미션 완료
      this.onMissionComplete();
    }
  }

  private onTargetFound(): void {
    this.foundLeft--;
    if (this.foundLeft > 0) {
      this.setMission(`잘했어! 하나 더 찾아보자 (${this.foundLeft}개 남음)`);
      return;
    }
    this.onMissionComplete();
  }

  private onMissionComplete(): void {
    const s = this.stage;
    this.setMission('미션 완료! ⭐');
    if (s.quizE !== undefined && this.state !== 'quiz-travel') {
      this.state = 'quiz-travel';
      this.setBubble('탐사선도 멀리 갔지만, 별까지의 거리는 훨씬 더 멀어. 별들 사이로 나가보자!');
      this.clearTargets();
      this.camera.jumpTo(s.quizE);
      return;
    }
    this.showQuiz();
  }

  private showQuiz(): void {
    const s = this.stage;
    this.state = 'quiz';
    this.clearTargets();
    this.setBubble('여기서 퀴즈!');
    this.quizBox.hidden = false;
    this.quizQ.textContent = s.quiz.question;
    this.quizExplain.hidden = true;
    this.quizChoices.innerHTML = '';
    s.quiz.choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-choice';
      btn.textContent = choice;
      btn.addEventListener('click', () => this.onAnswer(i, btn));
      this.quizChoices.appendChild(btn);
    });
    this.narrator.requestNarration(s.audio.quiz, s.quiz.question);
  }

  private onAnswer(i: number, btn: HTMLButtonElement): void {
    if (this.state !== 'quiz') return;
    this.state = 'explain';
    const s = this.stage;
    const correct = i === s.quiz.answerIndex;
    btn.classList.add(correct ? 'correct' : 'wrong');
    const buttons = this.quizChoices.querySelectorAll<HTMLButtonElement>('.quiz-choice');
    buttons.forEach((b, bi) => {
      b.disabled = true;
      if (bi === s.quiz.answerIndex) b.classList.add('correct');
    });
    this.setBubble(correct ? CORRECT_TEXT : WRONG_TEXT);
    this.narrator.requestNarration(correct ? 'j-correct' : 'j-wrong', correct ? CORRECT_TEXT : WRONG_TEXT);
    this.quizExplain.textContent = s.quiz.explanation;
    this.quizExplain.hidden = false;
    // 정답 효과음 뒤에 해설 음성
    if (this.chainTimer !== null) clearTimeout(this.chainTimer);
    this.chainTimer = window.setTimeout(() => {
      this.chainTimer = null;
      this.narrator.requestNarration(s.audio.explain, s.quiz.explanation);
    }, 2200);
    this.showNext(this.idx === JOURNEY_STAGES.length - 1 ? '여행 마치기' : '다음으로');
  }

  private onNext(): void {
    this.hideNext();
    if (this.chainTimer !== null) {
      clearTimeout(this.chainTimer);
      this.chainTimer = null;
    }
    if (this.state === 'intro') {
      this.beginStage(0);
    } else if (this.state === 'explain') {
      if (this.idx === JOURNEY_STAGES.length - 1) this.showComplete();
      else this.beginStage(this.idx + 1);
    }
  }

  private showComplete(): void {
    this.state = 'complete';
    this.hideQuiz();
    this.clearTargets();
    this.completeOverlay.classList.remove('hidden');
    this.narrator.requestNarration('j-complete', COMPLETE_TEXT);
  }

  private enterFreeMode(): void {
    this.mode = 'free';
    this.completeOverlay.classList.add('hidden');
    document.body.classList.remove('journey-mode');
    this.clearTargets();
  }

  /* ── DOM 헬퍼 ── */

  private setBubble(text: string): void {
    this.guideText.textContent = text;
  }

  private setMission(text: string | null): void {
    if (text === null) {
      this.missionRow.hidden = true;
    } else {
      this.missionRow.hidden = false;
      this.missionText.textContent = text;
    }
  }

  private hideQuiz(): void {
    this.quizBox.hidden = true;
  }

  private clearTargets(): void {
    this.targets.clear();
    this.setTracked([]);
  }

  private showNext(label: string): void {
    this.nextBtn.textContent = label;
    this.nextBtn.hidden = false;
  }

  private hideNext(): void {
    this.nextBtn.hidden = true;
  }

  private updateProgress(): void {
    const total = JOURNEY_STAGES.length;
    const cur = Math.max(this.idx + 1, 0);
    this.progressEl.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'p-label';
    label.textContent = this.idx >= 0 ? `${cur} / ${total} · ${this.stage.title}` : '여행 준비';
    this.progressEl.appendChild(label);
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'p-dot' + (i < cur ? ' done' : '');
      this.progressEl.appendChild(dot);
    }
  }
}
