import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export interface FaceLandmarks {
  positions: faceapi.Point[];
  jawOutline: faceapi.Point[];
  leftEye: faceapi.Point[];
  rightEye: faceapi.Point[];
  nose: faceapi.Point[];
  mouth: faceapi.Point[];
}

export interface FaceDetection {
  detection: faceapi.FaceDetection;
  landmarks: FaceLandmarks;
  descriptor?: Float32Array;
}

/**
 * Face-api.js 모델을 로드합니다.
 */
export async function loadModels(): Promise<void> {
  if (modelsLoaded) {
    return;
  }

  // face-api.js-models 리포 구조에 맞게 각 모델 폴더 지정
  const TINY_FACE_DETECTOR_URL = '/models/tiny_face_detector';
  const FACE_LANDMARK_68_URL = '/models/face_landmark_68';
  const FACE_RECOGNITION_URL = '/models/face_recognition';

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(TINY_FACE_DETECTOR_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_LANDMARK_68_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_RECOGNITION_URL),
    ]);
    modelsLoaded = true;
  } catch (error) {
    console.error('모델 로드 실패:', error);
    throw new Error('얼굴 인식 모델을 로드할 수 없습니다.');
  }
}

/**
 * 이미지에서 얼굴을 감지하고 랜드마크를 추출합니다.
 */
export async function detectFace(
  image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceDetection | null> {
  if (!modelsLoaded) {
    await loadModels();
  }

  const detectionOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512,
    scoreThreshold: 0.5,
  });

  const detection = await faceapi
    .detectSingleFace(image, detectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return null;
  }

  const landmarks = detection.landmarks;
  
  return {
    detection: detection.detection,
    landmarks: {
      positions: landmarks.positions,
      jawOutline: landmarks.getJawOutline(),
      leftEye: landmarks.getLeftEye(),
      rightEye: landmarks.getRightEye(),
      nose: landmarks.getNose(),
      mouth: landmarks.getMouth(),
    },
    descriptor: detection.descriptor,
  };
}

/**
 * 이미지 URL 또는 File에서 얼굴을 감지합니다.
 */
export async function detectFaceFromImage(
  imageSrc: string | File
): Promise<FaceDetection | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        const result = await detectFace(img);
        resolve(result);
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

/**
 * 랜드마크 좌표를 정규화합니다 (얼굴 크기에 상관없이 비교 가능하도록).
 */
export function normalizeLandmarks(
  landmarks: FaceLandmarks,
  faceBox: faceapi.Box
): FaceLandmarks {
  const width = faceBox.width;
  const height = faceBox.height;
  const x = faceBox.x;
  const y = faceBox.y;

  const normalizePoint = (point: faceapi.Point): faceapi.Point => {
    return new faceapi.Point(
      (point.x - x) / width,
      (point.y - y) / height
    );
  };

  return {
    positions: landmarks.positions.map(normalizePoint),
    jawOutline: landmarks.jawOutline.map(normalizePoint),
    leftEye: landmarks.leftEye.map(normalizePoint),
    rightEye: landmarks.rightEye.map(normalizePoint),
    nose: landmarks.nose.map(normalizePoint),
    mouth: landmarks.mouth.map(normalizePoint),
  };
}
