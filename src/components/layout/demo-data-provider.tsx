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

  useEffect(() => {
    void hydrateDemo();
  }, [hydrateDemo]);

  return <>{children}</>;
}
