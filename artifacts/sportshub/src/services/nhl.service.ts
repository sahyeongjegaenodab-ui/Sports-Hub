import { Game, ServiceInterface, Standing, Team, Player } from './types';
import { cache } from './cache';

export class NhlService implements ServiceInterface {
  async getTodayGames(date: string): Promise<Game[]> {
    const cacheKey = `nhl_games_${date}`;
    const cached = cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await res.json();
      
      const gamesDay = data.gameWeek?.find((gw: any) => gw.date === date);
      if (!gamesDay) return [];

      const games: Game[] = (gamesDay.games || []).map((g: any) => {
        const stateCode = g.gameState; // OFF = Final, LIVE/CRIT = Live, FUT/PRE = Upcoming
        let state: 'upcoming' | 'live' | 'final' = 'upcoming';
        if (stateCode === 'OFF' || stateCode === 'FINAL') state = 'final';
        else if (stateCode === 'LIVE' || stateCode === 'CRIT') state = 'live';

        return {
          id: g.id.toString(),
          sport: 'nhl',
          startTime: g.startTimeUTC,
          status: {
            state,
            display: state === 'final' ? 'FINAL' : state === 'live' ? `${g.periodDescriptor?.periodType || ''} ${g.clock?.timeRemaining || ''}` : new Date(g.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          homeTeam: {
            id: g.homeTeam.id.toString(),
            name: g.homeTeam.placeName?.default || g.homeTeam.abbrev,
            abbrev: g.homeTeam.abbrev,
            logo: `https://assets.nhle.com/logos/nhl/svg/${g.homeTeam.abbrev}_light.svg`,
            sport: 'nhl'
          },
          awayTeam: {
            id: g.awayTeam.id.toString(),
            name: g.awayTeam.placeName?.default || g.awayTeam.abbrev,
            abbrev: g.awayTeam.abbrev,
            logo: `https://assets.nhle.com/logos/nhl/svg/${g.awayTeam.abbrev}_light.svg`,
            sport: 'nhl'
          },
          homeScore: g.homeTeam.score ?? null,
          awayScore: g.awayTeam.score ?? null,
          venue: g.venue?.default || ''
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

  async getStandings(leagueId: string): Promise<Standing[]> {
    try {
      const res = await fetch(`https://api-web.nhle.com/v1/standings/now`);
      const data = await res.json();
      
      const standings: Standing[] = data.standings.map((st: any) => ({
        team: {
          id: st.teamAbbrev.default,
          name: st.teamName.default,
          abbrev: st.teamAbbrev.default,
          logo: `https://assets.nhle.com/logos/nhl/svg/${st.teamAbbrev.default}_light.svg`,
          sport: 'nhl'
        },
        rank: st.leagueSequence,
        wins: st.wins,
        losses: st.losses,
        drawsOrPct: st.otLosses?.toString() || '0',
        ptsOrGb: st.points?.toString() || '0',
        streak: `${st.streakCode || ''}${st.streakCount || ''}`
      }));

      return standings;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getGameDetail(gameId: string): Promise<Game> {
    try {
      const res = await fetch(`https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
      const data = await res.json();
      
      const stateCode = data.gameState;
      let state: 'upcoming' | 'live' | 'final' = 'upcoming';
      if (stateCode === 'OFF' || stateCode === 'FINAL') state = 'final';
      else if (stateCode === 'LIVE' || stateCode === 'CRIT') state = 'live';

      return {
        id: gameId.toString(),
        sport: 'nhl',
        startTime: data.startTimeUTC,
        status: {
          state,
          display: state === 'final' ? 'FINAL' : state === 'live' ? `${data.periodDescriptor?.periodType || ''} ${data.clock?.timeRemaining || ''}` : new Date(data.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        homeTeam: {
          id: data.homeTeam.id.toString(),
          name: data.homeTeam.placeName?.default || data.homeTeam.abbrev,
          abbrev: data.homeTeam.abbrev,
          logo: `https://assets.nhle.com/logos/nhl/svg/${data.homeTeam.abbrev}_light.svg`,
          sport: 'nhl'
        },
        awayTeam: {
          id: data.awayTeam.id.toString(),
          name: data.awayTeam.placeName?.default || data.awayTeam.abbrev,
          abbrev: data.awayTeam.abbrev,
          logo: `https://assets.nhle.com/logos/nhl/svg/${data.awayTeam.abbrev}_light.svg`,
          sport: 'nhl'
        },
        homeScore: data.homeTeam.score ?? null,
        awayScore: data.awayTeam.score ?? null,
        venue: data.venue?.default || ''
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async searchTeams(query: string): Promise<Team[]> {
    try {
      const st = await this.getStandings('');
      const q = query.toLowerCase();
      return st.map(s => s.team).filter(t => t.name.toLowerCase().includes(q) || (t.abbrev && t.abbrev.toLowerCase().includes(q)));
    } catch (e) {
      return [];
    }
  }

  async getTeamDetail(teamId: string): Promise<any> { return { team: { id: teamId, sport: 'nhl' }}; }
  async getPlayerDetail(playerId: string): Promise<any> { return {}; }
}
