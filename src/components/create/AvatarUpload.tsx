"use client";

import { useRef, useState } from "react";
import { AvatarCropDialog } from "./AvatarCropDialog";

interface AvatarUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({ currentUrl, onUploaded }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setError(null);
    if (!ACCEPT.includes(f.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Image must be under 5MB.");
      return;
    }
    setFile(f);
    setShowCrop(true);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // Reset so picking the same file again triggers change
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className="relative block rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden group"
        style={{
          borderColor: dragOver
            ? "rgba(0,229,255,0.6)"
            : currentUrl
            ? "rgba(0,229,255,0.35)"
            : "rgba(124,58,237,0.3)",
          background: dragOver
            ? "rgba(0,229,255,0.06)"
            : "rgba(10,4,24,0.5)",
          aspectRatio: "1 / 1",
          maxWidth: 220,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          onChange={onFileInput}
          className="sr-only"
        />

        {currentUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="Character avatar"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay to re-select */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span
                className="text-[10px] tracking-[3px] text-cyan-400 uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CHANGE AVATAR
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.5"
              opacity="0.7"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span
              className="text-[10px] tracking-[3px] text-cyan-400 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              UPLOAD AVATAR
            </span>
            <span
              className="text-[10px] text-[#7a6a9a]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Click or drag · JPG/PNG/WEBP · 5MB max
            </span>
          </div>
        )}
      </label>

      {!currentUrl && (
        <p
          className="mt-2 text-[10px] tracking-[2px] text-red-400/70 uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ◈ REQUIRED
        </p>
      )}

      {error && (
        <p
          className="mt-2 text-[11px] text-red-400"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {error}
        </p>
      )}

      <AvatarCropDialog
        open={showCrop}
        file={file}
        onCancel={() => {
          setShowCrop(false);
          setFile(null);
        }}
        onConfirm={(url) => {
          onUploaded(url);
          setShowCrop(false);
          setFile(null);
        }}
      />
    </div>
  );
}
