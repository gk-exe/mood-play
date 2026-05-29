/**
 * Lightweight WebAudio synth shared by every mini-game.
 *
 * Philosophy: no audio assets, no network — tiny generated tones tuned for
 * tactile satisfaction. Single global AudioContext, lazy-initialized on the
 * first user gesture so iOS/Safari unlock cleanly. All sounds are short,
 * gentle, and mixed quietly so long sessions never fatigue.
 */

type SfxName =
  | "tap"
  | "place"
  | "clear"
  | "combo"
  | "gameover"
  | "pickup"
  | "deny";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  /** seconds */
  dur?: number;
  type?: OscillatorType;
  /** 0..1 peak gain */
  gain?: number;
  /** seconds */
  attack?: number;
  /** end frequency for a quick pitch slide */
  toFreq?: number;
}

function tone(o: ToneOpts) {
  const c = ensureCtx();
  if (!c || !master) return;
  const dur = o.dur ?? 0.12;
  const attack = o.attack ?? 0.004;
  const gain = o.gain ?? 0.25;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, c.currentTime);
  if (o.toFreq) {
    osc.frequency.exponentialRampToValueAtTime(
      o.toFreq,
      c.currentTime + dur,
    );
  }
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(g).connect(master);
  osc.start();
  osc.stop(c.currentTime + dur + 0.02);
}

function chord(freqs: number[], opts: Omit<ToneOpts, "freq"> = {}) {
  freqs.forEach((f, i) =>
    setTimeout(
      () => tone({ ...opts, freq: f, gain: (opts.gain ?? 0.2) * (1 - i * 0.1) }),
      i * 24,
    ),
  );
}

const sfxMap: Record<SfxName, () => void> = {
  tap: () => tone({ freq: 520, dur: 0.05, type: "triangle", gain: 0.12 }),
  pickup: () => tone({ freq: 380, toFreq: 520, dur: 0.09, type: "sine", gain: 0.16 }),
  place: () => {
    tone({ freq: 220, dur: 0.07, type: "triangle", gain: 0.2 });
    setTimeout(
      () => tone({ freq: 330, dur: 0.06, type: "sine", gain: 0.14 }),
      28,
    );
  },
  clear: () => chord([523, 659, 784], { dur: 0.18, type: "triangle", gain: 0.22 }),
  combo: () => chord([523, 659, 784, 988, 1175], { dur: 0.22, type: "triangle", gain: 0.22 }),
  deny: () => tone({ freq: 180, toFreq: 120, dur: 0.1, type: "sawtooth", gain: 0.1 }),
  gameover: () => chord([392, 311, 261], { dur: 0.4, type: "sine", gain: 0.22 }),
};

export const Sfx = {
  play(name: SfxName) {
    if (!enabled) return;
    try {
      sfxMap[name]();
    } catch {
      /* noop */
    }
  },
  setEnabled(v: boolean) {
    enabled = v;
  },
  get enabled() {
    return enabled;
  },
  /** Tiny haptic — safe no-op when unsupported. */
  haptic(ms = 8) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        (navigator as Navigator).vibrate(ms);
      } catch {
        /* noop */
      }
    }
  },
};
