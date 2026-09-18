// Owned by: instructors screens (src/components/instructors/**, src/app/(admin)/instructors/**).
// Spanish is the shape's source of truth - en/instructors.ts is checked against this file's key
// set with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
export const instructors = {
  pageTitle: 'Instructores',
  pageSubtitle: 'El equipo del estudio, sus especialidades y horarios.',
  backToInstructors: 'Instructores',

  // Plurals/interpolation are plain functions kept in this file, never a template
  // mini-language (CLAUDE.md rule 3) - each language owns its own plural rules. The count
  // itself is rendered separately (a bold span) by the caller, so this returns only the unit
  // words that agree with it in number.
  sessionsPerWeekUnit: (n: number): string => (n === 1 ? 'sesión / semana' : 'sesiones / semana'),

  // Keyed by the domain id, never a second status->colour map (CLAUDE.md rule 6):
  // status-styles.ts still owns the accent, this only owns the copy.
  statusLabel: {
    available: 'Disponible',
    in_class: 'En clase',
    off_today: 'Libre hoy',
  },

  sections: {
    weeklySchedule: 'Horario semanal',
    recentClasses: 'Clases recientes',
    schedulePreview: 'Vista previa del calendario',
  },

  emptyStates: {
    noUpcomingSessions: 'No hay sesiones programadas esta semana.',
    noClassesTaught: 'Todavía no ha impartido clases.',
    noClassesToday: 'Sin clases',
  },

  stats: {
    classesThisMonth: 'Clases este mes',
    reservations: 'Reservas',
    occupancy: 'Ocupación',
    rating: 'Valoración',
    ratingUnit: '/ 5',
  },

  overbooked: 'Sobrerreservado',
  spotsLabel: (booked: number, capacity: number): string => `${booked}/${capacity} plazas`,

  errorTitle: 'Algo salió mal',
};
