import { redirect } from "next/navigation";

// Temporary: redirects to the design-system preview because /dashboard does not exist until Phase 2D.
export default function Home() {
  redirect("/design-system");
}
