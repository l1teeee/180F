import { Anchor, Bike, Dumbbell, Flame, Flower2, StretchHorizontal, Swords, Weight, type LucideIcon } from "lucide-react"

import type { ClassIconName } from "@/domain/types"

// ClassType.icon -> lucide-react component. Domain types cannot import a UI library, and
// src/components/shared is off-limits to this agent right now (owned concurrently) - this
// duplicates whatever the classes/instructors phase builds for the same purpose. Flagged for
// hoisting in the Phase 8 handoff report.
const CLASS_ICONS: Record<ClassIconName, LucideIcon> = {
  Dumbbell,
  Bike,
  Flower2,
  Anchor,
  Flame,
  Weight,
  StretchHorizontal,
  Swords,
}

export function ClassIcon({ name, className }: { name: ClassIconName; className?: string }) {
  const Icon = CLASS_ICONS[name]
  return <Icon className={className} aria-hidden="true" />
}
