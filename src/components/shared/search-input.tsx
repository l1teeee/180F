'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4. docs/03 section 5 "Inputs": search input carries
// a 16px leading icon and a default placeholder (m.common.searchPlaceholder), overridable per call
// site since some screens search a narrower set than "customers, classes...".
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMessages } from '@/hooks/use-messages';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

export function SearchInput({ value, onChange, placeholder, onFocus }: SearchInputProps) {
  const m = useMessages();
  const resolvedPlaceholder = placeholder ?? m.common.searchPlaceholder;
  return (
    <div className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-tertiary"
      />
      <Input
        type="text"
        name="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={resolvedPlaceholder}
        aria-label={resolvedPlaceholder}
        className="pl-9"
      />
    </div>
  );
}
