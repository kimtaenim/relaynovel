import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function redis(): Redis {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Upstash Redis 환경변수가 설정되지 않았습니다. .env.local을 확인하세요.",
    );
  }
  _redis = new Redis({ url, token });
  return _redis;
}

// Redis 키 규칙
export const keys = {
  book: (bookId: string) => `book:${bookId}`,
  booksIndex: "books:index",
  booksByUpdated: "books:by-updated",
  booksByLikes: "books:by-likes",
  invite: (token: string) => `invite:${token}`,
  session: (sessionId: string) => `session:${sessionId}`,
  nicknameIndex: "nicknames:index", // 중복 검증용
};
