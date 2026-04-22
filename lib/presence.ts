// 간단한 프레젠스 추적: 닉네임별로 마지막 활동 시각을 Redis에 저장
// TTL 이내 활동한 닉네임을 "지금 접속 중"으로 간주

import { redis } from "./redis";

const PRESENCE_TTL_SECONDS = 120; // 2분
const PRESENCE_PREFIX = "presence:";

export async function touchPresence(nickname: string): Promise<void> {
  try {
    await redis().set(`${PRESENCE_PREFIX}${nickname}`, Date.now(), {
      ex: PRESENCE_TTL_SECONDS,
    });
  } catch {
    // presence는 보조 기능이라 실패해도 무시
  }
}

export interface PresentUser {
  nickname: string;
  lastSeen: number;
}

export async function listPresent(): Promise<PresentUser[]> {
  try {
    // Upstash는 SCAN 대신 keys 지원
    const r = redis();
    const keys = (await r.keys(`${PRESENCE_PREFIX}*`)) ?? [];
    if (keys.length === 0) return [];
    const values = await Promise.all(
      keys.map((k) => r.get<number>(k)),
    );
    return keys
      .map((k, i) => ({
        nickname: k.replace(PRESENCE_PREFIX, ""),
        lastSeen: Number(values[i] ?? 0),
      }))
      .filter((p) => p.lastSeen > 0)
      .sort((a, b) => b.lastSeen - a.lastSeen);
  } catch {
    return [];
  }
}
