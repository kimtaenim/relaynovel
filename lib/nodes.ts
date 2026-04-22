import { v4 as uuidv4 } from "uuid";
import { redis, keys } from "./redis";
import type { ArchetypeKey, Book, Node, NodeStatus } from "./types";

export async function addNode(params: {
  bookId: string;
  parentId: string;
  text: string;
  author: string;
  authorType: "human" | "ai";
  archetype?: ArchetypeKey;
  status?: NodeStatus;
  shadowSiblings?: string[];
  shadowSourceNodeId?: string;
}): Promise<{ book: Book; node: Node }> {
  const r = redis();
  const book = await r.get<Book>(keys.book(params.bookId));
  if (!book) throw new Error("BOOK_NOT_FOUND");
  const parent = book.nodes[params.parentId];
  if (!parent) throw new Error("PARENT_NOT_FOUND");
  if (parent.isEnding) throw new Error("PARENT_IS_ENDING");
  if (book.completed) throw new Error("BOOK_COMPLETED");

  const now = Date.now();
  const node: Node = {
    id: uuidv4(),
    bookId: params.bookId,
    text: params.text,
    author: params.author,
    authorType: params.authorType,
    archetype: params.archetype,
    parentId: params.parentId,
    childrenIds: [],
    createdAt: now,
    status: params.status ?? "active",
    isEnding: false,
    likeCount: 0,
    likedBy: [],
    shadowSiblings: params.shadowSiblings,
    shadowSourceNodeId: params.shadowSourceNodeId,
  };

  book.nodes[node.id] = node;
  book.nodes[params.parentId] = {
    ...parent,
    childrenIds: [...parent.childrenIds, node.id],
  };

  // 참여자 명단에 추가
  if (
    params.authorType === "human" &&
    !book.participants.includes(params.author)
  ) {
    book.participants = [...book.participants, params.author];
  }

  book.updatedAt = now;

  await Promise.all([
    r.set(keys.book(book.id), book),
    r.zadd(keys.booksByUpdated, { score: now, member: book.id }),
  ]);

  return { book, node };
}

export async function updateNodeStatus(
  bookId: string,
  nodeId: string,
  status: NodeStatus,
  adoptedBy?: string,
): Promise<Book> {
  const r = redis();
  const book = await r.get<Book>(keys.book(bookId));
  if (!book) throw new Error("BOOK_NOT_FOUND");
  const node = book.nodes[nodeId];
  if (!node) throw new Error("NODE_NOT_FOUND");
  const now = Date.now();

  book.nodes[nodeId] = { ...node, status, ...(adoptedBy ? { adoptedBy } : {}) };

  // shadow → active 승격 시 부모의 childrenIds에도 정상 포함되어 있는지 확인
  // (addNode 단계에서 이미 childrenIds에 있으므로 별도 조치는 불필요)

  book.updatedAt = now;
  await r.set(keys.book(bookId), book);
  await r.zadd(keys.booksByUpdated, { score: now, member: book.id });
  return book;
}
