import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { BookReader } from "@/components/BookReader";
import { InviteButton } from "@/components/InviteButton";

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
  const hasAccess =
    isMaster ||
    isParticipant ||
    session.bookAccess.includes(book.id);

  if (!hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="parchment w-full max-w-md rounded-3xl p-8 text-center shadow-parchment">
          <p className="font-script text-xs italic tracking-widest text-ink-faded/70">
            잠긴 책
          </p>
          <h1 className="mt-2 font-display text-xl text-ink">
            이 책은 초대받은 분만 볼 수 있습니다
          </h1>
          <p className="mt-3 font-script text-sm italic text-ink-faded">
            시삽에게 초대 링크를 요청하세요.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full border border-leather/40 bg-parchment-dark/40 px-5 py-2 font-display text-sm tracking-widest text-ink hover:bg-parchment-dark/60"
          >
            서재로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

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
          </span>
        </nav>

        <BookReader book={book} currentUser={session.nickname} />
      </div>
    </main>
  );
}
