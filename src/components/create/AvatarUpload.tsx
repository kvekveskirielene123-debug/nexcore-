"use client";

import { useRef, useState } from "react";
import { AvatarCropDialog } from "./AvatarCropDialog";

interface AvatarUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  error?: string;
}

const MAX_SIZE = 20 * 1024 * 1024;

export function AvatarUpload({ currentUrl, onUploaded, error }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFileError(null);
    if (!f.type.startsWith("image/")) { setFileError("Please upload an image file."); return; }
    if (f.size > MAX_SIZE) { setFileError("Image must be under 20MB."); return; }
    setFile(f);
    setShowCrop(true);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const accentColor = error ? "rgba(248,113,113,0.5)" : dragOver ? "rgba(0,229,255,0.8)" : currentUrl ? "rgba(0,229,255,0.4)" : "rgba(124,58,237,0.28)";
  const cornerColor = dragOver ? "rgba(0,229,255,0.95)" : "rgba(0,229,255,0.45)";

  return (
    <div>
      <label className="relative block cursor-pointer select-none">
        <input ref={inputRef} type="file" accept="image/*" onChange={onFileInput} className="sr-only" />

        <div
          className="group relative rounded-xl overflow-hidden transition-all duration-300"
          style={{
            aspectRatio: "1/1",
            background: currentUrl ? "transparent" : "rgba(5,2,13,0.92)",
            border: `1px solid ${accentColor}`,
            boxShadow: dragOver
              ? "0 0 52px rgba(0,229,255,0.2), inset 0 0 28px rgba(0,229,255,0.05)"
              : currentUrl
              ? "0 4px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.06)"
              : "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {/* Corner brackets */}
          {(["tl","tr","bl","br"] as const).map((c) => (
            <div
              key={c}
              className="absolute pointer-events-none transition-all duration-300"
              style={{
                top: c[0] === "t" ? 6 : "auto",
                bottom: c[0] === "b" ? 6 : "auto",
                left: c[1] === "l" ? 6 : "auto",
                right: c[1] === "r" ? 6 : "auto",
                width: 14,
                height: 14,
                borderTop: c[0] === "t" ? `1.5px solid ${cornerColor}` : "none",
                borderBottom: c[0] === "b" ? `1.5px solid ${cornerColor}` : "none",
                borderLeft: c[1] === "l" ? `1.5px solid ${cornerColor}` : "none",
                borderRight: c[1] === "r" ? `1.5px solid ${cornerColor}` : "none",
              }}
            />
          ))}

          {currentUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentUrl} alt="Character avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(5,2,13,0.78)" }}>
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 44, height: 44, background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.5)", boxShadow: "0 0 20px rgba(0,229,255,0.2)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <span className="text-[9px] tracking-[3px] uppercase" style={{ fontFamily: "var(--font-mono)", color: "#00e5ff", textShadow: "0 0 12px rgba(0,229,255,0.6)" }}>
                  REPLACE
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5">
              <div
                className="flex items-center justify-center rounded-xl transition-all duration-300"
                style={{
                  width: 52, height: 52,
                  background: dragOver ? "rgba(0,229,255,0.1)" : "rgba(124,58,237,0.07)",
                  border: `1px solid ${dragOver ? "rgba(0,229,255,0.55)" : "rgba(124,58,237,0.22)"}`,
                  boxShadow: dragOver ? "0 0 20px rgba(0,229,255,0.2)" : "none",
                }}
              >
                <svg
                  width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke={dragOver ? "#00e5ff" : "rgba(124,58,237,0.55)"}
                  strokeWidth="1.6" strokeLinecap="round"
                  style={{ transition: "stroke 0.3s" }}
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] tracking-[3px] uppercase" style={{
                  fontFamily: "var(--font-mono)",
                  color: dragOver ? "#00e5ff" : "rgba(0,229,255,0.5)",
                  textShadow: dragOver ? "0 0 16px rgba(0,229,255,0.6)" : "none",
                  transition: "all 0.3s",
                }}>
                  {dragOver ? "DROP TO UPLOAD" : "UPLOAD AVATAR"}
                </p>
                <p className="text-[9px]" style={{ fontFamily: "var(--font-body)", color: "rgba(122,106,154,0.4)" }}>
                  Click or drag · 20MB max
                </p>
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1 h-1 rounded-full" style={{
                  background: error ? "#f87171" : "rgba(124,58,237,0.5)",
                  boxShadow: error ? "0 0 6px rgba(248,113,113,0.6)" : "none",
                }} />
                <span className="text-[8px] tracking-[2.5px] uppercase" style={{
                  fontFamily: "var(--font-mono)",
                  color: error ? "rgba(248,113,113,0.7)" : "rgba(90,74,122,0.45)",
                }}>
                  REQUIRED
                </span>
              </div>
            </div>
          )}
        </div>
      </label>

      {fileError && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400" style={{ fontFamily: "var(--font-body)" }}>
          <span>◈</span> {fileError}
        </p>
      )}

      <AvatarCropDialog
        open={showCrop}
        file={file}
        onCancel={() => { setShowCrop(false); setFile(null); }}
        onConfirm={(url) => { onUploaded(url); setShowCrop(false); setFile(null); }}
      />
    </div>
  );
}
