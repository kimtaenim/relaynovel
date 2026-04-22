import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { redis, keys } from "@/lib/redis";
import type { Book, NodeStatus } from "@/lib/types";

// PATCH — 노드 상태 변경 (shadow → active 채택, 또는 active → shadow 취소 등)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { nodeId: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "세션 필요" }, { status: 401 });
    }
    const body = (await req.json()) as {
      bookId?: string;
      status?: NodeStatus;
      adoptedBy?: string;
    };
    const bookId = body.bookId?.trim();
    const newStatus = body.status;
    if (!bookId || !newStatus) {
      return NextResponse.json(
        { error: "bookId, status 필수" },
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
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const node = book.nodes[params.nodeId];
    if (!node) {
      return NextResponse.json({ error: "없는 노드" }, { status: 404 });
    }

    // 삭제는 시삽만
    if (newStatus === "deleted" && !isMaster) {
      return NextResponse.json(
        { error: "삭제는 시삽만 가능합니다." },
        { status: 403 },
      );
    }

    const updatedNode = {
      ...node,
      status: newStatus,
      ...(newStatus === "active" && node.status === "shadow"
        ? { adoptedBy: body.adoptedBy ?? session.nickname }
        : {}),
    };

    const updated: Book = {
      ...book,
      nodes: { ...book.nodes, [params.nodeId]: updatedNode },
      updatedAt: Date.now(),
    };
    await redis().set(keys.book(bookId), updated);
    await redis().zadd(keys.booksByUpdated, {
      score: Date.now(),
      member: bookId,
    });

    return NextResponse.json({ ok: true, node: updatedNode });
  } catch (err) {
    console.error("[PATCH /api/nodes/[nodeId]]", err);
    return NextResponse.json({ error: "상태 변경 실패" }, { status: 500 });
  }
}
