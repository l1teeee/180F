// Route skeleton only - Phase 9 replaces this with the General/Booking/Notifications/Branding
// SectionCards (docs/06 section 3.13).
import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Studio profile, booking policy and branding." />
      <SectionCard title="Studio settings">
        <EmptyState
          icon={Settings}
          title="This screen isn't built yet"
          description="Phase 9 adds the general, booking, notifications and branding sections."
        />
      </SectionCard>
    </div>
  );
}
