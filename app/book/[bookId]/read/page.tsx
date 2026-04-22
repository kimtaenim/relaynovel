import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { getDeepestLeaf, getPath } from "@/lib/tree";
import { ARCHETYPES } from "@/lib/archetypes";
import { ParchmentCorners } from "@/components/ParchmentDecor";

export const dynamic = "force-dynamic";

export default async function ReadPage({
  params,
  searchParams,
}: {
  params: { bookId: string };
  searchParams: { leaf?: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(
      `/join?redirect=/book/${params.bookId}/read${
        searchParams.leaf ? `?leaf=${searchParams.leaf}` : ""
      }`,
    );
  }
  const book = await getBook(params.bookId);
  if (!book) notFound();

  const leafId =
    searchParams.leaf && book.nodes[searchParams.leaf]?.status === "active"
      ? searchParams.leaf
      : getDeepestLeaf(book, book.rootNodeId);
  const path = getPath(book, leafId);

  const totalInPath = path.length;
  const authors = Array.from(
    new Set(
      path.map((n) =>
        n.authorType === "ai"
          ? `AI(${aiLabel(n.archetype)})${n.adoptedBy ? `·${n.adoptedBy}` : ""}`
          : n.author,
      ),
    ),
  );

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-3 flex items-center justify-between gap-2 font-script text-xs italic text-parchment-light/80 sm:text-sm">
          <Link
            href={`/book/${book.id}${
              searchParams.leaf ? `?leaf=${searchParams.leaf}` : ""
            }`}
            className="hover:text-parchment-light"
          >
            ← 쓰기 화면으로
          </Link>
          <span className="text-parchment-light/60">
            모아 읽기 · {totalInPath}토막
          </span>
        </nav>

        <article className="parchment relative overflow-hidden rounded-3xl p-6 shadow-parchment sm:p-10 md:p-14">
          <ParchmentCorners />
          <div className="relative z-10">
            <header className="mb-8 text-center">
              <p className="font-script text-xs italic tracking-widest text-ink-faded/70">
                한 갈래 이어 읽기
              </p>
              <h1 className="mt-1 font-display text-xl text-ink sm:text-2xl">
                {book.title}
              </h1>
              <p className="mt-3 font-script text-[11px] italic text-ink-faded/70">
                시삽 {book.createdBy} · 함께 쓴 사람 {authors.length}명
              </p>
            </header>

            <div className="flex flex-col gap-5">
              {path.map((node, idx) => {
                const isAI = node.authorType === "ai";
                const label = isAI
                  ? `AI · ${aiLabel(node.archetype)}${
                      node.adoptedBy ? ` · 호출 ${node.adoptedBy}` : ""
                    }`
                  : node.author;
                return (
                  <div key={node.id} className="relative">
                    <p
                      className={`handwritten leading-loose ${
                        idx === 0
                          ? "text-center text-lg text-ink sm:text-xl md:text-2xl"
                          : "text-base text-ink sm:text-lg"
                      }`}
                    >
                      {node.text}
                    </p>
                    <p
                      className={`mt-1 font-script text-[10px] italic ${
                        isAI ? "text-champagne-dark" : "text-seal/70"
                      } ${idx === 0 ? "text-center" : "text-right"}`}
                    >
                      — {label}
                    </p>
                  </div>
                );
              })}
            </div>

            <footer className="mt-10 border-t border-leather/30 pt-4 text-center font-script text-[11px] italic text-ink-faded/70">
              {path[path.length - 1]?.isEnding
                ? "— 이 갈래는 여기서 종결됐습니다 —"
                : "— 여기까지 쓰인 이야기입니다. 다시 쓰기 화면으로 돌아가 이어쓸 수 있습니다 —"}
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}

function aiLabel(key?: string): string {
  if (!key) return "AI";
  const meta = (ARCHETYPES as Record<string, { koreanLabel: string }>)[key];
  return meta ? meta.koreanLabel : key;
}
