"use client";

// 카드 사이를 잇는 단순 수직 잉크 선
export function InkLine({ active = true }: { active?: boolean }) {
  return (
    <div className="flex justify-center" aria-hidden>
      <div
        className={`w-px ${
          active
            ? "h-7 bg-gradient-to-b from-transparent via-ink-faded/60 to-transparent"
            : "h-5 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_2px,rgba(90,70,56,0.35)_2px,rgba(90,70,56,0.35)_4px)]"
        }`}
      />
    </div>
  );
}
