'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.13 + master plan section 40. Four independent
// SectionCard forms, each writing its own slice through useSettingsStore.updateSection
// (docs/08 section 8.7, ADR-019) - saving one section never touches another's unsaved edits.
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { BookingSection } from '@/components/settings/booking-section';
import { BrandingSection } from '@/components/settings/branding-section';
import { GeneralSection } from '@/components/settings/general-section';
import { NotificationsSection } from '@/components/settings/notifications-section';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useMessages } from '@/hooks/use-messages';
import { useSettingsForm } from '@/hooks/use-settings-form';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export default function SettingsPage() {
  const m = useMessages();
  const status = useDemoStatus();
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const { settings, updateSection } = useSettingsForm();

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={m.settings.pageTitle} subtitle={m.settings.pageSubtitle} />
        <ErrorState description={m.settings.loadErrorFallback} onRetry={retryHydration} />
      </div>
    );
  }

  if (status !== 'ready' || !settings) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={m.settings.pageTitle} subtitle={m.settings.pageSubtitle} />
        {/* LoadingSkeleton has no 'form-section' variant - docs/06 section 4.5 names one, but the
           shared component (read-only to this task) only ships card/table-row/chart/kpi/text.
           'card' is the closest existing shape; reported for hoisting rather than editing the
           shared file (docs/12-AGENT-OWNERSHIP.md). */}
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={m.settings.pageTitle} subtitle={m.settings.pageSubtitle} />
      <GeneralSection general={settings.general} onSave={(changes) => updateSection('general', changes)} />
      <BookingSection booking={settings.booking} onSave={(changes) => updateSection('booking', changes)} />
      <NotificationsSection
        notifications={settings.notifications}
        onSave={(changes) => updateSection('notifications', changes)}
      />
      <BrandingSection branding={settings.branding} onSave={(changes) => updateSection('branding', changes)} />
    </div>
  );
}
