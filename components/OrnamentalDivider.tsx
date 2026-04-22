// 단순한 구분선 — 가는 잉크 선 + 작은 중앙 점
// 콘텐츠가 주인공이 되게 최소한의 장식만

export function OrnamentalDivider({
  label,
  className = "",
}: {
  label?: string;
  variant?: "default" | "start" | "end";
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <Line />
      {label && (
        <span className="whitespace-nowrap px-1 font-script text-[11px] italic tracking-wider text-ink-faded/70">
          {label}
        </span>
      )}
      <Line />
    </div>
  );
}

function Line() {
  return (
    <span
      aria-hidden
      className="h-px w-16 flex-shrink bg-gradient-to-r from-transparent via-leather/50 to-transparent sm:w-24"
    />
  );
}
