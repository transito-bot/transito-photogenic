'use client';

import { useEffect, useRef } from 'react';
import { ScoreResult, getGradeBadgeColor } from '@/lib/score';
import { FaceDetection } from '@/lib/face-api';
import ShareButton from './ShareButton';

interface ResultDisplayProps {
  scoreResult: ScoreResult;
  originalFace?: FaceDetection | null;
  editedFace?: FaceDetection | null;
  originalImageUrl?: string;
  editedImageUrl?: string;
}

export default function ResultDisplay({
  scoreResult,
  originalFace,
  editedFace,
  originalImageUrl,
  editedImageUrl,
}: ResultDisplayProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const editedCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (originalCanvasRef.current && originalFace && originalImageUrl) {
      drawLandmarks(originalCanvasRef.current, originalImageUrl, originalFace);
    }
  }, [originalFace, originalImageUrl]);

  useEffect(() => {
    if (editedCanvasRef.current && editedFace && editedImageUrl) {
      drawLandmarks(editedCanvasRef.current, editedImageUrl, editedFace);
    }
  }, [editedFace, editedImageUrl]);

  const drawLandmarks = async (
    canvas: HTMLCanvasElement,
    imageUrl: string,
    faceDetection: FaceDetection
  ) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 캔버스 크기를 이미지 크기에 맞춤
      const maxWidth = 400;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // 랜드마크 그리기 (이미지 크기에 맞게 스케일 조정)
      const landmarks = faceDetection.landmarks;
      const scaleX = width / img.width;
      const scaleY = height / img.height;

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#00ff00';

      // 얼굴 윤곽선
      ctx.beginPath();
      landmarks.jawOutline.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // 왼쪽 눈
      ctx.beginPath();
      landmarks.leftEye.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.stroke();

      // 오른쪽 눈
      ctx.beginPath();
      landmarks.rightEye.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.stroke();

      // 코
      ctx.beginPath();
      landmarks.nose.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // 입
      ctx.beginPath();
      landmarks.mouth.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.stroke();
    };

    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-lg shadow-lg">
      {/* 점수 및 등급 */}
      <div className="text-center">
        <div className="text-6xl font-bold mb-2 text-black">
          {scoreResult.score}점
        </div>
        <div
          className={`inline-block px-4 py-2 rounded-full border-2 font-semibold ${getGradeBadgeColor(scoreResult.grade)}`}
        >
          {scoreResult.gradeName}
        </div>
        <p className="mt-4 text-lg text-black whitespace-pre-line">
          {scoreResult.message}
        </p>
      </div>

      {/* 이미지 비교 */}
      {(originalImageUrl || editedImageUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          {originalImageUrl && (
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-black mb-2">원본 (즉석 셀카)</h3>
              <div className="relative inline-block">
                <img
                  src={originalImageUrl}
                  alt="원본 이미지"
                  className="max-w-full max-h-64 rounded-lg shadow-md"
                />
                {originalFace && (
                  <canvas
                    ref={originalCanvasRef}
                    className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
                    style={{ maxWidth: '100%', maxHeight: '256px' }}
                  />
                )}
              </div>
            </div>
          )}
          {editedImageUrl && (
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-black mb-2">보정본</h3>
              <div className="relative inline-block">
                <img
                  src={editedImageUrl}
                  alt="보정본 이미지"
                  className="max-w-full max-h-64 rounded-lg shadow-md"
                />
                {editedFace && (
                  <canvas
                    ref={editedCanvasRef}
                    className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
                    style={{ maxWidth: '100%', maxHeight: '256px' }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 공유 버튼 */}
      <ShareButton
        scoreResult={scoreResult}
      />
    </div>
  );
}
