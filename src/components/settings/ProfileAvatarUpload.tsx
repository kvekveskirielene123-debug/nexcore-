"use client";

import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────────────────────

type CropBox = { x: number; y: number; size: number };
type Handle = "tl" | "tr" | "bl" | "br";
type DragState =
  | null
  | { kind: "move";   startPX: number; startPY: number; startBox: CropBox }
  | { kind: "resize"; handle: Handle; startPX: number; startPY: number; startBox: CropBox };

const MIN_CROP   = 80;
const MAX_FILE   = 20 * 1024 * 1024;

// Modal layout constants (px)
const HEADER_PX  = 56;
const FOOTER_PX  = 80;
const BODY_PAD   = 16; // each side
// Image max-height = 85vh – all surrounding chrome
// 85vh is safer than 90vh for iOS Safari (avoids browser chrome overlap)
const IMG_MAX_H  = `calc(85vh - ${HEADER_PX + FOOTER_PX + BODY_PAD * 2}px)`;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function applyMove(
  d: Extract<DragState, { kind: "move" }>,
  px: number, py: number, W: number, H: number,
): CropBox {
  return {
    x: clamp(d.startBox.x + px - d.startPX, 0, W - d.startBox.size),
    y: clamp(d.startBox.y + py - d.startPY, 0, H - d.startBox.size),
    size: d.startBox.size,
  };
}

function applyResize(
  d: Extract<DragState, { kind: "resize" }>,
  px: number, py: number, W: number, H: number,
): CropBox {
  const { x: sx, y: sy, size: ss } = d.startBox;
  const h  = d.handle;
  const fx = (h === "tl" || h === "bl") ? sx + ss : sx;
  const fy = (h === "tl" || h === "tr") ? sy + ss : sy;
  const dx = px - fx, dy = py - fy;
  const sz = clamp(Math.min(Math.abs(dx), Math.abs(dy)), MIN_CROP, Math.min(W, H));
  const nx = clamp(dx >= 0 ? fx : fx - sz, 0, W - MIN_CROP);
  const ny = clamp(dy >= 0 ? fy : fy - sz, 0, H - MIN_CROP);
  return { x: nx, y: ny, size: clamp(sz, MIN_CROP, Math.min(W - nx, H - ny)) };
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  currentUrl: string | null;
  username:   string;
  onUploaded: (url: string) => void;
}

export function ProfileAvatarUpload({ currentUrl, username, onUploaded }: Props) {
  const inputRef     = useRef<HTMLInputElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef      = useRef<DragState>(null);

  const [src,       setSrc]       = useState<string | null>(null);
  const [showCrop,  setShowCrop]  = useState(false);
  const [cropBox,   setCropBox]   = useState<CropBox>({ x: 0, y: 0, size: 0 });
  const [imgDims,   setImgDims]   = useState({ w: 0, h: 0 });
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [isTouch,   setIsTouch]   = useState(false);

  useEffect(() => { setIsTouch(window.matchMedia("(hover: none)").matches); }, []);

  useEffect(() => {
    if (!showCrop) {
      setSrc(null);
      setCropBox({ x: 0, y: 0, size: 0 });
      setImgDims({ w: 0, h: 0 });
      dragRef.current = null;
    }
  }, [showCrop]);

  // Global pointer tracking – works even when pointer leaves the element
  useEffect(() => {
    if (!showCrop) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !containerRef.current || !imgDims.w) return;
      const r  = containerRef.current.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      setCropBox(
        d.kind === "move"
          ? applyMove(d, px, py, imgDims.w, imgDims.h)
          : applyResize(d, px, py, imgDims.w, imgDims.h),
      );
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup",   onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
  }, [showCrop, imgDims]);

  const openFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > MAX_FILE)            { setError("Image must be under 20 MB."); return; }
    const r = new FileReader();
    r.onload = () => { setSrc(r.result as string); setShowCrop(true); };
    r.readAsDataURL(file);
  };

  // Two rAFs: first paints the flex layout, second reads stable pixel dimensions
  const onImgLoad = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const img = imgRef.current;
      if (!img) return;
      const w = img.offsetWidth, h = img.offsetHeight;
      if (!w || !h) return;
      const size = Math.round(Math.min(w, h) * 0.78);
      setImgDims({ w, h });
      setCropBox({ x: Math.round((w - size) / 2), y: Math.round((h - size) / 2), size });
    }));
  };

  const startDrag = (e: React.PointerEvent, kind: "move" | "resize", handle?: Handle) => {
    e.preventDefault(); e.stopPropagation();
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = e.clientX - r.left, py = e.clientY - r.top;
    dragRef.current =
      kind === "move"
        ? { kind: "move",   startPX: px, startPY: py, startBox: { ...cropBox } }
        : handle
        ? { kind: "resize", handle, startPX: px, startPY: py, startBox: { ...cropBox } }
        : null;
  };

  const confirm = async () => {
    const img = imgRef.current;
    if (!img || !cropBox.size || uploading) return;
    setUploading(true); setError(null);
    try {
      const sx = img.naturalWidth  / imgDims.w;
      const sy = img.naturalHeight / imgDims.h;
      const cv = document.createElement("canvas");
      cv.width = cv.height = 512;
      const ctx = cv.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img,
        cropBox.x * sx, cropBox.y * sy,
        cropBox.size * sx, cropBox.size * sy,
        0, 0, 512, 512,
      );
      const blob: Blob | null = await new Promise((res) => cv.toBlob((b) => res(b), "image/jpeg", 0.92));
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ── Corner handle helper ──────────────────────────────────────────────────
  // Handles are placed INSIDE the crop box at each corner so overflow:hidden
  // on the modal never clips them (no negative offsets).
  const CornerHandle = ({
    id, top, right, bottom, left, cursor,
  }: {
    id: Handle;
    top?: number; right?: number; bottom?: number; left?: number;
    cursor: string;
  }) => (
    // 44×44 touch target (inside crop box)
    <div
      onPointerDown={(e) => startDrag(e, "resize", id)}
      style={{
        position: "absolute",
        top, right, bottom, left,
        width: 44, height: 44,
        cursor,
        touchAction: "none",
        zIndex: 3,
        display: "flex",
        alignItems: top !== undefined ? "flex-start" : "flex-end",
        justifyContent: left !== undefined ? "flex-start" : "flex-end",
      }}
    >
      {/* 14×14 visible square */}
      <div style={{
        width: 14, height: 14,
        background: "#00d4ff",
        borderRadius: 2,
        boxShadow: "0 0 10px rgba(0,212,255,0.9), 0 0 4px rgba(0,212,255,1)",
        flexShrink: 0,
      }} />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Avatar tap target ── */}
      <label
        className="relative block cursor-pointer group flex-shrink-0"
        style={{ width: 120, height: 120 }}
      >
        <input
          ref={inputRef} type="file" accept="image/*" className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) openFile(f);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />

        <div
          className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center"
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
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[9px] tracking-[2px] text-cyan-400 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                {currentUrl ? "CHANGE" : "UPLOAD"}
              </span>
            </div>
          </div>
        )}

        {/* Always-visible edit badge */}
        <div
          className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full flex items-center justify-center pointer-events-none"
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

      {/* ── Crop modal ───────────────────────────────────────────────────────
          LAYOUT STRATEGY
          ─────────────────
          • Non-flex modal: just block layout with explicit-height sections.
          • Image is constrained to IMG_MAX_H = calc(85vh – chrome),
            so modal total height = HEADER + BODY_PAD*2 + imageH + FOOTER
            which is always ≤ 85vh. Footer is NEVER pushed off screen.
          • modal has overflow:hidden for border-radius clipping.
          • Corner handles are INSIDE the crop box (no negative offsets)
            so overflow:hidden never clips them.
          • Single wrapper div = backdrop + click-to-close. No
            pointer-events:none anywhere (broken on iOS Safari).  */}
      {showCrop && src && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={uploading ? undefined : () => setShowCrop(false)}
        >
          {/* ── Modal box ── */}
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              maxWidth: 700,
              background: "rgba(10,15,30,0.97)",
              border: "1px solid #00d4ff",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 0 60px rgba(0,212,255,0.15), 0 0 120px rgba(0,212,255,0.07)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] z-10"
              style={{ background: "linear-gradient(90deg, transparent 10%, #00d4ff 50%, transparent 90%)" }}
            />

            {/* ── HEADER ── */}
            <div
              className="flex items-center justify-between px-6"
              style={{ height: HEADER_PX, borderBottom: "1px solid rgba(0,212,255,0.2)" }}
            >
              <span
                className="text-[11px] tracking-[4px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "#00d4ff" }}
              >
                ◈ CROP AVATAR · 324B21
              </span>
              <button
                onClick={() => !uploading && setShowCrop(false)}
                disabled={uploading}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all disabled:opacity-40"
                style={{ fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {/* ── CROP BODY ── */}
            <div
              className="flex items-center justify-center"
              style={{ padding: BODY_PAD }}
            >
              {/* Image + overlay wrapper */}
              <div
                ref={containerRef}
                className="relative inline-block select-none"
                style={{ touchAction: "none", lineHeight: 0, maxWidth: "100%" }}
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
                    // calc() with vh + px: supported Safari 11.1+; no dvh needed
                    maxHeight: IMG_MAX_H,
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  }}
                />

                {/* Overlay — only once dimensions are known */}
                {cropBox.size > 0 && (
                  <>
                    {/* 4-panel dark mask */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute bg-black/70" style={{ top: 0, left: 0, right: 0, height: cropBox.y }} />
                      <div className="absolute bg-black/70" style={{ top: cropBox.y + cropBox.size, left: 0, right: 0, bottom: 0 }} />
                      <div className="absolute bg-black/70" style={{ top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.size }} />
                      <div className="absolute bg-black/70" style={{ top: cropBox.y, left: cropBox.x + cropBox.size, right: 0, height: cropBox.size }} />
                    </div>

                    {/* Crop selection */}
                    <div
                      className="absolute"
                      style={{
                        left: cropBox.x, top: cropBox.y,
                        width: cropBox.size, height: cropBox.size,
                        border: "2px dashed rgba(0,212,255,0.85)",
                        boxShadow: "0 0 0 1px rgba(0,212,255,0.1)",
                      }}
                    >
                      {/* Rule-of-thirds grid */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)," +
                            "linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                          backgroundSize: "33.33% 33.33%",
                        }}
                      />

                      {/* Move area (interior) */}
                      <div
                        className="absolute cursor-move"
                        style={{ inset: 18, touchAction: "none", zIndex: 1 }}
                        onPointerDown={(e) => startDrag(e, "move")}
                      />

                      {/* ── 4 CORNER HANDLES (inside crop box, no negative offsets) ── */}
                      <CornerHandle id="tl" top={0}    left={0}   cursor="nwse-resize" />
                      <CornerHandle id="tr" top={0}    right={0}  cursor="nesw-resize" />
                      <CornerHandle id="bl" bottom={0} left={0}   cursor="nesw-resize" />
                      <CornerHandle id="br" bottom={0} right={0}  cursor="nwse-resize" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Hint */}
            <p
              className="text-center text-[10px] text-white/25 pb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              drag to move · corners to resize
            </p>

            {/* ── FOOTER ── */}
            <div
              className="flex items-center gap-3 px-6"
              style={{ height: FOOTER_PX, borderTop: "1px solid rgba(0,212,255,0.2)" }}
            >
              <button
                onClick={() => setShowCrop(false)}
                disabled={uploading}
                className="flex-1 rounded-xl border border-white/15 text-[11px] tracking-[2px] text-white/60 hover:border-white/30 hover:text-white active:scale-[0.97] transition-all disabled:opacity-40"
                style={{ fontFamily: "var(--font-mono)", height: 48 }}
              >
                CANCEL
              </button>

              <button
                onClick={confirm}
                disabled={uploading || cropBox.size === 0}
                className="rounded-xl font-black text-[12px] tracking-[3px] text-black active:scale-[0.97] transition-all disabled:opacity-40"
                style={{
                  fontFamily: "var(--font-mono)",
                  height: 48,
                  flex: "2 2 0",
                  background: "linear-gradient(135deg, #00d4ff, #0099ff)",
                  boxShadow: (!uploading && cropBox.size > 0)
                    ? "0 0 28px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.2)"
                    : undefined,
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
