"use client";

import type { Node } from "@/lib/types";

export function StoryNode({
  node,
  isRoot = false,
  onStartBranch,
  branchInputOpen = false,
  onFocus,
}: {
  node: Node;
  isRoot?: boolean;
  onStartBranch?: () => void;
  branchInputOpen?: boolean;
  onFocus?: () => void;
}) {
  const authorLabel =
    node.authorType === "ai" && node.archetype
      ? `@${node.archetype}`
      : node.author;

  return (
    <section className="group relative mb-5 first:mt-0 sm:mb-6">
      {/* 본문 — 클릭하면 이 지점을 리프로 */}
      <div
        className={onFocus ? "cursor-pointer" : ""}
        onClick={onFocus}
      >
        {isRoot ? (
          <p className="handwritten text-center text-lg leading-loose sm:text-xl md:text-2xl">
            {node.text}
          </p>
        ) : (
          <p className="handwritten text-left text-base leading-loose sm:text-lg">
            {node.text}
          </p>
        )}
      </div>

      {/* 작성자 표식 — 본문 끝 오른쪽에 subtle하게 */}
      <div
        className={`mt-1 flex items-center gap-1.5 text-[10px] italic text-ink-faded/60 sm:text-xs ${
          isRoot ? "justify-center" : "justify-end"
        }`}
      >
        <WaxDot authorType={node.authorType} />
        <span>{authorLabel}</span>
        {node.adoptedBy && (
          <span className="text-ink-faded/50">
            · {node.authorType === "ai" ? "호출" : "채택"} {node.adoptedBy}
          </span>
        )}
        {node.isEnding && <span className="text-seal/80">· 종결</span>}
        {!node.isEnding && onStartBranch && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartBranch();
            }}
            className="ml-2 text-ink-faded/80 underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            {branchInputOpen ? "접기" : "+ 여기서 잇기"}
          </button>
        )}
      </div>
    </section>
  );
}

function WaxDot({ authorType }: { authorType: "human" | "ai" }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${
        authorType === "ai"
          ? "bg-champagne-mid shadow-[inset_0_0_1px_rgba(0,0,0,0.4)]"
          : "bg-seal/70"
      }`}
      aria-hidden
    />
  );
}
