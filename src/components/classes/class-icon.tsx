// ClassType.icon -> lucide-react component. Local to this feature rather than imported from
// src/components/booking/class-icon.tsx, which belongs to the concurrent public-booking agent's
// write set (docs/12-AGENT-OWNERSHIP.md) - duplicated on purpose, flagged for hoisting.
import { Anchor, Bike, Dumbbell, Flame, Flower2, StretchHorizontal, Swords, Weight, type LucideIcon } from 'lucide-react';
import type { ClassIconName } from '@/domain/types';

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
