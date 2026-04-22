"use client";

import { useState } from "react";

export function InviteButton({ bookId }: { bookId: string }) {
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<null | {
    url: string;
    expiresAt: number;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "생성 실패");
      }
      const data = (await res.json()) as {
        inviteUrl: string;
        expiresAt: number;
      };
      setState({ url: data.inviteUrl, expiresAt: data.expiresAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    if (!state) return;
    try {
      await navigator.clipboard.writeText(state.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("복사 실패 — 직접 선택해서 복사하세요.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="flex-shrink-0 rounded-full border border-champagne/40 bg-champagne-dark/20 px-2.5 py-1 text-[11px] text-parchment-light/90 hover:border-champagne hover:bg-champagne-dark/40 sm:text-xs disabled:opacity-50"
      >
        {busy ? "만드는 중..." : "+ 초대"}
      </button>

      {state && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setState(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="parchment w-full max-w-md rounded-3xl p-6 shadow-parchment"
          >
            <h2 className="mb-2 font-display text-lg text-ink">초대 링크</h2>
            <p className="mb-4 font-script text-xs italic text-ink-faded">
              24시간 동안 유효합니다. 카톡·메일 등으로 공유하세요.
            </p>
            <div className="mb-3 break-all rounded-xl border border-leather/40 bg-parchment-light/70 px-3 py-2 font-mono text-[11px] text-ink sm:text-xs">
              {state.url}
            </div>
            {error && (
              <p className="mb-2 font-script text-xs italic text-seal">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="font-script text-[10px] italic text-ink-faded/70">
                만료 {new Date(state.expiresAt).toLocaleString("ko-KR")}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setState(null)}
                  className="rounded-full border border-leather/40 px-4 py-1.5 font-script text-xs italic text-ink-faded hover:bg-parchment-dark/30"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="rounded-full bg-seal px-4 py-1.5 font-display text-xs tracking-wider text-parchment-light shadow hover:bg-seal/90"
                >
                  {copied ? "복사됨 ✓" : "링크 복사"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !state && (
        <span className="font-script text-[10px] italic text-seal">
          {error}
        </span>
      )}
    </>
  );
}
