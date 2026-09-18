'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 2: Client - AuthGuard + AppShell. Not split into a
// separate components/layout/auth-guard.tsx: it is used in exactly this one place and docs/07
// section 4 does not give it its own prop contract, so it stays colocated here (docs/07 section
// 6 allows a component private to its one parent to live unexported in that parent's file).
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/services/auth/auth-context';

function AuthRestoringSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <span aria-hidden="true" className="animate-shimmer h-12 w-12 rounded-pill" />
        <span aria-hidden="true" className="animate-shimmer h-3 w-40 rounded-pill" />
        <span className="sr-only">Restoring your session…</span>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading') return <AuthRestoringSkeleton />;
  // Redirecting - render nothing so an unauthenticated visitor never sees a flash of admin UI.
  if (status === 'unauthenticated') return null;

  return <AppShell>{children}</AppShell>;
}
