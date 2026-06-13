# Space Journey Edu Build Spec

## Build target

Build the minimum useful educational web MVP:

```text
Start -> 4 guided space stages -> missions/checkpoints -> completion card
```

The result should feel like a short interactive lesson, not a generic 3D space playground.

## Recommended stack

- Vite
- TypeScript
- Three.js or Canvas 2D
- Plain HTML/CSS UI
- Static deployment

Use Three.js only if it helps the guided journey. Do not let 3D complexity dominate the MVP.

## Core app structure

Suggested files:

```text
src/
  main.ts
  stages.ts
  scene.ts
  guide.ts
  quiz.ts
  styles.css
```

## Required screens

### 1. Start screen

Content:

- Title: `우주여행`
- Subtitle: `지구에서 은하까지, 5분 동안 떠나는 스케일 여행`
- Main visual: a human guide in a spacesuit floating in front of Earth
- Guide speech bubble:
  - `안녕, 우주여행은 처음이지?`
  - `오늘은 지구에서 출발해서 은하까지 가볼 거야.`
  - `걱정 마. 내가 길을 알려줄게.`
- Button: `출발하기`
- Small note: `지구에서 은하까지 5분 여행`

The start screen should be an invitation scene. Do not start with a science lecture.

### 2. Journey screen

Required elements:

- Space scene
- Guide character panel
- Stage title
- Short explanation text
- Mission text
- Next button or stage action
- Progress indicator: `1 / 4`
- Optional simple quiz choices

### 3. Completion screen

Content:

- `오늘의 우주여행 완료`
- 4 learned concepts summary
- Button: `다시 여행하기`

## Stage schema

Use structured data:

```ts
type Stage = {
  id: string;
  title: string;
  scaleLabel: string;
  concept: string;
  guideText: string;
  mission: string;
  quiz?: {
    question: string;
    choices: string[];
    answerIndex: number;
    explanation: string;
  };
};
```

## Stage content

### Stage 1

```text
title: 지구와 달
concept: 달은 가까워 보이지만 지구에서 아주 멀다.
mission: 달까지 이동해보자.
quiz: 달은 지구보다 클까, 작을까?
```

### Stage 2

```text
title: 태양계
concept: 행성들은 태양 주변을 돌고, 서로 멀리 떨어져 있다.
mission: 화성과 목성을 찾아보자.
quiz: 태양계에서 가장 큰 행성은?
```

### Stage 3

```text
title: 태양계 바깥
concept: 보이저 1호도 멀리 갔지만, 별까지의 거리는 훨씬 더 멀다.
mission: 보이저 1호를 찾아보자.
quiz: 태양도 별일까?
```

### Stage 4

```text
title: 우리은하
concept: 은하는 수많은 별들의 모임이다.
mission: 우리은하를 바라보자.
quiz: 은하는 별 하나일까, 별들의 모임일까?
```

## Interaction design

MVP interaction should be simple:

- Start button begins the journey.
- Stage navigation is guided.
- Child should not need to know zoom/pinch/drag to complete the lesson.
- Optional drag/zoom can exist, but the main journey must work with simple buttons.

Recommended controls:

- `다음으로`
- `다시 보기`
- quiz choice buttons
- stage progress chips

## Scene behavior

The scene should support:

- Smooth transition between stages.
- Clear object labels.
- Highlighted target object for missions.
- Reduced object count per stage.
- Stable mobile layout.

Do not show every planet/star/galaxy at once if it confuses the learning path.

## Guide character

The guide does not need to be graphically complex in MVP.

Acceptable MVP:

- A human in a spacesuit, or a simple astronaut-style avatar.
- On the start screen, the guide should float visibly in front of Earth.
- Text bubble.
- Stage-specific guide line.

Future:

- Animated guide.
- Voice narration.
- Child name personalization.

## Copy rules

- Korean only for visible text.
- Short sentences.
- One sentence per line when possible.
- Avoid jargon unless immediately explained.
- Use `광년`, `은하`, `태양계` only with simple context.

## Mobile requirements

- Works at 390px width.
- Buttons are easy to tap.
- Text does not overlap the scene.
- Scene remains visible while guide text is shown.
- No horizontal overflow.

## Acceptance checklist

- App starts with a clear journey start screen.
- Start screen includes a spacesuit guide invitation with `안녕, 우주여행은 처음이지?`
- User can complete all 4 stages with simple taps.
- Each stage has exactly one main learning concept.
- Each stage has one mission.
- At least 3 stages have a checkpoint quiz.
- Completion screen appears.
- Mobile layout is usable.
- Build succeeds.

## Stop line

Stop at guided educational MVP.

Do not add:

- full encyclopedia
- open-ended sandbox
- long object database
- login
- backend
- achievements system
- complex save/share flow
- realistic orbital mechanics

Those can come after the educational journey is proven.
