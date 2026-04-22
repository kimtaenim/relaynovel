import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listShelfForUser } from "@/lib/books";
import { listPresent } from "@/lib/presence";
import { Bookshelf } from "@/components/Bookshelf";
import { BrassPlaque } from "@/components/BrassPlaque";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/join");
  }
  const [shelf, present] = await Promise.all([
    listShelfForUser(session.nickname),
    listPresent(),
  ]);
  // 2분 이내 활동한 다른 접속자
  const now = Date.now();
  const othersOnline = present.filter(
    (p) => p.nickname !== session.nickname && now - p.lastSeen < 2 * 60 * 1000,
  );

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <BrassPlaque
          title="전박사의 릴레이노블"
          subtitle="집합적 서사의 연금술"
        />

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-script text-xs italic text-parchment-light/80 sm:mb-4 sm:text-sm">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>환영합니다, {session.nickname} 님.</span>
            <LogoutButton variant="subtle" />
          </span>
          <SortBar />
        </div>

        {/* 지금 접속 중인 다른 참여자 표시 */}
        <PresenceBar others={othersOnline} />

        {/* 내 책장 — 내가 시삽이거나 참여자 */}
        <SectionLabel>내 책장 · {shelf.mine.length}권</SectionLabel>
        <Bookshelf books={shelf.mine} />

        {/* 다른 분들의 책장 — 구경 가능, 글 쓰면 자동 참여 */}
        {shelf.others.length > 0 && (
          <>
            <SectionLabel className="mt-8">
              다른 분들의 책장 · {shelf.others.length}권
            </SectionLabel>
            <Bookshelf books={shelf.others} omitNewBook />
          </>
        )}

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

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mb-2 font-script text-xs italic tracking-widest text-parchment-light/70 sm:text-sm ${className}`}
    >
      — {children} —
    </h2>
  );
}

function PresenceBar({
  others,
}: {
  others: Array<{ nickname: string; lastSeen: number }>;
}) {
  const label =
    others.length === 0
      ? "지금 다른 접속자는 없습니다"
      : `지금 접속 중: ${others.map((o) => o.nickname).join(", ")}`;
  return (
    <div className="mb-3 flex items-center gap-2 font-script text-[11px] italic text-parchment-light/60">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          others.length > 0 ? "bg-verdigris animate-pulse" : "bg-parchment-light/30"
        }`}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
