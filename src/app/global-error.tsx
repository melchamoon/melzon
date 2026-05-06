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
      <body style={{ background: '#0A0A0A', color: '#F5E184', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem' }}>⚠️</p>
          <h2 style={{ color: '#D4AF37' }}>エラーが発生しました</h2>
          <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#D4AF37', color: '#0A0A0A', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
