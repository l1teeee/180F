'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4: header (avatar, "Customer XX", status), contact
// info, membership card - the content of the left SectionCard on /customers/[id] (docs/06
// section 3.6). Needs 'use client' for useMessages/useDateLocale.
import { Calendar, CreditCard, Mail, Phone, Wallet, type LucideIcon } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { AvatarBlobatar } from '@/components/ui/avatar';
import type { AccentToken, CustomerWithStats, MembershipPlan } from '@/domain/types';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useMessages } from '@/hooks/use-messages';
import type { Messages } from '@/i18n/messages';
import { accentForCustomerId, paletteForAccent } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

export interface CustomerProfileProps {
  customer: CustomerWithStats;
}

// "Customer NN" -> "NN" (privacy rule, docs/04 section 2) - same convention as
// shared/avatar-group.tsx's private initialsFor, reimplemented locally per that file's own
// header comment (docs/03 section 13 "Fallback" is a per-caller concern, not a shared export).
function initialsFor(name: string): string {
  const trailingNumber = /(\d{1,2})\s*$/.exec(name.trim());
  return trailingNumber ? trailingNumber[1].padStart(2, '0') : name.trim().slice(0, 2).toUpperCase();
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-surface-muted text-text-secondary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-text-tertiary">{label}</span>
        <span className="text-sm font-medium text-ink">{value}</span>
      </div>
    </div>
  );
}

const MEMBERSHIP_CARD_BG: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft',
  yellow: 'bg-yellow-soft',
  green: 'bg-green-soft',
  pink: 'bg-pink-soft',
  blue: 'bg-blue-soft',
};

const MEMBERSHIP_CARD_TEXT: Record<AccentToken, string> = {
  purple: 'text-purple-deep',
  yellow: 'text-yellow-text',
  green: 'text-green-text',
  pink: 'text-danger-text',
  blue: 'text-blue-text',
};

function MembershipCard({
  membership,
  remainingCredits,
  m,
}: {
  membership: MembershipPlan;
  remainingCredits: number | null;
  m: Messages;
}) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-card-sm border border-border-soft p-[18px]', MEMBERSHIP_CARD_BG[membership.accent])}>
      <div className="flex items-center justify-between gap-3">
        <span className={cn('text-[15px] font-semibold', MEMBERSHIP_CARD_TEXT[membership.accent])}>{membership.name}</span>
        <span className="text-sm font-semibold text-ink tabular-nums">
          {formatCurrency(membership.monthlyPrice)}
          <span className="text-xs font-medium text-text-secondary"> {m.customers.detail.profile.perMonthUnit}</span>
        </span>
      </div>
      <p className="text-sm text-ink">
        {membership.classLimit === null
          ? m.customers.detail.profile.unlimitedClasses
          : m.customers.detail.profile.classesPerMonth(membership.classLimit)}
      </p>
      {/* membership.benefits (src/data/memberships.ts) holds stable keys, not sentences - the
          fallback to the raw key covers an unrecognised one defensively rather than rendering
          blank (it should never actually trigger against the seeded catalog). */}
      <ul className="flex flex-col gap-1 text-xs text-text-secondary">
        {membership.benefits.map((benefit) => (
          <li key={benefit}>{m.memberships.benefitLabel[benefit as keyof typeof m.memberships.benefitLabel] ?? benefit}</li>
        ))}
      </ul>
      <div className="border-t border-border-soft pt-2 text-xs font-semibold text-ink">
        {remainingCredits === null
          ? m.customers.detail.profile.unlimitedCreditsRemaining
          : m.customers.detail.profile.creditsRemainingThisMonth(remainingCredits)}
      </div>
    </div>
  );
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const m = useMessages();
  const { formatDisplayDate } = useDateLocale();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <AvatarBlobatar
          seed={customer.id}
          palette={paletteForAccent(accentForCustomerId(customer.id))}
          size={64}
          alt={customer.name}
          animate="hover"
          fallbackInitials={initialsFor(customer.name)}
        />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[20px] leading-tight font-[650] text-ink">{customer.name}</h1>
          <StatusBadge status={customer.status} label={m.customers.status[customer.status]} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <InfoRow icon={Mail} label={m.customers.detail.profile.email} value={customer.email} />
        <InfoRow icon={Phone} label={m.customers.detail.profile.phone} value={customer.phone} />
        <InfoRow icon={Calendar} label={m.customers.detail.profile.memberSince} value={formatDisplayDate(customer.joinedAt)} />
        <InfoRow icon={CreditCard} label={m.customers.detail.profile.membership} value={customer.membership.name} />
        <InfoRow
          icon={Wallet}
          label={m.customers.detail.profile.remainingCredits}
          value={customer.remainingCredits === null ? m.customers.detail.profile.unlimited : String(customer.remainingCredits)}
        />
      </div>

      <MembershipCard membership={customer.membership} remainingCredits={customer.remainingCredits} m={m} />
    </div>
  );
}
