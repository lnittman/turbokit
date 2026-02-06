import type React from "react";

const COLUMNS = [
  {
    id: "todo",
    title: "todo",
    cards: [
      { id: "t1", title: "wire account settings", priority: "high", tone: "var(--te-red)" },
      { id: "t2", title: "finalize canvas minimap", priority: "medium", tone: "var(--te-yellow)" },
    ],
  },
  {
    id: "doing",
    title: "doing",
    cards: [
      { id: "d1", title: "command palette actions", priority: "high", tone: "var(--te-orange)" },
      { id: "d2", title: "feed filtering states", priority: "low", tone: "var(--te-blue)" },
    ],
  },
  {
    id: "done",
    title: "done",
    cards: [
      { id: "dn1", title: "sidebar cleanup", priority: "done", tone: "var(--te-green)" },
      { id: "dn2", title: "token baseline pass", priority: "done", tone: "var(--te-green)" },
    ],
  },
];

export function KanbanLayout(): React.ReactElement {
  return (
    <div className="h-full overflow-auto bg-background p-5 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="rounded-sm border border-border bg-background-secondary p-3">
          <h2 className="text-sm font-medium text-foreground">kanban starter</h2>
          <p className="text-xs text-foreground-tertiary">column + card structure prepared for dnd-kit wiring</p>
        </header>

        <section className="grid gap-3 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <article
              key={column.id}
              className="rounded-sm border border-border bg-background-secondary p-3"
              data-dnd-container={column.id}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm text-foreground">{column.title}</h3>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground-tertiary">
                  {column.cards.length}
                </span>
              </div>

              <div className="space-y-2">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    className="cursor-grab rounded-sm border border-border bg-background p-3 active:cursor-grabbing"
                    data-dnd-card={card.id}
                  >
                    <p className="text-sm text-foreground">{card.title}</p>
                    <p className="mt-2 text-xs" style={{ color: card.tone }}>
                      {card.priority}
                    </p>
                  </div>
                ))}
              </div>

              <button className="mt-3 w-full rounded-sm border border-dashed border-border px-3 py-2 text-xs text-foreground-tertiary">
                add card
              </button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
