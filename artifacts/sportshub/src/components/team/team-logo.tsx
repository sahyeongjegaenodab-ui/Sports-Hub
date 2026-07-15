import { useState } from 'react';

export function TeamLogo({ src, name, size = 'md' }: { src: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  if (error || !src) {
    return (
      <div className={`${sizeClasses[size]} bg-muted rounded-full flex items-center justify-center shrink-0`}>
        <span className={`font-bold text-muted-foreground ${textClasses[size]}`}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={`${name} logo`} 
      className={`${sizeClasses[size]} object-contain shrink-0`}
      onError={() => setError(true)}
    />
  );
}
