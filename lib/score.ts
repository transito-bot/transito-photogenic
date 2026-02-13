import { FilterDetection } from './opencv';

export type Grade =
  | 'range_0_20'
  | 'range_21_35'
  | 'range_36_47'
  | 'range_48_61'
  | 'range_62_75'
  | 'range_76_85'
  | 'range_86_100';

export interface ScoreResult {
  score: number; // 0-100
  grade: Grade;
  gradeName: string;
  message: string;
  filterBonus: number;
}

interface ScoreOptions {
  forceDifferentPerson?: boolean;
  descriptorDistance?: number | null;
}

const GRADE_THRESHOLDS: Record<Grade, { min: number; max: number }> = {
  range_0_20: { min: 0, max: 20 },
  range_21_35: { min: 21, max: 35 },
  range_36_47: { min: 36, max: 47 },
  range_48_61: { min: 48, max: 61 },
  range_62_75: { min: 62, max: 75 },
  range_76_85: { min: 76, max: 85 },
  range_86_100: { min: 86, max: 100 },
};

const GRADE_INFO: Record<Grade, { name: string; message: string }> = {
  range_0_20: {
    name: '진실의 직시',
    message: '🥹 보정 좀 하세요. 너무 솔직해서 AI도 걱정 중입니다.',
  },
  range_21_35: {
    name: '보정 입문',
    message: '👏 이 정도는 현대인의 미덕이죠! 어디가서 난 보정 안 해! 말해도 됩니다.',
  },
  range_36_47: {
    name: '프로의 손길',
    message: '😏 딱 여기까지가 마지노선! 소개팅 상대도 첫눈에 알아볼 수 있어요',
  },
  range_48_61: {
    name: '쌍꺼풀 추적',
    message: '🗣️ 친구들은 당신이 보정빨이라 생각하고 있어요!',
  },
  range_62_75: {
    name: 'Adobe 우수고객',
    message: '🤥 혹시 인플루언서세요? 당신의 보정 실력 저도 학습하고 싶네요!',
  },
  range_76_85: {
    name: '증명사진 갱신 불가',
    message: '👮 공항 입국 심사대 통과 불가입니다.',
  },
  range_86_100: {
    name: '형사수사 합격',
    message: '🚨 사기죄로 고소당할 뻔.\n소개팅 상대가 경찰 신고를 고민 중이라\n변호사 선임 권유드립니다.',
  },
};

function getGradeByScore(score: number): Grade {
  if (score <= 20) return 'range_0_20';
  if (score <= 35) return 'range_21_35';
  if (score <= 47) return 'range_36_47';
  if (score <= 61) return 'range_48_61';
  if (score <= 75) return 'range_62_75';
  if (score <= 85) return 'range_76_85';
  return 'range_86_100';
}

/**
 * 셀기꾼 지수를 계산합니다.
 * 
 * @param similarity - 얼굴 유사도 (0-1, 높을수록 유사)
 * @param filterDetection - 필터 감지 결과
 * @returns 셀기꾼 지수 결과
 */
export function calculateSelfieScore(
  similarity: number,
  filterDetection: FilterDetection,
  options?: ScoreOptions
): ScoreResult {
  if (options?.forceDifferentPerson) {
    const distance = options.descriptorDistance ?? 0;
    const score = distance >= 0.75 ? 100 : distance >= 0.65 ? 95 : distance >= 0.55 ? 90 : 85;
    const grade = getGradeByScore(score);
    return {
      score,
      grade,
      gradeName: GRADE_INFO[grade].name,
      message: GRADE_INFO[grade].message,
      filterBonus: 0,
    };
  }

  // 기본 점수: 유사도가 낮을수록 (다를수록) 점수가 높음
  const baseScore = (1 - similarity) * 100;

  // 필터 보너스 점수 (최대 5점)
  // 피부 보정(블러, 매끄러움)은 참고 정도로만 반영하고, 턱/눈/코 변화가 더 크게 작용하도록 설정
  const filterBonus = filterDetection.filterScore * 5;
  
  // 최종 점수 (최대 100점)
  const finalScore = Math.min(100, Math.max(0, baseScore + filterBonus));
  const roundedScore = Math.round(finalScore);

  // 요청 점수 구간 기준으로 등급 결정
  const grade = getGradeByScore(roundedScore);

  const gradeInfo = GRADE_INFO[grade];

  return {
    score: roundedScore,
    grade,
    gradeName: gradeInfo.name,
    message: gradeInfo.message,
    filterBonus: Math.round(filterBonus),
  };
}

/**
 * 점수에 따른 색상을 반환합니다.
 */
export function getScoreColor(score: number): string {
  if (score <= 20) return 'text-green-600';
  if (score <= 35) return 'text-emerald-600';
  if (score <= 47) return 'text-sky-600';
  if (score <= 61) return 'text-blue-600';
  if (score <= 75) return 'text-yellow-600';
  if (score <= 85) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * 등급에 따른 배지 색상을 반환합니다.
 */
export function getGradeBadgeColor(grade: Grade): string {
  switch (grade) {
    case 'range_0_20':
      return 'bg-emerald-600 text-white border-emerald-700';
    case 'range_21_35':
      return 'bg-green-600 text-white border-green-700';
    case 'range_36_47':
      return 'bg-cyan-600 text-white border-cyan-700';
    case 'range_48_61':
      return 'bg-blue-600 text-white border-blue-700';
    case 'range_62_75':
      return 'bg-yellow-300 text-black border-yellow-500';
    case 'range_76_85':
      return 'bg-orange-500 text-white border-orange-700';
    case 'range_86_100':
      return 'bg-red-600 text-white border-red-700';
  }
}
