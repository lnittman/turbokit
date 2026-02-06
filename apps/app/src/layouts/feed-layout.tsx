"use client";

import { useMemo, useState } from "react";
import type React from "react";

type FeedType = "all" | "product" | "system" | "team";

const FILTERS: FeedType[] = ["all", "product", "system", "team"];

const EVENTS = [
  {
    id: "1",
    type: "product" as FeedType,
    title: "new onboarding flow shipped",
    summary: "convert-first landing + setup checklist now in production.",
    tone: "var(--te-green)",
    time: "2m ago",
  },
  {
    id: "2",
    type: "system" as FeedType,
    title: "cache warm cycle completed",
    summary: "all regions reported green latencies under p95 target.",
    tone: "var(--te-blue)",
    time: "9m ago",
  },
  {
    id: "3",
    type: "team" as FeedType,
    title: "design review flagged contrast",
    summary: "two CTA states need semantic warning color instead of neutral.",
    tone: "var(--te-yellow)",
    time: "16m ago",
  },
  {
    id: "4",
    type: "system" as FeedType,
    title: "background sync retry failed",
    summary: "queue item exceeded retries and moved to dead-letter list.",
    tone: "var(--te-red)",
    time: "31m ago",
  },
  {
    id: "5",
    type: "product" as FeedType,
    title: "kanban starter adopted",
    summary: "new project bootstrapped from kanban shell for client alpha.",
    tone: "var(--te-orange)",
    time: "47m ago",
  },
];

export function FeedLayout(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<FeedType>("all");

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return EVENTS;
    return EVENTS.filter((event) => event.type === activeFilter);
  }, [activeFilter]);

  return (
    <div className="h-full overflow-auto bg-background p-5 md:p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-background-secondary p-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">live feed</h2>
            <p className="text-xs text-foreground-tertiary">realtime stream with filter + infinite-scroll pattern</p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-foreground-tertiary">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--te-green)" }} />
            streaming updates
          </span>
        </header>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground-tertiary transition-colors"
              onClick={() => setActiveFilter(filter)}
              style={
                activeFilter === filter
                  ? {
                      borderColor: "var(--user-accent)",
                      color: "var(--foreground)",
                      backgroundColor: "var(--background-secondary)",
                    }
                  : undefined
              }
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="space-y-2">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-sm border border-border bg-background-secondary p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="text-sm text-foreground">{event.title}</h3>
                <span className="text-xs text-foreground-tertiary">{event.time}</span>
              </div>
              <p className="text-sm text-foreground-secondary">{event.summary}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: event.tone }} />
                <span style={{ color: event.tone }}>{event.type}</span>
              </div>
            </article>
          ))}
        </section>

        <button className="mt-1 rounded-sm border border-dashed border-border bg-background-secondary px-4 py-2 text-xs text-foreground-tertiary">
          load more events
        </button>
      </div>
    </div>
  );
}
