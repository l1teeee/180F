'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.1 + master plan section 16. RHF + Zod, auth via
// useAuth() (ADR-010: DemoAuthProvider vs SupabaseAuthProvider, chosen transparently from env -
// services/auth/** is not this task's write set and is left untouched).
//
// Deviation from docs/03 section 5 "shadcn/ui primitives": the installed set has no checkbox
// primitive, so "Remember me" uses the existing Switch instead - it is decorative either way,
// since DemoAuthProvider.signIn() always persists the session regardless (master plan section 44:
// "do not pretend this is production-grade authorization").
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/services/auth/auth-context';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { status, signIn } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

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
  // of showing the form again.
  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await signIn(values.email, values.password);
      router.replace('/dashboard');
    } catch (err) {
      // docs/06 3.1: invalid credentials render an inline field-level error, not ErrorState.
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  }

  return (
    <Card className="w-full max-w-[400px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink">Welcome back</h1>
        <p className="text-sm text-text-secondary">Manage your classes, customers and bookings from one place.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="admin@demo.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="demo1234"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
          </Field>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Controller
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <Switch id="remember-me" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="remember-me" className="text-sm font-medium text-ink">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Password reset isn't available in this demo.")}
              className="text-sm font-semibold text-purple-deep hover:underline"
            >
              Forgot password
            </button>
          </div>

          {formError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-field bg-danger-soft px-3 py-2.5 text-sm text-danger-text"
            >
              <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </div>
          ) : null}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </FieldGroup>
      </form>

      <p className="rounded-field bg-surface-muted px-3 py-2.5 text-center text-xs text-text-secondary">
        Demo credentials: <span className="font-semibold text-ink">admin@demo.com</span> /{' '}
        <span className="font-semibold text-ink">demo1234</span>
      </p>
    </Card>
  );
}
