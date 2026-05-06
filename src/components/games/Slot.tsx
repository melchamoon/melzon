'use client';

import { useState, useCallback, useEffect } from 'react';
import { earnPointsLocal } from '@/lib/points';
import { usePoints } from '@/lib/use-storage';
import { spinResult, type ReelSymbol } from '@/lib/slot';
import { formatPoints } from '@/lib/format';

const SYMBOL_DISPLAY: Record<ReelSymbol, string> = {
  '7': '7️⃣',
  CHERRY: '🍒',
  BELL: '🔔',
  LEMON: '🍋',
  GEM: '💎',
  MEL: '⭐',
};

const ALL_SYMBOLS: ReelSymbol[] = ['7', 'CHERRY', 'BELL', 'LEMON', 'GEM', 'MEL'];

type SlotState = {
  spinning: boolean;
  reels: [ReelSymbol, ReelSymbol, ReelSymbol];
  lastEarn: number | null;
};

export function Slot() {
  const balance = usePoints();
  const [state, setState] = useState<SlotState>({
    spinning: false,
    reels: ['MEL', 'MEL', 'MEL'],
    lastEarn: null,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (state.spinning) {
      intervalId = setInterval(() => {
        setState((s) => {
          if (!s.spinning) return s;
          const randomReels: [ReelSymbol, ReelSymbol, ReelSymbol] = [
            ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]!,
            ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]!,
            ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]!,
          ];
          return { ...s, reels: randomReels };
        });
      }, 50);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.spinning]);

  const spin = useCallback(async () => {
    if (state.spinning) return;
    setState((s) => ({ ...s, spinning: true, lastEarn: null }));

    await new Promise((r) => setTimeout(r, 1200));

    const result = spinResult();
    setState((s) => ({ ...s, spinning: false, reels: result.reels }));

    if (result.payout > 0) {
      earnPointsLocal(result.payout);
      setState((s) => ({ ...s, lastEarn: result.payout }));
    } else {
      setState((s) => ({ ...s, lastEarn: 0 }));
    }
  }, [state.spinning]);

  return (
    <>
      {state.lastEarn === 10_000 && <Confetti />}
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 w-full max-w-5xl mx-auto">
        {/* スロット本体 */}
        <div className="flex flex-col items-center gap-8 p-8 md:p-12 bg-white border border-[color:var(--color-line)] w-full max-w-lg relative overflow-hidden shrink-0">
          <h2 className="text-3xl md:text-4xl font-black text-fg tracking-widest relative z-10">
            MELZON SLOT
          </h2>

          <div className="flex gap-4 p-6 bg-surface rounded-sm border-4 border-[color:var(--color-line-strong)] relative z-10">
            {state.reels.map((sym, i) => (
              <div
                key={i}
                className="w-24 h-24 md:w-32 md:h-32 bg-white border border-[color:var(--color-line)] rounded-sm flex items-center justify-center text-5xl md:text-6xl overflow-hidden relative"
                data-testid={`reel-${i}`}
              >
                <div className={`transition-transform duration-75 ${state.spinning ? 'scale-y-150 blur-[2px] opacity-80' : 'scale-y-100 blur-none opacity-100'}`}>
                  {SYMBOL_DISPLAY[sym]}
                </div>
              </div>
            ))}
          </div>

          <div className="h-24 flex items-center justify-center w-full relative z-10">
            {state.lastEarn !== null && state.lastEarn > 0 && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 fade-in slide-in-from-bottom-4">
                <span className="text-2xl md:text-3xl font-bold text-cta">
                  {state.lastEarn === 10_000 ? '🎉 MEGA JACKPOT! 🎉' : '✨ WIN! ✨'}
                </span>
                <span className="text-xl text-price mt-2 font-mono bg-surface px-4 py-1 border border-[color:var(--color-line)]">
                  +{formatPoints(state.lastEarn)} pt
                </span>
              </div>
            )}
            {state.lastEarn === 0 && (
              <div className="text-fg-muted text-lg animate-in fade-in duration-300 font-medium">
                Next Time...
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 w-full relative z-10">
            <button
              onClick={spin}
              disabled={state.spinning}
              className="w-full md:w-64 h-16 text-2xl font-black bg-cta-yellow border-2 border-[color:var(--color-cta-yellow-border)] text-fg hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="spin-button"
            >
              {state.spinning ? 'SPINNING...' : 'SPIN!'}
            </button>

            <div className="flex justify-between items-center w-full px-5 py-3 bg-surface border border-[color:var(--color-line)]">
              <span className="text-fg-muted text-sm font-bold tracking-wider">BALANCE</span>
              <span className="text-fg text-2xl font-mono tracking-wider font-semibold">
                {formatPoints(balance)} <span className="text-sm text-fg-muted">pt</span>
              </span>
            </div>
          </div>
        </div>

        {/* ペイアウト表 */}
        <div className="w-full max-w-sm lg:w-80 flex flex-col gap-6 p-6 md:p-8 bg-white border border-[color:var(--color-line)] shrink-0">
          <h3 className="text-fg font-bold text-xl text-center border-b border-[color:var(--color-line)] pb-4 tracking-widest">
            PAYTABLE
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-surface p-2 md:p-3 border border-[color:var(--color-cta)]">
              <div className="flex gap-2 text-xl md:text-2xl">
                <span>7️⃣</span><span>7️⃣</span><span>7️⃣</span>
              </div>
              <div className="text-price font-mono font-black text-lg md:text-xl tracking-wider">
                10,000 <span className="text-sm font-normal text-fg-muted">pt</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-surface p-2 md:p-3 border border-[color:var(--color-line)]">
              <div className="flex gap-2 text-xl md:text-2xl">
                <span>💎</span><span>💎</span><span>💎</span>
              </div>
              <div className="text-fg font-mono font-bold text-base md:text-lg tracking-wider">
                5,000 <span className="text-sm font-normal text-fg-muted">pt</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-surface p-2 md:p-3 border border-[color:var(--color-line)]">
              <div className="flex gap-2 text-xl md:text-2xl">
                <span>⭐</span><span>⭐</span><span>⭐</span>
              </div>
              <div className="text-fg font-mono font-bold text-base md:text-lg tracking-wider">
                2,000 <span className="text-sm font-normal text-fg-muted">pt</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-surface p-2 md:p-3">
              <div className="flex gap-2 text-xl md:text-2xl">
                <span>🔔</span><span>🔔</span><span>🔔</span>
              </div>
              <div className="text-fg font-mono font-bold text-base md:text-lg tracking-wider">
                1,000 <span className="text-sm font-normal text-fg-muted">pt</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-surface p-2 md:p-3">
              <div className="flex gap-2 text-lg md:text-xl">
                <span>🍒</span><span className="opacity-70">/</span><span>🍋</span><span className="text-[10px] md:text-xs text-fg-muted ml-2 self-center">3つ揃い</span>
              </div>
              <div className="text-fg font-mono font-medium text-base md:text-lg tracking-wider">
                500 <span className="text-sm font-normal text-fg-muted">pt</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-surface p-2 md:p-3">
              <div className="flex gap-2 text-sm md:text-base opacity-70 items-center">
                <span>任意の絵柄 2つ揃い</span>
              </div>
              <div className="text-fg font-mono font-medium text-base md:text-lg tracking-wider">
                100 <span className="text-sm font-normal text-fg-muted">pt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; left: number; animDuration: number; delay: number; color: string; tilt: number }[]>([]);

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
