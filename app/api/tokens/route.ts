import { NextResponse } from "next/server";
import { getUsage } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const usage = await getUsage();
    return NextResponse.json(usage);
  } catch (err) {
    console.error("[GET /api/tokens]", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
