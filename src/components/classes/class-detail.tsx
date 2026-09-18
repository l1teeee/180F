// docs/07-COMPONENT-ARCHITECTURE.md section 3 "ClassDetail". docs/06 section 3.8: name,
// description, duration, capacity, instructor AvatarGroup, full width header block. The weekly
// schedule itself is ClassScheduleList (docs/06 places it after the KPI row and the weekday
// chart, so it is not nested inside this header block even though docs/07's one-line summary
// groups them together - see class-schedule-list.tsx).
import { AvatarGroup } from '@/components/shared/avatar-group';
import { Card } from '@/components/ui/card';
import type { ClassTypeWithStats, Instructor } from '@/domain/types';
import { ACCENT_ICON_BG_CLASS, ClassIcon } from '@/components/shared/class-icon';
import { useMessages } from '@/hooks/use-messages';

export interface ClassDetailProps {
  classType: ClassTypeWithStats;
  instructors: Instructor[];
}

export function ClassDetail({ classType, instructors }: ClassDetailProps) {
  const m = useMessages();
  return (
    <Card className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className={`flex size-14 shrink-0 items-center justify-center rounded-chip ${ACCENT_ICON_BG_CLASS[classType.accent]}`}
        >
          <ClassIcon name={classType.icon} className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold tracking-tight text-ink">{classType.name}</h1>
            <span className="rounded-pill bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
              {m.classes.categoryLabel[classType.category]}
            </span>
          </div>
          <p className="max-w-xl text-sm text-text-secondary">{classType.description}</p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm font-medium text-text-secondary">
            <span>
              <span className="font-semibold text-ink">{classType.durationMinutes}</span> {m.classes.detail.durationUnit}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-semibold text-ink">{classType.defaultCapacity}</span> {m.classes.detail.capacityUnit}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <span className="text-xs font-semibold text-text-secondary">{m.classes.detail.instructorsLabel}</span>
        {instructors.length > 0 ? (
          <AvatarGroup
            people={instructors.map((instructor) => ({ id: instructor.id, name: instructor.name, avatar: instructor.avatar }))}
            size={32}
          />
        ) : (
          <span className="text-sm text-text-secondary">{m.classes.detail.unassigned}</span>
        )}
      </div>
    </Card>
  );
}
