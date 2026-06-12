"""우주여행 내레이션 음성 생성 (Supertonic 3 — 오픈소스 온디바이스 TTS).

사용법:
    python -m venv .venv && .venv/bin/pip install supertonic
    .venv/bin/python scripts/generate_narration.py

출력: public/audio/<milestone-id>.wav
(macOS에서는 빌드 스크립트가 afconvert로 .m4a 압축본을 만든다)

텍스트 원본: src/scene/milestones.ts 의 narration 필드 — 수정 시 여기도 갱신할 것.
"""

from pathlib import Path

import numpy as np
from supertonic import TTS

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

# 가이드 여정 대사 (텍스트 원본: src/journey/stages.ts — 수정 시 여기도 갱신)
JOURNEY_LINES = {
    "j-intro": "안녕! 나는 우주 안내원 토리야. 오늘은 지구에서 우리은하까지 함께 여행할 거야. 준비됐어? 출발해보자!",
    "j-s1": "달은 가까워 보이지만, 지구에서 아주 멀리 떨어져 있어. 빛도 1.3초나 걸리는 거리야. 달까지 한번 가볼까?",
    "j-q1": "여기서 퀴즈! 달은 지구보다 클까, 작을까?",
    "j-e1": "달은 지구의 4분의 1 크기야. 지구가 훨씬 크지! 그런데도 밤하늘에 크게 보이는 건 가까운 편이라서야.",
    "j-s2": "우와, 태양계에 도착했어! 태양은 태양계의 중심이고, 행성들은 태양 주변을 돌아. 화성과 목성을 찾아볼까?",
    "j-q2": "퀴즈 시간! 태양계에서 가장 큰 행성은 무엇일까?",
    "j-e2": "정답은 목성! 지구가 1,300개나 들어갈 만큼 큰 행성이야.",
    "j-s3": "사람이 만든 보이저 1호는 1977년에 지구를 떠나서 아직도 날아가고 있어. 어디까지 갔는지 한번 찾아볼까?",
    "j-q3": "별들 사이로 나왔어! 그런데 궁금한 게 있어. 태양도 별일까?",
    "j-e3": "맞아, 태양도 별이야! 밤하늘의 별들도 태양처럼 빛나고 있는데, 너무 멀어서 작게 보이는 거야.",
    "j-s4": "이제 태양계를 떠나서 아주아주 멀리 나왔어. 저기 보이는 게 우리은하야! 태양 같은 별이 수천억 개나 모여 있어.",
    "j-q4": "마지막 퀴즈! 은하는 별 하나일까, 별들의 모임일까?",
    "j-e4": "은하는 수많은 별들의 모임이야! 우리 태양도 그중 하나란다.",
    "j-correct": "딩동댕! 정답이야!",
    "j-wrong": "아쉽다! 정답을 알려줄게.",
    "j-complete": "오늘의 우주여행 완료! 지구에서 출발해서 달, 태양계, 보이저, 그리고 우리은하까지 모두 가봤어. 우주는 정말 크지? 또 놀러 와!",
}

NARRATIONS.update(JOURNEY_LINES)

VOICE = "F1"  # M1~M5(남성), F1~F5(여성)


def main() -> None:
    out_dir = Path(__file__).resolve().parent.parent / "public" / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)

    tts = TTS(auto_download=True)
    style = tts.get_voice_style(voice_name=VOICE)

    for mid, text in NARRATIONS.items():
        wav, duration = tts.synthesize(
            text=text,
            voice_style=style,
            lang="ko",
            total_steps=10,
            speed=1.0,
        )
        path = out_dir / f"{mid}.wav"
        tts.save_audio(wav, str(path))
        print(f"{mid}: {float(np.asarray(duration).reshape(-1)[0]):.1f}s -> {path.name}")


if __name__ == "__main__":
    main()
