import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBook } from "@/lib/books";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "세션 없음" }, { status: 401 });
    }
    const book = await getBook(params.bookId);
    if (!book) {
      return NextResponse.json({ error: "없는 책" }, { status: 404 });
    }
    return NextResponse.json(book);
  } catch (err) {
    console.error("[GET /api/books/[bookId]]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
