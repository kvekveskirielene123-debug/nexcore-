"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList, type Message } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { PastChatsDrawer } from "@/components/chat/PastChatsDrawer";
import { InsufficientMarksModal } from "@/components/chat/InsufficientMarksModal";
import { type ModelKey, getModelCost } from "@/lib/ai/modelConfig";

interface ChatClientProps {
  character: {
    id: string;
    name: string;
    subtitle: string | null;
    avatar_url: string;
    gender_pronouns: string;
    greeting: string | null;
  };
  initialConversationId: string | null;
  initialMessages: Message[];
  initialTitle: string;
  initialMarksBalance: number;
  isSubscriber: boolean;
}

export function ChatClient({
  character,
  initialConversationId,
  initialMessages,
  initialTitle,
  initialMarksBalance,
  isSubscriber,
}: ChatClientProps) {
  const supabase = createClient();

  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [title, setTitle] = useState(initialTitle);
  const [marksBalance, setMarksBalance] = useState(initialMarksBalance);
  const [currentModel, setCurrentModel] = useState<ModelKey>("haiku");

  const [sending, setSending] = useState(false);
  const [showPastChats, setShowPastChats] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [requiredMarks, setRequiredMarks] = useState(0);

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
      // Seed with greeting if present
      if (character.greeting?.trim()) {
        setMessages([
          {
            id: "greeting",
            role: "assistant",
            content: character.greeting,
          },
        ]);
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

    // Optimistic add user message
    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userText,
    };
    const streamingMsg: Message = {
      id: `temp-stream-${Date.now()}`,
      role: "assistant",
      content: "",
      streaming: true,
    };
    setMessages((prev) => [...prev, tempUserMsg, streamingMsg]);

    // Optimistic balance deduction
    if (cost > 0) setMarksBalance((b) => b - cost);

    setSending(true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          message: userText,
          model: currentModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        if (err.error === "insufficient_marks") {
          // Refund optimistic debit
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
                prev.map((m) =>
                  m.id === streamingMsg.id ? { ...m, content: m.content + evt.text } : m
                )
              );
            } else if (evt.type === "done") {
              setMessages((prev) =>
                prev.map((m) => (m.id === streamingMsg.id ? { ...m, streaming: false } : m))
              );
            } else if (evt.type === "error") {
              // Refund balance
              if (cost > 0) setMarksBalance((b) => b + cost);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMsg.id
                    ? { ...m, content: "[ TRANSMISSION INTERRUPTED · Marks refunded ]", streaming: false }
                    : m
                )
              );
            }
          } catch {}
        }
      }

      // Auto-generate title if this was the first user message
      const userMsgCount = messages.filter((m) => m.role === "user").length;
      if (userMsgCount === 0) {
        fetch("/api/chat/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.title) setTitle(d.title);
          })
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
    // Fetch messages for that conversation
    const { data: messages } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (messages) setMessages(messages as Message[]);
    const { data: conv } = await supabase
      .from("conversations")
      .select("title")
      .eq("id", id)
      .single();
    if (conv) setTitle(conv.title);
  };

  const handleRename = async (newTitle: string) => {
    if (!conversationId) return;
    setTitle(newTitle); // optimistic
    await fetch("/api/chat/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, title: newTitle }),
    });
  };

  const handleDeleted = (id: string) => {
    if (id === conversationId) {
      // Start a new chat
      handleNewChat();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#05020d]">
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
      />

      <MessageList
        messages={messages}
        characterName={character.name}
        characterAvatar={character.avatar_url}
      />

      <ChatInput
        characterName={character.name}
        onSend={handleSend}
        sending={sending}
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
