// Sound settings and cry playback. The mute flag is a useSyncExternalStore
// store over localStorage, like the discoveries store, so nothing reads storage
// during the server render. Sound starts on: a cry only ever plays from a tap.

import { createStorageStore } from "@/lib/storage/createStorageStore";

const MUTED_KEY = "pokeradar:muted:v1";

/** How loud a cry plays; PokéAPI's cries are mastered loud. */
const CRY_VOLUME = 0.5;

/** Only the exact stored "true" mutes; anything else reads as sound on. */
export function parseMuted(raw: string | null) {
  return raw === "true";
}

const mutedStore = createStorageStore(MUTED_KEY, parseMuted);

export const getMutedSnapshot = mutedStore.getSnapshot;

export const getMutedServerSnapshot = () => false;

/** Notifies on local changes and on changes made in other tabs. */
export const subscribeToMuted = mutedStore.subscribe;

export function writeMuted(isMuted: boolean) {
  // Muting silences a cry that is still playing.
  if (isMuted) currentCry?.pause();
  mutedStore.write(String(isMuted));
}

// Every PokéAPI cry is Ogg Vorbis, so there is no other format to fall back to.
let cachedCanPlayCries: boolean | null = null;

/** Whether this browser can play the cries at all; checked once. */
export function canPlayCries() {
  cachedCanPlayCries ??=
    typeof Audio !== "undefined" &&
    new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== "";
  return cachedCanPlayCries;
}

export const canPlayCriesServerSnapshot = () => false;

/** Support never changes after load, so there is nothing to subscribe to. */
export const subscribeToCrySupport = () => () => {};

// One cry at a time: a new tap cuts off the previous cry instead of stacking.
let currentCry: HTMLAudioElement | null = null;

/**
 * Plays a cry unless sound is muted or unsupported. Call it only from a click
 * or key handler, so the browser's autoplay policy allows it. A failed load or
 * a rejected play() is ignored: a missing cry never breaks the tap.
 */
export function playCry(url: string) {
  if (getMutedSnapshot() || !canPlayCries()) return;
  currentCry?.pause();
  const audio = new Audio(url);
  audio.volume = CRY_VOLUME;
  currentCry = audio;
  audio.play().catch(() => {});
}
