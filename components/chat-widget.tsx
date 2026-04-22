"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:8000";

interface Message {
  id: string;
  sender_type: "visitor" | "agent";
  sender_name: string | null;
  content: string;
  created_at: string | null;
}

interface Conversation {
  id: string;
  status: string;
  subject: string | null;
  last_message_at: string | null;
  created_at: string | null;
}

type View = "closed" | "start" | "chat";

interface Props {
  siteId: string;
  lang?: string;
  accentColor?: string;
}

const STORAGE_KEY_PREFIX = "qvicko_chat_";

const T = {
  sv: {
    title: "Chatta med oss",
    emailPlaceholder: "Din e-postadress",
    namePlaceholder: "Ditt namn (valfritt)",
    messagePlaceholder: "Skriv ditt meddelande...",
    send: "Skicka",
    sending: "Skickar...",
    startChat: "Starta chatt",
    poweredBy: "Chat by Qvicko",
    emailRequired: "E-postadress krävs",
    messageRequired: "Skriv ett meddelande",
    error: "Något gick fel. Försök igen.",
    you: "Du",
    newMessage: "Nytt meddelande...",
  },
  en: {
    title: "Chat with us",
    emailPlaceholder: "Your email address",
    namePlaceholder: "Your name (optional)",
    messagePlaceholder: "Write your message...",
    send: "Send",
    sending: "Sending...",
    startChat: "Start chat",
    poweredBy: "Chat by Qvicko",
    emailRequired: "Email address is required",
    messageRequired: "Please write a message",
    error: "Something went wrong. Please try again.",
    you: "You",
    newMessage: "New message...",
  },
} as const;

export function ChatWidget({ siteId, lang, accentColor }: Props) {
  const locale = lang === "en" ? "en" : "sv";
  const t = T[locale];
  const color = accentColor || "#6366f1";

  const [view, setView] = useState<View>("closed");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${siteId}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.email) setEmail(data.email);
        if (data.name) setName(data.name);
        if (data.conversationId) setConversationId(data.conversationId);
      }
    } catch {
      // Ignore
    }
  }, [siteId]);

  const saveSession = useCallback(
    (e: string, n: string, cId: string | null) => {
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${siteId}`,
          JSON.stringify({ email: e, name: n, conversationId: cId })
        );
      } catch {
        // Ignore
      }
    },
    [siteId]
  );

  // Poll for new messages when chat is open
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(
        `${API_URL}/api/sites/${siteId}/chat/conversations/${conversationId}/messages?email=${encodeURIComponent(email)}`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // Silent fail on poll
    }
  }, [conversationId, siteId, email]);

  useEffect(() => {
    if (view === "chat" && conversationId) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 8000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [view, conversationId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleOpen() {
    if (conversationId && email) {
      setView("chat");
    } else {
      setView("start");
    }
  }

  async function handleStartChat(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError(t.emailRequired);
      return;
    }
    if (!trimmedMessage) {
      setError(t.messageRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/sites/${siteId}/chat/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: name.trim() || undefined,
          message: trimmedMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed");
      }

      const data = await res.json();
      setConversationId(data.conversation_id);
      setEmail(trimmedEmail);
      saveSession(trimmedEmail, name.trim(), data.conversation_id);
      setMessage("");
      setView("chat");
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !conversationId || loading) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/sites/${siteId}/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            message: message.trim(),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      setMessage("");
      await fetchMessages();
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  // Closed state - just the bubble button
  if (view === "closed") {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none"
        style={{ backgroundColor: color }}
        aria-label={t.title}
      >
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col" style={{ width: "min(380px, calc(100vw - 40px))" }}>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: color }}
        >
          <h3 className="text-sm font-semibold text-white">{t.title}</h3>
          <button
            onClick={() => setView("closed")}
            className="text-white/80 hover:text-white transition"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Start view - email + first message */}
        {view === "start" && (
          <form onSubmit={handleStartChat} className="p-4 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              rows={3}
              maxLength={5000}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: color }}
            >
              {loading ? t.sending : t.startChat}
            </button>
            <p className="text-center text-[10px] text-gray-400">{t.poweredBy}</p>
          </form>
        )}

        {/* Chat view - messages + send */}
        {view === "chat" && (
          <>
            <div className="h-72 overflow-y-auto p-3 space-y-2" style={{ maxHeight: "min(400px, 50vh)" }}>
              {messages.map((msg) => {
                const isVisitor = msg.sender_type === "visitor";
                return (
                  <div key={msg.id} className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        isVisitor
                          ? "text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      style={isVisitor ? { backgroundColor: color } : undefined}
                    >
                      {!isVisitor && (
                        <div className="text-[10px] font-medium text-gray-500 mb-0.5">
                          {msg.sender_name || "Support"}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      {msg.created_at && (
                        <div className={`text-[10px] mt-0.5 ${isVisitor ? "text-white/60" : "text-gray-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString(locale === "sv" ? "sv-SE" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {error && <p className="px-3 text-xs text-red-500">{error}</p>}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-gray-100 p-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.newMessage}
                maxLength={5000}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: color }}
                aria-label={t.send}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>

            <p className="pb-2 text-center text-[10px] text-gray-400">{t.poweredBy}</p>
          </>
        )}
      </div>
    </div>
  );
}
