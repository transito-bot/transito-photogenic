# 셀기꾼 지수 측정기

즉석 셀카와 보정본을 비교하여 셀기꾼 지수를 측정하는 PWA 웹앱입니다.

## 설치 방법

1. 의존성 설치:
```bash
npm install
# 또는
yarn install
```

2. Face-api.js 모델 파일 다운로드:
   - https://github.com/justadudewhohacks/face-api.js-models 에서 모델 파일을 다운로드하세요.
   - 다음 파일들을 `public/models/` 디렉토리에 저장하세요:
     - `tiny_face_detector_model-weights_manifest.json`
     - `tiny_face_detector_model-shard1`
     - `face_landmark_68_model-weights_manifest.json`
     - `face_landmark_68_model-shard1`
     - `face_recognition_model-weights_manifest.json`
     - `face_recognition_model-shard1`
     - `face_recognition_model-shard2`
   
   또는 다음 명령어로 직접 다운로드:
   ```bash
   cd public
   git clone https://github.com/justadudewhohacks/face-api.js-models.git models
   ```

3. 개발 서버 실행:
```bash
npm run dev
# 또는
yarn dev
```

4. 브라우저에서 http://localhost:3000 접속

## 사용 방법

1. Step 1: 카메라로 즉석 셀카 촬영
2. Step 2: 갤러리에서 보정본 업로드
3. Step 3: AI가 두 이미지를 분석
4. Step 4: 셀기꾼 지수 결과 확인 및 공유

## 기술 스택

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Face-api.js (얼굴 인식)
- Lucide React (아이콘)
- PWA (next-pwa)

## 개인정보 보호

- 모든 이미지 처리는 클라이언트 사이드에서 이루어집니다.
- 서버에 이미지가 저장되지 않습니다.
- 분석 후 이미지는 메모리에서 즉시 삭제됩니다.

## PWA 아이콘 생성

PWA 아이콘을 생성하려면:
1. 192x192 및 512x512 크기의 PNG 이미지를 준비하세요.
2. `public/icon-192.png` 및 `public/icon-512.png`로 저장하세요.
3. 또는 온라인 아이콘 생성 도구를 사용하세요.

## 주요 기능

- ✅ 카메라를 통한 실시간 셀카 촬영
- ✅ 갤러리에서 이미지 업로드 (드래그앤드롭 지원)
- ✅ Face-api.js를 사용한 68개 얼굴 랜드마크 분석
- ✅ 유사도 측정 알고리즘 (이목구비, 얼굴 윤곽, 눈 크기, 피부 텍스처)
- ✅ 셀기꾼 지수 계산 및 등급 분류
- ✅ 랜드마크 시각화
- ✅ SNS 공유 기능 (Web Share API, 카카오톡, 인스타그램)
- ✅ PWA 지원 (오프라인 사용 가능)
- ✅ 반응형 디자인
