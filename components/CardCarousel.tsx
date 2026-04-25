"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 같은 레벨 형제들 슬라이드 캐러셀.
// - 터치 스와이프: native overflow-x
// - 마우스: pointer drag
// - 스와이프/스크롤이 멈췄을 때 중앙에 온 슬라이드를 자동 선택 (탭 불필요)
export function CardCarousel({
  slides,
  activeIndex,
  onActiveSlideChange,
}: {
  slides: Array<{ id: string; node: React.ReactNode }>;
  activeIndex: number;
  onActiveSlideChange?: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  // 마우스 드래그 상태
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const draggedDistance = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // 자체적으로 잠시 활성 인덱스를 누른 채로 (URL 갱신 전 시각 응답)
  const programmaticScroll = useRef(false);

  // 활성 슬라이드를 가로 중앙으로 정렬
  useEffect(() => {
    const target = slideRefs.current[activeIndex];
    const container = scrollRef.current;
    if (!target || !container) return;
    const left =
      target.offsetLeft -
      (container.clientWidth - target.clientWidth) / 2;
    programmaticScroll.current = true;
    container.scrollTo({ left, behavior: "smooth" });
    // 600ms 뒤 프로그래매틱 스크롤 끝났다고 가정 (스무스 스크롤 평균치)
    const t = window.setTimeout(() => {
      programmaticScroll.current = false;
    }, 600);
    return () => window.clearTimeout(t);
  }, [activeIndex]);

  // 스크롤이 멈췄을 때 중앙에 온 슬라이드를 활성으로 알림
  const detectCenteredSlide = useCallback(() => {
    const container = scrollRef.current;
    if (!container || programmaticScroll.current) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < slides.length; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      const slideCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(containerCenter - slideCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) return;
    if (bestIdx !== activeIndex && onActiveSlideChange) {
      onActiveSlideChange(slides[bestIdx].id);
    }
  }, [slides, activeIndex, onActiveSlideChange]);

  // 스크롤 이벤트로 정착 감지 (debounce + scrollend 폴백)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(detectCenteredSlide, 180);
    };
    const onScrollEnd = () => {
      if (timeoutId) clearTimeout(timeoutId);
      detectCenteredSlide();
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    // scrollend는 최신 브라우저 지원
    container.addEventListener("scrollend", onScrollEnd);
    return () => {
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("scrollend", onScrollEnd);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [detectCenteredSlide]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, textarea, input")) return;
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    draggedDistance.current = 0;
    setIsDragging(true);
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
    // scroll-snap이 정착시키고, 그 후 detectCenteredSlide가 활성 변경 알림
  }

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
