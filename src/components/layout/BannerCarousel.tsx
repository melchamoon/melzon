'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BannerSlide } from '@/types/game';

function SlideImage({ src, alt, priority }: { src: string; alt: string; priority: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full aspect-[3/1] bg-gray-100">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image src={src} alt={alt} fill className="object-cover" priority={priority} onLoad={() => setLoaded(true)} />
    </div>
  );
}

const PEEK = 120;
const GAP = 8;
const MOBILE_BREAKPOINT = 768;

export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const extended: BannerSlide[] = [slides[slides.length - 1]!, ...slides, slides[0]!];

  const [current, setCurrent] = useState(1);
  const [animated, setAnimated] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);
  const [peek, setPeek] = useState(PEEK);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const isMobile = el.clientWidth < MOBILE_BREAKPOINT;
      const p = isMobile ? 0 : PEEK;
      const gap = isMobile ? 0 : GAP;
      setPeek(p);
      setSlideWidth(el.clientWidth - p * 2 - gap);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((index: number, anim = true) => {
    setAnimated(anim);
    setCurrent(index);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCurrent((c) => c + 1), 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, resetTimer]);

  useEffect(() => {
    if (current === 0) {
      const t = setTimeout(() => goTo(slides.length, false), 500);
      return () => clearTimeout(t);
    }
    if (current === extended.length - 1) {
      const t = setTimeout(() => goTo(1, false), 500);
      return () => clearTimeout(t);
    }
  }, [current, slides.length, extended.length, goTo]);

  useEffect(() => {
    if (!animated) {
      const t = setTimeout(() => setAnimated(true), 50);
      return () => clearTimeout(t);
    }
  }, [animated]);

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
    if (distance > minSwipeDistance) setCurrent((c) => c + 1);
    else if (distance < -minSwipeDistance) setCurrent((c) => c - 1);
  };

  if (!slides || slides.length === 0) return null;

  const realIndex =
    current === 0 ? slides.length - 1
    : current === extended.length - 1 ? 0
    : current - 1;

  const gap = peek > 0 ? GAP : 0;
  const translateX = slideWidth > 0
    ? -(current * (slideWidth + gap)) + peek
    : 0;

  const renderInner = (slide: BannerSlide, priority: boolean) => {
    const inner = slide.image ? (
      <SlideImage src={slide.image} alt={slide.title} priority={priority} />
    ) : (
      <div className="bg-nav-sub w-full aspect-[3/1] flex flex-col items-center justify-center px-8 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-white">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-2 text-white/80 text-sm md:text-base">{slide.subtitle}</p>
        )}
      </div>
    );
    return slide.href ? <Link href={slide.href} className="block w-full">{inner}</Link> : inner;
  };

  return (
    <div className="relative" data-testid="banner-carousel">
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={animated ? 'flex transition-transform duration-500 ease-in-out' : 'flex'}
          style={{ transform: `translateX(${translateX}px)`, gap: `${gap}px` }}
        >
          {extended.map((slide, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-sm overflow-hidden"
              style={{ width: slideWidth > 0 ? `${slideWidth}px` : '100%' }}
            >
              {renderInner(slide, i === 1)}
            </div>
          ))}
        </div>
      </div>

      {peek > 0 && (
        <>
          <button
            aria-label="前のスライド"
            onClick={() => { setCurrent((c) => c - 1); resetTimer(); }}
            className="absolute inset-y-0 left-0 cursor-pointer z-10"
            style={{ width: `${peek}px` }}
          />
          <button
            aria-label="次のスライド"
            onClick={() => { setCurrent((c) => c + 1); resetTimer(); }}
            className="absolute inset-y-0 right-0 cursor-pointer z-10"
            style={{ width: `${peek}px` }}
          />
        </>
      )}

      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i + 1); resetTimer(); }}
            aria-label={`スライド ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
              i === realIndex ? 'bg-cta' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
