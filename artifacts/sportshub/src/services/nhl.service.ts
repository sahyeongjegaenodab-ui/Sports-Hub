import { Game, ServiceInterface, Standing, Team, Player } from './types';
import { cache } from './cache';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';

function dateToEspn(date: string) {
  return date.replace(/-/g, '');
}

function parseCompetitors(competition: any): { home: any; away: any } {
  const home = competition.competitors.find((c: any) => c.homeAway === 'home');
  const away = competition.competitors.find((c: any) => c.homeAway === 'away');
  return { home, away };
}

export class NhlService implements ServiceInterface {
  async getTodayGames(date: string): Promise<Game[]> {
    const cacheKey = `nhl_games_${date}`;
    const cached = cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${ESPN_BASE}/scoreboard?dates=${dateToEspn(date)}`);
      const data = await res.json();

      const games: Game[] = (data.events || []).map((e: any) => {
        const comp = e.competitions?.[0];
        const { home, away } = parseCompetitors(comp);
        const stateStr: string = e.status?.type?.state ?? 'pre';
        const state: 'upcoming' | 'live' | 'final' =
          stateStr === 'post' ? 'final' : stateStr === 'in' ? 'live' : 'upcoming';

        const display =
          state === 'final' ? 'FINAL'
          : state === 'live' ? `P${e.status.period} ${e.status.displayClock}`
          : e.status?.type?.shortDetail ?? '';

        return {
          id: e.id,
          sport: 'nhl' as const,
          startTime: e.date,
          status: { state, display },
          homeTeam: {
            id: home?.team?.id ?? '',
            name: home?.team?.displayName ?? '',
            abbrev: home?.team?.abbreviation,
            logo: home?.team?.logo ?? '',
            sport: 'nhl' as const,
          },
          awayTeam: {
            id: away?.team?.id ?? '',
            name: away?.team?.displayName ?? '',
            abbrev: away?.team?.abbreviation,
            logo: away?.team?.logo ?? '',
            sport: 'nhl' as const,
          },
          homeScore: home?.score != null ? parseInt(home.score) : null,
          awayScore: away?.score != null ? parseInt(away.score) : null,
          venue: comp?.venue?.fullName ?? '',
        };
      });

      cache.set(cacheKey, games, 60);
      return games;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getSchedule(date: string): Promise<Game[]> {
    return this.getTodayGames(date);
  }

  async getStandings(_leagueId: string): Promise<Standing[]> {
    const cacheKey = 'nhl_standings';
    const cached = cache.get<Standing[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${ESPN_BASE}/standings`);
      const data = await res.json();

      const standings: Standing[] = [];
      let rank = 1;

      for (const conference of (data.children ?? [])) {
        for (const entry of (conference.standings?.entries ?? [])) {
          const stats: Record<string, number> = {};
          for (const s of (entry.stats ?? [])) stats[s.name] = s.value;

          standings.push({
            team: {
              id: entry.team.id,
              name: entry.team.displayName,
              abbrev: entry.team.abbreviation,
              logo: entry.team.logos?.[0]?.href ?? '',
              sport: 'nhl' as const,
            },
            rank: rank++,
            wins: stats['wins'] ?? 0,
            losses: stats['losses'] ?? 0,
            drawsOrPct: stats['otLosses'] != null ? stats['otLosses'].toString() : '-',
            ptsOrGb: stats['points'] != null ? stats['points'].toString() : '-',
            streak: entry.stats?.find((s: any) => s.name === 'streak')?.displayValue ?? '',
          });
        }
      }

      cache.set(cacheKey, standings, 300);
      return standings;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getGameDetail(gameId: string): Promise<Game> {
    try {
      const res = await fetch(`${ESPN_BASE}/summary?event=${gameId}`);
      const data = await res.json();
      const e = data.header?.competitions?.[0];
      if (!e) throw new Error('Game not found');

      const { home, away } = parseCompetitors(e);
      const stateStr: string = e.status?.type?.state ?? 'pre';
      const state: 'upcoming' | 'live' | 'final' =
        stateStr === 'post' ? 'final' : stateStr === 'in' ? 'live' : 'upcoming';

      return {
        id: gameId,
        sport: 'nhl' as const,
        startTime: e.date ?? '',
        status: {
          state,
          display: state === 'final' ? 'FINAL'
            : state === 'live' ? `P${e.status.period} ${e.status.displayClock}`
            : e.status?.type?.shortDetail ?? '',
        },
        homeTeam: {
          id: home?.team?.id ?? '',
          name: home?.team?.displayName ?? '',
          abbrev: home?.team?.abbreviation,
          logo: home?.team?.logo ?? '',
          sport: 'nhl' as const,
        },
        awayTeam: {
          id: away?.team?.id ?? '',
          name: away?.team?.displayName ?? '',
          abbrev: away?.team?.abbreviation,
          logo: away?.team?.logo ?? '',
          sport: 'nhl' as const,
        },
        homeScore: home?.score != null ? parseInt(home.score) : null,
        awayScore: away?.score != null ? parseInt(away.score) : null,
        venue: e.venue?.fullName ?? '',
        events: [],
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async searchTeams(query: string): Promise<Team[]> {
    try {
      const res = await fetch(`${ESPN_BASE}/teams`);
      const data = await res.json();
      const q = query.toLowerCase();
      return (data.sports?.[0]?.leagues?.[0]?.teams ?? [])
        .map((t: any) => t.team)
        .filter((t: any) =>
          t.displayName?.toLowerCase().includes(q) ||
          t.abbreviation?.toLowerCase().includes(q)
        )
        .map((t: any) => ({
          id: t.id,
          name: t.displayName,
          abbrev: t.abbreviation,
          logo: t.logos?.[0]?.href ?? '',
          sport: 'nhl' as const,
        }));
    } catch {
      return [];
    }
  }

  async getTeamDetail(teamId: string): Promise<any> { return { team: { id: teamId, sport: 'nhl' } }; }
  async getPlayerDetail(playerId: string): Promise<any> { return {}; }
}
