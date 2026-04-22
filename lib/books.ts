import { v4 as uuidv4 } from "uuid";
import { redis, keys } from "./redis";
import type { Book, BookMode, Node, ArchetypeKey } from "./types";

export async function createBook(params: {
  title: string;
  createdBy: string;
  mode?: BookMode;
  campbellEnabled?: boolean;
  archetypesEnabled?: ArchetypeKey[];
}): Promise<Book> {
  const now = Date.now();
  const bookId = uuidv4();
  const rootNodeId = uuidv4();

  const rootNode: Node = {
    id: rootNodeId,
    bookId,
    text: params.title,
    author: params.createdBy,
    authorType: "human",
    parentId: null,
    childrenIds: [],
    createdAt: now,
    status: "active",
    isEnding: false,
    likeCount: 0,
    likedBy: [],
  };

  const book: Book = {
    id: bookId,
    title: params.title,
    createdBy: params.createdBy,
    createdAt: now,
    updatedAt: now,
    mode: params.mode ?? "free",
    campbellEnabled: params.campbellEnabled ?? false,
    archetypesEnabled: params.archetypesEnabled ?? [],
    participants: [params.createdBy],
    nodes: { [rootNodeId]: rootNode },
    rootNodeId,
    completed: false,
    likeCount: 0,
  };

  const r = redis();
  await Promise.all([
    r.set(keys.book(bookId), book),
    r.sadd(keys.booksIndex, bookId),
    r.zadd(keys.booksByUpdated, { score: now, member: bookId }),
    r.zadd(keys.booksByLikes, { score: 0, member: bookId }),
  ]);

  return book;
}

export async function getBook(bookId: string): Promise<Book | null> {
  const book = await redis().get<Book>(keys.book(bookId));
  return book ?? null;
}

export async function listBooksForUser(nickname: string): Promise<Book[]> {
  // 2인 MVP 신뢰 환경: 내 책만 보여주는 용도 (분류용)
  const r = redis();
  const ids = await r.smembers(keys.booksIndex);
  if (!ids || ids.length === 0) return [];
  const books = await Promise.all(
    ids.map((id) => r.get<Book>(keys.book(id))),
  );
  return books
    .filter((b): b is Book => b !== null)
    .filter(
      (b) =>
        b.createdBy === nickname || b.participants.includes(nickname),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllBooks(): Promise<Book[]> {
  const r = redis();
  const ids = await r.smembers(keys.booksIndex);
  if (!ids || ids.length === 0) return [];
  const books = await Promise.all(
    ids.map((id) => r.get<Book>(keys.book(id))),
  );
  return books
    .filter((b): b is Book => b !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export interface ShelfSection {
  mine: Book[]; // 내가 시삽이거나 참여자인 책
  others: Book[]; // 그 외 (다른 분들이 쓰는 책)
}

export async function listShelfForUser(nickname: string): Promise<ShelfSection> {
  const all = await listAllBooks();
  const mine: Book[] = [];
  const others: Book[] = [];
  for (const b of all) {
    if (b.createdBy === nickname || b.participants.includes(nickname)) {
      mine.push(b);
    } else {
      others.push(b);
    }
  }
  return { mine, others };
}

export async function countNodes(book: Book): Promise<number> {
  return Object.values(book.nodes).filter((n) => n.status === "active").length;
}
