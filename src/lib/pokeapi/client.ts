export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * A stalled PokéAPI fails the request instead of hanging the server render
 * (roster) or the card's skeleton (detail) forever; both then show a retry.
 */
const REQUEST_TIMEOUT_MS = 10_000;

/** Fetches JSON and returns it as `unknown`, so callers must narrow it with a guard. */
export async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`PokéAPI request failed (${response.status}): ${url}`);
  }
  const data: unknown = await response.json();
  return data;
}

/** Reads the numeric id from a resource URL such as `.../pokemon-species/25/`. */
export function idFromResourceUrl(url: string): number | null {
  const match = /\/(\d+)\/?$/.exec(url);
  return match?.[1] ? Number(match[1]) : null;
}
