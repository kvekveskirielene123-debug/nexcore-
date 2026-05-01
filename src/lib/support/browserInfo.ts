// Detects browser name + version + OS from navigator.userAgent.
// Runs in the browser only (don't import from server components).

export interface BrowserInfo {
  browser: string;   // e.g. "Chrome 127"
  os: string;        // e.g. "macOS"
  ua: string;        // raw userAgent, for debugging
}

export function detectBrowserInfo(): BrowserInfo {
  if (typeof navigator === "undefined") {
    return { browser: "unknown", os: "unknown", ua: "" };
  }

  const ua = navigator.userAgent;
  let browser = "unknown";
  let os = "unknown";

  // Browser detection (order matters — more specific first)
  if (/edg\//i.test(ua)) {
    const m = ua.match(/edg\/([\d.]+)/i);
    browser = m ? `Edge ${m[1].split(".")[0]}` : "Edge";
  } else if (/firefox\//i.test(ua)) {
    const m = ua.match(/firefox\/([\d.]+)/i);
    browser = m ? `Firefox ${m[1].split(".")[0]}` : "Firefox";
  } else if (/opr\/|opera/i.test(ua)) {
    const m = ua.match(/(opr|opera)\/([\d.]+)/i);
    browser = m ? `Opera ${m[2].split(".")[0]}` : "Opera";
  } else if (/chrome\//i.test(ua) && !/edg|opr/i.test(ua)) {
    const m = ua.match(/chrome\/([\d.]+)/i);
    browser = m ? `Chrome ${m[1].split(".")[0]}` : "Chrome";
  } else if (/safari\//i.test(ua) && /version\//i.test(ua)) {
    const m = ua.match(/version\/([\d.]+)/i);
    browser = m ? `Safari ${m[1].split(".")[0]}` : "Safari";
  }

  // OS detection
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser: `${browser} on ${os}`, os, ua };
}
