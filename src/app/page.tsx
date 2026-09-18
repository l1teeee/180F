import { redirect } from "next/navigation";

// docs/06-ROUTES-AND-SCREENS.md section 1: "/" is an unconditional server redirect to
// /dashboard. Auth is client-only (ADR-004), so this never branches on session state -
// (admin)/layout.tsx's AuthGuard is what sends an unauthenticated visitor on to /login.
export default function Home() {
  redirect("/dashboard");
}
