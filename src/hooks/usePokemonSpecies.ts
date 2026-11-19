"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSpeciesNote } from "@/lib/pokeapi/pokemon";

/**
 * Flavour text from `/pokemon-species/{id}`. Kept as its own query so an
 * error here only hides the note, and the Pokémon detail still renders.
 */
export function usePokemonSpecies(id: number) {
  return useQuery({
    queryKey: ["species", id],
    queryFn: () => fetchSpeciesNote(id),
    // A Pokémon's data never changes: fetch it once per session.
    staleTime: Infinity,
  });
}
