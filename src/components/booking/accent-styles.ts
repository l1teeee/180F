import type { VariantProps } from "class-variance-authority"

import type { badgeVariants } from "@/components/ui/badge"
import type { AccentToken } from "@/domain/types"

// Literal per-accent Tailwind classes. Tailwind's compiler only keeps class names that appear
// verbatim in source, so this cannot be templated as `bg-${accent}-soft` (docs/03-DESIGN-
// SYSTEM.md section 9's utility-generation note applies the same way on the consuming side).
export const ACCENT_SOFT_BG_CLASS: Record<AccentToken, string> = {
  purple: "bg-purple-soft",
  yellow: "bg-yellow-soft",
  green: "bg-green-soft",
  pink: "bg-pink-soft",
  blue: "bg-blue-soft",
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

// domain/constants/status-styles.ts pairs a label with an AccentToken for every status-like
// union in the app ("a second status-to-colour map anywhere else is a review failure" per that
// file's own header). Badge's variant prop names the same five tones differently - this only
// ever translates that one existing map, it never adds a new accent decision of its own.
export const ACCENT_BADGE_VARIANT: Record<AccentToken, BadgeVariant> = {
  purple: "neutralBrand",
  yellow: "pending",
  green: "positive",
  pink: "danger",
  blue: "info",
}
