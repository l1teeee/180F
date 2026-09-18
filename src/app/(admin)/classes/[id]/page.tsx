// docs/06-ROUTES-AND-SCREENS.md section 3.8. Server Component that only unwraps `params`, same
// split as src/app/book/[classId]/page.tsx: the client-data lookup (and its notFound() call)
// lives in ClassDetailView (ADR-004 "Server-rendered-shell/Client-data pattern").
import { ClassDetailView } from '@/components/classes/class-detail-view';

export default async function ClassDetailPage(props: PageProps<'/classes/[id]'>) {
  const { id } = await props.params;
  return <ClassDetailView classTypeId={id} />;
}
