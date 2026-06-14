import type { Vec3 } from '../scene/types';
import { BODIES } from '../scene/bodies';
import { MILESTONES } from '../scene/milestones';

export interface TourStop {
  id: string;
  title: string;
  pos: Vec3;
  /** 프레이밍 줌 지수 (화면 세로 = 10^e 미터) */
  e: number;
  caption: string;
  narration: string;
}

const byId = new Map(BODIES.map((b) => [b.id, b]));

/** 천체 반지름 기준으로 화면을 fill 비율만큼 채우는 줌 지수 */
function frameE(id: string, fill: number): number {
  const b = byId.get(id)!;
  return Math.log10((2 * b.radius) / fill);
}

function bodyPos(id: string): Vec3 {
  return { ...byId.get(id)!.pos };
}

/** 외곽(태양계~우주)은 기존 milestone 데이터 재사용 */
function ms(id: string): { pos: Vec3; e: number; caption: string; narration: string } {
  const m = MILESTONES.find((x) => x.id === id)!;
  return { pos: { ...m.focus }, e: m.enterE + 0.3, caption: m.caption, narration: m.narration };
}

/**
 * 시네마틱 투어 — 가까운 천체를 하나씩 화면 가득 보여주며 이름과 사실을 전한 뒤,
 * 태양계 바깥으로 물러나 우주의 끝까지 스케일을 넓힌다.
 * (실제 비율로는 행성이 점에 불과하므로, 각 천체를 의도적으로 크게 프레이밍한다.)
 */
export const TOUR_STOPS: TourStop[] = [
  {
    id: 'earth',
    title: '지구',
    pos: bodyPos('earth'),
    e: frameE('earth', 0.46),
    caption: '푸른 행성 지구. 지름 약 12,742 km, 표면의 70%가 바다입니다.',
    narration:
      '푸른 행성, 지구입니다. 지름은 약 1만 2천 7백 킬로미터. 표면의 7할을 덮은 바다가 별빛을 되비춥니다. 우리의 여정은 이곳에서 시작됩니다.',
  },
  {
    id: 'moon',
    title: '달',
    pos: bodyPos('moon'),
    e: frameE('moon', 0.46),
    caption: '지구의 유일한 위성, 달. 지름은 지구의 4분의 1입니다.',
    narration:
      '지구의 유일한 위성, 달입니다. 지름은 지구의 약 4분의 1. 대기가 없어, 수십억 년 전 운석이 남긴 구덩이가 표면에 그대로 새겨져 있습니다.',
  },
  {
    id: 'mercury',
    title: '수성',
    pos: bodyPos('mercury'),
    e: frameE('mercury', 0.46),
    caption: '태양에 가장 가까운 수성. 낮과 밤의 온도차가 600도에 이릅니다.',
    narration:
      '태양에 가장 가까운 행성, 수성입니다. 대기가 거의 없어, 낮과 밤의 온도차가 무려 600도에 이릅니다.',
  },
  {
    id: 'venus',
    title: '금성',
    pos: bodyPos('venus'),
    e: frameE('venus', 0.46),
    caption: '지구의 쌍둥이, 금성. 표면 온도 460도 — 태양계에서 가장 뜨겁습니다.',
    narration:
      '지구의 쌍둥이라 불리는 금성입니다. 그러나 두꺼운 이산화탄소 대기가 표면을 460도로 달구어, 태양계에서 가장 뜨거운 행성이 되었습니다.',
  },
  {
    id: 'mars',
    title: '화성',
    pos: bodyPos('mars'),
    e: frameE('mars', 0.46),
    caption: '붉은 행성, 화성. 태양계에서 가장 높은 화산이 있습니다.',
    narration:
      '붉은 행성, 화성입니다. 표면을 덮은 산화철이 행성을 붉게 물들였습니다. 태양계에서 가장 높은 산, 올림푸스 화산이 이곳에 솟아 있습니다.',
  },
  {
    id: 'jupiter',
    title: '목성',
    pos: bodyPos('jupiter'),
    e: frameE('jupiter', 0.5),
    caption: '태양계 최대의 행성, 목성. 지구가 1,300개 들어갑니다.',
    narration:
      '태양계에서 가장 큰 행성, 목성입니다. 그 안에 지구가 천 3백 개나 들어갑니다. 표면의 거대한 붉은 점은, 수백 년째 몰아치고 있는 폭풍입니다.',
  },
  {
    id: 'saturn',
    title: '토성',
    pos: bodyPos('saturn'),
    e: frameE('saturn', 0.26),
    caption: '고리의 행성, 토성. 고리의 폭은 수십만 km, 두께는 수십 m뿐입니다.',
    narration:
      '고리의 행성, 토성입니다. 얼음과 암석으로 이루어진 고리는, 폭이 수십만 킬로미터에 이르지만 두께는 고작 수십 미터에 지나지 않습니다.',
  },
  {
    id: 'uranus',
    title: '천왕성',
    pos: bodyPos('uranus'),
    e: frameE('uranus', 0.46),
    caption: '옆으로 누워 자전하는 천왕성. 메탄 대기가 청록빛을 띱니다.',
    narration:
      '옆으로 누운 채 자전하는 천왕성입니다. 대기 속 메탄이 붉은빛을 흡수해, 행성은 차가운 청록빛으로 빛납니다.',
  },
  {
    id: 'neptune',
    title: '해왕성',
    pos: bodyPos('neptune'),
    e: frameE('neptune', 0.46),
    caption: '가장 먼 행성, 해왕성. 시속 2,000 km의 바람이 붑니다.',
    narration:
      '태양에서 가장 먼 행성, 해왕성입니다. 시속 2천 킬로미터에 이르는 바람이 부는, 태양계에서 가장 거센 바람의 세계입니다.',
  },
  {
    id: 'sun',
    title: '태양',
    pos: bodyPos('sun'),
    e: frameE('sun', 0.5),
    caption: '태양 — 태양계 질량의 99.8%를 차지하는 별입니다.',
    narration:
      '태양입니다. 태양계 전체 질량의 99.8퍼센트를 홀로 차지하는 별. 1초마다 수백만 톤의 수소를 태워, 46억 년째 빛을 내고 있습니다.',
  },
  { id: 'solar-system', title: '태양계', ...ms('solar-system') },
  { id: 'kuiper', title: '카이퍼대', ...ms('kuiper') },
  { id: 'oort', title: '오르트 구름', ...ms('oort') },
  { id: 'nearby-stars', title: '이웃 별', ...ms('nearby-stars') },
  { id: 'milky-way', title: '우리은하', ...ms('milky-way') },
  { id: 'local-group', title: '국부은하군', ...ms('local-group') },
  { id: 'universe', title: '관측 가능한 우주', ...ms('universe') },
];
