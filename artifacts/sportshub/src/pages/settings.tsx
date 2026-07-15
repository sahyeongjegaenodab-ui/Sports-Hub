import { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/app-shell';
import { useTheme } from '../hooks/useTheme';
import { useUserPrefs } from '../hooks/useUserPrefs';
import { NotificationService } from '../services/notification.service';
import { Moon, Sun, Bell, BellOff, RefreshCw, Globe, Info, Clock } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { prefs, updatePrefs } = useUserPrefs();
  const [permState, setPermState] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (NotificationService.isSupported()) {
      setPermState(NotificationService.getPermission());
    }
  }, []);

  async function handleNotificationToggle() {
    if (!NotificationService.isSupported()) return;

    if (prefs.notifications) {
      // Turn off
      updatePrefs({ notifications: false });
      return;
    }

    // Turn on — request permission first
    const result = await NotificationService.requestPermission();
    setPermState(result);

    if (result === 'granted') {
      updatePrefs({ notifications: true });
    }
  }

  const notifBlocked = permState === 'denied';
  const notifOn = prefs.notifications && permState === 'granted';

  return (
    <AppShell>
      <div className="pt-safe px-6 py-6 h-full bg-background overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-8">

          {/* Appearance */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Appearance</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Notifications</h2>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">

              {/* Toggle */}
              <div className={`flex items-center justify-between p-4 ${notifBlocked ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  {notifOn ? <Bell size={20} className="text-primary" /> : <BellOff size={20} className="text-muted-foreground" />}
                  <div>
                    <div className="font-medium">경기 알림</div>
                    <div className="text-xs text-muted-foreground">
                      {notifBlocked
                        ? '브라우저에서 알림이 차단되어 있습니다'
                        : notifOn
                        ? '즐겨찾기 팀 경기 시작 전 알림'
                        : '경기 시작 전 푸시 알림'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  disabled={notifBlocked}
                  className={`w-12 h-6 rounded-full relative transition-colors ${notifOn ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${notifOn ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Notify before (only visible when enabled) */}
              {notifOn && (
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-foreground" />
                    <span className="font-medium">알림 시간</span>
                  </div>
                  <select
                    className="bg-muted text-foreground text-sm rounded-lg px-2 py-1 outline-none font-medium"
                    value={prefs.notifyBefore}
                    onChange={(e) => updatePrefs({ notifyBefore: Number(e.target.value) })}
                  >
                    <option value={10}>10분 전</option>
                    <option value={15}>15분 전</option>
                    <option value={30}>30분 전</option>
                    <option value={60}>1시간 전</option>
                  </select>
                </div>
              )}

              {/* Info box */}
              {notifOn && (
                <div className="px-4 py-3 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
                  ⭐ 즐겨찾기에 팀을 추가하면 해당 팀 경기만 알림을 받아요.
                  즐겨찾기가 없으면 선택한 모든 스포츠 경기를 알려줍니다.
                </div>
              )}

            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Preferences</h2>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border">

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw size={20} className="text-foreground" />
                  <span className="font-medium">Auto-refresh</span>
                </div>
                <select
                  className="bg-muted text-foreground text-sm rounded-lg px-2 py-1 outline-none font-medium"
                  value={prefs.refreshInterval}
                  onChange={(e) => updatePrefs({ refreshInterval: Number(e.target.value) })}
                >
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={0}>Off</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-foreground" />
                  <span className="font-medium">Language</span>
                </div>
                <select
                  className="bg-muted text-foreground text-sm rounded-lg px-2 py-1 outline-none font-medium"
                  value={prefs.language}
                  onChange={(e) => updatePrefs({ language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                </select>
              </div>

            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">About</h2>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
              <div className="flex items-center gap-3 p-4">
                <Info size={20} className="text-foreground" />
                <div>
                  <div className="font-medium">SportsHub</div>
                  <div className="text-xs text-muted-foreground">Version 1.0.0</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
