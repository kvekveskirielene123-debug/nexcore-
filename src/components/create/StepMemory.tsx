"use client";

import { useState, useRef, useCallback } from "react";
import type { StepProps } from "@/lib/create/types";

/* ─────────────────────────────────────────────
   Types & constants
───────────────────────────────────────────── */

const CATEGORIES = [
  "PERSONALITY",
  "BACKSTORY",
  "EMOTIONAL DELIVERY",
  "SPEAKING STYLE",
  "RELATIONSHIPS & RULES",
  "KNOWLEDGE & SKILLS",
  "CUSTOM",
] as const;

type Category = (typeof CATEGORIES)[number];

interface MemoryCard {
  id: string;
  category: Category;
  content: string;
}

const CARD_MAX = 2000;
const MAX_CARDS = 30;

const CAT_BG: Record<Category, string> = {
  "PERSONALITY":          "rgba(0,229,255,0.12)",
  "BACKSTORY":            "rgba(139,92,246,0.12)",
  "EMOTIONAL DELIVERY":   "rgba(236,72,153,0.12)",
  "SPEAKING STYLE":       "rgba(34,211,238,0.12)",
  "RELATIONSHIPS & RULES":"rgba(251,146,60,0.12)",
  "KNOWLEDGE & SKILLS":   "rgba(52,211,153,0.12)",
  "CUSTOM":               "rgba(148,163,184,0.12)",
};

const CAT_TEXT: Record<Category, string> = {
  "PERSONALITY":          "#00e5ff",
  "BACKSTORY":            "#a78bfa",
  "EMOTIONAL DELIVERY":   "#f472b6",
  "SPEAKING STYLE":       "#22d3ee",
  "RELATIONSHIPS & RULES":"#fb923c",
  "KNOWLEDGE & SKILLS":   "#34d399",
  "CUSTOM":               "#94a3b8",
};

/* ─────────────────────────────────────────────
   Serialise / parse
───────────────────────────────────────────── */

function compile(cards: MemoryCard[]): string {
  return cards
    .filter((c) => c.content.trim())
    .map((c) => `== ${c.category} ==\n${c.content.trim()}`)
    .join("\n\n");
}

function parse(memory: string): MemoryCard[] {
  if (!memory.trim()) return [];
  const re = /==\s*([^=\n]+?)\s*==[ \t]*\n?([\s\S]*?)(?=\n==\s*[^=\n]+?\s*==|$)/g;
  const cards: MemoryCard[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(memory)) !== null) {
    const raw = m[1].trim().toUpperCase() as Category;
    const cat = (CATEGORIES as readonly string[]).includes(raw) ? raw : ("CUSTOM" as Category);
    const content = m[2].trim();
    if (content) cards.push({ id: crypto.randomUUID(), category: cat, content });
  }
  if (cards.length) return cards;
  return [{ id: crypto.randomUUID(), category: "CUSTOM", content: memory.trim() }];
}

/* ─────────────────────────────────────────────
   Category dropdown
───────────────────────────────────────────── */

function CategoryDropdown({
  value,
  onChange,
}: {
  value: Category;
  onChange: (v: Category) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-[1.5px] transition-all"
        style={{
          fontFamily: "var(--font-mono)",
          background: CAT_BG[value],
          color: CAT_TEXT[value],
          border: `1px solid ${CAT_TEXT[value]}40`,
        }}
      >
        {value}
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={close} />
          <div
            className="absolute top-full left-0 mt-1.5 z-30 rounded-xl border border-purple-700/30 overflow-hidden shadow-2xl"
            style={{ background: "#0c0520", minWidth: 200 }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(cat); setOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 text-[10px] tracking-[1.5px] transition-colors"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: CAT_TEXT[cat],
                  background: value === cat ? CAT_BG[cat] : "transparent",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Single memory card
───────────────────────────────────────────── */

function MemoryCardItem({
  card,
  index,
  total,
  charName,
  charSubtitle,
  charDescription,
  isBrilliant,
  genUsed,
  onUpdate,
  onDelete,
  onMove,
  onGenUsed,
}: {
  card: MemoryCard;
  index: number;
  total: number;
  charName: string;
  charSubtitle: string;
  charDescription: string;
  isBrilliant: boolean;
  genUsed: number;
  onUpdate: (id: string, patch: Partial<MemoryCard>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onGenUsed: (used: number) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const genLimit = isBrilliant ? 50 : 15;
  const genExhausted = genUsed >= genLimit;

  const insertVar = (v: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const next = card.content.slice(0, s) + v + card.content.slice(e);
    if (next.length <= CARD_MAX) {
      onUpdate(card.id, { content: next });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(s + v.length, s + v.length);
      }, 0);
    }
  };

  const handleGenerate = async () => {
    if (!charName.trim()) {
      setGenError("Fill in the character name first.");
      setTimeout(() => setGenError(null), 3000);
      return;
    }
    if (genExhausted) {
      setGenError(`Weekly limit reached (${genLimit}/${genLimit}). Resets Monday.`);
      setTimeout(() => setGenError(null), 4000);
      return;
    }
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/characters/generate-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: charName,
          subtitle: charSubtitle,
          description: charDescription,
          category: card.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const generated = (data.content as string)?.trim() ?? "";
      const merged = card.content.trim()
        ? card.content.trim() + "\n\n" + generated
        : generated;
      onUpdate(card.id, { content: merged.slice(0, CARD_MAX) });
      if (typeof data.used === "number") onGenUsed(data.used);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate";
      setGenError(msg);
      setTimeout(() => setGenError(null), 5000);
    } finally {
      setGenerating(false);
    }
  };

  const near = card.content.length > CARD_MAX * 0.85;
  const full = card.content.length >= CARD_MAX;

  return (
    <div
      className="rounded-xl border relative overflow-visible transition-all duration-200 hover:shadow-[0_0_28px_rgba(0,229,255,0.08)]"
      style={{
        background: "rgba(8,4,26,0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderColor: "rgba(0,229,255,0.18)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.45)",
      }}
    >
      {/* top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent rounded-t-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* move up / down */}
          <div className="flex flex-col gap-px">
            <button
              type="button"
              onClick={() => onMove(card.id, "up")}
              disabled={index === 0}
              className="text-[#3a2a5a] hover:text-cyan-400 disabled:opacity-20 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onMove(card.id, "down")}
              disabled={index === total - 1}
              className="text-[#3a2a5a] hover:text-cyan-400 disabled:opacity-20 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <CategoryDropdown
            value={card.category}
            onChange={(v) => onUpdate(card.id, { category: v })}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* AI Generate */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || genExhausted}
            title={genExhausted ? `Weekly limit reached (${genLimit}/${genLimit}). Resets Monday.` : `${genUsed}/${genLimit} used this week`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[1.5px] transition-all active:scale-95 disabled:opacity-50"
            style={{
              fontFamily: "var(--font-mono)",
              background: genExhausted
                ? "rgba(90,74,122,0.15)"
                : "linear-gradient(135deg,rgba(0,153,255,0.18),rgba(0,229,255,0.1))",
              border: genExhausted
                ? "1px solid rgba(90,74,122,0.4)"
                : "1px solid rgba(0,153,255,0.45)",
              color: genExhausted ? "#5a4a7a" : "#60c8ff",
              boxShadow: generating ? "0 0 14px rgba(0,153,255,0.35)" : undefined,
            }}
          >
            {generating ? (
              <>
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                GENERATING...
              </>
            ) : genExhausted ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {genUsed}/{genLimit}
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
                </svg>
                AI GENERATE · {genUsed}/{genLimit}
              </>
            )}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="w-6 h-6 flex items-center justify-center rounded-full text-[#5a4a7a] hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-1">
        {genError && (
          <p className="text-[11px] text-red-400 mb-2" style={{ fontFamily: "var(--font-body)" }}>
            {genError}
          </p>
        )}
        <textarea
          ref={textareaRef}
          value={card.content}
          onChange={(e) => onUpdate(card.id, { content: e.target.value })}
          rows={5}
          maxLength={CARD_MAX}
          placeholder={`Describe the ${card.category.toLowerCase()} of this character — be specific and vivid…`}
          className="w-full bg-transparent text-[13px] text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-y leading-relaxed"
          style={{ fontFamily: "var(--font-body)", lineHeight: 1.75 }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-3.5 pt-1">
        {/* Variable inserters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[9px] text-[#3a2a5a] uppercase tracking-[1px] mr-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Insert:
          </span>
          {["{{user}}", "{{char}}"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVar(v)}
              className="px-2 py-0.5 rounded text-[10px] tracking-[0.5px] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_8px_rgba(0,229,255,0.3)]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "#00e5ff",
                border: "1px solid rgba(0,229,255,0.28)",
                background: "rgba(0,229,255,0.06)",
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Counter */}
        <span
          className="text-[10px] tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: full ? "#f87171" : near ? "#fbbf24" : "#3a2a5a",
          }}
        >
          {card.content.length}/{CARD_MAX}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step
───────────────────────────────────────────── */

export function StepMemory({ draft, setDraft, goNext, goBack, isBrilliant = false }: StepProps & { isBrilliant?: boolean }) {
  const cardLimit = isBrilliant ? Infinity : MAX_CARDS;
  const genLimit  = isBrilliant ? 50 : 15;

  const [cards, setCardsState] = useState<MemoryCard[]>(() =>
    parse(draft.long_term_memory)
  );
  const [genUsed, setGenUsed] = useState(0);

  // Keep draft.long_term_memory in sync
  const updateCards = useCallback(
    (next: MemoryCard[]) => {
      setCardsState(next);
      setDraft({ ...draft, long_term_memory: compile(next) });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, setDraft]
  );

  const handleUpdate = useCallback(
    (id: string, patch: Partial<MemoryCard>) => {
      updateCards(
        cards.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    [cards, updateCards]
  );

  const handleDelete = useCallback(
    (id: string) => updateCards(cards.filter((c) => c.id !== id)),
    [cards, updateCards]
  );

  const handleMove = useCallback(
    (id: string, dir: "up" | "down") => {
      const idx = cards.findIndex((c) => c.id === id);
      if (idx === -1) return;
      const next = [...cards];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      updateCards(next);
    },
    [cards, updateCards]
  );

  const handleAdd = () => {
    if (cards.length >= cardLimit) return;
    const used = new Set(cards.map((c) => c.category));
    const next = CATEGORIES.find((cat) => !used.has(cat)) ?? "CUSTOM";
    updateCards([...cards, { id: crypto.randomUUID(), category: next, content: "" }]);
  };

  const totalChars = cards.reduce((s, c) => s + c.content.length, 0);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-xl tracking-[3px] uppercase mb-1"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff" }}
          >
            ◈ Memory
          </h2>
          <p className="text-sm text-[#a78bfa] italic" style={{ fontFamily: "var(--font-body)" }}>
            The AI reads every card before each reply. The more vivid, the more alive.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={cards.length >= cardLimit}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] tracking-[2px] transition-all active:scale-95 disabled:opacity-30"
          style={{
            fontFamily: "var(--font-mono)",
            background: "rgba(0,229,255,0.07)",
            border: "1px solid rgba(0,229,255,0.28)",
            color: "#00e5ff",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          ADD CARD
        </button>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div
          className="rounded-xl border border-dashed border-purple-700/25 p-10 text-center"
          style={{ background: "rgba(8,4,26,0.5)" }}
        >
          <div
            className="text-2xl mb-3 text-[#3a2a5a]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ◈
          </div>
          <p className="text-[13px] text-[#4a3a6a] mb-5" style={{ fontFamily: "var(--font-body)" }}>
            No memory cards yet. Add one to define who this character is.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={cards.length >= cardLimit}
            className="px-5 py-2.5 rounded-lg text-[10px] tracking-[2px] transition-all hover:shadow-[0_0_18px_rgba(0,229,255,0.2)] disabled:opacity-30"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(0,229,255,0.07)",
              border: "1px solid rgba(0,229,255,0.28)",
              color: "#00e5ff",
            }}
          >
            + ADD FIRST CARD
          </button>
        </div>
      )}

      {/* Cards */}
      {cards.length > 0 && (
        <div className="space-y-3">
          {cards.map((card, i) => (
            <MemoryCardItem
              key={card.id}
              card={card}
              index={i}
              total={cards.length}
              charName={draft.name}
              charSubtitle={draft.subtitle}
              charDescription={draft.description}
              isBrilliant={isBrilliant}
              genUsed={genUsed}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMove={handleMove}
              onGenUsed={setGenUsed}
            />
          ))}
        </div>
      )}

      {/* Summary row */}
      {cards.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[#3a2a5a]" style={{ fontFamily: "var(--font-body)" }}>
            {cards.length}{isBrilliant ? "" : `/${MAX_CARDS}`} cards{isBrilliant ? " · ∞" : ""} &nbsp;·&nbsp; AI gen:{" "}
            <span style={{ color: genUsed >= genLimit ? "#f87171" : "#00e5ff", opacity: 0.7 }}>{genUsed}/{genLimit}</span>
            {" "}this week &nbsp;·&nbsp; Use{" "}
            <span className="text-[#00e5ff]/60">{"{{user}}"}</span> for the person chatting,{" "}
            <span className="text-[#00e5ff]/60">{"{{char}}"}</span> for the character
          </p>
          <span
            className="text-[10px] tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: totalChars > 7500 ? "#fbbf24" : "#3a2a5a",
            }}
          >
            {totalChars} chars total
          </span>
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-4">
        <button
          onClick={goBack}
          className="px-6 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← BACK
        </button>
        <button
          onClick={goNext}
          className="px-8 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] hover:shadow-[0_0_28px_rgba(0,229,255,0.4)] transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          NEXT · SETTINGS →
        </button>
      </div>
    </div>
  );
}
