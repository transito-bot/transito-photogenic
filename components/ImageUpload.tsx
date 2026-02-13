'use client';

import { useRef, useState, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (imageFile: File) => void;
  onCancel?: () => void;
  label?: string;
}

export default function ImageUpload({ 
  onUpload, 
  onCancel,
  label = '보정본 이미지 업로드'
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    handleRemove();
    if (onCancel) {
      onCancel();
    }
  };

  if (preview && selectedFile) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={preview}
            alt="업로드된 이미지"
            className="max-w-full max-h-96 rounded-lg shadow-lg"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            확인
          </button>
          <button
            onClick={handleRemove}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            다시 선택
          </button>
          {onCancel && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-black mb-2">
        {label}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
            <ImageIcon 
            size={48} 
            className={isDragging ? 'text-blue-500' : 'text-black'} 
          />
          <div>
            <p className="text-black font-medium">
              {isDragging ? '여기에 이미지를 놓으세요' : '이미지를 드래그하거나 클릭하세요'}
            </p>
            <p className="text-sm text-black mt-1">
              JPG, PNG, WEBP (최대 10MB)
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
