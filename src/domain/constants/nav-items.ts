// Sidebar navigation items (CLAUDE.md "Routes"; components/layout/AppSidebar,
// docs/07-COMPONENT-ARCHITECTURE.md). Public /book and the internal-only /design-system
// preview are deliberately excluded - the sidebar never links to either.

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Lucide icon name, resolved through a whitelist map (same pattern as ClassType.icon)
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Calendar', href: '/calendar', icon: 'Calendar' },
  { label: 'Bookings', href: '/bookings', icon: 'ClipboardList' },
  { label: 'Customers', href: '/customers', icon: 'Users' },
  { label: 'Classes', href: '/classes', icon: 'Dumbbell' },
  { label: 'Instructors', href: '/instructors', icon: 'GraduationCap' },
  { label: 'Memberships', href: '/memberships', icon: 'CreditCard' },
  { label: 'Automations', href: '/automations', icon: 'Zap' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];
