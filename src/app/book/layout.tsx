import { BookingShell } from "@/components/booking/booking-shell"

export default function BookLayout({ children }: LayoutProps<"/book">) {
  return <BookingShell>{children}</BookingShell>
}
