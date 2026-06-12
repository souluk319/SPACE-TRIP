# Implementation Prompt

Use this prompt when asking Codex, Claude, or another coding agent to build the next version.

```text
Create an educational interactive space journey web app for early elementary children.

The goal is not to make a beautiful space wallpaper. The goal is to help a child understand, in under 5 minutes, the scale difference between Earth, the Moon, the Solar System, nearby stars, and galaxies.

Build a static web MVP with Vite + TypeScript. Use Three.js or Canvas if useful, but the lesson flow is more important than visual complexity.

Required product structure:

1. Start screen
- Title: 우주여행
- Subtitle: 지구에서 은하까지, 5분 동안 떠나는 스케일 여행
- Start button: 여행 시작

2. Guided journey screen
- A visible space scene
- A guide character panel, such as a small astronaut avatar with text
- Stage title
- One short explanation sentence
- One mission per stage
- Progress indicator, such as 1 / 4
- Simple next button
- Quiz/checkpoint choice buttons where applicable

3. Completion screen
- Title: 오늘의 우주여행 완료
- Short summary of what the child learned
- Restart button

Use exactly 4 stages for the MVP:

Stage 1: 지구와 달
- Concept: 달은 가까워 보이지만 지구에서 아주 멀다.
- Mission: 달까지 이동해보자.
- Quiz: 달은 지구보다 클까, 작을까?

Stage 2: 태양계
- Concept: 행성들은 태양 주변을 돌고, 서로 멀리 떨어져 있다.
- Mission: 화성과 목성을 찾아보자.
- Quiz: 태양계에서 가장 큰 행성은?

Stage 3: 태양계 바깥
- Concept: 보이저 1호도 멀리 갔지만, 별까지의 거리는 훨씬 더 멀다.
- Mission: 보이저 1호를 찾아보자.
- Quiz: 태양도 별일까?

Stage 4: 우리은하
- Concept: 은하는 수많은 별들의 모임이다.
- Mission: 우리은하를 바라보자.
- Quiz: 은하는 별 하나일까, 별들의 모임일까?

Visible copy must be Korean, short, and understandable for early elementary children.

Important design rules:
- This must be a guided lesson, not a free exploration simulator.
- Do not show too many objects at once.
- Do not use long explanation paragraphs.
- The user must be able to complete the journey with simple taps.
- Optional drag/zoom is allowed, but it must not be required.
- Mobile layout at 390px width must be usable.
- Text must not overlap or overflow.
- The scene should support clear stage transitions and highlighted targets.

Non-goals:
- no login
- no backend
- no account
- no encyclopedia
- no advanced orbital simulation
- no huge object database

Acceptance criteria:
- npm install works.
- npm run build works.
- The app starts at a journey start screen.
- The user can complete all 4 stages.
- Each stage has one learning concept and one mission.
- At least 3 stages have a quiz/checkpoint.
- A completion screen appears.
- Mobile layout is usable.
```
