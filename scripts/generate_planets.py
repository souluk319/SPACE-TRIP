"""행성/달/태양 내레이션 음성 생성 (다큐 톤). 텍스트 원본: src/cinematic/stops.ts"""

from pathlib import Path

import numpy as np
from supertonic import TTS

NARRATIONS = {
    "moon": "지구의 유일한 위성, 달입니다. 지름은 지구의 약 4분의 1. 대기가 없어, 수십억 년 전 운석이 남긴 구덩이가 표면에 그대로 새겨져 있습니다.",
    "mercury": "태양에 가장 가까운 행성, 수성입니다. 대기가 거의 없어, 낮과 밤의 온도차가 무려 600도에 이릅니다.",
    "venus": "지구의 쌍둥이라 불리는 금성입니다. 그러나 두꺼운 이산화탄소 대기가 표면을 460도로 달구어, 태양계에서 가장 뜨거운 행성이 되었습니다.",
    "mars": "붉은 행성, 화성입니다. 표면을 덮은 산화철이 행성을 붉게 물들였습니다. 태양계에서 가장 높은 산, 올림푸스 화산이 이곳에 솟아 있습니다.",
    "jupiter": "태양계에서 가장 큰 행성, 목성입니다. 그 안에 지구가 천 3백 개나 들어갑니다. 표면의 거대한 붉은 점은, 수백 년째 몰아치고 있는 폭풍입니다.",
    "saturn": "고리의 행성, 토성입니다. 얼음과 암석으로 이루어진 고리는, 폭이 수십만 킬로미터에 이르지만 두께는 고작 수십 미터에 지나지 않습니다.",
    "uranus": "옆으로 누운 채 자전하는 천왕성입니다. 대기 속 메탄이 붉은빛을 흡수해, 행성은 차가운 청록빛으로 빛납니다.",
    "neptune": "태양에서 가장 먼 행성, 해왕성입니다. 시속 2천 킬로미터에 이르는 바람이 부는, 태양계에서 가장 거센 바람의 세계입니다.",
    "sun": "태양입니다. 태양계 전체 질량의 99.8퍼센트를 홀로 차지하는 별. 1초마다 수백만 톤의 수소를 태워, 46억 년째 빛을 내고 있습니다.",
}

SPEED = 1.0
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
        print(f"voice {v} done")


if __name__ == "__main__":
    main()
