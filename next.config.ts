import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev`/`next build` otherwise auto-append an "AI agent rules" block to CLAUDE.md on
  // every run. CLAUDE.md is Opus-owned (docs/12-AGENT-OWNERSHIP.md); disabled so the framework
  // never writes to a file no implementer is allowed to touch.
  agentRules: false,
  // Hides the floating dev-mode indicator badge (bottom-left) so a `pnpm dev` session shown to
  // a client never displays framework chrome that looks like a stray floating avatar.
  devIndicators: false,
};

export default nextConfig;
