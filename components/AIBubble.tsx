"use client";

import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeKey } from "@/lib/types";

export interface AIProposalView {
  id: string;
  text: string;
}

export function AIBubblePanel({
  archetype,
  proposals,
  onAdopt,
  onDismiss,
  busy,
}: {
  archetype: ArchetypeKey;
  proposals: AIProposalView[];
  onAdopt: (proposalId: string) => void;
  onDismiss: () => void;
  busy?: boolean;
}) {
  const a = ARCHETYPES[archetype];
  return (
    <div className="my-4 rounded-3xl border border-champagne/60 bg-[linear-gradient(180deg,#F8EAC6_0%,#F4E8D0_100%)] p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between font-script text-xs italic text-ink-faded">
        <span className="flex items-center gap-2">
          <span className="text-base">{a.glyph}</span>
          <span className="not-italic tracking-wider">
            @{a.key} · {a.koreanLabel}
          </span>
          <span>— 세 갈래 제안</span>
        </span>
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className="underline decoration-dotted underline-offset-2 hover:text-ink disabled:opacity-50"
        >
          다 버리기
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {proposals.map((p, i) => (
          <li key={p.id}>
            <Bubble
              index={i}
              text={p.text}
              onAdopt={() => onAdopt(p.id)}
              disabled={!!busy}
            />
          </li>
        ))}
      </ul>

      <p className="mt-3 font-script text-[10px] italic text-ink-faded/70">
        하나를 채택하면 그 갈래가 정식 토막이 됩니다. 나머지 둘은 그림자로 남아요.
      </p>
    </div>
  );
}

function Bubble({
  index,
  text,
  onAdopt,
  disabled,
}: {
  index: number;
  text: string;
  onAdopt: () => void;
  disabled: boolean;
}) {
  const toneLabel = ["· 안전한 제안", "· 과감한 제안", "· 예상 밖의 제안"][
    index
  ] ?? "";
  return (
    <div className="relative rounded-2xl border border-leather/40 bg-parchment-light/95 px-4 py-3 shadow-sm">
      <p className="handwritten text-base leading-loose sm:text-lg">{text}</p>
      <div className="mt-2 flex items-center justify-between gap-2 font-script text-[11px] italic text-ink-faded/80">
        <span>{toneLabel}</span>
        <button
          type="button"
          onClick={onAdopt}
          disabled={disabled}
          className="rounded-full bg-seal px-3 py-1 font-display text-[11px] not-italic tracking-widest text-parchment-light shadow hover:bg-seal/90 disabled:opacity-50"
        >
          {disabled ? "처리중..." : "채택"}
        </button>
      </div>
    </div>
  );
}
