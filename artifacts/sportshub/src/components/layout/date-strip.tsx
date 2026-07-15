import { useState, useRef, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { FullCalendar } from './full-calendar';

interface DateStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function buildDates(anchorDate: string) {
  const anchor = new Date(anchorDate + 'T00:00:00');
  const arr = [];
  for (let i = -3; i <= 7; i++) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const diff = Math.round((d.getTime() - new Date(todayStr + 'T00:00:00').getTime()) / 86400000);

    let display = '';
    if (diff === 0) display = 'Today';
    else if (diff === -1) display = 'Yesterday';
    else if (diff === 1) display = 'Tomorrow';
    else display = d.toLocaleDateString('en-US', { weekday: 'short' });

    arr.push({
      date: dateStr,
      display,
      full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return arr;
}

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const [calOpen, setCalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rebuild the visible window centered on selectedDate
  const dates = buildDates(selectedDate);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  return (
    <>
      <div className="flex items-stretch bg-background border-b border-border">
        {/* Scrollable date strip */}
        <div className="flex-1 overflow-x-auto hide-scrollbar" ref={scrollRef}>
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

        {/* Calendar open button */}
        <button
          onClick={() => setCalOpen(true)}
          className="shrink-0 px-4 flex items-center justify-center border-l border-border text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          aria-label="전체 캘린더 열기"
        >
          <CalendarDays size={20} />
        </button>
      </div>

      {calOpen && (
        <FullCalendar
          selectedDate={selectedDate}
          onSelectDate={(d) => { onSelectDate(d); setCalOpen(false); }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </>
  );
}
