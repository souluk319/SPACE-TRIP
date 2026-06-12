/** 월드 좌표(미터). x/y = 황도면, z = 면에서의 높이. 씬에서는 (x, z, y)로 매핑 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Milestone {
  id: string;
  title: string;
  /** 이 지수(e) 이상이면 이 구간. 화면 세로 높이 = 10^e 미터 */
  enterE: number;
  /** 이 구간에서 카메라가 향하는 월드 좌표(미터) */
  focus: Vec3;
  /** TTS로 읽어줄 안내 (2~3문장) */
  narration: string;
  /** 자막 텍스트 */
  caption: string;
}

export type PainterId =
  | 'earth'
  | 'moon'
  | 'sun'
  | 'rockyPlanet'
  | 'gasGiant'
  | 'orbit'
  | 'beltRing'
  | 'oortShell'
  | 'starDot'
  | 'marker'
  | 'milkyWay'
  | 'galaxy'
  | 'cosmicWeb';

export type BodyParams = Record<string, number | string>;

export interface Body {
  id: string;
  /** 화면에 표시할 한국어 이름 (옵션) */
  label?: string;
  /** 월드 좌표 (미터) */
  pos: Vec3;
  /** 실제 반지름(미터). orbit은 궤도 반지름, 도식 레이어는 표현 반지름 */
  radius: number;
  /** 가시 지수 구간 */
  minE: number;
  maxE: number;
  /** 화면상 이보다 작아져도 이 크기의 점으로 유지 (별 등) */
  minPixelRadius?: number;
  painter: PainterId;
  params?: BodyParams;
}
