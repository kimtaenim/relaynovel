"use client";

import { ARCHETYPES, ARCHETYPE_ORDER } from "@/lib/archetypes";
import type { ArchetypeKey } from "@/lib/types";

// AI 호출 버튼들 — 한 줄에 나란히.
// trailing slot에 '사람 쓰기' 버튼 등 한 칸 추가 가능.
export function ArchetypeBar({
  enabled,
  onInvoke,
  busy,
  busyKey,
  trailing,
}: {
  enabled?: ArchetypeKey[];
  onInvoke: (key: ArchetypeKey) => void;
  busy: boolean;
  busyKey: ArchetypeKey | null;
  trailing?: React.ReactNode;
}) {
  const list =
    enabled && enabled.length > 0
      ? ARCHETYPE_ORDER.filter((k) => enabled.includes(k))
      : ARCHETYPE_ORDER;

  const totalSlots = list.length + (trailing ? 1 : 0);

  return (
    <div
      className="grid w-full gap-1.5"
      style={{
        gridTemplateColumns: `repeat(${totalSlots}, minmax(0, 1fr))`,
      }}
    >
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
            className={`group flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1.5 transition ${
              isThisBusy
                ? "border-champagne bg-champagne-light/30 text-ink animate-pulse"
                : "border-champagne/50 bg-champagne-dark/25 text-parchment-light hover:border-champagne hover:bg-champagne-light/20 hover:text-champagne-light"
            } disabled:opacity-40`}
          >
            <span className="text-base leading-none">{a.glyph}</span>
            <span className="font-script text-[11px] not-italic leading-tight tracking-wider">
              {a.koreanLabel}
            </span>
          </button>
        );
      })}
      {trailing}
    </div>
  );
}
