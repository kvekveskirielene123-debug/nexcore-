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

interface AvatarCropDialogProps {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onConfirm: (publicUrl: string) => void;
}

export function AvatarCropDialog({
  open,
  file,
  onCancel,
  onConfirm,
}: AvatarCropDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !open) {
      setSrc(null);
      setCrop(undefined);
      setCompletedCrop(null);
      setError(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, [file, open]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const getCroppedBlob = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement("canvas");
    const outputSize = 512; // fixed 512×512 output
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.9
      );
    });
  };

  const handleConfirm = async () => {
    if (!completedCrop || completedCrop.width < 10) {
      setError("Please drag the corners to select a crop area.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const blob = await getCroppedBlob();
      if (!blob) throw new Error("Could not crop image");

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("character-avatars")
        .upload(path, blob, {
          contentType: "image/jpeg",
          upsert: false,
          cacheControl: "3600",
        });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from("character-avatars")
        .getPublicUrl(path);

      onConfirm(publicUrl);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" onClick={uploading ? undefined : onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-[#0c0520] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-700/15">
            <h3
              className="text-[11px] tracking-[3px] text-cyan-400 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ◈ CROP AVATAR · 324B21
            </h3>
            <button
              onClick={uploading ? undefined : onCancel}
              aria-label="Cancel"
              className="text-[#7a6a9a] hover:text-cyan-400 transition-colors disabled:opacity-40"
              disabled={uploading}
            >
              ✕
            </button>
          </div>

          <div className="p-5">
            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-[12px]">
                {error}
              </div>
            )}

            {src && (
              <div className="flex justify-center bg-black/40 rounded-lg overflow-hidden mb-4" style={{ maxHeight: 400 }}>
                <ReactCrop
                  crop={crop}
                  onChange={(_, pc) => setCrop(pc)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={50}
                  circularCrop={false}
                  keepSelection
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={src}
                    alt="Crop source"
                    onLoad={onImageLoad}
                    style={{ maxHeight: 400, display: "block" }}
                  />
                </ReactCrop>
              </div>
            )}

            <p
              className="text-[11px] text-[#7a6a9a] text-center mb-5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Drag the corners to frame your character. We&apos;ll save it as 512×512.
            </p>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                disabled={uploading}
                className="flex-1 py-3 rounded-lg border border-purple-700/30 text-[11px] tracking-[2px] text-[#a78bfa] hover:border-purple-500/60 transition-all disabled:opacity-40"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirm}
                disabled={uploading || !completedCrop}
                className="flex-1 py-3 rounded-lg bg-cyan-400 text-black font-bold text-[11px] tracking-[3px] disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {uploading ? "UPLOADING..." : "CONFIRM CROP →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* react-image-crop visual overrides for Neolution theme */}
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
  );
}
