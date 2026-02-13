import { FaceLandmarks } from './face-api';
import * as faceapi from 'face-api.js';

/**
 * 두 점 사이의 유클리드 거리를 계산합니다.
 */
function euclideanDistance(p1: faceapi.Point, p2: faceapi.Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 두 점 배열의 평균 거리를 계산합니다.
 */
function averageDistance(
  points1: faceapi.Point[],
  points2: faceapi.Point[]
): number {
  if (points1.length !== points2.length) {
    return 1.0; // 길이가 다르면 완전히 다름
  }

  let totalDistance = 0;
  for (let i = 0; i < points1.length; i++) {
    totalDistance += euclideanDistance(points1[i], points2[i]);
  }

  return totalDistance / points1.length;
}

/**
 * 다각형(눈, 코 영역 등)의 면적을 계산합니다.
 * 면적 자체보다는 두 이미지 간 면적 비율을 비교하는 데 사용합니다.
 */
function polygonArea(points: faceapi.Point[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * 이목구비 위치 유사도를 계산합니다 (상대적으로 작은 비중).
 */
function calculateFacialFeaturesSimilarity(
  landmarks1: FaceLandmarks,
  landmarks2: FaceLandmarks
): number {
  // 눈, 코, 입의 중심점 계산
  const getCenter = (points: faceapi.Point[]): faceapi.Point => {
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    return new faceapi.Point(sumX / points.length, sumY / points.length);
  };

  const leftEye1 = getCenter(landmarks1.leftEye);
  const rightEye1 = getCenter(landmarks1.rightEye);
  const nose1 = getCenter(landmarks1.nose);
  const mouth1 = getCenter(landmarks1.mouth);

  const leftEye2 = getCenter(landmarks2.leftEye);
  const rightEye2 = getCenter(landmarks2.rightEye);
  const nose2 = getCenter(landmarks2.nose);
  const mouth2 = getCenter(landmarks2.mouth);

  // 각 특징점의 거리 계산
  const eyeDistance = (euclideanDistance(leftEye1, leftEye2) + 
                       euclideanDistance(rightEye1, rightEye2)) / 2;
  const noseDistance = euclideanDistance(nose1, nose2);
  const mouthDistance = euclideanDistance(mouth1, mouth2);

  // 정규화된 유사도 (거리가 작을수록 유사도 높음)
  const maxDistance = 0.2; // 임계값
  const similarity = Math.max(
    0,
    1 - (eyeDistance + noseDistance + mouthDistance) / (maxDistance * 3)
  );

  return similarity;
}

/**
 * 얼굴 윤곽 유사도를 계산합니다.
 * 한국식 보정에서 중요한 \"턱선/얼굴 갸름해짐\"을 가장 크게 반영합니다.
 */
function calculateFaceContourSimilarity(
  landmarks1: FaceLandmarks,
  landmarks2: FaceLandmarks
): number {
  const jawDistance = averageDistance(landmarks1.jawOutline, landmarks2.jawOutline);
  
  // 정규화된 유사도
  const maxDistance = 0.15;
  const similarity = Math.max(0, 1 - jawDistance / maxDistance);

  return similarity;
}

/**
 * 눈 크기 비율 유사도를 계산합니다.
 * 보정으로 눈을 키운 정도를 반영합니다.
 */
function calculateEyeSizeSimilarity(
  landmarks1: FaceLandmarks,
  landmarks2: FaceLandmarks
): number {
  const leftEyeArea1 = polygonArea(landmarks1.leftEye);
  const rightEyeArea1 = polygonArea(landmarks1.rightEye);
  const leftEyeArea2 = polygonArea(landmarks2.leftEye);
  const rightEyeArea2 = polygonArea(landmarks2.rightEye);

  const avgEyeArea1 = (leftEyeArea1 + rightEyeArea1) / 2;
  const avgEyeArea2 = (leftEyeArea2 + rightEyeArea2) / 2;

  if (avgEyeArea1 === 0 || avgEyeArea2 === 0) {
    return 0.5; // 기본값
  }

  const ratio = Math.min(avgEyeArea1, avgEyeArea2) / Math.max(avgEyeArea1, avgEyeArea2);
  return ratio;
}

/**
 * 코 크기/볼륨 유사도를 계산합니다.
 * 코를 높이거나 줄인 보정을 반영합니다.
 */
function calculateNoseSizeSimilarity(
  landmarks1: FaceLandmarks,
  landmarks2: FaceLandmarks
): number {
  const noseArea1 = polygonArea(landmarks1.nose);
  const noseArea2 = polygonArea(landmarks2.nose);

  if (noseArea1 === 0 || noseArea2 === 0) {
    return 0.5;
  }

  const ratio = Math.min(noseArea1, noseArea2) / Math.max(noseArea1, noseArea2);
  return ratio;
}

/**
 * 얼굴 descriptor 거리(동일인 판별용)를 계산합니다.
 * distance가 클수록 서로 다른 사람일 가능성이 높습니다.
 */
export function calculateDescriptorDistance(
  descriptor1?: Float32Array,
  descriptor2?: Float32Array
): number | null {
  if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * 얼굴 descriptor 거리(동일인 판별용)를 유사도로 변환합니다.
 */
function calculateDescriptorSimilarity(
  descriptor1?: Float32Array,
  descriptor2?: Float32Array
): number | null {
  const distance = calculateDescriptorDistance(descriptor1, descriptor2);
  if (distance === null) {
    return null;
  }

  // 0.6 전후를 타인 경계로 보고 더 공격적으로 정규화합니다.
  const minDistance = 0.2;
  const maxDistance = 0.6;
  const normalized = 1 - (distance - minDistance) / (maxDistance - minDistance);
  const similarity = Math.min(1, Math.max(0, normalized));

  // 타인으로 판단되는 거리에서는 유사도를 강하게 깎습니다.
  if (distance >= 0.68) {
    return 0;
  }
  if (distance >= 0.6) {
    return Math.min(similarity, 0.05);
  }
  if (distance >= 0.5) {
    return Math.min(similarity, 0.15);
  }
  if (distance >= 0.45) {
    return Math.min(similarity, 0.1);
  }

  return similarity;
}

/**
 * 두 얼굴 랜드마크의 전체 유사도를 계산합니다.
 */
export function calculateSimilarity(
  landmarks1: FaceLandmarks,
  landmarks2: FaceLandmarks,
  descriptor1?: Float32Array,
  descriptor2?: Float32Array
): number {
  const facialFeaturesSim = calculateFacialFeaturesSimilarity(landmarks1, landmarks2);
  const contourSim = calculateFaceContourSimilarity(landmarks1, landmarks2);
  const eyeSizeSim = calculateEyeSizeSimilarity(landmarks1, landmarks2);
  const noseSizeSim = calculateNoseSizeSimilarity(landmarks1, landmarks2);

  // 가중치 적용
  // - 얼굴 윤곽(턱, 얼굴 갸름함): 45%
  // - 눈 크기: 25%
  // - 코 크기: 20%
  // - 이목구비 위치 변화: 10%
  const weightedSimilarity =
    facialFeaturesSim * 0.1 +
    contourSim * 0.45 +
    eyeSizeSim * 0.25 +
    noseSizeSim * 0.2;

  const landmarkSimilarity = Math.min(1, Math.max(0, weightedSimilarity));
  const descriptorSimilarity = calculateDescriptorSimilarity(descriptor1, descriptor2);

  // descriptor가 있으면 동일인 여부를 더 강하게 반영합니다.
  if (descriptorSimilarity !== null) {
    const blendedSimilarity = landmarkSimilarity * 0.15 + descriptorSimilarity * 0.85;
    return Math.min(1, Math.max(0, blendedSimilarity));
  }

  return landmarkSimilarity;
}
