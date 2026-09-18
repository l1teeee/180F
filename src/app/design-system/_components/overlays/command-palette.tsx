"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, CornerDownLeft, Dumbbell, Search } from "lucide-react";
import { OverlayButton, overlayCardClassName } from "./overlay-chrome";
import { Stage } from "./stage";
import { useOverlayDialog } from "./use-overlay-dialog";

interface PaletteResult {
  id: string;
  group: "Customers" | "Classes" | "Instructors";
  label: string;
  /** Customers/Instructors render as a pastel initials avatar instead of the Dumbbell icon. */
  initials?: string;
}

const RESULTS: PaletteResult[] = [
  { id: "customer-04", group: "Customers", label: "Customer 04", initials: "04" },
  { id: "customer-07", group: "Customers", label: "Customer 07", initials: "07" },
  { id: "customer-11", group: "Customers", label: "Customer 11", initials: "11" },
  { id: "class-power-yoga", group: "Classes", label: "Power Yoga" },
  { id: "class-hiit", group: "Classes", label: "HIIT Circuit" },
  { id: "class-functional", group: "Classes", label: "Functional Training" },
  { id: "instructor-02", group: "Instructors", label: "Instructor 02", initials: "02" },
  { id: "instructor-05", group: "Instructors", label: "Instructor 05", initials: "05" },
];
const GROUPS = ["Customers", "Classes", "Instructors"] as const;

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-chip border border-border bg-surface-muted px-1.5 text-xs font-semibold text-text-secondary">
      {children}
    </span>
  );
}

interface CommandPaletteCardProps {
  titleId?: string;
  onClose?: () => void;
}

// Pattern E, "Command palette" (docs/03 11.4-E) - an ARIA 1.2 combobox-with-listbox: the input
// carries role=combobox + aria-activedescendant, a sibling role=listbox holds the grouped
// options. Static and live share this one component; only `inert` (on the static Stage) stops
// the keyboard handlers below from ever actually firing in that context.
function CommandPaletteCard({ titleId, onClose }: CommandPaletteCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const idPrefix = useId();
  const inputId = `${idPrefix}-input`;
  const listboxId = `${idPrefix}-listbox`;
  const activeOptionId = `${idPrefix}-option-${RESULTS[activeIndex].id}`;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % RESULTS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + RESULTS.length) % RESULTS.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      onClose?.();
    }
    // Escape is left alone so it bubbles to the <dialog>, which closes it natively.
  }

  return (
    <div className={overlayCardClassName("palette")}>
      {/* The palette has no visible title bar (docs/03 11.4-E shows just the search row), so the
          accessible name is visually hidden rather than absent. */}
      <h3 id={titleId} className="sr-only">
        Search
      </h3>
      <div className="flex-none border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-text-tertiary" />
          {/* No border/focus ring on the input itself - the container carries the focus state
              (docs/03 11.4-E), which is what the always-visible modal chrome already provides.
              focus-visible:shadow-none opts this one field out of the global text-field halo
              (globals.css section 5 rule): this input has no border-radius of its own, so that
              halo would render as the hard-edged square ring section 12.6 exists to prevent. */}
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            autoFocus
            autoComplete="off"
            placeholder="Search customers, classes..."
            onKeyDown={handleKeyDown}
            className="h-8 flex-1 border-0 bg-transparent text-sm text-ink placeholder:text-text-tertiary focus:outline-none focus-visible:shadow-none"
          />
        </div>
      </div>
      <div id={listboxId} role="listbox" aria-label="Search results" className="flex-1 overflow-y-auto px-2 py-2">
        {GROUPS.map((group) => {
          const groupResults = RESULTS.filter((result) => result.group === group);
          return (
            <div key={group} role="group" aria-label={group} className="flex flex-col gap-0.5 py-1.5">
              <span className="px-2.5 pb-1 text-xs font-semibold tracking-[0.04em] text-text-secondary uppercase">
                {group}
              </span>
              {groupResults.map((result) => {
                const index = RESULTS.indexOf(result);
                const isActive = index === activeIndex;
                return (
                  <div
                    key={result.id}
                    id={`${idPrefix}-option-${result.id}`}
                    role="option"
                    aria-selected={isActive}
                    className={`flex h-10 items-center gap-2.5 rounded-field px-2.5 text-sm font-medium text-ink ${
                      isActive ? "bg-purple-xsoft" : ""
                    }`}
                  >
                    {result.initials ? (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-blue-soft text-xs font-semibold text-blue-text tabular-nums">
                        {result.initials}
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-surface-muted text-text-secondary">
                        <Dumbbell aria-hidden="true" className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {result.label}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="flex flex-none items-center gap-4 border-t border-border px-4 py-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Kbd>
            <ArrowUp aria-hidden="true" className="h-3 w-3" />
          </Kbd>
          <Kbd>
            <ArrowDown aria-hidden="true" className="h-3 w-3" />
          </Kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>
            <CornerDownLeft aria-hidden="true" className="h-3 w-3" />
          </Kbd>
          Select
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          Close
        </span>
      </div>
    </div>
  );
}

export function CommandPaletteSpecimen() {
  return (
    <Stage label="Command palette (560px, 12vh from top)" className="h-[420px] rounded-card-sm border border-border-soft">
      <div className="absolute inset-x-0 top-[10%] z-10 mx-auto w-[560px] max-w-[calc(100%-1.5rem)]">
        <CommandPaletteCard />
      </div>
    </Stage>
  );
}

export function CommandPaletteLive() {
  const [instanceKey, setInstanceKey] = useState(0);
  const titleId = useId();
  const { dialogRef, open, close, handleNativeClose, handleScrimClick } = useOverlayDialog({
    // A fresh mount resets the active row to the top result the next time the palette opens.
    onClose: () => setInstanceKey((key) => key + 1),
  });

  return (
    <>
      <OverlayButton variant="primary" onClick={open}>
        Open command palette
      </OverlayButton>
      <dialog
        ref={dialogRef}
        onClose={handleNativeClose}
        onClick={handleScrimClick}
        closedby="any"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="overlay-surface fixed inset-x-0 top-[12vh] m-0 mx-auto h-auto w-[560px] max-w-[calc(100vw-1.5rem)] border-0 bg-transparent p-0"
      >
        <CommandPaletteCard key={instanceKey} titleId={titleId} onClose={close} />
      </dialog>
    </>
  );
}
