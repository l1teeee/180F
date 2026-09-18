// Owned by: bookings screens (src/components/bookings/**, src/app/(admin)/bookings/page.tsx).
// Spanish is the shape's source of truth - en/bookings.ts is checked against this file's key
// set with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
import type { CancellationRejectionReason, PromotionRejectionReason } from '@/domain/selectors';

// See en/bookings.ts's own comment: translates selectPromotionEligibility's and
// selectCancellationEligibility's locale-free `reason` (+ `limit` operand, promotion/creation
// only) into Spanish copy. One function for both reason unions - they never overlap, and both
// describe the same kind of thing (why a booking action was rejected).
function promotionRejectionReason(reason: PromotionRejectionReason | CancellationRejectionReason, limit?: number): string {
  switch (reason) {
    case 'already_cancelled':
      return 'Esta reserva ya estaba cancelada.';
    case 'outside_cancellation_window':
      return 'Esta cancelación está fuera del plazo permitido.';
    case 'not_waitlisted':
      return 'Esta reserva no está en la lista de espera.';
    case 'session_not_found':
      return 'No se pudo encontrar esta sesión.';
    case 'session_cancelled':
      return 'Esta sesión ha sido cancelada.';
    case 'session_started':
      return 'Esta sesión ya ha comenzado.';
    case 'session_full':
      return 'Esta sesión está llena.';
    case 'already_booked':
      return 'Este cliente ya tiene una reserva para esta sesión.';
    case 'daily_limit_reached':
      return `Este cliente ya tiene ${limit ?? 0} reserva(s) ese día.`;
    case 'outside_booking_window':
      return 'Esta reserva está fuera de la ventana de anticipación permitida.';
    case 'waitlist_disabled':
      return 'La lista de espera está desactivada para este estudio.';
    case 'waitlist_not_available':
      return 'Esta sesión todavía tiene cupos disponibles.';
    default:
      return 'Esta reserva no se puede promover.';
  }
}

export const bookings = {
  promotionRejectionReason,
  title: 'Reservas',
  subtitle: 'Gestiona todas las reservas de clases.',
  newBooking: 'Nueva reserva',
  allBookings: 'Todas las reservas',

  tabs: {
    all: 'Todas',
  },

  // Keyed by the domain id, never a second status->colour map (CLAUDE.md rule 6 / docs/07
  // section 7 anti-patterns): status-styles.ts still owns the accent, this only owns the copy.
  bookingStatusLabel: {
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    waitlist: 'Lista de espera',
  },
  // Same convention for booking-source.ts - 'WhatsApp' and 'Instagram' are product names and
  // stay identical in both languages.
  bookingSourceLabel: {
    website: 'Sitio web',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    reception: 'Recepción',
  },

  filters: {
    searchPlaceholder: 'Buscar por cliente...',
    filterByStatus: 'Filtrar por estado',
    filterBySource: 'Filtrar por origen',
    filterByDate: 'Filtrar por fecha',
    allStatuses: 'Todos los estados',
    allSources: 'Todos los orígenes',
  },

  table: {
    customer: 'Cliente',
    class: 'Clase',
    instructor: 'Instructor',
    date: 'Fecha',
    time: 'Hora',
    source: 'Origen',
    status: 'Estado',
  },

  promoteCannotYet: 'Esta reserva todavía no se puede promover.',
  promote: 'Promover',
  promoteToConfirmed: 'Promover a confirmada',
  seatOpen: 'Cupo disponible',
  cancelBookingFor: (customerName: string): string => `Cancelar reserva de ${customerName}`,

  emptyState: {
    title: 'No se encontraron reservas',
    description: 'Intenta cambiar los filtros o crea una nueva reserva.',
    action: 'Crear reserva',
  },

  filteredToSession: (sessionLabel: string): string => `Filtrada a la sesión: ${sessionLabel}`,
  clear: 'Borrar',

  cancelDialog: {
    title: '¿Cancelar esta reserva?',
    description: (customerName: string, className: string, dateLabel: string): string =>
      `Esto cancela la reserva de ${customerName} para ${className} el ${dateLabel} y no se puede deshacer.`,
    confirmLabel: 'Cancelar reserva',
  },

  toastCancelled: 'Reserva cancelada',
  toastPromoted: (customerName: string): string => `${customerName} promovido a confirmada.`,
  toastCreated: 'Reserva creada correctamente',

  dialog: {
    title: 'Nueva reserva',
    description: 'Reserva un cupo para un cliente en una próxima clase.',
    customerLabel: 'Cliente',
    selectCustomer: 'Selecciona un cliente',
    classLabel: 'Clase',
    selectClass: 'Selecciona una clase',
    dateLabel: 'Fecha',
    selectDate: 'Selecciona una fecha',
    selectClassFirst: 'Selecciona una clase primero',
    timeLabel: 'Hora',
    selectTime: 'Selecciona una hora',
    selectDateFirst: 'Selecciona una fecha primero',
    instructorLabel: 'Instructor',
    derivedFromClass: 'Derivado de la clase',
    sessionOptionFull: 'LLENO',
    sessionOptionSpots: (booked: number, capacity: number): string => `${booked}/${capacity} cupos`,
    spotsReserved: (booked: number, capacity: number): string => `${booked} / ${capacity} cupos reservados`,
    fullClassNotice:
      'Esta clase está llena. Únete a la lista de espera y te contactaremos en cuanto se libere un cupo.',
    joinWaitlist: 'Unirse a la lista de espera',
    reserveBooking: 'Reservar',
  },
};
