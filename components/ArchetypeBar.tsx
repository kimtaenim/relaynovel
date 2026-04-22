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
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-script text-[10px] italic text-parchment-light/60 pr-1">
        AI 부르기:
      </span>
      {list.map((key) => {
        const a = ARCHETYPES[key];
        const isThisBusy = busyKey === key && busy;
        return (
          <button
            key={key}
            type="button"
            disabled={busy}
            onClick={() => onInvoke(key)}
            title={`@${key} · ${a.koreanLabel}`}
            className={`group relative flex h-8 items-center gap-1 rounded-full border px-2 text-[11px] transition ${
              isThisBusy
                ? "border-champagne bg-champagne-light/30 text-ink animate-pulse"
                : "border-champagne/40 bg-champagne-dark/20 text-champagne-mid hover:border-champagne hover:bg-champagne-light/20 hover:text-champagne-light"
            } disabled:opacity-40`}
          >
            <span className="text-base leading-none">{a.glyph}</span>
            <span className="font-script not-italic tracking-wider">
              {a.koreanLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
