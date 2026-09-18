'use client';

// docs/03-DESIGN-SYSTEM.md section 11.4-E "Command palette" + docs/06 section 4.2 "Global
// search". Built directly on the lower-level Dialog/Command primitives rather than the
// ui/command.tsx CommandDialog helper, because this needs shouldFilter={false} on the inner
// <Command> (results are already ranked by useGlobalSearch/selectGlobalSearch, so cmdk's own
// fuzzy filter must not run a second time over them) and CommandDialog has no way to pass that
// through to its inner Command.
//
// Deviation from docs/03 11.4-E: "empty query shows recent entities" is not implemented - no
// store tracks recently-viewed entities (useUiStore/useDemoRuntimeStore do not, and
// src/stores/** is read-only for this task), so an empty query shows a neutral prompt instead.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, GraduationCap, Users, type LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useGlobalSearch } from '@/hooks/use-global-search';
import { useMessages } from '@/hooks/use-messages';
import type { SearchResult } from '@/domain/types';
import { useUiStore } from '@/stores/ui.store';

const GROUP_ICON: Record<SearchResult['kind'], LucideIcon> = {
  customer: Users,
  class: Dumbbell,
  instructor: GraduationCap,
};
const GROUP_ORDER: SearchResult['kind'][] = ['customer', 'class', 'instructor'];

export function GlobalSearch() {
  const m = useMessages();
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const results = useGlobalSearch(query);

  // Cmd/Ctrl+K opens (and toggles) the palette from anywhere inside the admin shell.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Clear the query on close, during render rather than in an effect (same "adjusting state
  // when a prop changes" pattern as DataTable's page reset) so a re-open never flashes the
  // previous search text.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setQuery('');
  }

  function handleSelect(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

  const trimmed = query.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="sr-only">
        <DialogTitle>{m.layout.searchTitle}</DialogTitle>
        <DialogDescription>{m.layout.searchDescription}</DialogDescription>
      </DialogHeader>
      <DialogContent size="palette" position="top" showCloseButton={false} className="overflow-hidden p-0">
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group-heading]]:uppercase"
        >
          <CommandInput value={query} onValueChange={setQuery} placeholder={m.common.searchPlaceholder} />
          <CommandList>
            {trimmed === '' ? (
              <CommandEmpty>{m.layout.searchEmptyPrompt}</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>{m.layout.searchNoResults(trimmed)}</CommandEmpty>
            ) : (
              GROUP_ORDER.map((kind) => {
                const groupResults = results.filter((result) => result.kind === kind);
                if (groupResults.length === 0) return null;
                const Icon = GROUP_ICON[kind];
                return (
                  <CommandGroup key={kind} heading={m.layout.searchGroupLabels[kind]}>
                    {groupResults.map((result) => (
                      <CommandItem
                        key={`${result.kind}-${result.id}`}
                        value={`${result.kind}-${result.id}`}
                        onSelect={() => handleSelect(result)}
                      >
                        <Icon aria-hidden="true" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{result.label}</span>
                          <span className="truncate text-xs text-text-secondary">{result.sublabel}</span>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
