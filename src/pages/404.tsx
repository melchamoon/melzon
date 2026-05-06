import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem', background: '#0A0A0A', minHeight: '100vh', color: '#F5E184' }}>
      <p style={{ fontSize: '3rem' }}>🔍</p>
      <h1 style={{ color: '#D4AF37' }}>ページが見つかりません</h1>
      <Link href="/" style={{ color: '#D4AF37' }}>ストアに戻る</Link>
    </div>
  );
}
