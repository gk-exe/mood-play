import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Send, Sparkles, Check } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import {
  IDEA_CATEGORIES,
  getIdeas,
  submitIdea,
  type IdeaCategory,
} from "@/features/feedback/store";

export const Route = createFileRoute("/suggest")({
  head: () => ({
    meta: [
      { title: "Suggest a Game — Vibe Games" },
      {
        name: "description",
        content:
          "What should we build next? Drop your game idea, feature wish, or bug report. We're listening.",
      },
      { property: "og:title", content: "Suggest a Game — Vibe Games" },
      {
        property: "og:description",
        content: "If you could add one game, what would it be?",
      },
    ],
  }),
  component: SuggestPage,
});

const Schema = z.object({
  title: z.string().trim().min(2, "Give it a name.").max(80),
  description: z.string().trim().max(600).optional().default(""),
  category: z.enum([
    "new-game",
    "feature",
    "improvement",
    "bug",
    "other",
  ] as const),
});

function SuggestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("new-game");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const recent = useMemo(() => getIdeas().slice(0, 3), [sent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = Schema.safeParse({ title, description, category });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your inputs.");
      return;
    }
    submitIdea(result.data);
    setTitle("");
    setDescription("");
    setCategory("new-game");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <AppShell>
      <div className="relative min-h-[100dvh] bg-hub px-5 pt-6 pb-14">
        <Link
          to="/"
          aria-label="Back to hub"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur transition active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>

        <header className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500/15 px-3 py-1 ring-1 ring-fuchsia-300/30">
            <Sparkles className="h-3 w-3 text-fuchsia-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-fuchsia-100">
              We're listening
            </span>
          </span>
          <h1 className="mt-4 text-[2rem] font-bold leading-tight tracking-tight text-white">
            What should we{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
              build next?
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-white/60">
            Your idea could become the next game on Vibe Games.
            Every submission is read during our early-access phase.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10 backdrop-blur"
        >
          <Field label="Idea title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="e.g. Cozy farming puzzler"
              className="w-full rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-fuchsia-300/50"
            />
          </Field>

          <Field label="Category">
            <div className="flex flex-wrap gap-2">
              {IDEA_CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition active:scale-95 ${
                      active
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Tell us more (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={600}
              placeholder="The vibe, the loop, what it should feel like…"
              className="w-full resize-none rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-fuchsia-300/50"
            />
            <div className="mt-1 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
              {description.length}/600
            </div>
          </Field>

          {error ? (
            <p className="text-[12px] font-semibold text-rose-300">{error}</p>
          ) : null}

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-400 to-amber-300 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black shadow-lg shadow-fuchsia-500/20 transition active:scale-[0.98]"
          >
            {sent ? (
              <>
                <Check className="h-4 w-4" />
                Got it — thanks!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send idea
              </>
            )}
          </button>
          <p className="text-center text-[10px] uppercase tracking-[0.22em] text-white/35">
            Stored privately on your device · no account needed
          </p>
        </form>

        {recent.length > 0 ? (
          <section className="mt-8">
            <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
              Your recent ideas
            </h2>
            <ul className="mt-3 space-y-2">
              {recent.map((i) => (
                <li
                  key={i.id}
                  className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-white">
                      {i.title}
                    </div>
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                      {i.category.replace("-", " ")}
                    </span>
                  </div>
                  {i.description ? (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/55">
                      {i.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
        {label}
      </div>
      {children}
    </label>
  );
}
