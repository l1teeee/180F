// docs/06-ROUTES-AND-SCREENS.md section 3.1 + master plan section 16: split-screen layout, no
// AppShell. Pure layout composition - LoginVisualPanel and LoginForm each own their own
// client-side behaviour (components/auth/**, Phase 9's write set), so this file needs no
// 'use client' of its own.
import { LoginForm } from '@/components/auth/login-form';
import { LoginVisualPanel } from '@/components/auth/login-visual-panel';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <LoginVisualPanel />
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6">
        <LoginForm />
      </div>
    </div>
  );
}
