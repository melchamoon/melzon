'use client';

import { useState, useEffect } from 'react';
import { formatPoints } from '@/lib/format';
import { usePoints } from '@/lib/use-storage';

export function GamesBalance() {
  const points = usePoints();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <p data-testid="games-balance" className="text-2xl font-bold text-price">
        <span className="invisible">0</span> pt
      </p>
    );
  }

  return (
    <p data-testid="games-balance" className="text-2xl font-bold text-price">
      {formatPoints(points)} pt
    </p>
  );
}
