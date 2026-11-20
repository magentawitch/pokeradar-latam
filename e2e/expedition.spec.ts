import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { assignToBiomes } from "../src/lib/biomes/assignment";
import { BIOMES } from "../src/lib/biomes/biomes";
import { SPECIES_BY_HABITAT } from "../src/test/gen1Fixture";
import { placeRoster } from "../src/lib/biomes/positions";
import { revealOrder } from "../src/lib/biomes/revealOrder";
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

/** The roster the app builds, from the same fixture the unit tests check. */
const ROSTER = placeRoster(assignToBiomes(SPECIES_BY_HABITAT, BIOMES), BIOMES);

/**
 * An undiscovered Pokémon's marker name: its location and its place in the
 * reveal order, never the Pokémon itself.
 */
function silhouetteName(pokemonId: number) {
  const biome = BIOMES.find((candidate) =>
    ROSTER[candidate.id].some((entry) => entry.id === pokemonId),
  );
  if (!biome) throw new Error(`#${pokemonId} isn't on the roster`);
  const order = revealOrder(ROSTER[biome.id], biome.center);
  const rank = order.findIndex(({ entry }) => entry.id === pokemonId) + 1;
  return `Silueta sin identificar en ${biome.place}, ${rank} de ${order.length}`;
}

const pokemonParam = (page: Page) =>
  new URL(page.url()).searchParams.get("pokemon");

test.beforeEach(async ({ page }) => {
  await mockNetwork(page);
});

const EXPLORER_KEY = "pokeradar:explorer:v1";

/**
 * By default every test is a returning explorer: with reduced motion the
 * field-journal intro skips straight to the map. The intro tests below start
 * from empty storage instead.
 */
test.use({
  storageState: async ({ baseURL }, provide) => {
    await provide({
      cookies: [],
      origins: [
        {
          origin: baseURL ?? "",
          localStorage: [
            {
              name: EXPLORER_KEY,
              value: JSON.stringify({
                name: "Ash",
                avatarId: "hiker",
                startedAt: "2026-11-01T12:00:00.000Z",
              }),
            },
          ],
        },
      ],
    });
  },
});

const storedExplorer = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), EXPLORER_KEY);

test("tapping a silhouette discovers the Pokémon; Back closes the card", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Iguazú/ }).click();

  // Undiscovered, the marker is a silhouette that doesn't give the name away.
  await expect(page.getByRole("button", { name: "Squirtle" })).toHaveCount(0);
  await page.getByRole("button", { name: silhouetteName(7) }).click();
  const panel = page.getByRole("dialog", { name: "Squirtle" });
  await expect(panel).toBeVisible();
  // The tap stamped it: one stamp in the book.
  await expect(
    page.getByRole("button", { name: /^Sellos 1\/151/, includeHidden: true }),
  ).toBeAttached();
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
  // The camera revealed Pikachu's location (El Yunque) beside the panel.
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

test("the diary lists destinations by region; picking one flies there and closes it", async ({
  page,
}) => {
  await page.goto("/");
  const hint = page.locator("p", { hasText: "Arrastrá para moverte ·" });
  await expect(hint).toBeVisible();

  const openDiary = async () => {
    await page.getByRole("button", { name: /^Guía/ }).click();
    return page.getByRole("dialog", { name: "PokéRadar" });
  };
  let diary = await openDiary();

  // Nothing is on screen yet, so every region starts collapsed.
  const conoSur = diary.getByRole("button", { name: /^Cono Sur/ });
  await expect(conoSur).toHaveAttribute("aria-expanded", "false");
  await expect(diary.getByRole("button", { name: /Iguazú/ })).toHaveCount(0);

  // The second tab holds the controls and the map legend.
  await diary.getByRole("tab", { name: "Cómo explorar" }).click();
  await expect(diary.getByRole("heading", { name: "Hábitats" })).toBeVisible();
  await diary.getByRole("tab", { name: "Destinos" }).click();

  await conoSur.click();
  await diary.getByRole("button", { name: /Iguazú/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Picking a destination counts as exploring: the hint bar goes away.
  await expect(hint).toHaveCount(0);
  // Arrival reveals that location's Pokémon, as silhouettes.
  await expect(
    page.getByRole("button", { name: silhouetteName(7) }),
  ).toBeVisible();

  // Reopened, the diary expands the region on screen and marks the place.
  diary = await openDiary();
  await expect(
    diary.getByRole("button", { name: /^Cono Sur/ }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(diary.getByRole("button", { name: /Iguazú/ })).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("a grouped stamp zooms in until its destinations separate", async ({
  page,
}) => {
  await page.goto("/");
  // Nothing is discovered yet, so each stamp's progress reads 0.
  const yunque = page.getByRole("button", {
    name: /^El Yunque, (\d+) Pokémon, 0 de \1 descubiertos$/,
  });
  // At the opening zoom El Yunque and Samaná overlap, so they share one stamp.
  await expect(yunque).toHaveCount(0);
  await page
    .getByRole("button", { name: /^2 destinos \(El Yunque, Bahía de Samaná\)/ })
    .click();
  await expect(yunque).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /^Bahía de Samaná, (\d+) Pokémon, 0 de \1 descubiertos$/,
    }),
  ).toBeVisible();
});

test("opening a card leaves a stamp in the book, one habitat per page", async ({
  page,
}) => {
  const isPhone = (page.viewportSize()?.width ?? 0) < 768;
  await page.goto("/?pokemon=25");
  await expect(page.getByRole("dialog", { name: "Pikachu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // The count is in the pill's name, so this also checks it went to 1.
  const trigger = page.getByRole("button", { name: /^Sellos 1\/151/ });
  const book = page.getByRole("dialog", { name: "Libro de sellos" });
  // The hanko badge counts the new stamp until the book is opened.
  await expect(trigger).toHaveAccessibleName(/· 1 sello nuevo ·/);
  await expect(trigger.getByText("+1")).toBeVisible();
  await trigger.click();

  // Desktop pages by folder tabs; phones by ink dots (the tabs are hidden).
  const currentPage = (habitat: string, progress: string) =>
    isPhone
      ? expect(
          book.getByRole("button", { name: `${habitat}, ${progress}` }),
        ).toHaveAttribute("aria-current", "page")
      : expect(
          book.getByRole("tab", { name: new RegExp(`^${habitat}`) }),
        ).toHaveAttribute("aria-selected", "true");

  // It opens on the page of the new stamp: Bosques, page 2 of 9.
  await currentPage("Bosques", isPhone ? "1 de 21" : "");
  const forest = book.getByRole("tabpanel");
  await expect(
    forest.getByRole("heading", { name: "Bosques 1/21" }),
  ).toBeAttached();
  await expect(
    forest.getByRole("figure", {
      name: /^Pikachu, sellado en .+ el \d{4}\.\d{2}\.\d{2}$/,
    }),
  ).toBeVisible();
  await expect(forest.getByText("Sello pendiente en")).toHaveCount(20);
  if (!isPhone) {
    // Long habitat names are shortened on the tabs only.
    await expect(book.getByRole("tab", { name: /^Raros/ })).toBeVisible();
  }

  // ← / → change the page from anywhere in the book; the first page is the
  // end of the line.
  await book.getByRole("tabpanel").focus();
  await page.keyboard.press("ArrowRight");
  await currentPage("Praderas", isPhone ? "0 de 35" : "");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await currentPage("Orillas", isPhone ? "0 de 19" : "");

  if (isPhone) {
    // The arrows by the title page too; there's no page before the first.
    await expect(
      book.getByRole("button", { name: "Página anterior" }),
    ).toBeDisabled();
    await book.getByRole("button", { name: "Página siguiente" }).click();
    await currentPage("Bosques", "1 de 21");
  } else {
    // Desktop has no arrow buttons: the tabs and the keys turn the pages.
    await expect(book.getByRole("button", { name: /^Página/ })).toHaveCount(0);
  }

  if (isPhone) {
    // A dot jumps to its page, and a left swipe turns to the next one.
    await book.getByRole("button", { name: "Mar, 0 de 15" }).click();
    await currentPage("Mar", "0 de 15");
    const pageBody = book.getByRole("tabpanel");
    const box = await pageBody.boundingBox();
    if (!box) throw new Error("page body not laid out");
    const y = box.y + box.height / 2;
    await pageBody.dispatchEvent("pointerdown", {
      pointerType: "touch",
      clientX: box.x + box.width - 20,
      clientY: y,
    });
    await pageBody.dispatchEvent("pointerup", {
      pointerType: "touch",
      clientX: box.x + 20,
      clientY: y,
    });
    await currentPage("Ciudades", "0 de 22");
  }

  await page.keyboard.press("Escape");
  await expect(book).toHaveCount(0);
  await expect(trigger).toBeFocused();
  // Opening the book cleared the badge.
  await expect(trigger).not.toHaveAccessibleName(/sello nuevo/);
  await expect(trigger.getByText("+1")).toHaveCount(0);

  // Stored in localStorage: still there after a reload.
  await page.reload();
  await trigger.click();
  await expect(
    isPhone
      ? book.getByRole("button", { name: "Bosques, 1 de 21" })
      : book.getByRole("tab", { name: /^Bosques\s*1\/21$/ }),
  ).toBeVisible();
});

test.describe("field-journal intro, first visit", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const journal = (page: Page) =>
    page.getByRole("dialog", { name: "Diario de expedición" });

  test("opening the cover and stamping the ID card saves the explorer and shows the map", async ({
    page,
  }) => {
    await page.goto("/");
    const intro = journal(page);
    const cover = intro.getByRole("button", {
      name: "Abrir el diario de expedición",
    });
    const nameInput = intro.getByLabel("Nombre del explorador/a");
    // The dialog itself takes focus on open (no ring around the closed
    // book). Tab reaches "Saltar intro", then the cover; the card under it is
    // out of keyboard reach.
    await expect(intro).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      intro.getByRole("button", { name: "Saltar intro" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(cover).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(nameInput).not.toBeFocused();
    await cover.focus();
    await page.keyboard.press("Enter");

    await expect(nameInput).toBeFocused();
    // The first photo comes preselected; arrow keys pick another.
    const firstPhoto = intro.getByRole("radio", { name: "Mochilera" });
    await expect(firstPhoto).toBeChecked();
    await nameInput.fill("Misty");
    await firstPhoto.focus();
    // Radix selects on arrow focus only while the key is held (it moves focus
    // in a timeout), so hold it like a person would instead of press().
    await page.keyboard.down("ArrowRight");
    await expect(intro.getByRole("radio", { name: "Mochilero" })).toBeFocused();
    await page.keyboard.up("ArrowRight");
    await expect(intro.getByRole("radio", { name: "Mochilero" })).toBeChecked();
    await intro.getByRole("button", { name: "Comenzar expedición" }).click();

    await expect(intro.getByRole("status")).toContainText(
      "Expedición autorizada",
    );
    await expect(journal(page)).toHaveCount(0);
    await expect(
      page.locator("p", { hasText: "Arrastrá para moverte ·" }),
    ).toBeVisible();
    expect(JSON.parse((await storedExplorer(page)) ?? "null")).toMatchObject({
      name: "Misty",
      avatarId: "backpacker",
    });

    // Returning (reduced motion): straight to the map, no journal.
    await page.reload();
    await expect(page.getByRole("button", { name: /^Guía/ })).toBeVisible();
    await expect(journal(page)).toHaveCount(0);
  });

  test("a blank name stamps the card as Explorador/a", async ({ page }) => {
    await page.goto("/");
    const intro = journal(page);
    await intro
      .getByRole("button", { name: "Abrir el diario de expedición" })
      .click();
    await intro.getByRole("button", { name: "Comenzar expedición" }).click();
    await expect(journal(page)).toHaveCount(0);
    expect(JSON.parse((await storedExplorer(page)) ?? "null")).toMatchObject({
      name: "Explorador/a",
      avatarId: "backpackerf",
    });
  });

  test("Saltar intro and Esc go straight to the map without saving", async ({
    page,
  }) => {
    await page.goto("/");
    await journal(page).getByRole("button", { name: "Saltar intro" }).click();
    await expect(journal(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Guía/ })).toBeVisible();
    expect(await storedExplorer(page)).toBeNull();

    // Nothing was saved, so the journal is back on the next visit; Esc skips
    // it too, even from the open ID card.
    await page.reload();
    await journal(page)
      .getByRole("button", { name: "Abrir el diario de expedición" })
      .click();
    await expect(
      journal(page).getByLabel("Nombre del explorador/a"),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(journal(page)).toHaveCount(0);
    expect(await storedExplorer(page)).toBeNull();
  });

  test("a shared ?pokemon= link skips the intro and opens the card", async ({
    page,
  }) => {
    await page.goto("/?pokemon=25");
    await expect(page.getByRole("dialog", { name: "Pikachu" })).toBeVisible();
    await expect(journal(page)).toHaveCount(0);

    // Closing the card drops the param; the intro doesn't come back.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(journal(page)).toHaveCount(0);
  });
});

test("one click on a header pill closes the open card or book and opens its own", async ({
  page,
}) => {
  await page.goto("/?pokemon=25");
  await expect(page.getByRole("dialog", { name: "Pikachu" })).toBeVisible();

  // While a modal is open the rest of the page is hidden from assistive
  // tech, so the pills are found with includeHidden.
  const pill = (name: RegExp) =>
    page.getByRole("button", { name, includeHidden: true });
  await pill(/^Sellos/).click();
  await expect(
    page.getByRole("dialog", { name: "Libro de sellos" }),
  ).toBeVisible();
  // The card really closed (not just hidden behind the book).
  await expect(page.locator("[role=dialog][data-state=open]")).toHaveCount(1);
  expect(pokemonParam(page)).toBeNull();

  await pill(/^Guía/).click();
  await expect(page.getByRole("dialog", { name: "PokéRadar" })).toBeVisible();
  await expect(page.locator("[role=dialog][data-state=open]")).toHaveCount(1);
});
