import { useState } from 'react';
import { AppShell } from '../components/layout/app-shell';
import { useStandings } from '../hooks/useStandings';
import { useFavoriteTeams } from '../hooks/useFavoriteTeams';

const LEAGUES = [
  { id: '103', name: 'MLB AL', sport: 'mlb' },
  { id: '104', name: 'MLB NL', sport: 'mlb' },
  { id: 'nba', name: 'NBA', sport: 'nba' },
  { id: 'nhl', name: 'NHL', sport: 'nhl' },
  { id: '4328', name: 'Premier League', sport: 'soccer' },
];

export default function Standings() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const { data: standings, isLoading } = useStandings(activeLeague.sport, activeLeague.id);
  const { isFavorite } = useFavoriteTeams();

  return (
    <AppShell>
      <div className="pt-safe flex flex-col h-full">
        <div className="px-6 py-4 bg-background border-b border-border shrink-0 z-10 sticky top-0">
          <h1 className="text-2xl font-bold mb-4">Standings</h1>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {LEAGUES.map(league => (
              <button
                key={league.id}
                onClick={() => setActiveLeague(league)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeLeague.id === league.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />)}
            </div>
          ) : standings && standings.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-card sticky top-0 border-b border-border shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground w-12 text-center">#</th>
                  <th className="px-2 py-3 font-semibold text-muted-foreground">Team</th>
                  <th className="px-2 py-3 font-semibold text-muted-foreground text-center">W</th>
                  <th className="px-2 py-3 font-semibold text-muted-foreground text-center">L</th>
                  <th className="px-2 py-3 font-semibold text-muted-foreground text-center hidden sm:table-cell">PCT/D</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">GB/Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {standings.map((row) => (
                  <tr key={row.team.id} className={`hover:bg-muted/50 transition-colors ${isFavorite(row.team.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-4 text-center font-medium">{row.rank}</td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-3">
                        <img src={row.team.logo} alt={row.team.name} className="w-6 h-6 object-contain shrink-0" />
                        <span className={`font-semibold line-clamp-1 ${isFavorite(row.team.id) ? 'text-primary' : ''}`}>
                          {row.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-center tabular-nums">{row.wins}</td>
                    <td className="px-2 py-4 text-center tabular-nums">{row.losses}</td>
                    <td className="px-2 py-4 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{row.drawsOrPct}</td>
                    <td className="px-4 py-4 text-center font-bold tabular-nums">{row.ptsOrGb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Standings not available for this league.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
