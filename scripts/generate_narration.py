"""우주여행 내레이션 음성 생성 (Supertonic 3 — 오픈소스 온디바이스 TTS).

사용법:
    python -m venv .venv && .venv/bin/pip install supertonic
    .venv/bin/python scripts/generate_narration.py

출력:
    public/audio/<id>.wav            — 본편 내레이션
    public/audio/voice-test/<v>-<n>.wav — 보이스 비교 시안 (F1/F2/F4/M2)
(macOS: 빌드 전에 afconvert로 .m4a 압축 후 wav 삭제)

텍스트 원본: src/scene/milestones.ts(자유 탐험) + src/journey/stages.ts(가이드 여정)
— 코드 쪽 대사를 수정하면 여기도 함께 갱신할 것.
"""

from pathlib import Path

import numpy as np
from supertonic import TTS

# 자유 탐험 모드 구간 내레이션 (milestones.ts)
NARRATIONS = {
    "earth": "여기는 우리의 고향, 지구입니다. 지름은 약 1만 2천 7백 킬로미터로, 표면의 70퍼센트가 바다로 덮여 있어요. 이제 천천히 멀어지며 우주로 떠나볼까요?",
    "earth-moon": "지구와 달이 함께 보입니다. 달은 지구에서 약 38만 킬로미터 떨어져 있어요. 빛의 속도로도 1.3초가 걸리는 거리입니다.",
    "inner-planets": "태양과 가까운 안쪽 행성들입니다. 수성, 금성, 지구, 화성이 태양 주위를 돌고 있어요. 지구와 태양 사이 거리는 약 1억 5천만 킬로미터로, 이것을 1 천문단위라고 부릅니다.",
    "solar-system": "태양계 전체가 한눈에 들어옵니다. 가장 바깥 행성인 해왕성은 태양에서 지구보다 30배나 멀리 떨어져 있어요.",
    "kuiper": "해왕성 너머에는 카이퍼대라는 얼음 천체들의 고리가 펼쳐져 있습니다. 명왕성도 이곳에 살고 있어요. 1977년에 떠난 보이저 1호는 이 부근을 지나 성간 공간을 날고 있습니다.",
    "oort": "태양계를 거대한 공처럼 감싸고 있는 오르트 구름입니다. 혜성들의 고향으로, 그 끝은 1광년 넘는 곳까지 뻗어 있다고 추정돼요.",
    "nearby-stars": "태양을 떠나 이웃 별들 사이로 나왔습니다. 가장 가까운 별 프록시마 센타우리까지는 4.2광년, 빛으로도 4년 넘게 걸리는 거리예요.",
    "milky-way": "수천억 개의 별이 모인 우리은하, 은하수입니다. 지름은 약 10만 광년이에요. 태양은 은하 중심에서 2만 6천 광년 떨어진 나선팔에 자리잡고 있습니다.",
    "local-group": "우리은하와 이웃 은하들이 모인 국부은하군입니다. 250만 광년 떨어진 안드로메다은하는 우리은하와 점점 가까워지고 있어요.",
    "universe": "관측 가능한 우주의 끝에 도달했습니다. 지름은 약 930억 광년이고, 은하들이 거미줄처럼 얽힌 거대한 구조를 이루고 있어요. 이 광활한 우주 어딘가, 작고 푸른 지구에서 우리의 여행이 시작되었습니다.",
}

# 가이드 여정 대사 (stages.ts / journey.ts / main.ts 오프닝)
JOURNEY_LINES = {
    "j-open1": "안녕, 우주여행은 처음이지?",
    "j-open2": "오늘은 지구에서 출발해서 은하까지 가볼 거야.",
    "j-open3": "걱정 마. 내가 길을 알려줄게.",
    "j-s1": "달은 가까워 보이지만 사실 엄청 멀어! 빛도 1.3초나 걸린다? 좋아, 달까지 가보자!",
    "j-q1": "여기서 퀴즈! 달은 지구보다 클까, 작을까?",
    "j-e1": "달은 지구의 4분의 1 크기야. 지구가 훨씬 크지! 그런데도 밤하늘에 크게 보이는 건 가까운 편이라서야.",
    "j-s2": "우와, 태양계 도착! 태양 주위를 행성들이 빙글빙글 돌고 있어. 화성과 목성, 찾을 수 있겠어?",
    "j-q2": "퀴즈 시간! 태양계에서 가장 큰 행성은 무엇일까?",
    "j-e2": "정답은 목성! 지구가 1,300개나 들어갈 만큼 큰 행성이야.",
    "j-s3": "보이저 1호는 1977년에 지구를 떠나서 아직도 날아가는 중이야. 어디까지 갔을까? 같이 찾아보자!",
    "j-t3": "탐사선도 멀리 갔지만, 별까지는 훨씬 더 멀어! 별들 사이로 나가보자!",
    "j-q3": "별들 사이로 나왔어! 그런데 궁금한 게 있어. 태양도 별일까?",
    "j-e3": "맞아, 태양도 별이야! 밤하늘의 별들도 태양처럼 빛나고 있는데, 너무 멀어서 작게 보이는 거야.",
    "j-s4": "여기가 바로 우리은하! 태양 같은 별이 수천억 개나 모여 있어. 진짜 멋지지?",
    "j-q4": "마지막 퀴즈! 은하는 별 하나일까, 별들의 모임일까?",
    "j-e4": "은하는 수많은 별들의 모임이야! 우리 태양도 그중 하나란다.",
    "j-f-mars": "찾았다! 저게 화성이야.",
    "j-f-jupiter": "목성 발견! 태양계에서 제일 큰 형님이지.",
    "j-f-voyager1": "보이저 1호 발견! 엄청 멀리 왔어.",
    "j-correct": "정답! 너 방금 우주 지식 하나 얻었어!",
    "j-wrong": "괜찮아, 틀려도 우주는 도망 안 가!",
    "j-complete": "오늘의 우주여행 완료! 달, 태양계, 보이저, 우리은하까지 전부 가봤어. 우주는 정말 크지? 또 놀러 와!",
}

NARRATIONS.update(JOURNEY_LINES)

VOICE = "F1"  # M1~M5(남성), F1~F5(여성)
SPEED = 1.15  # 활력 — 기존 1.0이 루즈하다는 피드백 반영
STEPS = 10

# 보이스 비교 시안 (public/voice-test.html에서 청취)
SAMPLE_VOICES = ["F1", "F2", "F4", "M2"]
SAMPLE_LINES = [JOURNEY_LINES["j-s2"], JOURNEY_LINES["j-e1"]]


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    out_dir = root / "public" / "audio"
    sample_dir = out_dir / "voice-test"
    out_dir.mkdir(parents=True, exist_ok=True)
    sample_dir.mkdir(parents=True, exist_ok=True)

    tts = TTS(auto_download=True)

    style = tts.get_voice_style(voice_name=VOICE)
    for mid, text in NARRATIONS.items():
        wav, duration = tts.synthesize(
            text=text, voice_style=style, lang="ko", total_steps=STEPS, speed=SPEED
        )
        path = out_dir / f"{mid}.wav"
        tts.save_audio(wav, str(path))
        print(f"{mid}: {float(np.asarray(duration).reshape(-1)[0]):.1f}s -> {path.name}")

    for v in SAMPLE_VOICES:
        vstyle = tts.get_voice_style(voice_name=v)
        for i, text in enumerate(SAMPLE_LINES, 1):
            wav, _ = tts.synthesize(
                text=text, voice_style=vstyle, lang="ko", total_steps=STEPS, speed=SPEED
            )
            path = sample_dir / f"{v}-{i}.wav"
            tts.save_audio(wav, str(path))
            print(f"sample {v}-{i} -> {path.name}")


if __name__ == "__main__":
    main()
