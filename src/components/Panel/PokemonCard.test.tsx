// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import pikachu from "../../../e2e/fixtures/pokemon-25.json";
import { PokemonCard } from "./PokemonCard";

const PIKACHU_ID = 25;

/** Spanish text with the hard breaks and form feeds PokéAPI really sends. */
const pikachuSpecies = {
  id: PIKACHU_ID,
  flavor_text_entries: [
    {
      flavor_text: "When several of\nthese POKéMON gather.",
      language: { name: "en", url: "https://pokeapi.co/api/v2/language/9/" },
      version: { name: "red", url: "https://pokeapi.co/api/v2/version/1/" },
    },
    {
      flavor_text:
        "Levanta su cola para vigilar\flos alrededores.\nA veces cae un rayo.",
      language: { name: "es", url: "https://pokeapi.co/api/v2/language/7/" },
      version: { name: "x", url: "https://pokeapi.co/api/v2/version/23/" },
    },
  ],
};
const NORMALIZED_NOTE =
  "Levanta su cola para vigilar los alrededores. A veces cae un rayo.";

/** Radix exposes each stat bar's value as "<value> de 255". */
const PIKACHU_STATS = ["35", "55", "40", "50", "50", "90"].map(
  (value) => `${value} de 255`,
);

const json = (body: unknown) => new Response(JSON.stringify(body));
const serverError = () => new Response("boom", { status: 500 });
const never = () => new Promise<Response>(() => {});

type Responder = () => Response | Promise<Response>;

/** Answers each endpoint from its own queue; an extra request throws. */
function stubPokeApi(routes: { pokemon: Responder[]; species: Responder[] }) {
  const queues = { pokemon: [...routes.pokemon], species: [...routes.species] };
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const queue = url.includes("/pokemon-species/")
      ? queues.species
      : queues.pokemon;
    const respond = queue.shift();
    if (!respond) throw new Error(`Unexpected request: ${url}`);
    return respond();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderDetail() {
  // A fresh cache per test and no automatic retries, so errors show at once
  // and every request is one the UI made.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <PokemonCard id={PIKACHU_ID} header={null} />
    </QueryClientProvider>,
  );
}

const statValues = () =>
  screen
    .getAllByRole("progressbar")
    .map((bar) => bar.getAttribute("aria-valuetext"));

/** Opens the stats tab; Radix unmounts the inactive tab's panel. */
async function openStatsTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("tab", { name: "Estadísticas" }));
}

const typeLabels = async () => {
  const list = await screen.findByRole("list", { name: "Tipos" });
  return within(list)
    .getAllByRole("listitem")
    .map((item) => item.textContent);
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PokemonCard", () => {
  it("shows the skeleton, not the data, on both tabs while pending", async () => {
    stubPokeApi({ pokemon: [never], species: [never] });
    const user = userEvent.setup();
    renderDetail();

    expect(screen.getByRole("status").textContent).toContain(
      "Cargando la ficha",
    );
    expect(screen.queryByRole("list", { name: "Tipos" })).toBeNull();

    await openStatsTab(user);
    expect(screen.getByRole("status").textContent).toContain(
      "Cargando la ficha",
    );
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
  });

  it("shows an error with Reintentar, and recovers on retry", async () => {
    const fetchMock = stubPokeApi({
      pokemon: [serverError, () => json(pikachu)],
      species: [() => json(pikachuSpecies)],
    });
    const user = userEvent.setup();
    renderDetail();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("No pudimos traer los datos de campo");

    await user.click(within(alert).getByRole("button", { name: "Reintentar" }));

    expect(await typeLabels()).toEqual(["Eléctrico"]);
    await openStatsTab(user);
    expect(statValues()).toEqual(PIKACHU_STATS);
    expect(screen.queryByRole("alert")).toBeNull();
    const pokemonCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith(`/pokemon/${PIKACHU_ID}`),
    );
    expect(pokemonCalls).toHaveLength(2);
  });

  it("renders Spanish types, measurements and the normalized note", async () => {
    stubPokeApi({
      pokemon: [() => json(pikachu)],
      species: [() => json(pikachuSpecies)],
    });
    renderDetail();

    expect(await typeLabels()).toEqual(["Eléctrico"]);
    expect(screen.getByText("0,4 m")).toBeDefined();
    expect(screen.getByText("6 kg")).toBeDefined();

    const note = await screen.findByText(NORMALIZED_NOTE);
    expect(note.getAttribute("lang")).toBe("es");
    expect(note.textContent).not.toMatch(/[\f\n]/);
  });

  it("renders the stats tab with the total and a note on the strongest stat", async () => {
    stubPokeApi({
      pokemon: [() => json(pikachu)],
      species: [() => json(pikachuSpecies)],
    });
    const user = userEvent.setup();
    renderDetail();
    await typeLabels();

    await openStatsTab(user);
    expect(statValues()).toEqual(PIKACHU_STATS);
    const speed = screen.getByRole("progressbar", { name: "Velocidad" });
    expect(speed.getAttribute("aria-valuenow")).toBe("90");
    expect(screen.getByText("320")).toBeDefined();
    expect(screen.getByText("Rápido como el viento")).toBeDefined();
  });

  it("still renders the page when only the species request fails", async () => {
    stubPokeApi({
      pokemon: [() => json(pikachu)],
      species: [serverError],
    });
    const user = userEvent.setup();
    renderDetail();

    const fieldNote = await screen.findByRole("region", {
      name: "Nota de campo",
    });
    const alert = await within(fieldNote).findByRole("alert");
    expect(
      within(alert).getByRole("button", { name: "Reintentar" }),
    ).toBeDefined();

    // Only the field note failed; the rest of the card is intact.
    expect(await typeLabels()).toEqual(["Eléctrico"]);
    expect(screen.getAllByRole("button", { name: "Reintentar" })).toHaveLength(
      1,
    );
    await openStatsTab(user);
    expect(statValues()).toEqual(PIKACHU_STATS);
  });
});
