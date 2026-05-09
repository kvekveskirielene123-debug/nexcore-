"use client";

import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────

type Handle = "tl" | "tr" | "bl" | "br" | "move";

interface Crop { x: number; y: number; size: number }

interface DragState {
  kind:         Handle;
  startScreenX: number;
  startScreenY: number;
  startCrop:    Crop;
  areaLeft:     number;
  areaTop:      number;
  areaW:        number;
  areaH:        number;
}

const MIN_CROP = 60;
const AREA_H   = 520; // px — fixed height of the crop area

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function applyDrag(d: DragState, screenX: number, screenY: number): Crop {
  const { kind, startScreenX: sx, startScreenY: sy, startCrop: sc,
          areaLeft, areaTop, areaW: W, areaH: H } = d;

  if (kind === "move") {
    return {
      x:    clamp(sc.x + screenX - sx, 0, W - sc.size),
      y:    clamp(sc.y + screenY - sy, 0, H - sc.size),
      size: sc.size,
    };
  }

  // Cursor clamped to area bounds
  const cx = clamp(screenX - areaLeft, 0, W);
  const cy = clamp(screenY - areaTop,  0, H);

  // The corner that stays fixed (opposite to the dragged handle)
  const fx = (kind === "tl" || kind === "bl") ? sc.x + sc.size : sc.x;
  const fy = (kind === "tl" || kind === "tr") ? sc.y + sc.size : sc.y;

  // Square size = min distance from the fixed corner (box never overshoots cursor)
  const rawSize = Math.min(Math.abs(cx - fx), Math.abs(cy - fy));
  const size    = clamp(rawSize, MIN_CROP, Math.min(W, H));

  // Origin: cursor side of the fixed corner
  let newX = cx >= fx ? fx : fx - size;
  let newY = cy >= fy ? fy : fy - size;
  newX = clamp(newX, 0, W - size);
  newY = clamp(newY, 0, H - size);

  return { x: newX, y: newY, size };
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
  // areaRef wraps BOTH the image layer and the crop box so handles
  // are never inside overflow:hidden and are never clipped.
  const areaRef      = useRef<HTMLDivElement>(null);
  const dragRef      = useRef<DragState | null>(null);

  const [src,       setSrc]       = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [crop,      setCrop]      = useState<Crop>({ x: 0, y: 0, size: 0 });
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Reset everything when modal closes + lock body scroll while open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSrc(null);
      setCrop({ x: 0, y: 0, size: 0 });
      dragRef.current = null;
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  // Global pointer move / up listeners (work for both mouse and touch)
  useEffect(() => {
    if (!showModal) return;
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      setCrop(applyDrag(dragRef.current, e.clientX, e.clientY));
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
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Image must be under 20 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  }

  // After image renders: measure the actual rendered area and centre the crop box
  function onImgLoad() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!areaRef.current) return;
      const W    = areaRef.current.offsetWidth;
      const H    = areaRef.current.offsetHeight; // actual rendered height, not hardcoded
      const size = Math.round(Math.min(W, H) * 0.75);
      setCrop({
        x:    Math.round((W - size) / 2),
        y:    Math.round((H - size) / 2),
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
      startScreenX: e.clientX,
      startScreenY: e.clientY,
      startCrop:    { ...crop },
      areaLeft:     r.left,
      areaTop:      r.top,
      areaW:        r.width,
      areaH:        r.height,
    };
  }

  async function confirmCrop() {
    const img = imgRef.current;
    if (!img || !areaRef.current || uploading || crop.size < 1) return;
    setUploading(true);
    setError(null);
    try {
      const W = areaRef.current.offsetWidth;
      const H = areaRef.current.offsetHeight; // actual rendered height, not hardcoded

      // Reverse the object-fit:cover transform to get natural-pixel coordinates
      const scale    = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const displayW = img.naturalWidth  * scale;
      const displayH = img.naturalHeight * scale;
      const offX     = (W - displayW) / 2; // negative = image extends past edge
      const offY     = (H - displayH) / 2;

      const natX    = (crop.x - offX) / scale;
      const natY    = (crop.y - offY) / scale;
      const natSize = crop.size / scale;

      const canvas  = document.createElement("canvas");
      canvas.width  = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, natX, natY, natSize, natSize, 0, 0, 512, 512);

      const blob: Blob | null = await new Promise(
        (res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.92),
      );
      if (!blob) throw new Error("Crop failed");

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("user-avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(path);

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
      {/* ── Avatar button ───────────────────────────────────────────────────── */}
      {/*
        IMPORTANT: Do NOT use <label> + sr-only input on mobile.
        iOS Safari does not reliably forward taps on <img>/<div> children of a
        <label> to the hidden <input type="file">. The bulletproof pattern is a
        <button> that calls inputRef.current.click() directly from the tap handler —
        that IS a user gesture so iOS always allows the file picker to open.
      */}
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

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative block cursor-pointer group flex-shrink-0"
        style={{
          width: 120, height: 120,
          borderRadius: "50%",
          padding: 0,
          background: "none",
          border: "none",
          outline: "none",
        }}
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
            : <span
                className="text-cyan-400 font-black text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {(username[0] ?? "?").toUpperCase()}
              </span>
          }
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" className="mx-auto mb-1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span
              className="text-[9px] tracking-[2px] text-cyan-400 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {currentUrl ? "CHANGE" : "UPLOAD"}
            </span>
          </div>
        </div>

        {/* Edit badge */}
        <div
          className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full flex items-center justify-center pointer-events-none"
          style={{
            background:  "#0c0520",
            border:      "1.5px solid rgba(0,229,255,0.7)",
            boxShadow:   "0 0 10px rgba(0,229,255,0.35)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      </button>

      {error && (
        <p
          className="text-[11px] text-red-400 mt-2 text-center"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {error}
        </p>
      )}

      {/* ── Crop modal ───────────────────────────────────────────────────────── */}
      {showModal && src && (
        /* OVERLAY — full-screen dark backdrop.
           Use top/left/right/bottom:0 instead of 100vw/100vh to avoid the
           iOS Safari bug where 100vh doesn't account for browser chrome.       */
        <div
          style={{
            position:       "fixed",
            top:            0,
            left:           0,
            right:          0,
            bottom:         0,
            background:     "rgba(0,0,0,0.85)",
            zIndex:         99999,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
          onClick={uploading ? undefined : () => setShowModal(false)}
        >
          {/* MODAL BOX */}
          <div
            style={{
              width:         680,
              maxWidth:      "92vw",
              maxHeight:     "90vh",       // never taller than the viewport
              background:    "rgba(8,12,28,0.97)",
              border:        "1px solid #00d4ff",
              borderRadius:  16,
              overflow:      "hidden",
              display:       "flex",
              flexDirection: "column",
              boxShadow:     "0 0 40px rgba(0,212,255,0.2)",
              position:      "relative",
              zIndex:        100000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── HEADER ── */}
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                padding:        "16px 24px",
                borderBottom:   "1px solid rgba(0,212,255,0.2)",
                flexShrink:     0,
              }}
            >
              <span
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      11,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color:         "#00d4ff",
                }}
              >
                ◈ CROP AVATAR · 324B21
              </span>
              <button
                onClick={() => !uploading && setShowModal(false)}
                disabled={uploading}
                style={{
                  width:          36,
                  height:         36,
                  borderRadius:   "50%",
                  border:         "1px solid rgba(255,255,255,0.15)",
                  background:     "transparent",
                  color:          "rgba(255,255,255,0.6)",
                  fontSize:       16,
                  cursor:         uploading ? "default" : "pointer",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* ── BODY ── (flex-shrink:1 so header+footer always stay on screen) */}
            <div style={{ padding: 24, flexShrink: 1, overflow: "hidden" }}>
              {/*
                LAYOUT STRATEGY
                ───────────────
                areaRef is position:relative. It has two layers:
                  1. image-layer  — position:absolute, overflow:hidden → clips cover image
                  2. crop layer   — crop box + handles positioned directly on areaRef

                Because the crop box is a direct child of areaRef (not of the
                overflow:hidden image layer), handles at -7px are only bounded by the
                modal's overflow:hidden — which starts 24px outside the area. So with
                24px padding, a handle at -7px is 17px inside the modal: never clipped.
              */}
              <div
                ref={areaRef}
                style={{
                  position:     "relative",
                  width:        "100%",
                  // min() shrinks on short screens so footer is never pushed off.
                  // 210px ≈ header(50) + footer(80) + body-padding(48) + hint(30).
                  height:       `min(${AREA_H}px, calc(90vh - 210px))`,
                  borderRadius: 8,
                  background:   "#000",
                }}
              >
                {/* ── Image layer (overflow:hidden clips the cover-fit image) ── */}
                <div
                  style={{
                    position:     "absolute",
                    top:          0,
                    left:         0,
                    right:        0,
                    bottom:       0,
                    overflow:     "hidden",
                    borderRadius: 8,
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
                      position:          "absolute",
                      top:               0,
                      left:              0,
                      width:             "100%",
                      height:            "100%",
                      objectFit:         "cover",
                      userSelect:        "none",
                      WebkitUserSelect:  "none",
                      pointerEvents:     "none",
                    }}
                  />
                </div>

                {/* ── Dark overlay: 4 panels masking outside the crop box ── */}
                {hasCrop && (
                  <div
                    style={{
                      position:      "absolute",
                      top:           0,
                      left:          0,
                      right:         0,
                      bottom:        0,
                      pointerEvents: "none",
                    }}
                  >
                    {/* top */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: y, background: "rgba(0,0,0,0.6)" }} />
                    {/* bottom */}
                    <div style={{ position: "absolute", top: y + size, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)" }} />
                    {/* left */}
                    <div style={{ position: "absolute", top: y, left: 0, width: x, height: size, background: "rgba(0,0,0,0.6)" }} />
                    {/* right */}
                    <div style={{ position: "absolute", top: y, left: x + size, right: 0, height: size, background: "rgba(0,0,0,0.6)" }} />
                  </div>
                )}

                {/* ── Crop box + 4 handles ── */}
                {hasCrop && (
                  <div
                    onPointerDown={(e) => startDrag(e, "move")}
                    style={{
                      position:            "absolute",
                      left:                x,
                      top:                 y,
                      width:               size,
                      height:              size,
                      border:              "2px dashed #00d4ff",
                      cursor:              "move",
                      touchAction:         "none",
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)," +
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                      backgroundSize: "33.33% 33.33%",
                    }}
                  >
                    {/* TL */}
                    <div
                      onPointerDown={(e) => startDrag(e, "tl")}
                      style={{
                        position:    "absolute",
                        top:         -7,
                        left:        -7,
                        width:       14,
                        height:      14,
                        background:  "#00d4ff",
                        borderRadius: 2,
                        boxShadow:   "0 0 8px rgba(0,212,255,0.9)",
                        cursor:      "nwse-resize",
                        touchAction: "none",
                      }}
                    />
                    {/* TR */}
                    <div
                      onPointerDown={(e) => startDrag(e, "tr")}
                      style={{
                        position:    "absolute",
                        top:         -7,
                        right:       -7,
                        width:       14,
                        height:      14,
                        background:  "#00d4ff",
                        borderRadius: 2,
                        boxShadow:   "0 0 8px rgba(0,212,255,0.9)",
                        cursor:      "nesw-resize",
                        touchAction: "none",
                      }}
                    />
                    {/* BL */}
                    <div
                      onPointerDown={(e) => startDrag(e, "bl")}
                      style={{
                        position:    "absolute",
                        bottom:      -7,
                        left:        -7,
                        width:       14,
                        height:      14,
                        background:  "#00d4ff",
                        borderRadius: 2,
                        boxShadow:   "0 0 8px rgba(0,212,255,0.9)",
                        cursor:      "nesw-resize",
                        touchAction: "none",
                      }}
                    />
                    {/* BR */}
                    <div
                      onPointerDown={(e) => startDrag(e, "br")}
                      style={{
                        position:    "absolute",
                        bottom:      -7,
                        right:       -7,
                        width:       14,
                        height:      14,
                        background:  "#00d4ff",
                        borderRadius: 2,
                        boxShadow:   "0 0 8px rgba(0,212,255,0.9)",
                        cursor:      "nwse-resize",
                        touchAction: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              <p
                style={{
                  textAlign:     "center",
                  fontSize:      10,
                  color:         "rgba(255,255,255,0.25)",
                  marginTop:     10,
                  fontFamily:    "var(--font-mono)",
                }}
              >
                drag to move · corners to resize
              </p>
            </div>

            {/* ── FOOTER ── */}
            <div
              style={{
                padding:     "16px 24px",
                borderTop:   "1px solid rgba(0,212,255,0.2)",
                flexShrink:  0,
                display:     "flex",
                gap:         12,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                disabled={uploading}
                style={{
                  flex:          1,
                  height:        48,
                  background:    "transparent",
                  border:        "1px solid rgba(255,255,255,0.15)",
                  borderRadius:  8,
                  color:         "rgba(255,255,255,0.6)",
                  fontSize:      11,
                  letterSpacing: 2,
                  fontFamily:    "var(--font-mono)",
                  cursor:        uploading ? "default" : "pointer",
                  opacity:       uploading ? 0.5 : 1,
                  transition:    "border-color 0.2s, color 0.2s",
                }}
              >
                CANCEL
              </button>

              <button
                onClick={confirmCrop}
                disabled={uploading || !hasCrop}
                style={{
                  flex:          2,
                  height:        48,
                  background:    "linear-gradient(135deg, #00d4ff, #0099ff)",
                  border:        "none",
                  borderRadius:  8,
                  color:         "white",
                  fontSize:      12,
                  letterSpacing: 3,
                  fontWeight:    700,
                  fontFamily:    "var(--font-mono)",
                  cursor:        uploading ? "wait" : "pointer",
                  boxShadow:     (hasCrop && !uploading) ? "0 0 24px rgba(0,212,255,0.5)" : "none",
                  opacity:       (uploading || !hasCrop) ? 0.5 : 1,
                  transition:    "box-shadow 0.2s, opacity 0.2s",
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
