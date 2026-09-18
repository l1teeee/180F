import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import type { DemoRuntimeStatus } from '@/stores/demo-runtime.store';

export function useDemoStatus(): DemoRuntimeStatus {
  return useDemoRuntimeStore((state) => state.status);
}
