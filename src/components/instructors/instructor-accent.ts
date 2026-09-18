// Fallback-only bg class per accent, for AvatarBlobatar's fallbackClassName (shown only if
// blobatar generation fails, docs/03 section 13 "Fallback"). Same convention as
// components/shared/avatar-group.tsx's own local ACCENT_FALLBACK_CLASSNAME.
import type { AccentToken } from '@/domain/types';

export const ACCENT_FALLBACK_BG_CLASS: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft',
  yellow: 'bg-yellow-soft',
  green: 'bg-green-soft',
  pink: 'bg-pink-soft',
  blue: 'bg-blue-soft',
};
