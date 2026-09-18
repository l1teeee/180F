"use client"

import { useEffect, useState } from "react"
import { CalendarPlus, CircleCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/cn"
import type { Booking, ClassType, SessionWithOccupancy } from "@/domain/types"
import { formatDisplayDate, formatDisplayTime } from "@/lib/dates"
import { escapeIcsText, foldIcsLine, formatIcsUtcTimestamp } from "@/lib/ics"
import { useSettingsStore } from "@/stores/settings.store"

// RFC 5545 section 3.2.19: DTSTART/DTEND carry the studio's own IANA zone (Settings ->
// general.timezone) via TZID rather than a bare local time (which a calendar app would import
// in the *viewer's* zone instead - wrong for anyone not in Bogota) or a UTC "Z" time (which
// would shift the wall-clock hour shown). No VTIMEZONE block is embedded: every mainstream
// calendar client (Google/Outlook/Apple) resolves a TZID against its own copy of the IANA tz
// database whenever the identifier matches a known Olson name, which every studio timezone in
// this app always is (docs/04-DOMAIN-MODEL.md), so hand-authoring one here would only
// duplicate that database's DST rules for no interoperability gain in a frontend-only demo.
function buildCalendarFileUrl(
  booking: Booking,
  classType: ClassType,
  session: SessionWithOccupancy,
  address: string | undefined,
  timezone: string,
): string {
  const start = `${session.date.replaceAll("-", "")}T${session.startTime.replace(":", "")}00`
  const end = `${session.date.replaceAll("-", "")}T${session.endTime.replace(":", "")}00`
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//180 Fitness Studio//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@180fitness.demo`,
    `DTSTAMP:${formatIcsUtcTimestamp(booking.createdAt)}`,
    `DTSTART;TZID=${timezone}:${start}`,
    `DTEND;TZID=${timezone}:${end}`,
    `SUMMARY:${escapeIcsText(`${classType.name} at 180 Fitness Studio`)}`,
    address ? `LOCATION:${escapeIcsText(address)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((line): line is string => line != null)
    .map(foldIcsLine)
  return URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }))
}

// Master plan section 39, literal: heading, message (explicitly marked simulated - the same
// "Simulated" pill convention docs/03 section 11.4-F uses for the WhatsApp preview dialog),
// class/date/time/location, three buttons. docs/06 section 3.15: composed entirely from what
// steps 1-3 already resolved (the `classType`/`session` props), never a fresh store read.
export function BookingSuccess({
  booking,
  classType,
  session,
  onBookAnother,
}: {
  booking: Booking
  classType: ClassType
  session: SessionWithOccupancy
  onBookAnother: () => void
}) {
  const address = useSettingsStore((state) => state.settings?.general.address)
  const timezone = useSettingsStore((state) => state.settings?.general.timezone)
  const [entered, setEntered] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // The one entrance in the app allowed to use --ease-emphasis (docs/03 section 12.1: "the
  // success check on the booking confirmation, and the switch knob"). No matching globals.css
  // utility exists for this one spot, so it's built from existing theme-token utility classes
  // only (ease-emphasis, duration-slow, scale-*, opacity-*) - never a bespoke @keyframes
  // (section 12.5) - and, per section 12.4's own pattern for JS-driven animation (NumberRoll/
  // BarFill), starts already in its end state under prefers-reduced-motion instead of animating.
  useEffect(() => {
    if (entered) return
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [entered])

  function handleAddToCalendar() {
    // Settings finish hydrating before this screen is reachable at all (createPublicBooking
    // requires them - see requireSettings() in booking.store.ts), so this can't actually be
    // undefined; the check just satisfies strict mode rather than masking a real gap.
    if (!timezone) throw new Error("Add to calendar: studio timezone was not loaded.")
    const url = buildCalendarFileUrl(booking, classType, session, address, timezone)
    const link = document.createElement("a")
    link.href = url
    link.download = `${classType.name.toLowerCase().replace(/\s+/g, "-")}-booking.ics`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-pill bg-purple-deep text-white transition-[transform,opacity] duration-[var(--duration-slow)] ease-emphasis",
          entered ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
      >
        <CircleCheck className="size-9" aria-hidden="true" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1 tabIndex={-1} className="text-[22px] font-bold tracking-tight text-ink outline-none">
          Your class is booked!
        </h1>
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-text-secondary">
          <span>Your confirmation has been sent by WhatsApp.</span>
          <Badge variant="neutralBrand">Simulated</Badge>
        </p>
      </div>

      <Card className="w-full gap-3 text-left">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">Class</span>
          <span className="text-[15px] font-semibold text-ink">{classType.name}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">Date</span>
          <span className="text-[15px] font-semibold text-ink">{formatDisplayDate(session.date)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">Time</span>
          <span className="text-[15px] font-semibold text-ink">{formatDisplayTime(session.startTime)}</span>
        </div>
        {address && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-secondary">Location</span>
            <span className="text-[15px] font-semibold text-ink">{address}</span>
          </div>
        )}
        {detailsOpen && (
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-text-secondary">Booking ID</span>
              <span className="text-sm font-semibold text-ink">{booking.id}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-text-secondary">Status</span>
              <Badge variant="positive">Confirmed</Badge>
            </div>
          </div>
        )}
      </Card>

      <div className="flex w-full flex-col gap-2.5">
        <Button type="button" variant="secondary" className="w-full" onClick={handleAddToCalendar}>
          <CalendarPlus className="size-4" aria-hidden="true" />
          Add to calendar
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((open) => !open)}
        >
          {detailsOpen ? "Hide booking" : "View booking"}
        </Button>
        <Button type="button" variant="ink" className="w-full" onClick={onBookAnother}>
          Book another class
        </Button>
      </div>
    </div>
  )
}
