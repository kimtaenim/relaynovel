import Link from "next/link";
import type { Book } from "@/lib/types";

// 책마다 일관되게 색상이 배정되도록 간단한 해시
function pickLeather(bookId: string): "leather" | "leather-red" | "leather-green" | "leather-blue" {
  const palette = ["leather", "leather-red", "leather-green", "leather-blue"] as const;
  let h = 0;
  for (let i = 0; i < bookId.length; i++) h = (h * 31 + bookId.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

function starsFromLikes(likes: number): number {
  return Math.min(5, Math.floor(likes / 10));
}

export function BookCover({ book }: { book: Book }) {
  const leatherClass = pickLeather(book.id);
  const stars = starsFromLikes(book.likeCount);
  const nodeCount = Object.values(book.nodes).filter(
    (n) => n.status === "active",
  ).length;

  return (
    <Link
      href={`/book/${book.id}`}
      className="group relative flex aspect-[5/8] w-full flex-col items-center justify-between overflow-hidden rounded-xl shadow-book-spine transition-transform hover:-translate-y-1 hover:rotate-[0.5deg]"
    >
      <div className={`absolute inset-0 ${leatherClass}`} aria-hidden />
      {/* 네 귀퉁이 황동 장식 */}
      <BrassCorner className="absolute left-1 top-1" />
      <BrassCorner className="absolute right-1 top-1 scale-x-[-1]" />
      <BrassCorner className="absolute left-1 bottom-1 scale-y-[-1]" />
      <BrassCorner className="absolute right-1 bottom-1 scale-[-1]" />

      {/* 상단 얇은 샴페인 금띠 */}
      <div className="relative z-10 mt-4 h-px w-16 bg-gradient-to-r from-transparent via-champagne-mid to-transparent sm:mt-6 sm:w-24" />

      {/* 제목 (양각) */}
      <div className="relative z-10 flex flex-1 items-center px-2 sm:px-4">
        <h3 className="line-clamp-6 text-center font-display text-sm leading-tight text-champagne-text [text-shadow:0_1px_0_rgba(0,0,0,0.5),0_-1px_0_rgba(234,212,154,0.3)] sm:text-base md:text-lg">
          {book.title}
        </h3>
      </div>

      {/* 하단 영역: 별 + 시삽 + 토막 수 */}
      <div className="relative z-10 mb-3 flex flex-col items-center gap-1 sm:mb-4">
        {stars > 0 && (
          <div className="flex gap-0.5">
            {Array.from({ length: stars }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full wax-seal sm:h-2 sm:w-2"
                aria-hidden
              />
            ))}
          </div>
        )}
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-champagne-mid/60 to-transparent sm:w-20" />
        <p className="text-center font-script text-[10px] italic text-champagne-mid/85 sm:text-xs">
          시삽 {book.createdBy}
        </p>
        <p className="text-center font-script text-[9px] text-champagne-mid/60 sm:text-[10px]">
          {nodeCount}토막{book.completed && " · 완결"}
        </p>
      </div>
    </Link>
  );
}

function BrassCorner({ className = "" }: { className?: string }) {
  // 샴페인골드 귀퉁이 장식 (밝은 하이라이트 → 미드 → 어두운 음영)
  return (
    <svg
      className={`h-5 w-5 ${className}`}
      viewBox="0 0 20 20"
      aria-hidden
    >
      <defs>
        <linearGradient id="champagneCornerGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAEDC6" />
          <stop offset="45%" stopColor="#CFB071" />
          <stop offset="100%" stopColor="#7A6638" />
        </linearGradient>
      </defs>
      <path
        d="M0 0 L20 0 L20 2 L4 2 L4 6 C4 7 3 8 2 8 L0 8 Z"
        fill="url(#champagneCornerGrad)"
        opacity="0.95"
      />
      <circle cx="2" cy="2" r="1" fill="#3E2A12" />
    </svg>
  );
}
