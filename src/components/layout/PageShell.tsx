type Variant = 'default' | 'kaiji' | 'click';

const OUTER: Record<Variant, string> = {
  default: 'flex-1 bg-white',
  kaiji: 'flex-1 bg-gradient-to-b from-zinc-950 via-[#1a0708] to-black text-zinc-100 relative overflow-hidden',
  click: 'flex-1 relative overflow-hidden bg-[#b8881f]',
};

export function PageShell({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <div className={OUTER[variant]}>
      {variant === 'click' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/games/click/background.jpg')" }}
        />
      )}
      <div className="relative max-w-[1500px] mx-auto px-2 md:px-4 pt-4 pb-8">{children}</div>
    </div>
  );
}
