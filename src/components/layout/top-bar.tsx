'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3: search trigger, notifications, help. The account
// identity and logout used to also live here, duplicating AppSidebar's account menu (lg and up)
// and MobileNav's Logout button (below lg) - removed so the account only ever appears once, on
// the rail/drawer. Radix Trigger primitives (Popover/DropdownMenu) render their own <button> by
// default, so the help Popover trigger below applies buttonVariants()'s className directly to
// that button instead of nesting a separate <Button> as an asChild ref target (button.tsx is a
// plain function component, not wrapped in forwardRef).
import { HelpCircle, Menu } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchInput } from '@/components/shared/search-input';
import { useMessages } from '@/hooks/use-messages';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/ui.store';
import { NotificationsMenu } from './notifications-menu';

export function TopBar() {
  const m = useMessages();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);

  return (
    // AppShell lays this header out as a flex item alongside a flex-1 (flex: 1 1 0%) <main> in a
    // scrolling column. Flex-shrink is distributed in proportion to each item's flex-basis, and
    // main's basis is 0, so main absorbs none of the shrinkage and the header absorbs all of it,
    // collapsing to its own content height (40.8px, not h-16's 64px) whenever content overflows.
    // shrink-0 opts the header out of that distribution entirely.
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm sm:px-6 lg:px-7">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label={m.layout.openMenu}
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
            placeholder={m.common.searchPlaceholder}
          />
          {/* text-secondary, not text-tertiary: text-tertiary measures 2.52:1 on white, well
              under the 4.5:1 AA floor for text people must read (docs/03 section 10 restricts
              it to decorative/disabled use). */}
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center rounded-chip border border-border bg-surface-muted px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary sm:flex"
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <NotificationsMenu />

        <Popover>
          <PopoverTrigger className={buttonVariants({ variant: 'icon' })} aria-label={m.layout.help}>
            <HelpCircle aria-hidden="true" className="h-[18px] w-[18px]" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <p className="text-sm font-semibold text-ink">{m.layout.helpTitle}</p>
            <p className="mt-1 text-sm text-text-secondary">{m.layout.helpDescription}</p>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
