import { useState, useMemo } from 'react';
import { AppShell } from '../components/layout/app-shell';
import { DateStrip } from '../components/layout/date-strip';
import { useLiveGames } from '../hooks/useLiveGames';
import { GameCard } from '../components/game/game-card';
import { useUserPrefs } from '../hooks/useUserPrefs';

const ALL_SPORTS = ['mlb', 'nba', 'nhl', 'soccer', 'nfl', 'tennis', 'golf'];

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<string>('all');
  const { prefs } = useUserPrefs();

  // Force loading all sports for schedule if needed, or just use user prefs
  const { data: games, isLoading } = useLiveGames(selectedDate);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    if (filter === 'all') return games;
    return games.filter(g => g.sport === filter);
  }, [games, filter]);

  const sportsFilter = ['all', ...prefs.sports];

  return (
    <AppShell>
      <div className="pt-safe flex flex-col h-full">
        <div className="px-6 py-4 bg-background border-b border-border shrink-0 z-10 sticky top-0">
          <h1 className="text-2xl font-bold">Schedule</h1>
        </div>

        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="px-4 py-3 overflow-x-auto hide-scrollbar flex gap-2 border-b border-border bg-background/95 backdrop-blur z-10">
          {sportsFilter.map(sport => (
            <button
              key={sport}
              onClick={() => setFilter(sport)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === sport ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {sport === 'all' ? 'All Sports' : sport.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse" />)
          ) : filteredGames.length > 0 ? (
            filteredGames.map(game => <GameCard key={game.id} game={game} />)
          ) : (
             <div className="text-center py-12 text-muted-foreground">
               <p>No games found for this date.</p>
             </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
