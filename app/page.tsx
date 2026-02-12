'use client';

import { useState } from 'react';
import { Camera, Upload, Sparkles, ArrowRight, Shield } from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import ImageUpload from '@/components/ImageUpload';
import ResultDisplay from '@/components/ResultDisplay';
import { detectFaceFromImage, normalizeLandmarks } from '@/lib/face-api';
import { calculateSimilarity } from '@/lib/similarity';
import { detectFilters } from '@/lib/opencv';
import { calculateSelfieScore } from '@/lib/score';
import type { FaceDetection } from '@/lib/face-api';

type Step = 1 | 2 | 3 | 4;

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [editedImageFile, setEditedImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [originalFace, setOriginalFace] = useState<FaceDetection | null>(null);
  const [editedFace, setEditedFace] = useState<FaceDetection | null>(null);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOriginalCapture = (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginalImageFile(file);
    setOriginalImageUrl(url);
    setStep(2);
  };

  const handleEditedUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setEditedImageFile(file);
    setEditedImageUrl(url);
    setStep(3);
    analyzeImages(file);
  };

  const analyzeImages = async (editedFile: File) => {
    if (!originalImageFile) {
      setError('원본 이미지가 없습니다.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 원본 이미지 분석
      const originalFaceResult = await detectFaceFromImage(originalImageFile);
      if (!originalFaceResult) {
        throw new Error('원본 이미지에서 얼굴을 찾을 수 없습니다.');
      }

      // 보정본 이미지 분석
      const editedFaceResult = await detectFaceFromImage(editedFile);
      if (!editedFaceResult) {
        throw new Error('보정본 이미지에서 얼굴을 찾을 수 없습니다.');
      }

      // 랜드마크 정규화
      const normalizedOriginal = normalizeLandmarks(
        originalFaceResult.landmarks,
        originalFaceResult.detection.box
      );
      const normalizedEdited = normalizeLandmarks(
        editedFaceResult.landmarks,
        editedFaceResult.detection.box
      );

      // 유사도 계산
      const similarity = calculateSimilarity(normalizedOriginal, normalizedEdited);

      // 필터 감지
      const filterDetection = await detectFilters(editedFile);

      // 셀기꾼 지수 계산
      const result = calculateSelfieScore(similarity, filterDetection);

      setOriginalFace(originalFaceResult);
      setEditedFace(editedFaceResult);
      setScoreResult(result);
      setStep(4);
    } catch (err: any) {
      console.error('분석 실패:', err);
      setError(err.message || '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    // 메모리 정리
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    if (editedImageUrl) URL.revokeObjectURL(editedImageUrl);

    setStep(1);
    setOriginalImageFile(null);
    setEditedImageFile(null);
    setOriginalImageUrl(null);
    setEditedImageUrl(null);
    setOriginalFace(null);
    setEditedFace(null);
    setScoreResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            셀기꾼 지수 측정기
          </h1>
          <p className="text-gray-600">
            즉석 셀카와 보정본을 비교하여 당신의 셀기꾼 지수를 확인해보세요!
          </p>
        </div>

        {/* 개인정보 보호 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">개인정보 보호</p>
            <p>
              모든 이미지 처리는 브라우저에서만 이루어지며, 서버에 저장되지 않습니다.
              분석 후 이미지는 메모리에서 즉시 삭제됩니다.
            </p>
          </div>
        </div>

        {/* 진행 단계 표시 */}
        {step < 4 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${step >= s
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <ArrowRight
                      className={`mx-2 ${step > s ? 'text-blue-500' : 'text-gray-300'}`}
                      size={20}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: 카메라 촬영 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold">Step 1: 즉석 셀카 촬영</h2>
            </div>
            <p className="text-gray-600 mb-6">
              카메라로 보정 없는 즉석 셀카를 촬영해주세요. 밝은 곳에서 촬영하면 더 정확한 결과를 얻을 수 있습니다.
            </p>
            <CameraCapture onCapture={handleOriginalCapture} />
          </div>
        )}

        {/* Step 2: 보정본 업로드 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold">Step 2: 보정본 업로드</h2>
            </div>
            <p className="text-gray-600 mb-6">
              갤러리에서 보정된 인생샷을 선택해주세요.
            </p>
            <ImageUpload onUpload={handleEditedUpload} />
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
                  setStep(1);
                }}
                className="text-gray-500 hover:text-gray-700 underline text-sm"
              >
                이전 단계로 돌아가기
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 분석 중 */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Sparkles className="text-blue-500 animate-pulse" size={64} />
              <h2 className="text-2xl font-semibold">이미지 분석 중...</h2>
              <p className="text-gray-600">
                얼굴 랜드마크를 추출하고 유사도를 계산하고 있습니다.
              </p>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                  <button
                    onClick={handleReset}
                    className="block mt-2 mx-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    처음부터 다시 시작
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: 결과 표시 */}
        {step === 4 && scoreResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold">Step 4: 결과 확인</h2>
            </div>
            <ResultDisplay
              scoreResult={scoreResult}
              originalFace={originalFace}
              editedFace={editedFace}
              originalImageUrl={originalImageUrl || undefined}
              editedImageUrl={editedImageUrl || undefined}
            />
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
              >
                다시 측정하기
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
