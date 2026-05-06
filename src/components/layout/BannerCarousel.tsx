'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BannerSlide } from '@/types/game';

const PEEK = 120; // 左右に見せるpx
const GAP = 8;   // スライド間のギャップpx

export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  // 無限ループ用: [clone-last, ...slides, clone-first]
  const extended: BannerSlide[] = [slides[slides.length - 1]!, ...slides, slides[0]!];

  const [current, setCurrent] = useState(1); // 最初のスライドは index 1
  const [animated, setAnimated] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // コンテナ幅からスライド幅を計算
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSlideWidth(el.clientWidth - PEEK * 2 - GAP);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((index: number, anim = true) => {
    setAnimated(anim);
    setCurrent(index);
  }, []);

  // 自動再生タイマー
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCurrent((c) => c + 1), 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, resetTimer]);

  // clone に達したらアニメなしで本物にジャンプ（無限ループ）
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

  // アニメ無効後に再有効化
  useEffect(() => {
    if (!animated) {
      const t = setTimeout(() => setAnimated(true), 50);
      return () => clearTimeout(t);
    }
  }, [animated]);

  // タッチ操作
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

  // ドット用: 実際のスライドインデックス（0始まり）
  const realIndex =
    current === 0 ? slides.length - 1
    : current === extended.length - 1 ? 0
    : current - 1;

  // translateX: 現在スライドが PEEK 分だけ右にオフセットされた位置に来るよう計算
  const translateX = slideWidth > 0
    ? -(current * (slideWidth + GAP)) + PEEK
    : 0;

  const renderInner = (slide: BannerSlide, priority: boolean) => {
    const inner = slide.image ? (
      <div className="relative w-full aspect-[3/1]">
        <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={priority} />
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
          style={{ transform: `translateX(${translateX}px)`, gap: `${GAP}px` }}
        >
          {extended.map((slide, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-lg overflow-hidden"
              style={{ width: slideWidth > 0 ? `${slideWidth}px` : '100%' }}
            >
              {renderInner(slide, i === 1)}
            </div>
          ))}
        </div>
      </div>

      {/* 左PEEKエリア：クリックで前のスライドへ */}
      <button
        aria-label="前のスライド"
        onClick={() => { setCurrent((c) => c - 1); resetTimer(); }}
        className="absolute inset-y-0 left-0 cursor-pointer z-10"
        style={{ width: `${PEEK}px` }}
      />
      {/* 右PEEKエリア：クリックで次のスライドへ */}
      <button
        aria-label="次のスライド"
        onClick={() => { setCurrent((c) => c + 1); resetTimer(); }}
        className="absolute inset-y-0 right-0 cursor-pointer z-10"
        style={{ width: `${PEEK}px` }}
      />

      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i + 1); resetTimer(); }}
            aria-label={`スライド ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
              i === realIndex ? 'bg-gold-500' : 'bg-gold-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
