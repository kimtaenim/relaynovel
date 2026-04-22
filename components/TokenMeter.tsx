"use client";

import { useEffect, useState } from "react";

interface Usage {
  sonnet: { input: number; output: number; cacheRead: number; cacheWrite: number; calls: number; cost: number };
  haiku: { input: number; output: number; cacheRead: number; cacheWrite: number; calls: number; cost: number };
  totalCost: number;
  updatedAt: number;
}

function fmtK(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function fmtCost(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.0001) return "<$0.0001";
  if (n < 1) return "$" + n.toFixed(4);
  return "$" + n.toFixed(2);
}

export function TokenMeter() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchUsage() {
      try {
        const res = await fetch("/api/tokens", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Usage;
        if (!cancelled) setUsage(data);
      } catch {
        // ignore
      }
    }
    fetchUsage();
    const id = setInterval(fetchUsage, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!usage) return null;

  const totalCalls = usage.sonnet.calls + usage.haiku.calls;
  const totalIn = usage.sonnet.input + usage.haiku.input;
  const totalOut = usage.sonnet.output + usage.haiku.output;

  return (
    <div
      className="pointer-events-auto fixed left-2 bottom-1 z-40 select-none font-script text-[10px] italic tracking-wider text-parchment-light/35 transition-colors hover:text-parchment-light/80 sm:left-3 sm:bottom-2 sm:text-[11px]"
      onClick={() => setExpanded((v) => !v)}
      role="button"
      tabIndex={0}
    >
      {expanded ? (
        <div className="rounded-lg border border-parchment-light/20 bg-mahogany-dark/85 px-3 py-2 backdrop-blur-sm">
          <div className="text-parchment-light/70">
            AI {totalCalls}회 · {fmtCost(usage.totalCost)}
          </div>
          <div className="mt-1 text-parchment-light/50">
            S4.5 {usage.sonnet.calls}회 · ↑{fmtK(usage.sonnet.input)}
            {usage.sonnet.cacheRead > 0 && (
              <span> (cache ↑{fmtK(usage.sonnet.cacheRead)})</span>
            )}
            {" "}↓{fmtK(usage.sonnet.output)} · {fmtCost(usage.sonnet.cost)}
          </div>
          <div className="text-parchment-light/50">
            H4.5 {usage.haiku.calls}회 · ↑{fmtK(usage.haiku.input)}{" "}
            ↓{fmtK(usage.haiku.output)} · {fmtCost(usage.haiku.cost)}
          </div>
          <div className="mt-1 text-[9px] text-parchment-light/40">
            (탭하여 접기)
          </div>
        </div>
      ) : (
        <span>
          AI · {totalCalls}회 · ↑{fmtK(totalIn)} ↓{fmtK(totalOut)} ·{" "}
          {fmtCost(usage.totalCost)}
        </span>
      )}
    </div>
  );
}
