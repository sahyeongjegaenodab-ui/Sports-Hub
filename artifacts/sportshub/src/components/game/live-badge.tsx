export function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      <span className="text-[10px] font-bold tracking-wider">LIVE</span>
    </div>
  );
}
