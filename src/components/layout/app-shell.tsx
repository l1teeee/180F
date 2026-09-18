'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3: desktop/tablet frame - sidebar + top bar + main
// content slot, max content width 1500px (docs/03 section 3). GlobalSearch (the Cmd/Ctrl+K
// palette) mounts once here, alongside the shell rather than inside TopBar, since it is a
// shell-level overlay, not part of the header bar itself.
import { useLayoutEffect, type ReactNode } from 'react';
import { NAV_ITEMS } from '@/domain/constants';
import { useAuth } from '@/services/auth/auth-context';
import { useUiStore } from '@/stores/ui.store';
import { AppSidebar } from './app-sidebar';
import { GlobalSearch } from './global-search';
import { MobileNav } from './mobile-nav';
import { TopBar } from './top-bar';

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  // stores/ui.store.ts seeds sidebarOpen: true - fine for a persistently-visible desktop rail,
  // but this store's only actual consumer of it (the mobile drawer below) is a Radix Dialog:
  // left as-is, every page load would render the mobile drawer + scrim open by default, on any
  // viewport. src/stores/** is read-only for this task, so the default itself cannot be fixed at
  // the source (flagged in the handoff report); this corrects it once, before first paint.
  // Safe here specifically: AuthGuard ((admin)/layout.tsx) never lets AppShell itself reach the
  // server-rendered HTML (its `status` starts 'loading' on every render, server included, so the
  // SSR pass always takes the skeleton branch) - AppShell only ever mounts client-side, so this
  // never hits the "useLayoutEffect does nothing on the server" warning.
  useLayoutEffect(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-canvas-wash">
      <AppSidebar items={NAV_ITEMS} />
      <MobileNav items={NAV_ITEMS} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={{ name: user?.name ?? 'Studio Admin', role: 'Administrator' }} />
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-7 lg:py-7">{children}</main>
      </div>

      <GlobalSearch />
    </div>
  );
}
