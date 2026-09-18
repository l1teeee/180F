// Shared by instructor-card.tsx, instructor-profile-card.tsx and instructor-session-list.tsx -
// three call sites in this feature folder, unlike class-schedule-list.tsx's one-off copy of the
// same idea. Same trailing-number convention as components/shared/avatar-group.tsx: every seeded
// person is "Instructor NN" (privacy rule, docs/04 section 2), so the number is the meaningful
// "initials" here.
export function initialsFor(name: string): string {
  const trailingNumber = /(\d{1,2})\s*$/.exec(name.trim());
  return trailingNumber ? trailingNumber[1].padStart(2, '0') : name.slice(0, 2).toUpperCase();
}
