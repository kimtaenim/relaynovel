import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { redis, keys } from "./redis";
import type { Session } from "./types";

const SESSION_COOKIE = "rn_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90; // 90일

export async function createSession(nickname: string): Promise<Session> {
  const sessionId = uuidv4();
  const session: Session = {
    id: sessionId,
    nickname,
    issuedAt: Date.now(),
    bookAccess: [],
  };
  await redis().set(keys.session(sessionId), session, {
    ex: SESSION_TTL_SECONDS,
  });
  cookies().set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return session;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const session = await redis().get<Session>(keys.session(sessionId));
  return session ?? null;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function clearSession(): Promise<void> {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await redis().del(keys.session(sessionId));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function grantBookAccess(
  sessionId: string,
  bookId: string,
): Promise<void> {
  const session = await redis().get<Session>(keys.session(sessionId));
  if (!session) return;
  if (!session.bookAccess.includes(bookId)) {
    session.bookAccess.push(bookId);
    await redis().set(keys.session(sessionId), session, {
      ex: SESSION_TTL_SECONDS,
    });
  }
}
