"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList, type Message } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { CharacterSidebar } from "@/components/chat/CharacterSidebar";
import { InsufficientMarksModal } from "@/components/chat/InsufficientMarksModal";
import { BackgroundModal } from "@/components/chat/BackgroundModal";
import { FirstChatModal } from "@/components/chat/FirstChatModal";
import { CrisisModal } from "@/components/chat/CrisisModal";
import { type ModelKey, getModelCost, isSubscriptionActive } from "@/lib/ai/modelConfig";
import type { DefaultModel } from "@/lib/settings/preferences";
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
  marksBalance: number;
  activePersona: Persona | null;
  defaultModel: DefaultModel;
  subscriptionExpiresAt: string | null;
}

export function ChatClient({
  character,
  conversation,
  initialMessages,
  marksBalance: initialMarksBalance,
  activePersona: initialActivePersona,
  defaultModel,
  subscriptionExpiresAt,
}: ChatClientProps) {
  const supabase = createClient();

  const [conversationId, setConversationId] = useState<string | null>(conversation.id);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Always show greeting as first bubble — it's never stored in DB, so we
    // prepend it synthetically whether the conversation has messages or not.
    if (!character.greeting?.trim()) return initialMessages;
    return [{ id: "greeting", role: "assistant", content: character.greeting }, ...initialMessages];
  });
  const [title, setTitle] = useState(conversation.title ?? "");
  const [marksBalance, setMarksBalance] = useState(initialMarksBalance);
  const [currentModel, setCurrentModel] = useState<ModelKey>(defaultModel as ModelKey);
  const [activePersona, setActivePersona] = useState<Persona | null>(initialActivePersona);

  const [sending, setSending] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [requiredMarks, setRequiredMarks] = useState(0);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
const [backgroundUrl, setBackgroundUrl] = useState("");
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [sidebarInitialPanel, setSidebarInitialPanel] = useState<string | null>(null);
  const [showFirstChatModal, setShowFirstChatModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);

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

    // Show first-chat disclaimer modal once (localStorage gate)
    try {
      if (!localStorage.getItem("nx-first-chat-seen")) {
        setPendingMessage(userText);
        setShowFirstChatModal(true);
        return;
      }
    } catch {}

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
        const err = await response.json().catch(() => ({ error: "Request failed" }));
        if (err.error === "insufficient_marks") {
          if (cost > 0) setMarksBalance((b) => b + cost);
          setMessages((prev) => prev.filter((m) => m.id !== streamingMsg.id && m.id !== tempUserMsg.id));
          setRequiredMarks(err.required ?? cost);
          setShowInsufficient(true);
          setSending(false);
          return;
        }
        // Show the server error in the bubble instead of leaving it empty
        if (cost > 0) setMarksBalance((b) => b + cost);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMsg.id
              ? { ...m, content: err.error ?? "Something went wrong. Please try again.", streaming: false }
              : m
          )
        );
        setSending(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        if (cost > 0) setMarksBalance((b) => b + cost);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMsg.id
              ? { ...m, content: "Stream unavailable. Please try again.", streaming: false }
              : m
          )
        );
        setSending(false);
        return;
      }

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
      console.error("Chat stream error:", err);
      if (cost > 0) setMarksBalance((b) => b + cost);
      // Update the empty streaming bubble so it doesn't silently stay blank
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsg.id
            ? { ...m, content: "Connection error. Please try again.", streaming: false }
            : m
        )
      );
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
      // Keep URL in sync so refresh lands on this conversation, not the archived one
      window.history.replaceState(null, "", `/chat/${character.id}?conv=${data.conversationId}`);
    }
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




  const handleOpenPersona = () => {
    setSidebarInitialPanel("persona");
    setSidebarOpen(true);
    setTimeout(() => setSidebarInitialPanel(null), 80);
  };

  const handleContinue = async () => {
    if (sending || !conversationId) return;
    const streamingMsg: Message = { id: `temp-stream-${Date.now()}`, role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, streamingMsg]);
    setSending(true);
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: "continue", model: currentModel }),
      });
      if (!response.ok) throw new Error("Stream error");
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
              setMessages((prev) => prev.map((m) => (m.id === streamingMsg.id ? { ...m, content: m.content + evt.text } : m)));
            } else if (evt.type === "done") {
              setMessages((prev) => prev.map((m) => (m.id === streamingMsg.id ? { ...m, streaming: false } : m)));
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== streamingMsg.id));
    } finally {
      setSending(false);
    }
  };

  const isTyping = sending && messages.length > 0 && messages[messages.length - 1]?.streaming === true && messages[messages.length - 1]?.content === "";

  return (
    <div className="fixed inset-0 flex" style={{ background: "#0d0f14", zIndex: 100 }}>
      {/* Main chat column */}
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          character={character}
          marksBalance={marksBalance}
          currentTitle={title}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
          onOpenBackground={() => setShowBackgroundModal(true)}
          onNewChat={handleNewChat}
          onOpenPersona={handleOpenPersona}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          isSubscriber={isSubscriber}
        />

        <MessageList
          messages={messages}
          characterName={character.name}
          characterAvatarUrl={character.avatar_url}
          characterGreeting={character.greeting}
          showTyping={isTyping}
          onContinue={handleContinue}
          backgroundUrl={backgroundUrl}
        />

        <ChatInput
          characterName={character.name}
          onSend={handleSend}
          sending={sending}
          onNeedHelp={() => setCrisisOpen(true)}
        />
      </div>

      {/* Right sidebar — always visible on lg, drawer on mobile */}
      <CharacterSidebar
        character={character}
        conversationId={conversationId}
        activePersona={activePersona}
        onPersonaChange={setActivePersona}
        currentModel={currentModel}
        onModelChange={setCurrentModel}
        isSubscriber={isSubscriber}
        marksBalance={marksBalance}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        openPanel={sidebarInitialPanel}
        backgroundUrl={backgroundUrl}
        onOpenBackground={() => setShowBackgroundModal(true)}
        onClearBackground={() => setBackgroundUrl("")}
      />


      <InsufficientMarksModal
        open={showInsufficient}
        required={requiredMarks}
        currentBalance={marksBalance}
        onClose={() => setShowInsufficient(false)}
      />

      <BackgroundModal
        open={showBackgroundModal}
        onClose={() => setShowBackgroundModal(false)}
        onSelect={setBackgroundUrl}
      />

      {showFirstChatModal && (
        <FirstChatModal
          onConfirm={() => {
            setShowFirstChatModal(false);
            if (pendingMessage) {
              const msg = pendingMessage;
              setPendingMessage(null);
              handleSend(msg);
            }
          }}
        />
      )}

      <CrisisModal open={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  );
}
