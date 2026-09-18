'use client';

// docs/08-STATE-MANAGEMENT.md section 8.4: covers a render failure in the root layout itself,
// which no route-level error.tsx can catch. Next.js replaces the whole document when this
// fires, so it renders its own <html>/<body> (the ones in src/app/layout.tsx are bypassed
// entirely) - the Manrope load is repeated here for the same visual result in this rare case.
import { Manrope } from 'next/font/google';
import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={manrope.variable}>
      <body className="bg-background text-ink antialiased">
        <div className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <ErrorState onRetry={reset} />
          </div>
        </div>
      </body>
    </html>
  );
}
