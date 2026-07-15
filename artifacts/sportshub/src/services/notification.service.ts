import { Game } from './types';

const SPORT_EMOJI: Record<string, string> = {
  soccer: '⚽',
  mlb: '⚾',
  nba: '🏀',
  nhl: '🏒',
  nfl: '🏈',
};

export class NotificationService {
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    return await Notification.requestPermission();
  }

  /**
   * Fire a notification via Service Worker (works in PWA background) or fallback to Notification API.
   * Deduplicates by gameId so we never notify twice for the same game.
   */
  static async fire(gameId: string, title: string, body: string, icon?: string): Promise<void> {
    if (Notification.permission !== 'granted') return;

    // Dedup — already notified this game in this session/day
    const key = `sportshub_notified_${gameId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body,
          icon: icon || '/icon-192.png',
          badge: '/icon-192.png',
          tag: `game-${gameId}`,
          data: { gameId },
        } as NotificationOptions);
      } else {
        new Notification(title, { body, icon: icon || '/icon-192.png' });
      }
    } catch (e) {
      // Fallback
      try { new Notification(title, { body }); } catch { /* noop */ }
    }
  }

  /**
   * Check all given games and fire notifications for any that start within `notifyBefore` minutes.
   */
  static checkAndNotify(games: Game[], notifyBefore: number): void {
    const now = Date.now();
    const windowMs = notifyBefore * 60 * 1000;

    for (const game of games) {
      if (game.status.state !== 'upcoming') continue;

      const startMs = new Date(game.startTime).getTime();
      const diff = startMs - now;

      // Within [0, notifyBefore] minutes from now
      if (diff > 0 && diff <= windowMs) {
        const emoji = SPORT_EMOJI[game.sport] ?? '🏆';
        const date = new Date(game.startTime);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString([], { month: 'long', day: 'numeric' });
        const minsLeft = Math.round(diff / 60000);

        const title = `${emoji} ${game.awayTeam.name} vs ${game.homeTeam.name}`;
        const lines = [
          `${minsLeft}분 후 시작`,
          game.venue ? `📍 ${game.venue}` : null,
          `🗓 ${dateStr}  🕐 ${timeStr}`,
        ].filter(Boolean).join('\n');

        this.fire(game.id, title, lines, game.homeTeam.logo || undefined);
      }
    }
  }
}
