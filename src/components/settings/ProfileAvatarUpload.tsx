"use client";

import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────────────────────

type CropBox = { x: number; y: number; size: number };
type Handle = "tl" | "tr" | "bl" | "br";
type DragState =
  | null
  | { kind: "move"; startPX: number; startPY: number; startBox: CropBox }
  | { kind: "resize"; handle: Handle; startPX: number; startPY: number; startBox: CropBox };

const MIN_CROP = 48;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function applyMove(
  drag: Extract<DragState, { kind: "move" }>,
  px: number,
  py: number,
  imgW: number,
  imgH: number
): CropBox {
  return {
    x: clamp(drag.startBox.x + (px - drag.startPX), 0, imgW - drag.startBox.size),
    y: clamp(drag.startBox.y + (py - drag.startPY), 0, imgH - drag.startBox.size),
    size: drag.startBox.size,
  };
}

function applyResize(
  drag: Extract<DragState, { kind: "resize" }>,
  px: number,
  py: number,
  imgW: number,
  imgH: number
): CropBox {
  const { x: sx, y: sy, size: ss } = drag.startBox;
  const h = drag.handle;
  // Fixed opposite corner
  const fx = h === "tl" || h === "bl" ? sx + ss : sx;
  const fy = h === "tl" || h === "tr" ? sy + ss : sy;
  const rawDX = px - fx;
  const rawDY = py - fy;
  const size = clamp(Math.min(Math.abs(rawDX), Math.abs(rawDY)), MIN_CROP, Math.min(imgW, imgH));
  const newX = rawDX >= 0 ? fx : fx - size;
  const newY = rawDY >= 0 ? fy : fy - size;
  const cx = clamp(newX, 0, imgW - MIN_CROP);
  const cy = clamp(newY, 0, imgH - MIN_CROP);
  return { x: cx, y: cy, size: clamp(size, MIN_CROP, Math.min(imgW - cx, imgH - cy)) };
}

// ── Component ────────────────────────────────────────────────────────────────

const MAX_FILE = 20 * 1024 * 1024;

interface ProfileAvatarUploadProps {
  currentUrl: string | null;
  username: string;
  onUploaded: (url: string) => void;
}

export function ProfileAvatarUpload({ currentUrl, username, onUploaded }: ProfileAvatarUploadProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const imgRef     = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef    = useRef<DragState>(null);

  const [src, setSrc]         = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [cropBox, setCropBox]  = useState<CropBox>({ x: 0, y: 0, size: 0 });
  const [imgDims, setImgDims]  = useState({ w: 0, h: 0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError]      = useState<string | null>(null);
  const [isTouch, setIsTouch]  = useState(false);

  useEffect(() => { setIsTouch(window.matchMedia("(hover: none)").matches); }, []);

  useEffect(() => {
    if (!showCrop) {
      setSrc(null); setCropBox({ x: 0, y: 0, size: 0 }); setImgDims({ w: 0, h: 0 });
      dragRef.current = null;
    }
  }, [showCrop]);

  // Global drag tracking — runs on window so drags work even outside the element
  useEffect(() => {
    if (!showCrop) return;
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !containerRef.current || !imgDims.w) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setCropBox(
        drag.kind === "move"
          ? applyMove(drag, px, py, imgDims.w, imgDims.h)
          : applyResize(drag, px, py, imgDims.w, imgDims.h)
      );
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [showCrop, imgDims]);

  const onFileSelected = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > MAX_FILE) { setError("Image must be under 20 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setSrc(reader.result as string); setShowCrop(true); };
    reader.readAsDataURL(file);
  };

  const onImgLoad = () => {
    // Two rAFs: first paints the layout, second measures it after paint
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const img = imgRef.current;
      if (!img) return;
      const w = img.offsetWidth;
      const h = img.offsetHeight;
      if (!w || !h) return;
      const size = Math.round(Math.min(w, h) * 0.8);
      setImgDims({ w, h });
      setCropBox({ x: Math.round((w - size) / 2), y: Math.round((h - size) / 2), size });
    }));
  };

  const startDrag = (e: React.PointerEvent, kind: "move" | "resize", handle?: Handle) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    dragRef.current = kind === "move"
      ? { kind: "move", startPX: px, startPY: py, startBox: { ...cropBox } }
      : handle ? { kind: "resize", handle, startPX: px, startPY: py, startBox: { ...cropBox } } : null;
  };

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || cropBox.size === 0 || uploading) return;
    setUploading(true); setError(null);
    try {
      // Use offsetWidth/offsetHeight to match how we measured in onImgLoad
      const scaleX = img.naturalWidth  / imgDims.w;
      const scaleY = img.naturalHeight / imgDims.h;
      const canvas = document.createElement("canvas");
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, cropBox.x * scaleX, cropBox.y * scaleY, cropBox.size * scaleX, cropBox.size * scaleY, 0, 0, 512, 512);
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.92));
      if (!blob) throw new Error("Crop failed");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage.from("user-avatars").upload(path, blob, {
        contentType: "image/jpeg", upsert: false, cacheControl: "3600",
      });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("user-avatars").getPublicUrl(path);
      onUploaded(publicUrl);
      setShowCrop(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const HANDLES: { id: Handle; cursor: string; pos: React.CSSProperties }[] = [
    { id: "tl", cursor: "nwse-resize", pos: { top: -8, left: -8 } },
    { id: "tr", cursor: "nesw-resize", pos: { top: -8, right: -8 } },
    { id: "bl", cursor: "nesw-resize", pos: { bottom: -8, left: -8 } },
    { id: "br", cursor: "nwse-resize", pos: { bottom: -8, right: -8 } },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Avatar tap target ────────────────────────────────── */}
      <label className="relative block cursor-pointer group flex-shrink-0" style={{ width: 120, height: 120 }}>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelected(f);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />

        <div className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center"
          style={{
            borderColor: currentUrl ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.3)",
            background: "rgba(10,4,24,0.7)",
            boxShadow: currentUrl ? "0 0 20px rgba(0,229,255,0.15)" : undefined,
          }}
        >
          {currentUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={currentUrl} alt={username} className="w-full h-full object-cover" />
            : <span className="text-cyan-400 font-black text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                {(username[0] ?? "?").toUpperCase()}
              </span>
          }
        </div>

        {/* Desktop hover overlay */}
        {!isTouch && (
          <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" className="mx-auto mb-1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[9px] tracking-[2px] text-cyan-400 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                {currentUrl ? "CHANGE" : "UPLOAD"}
              </span>
            </div>
          </div>
        )}

        {/* Always-visible edit badge */}
        <div className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full flex items-center justify-center pointer-events-none"
          style={{ background: "#0c0520", border: "1.5px solid rgba(0,229,255,0.7)", boxShadow: "0 0 10px rgba(0,229,255,0.35)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      </label>

      {error && (
        <p className="text-[11px] text-red-400 mt-2 text-center" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
      )}

      {/* ── Crop modal ───────────────────────────────────────────
          Single wrapper = backdrop + positioning + click-outside-to-close.
          No pointer-events-none anywhere — that pattern breaks iOS Safari. */}
      {showCrop && src && (
        <div
          className="fixed inset-0 z-50 bg-black/82 backdrop-blur-sm flex items-end justify-center sm:items-center sm:p-6"
          onClick={uploading ? undefined : () => setShowCrop(false)}
        >
          {/* Modal panel */}
          <div
            className="relative w-full sm:max-w-lg rounded-t-[20px] sm:rounded-2xl flex flex-col"
            style={{
              background: "#0b051e",
              border: "1px solid rgba(0,229,255,0.28)",
              // Plain vh — dvh is unsupported on iOS < 15.4
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-[20px]"
              style={{ background: "linear-gradient(90deg, transparent, #00e5ff 40%, #a78bfa 70%, transparent)" }}
            />

            {/* ── Header (flex-shrink-0) ── */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}
            >
              <span className="text-[11px] tracking-[3px] text-cyan-400 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                ◈ CROP AVATAR · 324B21
              </span>
              <button
                onClick={() => !uploading && setShowCrop(false)}
                disabled={uploading}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#7a6a9a] hover:text-white active:scale-90 transition-all disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            {/* ── Crop body (flex-1, no overflow-hidden to avoid getBCR issues) ── */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-4">
              <div
                ref={containerRef}
                className="relative inline-block select-none"
                style={{ touchAction: "none", lineHeight: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={src}
                  alt="Crop preview"
                  onLoad={onImgLoad}
                  draggable={false}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    // Plain px — no dvh, no min() — works on all Safari versions
                    maxHeight: 230,
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  }}
                />

                {/* Overlay — only once image has been measured */}
                {cropBox.size > 0 && (
                  <>
                    {/* 4-panel dark mask */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute bg-black/72" style={{ top: 0, left: 0, right: 0, height: cropBox.y }} />
                      <div className="absolute bg-black/72" style={{ top: cropBox.y + cropBox.size, left: 0, right: 0, bottom: 0 }} />
                      <div className="absolute bg-black/72" style={{ top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.size }} />
                      <div className="absolute bg-black/72" style={{ top: cropBox.y, left: cropBox.x + cropBox.size, right: 0, height: cropBox.size }} />
                    </div>

                    {/* Crop box */}
                    <div
                      className="absolute"
                      style={{
                        left: cropBox.x, top: cropBox.y,
                        width: cropBox.size, height: cropBox.size,
                        border: "1.5px solid rgba(0,229,255,0.95)",
                        boxShadow: "inset 0 0 0 1px rgba(0,229,255,0.08)",
                      }}
                    >
                      {/* Rule-of-thirds grid */}
                      <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "linear-gradient(rgba(0,229,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.15) 1px, transparent 1px)",
                        backgroundSize: "33.33% 33.33%",
                      }} />

                      {/* Move area — covers the crop interior */}
                      <div
                        className="absolute cursor-move"
                        style={{ inset: 16, touchAction: "none" }}
                        onPointerDown={(e) => startDrag(e, "move")}
                      />

                      {/* Corner handles — 36×36 touch target, 12×12 visible square */}
                      {HANDLES.map(({ id, cursor, pos }) => (
                        <div
                          key={id}
                          className="absolute flex items-center justify-center"
                          style={{ width: 36, height: 36, cursor, touchAction: "none", ...pos }}
                          onPointerDown={(e) => startDrag(e, "resize", id)}
                        >
                          <div style={{
                            width: 12, height: 12,
                            background: "#00e5ff",
                            borderRadius: 2,
                            boxShadow: "0 0 10px rgba(0,229,255,1), 0 0 4px rgba(0,229,255,0.8)",
                          }} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tip */}
            <p className="text-center text-[10px] text-purple-500/40 flex-shrink-0 pb-1" style={{ fontFamily: "var(--font-mono)" }}>
              drag to move · corners to resize
            </p>

            {/* ── Footer (flex-shrink-0) — CONFIRM always visible ── */}
            <div className="flex gap-3 p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}>
              <button
                onClick={() => setShowCrop(false)}
                disabled={uploading}
                className="flex-1 py-4 rounded-xl border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/50 active:scale-[0.97] transition-all disabled:opacity-40"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirm}
                disabled={uploading || cropBox.size === 0}
                className="py-4 rounded-xl font-black text-[11px] tracking-[3px] text-black active:scale-[0.97] transition-all disabled:opacity-40"
                style={{
                  fontFamily: "var(--font-mono)",
                  flex: "2 2 0",
                  background: "linear-gradient(90deg, #00e5ff, #00b4d8)",
                  boxShadow: uploading || cropBox.size === 0 ? undefined : "0 0 32px rgba(0,229,255,0.6)",
                }}
              >
                {uploading ? "UPLOADING..." : "◈ CONFIRM CROP →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
