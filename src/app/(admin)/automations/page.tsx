// Route skeleton only - Phase 7 replaces this with AutomationCard grid + WhatsAppPreview
// (docs/06 section 3.12).
import { Zap } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function AutomationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Automations" subtitle="Simulated WhatsApp messaging triggers." />
      <SectionCard title="Automations">
        <EmptyState
          icon={Zap}
          title="This screen isn't built yet"
          description="Phase 7 adds the 4 automation cards, their toggles and the WhatsApp message preview."
        />
      </SectionCard>
    </div>
  );
}
