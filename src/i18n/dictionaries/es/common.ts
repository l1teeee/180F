// Shared strings any screen may import - the one namespace every other namespace's owner is
// still free to reuse rather than duplicate (e.g. "Cancel" on a dialog).
export const common = {
  save: 'Guardar',
  saveChanges: 'Guardar cambios',
  cancel: 'Cancelar',
  loading: 'Cargando...',
  // Interpolation/plurals are plain functions, not a key-path template language - this keeps
  // call sites readable (`m.common.bookingCount(3)`) and keeps Spanish's own plural rules in
  // this file rather than in a shared template engine.
  bookingCount: (n: number): string => (n === 1 ? '1 reserva' : `${n} reservas`),

  close: 'Cerrar',
  confirm: 'Confirmar',
  reset: 'Restablecer',
  tryAgain: 'Reintentar',
  somethingWentWrong: 'Algo salió mal',
  searchPlaceholder: 'Buscar clientes, clases...',
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  pageOf: (page: number, total: number): string => `Página ${page} de ${total}`,

  // Keyed by the domain id (BookingSource, src/domain/types/primitives.ts) - mirrors
  // dashboard.ts's own bookingStatusLabel convention: BOOKING_SOURCE_STYLE still owns the accent
  // only, this owns the copy, passed into SourceBadge's optional `label` prop by its caller.
  bookingSourceLabel: {
    website: 'Sitio web',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    reception: 'Recepción',
  },
};
