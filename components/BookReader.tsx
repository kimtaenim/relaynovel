"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Book } from "@/lib/types";
import {
  getDeepestLeaf,
  getPath,
  selectedChildOf,
} from "@/lib/tree";
import { NodeCard } from "./NodeCard";
import { InkLine } from "./Connector";
import { BranchPills } from "./BranchPills";
import { ChatInput } from "./ChatInput";
import { ParchmentCorners } from "./ParchmentDecor";
import { ArchetypeBar } from "./ArchetypeBar";
import { AIBubblePanel, type AIProposalView } from "./AIBubble";
import type { ArchetypeKey } from "@/lib/types";

export function BookReader({
  book,
  currentUser,
}: {
  book: Book;
  currentUser: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leafQuery = searchParams.get("leaf") ?? searchParams.get("focus");

  const resolvedLeafId = useMemo(() => {
    if (leafQuery && book.nodes[leafQuery]?.status === "active") {
      return leafQuery;
    }
    return getDeepestLeaf(book, book.rootNodeId);
  }, [book, leafQuery]);

  const path = useMemo(
    () => getPath(book, resolvedLeafId),
    [book, resolvedLeafId],
  );

  // 어느 노드에서 어느 방향으로 입력창을 여는지
  const [branchOpen, setBranchOpen] = useState<
    { nodeId: string; direction: "child" | "sibling" } | null
  >(null);
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // 다른 참여자가 쓴 글을 받아오기 위한 폴링 + 탭 포커스 시 갱신
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const doRefresh = () => {
      router.refresh();
      setLastSync(Date.now());
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") doRefresh();
    };
    id = setInterval(doRefresh, 20000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (id) clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  // AI 호출 상태
  const [aiBusy, setAiBusy] = useState(false);
  const [aiBusyKey, setAiBusyKey] = useState<ArchetypeKey | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPanel, setAiPanel] = useState<{
    archetype: ArchetypeKey;
    parentId: string;
    proposals: AIProposalView[];
  } | null>(null);

  async function invokeArchetype(archetype: ArchetypeKey, parentId: string) {
    setAiBusy(true);
    setAiBusyKey(archetype);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, parentId, archetype }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "AI 호출 실패");
      }
      const data = (await res.json()) as {
        proposals: AIProposalView[];
        archetype: ArchetypeKey;
      };
      setAiPanel({ archetype: data.archetype, parentId, proposals: data.proposals });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI 호출 실패");
    } finally {
      setAiBusy(false);
      setAiBusyKey(null);
    }
  }

  function goToProposal(proposalId: string) {
    // 3개 모두 이미 active 상태라 PATCH 불필요 — 바로 해당 갈래로 이동
    const params = new URLSearchParams(searchParams.toString());
    params.set("leaf", proposalId);
    params.delete("focus");
    router.replace(`?${params.toString()}`, { scroll: false });
    setAiPanel(null);
    router.refresh();
  }

  const setLeaf = useCallback(
    (nodeId: string) => {
      const deep = getDeepestLeaf(book, nodeId);
      const params = new URLSearchParams(searchParams.toString());
      params.set("leaf", deep);
      params.delete("focus");
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [book, router, searchParams],
  );

  async function deleteNode(nodeId: string) {
    const res = await fetch(`/api/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id, status: "deleted" }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      alert(b.error ?? "삭제 실패");
      return;
    }
    // 삭제된 노드가 현재 리프였으면 부모로 이동
    if (nodeId === resolvedLeafId) {
      const parent = book.nodes[nodeId]?.parentId;
      if (parent) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("leaf", parent);
        params.delete("focus");
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
    router.refresh();
  }

  async function submitNode(parentId: string, text: string) {
    const res = await fetch("/api/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id, parentId, text }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new Error(b.error ?? "전송 실패");
    }
    const data = (await res.json()) as { nodeId: string };
    setBranchOpen(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("leaf", data.nodeId);
    params.delete("focus");
    router.replace(`?${params.toString()}`, { scroll: false });
    router.refresh();
  }

  const totalActive = Object.values(book.nodes).filter(
    (n) => n.status === "active",
  ).length;
  const totalInPath = path.length;
  const leafNode = path[path.length - 1];

  return (
    <div className="relative">
      {/* 경로 인디케이터 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-script text-xs italic text-parchment-light/70">
        <span className="flex items-center gap-2">
          <span>
            이 갈래 {totalInPath}토막 · 전체 {totalActive}토막
          </span>
          <SyncDot lastSync={lastSync} />
        </span>
        {leafQuery && (
          <button
            type="button"
            className="text-parchment-light/80 underline decoration-dotted underline-offset-4 hover:text-parchment-light"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("leaf");
              params.delete("focus");
              router.replace(
                params.toString() ? `?${params.toString()}` : "?",
                { scroll: false },
              );
            }}
          >
            기본 갈래로
          </button>
        )}
      </div>

      <article className="parchment relative overflow-hidden rounded-3xl p-3 pb-32 shadow-parchment sm:p-6 sm:pb-32 md:p-10 md:pb-40">
        <ParchmentCorners />
        <div className="relative z-10 flex flex-col items-center">
          {path.map((node, idx) => {
            const isRoot = idx === 0;
            const isLeaf = idx === path.length - 1;
            const openDirection =
              branchOpen?.nodeId === node.id ? branchOpen.direction : null;
            const isBranchInputOpen = openDirection !== null;
            const isAuthor = node.author === currentUser;
            const isInvoker =
              !!node.adoptedBy && node.adoptedBy === currentUser;
            const hasActiveChildren = node.childrenIds.some(
              (cid) => book.nodes[cid]?.status === "active",
            );
            const canDelete =
              !!node.parentId && // 루트 삭제 불가
              !hasActiveChildren && // 자식 있으면 불가
              (isAuthor || isInvoker); // 본인/호출자만 (시삽은 서버에서 허용)
            const selectedChildId = selectedChildOf(
              book,
              node.id,
              resolvedLeafId,
            );
            const activeChildCount = node.childrenIds.filter(
              (cid) => book.nodes[cid]?.status === "active",
            ).length;

            return (
              <div key={node.id} className="w-full">
                <NodeCard
                  node={node}
                  isRoot={isRoot}
                  onClick={
                    !isLeaf && !isBranchInputOpen
                      ? () => {
                          setBranchOpen(null);
                          setLeaf(node.id);
                        }
                      : undefined
                  }
                  onStartChild={
                    node.isEnding
                      ? undefined
                      : () =>
                          setBranchOpen((prev) =>
                            prev?.nodeId === node.id &&
                            prev.direction === "child"
                              ? null
                              : { nodeId: node.id, direction: "child" },
                          )
                  }
                  onStartSibling={
                    node.isEnding || !node.parentId
                      ? undefined
                      : () =>
                          setBranchOpen((prev) =>
                            prev?.nodeId === node.id &&
                            prev.direction === "sibling"
                              ? null
                              : { nodeId: node.id, direction: "sibling" },
                          )
                  }
                  canSibling={!!node.parentId}
                  canDelete={canDelete}
                  onDelete={canDelete ? () => deleteNode(node.id) : undefined}
                  openDirection={openDirection}
                />

                {/* 인라인 입력창 — 방향 고정 */}
                {isBranchInputOpen && (
                  <div className="my-3">
                    <InkLine active />
                    <ChatInput
                      label={
                        openDirection === "child"
                          ? `${currentUser} · 이 카드 ↓ 뒤에 잇기`
                          : `${currentUser} · 이 카드 → 옆에 새 갈래`
                      }
                      autoFocus
                      compact
                      submitLabel={
                        openDirection === "child" ? "↓ 잇다" : "→ 옆으로"
                      }
                      onSubmit={(text) =>
                        submitNode(
                          openDirection === "sibling"
                            ? node.parentId!
                            : node.id,
                          text,
                        )
                      }
                      onCancel={() => setBranchOpen(null)}
                    />
                  </div>
                )}

                {/* 다음 노드로 연결: 세로 잉크선 하나 + 다른 갈래 힌트(선택 안 된 형제) */}
                {!isLeaf && !isBranchInputOpen && (
                  <>
                    <InkLine active />
                    <BranchPills
                      book={book}
                      branchNode={node}
                      selectedChildId={selectedChildId}
                      onChoose={(id) => {
                        setBranchOpen(null);
                        setLeaf(id);
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* AI 제안 패널 — 호출된 부모에서 렌더 */}
          {aiPanel && aiPanel.parentId === leafNode?.id && (
            <AIBubblePanel
              archetype={aiPanel.archetype}
              proposals={aiPanel.proposals}
              onAdopt={goToProposal}
              onDismiss={() => setAiPanel(null)}
              busy={aiBusy}
            />
          )}

          {/* 리프 안내 */}
          {!aiPanel && (
            <div className="mt-6 text-center font-script text-xs italic text-ink-faded/70">
              {leafNode?.isEnding
                ? "— 이 갈래는 여기서 종결 —"
                : totalInPath === 1
                  ? "— 아래 입력창으로 이어 쓰세요 —"
                  : "— 갈래의 끝 —"}
            </div>
          )}
        </div>
      </article>

      {/* 바닥 고정 영역 — 아르케타입 바 + 방향 시작 버튼 */}
      {!leafNode?.isEnding && !branchOpen && !aiPanel && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-leather/40 bg-mahogany/92 px-3 pb-[env(safe-area-inset-bottom,0.5rem)] pt-2 backdrop-blur-sm sm:px-4 sm:pt-3">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            <ArchetypeBar
              enabled={book.archetypesEnabled}
              onInvoke={(k) => invokeArchetype(k, resolvedLeafId)}
              busy={aiBusy}
              busyKey={aiBusyKey}
            />
            {aiError && (
              <p className="font-script text-[10px] italic text-seal/80">
                {aiError}
              </p>
            )}
            <div className="flex items-center gap-2 pb-1">
              <span className="font-script text-[10px] italic text-parchment-light/60">
                직접 쓰기:
              </span>
              <button
                type="button"
                onClick={() =>
                  setBranchOpen({
                    nodeId: resolvedLeafId,
                    direction: "child",
                  })
                }
                className="flex-1 rounded-full border border-seal/50 bg-seal/20 px-3 py-2 font-display text-xs tracking-wider text-parchment-light shadow-sm hover:bg-seal/40"
              >
                ↓ 이 뒤에 잇기
              </button>
              {leafNode?.parentId && (
                <button
                  type="button"
                  onClick={() =>
                    setBranchOpen({
                      nodeId: resolvedLeafId,
                      direction: "sibling",
                    })
                  }
                  className="flex-1 rounded-full border border-verdigris/50 bg-verdigris/15 px-3 py-2 font-display text-xs tracking-wider text-parchment-light shadow-sm hover:bg-verdigris/30"
                >
                  → 옆에 새 갈래
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 동기화 상태 인디케이터 — 다른 참여자 글이 들어왔는지 폴링 결과 표시
function SyncDot({ lastSync }: { lastSync: number }) {
  const [now, setNow] = useState(lastSync);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);
  const ago = Math.max(0, now - lastSync);
  const seconds = Math.floor(ago / 1000);
  const fresh = seconds < 10;
  return (
    <span
      className={`flex items-center gap-1 text-[10px] ${
        fresh ? "text-verdigris" : "text-parchment-light/50"
      }`}
      title={`마지막 동기화: ${seconds}초 전`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          fresh ? "bg-verdigris animate-pulse" : "bg-parchment-light/40"
        }`}
        aria-hidden
      />
      {fresh ? "방금 갱신" : `${seconds}초 전`}
    </span>
  );
}
