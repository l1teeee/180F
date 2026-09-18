'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.6. Client-first per ADR-004: this route reads its id
// via useParams() rather than an async Server Component `params` prop, since deciding between
// loading / not-found / the real profile needs useDemoRuntimeStore.status first - the same
// reasoning src/app/(admin)/layout.tsx's AuthGuard already applies to its own client redirect.
import { notFound, useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ActivityTimeline } from '@/components/customers/activity-timeline';
import { CustomerProfile } from '@/components/customers/customer-profile';
import { CustomerStats } from '@/components/customers/customer-stats';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SectionCard } from '@/components/shared/section-card';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { useCustomersActivity } from '@/hooks/use-customers-activity';
import { useCustomersFavoriteClassName } from '@/hooks/use-customers-favorite-class';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useMessages } from '@/hooks/use-messages';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;
  const router = useRouter();
  const m = useMessages();
  const status = useDemoStatus();
  // Direct store reads for `error`/`demoNow`/retry (not routed through a src/hooks binding)
  // match the existing precedent in src/components/booking/booking-error-state.tsx for this
  // exact infra-level concern, narrower than a business-data selector.
  const error = useDemoRuntimeStore((state) => state.error);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);
  const profile = useCustomerProfile(customerId);
  const activity = useCustomersActivity(customerId);
  const favoriteClassName = useCustomersFavoriteClassName(profile?.favoriteClassTypeId ?? null);

  const backLink = (
    <Button type="button" variant="ghost" onClick={() => router.push('/customers')} className="-ml-3 self-start">
      <ArrowLeft aria-hidden="true" />
      {m.customers.detail.backToCustomers}
    </Button>
  );

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <ErrorState description={error ?? undefined} onRetry={() => void useDemoRuntimeStore.getState().retryHydration()} />
      </div>
    );
  }

  // docs/06 "Not-found behavior for unknown entity ids": resolve only once hydration has
  // finished. useCustomerProfile also returns null while status is 'idle'/'loading' (demoToday
  // isn't set yet), so gating on `status === 'ready'` is what tells "not found" apart from
  // "still loading" - calling notFound() before that would 404 every customer on first paint.
  if (status === 'ready' && !profile) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      {backLink}

      {!profile || !demoNow ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            {/* Bare Card, no "Profile" section title: below, the customer's own name is this
                page's h1 (docs/03 "heading order" - the same reasoning as
                instructor-profile-card.tsx, which is also a name-card with no SectionCard chrome
                around it) - a CardTitle here would put an h2 before the page's only h1. */}
            <Card>
              <LoadingSkeleton variant="card" />
            </Card>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <StatCard label={m.customers.detail.stats.classesThisMonth} value={0} loading />
              <StatCard label={m.customers.detail.stats.attendanceRate} value={0} loading />
              <StatCard label={m.customers.detail.stats.noShows} value={0} loading />
              <StatCard label={m.customers.detail.stats.favoriteClass} value={0} loading />
            </div>
            <SectionCard title={m.customers.detail.recentActivity}>
              <LoadingSkeleton variant="table-row" count={4} />
            </SectionCard>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Card>
              <CustomerProfile customer={profile} />
            </Card>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-8">
            <CustomerStats stats={profile} favoriteClassName={favoriteClassName} />
            <SectionCard title={m.customers.detail.recentActivity}>
              <ActivityTimeline entries={activity} demoNow={demoNow} />
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
