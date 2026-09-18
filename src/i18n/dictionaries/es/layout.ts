// Owned by: app chrome (src/components/layout/**, plus the "Close" aria-label baked into
// src/components/ui/dialog.tsx and ui/sheet.tsx). Spanish is the shape's source of truth -
// en/layout.ts is checked against this file's key set with `satisfies Messages`
// (src/i18n/dictionaries/en/index.ts).
export const layout = {
  skipToMainContent: 'Saltar al contenido principal',

  // Keyed by NAV_ITEMS[].href (src/domain/constants/nav-items.ts) - the domain constant keeps
  // owning `label` (English, unauthorised to change) and `icon`; this only owns the copy shown
  // for each stable route key.
  nav: {
    '/dashboard': 'Panel',
    '/calendar': 'Calendario',
    '/bookings': 'Reservas',
    '/customers': 'Clientes',
    '/classes': 'Clases',
    '/instructors': 'Instructores',
    '/memberships': 'Membresías',
    '/automations': 'Automatizaciones',
    '/settings': 'Configuración',
  } as Record<string, string>,
  primaryNavigation: 'Navegación principal',
  secondaryNavigation: 'Navegación secundaria',

  newBooking: 'Nueva reserva',
  accountMenu: 'Menú de cuenta',
  administrator: 'Administrador',
  studioAdminFallback: 'Administrador del estudio',
  logout: 'Cerrar sesión',
  expandSidebar: 'Expandir barra lateral',
  collapseSidebar: 'Contraer barra lateral',

  openMenu: 'Abrir menú',
  help: 'Ayuda',
  helpTitle: '¿Necesitas ayuda?',
  helpDescription:
    'Este es un espacio de demostración: todas las pantallas usan datos simulados, así que siéntete libre de explorar. Nada de esto se envía a ningún sitio real.',

  notifications: 'Notificaciones',
  notificationsUnread: (n: number): string => `Notificaciones, ${n} sin leer`,
  notificationsTitle: 'Notificaciones',
  markAllRead: 'Marcar todo como leído',
  allCaughtUp: 'No tienes nada pendiente',
  justNow: 'Justo ahora',
  minutesAgo: (n: number): string => (n === 1 ? 'hace 1 minuto' : `hace ${n} minutos`),
  hoursAgo: (n: number): string => (n === 1 ? 'hace 1 hora' : `hace ${n} horas`),
  daysAgo: (n: number): string => (n === 1 ? 'hace 1 día' : `hace ${n} días`),

  searchTitle: 'Buscar',
  searchDescription: 'Busca clientes, clases e instructores',
  searchEmptyPrompt: 'Empieza a escribir para buscar clientes, clases e instructores.',
  searchNoResults: (query: string): string => `Sin resultados para "${query}"`,
  searchGroupLabels: {
    customer: 'Clientes',
    class: 'Clases',
    instructor: 'Instructores',
  },

  demoModeLabel: 'Modo demo',
  demoModeTooltip: 'Algunos datos y funciones de este entorno son simulados.',
  resetDemoData: 'Restablecer datos de la demo',
  resetDemoDataConfirmTitle: '¿Restablecer los datos de la demo?',
  resetDemoDataConfirmDescription:
    'Esta acción no se puede deshacer. Cada reserva, edición y mensaje realizado en esta sesión se descartará y la demo de hoy se regenerará desde cero.',
  demoDataResetToast: 'Se han restablecido los datos de la demo.',
};
