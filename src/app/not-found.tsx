import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

// docs/02-ARCHITECTURE.md section 2: the one not-found.tsx in the app - Server, static, no data
// (docs/07 section 2). Reached two ways: a genuinely unmatched route (renders bare, at the
// root, no admin route ever matched) and an unresolved entity id inside an admin route (docs/06
// "Not-found behavior for unknown entity ids" - Next walks up to this same boundary, but it
// still renders inside the admin AppShell, because only the leaf page threw, not the layout).
// No `min-h-screen` here so it reads reasonably centered in both contexts. EmptyState is given
// no `action`: a Server Component cannot pass an event handler across a client boundary, so the
// one action here is a plain <Link>, which Next.js supports directly in Server Components.
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <EmptyState
        title="Page not found"
        description="This page moved, or never existed. Check the address, or head back to the dashboard."
        icon={SearchX}
      />
      <Link href="/dashboard" className={buttonVariants({ variant: 'primary' })}>
        Go to dashboard
      </Link>
    </div>
  );
}
