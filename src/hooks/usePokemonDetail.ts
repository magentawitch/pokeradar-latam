"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPokemonDetail } from "@/lib/pokeapi/pokemon";

/** `/pokemon/{id}` for the Pokémon on the open page. */
export function usePokemonDetail(id: number) {
  return useQuery({
    queryKey: ["pokemon", id],
    queryFn: () => fetchPokemonDetail(id),
    // A Pokémon's data never changes: fetch it once per session.
    staleTime: Infinity,
  });
}
