import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { BookReader } from "@/components/BookReader";
import { InviteButton } from "@/components/InviteButton";
import { LogoutButton } from "@/components/LogoutButton";
import { listPresent } from "@/lib/presence";

export const dynamic = "force-dynamic";

export default async function BookPage({
  params,
}: {
  params: { bookId: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(`/join?redirect=/book/${params.bookId}`);
  }
  const book = await getBook(params.bookId);
  if (!book) notFound();

  const isMaster = book.createdBy === session.nickname;
  const isParticipant = book.participants.includes(session.nickname);

  const present = await listPresent();
  const now = Date.now();
  const othersOnline = present.filter(
    (p) => p.nickname !== session.nickname && now - p.lastSeen < 2 * 60 * 1000,
  );

  // 2인 MVP 신뢰 환경: 로그인한 누구든 읽기 가능. 글 쓰면 자동으로 참여자 등록.

  return (
    <main className="min-h-screen px-3 py-4 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-3 flex items-center justify-between gap-2 font-script text-xs italic text-parchment-light/80 sm:text-sm">
          <Link
            href="/"
            className="flex-shrink-0 hover:text-parchment-light"
            aria-label="서재로"
          >
            ← 서재
          </Link>
          <span className="flex items-center gap-2 truncate text-center text-parchment-light/70">
            <span className="truncate">
              시삽 {book.createdBy}
              {isMaster && " (당신)"}
            </span>
            <span className="text-parchment-light/30">·</span>
            <span className="text-parchment-light/60">
              참여 {book.participants.length}명
            </span>
            {!isMaster && !isParticipant && (
              <>
                <span className="text-parchment-light/30">·</span>
                <span className="rounded-full border border-pewter/40 bg-pewter/10 px-2 py-0.5 text-[10px] text-pewter">
                  구경중
                </span>
              </>
            )}
          </span>
          <span className="flex flex-shrink-0 items-center gap-2">
            {isMaster && <InviteButton bookId={book.id} />}
            <Link
              href={`/book/${book.id}/map`}
              className="text-parchment-light/50 hover:text-parchment-light"
              aria-disabled
              title="Stage 5에서 구현 예정"
            >
              지도
            </Link>
            <LogoutButton variant="subtle" />
          </span>
        </nav>

        {/* 지금 접속 중인 다른 참여자 (없으면 나만) */}
        <div className="mb-3 flex items-center gap-2 font-script text-[11px] italic text-parchment-light/60">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              othersOnline.length > 0
                ? "bg-verdigris animate-pulse"
                : "bg-parchment-light/30"
            }`}
            aria-hidden
          />
          <span>
            {othersOnline.length > 0
              ? `함께 접속: ${othersOnline.map((o) => o.nickname).join(", ")}`
              : "지금 이 서재엔 나뿐입니다"}
          </span>
        </div>

        <BookReader book={book} currentUser={session.nickname} />
      </div>
    </main>
  );
}
