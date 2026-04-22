import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";
import { createInvite } from "@/lib/invites";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "세션 필요" }, { status: 401 });
    }
    const body = (await req.json()) as { bookId?: string };
    const bookId = body.bookId?.trim();
    if (!bookId) {
      return NextResponse.json({ error: "bookId 필요" }, { status: 400 });
    }
    const book = await getBook(bookId);
    if (!book) {
      return NextResponse.json({ error: "없는 책" }, { status: 404 });
    }
    if (book.createdBy !== session.nickname) {
      return NextResponse.json(
        { error: "이 책의 시삽만 초대 링크를 만들 수 있습니다." },
        { status: 403 },
      );
    }

    const invite = await createInvite({
      bookId,
      createdBy: session.nickname,
    });

    // 배포 환경에선 request origin에서 자동 유추
    const origin = req.nextUrl.origin;
    const inviteUrl = `${origin}/invite/${invite.token}`;

    return NextResponse.json({
      inviteUrl,
      token: invite.token,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    console.error("[POST /api/invites]", err);
    return NextResponse.json({ error: "초대 생성 실패" }, { status: 500 });
  }
}
