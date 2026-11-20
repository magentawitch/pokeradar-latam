"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { IconRubberStamp } from "@tabler/icons-react";
import { HankoBadge } from "@/components/StampBook/HankoBadge";
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
import {
  useBookOpenedAt,
  useDiscoveries,
  useOnDiscoveryRecorded,
} from "@/hooks/useDiscoveries";
import { useSwipe } from "@/hooks/useSwipe";
import {
  freshCountsByHabitat,
  freshStampIds,
  planStamping,
  stampHabitat,
  stampSections,
} from "@/lib/discovery/derive";
import { writeBookOpenedAt } from "@/lib/discovery/store";
import type { HabitatName } from "@/lib/pokeapi/schemas";
import { openAfterOutsideDismiss } from "@/utils/dialogHelpers";
import type { BiomeRoster } from "@/lib/biomes/types";

/** How long after a card opens the pill reacts to its new stamp. */
const PILL_FEEDBACK_DELAY_MS = 500;

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
 * earned since the last opening, and presses those in one after another;
 * other pages with new stamps get a small hanko until visited.
 *
 * The pill gives the feedback, half a second after the card opens: its icon
 * thumps like a rubber stamp and the count pops in the habitat's ink, and a
 * hanko badge counts the new stamps until the book is opened.
 */
export function StampBook({ roster }: StampBookProps) {
  const discoveries = useDiscoveries();
  const bookOpenedAt = useBookOpenedAt();
  const sections = useMemo(
    () => stampSections(roster, discoveries),
    [roster, discoveries],
  );
  const freshIds = useMemo(
    () => freshStampIds(discoveries, bookOpenedAt),
    [discoveries, bookOpenedAt],
  );
  const total = sections.reduce((sum, section) => sum + section.total, 0);
  const [pageIndex, setPageIndex] = useState(0);
  // Pages with new stamps not yet visited in this opening → how many.
  const [unseenHabitats, setUnseenHabitats] = useState<
    ReadonlyMap<HabitatName, number>
  >(() => new Map());
  // Bumped on each discovery, to restart the pill's CSS animations.
  const [press, setPress] = useState<{
    count: number;
    habitat: HabitatName | null;
  }>({ count: 0, habitat: null });
  // Discoveries the pill doesn't show yet: the card opens first, then the
  // pill counts the stamp, raises the badge and plays the press all at once.
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const pendingTimers = useRef(new Set<number>());

  useOnDiscoveryRecorded((id) => {
    const habitat = stampHabitat(sections, id);
    setPendingIds((current) => new Set(current).add(id));
    const timer = window.setTimeout(() => {
      pendingTimers.current.delete(timer);
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setPress((current) => ({ count: current.count + 1, habitat }));
    }, PILL_FEEDBACK_DELAY_MS);
    pendingTimers.current.add(timer);
  });

  useEffect(() => {
    const timers = pendingTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const shownCount =
    discoveries.size -
    [...pendingIds].filter((id) => discoveries.has(id)).length;
  const shownFreshCount =
    freshIds.size - [...pendingIds].filter((id) => freshIds.has(id)).length;
  const [stampDelays, setStampDelays] = useState<ReadonlyMap<number, number>>(
    () => new Map(),
  );
  const [sealDelays, setSealDelays] = useState<
    ReadonlyMap<HabitatName, number>
  >(() => new Map());
  const pageScrollRef = useRef<HTMLDivElement>(null);
  // The pill sits above the overlay (its top-right container is z-60) and
  // stays clickable while any dialog is open, so one click switches from the
  // card or guide to the book.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeSection = sections[pageIndex] ?? sections[0];

  const turnTo = (nextIndex: number) => {
    const section = sections[nextIndex];
    if (!section) return;
    setPageIndex(nextIndex);
    setUnseenHabitats((current) => {
      if (!current.has(section.habitat)) return current;
      const next = new Map(current);
      next.delete(section.habitat);
      return next;
    });
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => turnTo(pageIndex + 1),
    onSwipeRight: () => turnTo(pageIndex - 1),
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) return;
    const plan = planStamping(sections, freshIds);
    const unseen = freshCountsByHabitat(sections, freshIds);
    setStampDelays(plan.delays);
    setSealDelays(plan.sealDelays);
    if (plan.firstPageIndex !== null) {
      setPageIndex(plan.firstPageIndex);
      const firstHabitat = sections[plan.firstPageIndex]?.habitat;
      if (firstHabitat) unseen.delete(firstHabitat);
    }
    setUnseenHabitats(unseen);
    // Also clears the pill's badge.
    writeBookOpenedAt();
  };

  const handleStamped = useCallback((id: number) => {
    setStampDelays((current) => {
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);

  const handleSealed = useCallback((habitat: HabitatName) => {
    setSealDelays((current) => {
      const next = new Map(current);
      next.delete(habitat);
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
          className="h-10 gap-2 rounded-full bg-card/95 px-3.5 shadow-sm"
        >
          {/* Keyed by the press count, so each discovery restarts the
              animations; nothing animates before the first one. */}
          <span
            key={`icon-${press.count}`}
            className={
              press.count > 0
                ? "flex origin-bottom animate-pill-stamp motion-reduce:animate-none"
                : "flex"
            }
          >
            <IconRubberStamp className="size-5 text-ink-brown" />
          </span>
          <span className="font-display text-lg font-semibold text-ink">
            Sellos
          </span>
          <span
            key={`count-${press.count}`}
            data-habitat={press.habitat ?? undefined}
            className={
              press.count > 0 && press.habitat
                ? "inline-block animate-count-pop font-mono text-xs text-ink-muted motion-reduce:animate-none"
                : "inline-block font-mono text-xs text-ink-muted"
            }
          >
            {shownCount}/{total}
          </span>
          {shownFreshCount > 0 && (
            <>
              {/* Pressed on again with each new stamp. */}
              <HankoBadge
                key={`hanko-${shownFreshCount}`}
                count={shownFreshCount}
              />
              <span className="sr-only">
                {" "}
                · {shownFreshCount}{" "}
                {shownFreshCount === 1 ? "sello nuevo" : "sellos nuevos"}
              </span>
            </>
          )}
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
          unseenHabitats={unseenHabitats}
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
            className="hidden w-full px-4 book:flex"
          >
            {sections.map((section) => {
              const newCount = unseenHabitats.get(section.habitat) ?? 0;
              const isComplete = section.completedAt !== null;
              return (
                <TabsTrigger
                  key={section.habitat}
                  value={section.habitat}
                  data-habitat={section.habitat}
                  data-complete={isComplete || undefined}
                  className="flex-col items-center gap-0 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:rounded-t-md before:bg-(--habitat-ink) data-complete:before:bg-linear-to-r data-complete:before:from-gold-dark data-complete:before:via-gold-light data-complete:before:to-gold-mid group-data-[variant=divider]/tabs-list:flex-auto group-data-[variant=divider]/tabs-list:px-2.5 group-data-[variant=divider]/tabs-list:tracking-wider"
                >
                  <span>{section.tabLabel}</span>
                  <span className="text-[0.65rem] tracking-normal">
                    {section.collected}/{section.total}
                    {isComplete && <span className="sr-only"> · completa</span>}
                  </span>
                  {newCount > 0 && (
                    <>
                      <HankoBadge count={newCount} size="sm" />
                      <span className="sr-only">
                        {" "}
                        · {newCount}{" "}
                        {newCount === 1 ? "sello nuevo" : "sellos nuevos"}
                      </span>
                    </>
                  )}
                </TabsTrigger>
              );
            })}
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
                  sealDelay={sealDelays.get(section.habitat) ?? null}
                  onSealed={handleSealed}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
