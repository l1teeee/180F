// docs/06-ROUTES-AND-SCREENS.md section 3.10. Server Component that only unwraps `params`, same
// convention as src/app/(admin)/classes/[id]/page.tsx.
import { InstructorDetailView } from '@/components/instructors/instructor-detail-view';

export default async function InstructorDetailPage(props: PageProps<'/instructors/[id]'>) {
  const { id } = await props.params;
  return <InstructorDetailView instructorId={id} />;
}
