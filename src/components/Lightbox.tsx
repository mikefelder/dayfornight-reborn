import { useState, useEffect, useCallback } from 'react';

interface LightboxProps {
  images: { src: string; alt?: string }[];
  initialIndex?: number;
}

export default function Lightbox({ images, initialIndex = 0 }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const open = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, next, prev]);

  // Listen for custom events from non-React triggers
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.index != null) open(detail.index);
      else open(0);
    };
    document.addEventListener('lightbox:open', handler);
    return () => document.removeEventListener('lightbox:open', handler);
  }, [open]);

  if (!isOpen) return null;

  const current = images[currentIndex];

  return (
    <div
      className="lightbox-overlay"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={close} aria-label="Close lightbox">
          &times;
        </button>
        {images.length > 1 && (
          <button className="lightbox-prev" onClick={prev} aria-label="Previous image">
            &#8249;
          </button>
        )}
        <img src={current.src} alt={current.alt || ''} className="lightbox-image" />
        {images.length > 1 && (
          <button className="lightbox-next" onClick={next} aria-label="Next image">
            &#8250;
          </button>
        )}
        {images.length > 1 && (
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}
