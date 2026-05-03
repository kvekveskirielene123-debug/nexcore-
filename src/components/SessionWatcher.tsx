"use client";

import { useEffect } from "react";

// Watches for browser close/tab close when the user opted out of "stay logged in".
// The flag is written to sessionStorage after login; sessionStorage is automatically
// cleared when the tab/window is closed, so this only needs to act on the unload event.
export function SessionWatcher() {
  useEffect(() => {
    const handleUnload = () => {
      if (sessionStorage.getItem("nexcor_no_remember") !== "1") return;
      // keepalive lets the request outlive the page
      navigator.sendBeacon("/api/auth/signout-silent");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return null;
}
