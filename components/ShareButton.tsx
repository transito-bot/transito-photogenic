'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { ScoreResult } from '@/lib/score';

interface ShareButtonProps {
  scoreResult: ScoreResult;
}

export default function ShareButton({ 
  scoreResult, 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const hasShareApi = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    setCanShare(hasShareApi);
  }, []);

  const shareText = `내 셀기꾼 지수는 ${scoreResult.score}점! ${scoreResult.gradeName} 등급이에요! ${scoreResult.message}`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleWebShare = async () => {
    if (!canShare) {
      alert('현재 브라우저에서는 공유하기를 바로 지원하지 않습니다.\n\"링크 복사\" 버튼을 이용해주세요.');
      return;
    }

    try {
      await navigator.share({
        title: '셀기꾼 지수 측정 결과',
        text: shareText,
        url: shareUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error('공유 실패:', error);
      alert('공유하기를 열 수 없습니다.\n\"링크 복사\" 버튼을 이용해주세요.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleWebShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Share2 size={20} />
          공유하기
        </button>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check size={20} />
              복사됨!
            </>
          ) : (
            <>
              <Copy size={20} />
              링크 복사
            </>
          )}
        </button>

      </div>
    </div>
  );
}
