import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { POSITRON_STYLE_URL } from "../src/lib/map/expeditionStyle";

const FIXTURES = path.join(__dirname, "fixtures");

/**
 * Runs the app fully offline: the map style is a background-only fixture,
 * any other OpenFreeMap request (tiles, glyphs, sprites) is aborted so an
 * accidental fetch fails loudly, and sprite images are a local placeholder.
 */
async function mockNetwork(page: Page) {
  await page.route("https://tiles.openfreemap.org/**", (route) =>
    route.request().url() === POSITRON_STYLE_URL
      ? route.fulfill({ path: path.join(FIXTURES, "map-style.json") })
      : route.abort(),
  );
  await page.route("https://raw.githubusercontent.com/**", (route) =>
    route.fulfill({ path: path.join(FIXTURES, "sprite.png") }),
  );
  // PokéAPI detail calls get trimmed fixtures; anything else is aborted.
  await page.route("https://pokeapi.co/**", (route) => {
    const match = /\/api\/v2\/(pokemon|pokemon-species)\/(\d+)$/.exec(
      route.request().url(),
    );
    const fixture =
      match && FIXTURE_IDS.has(Number(match[2]))
        ? `${match[1] === "pokemon" ? "pokemon" : "species"}-${match[2]}.json`
        : null;
    return fixture
      ? route.fulfill({ path: path.join(FIXTURES, fixture) })
      : route.abort();
  });
}

/** Pokémon with PokéAPI fixtures (Squirtle, Wartortle, Pikachu). */
const FIXTURE_IDS = new Set([7, 8, 25]);

/**
 * Whether the marker is fully visible beside the card, not under it. Always
 * true on phones, where the card covers the map by design.
 */
async function isClearOfPanel(marker: Locator, panel: Locator) {
  const viewport = marker.page().viewportSize();
  if (viewport && viewport.width < 768) return true;
  const [markerBox, panelBox] = await Promise.all([
    marker.boundingBox(),
    panel.boundingBox(),
  ]);
  if (!markerBox || !panelBox) return false;
  const overlaps =
    markerBox.x < panelBox.x + panelBox.width &&
    markerBox.x + markerBox.width > panelBox.x &&
    markerBox.y < panelBox.y + panelBox.height &&
    markerBox.y + markerBox.height > panelBox.y;
  return !overlaps;
}

const pokemonParam = (page: Page) =>
  new URL(page.url()).searchParams.get("pokemon");

test.beforeEach(async ({ page }) => {
  await mockNetwork(page);
});

test("select a location and a Pokémon; Back closes the card", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Iguazú/ }).click();

  await page.getByRole("button", { name: "Squirtle" }).click();
  const panel = page.getByRole("dialog", { name: "Squirtle" });
  await expect(panel).toBeVisible();
  // The field-note page fills in from PokéAPI.
  await expect(panel.getByRole("list", { name: "Tipos" })).toHaveText("Agua");
  await expect(
    panel.getByText("Se protege con su caparazón y luego contraataca", {
      exact: false,
    }),
  ).toBeVisible();
  // The modal card hides the map from assistive tech, so markers behind it
  // are queried with includeHidden.
  const squirtleMarker = page.getByRole("button", {
    name: "Squirtle",
    includeHidden: true,
  });
  await expect(squirtleMarker).toHaveAttribute("aria-pressed", "true");
  expect(pokemonParam(page)).toBe("7");

  // The camera keeps the marker beside the card, visible through the tint.
  await expect.poll(() => isClearOfPanel(squirtleMarker, panel)).toBe(true);

  // The second tab holds the stats.
  await panel.getByRole("tab", { name: "Estadísticas" }).click();
  await expect(panel.getByRole("progressbar")).toHaveCount(6);

  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(pokemonParam(page)).toBeNull();
});

test("a shared link opens the Pokémon; closing drops the param and refocuses its marker", async ({
  page,
}) => {
  await page.goto("/?pokemon=25");

  const panel = page.getByRole("dialog", { name: "Pikachu" });
  await expect(panel).toBeVisible();
  // The camera revealed Pikachu's location (Amazonía) beside the panel.
  const marker = page.getByRole("button", {
    name: "Pikachu",
    includeHidden: true,
  });
  await expect(marker).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => isClearOfPanel(marker, panel)).toBe(true);

  await page.getByRole("button", { name: "Cerrar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(pokemonParam(page)).toBeNull();
  await expect(marker).toBeFocused();
});

test("clicking outside the card closes it", async ({ page }) => {
  await page.goto("/?pokemon=25");
  await expect(page.getByRole("dialog", { name: "Pikachu" })).toBeVisible();

  // Top-left corner: on the tint, away from the centred card.
  await page.mouse.click(8, 8);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(pokemonParam(page)).toBeNull();
});

test("Esc closes the panel", async ({ page }) => {
  await page.goto("/?pokemon=25");
  await expect(page.getByRole("dialog", { name: "Pikachu" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(pokemonParam(page)).toBeNull();
});

test("an unknown Pokémon id is dropped from the URL", async ({ page }) => {
  await page.goto("/?pokemon=999");
  await expect.poll(() => pokemonParam(page)).toBeNull();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a failed detail request shows Reintentar, which recovers the page", async ({
  page,
}) => {
  // Registered after beforeEach's routes, so it takes precedence.
  let isPokeApiDown = true;
  await page.route("https://pokeapi.co/api/v2/pokemon/25", (route) =>
    isPokeApiDown ? route.fulfill({ status: 500 }) : route.fallback(),
  );
  await page.goto("/?pokemon=25");

  const panel = page.getByRole("dialog", { name: "Pikachu" });
  const alert = panel.getByRole("alert");
  await expect(alert).toContainText("No pudimos traer los datos de campo");

  isPokeApiDown = false;
  await alert.getByRole("button", { name: "Reintentar" }).click();
  await expect(panel.getByRole("list", { name: "Tipos" })).toHaveText(
    "Eléctrico",
  );
  await panel.getByRole("tab", { name: "Estadísticas" }).click();
  await expect(panel.getByRole("progressbar")).toHaveCount(6);
  await expect(panel.getByRole("alert")).toHaveCount(0);
});

test("the diary lists the destinations; picking one flies there and closes it", async ({
  page,
}) => {
  await page.goto("/");
  const hint = page.locator("p", { hasText: "Arrastrá para moverte ·" });
  await expect(hint).toBeVisible();

  await page.getByRole("button", { name: /PokéRadar/ }).click();
  const diary = page.getByRole("dialog", { name: "PokéRadar" });
  await expect(diary.getByRole("list", { name: "Destinos" })).toBeVisible();
  await expect(
    diary.getByRole("heading", { name: "Cómo explorar" }),
  ).toBeVisible();

  await diary.getByRole("button", { name: /Iguazú/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Picking a destination counts as exploring: the hint bar goes away.
  await expect(hint).toHaveCount(0);
  // Arrival reveals that location's Pokémon.
  await expect(page.getByRole("button", { name: "Squirtle" })).toBeVisible();
});

test("a grouped stamp zooms in until its destinations separate", async ({
  page,
}) => {
  await page.goto("/");
  const yunque = page.getByRole("button", { name: /^El Yunque, \d+ Pokémon$/ });
  // At the opening zoom El Yunque and Samaná overlap, so they share one stamp.
  await expect(yunque).toHaveCount(0);
  await page
    .getByRole("button", { name: /^2 destinos \(El Yunque, Bahía de Samaná\)/ })
    .click();
  await expect(yunque).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Bahía de Samaná, \d+ Pokémon$/ }),
  ).toBeVisible();
});
