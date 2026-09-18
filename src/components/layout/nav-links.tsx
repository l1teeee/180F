'use client';

// Shared active-state + icon-resolution logic for AppSidebar and MobileNav (docs/07 section 3
// lists both as separate components with identical nav semantics, so this is reuse across two
// call sites, not a premature single-use abstraction). docs/06 section 2 "Navigation contract":
// an item is active when the pathname equals its route or starts with "${route}/".
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Circle,
  ClipboardList,
  CreditCard,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { NavItem } from '@/domain/constants';
import { cn } from '@/lib/cn';

// NavItem.icon is a plain `string` (src/domain/constants/nav-items.ts, "resolved through a
// whitelist map, same pattern as ClassType.icon") - Circle is the defensive fallback for a name
// outside this known set, a real boundary since the type permits any string.
// Exported so AppSidebar's collapsed rail (docs/03 section 14) resolves the same icon for the
// same item rather than keeping a second whitelist map that could drift from this one.
export const NAV_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  Dumbbell,
  GraduationCap,
  CreditCard,
  Zap,
  Settings,
};

// docs/06 section 4.1: primary nav is Dashboard..Memberships, secondary is Automations/Settings.
// NAV_ITEMS itself carries no section field, so the approved grouping is encoded here, once.
// Exported for the same reason as NAV_ICONS above - AppSidebar's collapsed rail needs the same
// primary/secondary split.
export const SECONDARY_NAV_LABELS = new Set(['Automations', 'Settings']);

export function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavLinksProps {
  items: NavItem[];
  onNavigate?: () => void; // closes the drawer after a mobile nav click
}

export function NavLinks({ items, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  const primary = items.filter((item) => !SECONDARY_NAV_LABELS.has(item.label));
  const secondary = items.filter((item) => SECONDARY_NAV_LABELS.has(item.label));

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label="Primary">
      <NavGroup items={primary} pathname={pathname} onNavigate={onNavigate} />
      <div role="separator" className="my-2 h-px bg-border" />
      <NavGroup items={secondary} pathname={pathname} onNavigate={onNavigate} />
    </nav>
  );
}

function NavGroup({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] ?? Circle;
        const active = isActiveRoute(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-11 items-center gap-3 rounded-field px-3 text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-out',
                active ? 'bg-purple-xsoft text-ink' : 'text-text-secondary hover:bg-surface-muted hover:text-ink',
              )}
            >
              {active ? (
                <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-[3px] rounded-pill bg-purple" />
              ) : null}
              <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
