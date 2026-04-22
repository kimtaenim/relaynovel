"use client";

import type { Book, Node } from "@/lib/types";
import { countDescendants } from "@/lib/tree";

export function BranchSelector({
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
  const activeChildren = branchNode.childrenIds
    .map((cid) => book.nodes[cid])
    .filter((c): c is Node => !!c && c.status === "active");

  if (activeChildren.length < 2) return null;

  return (
    <div className="my-5 rounded-2xl border border-dashed border-leather/50 bg-parchment-dark/20 p-3 sm:my-6 sm:p-4">
      <p className="mb-2 font-script text-xs italic text-ink-faded sm:mb-3">
        여기서 이야기가 {activeChildren.length}갈래로 갈립니다.
      </p>
      <div className="flex flex-col gap-2">
        {activeChildren.map((child) => {
          const isSelected = child.id === selectedChildId;
          const branchSize = countDescendants(book, child.id);
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onChoose(child.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-seal/70 bg-parchment-light shadow-inner"
                  : "border-leather/30 bg-parchment-light/50 active:bg-parchment-light/80"
              }`}
            >
              <p className="handwritten line-clamp-2 text-sm sm:text-base">
                {child.text}
              </p>
              <p className="mt-1 font-script text-[11px] italic text-ink-faded sm:text-xs">
                {isSelected ? "· 지금 읽는 갈래" : "· 이 갈래 읽기"} · {branchSize}토막 · {labelAuthor(child)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function labelAuthor(node: Node): string {
  if (node.authorType === "ai" && node.archetype) return `@${node.archetype}`;
  return node.author;
}
