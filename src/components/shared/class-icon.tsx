// ClassType.icon -> lucide-react component, plus the accent-to-Tailwind-class map used
// everywhere a ClassIcon sits on an accent-tinted chip. Hoisted here since
// src/components/booking, src/components/classes and src/components/instructors each carried
// their own copy of one or both - two copies of one mapping is two chances to disagree, and
// booking's copy had in fact already drifted (bg only, relying on a separate `text-ink` utility
// at the call site) from classes' copy (bg + matching accent text colour baked in). This file is
// now the single source; every call site applies the combined bg+text class directly.
import { Anchor, Bike, Dumbbell, Flame, Flower2, StretchHorizontal, Swords, Weight, type LucideIcon } from 'lucide-react';
import type { AccentToken, ClassIconName } from '@/domain/types';

const CLASS_ICONS: Record<ClassIconName, LucideIcon> = {
  Dumbbell,
  Bike,
  Flower2,
  Anchor,
  Flame,
  Weight,
  StretchHorizontal,
  Swords,
};

export function ClassIcon({ name, className }: { name: ClassIconName; className?: string }) {
  const Icon = CLASS_ICONS[name];
  return <Icon className={className} aria-hidden="true" />;
}

// Literal per-accent Tailwind classes - Tailwind's compiler only keeps class names that appear
// verbatim in source, so this cannot be templated as `bg-${accent}-xsoft text-${accent}-deep`
// (docs/03-DESIGN-SYSTEM.md section 9's utility-generation note applies the same way here).
export const ACCENT_ICON_BG_CLASS: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft text-purple-deep',
  yellow: 'bg-yellow-soft text-yellow-text',
  green: 'bg-green-soft text-green-text',
  pink: 'bg-pink-soft text-danger-text',
  blue: 'bg-blue-soft text-blue-text',
};
