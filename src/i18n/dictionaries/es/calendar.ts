// Owned by: calendar screens (src/app/(admin)/calendar/page.tsx, src/components/calendar/**).
export const calendar = {
  pageTitle: 'Calendario',
  pageSubtitle: 'Vista semanal, mensual y diaria de todas las clases programadas.',
  sectionTitle: 'Programación',

  toolbar: {
    previousPeriod: 'Periodo anterior',
    nextPeriod: 'Periodo siguiente',
    today: 'Hoy',
    viewGroupLabel: 'Vista del calendario',
    week: 'Semana',
    month: 'Mes',
    day: 'Día',
  },

  event: {
    overbooked: 'Sobrerreservado',
    full: 'COMPLETO',
  },

  sheet: {
    title: 'Detalle de la sesión',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    instructorLabel: 'Instructor',
    roomLabel: 'Sala',
    spotsReserved: (booked: number, capacity: number): string => `${booked} / ${capacity} plazas reservadas`,
    overbookedBy: (n: number): string =>
      `Sobrerreservado por ${n}: la capacidad se redujo por debajo del número de reservas actual.`,
    onWaitlist: 'En lista de espera',
    viewBookings: 'Ver reservas',
    editClass: 'Editar clase',
    editClassUnavailable: 'Editar una clase no está disponible en esta demo.',
  },

  occupancyStateLabel: {
    available: 'Disponible',
    almost_full: 'Casi completo',
    full: 'Completo',
  },
};
