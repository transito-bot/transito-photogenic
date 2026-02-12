'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Instagram } from 'lucide-react';
import { ScoreResult } from '@/lib/score';

interface ShareButtonProps {
  scoreResult: ScoreResult;
  originalImageUrl?: string;
  editedImageUrl?: string;
}

export default function ShareButton({ 
  scoreResult, 
  originalImageUrl,
  editedImageUrl 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const shareText = `내 셀기꾼 지수는 ${scoreResult.score}점! ${scoreResult.gradeName} 등급이에요! ${scoreResult.message}`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '셀기꾼 지수 측정 결과',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // Web Share API가 지원되지 않으면 클립보드에 복사
      handleCopy();
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

  const handleKakaoShare = () => {
    // 카카오톡 공유는 Kakao SDK가 필요하지만, 여기서는 링크만 공유
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(kakaoUrl, '_blank');
  };

  const handleInstagramShare = () => {
    // 인스타그램은 직접 공유가 불가능하므로 안내 메시지
    alert('인스타그램 스토리에 공유하려면 결과 이미지를 저장한 후 수동으로 업로드해주세요.');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {canShare && (
          <button
            onClick={handleWebShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Share2 size={20} />
            공유하기
          </button>
        )}
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
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

        <button
          onClick={handleKakaoShare}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg transition-colors"
        >
          <MessageCircle size={20} />
          카카오톡
        </button>

        <button
          onClick={handleInstagramShare}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
        >
          <Instagram size={20} />
          인스타그램
        </button>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        결과는 서버에 저장되지 않으며, 개인정보가 보호됩니다.
      </p>
    </div>
  );
}
