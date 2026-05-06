'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BannerSlide } from '@/types/game';

export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrent((c) => (c + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrent((c) => (c - 1 + slides.length) % slides.length);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative" data-testid="banner-carousel">
      <div 
        className="overflow-hidden rounded-lg relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, i) => {
            const inner = slide.image ? (
              <div className="relative w-full aspect-[3/1]">
                <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={i === 0} />
              </div>
            ) : (
              <div className="bg-gold-metal w-full aspect-[3/1] flex flex-col items-center justify-center px-8 text-center">
                <h2 className="text-2xl md:text-4xl font-display text-ink-950 drop-shadow font-bold">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="mt-2 text-ink-700 text-sm md:text-base">{slide.subtitle}</p>
                )}
              </div>
            );

            return (
              <div key={i} className="min-w-full flex-shrink-0">
                {slide.href ? (
                  <Link href={slide.href} className="block w-full">{inner}</Link>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`スライド ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === current ? 'bg-gold-500' : 'bg-gold-800'}`}
          />
        ))}
      </div>
    </div>
  );
}
