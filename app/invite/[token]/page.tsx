import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvite } from "@/lib/invites";
import { getBook } from "@/lib/books";
import { getSession, grantBookAccess } from "@/lib/session";
import { redis, keys } from "@/lib/redis";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await getInvite(params.token);
  if (!invite) notFound();
  const book = await getBook(invite.bookId);
  if (!book) notFound();

  const session = await getSession();
  // 이미 세션 있으면 참여자 명단에 추가 후 책으로 바로 이동
  if (session) {
    await ensureParticipant(book, session.nickname);
    await grantBookAccess(session.id, book.id);
    // 서버 리다이렉트 대신 링크로 — 세션 수정 후 페이지에서 확인
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="parchment w-full max-w-md rounded-3xl p-8 shadow-parchment text-center">
          <p className="font-script text-xs italic tracking-widest text-ink-faded/70">
            초대되셨습니다
          </p>
          <h1 className="mt-2 font-display text-xl text-ink">
            《{book.title.length > 30 ? book.title.slice(0, 30) + "…" : book.title}》
          </h1>
          <p className="mt-3 font-script text-sm italic text-ink-faded">
            시삽 {invite.createdBy} 님이 당신을 이 책의 참여자로 초대했습니다.
          </p>
          <p className="mt-6 font-script text-xs italic text-ink-faded/70">
            현재 접속 이름: <strong>{session.nickname}</strong>
          </p>
          <Link
            href={`/book/${book.id}`}
            className="mt-6 inline-block rounded-full bg-seal px-6 py-3 font-display text-sm tracking-widest text-parchment-light shadow-md hover:bg-seal/90"
          >
            이 책으로 이동
          </Link>
          <p className="mt-4 font-script text-[10px] italic text-ink-faded/60">
            다른 이름으로 참여하려면 먼저 로그아웃하세요.
          </p>
        </div>
      </main>
    );
  }

  // 세션 없음: 닉네임 입력 페이지로 보내되 inviteToken 전달
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="parchment w-full max-w-md rounded-3xl p-8 shadow-parchment text-center">
        <p className="font-script text-xs italic tracking-widest text-ink-faded/70">
          초대 링크가 도착했습니다
        </p>
        <h1 className="mt-2 font-display text-xl text-ink">
          《{book.title.length > 30 ? book.title.slice(0, 30) + "…" : book.title}》
        </h1>
        <p className="mt-3 font-script text-sm italic text-ink-faded">
          시삽 {invite.createdBy} 님이 당신을 이 책에 초대했습니다.
        </p>
        <p className="mt-4 font-script text-xs italic text-ink-faded/70">
          참여하려면 이 서재에서 쓸 이름을 먼저 정해주세요.
        </p>
        <Link
          href={`/join?inviteToken=${params.token}&redirect=/book/${book.id}`}
          className="mt-6 inline-block rounded-full bg-seal px-6 py-3 font-display text-sm tracking-widest text-parchment-light shadow-md hover:bg-seal/90"
        >
          이름 정하고 들어가기
        </Link>
      </div>
    </main>
  );
}

async function ensureParticipant(book: Book, nickname: string) {
  if (book.createdBy === nickname) return;
  if (book.participants.includes(nickname)) return;
  book.participants = [...book.participants, nickname];
  await redis().set(keys.book(book.id), book);
}
