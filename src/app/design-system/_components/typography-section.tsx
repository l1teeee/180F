import type { ReactNode } from "react";
import { SectionShell } from "./section-shell";
import { Pill } from "./pill";

function RoleRow({ role, meta, children }: { role: string; meta: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-baseline gap-2 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[160px_1fr] sm:gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-ink">{role}</span>
        <span className="text-xs text-text-tertiary tabular-nums">{meta}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function TypographySection() {
  return (
    <SectionShell
      index={3}
      title="Typography"
      description="Manrope via next/font/google. Fallback Inter, ui-sans-serif, system-ui, sans-serif."
    >
      <div className="flex flex-col">
        <RoleRow role="Page title" meta="30px / 700 / -0.02em">
          <span className="text-[30px] leading-tight font-bold tracking-[-0.02em] text-ink">
            Fitness Overview
          </span>
        </RoleRow>
        <RoleRow role="Hero metric" meta="44px / 800 / -0.03em">
          <span className="text-[44px] leading-none font-extrabold tracking-[-0.03em] text-ink tabular-nums">
            148
          </span>
        </RoleRow>
        <RoleRow role="Card metric" meta="32px / 700 / -0.02em">
          <span className="text-[32px] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
            87%
          </span>
        </RoleRow>
        <RoleRow role="Metric unit" meta="14px / 600, secondary, baseline-aligned">
          <span className="flex items-baseline gap-1.5">
            <span className="text-[32px] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
              74
            </span>
            <span className="text-sm font-semibold text-text-secondary">bookings</span>
          </span>
        </RoleRow>
        <RoleRow role="Section title" meta="20px / 650">
          <span className="text-[20px] font-[650] text-ink">Weekly bookings</span>
        </RoleRow>
        <RoleRow role="Card label" meta="15px / 600">
          <span className="text-[15px] font-semibold text-ink">Active members</span>
        </RoleRow>
        <RoleRow role="Body" meta="14-15px / 500">
          <span className="text-[15px] font-medium text-text-secondary">
            Studio management and class booking, built for a boutique fitness brand.
          </span>
        </RoleRow>
        <RoleRow role="Small label" meta="12-13px / 500, secondary">
          <span className="text-[13px] font-medium text-text-secondary">Next session in 42 min</span>
        </RoleRow>
        <RoleRow role="Table header" meta="12px / 600, uppercase, 0.04em">
          <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
            Customer
          </span>
        </RoleRow>
        <RoleRow role="Pill text" meta="12px / 600">
          <Pill label="Confirmed" tone="positive" />
        </RoleRow>
      </div>
    </SectionShell>
  );
}
