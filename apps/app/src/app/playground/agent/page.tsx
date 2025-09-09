"use client";
import { useEffect, useMemo, useState } from "react";
import { ConvexProvider, ConvexReactClient, useAction } from "convex/react";
import { api } from "@repo/backend/api";

function AgentDemoInner() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [codePrompt, setCodePrompt] = useState("Create a TypeScript function that adds two numbers with JSDoc.");
  const [output, setOutput] = useState<string>("");
  const createThread = useAction((api as any).ai.actions.createAssistantThread);
  const sendMessage = useAction((api as any).ai.actions.sendAIMessage);
  const generateCode = useAction((api as any).ai.actions.generateAICode);

  async function ensureThread() {
    if (threadId) return threadId;
    const { threadId: id } = await createThread({});
    setThreadId(id);
    return id;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Agent Playground</h1>
      <p className="text-sm text-muted-foreground">
        This template page demonstrates calling Convex AI actions to create a thread, send a
        message, and generate code. Configure NEXT_PUBLIC_CONVEX_URL and Convex auth to enable.
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">Assistant Message</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-md border p-2 text-sm"
          rows={3}
          placeholder="Ask the assistant something..."
        />
        <button
          className="rounded-md bg-primary px-3 py-2 text-primary-foreground text-sm"
          onClick={async () => {
            setOutput("");
            const id = await ensureThread();
            await sendMessage({ threadId: id, prompt });
            setOutput("Message sent. The assistant response is streamed and saved to the thread.");
          }}
        >
          Send to Assistant
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Code Generation Prompt</label>
        <textarea
          value={codePrompt}
          onChange={(e) => setCodePrompt(e.target.value)}
          className="w-full rounded-md border p-2 text-sm"
          rows={3}
        />
        <button
          className="rounded-md bg-secondary px-3 py-2 text-secondary-foreground text-sm"
          onClick={async () => {
            const result = await generateCode({ prompt: codePrompt });
            setOutput(result.code ?? JSON.stringify(result));
          }}
        >
          Generate Code
        </button>
      </div>

      {output && (
        <div className="mt-4">
          <label className="text-sm font-medium">Output</label>
          <pre className="mt-2 whitespace-pre-wrap rounded-md border p-3 text-xs bg-muted/40">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function AgentPage() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => (url ? new ConvexReactClient(url) : null), [url]);

  if (!url) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-semibold">Agent Playground</h1>
        <p className="text-sm text-muted-foreground mt-2">
          NEXT_PUBLIC_CONVEX_URL is not set. Configure Convex to use this demo.
        </p>
      </div>
    );
  }

  return (
    <ConvexProvider client={client!}>
      <AgentDemoInner />
    </ConvexProvider>
  );
}

