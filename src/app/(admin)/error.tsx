'use client';

// docs/06-ROUTES-AND-SCREENS.md section 4.7: covers every admin route. Next.js renders this in
// place of the failed page's own content, nested inside (admin)/layout.tsx's already-rendered
// AppShell (the layout itself did not throw), so this stays unwrapped/lightweight rather than
// assuming it owns the full viewport.
import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="w-full max-w-md">
        <ErrorState onRetry={reset} />
      </div>
    </div>
  );
}
