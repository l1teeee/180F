// docs/08-STATE-MANAGEMENT.md section 1. Immutable reference data (class types, membership
// plans) plus the identity fields ADR-019 leaves on the catalog: `organization` here keeps
// only id/logo - name, email, phone, address and timezone live on useSettingsStore.general
// from hydration onward, which is the only store every screen reads for studio identity.
import { create } from 'zustand';
import type { ClassType, DemoDataset, MembershipPlan, Organization } from '@/domain/types';
import { scheduleSnapshotWrite } from './demo-persistence';

type CatalogOrganization = Pick<Organization, 'id' | 'logo'>;

interface CatalogState {
  organization: CatalogOrganization | null;
  classTypes: ClassType[];
  membershipPlans: MembershipPlan[];
  setCatalog: (data: Pick<DemoDataset, 'organization' | 'classTypes' | 'membershipPlans'>) => void;
  // Bulk restore of just the mutable slice (ADR-022): unlike setCatalog, this leaves
  // organization/classTypes alone, since a restored snapshot never carries the always-
  // regenerated static reference data.
  setMembershipPlans: (membershipPlans: MembershipPlan[]) => void;
  updatePlan: (planId: string, changes: Partial<Omit<MembershipPlan, 'id'>>) => void;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
  organization: null,
  classTypes: [],
  membershipPlans: [],

  setCatalog: (data) =>
    set({
      organization: { id: data.organization.id, logo: data.organization.logo },
      classTypes: data.classTypes,
      membershipPlans: data.membershipPlans,
    }),

  setMembershipPlans: (membershipPlans) => set({ membershipPlans }),

  updatePlan: (planId, changes) => {
    set((state) => ({
      membershipPlans: state.membershipPlans.map((plan) => (plan.id === planId ? { ...plan, ...changes } : plan)),
    }));
    scheduleSnapshotWrite();
  },
}));
