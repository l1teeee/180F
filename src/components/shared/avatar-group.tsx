// docs/07-COMPONENT-ARCHITECTURE.md section 4. Built on the ui/avatar primitives, which already
// carry the -8px overlap + white 2px ring + "+N" chip shape (docs/03 section 5 "Avatars") - this
// component only adds the people/max/size contract and the id -> accent + fallback-initials logic.
//
// docs/03 section 13 "Avatars" (ADR-021): every avatar is now a Blobatar tinted from our tokens
// instead of plain initials. The prop contract below is unchanged from docs/07 section 4 except
// `size`, widened from `28 | 32 | 40` to `24 | 32 | 40` to match docs/03 section 13's own size
// table ("24 px inside an AvatarGroup") - 28 matched no documented usage even before this change.
// Flagged for docs/07 to be reconciled; not edited here since docs/** is read-only for this task.
//
// Accent per docs/03 section 13 "Tint": customers get a deterministic accent from their id;
// instructors get their primary class type's accent instead. This component receives only
// `{ id, name, avatar }` per person (the frozen contract above), with no class-type/subject-kind
// data, so there is no way to tell an instructor from a customer here - every member's accent is
// resolved with the customer rule (deterministic by id) as the closest available approximation.
// A caller that knows a member is an instructor and wants their actual class-type accent needs a
// contract change (an optional per-person `accent` override), which is out of scope here.
import type { AccentToken } from '@/domain/types';
import { accentForCustomerId, paletteForAccent } from '@/lib/avatar';
import {
  Avatar,
  AvatarBlobatar,
  AvatarFallback,
  AvatarGroup as AvatarGroupFrame,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';

export interface AvatarGroupProps {
  people: { id: string; name: string; avatar: string | null }[];
  max?: number; // default 4, rest collapse into "+N"
  size?: 24 | 32 | 40;
}

// Fallback-only: the accent's soft token as a Tailwind class, for the initials chip shown if
// blobatar generation fails (docs/03 section 13 "Fallback"). Same local-map convention as
// src/components/shared/occupancy-bar.tsx and stat-card.tsx use for their own accent classes.
const ACCENT_FALLBACK_CLASSNAME: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft',
  yellow: 'bg-yellow-soft',
  green: 'bg-green-soft',
  pink: 'bg-pink-soft',
  blue: 'bg-blue-soft',
};

// Every seeded person in this demo is named "Customer NN" / "Instructor NN" (privacy rule,
// docs/04 section 2), so the trailing number - not first+last letters - is the meaningful
// "initials" for this dataset; the same convention the design-system preview's table example
// already uses. A non-numeric name still falls back to real initials.
function initialsFor(name: string): string {
  const trailingNumber = /(\d{1,2})\s*$/.exec(name.trim());
  if (trailingNumber) return trailingNumber[1].padStart(2, '0');
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function AvatarGroup({ people, max = 4, size = 32 }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  const dimension = { width: size, height: size };

  return (
    <AvatarGroupFrame>
      {visible.map((person) => {
        // ADR-021: Customer.avatar / Instructor.avatar stay `string | null`; null now means
        // "generate a blobatar from the id" rather than "draw initials". A non-null value is a
        // real image URL (never produced by this demo's seed data, but still a valid domain
        // value) and renders as-is, same as before blobatars existed.
        if (person.avatar) {
          return (
            <Avatar key={person.id} style={dimension}>
              <AvatarImage src={person.avatar} alt={person.name} />
              <AvatarFallback className="text-ink">{initialsFor(person.name)}</AvatarFallback>
            </Avatar>
          );
        }

        const accent = accentForCustomerId(person.id);
        return (
          <AvatarBlobatar
            key={person.id}
            seed={person.id}
            palette={paletteForAccent(accent)}
            size={size}
            alt={person.name}
            fallbackInitials={initialsFor(person.name)}
            fallbackClassName={ACCENT_FALLBACK_CLASSNAME[accent]}
          />
        );
      })}
      {overflow > 0 ? (
        // docs/03 section 13 "Accessibility": the overflow count is exposed as text, not only
        // as a "+N" chip - aria-label carries the same count in words for a screen reader.
        <AvatarGroupCount style={dimension} aria-label={`and ${overflow} more`}>
          +{overflow}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroupFrame>
  );
}
