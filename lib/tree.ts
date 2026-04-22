import type { Book, Node } from "./types";

/** 특정 노드가 포함된 활성 경로(루트부터 노드까지) */
export function getPath(book: Book, nodeId: string): Node[] {
  const path: Node[] = [];
  let current: Node | undefined = book.nodes[nodeId];
  while (current) {
    path.unshift(current);
    current = current.parentId ? book.nodes[current.parentId] : undefined;
  }
  return path;
}

/** 특정 서브트리에서 가장 깊고 최근인 활성 리프 */
export function getDeepestLeaf(book: Book, fromNodeId: string): string {
  const start = book.nodes[fromNodeId];
  if (!start) return fromNodeId;
  let bestId = fromNodeId;
  let bestDepth = 0;
  let bestRecency = start.createdAt;

  function walk(id: string, depth: number) {
    const node = book.nodes[id];
    if (!node || node.status !== "active") return;
    const activeChildren = node.childrenIds.filter(
      (cid) => book.nodes[cid]?.status === "active",
    );
    if (activeChildren.length === 0) {
      // 리프
      if (
        depth > bestDepth ||
        (depth === bestDepth && node.createdAt > bestRecency)
      ) {
        bestId = id;
        bestDepth = depth;
        bestRecency = node.createdAt;
      }
      return;
    }
    for (const cid of activeChildren) walk(cid, depth + 1);
  }
  walk(fromNodeId, 0);
  return bestId;
}

/** 서브트리의 활성 토막 개수 (자기 포함) */
export function countDescendants(book: Book, nodeId: string): number {
  let count = 0;
  function walk(id: string) {
    const node = book.nodes[id];
    if (!node || node.status !== "active") return;
    count += 1;
    for (const cid of node.childrenIds) walk(cid);
  }
  walk(nodeId);
  return count;
}

/** 서브트리 깊이 (자기 포함 토막 수의 최대 경로 길이) */
export function subtreeDepth(book: Book, nodeId: string): number {
  const node = book.nodes[nodeId];
  if (!node || node.status !== "active") return 0;
  const active = node.childrenIds.filter(
    (cid) => book.nodes[cid]?.status === "active",
  );
  if (active.length === 0) return 1;
  return 1 + Math.max(...active.map((cid) => subtreeDepth(book, cid)));
}

/** 분기점 노드 ID 목록 (자식이 둘 이상인 활성 노드) */
export function getBranchPoints(book: Book): string[] {
  return Object.values(book.nodes)
    .filter((n) => n.status === "active")
    .filter(
      (n) =>
        n.childrenIds.filter((cid) => book.nodes[cid]?.status === "active")
          .length >= 2,
    )
    .map((n) => n.id);
}

/** 전체 활성 리프 목록 */
export function getActiveLeaves(book: Book): Node[] {
  return Object.values(book.nodes).filter(
    (n) =>
      n.status === "active" &&
      n.childrenIds.filter((cid) => book.nodes[cid]?.status === "active")
        .length === 0,
  );
}

/** 현재 경로에서 해당 분기점이 선택한 자식 ID 반환 */
export function selectedChildOf(
  book: Book,
  branchNodeId: string,
  leafId: string,
): string | null {
  const path = getPath(book, leafId);
  const idx = path.findIndex((n) => n.id === branchNodeId);
  if (idx === -1 || idx === path.length - 1) return null;
  return path[idx + 1]?.id ?? null;
}
