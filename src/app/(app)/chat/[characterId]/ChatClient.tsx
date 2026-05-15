"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList, type Message } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { CharacterSidebar } from "@/components/chat/CharacterSidebar";
import { PastChatsDrawer } from "@/components/chat/PastChatsDrawer";
import { InsufficientMarksModal } from "@/components/chat/InsufficientMarksModal";
import { type ModelKey, getModelCost, isSubscriptionActive } from "@/lib/ai/modelConfig";
import type { ChatFontSize, DefaultModel } from "@/lib/settings/preferences";
import type { Persona } from "@/lib/personas/types";

interface ChatClientProps {
  character: {
    id: string;
    name: string;
    subtitle: string | null;
    description: string | null;
    greeting: string | null;
    long_term_memory: string | null;
    gender_pronouns: string;
    avatar_url: string;
    visibility: string;
    is_nsfw: boolean;
    created_by: string;
    creator_username?: string | null;
    tier: string;
    is_platform: boolean;
  };
  conversation: { id: string; title: string | null; persona_id: string | null };
  initialMessages: Message[];
  allConversations: Array<{ id: string; title: string | null; last_message_at: string | null; persona_id: string | null }>;
  marksBalance: number;
  username: string;
  activePersona: Persona | null;
  defaultModel: DefaultModel;
  chatFontSize: ChatFontSize;
  subscriptionExpiresAt: string | null;
}

export function ChatClient({
  character,
  conversation,
  initialMessages,
  marksBalance: initialMarksBalance,
  defaultModel,
  subscriptionExpiresAt,
}: ChatClientProps) {
  const supabase = createClient();

  const [conversationId, setConversationId] = useState<string | null>(conversation.id);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [title, setTitle] = useState(conversation.title ?? "");
  const [marksBalance, setMarksBalance] = useState(initialMarksBalance);
  const [currentModel, setCurrentModel] = useState<ModelKey>(defaultModel as ModelKey);

  const [sending, setSending] = useState(false);
  const [showPastChats, setShowPastChats] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [requiredMarks, setRequiredMarks] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isSubscriber = isSubscriptionActive(subscriptionExpiresAt);

  const ensureConversation = async (): Promise<string | null> => {
    if (conversationId) return conversationId;
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: character.id }),
    });
    const data = await res.json();
    if (data.conversationId) {
      setConversationId(data.conversationId);
      if (character.greeting?.trim()) {
        setMessages([{ id: "greeting", role: "assistant", content: character.greeting }]);
      }
      return data.conversationId;
    }
    return null;
  };

  const handleSend = async (userText: string) => {
    if (sending) return;

    const cost = getModelCost(currentModel, isSubscriber);
    if (cost > marksBalance) {
      setRequiredMarks(cost);
      setShowInsufficient(true);
      return;
    }

    const convId = await ensureConversation();
    if (!convId) return;

    const tempUserMsg: Message = { id: `temp-user-${Date.now()}`, role: "user", content: userText };
    const streamingMsg: Message = { id: `temp-stream-${Date.now()}`, role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, tempUserMsg, streamingMsg]);

    if (cost > 0) setMarksBalance((b) => b - cost);
    setSending(true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: userText, model: currentModel }),
      });

      if (!response.ok) {
        const err = await response.json();
        if (err.error === "insufficient_marks") {
          if (cost > 0) setMarksBalance((b) => b + cost);
          setMessages((prev) => prev.filter((m) => m.id !== streamingMsg.id && m.id !== tempUserMsg.id));
          setRequiredMarks(err.required ?? cost);
          setShowInsufficient(true);
          setSending(false);
          return;
        }
        throw new Error(err.error);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "text") {
              setMessages((prev) =>
                prev.map((m) => (m.id === streamingMsg.id ? { ...m, content: m.content + evt.text } : m))
              );
            } else if (evt.type === "done") {
              setMessages((prev) =>
                prev.map((m) => (m.id === streamingMsg.id ? { ...m, streaming: false } : m))
              );
            } else if (evt.type === "error") {
              if (cost > 0) setMarksBalance((b) => b + cost);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMsg.id
                    ? { ...m, content: "Something went wrong. Your marks have been refunded.", streaming: false }
                    : m
                )
              );
            }
          } catch {}
        }
      }

      const userMsgCount = messages.filter((m) => m.role === "user").length;
      if (userMsgCount === 0) {
        fetch("/api/chat/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId }),
        })
          .then((r) => r.json())
          .then((d) => { if (d.title) setTitle(d.title); })
          .catch(() => {});
      }
    } catch (err) {
      console.error(err);
      if (cost > 0) setMarksBalance((b) => b + cost);
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = async () => {
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: character.id }),
    });
    const data = await res.json();
    if (data.conversationId) {
      setConversationId(data.conversationId);
      setTitle("New Chat");
      setMessages(
        character.greeting?.trim()
          ? [{ id: "greeting", role: "assistant", content: character.greeting }]
          : []
      );
    }
  };

  const handleSelectConversation = async (id: string) => {
    setShowPastChats(false);
    setConversationId(id);
    const { data: msgs } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (msgs) setMessages(msgs as Message[]);
    const { data: conv } = await supabase.from("conversations").select("title").eq("id", id).single();
    if (conv) setTitle(conv.title);
  };

  const handleRename = async (newTitle: string) => {
    if (!conversationId) return;
    setTitle(newTitle);
    await fetch("/api/chat/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, title: newTitle }),
    });
  };

  const handleDeleted = (id: string) => {
    if (id === conversationId) handleNewChat();
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d0f14" }}>
      {/* Main chat column */}
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          character={character}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          marksBalance={marksBalance}
          isSubscriber={isSubscriber}
          onNewChat={handleNewChat}
          onOpenPastChats={() => setShowPastChats(true)}
          currentTitle={title}
          onRename={handleRename}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        <MessageList
          messages={messages}
          characterName={character.name}
          characterAvatarUrl={character.avatar_url}
          characterGreeting={character.greeting}
        />

        <ChatInput
          characterName={character.name}
          onSend={handleSend}
          sending={sending}
        />
      </div>

      {/* Right sidebar — always visible on lg, drawer on mobile */}
      <CharacterSidebar
        character={character}
        onNewChat={handleNewChat}
        onOpenPastChats={() => setShowPastChats(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {showPastChats && (
        <PastChatsDrawer
          characterId={character.id}
          currentConversationId={conversationId}
          onSelect={handleSelectConversation}
          onClose={() => setShowPastChats(false)}
          onDeleted={handleDeleted}
        />
      )}

      <InsufficientMarksModal
        open={showInsufficient}
        required={requiredMarks}
        currentBalance={marksBalance}
        onClose={() => setShowInsufficient(false)}
      />
    </div>
  );
}
