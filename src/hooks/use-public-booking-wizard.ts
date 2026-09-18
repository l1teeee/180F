// The public wizard's state machine (docs/06-ROUTES-AND-SCREENS.md section 3.14, Phase 8 task
// brief). The step itself is derived from the `?step=` URL param rather than held as its own
// piece of state, so browser back/forward moves between steps through ordinary history
// navigation instead of a custom popstate handler - nothing here has to "restore" state on
// back/forward because nothing was ever thrown away: selections stay in this hook's state for
// as long as the wizard stays mounted, and the effective step is always clamped to what that
// state can actually support (see maxReachableStep), so a step reachable only via a stale or
// hand-edited URL never renders with missing data.
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { publicBookingInputSchema, type PublicBookingInputSchema } from '@/domain/schemas';
import type { Booking, ClassType, ISODate, SessionWithOccupancy } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { isPublicBookingClassId } from './use-public-booking-catalog';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

// Objects, not bare ids: docs/06 section 3.15 "avoiding a second store read that could race a
// subsequent mutation" - the success screen composes class/date/time from what was already
// resolved on the way through steps 1-3, rather than looking the ids back up afterwards.
interface WizardSelection {
  classType: ClassType | null;
  date: ISODate | null;
  session: SessionWithOccupancy | null;
}

export interface UsePublicBookingWizardResult {
  step: WizardStep;
  selection: WizardSelection;
  form: UseFormReturn<PublicBookingInputSchema>;
  mutation: 'idle' | 'pending';
  submitError: string | null;
  isSessionFullError: boolean;
  confirmedBooking: Booking | null;
  selectClass: (classType: ClassType) => void;
  selectDate: (date: ISODate) => void;
  selectSession: (session: SessionWithOccupancy) => void;
  goBack: () => void;
  chooseAnotherTime: () => void;
  submitCustomerDetails: (values: PublicBookingInputSchema) => Promise<void>;
  startOver: () => void;
}

function clampStep(requested: number): WizardStep {
  return requested >= 1 && requested <= 5 && Number.isInteger(requested) ? (requested as WizardStep) : 1;
}

// The single source of truth for "which step can actually render right now" - both the URL
// clamp below and every skip-a-step adversarial case (no class selected, no time selected)
// resolve through this one function rather than being handled ad hoc per step.
function maxReachableStep(selection: WizardSelection, confirmed: boolean): WizardStep {
  if (confirmed) return 5;
  if (!selection.classType) return 1;
  if (!selection.date) return 2;
  if (!selection.session) return 3;
  return 4;
}

const EMPTY_FORM_VALUES: PublicBookingInputSchema = { sessionId: '', name: '', email: '', phone: '' };

export function usePublicBookingWizard(initialClassId: string | null): UsePublicBookingWizardResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = useDemoRuntimeStore((state) => state.status);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const mutation = useBookingStore((state) => state.mutation);

  const [selection, setSelection] = useState<WizardSelection>({ classType: null, date: null, session: null });
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Tracked separately from `submitError`'s message: `selection.session` is a snapshot taken
  // at step 3 (docs/06 section 3.15, see WizardSelection above), so it does not live-update
  // when a later submit finds the session has since filled up - re-deriving "was this a
  // session_full rejection" from that stale snapshot's occupancyState would silently miss it.
  const [isSessionFullError, setIsSessionFullError] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [didInitPreselect, setDidInitPreselect] = useState(false);

  // Render-independent guard: a rapid double-click can fire two click handlers before React
  // commits the `disabled` attribute from the first one's state update, so the lock has to be
  // synchronous and outside render (docs/08 section 8.2 covers the store-level guarantee this
  // backs up, not replaces).
  const isSubmittingRef = useRef(false);

  const form = useForm<PublicBookingInputSchema>({
    resolver: zodResolver(publicBookingInputSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  // Architecture invariant 6: demo data is seeded client-side after mount. Safe alongside
  // whatever else also calls this on mount - hydrateDemo() guards on status itself (docs/08
  // section 8.4), so a redundant call here is a no-op, not a second load.
  useEffect(() => {
    void useDemoRuntimeStore.getState().hydrateDemo();
  }, []);

  useEffect(() => {
    form.setValue('sessionId', selection.session?.id ?? '');
  }, [selection.session, form]);

  const goToStep = useCallback(
    (next: WizardStep) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', String(next));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // /book/[classId] (docs/06 section 3.14): once the catalog is hydrated, resolve the id
  // against the curated public list and pre-select it. An id that doesn't resolve (unknown, or
  // a real but non-curated admin class type) leaves the selection empty, which
  // maxReachableStep already turns into "step 1, unselected" - no 404. This is a guarded
  // setState during render, not inside an effect (react.dev "You Might Not Need an Effect" ->
  // "Adjusting some state when a prop changes"): `didInitPreselect` makes it run at most once,
  // so it commits in the same render pass instead of a render-then-effect-then-render cascade,
  // which is also what the react-hooks/set-state-in-effect rule is steering away from.
  if (!didInitPreselect && status === 'ready') {
    setDidInitPreselect(true);
    if (initialClassId && isPublicBookingClassId(initialClassId)) {
      const preset = classTypes.find((classType) => classType.id === initialClassId);
      if (preset) setSelection((prev) => ({ ...prev, classType: preset }));
    }
  }

  // The step-2 jump itself is a navigation side effect (the URL, an external system), so unlike
  // the state adjustment above it does belong in an effect. Re-checking `searchParams` here
  // (rather than only at the moment `didInitPreselect` flips) means a visitor who lands on
  // /book/[classId] with an explicit ?step= already in the URL keeps that step instead of being
  // overridden.
  useEffect(() => {
    if (!didInitPreselect || !selection.classType || searchParams.get('step')) return;
    goToStep(2);
  }, [didInitPreselect, selection.classType, searchParams, goToStep]);

  const requestedStep = clampStep(Number(searchParams.get('step')));
  const step = Math.min(requestedStep, maxReachableStep(selection, confirmedBooking != null)) as WizardStep;

  const selectClass = useCallback(
    (classType: ClassType) => {
      setSelection({ classType, date: null, session: null });
      setSubmitError(null);
      setIsSessionFullError(false);
      goToStep(2);
    },
    [goToStep],
  );

  const selectDate = useCallback(
    (date: ISODate) => {
      setSelection((prev) => ({ ...prev, date, session: null }));
      setSubmitError(null);
      setIsSessionFullError(false);
      goToStep(3);
    },
    [goToStep],
  );

  const selectSession = useCallback(
    (session: SessionWithOccupancy) => {
      setSelection((prev) => ({ ...prev, session }));
      setSubmitError(null);
      setIsSessionFullError(false);
      goToStep(4);
    },
    [goToStep],
  );

  const goBack = useCallback(() => {
    goToStep(Math.max(1, step - 1) as WizardStep);
  }, [goToStep, step]);

  // Distinct from goBack: also drops the now-rejected session so a stale full slot can't be
  // resubmitted unchanged, and so a hand-edited URL can't skip back past step 3 for it either.
  const chooseAnotherTime = useCallback(() => {
    setSelection((prev) => ({ ...prev, session: null }));
    setSubmitError(null);
    setIsSessionFullError(false);
    goToStep(3);
  }, [goToStep]);

  const startOver = useCallback(() => {
    setSelection({ classType: null, date: null, session: null });
    setSubmitError(null);
    setIsSessionFullError(false);
    setConfirmedBooking(null);
    form.reset(EMPTY_FORM_VALUES);
    goToStep(1);
  }, [goToStep, form]);

  const submitCustomerDetails = useCallback(
    async (values: PublicBookingInputSchema) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setSubmitError(null);
      setIsSessionFullError(false);
      try {
        const result = await useBookingStore.getState().createPublicBooking(values);
        if (result.ok) {
          setConfirmedBooking(result.booking);
          goToStep(5);
        } else {
          setSubmitError(result.message);
          setIsSessionFullError(result.reason === 'session_full');
        }
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [goToStep],
  );

  return {
    step,
    selection,
    form,
    mutation,
    submitError,
    isSessionFullError,
    confirmedBooking,
    selectClass,
    selectDate,
    selectSession,
    goBack,
    chooseAnotherTime,
    submitCustomerDetails,
    startOver,
  };
}
