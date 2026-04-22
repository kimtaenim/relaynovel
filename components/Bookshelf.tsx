import type { Book } from "@/lib/types";
import { BookCover } from "./BookCover";
import { NewBookButton } from "./NewBookButton";

export function Bookshelf({
  books,
  omitNewBook = false,
}: {
  books: Book[];
  omitNewBook?: boolean;
}) {
  return (
    <div className="mx-auto overflow-hidden rounded-sm border-2 border-mahogany-dark bg-mahogany shadow-2xl">
      <div className="mahogany-cabinet p-3 sm:p-6">
        <div className="glass-shelf">
          <div className="grid grid-cols-2 gap-3 p-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {!omitNewBook && <NewBookButton />}
            {books.map((b) => (
              <BookCover key={b.id} book={b} />
            ))}
          </div>
          {/* 선반 목재 */}
          <div className="h-2 w-full bg-gradient-to-b from-mahogany-light via-mahogany-dark to-mahogany shadow-[0_4px_8px_rgba(0,0,0,0.6)] sm:h-3" />
        </div>
      </div>
    </div>
  );
}
