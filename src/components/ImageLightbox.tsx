'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Icons } from '@/constants/icons';

interface LightboxImage {
  src: string;
  alt: string;
}

interface ImageLightboxProps {
  children: React.ReactNode;
}

interface LightboxContextType {
  openLightbox: (src: string, alt: string) => void;
}

// Context for child components to trigger lightbox
const LightboxContext = React.createContext<LightboxContextType | null>(null);

export const useLightbox = (): LightboxContextType => {
  const context = React.useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within ImageLightbox');
  }
  return context;
};

/**
 * ImageLightbox - Lightbox component for enlarging images
 * Wraps content and provides lightbox functionality for images
 */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<LightboxImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const openLightbox = useCallback((src: string, alt: string) => {
    setCurrentImage({ src, alt });
    setIsLoading(true);
    setIsOpen(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setCurrentImage(null);
    // Restore body scroll
    document.body.style.overflow = '';
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      {children}
      
      {/* Lightbox Overlay */}
      {isOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={closeLightbox}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" />
          
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="
              absolute top-4 right-4 z-10
              p-2 rounded-lg
              bg-white/10 hover:bg-white/20
              text-white
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-white/50
            "
            aria-label="Close lightbox"
          >
            {Icons.close}
          </button>

          {/* Image container */}
          <div
            className="
              relative z-10
              max-w-[90vw] max-h-[90vh]
              flex items-center justify-center
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            
            {/* Image */}
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className={`
                max-w-full max-h-[90vh]
                object-contain
                rounded-lg
                shadow-2xl
                transition-opacity duration-300
                ${isLoading ? 'opacity-0' : 'opacity-100'}
              `}
              onLoad={handleImageLoad}
            />
          </div>

          {/* Image caption */}
          {currentImage.alt && !isLoading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <p className="px-4 py-2 bg-black/60 text-white text-sm rounded-lg backdrop-blur-sm">
                {currentImage.alt}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 z-10 text-white/60 text-xs">
            Press ESC to close
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
};

/**
 * ClickableImage - Image component that opens in lightbox when clicked
 */
interface ClickableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ClickableImage: React.FC<ClickableImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const { openLightbox } = useLightbox();

  return (
    <img
      src={src}
      alt={alt}
      className={`
        cursor-zoom-in
        transition-transform duration-200
        hover:scale-[1.02]
        ${className}
      `}
      onClick={() => openLightbox(src, alt)}
      title="Click to enlarge"
    />
  );
};

export default ImageLightbox;
