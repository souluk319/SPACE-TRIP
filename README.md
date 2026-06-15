# 우주여행 (Space Trip)

지구에서 관측 가능한 우주의 끝까지, 천체를 하나씩 가까이 들여다보며 배우는
**시네마틱 우주 교육 웹페이지**입니다. 실사 텍스처 3D, 다큐멘터리 내레이션,
천체별 정확한 데이터 패널로 구성됩니다.

## 핵심 경험

- **17개 챕터 투어** — 지구 · 달 · 수성 · 금성 · 화성 · 목성 · 토성 · 천왕성 · 해왕성 · 태양을
  하나씩 화면 가득 보여준 뒤, 태양계 → 카이퍼대 → 오르트 구름 → 이웃 별 → 우리은하 →
  국부은하군 → 관측 가능한 우주로 스케일을 넓힙니다.
- **천체 교육 정보 패널** — 각 천체의 종류·개요·핵심 수치(지름·거리·공전/자전 주기·기온·중력·
  위성)·**지구와 크기/중력 비교 시각화**·빛 도달 시간·핵심 사실. 데이터는 NASA Planetary
  Fact Sheet 기준.
- **다큐멘터리 내레이션** — 오픈소스 온디바이스 TTS(Supertonic 3)로 사전 생성한 한국어 해설.
  10가지 목소리 중 선택 가능. 내레이션이 끝나면 다음 천체로 자연스럽게 이동.
- **자유 탐험** — 목적지 메뉴로 어느 천체든 즉시 이동, 줌·드래그로 둘러보기. 줌해도 초점이
  선택한 천체에 유지됩니다.

## 기술

- **Vite + TypeScript + Three.js** (vanilla, 프레임워크 없음)
- **로그 스케일 줌 엔진** — 화면 세로 = 10^e 미터. 매 프레임 천체를 재스케일해 20여 자릿수의
  스케일을 부동소수점 정밀도 안에서 다룸 (`src/core/camera.ts`, `src/three/rescale.ts`)
- **시네마틱 포스트프로세싱** — UnrealBloom + 피사계 심도 + 갓레이 + 렌즈플레어 + 필름 그레인
  (`src/three/post.ts`)
- **절차적 사운드** — WebAudio 합성 앰비언트 패드 + UI 효과음 (에셋 의존 없음)
- **실사 텍스처** — Solar System Scope (CC BY 4.0), 지구는 8K 주간/야간/구름 + 주야 혼합 셰이더

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

## 디렉터리

```
src/
  core/        로그 줌 카메라 · 입력 · 자유 탐험
  cinematic/   투어 컨트롤러 · 스톱 정의
  data/        천체 교육 데이터 (facts.ts)
  three/       Stage · 렌더 재스케일 · 포스트프로세싱 · 천체 오브젝트
  audio/       내레이터(TTS 재생) · 앰비언트 · 효과음
  ui/          정보 패널 · HUD · 컨트롤 · 설정
scripts/       내레이션 음성 생성 (Supertonic)
public/
  textures/    행성·은하수 텍스처 (CC BY 4.0)
  audio/       사전 생성 내레이션 (보이스별)
  fonts/       Pretendard
```

## 크레딧

- 행성·은하수 텍스처 — [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0)
- 음성 합성 — [Supertonic](https://github.com/supertone-inc/supertonic) (오픈소스 온디바이스 TTS)
- 폰트 — Pretendard
- 데이터 — NASA Planetary Fact Sheet
