'use client';

// docs/03-DESIGN-SYSTEM.md section 14 "Sidebar: expanded and collapsed" and section 15 "The
// application frame". Both land together (client requests received mid-build, docs/14-PROGRESS.md)
// and section 15 explicitly supersedes part of section 14's own colour table for the framed rail
// (see the comment above RAIL_TONE below), so what follows is the combined, final rail: two width
// states (240px / 64px) sitting transparent on the --color-shell frame rather than on
// --color-surface. Below lg neither applies - this component simply does not render (MobileNav is
// the drawer, docs/03 section 8).
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Circle, LogOut, Plus, type LucideIcon } from 'lucide-react';
import type { NavItem } from '@/domain/constants';
import { useMessages } from '@/hooks/use-messages';
import type { Messages } from '@/i18n/messages';
import { useAuth } from '@/services/auth/auth-context';
import { ADMIN_ACCENT, ADMIN_SEED, paletteForAccent } from '@/lib/avatar';
import { AvatarBlobatar } from '@/components/ui/avatar';
import { useSettingsStore } from '@/stores/settings.store';
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

// ADR-019: useSettingsStore.general.studioName is the single owner of studio identity - this is
// only the pre-hydration/no-settings-yet fallback (matches src/data/organization.ts's own
// default), same convention as src/hooks/use-automations-preview.ts's own local fallback.
const FALLBACK_STUDIO_NAME = '180 Fitness Studio';

// docs/03 section 15.3 "Rail on the frame" overrides section 14.1's own colour table (written
// for the rail sitting on plain --color-surface) now that the rail sits on the dark
// --color-shell frame instead: ink-on-white would be nearly invisible on aubergine. This is the
// one rail treatment implemented, matching what actually ships once Part 2 and Part 3 land
// together - not a separate un-framed mode.
const RAIL_IDLE = 'text-white/72';
const RAIL_HOVER = 'hover:bg-shell-soft hover:text-white';
// docs/03 section 14.1 specifies a floating white circle for the collapsed active item; client
// request supersedes that (same override as section 15.3 already does to 14.1's colour table
// above) - the active item now joins the panel in BOTH states, so this uses bg-background, not
// bg-white, for the same reason RAIL_ACTIVE_EXPANDED does: --color-background is rgb(247,247,245),
// not white, and a white fill would leave a visible seam against the panel.
const RAIL_ACTIVE_COLLAPSED = 'bg-background text-purple-deep';
// Client request: the expanded active tab must read as part of the content panel, not a
// floating white chip a near-white seam away from it - bg-background (not bg-white) makes the
// tab and the panel literally the same fill (rgb(247,247,245)).
const RAIL_ACTIVE_EXPANDED = 'bg-background text-purple-deep';

export function AppSidebar({ items }: AppSidebarProps) {
  const m = useMessages();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const studioName = useSettingsStore((state) => state.settings?.general.studioName ?? FALLBACK_STUDIO_NAME);

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

  // Navigates to the bookings screen with ?new=1; BookingsPage (owned elsewhere) reads that
  // query param to open its BookingDialog on arrival and then clears it.
  function handleNewBooking() {
    router.push('/bookings?new=1');
  }

  const primaryItems = items.filter((item) => !SECONDARY_NAV_LABELS.has(item.label));
  const secondaryItems = items.filter((item) => SECONDARY_NAV_LABELS.has(item.label));
  const userName = user?.name ?? m.layout.studioAdminFallback;

  return (
    <aside
      data-slot="app-sidebar"
      data-collapsed={collapsed}
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      className="hidden h-full shrink-0 flex-col py-3 transition-[width] duration-[var(--duration-deliberate)] ease-out motion-reduce:transition-none lg:flex"
    >
      {/* Brand - docs/03 section 14.2 point 1. Collapsed: gap-0 and a forced w-0 on the label are
          required, not cosmetic - the label stays mounted (opacity-0, see RailLabel) for the width
          transition, and a naked flex-shrink would otherwise let it claim the row's free space,
          leaving justify-center nothing to center the icon with (it lands flush left instead). */}
      <div className={cn('flex h-12 shrink-0 items-center gap-2.5 px-3', collapsed && 'justify-center gap-0 px-0')}>
        {/* Client-supplied mark (public/brand/mark.png) - studio name stays live text
            per ADR-019, so only the monogram is baked into an image. */}
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-white/10"
        >
          <Image src="/brand/mark.png" alt="" width={437} height={256} className="w-[22px] h-auto" />
        </span>
        <RailLabel collapsed={collapsed} className={cn('text-[15px] font-bold text-white', collapsed && 'w-0')}>
          {studioName}
        </RailLabel>
      </div>

      {/* Primary action - docs/03 section 14.2 point 3, coloured per section 15.3 (purple-deep, not ink) */}
      <div className={cn('shrink-0 px-3 pt-2 pb-1', collapsed && 'flex justify-center px-0')}>
        <button
          type="button"
          onClick={handleNewBooking}
          aria-label={m.layout.newBooking}
          className={cn(
            'flex h-11 shrink-0 items-center gap-2 rounded-pill bg-purple-deep text-white transition-[opacity] duration-[var(--duration-fast)] ease-out hover:opacity-90 active:scale-[0.98] active:duration-[var(--duration-instant)]',
            collapsed ? 'w-11 justify-center gap-0' : 'w-full px-4'
          )}
        >
          <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
          <RailLabel collapsed={collapsed} className={cn('text-sm font-semibold', collapsed && 'w-0')}>
            {m.layout.newBooking}
          </RailLabel>
        </button>
      </div>

      {/* docs/03 section 15.2: hidden on purpose - this is a 64px-wide chrome rail, and any
          native scrollbar gutter here would eat horizontal space and shift the collapsed icons
          off-centre again. Wheel, trackpad and keyboard scrolling still work with no visible
          scrollbar. */}
      <div className="flex min-h-0 shrink flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <RailNav items={primaryItems} pathname={pathname} collapsed={collapsed} label={m.layout.primaryNavigation} m={m} />
      </div>

      {/* Collapse toggle - docs/03 section 14.2 point 2. Client request: moved off the top of the
          rail and onto the rail's right edge, straddling the seam at this cluster separator, so it
          reads as a seam control rather than a floating chevron above the brand. */}
      <div className={cn('relative shrink-0', collapsed ? 'my-[clamp(12px,1.5vh,20px)]' : 'my-3')}>
        <div role="separator" className={cn('bg-shell-line', collapsed ? 'mx-auto h-px w-4' : 'mx-3 h-px')} />
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? m.layout.expandSidebar : m.layout.collapseSidebar}
          className="absolute top-1/2 right-0 z-40 flex h-7 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-pill border border-border bg-surface text-text-secondary shadow-card transition-colors duration-[var(--duration-fast)] ease-out before:absolute before:-inset-2 before:content-[''] hover:bg-surface-muted hover:text-ink"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <RailNav items={secondaryItems} pathname={pathname} collapsed={collapsed} label={m.layout.secondaryNavigation} m={m} />

      {/* Bottom cluster - docs/03 section 14.2 point 7, pinned with margin-top: auto */}
      <div className="mt-auto shrink-0 px-3 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={m.layout.accountMenu}
            className={cn(
              'flex items-center gap-2.5 rounded-pill text-left transition-colors duration-[var(--duration-fast)] ease-out hover:bg-shell-soft',
              collapsed ? 'h-10 w-10 justify-center gap-0' : 'w-full p-1'
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
            <RailLabel collapsed={collapsed} className={cn('flex min-w-0 flex-col', collapsed && 'w-0')}>
              <span className="truncate text-sm font-semibold text-white">{userName}</span>
              <span className="truncate text-xs text-white/60">{m.layout.administrator}</span>
            </RailLabel>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-52">
            <DropdownMenuLabel className="normal-case tracking-normal">
              <span className="flex flex-col gap-0.5 font-normal">
                <span className="text-sm font-semibold text-ink">{userName}</span>
                <span className="text-xs text-text-secondary">{m.layout.administrator}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
              <LogOut aria-hidden="true" />
              {m.layout.logout}
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
  label,
  m,
}: {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  label: string;
  m: Messages;
}) {
  // docs/03 section 14.1 wants 12px between collapsed items and 20px between clusters, but nine
  // 40px circles plus the rail's fixed chrome only clear that rhythm above roughly 705px of
  // viewport height. Below that the rail scrolls, and the scrollbar is hidden (see the overflow
  // comment above), so a fixed 12px would push Settings off the bottom with no visible cue on a
  // 1366x768 laptop. Scaling with viewport height keeps the spec rhythm on tall screens and falls
  // back to the pre-existing 6px floor on short ones.
  return (
    <nav aria-label={label} className={cn('flex shrink-0 flex-col px-3 py-1', collapsed ? 'gap-[clamp(6px,0.9vh,12px)]' : 'gap-1.5')}>
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] ?? Circle;
        const active = isActiveRoute(pathname, item.href);

        const navLabel = m.layout.nav[item.href] ?? item.label;
        const button = (
          <RailNavButton key={item.href} item={item} label={navLabel} Icon={Icon} active={active} collapsed={collapsed} />
        );

        if (!collapsed) return button;

        // docs/03 section 14.1 / 14.5: labels are delivered by tooltip when collapsed, 300ms
        // delay, anchored right at 8px (TooltipContent's own default sideOffset), and keyboard
        // reachable - Radix opens a focused trigger's tooltip the same as a hovered one.
        return (
          <Tooltip key={item.href} delayDuration={300}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">{navLabel}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function RailNavButton({
  item,
  label,
  Icon,
  active,
  collapsed,
}: {
  item: NavItem;
  label: string;
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
      aria-label={collapsed ? label : undefined}
      className={cn(
        'relative flex shrink-0 items-center gap-3 text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-out',
        collapsed
          ? active
            ? // Same panel-join treatment as the expanded active tab (below), and for the same
              // reason: no explicit width class, so the flex column's default cross-axis stretch
              // sizes the link to the nav's content box (auto width, not w-full/100% - an
              // explicit 100% would lock to that box and the negative margin below would only
              // shift layout, not extend the box's own right edge). -mr-3 cancels the nav's own
              // `px-3` so the stretched box's right edge extends by that same 12px to the rail's
              // edge at x=64, flush against the panel; pr-3 puts that 12px back as inner padding
              // so justify-center still lands the icon at the rail's x=32 axis (docs/03 section
              // 14.3 - icons never move horizontally between states) instead of centring in the
              // wider box. rounded-l-pill/rounded-r-none keeps a semicircular left cap so the
              // collapsed rail keeps its circular language while the right side merges into the
              // panel; rail-tab adds the concave fillets top/bottom.
              cn('h-10 -mr-3 pr-3 justify-center gap-0 rounded-l-pill rounded-r-none rail-tab', RAIL_ACTIVE_COLLAPSED)
            : cn('mx-auto h-10 w-10 justify-center gap-0 rounded-pill', RAIL_IDLE, RAIL_HOVER)
          : active
            ? // Flush to the rail's right edge (-mr-3 cancels the nav's own `px-3`) and rounded on
              // the left only, so the active tab reads as the panel growing a tab rather than a
              // separate pill; .rail-tab (globals.css) adds the concave fillets that curve the
              // dark rail into the tab's top/bottom edges.
              cn('h-11 rounded-l-field rounded-r-none px-3 -mr-3 rail-tab', RAIL_ACTIVE_EXPANDED)
            : cn('h-11 rounded-field px-3', RAIL_IDLE, RAIL_HOVER)
      )}
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      <RailLabel collapsed={collapsed} className={collapsed ? 'w-0' : undefined}>{label}</RailLabel>
    </Link>
  );
}
