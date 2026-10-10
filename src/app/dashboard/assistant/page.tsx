"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Sparkles, Send } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const { data: session } = useSession();
  const api = createApiClient(session?.accessToken);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);

    try {
      const res = await api.assistant.chat(text, sessionId);
      setSessionId(res.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.assistant_message.content },
      ]);
    } catch {
      toast.error("The assistant is temporarily unavailable. Please try again.");
      // Remove the optimistic user message
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-stack-md shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-on-primary-container" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-headline-md text-on-surface">AI Assistant</h1>
          <p className="text-label-sm text-on-surface-variant">
            General wellness guidance — not medical advice
          </p>
        </div>
      </div>

      {/* Message thread */}
      <div
        className="flex-1 overflow-y-auto rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 space-y-4"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-12">
            <Sparkles className="w-10 h-10 text-outline" aria-hidden="true" />
            <p className="text-body-md text-on-surface-variant max-w-xs">
              Ask about nutrition, hydration, sleep, stress, or general wellness tips.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3 text-body-md",
                msg.role === "user"
                  ? "bg-primary text-on-primary rounded-br-sm"
                  : "bg-surface-container text-on-surface rounded-bl-sm border border-outline-variant/30"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-surface-container text-on-surface-variant rounded-xl rounded-bl-sm border border-outline-variant/30 px-4 py-3">
              <span className="inline-flex gap-1" aria-label="Assistant is typing">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-outline animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="mt-3 flex gap-2 shrink-0"
        aria-label="Send a message"
      >
        <label htmlFor="chat-input" className="sr-only">
          Your message
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your wellness…"
          disabled={sending}
          className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-surface-tint disabled:opacity-60"
          maxLength={4000}
        />
        <Button
          type="submit"
          size="lg"
          className="rounded-xl"
          disabled={!input.trim() || sending}
          isLoading={sending}
          aria-label="Send message"
        >
          {!sending && <Send className="w-4 h-4" aria-hidden="true" />}
        </Button>
      </form>

      <p className="mt-2 text-label-sm text-on-surface-variant text-center shrink-0">
        Responses are for informational purposes only and not medical advice.
      </p>
    </div>
  );
}
