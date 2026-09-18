'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.1 + master plan section 16. RHF + Zod, auth via
// useAuth() (ADR-010: DemoAuthProvider vs SupabaseAuthProvider, chosen transparently from env -
// services/auth/** is not this task's write set and is left untouched).
//
// Deviation from docs/03 section 5 "shadcn/ui primitives": the installed set has no checkbox
// primitive, so "Remember me" uses the existing Switch instead - it is decorative either way,
// since DemoAuthProvider.signIn() always persists the session regardless (master plan section 44:
// "do not pretend this is production-grade authorization").
import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/auth/password-input';
import { SignInLoader } from '@/components/auth/sign-in-loader';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMessages } from '@/hooks/use-messages';
import { cn } from '@/lib/cn';
import { useAuth } from '@/services/auth/auth-context';
import { INVALID_CREDENTIALS } from '@/services/auth/demo-auth-provider';

// English messages baked into the schema are never rendered - domain schemas for the public
// booking form live outside this namespace's write set, so both forms keep zod locale-free and
// map field identity to translated copy at render instead (see src/i18n/dictionaries/es/auth.ts).
// Each field here has exactly one possible failure, so the field name alone picks the key.
const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Demo Auth resolves instantly and the route change alone can finish in a few hundred
// milliseconds, so without a hold the loader would flash by. Long enough for the ring to
// complete a turn and read as a deliberate "starting your session" beat.
const SESSION_LOADER_HOLD_MS = 1200;

export function LoginForm() {
  const { status, signIn } = useAuth();
  const router = useRouter();
  const m = useMessages();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  // Visiting /login while already signed in (e.g. the back button) lands on /dashboard instead
  // of showing the form again. A sign-in started from this form is excluded: it navigates on
  // its own once the loader has been shown (onSubmit below).
  useEffect(() => {
    if (status === 'authenticated' && !isSigningIn) router.replace('/dashboard');
  }, [status, isSigningIn, router]);

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    setIsSigningIn(true);
    try {
      await signIn(values.email, values.password);
    } catch (err) {
      // docs/06 3.1: invalid credentials render an inline field-level error, not ErrorState.
      // DemoAuthProvider.signIn() rejects with a stable code (INVALID_CREDENTIALS), never a
      // sentence - this is the only place that code is translated. Any other error (an
      // unrecognised code, or SupabaseAuthProvider's own message) falls back to the generic
      // translated copy rather than rendering blank or leaking untranslated text.
      setIsSigningIn(false);
      const code = err instanceof Error ? err.message : null;
      setFormError(code === INVALID_CREDENTIALS ? m.auth.errors.invalidCredentials : m.auth.genericError);
      return;
    }
    // isSigningIn stays true on success: the loader remains until /login unmounts.
    await new Promise((resolve) => setTimeout(resolve, SESSION_LOADER_HOLD_MS));
    router.replace('/dashboard');
  }

  return (
    <div className="relative w-full max-w-[360px]">
      {/* inert while signing in: the form stays in place (no layout jump) but fades out and
          can no longer be focused or submitted while the loader is on top of it. */}
      <div
        inert={isSigningIn}
        className={cn(
          'flex flex-col gap-8 transition-opacity duration-[var(--duration-base)] ease-out',
          isSigningIn && 'opacity-0',
        )}
      >
        <div className="flex flex-col gap-6">
          <div
            className="animate-fade-up flex items-center gap-3"
            style={{ '--stagger-index': 0 } as CSSProperties}
          >
            {/* Client-supplied mark (public/brand/mark.png) - studio name stays live text
                per ADR-019, so only the monogram is baked into an image. */}
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-ink">
              <Image src="/brand/mark.png" alt="" width={437} height={256} className="h-auto w-[26px]" />
            </span>
            <span className="text-sm font-bold tracking-tight text-ink">180 Fitness Studio</span>
          </div>
          <h1
            className="animate-fade-up text-[32px] leading-tight font-bold tracking-[-0.02em] text-ink"
            style={{ '--stagger-index': 1 } as CSSProperties}
          >
            {m.auth.heading}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field
              data-invalid={!!errors.email}
              className="animate-fade-up"
              style={{ '--stagger-index': 2 } as CSSProperties}
            >
              <FieldLabel htmlFor="email">{m.auth.emailLabel}</FieldLabel>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder={m.auth.emailPlaceholder}
                  aria-invalid={!!errors.email}
                  className="pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email ? <FieldError>{m.auth.errors.emailInvalid}</FieldError> : null}
            </Field>

            <Field
              data-invalid={!!errors.password}
              className="animate-fade-up"
              style={{ '--stagger-index': 3 } as CSSProperties}
            >
              <FieldLabel htmlFor="password">{m.auth.passwordLabel}</FieldLabel>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder={m.auth.passwordPlaceholder}
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password ? <FieldError>{m.auth.errors.passwordRequired}</FieldError> : null}
            </Field>

            <div
              className="animate-fade-up flex items-center gap-2.5"
              style={{ '--stagger-index': 4 } as CSSProperties}
            >
              <Controller
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <Switch id="remember-me" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="remember-me" className="text-sm font-medium text-ink">
                {m.auth.rememberMe}
              </Label>
            </div>

            {formError ? (
              <div
                role="alert"
                className="animate-fade-up flex items-start gap-2 rounded-field bg-danger-soft px-3 py-2.5 text-sm text-danger-text"
              >
                <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                {formError}
              </div>
            ) : null}

            {/* Wrapped, not animated directly: an animation's fill-mode pins opacity at 1 and
                would override the Button's own hover:opacity-90 and disabled:opacity-50. */}
            <div className="animate-fade-up" style={{ '--stagger-index': 4 } as CSSProperties}>
              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                {m.auth.signIn}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => toast.info(m.auth.forgotPasswordToast)}
              className="animate-fade-up self-start text-sm font-semibold text-purple-deep hover:underline"
              style={{ '--stagger-index': 5 } as CSSProperties}
            >
              {m.auth.forgotPassword}
            </button>
          </FieldGroup>
        </form>

        <p
          className="animate-fade-up rounded-field bg-surface-muted px-3 py-2.5 text-center text-xs text-text-secondary"
          style={{ '--stagger-index': 5 } as CSSProperties}
        >
          {m.auth.demoCredentialsLabel} <span className="font-semibold text-ink">admin@demo.com</span> /{' '}
          <span className="font-semibold text-ink">demo1234</span>
        </p>
      </div>

      {isSigningIn ? <SignInLoader /> : null}
    </div>
  );
}
