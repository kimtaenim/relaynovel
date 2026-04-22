"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({
  variant = "default",
}: {
  variant?: "default" | "subtle";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
    } catch {
      /* ignore */
    }
    router.push("/join");
    router.refresh();
  }

  const classes =
    variant === "subtle"
      ? "text-parchment-light/50 underline decoration-dotted underline-offset-4 hover:text-parchment-light"
      : "rounded-full border border-leather/60 bg-mahogany-dark/40 px-3 py-1 text-parchment-light/80 hover:border-leather hover:bg-mahogany-dark/70 hover:text-parchment-light";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`font-script text-[11px] italic disabled:opacity-50 ${classes}`}
    >
      {busy ? "나가는 중..." : "로그아웃"}
    </button>
  );
}
