// Fallback-only: the accent's soft token as a Tailwind class, for the initials chip shown if
// blobatar generation fails (docs/03-DESIGN-SYSTEM.md section 13 "Fallback"). Hoisted here since
// src/components/shared/avatar-group.tsx, src/components/instructors/instructor-accent.ts and
// src/components/dashboard/upcoming-session-card.tsx each carried their own byte-identical copy -
// two copies of one mapping is two chances to disagree.
import type { AccentToken } from '@/domain/types';

export const ACCENT_FALLBACK_CLASSNAME: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft',
  yellow: 'bg-yellow-soft',
  green: 'bg-green-soft',
  pink: 'bg-pink-soft',
  blue: 'bg-blue-soft',
};
