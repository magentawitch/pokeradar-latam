export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/** Fetches JSON and returns it as `unknown`, so callers must narrow it with a guard. */
export async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
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
