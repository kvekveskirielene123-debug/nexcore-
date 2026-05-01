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

interface ProfileAvatarUploadProps {
  currentUrl: string | null;
  username: string;
  onUploaded: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function ProfileAvatarUpload({
  currentUrl,
  username,
  onUploaded,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showCrop) {
      setSrc(null);
      setCrop(undefined);
      setCompletedCrop(null);
    }
  }, [showCrop]);

  const onFileSelected = (file: File) => {
    setError(null);
    if (!ACCEPT.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(
      centerCrop(
        makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
        width,
        height
      )
    );
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
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        512,
        512
      );

      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), "image/jpeg", 0.9)
      );
      if (!blob) throw new Error("Crop failed");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("user-avatars")
        .upload(path, blob, {
          contentType: "image/jpeg",
          upsert: false,
          cacheControl: "3600",
        });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("user-avatars").getPublicUrl(path);

      onUploaded(publicUrl);
      setShowCrop(false);
    } catch (err: any) {
      setError(err.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Avatar display + click to change */}
      <label className="relative block cursor-pointer group flex-shrink-0" style={{ width: 120, height: 120 }}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelected(f);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />

        <div
          className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center"
          style={{
            borderColor: currentUrl ? "rgba(0,229,255,0.5)" : "rgba(124,58,237,0.3)",
            background: "rgba(10,4,24,0.7)",
            boxShadow: currentUrl
              ? "0 0 20px rgba(0,229,255,0.15)"
              : undefined,
          }}
        >
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="text-cyan-400 font-black text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {(username[0] ?? "?").toUpperCase()}
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.5"
              className="mx-auto mb-1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
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
      </label>

      {error && (
        <p
          className="text-[11px] text-red-400 mt-2 text-center"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {error}
        </p>
      )}

      {/* Crop modal */}
      {showCrop && src && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm"
            onClick={uploading ? undefined : () => setShowCrop(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-[#0c0520] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <div className="flex items-center justify-between px-5 py-4 border-b border-purple-700/15">
                <h3
                  className="text-[11px] tracking-[3px] text-cyan-400 uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ◈ CROP PROFILE AVATAR · 324B21
                </h3>
                <button
                  onClick={() => setShowCrop(false)}
                  disabled={uploading}
                  className="text-[#7a6a9a] hover:text-cyan-400 transition-colors disabled:opacity-40"
                >
                  ✕
                </button>
              </div>

              <div className="p-5">
                <div
                  className="flex justify-center bg-black/40 rounded-lg overflow-hidden mb-4"
                  style={{ maxHeight: 400 }}
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
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      style={{ maxHeight: 400, display: "block" }}
                    />
                  </ReactCrop>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCrop(false)}
                    disabled={uploading}
                    className="flex-1 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all disabled:opacity-40"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={uploading || !completedCrop}
                    className="flex-1 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] disabled:opacity-40 hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {uploading ? "UPLOADING..." : "CONFIRM →"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <style jsx global>{`
            .ReactCrop__crop-selection {
              border: 1px solid rgba(0, 229, 255, 0.9) !important;
              box-shadow: 0 0 0 9999em rgba(5, 2, 13, 0.7);
            }
            .ReactCrop__drag-handle::after {
              background-color: #00e5ff !important;
              border-color: rgba(0, 229, 255, 0.7) !important;
              box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
            }
          `}</style>
        </>
      )}
    </>
  );
}
