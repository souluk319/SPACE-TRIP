"""우주여행 내레이션 음성 생성 — 다큐멘터리 톤 (Supertonic 3).

10개 보이스(M1~M5, F1~F5)로 10개 구간 해설 + 미리듣기 샘플을 차분한 페이스로 생성.
유아용 가이드 대사(j-*)는 폐기 — milestone 해설만 사용한다.

사용법:
    /tmp/supertonic-venv/bin/python scripts/generate_narration.py
출력: public/audio/<voice>/<id>.wav  (빌드 전 afconvert로 .m4a 변환)
텍스트 원본: src/scene/milestones.ts 의 narration 필드 (수정 시 함께 갱신)
"""

from pathlib import Path

import numpy as np
from supertonic import TTS

NARRATIONS = {
    "earth": "푸른 행성, 지구입니다. 지름은 약 1만 2천 7백 킬로미터. 표면의 7할을 덮은 바다가 별빛을 되비춥니다. 우리의 여정은 이곳에서 시작됩니다.",
    "earth-moon": "지구의 곁을 도는 달. 그 거리는 약 38만 킬로미터, 빛의 속도로도 1.3초가 걸립니다. 가까워 보이지만, 이것이 우주의 첫 간격입니다.",
    "inner-planets": "태양에 가까운 네 행성, 수성과 금성, 지구와 화성이 궤도를 그립니다. 지구에서 태양까지의 1억 5천만 킬로미터, 이 거리를 1천문단위라 부릅니다.",
    "solar-system": "태양계 전체가 한 시야에 들어옵니다. 가장 바깥을 도는 해왕성은 태양에서 30천문단위, 지구의 서른 배 너머에 있습니다.",
    "kuiper": "해왕성 너머, 얼음 천체들이 띠를 이루는 카이퍼대입니다. 명왕성의 자리도 이곳입니다. 1977년 지구를 떠난 보이저 1호는 이 영역을 지나 성간 공간으로 향하고 있습니다.",
    "oort": "태양계를 거대한 구처럼 에워싼 오르트 구름. 혜성이 태어나는 곳이며, 그 바깥 경계는 1광년 너머에 이른다고 추정됩니다.",
    "nearby-stars": "태양을 뒤로하고, 이웃한 별들 사이에 들어섭니다. 가장 가까운 프록시마 센타우리조차 4.2광년, 빛으로도 4년이 넘는 거리입니다.",
    "milky-way": "수천억 개의 별이 모여 빚어낸 나선, 우리은하입니다. 지름은 약 10만 광년. 태양은 그 중심에서 2만 6천 광년 떨어진 나선팔의 한 점에 지나지 않습니다.",
    "local-group": "우리은하와 이웃 은하들이 중력으로 묶인 국부은하군입니다. 250만 광년 밖의 안드로메다는 지금 이 순간에도 우리를 향해 다가오고 있습니다.",
    "universe": "관측 가능한 우주의 끝입니다. 지름은 약 930억 광년, 은하들은 거미줄처럼 얽혀 거대한 구조를 이룹니다. 이 광막한 우주의 한 점, 작고 푸른 행성에서 우리의 여정은 시작되었습니다.",
    "sample": "지구에서 출발해, 관측 가능한 우주의 끝까지. 스케일의 여정을 함께 떠납니다.",
}

SPEED = 1.0  # 차분한 다큐 페이스 (들뜬 1.15 폐기)
STEPS = 12
VOICES = ["F1", "F2", "F3", "F4", "F5", "M1", "M2", "M3", "M4", "M5"]


def to_wave(out) -> np.ndarray:
    return np.asarray(out[0] if isinstance(out, tuple) else out, dtype=np.float32).reshape(-1)


def main() -> None:
    audio_root = Path(__file__).resolve().parent.parent / "public" / "audio"
    tts = TTS(auto_download=True)
    for v in VOICES:
        style = tts.get_voice_style(voice_name=v)
        vdir = audio_root / v
        vdir.mkdir(parents=True, exist_ok=True)
        for mid, text in NARRATIONS.items():
            wav, _ = tts.synthesize(
                text=text, voice_style=style, lang="ko", total_steps=STEPS, speed=SPEED
            )
            tts.save_audio(to_wave(wav), str(vdir / f"{mid}.wav"))
        print(f"voice {v} done ({len(NARRATIONS)} clips)")


if __name__ == "__main__":
    main()
