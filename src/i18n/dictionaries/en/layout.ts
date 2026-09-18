// English's shape is checked against Spanish (the source of truth, es/layout.ts) with `satisfies
// Messages` in en/index.ts: TypeScript rejects a missing, extra or misspelled key here. Wording
// below is kept byte-identical to what shipped before this dictionary existed, since
// e2e/fixtures/hydration.ts pins this suite to English accessible names on purpose.
export const layout = {
  skipToMainContent: 'Skip to main content',

  nav: {
    '/dashboard': 'Dashboard',
    '/calendar': 'Calendar',
    '/bookings': 'Bookings',
    '/customers': 'Customers',
    '/classes': 'Classes',
    '/instructors': 'Instructors',
    '/memberships': 'Memberships',
    '/automations': 'Automations',
    '/settings': 'Settings',
  } as Record<string, string>,
  primaryNavigation: 'Primary navigation',
  secondaryNavigation: 'Secondary navigation',

  newBooking: 'New booking',
  accountMenu: 'Account menu',
  administrator: 'Administrator',
  studioAdminFallback: 'Studio Admin',
  logout: 'Logout',
  expandSidebar: 'Expand sidebar',
  collapseSidebar: 'Collapse sidebar',

  openMenu: 'Open menu',
  help: 'Help',
  helpTitle: 'Need a hand?',
  helpDescription:
    'This is a demo workspace - every screen uses simulated data, so feel free to explore. Nothing here is sent anywhere real.',

  notifications: 'Notifications',
  notificationsUnread: (n: number): string => `Notifications, ${n} unread`,
  notificationsTitle: 'Notifications',
  markAllRead: 'Mark all read',
  allCaughtUp: "You're all caught up",
  justNow: 'Just now',
  minutesAgo: (n: number): string => `${n} minute${n === 1 ? '' : 's'} ago`,
  hoursAgo: (n: number): string => `${n} hour${n === 1 ? '' : 's'} ago`,
  daysAgo: (n: number): string => `${n} day${n === 1 ? '' : 's'} ago`,

  searchTitle: 'Search',
  searchDescription: 'Search customers, classes and instructors',
  searchEmptyPrompt: 'Start typing to search customers, classes and instructors.',
  searchNoResults: (query: string): string => `No results for "${query}"`,
  searchGroupLabels: {
    customer: 'Customers',
    class: 'Classes',
    instructor: 'Instructors',
  },

  demoModeLabel: 'Demo Mode',
  demoModeTooltip: 'Some data and functionality in this environment are simulated.',
  resetDemoData: 'Reset demo data',
  resetDemoDataConfirmTitle: 'Reset demo data?',
  resetDemoDataConfirmDescription:
    "This cannot be undone. Every booking, edit and message made in this session will be discarded and today's demo will reseed from scratch.",
  demoDataResetToast: 'Demo data has been reset.',
};
