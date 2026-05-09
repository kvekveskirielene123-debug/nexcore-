"use client";

import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────

type Handle = "tl" | "tr" | "bl" | "br" | "move";
interface Crop   { x: number; y: number; size: number }
interface ImgRect { x: number; y: number; w: number; h: number }
interface DragState {
  kind: Handle;
  startScreenX: number; startScreenY: number;
  startCrop: Crop;
  areaLeft: number; areaTop: number;
  areaW: number; areaH: number;
}

const MIN_CROP = 80;

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// Returns the actual rendered rect of object-fit:contain image within container
function getImgRect(nw: number, nh: number, cw: number, ch: number): ImgRect {
  const imgR = nw / nh, conR = cw / ch;
  if (imgR > conR) {
    const h = cw / imgR;
    return { x: 0, y: (ch - h) / 2, w: cw, h };
  }
  const w = ch * imgR;
  return { x: (cw - w) / 2, y: 0, w, h: ch };
}

function applyDrag(d: DragState, sx: number, sy: number, ir: ImgRect): Crop {
  const { kind, startScreenX: ox, startScreenY: oy, startCrop: sc, areaLeft, areaTop } = d;

  if (kind === "move") {
    return {
      x:    clamp(sc.x + sx - ox, ir.x, ir.x + ir.w - sc.size),
      y:    clamp(sc.y + sy - oy, ir.y, ir.y + ir.h - sc.size),
      size: sc.size,
    };
  }

  // Cursor clamped to image bounds (not full container — no dragging into letterbox)
  const cx = clamp(sx - areaLeft, ir.x, ir.x + ir.w);
  const cy = clamp(sy - areaTop,  ir.y, ir.y + ir.h);

  // Fixed corner (opposite to the dragged handle)
  const fx = (kind === "tl" || kind === "bl") ? sc.x + sc.size : sc.x;
  const fy = (kind === "tl" || kind === "tr") ? sc.y + sc.size : sc.y;

  const rawSize = Math.min(Math.abs(cx - fx), Math.abs(cy - fy));
  const size    = clamp(rawSize, MIN_CROP, Math.min(ir.w, ir.h));

  let newX = cx >= fx ? fx : fx - size;
  let newY = cy >= fy ? fy : fy - size;
  newX = clamp(newX, ir.x, ir.x + ir.w - size);
  newY = clamp(newY, ir.y, ir.y + ir.h - size);
  return { x: newX, y: newY, size };
}

// ── Corner bracket decoration (L-shape, camera-viewfinder style) ───────────────
function Bracket({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const isTop  = corner === "tl" || corner === "tr";
  const isLeft = corner === "tl" || corner === "bl";
  const L = 24, T = 3, C = "#00d4ff";
  return (
    <div
      style={{
        position:    "absolute",
        top:         isTop   ? 0 : undefined,
        bottom:      isTop   ? undefined : 0,
        left:        isLeft  ? 0 : undefined,
        right:       isLeft  ? undefined : 0,
        width:       L, height: L,
        pointerEvents: "none",
        zIndex:      4,
        borderTop:    isTop  ? `${T}px solid ${C}` : undefined,
        borderBottom: isTop  ? undefined : `${T}px solid ${C}`,
        borderLeft:   isLeft ? `${T}px solid ${C}` : undefined,
        borderRight:  isLeft ? undefined : `${T}px solid ${C}`,
        boxShadow: `0 0 8px rgba(0,212,255,0.6)`,
      }}
    />
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  currentUrl: string | null;
  username:   string;
  onUploaded: (url: string) => void;
}

export function ProfileAvatarUpload({ currentUrl, username, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const areaRef      = useRef<HTMLDivElement>(null);
  const dragRef      = useRef<DragState | null>(null);
  const imgRectRef   = useRef<ImgRect>({ x: 0, y: 0, w: 0, h: 0 });

  const [src,       setSrc]       = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [crop,      setCrop]      = useState<Crop>({ x: 0, y: 0, size: 0 });
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Scroll lock + reset on close
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSrc(null);
      setCrop({ x: 0, y: 0, size: 0 });
      dragRef.current = null;
      imgRectRef.current = { x: 0, y: 0, w: 0, h: 0 };
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  // Global pointer listeners (mouse + touch, both directions)
  useEffect(() => {
    if (!showModal) return;
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      setCrop(applyDrag(dragRef.current, e.clientX, e.clientY, imgRectRef.current));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup",   onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
  }, [showModal]);

  function openFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 20 * 1024 * 1024)   { setError("Image must be under 20 MB."); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => { setSrc(reader.result as string); setShowModal(true); };
    reader.readAsDataURL(file);
  }

  function onImgLoad() {
    // Double rAF waits for flex layout to fully settle before reading dimensions
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const img  = imgRef.current;
      const area = areaRef.current;
      if (!img || !area || !img.naturalWidth || !img.naturalHeight) return;
      const W = area.offsetWidth, H = area.offsetHeight;
      if (!W || !H) return;
      const ir   = getImgRect(img.naturalWidth, img.naturalHeight, W, H);
      imgRectRef.current = ir;
      const size = Math.round(Math.min(ir.w, ir.h) * 0.70);
      setCrop({
        x:    Math.round(ir.x + (ir.w - size) / 2),
        y:    Math.round(ir.y + (ir.h - size) / 2),
        size,
      });
    }));
  }

  function startDrag(e: React.PointerEvent, kind: Handle) {
    e.preventDefault();
    e.stopPropagation();
    if (!areaRef.current) return;
    const r = areaRef.current.getBoundingClientRect();
    dragRef.current = {
      kind,
      startScreenX: e.clientX, startScreenY: e.clientY,
      startCrop:    { ...crop },
      areaLeft:     r.left, areaTop: r.top,
      areaW:        r.width, areaH: r.height,
    };
  }

  async function confirmCrop() {
    const img = imgRef.current;
    if (!img || uploading || crop.size < 1) return;
    setUploading(true); setError(null);
    try {
      // Map crop box (container coords) → natural image pixels
      const { x: irX, y: irY, w: irW } = imgRectRef.current;
      const scale   = img.naturalWidth / irW;
      const natX    = (crop.x - irX) * scale;
      const natY    = (crop.y - irY) * scale;
      const natSize = crop.size * scale;

      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, natX, natY, natSize, natSize, 0, 0, 512, 512);

      const blob: Blob | null = await new Promise(res => canvas.toBlob(b => res(b), "image/jpeg", 0.92));
      if (!blob) throw new Error("Crop failed");

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage.from("user-avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("user-avatars").getPublicUrl(path);
      onUploaded(publicUrl);
      setShowModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const { x, y, size } = crop;
  const hasCrop = size > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes cropScanMove {
          0%   { top: 0%;   opacity: 0;   }
          8%   { opacity: 1;              }
          92%  { opacity: 1;              }
          100% { top: 100%; opacity: 0;   }
        }
        .crop-scan-anim { animation: cropScanMove 2s linear infinite; }

        @keyframes modalPop {
          0%   { transform: scale(0.88); opacity: 0; }
          60%  { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes overlayFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .modal-pop     { animation: modalPop   0.28s cubic-bezier(.22,1,.36,1) forwards; }
        .overlay-fade  { animation: overlayFade 0.2s ease forwards; }
      `}</style>

      {/* Hidden file input — triggered via button below (iOS-safe pattern) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) openFile(f);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      {/* ── Avatar button ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative block cursor-pointer group flex-shrink-0"
        style={{ width: 120, height: 120, borderRadius: "50%", padding: 0, background: "none", border: "none", outline: "none" }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center"
          style={{
            borderColor: currentUrl ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.3)",
            background:  "rgba(10,4,24,0.7)",
            boxShadow:   currentUrl ? "0 0 20px rgba(0,229,255,0.15)" : undefined,
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

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" className="mx-auto mb-1">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[9px] tracking-[2px] text-cyan-400 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              {currentUrl ? "CHANGE" : "UPLOAD"}
            </span>
          </div>
        </div>

        {/* Edit badge */}
        <div
          className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full flex items-center justify-center pointer-events-none"
          style={{ background: "#0c0520", border: "1.5px solid rgba(0,229,255,0.7)", boxShadow: "0 0 10px rgba(0,229,255,0.35)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      </button>

      {error && (
        <p className="text-[11px] text-red-400 mt-2 text-center" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
      )}

      {/* ── CROP MODAL ───────────────────────────────────────────────────────── */}
      {showModal && src && (
        /* OVERLAY */
        <div
          className="overlay-fade"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={uploading ? undefined : () => setShowModal(false)}
        >
          <div
            className="modal-pop"
            style={{
              width: 740, maxWidth: "96vw",
              height: "min(680px, 88vh)",
              background: "rgba(4,8,20,0.99)",
              border: "1px solid rgba(0,212,255,0.6)",
              borderRadius: 18,
              overflow: "hidden",
              position: "relative",
              zIndex: 100000,
              boxShadow: "0 0 0 1px rgba(0,212,255,0.08), 0 0 80px rgba(0,212,255,0.25), 0 0 160px rgba(0,212,255,0.1), 0 32px 64px rgba(0,0,0,0.8)",
            }}
            onClick={e => e.stopPropagation()}
          >

            {/* ── HEADER — pinned to top, 56px ── */}
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 56,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px",
                borderBottom: "1px solid rgba(0,212,255,0.18)",
                background: "rgba(0,212,255,0.03)",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  letterSpacing: 4, textTransform: "uppercase",
                  color: "#00d4ff", whiteSpace: "nowrap",
                }}
              >
                ◆ CROP AVATAR · 324B21
              </span>
              <button
                onClick={() => !uploading && setShowModal(false)}
                disabled={uploading}
                style={{
                  width: 36, height: 36, flexShrink: 0, marginLeft: 16,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 18, lineHeight: 1,
                  cursor: uploading ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* ── IMAGE / CROP AREA — fills space between header and footer ── */}
            <div
              ref={areaRef}
              style={{
                position: "absolute", top: 56, left: 0, right: 0, bottom: 64,
                background: "#000",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt="Crop preview"
                onLoad={onImgLoad}
                draggable={false}
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  objectFit: "contain",
                  userSelect: "none", WebkitUserSelect: "none",
                  pointerEvents: "none",
                }}
              />

              {/* Dark overlay — 4 panels masking outside the crop selection */}
              {hasCrop && (
                <>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: y, background: "rgba(0,0,0,0.65)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: y + size, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: y, left: 0, width: x, height: size, background: "rgba(0,0,0,0.65)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: y, left: x + size, right: 0, height: size, background: "rgba(0,0,0,0.65)", pointerEvents: "none" }} />
                </>
              )}

              {/* Crop box */}
              {hasCrop && (
                <div
                  onPointerDown={e => startDrag(e, "move")}
                  style={{
                    position: "absolute", left: x, top: y, width: size, height: size,
                    border: "2px dashed rgba(0,212,255,0.85)",
                    cursor: "move", touchAction: "none",
                    overflow: "hidden",
                  }}
                >
                  {/* Rule-of-thirds grid */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none",
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)," +
                      "linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
                    backgroundSize: "33.33% 33.33%",
                  }} />

                  {/* Scan line */}
                  <div
                    className="crop-scan-anim"
                    style={{
                      position: "absolute", left: 0, right: 0, height: 2,
                      background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5) 20%, rgba(0,212,255,0.5) 80%, transparent)",
                      pointerEvents: "none",
                    }}
                  />

                  <Bracket corner="tl" />
                  <Bracket corner="tr" />
                  <Bracket corner="bl" />
                  <Bracket corner="br" />

                  {/* Resize handles */}
                  <div onPointerDown={e => startDrag(e, "tl")} style={{ position: "absolute", top: 0, left: 0, width: 16, height: 16, background: "#00d4ff", borderRadius: 2, boxShadow: "0 0 12px rgba(0,212,255,1)", cursor: "nwse-resize", touchAction: "none", zIndex: 5 }} />
                  <div onPointerDown={e => startDrag(e, "tr")} style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, background: "#00d4ff", borderRadius: 2, boxShadow: "0 0 12px rgba(0,212,255,1)", cursor: "nesw-resize", touchAction: "none", zIndex: 5 }} />
                  <div onPointerDown={e => startDrag(e, "bl")} style={{ position: "absolute", bottom: 0, left: 0, width: 16, height: 16, background: "#00d4ff", borderRadius: 2, boxShadow: "0 0 12px rgba(0,212,255,1)", cursor: "nesw-resize", touchAction: "none", zIndex: 5 }} />
                  <div onPointerDown={e => startDrag(e, "br")} style={{ position: "absolute", bottom: 0, right: 0, width: 16, height: 16, background: "#00d4ff", borderRadius: 2, boxShadow: "0 0 12px rgba(0,212,255,1)", cursor: "nwse-resize", touchAction: "none", zIndex: 5 }} />
                </div>
              )}
            </div>

            {/* ── FOOTER — pinned to bottom, 64px ── */}
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 64,
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 20px",
                borderTop: "1px solid rgba(0,212,255,0.18)",
                background: "rgba(0,212,255,0.02)",
                zIndex: 2,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                disabled={uploading}
                style={{
                  width: 90, height: 44, flexShrink: 0,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11, letterSpacing: 2,
                  fontFamily: "var(--font-mono)",
                  cursor: uploading ? "default" : "pointer",
                }}
              >
                CANCEL
              </button>

              <button
                onClick={confirmCrop}
                disabled={uploading || !hasCrop}
                style={{
                  flex: 1, height: 48,
                  background: "linear-gradient(135deg, #00d4ff, #0099ff)",
                  border: "none", borderRadius: 8,
                  color: "#000", fontSize: 13, letterSpacing: 4, fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  cursor: uploading ? "wait" : "pointer",
                  boxShadow: (hasCrop && !uploading) ? "0 0 28px rgba(0,212,255,0.55), 0 0 60px rgba(0,212,255,0.2)" : "none",
                  opacity: (uploading || !hasCrop) ? 0.45 : 1,
                  transition: "box-shadow 0.25s, opacity 0.25s, transform 0.15s",
                }}
                onMouseEnter={e => { if (!uploading && hasCrop) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              >
                {uploading ? "UPLOADING..." : "CONFIRM CROP"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
