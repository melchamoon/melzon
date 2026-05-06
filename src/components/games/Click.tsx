'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { earnPoints } from '@/app/actions/points';
import { calcClickPt } from '@/lib/slot';
import { formatPoints } from '@/lib/format';
import Link from 'next/link';

export function Click({ initialBalance }: { initialBalance: number }) {
  const [gauge, setGauge] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [running, setRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [balance, setBalance] = useState(initialBalance);
  const earnedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setGauge((g) => Math.max(0, g - 0.25));
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  const handleClick = useCallback(() => {
    if (!running) setRunning(true);
    const pt = calcClickPt(gauge);
    earnedRef.current += pt;
    setTotalEarned(earnedRef.current);
    setGauge((g) => Math.min(100, g + 0.67));
  }, [running, gauge]);

  const handleStop = useCallback(async () => {
    setRunning(false);
    const res = await earnPoints({ game: 'click', points: earnedRef.current });
    setBalance(res.balance);
    setShowModal(true);
  }, []);

  useEffect(() => {
    return () => {
      if (earnedRef.current > 0 && !showModal) {
        earnPoints({ game: 'click', points: earnedRef.current }).catch(() => {});
      }
    };
  }, [showModal]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm bg-ink-950 rounded-full h-6 border border-gold-800 overflow-hidden">
        <div
          className="h-full bg-gold-metal transition-all duration-75"
          style={{ width: `${gauge}%` }}
          data-testid="gauge"
        />
      </div>

      <button
        onClick={handleClick}
        className="w-48 h-48 rounded-full bg-gold-metal shadow-gold-glow text-ink-950 text-3xl font-display font-bold active:scale-95 transition-transform select-none"
        data-testid="click-button"
        aria-label="連打ボタン"
      >
        連打！
      </button>

      <p className="text-gold-300 text-lg font-semibold" data-testid="total-earned">
        累計: {formatPoints(totalEarned)} pt
      </p>
      <p className="text-gold-200 text-sm">残高: {formatPoints(balance)} pt</p>

      <Button
        variant="outline-gold"
        onClick={handleStop}
        disabled={!running && totalEarned === 0}
        data-testid="stop-button"
      >
        やめる
      </Button>
      <p className="text-ink-400 text-xs">ゲームを離脱する前に「やめる」を押してください</p>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💪 お疲れさまでした！</DialogTitle>
            <DialogDescription>
              {formatPoints(earnedRef.current)} ポイント獲得！
            </DialogDescription>
          </DialogHeader>
          <p className="text-gold-300 text-center text-sm mt-2">
            残高: {formatPoints(balance)} pt
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => {
                earnedRef.current = 0;
                setTotalEarned(0);
                setRunning(false);
                setShowModal(false);
              }}
            >
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
