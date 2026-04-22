"use client";

import type { Book, Node } from "@/lib/types";
import { countDescendants } from "@/lib/tree";

// 분기점 힌트 — 선택된 갈래는 표시 안 하고 (세로 축으로 흐름 유지),
// 선택 안 된 형제 갈래들만 작은 pill로 옆에 띄워서 전환 가능하게.
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

  const others = active.filter((c) => c.id !== selectedChildId);

  // 분기 없거나 (자식 1개), 선택된 자식 외 다른 게 없으면 아무것도 안 보임
  if (others.length === 0) return null;

  return (
    <div className="my-2 flex flex-col items-center gap-1.5">
      <div className="font-script text-[10px] italic tracking-wider text-ink-faded/60">
        ·&nbsp;이 지점의 다른 갈래 {others.length}개&nbsp;·
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {others.map((child) => {
          const size = countDescendants(book, child.id);
          const isAI = child.authorType === "ai";
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onChoose(child.id)}
              title={child.text}
              className={`max-w-[200px] truncate rounded-full border px-3 py-1 text-[11px] transition ${
                isAI
                  ? "border-champagne/50 bg-champagne-light/20 text-ink-faded hover:border-champagne hover:bg-champagne-light/40 hover:text-ink"
                  : "border-leather/40 bg-parchment-light/50 text-ink-faded hover:border-leather hover:bg-parchment-light/80 hover:text-ink"
              }`}
            >
              <span className="truncate">
                {isAI ? `@${child.archetype}` : child.author}:
                {" "}
                {child.text.length > 18
                  ? child.text.slice(0, 18) + "…"
                  : child.text}
              </span>
              <span className="ml-1 text-ink-faded/60">· {size}토막</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
