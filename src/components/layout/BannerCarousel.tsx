'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { BannerSlide } from '@/types/game';

export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[current]!;

  const inner = (
    <div className="bg-gold-metal min-w-full h-48 md:h-64 flex flex-col items-center justify-center px-8 text-center rounded-lg">
      <h2 className="text-2xl md:text-4xl font-display text-ink-950 drop-shadow font-bold">
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p className="mt-2 text-ink-700 text-sm md:text-base">{slide.subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-lg relative" data-testid="banner-carousel">
      {slide.href ? (
        <Link href={slide.href} className="block">{inner}</Link>
      ) : (
        inner
      )}
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`スライド ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-gold-500' : 'bg-gold-800'}`}
          />
        ))}
      </div>
    </div>
  );
}
