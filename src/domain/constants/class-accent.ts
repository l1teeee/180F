// Category-level label/accent, distinct from the per-class-type ClassType.accent that
// already lives on each hand-authored record in src/data/classes.ts (that field is the
// single source of truth for a specific class type's accent, e.g. on SessionCard and
// ClassOccupancyPoint - both always carry a resolved ClassType/classType.accent already,
// so they never need this map). This one covers the one case that has no ClassType
// object to read from: presenting a bare ClassCategory value (a filter chip, a category
// tag) consistently, per master plan sections 22/27 "consistent accent by class type/category".
import type { AccentToken, ClassCategory } from '@/domain/types';

export const CLASS_CATEGORY_LABEL: Record<ClassCategory, string> = {
  strength: 'Strength',
  cardio: 'Cardio',
  mind_body: 'Mind & Body',
  combat: 'Combat',
};

export const CLASS_CATEGORY_ACCENT: Record<ClassCategory, AccentToken> = {
  strength: 'purple',
  cardio: 'yellow',
  mind_body: 'green',
  combat: 'pink',
};
