// docs/07-COMPONENT-ARCHITECTURE.md section 4. docs/03 section 5 "Inputs": search input carries
// a 16px leading icon and the placeholder "Search customers, classes...".
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

export function SearchInput({ value, onChange, placeholder, onFocus }: SearchInputProps) {
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
        placeholder={placeholder ?? 'Search customers, classes...'}
        aria-label={placeholder ?? 'Search customers, classes...'}
        className="pl-9"
      />
    </div>
  );
}
