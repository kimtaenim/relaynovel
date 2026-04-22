"use client";

import { useEffect, useRef, useState } from "react";

// 같은 레벨 형제들 슬라이드 캐러셀.
// 터치 스와이프는 native overflow-x, 마우스는 click-and-drag 수동 구현.
export function CardCarousel({
  slides,
  activeIndex,
}: {
  slides: Array<{ id: string; node: React.ReactNode }>;
  activeIndex: number;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  // 마우스 드래그 상태
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const draggedDistance = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // 활성 슬라이드를 가로 중앙으로 정렬
  useEffect(() => {
    const target = slideRefs.current[activeIndex];
    const container = scrollRef.current;
    if (!target || !container) return;
    const left =
      target.offsetLeft -
      (container.clientWidth - target.clientWidth) / 2;
    container.scrollTo({ left, behavior: "smooth" });
  }, [activeIndex]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // 마우스만 — 터치는 native overflow가 더 자연스러움
    if (e.pointerType !== "mouse") return;
    // 버튼/텍스트영역/링크에서 시작한 드래그는 무시
    const target = e.target as HTMLElement;
    if (target.closest("button, a, textarea, input")) return;

    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    draggedDistance.current = 0;
    setIsDragging(true);
    // pointer capture로 바깥으로 나가도 이벤트 계속 받음
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = e.clientX - dragStartX.current;
    draggedDistance.current = Math.abs(dx);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = dragStartScrollLeft.current - dx;
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    // scroll-snap이 알아서 가장 가까운 슬라이드로 붙여줌
  }

  // 드래그 직후에 발생한 click은 의도치 않은 슬라이드 활성화를 유발하므로 차단
  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (draggedDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      draggedDistance.current = 0;
    }
  }

  if (slides.length <= 1) {
    return <>{slides[0]?.node}</>;
  }

  return (
    <div className="w-full select-none">
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        className={`no-scrollbar flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
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
      <div className="mt-1 flex items-center justify-center gap-1">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`inline-block h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-4 bg-seal/70" : "w-1.5 bg-ink-faded/30"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
