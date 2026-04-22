import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createBook } from "@/lib/books";
import type { BookMode, ArchetypeKey } from "@/lib/types";

const VALID_MODES: BookMode[] = ["simple", "complex", "trpg", "free"];

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
      title?: string;
      mode?: string;
      campbellEnabled?: boolean;
      archetypesEnabled?: ArchetypeKey[];
    };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { error: "첫 문장을 적어주세요." },
        { status: 400 },
      );
    }
    if (title.length > 100) {
      return NextResponse.json(
        { error: "첫 문장은 100자 이하여야 합니다." },
        { status: 400 },
      );
    }

    const mode: BookMode =
      body.mode && VALID_MODES.includes(body.mode as BookMode)
        ? (body.mode as BookMode)
        : "free";

    const book = await createBook({
      title,
      createdBy: session.nickname,
      mode,
      campbellEnabled: body.campbellEnabled ?? false,
      archetypesEnabled: body.archetypesEnabled ?? [],
    });

    return NextResponse.json({ bookId: book.id });
  } catch (err) {
    console.error("[POST /api/books]", err);
    return NextResponse.json(
      { error: "책 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
