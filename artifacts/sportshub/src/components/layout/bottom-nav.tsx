import { Link, useLocation } from 'wouter';
import { Home, Calendar, Star, Trophy, Settings } from 'lucide-react';

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/favorites', icon: Star, label: 'Favorites' },
    { href: '/standings', icon: Trophy, label: 'Standings' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="max-w-[430px] mx-auto flex justify-between items-center px-6 h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-14 h-full gap-1">
              <Icon 
                size={24} 
                className={`transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} 
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
