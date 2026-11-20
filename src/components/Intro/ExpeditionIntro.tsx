"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconPlayerTrackNext } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ExplorerCard } from "@/components/Intro/ExplorerCard";
import { InsideCover } from "@/components/Intro/InsideCover";
import { JournalCover, coverTimings } from "@/components/Intro/JournalCover";
import { WelcomeBackPage } from "@/components/Intro/WelcomeBackPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExplorer } from "@/hooks/useExplorer";
import { AVATARS, type AvatarId } from "@/lib/explorer/store";

/** closed → opening (band + cover) → card → stamping; leaving is separate. */
type IntroPhase = "closed" | "opening" | "card" | "stamping";

/** How long the landed stamp stays before the journal fades to the map. */
const STAMP_HOLD_MS = 700;

const STAMP_DATE_FORMAT = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface ExpeditionIntroProps {
  onFinish: () => void;
}

/**
 * The field-journal intro over the map: a closed notebook that opens onto
 * the explorer ID card. On desktop the cover stays open as the spread's left
 * page and the journal slides right so the spread ends up centred; on phones
 * the cover swings off-screen and a leather spine stays on the page's edge.
 * A returning explorer sees the cover open by itself (under a second; any
 * click or Esc cuts it short). Esc or "Saltar intro" always goes straight to
 * the map without saving anything.
 *
 * A full-screen Radix dialog provides the focus trap, Esc and hiding the map
 * from assistive tech. It uses the bare primitive Content, not shadcn's
 * DialogContent, so no default open/close animation fights the cover.
 */
export function ExpeditionIntro({ onFinish }: ExpeditionIntroProps) {
  const { status, explorer, saveExplorer } = useExplorer();
  const reduceMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<IntroPhase>("closed");
  const [isLeaving, setIsLeaving] = useState(false);
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId>(AVATARS[0].id);
  const [stamp, setStamp] = useState<{ date: string; rotation: number }>();
  const coverRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Saved before the intro started: the cover opens by itself. (Saving on
  // the card moves past "closed", so it never turns this on mid-intro.)
  const isReturning = status === "saved" && phase === "closed";

  const leave = useCallback(() => setIsLeaving(true), []);

  // With reduced motion a returning explorer skips the intro entirely.
  useEffect(() => {
    if (isReturning && reduceMotion) onFinish();
  }, [isReturning, reduceMotion, onFinish]);

  // The card takes focus as soon as the cover has opened.
  useEffect(() => {
    if (phase === "card") nameInputRef.current?.focus();
  }, [phase]);

  const handleCoverOpened = () => {
    if (isReturning) leave();
    else setPhase("card");
  };

  const handleSubmit = () => {
    saveExplorer(name, avatarId);
    setStamp({
      date: STAMP_DATE_FORMAT.format(new Date()),
      rotation: Math.random() * 16 - 8,
    });
    setPhase("stamping");
  };

  // The landed stamp holds for a moment, then the journal fades out. An
  // effect owns the timer, so leaving early (Esc) or unmounting cancels it.
  const [hasStampLanded, setHasStampLanded] = useState(false);
  const handleStampLanded = () => setHasStampLanded(true);
  useEffect(() => {
    if (!hasStampLanded) return;
    const timer = window.setTimeout(leave, STAMP_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [hasStampLanded, leave]);

  // Server render and hydration: a plain paper sheet, so the map never
  // flashes before we know whether this explorer is new.
  if (status === "unknown") {
    return <div aria-hidden="true" className="fixed inset-0 z-80 bg-paper" />;
  }

  const isCoverShown = phase === "closed" || phase === "opening";
  const isCoverOpening = phase === "opening" || isReturning;
  // Once the cover has turned, a static copy of its inside replaces it.
  const isOpen = phase === "card" || phase === "stamping";
  const { bandDuration, turnDuration } = coverTimings(isReturning);
  const insideName = isReturning && explorer ? explorer.name : name;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) leave();
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Content
          asChild
          // Focus the dialog itself, not the cover: a focus ring around the
          // closed book on load reads as a frame. Tab reaches "Saltar intro",
          // then the cover.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contentRef.current?.focus();
          }}
          // Only Esc and "Saltar intro" close it, never a click or a focus
          // change outside.
          onInteractOutside={(event) => event.preventDefault()}
        >
          <motion.div
            ref={contentRef}
            initial={false}
            animate={{ opacity: isLeaving ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => {
              if (isLeaving) onFinish();
            }}
            onPointerDown={() => {
              if (isReturning) leave();
            }}
            className="fixed inset-0 z-80 flex flex-col items-center overflow-hidden bg-paper px-3 pt-3 pb-6 outline-none md:px-6 md:pt-6"
          >
            <div
              aria-hidden="true"
              className="graph-paper pointer-events-none absolute inset-0"
            />
            <DialogTitle className="sr-only">Diario de expedición</DialogTitle>
            <DialogDescription className="sr-only">
              Abrí el diario y completá tu credencial de explorador/a, o saltá
              la intro para ir directo al mapa.
            </DialogDescription>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={leave}
              className="relative z-10 h-10 gap-2 self-end rounded-full bg-card px-4 font-semibold text-ink shadow-sm"
            >
              Saltar intro
              <IconPlayerTrackNext className="size-4 text-ink-brown" />
            </Button>

            <div className="flex w-full flex-1 items-center justify-center py-3">
              {/* The journal, lying a little askew on the desk; it straightens
                  as it opens. On desktop it slides right by half its width as
                  the cover turns, so the open spread ends up centred. */}
              <div
                data-open={isCoverOpening || isOpen}
                style={{
                  transitionDelay: `${bandDuration}s`,
                  transitionDuration: `${turnDuration}s`,
                }}
                className="relative h-[min(38rem,calc(100dvh-7rem))] w-full max-w-[34rem] -rotate-[1.5deg] transition-[translate,rotate] ease-[cubic-bezier(0.65,0,0.35,1)] [perspective:1500px] motion-reduce:transition-none data-[open=true]:rotate-0 md:h-[min(36rem,calc(100dvh-8rem))] md:w-[min(30rem,calc(50vw-2.5rem))] md:data-[open=true]:translate-x-1/2"
              >
                {/* The open cover, as the spread's left page (desktop). */}
                {isOpen && (
                  <motion.div
                    initial={reduceMotion ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-y-0 right-full hidden w-full md:block"
                  >
                    <InsideCover name={insideName} />
                  </motion.div>
                )}
                {/* Phones: the cover is off-screen; its spine stays. */}
                {isOpen && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 -left-2 w-4 rounded-l-sm bg-cover-spine md:hidden"
                  />
                )}

                {/* Ribbon bookmark, tucked in the pages and peeking out at
                    the bottom with a notched end. */}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-7 left-[30%] h-14 w-5 bg-gold-mid md:-bottom-12 md:h-20 bg-[linear-gradient(to_right,var(--color-gold-dark),var(--color-gold-light)_45%,var(--color-gold-mid))] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]"
                />

                {/* The first page, under the cover. */}
                <div
                  inert={isCoverShown}
                  className="paper-grain absolute inset-0 flex flex-col overflow-y-auto rounded-l-sm rounded-r-lg p-3 shadow-[inset_14px_0_16px_-12px_rgb(43_42_38/0.35),3px_4px_0_-1px_var(--color-card),3px_4px_0_0_var(--color-rule),6px_8px_0_-1px_var(--color-card),6px_8px_0_0_var(--color-rule),9px_12px_0_-1px_var(--color-card),9px_12px_0_0_var(--color-rule),10px_18px_30px_-16px_rgb(43_42_38/0.55)] md:p-4"
                >
                  {isReturning && explorer ? (
                    <WelcomeBackPage explorer={explorer} />
                  ) : (
                    <ExplorerCard
                      nameInputRef={nameInputRef}
                      name={name}
                      avatarId={avatarId}
                      onNameChange={setName}
                      onAvatarChange={setAvatarId}
                      stamp={stamp ?? null}
                      onSubmit={handleSubmit}
                      onStampLanded={handleStampLanded}
                    />
                  )}
                </div>

                {isCoverShown && (
                  <JournalCover
                    coverRef={coverRef}
                    isOpen={isCoverOpening}
                    isQuick={isReturning}
                    reduceMotion={reduceMotion}
                    inside={<InsideCover name={insideName} />}
                    onOpen={() => setPhase("opening")}
                    onOpened={handleCoverOpened}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
