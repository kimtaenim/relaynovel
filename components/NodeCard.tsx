"use client";

import type { Node } from "@/lib/types";

export function NodeCard({
  node,
  variant = "main",
  isRoot = false,
  onClick,
  onStartBranch,
  branchInputOpen = false,
}: {
  node: Node;
  variant?: "main" | "peek";
  isRoot?: boolean;
  onClick?: () => void;
  onStartBranch?: () => void;
  branchInputOpen?: boolean;
}) {
  const isPeek = variant === "peek";
  const isAI = node.authorType === "ai";

  return (
    <div
      onClick={onClick}
      className={[
        "relative mx-auto rounded-2xl border shadow-sm transition",
        // AI 노드는 양피지에 약간 다른 톤으로 — champagne 느낌의 옅은 테두리
        isPeek
          ? isAI
            ? "max-w-[160px] border-champagne/40 bg-parchment-light/55 px-3 py-2 cursor-pointer opacity-80 active:bg-parchment-light/80 hover:opacity-100"
            : "max-w-[160px] border-leather/30 bg-parchment-light/50 px-3 py-2 cursor-pointer opacity-80 active:bg-parchment-light/80 hover:opacity-100"
          : isAI
            ? "w-full max-w-xl border-champagne/60 bg-[linear-gradient(180deg,#F8EAC6_0%,#F4E8D0_40%,#F4E8D0_100%)] px-4 py-3 sm:px-5 sm:py-4"
            : "w-full max-w-xl border-leather/40 bg-parchment-light/90 px-4 py-3 sm:px-5 sm:py-4",
        onClick && !isPeek ? "cursor-pointer" : "",
      ].join(" ")}
    >
      {isRoot && !isPeek && (
        <p className="mb-1 text-center font-script text-[10px] italic tracking-widest text-ink-faded/70">
          첫 토막
        </p>
      )}
      <p
        className={[
          "handwritten leading-loose",
          isPeek
            ? "line-clamp-3 text-xs text-ink-faded"
            : isRoot
              ? "text-center text-base sm:text-lg md:text-xl"
              : "text-base sm:text-lg",
        ].join(" ")}
      >
        {node.text}
      </p>
      <div
        className={[
          "mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] italic",
          isRoot && !isPeek ? "justify-center" : "justify-end",
          isPeek ? "text-[9px]" : "",
        ].join(" ")}
      >
        <AuthorBadge
          authorType={node.authorType}
          author={node.author}
          archetype={node.archetype}
          adoptedBy={node.adoptedBy}
          small={isPeek}
        />
        {!isPeek && node.isEnding && (
          <span className="text-seal/80">· 종결</span>
        )}
        {!isPeek && !node.isEnding && onStartBranch && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartBranch();
            }}
            className="text-ink-faded/80 underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            {branchInputOpen ? "접기" : "+ 잇기"}
          </button>
        )}
      </div>
    </div>
  );
}

function AuthorBadge({
  authorType,
  author,
  archetype,
  adoptedBy,
  small = false,
}: {
  authorType: "human" | "ai";
  author: string;
  archetype?: string;
  adoptedBy?: string;
  small?: boolean;
}) {
  const size = small ? "text-[9px]" : "text-[11px]";
  if (authorType === "ai") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-champagne/60 bg-champagne-light/40 px-2 py-0.5 ${size}`}
      >
        <AlchemyGlyph />
        <span className="font-script not-italic tracking-wider text-ink-faded">
          AI · @{archetype ?? "??"}
        </span>
        {adoptedBy && !small && (
          <span className="text-ink-faded/70">· 호출 {adoptedBy}</span>
        )}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-seal/30 bg-seal/5 px-2 py-0.5 ${size}`}
    >
      <QuillGlyph />
      <span className="font-script not-italic tracking-wider text-ink-faded">
        {author}
      </span>
    </span>
  );
}

function QuillGlyph() {
  // 깃펜 아이콘 — 사람 손글씨
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="text-seal/70"
      aria-hidden
    >
      <path
        d="M 2 8 L 7 3 Q 8 2, 8.5 2.5 Q 9 3, 8 4 L 3 9 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="2" cy="8" r="0.8" fill="currentColor" />
    </svg>
  );
}

function AlchemyGlyph() {
  // 작은 플라스크/증류기 — AI 자동생성 표시
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="text-champagne-dark"
      aria-hidden
    >
      <path
        d="M 3.5 1.5 L 6.5 1.5 L 6 4 Q 8.5 5, 8.5 7 Q 8.5 9, 5 9 Q 1.5 9, 1.5 7 Q 1.5 5, 4 4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <line x1="4" y1="1.5" x2="6" y2="1.5" strokeWidth="1.2" stroke="currentColor" />
      <circle cx="5" cy="6.5" r="0.8" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
