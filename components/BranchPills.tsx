"use client";

import type { Book, Node } from "@/lib/types";
import { countDescendants } from "@/lib/tree";

// 분기점에서 N개 자식 중 하나를 고르는 컴팩트한 가로 pill UI
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

  if (active.length === 0) return null;
  if (active.length === 1) {
    // 자식이 하나면 UI 없이 그냥 선만 흐르게 (BookReader가 InkLine 그림)
    return null;
  }

  return (
    <div className="my-1 flex flex-col items-center gap-2">
      <div className="font-script text-[11px] italic text-ink-faded/70">
        여기서 {active.length}갈래 — 읽을 갈래를 고르세요
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {active.map((child) => {
          const isSelected = child.id === selectedChildId;
          const size = countDescendants(book, child.id);
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onChoose(child.id)}
              className={`max-w-[240px] rounded-2xl border px-3 py-2 text-left transition ${
                isSelected
                  ? "border-seal/70 bg-seal/10 shadow-inner"
                  : child.authorType === "ai"
                    ? "border-champagne/40 bg-parchment-light/55 hover:border-champagne/70 hover:bg-parchment-light/80"
                    : "border-leather/30 bg-parchment-light/50 hover:border-leather/60 hover:bg-parchment-light/80"
              }`}
            >
              <span className="line-clamp-2 text-xs text-ink sm:text-sm">
                {child.text}
              </span>
              <span className="mt-1 flex items-center gap-1 font-script text-[10px] italic text-ink-faded/80">
                {child.authorType === "ai" ? (
                  <span className="rounded-full border border-champagne/50 bg-champagne-light/30 px-1.5 py-0.5 not-italic tracking-wider">
                    AI @{child.archetype ?? "??"}
                  </span>
                ) : (
                  <span className="rounded-full border border-seal/30 bg-seal/5 px-1.5 py-0.5 not-italic tracking-wider">
                    {child.author}
                  </span>
                )}
                <span>
                  · {isSelected ? "지금 읽는 갈래" : "탭해서 전환"} · {size}토막
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
