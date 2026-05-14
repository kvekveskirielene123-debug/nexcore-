"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ── Types ────────────────────────────────────────────────────────────── */

export interface FeedPost {
  id:             string;
  user_id:        string;
  content:        string;
  image_url:      string | null;
  created_at:     string;
  username:       string;
  user_avatar_url:string | null;
  likes_count:    number;
  liked_by_me:    boolean;
}

interface CurrentUser {
  id:         string;
  username:   string;
  avatar_url: string | null;
}

/* ── Time helper ──────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Signal Feed Logo ────────────────────────────────────────────────── */

function SignalLogo() {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -16,
          background: "radial-gradient(circle,rgba(0,229,255,0.16) 0%,rgba(167,139,250,0.06) 50%,transparent 70%)",
          animation: "sf-breathe 3.5s ease-in-out infinite",
        }}
      />
      <svg width="72" height="72" viewBox="0 0 90 90" fill="none" aria-hidden="true">
        {/* Outer spinning ring */}
        <g style={{ animation: "sf-orbit 50s linear infinite", transformOrigin: "45px 45px" }}>
          <circle cx="45" cy="45" r="42" stroke="rgba(0,229,255,0.15)" strokeWidth="1" strokeDasharray="4 8"/>
          <circle cx="45" cy="3"  r="2.6" fill="#00e5ff"  style={{ animation: "sf-node 2.8s ease-in-out infinite" }}/>
          <circle cx="87" cy="45" r="2.6" fill="#a78bfa"  style={{ animation: "sf-node 2.8s ease-in-out infinite", animationDelay: "0.7s" }}/>
          <circle cx="45" cy="87" r="2.6" fill="#00e5ff"  style={{ animation: "sf-node 2.8s ease-in-out infinite", animationDelay: "1.4s" }}/>
          <circle cx="3"  cy="45" r="2.6" fill="#a78bfa"  style={{ animation: "sf-node 2.8s ease-in-out infinite", animationDelay: "2.1s" }}/>
        </g>

        {/* Broadcast arcs */}
        <path d="M 25 52 A 20 20 0 0 1 65 52" stroke="rgba(0,229,255,0.55)" strokeWidth="1.6" fill="none" strokeLinecap="round" style={{ animation: "sf-arc 2.2s ease-in-out infinite" }}/>
        <path d="M 15 52 A 30 30 0 0 1 75 52" stroke="rgba(0,229,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round" style={{ animation: "sf-arc 2.2s ease-in-out infinite", animationDelay: "0.35s" }}/>
        <path d="M 5  52 A 40 40 0 0 1 85 52" stroke="rgba(167,139,250,0.22)" strokeWidth="0.9" fill="none" strokeLinecap="round" style={{ animation: "sf-arc 2.2s ease-in-out infinite", animationDelay: "0.7s" }}/>

        {/* Vertical stem */}
        <line x1="45" y1="52" x2="45" y2="68" stroke="rgba(0,229,255,0.45)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="34" y1="68" x2="56" y2="68" stroke="rgba(0,229,255,0.35)" strokeWidth="2" strokeLinecap="round"/>

        {/* Pulse expand rings */}
        <circle cx="45" cy="45" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" r="5">
          <animate attributeName="r" values="5;38" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0" dur="2.5s" repeatCount="indefinite"/>
        </circle>

        {/* Center diamond */}
        <polygon points="45,38 52,45 45,52 38,45" fill="rgba(0,229,255,0.92)" stroke="white" strokeWidth="0.5"/>
        <circle cx="45" cy="45" r="1.8" fill="white" opacity="0.95"/>
      </svg>
    </div>
  );
}

/* ── User Avatar ─────────────────────────────────────────────────────── */

function UserAvatar({ url, name, size = 36 }: { url: string | null; name: string; size?: number }) {
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{
        width: size, height: size,
        border: "1.5px solid rgba(0,229,255,0.3)",
        background: url ? "transparent" : "rgba(124,58,237,0.25)",
        boxShadow: "0 0 10px rgba(0,229,255,0.12)",
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-black uppercase" style={{
          fontFamily: "var(--font-display)",
          color: "#a78bfa",
          fontSize: size * 0.38,
        }}>
          {name[0] ?? "?"}
        </span>
      )}
    </div>
  );
}

/* ── Composer ─────────────────────────────────────────────────────────── */

function Composer({ currentUser, onPost }: { currentUser: CurrentUser; onPost: (post: FeedPost) => void }) {
  const [text,       setText]       = useState("");
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  const handlePost = async () => {
    if (!text.trim() && !imageFile) return;
    setUploading(true);
    setError(null);
    try {
      let image_url: string | null = null;

      if (imageFile) {
        const supabase = createClient();
        const path = `${currentUser.id}/${Date.now()}_${imageFile.name.replace(/[^a-z0-9._-]/gi, "_")}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, imageFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(uploadData.path);
        image_url = urlData.publicUrl;
      }

      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() || " ", image_url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to post");

      onPost(data.post as FeedPost);
      setText("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setUploading(false);
    }
  };

  const canPost = (text.trim().length > 0 || !!imageFile) && !uploading;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(5,2,13,0.85)",
        border: "1px solid rgba(124,58,237,0.25)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)",
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.45),transparent)" }} />

      {/* Header label */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.8)" }} />
        <span className="text-[9px] tracking-[3.5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.75)" }}>
          NEW TRANSMISSION
        </span>
      </div>
      <div className="mx-4 h-px mb-3" style={{ background: "rgba(124,58,237,0.12)" }} />

      {/* Composer body */}
      <div className="px-4 pb-3">
        <div className="flex items-start gap-3">
          <UserAvatar url={currentUser.avatar_url} name={currentUser.username} size={36} />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={500}
            placeholder="What signal are you broadcasting?"
            rows={3}
            className="flex-1 bg-transparent text-sm text-[#e2d9f3] placeholder-[#2e1e4a] focus:outline-none resize-none leading-relaxed"
            style={{ fontFamily: "var(--font-body)", lineHeight: 1.7 }}
          />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mt-3 ml-11 rounded-xl overflow-hidden" style={{ maxHeight: 280 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 280 }} />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(5,2,13,0.85)", border: "1px solid rgba(248,113,113,0.4)", color: "#f87171" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="sr-only" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] tracking-[1.5px] transition-all active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: imagePreview ? "rgba(0,229,255,0.1)" : "rgba(8,4,26,0.6)",
              border: `1px solid ${imagePreview ? "rgba(0,229,255,0.4)" : "rgba(124,58,237,0.2)"}`,
              color: imagePreview ? "#00e5ff" : "rgba(122,106,154,0.6)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.4)"; (e.currentTarget as HTMLElement).style.color = "#00e5ff"; }}
            onMouseLeave={e => {
              if (!imagePreview) {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)";
                (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.6)";
              }
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            ATTACH
          </button>
          <span className="text-[9px] tabular-nums" style={{ fontFamily: "var(--font-mono)", color: text.length > 450 ? "#fbbf24" : "rgba(58,42,90,0.7)" }}>
            {text.length}/500
          </span>
        </div>

        <button
          onClick={handlePost}
          disabled={!canPost}
          className="cr-btn-primary relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] tracking-[3px] uppercase transition-all active:scale-95 disabled:opacity-35"
          style={{
            fontFamily: "var(--font-mono)",
            background: "linear-gradient(135deg,#00e5ff 0%,#0077ff 100%)",
            color: "#05020d",
            boxShadow: canPost ? "0 0 28px rgba(0,229,255,0.45), 0 4px 16px rgba(0,0,0,0.35)" : "none",
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {uploading ? (
              <>
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                SENDING
              </>
            ) : (
              <>BROADCAST<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
            )}
          </span>
        </button>
      </div>

      {error && (
        <p className="px-4 pb-3 -mt-2 text-[11px] text-red-400 flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
          <span>◈</span> {error}
        </p>
      )}
    </div>
  );
}

/* ── Post Card ────────────────────────────────────────────────────────── */

function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
}: {
  post:          FeedPost;
  currentUserId: string;
  onLike:        (id: string) => void;
  onDelete:      (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isOwn = post.user_id === currentUserId;

  return (
    <article
      className="relative rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(5,2,13,0.82)",
        border: "1px solid rgba(124,58,237,0.2)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.35)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)"; }}
    >
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.35),transparent)" }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <UserAvatar url={post.user_avatar_url} name={post.username} size={34} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white leading-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
            {post.username}
          </p>
          <p className="text-[10px] text-[#5a4a7a] leading-tight" style={{ fontFamily: "var(--font-mono)" }}>
            {timeAgo(post.created_at)}
          </p>
        </div>

        {isOwn && (
          <button
            onClick={() => onDelete(post.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ color: "rgba(90,74,122,0.5)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.5)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Separator */}
      <div className="mx-4 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />

      {/* Content */}
      {post.content.trim() && (
        <div className="px-4 pt-3 pb-2">
          <p
            className="text-[14px] leading-relaxed text-[#e2d9f3]"
            style={{ fontFamily: "var(--font-body)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {post.content}
          </p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="px-4 pt-2 pb-3">
          <button
            className="block w-full rounded-xl overflow-hidden transition-all"
            onClick={() => setExpanded(!expanded)}
            style={{
              maxHeight: expanded ? "none" : 320,
              overflow: expanded ? "visible" : "hidden",
              border: "1px solid rgba(124,58,237,0.18)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full object-cover"
              style={{ maxHeight: expanded ? "none" : 320, display: "block" }}
            />
          </button>
          {!expanded && (
            <button onClick={() => setExpanded(true)} className="mt-1 text-[9px] tracking-[1.5px] transition-colors" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.65)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.35)"; }}
            >EXPAND ↓</button>
          )}
        </div>
      )}

      {/* Footer — resonates */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2" style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] tracking-[1.5px] uppercase transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-mono)",
            background: post.liked_by_me ? "rgba(0,229,255,0.12)" : "rgba(8,4,26,0.6)",
            border: `1px solid ${post.liked_by_me ? "rgba(0,229,255,0.45)" : "rgba(124,58,237,0.2)"}`,
            color: post.liked_by_me ? "#00e5ff" : "rgba(122,106,154,0.55)",
            boxShadow: post.liked_by_me ? "0 0 12px rgba(0,229,255,0.18)" : "none",
            textShadow: post.liked_by_me ? "0 0 10px rgba(0,229,255,0.5)" : "none",
            transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          }}
          onMouseEnter={e => {
            if (!post.liked_by_me) {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.35)";
              (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.7)";
            }
          }}
          onMouseLeave={e => {
            if (!post.liked_by_me) {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)";
              (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.55)";
            }
          }}
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24"
            fill={post.liked_by_me ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: post.liked_by_me ? "drop-shadow(0 0 4px rgba(0,229,255,0.8))" : "none", transition: "filter 0.2s" }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {post.liked_by_me ? "◈ RESONATING" : "RESONATE"}
          {post.likes_count > 0 && (
            <span className="ml-0.5 opacity-60">{post.likes_count}</span>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: post.liked_by_me ? "#00e5ff" : "rgba(124,58,237,0.4)",
              boxShadow: post.liked_by_me ? "0 0 6px rgba(0,229,255,0.7)" : "none",
              transition: "all 0.2s",
            }}
          />
          <span className="text-[9px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(58,42,90,0.7)" }}>
            {post.likes_count} {post.likes_count === 1 ? "resonance" : "resonances"}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ── Main Feed Client ─────────────────────────────────────────────────── */

export function FeedClient({
  initialPosts,
  nextCursor: initialCursor,
  currentUser,
}: {
  initialPosts: FeedPost[];
  nextCursor:   string | null;
  currentUser:  CurrentUser;
}) {
  const [posts,      setPosts]      = useState<FeedPost[]>(initialPosts);
  const [cursor,     setCursor]     = useState<string | null>(initialCursor);
  const [loadingMore,setLoadingMore] = useState(false);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);

  const handlePost = (newPost: FeedPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id !== postId ? p : {
        ...p,
        liked_by_me: !p.liked_by_me,
        likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
      }
    ));
    try {
      await fetch(`/api/feed/${postId}/like`, { method: "POST" });
    } catch {
      // Revert on failure
      setPosts(prev => prev.map(p =>
        p.id !== postId ? p : {
          ...p,
          liked_by_me: !p.liked_by_me,
          likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
        }
      ));
    }
  };

  const handleDelete = async (postId: string) => {
    if (deleteId === postId) {
      // Confirmed — delete
      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeleteId(null);
      await fetch(`/api/feed/${postId}`, { method: "DELETE" });
    } else {
      // First click — ask for confirmation
      setDeleteId(postId);
      setTimeout(() => setDeleteId(null), 4000);
    }
  };

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/feed?cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      setPosts(prev => [...prev, ...(data.posts as FeedPost[])]);
      setCursor(data.nextCursor ?? null);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col items-center text-center pb-2">
        <SignalLogo />
        <div className="mt-3 flex items-center gap-2.5">
          <div className="h-px w-12" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,0.4))" }} />
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", animation: "sf-node 2s ease-in-out infinite" }} />
            <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,0.4)" }}>
              NEOLUTION PROTOCOL
            </span>
          </div>
          <div className="h-px w-12" style={{ background: "linear-gradient(to left,transparent,rgba(0,212,255,0.4))" }} />
        </div>
        <h1
          className="text-2xl font-black tracking-[5px] uppercase mt-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "#fff",
            textShadow: "0 0 40px rgba(0,229,255,0.45), 0 0 80px rgba(0,229,255,0.15)",
          }}
        >
          SIGNAL FEED
        </h1>
        <p className="text-[11px] mt-1" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.55)" }}>
          Live transmissions from the network
        </p>
      </div>

      {/* ── Composer ── */}
      <Composer currentUser={currentUser} onPost={handlePost} />

      {/* ── Divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.15)" }} />
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 5px rgba(167,139,250,0.7)" }} />
          <span className="text-[8px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.4)" }}>
            STREAM
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.15)" }} />
      </div>

      {/* ── Posts ── */}
      {posts.length === 0 ? (
        <div className="rounded-2xl text-center py-16 px-8" style={{ background: "rgba(5,2,13,0.7)", border: "1px dashed rgba(124,58,237,0.2)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.4" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-[#e2d9f3] mb-1" style={{ fontFamily: "var(--font-display)" }}>No transmissions yet</p>
          <p className="text-[12px]" style={{ fontFamily: "var(--font-body)", color: "rgba(90,74,122,0.7)" }}>
            Be the first to broadcast to the network.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id}>
              {/* Delete confirmation banner */}
              {deleteId === post.id && (
                <div className="mb-2 px-4 py-2.5 rounded-xl flex items-center justify-between" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)" }}>
                  <span className="text-[11px] text-red-300" style={{ fontFamily: "var(--font-body)" }}>Delete this post? This cannot be undone.</span>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteId(null)} className="text-[10px] tracking-[1px] px-3 py-1 rounded-lg transition-colors" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)", border: "1px solid rgba(124,58,237,0.2)" }}>CANCEL</button>
                    <button onClick={() => handleDelete(post.id)} className="text-[10px] tracking-[1px] px-3 py-1 rounded-lg transition-colors" style={{ fontFamily: "var(--font-mono)", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", color: "#f87171" }}>DELETE</button>
                  </div>
                </div>
              )}
              <PostCard
                post={post}
                currentUserId={currentUser.id}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Load more ── */}
      {cursor && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] tracking-[2.5px] uppercase transition-all active:scale-95 disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(167,139,250,0.65)", background: "rgba(124,58,237,0.04)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.45)"; (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.25)"; (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.65)"; }}
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                LOADING
              </>
            ) : (
              <>LOAD MORE SIGNALS ↓</>
            )}
          </button>
        </div>
      )}

      {/* ── Footer ── */}
      {!cursor && posts.length > 0 && (
        <p className="text-center text-[8px] tracking-[3px] uppercase pb-4" style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.2)" }}>
          END OF SIGNAL STREAM · {posts.length} TRANSMISSIONS
        </p>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes sf-orbit   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sf-node    { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
        @keyframes sf-breathe { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.1);opacity:1} }
        @keyframes sf-arc     { 0%,100%{opacity:.35} 50%{opacity:.85} }
      `}</style>
    </div>
  );
}
