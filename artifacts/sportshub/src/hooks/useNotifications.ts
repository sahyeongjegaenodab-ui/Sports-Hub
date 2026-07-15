import { useEffect } from 'react';
import { useUserPrefs } from './useUserPrefs';
import { useFavoriteTeams } from './useFavoriteTeams';
import { NotificationService } from '../services/notification.service';
import { MlbService } from '../services/mlb.service';
import { NbaService } from '../services/nba.service';
import { NhlService } from '../services/nhl.service';
import { SoccerService } from '../services/soccer.service';
import { Game } from '../services/types';

const services = {
  mlb: new MlbService(),
  nba: new NbaService(),
  nhl: new NhlService(),
  soccer: new SoccerService(),
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function tomorrowStr() {
  const d = new Date(Date.now() + 86_400_000);
  return d.toISOString().split('T')[0];
}

export function useNotifications() {
  const { prefs } = useUserPrefs();
  const { favorites } = useFavoriteTeams();

  useEffect(() => {
    if (!prefs.notifications) return;
    if (NotificationService.getPermission() !== 'granted') return;

    const favoriteIds = new Set(favorites.map((t) => t.id));

    async function fetchAndCheck() {
      const sports = prefs.sports.length > 0 ? prefs.sports : ['mlb', 'nba', 'nhl', 'soccer'];
      const dates = [todayStr(), tomorrowStr()];
      const all: Game[] = [];

      for (const date of dates) {
        const fetches = sports.map(async (sport) => {
          const svc = services[sport as keyof typeof services];
          if (!svc) return [];
          try { return await svc.getTodayGames(date); } catch { return []; }
        });
        const results = await Promise.all(fetches);
        all.push(...results.flat());
      }

      // Only notify about favorite-team games
      const relevant =
        favoriteIds.size > 0
          ? all.filter(
              (g) =>
                favoriteIds.has(g.homeTeam.id) ||
                favoriteIds.has(g.awayTeam.id),
            )
          : all;

      NotificationService.checkAndNotify(relevant, prefs.notifyBefore ?? 30);
    }

    fetchAndCheck();
    const id = setInterval(fetchAndCheck, 60_000);
    return () => clearInterval(id);
  }, [prefs.notifications, prefs.notifyBefore, prefs.sports, favorites]);
}
