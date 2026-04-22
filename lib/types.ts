// 전박사의 릴레이노블 — 타입 정의

export type ArchetypeKey =
  | "HERO"
  | "MENTOR"
  | "THRESHOLD_GUARDIAN"
  | "HERALD"
  | "SHAPESHIFTER"
  | "SHADOW"
  | "ALLY"
  | "TRICKSTER";

export type BookMode = "simple" | "complex" | "trpg" | "free";

export type NodeStatus = "active" | "shadow" | "deleted";

export type AuthorType = "human" | "ai";

export interface Node {
  id: string;
  bookId: string;
  text: string;
  author: string; // 사람 닉네임 또는 "@HERO" 등
  authorType: AuthorType;
  archetype?: ArchetypeKey; // AI인 경우
  parentId: string | null; // null이면 루트
  childrenIds: string[];
  createdAt: number;
  status: NodeStatus;
  isEnding: boolean;
  likeCount: number;
  likedBy: string[];
  shadowSiblings?: string[];
  shadowSourceNodeId?: string;
  adoptedBy?: string; // AI 제안을 채택한 사람 닉네임
}

export interface Book {
  id: string;
  title: string;
  createdBy: string; // 이 책의 시삽(master) 닉네임
  createdAt: number;
  updatedAt: number;
  mode: BookMode;
  campbellEnabled: boolean;
  archetypesEnabled: ArchetypeKey[];
  participants: string[];
  nodes: Record<string, Node>;
  rootNodeId: string;
  completed: boolean;
  likeCount: number;
}

export interface Session {
  id: string; // 세션 ID (쿠키에 저장되는 값, UUID)
  nickname: string;
  issuedAt: number;
  bookAccess: string[]; // 초대받아 참여 가능한 책 ID 목록
}

export interface Invite {
  token: string;
  bookId: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
}

// 책 생성 요청
export interface CreateBookInput {
  title: string;
  mode?: BookMode;
  campbellEnabled?: boolean;
  archetypesEnabled?: ArchetypeKey[];
}

// AI 제안 응답
export interface AIProposal {
  id: string; // shadow 노드의 id
  text: string;
}
