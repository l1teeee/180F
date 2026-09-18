// Local per-accent Tailwind classes for this feature's cards, same convention as
// src/components/shared/stat-card.tsx's ACCENT_ICON_CLASSNAME - Tailwind only keeps class names
// that appear verbatim in source, so this cannot be templated as `bg-${accent}-soft`.
import type { AccentToken } from '@/domain/types';

export const ACCENT_ICON_BG_CLASS: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft text-purple-deep',
  yellow: 'bg-yellow-soft text-yellow-text',
  green: 'bg-green-soft text-green-text',
  pink: 'bg-pink-soft text-danger-text',
  blue: 'bg-blue-soft text-blue-text',
};
