// Owned by: automations screens (src/components/automations/**, src/app/(admin)/automations/page.tsx).
// Spanish is the shape's source of truth - en/automations.ts is checked against this file's key
// set with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
//
// nameById/descriptionById/messageTemplateById are keyed by src/data/automations.ts's
// hand-authored automation ids (not owned by this namespace, CLAUDE.md rule 6): that file keeps
// its English name/description/messageTemplate for its own config purposes (matching the
// {{placeholder}} contract use-automations-preview.ts interpolates), this namespace owns the
// text a viewer actually reads. The WhatsApp preview bubble renders CLAUDE.md-flagged message
// CONTENT, so it is translated like any other copy, not treated as demo data.
export const automations = {
  pageTitle: 'Automatizaciones',
  pageSubtitle: 'Activadores de mensajería de WhatsApp simulados.',
  loadErrorFallback: 'No se pudieron cargar tus automatizaciones.',

  previewingButton: 'Previsualizando este mensaje',
  previewButton: 'Previsualizar mensaje',

  activateAria: 'Activar',
  deactivateAria: 'Desactivar',

  fields: {
    channel: 'Canal',
    trigger: 'Disparador',
  },

  channelLabel: {
    whatsapp: 'WhatsApp',
    email: 'Correo electrónico',
    sms: 'SMS',
  },
  triggerLabel: {
    booking_created: 'Nueva reserva',
    session_24h_before: '24 horas antes de la sesión',
    customer_inactive_30d: 'Inactivo hace 30+ días',
    customer_birthday: 'Cumpleaños del cliente',
  },
  statusLabel: {
    active: 'Activa',
    paused: 'En pausa',
    draft: 'Borrador',
  },

  nameById: {
    'auto-01': 'Confirmación de reserva',
    'auto-02': 'Recordatorio de 24 horas',
    'auto-03': 'Recordatorio a cliente inactivo',
    'auto-04': 'Mensaje de cumpleaños',
  } as Record<string, string>,
  descriptionById: {
    'auto-01': 'Envía un mensaje de confirmación en cuanto se crea una reserva.',
    'auto-02': 'Le recuerda al cliente su sesión 24 horas antes.',
    'auto-03': 'Contacta a los clientes que no han reservado en los últimos 30 días.',
    'auto-04': 'Envía un saludo de cumpleaños con una oferta de clase gratis.',
  } as Record<string, string>,

  // Interpolated at render with useDateLocale()-formatted sample values (whatsapp-preview.tsx),
  // never a template mini-language (CLAUDE.md i18n rules).
  messageTemplateById: {
    'auto-01': (className: string, sessionDayLabel: string, sessionTime: string): string =>
      `Tu reserva está confirmada.\n\n${className}\n${sessionDayLabel}\n${sessionTime}\n\nTe esperamos.`,
    'auto-02': (className: string, sessionTime: string, studioName: string): string =>
      `Recordatorio: mañana tienes ${className} a las ${sessionTime}.\n¡Nos vemos en ${studioName}!`,
    'auto-03': (customerFirstName: string, studioName: string): string =>
      `Hola ${customerFirstName}, ¡te extrañamos en ${studioName}!\nHa pasado un tiempo — vuelve esta semana a una clase de prueba gratis.`,
    'auto-04': (customerFirstName: string): string =>
      `¡Feliz cumpleaños, ${customerFirstName}! 🎉\nDisfruta una clase gratis este mes de nuestra parte.`,
  } as Record<string, (...args: string[]) => string>,

  samplePreview: {
    className: 'Entrenamiento funcional',
  },

  preview: {
    heading: 'Vista previa del mensaje',
    simulatedBadge: 'Simulado',
    messageTemplateLabel: 'Plantilla del mensaje',
    chatSubtitle: 'Chat de WhatsApp simulado',
    deliveredLabel: 'Entregado',
    editTemplateButton: 'Editar plantilla',
    sendTestButton: 'Enviar prueba',
    sendTestSuccessToast: 'Mensaje de prueba enviado',
    editTemplateToast: 'Editar plantillas no está disponible en esta demo.',
  },
};
