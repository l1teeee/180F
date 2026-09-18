'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/memberships/" Phase 7, prop contract
// from section 4. Presentational only (docs/07 section 1 rule 3): plan and memberCount are
// passed in, edit/view-members are callbacks owned by the page - this card never reads a store.
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AccentToken, MembershipPlan } from '@/domain/types';
import { formatCurrency } from '@/lib/format';

export interface MembershipCardProps {
  plan: MembershipPlan;
  memberCount: number;
  onEdit: () => void;
  onViewMembers: () => void;
}

// Per-component accent -> Tailwind-class map, the same pattern already used locally in
// stat-card.tsx (ACCENT_ICON_CLASSNAME) and status-badge.tsx (ACCENT_BADGE_VARIANT) - docs/07
// section 7 only requires a single source for a *status*->colour map; an accent->class map is a
// legitimate per-component concern and is not centralised anywhere in this codebase.
const ACCENT_ICON_CLASSNAME: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft text-purple-deep',
  yellow: 'bg-yellow-soft text-yellow-text',
  green: 'bg-green-soft text-green-text',
  pink: 'bg-pink-soft text-danger-text',
  blue: 'bg-blue-soft text-blue-text',
};

function formatPlanPrice(plan: MembershipPlan): string {
  const price = formatCurrency(plan.monthlyPrice);
  return plan.billingPeriod === 'monthly' ? `${price}/month` : price;
}

export function MembershipCard({ plan, memberCount, onEdit, onViewMembers }: MembershipCardProps) {
  return (
    <Card className="flex flex-col gap-5">
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 items-center justify-center rounded-chip ${ACCENT_ICON_CLASSNAME[plan.accent]}`}
      >
        <CreditCard className="h-[18px] w-[18px]" />
      </span>

      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold text-ink">{plan.name}</span>
        <span className="text-[32px] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
          {formatPlanPrice(plan)}
        </span>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="text-sm text-text-secondary">
            {benefit}
          </li>
        ))}
      </ul>

      <p className="text-sm font-medium text-text-secondary tabular-nums">
        {memberCount} {memberCount === 1 ? 'member' : 'members'}
      </p>

      <div className="flex items-center gap-2.5 border-t border-border pt-5">
        {/* Four cards each carry a same-named "Edit plan" / "View members" pair - aria-label
            disambiguates for a screen-reader user browsing by role, while the visible label
            (what sighted users and this task's e2e specs key off) is unchanged. */}
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          aria-label={`Edit ${plan.name} plan`}
          onClick={onEdit}
        >
          Edit plan
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          aria-label={`View ${plan.name} members`}
          onClick={onViewMembers}
        >
          View members
        </Button>
      </div>
    </Card>
  );
}
