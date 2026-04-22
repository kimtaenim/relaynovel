"use client";

import type { Book, Node } from "@/lib/types";
import { countDescendants } from "@/lib/tree";
import { ARCHETYPES } from "@/lib/archetypes";

// 분기점에서 N개 자식을 작은 박스로 나란히 표시.
// 선택된 것은 밝게 강조, 선택 안 된 것들은 흐리게.
// 아래에 큰 카드로 같은 내용이 다시 나오므로 (세로 축으로 이어져서)
// 이 pill들은 "미리보기 + 선택 스위처" 역할.
export function BranchPills({
  book,
  branchNode,
  selectedChildId,
  onChoose,
}: {
  book: Book;
  branchNode: Node;
  selectedChildId: string | null;
  onChoose: (childId: string) => void;
}) {
  const active = branchNode.childrenIds
    .map((cid) => book.nodes[cid])
    .filter((c): c is Node => !!c && c.status === "active");

  if (active.length <= 1) return null;

  function aiLabel(key?: string): string {
    if (!key) return "AI";
    const meta = (
      ARCHETYPES as Record<string, { koreanLabel: string }>
    )[key];
    return meta ? meta.koreanLabel : key;
  }

  return (
    <div className="my-2 flex w-full flex-col items-center gap-1.5">
      <div className="font-script text-[10px] italic tracking-wider text-ink-faded/60">
        · 여기서 {active.length}갈래 — 탭해서 바꿀 수 있음 ·
      </div>
      <div
        className="grid w-full gap-1 sm:gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${active.length}, minmax(0, 1fr))`,
        }}
      >
        {active.map((child) => {
          const isSelected = child.id === selectedChildId;
          const isAI = child.authorType === "ai";
          const size = countDescendants(book, child.id);
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onChoose(child.id)}
              title={child.text}
              className={[
                "relative min-w-0 rounded-xl border px-2 py-1.5 text-left transition",
                isSelected
                  ? isAI
                    ? "border-champagne bg-champagne-light/70 shadow-sm"
                    : "border-seal/60 bg-parchment-light shadow-sm"
                  : isAI
                    ? "border-champagne/30 bg-champagne-light/10 opacity-60 hover:opacity-100 hover:border-champagne/70"
                    : "border-leather/25 bg-parchment-light/30 opacity-60 hover:opacity-100 hover:border-leather/60",
              ].join(" ")}
            >
              <div
                className={`truncate text-[10px] leading-snug sm:text-[11px] ${
                  isSelected ? "text-ink" : "text-ink-faded"
                }`}
              >
                {child.text}
              </div>
              <div
                className={`truncate text-[9px] italic ${
                  isSelected ? "text-ink-faded" : "text-ink-faded/70"
                }`}
              >
                <span
                  className={`not-italic font-script tracking-wider ${
                    isAI ? "text-champagne-dark" : "text-seal/80"
                  }`}
                >
                  {isAI ? aiLabel(child.archetype) : child.author}
                </span>
                <span> · {size}</span>
                {isSelected && <span> · ★</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
