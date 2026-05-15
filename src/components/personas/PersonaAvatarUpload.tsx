"use client";

import { useRef, useState, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createClient } from "@/lib/supabase/client";

interface PersonaAvatarUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  size?: number;
}

const MAX_SIZE = 20 * 1024 * 1024;

export function PersonaAvatarUpload({
  currentUrl,
  onUploaded,
  size = 96,
}: PersonaAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [cropVisible, setCropVisible] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animate crop modal in after mount
  useEffect(() => {
    if (showCrop) {
      requestAnimationFrame(() => requestAnimationFrame(() => setCropVisible(true)));
    } else {
      setCropVisible(false);
      setSrc(null);
      setCrop(undefined);
      setCompletedCrop(null);
    }
  }, [showCrop]);

  const closeCrop = () => {
    if (uploading) return;
    setCropVisible(false);
    setTimeout(() => setShowCrop(false), 300);
  };

  const onFileSelected = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    if (file.size > MAX_SIZE) { setError("Image must be under 20 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setSrc(reader.result as string); setShowCrop(true); };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 80 }, 1, width, height), width, height));
  };

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    setUploading(true);
    setError(null);
    try {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const canvas = document.createElement("canvas");
      const outputSize = 512;
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.drawImage(
        image,
        completedCrop.x * scaleX, completedCrop.y * scaleY,
        completedCrop.width * scaleX, completedCrop.height * scaleY,
        0, 0, outputSize, outputSize
      );
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
      );
      if (!blob) throw new Error("Crop failed");

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("persona-avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("persona-avatars").getPublicUrl(path);
      onUploaded(publicUrl);
      closeCrop();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Avatar circle */}
      <label
        className="relative block rounded-full cursor-pointer transition-all overflow-hidden group flex-shrink-0 active:scale-95"
        style={{
          width: size,
          height: size,
          border: "2px solid",
          borderColor: currentUrl ? "rgba(0,229,255,0.45)" : "rgba(124,58,237,0.35)",
          background: "rgba(10,4,24,0.6)",
          boxShadow: currentUrl
            ? "0 0 20px rgba(0,229,255,0.15), 0 0 0 4px rgba(0,229,255,0.06)"
            : "0 0 20px rgba(124,58,237,0.12), 0 0 0 4px rgba(124,58,237,0.04)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelected(f);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />

        {currentUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentUrl} alt="Persona avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
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
      </label>

      {error && (
        <p className="text-[11px] text-red-400 mt-2 text-center" style={{ fontFamily: "var(--font-body)" }}>
          {error}
        </p>
      )}

      {/* ── Crop modal (bottom sheet on mobile, centered on sm+) ── */}
      {showCrop && src && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: cropVisible ? 1 : 0 }}
            onClick={closeCrop}
          />

          {/* Sheet */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <div
              className={`
                pointer-events-auto w-full sm:max-w-lg
                rounded-t-2xl sm:rounded-2xl overflow-hidden
                transition-transform duration-300 ease-out
                ${cropVisible ? "translate-y-0" : "translate-y-full"}
              `}
              style={{
                background: "#0c0520",
                border: "1px solid rgba(0,229,255,0.3)",
                maxHeight: "95dvh",
              }}
            >
              {/* Top accent */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

              {/* Drag handle (mobile) */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(124,58,237,0.12)" }}
              >
                <h3
                  className="text-[11px] tracking-[3px] uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "#00e5ff" }}
                >
                  ◈ CROP AVATAR · 324B21
                </h3>
                <button
                  onClick={closeCrop}
                  disabled={uploading}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                  style={{ color: "rgba(122,106,154,0.7)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Crop area */}
              <div className="p-5">
                <div
                  className="flex justify-center bg-black/40 rounded-xl overflow-hidden mb-4"
                  style={{ maxHeight: "min(380px, 45dvh)" }}
                >
                  <ReactCrop
                    crop={crop}
                    onChange={(_, pc) => setCrop(pc)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    minWidth={50}
                    keepSelection
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={src}
                      alt="Crop source"
                      onLoad={onImageLoad}
                      style={{ maxHeight: "min(380px, 45dvh)", display: "block" }}
                    />
                  </ReactCrop>
                </div>

                <div className="flex gap-2" style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}>
                  <button
                    onClick={closeCrop}
                    disabled={uploading}
                    className="flex-1 py-3.5 rounded-xl text-[11px] tracking-[2px] transition-all disabled:opacity-40 active:scale-[0.97]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      border: "1px solid rgba(124,58,237,0.25)",
                      color: "rgba(167,139,250,0.8)",
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={uploading || !completedCrop}
                    className="flex-1 py-3.5 rounded-xl font-bold text-[11px] tracking-[3px] disabled:opacity-40 transition-all active:scale-[0.97]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: uploading ? "rgba(0,229,255,0.65)" : "#00e5ff",
                      color: "#000",
                      boxShadow: "0 0 20px rgba(0,229,255,0.3)",
                    }}
                  >
                    {uploading ? "UPLOADING..." : "CONFIRM CROP →"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <style jsx global>{`
            .ReactCrop__crop-selection {
              border: 1px solid rgba(0,229,255,0.9) !important;
              box-shadow: 0 0 0 9999em rgba(5,2,13,0.7);
            }
            .ReactCrop__drag-handle::after {
              background-color: #00e5ff !important;
              border-color: rgba(0,229,255,0.7) !important;
              box-shadow: 0 0 8px rgba(0,229,255,0.6);
            }
          `}</style>
        </>
      )}
    </>
  );
}
