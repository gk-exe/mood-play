/**
 * AUDIO ARCHITECTURE — scaffold only.
 *
 * Defines the bucket taxonomy and loader contract every future sound pack
 * must implement. No actual audio files are shipped yet. Today's tactile
 * SFX synth lives at `src/games/_shared/audio.ts` and stays the canonical
 * runtime entry point until a real loader replaces it.
 */

export type AudioBucket =
  | "ui"
  | "gameplay"
  | "victory"
  | "ambience"
  | "transitions";

export interface AudioAsset {
  /** Stable key referenced from gameplay code (e.g. "ui/tap", "victory/round"). */
  key: string;
  bucket: AudioBucket;
  /** URL relative to /public or a future CDN base. */
  src: string;
  /** Optional preload group — load on idle vs on demand. */
  preload?: "eager" | "lazy";
  /** 0..1 normalized peak gain. */
  gain?: number;
}

export interface AudioPack {
  id: string;
  title: string;
  /** Map of asset key → asset descriptor. */
  assets: Readonly<Record<string, AudioAsset>>;
}

export interface AudioLoader {
  /** Warm up assets marked `preload: "eager"`. Idempotent. */
  warm(pack: AudioPack): Promise<void>;
  /** Play a single asset by key. No-op when audio is disabled. */
  play(key: string, opts?: { gain?: number }): void;
  /** Toggle global mute. */
  setEnabled(enabled: boolean): void;
  /** Cheap haptic tap — safe no-op when unsupported. */
  haptic(ms?: number): void;
}

/**
 * Suggested on-disk layout (no files committed yet):
 *
 *   public/audio/
 *   ├── ui/         tap.webm, hover.webm, deny.webm
 *   ├── gameplay/   pop.webm, place.webm, clear.webm
 *   ├── victory/    round.webm, best.webm
 *   ├── ambience/   chill.webm, action.webm
 *   └── transitions/whoosh.webm
 */
