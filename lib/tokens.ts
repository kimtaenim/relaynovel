// AI 토큰 사용량 추적
// Sonnet 4.5 / Haiku 4.5 모델별 가격 (per token, USD)

import { redis } from "./redis";

export const PRICING = {
  sonnet: {
    label: "S4.5",
    input: 3 / 1_000_000,
    output: 15 / 1_000_000,
    cacheRead: 0.3 / 1_000_000,
    cacheWrite5m: 3.75 / 1_000_000,
    cacheWrite1h: 6 / 1_000_000,
  },
  haiku: {
    label: "H4.5",
    input: 1 / 1_000_000,
    output: 5 / 1_000_000,
    cacheRead: 0.1 / 1_000_000,
    cacheWrite5m: 1.25 / 1_000_000,
    cacheWrite1h: 2 / 1_000_000,
  },
} as const;

export type ModelKey = keyof typeof PRICING;

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  calls: number;
  cost: number;
}

export interface GlobalUsage {
  sonnet: TokenUsage;
  haiku: TokenUsage;
  totalCost: number;
  updatedAt: number;
}

const TOKENS_KEY = "tokens:global";

function zero(): TokenUsage {
  return {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    calls: 0,
    cost: 0,
  };
}

export async function getUsage(): Promise<GlobalUsage> {
  const r = redis();
  const data = await r.get<GlobalUsage>(TOKENS_KEY);
  if (data) return data;
  return {
    sonnet: zero(),
    haiku: zero(),
    totalCost: 0,
    updatedAt: 0,
  };
}

export function calcCost(
  model: ModelKey,
  usage: { input: number; output: number; cacheRead?: number; cacheWrite?: number },
): number {
  const p = PRICING[model];
  return (
    (usage.input ?? 0) * p.input +
    (usage.output ?? 0) * p.output +
    (usage.cacheRead ?? 0) * p.cacheRead +
    (usage.cacheWrite ?? 0) * p.cacheWrite5m
  );
}

export async function addUsage(
  model: ModelKey,
  delta: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
  },
): Promise<GlobalUsage> {
  const current = await getUsage();
  const cur = current[model];
  const cost = calcCost(model, {
    input: delta.input ?? 0,
    output: delta.output ?? 0,
    cacheRead: delta.cacheRead ?? 0,
    cacheWrite: delta.cacheWrite ?? 0,
  });
  const next: TokenUsage = {
    input: cur.input + (delta.input ?? 0),
    output: cur.output + (delta.output ?? 0),
    cacheRead: cur.cacheRead + (delta.cacheRead ?? 0),
    cacheWrite: cur.cacheWrite + (delta.cacheWrite ?? 0),
    calls: cur.calls + 1,
    cost: cur.cost + cost,
  };
  const updated: GlobalUsage = {
    ...current,
    [model]: next,
    totalCost: current.totalCost + cost,
    updatedAt: Date.now(),
  };
  await redis().set(TOKENS_KEY, updated);
  return updated;
}
