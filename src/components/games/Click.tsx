'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { earnPointsLocal } from '@/lib/points';
import { usePoints } from '@/lib/use-storage';
import { calcClickPt } from '@/lib/click';
import { formatPoints } from '@/lib/format';

const CLICK_PT_MAX = 100;
const IMAGE_RESET_MS = 200;

const PRAISE_WORDS = ['すごい！', 'えらい！', 'やるね！', 'さすが！', 'いいね！', 'かっこいい！', '天才！', 'ナイス！'];
const PRAISE_X_MIN = -10;
const PRAISE_X_RANGE = 15;

const GAUGE_TICK_MS = 50;
const GAUGE_DECAY = 0.15;
const GAUGE_CLICK_RISE = 0.5;
const CLICK_GRACE_MS = 1000;
const FLOAT_DURATION_MS = 900;
const FLOAT_X_MIN = 40;
const FLOAT_X_RANGE = 25;

const GAUGE_STAGES = [
  { min: 100, cls: 'gauge-rainbow', color: '#FFD700' },
  { min: 80,  cls: 'gauge-gold',   color: '#C5A028' },
  { min: 70, cls: 'gauge-silver',  color: '#C0C0C0' },
  { min: 60, cls: 'gauge-copper',  color: '#B87333' },
  { min: 50, cls: 'gauge-red',     color: '#CC0000' },
  { min: 40, cls: 'gauge-purple',  color: '#8800CC' },
  { min: 30, cls: 'gauge-blue',    color: '#0066C0' },
  { min: 20, cls: 'gauge-green',   color: '#00AA00' },
  { min: 10, cls: 'gauge-yellow',  color: '#DDC000' },
  { min: 0,  cls: 'gauge-orange',  color: '#FF8C00' },
] as const;

function getGaugeStage(gauge: number) {
  return GAUGE_STAGES.find((s) => gauge >= s.min) ?? GAUGE_STAGES[GAUGE_STAGES.length - 1]!;
}

export function Click() {
  const balance = usePoints();
  const [gauge, setGauge] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [running, setRunning] = useState(false);
  const [clicked, setClicked] = useState(false);
  const lastClickTimeRef = useRef(0);
  const imageResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [floats, setFloats] = useState<{ id: number; pt: number; x: number; color: string; rainbow: boolean }[]>([]);
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
    const pt = calcClickPt(gauge, CLICK_PT_MAX);
    earnPointsLocal(pt);
    setTotalEarned((t) => t + pt);
    setGauge((g) => Math.min(100, g + GAUGE_CLICK_RISE));
    const id = ++floatIdRef.current;
    const x = FLOAT_X_MIN + Math.random() * FLOAT_X_RANGE;
    const stage = getGaugeStage(gauge);
    setFloats((prev) => [...prev, { id, pt, x, color: stage.color, rainbow: stage.cls === 'gauge-rainbow' }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), FLOAT_DURATION_MS);
    const word = PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)]!;
    const px = PRAISE_X_MIN + Math.random() * PRAISE_X_RANGE;
    setPraises((prev) => [...prev, { id, word, x: px }]);
    setTimeout(() => setPraises((prev) => prev.filter((p) => p.id !== id)), FLOAT_DURATION_MS);
  }, [running, gauge]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className={`w-full max-w-sm bg-white/85 rounded-full h-6 border border-[color:var(--color-line-strong)] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.35)]`}>
        <div
          className={`h-full gauge-fill ${getGaugeStage(gauge).cls}`}
          style={{ width: `${gauge}%` }}
          data-testid="gauge"
        />
      </div>

      <div className="relative flex items-center justify-center">
        <button
          onClick={handleClick}
          className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden active:scale-95 transition-transform select-none cursor-pointer"
          data-testid="click-button"
          aria-label="連打ボタン"
        >
          <Image
            src={clicked ? '/games/click/smile.png' : '/games/click/default.png'}
            alt="連打ボタン"
            width={320}
            height={320}
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
            className="animate-float-up pointer-events-none absolute bottom-1/2 font-bold text-4xl select-none"
            style={{
              left: `${p.x}%`,
              color: '#FF9900',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff',
            }}
          >
            {p.word}
          </span>
        ))}
        {floats.map((f) => (
          <span
            key={f.id}
            className="animate-float-up pointer-events-none absolute bottom-1/2 font-bold text-5xl select-none"
            style={
              f.rainbow
                ? {
                    left: `${f.x}%`,
                    backgroundImage:
                      'linear-gradient(90deg, #ff0000, #ff8800, #ffdd00, #00cc00, #0088ff, #6600ff, #ff00aa)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                    filter:
                      'drop-shadow(1px 1px 0 #fff) drop-shadow(-1px -1px 0 #fff) drop-shadow(1px -1px 0 #fff) drop-shadow(-1px 1px 0 #fff)',
                  }
                : {
                    left: `${f.x}%`,
                    color: f.color,
                    textShadow: `-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff`,
                  }
            }
          >
            +{f.pt}pt
          </span>
        ))}
      </div>

      <div
        className="relative mt-2 px-6 py-3 bg-gradient-to-b from-zinc-900 to-black border-2 border-amber-400 shadow-[0_0_18px_rgba(0,0,0,0.55),inset_0_0_8px_rgba(251,191,36,0.25)] flex flex-col items-center gap-1"
      >
        <span aria-hidden className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
        <span aria-hidden className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
        <span aria-hidden className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
        <span aria-hidden className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-300" />
        <p
          className="text-xl font-black tracking-wider text-amber-300"
          style={{ textShadow: '0 0 8px rgba(251,191,36,0.6), 0 1px 0 #000' }}
          data-testid="total-earned"
        >
          累計 {formatPoints(totalEarned)} pt
        </p>
        <p className="text-xs font-mono tracking-widest text-zinc-300">
          残高 {formatPoints(balance)} pt
        </p>
      </div>
    </div>
  );
}
