'use client';

import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { Camera, X, RotateCcw, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  onCancel?: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error('카메라 접근 실패:', err);
      setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // 전면 카메라 좌우 반전을 보정해 원본 방향으로 저장
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleCancel = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };

  const handleGalleryUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    stopCamera();
    onCapture(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (capturedImage) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={capturedImage}
            alt="촬영된 사진"
            className="max-w-full max-h-96 rounded-lg shadow-lg"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={retake}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            <RotateCcw size={20} />
            다시 촬영
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <X size={20} />
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {error ? (
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
          {error}
          <button
            onClick={startCamera}
            className="block mt-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-96 rounded-lg shadow-lg bg-black -scale-x-100"
            />
            {isStreaming && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-[11%] -translate-x-1/2 w-[35%] h-[35%] rounded-full border-[6px] border-dashed border-orange-400/95" />
                <div className="absolute left-1/2 top-[38%] -translate-x-1/2 w-[78%] h-[58%] rounded-[45%] border-[6px] border-dashed border-orange-400/95" />
              </div>
            )}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                <div className="text-white text-center">
                  <Camera size={48} className="mx-auto mb-2 animate-pulse" />
                  <p>카메라를 시작하는 중...</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={capturePhoto}
              disabled={!isStreaming}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={20} />
              촬영하기
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
              취소
            </button>
          </div>
          <p className="text-sm text-black text-center">
            안내선 안에 얼굴과 어깨가 들어오게 맞춰 촬영해주세요. 너무 가까우면 인식이 어려울 수 있습니다.
          </p>
        </>
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg transition-colors"
      >
        <Upload size={20} />
        사진첩에서 업로드
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
