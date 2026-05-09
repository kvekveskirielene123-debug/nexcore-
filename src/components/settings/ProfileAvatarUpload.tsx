"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────

type Handle = "tl" | "tr" | "bl" | "br" | "move";
interface Crop     { x: number; y: number; size: number }
interface ImgRect  { x: number; y: number; w: number; h: number }
interface DragState {
  kind: Handle;
  startScreenX: number; startScreenY: number;
  startCrop: Crop;
  areaLeft: number; areaTop: number;
  areaW: number; areaH: number;
}

const MIN_CROP = 80;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

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

  const cx = clamp(sx - areaLeft, ir.x, ir.x + ir.w);
  const cy = clamp(sy - areaTop,  ir.y, ir.y + ir.h);
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

function Bracket({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const isTop  = corner === "tl" || corner === "tr";
  const isLeft = corner === "tl" || corner === "bl";
  const L = 24, T = 3, C = "#00d4ff";
  return (
    <div
      style={{
        position: "absolute",
        top:    isTop  ? 0 : undefined,
        bottom: isTop  ? undefined : 0,
        left:   isLeft ? 0 : undefined,
        right:  isLeft ? undefined : 0,
        width: L, height: L,
        pointerEvents: "none",
        zIndex: 4,
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
  // createPortal requires the DOM — track mount so SSR doesn't blow up
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Scroll lock + cleanup when modal closes
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSrc(null);
      setCrop({ x: 0, y: 0, size: 0 });
      dragRef.current    = null;
      imgRectRef.current = { x: 0, y: 0, w: 0, h: 0 };
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  // Global pointer tracking while modal is open
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
    if (file.size > 20 * 1024 * 1024)   { setError("File must be under 20 MB."); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload  = () => { setSrc(reader.result as string); setShowModal(true); };
    reader.onerror = () => { setError("Could not read file."); };
    reader.readAsDataURL(file);
  }

  function onImgLoad() {
    // Two rAF passes let the browser finish layout before we read dimensions
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const img  = imgRef.current;
      const area = areaRef.current;
      if (!img || !area || !img.naturalWidth || !img.naturalHeight) return;
      const W = area.offsetWidth, H = area.offsetHeight;
      if (!W || !H) return;
      const ir   = getImgRect(img.naturalWidth, img.naturalHeight, W, H);
      imgRectRef.current = ir;
      const size = Math.round(Math.min(ir.w, ir.h) * 0.72);
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
      areaLeft: r.left, areaTop: r.top,
      areaW: r.width,   areaH: r.height,
    };
  }

  async function confirmCrop() {
    const img = imgRef.current;
    if (!img || uploading || crop.size < 1) return;
    setUploading(true);
    setError(null);
    try {
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

      const blob: Blob | null = await new Promise(res =>
        canvas.toBlob(b => res(b), "image/jpeg", 0.92)
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

  // ── Modal — rendered via portal so no parent CSS can interfere ─────────────

  const HEADER_H = 56;
  const FOOTER_H = 64;

  const modal = (
    <>
      <style>{`
        @keyframes cropScan {
          0%   { top: 0%;   opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .__crop-scan { animation: cropScan 2s linear infinite; }
      `}</style>

      {/* ── OVERLAY ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.92)",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={uploading ? undefined : () => setShowModal(false)}
      >
        {/* ── MODAL BOX ── */}
        <div
          style={{
            width: 740,
            maxWidth: "96vw",
            height: 680,
            maxHeight: "88vh",
            background: "#040814",
            border: "1.5px solid rgba(0,212,255,0.65)",
            borderRadius: 18,
            overflow: "hidden",
            position: "relative",
            boxShadow:
              "0 0 0 1px rgba(0,212,255,0.1), " +
              "0 0 60px rgba(0,212,255,0.3), " +
              "0 0 120px rgba(0,212,255,0.12), " +
              "0 40px 80px rgba(0,0,0,0.85)",
          }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── HEADER ── */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: HEADER_H,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 22px",
              background: "rgba(0,212,255,0.04)",
              borderBottom: "1px solid rgba(0,212,255,0.2)",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
              <span style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#00d4ff",
              }}>
                CROP AVATAR · 324B21
              </span>
            </div>
            <button
              onClick={() => !uploading && setShowModal(false)}
              disabled={uploading}
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.8)",
                fontSize: 18,
                cursor: uploading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* ── IMAGE + CROP AREA ── */}
          <div
            ref={areaRef}
            style={{
              position: "absolute",
              top: HEADER_H,
              left: 0,
              right: 0,
              bottom: FOOTER_H,
              background: "#000",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src ?? ""}
              alt="Crop preview"
              onLoad={onImgLoad}
              draggable={false}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%", height: "100%",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />

            {/* Dimming panels outside crop selection */}
            {hasCrop && <>
              <div style={{ position: "absolute", top: 0,       left: 0, right: 0, height: y,               background: "rgba(0,0,0,0.68)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: y + size, left: 0, right: 0, bottom: 0,               background: "rgba(0,0,0,0.68)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: y,       left: 0, width: x,  height: size,            background: "rgba(0,0,0,0.68)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: y,       left: x + size, right: 0, height: size,      background: "rgba(0,0,0,0.68)", pointerEvents: "none" }} />
            </>}

            {/* Draggable crop box */}
            {hasCrop && (
              <div
                onPointerDown={e => startDrag(e, "move")}
                style={{
                  position: "absolute",
                  left: x, top: y,
                  width: size, height: size,
                  border: "2px solid rgba(0,212,255,0.9)",
                  cursor: "move",
                  touchAction: "none",
                  overflow: "hidden",
                }}
              >
                {/* Rule-of-thirds grid */}
                <div style={{
                  position: "absolute", inset: 0,
                  pointerEvents: "none",
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)," +
                    "linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "33.33% 33.33%",
                }} />

                {/* Scan line */}
                <div
                  className="__crop-scan"
                  style={{
                    position: "absolute", left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.55) 20%, rgba(0,212,255,0.55) 80%, transparent)",
                    pointerEvents: "none",
                  }}
                />

                {/* Corner L-brackets */}
                <Bracket corner="tl" />
                <Bracket corner="tr" />
                <Bracket corner="bl" />
                <Bracket corner="br" />

                {/* Resize handles — cyan squares at each corner */}
                <div onPointerDown={e => startDrag(e, "tl")} style={{ position: "absolute", top: 0,    left: 0,  width: 14, height: 14, background: "#00d4ff", borderRadius: 3, boxShadow: "0 0 10px #00d4ff", cursor: "nwse-resize", touchAction: "none", zIndex: 6 }} />
                <div onPointerDown={e => startDrag(e, "tr")} style={{ position: "absolute", top: 0,    right: 0, width: 14, height: 14, background: "#00d4ff", borderRadius: 3, boxShadow: "0 0 10px #00d4ff", cursor: "nesw-resize", touchAction: "none", zIndex: 6 }} />
                <div onPointerDown={e => startDrag(e, "bl")} style={{ position: "absolute", bottom: 0, left: 0,  width: 14, height: 14, background: "#00d4ff", borderRadius: 3, boxShadow: "0 0 10px #00d4ff", cursor: "nesw-resize", touchAction: "none", zIndex: 6 }} />
                <div onPointerDown={e => startDrag(e, "br")} style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, background: "#00d4ff", borderRadius: 3, boxShadow: "0 0 10px #00d4ff", cursor: "nwse-resize", touchAction: "none", zIndex: 6 }} />
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: FOOTER_H,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 22px",
              background: "rgba(0,212,255,0.02)",
              borderTop: "1px solid rgba(0,212,255,0.18)",
              zIndex: 10,
            }}
          >
            {/* Error message */}
            {error && (
              <span style={{
                flex: 1,
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: 11,
                color: "#f87171",
              }}>
                {error}
              </span>
            )}

            {!error && <div style={{ flex: 1 }} />}

            <button
              onClick={() => setShowModal(false)}
              disabled={uploading}
              style={{
                height: 42, padding: "0 20px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "rgba(255,255,255,0.4)",
                fontSize: 11, letterSpacing: 2,
                fontFamily: "var(--font-mono, monospace)",
                cursor: uploading ? "default" : "pointer",
                flexShrink: 0,
              }}
            >
              CANCEL
            </button>

            <button
              onClick={confirmCrop}
              disabled={uploading || !hasCrop}
              style={{
                height: 46, padding: "0 32px",
                background: hasCrop && !uploading
                  ? "linear-gradient(135deg, #00d4ff, #0099ff)"
                  : "rgba(0,212,255,0.15)",
                border: "none",
                borderRadius: 8,
                color: hasCrop && !uploading ? "#000" : "rgba(0,212,255,0.3)",
                fontSize: 12, letterSpacing: 4, fontWeight: 800,
                fontFamily: "var(--font-mono, monospace)",
                cursor: uploading ? "wait" : !hasCrop ? "default" : "pointer",
                boxShadow: hasCrop && !uploading
                  ? "0 0 24px rgba(0,212,255,0.5), 0 0 48px rgba(0,212,255,0.18)"
                  : "none",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {uploading ? "UPLOADING…" : "CONFIRM CROP"}
            </button>
          </div>

        </div>
      </div>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) openFile(f);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      {/* Avatar button */}
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

      {error && !showModal && (
        <p className="text-[11px] text-red-400 mt-2 text-center" style={{ fontFamily: "var(--font-body)" }}>
          {error}
        </p>
      )}

      {/* Modal rendered via portal — bypasses ALL parent CSS stacking contexts */}
      {mounted && showModal && src && createPortal(modal, document.body)}
    </>
  );
}
