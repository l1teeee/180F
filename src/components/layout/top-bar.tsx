'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3: search trigger, notifications, help, profile
// menu. Radix Trigger primitives (Popover/DropdownMenu) render their own <button> by default,
// so button-styled triggers below apply buttonVariants()'s className directly to that button
// instead of nesting a separate <Button> as an asChild ref target (button.tsx is a plain
// function component, not wrapped in forwardRef).
import { useRouter } from 'next/navigation';
import { HelpCircle, LogOut, Menu } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { AvatarBlobatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchInput } from '@/components/shared/search-input';
import { useAuth } from '@/services/auth/auth-context';
import { cn } from '@/lib/cn';
import { ADMIN_ACCENT, ADMIN_SEED, paletteForAccent } from '@/lib/avatar';
import { useUiStore } from '@/stores/ui.store';
import { DemoBadge } from './demo-badge';
import { NotificationsMenu } from './notifications-menu';

export interface TopBarProps {
  user: { name: string; role: string };
}

export function TopBar({ user }: TopBarProps) {
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm sm:px-6 lg:px-7">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
        className={cn(buttonVariants({ variant: 'icon' }), 'lg:hidden')}
      >
        <Menu aria-hidden="true" className="h-[18px] w-[18px]" />
      </button>

      <div className="max-w-md flex-1">
        <div className="relative">
          <SearchInput
            value=""
            onChange={() => setSearchOpen(true)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search customers, classes..."
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center rounded-chip border border-border bg-surface-muted px-1.5 py-0.5 text-[11px] font-semibold text-text-tertiary sm:flex"
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <DemoBadge className="hidden md:inline-flex" />
        <NotificationsMenu />

        <Popover>
          <PopoverTrigger className={buttonVariants({ variant: 'icon' })} aria-label="Help">
            <HelpCircle aria-hidden="true" className="h-[18px] w-[18px]" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <p className="text-sm font-semibold text-ink">Need a hand?</p>
            <p className="mt-1 text-sm text-text-secondary">
              This is a demo workspace - every screen uses simulated data, so feel free to explore. Nothing
              here is sent anywhere real.
            </p>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-10 items-center gap-2.5 rounded-pill border border-border bg-surface pr-3 pl-1 text-sm font-semibold text-ink transition-colors duration-[var(--duration-fast)] ease-out hover:bg-surface-muted"
            aria-label="Account menu"
          >
            {/*
             * docs/03 section 13 "Avatars" / ADR-021: the signed-in administrator's blobatar,
             * replacing the generic person icon - 40px, docs/03 section 13's own size for "the
             * top bar and cards". animate="hover" is one of the two permitted spots (docs/03
             * section 13 "Motion") - exactly one instance renders here.
             */}
            <AvatarBlobatar
              seed={ADMIN_SEED}
              palette={paletteForAccent(ADMIN_ACCENT)}
              size={40}
              alt=""
              animate="hover"
              fallbackInitials="A"
              fallbackClassName="bg-purple-xsoft"
            />
            <span className="hidden sm:inline">{user.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {/* DropdownMenuLabel defaults to an uppercase, letter-spaced section-heading style
                (matching e.g. the search palette's group headings) - reset here since this one
                shows the account's actual name/role, not a section label. */}
            <DropdownMenuLabel className="normal-case tracking-normal">
              <span className="flex flex-col gap-0.5 font-normal">
                <span className="text-sm font-semibold text-ink">{user.name}</span>
                <span className="text-xs text-text-secondary">{user.role}</span>
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
    </header>
  );
}
