const AU = 1.496e11;
const LY = 9.4607e15;

function fmt(v: number): string {
  return v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString('ko-KR');
}

/** 미터 → 한국어 자연 단위 ("38만 km", "4.2광년", "12억 광년") */
export function formatLength(meters: number): string {
  if (meters < 1e8) return `약 ${Math.round(meters / 1e3).toLocaleString('ko-KR')} km`;
  if (meters < 0.6 * AU) return `약 ${fmt(meters / 1e7)}만 km`;
  if (meters < 0.08 * LY) return `약 ${fmt(meters / AU)} AU`;
  if (meters < 1e4 * LY) return `약 ${fmt(meters / LY)}광년`;
  if (meters < 1e8 * LY) return `약 ${fmt(meters / (1e4 * LY))}만 광년`;
  return `약 ${fmt(meters / (1e8 * LY))}억 광년`;
}
