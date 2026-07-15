import { Link } from 'wouter';
import { Game } from '../../services/types';
import { TeamLogo } from '../team/team-logo';
import { LiveBadge } from './live-badge';

export function GameCard({ game }: { game: Game }) {
  const isLive = game.status.state === 'live';
  const isFinal = game.status.state === 'final';

  return (
    <Link href={`/game/${game.sport}/${game.id}`} className="block">
      <div className="bg-card border border-border rounded-2xl p-4 hover-elevate transition-all">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {game.sport === 'mlb' ? 'MLB' : game.sport === 'nba' ? 'NBA' : game.sport === 'nhl' ? 'NHL' : 'Soccer'}
          </div>
          {isLive ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">{game.status.display}</span>
              <LiveBadge />
            </div>
          ) : isFinal ? (
            <div className="bg-muted text-muted-foreground px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider">
              FINAL
            </div>
          ) : (
            <div className="text-xs font-medium text-muted-foreground">
              {game.status.display}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamLogo src={game.awayTeam.logo} name={game.awayTeam.name} size="md" />
              <span className={`font-bold ${isFinal && (game.awayScore ?? 0) < (game.homeScore ?? 0) ? 'text-muted-foreground' : 'text-foreground'}`}>
                {game.awayTeam.name}
              </span>
            </div>
            <span className={`text-xl font-bold font-mono ${(isLive || isFinal) ? 'text-foreground' : 'text-muted-foreground'}`}>
              {game.awayScore ?? '-'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamLogo src={game.homeTeam.logo} name={game.homeTeam.name} size="md" />
              <span className={`font-bold ${isFinal && (game.homeScore ?? 0) < (game.awayScore ?? 0) ? 'text-muted-foreground' : 'text-foreground'}`}>
                {game.homeTeam.name}
              </span>
            </div>
            <span className={`text-xl font-bold font-mono ${(isLive || isFinal) ? 'text-foreground' : 'text-muted-foreground'}`}>
              {game.homeScore ?? '-'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
