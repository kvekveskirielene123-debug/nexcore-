"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ── Types ───────────────────────────────────────────────────────────────── */

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

/* ── Time helper ─────────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Signal Feed Logo ────────────────────────────────────────────────────── */

function SignalLogo() {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -16,
          background: "radial-gradient(circle,rgba(0,229,255,0.18) 0%,rgba(167,139,250,0.07) 50%,transparent 70%)",
          animation: "sf-breathe 3.5s ease-in-out infinite",
        }}
      />
      <svg width="72" height="72" viewBox="0 0 90 90" fill="none" aria-hidden="true">
        <g style={{ animation: "sf-orbit 50s linear infinite", transformOrigin: "45px 45px" }}>
          <circle cx="45" cy="45" r="42" stroke="rgba(0,229,255,0.15)" strokeWidth="1" strokeDasharray="4 8"/>
          <circle cx="45" cy="3"  r="2.6" fill="#00e5ff"  style={{ animation: "sf-node 2.8s ease-in-out infinite" }}/>
          <circle cx="87" cy="45" r="2.6" fill="#a78bfa"  style={{ animation: "sf-node 2.8s ease-in-out infinite", animationDelay: "0.7s" }}/>
          <circle cx="45" cy="87" r="2.6" fill="#00e5ff"  style={{ animation: "sf-node 2.8s ease-in-out infinite", animationDelay: "1.4s" }}/>
          <circle cx="3"  cy="45" r="2.6" fill="#a78bfa"  style={{ animation: "sf-node 2.8s ease-in-out infinite", animationDelay: "2.1s" }}/>
        </g>
        <path d="M 25 52 A 20 20 0 0 1 65 52" stroke="rgba(0,229,255,0.55)" strokeWidth="1.6" fill="none" strokeLinecap="round" style={{ animation: "sf-arc 2.2s ease-in-out infinite" }}/>
        <path d="M 15 52 A 30 30 0 0 1 75 52" stroke="rgba(0,229,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round" style={{ animation: "sf-arc 2.2s ease-in-out infinite", animationDelay: "0.35s" }}/>
        <path d="M 5  52 A 40 40 0 0 1 85 52" stroke="rgba(167,139,250,0.22)" strokeWidth="0.9" fill="none" strokeLinecap="round" style={{ animation: "sf-arc 2.2s ease-in-out infinite", animationDelay: "0.7s" }}/>
        <line x1="45" y1="52" x2="45" y2="68" stroke="rgba(0,229,255,0.45)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="34" y1="68" x2="56" y2="68" stroke="rgba(0,229,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="45" cy="45" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" r="5">
          <animate attributeName="r" values="5;38" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <polygon points="45,38 52,45 45,52 38,45" fill="rgba(0,229,255,0.92)" stroke="white" strokeWidth="0.5"/>
        <circle cx="45" cy="45" r="1.8" fill="white" opacity="0.95"/>
      </svg>
    </div>
  );
}

/* ── Corner Brackets ─────────────────────────────────────────────────────── */

function CornerBrackets({ color = "rgba(0,229,255,0.5)", size = 12 }: { color?: string; size?: number }) {
  const s = `${size}px`;
  const base: React.CSSProperties = { position: "absolute", width: s, height: s };
  return (
    <>
      <div style={{ ...base, top: 0, left: 0,  borderTop:    `1.5px solid ${color}`, borderLeft:  `1.5px solid ${color}` }} />
      <div style={{ ...base, top: 0, right: 0, borderTop:    `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
      <div style={{ ...base, bottom: 0, left: 0,  borderBottom: `1.5px solid ${color}`, borderLeft:  `1.5px solid ${color}` }} />
      <div style={{ ...base, bottom: 0, right: 0, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
    </>
  );
}

/* ── User Avatar ─────────────────────────────────────────────────────────── */

function UserAvatar({
  url, name, size = 36, live = false,
}: { url: string | null; name: string; size?: number; live?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full overflow-hidden flex items-center justify-center w-full h-full"
        style={{
          border: "1.5px solid rgba(0,229,255,0.32)",
          background: url ? "transparent" : "linear-gradient(135deg,rgba(124,58,237,0.42),rgba(0,229,255,0.1))",
          boxShadow: "0 0 18px rgba(0,229,255,0.16), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span
            className="font-black uppercase select-none"
            style={{ fontFamily: "var(--font-display)", color: "#a78bfa", fontSize: size * 0.38 }}
          >
            {name[0] ?? "?"}
          </span>
        )}
      </div>
      {live && (
        <div
          className="absolute rounded-full"
          style={{
            bottom: -1, right: -1,
            width: Math.max(10, size * 0.27), height: Math.max(10, size * 0.27),
            background: "#00e5ff",
            border: "2px solid #05020d",
            boxShadow: "0 0 8px rgba(0,229,255,0.9)",
          }}
        />
      )}
    </div>
  );
}

/* ── Composer ─────────────────────────────────────────────────────────────── */

function Composer({ currentUser, onPost }: { currentUser: CurrentUser; onPost: (post: FeedPost) => void }) {
  const [text,         setText]         = useState("");
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [focused,      setFocused]      = useState(false);
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

  // Character ring
  const ringR     = 13;
  const ringCirc  = 2 * Math.PI * ringR;
  const ringPct   = text.length / 500;
  const ringOffset= ringCirc * (1 - ringPct);
  const ringColor = text.length > 450 ? "#fbbf24" : text.length > 350 ? "rgba(0,229,255,0.9)" : "rgba(0,229,255,0.45)";

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(5,2,13,0.92)",
        border: `1px solid ${focused ? "rgba(0,229,255,0.4)" : "rgba(124,58,237,0.22)"}`,
        boxShadow: focused
          ? "0 0 0 1px rgba(0,229,255,0.07), 0 0 48px rgba(0,229,255,0.1), 0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.028)"
          : "0 4px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.018)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: focused
            ? "linear-gradient(90deg,transparent,rgba(0,229,255,0.7),transparent)"
            : "linear-gradient(90deg,transparent,rgba(0,229,255,0.35),transparent)",
          transition: "background 0.3s",
        }}
      />

      {/* Header bar */}
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-2.5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#00e5ff", boxShadow: "0 0 10px rgba(0,229,255,1)", animation: "sf-node 2s ease-in-out infinite" }}
        />
        <span
          className="text-[9px] tracking-[3.5px] uppercase"
          style={{
            fontFamily: "var(--font-mono)",
            color: focused ? "rgba(0,229,255,0.9)" : "rgba(0,229,255,0.6)",
            transition: "color 0.3s",
          }}
        >
          NEW TRANSMISSION
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {[1, 0.6, 0.3].map((op, i) => (
            <div key={i} className="w-1 h-1 rounded-full" style={{ background: "rgba(167,139,250,0.5)", opacity: op }} />
          ))}
        </div>
      </div>

      {/* Separator */}
      <div
        className="mx-5 mb-4 h-px"
        style={{ background: "linear-gradient(90deg,rgba(0,229,255,0.2),rgba(124,58,237,0.1),transparent)" }}
      />

      {/* Body */}
      <div className="px-5 pb-3">
        <div className="flex gap-3.5">
          <UserAvatar url={currentUser.avatar_url} name={currentUser.username} size={40} live />
          <div className="flex-1 min-w-0">
            <div
              className="text-[11px] font-bold mb-1.5 tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.55)" }}
            >
              {currentUser.username}
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={500}
              placeholder="What signal are you broadcasting?"
              rows={3}
              className="w-full bg-transparent text-[14px] text-[#e2d9f3] placeholder-[#2a1a3e] focus:outline-none resize-none"
              style={{ fontFamily: "var(--font-body)", lineHeight: 1.75 }}
            />
          </div>
        </div>
      </div>

      {/* Image preview — full bleed */}
      {imagePreview && (
        <div className="relative" style={{ borderTop: "1px solid rgba(124,58,237,0.14)", borderBottom: "1px solid rgba(124,58,237,0.14)" }}>
          <div style={{ overflow: "hidden", maxHeight: 300 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full object-cover" style={{ display: "block" }} />
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <CornerBrackets color="rgba(0,229,255,0.55)" size={14} />
          </div>
          <button
            onClick={removeImage}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ background: "rgba(5,2,13,0.88)", border: "1px solid rgba(248,113,113,0.45)", color: "#f87171" }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderTop: imagePreview ? "none" : "1px solid rgba(124,58,237,0.09)" }}
      >
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="sr-only" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] tracking-[1.5px] uppercase transition-all active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: imagePreview ? "rgba(0,229,255,0.09)" : "rgba(8,4,26,0.6)",
              border: `1px solid ${imagePreview ? "rgba(0,229,255,0.42)" : "rgba(124,58,237,0.18)"}`,
              color: imagePreview ? "#00e5ff" : "rgba(122,106,154,0.5)",
            }}
            onMouseEnter={e => {
              if (!imagePreview) {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.35)";
                (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.7)";
              }
            }}
            onMouseLeave={e => {
              if (!imagePreview) {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.18)";
                (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.5)";
              }
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            ATTACH
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Character arc ring */}
          {text.length > 0 && (
            <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="16" cy="16" r={ringR} fill="none" stroke="rgba(124,58,237,0.14)" strokeWidth="2.2" />
                <circle
                  cx="16" cy="16" r={ringR} fill="none" stroke={ringColor} strokeWidth="2.2"
                  strokeDasharray={ringCirc} strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.15s, stroke 0.15s" }}
                />
              </svg>
              <span
                className="absolute text-[7px] tabular-nums"
                style={{ fontFamily: "var(--font-mono)", color: text.length > 450 ? "#fbbf24" : "rgba(0,229,255,0.45)" }}
              >
                {500 - text.length}
              </span>
            </div>
          )}

          <button
            onClick={handlePost}
            disabled={!canPost}
            className="cr-btn-primary relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] tracking-[3px] uppercase transition-all active:scale-95 disabled:opacity-30"
            style={{
              fontFamily: "var(--font-mono)",
              background: "linear-gradient(135deg,#00e5ff 0%,#0077ff 100%)",
              color: "#05020d",
              boxShadow: canPost
                ? "0 0 36px rgba(0,229,255,0.55), 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22)"
                : "none",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              {uploading ? (
                <>
                  <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  SENDING
                </>
              ) : (
                <>
                  BROADCAST
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p
          className="px-5 pb-3.5 -mt-2 text-[11px] flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-body)", color: "#f87171" }}
        >
          <span>◈</span> {error}
        </p>
      )}
    </div>
  );
}

/* ── Post Card ────────────────────────────────────────────────────────────── */

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
  const [expanded,  setExpanded]  = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const [justLiked, setJustLiked] = useState(false);
  const isOwn = post.user_id === currentUserId;

  const handleLike = () => {
    if (!post.liked_by_me) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 700);
    }
    onLike(post.id);
  };

  return (
    /* Entry animation wrapper — isolates the rise from the hover transform */
    <div style={{ animation: "pf-rise 0.45s cubic-bezier(0.16,1,0.3,1) both" }}>
      <article
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: post.liked_by_me
            ? "rgba(5,3,16,0.94)"
            : "rgba(5,2,13,0.9)",
          border: `1px solid ${
            post.liked_by_me
              ? "rgba(0,229,255,0.24)"
              : hovered
                ? "rgba(124,58,237,0.4)"
                : "rgba(124,58,237,0.18)"
          }`,
          boxShadow: hovered
            ? "0 10px 56px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.014), 0 0 64px rgba(124,58,237,0.07)"
            : post.liked_by_me
              ? "0 4px 32px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.05), inset 0 1px 0 rgba(0,229,255,0.03)"
              : "0 2px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.01)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none"
          style={{
            background: post.liked_by_me
              ? "linear-gradient(180deg,transparent 5%,rgba(0,229,255,0.85) 50%,transparent 95%)"
              : hovered
                ? "linear-gradient(180deg,transparent 5%,rgba(124,58,237,0.5) 50%,transparent 95%)"
                : "linear-gradient(180deg,transparent 5%,rgba(124,58,237,0.22) 50%,transparent 95%)",
            transition: "background 0.3s ease",
          }}
        />

        {/* Top scan glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: post.liked_by_me
              ? "linear-gradient(90deg,transparent,rgba(0,229,255,0.55),transparent)"
              : "linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)",
            transition: "background 0.3s ease",
          }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2.5 pl-5">
          <UserAvatar url={post.user_avatar_url} name={post.username} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="text-[14px] font-black text-white leading-none tracking-wide truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {post.username}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "rgba(0,229,255,0.5)", boxShadow: "0 0 4px rgba(0,229,255,0.5)" }}
              />
              <p
                className="text-[9px] tracking-[1.5px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.7)" }}
              >
                {timeAgo(post.created_at)}
              </p>
            </div>
          </div>

          {isOwn && (
            <button
              onClick={() => onDelete(post.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0"
              style={{ color: "rgba(90,74,122,0.38)", background: "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.38)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Separator */}
        <div
          className="mx-5 mb-3 h-px"
          style={{ background: "linear-gradient(90deg,rgba(124,58,237,0.14),transparent)" }}
        />

        {/* Content */}
        {post.content.trim() && (
          <div className="px-5 pb-3">
            <p
              className="text-[14px] text-[#ddd4f5]"
              style={{ fontFamily: "var(--font-body)", lineHeight: 1.78, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {post.content}
            </p>
          </div>
        )}

        {/* Image — full bleed, corner brackets overlay */}
        {post.image_url && (
          <div
            className="relative mt-1 mx-0 mb-0"
            style={{ borderTop: "1px solid rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.12)" }}
          >
            <button
              className="block w-full"
              onClick={() => setExpanded(!expanded)}
              style={{ cursor: "zoom-in" }}
            >
              <div style={{ overflow: "hidden", maxHeight: expanded ? "none" : 360 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="w-full object-cover"
                  style={{ display: "block" }}
                />
              </div>
            </button>
            <div className="absolute inset-0 pointer-events-none">
              <CornerBrackets color={post.liked_by_me ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.4)"} size={14} />
              {!expanded && (
                <div
                  className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded pointer-events-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    letterSpacing: "1.5px",
                    background: "rgba(5,2,13,0.75)",
                    border: "1px solid rgba(0,229,255,0.18)",
                    color: "rgba(0,229,255,0.45)",
                  }}
                >
                  EXPAND ↓
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3.5 mt-1"
          style={{ borderTop: "1px solid rgba(124,58,237,0.07)" }}
        >
          <button
            onClick={handleLike}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-[10px] tracking-[2px] uppercase active:scale-95"
            style={{
              fontFamily: "var(--font-mono)",
              background: post.liked_by_me ? "rgba(0,229,255,0.11)" : "rgba(8,4,26,0.55)",
              border: `1px solid ${post.liked_by_me ? "rgba(0,229,255,0.52)" : "rgba(124,58,237,0.2)"}`,
              color: post.liked_by_me ? "#00e5ff" : "rgba(122,106,154,0.5)",
              boxShadow: post.liked_by_me
                ? "0 0 22px rgba(0,229,255,0.22), inset 0 1px 0 rgba(0,229,255,0.09)"
                : "none",
              textShadow: post.liked_by_me ? "0 0 14px rgba(0,229,255,0.65)" : "none",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={e => {
              if (!post.liked_by_me) {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.3)";
                (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.65)";
              }
            }}
            onMouseLeave={e => {
              if (!post.liked_by_me) {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)";
                (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.5)";
              }
            }}
          >
            {/* Ping ring on first like */}
            {justLiked && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: "2px solid rgba(0,229,255,0.75)", animation: "pf-ping 0.65s ease-out forwards" }}
              />
            )}
            <svg
              width="11" height="11" viewBox="0 0 24 24"
              fill={post.liked_by_me ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{
                filter: post.liked_by_me ? "drop-shadow(0 0 6px rgba(0,229,255,0.95))" : "none",
                transition: "filter 0.25s",
              }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.liked_by_me ? "◈ RESONATING" : "RESONATE"}
          </button>

          {post.likes_count > 0 && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: post.liked_by_me ? "#00e5ff" : "rgba(124,58,237,0.38)",
                  boxShadow: post.liked_by_me ? "0 0 8px rgba(0,229,255,0.8)" : "none",
                  transition: "all 0.3s",
                }}
              />
              <span
                className="text-[9px] tabular-nums"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(58,42,90,0.7)" }}
              >
                {post.likes_count} {post.likes_count === 1 ? "resonance" : "resonances"}
              </span>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

/* ── Main Feed Client ─────────────────────────────────────────────────────── */

export function FeedClient({
  initialPosts,
  nextCursor: initialCursor,
  currentUser,
}: {
  initialPosts: FeedPost[];
  nextCursor:   string | null;
  currentUser:  CurrentUser;
}) {
  const [posts,       setPosts]       = useState<FeedPost[]>(initialPosts);
  const [cursor,      setCursor]      = useState<string | null>(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);

  const handlePost = (newPost: FeedPost) => setPosts(prev => [newPost, ...prev]);

  const handleLike = async (postId: string) => {
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
      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeleteId(null);
      await fetch(`/api/feed/${postId}`, { method: "DELETE" });
    } else {
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
    <div className="relative max-w-2xl mx-auto px-4 py-6">

      {/* Ambient radial glow */}
      <div
        className="pointer-events-none fixed"
        aria-hidden="true"
        style={{
          top: 0, left: "50%", transform: "translateX(-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse 70% 50% at 50% 0%,rgba(0,229,255,0.045) 0%,transparent 70%)",
          zIndex: 0,
        }}
      />

      <div className="relative space-y-6" style={{ zIndex: 1 }}>

        {/* ── Page header ── */}
        <div className="flex flex-col items-center text-center pb-1">
          <SignalLogo />
          <div className="mt-3 flex items-center gap-2.5">
            <div className="h-px w-14" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,0.4))" }} />
            <div className="flex items-center gap-1.5">
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", animation: "sf-node 2s ease-in-out infinite" }}
              />
              <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,0.4)" }}>
                NEOLUTION PROTOCOL
              </span>
            </div>
            <div className="h-px w-14" style={{ background: "linear-gradient(to left,transparent,rgba(0,212,255,0.4))" }} />
          </div>
          <h1
            className="text-[26px] font-black tracking-[6px] uppercase mt-2.5"
            style={{
              fontFamily: "var(--font-display)",
              color: "#fff",
              textShadow: "0 0 48px rgba(0,229,255,0.5), 0 0 96px rgba(0,229,255,0.18)",
            }}
          >
            SIGNAL FEED
          </h1>
          <p className="text-[11px] mt-1.5" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.5)" }}>
            Live transmissions from the network
          </p>
        </div>

        {/* ── Composer ── */}
        <Composer currentUser={currentUser} onPost={handlePost} />

        {/* ── Stream divider ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.14)" }} />
          <div className="flex items-center gap-1.5 px-1">
            <div className="w-1 h-1 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 5px rgba(167,139,250,0.7)" }} />
            <span className="text-[8px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.4)" }}>
              STREAM
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.14)" }} />
        </div>

        {/* ── Posts ── */}
        {posts.length === 0 ? (
          <div
            className="rounded-2xl text-center py-20 px-8"
            style={{
              background: "rgba(5,2,13,0.75)",
              border: "1px dashed rgba(124,58,237,0.18)",
              boxShadow: "inset 0 0 80px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "rgba(0,229,255,0.04)",
                border: "1px solid rgba(0,229,255,0.14)",
                boxShadow: "0 0 30px rgba(0,229,255,0.06)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.38)" strokeWidth="1.4" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[#e2d9f3] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              No transmissions yet
            </p>
            <p className="text-[12px]" style={{ fontFamily: "var(--font-body)", color: "rgba(90,74,122,0.6)" }}>
              Be the first to broadcast to the network.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id}>
                {/* Delete confirmation banner */}
                {deleteId === post.id && (
                  <div
                    className="mb-2 px-4 py-2.5 rounded-xl flex items-center justify-between"
                    style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.28)" }}
                  >
                    <span className="text-[11px] text-red-300" style={{ fontFamily: "var(--font-body)" }}>
                      Delete this transmission? Cannot be undone.
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteId(null)}
                        className="text-[9px] tracking-[1px] uppercase px-3 py-1 rounded-lg transition-colors"
                        style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)", border: "1px solid rgba(124,58,237,0.2)" }}
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-[9px] tracking-[1px] uppercase px-3 py-1 rounded-lg transition-colors"
                        style={{ fontFamily: "var(--font-mono)", background: "rgba(248,113,113,0.14)", border: "1px solid rgba(248,113,113,0.4)", color: "#f87171" }}
                      >
                        DELETE
                      </button>
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
              className="relative overflow-hidden flex items-center gap-2.5 px-7 py-3 rounded-xl text-[10px] tracking-[2.5px] uppercase transition-all active:scale-95 disabled:opacity-50"
              style={{
                fontFamily: "var(--font-mono)",
                border: "1px solid rgba(124,58,237,0.28)",
                color: "rgba(167,139,250,0.65)",
                background: "rgba(8,4,26,0.55)",
                boxShadow: "0 0 30px rgba(124,58,237,0.05)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.5)";
                (e.currentTarget as HTMLElement).style.color = "#a78bfa";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(167,139,250,0.12)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.28)";
                (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.65)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(124,58,237,0.05)";
              }}
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  LOADING
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  LOAD MORE SIGNALS
                </>
              )}
            </button>
          </div>
        )}

        {/* ── End of stream ── */}
        {!cursor && posts.length > 0 && (
          <div className="flex items-center gap-3 pb-4">
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
            <p
              className="text-[8px] tracking-[3px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.25)" }}
            >
              {posts.length} TRANSMISSIONS · END
            </p>
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
          </div>
        )}

      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes sf-orbit   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sf-node    { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
        @keyframes sf-breathe { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.1);opacity:1} }
        @keyframes sf-arc     { 0%,100%{opacity:.35} 50%{opacity:.85} }
        @keyframes pf-rise    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pf-ping    { 0%{transform:scale(1);opacity:.75} 100%{transform:scale(2.4);opacity:0} }
      `}</style>
    </div>
  );
}
