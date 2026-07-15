import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Suspense, lazy } from 'react';
import { useNotifications } from './hooks/useNotifications';

const Home = lazy(() => import('./pages/home'));
const Onboarding = lazy(() => import('./pages/onboarding'));
const Schedule = lazy(() => import('./pages/schedule'));
const Favorites = lazy(() => import('./pages/favorites'));
const Standings = lazy(() => import('./pages/standings'));
const Settings = lazy(() => import('./pages/settings'));
const GameDetail = lazy(() => import('./pages/game-detail'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Loading() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function NotificationManager() {
  useNotifications();
  return null;
}

function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <NotificationManager />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/standings" component={Standings} />
        <Route path="/settings" component={Settings} />
        <Route path="/game/:sport/:id" component={GameDetail} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Theme init side-effect done in hook, but ensure initial load doesn't flash
  if (typeof window !== 'undefined') {
    const prefs = localStorage.getItem('sportshub_prefs');
    const isDark = !prefs || prefs.includes('"theme":"dark"');
    if (isDark) document.documentElement.classList.add('dark');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
