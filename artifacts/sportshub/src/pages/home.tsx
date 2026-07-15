import { useState } from 'react';
import { useLocation } from 'wouter';
import { useUserPrefs } from '../hooks/useUserPrefs';
import { useLiveGames } from '../hooks/useLiveGames';
import { AppShell } from '../components/layout/app-shell';
import { DateStrip } from '../components/layout/date-strip';
import { GameCard } from '../components/game/game-card';
import { useFavoriteTeams } from '../hooks/useFavoriteTeams';

export default function Home() {
  const [, setLocation] = useLocation();
  const { prefs } = useUserPrefs();
  const { favorites } = useFavoriteTeams();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (prefs.sports.length === 0) {
    setLocation('/onboarding');
    return null;
  }

  const { data: games, isLoading } = useLiveGames(selectedDate);

  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AppShell>
      <div className="pt-safe pb-4">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-muted-foreground font-medium text-sm mb-1">{displayDate}</h2>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Good Morning.</h1>
        </div>

        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Games</h3>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : games && games.length > 0 ? (
            <div className="space-y-4">
              {games.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">😴</div>
              <h4 className="font-bold text-lg mb-1">No Games</h4>
              <p className="text-sm text-muted-foreground">There are no games scheduled for this date.</p>
            </div>
          )}

          {favorites.length > 0 && selectedDate === new Date().toISOString().split('T')[0] && (
            <>
              <div className="flex items-center justify-between mt-8">
                <h3 className="text-lg font-bold">Your Teams</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {favorites.map(team => (
                  <div key={team.id} className="min-w-[140px] bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                    <img src={team.logo} alt={team.name} className="w-12 h-12 object-contain mb-3" />
                    <span className="font-bold text-sm line-clamp-1">{team.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-1">{team.sport}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
