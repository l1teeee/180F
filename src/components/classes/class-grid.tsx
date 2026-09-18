// docs/07-COMPONENT-ARCHITECTURE.md section 3. docs/06 section 3.7: 4 columns at 1440/1280,
// 3 at 1024, 2 at 768, 1 at 390. `instructorById` is built once by useClassesCatalog (CLAUDE.md
// "build index maps once per hook, never inside a row") - resolving each card's instructor list
// here is a plain O(1)-per-id lookup, not a rebuild of the map.
import type { ClassTypeWithStats, Instructor } from '@/domain/types';
import { ClassCard } from './class-card';

export interface ClassGridProps {
  classTypes: ClassTypeWithStats[];
  instructorById: Map<string, Instructor>;
}

export function ClassGrid({ classTypes, instructorById }: ClassGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {classTypes.map((classType, index) => {
        const instructors = classType.instructorIds
          .map((id) => instructorById.get(id))
          .filter((instructor): instructor is Instructor => Boolean(instructor));
        return <ClassCard key={classType.id} classType={classType} instructors={instructors} index={index % 6} />;
      })}
    </div>
  );
}
