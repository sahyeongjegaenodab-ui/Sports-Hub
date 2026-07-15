import { useState } from 'react';
import { useLocation } from 'wouter';
import { useUserPrefs } from '../hooks/useUserPrefs';
import { useFavoriteTeams } from '../hooks/useFavoriteTeams';
import { Check, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { MlbService } from '../services/mlb.service';
import { NbaService } from '../services/nba.service';
import { NhlService } from '../services/nhl.service';
import { SoccerService } from '../services/soccer.service';

const SPORTS = [
  { id: 'mlb', name: 'Baseball', icon: '⚾️' },
  { id: 'nba', name: 'Basketball', icon: '🏀' },
  { id: 'nhl', name: 'Hockey', icon: '🏒' },
  { id: 'soccer', name: 'Soccer', icon: '⚽️' },
  { id: 'nfl', name: 'Football', icon: '🏈' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'golf', name: 'Golf', icon: '⛳️' },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { updatePrefs } = useUserPrefs();
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // NFL uses TheSportsDB search filtered to American Football
  const nflSearchTeams = async (query: string) => {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!data.teams) return [];
      return data.teams
        .filter((t: any) => t.strSport === 'American Football')
        .map((t: any) => ({ id: t.idTeam, name: t.strTeam, abbrev: t.strTeamShort, logo: t.strBadge, sport: 'nfl' }));
    } catch { return []; }
  };

  const services = {
    mlb: new MlbService(),
    nba: new NbaService(),
    nhl: new NhlService(),
    soccer: new SoccerService(),
    nfl: { searchTeams: nflSearchTeams },
  };

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['searchTeams', searchQuery, selectedSports],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const promises = selectedSports.map(async sport => {
        const service = services[sport as keyof typeof services];
        if (service) return await service.searchTeams(searchQuery);
        return [];
      });
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: step === 2 && searchQuery.length >= 2,
  });

  const handleNext = () => {
    if (step === 1 && selectedSports.length > 0) {
      setStep(2);
    } else if (step === 2) {
      // updatePrefs now writes localStorage synchronously before navigation
      updatePrefs({ sports: selectedSports, onboardingComplete: true });
      setLocation('/');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-[430px] space-y-8">
        
        <div className="space-y-2">
          <div className="text-primary text-4xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to SportsHub</h1>
          <p className="text-muted-foreground text-sm">
            {step === 1 ? "Which sports do you follow?" : "Find your favorite teams"}
          </p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3 mt-8">
            {SPORTS.map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelectedSports(prev => prev.includes(sport.id) ? prev.filter(s => s !== sport.id) : [...prev, sport.id])}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${
                  selectedSports.includes(sport.id) 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <span className="text-3xl">{sport.icon}</span>
                <span className="font-medium">{sport.name}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-8 text-left">
            <input
              type="search"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
            />
            
            <div className="min-h-[300px] max-h-[400px] overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="text-center py-8 text-muted-foreground">Searching...</div>
              ) : searchResults?.length ? (
                searchResults.map(team => {
                  const isFav = isFavorite(team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => toggleFavorite(team)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                        isFav ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                        <span className="font-semibold text-foreground">{team.name}</span>
                      </div>
                      {isFav && <Check className="text-primary" size={20} />}
                    </button>
                  );
                })
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">No teams found</div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Type to search for teams across your selected sports</div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={step === 1 && selectedSports.length === 0}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
        >
          {step === 1 ? 'Next' : 'Finish Setup'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
