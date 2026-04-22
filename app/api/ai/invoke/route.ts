import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { redis, keys } from "@/lib/redis";
import { getPath } from "@/lib/tree";
import { invokeArchetypeProposals } from "@/lib/anthropic";
import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeKey, Book, Node } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "세션 필요" }, { status: 401 });
    }
    const body = (await req.json()) as {
      bookId?: string;
      parentId?: string;
      archetype?: string;
    };
    const bookId = body.bookId?.trim();
    const parentId = body.parentId?.trim();
    const archetypeInput = body.archetype as ArchetypeKey | undefined;

    if (!bookId || !parentId || !archetypeInput) {
      return NextResponse.json(
        { error: "bookId, parentId, archetype 필수" },
        { status: 400 },
      );
    }
    if (!ARCHETYPES[archetypeInput]) {
      return NextResponse.json(
        { error: "알 수 없는 아르케타입" },
        { status: 400 },
      );
    }

    const book = await getBook(bookId);
    if (!book) {
      return NextResponse.json({ error: "없는 책" }, { status: 404 });
    }

    const isMaster = book.createdBy === session.nickname;
    const isParticipant = book.participants.includes(session.nickname);
    if (!isMaster && !isParticipant) {
      return NextResponse.json(
        { error: "이 책에 참여할 권한이 없습니다." },
        { status: 403 },
      );
    }

    const parent = book.nodes[parentId];
    if (!parent || parent.status !== "active") {
      return NextResponse.json({ error: "대상 노드 없음" }, { status: 404 });
    }
    if (parent.isEnding) {
      return NextResponse.json(
        { error: "종결된 갈래에서는 AI 호출 불가" },
        { status: 400 },
      );
    }

    // 경로 추출
    const path = getPath(book, parentId);

    // AI 호출
    const { proposals, usage } = await invokeArchetypeProposals({
      archetype: archetypeInput,
      book,
      storyPath: path,
    });

    if (proposals.length < 2) {
      return NextResponse.json(
        { error: "AI 응답이 부족합니다. 다시 시도해주세요." },
        { status: 500 },
      );
    }

    // 3개의 shadow 노드를 생성하고 서로 shadowSiblings로 연결
    const now = Date.now();
    const newIds = proposals.map(() => uuidv4());
    const shadowNodes: Node[] = proposals.map((p, i) => ({
      id: newIds[i],
      bookId,
      text: p.text,
      author: `@${archetypeInput}`,
      authorType: "ai",
      archetype: archetypeInput,
      parentId,
      childrenIds: [],
      createdAt: now,
      status: "shadow",
      isEnding: false,
      likeCount: 0,
      likedBy: [],
      shadowSiblings: newIds.filter((_, j) => j !== i),
      shadowSourceNodeId: parentId,
    }));

    // 책에 반영
    const updated: Book = {
      ...book,
      nodes: {
        ...book.nodes,
        ...Object.fromEntries(shadowNodes.map((n) => [n.id, n])),
        [parentId]: {
          ...parent,
          childrenIds: [...parent.childrenIds, ...newIds],
        },
      },
      updatedAt: now,
    };
    await redis().set(keys.book(bookId), updated);
    await redis().zadd(keys.booksByUpdated, { score: now, member: bookId });

    return NextResponse.json({
      proposals: shadowNodes.map((n) => ({ id: n.id, text: n.text })),
      archetype: archetypeInput,
      usage,
    });
  } catch (err) {
    console.error("[POST /api/ai/invoke]", err);
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: msg === "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." ? msg : "AI 호출 실패" },
      { status: 500 },
    );
  }
}
