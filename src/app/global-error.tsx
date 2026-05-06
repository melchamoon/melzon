'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body style={{ background: '#FFFFFF', color: '#0F1111', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem' }}>⚠️</p>
          <h2 style={{ color: '#0F1111', fontWeight: 'bold' }}>エラーが発生しました</h2>
          <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'linear-gradient(180deg, #F7DFA5 0%, #F0C14B 50%, #EB8F00 100%)', color: '#0F1111', border: '1px solid #A88734', borderRadius: '3px', cursor: 'pointer' }}>
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
