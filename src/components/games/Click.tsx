'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { earnPointsLocal } from '@/lib/points';
import { usePoints } from '@/lib/use-storage';
import { calcClickPt } from '@/lib/slot';
import { formatPoints } from '@/lib/format';

const GAUGE_TICK_MS = 50;
const GAUGE_DECAY = 0.05;
const GAUGE_CLICK_RISE = 1.67;
const CLICK_GRACE_MS = 1000;
const FLOAT_DURATION_MS = 900;
const FLOAT_X_MIN = 35;
const FLOAT_X_RANGE = 30;
const GAUGE_COLOR_BLUE = 33;
const GAUGE_COLOR_RED = 66;
const GAUGE_COLOR_GOLD = 100;

export function Click() {
  const balance = usePoints();
  const [gauge, setGauge] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [running, setRunning] = useState(false);
  const lastClickTimeRef = useRef(0);
  const [floats, setFloats] = useState<{ id: number; pt: number; x: number; color: string }[]>([]);
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
    const pt = calcClickPt(gauge);
    earnPointsLocal(pt);
    setTotalEarned((t) => t + pt);
    setGauge((g) => Math.min(100, g + GAUGE_CLICK_RISE));
    const id = ++floatIdRef.current;
    const x = FLOAT_X_MIN + Math.random() * FLOAT_X_RANGE;
    const color = gauge >= GAUGE_COLOR_GOLD ? '#D4AF37' : gauge >= GAUGE_COLOR_RED ? '#ef4444' : gauge >= GAUGE_COLOR_BLUE ? '#60a5fa' : '#ffffff';
    setFloats((prev) => [...prev, { id, pt, x, color }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), FLOAT_DURATION_MS);
  }, [running, gauge]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`w-full max-w-sm bg-ink-950 rounded-full h-6 border border-gold-800 overflow-hidden ${gauge >= GAUGE_COLOR_GOLD ? 'gauge-max' : ''}`}>
        <div
          className={`h-full gauge-fill ${gauge >= GAUGE_COLOR_GOLD ? 'gauge-gold-shine' : gauge >= GAUGE_COLOR_RED ? 'gauge-red' : gauge >= GAUGE_COLOR_BLUE ? 'gauge-blue' : 'gauge-white'}`}
          style={{ width: `${gauge}%` }}
          data-testid="gauge"
        />
      </div>

      <div className="relative flex items-center justify-center">
        <button
          onClick={handleClick}
          className="w-48 h-48 rounded-full bg-gold-metal shadow-gold-glow text-ink-950 text-3xl font-display font-bold active:scale-95 transition-transform select-none cursor-pointer"
          data-testid="click-button"
          aria-label="連打ボタン"
        >
          連打！
        </button>
        {floats.map((f) => (
          <span
            key={f.id}
            className="animate-float-up pointer-events-none absolute bottom-1/2 font-bold text-2xl select-none"
            style={{
              left: `${f.x}%`,
              color: f.color,
              textShadow: `0 0 8px ${f.color}, 0 2px 6px rgba(0,0,0,0.9)`,
            }}
          >
            +{f.pt}
          </span>
        ))}
      </div>

      <p className="text-gold-300 text-lg font-semibold" data-testid="total-earned">
        累計: {formatPoints(totalEarned)} pt
      </p>
      <p className="text-gold-200 text-sm">残高: {formatPoints(balance)} pt</p>
    </div>
  );
}
