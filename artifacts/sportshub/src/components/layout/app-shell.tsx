import { BottomNav } from './bottom-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background lg:bg-neutral-900 flex justify-center">
      <div className="w-full max-w-[430px] bg-background min-h-[100dvh] relative shadow-2xl overflow-hidden pb-16">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
