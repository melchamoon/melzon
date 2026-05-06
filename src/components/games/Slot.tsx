'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { earnPoints } from '@/app/actions/points';
import { spinResult, type ReelSymbol } from '@/lib/slot';
import { formatPoints } from '@/lib/format';
import Link from 'next/link';

const SYMBOL_DISPLAY: Record<ReelSymbol, string> = {
  '7': '7️⃣',
  CHERRY: '🍒',
  BELL: '🔔',
  LEMON: '🍋',
  GEM: '💎',
  MEL: '⭐',
};

type SlotState = {
  spinning: boolean;
  reels: [ReelSymbol, ReelSymbol, ReelSymbol];
  lastEarn: number | null;
  showModal: boolean;
  balance: number;
};

export function Slot({ initialBalance }: { initialBalance: number }) {
  const [state, setState] = useState<SlotState>({
    spinning: false,
    reels: ['MEL', 'MEL', 'MEL'],
    lastEarn: null,
    showModal: false,
    balance: initialBalance,
  });

  const spin = useCallback(async () => {
    if (state.spinning) return;
    setState((s) => ({ ...s, spinning: true }));

    await new Promise((r) => setTimeout(r, 900));

    const result = spinResult();
    setState((s) => ({ ...s, spinning: false, reels: result.reels, lastEarn: result.payout }));

    if (result.payout > 0) {
      const res = await earnPoints({ game: 'slot', points: result.payout });
      setState((s) => ({ ...s, showModal: true, balance: res.balance }));
    }
  }, [state.spinning]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4">
        {state.reels.map((sym, i) => (
          <div
            key={i}
            className={`w-20 h-20 md:w-28 md:h-28 bg-ink-950 border-2 border-gold-700 rounded-xl flex items-center justify-center text-4xl md:text-5xl ${
              state.spinning ? 'animate-pulse' : ''
            }`}
            data-testid={`reel-${i}`}
          >
            {SYMBOL_DISPLAY[sym]}
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={spin}
        disabled={state.spinning}
        className="w-40 text-lg"
        data-testid="spin-button"
      >
        {state.spinning ? 'スピン中…' : 'スピン！'}
      </Button>

      <p className="text-gold-300 text-sm">残高: {formatPoints(state.balance)} pt</p>

      <Dialog open={state.showModal} onOpenChange={(o) => setState((s) => ({ ...s, showModal: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {state.lastEarn === 10_000 ? '🎉 大当たり！' : '✨ 当たり！'}
            </DialogTitle>
            <DialogDescription>
              {formatPoints(state.lastEarn ?? 0)} ポイント獲得！
            </DialogDescription>
          </DialogHeader>
          <p className="text-gold-300 text-center text-sm mt-2">
            残高: {formatPoints(state.balance)} pt
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={() => setState((s) => ({ ...s, showModal: false }))}>
              もう一度
            </Button>
            <Button variant="outline-gold" asChild>
              <Link href="/">ストアに戻る</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/cart">カートを見る</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
