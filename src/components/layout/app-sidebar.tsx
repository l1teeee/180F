'use client';

// docs/03-DESIGN-SYSTEM.md section 14 "Sidebar: expanded and collapsed" and section 15 "The
// application frame". Both land together (client requests received mid-build, docs/14-PROGRESS.md)
// and section 15 explicitly supersedes part of section 14's own colour table for the framed rail
// (see the comment above RAIL_TONE below), so what follows is the combined, final rail: two width
// states (240px / 64px) sitting transparent on the --color-shell frame rather than on
// --color-surface. Below lg neither applies - this component simply does not render (MobileNav is
// the drawer, docs/03 section 8).
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Circle, LogOut, Plus, type LucideIcon } from 'lucide-react';
import type { NavItem } from '@/domain/constants';
import { useAuth } from '@/services/auth/auth-context';
import { ADMIN_ACCENT, ADMIN_SEED, paletteForAccent } from '@/lib/avatar';
import { AvatarBlobatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { SIDEBAR_COLLAPSED_STORAGE_KEY, useUiStore } from '@/stores/ui.store';
import { isActiveRoute, NAV_ICONS, SECONDARY_NAV_LABELS } from './nav-links';

export interface AppSidebarProps {
  items: NavItem[];
}

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

// docs/03 section 15.3 "Rail on the frame" overrides section 14.1's own colour table (written
// for the rail sitting on plain --color-surface) now that the rail sits on the dark
// --color-shell frame instead: ink-on-white would be nearly invisible on aubergine. This is the
// one rail treatment implemented, matching what actually ships once Part 2 and Part 3 land
// together - not a separate un-framed mode.
const RAIL_IDLE = 'text-white/72';
const RAIL_HOVER = 'hover:bg-shell-soft hover:text-white';
// Shape differs by state (circle collapsed, field expanded, docs/03 section 14.1); the white
// surface + purple-deep icon is the same override in both.
const RAIL_ACTIVE_COLLAPSED = 'bg-white text-purple-deep';
const RAIL_ACTIVE_EXPANDED = 'bg-white text-purple-deep';

export function AppSidebar({ items }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);

  // docs/03 section 14.4: the persisted preference is read once, in an effect after mount, never
  // during render - the store's own initial value (`false`) is what both the server and the
  // first client render use, so there is nothing for React to reconcile and no hydration warning.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
      if (stored !== null) setSidebarCollapsed(stored === 'true');
    } catch {
      // Storage can throw (private browsing, disabled site data) - the sidebar just keeps its
      // default expanded state instead of failing to render.
    }
  }, [setSidebarCollapsed]);

  // Guards the very first commit's write effect below: without it, the write effect would fire
  // on mount using the pre-hydration `false` and immediately overwrite whatever the read effect
  // above just found in storage, before that update has re-rendered.
  const skipNextWrite = useRef(true);
  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      // Persistence is a nicety, not a requirement to function.
    }
  }, [collapsed]);

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  // Part 1 (this handoff): no BookingDialog is wired anywhere in the app yet - only a static
  // specimen exists under src/app/design-system. Per the task brief, the primary action is wired
  // and intentionally does nothing visible rather than inventing a dialog; this needs connecting
  // once a real BookingDialog exists (see the handoff report).
  function handleNewBooking() {}

  const primaryItems = items.filter((item) => !SECONDARY_NAV_LABELS.has(item.label));
  const secondaryItems = items.filter((item) => SECONDARY_NAV_LABELS.has(item.label));
  const userName = user?.name ?? 'Studio Admin';

  return (
    <aside
      data-slot="app-sidebar"
      data-collapsed={collapsed}
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden py-3 transition-[width] duration-[var(--duration-deliberate)] ease-out motion-reduce:transition-none lg:flex"
    >
      {/* Collapse toggle - docs/03 section 14.2 point 2 */}
      <div className={cn('flex px-3', collapsed && 'justify-center')}>
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-pill transition-colors duration-[var(--duration-fast)] ease-out', RAIL_IDLE, RAIL_HOVER)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Brand - docs/03 section 14.2 point 1 */}
      <div className={cn('flex h-12 shrink-0 items-center gap-2.5 px-3', collapsed && 'justify-center px-0')}>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-white text-xs font-bold text-purple-deep"
        >
          180
        </span>
        <RailLabel collapsed={collapsed} className="text-[15px] font-bold text-white">
          180 Fitness
        </RailLabel>
      </div>

      {/* Primary action - docs/03 section 14.2 point 3, coloured per section 15.3 (purple-deep, not ink) */}
      <div className={cn('shrink-0 px-3 pt-2 pb-1', collapsed && 'flex justify-center px-0')}>
        <button
          type="button"
          onClick={handleNewBooking}
          aria-label="New booking"
          className={cn(
            'flex h-11 shrink-0 items-center gap-2 rounded-pill bg-purple-deep text-white transition-[opacity] duration-[var(--duration-fast)] ease-out hover:opacity-90 active:scale-[0.98] active:duration-[var(--duration-instant)]',
            collapsed ? 'w-11 justify-center' : 'w-full px-4'
          )}
        >
          <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
          <RailLabel collapsed={collapsed} className="text-sm font-semibold">
            New booking
          </RailLabel>
        </button>
      </div>

      <RailNav items={primaryItems} pathname={pathname} collapsed={collapsed} />
      <div role="separator" className={cn('my-3 shrink-0 bg-shell-line', collapsed ? 'mx-auto h-px w-4' : 'mx-3 h-px')} />
      <RailNav items={secondaryItems} pathname={pathname} collapsed={collapsed} />

      {/* Bottom cluster - docs/03 section 14.2 point 7, pinned with margin-top: auto */}
      <div className="mt-auto shrink-0 px-3 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className={cn(
              'flex items-center gap-2.5 rounded-pill text-left transition-colors duration-[var(--duration-fast)] ease-out hover:bg-shell-soft',
              collapsed ? 'h-10 w-10 justify-center' : 'w-full p-1'
            )}
          >
            <AvatarBlobatar
              seed={ADMIN_SEED}
              palette={paletteForAccent(ADMIN_ACCENT)}
              size={32}
              alt={collapsed ? userName : ''}
              fallbackInitials="A"
              fallbackClassName="bg-purple-xsoft"
            />
            <RailLabel collapsed={collapsed} className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-white">{userName}</span>
              <span className="truncate text-xs text-white/60">Administrator</span>
            </RailLabel>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-52">
            <DropdownMenuLabel className="normal-case tracking-normal">
              <span className="flex flex-col gap-0.5 font-normal">
                <span className="text-sm font-semibold text-ink">{userName}</span>
                <span className="text-xs text-text-secondary">Administrator</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
              <LogOut aria-hidden="true" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

// docs/03 section 14.3: labels fade out *before* the width animates and fade in *after* it
// settles. The asymmetry is the transition-delay: collapsing has none (opacity leads), expanding
// delays the fade-in by the full width transition so text never appears mid-squeeze. Always
// rendered (never unmounted) so the width transition never has to reflow around it appearing -
// opacity and the container's own `overflow-hidden` do the hiding.
function RailLabel({
  collapsed,
  className,
  children,
}: {
  collapsed: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden={collapsed}
      className={cn(
        'min-w-0 overflow-hidden whitespace-nowrap ease-out motion-reduce:transition-none motion-reduce:delay-0',
        collapsed
          ? 'opacity-0 transition-opacity delay-0 duration-[var(--duration-fast)]'
          : 'opacity-100 transition-opacity delay-[var(--duration-deliberate)] duration-[var(--duration-fast)]',
        className
      )}
    >
      {children}
    </span>
  );
}

function RailNav({
  items,
  pathname,
  collapsed,
}: {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1.5 overflow-y-auto px-3 py-1">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] ?? Circle;
        const active = isActiveRoute(pathname, item.href);

        const button = (
          <RailNavButton key={item.href} item={item} Icon={Icon} active={active} collapsed={collapsed} />
        );

        if (!collapsed) return button;

        // docs/03 section 14.1 / 14.5: labels are delivered by tooltip when collapsed, 300ms
        // delay, anchored right at 8px (TooltipContent's own default sideOffset), and keyboard
        // reachable - Radix opens a focused trigger's tooltip the same as a hovered one.
        return (
          <Tooltip key={item.href} delayDuration={300}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function RailNavButton({
  item,
  Icon,
  active,
  collapsed,
}: {
  item: NavItem;
  Icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      // Icon-only in the collapsed state needs its own accessible name - the tooltip's
      // aria-describedby (wired by Radix when collapsed) supplements this, it does not replace
      // it (docs/03 section 14.5).
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        'relative flex shrink-0 items-center gap-3 text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-out',
        collapsed
          ? cn('mx-auto h-10 w-10 justify-center rounded-pill', active ? RAIL_ACTIVE_COLLAPSED : cn(RAIL_IDLE, RAIL_HOVER))
          : cn('h-11 rounded-field px-3', active ? RAIL_ACTIVE_EXPANDED : cn(RAIL_IDLE, RAIL_HOVER))
      )}
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      <RailLabel collapsed={collapsed}>{item.label}</RailLabel>
    </Link>
  );
}
