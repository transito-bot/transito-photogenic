/**
 * OpenCV.js를 사용한 이미지 필터 감지
 * 실제 OpenCV.js는 무거우므로, 간단한 휴리스틱 방법으로 필터 감지
 */

export interface FilterDetection {
  blurLevel: number; // 0-1, 1에 가까울수록 블러 처리됨
  smoothness: number; // 0-1, 피부 매끄러움 정도
  filterScore: number; // 0-1, 전체 필터 점수
}

/**
 * 이미지의 블러 정도를 감지합니다.
 * 라플라시안 분산을 사용하여 이미지 선명도를 측정합니다.
 */
function detectBlur(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let variance = 0;
  let mean = 0;
  let count = 0;

  // 그레이스케일 변환 및 라플라시안 연산자 적용
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      const prevIdx = ((y - 1) * canvas.width + x) * 4;
      const nextIdx = ((y + 1) * canvas.width + x) * 4;
      const leftIdx = (y * canvas.width + (x - 1)) * 4;
      const rightIdx = (y * canvas.width + (x + 1)) * 4;

      // 그레이스케일 변환
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const grayPrev = (data[prevIdx] + data[prevIdx + 1] + data[prevIdx + 2]) / 3;
      const grayNext = (data[nextIdx] + data[nextIdx + 1] + data[nextIdx + 2]) / 3;
      const grayLeft = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
      const grayRight = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

      // 라플라시안 연산자
      const laplacian = Math.abs(
        gray * 4 - grayPrev - grayNext - grayLeft - grayRight
      );

      mean += laplacian;
      count++;
    }
  }

  mean /= count;

  // 분산 계산
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      const prevIdx = ((y - 1) * canvas.width + x) * 4;
      const nextIdx = ((y + 1) * canvas.width + x) * 4;
      const leftIdx = (y * canvas.width + (x - 1)) * 4;
      const rightIdx = (y * canvas.width + (x + 1)) * 4;

      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const grayPrev = (data[prevIdx] + data[prevIdx + 1] + data[prevIdx + 2]) / 3;
      const grayNext = (data[nextIdx] + data[nextIdx + 1] + data[nextIdx + 2]) / 3;
      const grayLeft = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
      const grayRight = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

      const laplacian = Math.abs(
        gray * 4 - grayPrev - grayNext - grayLeft - grayRight
      );

      variance += Math.pow(laplacian - mean, 2);
    }
  }

  variance /= count;

  // 분산이 낮을수록 블러 처리됨
  // 정규화하여 0-1 범위로 변환 (낮은 분산 = 높은 블러)
  const normalizedBlur = Math.min(1, Math.max(0, 1 - variance / 1000));
  
  return normalizedBlur;
}

/**
 * 피부 매끄러움 정도를 측정합니다.
 */
function detectSmoothness(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let totalVariation = 0;
  let count = 0;

  // 인접 픽셀 간의 색상 변화량 측정
  for (let y = 0; y < canvas.height - 1; y++) {
    for (let x = 0; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      const rightIdx = (y * canvas.width + (x + 1)) * 4;
      const bottomIdx = ((y + 1) * canvas.width + x) * 4;

      const rDiff = Math.abs(data[idx] - data[rightIdx]);
      const gDiff = Math.abs(data[idx + 1] - data[rightIdx + 1]);
      const bDiff = Math.abs(data[idx + 2] - data[rightIdx + 2]);
      
      const rDiffBottom = Math.abs(data[idx] - data[bottomIdx]);
      const gDiffBottom = Math.abs(data[idx + 1] - data[bottomIdx + 1]);
      const bDiffBottom = Math.abs(data[idx + 2] - data[bottomIdx + 2]);

      const variation = (rDiff + gDiff + bDiff + rDiffBottom + gDiffBottom + bDiffBottom) / 6;
      totalVariation += variation;
      count++;
    }
  }

  const avgVariation = totalVariation / count;
  
  // 변화량이 낮을수록 매끄러움 (보정됨)
  const smoothness = Math.min(1, Math.max(0, 1 - avgVariation / 50));
  
  return smoothness;
}

/**
 * 이미지에서 필터를 감지합니다.
 */
export async function detectFilters(
  imageSrc: string | File
): Promise<FilterDetection> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas 컨텍스트를 가져올 수 없습니다.'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const blurLevel = detectBlur(canvas);
        const smoothness = detectSmoothness(canvas);
        
        // 필터 점수는 블러와 매끄러움의 평균
        const filterScore = (blurLevel + smoothness) / 2;

        resolve({
          blurLevel,
          smoothness,
          filterScore,
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    if (typeof imageSrc === 'string') {
      img.src = imageSrc;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('파일을 읽을 수 없습니다.'));
      };
      reader.readAsDataURL(imageSrc);
    }
  });
}
