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
import { CardCarousel } from "./CardCarousel";
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

  async function editNode(nodeId: string, text: string): Promise<void> {
    const res = await fetch(`/api/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id, text }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new Error(b.error ?? "수정 실패");
    }
    router.refresh();
  }

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

            // 형제들(부모의 모든 active 자식) — 이 카드 레벨에서 캐러셀로 표시
            const parent = idx > 0 ? path[idx - 1] : null;
            const siblingNodes = parent
              ? parent.childrenIds
                  .map((cid) => book.nodes[cid])
                  .filter(
                    (n): n is typeof node => !!n && n.status === "active",
                  )
              : [];
            const hasSiblings = siblingNodes.length > 1;

            // 노드 하나를 NodeCard로 렌더 (액티브 슬라이드에만 액션 버튼 붙임)
            const renderSlide = (sibNode: typeof node, isActive: boolean) => {
              const sibIsAuthor = sibNode.author === currentUser;
              const sibIsInvoker =
                !!sibNode.adoptedBy && sibNode.adoptedBy === currentUser;
              const sibHasChildren = sibNode.childrenIds.some(
                (cid) => book.nodes[cid]?.status === "active",
              );
              const sibCanDelete =
                !!sibNode.parentId &&
                !sibHasChildren &&
                (sibIsAuthor || sibIsInvoker);
              return (
                <NodeCard
                  node={sibNode}
                  isRoot={isRoot && isActive}
                  onClick={
                    !isActive
                      ? () => {
                          setBranchOpen(null);
                          setLeaf(sibNode.id);
                        }
                      : !isLeaf && !isBranchInputOpen
                        ? () => {
                            setBranchOpen(null);
                            setLeaf(sibNode.id);
                          }
                        : undefined
                  }
                  onStartChild={
                    !isActive || sibNode.isEnding
                      ? undefined
                      : () =>
                          setBranchOpen((prev) =>
                            prev?.nodeId === sibNode.id &&
                            prev.direction === "child"
                              ? null
                              : { nodeId: sibNode.id, direction: "child" },
                          )
                  }
                  onStartSibling={
                    !isActive || sibNode.isEnding || !sibNode.parentId
                      ? undefined
                      : () =>
                          setBranchOpen((prev) =>
                            prev?.nodeId === sibNode.id &&
                            prev.direction === "sibling"
                              ? null
                              : { nodeId: sibNode.id, direction: "sibling" },
                          )
                  }
                  canSibling={!!sibNode.parentId}
                  canDelete={isActive && sibCanDelete}
                  onDelete={
                    isActive && sibCanDelete
                      ? () => deleteNode(sibNode.id)
                      : undefined
                  }
                  canEdit={isActive && (sibIsAuthor || sibIsInvoker)}
                  onEdit={
                    isActive && (sibIsAuthor || sibIsInvoker)
                      ? (text) => editNode(sibNode.id, text)
                      : undefined
                  }
                  openDirection={isActive ? openDirection : null}
                />
              );
            };

            return (
              <div key={node.id} className="w-full">
                {openDirection === "sibling" ? (
                  // → 눌러서 형제로 쓰는 중: 현재 카드 peek + 같은 레벨 입력창
                  <div className="mb-2 flex flex-col items-center gap-2">
                    <div className="w-full max-w-[260px] scale-95 opacity-80">
                      <NodeCard node={node} variant="peek" />
                    </div>
                    <div className="flex items-center gap-2 font-script text-[11px] italic text-verdigris">
                      <span className="h-px w-10 bg-verdigris/40" />
                      <span>→ 이 카드와 같은 지점에 형제 갈래</span>
                      <span className="h-px w-10 bg-verdigris/40" />
                    </div>
                    <div className="w-full max-w-xl">
                      <ChatInput
                        label={`${currentUser} · 같은 부모 밑에 새 갈래 쓰는 중`}
                        autoFocus
                        compact
                        submitLabel="→ 옆으로 쓰기"
                        onSubmit={(text) =>
                          submitNode(node.parentId!, text)
                        }
                        onCancel={() => setBranchOpen(null)}
                      />
                    </div>
                  </div>
                ) : hasSiblings ? (
                  // 형제가 여럿이면 이 레벨 전체가 캐러셀
                  <CardCarousel
                    slides={siblingNodes.map((sib) => ({
                      id: sib.id,
                      node: renderSlide(sib, sib.id === node.id),
                    }))}
                    activeIndex={siblingNodes.findIndex(
                      (s) => s.id === node.id,
                    )}
                    onActiveSlideChange={(id) => {
                      setBranchOpen(null);
                      setLeaf(id);
                    }}
                  />
                ) : (
                  // 형제 없음 (루트 또는 외동): 단일 카드
                  renderSlide(node, true)
                )}

                {/* 자식(↓) 방향 입력창 — 현재 카드 아래에 잉크 선 + 입력 */}
                {openDirection === "child" && (
                  <div className="my-3">
                    <InkLine active />
                    <ChatInput
                      label={`${currentUser} · 이 카드 ↓ 뒤에 잇기`}
                      autoFocus
                      compact
                      submitLabel="↓ 이어 쓰기"
                      onSubmit={(text) => submitNode(node.id, text)}
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

      {/* 플로팅 유틸 버튼 (바 위에 떠있음) — 모아 읽기 + 정보 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[88px] z-30 flex justify-end px-3 sm:bottom-[96px] sm:px-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <a
            href={`/book/${book.id}/read${
              leafQuery ? `?leaf=${resolvedLeafId}` : ""
            }`}
            title="이 갈래 전체를 연속으로 읽기"
            className="flex h-9 items-center gap-1 rounded-full border border-champagne/60 bg-mahogany-dark/90 px-3 font-script text-[11px] not-italic tracking-wider text-parchment-light shadow-lg backdrop-blur hover:bg-mahogany-dark"
          >
            <span>📖</span>
            <span>모아 읽기</span>
          </a>
          <a
            href="/about"
            title="이 프로젝트 소개"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-champagne/60 bg-mahogany-dark/90 font-display text-sm text-parchment-light shadow-lg backdrop-blur hover:bg-mahogany-dark"
          >
            i
          </a>
        </div>
      </div>

      {/* 바닥 고정 영역 — 쓰기 조건일 때 4버튼 한 행 */}
      {!leafNode?.isEnding && !branchOpen && !aiPanel && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-leather/40 bg-mahogany/92 px-3 pb-[env(safe-area-inset-bottom,0.5rem)] pt-2 backdrop-blur-sm sm:px-4 sm:pt-3">
          <div className="mx-auto max-w-3xl">
            {aiError && (
              <p className="mb-1 text-center font-script text-[10px] italic text-seal/80">
                {aiError}
              </p>
            )}
            <ArchetypeBar
              enabled={book.archetypesEnabled}
              onInvoke={(k) => invokeArchetype(k, resolvedLeafId)}
              busy={aiBusy}
              busyKey={aiBusyKey}
              trailing={
                <WriteButton
                  canSibling={!!leafNode?.parentId}
                  onChild={() =>
                    setBranchOpen({
                      nodeId: resolvedLeafId,
                      direction: "child",
                    })
                  }
                  onSibling={() =>
                    setBranchOpen({
                      nodeId: resolvedLeafId,
                      direction: "sibling",
                    })
                  }
                />
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 사람이 직접 쓰기 버튼 — 누르면 위로 팝오버(↓ 뒤에 / → 옆에) 펼쳐짐
function WriteButton({
  canSibling,
  onChild,
  onSibling,
}: {
  canSibling: boolean;
  onChild: () => void;
  onSibling: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1.5 transition ${
          open
            ? "border-seal bg-seal/25 text-parchment-light"
            : "border-seal/60 bg-seal/15 text-parchment-light hover:border-seal hover:bg-seal/30"
        }`}
      >
        <span className="text-base leading-none">✎</span>
        <span className="font-script text-[11px] not-italic leading-tight tracking-wider">
          내가 쓰기
        </span>
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 flex w-[200px] flex-col gap-1 rounded-2xl border border-leather/60 bg-mahogany-dark/95 p-2 shadow-xl backdrop-blur"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onChild();
            }}
            className="rounded-xl border border-seal/50 bg-seal/20 px-3 py-2 font-display text-xs tracking-wider text-parchment-light hover:bg-seal/40"
          >
            ↓ 뒤에 잇기
          </button>
          {canSibling && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSibling();
              }}
              className="rounded-xl border border-verdigris/50 bg-verdigris/20 px-3 py-2 font-display text-xs tracking-wider text-parchment-light hover:bg-verdigris/40"
            >
              → 옆에 새 갈래
            </button>
          )}
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
