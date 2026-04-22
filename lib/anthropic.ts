import Anthropic from "@anthropic-ai/sdk";
import type { ArchetypeKey, Book, Node } from "./types";
import {
  ARCHETYPES,
  ARCHETYPE_COMMON_GUIDELINES,
  buildArchetypeSystemPrompt,
} from "./archetypes";
import { addUsage } from "./tokens";

let _client: Anthropic | null = null;

function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  _client = new Anthropic({ apiKey });
  return _client;
}

const SONNET_MODEL = "claude-sonnet-4-5";

export interface ProposalOutput {
  proposals: Array<{ text: string }>;
  usage: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
}

export async function invokeArchetypeProposals(params: {
  archetype: ArchetypeKey;
  book: Book;
  storyPath: Node[];
  campbellStage?: string;
}): Promise<ProposalOutput> {
  const { archetype, book, storyPath, campbellStage } = params;

  // 캐시 레이어 1 — 공통 지침
  // 캐시 레이어 2 — 아르케타입별 시스템 프롬프트
  // 캐시 레이어 3 — 책 컨텍스트 (모드, 참여자 등)
  // 비캐시 — 현재 스토리 경로 + 캠벨 단계 + user 지시
  const bookContext = buildBookContext(book);
  const archetypeSystem = buildArchetypeSystemPrompt(archetype);
  const pathBlock = buildPathBlock(storyPath, campbellStage);

  const response = await client().messages.create({
    model: SONNET_MODEL,
    max_tokens: 700,
    system: [
      {
        type: "text",
        text: ARCHETYPE_COMMON_GUIDELINES,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: archetypeSystem,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: bookContext,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: pathBlock,
      },
    ],
    messages: [
      {
        role: "user",
        content:
          "이 지점에서 이어질 세 개의 갈래를 제안하세요. JSON 형식만 출력하세요.",
      },
    ],
  });

  // 사용량 기록
  const usage = {
    input: response.usage.input_tokens ?? 0,
    output: response.usage.output_tokens ?? 0,
    cacheRead: response.usage.cache_read_input_tokens ?? 0,
    cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
  };
  await addUsage("sonnet", usage).catch((e) =>
    console.warn("[tokens addUsage]", e),
  );

  // 응답 파싱 — content 블록 중 type === 'text' 인 것 수집
  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const proposals = parseProposalsJson(text);

  return { proposals, usage };
}

function buildBookContext(book: Book): string {
  const participants = book.participants.join(", ");
  const enabled = book.archetypesEnabled.length
    ? book.archetypesEnabled
        .map((k) => `${k}(${ARCHETYPES[k].koreanLabel})`)
        .join(", ")
    : "전체";
  const modeLabel =
    {
      simple: "단순 플롯 — 사건들이 연쇄적으로 악화되는 구조",
      complex: "복합 플롯 — 별개의 에피소드들이 교차하는 구조",
      trpg: "TRPG — 역할수행, MENTOR가 룰마스터 역할",
      free: "자유 — 제약 없는 자유 창작",
    }[book.mode] ?? "자유";

  return [
    `## 책 정보`,
    `제목: ${book.title}`,
    `모드: ${modeLabel}`,
    `참여자: ${participants}`,
    `활성 AI 페르소나: ${enabled}`,
  ].join("\n");
}

function buildPathBlock(storyPath: Node[], campbellStage?: string): string {
  const segments = storyPath.map((n, i) => {
    const author =
      n.authorType === "ai" && n.archetype
        ? `@${n.archetype}`
        : n.author;
    return `${i + 1}. ${n.text}\n   (작성: ${author})`;
  });
  const lines = [`## 지금까지의 이야기 (선택된 갈래)`];
  if (campbellStage) lines.push(`현재 캠벨 단계: ${campbellStage}`);
  lines.push("");
  lines.push(...segments);
  lines.push("");
  lines.push("위 마지막 토막 이후에 이어질 세 개의 갈래를 제안하세요.");
  return lines.join("\n");
}

// JSON 응답 내에서 proposals 3개 추출. 모델이 가끔 앞뒤에 설명을 붙이는 경우 대비.
function parseProposalsJson(raw: string): Array<{ text: string }> {
  // JSON 블록 찾기
  const match = raw.match(/\{[\s\S]*"proposals"[\s\S]*\}/);
  const candidate = match ? match[0] : raw;
  try {
    const parsed = JSON.parse(candidate);
    const arr = parsed.proposals;
    if (!Array.isArray(arr)) throw new Error("proposals is not array");
    return arr
      .map((p: { text?: string }) => ({
        text: String(p.text ?? "").trim(),
      }))
      .filter((p: { text: string }) => p.text.length > 0)
      .slice(0, 3);
  } catch (e) {
    console.error("[parseProposalsJson] failed", e, "raw:", raw);
    throw new Error(
      "AI 응답을 해석하지 못했습니다. 다시 시도해주세요.",
    );
  }
}
