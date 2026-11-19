/** The query param that holds the selected Pokémon (`?pokemon=25`). */
export const POKEMON_PARAM = "pokemon";

/**
 * `?pokemon=` value → a dex id in the roster, or null. Anything else (missing,
 * "abc", "2.5", "025x", an id that isn't on the map) counts as no selection.
 */
export function parsePokemonParam(
  raw: string | null,
  rosterIds: ReadonlySet<number>,
) {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return rosterIds.has(id) ? id : null;
}

/** The current URL with `?pokemon=` set to `id`, or removed for null. Keeps other params and the hash. */
export function urlWithPokemon(currentUrl: string, id: number | null) {
  const url = new URL(currentUrl);
  if (id === null) {
    url.searchParams.delete(POKEMON_PARAM);
  } else {
    url.searchParams.set(POKEMON_PARAM, String(id));
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export type SelectionChange =
  { kind: "select"; id: number } | { kind: "close" };

export type HistoryAction =
  | { kind: "push"; id: number }
  | { kind: "replace"; id: number | null }
  | { kind: "back" }
  | { kind: "none" };

/**
 * Which history call a selection change makes:
 * - opening the panel pushes, so Back closes it;
 * - switching Pokémon with the panel open replaces, so Back still closes it
 *   instead of stepping through every Pokémon looked at;
 * - closing goes back over our own pushed entry, or, when the entry wasn't
 *   ours (a shared link), replaces it without the param.
 */
export function historyActionFor(
  openId: number | null,
  didPushEntry: boolean,
  change: SelectionChange,
): HistoryAction {
  if (change.kind === "select") {
    if (change.id === openId) return { kind: "none" };
    return openId === null
      ? { kind: "push", id: change.id }
      : { kind: "replace", id: change.id };
  }
  if (openId === null) return { kind: "none" };
  return didPushEntry ? { kind: "back" } : { kind: "replace", id: null };
}
