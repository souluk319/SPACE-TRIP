import type { Milestone } from './types';
import { SUN_POS, GALAXY_CENTER, LOCAL_GROUP_FOCUS } from './bodies';

const EARTH = { x: 0, y: 0, z: 0 };

export const MILESTONES: Milestone[] = [
  {
    id: 'earth',
    title: '지구',
    enterE: 6.0,
    focus: EARTH,
    narration:
      '여기는 우리의 고향, 지구입니다. 지름은 약 1만 2천 7백 킬로미터로, 표면의 70퍼센트가 바다로 덮여 있어요. 이제 천천히 멀어지며 우주로 떠나볼까요?',
    caption:
      '우리의 고향 지구. 지름 약 12,742 km, 표면의 70%가 바다로 덮여 있어요. 천천히 축소하며 우주로 떠나볼까요?',
  },
  {
    id: 'earth-moon',
    title: '지구와 달',
    enterE: 8.3,
    focus: EARTH,
    narration:
      '지구와 달이 함께 보입니다. 달은 지구에서 약 38만 킬로미터 떨어져 있어요. 빛의 속도로도 1.3초가 걸리는 거리입니다.',
    caption: '달은 지구에서 약 38만 km — 빛의 속도로도 1.3초가 걸리는 거리예요.',
  },
  {
    id: 'inner-planets',
    title: '안쪽 행성들',
    enterE: 11.0,
    focus: SUN_POS,
    narration:
      '태양과 가까운 안쪽 행성들입니다. 수성, 금성, 지구, 화성이 태양 주위를 돌고 있어요. 지구와 태양 사이 거리는 약 1억 5천만 킬로미터로, 이것을 1 천문단위라고 부릅니다.',
    caption:
      '수성·금성·지구·화성이 태양 주위를 돌아요. 지구-태양 거리 1억 5천만 km = 1 AU(천문단위).',
  },
  {
    id: 'solar-system',
    title: '태양계',
    enterE: 12.6,
    focus: SUN_POS,
    narration:
      '태양계 전체가 한눈에 들어옵니다. 가장 바깥 행성인 해왕성은 태양에서 지구보다 30배나 멀리 떨어져 있어요.',
    caption: '태양계 전체. 가장 바깥 행성 해왕성은 태양에서 30 AU — 지구보다 30배 멀리 있어요.',
  },
  {
    id: 'kuiper',
    title: '카이퍼대',
    enterE: 13.6,
    focus: SUN_POS,
    narration:
      '해왕성 너머에는 카이퍼대라는 얼음 천체들의 고리가 펼쳐져 있습니다. 명왕성도 이곳에 살고 있어요. 1977년에 떠난 보이저 1호는 이 부근을 지나 성간 공간을 날고 있습니다.',
    caption:
      '해왕성 너머 얼음 천체들의 고리, 카이퍼대. 1977년에 떠난 보이저 1호가 이 너머를 날고 있어요.',
  },
  {
    id: 'oort',
    title: '오르트 구름',
    enterE: 16.0,
    focus: SUN_POS,
    narration:
      '태양계를 거대한 공처럼 감싸고 있는 오르트 구름입니다. 혜성들의 고향으로, 그 끝은 1광년 넘는 곳까지 뻗어 있다고 추정돼요.',
    caption: '태양계를 공처럼 감싼 혜성들의 고향, 오르트 구름. 끝은 1광년 너머까지 뻗어 있어요.',
  },
  {
    id: 'nearby-stars',
    title: '이웃 별들',
    enterE: 17.5,
    focus: SUN_POS,
    narration:
      '태양을 떠나 이웃 별들 사이로 나왔습니다. 가장 가까운 별 프록시마 센타우리까지는 4.2광년, 빛으로도 4년 넘게 걸리는 거리예요.',
    caption: '가장 가까운 별 프록시마 센타우리까지 4.2광년 — 빛으로도 4년 넘게 걸려요.',
  },
  {
    id: 'milky-way',
    title: '우리은하',
    enterE: 20.5,
    focus: GALAXY_CENTER,
    narration:
      '수천억 개의 별이 모인 우리은하, 은하수입니다. 지름은 약 10만 광년이에요. 태양은 은하 중심에서 2만 6천 광년 떨어진 나선팔에 자리잡고 있습니다.',
    caption:
      '별 수천억 개가 모인 우리은하. 지름 약 10만 광년, 태양은 중심에서 2만 6천 광년 떨어진 나선팔에 있어요.',
  },
  {
    id: 'local-group',
    title: '국부은하군',
    enterE: 22.8,
    focus: LOCAL_GROUP_FOCUS,
    narration:
      '우리은하와 이웃 은하들이 모인 국부은하군입니다. 250만 광년 떨어진 안드로메다은하는 우리은하와 점점 가까워지고 있어요.',
    caption: '우리은하의 동네, 국부은하군. 250만 광년 밖 안드로메다은하가 점점 다가오고 있어요.',
  },
  {
    id: 'universe',
    title: '관측 가능한 우주',
    enterE: 25.5,
    focus: LOCAL_GROUP_FOCUS,
    narration:
      '관측 가능한 우주의 끝에 도달했습니다. 지름은 약 930억 광년이고, 은하들이 거미줄처럼 얽힌 거대한 구조를 이루고 있어요. 이 광활한 우주 어딘가, 작고 푸른 지구에서 우리의 여행이 시작되었습니다.',
    caption:
      '관측 가능한 우주 — 지름 약 930억 광년. 은하들이 거미줄처럼 얽혀 있어요. 이 어딘가의 작고 푸른 지구에서 여행이 시작됐습니다.',
  },
];

export function currentMilestone(e: number): Milestone {
  let m = MILESTONES[0];
  for (const cand of MILESTONES) {
    if (e >= cand.enterE) m = cand;
    else break;
  }
  return m;
}
