import { useQuery } from '@tanstack/react-query';
import { MlbService } from '../services/mlb.service';
import { NbaService } from '../services/nba.service';
import { NhlService } from '../services/nhl.service';
import { SoccerService } from '../services/soccer.service';
import { Game, Standing } from '../services/types';

const services = {
  mlb: new MlbService(),
  nba: new NbaService(),
  nhl: new NhlService(),
  soccer: new SoccerService(),
};

export function useGameDetail(sport: string, gameId: string) {
  return useQuery({
    queryKey: ['game', sport, gameId],
    queryFn: async () => {
      const service = services[sport as keyof typeof services];
      if (!service) throw new Error('Service not found');
      return await service.getGameDetail(gameId);
    },
    refetchInterval: 30000,
  });
}

export function useStandings(sport: string, leagueId: string) {
  return useQuery({
    queryKey: ['standings', sport, leagueId],
    queryFn: async () => {
      const service = services[sport as keyof typeof services];
      if (!service) throw new Error('Service not found');
      return await service.getStandings(leagueId);
    },
    staleTime: 5 * 60 * 1000,
  });
}
