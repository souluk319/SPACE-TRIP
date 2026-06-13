/** 가이드형 여정 스테이지 정의 (docs/build-spec.md 스키마 기반) */

export interface StageQuiz {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export type MissionType = 'goto' | 'find' | 'watch';

export interface JourneyStage {
  id: string;
  title: string;
  /** 말풍선 안내 (개념 + 미션 유도, 아이 말투) */
  guideText: string;
  mission: string;
  missionType: MissionType;
  /** 스테이지 도착 줌 지수 */
  viewE: number;
  /** goto 미션의 목적지 줌 지수 */
  missionE?: number;
  /** 퀴즈 전에 이동할 줌 지수 (스테이지 3: 별들 보기) */
  quizE?: number;
  /** find 미션에서 눌러야 하는 천체 (bodies.ts의 id) */
  targets?: Array<{ id: string; label: string; found?: string; foundAudio?: string }>;
  quiz: StageQuiz;
  /** 퀴즈 해설 뒤에 보여줄 "기억하자" 한 줄 */
  remember: string;
  /** 스테이지 완료 배지 */
  badge: { icon: string; name: string };
  /** TTS 오디오 id (public/audio/<id>.m4a) */
  audio: { stage: string; quiz: string; explain: string };
}

export const COMPLETE_TEXT =
  '오늘의 우주여행 완료! 달, 태양계, 보이저, 우리은하까지 전부 가봤어. 우주는 정말 크지? 또 놀러 와!';

export const CORRECT_TEXT = '정답! 너 방금 우주 지식 하나 얻었어!';
export const WRONG_TEXT = '괜찮아, 틀려도 우주는 도망 안 가!';

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 's1',
    title: '지구와 달',
    guideText:
      '달은 가까워 보이지만 사실 엄청 멀어! 빛도 1.3초나 걸린다? 좋아, 달까지 가보자!',
    mission: '달까지 이동해보자',
    missionType: 'goto',
    viewE: 7.6,
    missionE: 8.75,
    targets: [{ id: 'moon', label: '달' }],
    quiz: {
      question: '달은 지구보다 클까, 작을까?',
      choices: ['지구보다 커!', '지구보다 작아!'],
      answerIndex: 1,
      explanation:
        '달은 지구의 4분의 1 크기야. 지구가 훨씬 크지! 그런데도 밤하늘에 크게 보이는 건 가까운 편이라서야.',
    },
    remember: '기억하자! 달까지는 약 38만 km.',
    badge: { icon: '🌙', name: '달 거리 탐험가' },
    audio: { stage: 'j-s1', quiz: 'j-q1', explain: 'j-e1' },
  },
  {
    id: 's2',
    title: '태양계',
    guideText:
      '우와, 태양계 도착! 태양 주위를 행성들이 빙글빙글 돌고 있어. 화성과 목성, 찾을 수 있겠어?',
    mission: '화성과 목성을 찾아 눌러보자',
    missionType: 'find',
    viewE: 12.35,
    targets: [
      { id: 'mars', label: '화성', found: '찾았다! 저게 화성이야.', foundAudio: 'j-f-mars' },
      {
        id: 'jupiter',
        label: '목성',
        found: '목성 발견! 태양계에서 제일 큰 형님이지.',
        foundAudio: 'j-f-jupiter',
      },
    ],
    quiz: {
      question: '태양계에서 가장 큰 행성은 무엇일까?',
      choices: ['지구', '목성', '화성'],
      answerIndex: 1,
      explanation: '정답은 목성! 지구가 1,300개나 들어갈 만큼 큰 행성이야.',
    },
    remember: '기억하자! 행성들은 태양 주위를 돌아.',
    badge: { icon: '☀️', name: '태양계 길잡이' },
    audio: { stage: 'j-s2', quiz: 'j-q2', explain: 'j-e2' },
  },
  {
    id: 's3',
    title: '태양계 바깥',
    guideText:
      '보이저 1호는 1977년에 지구를 떠나서 아직도 날아가는 중이야. 어디까지 갔을까? 같이 찾아보자!',
    mission: '보이저 1호를 찾아 눌러보자',
    missionType: 'find',
    viewE: 13.95,
    quizE: 17.7,
    targets: [
      {
        id: 'voyager1',
        label: '보이저 1호',
        found: '보이저 1호 발견! 엄청 멀리 왔어.',
        foundAudio: 'j-f-voyager1',
      },
    ],
    quiz: {
      question: '태양도 별일까?',
      choices: ['응, 태양도 별이야', '아니야, 태양은 행성이야'],
      answerIndex: 0,
      explanation:
        '맞아, 태양도 별이야! 밤하늘의 별들도 태양처럼 빛나고 있는데, 너무 멀어서 작게 보이는 거야.',
    },
    remember: '기억하자! 태양도 별이야.',
    badge: { icon: '🛰️', name: '보이저 추적자' },
    audio: { stage: 'j-s3', quiz: 'j-q3', explain: 'j-e3' },
  },
  {
    id: 's4',
    title: '우리은하',
    guideText:
      '여기가 바로 우리은하! 태양 같은 별이 수천억 개나 모여 있어. 진짜 멋지지?',
    mission: '우리은하를 바라보자',
    missionType: 'watch',
    viewE: 20.9,
    quiz: {
      question: '은하는 별 하나일까, 별들의 모임일까?',
      choices: ['별 하나야', '수많은 별들의 모임이야'],
      answerIndex: 1,
      explanation: '은하는 수많은 별들의 모임이야! 우리 태양도 그중 하나란다.',
    },
    remember: '기억하자! 은하는 별들의 모임이야.',
    badge: { icon: '🌌', name: '은하 발견자' },
    audio: { stage: 'j-s4', quiz: 'j-q4', explain: 'j-e4' },
  },
];

