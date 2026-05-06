export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-white">
      <div className="max-w-[1500px] mx-auto px-2 md:px-4 pt-4 pb-8">{children}</div>
    </div>
  );
}
