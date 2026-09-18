'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 (components/layout/, Phase 2D): mounts
// AuthContextProvider and DemoDataProvider and renders the sonner Toaster once, at the root.
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthContextProvider } from '@/services/auth/auth-context';
import { DemoDataProvider } from './demo-data-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      <DemoDataProvider>
        {children}
        <Toaster position="top-right" />
      </DemoDataProvider>
    </AuthContextProvider>
  );
}
