import { Game, ServiceInterface, Standing, Team, Player } from './types';
import { cache } from './cache';

export class SoccerService implements ServiceInterface {
  async getTodayGames(date: string): Promise<Game[]> {
    // TheSportsDB free tier doesn't have a good "all today" endpoint without key
    return [];
  }

  async getSchedule(date: string): Promise<Game[]> {
    return [];
  }

  async getStandings(leagueId: string): Promise<Standing[]> {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${leagueId}&s=2024-2025`);
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
    throw new Error("Method not implemented.");
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
