"use client";

import type { Node } from "@/lib/types";

export function NodeCard({
  node,
  variant = "main",
  isRoot = false,
  onClick,
  onStartChild,
  onStartSibling,
  canSibling = true,
  onDelete,
  canDelete = false,
  openDirection = null,
}: {
  node: Node;
  variant?: "main" | "peek";
  isRoot?: boolean;
  onClick?: () => void;
  onStartChild?: () => void; // ↓ 아래로 잇기 열기
  onStartSibling?: () => void; // → 옆에 갈래 열기
  canSibling?: boolean; // 루트는 false
  onDelete?: () => void;
  canDelete?: boolean;
  openDirection?: "child" | "sibling" | null; // 어느 방향 입력창이 열려있는지
}) {
  const isPeek = variant === "peek";
  const isAI = node.authorType === "ai";

  return (
    <div
      onClick={onClick}
      className={[
        "relative mx-auto rounded-2xl border shadow-sm transition",
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

      {/* 저자 배지 + 액션 버튼 */}
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

        {/* 액션 버튼들 — 방향별 잇기 + 삭제 */}
        {!isPeek && !node.isEnding && (
          <div className="flex items-center gap-1">
            {canSibling && onStartSibling && (
              <IconButton
                active={openDirection === "sibling"}
                title="이 카드와 같은 지점의 다른 갈래로 쓰기 (형제)"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartSibling();
                }}
                label="→"
              />
            )}
            {onStartChild && (
              <IconButton
                active={openDirection === "child"}
                title="이 카드 뒤에 이어쓰기 (자식)"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartChild();
                }}
                label="↓"
              />
            )}
            {canDelete && onDelete && (
              <IconButton
                variant="danger"
                title="이 토막 삭제 (본인/호출자만, 자식 없을 때)"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm("이 토막을 삭제할까요? 취소할 수 없습니다.")
                  )
                    onDelete();
                }}
                label="🗑"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  active = false,
  title,
  variant = "normal",
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  title?: string;
  variant?: "normal" | "danger";
}) {
  const classes = active
    ? "border-seal/70 bg-seal/10 text-ink"
    : variant === "danger"
      ? "border-leather/20 bg-transparent text-ink-faded/60 hover:border-seal/50 hover:text-seal/90"
      : "border-leather/30 bg-parchment-light/40 text-ink-faded hover:border-leather hover:text-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[12px] leading-none transition ${classes}`}
    >
      {label}
    </button>
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
