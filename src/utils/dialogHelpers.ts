import type { MouseEvent } from "react";

/**
 * Click handler for a header pill that opens a dialog while another one (the
 * Pokémon card, the guide, the stamp book) may be open.
 *
 * Radix closes a modal on an outside press only at the end of the click. If
 * the pill opened its dialog during the click, React would re-render the open
 * modal's dismiss layer first, dropping that pending close, and the new dialog
 * would stack on top of the old one. So the pill skips the trigger's own
 * toggle and opens one tick later, once the old modal has closed.
 */
export function openAfterOutsideDismiss(
  event: MouseEvent,
  isOpen: boolean,
  setOpen: (open: boolean) => void,
) {
  event.preventDefault();
  if (isOpen) {
    setOpen(false);
    return;
  }
  window.setTimeout(() => setOpen(true), 0);
}
