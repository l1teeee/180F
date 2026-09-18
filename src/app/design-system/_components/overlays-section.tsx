import type { ReactNode } from "react";
import { SectionShell } from "./section-shell";
import { BookingDialogLive, BookingDialogSpecimens } from "./overlays/booking-dialog";
import { ConfirmDialogLive, ConfirmDialogSpecimen } from "./overlays/confirm-dialog";
import { SessionSheetLive, SessionSheetSpecimen } from "./overlays/session-details-sheet";
import { BottomSheetLive, BottomSheetSpecimen } from "./overlays/bottom-sheet";
import { CommandPaletteLive, CommandPaletteSpecimen } from "./overlays/command-palette";
import { MessagePreviewLive, MessagePreviewSpecimen } from "./overlays/message-preview-dialog";

const SIZE_SCALE: { size: string; width: string; usedBy: string }[] = [
  { size: "sm", width: "420px", usedBy: "Confirmations, single-field edits" },
  { size: "md", width: "520px", usedBy: "Forms with up to six fields" },
  { size: "lg", width: "680px", usedBy: "Message previews, anything with a preview pane" },
  { size: "sheet", width: "420px, right-anchored", usedBy: "Session details" },
  { size: "palette", width: "560px, 12vh from top", usedBy: "Global search" },
];

function SizeBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-pill bg-surface-muted px-2.5 text-xs font-semibold text-text-secondary">
      {children}
    </span>
  );
}

function PatternBlock({
  letter,
  name,
  size,
  children,
}: {
  letter: string;
  name: string;
  size: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-card-sm border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-pill bg-ink text-xs font-bold text-white"
        >
          {letter}
        </span>
        <h3 className="text-[15px] font-semibold text-ink">{name}</h3>
        <SizeBadge>{size}</SizeBadge>
      </div>
      {children}
    </div>
  );
}

function SpecimenAndLive({ specimen, live }: { specimen: ReactNode; live: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">Static specimen</span>
        {specimen}
      </div>
      {/* items-start: the trigger button is an inline-flex sized to its own content, but a plain
          flex-col parent stretches children to its full width by default. */}
      <div className="flex flex-col items-start gap-2">
        <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">Live trigger</span>
        {live}
      </div>
    </div>
  );
}

// docs/03 section 11 "Overlays" - the whole spec rendered as one page. Each pattern shows a
// static specimen (a picture of the composition, inert to AT and the keyboard) next to a live
// trigger (the real thing, built on the native <dialog>) so the client can see exactly how every
// modal surface in the product will look and behave before any of them touch real data.
export function OverlaysSection() {
  return (
    <SectionShell
      index={11}
      title="Overlays"
      description="Dialogs, sheets and the command palette - one container language, six patterns."
    >
      <div className="flex flex-col gap-6">
        <PatternBlock letter="A" name="Form dialog" size="md - 520px">
          <SpecimenAndLive specimen={<BookingDialogSpecimens />} live={<BookingDialogLive />} />
        </PatternBlock>

        <PatternBlock letter="B" name="Confirm dialog" size="sm - 420px, destructive">
          <SpecimenAndLive specimen={<ConfirmDialogSpecimen />} live={<ConfirmDialogLive />} />
        </PatternBlock>

        <PatternBlock letter="C" name="Side sheet" size="sheet - 420px, right">
          <SpecimenAndLive specimen={<SessionSheetSpecimen />} live={<SessionSheetLive />} />
        </PatternBlock>

        <PatternBlock letter="D" name="Bottom sheet" size="mobile form of A">
          <SpecimenAndLive specimen={<BottomSheetSpecimen />} live={<BottomSheetLive />} />
        </PatternBlock>

        <PatternBlock letter="E" name="Command palette" size="palette - 560px">
          <SpecimenAndLive specimen={<CommandPaletteSpecimen />} live={<CommandPaletteLive />} />
        </PatternBlock>

        <PatternBlock letter="F" name="Message preview" size="lg - 680px">
          <SpecimenAndLive specimen={<MessagePreviewSpecimen />} live={<MessagePreviewLive />} />
        </PatternBlock>

        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">Size scale</span>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="h-10 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                    Size
                  </th>
                  <th scope="col" className="h-10 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                    Width
                  </th>
                  <th scope="col" className="h-10 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                    Used by
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SIZE_SCALE.map((row) => (
                  <tr key={row.size}>
                    <td className="h-11 px-3 text-sm font-semibold text-ink">{row.size}</td>
                    <td className="h-11 px-3 text-sm text-text-secondary tabular-nums">{row.width}</td>
                    <td className="h-11 px-3 text-sm text-text-secondary">{row.usedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-text-secondary">
            Accessibility contract (docs/03 11.6): every overlay traps focus while open, closes on Esc and returns
            focus to its trigger, with background scroll locked throughout - the confirm dialog always focuses the
            safe action first, never the destructive one.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
