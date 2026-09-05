import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'contain' | 'cover';
}

const BACKEND_URL = 'https://ai-powered-visual-measurement.onrender.com';

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  objectFit = 'contain',
}) => {
  const [failed, setFailed] = useState(false);

  const fitClass =
    objectFit === 'cover' ? 'object-cover' : 'object-contain';

  let imageSrc = src;

  // Backend relative image paths ko backend URL ke saath load karo
  if (src && src.startsWith('/')) {
    imageSrc = `${BACKEND_URL}${src}`;
  } else if (src && !src.startsWith('http')) {
    imageSrc = `${BACKEND_URL}/${src}`;
  }

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-900/80 text-slate-500 ${className}`}
        role="img"
        aria-label={`${alt} — image unavailable`}
      >
        <ImageOff
          className="w-8 h-8 mb-2 text-slate-600"
          strokeWidth={1.5}
        />
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${fitClass}`}
      onError={() => {
        console.error('Image failed:', imageSrc);
        setFailed(true);
      }}
    />
  );
};
