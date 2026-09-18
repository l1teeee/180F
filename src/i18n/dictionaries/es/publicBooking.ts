// Owned by: public booking screens (src/components/booking/**, src/app/book/**). Spanish is
// the shape's source of truth - en/publicBooking.ts is checked against this file's key set
// with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
//
// Zod validation note (customer-step.tsx / use-public-booking-wizard.ts): publicBookingInputSchema
// lives in src/domain/schemas (not owned by this namespace), so its English messages are never
// rendered - each field has exactly one possible validation failure, so field identity alone
// (not the zod issue code or its message) determines which translated key to show at render.
//
// Keyed by domain id (occupancyStateLabel/bookingStatusLabel below), never a second
// status->colour map (CLAUDE.md rule 6) - domain/constants/status-styles.ts still owns the
// accent, this only owns the copy, duplicated deliberately from dashboard's own namespace.
import type { BookingRejectionReason } from '@/domain/selectors';

// createPublicBooking (src/stores/booking.store.ts) rejects with a stable `reason` CODE, not a
// sentence - this is where that reason becomes Spanish copy for the wizard's step 4. A reason
// this switch doesn't recognise (there is none today, but the union could grow) falls back to
// the generic message rather than rendering blank.
function customerStepSubmitError(reason: BookingRejectionReason): string {
  switch (reason) {
    case 'session_full':
      return 'Este horario se llenó mientras completabas tus datos.';
    case 'session_cancelled':
      return 'Esta sesión ha sido cancelada.';
    case 'session_started':
      return 'Esta sesión ya ha comenzado.';
    case 'already_booked':
      return 'Ya tienes una reserva para esta sesión.';
    case 'daily_limit_reached':
      return 'Ya alcanzaste el máximo de reservas permitidas para este día.';
    case 'outside_booking_window':
      return 'Esta reserva está fuera de la ventana de anticipación permitida.';
    case 'waitlist_disabled':
      return 'La lista de espera está desactivada para este estudio.';
    case 'waitlist_not_available':
      return 'Esta sesión todavía tiene cupos disponibles.';
    case 'session_not_found':
      return 'No pudimos encontrar esta sesión.';
    default:
      return 'No pudimos completar tu reserva. Inténtalo de nuevo.';
  }
}

export const publicBooking = {
  backToClass: 'Cambiar clase',
  backToDate: 'Cambiar fecha',
  backToTime: 'Cambiar hora',
  loadError: 'No pudimos cargar la disponibilidad de las clases.',

  classStep: {
    heading: 'Elige tu clase',
    subtitle: 'Elige una clase para ver sus próximos horarios.',
    durationMinutes: (n: number): string => `${n} min`,
    noSessionsAvailable: 'No hay sesiones disponibles',
    sessionsAvailable: (n: number): string => (n === 1 ? '1 sesión disponible' : `${n} sesiones disponibles`),
  },

  dateStep: {
    heading: 'Elige una fecha',
    subtitle: (className: string): string => `${className} · elige el día que mejor te convenga.`,
    availableDatesLabel: 'Fechas disponibles',
  },

  timeStep: {
    heading: 'Elige una hora',
    emptyState: {
      title: 'No hay sesiones disponibles ese día',
      description:
        'Todas las sesiones de este día ya empezaron, o todavía no se ha programado ninguna. Elige otra fecha.',
      action: 'Elegir otra fecha',
    },
    full: 'COMPLETO',
    spotsLeft: (booked: number, capacity: number): string => `${booked} / ${capacity} plazas`,
  },

  customerStep: {
    heading: 'Tus datos',
    nameLabel: 'Nombre',
    namePlaceholder: 'Jordan Rivera',
    phoneLabel: 'Teléfono',
    phonePlaceholder: '+57 300 000 0000',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    chooseAnotherTime: 'Elegir otra hora',
    submit: 'Confirmar reserva',
    errors: {
      nameTooShort: 'Introduce tu nombre completo',
      emailInvalid: 'Introduce un correo electrónico válido',
      phoneTooShort: 'Introduce un número de teléfono con al menos 7 dígitos',
      forReason: customerStepSubmitError,
    },
  },

  success: {
    heading: '¡Tu clase está reservada!',
    confirmationSent: 'Tu confirmación se envió por WhatsApp.',
    simulatedBadge: 'Simulado',
    classLabel: 'Clase',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    locationLabel: 'Ubicación',
    bookingIdLabel: 'ID de reserva',
    statusLabel: 'Estado',
    addToCalendar: 'Añadir al calendario',
    viewBooking: 'Ver reserva',
    hideBooking: 'Ocultar reserva',
    bookAnother: 'Reservar otra clase',
  },

  progress: {
    ariaLabel: 'Pasos de la reserva',
    steps: {
      class: 'Clase',
      date: 'Fecha',
      time: 'Hora',
      details: 'Datos',
    },
  },

  occupancyStateLabel: {
    almost_full: 'Casi lleno',
  },
  bookingStatusLabel: {
    confirmed: 'Confirmada',
  },
};
