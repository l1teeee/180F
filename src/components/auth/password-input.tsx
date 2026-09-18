'use client';

// Password field with a show/hide toggle. The toggle's accessible name is sr-only text, not an
// aria-label: e2e/ locates the field with getByLabel(/password/i), which also matches any
// element carrying an aria-label that contains "password" and would then fail strict mode.
import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMessages } from '@/hooks/use-messages';
import { cn } from '@/lib/cn';

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const m = useMessages();
  const [isVisible, setIsVisible] = useState(false);
  const ToggleIcon = isVisible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Lock
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary"
      />
      <Input {...props} type={isVisible ? 'text' : 'password'} className={cn('pr-11 pl-9', className)} />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-pill text-text-secondary transition-colors duration-[var(--duration-base)] ease-out hover:bg-surface-muted hover:text-ink"
      >
        <ToggleIcon aria-hidden="true" className="size-4" />
        <span className="sr-only">{isVisible ? m.auth.hidePassword : m.auth.showPassword}</span>
      </button>
    </div>
  );
}
