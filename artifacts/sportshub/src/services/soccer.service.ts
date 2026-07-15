import { Game, ServiceInterface, Standing, Team, Player } from './types';
import { cache } from './cache';

export class SoccerService implements ServiceInterface {
  async getTodayGames(date: string): Promise<Game[]> {
    const cacheKey = `soccer_games_${date}`;
    const cached = cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`);
      const data = await res.json();
      if (!data.events) return [];

      const games: Game[] = data.events.map((e: any) => {
        const hasScore = e.intHomeScore !== null && e.intHomeScore !== '' && e.intAwayScore !== null;
        const isLive = e.strStatus === 'Match Finished' ? false : hasScore;
        const state: 'upcoming' | 'live' | 'final' =
          e.strStatus === 'Match Finished' ? 'final'
          : isLive ? 'live'
          : 'upcoming';

        return {
          id: e.idEvent,
          sport: 'soccer',
          startTime: `${e.dateEvent}T${e.strTime || '00:00:00'}Z`,
          status: {
            state,
            display: state === 'final' ? 'FT'
              : state === 'live' ? 'LIVE'
              : e.strTime ? e.strTime.slice(0, 5) : 'TBD',
          },
          homeTeam: {
            id: e.idHomeTeam || e.strHomeTeam,
            name: e.strHomeTeam,
            logo: e.strHomeTeamBadge || '',
            sport: 'soccer',
          },
          awayTeam: {
            id: e.idAwayTeam || e.strAwayTeam,
            name: e.strAwayTeam,
            logo: e.strAwayTeamBadge || '',
            sport: 'soccer',
          },
          homeScore: hasScore ? parseInt(e.intHomeScore) : null,
          awayScore: hasScore ? parseInt(e.intAwayScore) : null,
          venue: e.strVenue ? `${e.strVenue} · ${e.strLeague}` : (e.strLeague || ''),
        };
      });

      cache.set(cacheKey, games, 120);
      return games;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getSchedule(date: string): Promise<Game[]> {
    return this.getTodayGames(date);
  }

  async getStandings(leagueId: string): Promise<Standing[]> {
    // World Cup uses year-only season format; club leagues use YYYY-YYYY
    const season = leagueId === '4429' ? '2026' : '2025-2026';
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${leagueId}&s=${season}`);
      const data = await res.json();
      if (!data.table) return [];
      
      return data.table.map((st: any) => ({
        team: {
          id: st.idTeam,
          name: st.strTeam,
          logo: st.strBadge,
          sport: 'soccer'
        },
        rank: parseInt(st.intRank),
        wins: parseInt(st.intWin),
        losses: parseInt(st.intLoss),
        drawsOrPct: st.intDraw,
        ptsOrGb: st.intPoints,
        streak: st.strForm || ''
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getGameDetail(gameId: string): Promise<Game> {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${gameId}`);
      const data = await res.json();
      const e = data.events?.[0];
      if (!e) throw new Error('Event not found');

      const hasScore = e.intHomeScore !== null && e.intHomeScore !== '' && e.intAwayScore !== null;
      const state: 'upcoming' | 'live' | 'final' =
        e.strStatus === 'Match Finished' ? 'final'
        : hasScore ? 'live'
        : 'upcoming';

      return {
        id: e.idEvent,
        sport: 'soccer',
        startTime: `${e.dateEvent}T${e.strTime || '00:00:00'}Z`,
        status: {
          state,
          display: state === 'final' ? 'FT' : state === 'live' ? 'LIVE' : (e.strTime?.slice(0, 5) ?? 'TBD'),
        },
        homeTeam: {
          id: e.idHomeTeam || e.strHomeTeam,
          name: e.strHomeTeam,
          logo: e.strHomeTeamBadge || '',
          sport: 'soccer',
        },
        awayTeam: {
          id: e.idAwayTeam || e.strAwayTeam,
          name: e.strAwayTeam,
          logo: e.strAwayTeamBadge || '',
          sport: 'soccer',
        },
        homeScore: hasScore ? parseInt(e.intHomeScore) : null,
        awayScore: hasScore ? parseInt(e.intAwayScore) : null,
        venue: e.strVenue ? `${e.strVenue} · ${e.strLeague}` : (e.strLeague || ''),
        events: [],
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async searchTeams(query: string): Promise<Team[]> {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${query}`);
      const data = await res.json();
      if (!data.teams) return [];
      
      return data.teams.filter((t:any) => t.strSport === 'Soccer').map((t: any) => ({
        id: t.idTeam,
        name: t.strTeam,
        abbrev: t.strTeamShort,
        logo: t.strBadge,
        sport: 'soccer'
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getTeamDetail(teamId: string): Promise<any> { return { team: { id: teamId, sport: 'soccer' }}; }
  async getPlayerDetail(playerId: string): Promise<any> { return {}; }
}
