// 양피지 배경 장식: 희미한 연금술 기호 워터마크 + 네 귀퉁이 필리그리

export function ParchmentWatermark() {
  // 양피지 전면에 희미하게 흩뿌려진 연금술 기호들
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="#2B1810" opacity="0.06">
        {/* 태양 (Sol) */}
        <g transform="translate(60,80)">
          <circle cx="0" cy="0" r="14" fill="none" stroke="#2B1810" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="3" />
        </g>
        {/* 수성 (Mercurius) */}
        <text
          x="320"
          y="120"
          fontSize="36"
          fontFamily="serif"
          textAnchor="middle"
        >
          ☿
        </text>
        {/* 달 (Luna) */}
        <g transform="translate(340, 260)">
          <path
            d="M -10 -10 A 12 12 0 1 0 -10 10 A 9 9 0 1 1 -10 -10 Z"
            fill="#2B1810"
          />
        </g>
        {/* 유황 (Sulfur) ∆ on cross */}
        <g
          transform="translate(80,280)"
          stroke="#2B1810"
          strokeWidth="1.2"
          fill="none"
        >
          <path d="M -8 -6 L 8 -6 L 0 -14 Z" />
          <line x1="0" y1="-6" x2="0" y2="4" />
          <line x1="-4" y1="-1" x2="4" y2="-1" />
          <line x1="-4" y1="4" x2="4" y2="4" />
        </g>
        {/* 소금 (Salt) */}
        <g transform="translate(200,200)" stroke="#2B1810" strokeWidth="1.2" fill="none">
          <circle cx="0" cy="0" r="10" />
          <line x1="-10" y1="0" x2="10" y2="0" />
        </g>
        {/* 금성 */}
        <text
          x="120"
          y="460"
          fontSize="32"
          fontFamily="serif"
          textAnchor="middle"
        >
          ♀
        </text>
        {/* 화성 */}
        <text
          x="320"
          y="420"
          fontSize="32"
          fontFamily="serif"
          textAnchor="middle"
        >
          ♂
        </text>
        {/* 목성 */}
        <text
          x="50"
          y="560"
          fontSize="30"
          fontFamily="serif"
          textAnchor="middle"
        >
          ♃
        </text>
        {/* 토성 */}
        <text
          x="360"
          y="540"
          fontSize="30"
          fontFamily="serif"
          textAnchor="middle"
        >
          ♄
        </text>
        {/* Aqua Regia 유사 장식 */}
        <g transform="translate(220,540)" stroke="#2B1810" strokeWidth="0.9" fill="none">
          <path d="M -8 6 L 0 -10 L 8 6 Z" />
          <path d="M -3 3 L 3 3" />
        </g>
      </g>
    </svg>
  );
}

// 네 귀퉁이 필리그리 장식 — 양피지 프레임 안쪽에 손으로 그린 듯한 잉크 곡선
export function ParchmentCorners() {
  return (
    <>
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />
    </>
  );
}

function Corner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const transforms: Record<typeof position, string> = {
    tl: "scale(1,1)",
    tr: "scale(-1,1)",
    bl: "scale(1,-1)",
    br: "scale(-1,-1)",
  };
  const positions: Record<typeof position, string> = {
    tl: "left-2 top-2",
    tr: "right-2 top-2",
    bl: "left-2 bottom-2",
    br: "right-2 bottom-2",
  };
  return (
    <svg
      viewBox="0 0 60 60"
      className={`pointer-events-none absolute ${positions[position]} z-0 h-10 w-10 text-ink opacity-[0.1] sm:h-14 sm:w-14`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      aria-hidden
    >
      <g transform={transforms[position]} style={{ transformOrigin: "30px 30px" }}>
        {/* 메인 곡선 */}
        <path d="M 8 8 Q 8 32, 32 32 Q 52 32, 52 8" />
        {/* 안쪽 작은 곡선 */}
        <path d="M 14 14 Q 14 28, 28 28 Q 44 28, 44 14" opacity="0.7" />
        {/* 잔가지 */}
        <path d="M 20 20 Q 18 16, 14 16" opacity="0.8" />
        <path d="M 20 20 Q 24 18, 26 14" opacity="0.8" />
        {/* 점 장식 */}
        <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="52" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="52" r="1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
