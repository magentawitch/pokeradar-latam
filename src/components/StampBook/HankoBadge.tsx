import { cn } from "cn";

interface HankoBadgeProps {
  /** New stamps, shown as "+N". */
  count: number;
  /** `sm` for the book's tabs; the default sits on the header pill. */
  size?: "default" | "sm";
  className?: string;
}

/**
 * A hand-pressed vermilion seal counting new stamps, tilted on its parent's
 * top-right corner (the parent must be positioned). Vermilion means "new"
 * everywhere in the stamp book. It presses in when mounted, so give it a key
 * that changes with the count to press it again. Decorative: the parent
 * carries the count in text for assistive tech.
 */
export function HankoBadge({
  count,
  size = "default",
  className,
}: HankoBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute z-20 flex -rotate-8 animate-hanko-in items-center justify-center rounded-full bg-hanko font-mono leading-none font-semibold tracking-normal text-card normal-case shadow-sm outline-1 outline-card/60 motion-reduce:animate-none",
        size === "default" &&
          "-top-1.5 -right-1.5 h-5 min-w-5 px-1 text-[0.65rem] outline-offset-[-3px]",
        size === "sm" &&
          "-top-2 -right-2 h-4 min-w-4 px-0.5 text-[0.6rem] outline-offset-[-2px]",
        className,
      )}
    >
      +{count}
    </span>
  );
}
