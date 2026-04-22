import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { addNode } from "@/lib/nodes";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "먼저 서재에 들어와주세요." },
        { status: 401 },
      );
    }

    const body = (await req.json()) as {
      bookId?: string;
      parentId?: string;
      text?: string;
    };
    const bookId = body.bookId?.trim();
    const parentId = body.parentId?.trim();
    const text = body.text?.trim();

    if (!bookId || !parentId || !text) {
      return NextResponse.json(
        { error: "bookId, parentId, text는 모두 필수입니다." },
        { status: 400 },
      );
    }
    if (text.length > 120) {
      return NextResponse.json(
        { error: "글 토막은 120자 이하로 적어주세요." },
        { status: 400 },
      );
    }

    const book = await getBook(bookId);
    if (!book) {
      return NextResponse.json(
        { error: "존재하지 않는 책입니다." },
        { status: 404 },
      );
    }
    // Stage 2에서는 누구나 참여 가능 (초대 링크 검증은 Stage 3)
    // Stage 3에서는 session.bookAccess에 포함 or createdBy 검증 추가

    const { node } = await addNode({
      bookId,
      parentId,
      text,
      author: session.nickname,
      authorType: "human",
    });

    return NextResponse.json({ nodeId: node.id });
  } catch (err) {
    console.error("[POST /api/nodes]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    const userMsg =
      msg === "PARENT_IS_ENDING"
        ? "이 갈래는 이미 종결되어 이어쓸 수 없습니다."
        : msg === "BOOK_COMPLETED"
          ? "이 책은 완결되어 더 쓸 수 없습니다."
          : msg === "BOOK_NOT_FOUND" || msg === "PARENT_NOT_FOUND"
            ? "대상을 찾을 수 없습니다."
            : "토막 추가 중 오류가 발생했습니다.";
    return NextResponse.json({ error: userMsg }, { status: 500 });
  }
}
