import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listBooksForUser } from "@/lib/books";
import { Bookshelf } from "@/components/Bookshelf";
import { BrassPlaque } from "@/components/BrassPlaque";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/join");
  }
  const books = await listBooksForUser(session.nickname);

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <BrassPlaque
          title="전박사의 릴레이노블"
          subtitle="집합적 서사의 연금술"
        />

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-script text-xs italic text-parchment-light/80 sm:mb-4 sm:text-sm">
          <span>환영합니다, {session.nickname} 님.</span>
          <SortBar />
        </div>

        <Bookshelf books={books} />

        <p className="mt-8 text-center font-script text-xs italic text-parchment-light/40 sm:mt-10">
          Opus Magnum in Progress
        </p>
      </div>
    </main>
  );
}

function SortBar() {
  // Stage 1에서는 최신순으로만 표시. Stage 7에서 인기순·길이순 추가 예정.
  return (
    <span className="text-parchment-light/50">정렬 · 최신순</span>
  );
}
