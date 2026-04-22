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
      text?: string;
    };
    const bookId = body.bookId?.trim();
    if (!bookId) {
      return NextResponse.json({ error: "bookId 필수" }, { status: 400 });
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

    const isAuthor = node.author === session.nickname;
    const isInvoker = !!node.adoptedBy && node.adoptedBy === session.nickname;

    // 1) 텍스트 수정 요청
    if (typeof body.text === "string") {
      const trimmed = body.text.trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: "빈 토막은 저장할 수 없습니다." },
          { status: 400 },
        );
      }
      if (trimmed.length > 120) {
        return NextResponse.json(
          { error: "120자 이하로 적어주세요." },
          { status: 400 },
        );
      }
      if (!isMaster && !isAuthor && !isInvoker) {
        return NextResponse.json(
          { error: "본인이 쓴(또는 부른) 토막만 수정할 수 있습니다." },
          { status: 403 },
        );
      }
      const updatedNode = { ...node, text: trimmed };
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
    }

    // 2) 상태 변경 요청
    const newStatus = body.status;
    if (!newStatus) {
      return NextResponse.json(
        { error: "status 또는 text 필수" },
        { status: 400 },
      );
    }

    if (newStatus === "deleted") {
      if (!node.parentId) {
        return NextResponse.json(
          { error: "첫 토막은 삭제할 수 없습니다." },
          { status: 400 },
        );
      }
      if (!isMaster && !isAuthor && !isInvoker) {
        return NextResponse.json(
          { error: "본인이 쓴(또는 부른) 토막만 삭제할 수 있습니다." },
          { status: 403 },
        );
      }
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
    return NextResponse.json({ error: "변경 실패" }, { status: 500 });
  }
}
