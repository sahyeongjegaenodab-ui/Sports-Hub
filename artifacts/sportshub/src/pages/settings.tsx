import { AppShell } from '../components/layout/app-shell';
import { useTheme } from '../hooks/useTheme';
import { useUserPrefs } from '../hooks/useUserPrefs';
import { Moon, Sun, Bell, RefreshCw, Globe, Info } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { prefs, updatePrefs } = useUserPrefs();

  return (
    <AppShell>
      <div className="pt-safe px-6 py-6 h-full bg-background overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-8">
          
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

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Preferences</h2>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
              
              <div className="flex items-center justify-between p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-foreground" />
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-xs text-muted-foreground">Coming soon</div>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full bg-muted relative">
                  <div className="w-5 h-5 bg-card rounded-full absolute top-0.5 left-0.5" />
                </div>
              </div>

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
