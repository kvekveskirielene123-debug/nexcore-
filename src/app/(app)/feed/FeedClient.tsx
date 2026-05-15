"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

/* ── Constants ───────────────────────────────────────────────────────────── */

const TAGS = ["GENERAL", "ART", "AI", "MUSIC", "PHOTO", "FITNESS", "FOOD", "TRAVEL", "GAMING", "FASHION", "SCIENCE", "MEME", "CREATIVE", "TECH", "VIBE"];

/* ── Types ───────────────────────────────────────────────────────────────── */

export interface FeedPost {
  id:             string;
  user_id:        string;
  content:        string;
  image_url:      string | null;
  nsfw:           boolean;
  tags:           string[];
  created_at:     string;
  username:       string;
  user_avatar_url:string | null;
  likes_count:    number;
  liked_by_me:    boolean;
  comment_count:  number;
}

interface FeedComment {
  id:             string;
  post_id:        string;
  user_id:        string;
  parent_id:      string | null;
  content:        string;
  created_at:     string;
  username:       string;
  user_avatar_url:string | null;
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

/* ── Canvas crop helper ──────────────────────────────────────────────────── */

async function cropToFile(img: HTMLImageElement, crop: PixelCrop): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;
  canvas.width  = Math.round(crop.width  * scaleX);
  canvas.height = Math.round(crop.height * scaleY);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    img,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, canvas.width, canvas.height,
  );
  return new Promise(res =>
    canvas.toBlob(b => res(new File([b!], "crop.jpg", { type: "image/jpeg" })), "image/jpeg", 0.92)
  );
}

/* ── Signal Feed Logo ────────────────────────────────────────────────────── */

function SignalLogo() {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <div className="absolute rounded-full pointer-events-none" style={{ inset: -16, background: "radial-gradient(circle,rgba(0,229,255,0.18) 0%,rgba(167,139,250,0.07) 50%,transparent 70%)", animation: "sf-breathe 3.5s ease-in-out infinite" }} />
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
  const b: React.CSSProperties = { position: "absolute", width: s, height: s };
  return (
    <>
      <div style={{ ...b, top: 0,    left: 0,  borderTop:    `1.5px solid ${color}`, borderLeft:   `1.5px solid ${color}` }} />
      <div style={{ ...b, top: 0,    right: 0, borderTop:    `1.5px solid ${color}`, borderRight:  `1.5px solid ${color}` }} />
      <div style={{ ...b, bottom: 0, left: 0,  borderBottom: `1.5px solid ${color}`, borderLeft:   `1.5px solid ${color}` }} />
      <div style={{ ...b, bottom: 0, right: 0, borderBottom: `1.5px solid ${color}`, borderRight:  `1.5px solid ${color}` }} />
    </>
  );
}

/* ── User Avatar ─────────────────────────────────────────────────────────── */

function UserAvatar({ url, name, size = 36, live = false }: { url: string | null; name: string; size?: number; live?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="rounded-full overflow-hidden flex items-center justify-center w-full h-full"
        style={{
          border: "1.5px solid rgba(0,229,255,0.32)",
          background: url ? "transparent" : "linear-gradient(135deg,rgba(124,58,237,0.42),rgba(0,229,255,0.1))",
          boxShadow: "0 0 18px rgba(0,229,255,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {url
          ? <img src={url} alt={name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
          : <span className="font-black uppercase select-none" style={{ fontFamily: "var(--font-display)", color: "#a78bfa", fontSize: size * 0.38 }}>{name[0] ?? "?"}</span>
        }
      </div>
      {live && <div className="absolute rounded-full" style={{ bottom: -1, right: -1, width: Math.max(10, size * 0.27), height: Math.max(10, size * 0.27), background: "#00e5ff", border: "2px solid #05020d", boxShadow: "0 0 8px rgba(0,229,255,0.9)" }} />}
    </div>
  );
}

/* ── Tag Pill ────────────────────────────────────────────────────────────── */

function TagPill({ tag, active, onClick, small = false }: { tag: string; active?: boolean; onClick?: () => void; small?: boolean }) {
  const [hov, setHov] = useState(false);
  const isActive = active ?? false;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-full transition-all active:scale-95"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: small ? 8 : 9,
        letterSpacing: "1.5px",
        padding: small ? "2px 8px" : "3px 10px",
        background: isActive || hov ? "rgba(0,229,255,0.11)" : "rgba(8,4,26,0.6)",
        border: `1px solid ${isActive ? "rgba(0,229,255,0.5)" : hov ? "rgba(0,229,255,0.3)" : "rgba(124,58,237,0.22)"}`,
        color: isActive ? "#00e5ff" : hov ? "rgba(0,229,255,0.7)" : "rgba(122,106,154,0.55)",
        textShadow: isActive ? "0 0 10px rgba(0,229,255,0.5)" : "none",
        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {tag}
    </button>
  );
}

/* ── Crop Modal ──────────────────────────────────────────────────────────── */

function CropModal({
  src,
  onApply,
  onCancel,
}: {
  src: string;
  onApply: (file: File, preview: string) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const c = centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect ?? width / height, width, height), width, height);
    setCrop(c);
  }, [aspect]);

  useEffect(() => {
    if (!imgRef.current) return;
    const { naturalWidth: width, naturalHeight: height } = imgRef.current;
    if (!width || !height) return;
    const c = centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect ?? width / height, width, height), width, height);
    setCrop(c);
  }, [aspect]);

  const handleApply = async () => {
    if (!completedCrop || !imgRef.current) return;
    const file = await cropToFile(imgRef.current, completedCrop);
    const reader = new FileReader();
    reader.onload = ev => onApply(file, ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const ASPECTS: { label: string; value: number | undefined }[] = [
    { label: "FREE", value: undefined },
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(2,1,8,0.92)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: "rgba(5,2,13,0.97)", border: "1px solid rgba(0,229,255,0.28)", boxShadow: "0 0 80px rgba(0,229,255,0.1), 0 24px 80px rgba(0,0,0,0.8)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: "1px solid rgba(124,58,237,0.14)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 8px rgba(0,229,255,0.9)" }} />
          <span className="text-[9px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)" }}>CROP IMAGE</span>
          <div className="flex-1" />
          <button onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ color: "rgba(90,74,122,0.5)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.5)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Aspect ratio selector */}
        <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
          <span className="text-[9px] tracking-[2px] uppercase mr-1" style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.6)" }}>RATIO</span>
          {ASPECTS.map(a => (
            <button
              key={a.label}
              onClick={() => setAspect(a.value)}
              className="px-3 py-1 rounded-lg text-[9px] tracking-[1.5px] uppercase transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: aspect === a.value ? "rgba(0,229,255,0.1)" : "rgba(8,4,26,0.5)",
                border: `1px solid ${aspect === a.value ? "rgba(0,229,255,0.45)" : "rgba(124,58,237,0.2)"}`,
                color: aspect === a.value ? "#00e5ff" : "rgba(122,106,154,0.5)",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Crop area */}
        <div className="flex items-center justify-center px-4 py-4" style={{ maxHeight: "55vh", overflow: "hidden" }}>
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={c => setCompletedCrop(c)}
            aspect={aspect}
            style={{ maxHeight: "50vh" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop"
              onLoad={onImageLoad}
              style={{ maxHeight: "50vh", maxWidth: "100%", display: "block" }}
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4" style={{ borderTop: "1px solid rgba(124,58,237,0.12)" }}>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-[10px] tracking-[2px] uppercase transition-all"
            style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(122,106,154,0.6)", background: "transparent" }}
          >
            CANCEL
          </button>
          <button
            onClick={handleApply}
            disabled={!completedCrop}
            className="px-6 py-2.5 rounded-xl font-bold text-[10px] tracking-[3px] uppercase transition-all active:scale-95 disabled:opacity-40"
            style={{
              fontFamily: "var(--font-mono)",
              background: "linear-gradient(135deg,#00e5ff,#0077ff)",
              color: "#05020d",
              boxShadow: completedCrop ? "0 0 28px rgba(0,229,255,0.4)" : "none",
            }}
          >
            APPLY CROP
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Quota badge ─────────────────────────────────────────────────────────── */

interface Quota { used: number; remaining: number; limit: number; isBrilliant: boolean }

/* ── Composer ─────────────────────────────────────────────────────────────── */

function Composer({ currentUser, onPost, quota, onQuotaUpdate }: {
  currentUser:   CurrentUser;
  onPost:        (post: FeedPost) => void;
  quota:         Quota | null;
  onQuotaUpdate: (q: Quota) => void;
}) {
  const [text,         setText]         = useState("");
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropSrc,      setCropSrc]      = useState<string | null>(null);
  const [rawFile,      setRawFile]      = useState<File | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [focused,      setFocused]      = useState(false);
  const [nsfw,         setNsfw]         = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTags,     setShowTags]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("Image must be under 10 MB"); return; }
    setRawFile(f);
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCropApply = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setCropSrc(null);
    setRawFile(null);
  };

  const handleCropCancel = () => {
    if (!rawFile) { setCropSrc(null); return; }
    // User skipped crop — use original
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(rawFile);
    setImageFile(rawFile);
    setCropSrc(null);
    setRawFile(null);
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

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
        body: JSON.stringify({ content: text.trim() || " ", image_url, nsfw, tags: selectedTags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to post");
      onPost(data.post as FeedPost);
      if (typeof data.remaining === "number") {
        onQuotaUpdate({ used: data.limit - data.remaining, remaining: data.remaining, limit: data.limit, isBrilliant: data.isBrilliant });
      }
      setText(""); setImageFile(null); setImagePreview(null); setNsfw(false); setSelectedTags([]); setShowTags(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setUploading(false);
    }
  };

  const quotaExhausted = quota !== null && quota.remaining === 0;
  const canPost = (text.trim().length > 0 || !!imageFile) && !uploading && !quotaExhausted;
  const ringR = 13, ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - text.length / 500);
  const ringColor = text.length > 450 ? "#fbbf24" : text.length > 350 ? "rgba(0,229,255,0.9)" : "rgba(0,229,255,0.45)";

  return (
    <>
      {cropSrc && <CropModal src={cropSrc} onApply={handleCropApply} onCancel={handleCropCancel} />}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(5,2,13,0.92)",
          border: `1px solid ${focused ? "rgba(0,229,255,0.4)" : "rgba(124,58,237,0.22)"}`,
          boxShadow: focused
            ? "0 0 0 1px rgba(0,229,255,0.07),0 0 48px rgba(0,229,255,0.09),0 8px 48px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.025)"
            : "0 4px 36px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.018)",
          transition: "border-color 0.3s,box-shadow 0.3s",
        }}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: focused ? "linear-gradient(90deg,transparent,rgba(0,229,255,0.7),transparent)" : "linear-gradient(90deg,transparent,rgba(0,229,255,0.35),transparent)", transition: "background 0.3s" }} />

        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-2.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 10px rgba(0,229,255,1)", animation: "sf-node 2s ease-in-out infinite" }} />
          <span className="text-[9px] tracking-[3.5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: focused ? "rgba(0,229,255,0.9)" : "rgba(0,229,255,0.6)", transition: "color 0.3s" }}>
            NEW TRANSMISSION
          </span>
        </div>
        <div className="mx-5 mb-3 h-px" style={{ background: "linear-gradient(90deg,rgba(0,229,255,0.2),rgba(124,58,237,0.1),transparent)" }} />

        {/* Quota bar */}
        {quota !== null && (
          <div className="flex items-center justify-between px-5 pb-3">
            <div className="flex items-center gap-2">
              {/* Mini signal bars */}
              <div className="flex items-end gap-0.5" style={{ height: 12 }}>
                {[0.4, 0.6, 0.8, 1].map((h, i) => {
                  const filled = i < Math.ceil((quota.remaining / quota.limit) * 4);
                  return (
                    <div key={i} className="w-1 rounded-sm transition-all" style={{
                      height: `${h * 12}px`,
                      background: filled
                        ? quota.remaining <= 1 ? "#f87171"
                          : quota.remaining <= 2 ? "#fbbf24"
                          : "#00e5ff"
                        : "rgba(124,58,237,0.18)",
                      boxShadow: filled ? quota.remaining <= 1 ? "0 0 6px rgba(248,113,113,0.6)" : quota.remaining <= 2 ? "0 0 6px rgba(251,191,36,0.5)" : "0 0 6px rgba(0,229,255,0.5)" : "none",
                    }} />
                  );
                })}
              </div>
              <span className="text-[9px] tabular-nums" style={{
                fontFamily: "var(--font-mono)",
                color: quota.remaining === 0 ? "#f87171"
                  : quota.remaining <= 2 ? "#fbbf24"
                  : "rgba(0,229,255,0.55)",
                letterSpacing: "1px",
              }}>
                {quota.remaining}/{quota.limit} TRANSMISSIONS TODAY
              </span>
            </div>
            {!quota.isBrilliant && quota.remaining <= 2 && (
              <a href="/subscribe" className="text-[8px] tracking-[1.5px] uppercase px-2 py-0.5 rounded-full transition-all"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.7)", border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.06)" }}
              >
                ◈ GET 25/DAY
              </a>
            )}
          </div>
        )}

        {/* Quota exhausted banner */}
        {quotaExhausted && (
          <div className="mx-5 mb-3 px-4 py-3 rounded-xl flex items-center justify-between gap-3"
            style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.28)" }}
          >
            <div>
              <p className="text-[11px] font-semibold text-red-300 mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
                TRANSMISSION LIMIT REACHED
              </p>
              <p className="text-[10px]" style={{ fontFamily: "var(--font-body)", color: "rgba(248,113,113,0.6)" }}>
                {quota?.isBrilliant ? "25/day limit. Resets in 24 hours." : "Free limit is 5/day. Resets in 24h."}
              </p>
            </div>
            {!quota?.isBrilliant && (
              <a href="/subscribe" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] tracking-[2px] uppercase transition-all"
                style={{ fontFamily: "var(--font-mono)", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa" }}
              >
                UPGRADE
              </a>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-5 pb-3">
          <div className="flex gap-3.5">
            <UserAvatar url={currentUser.avatar_url} name={currentUser.username} size={40} live />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold mb-1.5 tracking-wide" style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.55)" }}>
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

        {/* Selected tags preview */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {selectedTags.map(t => (
              <TagPill key={t} tag={t} active onClick={() => toggleTag(t)} small />
            ))}
          </div>
        )}

        {/* Tag picker panel */}
        {showTags && (
          <div className="px-5 pb-3">
            <div className="p-3 rounded-xl" style={{ background: "rgba(8,4,26,0.7)", border: "1px solid rgba(124,58,237,0.18)" }}>
              <p className="text-[8px] tracking-[2px] uppercase mb-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.6)" }}>SELECT TAGS · MAX 5</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(tag => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    active={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                    small
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image preview */}
        {imagePreview && (
          <div className="relative" style={{ borderTop: "1px solid rgba(124,58,237,0.14)", borderBottom: "1px solid rgba(124,58,237,0.14)" }}>
            <div style={{ overflow: "hidden", maxHeight: 300 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full object-cover" style={{ display: "block" }} />
            </div>
            <div className="absolute inset-0 pointer-events-none"><CornerBrackets color="rgba(0,229,255,0.55)" size={14} /></div>
            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
              <button
                onClick={() => { setRawFile(imageFile); const reader = new FileReader(); reader.onload = ev => setCropSrc(ev.target?.result as string); if (imageFile) reader.readAsDataURL(imageFile); }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(5,2,13,0.88)", border: "1px solid rgba(0,229,255,0.35)", color: "#00e5ff" }}
                title="Recrop"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              </button>
              <button
                onClick={removeImage}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(5,2,13,0.88)", border: "1px solid rgba(248,113,113,0.45)", color: "#f87171" }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {nsfw && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[8px] tracking-[1.5px] uppercase" style={{ fontFamily: "var(--font-mono)", background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }}>
                NSFW
              </div>
            )}
          </div>
        )}

        {/* Footer toolbar */}
        <div className="flex items-center flex-wrap gap-2 px-5 py-4" style={{ borderTop: imagePreview ? "none" : "1px solid rgba(124,58,237,0.09)" }}>
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {/* Attach */}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="sr-only" />
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
              onMouseEnter={e => { if (!imagePreview) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.7)"; } }}
              onMouseLeave={e => { if (!imagePreview) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.18)"; (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.5)"; } }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              ATTACH
            </button>

            {/* Tags toggle */}
            <button
              onClick={() => setShowTags(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] tracking-[1.5px] uppercase transition-all active:scale-95"
              style={{
                fontFamily: "var(--font-mono)",
                background: showTags || selectedTags.length > 0 ? "rgba(167,139,250,0.1)" : "rgba(8,4,26,0.6)",
                border: `1px solid ${showTags || selectedTags.length > 0 ? "rgba(167,139,250,0.42)" : "rgba(124,58,237,0.18)"}`,
                color: showTags || selectedTags.length > 0 ? "#a78bfa" : "rgba(122,106,154,0.5)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              TAGS{selectedTags.length > 0 ? ` · ${selectedTags.length}` : ""}
            </button>

            {/* NSFW toggle */}
            <button
              onClick={() => setNsfw(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] tracking-[1.5px] uppercase transition-all active:scale-95"
              style={{
                fontFamily: "var(--font-mono)",
                background: nsfw ? "rgba(251,191,36,0.1)" : "rgba(8,4,26,0.6)",
                border: `1px solid ${nsfw ? "rgba(251,191,36,0.45)" : "rgba(124,58,237,0.18)"}`,
                color: nsfw ? "#fbbf24" : "rgba(122,106,154,0.5)",
                boxShadow: nsfw ? "0 0 14px rgba(251,191,36,0.15)" : "none",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              NSFW
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {text.length > 0 && (
              <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32 }}>
                <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="16" cy="16" r={ringR} fill="none" stroke="rgba(124,58,237,0.14)" strokeWidth="2.2" />
                  <circle cx="16" cy="16" r={ringR} fill="none" stroke={ringColor} strokeWidth="2.2" strokeDasharray={ringCirc} strokeDashoffset={ringOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.15s,stroke 0.15s" }} />
                </svg>
                <span className="absolute text-[7px] tabular-nums" style={{ fontFamily: "var(--font-mono)", color: text.length > 450 ? "#fbbf24" : "rgba(0,229,255,0.45)" }}>{500 - text.length}</span>
              </div>
            )}
            <button
              onClick={handlePost}
              disabled={!canPost}
              className="relative overflow-hidden flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-[10px] tracking-[3px] uppercase active:scale-95 disabled:opacity-30"
              style={{
                fontFamily: "var(--font-mono)",
                background: canPost
                  ? "linear-gradient(135deg,rgba(0,229,255,1) 0%,rgba(0,119,255,1) 100%)"
                  : "rgba(8,4,26,0.6)",
                color: canPost ? "#05020d" : "rgba(122,106,154,0.4)",
                border: canPost ? "none" : "1px solid rgba(124,58,237,0.18)",
                boxShadow: canPost ? "0 0 28px rgba(0,229,255,0.6),0 0 60px rgba(0,229,255,0.25),0 4px 20px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.28)" : "none",
                animation: canPost && !uploading ? "bc-pulse 2.4s ease-in-out infinite" : "none",
                transition: "background 0.3s, box-shadow 0.3s, color 0.3s",
              }}
            >
              {/* Sweep shimmer */}
              {canPost && !uploading && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.28) 50%,transparent 65%)", animation: "bc-sweep 2.2s ease-in-out infinite", zIndex: 0 }} />
              )}
              {/* Signal bars */}
              {canPost && !uploading && (
                <div className="relative z-10 flex items-end gap-[2px] flex-shrink-0" style={{ height: 11 }}>
                  {[0.45, 0.75, 1, 0.6].map((h, i) => (
                    <div key={i} className="w-[2.5px] rounded-sm" style={{ height: `${h * 11}px`, background: "rgba(5,2,13,0.8)", animation: `bc-bar ${0.55 + i * 0.12}s ease-in-out ${i * 0.08}s infinite alternate` }} />
                  ))}
                </div>
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {uploading
                  ? <><svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>SENDING…</>
                  : <>BROADCAST <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                }
              </span>
            </button>
          </div>
        </div>

        {error && <p className="px-5 pb-3.5 -mt-2 text-[11px] flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)", color: "#f87171" }}><span>◈</span> {error}</p>}
      </div>
    </>
  );
}

/* ── Comment Item ────────────────────────────────────────────────────────── */

function CommentItem({
  comment,
  replies,
  currentUserId,
  postId,
  onReply,
  onDelete,
}: {
  comment:       FeedComment;
  replies:       FeedComment[];
  currentUserId: string;
  postId:        string;
  onReply:       (parentId: string, parentUsername: string) => void;
  onDelete:      (commentId: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const isOwn = comment.user_id === currentUserId;

  return (
    <div className="flex gap-2.5">
      <UserAvatar url={comment.user_avatar_url} name={comment.username} size={30} />
      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 inline-block max-w-full"
          style={{ background: "rgba(8,4,26,0.7)", border: "1px solid rgba(124,58,237,0.18)" }}
        >
          <span className="text-[11px] font-bold" style={{ fontFamily: "var(--font-display)", color: "rgba(0,229,255,0.7)" }}>
            {comment.username}
          </span>
          <p className="text-[13px] mt-0.5 text-[#d4cae8] leading-relaxed" style={{ fontFamily: "var(--font-body)", wordBreak: "break-word" }}>
            {comment.content}
          </p>
        </div>
        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-[9px] uppercase tracking-[1px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(58,42,90,0.7)" }}>
            {timeAgo(comment.created_at)}
          </span>
          <button
            onClick={() => onReply(comment.id, comment.username)}
            className="text-[9px] uppercase tracking-[1px] transition-colors"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.5)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.65)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.5)"; }}
          >
            REPLY
          </button>
          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-[9px] uppercase tracking-[1px] transition-colors"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.35)"; }}
            >
              DELETE
            </button>
          )}
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(v => !v)}
              className="text-[9px] uppercase tracking-[1px] transition-colors"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.5)" }}
            >
              {showReplies ? `▲ HIDE` : `▼ ${replies.length} ${replies.length === 1 ? "REPLY" : "REPLIES"}`}
            </button>
          )}
        </div>

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 pl-2 space-y-2.5" style={{ borderLeft: "1.5px solid rgba(124,58,237,0.2)" }}>
            {replies.map(r => (
              <div key={r.id} className="flex gap-2">
                <UserAvatar url={r.user_avatar_url} name={r.username} size={24} />
                <div className="flex-1 min-w-0">
                  <div className="rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full"
                    style={{ background: "rgba(8,4,26,0.6)", border: "1px solid rgba(124,58,237,0.14)" }}
                  >
                    <span className="text-[10px] font-bold" style={{ fontFamily: "var(--font-display)", color: "rgba(167,139,250,0.7)" }}>{r.username}</span>
                    <p className="text-[12px] mt-0.5 text-[#d4cae8] leading-relaxed" style={{ fontFamily: "var(--font-body)", wordBreak: "break-word" }}>{r.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 ml-1">
                    <span className="text-[9px] uppercase tracking-[1px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(58,42,90,0.7)" }}>{timeAgo(r.created_at)}</span>
                    {r.user_id === currentUserId && (
                      <button onClick={() => onDelete(r.id)} className="text-[9px] uppercase tracking-[1px] transition-colors" style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.35)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.35)"; }}
                      >DELETE</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Comment Section ─────────────────────────────────────────────────────── */

function CommentSection({
  postId,
  currentUser,
  initialCount,
  onCountChange,
}: {
  postId:          string;
  currentUser:     CurrentUser;
  initialCount:    number;
  onCountChange:   (n: number) => void;
}) {
  const [comments,  setComments]  = useState<FeedComment[] | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [newText,   setNewText]   = useState("");
  const [replyTo,   setReplyTo]   = useState<{ id: string; username: string } | null>(null);
  const [posting,   setPosting]   = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/feed/${postId}/comments`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setComments(d.comments ?? []); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [postId]);

  const handleSubmit = async () => {
    const content = newText.trim();
    if (!content) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parent_id: replyTo?.id ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments(prev => [...(prev ?? []), data.comment as FeedComment]);
      onCountChange(initialCount + 1);
      setNewText("");
      setReplyTo(null);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    await fetch(`/api/feed/${postId}/comments?commentId=${commentId}`, { method: "DELETE" });
    setComments(prev => (prev ?? []).filter(c => c.id !== commentId));
    onCountChange(Math.max(0, initialCount - 1));
  };

  const handleReply = (parentId: string, username: string) => {
    setReplyTo({ id: parentId, username });
    setNewText(`@${username} `);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const topLevel = (comments ?? []).filter(c => !c.parent_id);
  const repliesOf = (id: string) => (comments ?? []).filter(c => c.parent_id === id);

  return (
    <div className="px-4 pb-4 pt-2" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
      {loading ? (
        <div className="flex items-center gap-2 py-3">
          <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(122,106,154,0.5)" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.4)" }}>Loading…</span>
        </div>
      ) : (
        <>
          {/* Comment list */}
          {topLevel.length > 0 && (
            <div className="space-y-3 mb-3">
              {topLevel.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  replies={repliesOf(c.id)}
                  currentUserId={currentUser.id}
                  postId={postId}
                  onReply={handleReply}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Reply context banner */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)" }}>
          <span className="text-[9px] tracking-[1px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.6)" }}>REPLYING TO @{replyTo.username}</span>
          <button onClick={() => { setReplyTo(null); setNewText(""); }} className="ml-auto text-[9px]" style={{ color: "rgba(90,74,122,0.5)" }}>✕</button>
        </div>
      )}

      {/* New comment input */}
      <div className="flex gap-2.5 items-end">
        <UserAvatar url={currentUser.avatar_url} name={currentUser.username} size={30} />
        <div className="flex-1 min-w-0 flex gap-2 items-end rounded-2xl px-3.5 py-2" style={{ background: "rgba(8,4,26,0.7)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <textarea
            ref={inputRef}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Write a comment…"
            rows={1}
            maxLength={500}
            className="flex-1 bg-transparent text-[13px] text-[#d4cae8] placeholder-[#2a1a3e] focus:outline-none resize-none"
            style={{ fontFamily: "var(--font-body)", lineHeight: 1.6 }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newText.trim() || posting}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#00e5ff,#0077ff)", color: "#05020d", boxShadow: newText.trim() ? "0 0 14px rgba(0,229,255,0.4)" : "none" }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Post Card ────────────────────────────────────────────────────────────── */

function PostCard({
  post,
  currentUser,
  viewerShowsNsfw,
  onLike,
  onDelete,
  onCommentCountChange,
}: {
  post:                  FeedPost;
  currentUser:           CurrentUser;
  viewerShowsNsfw:       boolean;
  onLike:                (id: string) => void;
  onDelete:              (id: string) => void;
  onCommentCountChange:  (id: string, n: number) => void;
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [hovered,     setHovered]     = useState(false);
  const [justLiked,   setJustLiked]   = useState(false);
  const [showComments,setShowComments]= useState(false);
  const [nsfwRevealed,setNsfwRevealed]= useState(false);
  const [commentCount,setCommentCount]= useState(post.comment_count);
  const currentUserId = currentUser.id;
  const isOwn     = post.user_id === currentUserId;
  const isNsfwBlur= post.nsfw && !viewerShowsNsfw && !nsfwRevealed;

  const handleLike = () => {
    if (!post.liked_by_me) { setJustLiked(true); setTimeout(() => setJustLiked(false), 700); }
    onLike(post.id);
  };

  return (
    <div style={{ animation: "pf-rise 0.45s cubic-bezier(0.16,1,0.3,1) both" }}>
      <article
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: post.liked_by_me ? "rgba(5,3,16,0.94)" : "rgba(5,2,13,0.9)",
          border: `1px solid ${post.liked_by_me ? "rgba(0,229,255,0.24)" : hovered ? "rgba(124,58,237,0.4)" : "rgba(124,58,237,0.18)"}`,
          boxShadow: hovered
            ? "0 10px 56px rgba(0,0,0,0.6),0 0 64px rgba(124,58,237,0.07)"
            : post.liked_by_me
              ? "0 4px 32px rgba(0,0,0,0.5),0 0 40px rgba(0,229,255,0.05)"
              : "0 2px 24px rgba(0,0,0,0.45)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none" style={{ background: post.liked_by_me ? "linear-gradient(180deg,transparent 5%,rgba(0,229,255,0.85) 50%,transparent 95%)" : "linear-gradient(180deg,transparent 5%,rgba(124,58,237,0.22) 50%,transparent 95%)", transition: "background 0.3s" }} />
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: post.liked_by_me ? "linear-gradient(90deg,transparent,rgba(0,229,255,0.55),transparent)" : "linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)", transition: "background 0.3s" }} />

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2.5 pl-5">
          <UserAvatar url={post.user_avatar_url} name={post.username} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-black text-white leading-none tracking-wide truncate" style={{ fontFamily: "var(--font-display)" }}>{post.username}</p>
              {post.nsfw && (
                <span className="px-1.5 py-0.5 rounded text-[7px] tracking-[1.5px] uppercase flex-shrink-0" style={{ fontFamily: "var(--font-mono)", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}>NSFW</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1 h-1 rounded-full" style={{ background: "rgba(0,229,255,0.5)", boxShadow: "0 0 4px rgba(0,229,255,0.5)" }} />
              <p className="text-[9px] tracking-[1.5px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(90,74,122,0.65)" }}>{timeAgo(post.created_at)}</p>
            </div>
          </div>
          {isOwn && (
            <button onClick={() => onDelete(post.id)} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ color: "rgba(90,74,122,0.38)", background: "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(90,74,122,0.38)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        <div className="mx-5 mb-3 h-px" style={{ background: "linear-gradient(90deg,rgba(124,58,237,0.14),transparent)" }} />

        {/* Content */}
        {post.content.trim() && (
          <div className="px-5 pb-3">
            <p className="text-[14px] text-[#ddd4f5]" style={{ fontFamily: "var(--font-body)", lineHeight: 1.78, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {post.content}
            </p>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {post.tags.map(tag => (
              <TagPill key={tag} tag={tag} small />
            ))}
          </div>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="relative mt-1" style={{ borderTop: "1px solid rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
            <button className="block w-full relative" onClick={() => !isNsfwBlur && setExpanded(v => !v)} style={{ cursor: isNsfwBlur ? "default" : "zoom-in" }}>
              <div style={{ overflow: "hidden", maxHeight: expanded ? "none" : 360 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt="Post image" className="w-full object-cover" style={{ display: "block", filter: isNsfwBlur ? "blur(24px) saturate(0.4)" : "none", transform: isNsfwBlur ? "scale(1.04)" : "none", transition: "filter 0.3s,transform 0.3s" }} />
              </div>
            </button>
            {/* NSFW reveal overlay */}
            {isNsfwBlur && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer" onClick={() => setNsfwRevealed(true)}
                style={{ background: "rgba(5,2,13,0.4)" }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.45)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </div>
                <div className="text-center px-4">
                  <p className="text-[11px] font-semibold text-[#fbbf24] mb-0.5" style={{ fontFamily: "var(--font-display)" }}>NSFW Content</p>
                  <p className="text-[10px]" style={{ fontFamily: "var(--font-body)", color: "rgba(251,191,36,0.65)" }}>Tap to reveal</p>
                </div>
              </div>
            )}
            {!isNsfwBlur && (
              <div className="absolute inset-0 pointer-events-none">
                <CornerBrackets color={post.liked_by_me ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.35)"} size={14} />
                {!expanded && (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded pointer-events-none" style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "1.5px", background: "rgba(5,2,13,0.75)", border: "1px solid rgba(0,229,255,0.18)", color: "rgba(0,229,255,0.45)" }}>
                    EXPAND ↓
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 px-5 py-3 mt-1" style={{ borderTop: "1px solid rgba(124,58,237,0.07)" }}>
          {/* Resonate */}
          <button
            onClick={handleLike}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-[10px] tracking-[2px] uppercase active:scale-95 flex-1 justify-center"
            style={{
              fontFamily: "var(--font-mono)",
              background: post.liked_by_me ? "rgba(0,229,255,0.1)" : "rgba(8,4,26,0.45)",
              border: `1px solid ${post.liked_by_me ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.18)"}`,
              color: post.liked_by_me ? "#00e5ff" : "rgba(122,106,154,0.5)",
              boxShadow: post.liked_by_me ? "0 0 22px rgba(0,229,255,0.2),inset 0 1px 0 rgba(0,229,255,0.08)" : "none",
              textShadow: post.liked_by_me ? "0 0 14px rgba(0,229,255,0.65)" : "none",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
              maxWidth: "none",
            }}
            onMouseEnter={e => { if (!post.liked_by_me) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.3)"; (e.currentTarget as HTMLElement).style.color = "rgba(0,229,255,0.65)"; } }}
            onMouseLeave={e => { if (!post.liked_by_me) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.18)"; (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.5)"; } }}
          >
            {justLiked && <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: "2px solid rgba(0,229,255,0.75)", animation: "pf-ping 0.65s ease-out forwards" }} />}
            <svg width="11" height="11" viewBox="0 0 24 24" fill={post.liked_by_me ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: post.liked_by_me ? "drop-shadow(0 0 6px rgba(0,229,255,0.95))" : "none", transition: "filter 0.25s" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.liked_by_me ? "◈ RESONATING" : "RESONATE"}
            {post.likes_count > 0 && <span className="opacity-60 ml-0.5">{post.likes_count}</span>}
          </button>

          {/* Divider */}
          <div className="w-px h-6 mx-1" style={{ background: "rgba(124,58,237,0.18)" }} />

          {/* Comment */}
          <button
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] tracking-[2px] uppercase active:scale-95 flex-1 justify-center transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              background: showComments ? "rgba(167,139,250,0.1)" : "rgba(8,4,26,0.45)",
              border: `1px solid ${showComments ? "rgba(167,139,250,0.45)" : "rgba(124,58,237,0.18)"}`,
              color: showComments ? "#a78bfa" : "rgba(122,106,154,0.5)",
            }}
            onMouseEnter={e => { if (!showComments) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.65)"; } }}
            onMouseLeave={e => { if (!showComments) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.18)"; (e.currentTarget as HTMLElement).style.color = "rgba(122,106,154,0.5)"; } }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            COMMENT
            {commentCount > 0 && <span className="opacity-60 ml-0.5">{commentCount}</span>}
          </button>
        </div>

        {/* Comment section */}
        {showComments && (
          <CommentSection
            postId={post.id}
            currentUser={currentUser}
            initialCount={commentCount}
            onCountChange={n => { setCommentCount(n); onCommentCountChange(post.id, n); }}
          />
        )}
      </article>
    </div>
  );
}

/* ── Main Feed Client ─────────────────────────────────────────────────────── */

export function FeedClient({
  initialPosts,
  nextCursor: initialCursor,
  currentUser,
  viewerShowsNsfw,
}: {
  initialPosts:    FeedPost[];
  nextCursor:      string | null;
  currentUser:     CurrentUser;
  viewerShowsNsfw: boolean;
}) {
  const [posts,       setPosts]       = useState<FeedPost[]>(initialPosts);
  const [cursor,      setCursor]      = useState<string | null>(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTags,  setFilterTags]  = useState<string[]>([]);
  const [searchFocus, setSearchFocus] = useState(false);
  const [quota,       setQuota]       = useState<Quota | null>(null);
  const [cycling,     setCycling]     = useState(false);

  const CYCLE_KEY = "nx_feed_last_refresh";
  const CYCLE_MS  = 24 * 60 * 60 * 1000;

  useEffect(() => {
    fetch("/api/feed/quota")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && typeof d.remaining === "number") setQuota(d as Quota); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const last = Number(localStorage.getItem(CYCLE_KEY) ?? 0);
    const now  = Date.now();
    if (now - last >= CYCLE_MS) {
      setCycling(true);
      fetch("/api/feed")
        .then(r => r.json())
        .then(d => {
          setPosts(d.posts as FeedPost[]);
          setCursor(d.nextCursor ?? null);
          localStorage.setItem(CYCLE_KEY, String(Date.now()));
        })
        .catch(() => {})
        .finally(() => {
          setTimeout(() => setCycling(false), 1800);
        });
    } else {
      localStorage.setItem(CYCLE_KEY, String(last || now));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePost = (newPost: FeedPost) => setPosts(prev => [newPost, ...prev]);
  const handleQuotaUpdate = (q: Quota) => setQuota(q);

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1 }));
    try { await fetch(`/api/feed/${postId}/like`, { method: "POST" }); }
    catch { setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1 })); }
  };

  const handleDelete = async (postId: string) => {
    if (deleteId === postId) { setPosts(prev => prev.filter(p => p.id !== postId)); setDeleteId(null); await fetch(`/api/feed/${postId}`, { method: "DELETE" }); }
    else { setDeleteId(postId); setTimeout(() => setDeleteId(null), 4000); }
  };

  const handleCommentCountChange = (postId: string, n: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: n } : p));
  };

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const tagParam = filterTags.length > 0 ? `&tags=${filterTags.join(",")}` : "";
      const res = await fetch(`/api/feed?cursor=${encodeURIComponent(cursor)}${tagParam}`);
      const data = await res.json();
      setPosts(prev => [...prev, ...(data.posts as FeedPost[])]);
      setCursor(data.nextCursor ?? null);
    } finally { setLoadingMore(false); }
  };

  const toggleFilterTag = (tag: string) =>
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const filteredPosts = posts.filter(post => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      post.content.toLowerCase().includes(q) ||
      post.username.toLowerCase().includes(q) ||
      post.tags.some(t => t.toLowerCase().includes(q));
    const matchesTags = filterTags.length === 0 || filterTags.some(t => post.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-6">
      {/* 24-h cycle refresh overlay */}
      {cycling && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 pointer-events-none"
          style={{ background: "rgba(5,2,13,0.88)", backdropFilter: "blur(8px)", animation: "pf-cycle-fade 1.8s ease forwards" }}
        >
          {/* Ripple rings */}
          <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
            {[0, 0.45, 0.9].map((delay, i) => (
              <div key={i} className="absolute rounded-full"
                style={{
                  inset: 0,
                  border: "1.5px solid rgba(0,229,255,0.55)",
                  animation: `pf-cycle-ring 1.5s ease-out ${delay}s infinite`,
                  opacity: 0,
                }}
              />
            ))}
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,229,255,0.1)", border: "1.5px solid rgba(0,229,255,0.5)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-[11px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.85)" }}>
              NETWORK CYCLE
            </p>
            <p className="text-[9px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.35)" }}>
              24H PROTOCOL · REFRESHING SIGNAL FEED
            </p>
          </div>
        </div>
      )}

      {/* Ambient glow */}
      <div className="pointer-events-none fixed" aria-hidden="true" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse 70% 50% at 50% 0%,rgba(0,229,255,0.04) 0%,transparent 70%)", zIndex: 0 }} />

      <div className="relative space-y-5" style={{ zIndex: 1 }}>

        {/* Page header */}
        <div className="flex flex-col items-center text-center pb-1">
          <SignalLogo />
          <div className="mt-3 flex items-center gap-2.5">
            <div className="h-px w-14" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,0.4))" }} />
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", animation: "sf-node 2s ease-in-out infinite" }} />
              <span className="text-[8px] tracking-[4px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,0.4)" }}>NEOLUTION PROTOCOL</span>
            </div>
            <div className="h-px w-14" style={{ background: "linear-gradient(to left,transparent,rgba(0,212,255,0.4))" }} />
          </div>

          {/* Animated SIGNAL FEED title */}
          <div className="relative mt-2.5 mb-0.5">
            <h1 className="text-[28px] md:text-[32px] font-bold tracking-[8px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "#fff", textShadow: "0 0 40px rgba(0,229,255,0.55),0 0 80px rgba(0,229,255,0.2)", letterSpacing: "0.22em" }}>
              {"SIGNAL FEED".split("").map((ch, i) => (
                <span key={i} style={{
                  display: ch === " " ? "inline-block" : "inline",
                  width: ch === " " ? "0.28em" : "auto",
                  animation: `sf-letter-in 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.055}s both`,
                }}>
                  {ch !== " " ? ch : null}
                </span>
              ))}
            </h1>
            {/* Scan line under title */}
            <div className="absolute -bottom-1 left-0 right-0 h-px overflow-hidden rounded-full" style={{ background: "rgba(0,229,255,0.12)" }}>
              <div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.9),transparent)", animation: "sf-title-scan 2.8s ease-in-out infinite" }} />
            </div>
          </div>

          <p className="text-[10px] mt-2.5" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,212,255,0.35)", letterSpacing: "3px" }}>
            LIVE TRANSMISSIONS FROM THE NETWORK
          </p>
        </div>

        {/* Composer */}
        <Composer currentUser={currentUser} onPost={handlePost} quota={quota} onQuotaUpdate={handleQuotaUpdate} />

        {/* Search + tag filter */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={searchFocus ? "rgba(0,229,255,0.5)" : "rgba(90,74,122,0.5)"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.2s" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search transmissions, users, tags…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent text-[13px] text-[#e2d9f3] placeholder-[#2a1a3e] focus:outline-none"
              style={{
                fontFamily: "var(--font-body)",
                border: `1px solid ${searchFocus ? "rgba(0,229,255,0.3)" : "rgba(124,58,237,0.18)"}`,
                background: "rgba(5,2,13,0.75)",
                boxShadow: searchFocus ? "0 0 24px rgba(0,229,255,0.06)" : "none",
                transition: "border-color 0.25s,box-shadow 0.25s",
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center px-1" style={{ color: "rgba(90,74,122,0.5)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {/* Tag filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setFilterTags([])}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[9px] tracking-[1.5px] uppercase transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: filterTags.length === 0 ? "rgba(167,139,250,0.15)" : "rgba(8,4,26,0.5)",
                border: `1px solid ${filterTags.length === 0 ? "rgba(167,139,250,0.45)" : "rgba(124,58,237,0.18)"}`,
                color: filterTags.length === 0 ? "#a78bfa" : "rgba(122,106,154,0.5)",
              }}
            >
              ALL
            </button>
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleFilterTag(tag)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-[9px] tracking-[1.5px] uppercase transition-all"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: filterTags.includes(tag) ? "rgba(0,229,255,0.11)" : "rgba(8,4,26,0.5)",
                  border: `1px solid ${filterTags.includes(tag) ? "rgba(0,229,255,0.45)" : "rgba(124,58,237,0.18)"}`,
                  color: filterTags.includes(tag) ? "#00e5ff" : "rgba(122,106,154,0.45)",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stream divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.14)" }} />
          <div className="flex items-center gap-1.5 px-1">
            <div className="w-1 h-1 rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 5px rgba(167,139,250,0.7)" }} />
            <span className="text-[8px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(167,139,250,0.4)" }}>
              {filteredPosts.length} {filteredPosts.length === 1 ? "TRANSMISSION" : "TRANSMISSIONS"}
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.14)" }} />
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl text-center py-20 px-8" style={{ background: "rgba(5,2,13,0.75)", border: "1px dashed rgba(124,58,237,0.18)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.14)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.38)" strokeWidth="1.4" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p className="text-[15px] font-semibold text-[#e2d9f3] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {searchQuery || filterTags.length > 0 ? "No matching transmissions" : "No transmissions yet"}
            </p>
            <p className="text-[12px]" style={{ fontFamily: "var(--font-body)", color: "rgba(90,74,122,0.6)" }}>
              {searchQuery || filterTags.length > 0 ? "Try a different search or tag filter." : "Be the first to broadcast to the network."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div key={post.id}>
                {deleteId === post.id && (
                  <div className="mb-2 px-4 py-2.5 rounded-xl flex items-center justify-between" style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.28)" }}>
                    <span className="text-[11px] text-red-300" style={{ fontFamily: "var(--font-body)" }}>Delete this transmission? Cannot be undone.</span>
                    <div className="flex gap-2">
                      <button onClick={() => setDeleteId(null)} className="text-[9px] tracking-[1px] uppercase px-3 py-1 rounded-lg" style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)", border: "1px solid rgba(124,58,237,0.2)" }}>CANCEL</button>
                      <button onClick={() => handleDelete(post.id)} className="text-[9px] tracking-[1px] uppercase px-3 py-1 rounded-lg" style={{ fontFamily: "var(--font-mono)", background: "rgba(248,113,113,0.14)", border: "1px solid rgba(248,113,113,0.4)", color: "#f87171" }}>DELETE</button>
                    </div>
                  </div>
                )}
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  viewerShowsNsfw={viewerShowsNsfw}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onCommentCountChange={handleCommentCountChange}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {cursor && !searchQuery && filterTags.length === 0 && (
          <div className="flex justify-center pt-2 pb-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl text-[10px] tracking-[2.5px] uppercase transition-all active:scale-95 disabled:opacity-50"
              style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(124,58,237,0.28)", color: "rgba(167,139,250,0.65)", background: "rgba(8,4,26,0.55)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.5)"; (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.28)"; (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.65)"; }}
            >
              {loadingMore
                ? <><svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>LOADING</>
                : <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>LOAD MORE SIGNALS</>
              }
            </button>
          </div>
        )}

        {/* End of stream */}
        {!cursor && posts.length > 0 && (
          <div className="flex items-center gap-3 pb-4">
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
            <p className="text-[8px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(124,58,237,0.25)" }}>
              {posts.length} TRANSMISSIONS · END
            </p>
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes sf-orbit      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sf-node       { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
        @keyframes sf-breathe    { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.1);opacity:1} }
        @keyframes sf-arc        { 0%,100%{opacity:.35} 50%{opacity:.85} }
        @keyframes sf-letter-in  { from{opacity:0;transform:translateY(-10px) skewX(-8deg);filter:blur(5px)} to{opacity:1;transform:translateY(0) skewX(0deg);filter:blur(0)} }
        @keyframes sf-title-scan { 0%{transform:translateX(-100%)} 60%,100%{transform:translateX(200%)} }
        @keyframes pf-rise       { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pf-ping       { 0%{transform:scale(1);opacity:.75} 100%{transform:scale(2.4);opacity:0} }
        @keyframes pf-cycle-ring { 0%{transform:scale(0.5);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }
        @keyframes pf-cycle-fade { 0%{opacity:0} 15%{opacity:1} 75%{opacity:1} 100%{opacity:0} }
        @keyframes bc-sweep      { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
        @keyframes bc-bar        { from{transform:scaleY(0.35)} to{transform:scaleY(1)} }
        @keyframes bc-pulse      { 0%,100%{box-shadow:0 0 28px rgba(0,229,255,0.55),0 0 60px rgba(0,229,255,0.2),0 4px 20px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.28)} 50%{box-shadow:0 0 44px rgba(0,229,255,0.8),0 0 90px rgba(0,229,255,0.35),0 4px 20px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.28)} }
        .ReactCrop { border-radius: 4px; }
        .ReactCrop__crop-selection { border-color: rgba(0,229,255,0.7); }
        .ReactCrop__drag-handle::after { background: #00e5ff; border-color: #00e5ff; }
      `}</style>
    </div>
  );
}
