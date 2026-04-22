import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { redis, keys } from "@/lib/redis";
import type { Book, NodeStatus } from "@/lib/types";

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

    if (newStatus === "deleted") {
      // 루트는 삭제 불가
      if (!node.parentId) {
        return NextResponse.json(
          { error: "첫 토막은 삭제할 수 없습니다." },
          { status: 400 },
        );
      }
      // 작성자 본인, AI인 경우 호출자, 또는 시삽만 삭제 가능
      const isAuthor = node.author === session.nickname;
      const isInvoker = !!node.adoptedBy && node.adoptedBy === session.nickname;
      if (!isMaster && !isAuthor && !isInvoker) {
        return NextResponse.json(
          { error: "본인이 쓴(또는 부른) 토막만 삭제할 수 있습니다." },
          { status: 403 },
        );
      }
      // 활성 자식이 있으면 차단 (갈래 고아화 방지)
      const hasActiveChildren = node.childrenIds.some(
        (cid) => book.nodes[cid]?.status === "active",
      );
      if (hasActiveChildren) {
        return NextResponse.json(
          {
            error:
              "이 토막 밑에 이어진 토막이 있어 삭제할 수 없습니다. 아래 토막부터 정리해주세요.",
          },
          { status: 400 },
        );
      }
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
