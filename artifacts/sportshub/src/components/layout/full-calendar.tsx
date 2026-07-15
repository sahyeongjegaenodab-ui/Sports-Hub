import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface FullCalendarProps {
  selectedDate: string;        // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}

export function FullCalendar({ selectedDate, onSelectDate, onClose }: FullCalendarProps) {
  const todayStr = toYMD(new Date());

  // Derive initial view-month from selectedDate
  const [viewYear, setViewYear] = useState(() => parseInt(selectedDate.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => parseInt(selectedDate.slice(5, 7)) - 1); // 0-based

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const month = String(viewMonth + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    cells.push(`${viewYear}-${month}-${day}`);
  }
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function handleSelect(dateStr: string) {
    onSelectDate(dateStr);
    onClose();
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full max-w-sm mx-auto overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-base font-bold tracking-wide">
            {MONTHS[viewMonth]} {viewYear}
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 px-4 pb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 px-4 pb-5 gap-y-1">
          {cells.map((dateStr, i) => {
            if (!dateStr) return <div key={`empty-${i}`} />;

            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isPast = dateStr < todayStr;

            return (
              <button
                key={dateStr}
                onClick={() => handleSelect(dateStr)}
                className={`
                  relative mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                  ${isSelected
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isToday
                    ? 'bg-primary/20 text-primary font-bold'
                    : isPast
                    ? 'text-muted-foreground hover:bg-muted'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                {parseInt(dateStr.slice(8))}
                {/* Today dot */}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Jump to today shortcut */}
        <div className="px-5 pb-5">
          <button
            onClick={() => handleSelect(todayStr)}
            className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            오늘로 이동
          </button>
        </div>

      </div>
    </div>
  );
}
