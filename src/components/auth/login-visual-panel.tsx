'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.1 + master plan section 16: the left column of the
// split login layout, roughly 55% of the width at lg and up. Abstract only - the dot-field
// texture docs/06 specifies, plus a soft wave silhouette in the same gradient/wave language as
// the rest of the app (project CLAUDE.md "purple wave charts"; technique mirrors
// app/design-system/_components/charts/wave-chart.tsx). No stock photography, no people
// (privacy rule, docs/03-DESIGN-SYSTEM.md section 9).
import Image from 'next/image';
import { useMessages } from '@/hooks/use-messages';

export function LoginVisualPanel() {
  const m = useMessages();
  return (
    <div
      className="bg-dotfield relative hidden flex-[1.2] items-center justify-center overflow-hidden lg:flex"
      style={{
        backgroundImage:
          'var(--gradient-tile-ink), radial-gradient(circle, rgba(228,224,245,0.4) 1px, transparent 1px)',
        backgroundSize: 'auto, 16px 16px',
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-2/5 w-full"
      >
        <defs>
          <linearGradient id="login-wave-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-purple)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-purple)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="login-wave-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity={0.16} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d="M0,130 C60,95 120,165 200,120 C280,75 340,140 400,105 L400,300 L0,300 Z"
          fill="url(#login-wave-back)"
        />
        <path
          d="M0,190 C70,155 130,220 210,175 C290,130 350,195 400,165 L400,300 L0,300 Z"
          fill="url(#login-wave-front)"
        />
      </svg>

      <div className="relative z-10 flex max-w-md flex-col items-center gap-4 px-10 text-center">
        {/* Client-supplied mark (public/brand/mark.png) - studio name stays live text
            per ADR-019, so only the monogram is baked into an image. */}
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-tile bg-white/10"
        >
          <Image src="/brand/mark.png" alt="" width={437} height={256} className="w-9 h-auto" />
        </span>
        {/* Not a heading: this panel is decorative marketing copy that sits before the
            form's own "Welcome back" h1 in DOM order, so a real heading here would put an h2
            ahead of the page's only h1. */}
        <p className="text-2xl font-bold text-white">180 Fitness Studio</p>
        <p className="text-[15px] font-medium text-white/70">{m.auth.subtitle}</p>
      </div>
    </div>
  );
}
