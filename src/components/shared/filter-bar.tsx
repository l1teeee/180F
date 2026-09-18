// docs/07-COMPONENT-ARCHITECTURE.md section 4. Plain row layout for a caller-composed group of
// Select/SearchInput controls, plus an optional reset action - it owns no filter state itself.
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FilterBarProps {
  children: ReactNode; // a row of Select / SearchInput controls
  onReset?: () => void;
}

export function FilterBar({ children, onReset }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
      {onReset ? (
        <Button type="button" variant="ghost" onClick={onReset} className="shrink-0">
          <X aria-hidden="true" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}
