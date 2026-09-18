'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 2: Next.js requires error boundaries to be client
// components. This is the root boundary - it covers (auth)/ and book/, since neither has its
// own error.tsx (docs/06 section 4.7) - and replaces everything below the root layout's
// <Providers>, so it is the one error view with no shell chrome around it at all.
import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <ErrorState onRetry={reset} />
      </div>
    </div>
  );
}
