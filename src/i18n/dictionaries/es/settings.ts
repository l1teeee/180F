// Owned by: settings screens (General, Booking, Notifications, Branding, Reset demo data).
// Spanish is the shape's source of truth - en/settings.ts is checked against this file's key set
// with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
//
// Zod validation note: general/booking/notifications/branding-section.tsx resolve against the
// shared schemas in domain/schemas/studio-settings.ts (not owned by this namespace, and a
// module-scope schema can't call useMessages() anyway), so every field maps its identity to a
// translated message at render instead of showing the schema's own English message text (same
// pattern as login-form.tsx / src/i18n/dictionaries/es/auth.ts). Each field below has exactly
// one practical failure mode, except the three numeric booking fields: those combine an
// int-and-range check into a single sentence that covers either failure, since the schema only
// ever surfaces one issue at a time for a single number input and a second message per issue
// code would not tell the user anything the combined sentence doesn't already say.
export const settings = {
  languageLabel: 'Idioma',

  pageTitle: 'Configuración',
  pageSubtitle: 'Perfil del estudio, política de reservas y marca.',
  loadErrorFallback: 'No se pudieron cargar los ajustes de tu estudio.',

  general: {
    title: 'General',
    studioNameLabel: 'Nombre del estudio',
    emailLabel: 'Correo electrónico',
    phoneLabel: 'Teléfono',
    timezoneLabel: 'Zona horaria',
    timezonePlaceholder: 'Selecciona una zona horaria',
    addressLabel: 'Dirección',
    saveButton: 'Guardar cambios',
    savedToast: 'Ajustes generales guardados.',
    timezoneOptions: {
      'America/Bogota': 'Bogotá (GMT-5)',
      'America/New_York': 'Nueva York (GMT-5/-4)',
      'America/Chicago': 'Chicago (GMT-6/-5)',
      'America/Denver': 'Denver (GMT-7/-6)',
      'America/Los_Angeles': 'Los Ángeles (GMT-8/-7)',
      'America/Mexico_City': 'Ciudad de México (GMT-6)',
      'Europe/Madrid': 'Madrid (GMT+1/+2)',
      'Europe/London': 'Londres (GMT+0/+1)',
      UTC: 'UTC',
    } as Record<string, string>,
    errors: {
      studioNameRequired: 'Introduce el nombre del estudio',
      emailInvalid: 'Introduce un correo electrónico válido',
      phoneRequired: 'Introduce un teléfono',
      addressRequired: 'Introduce una dirección',
      timezoneRequired: 'Selecciona una zona horaria',
    },
  },

  booking: {
    title: 'Reservas',
    cancellationWindowLabel: 'Ventana de cancelación (horas)',
    maxReservationsLabel: 'Máximo de reservas por día',
    advanceBookingLabel: 'Antelación de reserva (días)',
    waitlistLabel: 'Lista de espera activada',
    waitlistDescription:
      'Permite que los clientes se unan a una clase llena y sean promovidos cuando se libere un cupo.',
    saveButton: 'Guardar cambios',
    savedToast: 'Ajustes de reservas guardados.',
    errors: {
      cancellationWindowInvalid: 'Debe ser un número entero de 0 o más',
      maxReservationsInvalid: 'Debe ser un número entero de al menos 1',
      advanceBookingInvalid: 'Debe ser un número entero de al menos 1',
    },
  },

  notifications: {
    title: 'Notificaciones',
    whatsappLabel: 'Confirmaciones por WhatsApp',
    whatsappDescription: 'Envía un mensaje de WhatsApp simulado cuando se confirma una reserva.',
    emailLabel: 'Confirmaciones por correo',
    emailDescription: 'Envía un correo de confirmación cuando se hace una reserva.',
    reminderTimingLabel: 'Momento del recordatorio',
    reminderTimingPlaceholder: 'Selecciona un momento de recordatorio',
    reminderHoursOption: (n: number): string => (n === 1 ? '1 hora antes' : `${n} horas antes`),
    saveButton: 'Guardar cambios',
    savedToast: 'Ajustes de notificaciones guardados.',
  },

  branding: {
    title: 'Marca',
    logoLabel: 'URL del logo',
    logoPlaceholder: 'https://...',
    logoHelperText: 'Déjalo en blanco para usar la inicial del estudio por defecto.',
    primaryColorLabel: 'Color primario',
    accentColorLabel: 'Color de acento',
    livePreviewBadge: 'Vista previa en vivo',
    livePreviewDescription: 'Así se combinan los colores de tu marca.',
    saveButton: 'Guardar cambios',
    savedToast: 'Ajustes de marca guardados.',
    errors: {
      primaryColorInvalid: 'Debe ser un color hexadecimal como #7869D4',
      accentColorInvalid: 'Debe ser un color hexadecimal como #7869D4',
    },
  },

  resetDemo: {
    title: 'Datos de la demo',
    label: 'Restablecer datos de la demo',
    description:
      'Descarta todas las reservas, ediciones y mensajes de esta sesión y vuelve a generar la demo de hoy desde cero. Úsalo antes de una nueva presentación.',
    button: 'Restablecer datos de la demo',
    confirmTitle: '¿Restablecer los datos de la demo?',
    confirmDescription:
      'Esto no se puede deshacer. Se descartarán todas las reservas, ediciones y mensajes de esta sesión y la demo de hoy se volverá a generar desde cero.',
    confirmButton: 'Restablecer',
    successToast: 'Los datos de la demo se han restablecido.',
  },
};
