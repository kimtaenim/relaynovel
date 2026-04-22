"use client";

import { useEffect, useRef } from "react";

// 같은 레벨의 형제들을 슬라이드로 감싸는 캐러셀.
// 각 슬라이드는 이미 렌더된 NodeCard(JSX).
// activeIndex 위치로 최초 스크롤 센터링. 좌우 스와이프 시 snap.
export function CardCarousel({
  slides,
  activeIndex,
}: {
  slides: Array<{ id: string; node: React.ReactNode }>;
  activeIndex: number;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  // activeIndex 바뀌면 해당 슬라이드를 가로 중앙으로 스크롤
  useEffect(() => {
    const target = slideRefs.current[activeIndex];
    const container = scrollRef.current;
    if (!target || !container) return;
    // instant 스크롤 (초기 렌더) + behavior: smooth (전환)
    const left =
      target.offsetLeft -
      (container.clientWidth - target.clientWidth) / 2;
    container.scrollTo({ left, behavior: "smooth" });
  }, [activeIndex]);

  if (slides.length <= 1) {
    return <>{slides[0]?.node}</>;
  }

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="flex-shrink-0 w-[88%] sm:w-[82%] md:w-[76%] snap-center"
          >
            <div
              className={`transition-all duration-300 ${
                i === activeIndex
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-70 hover:opacity-100"
              }`}
            >
              {s.node}
            </div>
          </div>
        ))}
      </div>
      {/* 도트 인디케이터 */}
      <div className="mt-1 flex items-center justify-center gap-1">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`inline-block h-1.5 rounded-full transition-all ${
              i === activeIndex
                ? "w-4 bg-seal/70"
                : "w-1.5 bg-ink-faded/30"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
