import { useQuery } from '@tanstack/react-query';
import { MlbService } from '../services/mlb.service';
import { NbaService } from '../services/nba.service';
import { NhlService } from '../services/nhl.service';
import { SoccerService } from '../services/soccer.service';
import { Game } from '../services/types';
import { useUserPrefs } from './useUserPrefs';

const services = {
  mlb: new MlbService(),
  nba: new NbaService(),
  nhl: new NhlService(),
  soccer: new SoccerService(),
};

export function useLiveGames(date: string) {
  const { prefs } = useUserPrefs();
  const refreshInterval = prefs.refreshInterval * 1000;

  return useQuery({
    queryKey: ['liveGames', date, prefs.sports],
    queryFn: async () => {
      const selectedSports = prefs.sports.length > 0 ? prefs.sports : ['mlb', 'nba', 'nhl'];
      const promises = selectedSports.map(async (sport) => {
        const service = services[sport as keyof typeof services];
        if (service) {
          try {
            return await service.getTodayGames(date);
          } catch (e) {
            return [];
          }
        }
        return [];
      });

      const results = await Promise.all(promises);
      return results.flat();
    },
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
  });
}
