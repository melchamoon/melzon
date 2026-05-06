'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { earnPointsLocal } from '@/lib/points';
import { usePoints } from '@/lib/use-storage';
import { spinResult, ALL_SYMBOLS, PAY_TABLE, SYMBOL_LABEL, type ReelSymbol } from '@/lib/slot';
import { formatPoints } from '@/lib/format';

const SYMBOL_IMAGE: Record<ReelSymbol, string> = {
  SEVEN_GOLD: '/games/slot/7-gold.png',
  SEVEN_BLUE: '/games/slot/7-blue.png',
  SEVEN_RED: '/games/slot/7-red.png',
  BAR: '/games/slot/bar.png',
  PIERROT: '/games/slot/pierrot.png',
  CHERRY: '/games/slot/cherry.png',
  WATERMELON: '/games/slot/watermelon.png',
  BELL: '/games/slot/bell.png',
};


const STOP_DELAYS = [800, 400, 400] as const; // 左→中→右の停止間隔(ms)
const CONFETTI_THRESHOLD = 10_000; // 赤7揃い以上で紙吹雪

type SlotState = {
  spinning: [boolean, boolean, boolean];
  reels: [ReelSymbol, ReelSymbol, ReelSymbol];
  lastEarn: number | null;
};

export function Slot() {
  const balance = usePoints();
  const [state, setState] = useState<SlotState>({
    spinning: [false, false, false],
    reels: ['SEVEN_GOLD', 'SEVEN_BLUE', 'SEVEN_RED'],
    lastEarn: null,
  });

  const isAnySpinning = state.spinning.some(Boolean);
  const [reach, setReach] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (cooldownTimer.current) clearTimeout(cooldownTimer.current); }, []);

  // スピン中のリールのみランダム表示を更新
  useEffect(() => {
    if (!isAnySpinning) return;
    const id = setInterval(() => {
      setState((s) => {
        if (!s.spinning.some(Boolean)) return s;
        const reels = [...s.reels] as [ReelSymbol, ReelSymbol, ReelSymbol];
        for (let i = 0; i < 3; i++) {
          if (s.spinning[i]) {
            reels[i] = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]!;
          }
        }
        return { ...s, reels };
      });
    }, 60);
    return () => clearInterval(id);
  }, [isAnySpinning]);

  const spin = useCallback(async () => {
    if (isAnySpinning || cooldown) return;
    setState((s) => ({ ...s, spinning: [true, true, true], lastEarn: null }));

    const result = spinResult();

    // 左リール停止
    await new Promise((r) => setTimeout(r, STOP_DELAYS[0]));
    setState((s) => {
      const reels = [...s.reels] as [ReelSymbol, ReelSymbol, ReelSymbol];
      reels[0] = result.reels[0];
      return { ...s, reels, spinning: [false, true, true] };
    });

    // 中リール停止
    await new Promise((r) => setTimeout(r, STOP_DELAYS[1]));
    setState((s) => {
      const reels = [...s.reels] as [ReelSymbol, ReelSymbol, ReelSymbol];
      reels[1] = result.reels[1];
      return { ...s, reels, spinning: [false, false, true] };
    });

    // 左中が7×2ならリーチ演出
    const isSeven = (s: ReelSymbol) => s === 'SEVEN_GOLD' || s === 'SEVEN_BLUE' || s === 'SEVEN_RED';
    const isReach = isSeven(result.reels[0]) && isSeven(result.reels[1]);
    if (isReach) setReach(true);

    // 右リール停止 + 結果反映（リーチ時は3秒ディレイ）
    await new Promise((r) => setTimeout(r, isReach ? 3000 : STOP_DELAYS[2]));
    setReach(false);
    if (result.payout > 0) {
      earnPointsLocal(result.payout);
    }
    setState((s) => {
      const reels = [...s.reels] as [ReelSymbol, ReelSymbol, ReelSymbol];
      reels[2] = result.reels[2];
      return { ...s, reels, spinning: [false, false, false], lastEarn: result.payout };
    });

    if (result.payout >= CONFETTI_THRESHOLD) {
      setCooldown(true);
      cooldownTimer.current = setTimeout(() => setCooldown(false), 3000);
    }
  }, [isAnySpinning, cooldown]);

  const showConfetti = state.lastEarn !== null && state.lastEarn >= CONFETTI_THRESHOLD;
  const isJackpot = state.lastEarn !== null && state.lastEarn >= 1_000_000;

  return (
    <>
      {showConfetti && <Confetti />}
      <style>{`
        @keyframes reach-glow {
          0%   { border-color: #ff0000; box-shadow: 0 0 12px #ff0000; }
          16%  { border-color: #ff8800; box-shadow: 0 0 12px #ff8800; }
          33%  { border-color: #ffee00; box-shadow: 0 0 12px #ffee00; }
          50%  { border-color: #00cc00; box-shadow: 0 0 12px #00cc00; }
          66%  { border-color: #0066ff; box-shadow: 0 0 12px #0066ff; }
          83%  { border-color: #9900ff; box-shadow: 0 0 12px #9900ff; }
          100% { border-color: #ff0000; box-shadow: 0 0 12px #ff0000; }
        }
      `}</style>
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 w-full max-w-5xl mx-auto">
        {/* スロット本体 */}
        <div className="flex flex-col items-center gap-8 p-8 md:p-12 bg-white border border-[color:var(--color-line)] w-full max-w-lg relative overflow-hidden shrink-0">
          <h2 className="text-3xl md:text-4xl font-black text-fg tracking-widest relative z-10">
            メルゾンスロット
          </h2>

          <div
            className="flex border-4 border-[color:var(--color-line-strong)] relative z-10 bg-white shadow-inner"
            style={reach ? { animation: 'reach-glow 0.6s linear infinite' } : undefined}
          >
            {state.reels.map((sym, i) => (
              <div
                key={i}
                className={`w-24 h-24 md:w-32 md:h-32 bg-white flex items-center justify-center overflow-hidden relative${i < 2 ? ' border-r-2 border-[color:var(--color-line-strong)]' : ''}`}
                data-testid={`reel-${i}`}
              >
                <div
                  className={`relative w-full h-full transition-all duration-75 ${
                    state.spinning[i] ? 'blur-[2px] opacity-80' : 'blur-none opacity-100'
                  }`}
                >
                  <Image
                    src={SYMBOL_IMAGE[sym]}
                    alt={SYMBOL_LABEL[sym]}
                    fill
                    sizes="(min-width: 768px) 128px, 96px"
                    className="object-contain p-2"
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h-24 flex items-center justify-center w-full relative z-10">
            {state.lastEarn !== null && state.lastEarn > 0 && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 fade-in slide-in-from-bottom-4">
                <span className="text-2xl md:text-3xl font-bold text-cta">
                  {isJackpot ? '🎉 メガジャックポット！🎉' : '✨ 当たり！✨'}
                </span>
                <span className="text-xl text-price mt-2 font-mono bg-surface px-4 py-1 border border-[color:var(--color-line)]">
                  +{formatPoints(state.lastEarn)} pt
                </span>
              </div>
            )}
            {state.lastEarn === 0 && (
              <div className="text-fg-muted text-lg animate-in fade-in duration-300 font-medium">
                残念...
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 w-full relative z-10">
            <button
              onClick={spin}
              disabled={isAnySpinning || cooldown}
              className="w-full md:w-64 h-16 text-2xl font-black bg-cta-yellow border-2 border-[color:var(--color-cta-yellow-border)] text-fg hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="spin-button"
            >
              {isAnySpinning ? 'スピン中...' : cooldown ? '少々お待ちを...' : 'スピン！'}
            </button>

            <div className="flex justify-between items-center w-full px-5 py-3 bg-surface border border-[color:var(--color-line)]">
              <span className="text-fg-muted text-sm font-bold tracking-wider">残高</span>
              <span className="text-fg text-2xl font-mono tracking-wider font-semibold">
                {formatPoints(balance)} <span className="text-sm text-fg-muted">pt</span>
              </span>
            </div>
          </div>
        </div>

        {/* ペイアウト表 */}
        <div className="w-full max-w-sm lg:w-80 flex flex-col gap-6 p-6 md:p-8 bg-white border border-[color:var(--color-line)] shrink-0">
          <h3 className="text-fg font-bold text-xl text-center border-b border-[color:var(--color-line)] pb-4 tracking-widest">
            配当表
          </h3>

          <div className="flex flex-col gap-2">
            {PAY_TABLE.map((hand) => (
              <PaytableRow
                key={hand.id}
                symbols={(hand.displayReels ?? hand.reels)!}
                payout={hand.payout}
                highlight={hand.highlight}
                note={hand.note}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function PaytableRow({
  symbols,
  payout,
  highlight,
  note,
}: {
  symbols: [ReelSymbol, ReelSymbol, ReelSymbol];
  payout: number;
  highlight?: 'gold' | 'blue' | 'red';
  note?: string;
}) {
  const borderClass =
    highlight === 'gold'
      ? 'border-2 border-amber-400'
      : highlight === 'blue'
        ? 'border-2 border-blue-500'
        : highlight === 'red'
          ? 'border-2 border-red-500'
          : 'border border-[color:var(--color-line)]';
  return (
    <div className={`flex justify-between items-center bg-surface px-2 py-1.5 ${borderClass}`}>
      <div className="flex items-center gap-0.5">
        {symbols.map((s, i) => (
          <span key={i} className="relative w-6 h-6 md:w-7 md:h-7 inline-block">
            <Image
              src={SYMBOL_IMAGE[s]}
              alt={SYMBOL_LABEL[s]}
              fill
              sizes="28px"
              className="object-contain"
            />
          </span>
        ))}
        {note && <span className="text-[9px] text-fg-muted ml-1">{note}</span>}
      </div>
      <div className="text-fg font-mono font-bold text-xs md:text-sm tracking-wider whitespace-nowrap">
        {formatPoints(payout)} <span className="text-[10px] font-normal text-fg-muted">pt</span>
      </div>
    </div>
  );
}

function Confetti() {
  const [pieces, setPieces] = useState<
    { id: number; left: number; animDuration: number; delay: number; color: string; tilt: number }[]
  >([]);

  useEffect(() => {
    const colors = ['#F0C14B', '#FF9900', '#B12704', '#0066C0', '#ffffff'];
    const newPieces = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animDuration: Math.random() * 2.5 + 2,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      tilt: Math.floor(Math.random() * 20) - 10,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex justify-center">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-5%]"
          style={{
            left: `${p.left}%`,
            width: '10px',
            height: '18px',
            backgroundColor: p.color,
            animation: `fall ${p.animDuration}s linear ${p.delay}s forwards`,
            transform: `rotate(${p.tilt}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-5vh) rotate(0deg) rotateX(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg) rotateX(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
