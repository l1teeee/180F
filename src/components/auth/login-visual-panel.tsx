'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.1 + master plan section 16: the media column of the
// split login layout, on the right at lg and up. The client-supplied class video
// (public/brand/login-video.mp4, the source clip minus its first 4 seconds) plays muted on loop
// inside a rounded panel inset from the viewport edge.
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMessages } from '@/hooks/use-messages';

const LARGE_SCREEN_QUERY = '(min-width: 64rem)'; // Tailwind's lg breakpoint
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function PanelMedia() {
  const isLargeScreen = useMediaQuery(LARGE_SCREEN_QUERY, false);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, false);

  // Below lg the panel is display:none, but a mounted <video autoplay> would still download
  // all ~3 MB of it - so on small screens no media is mounted at all.
  if (!isLargeScreen) return null;

  // With prefers-reduced-motion nothing autoplays: a still frame from the same video stands in.
  if (prefersReducedMotion) {
    return (
      <Image
        src="/brand/login-video-poster.jpg"
        alt=""
        fill
        sizes="46vw"
        loading="eager"
        className="object-cover"
      />
    );
  }

  return (
    <video
      aria-hidden="true"
      autoPlay
      muted
      loop
      playsInline
      src="/brand/login-video.mp4"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function LoginVisualPanel() {
  const m = useMessages();

  return (
    <div className="hidden shrink-0 p-6 lg:flex lg:w-[46%]">
      {/* isolate: Safari ignores border-radius clipping on a playing <video> without it. */}
      <div
        className="animate-fade-up relative isolate flex-1 overflow-hidden rounded-[32px] bg-ink"
        style={{ '--stagger-index': 1 } as CSSProperties}
      >
        <PanelMedia />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/15 to-transparent" />
        <p
          className="animate-fade-up absolute inset-x-0 bottom-0 max-w-md p-8 text-[28px] leading-tight font-bold tracking-[-0.02em] text-white xl:p-10 xl:text-[32px]"
          style={{ '--stagger-index': 5 } as CSSProperties}
        >
          {m.auth.subtitle}
        </p>
      </div>
    </div>
  );
}
