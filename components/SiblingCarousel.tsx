"use client";

import type { Book, Node } from "@/lib/types";
import { countDescendants } from "@/lib/tree";
import { ARCHETYPES } from "@/lib/archetypes";

// 현재 카드의 형제들(같은 부모의 자식들)을 가로 스크롤 캐러셀로 표시.
// 선택된(=현재 읽고 있는) 형제는 밝게 강조.
// 좌우 스와이프 / 스크롤로 다른 갈래 미리보기 + 탭하면 전환.
export function SiblingCarousel({
  book,
  parentNode,
  selectedChildId,
  onChoose,
}: {
  book: Book;
  parentNode: Node;
  selectedChildId: string | null;
  onChoose: (childId: string) => void;
}) {
  const siblings = parentNode.childrenIds
    .map((cid) => book.nodes[cid])
    .filter((c): c is Node => !!c && c.status === "active");

  if (siblings.length <= 1) return null;

  return (
    <div className="my-3 w-full">
      <div className="mb-1 text-center font-script text-[10px] italic tracking-wider text-ink-faded/60">
        · 같은 지점의 {siblings.length}갈래 — 옆으로 넘겨 보기 ·
      </div>
      <div
        className="flex gap-2 overflow-x-auto scroll-smooth px-1 py-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "thin" }}
      >
        {siblings.map((child) => {
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
                "snap-center flex-shrink-0 w-[58%] sm:w-[40%] md:w-[30%] max-w-[260px] rounded-2xl border p-3 text-left transition",
                isSelected
                  ? isAI
                    ? "border-champagne bg-champagne-light/70 shadow-md"
                    : "border-seal/60 bg-parchment-light shadow-md"
                  : isAI
                    ? "border-champagne/30 bg-champagne-light/10 opacity-70 hover:opacity-100"
                    : "border-leather/25 bg-parchment-light/30 opacity-70 hover:opacity-100",
              ].join(" ")}
            >
              <p
                className={`handwritten line-clamp-4 text-sm leading-snug ${
                  isSelected ? "text-ink" : "text-ink-faded"
                }`}
              >
                {child.text}
              </p>
              <div className="mt-2 flex items-center justify-between gap-1 font-script text-[10px] italic">
                <span
                  className={`not-italic tracking-wider ${
                    isAI ? "text-champagne-dark" : "text-seal/80"
                  }`}
                >
                  {isAI ? aiLabel(child.archetype) : child.author}
                </span>
                <span className="text-ink-faded/70">
                  {size}토막{isSelected && " · 지금"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function aiLabel(key?: string): string {
  if (!key) return "AI";
  const meta = (ARCHETYPES as Record<string, { koreanLabel: string }>)[key];
  return meta ? meta.koreanLabel : key;
}
