export type Sport = 'mlb' | 'nba' | 'nhl' | 'soccer' | 'tennis' | 'golf' | 'nfl';

export interface Team {
  id: string;
  name: string;
  abbrev?: string;
  logo: string;
  leagueId?: string;
  sport: Sport;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  photo: string;
  nationality?: string;
  teamId: string;
}

export interface GameStatus {
  state: 'upcoming' | 'live' | 'final';
  display: string; // e.g., "7:05 PM", "Top 3rd", "FINAL"
}

export interface Game {
  id: string;
  sport: Sport;
  leagueId?: string;
  startTime: string;
  status: GameStatus;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  venue?: string;
  events?: GameEvent[];
}

export interface GameEvent {
  id: string;
  time: string;
  description: string;
  teamId?: string;
  type?: 'goal' | 'homerun' | 'foul' | 'generic';
}

export interface Standing {
  team: Team;
  rank: number;
  wins: number;
  losses: number;
  drawsOrPct: string;
  ptsOrGb: string;
  streak: string;
}

export interface ServiceInterface {
  getTodayGames(date: string): Promise<Game[]>;
  getSchedule(date: string): Promise<Game[]>;
  getStandings(leagueId: string): Promise<Standing[]>;
  getGameDetail(gameId: string): Promise<Game>;
  searchTeams(query: string): Promise<Team[]>;
  getTeamDetail(teamId: string): Promise<{team: Team, schedule: Game[], roster: Player[], stats: Record<string, string>}>;
  getPlayerDetail(playerId: string): Promise<{player: Player, stats: Record<string, string>, recentGames: any[]}>;
}
