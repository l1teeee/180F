import type { VariantProps } from "class-variance-authority"

import type { badgeVariants } from "@/components/ui/badge"
import type { AccentToken } from "@/domain/types"

// The class-icon-chip accent map that used to live here (ACCENT_SOFT_BG_CLASS) is hoisted to
// src/components/shared/class-icon.tsx as ACCENT_ICON_BG_CLASS, alongside ClassIcon itself.

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
