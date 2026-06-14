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
      '푸른 행성, 지구입니다. 지름은 약 1만 2천 7백 킬로미터. 표면의 7할을 덮은 바다가 별빛을 되비춥니다. 우리의 여정은 이곳에서 시작됩니다.',
    caption: '푸른 행성 지구. 지름 약 12,742 km, 표면의 70%가 바다입니다. 여정은 이곳에서 시작됩니다.',
  },
  {
    id: 'earth-moon',
    title: '지구와 달',
    enterE: 8.3,
    focus: EARTH,
    narration:
      '지구의 곁을 도는 달. 그 거리는 약 38만 킬로미터, 빛의 속도로도 1.3초가 걸립니다. 가까워 보이지만, 이것이 우주의 첫 간격입니다.',
    caption: '지구를 도는 달. 약 38만 km — 빛의 속도로도 1.3초가 걸리는 거리입니다.',
  },
  {
    id: 'inner-planets',
    title: '안쪽 행성',
    enterE: 11.0,
    focus: SUN_POS,
    narration:
      '태양에 가까운 네 행성, 수성과 금성, 지구와 화성이 궤도를 그립니다. 지구에서 태양까지의 1억 5천만 킬로미터, 이 거리를 1천문단위라 부릅니다.',
    caption: '수성·금성·지구·화성이 태양을 돕니다. 지구–태양 거리 1억 5천만 km가 1천문단위(AU)입니다.',
  },
  {
    id: 'solar-system',
    title: '태양계',
    enterE: 12.6,
    focus: SUN_POS,
    narration:
      '태양계 전체가 한 시야에 들어옵니다. 가장 바깥을 도는 해왕성은 태양에서 30천문단위, 지구의 서른 배 너머에 있습니다.',
    caption: '태양계 전체. 가장 바깥 해왕성은 태양에서 30 AU, 지구의 30배 거리에 있습니다.',
  },
  {
    id: 'kuiper',
    title: '카이퍼대',
    enterE: 13.6,
    focus: SUN_POS,
    narration:
      '해왕성 너머, 얼음 천체들이 띠를 이루는 카이퍼대입니다. 명왕성의 자리도 이곳입니다. 1977년 지구를 떠난 보이저 1호는 이 영역을 지나 성간 공간으로 향하고 있습니다.',
    caption: '해왕성 너머 얼음 천체의 띠, 카이퍼대. 보이저 1호가 이 너머 성간 공간을 항행하고 있습니다.',
  },
  {
    id: 'oort',
    title: '오르트 구름',
    enterE: 16.0,
    focus: SUN_POS,
    narration:
      '태양계를 거대한 구처럼 에워싼 오르트 구름. 혜성이 태어나는 곳이며, 그 바깥 경계는 1광년 너머에 이른다고 추정됩니다.',
    caption: '태양계를 구처럼 감싼 혜성의 고향, 오르트 구름. 경계는 1광년 너머로 추정됩니다.',
  },
  {
    id: 'nearby-stars',
    title: '이웃 별',
    enterE: 17.5,
    focus: SUN_POS,
    narration:
      '태양을 뒤로하고, 이웃한 별들 사이에 들어섭니다. 가장 가까운 프록시마 센타우리조차 4.2광년, 빛으로도 4년이 넘는 거리입니다.',
    caption: '가장 가까운 별 프록시마 센타우리까지 4.2광년 — 빛으로도 4년이 넘습니다.',
  },
  {
    id: 'milky-way',
    title: '우리은하',
    enterE: 20.5,
    focus: GALAXY_CENTER,
    narration:
      '수천억 개의 별이 모여 빚어낸 나선, 우리은하입니다. 지름은 약 10만 광년. 태양은 그 중심에서 2만 6천 광년 떨어진 나선팔의 한 점에 지나지 않습니다.',
    caption: '수천억 별의 나선, 우리은하. 지름 약 10만 광년, 태양은 중심에서 2만 6천 광년에 있습니다.',
  },
  {
    id: 'local-group',
    title: '국부은하군',
    enterE: 22.8,
    focus: LOCAL_GROUP_FOCUS,
    narration:
      '우리은하와 이웃 은하들이 중력으로 묶인 국부은하군입니다. 250만 광년 밖의 안드로메다는 지금 이 순간에도 우리를 향해 다가오고 있습니다.',
    caption: '우리은하가 속한 국부은하군. 250만 광년 밖 안드로메다가 다가오고 있습니다.',
  },
  {
    id: 'universe',
    title: '관측 가능한 우주',
    enterE: 25.5,
    focus: LOCAL_GROUP_FOCUS,
    narration:
      '관측 가능한 우주의 끝입니다. 지름은 약 930억 광년, 은하들은 거미줄처럼 얽혀 거대한 구조를 이룹니다. 이 광막한 우주의 한 점, 작고 푸른 행성에서 우리의 여정은 시작되었습니다.',
    caption: '관측 가능한 우주, 지름 약 930억 광년. 거대 구조 속 작고 푸른 한 점에서 여정은 시작되었습니다.',
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
