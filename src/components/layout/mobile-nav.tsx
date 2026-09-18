'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3: drawer/sheet variant of AppSidebar for < lg.
// Built on the restyled ui/sheet primitive (Radix Dialog underneath - focus trap, Esc-to-close
// and focus return all included) with side="left", duration overridden from the sheet's default
// 220ms to docs/03 12.2 pattern 14 "Drawer"'s own 320ms (--duration-deliberate).
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { NavItem } from '@/domain/constants';
import { useAuth } from '@/services/auth/auth-context';
import { useSettingsStore } from '@/stores/settings.store';
import { NavLinks } from './nav-links';

export interface MobileNavProps {
  items: NavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADR-019: useSettingsStore.general.studioName is the single owner of studio identity - this is
// only the pre-hydration/no-settings-yet fallback (matches src/data/organization.ts's own
// default), same convention as src/hooks/use-automations-preview.ts's own local fallback.
const FALLBACK_STUDIO_NAME = '180 Fitness Studio';

export function MobileNav({ items, open, onOpenChange }: MobileNavProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const studioName = useSettingsStore((state) => state.settings?.general.studioName ?? FALLBACK_STUDIO_NAME);

  async function handleLogout() {
    onOpenChange(false);
    await signOut();
    router.replace('/login');
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-64 flex-col gap-0 p-0 duration-[var(--duration-deliberate)]">
        <SheetHeader className="px-5 pt-5 pr-12 pb-0">
          <SheetTitle className="flex items-center gap-2.5 text-left">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-chip bg-ink text-xs font-bold text-white">
              180
            </span>
            {studioName}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto py-4">
          <NavLinks items={items} onNavigate={() => onOpenChange(false)} />
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-field px-3 text-sm font-semibold text-text-secondary transition-colors duration-[var(--duration-fast)] ease-out hover:bg-surface-muted hover:text-ink"
          >
            <LogOut aria-hidden="true" className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
