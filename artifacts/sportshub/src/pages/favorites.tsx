import { AppShell } from '../components/layout/app-shell';
import { useFavoriteTeams } from '../hooks/useFavoriteTeams';
import { TeamLogo } from '../components/team/team-logo';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

export default function Favorites() {
  const { favorites } = useFavoriteTeams();

  return (
    <AppShell>
      <div className="pt-safe px-6 py-6 h-full flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Favorites</h1>

        {favorites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">⭐️</div>
            <h2 className="text-xl font-bold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-8">Follow teams to get quick updates on their games and standings.</p>
            <Link href="/onboarding" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl">
              Find Teams
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map(team => (
              <div key={team.id} className="bg-card border border-border rounded-2xl p-5 hover-elevate transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TeamLogo src={team.logo} name={team.name} size="lg" />
                  <div>
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{team.sport}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
            
            <div className="pt-6">
               <Link href="/onboarding" className="w-full flex items-center justify-center p-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-bold hover:border-primary hover:text-primary transition-colors">
                 + Add More Teams
               </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
