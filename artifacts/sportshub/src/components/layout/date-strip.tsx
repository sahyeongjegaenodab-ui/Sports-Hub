import { useState, useRef, useEffect } from 'react';

interface DateStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const [dates, setDates] = useState<{ date: string; display: string; full: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    const arr = [];
    for (let i = -3; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      let display = '';
      if (i === 0) display = 'Today';
      else if (i === -1) display = 'Yesterday';
      else if (i === 1) display = 'Tomorrow';
      else display = d.toLocaleDateString('en-US', { weekday: 'short' });

      arr.push({
        date: d.toISOString().split('T')[0],
        display,
        full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    setDates(arr);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate, dates]);

  return (
    <div className="w-full overflow-x-auto hide-scrollbar bg-background border-b border-border" ref={scrollRef}>
      <div className="flex items-center px-4 py-3 gap-2 min-w-max">
        {dates.map((d) => {
          const isSelected = d.date === selectedDate;
          return (
            <button
              key={d.date}
              data-selected={isSelected}
              onClick={() => onSelectDate(d.date)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-colors ${
                isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <span className={`text-xs font-semibold ${isSelected ? 'text-primary-foreground/80' : ''}`}>{d.display}</span>
              <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-foreground'}`}>{d.full}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
