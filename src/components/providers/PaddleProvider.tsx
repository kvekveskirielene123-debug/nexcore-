"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

const PaddleCtx = createContext<Paddle | undefined>(undefined);

export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | undefined>();

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;
    const env = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
      ? "production" as const
      : "sandbox" as const;

    initializePaddle({
      environment: env,
      token,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en",
          allowLogout: false,
        },
      },
    }).then(p => { if (p) setPaddle(p); });
  }, []);

  return <PaddleCtx.Provider value={paddle}>{children}</PaddleCtx.Provider>;
}

export function usePaddle() {
  return useContext(PaddleCtx);
}
