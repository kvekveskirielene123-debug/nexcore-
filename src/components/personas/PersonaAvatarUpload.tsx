"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────

type Handle = "tl" | "tr" | "bl" | "br" | "move";
interface Crop    { x: number; y: number; size: number }
interface ImgRect { x: number; y: number; w: number; h: number }
interface DragState {
  kind: Handle;
  startScreenX: number; startScreenY: number;
  startCrop: Crop;
  areaLeft: number; areaTop: number;
  areaW: number; areaH: number;
}

const MIN_CROP = 80;
const HANDLE   = 22;

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function getImgRect(nw: number, nh: number, cw: number, ch: number): ImgRect {
  const imgR = nw / nh, conR = cw / ch;
  if (imgR > conR) { const h = cw / imgR; return { x: 0, y: (ch - h) / 2, w: cw, h }; }
  const w = ch * imgR; return { x: (cw - w) / 2, y: 0, w, h: ch };
}

function applyDrag(d: DragState, sx: number, sy: number, ir: ImgRect): Crop {
  const { kind, startScreenX: ox, startScreenY: oy, startCrop: sc, areaLeft, areaTop } = d;
  if (kind === "move") return {
    x:    clamp(sc.x + sx - ox, ir.x, ir.x + ir.w - sc.size),
    y:    clamp(sc.y + sy - oy, ir.y, ir.y + ir.h - sc.size),
    size: sc.size,
  };
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

// ── Component ──────────────────────────────────────────────────────────────────

interface PersonaAvatarUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  size?: number;
}

export function PersonaAvatarUpload({ currentUrl, onUploaded, size = 96 }: PersonaAvatarUploadProps) {
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
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
    const reader   = new FileReader();
    reader.onload  = () => { setSrc(reader.result as string); setShowModal(true); };
    reader.onerror = () => setError("Could not read file.");
    reader.readAsDataURL(file);
  }

  function onImgLoad() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const img  = imgRef.current;
      const area = areaRef.current;
      if (!img || !area || !img.naturalWidth || !img.naturalHeight) return;
      const W = area.offsetWidth, H = area.offsetHeight;
      if (!W || !H) return;
      const ir   = getImgRect(img.naturalWidth, img.naturalHeight, W, H);
      imgRectRef.current = ir;
      const sz = Math.round(Math.min(ir.w, ir.h) * 0.72);
      setCrop({ x: Math.round(ir.x + (ir.w - sz) / 2), y: Math.round(ir.y + (ir.h - sz) / 2), size: sz });
    }));
  }

  function startDrag(e: React.PointerEvent, kind: Handle) {
    e.preventDefault(); e.stopPropagation();
    if (!areaRef.current) return;
    const r = areaRef.current.getBoundingClientRect();
    dragRef.current = {
      kind,
      startScreenX: e.clientX, startScreenY: e.clientY,
      startCrop: { ...crop },
      areaLeft: r.left, areaTop: r.top, areaW: r.width, areaH: r.height,
    };
  }

  async function confirmCrop() {
    const img = imgRef.current;
    if (!img || uploading || crop.size < 1) return;
    setUploading(true); setError(null);
    try {
      const { x: irX, y: irY, w: irW } = imgRectRef.current;
      const scale   = img.naturalWidth / irW;
      const natX    = (crop.x - irX) * scale;
      const natY    = (crop.y - irY) * scale;
      const natSize = crop.size * scale;
      const canvas  = document.createElement("canvas");
      canvas.width  = canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, natX, natY, natSize, natSize, 0, 0, 512, 512);
      const blob: Blob | null = await new Promise(res => canvas.toBlob(b => res(b), "image/jpeg", 0.92));
      if (!blob) throw new Error("Crop failed");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage.from("persona-avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("persona-avatars").getPublicUrl(path);
      onUploaded(publicUrl);
      setShowModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally { setUploading(false); }
  }

  const { x, y, size: sz } = crop;
  const hasCrop = sz > 0;
  const cx      = x + sz / 2;
  const cy      = y + sz / 2;
  const r       = sz / 2;

  const handles: { kind: Handle; hx: number; hy: number; cursor: string }[] = [
    { kind: "tl", hx: x - HANDLE / 2,       hy: y - HANDLE / 2,       cursor: "nwse-resize" },
    { kind: "tr", hx: x + sz - HANDLE / 2,  hy: y - HANDLE / 2,       cursor: "nesw-resize" },
    { kind: "bl", hx: x - HANDLE / 2,        hy: y + sz - HANDLE / 2, cursor: "nesw-resize" },
    { kind: "br", hx: x + sz - HANDLE / 2,   hy: y + sz - HANDLE / 2, cursor: "nwse-resize" },
  ];

  const HEADER_H = 64;
  const FOOTER_H = 80;

  // ── MODAL (portal-rendered) ─────────────────────────────────────────────────
  const modal = (
    <>
      <style>{`
        @keyframes _paScan {
          0%   { stroke-dashoffset: 1000; opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes _paGlow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0,229,255,0.25), 0 0 16px rgba(0,229,255,0.15); }
          50%       { box-shadow: 0 0 0 3px rgba(0,229,255,0.6),  0 0 28px rgba(0,229,255,0.4); }
        }
        @keyframes _paHandle {
          0%, 100% { box-shadow: 0 0 0 0px rgba(0,229,255,0.8), 0 0 8px rgba(0,229,255,0.6); }
          50%       { box-shadow: 0 0 0 4px rgba(0,229,255,0.2), 0 0 16px rgba(0,229,255,0.9); }
        }
        @keyframes _paFadeUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes _paSpin { to { transform: rotate(360deg); } }
        .__pa-scan      { animation: _paScan    3s ease-in-out infinite; animation-delay: 1s; }
        .__pa-glow      { animation: _paGlow    2.5s ease-in-out infinite; }
        .__pa-handle    { animation: _paHandle  2s ease-in-out infinite; }
        .__pa-fade-up   { animation: _paFadeUp  0.3s cubic-bezier(.22,1,.36,1) forwards; }
        .__pa-spin      { animation: _paSpin    0.7s linear infinite; }
      `}</style>

      {/* ── OVERLAY ── */}
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onClick={uploading ? undefined : () => setShowModal(false)}
      >
        {/* ── MODAL BOX ── */}
        <div
          className="__pa-fade-up"
          style={{
            width: 720, maxWidth: "96vw",
            height: 700, maxHeight: "90vh",
            background: "linear-gradient(160deg, #06080f 0%, #03050c 100%)",
            border: "1.5px solid rgba(0,229,255,0.5)",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            boxShadow:
              "0 0 0 1px rgba(0,229,255,0.06)," +
              "0 0 40px rgba(0,229,255,0.2)," +
              "0 0 100px rgba(0,229,255,0.08)," +
              "0 40px 80px rgba(0,0,0,0.9)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top glow strip */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.7) 30%, rgba(167,139,250,0.5) 70%, transparent)",
            zIndex: 20,
          }} />

          {/* ── HEADER ── */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: HEADER_H,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            background: "rgba(0,0,0,0.3)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            zIndex: 15,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(0,229,255,0.1)",
                border: "1.5px solid rgba(0,229,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>
                  Persona Photo
                </div>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 8, color: "rgba(0,229,255,0.45)", letterSpacing: 3, marginTop: 1 }}>
                  IDENTITY · 324B21
                </div>
              </div>
            </div>

            <button
              onClick={() => !uploading && setShowModal(false)}
              disabled={uploading}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 17, cursor: uploading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
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
              top: HEADER_H, left: 0, right: 0, bottom: FOOTER_H,
              background: "#000",
              overflow: "hidden",
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
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "contain",
                userSelect: "none", pointerEvents: "none",
              }}
            />

            {/* SVG circular mask + animated scan ring */}
            {hasCrop && (
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 }}>
                <defs>
                  <mask id="__pa-hole">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx={cx} cy={cy} r={r} fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#__pa-hole)" />
                <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" />
                <circle
                  className="__pa-scan"
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2"
                  strokeDasharray="60 9999"
                  strokeLinecap="round"
                />
                {[
                  `M ${x + 12},${y} L ${x},${y} L ${x},${y + 12}`,
                  `M ${x + sz - 12},${y} L ${x + sz},${y} L ${x + sz},${y + 12}`,
                  `M ${x},${y + sz - 12} L ${x},${y + sz} L ${x + 12},${y + sz}`,
                  `M ${x + sz - 12},${y + sz} L ${x + sz},${y + sz} L ${x + sz},${y + sz - 12}`,
                ].map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="rgba(0,229,255,0.45)" strokeWidth="2" strokeLinecap="round" />
                ))}
              </svg>
            )}

            {/* Drag-move zone inside circle */}
            {hasCrop && (
              <div
                onPointerDown={e => startDrag(e, "move")}
                style={{
                  position: "absolute",
                  left: x, top: y, width: sz, height: sz,
                  borderRadius: "50%",
                  cursor: "move", touchAction: "none",
                  zIndex: 4,
                }}
              />
            )}

            {/* Corner resize handles */}
            {hasCrop && handles.map(({ kind, hx, hy, cursor }) => (
              <div
                key={kind}
                onPointerDown={e => startDrag(e, kind)}
                className="__pa-handle"
                style={{
                  position: "absolute",
                  left: hx, top: hy,
                  width: HANDLE, height: HANDLE,
                  borderRadius: "50%",
                  background: "#00e5ff",
                  border: "2.5px solid #fff",
                  cursor, touchAction: "none",
                  zIndex: 8,
                }}
              />
            ))}
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: FOOTER_H,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            background: "rgba(0,0,0,0.4)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            zIndex: 15,
            gap: 12,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={uploading}
                style={{
                  background: "none", border: "none", padding: 0,
                  fontFamily: "var(--font-mono, monospace)", fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  cursor: uploading ? "default" : "pointer",
                  letterSpacing: 1,
                  transition: "color 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)"; }}
              >
                Cancel
              </button>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: 2 }}>
                DRAG TO REPOSITION
              </span>
            </div>

            {/* Live circle preview */}
            {hasCrop && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  className="__pa-glow"
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    border: "2px solid rgba(0,229,255,0.5)",
                    overflow: "hidden",
                    background: "#000",
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src ?? ""}
                    alt=""
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover",
                      objectPosition: `${-((crop.x - imgRectRef.current.x) / imgRectRef.current.w) * 100}% ${-((crop.y - imgRectRef.current.y) / imgRectRef.current.h) * 100}%`,
                    }}
                  />
                </div>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 7, color: "rgba(0,229,255,0.4)", letterSpacing: 2 }}>PREVIEW</span>
              </div>
            )}

            {/* Use Photo button */}
            <button
              onClick={confirmCrop}
              disabled={uploading || !hasCrop}
              style={{
                height: 52, padding: "0 28px",
                borderRadius: 100,
                border: "none",
                background: hasCrop && !uploading
                  ? "linear-gradient(135deg, #00e5ff 0%, #0088ff 100%)"
                  : "rgba(255,255,255,0.07)",
                color: hasCrop && !uploading ? "#000" : "rgba(255,255,255,0.2)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 13, fontWeight: 800, letterSpacing: 2,
                cursor: uploading ? "wait" : !hasCrop ? "default" : "pointer",
                boxShadow: hasCrop && !uploading
                  ? "0 0 28px rgba(0,229,255,0.55), 0 8px 24px rgba(0,100,255,0.35)"
                  : "none",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => {
                if (!hasCrop || uploading) return;
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 40px rgba(0,229,255,0.75), 0 8px 32px rgba(0,100,255,0.5)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 28px rgba(0,229,255,0.55), 0 8px 24px rgba(0,100,255,0.35)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              {uploading ? (
                <>
                  <span className="__pa-spin" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%" }} />
                  Uploading
                </>
              ) : (
                <>
                  Use Photo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Error toast */}
          {error && (
            <div style={{
              position: "absolute", bottom: FOOTER_H + 12, left: "50%", transform: "translateX(-50%)",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "8px 16px",
              fontFamily: "var(--font-body, sans-serif)", fontSize: 12, color: "#fca5a5",
              whiteSpace: "nowrap", zIndex: 20,
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
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

      {/* Avatar circle trigger */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative block cursor-pointer group flex-shrink-0 active:scale-95"
        style={{
          width: size, height: size,
          borderRadius: "50%",
          padding: 0, background: "none", border: "none", outline: "none",
          transition: "transform 0.15s",
        }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          style={{
            border: "2px solid",
            borderColor: currentUrl ? "rgba(0,229,255,0.45)" : "rgba(124,58,237,0.35)",
            background: "rgba(10,4,24,0.6)",
            boxShadow: currentUrl
              ? "0 0 20px rgba(0,229,255,0.15), 0 0 0 4px rgba(0,229,255,0.06)"
              : "0 0 20px rgba(124,58,237,0.12), 0 0 0 4px rgba(124,58,237,0.04)",
          }}
        >
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt="Persona avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity="0.7">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span
                className="text-[8px] tracking-[2px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.7)" }}
              >
                UPLOAD
              </span>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" className="mx-auto mb-1">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="text-[8px] tracking-[2px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.8)" }}>
              {currentUrl ? "CHANGE" : "UPLOAD"}
            </span>
          </div>
        </div>
      </button>

      {error && !showModal && (
        <p className="text-[11px] text-red-400 mt-2 text-center" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
      )}

      {mounted && showModal && src && createPortal(modal, document.body)}
    </>
  );
}
