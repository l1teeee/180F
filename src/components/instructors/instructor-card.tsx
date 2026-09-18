'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "InstructorCard". docs/06 section 3.9 / master
// plan section 29: avatar, specialty, weekly sessions, rating, status. Status text comes only
// from StatusBadge's status->colour map (never re-derived here) and is already produced by the
// schedule + demoNow, never hardcoded (src/data/instructors.ts deriveInstructorStatus).
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Star } from 'lucide-react';
import { AvatarBlobatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import type { InstructorRosterEntry } from '@/hooks/use-instructors-roster';
import { paletteForAccent } from '@/lib/avatar';
import { initialsFor } from './avatar-initials';
import { ACCENT_FALLBACK_BG_CLASS } from './instructor-accent';

export interface InstructorCardProps {
  instructor: InstructorRosterEntry;
  index?: number; // stagger position, capped at 6 (docs/03 12.3.5) - InstructorGrid passes index % 6
}

export function InstructorCard({ instructor, index = 0 }: InstructorCardProps) {
  return (
    <Link
      href={`/instructors/${instructor.id}`}
      style={{ '--stagger-index': index } as CSSProperties}
      className="animate-fade-up flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-out hover:-translate-y-0.5 hover:shadow-raise active:scale-[0.98] active:duration-[var(--duration-instant)]"
    >
      <div className="flex items-center gap-3">
        {/* Static <img> form (docs/03 section 13 "Motion") - a 6-card grid still counts as a
            list, animate="hover" is reserved for a single standalone avatar. */}
        <AvatarBlobatar
          seed={instructor.id}
          palette={paletteForAccent(instructor.accent)}
          size={40}
          alt={instructor.name}
          fallbackInitials={initialsFor(instructor.name)}
          fallbackClassName={ACCENT_FALLBACK_BG_CLASS[instructor.accent]}
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold text-ink">{instructor.name}</span>
          <span className="truncate text-sm text-text-secondary">{instructor.specialty}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 font-semibold text-ink tabular-nums">
          <Star aria-hidden="true" className="size-3.5 fill-yellow text-yellow" />
          {instructor.rating.toFixed(1)}
        </span>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <span className="text-text-secondary">
          <span className="font-semibold text-ink tabular-nums">{instructor.weeklySessions}</span> sessions / week
        </span>
      </div>

      <div className="mt-auto pt-1">
        <StatusBadge status={instructor.status} />
      </div>
    </Link>
  );
}
