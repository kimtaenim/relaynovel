"use client";

import { ARCHETYPES, ARCHETYPE_ORDER } from "@/lib/archetypes";
import type { ArchetypeKey } from "@/lib/types";

export function ArchetypeBar({
  enabled,
  onInvoke,
  busy,
  busyKey,
}: {
  enabled?: ArchetypeKey[]; // 이 책에서 활성화된 페르소나. 빈 배열/undefined면 전부
  onInvoke: (key: ArchetypeKey) => void;
  busy: boolean;
  busyKey: ArchetypeKey | null;
}) {
  const list =
    enabled && enabled.length > 0
      ? ARCHETYPE_ORDER.filter((k) => enabled.includes(k))
      : ARCHETYPE_ORDER;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-script text-[10px] italic text-parchment-light/60">
        AI에게 부탁하기 (3갈래 받기)
      </span>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {list.map((key) => {
          const a = ARCHETYPES[key];
          const isThisBusy = busyKey === key && busy;
          return (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => onInvoke(key)}
              title={a.koreanLabel}
              className={`group relative flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-[11px] transition ${
                isThisBusy
                  ? "border-champagne bg-champagne-light/30 text-ink animate-pulse"
                  : "border-champagne/40 bg-champagne-dark/20 text-champagne-mid hover:border-champagne hover:bg-champagne-light/20 hover:text-champagne-light"
              } disabled:opacity-40`}
            >
              <span className="text-sm leading-none">{a.glyph}</span>
              <span className="font-script not-italic tracking-wider text-center leading-tight">
                {a.koreanLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
