// docs/07-COMPONENT-ARCHITECTURE.md section 3 "InstructorDetail" (left column). docs/06 section
// 3.10: avatar, name, specialty, rating, bio, StatusBadge. 64px + animate="hover" is one of the
// two spots docs/03 section 13 "Motion" allows animation - a single standalone avatar here, not
// a list.
import { Star } from 'lucide-react';
import { AvatarBlobatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import type { AccentToken, InstructorWithStats } from '@/domain/types';
import { paletteForAccent } from '@/lib/avatar';
import { initialsFor } from './avatar-initials';
import { ACCENT_FALLBACK_BG_CLASS } from './instructor-accent';

export interface InstructorProfileCardProps {
  instructor: InstructorWithStats;
  accent: AccentToken;
}

export function InstructorProfileCard({ instructor, accent }: InstructorProfileCardProps) {
  return (
    <Card className="flex h-full flex-col items-center gap-4 text-center sm:items-start sm:text-left">
      <AvatarBlobatar
        seed={instructor.id}
        palette={paletteForAccent(accent)}
        size={64}
        animate="hover"
        alt={instructor.name}
        fallbackInitials={initialsFor(instructor.name)}
        fallbackClassName={ACCENT_FALLBACK_BG_CLASS[accent]}
      />
      <div className="flex flex-col items-center gap-1 sm:items-start">
        <h1 className="text-[22px] font-bold tracking-tight text-ink">{instructor.name}</h1>
        <p className="text-sm font-medium text-text-secondary">{instructor.specialty}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={instructor.status} />
        <span className="flex items-center gap-1 text-sm font-semibold text-ink tabular-nums">
          <Star aria-hidden="true" className="size-3.5 fill-yellow text-yellow" />
          {instructor.rating.toFixed(1)}
        </span>
      </div>
      <p className="text-sm text-text-secondary">{instructor.bio}</p>
    </Card>
  );
}
