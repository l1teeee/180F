// docs/07-COMPONENT-ARCHITECTURE.md section 3. docs/06 section 3.9: 3 columns at 1024/1440,
// 2 at 768, 1 at 390.
import type { InstructorRosterEntry } from '@/hooks/use-instructors-roster';
import { InstructorCard } from './instructor-card';

export interface InstructorGridProps {
  instructors: InstructorRosterEntry[];
}

export function InstructorGrid({ instructors }: InstructorGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {instructors.map((instructor, index) => (
        <InstructorCard key={instructor.id} instructor={instructor} index={index % 6} />
      ))}
    </div>
  );
}
