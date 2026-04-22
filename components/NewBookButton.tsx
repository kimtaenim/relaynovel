"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewBookButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("책의 첫 문장을 적어주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "생성에 실패했습니다.");
      }
      const data = (await res.json()) as { bookId: string };
      router.push(`/book/${data.bookId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex aspect-[5/8] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-champagne/50 bg-mahogany-dark/40 text-champagne-mid/80 transition-colors hover:border-champagne-light hover:text-champagne-light"
      >
        <QuillInkwell />
        <span className="mt-2 font-script text-xs italic sm:mt-3 sm:text-sm">
          새 책 만들기
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="parchment w-full max-w-lg rounded-3xl p-8 shadow-parchment"
          >
            <h2 className="mb-2 font-display text-2xl text-ink">
              새 책을 펼칩니다
            </h2>
            <p className="mb-5 font-script text-sm italic text-ink-faded">
              이 책의 첫 문장을 적어주세요. 이 문장이 곧 책의 제목이자 첫 토막이 됩니다.
            </p>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              rows={3}
              autoFocus
              disabled={submitting}
              placeholder="예) 14년 전 이 이야기는 여기서 끝나지 않았다."
              className="w-full resize-none rounded-2xl border border-leather/40 bg-parchment-light/70 px-4 py-3 font-serif text-ink placeholder:italic placeholder:text-ink-faded/60 focus:border-leather focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between font-script text-xs italic text-ink-faded">
              <span>{error}</span>
              <span>{title.length} / 100</span>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="ink-button px-3 py-1"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-seal px-5 py-2 font-display text-sm tracking-wider text-parchment-light shadow-md transition hover:bg-seal/90 disabled:opacity-50"
              >
                {submitting ? "펼치는 중..." : "책을 펼치다"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function QuillInkwell() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className="text-brass-light/70 group-hover:text-brass-light"
      aria-hidden
    >
      {/* 잉크병 */}
      <ellipse cx="16" cy="40" rx="10" ry="3" fill="currentColor" opacity="0.3" />
      <path
        d="M8 30 Q8 38 16 40 Q24 38 24 30 L24 26 L8 26 Z"
        fill="currentColor"
        opacity="0.5"
      />
      <rect x="8" y="24" width="16" height="3" fill="currentColor" opacity="0.8" />
      {/* 깃펜 */}
      <path
        d="M20 26 L38 8 Q40 6 42 8 Q44 10 42 12 L24 30 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M36 10 Q40 10 40 14"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
