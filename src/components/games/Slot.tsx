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
        <div className="flex flex-col items-center gap-8 p-8 md:p-12 rounded-3xl bg-ink-900 border border-gold-900 shadow-gold-glow w-full max-w-lg relative overflow-hidden shrink-0">
          {/* 豪華な装飾 */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gold-900/20 blur-[80px] pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-200 to-gold-500 drop-shadow-md tracking-widest relative z-10">
            MELZON SLOT
          </h2>

          <div className="flex gap-4 p-6 bg-ink-950 rounded-2xl border-4 border-gold-700 shadow-[inset_0_0_30px_rgba(0,0,0,1)] relative z-10">
            {state.reels.map((sym, i) => (
              <div
                key={i}
                className="w-24 h-24 md:w-32 md:h-32 bg-ink-900 border-b-4 border-ink-700 rounded-xl flex items-center justify-center text-5xl md:text-6xl overflow-hidden relative shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                data-testid={`reel-${i}`}
              >
                <div className={`transition-transform duration-75 ${state.spinning ? 'scale-y-150 blur-[2px] opacity-80' : 'scale-y-100 blur-none opacity-100'} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
                  {SYMBOL_DISPLAY[sym]}
                </div>
                {/* ガラスのような反射 */}
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="h-24 flex items-center justify-center w-full relative z-10">
            {state.lastEarn !== null && state.lastEarn > 0 && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 fade-in slide-in-from-bottom-4">
                <span className="text-2xl md:text-3xl font-bold text-gold-300 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">
                  {state.lastEarn === 10_000 ? '🎉 MEGA JACKPOT! 🎉' : '✨ WIN! ✨'}
                </span>
                <span className="text-xl text-gold-200 mt-2 font-mono bg-ink-950 px-4 py-1 rounded-full border border-gold-800">
                  +{formatPoints(state.lastEarn)} pt
                </span>
              </div>
            )}
            {state.lastEarn === 0 && (
              <div className="text-ink-400 text-lg animate-in fade-in duration-300 font-medium">
                Next Time...
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 w-full relative z-10">
            <button
              onClick={spin}
              disabled={state.spinning}
              className="w-full md:w-64 h-16 text-2xl font-black rounded-full bg-gold-metal text-ink-950 shadow-gold-glow hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gold-300/50"
              data-testid="spin-button"
            >
              {state.spinning ? 'SPINNING...' : 'SPIN!'}
            </button>

            <div className="flex justify-between items-center w-full px-5 py-3 bg-ink-950/80 rounded-xl border border-gold-900/50 backdrop-blur-sm">
              <span className="text-gold-500/70 text-sm font-bold tracking-wider">BALANCE</span>
              <span className="text-gold-200 text-2xl font-mono tracking-wider font-semibold">
                {formatPoints(balance)} <span className="text-sm text-gold-600">pt</span>
              </span>
            </div>

          </div>
        </div>

        {/* ペイアウト表 */}
        <div className="w-full max-w-sm lg:w-80 flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-ink-900 border border-gold-900/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden shrink-0">
          <div className="absolute top-0 inset-x-0 h-32 bg-gold-900/10 blur-[50px] pointer-events-none" />

          <h3 className="text-gold-400 font-bold text-xl text-center border-b border-gold-900/50 pb-4 tracking-widest relative z-10">
            PAYTABLE
          </h3>

          <div className="flex flex-col gap-3 relative z-10">
            {/* 10,000 pt */}
            <div className="flex justify-between items-center bg-ink-950 p-2 md:p-3 rounded-xl border border-gold-600/40 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              <div className="flex gap-2 text-xl md:text-2xl drop-shadow-md">
                <span>7️⃣</span><span>7️⃣</span><span>7️⃣</span>
              </div>
              <div className="text-gold-300 font-mono font-black text-lg md:text-xl tracking-wider">
                10,000 <span className="text-sm font-normal text-gold-600">pt</span>
              </div>
            </div>

            {/* 5,000 pt */}
            <div className="flex justify-between items-center bg-ink-950 p-2 md:p-3 rounded-xl border border-gold-700/40">
              <div className="flex gap-2 text-xl md:text-2xl">
                <span>💎</span><span>💎</span><span>💎</span>
              </div>
              <div className="text-gold-200 font-mono font-bold text-base md:text-lg tracking-wider">
                5,000 <span className="text-sm font-normal text-gold-600">pt</span>
              </div>
            </div>

            {/* 2,000 pt */}
            <div className="flex justify-between items-center bg-ink-950 p-2 md:p-3 rounded-xl border border-gold-800/40">
              <div className="flex gap-2 text-xl md:text-2xl">
                <span>⭐</span><span>⭐</span><span>⭐</span>
              </div>
              <div className="text-gold-200 font-mono font-bold text-base md:text-lg tracking-wider">
                2,000 <span className="text-sm font-normal text-gold-600">pt</span>
              </div>
            </div>

            {/* 1,000 pt */}
            <div className="flex justify-between items-center bg-ink-950 p-2 md:p-3 rounded-xl border border-transparent">
              <div className="flex gap-2 text-xl md:text-2xl">
                <span>🔔</span><span>🔔</span><span>🔔</span>
              </div>
              <div className="text-gold-200 font-mono font-bold text-base md:text-lg tracking-wider">
                1,000 <span className="text-sm font-normal text-gold-600">pt</span>
              </div>
            </div>

            {/* 500 pt */}
            <div className="flex justify-between items-center bg-ink-950 p-2 md:p-3 rounded-xl border border-transparent">
              <div className="flex gap-2 text-lg md:text-xl">
                <span>🍒</span><span className="opacity-70">/</span><span>🍋</span><span className="text-[10px] md:text-xs text-gold-500/70 ml-2 self-center">3つ揃い</span>
              </div>
              <div className="text-gold-100 font-mono font-medium text-base md:text-lg tracking-wider">
                500 <span className="text-sm font-normal text-gold-600">pt</span>
              </div>
            </div>

            {/* 100 pt */}
            <div className="flex justify-between items-center bg-ink-950 p-2 md:p-3 rounded-xl border border-transparent">
              <div className="flex gap-2 text-sm md:text-base opacity-70 items-center">
                <span>任意の絵柄 2つ揃い</span>
              </div>
              <div className="text-gold-100 font-mono font-medium text-base md:text-lg tracking-wider">
                100 <span className="text-sm font-normal text-gold-600">pt</span>
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
    const colors = ['#F5E184', '#D4AF37', '#9B1B30', '#ffffff', '#eab308'];
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
