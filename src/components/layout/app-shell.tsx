'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3: desktop/tablet frame - sidebar + top bar + main
// content slot, max content width 1500px (docs/03 section 3). GlobalSearch (the Cmd/Ctrl+K
// palette) mounts once here, alongside the shell rather than inside TopBar, since it is a
// shell-level overlay, not part of the header bar itself.
//
// docs/03 section 15 "The application frame": the content panel floats as a rounded surface on
// the deep --color-shell frame, with the rail (AppSidebar), brand mark and profile avatar living
// on the frame rather than inside the panel. Because the panel now has its own rounded corners
// and a coloured margin around it (docs/03 section 15.2), the panel has to be the thing that
// scrolls - a page-level (body) scroll would either drag the frame's aubergine margin off-screen
// after the first scroll or force the corners to clip active content. So the outer shell is fixed
// to the viewport (`h-screen overflow-hidden`) and only the content panel scrolls internally;
// AppSidebar, the brand mark and the profile avatar stay put on the frame the way chrome should.
import type { ReactNode } from 'react';
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

  return (
    <div className="flex h-screen overflow-hidden bg-shell">
      {/* First focusable element on every admin route (docs/03 section 10): without it, a
          keyboard user hits 11-17 tab stops (rail nav + top bar) before reaching page content.
          Hidden until focused, then rendered on the frame above everything else. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <AppSidebar items={NAV_ITEMS} />
      <MobileNav items={NAV_ITEMS} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/*
       * docs/03 section 15.2 "Geometry": full bleed below md (no inset, no radius, no shadow -
       * the drawer/hamburger behaviour from section 8 is what handles small screens, unchanged);
       * 8px inset / 20px radius from md; 12px inset / 28px radius from lg, where the rail is also
       * persistent. overflow-x-hidden is the belt on top of every page's own content never being
       * wider than its container - this is the one place that guarantees it regardless.
       */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-background md:my-2 md:mr-2 md:rounded-[20px] md:shadow-[0_18px_50px_rgba(20,16,38,0.28)] lg:my-3 lg:mr-3 lg:rounded-[28px]">
        <TopBar user={{ name: user?.name ?? 'Studio Admin', role: 'Administrator' }} />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 outline-none sm:px-6 lg:px-7 lg:py-7"
        >
          {children}
        </main>
      </div>

      <GlobalSearch />
    </div>
  );
}
