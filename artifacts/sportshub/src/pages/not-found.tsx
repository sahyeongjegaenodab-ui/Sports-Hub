import { Link } from 'wouter';
import { AppShell } from '../components/layout/app-shell';

export default function NotFound() {
  return (
    <AppShell>
      <div className="min-h-full flex flex-col items-center justify-center p-6 text-center pt-32">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The game you're looking for might have been moved or canceled.
        </p>
        <Link href="/" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Return to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
