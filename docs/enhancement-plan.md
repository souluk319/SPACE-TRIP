# Space Journey Edu Enhancement Plan

## Current verdict

The latest prototype moved from "space scenery viewer" to "educational guided MVP."

Good progress:

- Guide character exists: `우주 안내원 토리`
- 4-stage journey exists
- Missions exist
- Quizzes exist
- Completion overlay exists
- Free exploration is pushed after completion

Main remaining weakness:

- The first impression still feels like an information page, not a character-led adventure.

The next improvements should focus on product feeling, learning retention, and real child usability.

## Product north star

```text
초등 저학년 아이가 토리와 함께 지구에서 은하까지 5분 여행을 하며,
우주의 스케일을 몸으로 느끼고 4가지 핵심 개념을 기억한다.
```

## Phase 1 - Opening Hook Upgrade

Goal:

Make the first 5 seconds feel like an adventure invitation.

Current issue:

- Start screen still says `우주여행`, `여행 시작`, and `각 단계마다 미션을 완료해보세요`.
- It explains the product before creating emotional entry.
- Tori is present in the journey UI but not strong on the first screen.

Required changes:

- Show a human guide in a spacesuit floating in front of Earth.
- Make Tori visible before the start button.
- Use speech bubble sequence:

```text
안녕, 우주여행은 처음이지?
오늘은 지구에서 출발해서 은하까지 가볼 거야.
걱정 마. 내가 길을 알려줄게.
```

- Change button text from `여행 시작` to `출발하기`.
- Change small text to `지구에서 은하까지 5분 여행`.
- Keep Solar System Scope texture credit visible but secondary.

Acceptance criteria:

- A child sees a character first, not a lesson title first.
- The opening feels safe, friendly, and adventurous.
- No dense science text appears before start.
- Mobile opening layout works at 390px width.

Implementation prompt:

```text
Update the start screen only. Add a large visible spacesuit guide named 토리 floating in front of Earth. Use a speech bubble with these Korean lines: "안녕, 우주여행은 처음이지?", "오늘은 지구에서 출발해서 은하까지 가볼 거야.", "걱정 마. 내가 길을 알려줄게." Change the start button text to "출발하기". The screen should feel like an invitation to an adventure, not an explanation page. Keep mobile 390px layout usable.
```

## Phase 2 - Tori Character System

Goal:

Make Tori feel like a companion, not an emoji label.

Current issue:

- Tori is represented as `🧑‍🚀`.
- This is acceptable for MVP but weak for emotional attachment.

Recommended MVP upgrade:

- Use a simple original 2D astronaut character or SVG/HTML illustration.
- Tori should have at least 3 expression states:
  - normal
  - excited
  - cheering
- Use the state based on lesson moment:
  - normal: explanation
  - excited: arrival/new stage
  - cheering: correct answer/mission complete

Copy direction:

- Tori should speak like a friendly older sibling.
- Short lines only.
- Avoid textbook tone.

Example lines:

```text
좋아, 이제 달까지 가보자.
찾았다! 저게 목성이야.
정답! 너 방금 우주 지식 하나 얻었어.
괜찮아, 틀려도 우주는 도망 안 가.
```

Acceptance criteria:

- Tori's visual identity is recognizable.
- At least three emotional states exist.
- Correct answers and mission completion trigger a cheering response.

## Phase 3 - Learning Retention Upgrade

Goal:

Make the child remember what was learned after the journey ends.

Current issue:

- Completion screen has learned facts, which is good.
- But the app does not yet reinforce the concepts strongly enough during the journey.

Required changes:

- Add a short "remember this" line after each quiz explanation.
- Add one learned badge per stage.
- Completion screen should show earned badges.

Stage badges:

```text
달 거리 탐험가
태양계 길잡이
보이저 추적자
은하 발견자
```

Completion summary:

```text
오늘 얻은 우주 배지
🌙 달 거리 탐험가
☀️ 태양계 길잡이
🛰️ 보이저 추적자
🌌 은하 발견자
```

Acceptance criteria:

- Each stage gives one named badge.
- Completion screen lists badges.
- Child can explain at least one learned fact after finishing.

## Phase 4 - Mission Interaction Polish

Goal:

Make missions feel like active play instead of just navigation.

Current issue:

- Missions exist, but some may still feel like waiting for camera movement or clicking a marker.

Recommended upgrades:

- Add clear target highlight animation.
- Add `찾았다!` feedback when a target is clicked.
- Add progress text for multi-target missions.
- Add short sound or visual feedback after completion.

Mission feedback examples:

```text
달 발견!
화성 찾기 완료. 이제 목성을 찾아보자.
보이저 1호 발견! 엄청 멀리 왔어.
```

Acceptance criteria:

- User always knows what to do next.
- Target markers are obvious on mobile.
- Mission completion feels rewarding.

## Phase 5 - Voice and Sound Direction

Goal:

Use sound to support child engagement without making the app annoying.

Current state:

- Voice toggle exists.
- Narration hooks appear to exist.

Recommended direction:

- Keep voice optional.
- Use short narration only.
- Add subtle stage transition sound.
- Add correct/wrong answer sound.
- Do not autoplay loud audio before user interaction.

Voice style:

- Warm
- Calm
- Playful
- Not overly childish

Acceptance criteria:

- Voice can be turned off.
- No sound starts before user interaction.
- Narration lines match visible guide text.

## Phase 6 - Parent/Teacher Value Layer

Goal:

Make the app useful beyond one-time novelty.

Do not add this before the child journey feels good.

Potential additions:

- Parent summary after completion:

```text
오늘 배운 내용
1. 달은 지구에서 약 38만 km 떨어져 있어요.
2. 행성들은 태양 주변을 돌아요.
3. 태양도 별이에요.
4. 은하는 별들의 모임이에요.
```

- Teacher mode:
  - no voice
  - larger captions
  - stage jump controls

- Printable/shareable completion card later.

Acceptance criteria:

- Parent can understand learning value in 10 seconds.
- Teacher mode does not distract from main child experience.

## Phase 7 - Technical Hardening

Goal:

Make the app testable on real phones and easy to iterate.

Required checks:

- `npm run build` succeeds.
- Desktop Chrome loads without console errors.
- Mobile 390px layout has no text overlap.
- Start screen works on iPhone Safari.
- Stage target buttons are tappable.
- Completion overlay fits small screens.

Recommended debug additions:

- `?debug=1` mode showing:
  - current stage
  - journey state
  - mission state
  - current scale
  - viewport size
  - audio enabled

Acceptance criteria:

- Debug mode helps diagnose mobile issues.
- Product can be reviewed without guessing internal state.

## Priority order

Do this order:

1. Opening Hook Upgrade
2. Tori Character System
3. Learning Retention Upgrade
4. Mission Interaction Polish
5. Voice and Sound Direction
6. Parent/Teacher Value Layer
7. Technical Hardening

Do not jump to more astronomy content before the opening and guide experience feel good.

## Next concrete implementation request

Use this prompt for the next coding loop:

```text
The current app already has a 4-stage guided journey. Do not rebuild the whole app.

Focus only on the next product upgrade:

1. Redesign the start screen as a character invitation scene.
2. Show Tori, a human guide in a spacesuit, floating in front of Earth.
3. Add a speech bubble sequence:
   - 안녕, 우주여행은 처음이지?
   - 오늘은 지구에서 출발해서 은하까지 가볼 거야.
   - 걱정 마. 내가 길을 알려줄게.
4. Change the start button text to 출발하기.
5. Change the small note to 지구에서 은하까지 5분 여행.
6. Update document title and meta description from "우주 끝까지" to the guided Earth-to-galaxy learning journey.
7. Keep the existing 4-stage journey, missions, quizzes, completion screen, and free exploration behavior unchanged.
8. Verify 390px mobile layout has no overlap.

Report what changed, build result, and any remaining visual issues.
```

## What not to do next

- Do not add more stages.
- Do not add more celestial object lists.
- Do not build a full encyclopedia.
- Do not expand to the observable universe again.
- Do not make the controls more complex.
- Do not prioritize visual realism over child comprehension.

The app's next win is emotional entry, not scientific density.
