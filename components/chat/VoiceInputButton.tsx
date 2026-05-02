"use client";

import { useEffect, useRef, useState } from "react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
}

// Feature-detect SpeechRecognition
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

export function VoiceInputButton({ onTranscript }: VoiceInputButtonProps) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    setSupported(true);

    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      const combined = (finalText + interimText).trim();
      if (combined) onTranscript(combined);
    };

    recog.onend = () => setRecording(false);
    recog.onerror = () => setRecording(false);

    recognitionRef.current = recog;
    return () => {
      try { recog.stop(); } catch {}
    };
  }, [onTranscript]);

  if (!supported) return null;

  const toggle = () => {
    const recog = recognitionRef.current;
    if (!recog) return;
    if (recording) {
      try { recog.stop(); } catch {}
      setRecording(false);
    } else {
      try {
        recog.start();
        setRecording(true);
      } catch {}
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={recording ? "Stop recording" : "Start voice input"}
      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all ${
        recording
          ? "bg-cyan-400/20 border border-cyan-400/60 animate-pulse"
          : "border border-purple-700/30 hover:border-cyan-400/40 hover:bg-cyan-400/5"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={recording ? "#00e5ff" : "#a78bfa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
