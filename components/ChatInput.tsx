"use client";

import { useEffect, useRef, useState } from "react";

export function ChatInput({
  label,
  onSubmit,
  onCancel,
  submitLabel = "이어 쓰기",
  maxChars = 100,
  hardMaxChars = 120,
  autoFocus = false,
  compact = false,
}: {
  label: string;
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void; // X 취소
  submitLabel?: string;
  maxChars?: number;
  hardMaxChars?: number;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  const count = text.trim().length;
  const overSoft = count > maxChars;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("잇고 싶은 문장을 적어주세요.");
      return;
    }
    if (trimmed.length > hardMaxChars) {
      setError(`${hardMaxChars}자를 넘길 수 없습니다.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setText("");
      setTimeout(() => ref.current?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "전송 실패");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-leather/40 bg-parchment-light/85 p-3 shadow-inner ${
        compact ? "" : ""
      }`}
    >
      <div className="mb-1 flex items-center gap-2 font-script text-[11px] italic text-ink-faded/80">
        <InkwellIcon />
        <span className="truncate">{label}</span>
      </div>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          if (v.length <= hardMaxChars) setText(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void handleSubmit();
          } else if (e.key === "Escape" && onCancel) {
            e.preventDefault();
            onCancel();
          }
        }}
        rows={2}
        disabled={submitting}
        placeholder="다음 토막을 쓰세요…"
        className="w-full resize-none overflow-hidden bg-transparent font-serif text-base text-ink leading-relaxed placeholder:italic placeholder:text-ink-faded/50 focus:outline-none"
      />
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="font-script text-xs italic text-seal min-h-[1rem]">
          {error}
        </span>
        <div className="flex items-center gap-3">
          <HourglassCounter count={count} softMax={maxChars} />
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              title="쓰기 취소 (Esc)"
              className="inline-flex h-7 items-center justify-center rounded-full border border-leather/40 bg-parchment-light/60 px-2.5 font-display text-[10px] uppercase tracking-widest text-ink-faded hover:border-seal/60 hover:bg-seal/10 hover:text-seal disabled:opacity-50"
            >
              esc
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-full px-4 py-1.5 font-display text-xs tracking-widest text-parchment-light shadow-md transition ${
              overSoft
                ? "bg-seal/80 hover:bg-seal"
                : "bg-seal hover:bg-seal/90"
            } disabled:opacity-50`}
          >
            {submitting ? "..." : submitLabel}
          </button>
        </div>
      </div>
      {overSoft && (
        <p className="mt-1 text-right font-script text-[10px] italic text-seal/80">
          100자 안팎이 권장이지만 {hardMaxChars}자까지는 허용됩니다.
        </p>
      )}
    </form>
  );
}

function HourglassCounter({
  count,
  softMax,
}: {
  count: number;
  softMax: number;
}) {
  const pct = Math.min(1, count / softMax);
  const over = count > softMax;
  return (
    <span className="flex items-center gap-1 font-script text-xs italic text-ink-faded">
      <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
        <path
          d="M1 1 L13 1 L13 3 L8 7 L13 11 L13 15 L1 15 L1 11 L6 7 L1 3 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        />
        {/* 상단 모래 (남은 시간) */}
        <path
          d={`M2 2 L12 2 L${7 + (1 - pct) * 4} ${2 + 4 * pct} L${7 - (1 - pct) * 4} ${2 + 4 * pct} Z`}
          fill={over ? "#8B0000" : "#7A5230"}
          opacity="0.8"
        />
        {/* 하단 모래 (쓴 양) */}
        <path
          d={`M${7 - pct * 4} ${14 - 3 * pct} L${7 + pct * 4} ${14 - 3 * pct} L12 14 L2 14 Z`}
          fill={over ? "#8B0000" : "#7A5230"}
          opacity="0.9"
        />
      </svg>
      <span className={over ? "text-seal" : ""}>
        {count} / {softMax}
      </span>
    </span>
  );
}

function InkwellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="text-leather">
      <path
        d="M3 10 Q3 13 7 13 Q11 13 11 10 L11 8 L3 8 Z"
        fill="currentColor"
        opacity="0.5"
      />
      <rect x="3" y="7" width="8" height="1.5" fill="currentColor" />
      <path
        d="M8 8 L12 2 Q13 1 13.5 2 Q14 3 13 4 L9 10 Z"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="currentColor"
        fillOpacity="0.3"
      />
    </svg>
  );
}
