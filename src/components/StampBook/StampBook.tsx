"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { IconRubberStamp } from "@tabler/icons-react";
import { StampPage } from "@/components/StampBook/StampPage";
import { StampMobilePager } from "@/components/StampBook/StampMobilePager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useSwipe } from "@/hooks/useSwipe";
import {
  freshStampIds,
  planStamping,
  stampSections,
} from "@/lib/discovery/derive";
import { readBookOpenedAt, writeBookOpenedAt } from "@/lib/discovery/store";
import { openAfterOutsideDismiss } from "@/utils/dialogHelpers";
import type { BiomeRoster } from "@/lib/biomes/types";

interface StampBookProps {
  roster: BiomeRoster;
}

/**
 * The stamp book: every Pokémon discovered leaves a stamp, one page per
 * habitat. From `book:`, folder tabs like the guide's (each with a top edge in
 * its habitat's ink) sit on the page; on phones a title with arrows and a row
 * of ink dots replace them, and a swipe changes the page. ←/→ work everywhere. Opens
 * from a pill in the top-right corner (opposite the guide); Radix closes it on
 * Esc and returns focus to the pill. It opens on the first page with stamps
 * earned since the last opening, and presses those in one after another.
 */
export function StampBook({ roster }: StampBookProps) {
  const discoveries = useDiscoveries();
  const sections = useMemo(
    () => stampSections(roster, discoveries),
    [roster, discoveries],
  );
  const total = sections.reduce((sum, section) => sum + section.total, 0);
  const [pageIndex, setPageIndex] = useState(0);
  const [stampDelays, setStampDelays] = useState<ReadonlyMap<number, number>>(
    () => new Map(),
  );
  const pageScrollRef = useRef<HTMLDivElement>(null);
  // The pill sits above the overlay (z-60) and stays clickable while any
  // dialog is open, so one click switches from the card or guide to the book.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeSection = sections[pageIndex] ?? sections[0];

  const turnTo = (nextIndex: number) => {
    if (nextIndex >= 0 && nextIndex < sections.length) setPageIndex(nextIndex);
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => turnTo(pageIndex + 1),
    onSwipeRight: () => turnTo(pageIndex - 1),
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) return;
    const plan = planStamping(
      sections,
      freshStampIds(discoveries, readBookOpenedAt()),
    );
    setStampDelays(plan.delays);
    if (plan.firstPageIndex !== null) setPageIndex(plan.firstPageIndex);
    writeBookOpenedAt();
  };

  const handleStamped = useCallback((id: number) => {
    setStampDelays((current) => {
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);

  // The tab list handles its own arrows (Radix); elsewhere in the book,
  // ←/→ change the page.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    if (
      event.target instanceof Element &&
      event.target.closest('[role="tablist"]')
    )
      return;
    if (event.key === "ArrowLeft") turnTo(pageIndex - 1);
    if (event.key === "ArrowRight") turnTo(pageIndex + 1);
  };

  // A new page starts at its top.
  useEffect(() => {
    pageScrollRef.current?.scrollTo({ top: 0 });
  }, [pageIndex]);

  if (!activeSection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={(event) =>
            openAfterOutsideDismiss(event, isOpen, handleOpenChange)
          }
          variant="outline"
          size="lg"
          ref={triggerRef}
          className="pointer-events-auto absolute top-4 right-4 z-60 h-10 gap-2 rounded-full bg-card/95 px-3.5 shadow-sm md:top-6 md:right-6"
        >
          <IconRubberStamp className="size-5 text-ink-brown" />
          <span className="font-display text-lg font-semibold text-ink">
            Sellos
          </span>
          <span className="font-mono text-xs text-ink-muted">
            {discoveries.size}/{total}
          </span>
          <span className="sr-only"> · abrir el libro de sellos</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        onKeyDown={handleKeyDown}
        // A press on the pill itself shouldn't dismiss first: its click then
        // toggles the book closed instead of closing and reopening it.
        onPointerDownOutside={(event) => {
          if (
            event.target instanceof Node &&
            triggerRef.current?.contains(event.target)
          )
            event.preventDefault();
        }}
        className="top-auto right-4 bottom-3 left-4 flex h-[min(85dvh,44rem)] w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 bg-card p-0 sm:max-w-none book:top-1/2 book:right-auto book:bottom-auto book:left-1/2 book:h-[min(85dvh,46rem)] book:w-[calc(100%-2rem)] book:max-w-3xl book:-translate-x-1/2 book:-translate-y-1/2"
      >
        <DialogHeader className="gap-1 px-5 pt-5 pb-3 book:pb-4">
          <DialogTitle className="pr-8 font-display text-2xl font-semibold text-ink book:text-3xl">
            Libro de sellos
          </DialogTitle>
          <DialogDescription className="text-ink-muted">
            {discoveries.size} de {total} sellos. ¡Sellalos a todos!
          </DialogDescription>
        </DialogHeader>

        <StampMobilePager
          sections={sections}
          pageIndex={pageIndex}
          onPageChange={turnTo}
        />

        <Tabs
          value={activeSection.habitat}
          onValueChange={(habitat) =>
            turnTo(sections.findIndex((section) => section.habitat === habitat))
          }
          className="min-h-0 flex-1 gap-0"
        >
          {/* The guide's folder tabs: beige when inactive, the page's paper
              when active (joining the page), each topped with its habitat's
              pastel ring colour. */}
          <TabsList
            variant="divider"
            loop={false}
            aria-label="Hábitats"
            className="hidden pl-4 book:inline-flex"
          >
            {sections.map((section) => (
              <TabsTrigger
                key={section.habitat}
                value={section.habitat}
                data-habitat={section.habitat}
                className="flex-col items-center gap-0 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:rounded-t-md before:bg-(--habitat-ink) group-data-[variant=divider]/tabs-list:px-2.5 group-data-[variant=divider]/tabs-list:tracking-wider"
              >
                <span>{section.tabLabel}</span>
                <span className="text-[0.65rem] tracking-normal">
                  {section.collected}/{section.total}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div
            ref={pageScrollRef}
            {...swipeHandlers}
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto book:border-t book:border-border"
          >
            {sections.map((section) => (
              <TabsContent
                key={section.habitat}
                value={section.habitat}
                className="px-5 py-4"
              >
                <StampPage
                  section={section}
                  stampDelays={stampDelays}
                  onStamped={handleStamped}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
