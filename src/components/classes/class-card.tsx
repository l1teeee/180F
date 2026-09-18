'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/classes/". docs/06 section 3.7 /
// master plan section 27: icon, name, description, weekly sessions, average occupancy, assigned
// instructors, consistent class-category accent. Motion pattern 1 "Hover lift" (docs/03 12.2) -
// the whole card is the click target, a native <a> via next/link, so it is keyboard-operable and
// picks up the global focus ring (docs/03 12.6) with no extra work.
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { AvatarGroup } from '@/components/shared/avatar-group';
import { ACCENT_ICON_BG_CLASS, ClassIcon } from '@/components/shared/class-icon';
import { OccupancyBar } from '@/components/shared/occupancy-bar';
import type { ClassTypeWithStats, Instructor } from '@/domain/types';

export interface ClassCardProps {
  classType: ClassTypeWithStats;
  instructors: Instructor[];
  index?: number; // stagger position, capped at 6 (docs/03 12.3.5) - ClassGrid passes index % 6
}

export function ClassCard({ classType, instructors, index = 0 }: ClassCardProps) {
  return (
    <Link
      href={`/classes/${classType.id}`}
      style={{ '--stagger-index': index } as CSSProperties}
      className="animate-fade-up flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-out hover:-translate-y-0.5 hover:shadow-raise active:scale-[0.98] active:duration-[var(--duration-instant)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className={`flex size-11 shrink-0 items-center justify-center rounded-chip ${ACCENT_ICON_BG_CLASS[classType.accent]}`}
        >
          <ClassIcon name={classType.icon} className="size-5" />
        </span>
        <span className="text-xs font-semibold text-text-secondary">{classType.durationMinutes} min</span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[17px] font-semibold text-ink">{classType.name}</h3>
        <p className="line-clamp-2 text-sm text-text-secondary">{classType.description}</p>
      </div>

      <div className="flex items-baseline gap-1.5 text-sm">
        <span className="text-lg font-bold tabular-nums text-ink">{classType.weeklySessions}</span>
        <span className="font-medium text-text-secondary">sessions / week</span>
      </div>

      <OccupancyBar rate={classType.averageOccupancy} accent={classType.accent} label="Avg. occupancy" />

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs font-semibold text-text-secondary">Instructors</span>
        {instructors.length > 0 ? (
          <AvatarGroup
            people={instructors.map((instructor) => ({
              id: instructor.id,
              name: instructor.name,
              avatar: instructor.avatar,
              accent: classType.accent,
            }))}
            size={24}
            max={3}
          />
        ) : (
          <span className="text-xs text-text-tertiary">Unassigned</span>
        )}
      </div>
    </Link>
  );
}
