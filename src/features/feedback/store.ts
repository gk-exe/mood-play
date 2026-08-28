/**
 * Community feedback store.
 *
 * Offline-first: everything is written to localStorage so the app works with
 * no backend at all. When `VITE_API_BASE_URL` points at the PHP/MySQL API
 * (see backend/README.md), submissions are additionally persisted there —
 * failures are swallowed so the local experience never breaks.
 */

import { submitFeedback, submitGameRequest } from "@/features/api/client";

const IDEAS_KEY = "vg:ideas:v1";
const REACTIONS_KEY = "vg:reactions:v1";


export type IdeaCategory =
  | "new-game"
  | "feature"
  | "improvement"
  | "bug"
  | "other";

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  createdAt: number;
}

export type Reaction = "love" | "meh" | "issue";

export interface ReactionRecord {
  gameId: string;
  reaction: Reaction;
  note?: string;
  createdAt: number;
}

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("vg:feedback:changed"));
  } catch {
    /* noop */
  }
}

export function getIdeas(): Idea[] {
  return safeRead<Idea[]>(IDEAS_KEY, []);
}

export function submitIdea(input: {
  title: string;
  description: string;
  category: IdeaCategory;
}): Idea {
  const idea: Idea = {
    id: crypto.randomUUID(),
    title: input.title.trim().slice(0, 80),
    description: input.description.trim().slice(0, 600),
    category: input.category,
    createdAt: Date.now(),
  };
  const next = [idea, ...getIdeas()].slice(0, 50);
  safeWrite(IDEAS_KEY, next);
  // Fire-and-forget mirror to the PHP/MySQL backend when configured.
  void submitGameRequest({
    title: idea.title,
    description: idea.description,
    category: idea.category,
  });
  return idea;
}

export function getReactions(): ReactionRecord[] {
  return safeRead<ReactionRecord[]>(REACTIONS_KEY, []);
}

export function recordReaction(
  gameId: string,
  reaction: Reaction,
  note?: string,
) {
  const rec: ReactionRecord = {
    gameId,
    reaction,
    note: note?.trim().slice(0, 280) || undefined,
    createdAt: Date.now(),
  };
  const next = [rec, ...getReactions()].slice(0, 200);
  safeWrite(REACTIONS_KEY, next);
  void submitFeedback({
    game_id: gameId,
    type: reaction,
    message: rec.note ?? "",
  });
}


export const IDEA_CATEGORIES: { id: IdeaCategory; label: string }[] = [
  { id: "new-game", label: "New game" },
  { id: "feature", label: "New feature" },
  { id: "improvement", label: "Improvement" },
  { id: "bug", label: "Bug report" },
  { id: "other", label: "Something else" },
];
