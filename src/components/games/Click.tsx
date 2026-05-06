'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { earnPointsLocal } from '@/lib/points';
import { usePoints } from '@/lib/use-storage';
import { calcClickPt } from '@/lib/slot';
import { formatPoints } from '@/lib/format';

const IMAGE_RESET_MS = 200;

const PRAISE_WORDS = ['すごい！', 'えらい！', 'やるね！', 'さすが！', 'いいね！', 'かっこいい！', '天才！', 'ナイス！'];
const PRAISE_X_MIN = 0;
const PRAISE_X_RANGE = 25;

const GAUGE_TICK_MS = 50;
const GAUGE_DECAY = 0.15;
const GAUGE_CLICK_RISE = 1.67;
const CLICK_GRACE_MS = 1000;
const FLOAT_DURATION_MS = 900;
const FLOAT_X_MIN = 55;
const FLOAT_X_RANGE = 30;
const GAUGE_COLOR_BLUE = 33;
const GAUGE_COLOR_RED = 66;

export function Click() {
  const balance = usePoints();
  const [gauge, setGauge] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [running, setRunning] = useState(false);
  const [clicked, setClicked] = useState(false);
  const lastClickTimeRef = useRef(0);
  const imageResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [floats, setFloats] = useState<{ id: number; pt: number; x: number; color: string }[]>([]);
  const [praises, setPraises] = useState<{ id: number; word: string; x: number }[]>([]);
  const floatIdRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (Date.now() - lastClickTimeRef.current < CLICK_GRACE_MS) return;
      setGauge((g) => Math.max(0, g - GAUGE_DECAY));
    }, GAUGE_TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  const handleClick = useCallback(() => {
    if (!running) setRunning(true);
    lastClickTimeRef.current = Date.now();
    setClicked(true);
    if (imageResetTimerRef.current) clearTimeout(imageResetTimerRef.current);
    imageResetTimerRef.current = setTimeout(() => setClicked(false), IMAGE_RESET_MS);
    const pt = calcClickPt(gauge);
    earnPointsLocal(pt);
    setTotalEarned((t) => t + pt);
    setGauge((g) => Math.min(100, g + GAUGE_CLICK_RISE));
    const id = ++floatIdRef.current;
    const x = FLOAT_X_MIN + Math.random() * FLOAT_X_RANGE;
    const color = gauge >= GAUGE_COLOR_RED ? '#B12704' : gauge >= GAUGE_COLOR_BLUE ? '#0066C0' : '#ffffff';
    setFloats((prev) => [...prev, { id, pt, x, color }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), FLOAT_DURATION_MS);
    const word = PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)]!;
    const px = PRAISE_X_MIN + Math.random() * PRAISE_X_RANGE;
    setPraises((prev) => [...prev, { id, word, x: px }]);
    setTimeout(() => setPraises((prev) => prev.filter((p) => p.id !== id)), FLOAT_DURATION_MS);
  }, [running, gauge]);

  return (
    <div className="flex flex-col items-center gap-6 bg-white border border-[color:var(--color-line)] p-6">
      <div className={`w-full max-w-sm bg-surface rounded-full h-6 border border-[color:var(--color-line-strong)] overflow-hidden`}>
        <div
          className={`h-full gauge-fill ${gauge >= GAUGE_COLOR_RED ? 'gauge-red' : gauge >= GAUGE_COLOR_BLUE ? 'gauge-blue' : 'gauge-white'}`}
          style={{ width: `${gauge}%` }}
          data-testid="gauge"
        />
      </div>

      <div className="relative flex items-center justify-center">
        <button
          onClick={handleClick}
          className="relative w-48 h-48 rounded-full overflow-hidden active:scale-95 transition-transform select-none cursor-pointer"
          data-testid="click-button"
          aria-label="連打ボタン"
        >
          <Image
            src={clicked ? '/games/click/smile.png' : '/games/click/default.png'}
            alt="連打ボタン"
            width={192}
            height={192}
            className="w-full h-full object-cover"
            draggable={false}
            priority
          />
        </button>
        {!running && (
          <span className="animate-hover-bob pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-4 text-xl font-bold text-fg"
            style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}
          >
            ▼タップで褒める
          </span>
        )}
        {praises.map((p) => (
          <span
            key={`p-${p.id}`}
            className="animate-float-up pointer-events-none absolute bottom-1/2 font-bold text-2xl select-none"
            style={{
              left: `${p.x}%`,
              color: '#FF9900',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}
          >
            {p.word}
          </span>
        ))}
        {floats.map((f) => (
          <span
            key={f.id}
            className="animate-float-up pointer-events-none absolute bottom-1/2 font-bold text-3xl select-none"
            style={{
              left: `${f.x}%`,
              color: f.color,
              textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`,
            }}
          >
            +{f.pt}
          </span>
        ))}
      </div>

      <p className="text-price text-lg font-semibold" data-testid="total-earned">
        累計: {formatPoints(totalEarned)} pt
      </p>
      <p className="text-fg-muted text-sm">残高: {formatPoints(balance)} pt</p>
    </div>
  );
}
