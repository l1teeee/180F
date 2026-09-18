'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3: drawer/sheet variant of AppSidebar for < lg.
// Built on the restyled ui/sheet primitive (Radix Dialog underneath - focus trap, Esc-to-close
// and focus return all included) with side="left", duration overridden from the sheet's default
// 220ms to docs/03 12.2 pattern 14 "Drawer"'s own 320ms (--duration-deliberate).
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { NavItem } from '@/domain/constants';
import { useMessages } from '@/hooks/use-messages';
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
  const m = useMessages();
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
      <SheetContent side="left" className="flex w-64 flex-col gap-0 p-0 [--overlay-duration:var(--duration-deliberate)]">
        <SheetHeader className="px-5 pt-5 pr-12 pb-0">
          {/* min-w-0 + truncate on the name: at w-64 the drawer only has ~150px left of the brand
              chip and the 40px close button (docs/ui/sheet.tsx, read-only here) for the title, not
              enough for "180 Fitness Studio" at 20px/650 - wrapping to two lines left the close
              button's fixed top-right position looking misaligned against the taller header. */}
          <SheetTitle className="flex min-w-0 items-center gap-2.5 text-left">
            {/* Client-supplied mark (public/brand/mark.png) - studio name stays live text
                per ADR-019, so only the monogram is baked into an image. */}
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-ink">
              <Image src="/brand/mark.png" alt="" width={437} height={256} className="w-[22px] h-auto" />
            </span>
            <span className="truncate">{studioName}</span>
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
            {m.layout.logout}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
