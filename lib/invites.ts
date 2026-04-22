import { v4 as uuidv4 } from "uuid";
import { redis, keys } from "./redis";
import type { Invite } from "./types";

const INVITE_TTL_SECONDS = 60 * 60 * 24; // 24시간

export async function createInvite(params: {
  bookId: string;
  createdBy: string;
}): Promise<Invite> {
  const now = Date.now();
  const invite: Invite = {
    token: uuidv4(),
    bookId: params.bookId,
    createdBy: params.createdBy,
    createdAt: now,
    expiresAt: now + INVITE_TTL_SECONDS * 1000,
  };
  await redis().set(keys.invite(invite.token), invite, {
    ex: INVITE_TTL_SECONDS,
  });
  return invite;
}

export async function getInvite(token: string): Promise<Invite | null> {
  const invite = await redis().get<Invite>(keys.invite(token));
  if (!invite) return null;
  if (invite.expiresAt < Date.now()) return null;
  return invite;
}

export async function consumeInvite(token: string): Promise<Invite | null> {
  // 초대 링크는 여러 번 재사용 가능 (24시간 유효). 소비 ≠ 삭제.
  // 향후 1회용 옵션이 필요하면 여기서 redis().del 호출.
  return getInvite(token);
}
