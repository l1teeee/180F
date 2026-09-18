'use client';

// Shown over the login form from the moment sign-in starts until /login unmounts on the route
// change. Only tokens and the shared motion utilities (docs/03 section 12.5): animate-fade-up
// staggered ring -> title -> hint for the entrance, Tailwind's built-in animate-spin for the
// ring (the same spinner every other pending state in the product uses) - no bespoke @keyframes.
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useMessages } from '@/hooks/use-messages';

export function SignInLoader() {
  const m = useMessages();

  return (
    <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
      <div className="animate-fade-up relative flex size-24 items-center justify-center">
        <span aria-hidden="true" className="absolute inset-0 rounded-full border-[3px] border-purple-soft" />
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-purple"
        />
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-tile bg-ink shadow-tile"
        >
          <Image src="/brand/mark.png" alt="" width={437} height={256} className="h-auto w-10" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p
          className="animate-fade-up text-[18px] font-semibold text-ink"
          style={{ '--stagger-index': 1 } as CSSProperties}
        >
          {m.auth.signingIn}
        </p>
        <p
          className="animate-fade-up text-sm text-text-secondary"
          style={{ '--stagger-index': 2 } as CSSProperties}
        >
          {m.auth.signingInHint}
        </p>
      </div>
    </div>
  );
}
