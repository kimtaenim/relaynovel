"use client";

import { useState, useRef, useEffect } from "react";
import type { Node } from "@/lib/types";
import { ARCHETYPES } from "@/lib/archetypes";

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
  onEdit,
  canEdit = false,
  openDirection = null,
}: {
  node: Node;
  variant?: "main" | "peek";
  isRoot?: boolean;
  onClick?: () => void;
  onStartChild?: () => void;
  onStartSibling?: () => void;
  canSibling?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
  onEdit?: (text: string) => Promise<void>;
  canEdit?: boolean;
  openDirection?: "child" | "sibling" | null;
}) {
  const isPeek = variant === "peek";
  const isAI = node.authorType === "ai";

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(
        editRef.current.value.length,
        editRef.current.value.length,
      );
    }
  }, [editing]);

  // node.text가 바뀌면 (외부 업데이트 반영) editText 초기화
  useEffect(() => {
    if (!editing) setEditText(node.text);
  }, [node.text, editing]);

  async function saveEdit() {
    if (!onEdit) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError("내용이 비어 있습니다.");
      return;
    }
    if (trimmed === node.text) {
      setEditing(false);
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      await onEdit(trimmed);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "수정 실패");
    } finally {
      setEditBusy(false);
    }
  }

  function cancelEdit() {
    setEditText(node.text);
    setEditing(false);
    setEditError(null);
  }

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
      {editing && !isPeek ? (
        <div className="flex flex-col gap-2">
          <textarea
            ref={editRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value.slice(0, 120))}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.metaKey || e.ctrlKey) &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void saveEdit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={editBusy}
            rows={3}
            className="w-full resize-none rounded-xl border border-leather/40 bg-parchment-light/90 px-3 py-2 font-serif text-base leading-relaxed text-ink focus:border-leather focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2 font-script text-[11px] italic">
            <span className="text-seal/80">{editError ?? ""}</span>
            <span className="flex items-center gap-2">
              <span className="text-ink-faded/60">
                {editText.trim().length} / 100
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelEdit();
                }}
                disabled={editBusy}
                className="inline-flex h-7 items-center rounded-full border border-leather/40 bg-parchment-light/60 px-2.5 font-display text-[10px] uppercase tracking-widest text-ink-faded hover:border-seal/60 hover:bg-seal/10 hover:text-seal disabled:opacity-50"
              >
                esc
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void saveEdit();
                }}
                disabled={editBusy}
                className="rounded-full bg-seal px-3 py-1.5 font-display text-[11px] not-italic tracking-widest text-parchment-light shadow hover:bg-seal/90 disabled:opacity-50"
              >
                {editBusy ? "저장중..." : "저장"}
              </button>
            </span>
          </div>
        </div>
      ) : (
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
      )}

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

        {/* 액션 버튼들 — 방향별 잇기 + 수정 + 삭제 */}
        {!isPeek && !node.isEnding && !editing && (
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
            {canEdit && onEdit && (
              <IconButton
                title="이 토막 수정 (본인/호출자만)"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                label="✎"
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
                label="×"
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
    const meta = archetype
      ? (ARCHETYPES as Record<string, { koreanLabel: string; glyph: string }>)[
          archetype
        ]
      : undefined;
    const label = meta ? meta.koreanLabel : archetype ?? "AI";
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-champagne/60 bg-champagne-light/40 px-2 py-0.5 ${size}`}
      >
        <AlchemyGlyph />
        <span className="font-script not-italic tracking-wider text-ink-faded">
          AI · {label}
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
