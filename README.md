# Space Journey Edu

## One-line

Interactive educational space journey web app for children to understand the scale difference between Earth, the Moon, the Solar System, and galaxies.

## Core idea

The goal is not to make a beautiful space wallpaper. The goal is to help a child understand one thing:

```text
The universe is not just far away. It is built in layers of scale.
```

The app should guide children through a short space trip with missions, simple narration, and checkpoints.

## Opening hook

The first screen should feel like an invitation, not a textbook.

Recommended opening:

```text
A human guide in a spacesuit floats above Earth.
Guide: 안녕, 우주여행은 처음이지?
Guide: 오늘은 지구에서 출발해서 은하까지 가볼 거야.
Guide: 걱정 마. 내가 길을 알려줄게.
Button: 출발하기
```

The opening screen should make the child feel guided and safe before any science explanation appears.

## Target user

- Primary: early elementary children.
- Secondary: parents or teachers who want a quick science activity.

## MVP learning goal

In under 5 minutes, a child should understand:

1. Earth and the Moon are much farther apart than they look.
2. The Solar System is much larger than Earth and the Moon.
3. The Sun is a star, and nearby stars are extremely far away.
4. A galaxy is a huge collection of stars.

## MVP format

Guided 4-stage journey:

1. Earth and Moon
2. Solar System
3. Beyond the Solar System and Voyager
4. Milky Way and galaxies

Each stage must have:

- One learning concept
- One short guide line
- One simple mission
- One optional quiz or checkpoint

## Current reference prototype

A quick Claude Fable 5 prototype was tested through a temporary Cloudflare URL.

Observed strengths:

- Three.js/canvas style space scene
- Zoom/pinch/drag interaction
- scale panel
- stage chips
- Korean captions
- voice toggle
- Solar System Scope texture credit

Observed problem:

The prototype has scenery, but not enough lesson design. It shows space, but does not clearly teach a child what to learn, what to do, or what to remember.

## Product direction

Do not build a free exploration simulator first. Build a guided learning journey first.

Free exploration can be added later after the educational loop works.

## Recommended next step

Create a build spec and implementation prompt that forces the app to behave like a short guided lesson, not a generic space scene.
