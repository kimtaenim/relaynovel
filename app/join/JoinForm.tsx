"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinForm({
  inviteToken,
  redirectTo,
}: {
  inviteToken?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("이름을 적어주세요.");
      return;
    }
    if (trimmed.length > 20) {
      setError("20자 이하로 줄여주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed, inviteToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "세션 발급에 실패했습니다.");
      }
      router.push(redirectTo ?? "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        disabled={submitting}
        autoFocus
        placeholder="예) 닥터박사"
        className="rounded-2xl border border-leather/40 bg-parchment-light/70 px-4 py-3 font-serif text-lg text-ink placeholder:italic placeholder:text-ink-faded/50 focus:border-leather focus:outline-none"
      />
      {error && (
        <p className="font-script text-sm italic text-seal">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-seal px-5 py-3 font-display tracking-widest text-parchment-light shadow-md transition hover:bg-seal/90 disabled:opacity-50"
      >
        {submitting ? "들어가는 중..." : "서재에 들어가기"}
      </button>
    </form>
  );
}
