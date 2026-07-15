import { Game, ServiceInterface, Standing, Team, Player } from './types';
import { cache } from './cache';

export class MlbService implements ServiceInterface {
  async getTodayGames(date: string): Promise<Game[]> {
    const cacheKey = `mlb_games_${date}`;
    const cached = cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team,linescore`);
      const data = await res.json();
      
      const games: Game[] = (data.dates[0]?.games || []).map((g: any) => {
        const stateCode = g.status.codedGameState; // F=Final, I=In Progress, P=Pre-Game
        let state: 'upcoming' | 'live' | 'final' = 'upcoming';
        if (stateCode === 'F' || stateCode === 'O') state = 'final';
        else if (stateCode === 'I' || stateCode === 'U') state = 'live';

        return {
          id: g.gamePk.toString(),
          sport: 'mlb',
          startTime: g.gameDate,
          status: {
            state,
            display: state === 'final' ? 'FINAL' : state === 'live' ? `${g.linescore?.inningHalf || ''} ${g.linescore?.currentInningOrdinal || ''}`.trim() : new Date(g.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          homeTeam: {
            id: g.teams.home.team.id.toString(),
            name: g.teams.home.team.name,
            logo: `https://www.mlbstatic.com/team-logos/${g.teams.home.team.id}.svg`,
            sport: 'mlb'
          },
          awayTeam: {
            id: g.teams.away.team.id.toString(),
            name: g.teams.away.team.name,
            logo: `https://www.mlbstatic.com/team-logos/${g.teams.away.team.id}.svg`,
            sport: 'mlb'
          },
          homeScore: g.teams.home.score ?? null,
          awayScore: g.teams.away.score ?? null,
          venue: g.venue.name
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
      const res = await fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${new Date().getFullYear()}`);
      const data = await res.json();
      
      const standings: Standing[] = [];
      data.records.forEach((record: any) => {
        record.teamRecords.forEach((tr: any) => {
          standings.push({
            team: {
              id: tr.team.id.toString(),
              name: tr.team.name,
              logo: `https://www.mlbstatic.com/team-logos/${tr.team.id}.svg`,
              sport: 'mlb'
            },
            rank: parseInt(tr.divisionRank, 10) || 0,
            wins: tr.wins,
            losses: tr.losses,
            drawsOrPct: tr.winningPercentage,
            ptsOrGb: tr.gamesBack,
            streak: tr.streak?.streakCode || ''
          });
        });
      });

      return standings;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getGameDetail(gameId: string): Promise<Game> {
    try {
      const res = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gameId}/feed/live`);
      const data = await res.json();
      const g = data.gameData.datetime;
      const t = data.gameData.teams;
      const line = data.liveData.linescore;
      
      const stateCode = data.gameData.status.codedGameState;
      let state: 'upcoming' | 'live' | 'final' = 'upcoming';
      if (stateCode === 'F' || stateCode === 'O') state = 'final';
      else if (stateCode === 'I' || stateCode === 'U') state = 'live';

      return {
        id: gameId,
        sport: 'mlb',
        startTime: g.dateTime,
        status: {
          state,
          display: state === 'final' ? 'FINAL' : state === 'live' ? `${line.inningHalf || ''} ${line.currentInningOrdinal || ''}`.trim() : new Date(g.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        homeTeam: {
          id: t.home.id.toString(),
          name: t.home.name,
          logo: `https://www.mlbstatic.com/team-logos/${t.home.id}.svg`,
          sport: 'mlb'
        },
        awayTeam: {
          id: t.away.id.toString(),
          name: t.away.name,
          logo: `https://www.mlbstatic.com/team-logos/${t.away.id}.svg`,
          sport: 'mlb'
        },
        homeScore: line.teams.home.runs ?? null,
        awayScore: line.teams.away.runs ?? null,
        venue: data.gameData.venue.name,
        events: []
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async searchTeams(query: string): Promise<Team[]> {
    try {
      const res = await fetch(`https://statsapi.mlb.com/api/v1/teams?sportId=1`);
      const data = await res.json();
      const q = query.toLowerCase();
      return data.teams
        .filter((t: any) => t.name.toLowerCase().includes(q) || (t.abbreviation && t.abbreviation.toLowerCase().includes(q)))
        .map((t: any) => ({
          id: t.id.toString(),
          name: t.name,
          abbrev: t.abbreviation,
          logo: `https://www.mlbstatic.com/team-logos/${t.id}.svg`,
          sport: 'mlb'
        }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getTeamDetail(teamId: string): Promise<{team: Team, schedule: Game[], roster: Player[], stats: Record<string, string>}> {
    return {
      team: { id: teamId, name: 'MLB Team', logo: '', sport: 'mlb' },
      schedule: [],
      roster: [],
      stats: {}
    };
  }

  async getPlayerDetail(playerId: string): Promise<{player: Player, stats: Record<string, string>, recentGames: any[]}> {
    return {
      player: { id: playerId, name: 'MLB Player', number: '0', position: 'P', photo: '', teamId: '0' },
      stats: {},
      recentGames: []
    };
  }
}
