import { NextRequest, NextResponse } from "next/server";
import { createSession, grantBookAccess } from "@/lib/session";
import { getInvite } from "@/lib/invites";
import { getBook } from "@/lib/books";
import { redis, keys } from "@/lib/redis";
import type { Book } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      nickname?: string;
      inviteToken?: string;
    };
    const nickname = body.nickname?.trim();
    if (!nickname) {
      return NextResponse.json(
        { error: "닉네임이 필요합니다." },
        { status: 400 },
      );
    }
    if (nickname.length > 20) {
      return NextResponse.json(
        { error: "닉네임은 20자 이하로 적어주세요." },
        { status: 400 },
      );
    }

    const session = await createSession(nickname);

    // 초대 토큰 처리
    if (body.inviteToken) {
      const invite = await getInvite(body.inviteToken);
      if (invite) {
        const book = await getBook(invite.bookId);
        if (book) {
          // 참여자에 추가
          if (
            book.createdBy !== nickname &&
            !book.participants.includes(nickname)
          ) {
            book.participants = [...book.participants, nickname];
            await redis().set(keys.book(book.id), book);
          }
          // 세션의 bookAccess에 추가
          await grantBookAccess(session.id, book.id);
        }
      }
    }

    return NextResponse.json({ ok: true, nickname: session.nickname });
  } catch (err) {
    console.error("[POST /api/session]", err);
    return NextResponse.json(
      { error: "세션 발급 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const { clearSession } = await import("@/lib/session");
  await clearSession();
  return NextResponse.json({ ok: true });
}
