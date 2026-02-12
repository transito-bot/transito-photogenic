import { FilterDetection } from './opencv';

export type Grade = 'honest' | 'manner' | 'alchemist' | 'cyber';

export interface ScoreResult {
  score: number; // 0-100
  grade: Grade;
  gradeName: string;
  message: string;
  filterBonus: number;
}

const GRADE_THRESHOLDS = {
  honest: { min: 0, max: 20 },
  manner: { min: 21, max: 50 },
  alchemist: { min: 51, max: 80 },
  cyber: { min: 81, max: 100 },
};

const GRADE_INFO: Record<Grade, { name: string; messages: string[] }> = {
  honest: {
    name: '정직한 시민',
    messages: [
      '무보정 장인! 당신의 자신감이 빛나네요 ✨',
      '필터 없이도 충분히 아름다워요!',
      '진짜 미인은 보정이 필요 없다는 걸 증명하셨네요 👏',
    ],
  },
  manner: {
    name: '매너 있는 보정',
    messages: [
      '자기관리 끝판왕! 적당한 보정은 예의예요 😊',
      '자연스러운 보정으로 더욱 빛나시네요',
      '매너 있는 보정으로 자신감을 더하셨군요!',
    ],
  },
  alchemist: {
    name: '손가락 연금술사',
    messages: [
      '포토샵 장인! 손가락이 황금이네요 🏆',
      '보정 기술이 정말 뛰어나세요!',
      '이 정도면 프로 수준의 보정 실력이에요 👏',
    ],
  },
  cyber: {
    name: '사이버 가수 아담',
    messages: [
      '부모님도 못 알아보시겠어요! 완전히 다른 사람이네요 😱',
      '이 정도면 사이버 펑크 세계의 주인공이에요!',
      '보정의 극한을 보여주셨네요. 정말 인상적이에요!',
    ],
  },
};

/**
 * 셀기꾼 지수를 계산합니다.
 * 
 * @param similarity - 얼굴 유사도 (0-1, 높을수록 유사)
 * @param filterDetection - 필터 감지 결과
 * @returns 셀기꾼 지수 결과
 */
export function calculateSelfieScore(
  similarity: number,
  filterDetection: FilterDetection
): ScoreResult {
  // 기본 점수: 유사도가 낮을수록 (다를수록) 점수가 높음
  const baseScore = (1 - similarity) * 100;

  // 필터 보너스 점수 (최대 5점)
  // 피부 보정(블러, 매끄러움)은 참고 정도로만 반영하고, 턱/눈/코 변화가 더 크게 작용하도록 설정
  const filterBonus = filterDetection.filterScore * 5;
  
  // 최종 점수 (최대 100점)
  const finalScore = Math.min(100, Math.max(0, baseScore + filterBonus));

  // 등급 결정
  let grade: Grade = 'honest';
  for (const [key, threshold] of Object.entries(GRADE_THRESHOLDS)) {
    if (finalScore >= threshold.min && finalScore <= threshold.max) {
      grade = key as Grade;
      break;
    }
  }

  const gradeInfo = GRADE_INFO[grade];
  const randomMessage = gradeInfo.messages[
    Math.floor(Math.random() * gradeInfo.messages.length)
  ];

  return {
    score: Math.round(finalScore),
    grade,
    gradeName: gradeInfo.name,
    message: randomMessage,
    filterBonus: Math.round(filterBonus),
  };
}

/**
 * 점수에 따른 색상을 반환합니다.
 */
export function getScoreColor(score: number): string {
  if (score <= 20) return 'text-green-600';
  if (score <= 50) return 'text-blue-600';
  if (score <= 80) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * 등급에 따른 배지 색상을 반환합니다.
 */
export function getGradeBadgeColor(grade: Grade): string {
  switch (grade) {
    case 'honest':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'manner':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'alchemist':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'cyber':
      return 'bg-red-100 text-red-800 border-red-300';
  }
}
