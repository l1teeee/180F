'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 (components/layout/, Phase 2D) and
// docs/08-STATE-MANAGEMENT.md section 8.4: calls hydrateDemo() from a mount effect and renders
// children unconditionally - each view decides its own skeleton from useDemoStatus(). The
// hydrateDemo() guard (status !== 'idle'/'loading'/'ready') makes React 19 StrictMode's doubled
// mount effect harmless, so no cleanup/cancellation is needed here.
import { useEffect, type ReactNode } from 'react';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const hydrateDemo = useDemoRuntimeStore((state) => state.hydrateDemo);
  const status = useDemoRuntimeStore((state) => state.status);

  useEffect(() => {
    void hydrateDemo();
  }, [hydrateDemo]);

  // The Playwright harness waits on body[data-demo-status="ready"] (e2e/fixtures/hydration.ts).
  // Written in a client effect only, never during render, so server-rendered markup never carries
  // a status attribute (ADR-005) - this runs after mount and re-runs on every status transition.
  useEffect(() => {
    document.body.dataset.demoStatus = status;
    return () => {
      delete document.body.dataset.demoStatus;
    };
  }, [status]);

  return <>{children}</>;
}
