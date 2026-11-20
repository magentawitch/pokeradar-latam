import { CompleteStamp } from "@/components/StampBook/CompleteStamp";
import { EmptySeal } from "@/components/StampBook/EmptySeal";
import { EmptyStamp } from "@/components/StampBook/EmptyStamp";
import { Stamp } from "@/components/StampBook/Stamp";
import type { StampSection } from "@/lib/discovery/derive";
import type { HabitatName } from "@/lib/pokeapi/schemas";

/** Every slot's size: capped so a wide page doesn't blow the stamps up. */
const SLOT_CLASS = "mx-auto w-full max-w-[clamp(5.5rem,22vw,8.5rem)]";

interface StampPageProps {
  section: StampSection;
  /** Fresh stamp id → seconds before it's pressed in. */
  stampDelays: ReadonlyMap<number, number>;
  onStamped: (id: number) => void;
  /** Seconds before the commemorative seal is pressed in; null skips it. */
  sealDelay: number | null;
  onSealed: (habitat: HabitatName) => void;
}

/**
 * One habitat's page of the stamp book: 3 stamps a row on phones, 4 from
 * `sm:`, each capped in size so a wide page doesn't blow them up. A full
 * page opens with its gold complete stamp in the first slot; until then the
 * last slot holds its dashed placeholder. Below 800px
 * the visible title is in StampMobilePager, so this heading is screen-reader
 * only there.
 */
export function StampPage({
  section,
  stampDelays,
  onStamped,
  sealDelay,
  onSealed,
}: StampPageProps) {
  return (
    <>
      <h3 className="mb-4 flex max-book:sr-only items-baseline justify-between font-display text-xl font-semibold text-ink">
        {section.label}
        <span className="font-mono text-sm font-normal text-ink-muted">
          {" "}
          {section.collected}/{section.total}
        </span>
      </h3>
      <ul className="grid grid-cols-3 gap-[clamp(0.75rem,3vw,1.5rem)] sm:grid-cols-4">
        {section.completedAt !== null && (
          <li className={SLOT_CLASS}>
            <CompleteStamp
              habitat={section.habitat}
              label={section.label}
              shortLabel={section.tabLabel}
              total={section.total}
              completedAt={section.completedAt}
              stampDelay={sealDelay}
              onStamped={onSealed}
            />
          </li>
        )}
        {section.stamps.map((stamp) => (
          <li key={stamp.id} className={SLOT_CLASS}>
            {stamp.discoveredAt === null ? (
              <EmptyStamp id={stamp.id} place={stamp.place} />
            ) : (
              <Stamp
                id={stamp.id}
                name={stamp.name}
                habitat={stamp.habitat}
                place={stamp.place}
                discoveredAt={stamp.discoveredAt}
                stampDelay={stampDelays.get(stamp.id) ?? null}
                onStamped={onStamped}
              />
            )}
          </li>
        ))}
        {section.completedAt === null && (
          <li className={SLOT_CLASS}>
            <EmptySeal
              habitat={section.habitat}
              label={section.label}
              remaining={section.total - section.collected}
            />
          </li>
        )}
      </ul>
    </>
  );
}
