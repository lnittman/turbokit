import type React from "react";

import { PromptBar } from "@/components/shared/prompt-bar";

const MESSAGES = [
  {
    id: "m1",
    role: "user",
    body: "design a restrained dashboard starter with realtime affordances.",
    time: "10:14",
  },
  {
    id: "m2",
    role: "assistant",
    body: "done. created a grayscale-first shell with functional status colors and layout switcher hooks.",
    time: "10:15",
  },
  {
    id: "m3",
    role: "user",
    body: "add kanban + canvas presets and make command palette route-aware.",
    time: "10:16",
  },
];

export function ChatLayout(): React.ReactElement {
  return (
    <div className="flex h-full flex-col bg-background p-5 md:p-6">
      <div className="mx-auto flex h-full w-full max-w-4xl min-h-0 flex-col gap-4">
        <header className="rounded-sm border border-border bg-background-secondary p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">chat starter</h2>
              <p className="text-xs text-foreground-tertiary">message history + prompt surface + streaming placeholder</p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-foreground-tertiary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--te-green)" }} />
              connection stable
            </span>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-auto rounded-sm border border-border bg-background-secondary p-4">
          <div className="space-y-3">
            {MESSAGES.map((message) => (
              <article
                key={message.id}
                className="rounded-sm border border-border bg-background p-3"
              >
                <div className="mb-1 flex items-center justify-between text-[11px] text-foreground-tertiary">
                  <span>{message.role}</span>
                  <span>{message.time}</span>
                </div>
                <p className="text-sm text-foreground-secondary">{message.body}</p>
              </article>
            ))}

            <article className="rounded-sm border border-border bg-background p-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-foreground-tertiary">
                <span>assistant</span>
                <span>typing…</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-quaternary" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-quaternary [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-quaternary [animation-delay:220ms]" />
              </div>
            </article>
          </div>
        </section>

        <PromptBar />
      </div>
    </div>
  );
}
