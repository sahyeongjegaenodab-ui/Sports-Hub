import { useRoute } from 'wouter';
import { useGameDetail } from '../hooks/useStandings';
import { TeamLogo } from '../components/team/team-logo';
import { LiveBadge } from '../components/game/live-badge';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function GameDetail() {
  const [match, params] = useRoute('/game/:sport/:id');
  const { sport, id } = params || { sport: '', id: '' };
  
  const { data: game, isLoading } = useGameDetail(sport, id);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background max-w-[430px] mx-auto w-full p-6 animate-pulse">
        <div className="h-10 w-10 bg-muted rounded-full mb-8" />
        <div className="h-40 bg-card rounded-3xl mb-8" />
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-[100dvh] bg-background max-w-[430px] mx-auto w-full flex items-center justify-center flex-col p-6">
        <h2 className="text-xl font-bold mb-4">Game not found</h2>
        <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">Go Back</Link>
      </div>
    );
  }

  const isLive = game.status.state === 'live';
  const isFinal = game.status.state === 'final';

  return (
    <div className="min-h-[100dvh] bg-background max-w-[430px] mx-auto w-full pb-10">
      <div className="px-4 py-4 pt-safe flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur z-50">
        <Link href="/" className="w-10 h-10 flex items-center justify-center bg-card rounded-full text-foreground hover:bg-muted transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{sport}</div>
        <div className="w-10 h-10" />
      </div>

      <div className="px-6 mt-4">
        <div className="flex flex-col items-center justify-center text-center">
          {isLive ? <LiveBadge /> : <div className="text-sm font-bold text-muted-foreground px-3 py-1 bg-muted rounded-md">{game.status.display}</div>}
          
          <div className="flex items-center justify-center gap-6 w-full mt-8">
            <div className="flex flex-col items-center flex-1">
              <TeamLogo src={game.awayTeam.logo} name={game.awayTeam.name} size="xl" />
              <h3 className="mt-4 font-bold text-sm text-muted-foreground">{game.awayTeam.name}</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center px-4">
              <div className="text-6xl font-black font-mono tracking-tighter tabular-nums flex items-center justify-center gap-3">
                <span className={isFinal && (game.awayScore ?? 0) < (game.homeScore ?? 0) ? 'text-muted-foreground' : 'text-foreground'}>{game.awayScore ?? '-'}</span>
                <span className="text-border">:</span>
                <span className={isFinal && (game.homeScore ?? 0) < (game.awayScore ?? 0) ? 'text-muted-foreground' : 'text-foreground'}>{game.homeScore ?? '-'}</span>
              </div>
            </div>

            <div className="flex flex-col items-center flex-1">
              <TeamLogo src={game.homeTeam.logo} name={game.homeTeam.name} size="xl" />
              <h3 className="mt-4 font-bold text-sm text-muted-foreground">{game.homeTeam.name}</h3>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-6 border-b border-border pb-4">
            <button className="text-foreground font-bold text-lg">Overview</button>
            <button className="text-muted-foreground font-medium text-lg hover:text-foreground">Play-by-Play</button>
            <button className="text-muted-foreground font-medium text-lg hover:text-foreground">Box Score</button>
          </div>

          <div className="py-6 space-y-6">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h4 className="text-sm text-muted-foreground mb-4 font-semibold uppercase tracking-wider">Game Info</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(game.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Venue</span>
                  <span className="font-medium">{game.venue || 'TBD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
