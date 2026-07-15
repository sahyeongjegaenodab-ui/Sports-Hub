import { Game, ServiceInterface, Standing, Team, Player } from './types';
import { cache } from './cache';

export class NbaService implements ServiceInterface {
  async getTodayGames(date: string): Promise<Game[]> {
    const cacheKey = `nba_games_${date}`;
    const cached = cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`);
      const data = await res.json();
      
      const games: Game[] = (data.scoreboard?.games || []).map((g: any) => {
        const stateCode = g.gameStatus; // 1 = pre, 2 = live, 3 = final
        let state: 'upcoming' | 'live' | 'final' = 'upcoming';
        if (stateCode === 3) state = 'final';
        else if (stateCode === 2) state = 'live';

        return {
          id: g.gameId,
          sport: 'nba',
          startTime: g.gameTimeUTC,
          status: {
            state,
            display: state === 'final' ? 'FINAL' : state === 'live' ? `Q${g.period} ${g.gameClock}` : new Date(g.gameTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          homeTeam: {
            id: g.homeTeam.teamId.toString(),
            name: `${g.homeTeam.teamCity} ${g.homeTeam.teamName}`,
            abbrev: g.homeTeam.teamTricode,
            logo: `https://cdn.nba.com/logos/nba/${g.homeTeam.teamId}/global/L/logo.svg`,
            sport: 'nba'
          },
          awayTeam: {
            id: g.awayTeam.teamId.toString(),
            name: `${g.awayTeam.teamCity} ${g.awayTeam.teamName}`,
            abbrev: g.awayTeam.teamTricode,
            logo: `https://cdn.nba.com/logos/nba/${g.awayTeam.teamId}/global/L/logo.svg`,
            sport: 'nba'
          },
          homeScore: g.homeTeam.score,
          awayScore: g.awayTeam.score,
          venue: g.arena.name
        };
      });

      cache.set(cacheKey, games, 30);
      return games;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getSchedule(date: string): Promise<Game[]> {
    return this.getTodayGames(date); // Fallback to live data for NBA since schedule requires parsing massive static file
  }

  async getStandings(leagueId: string): Promise<Standing[]> {
    try {
      const res = await fetch(`https://cdn.nba.com/static/json/staticData/standings.json`);
      if (!res.ok) throw new Error('NBA standings fetch failed');
      const data = await res.json();
      
      // Standings mock implementation since standard API changes often
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getGameDetail(gameId: string): Promise<Game> {
    const today = new Date().toISOString().split('T')[0];
    const games = await this.getTodayGames(today);
    const game = games.find(g => g.id === gameId);
    if (game) return game;
    throw new Error('Game not found');
  }

  async searchTeams(query: string): Promise<Team[]> {
    // Mock static list of some NBA teams for search
    const teams = [
      { id: '1610612747', name: 'Los Angeles Lakers', abbrev: 'LAL', logo: 'https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg', sport: 'nba' as const },
      { id: '1610612744', name: 'Golden State Warriors', abbrev: 'GSW', logo: 'https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg', sport: 'nba' as const },
      { id: '1610612738', name: 'Boston Celtics', abbrev: 'BOS', logo: 'https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg', sport: 'nba' as const },
      { id: '1610612752', name: 'New York Knicks', abbrev: 'NYK', logo: 'https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg', sport: 'nba' as const },
    ];
    return teams.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  }

  async getTeamDetail(teamId: string): Promise<any> { return { team: { id: teamId, sport: 'nba' }}; }
  async getPlayerDetail(playerId: string): Promise<any> { return {}; }
}
