// 대량 주입용 엔드포인트: 여러 텍스트를 선형 체인으로 한 번에 추가
// Stage 2 개발용; Stage 7 정리 시 관리자 전용으로 전환

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addNode } from "@/lib/nodes";

export async function POST(
  req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "세션 없음" }, { status: 401 });
    }
    const body = (await req.json()) as {
      parentId?: string;
      texts?: string[];
    };
    const parentId = body.parentId?.trim();
    const texts = body.texts;
    if (!parentId || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: "parentId, texts 필요" },
        { status: 400 },
      );
    }

    const createdIds: string[] = [];
    let cursor = parentId;
    for (const raw of texts) {
      const text = raw.trim();
      if (!text) continue;
      const { node } = await addNode({
        bookId: params.bookId,
        parentId: cursor,
        text,
        author: session.nickname,
        authorType: "human",
      });
      createdIds.push(node.id);
      cursor = node.id;
    }

    return NextResponse.json({ nodeIds: createdIds });
  } catch (err) {
    console.error("[POST chain]", err);
    return NextResponse.json({ error: "주입 실패" }, { status: 500 });
  }
}
