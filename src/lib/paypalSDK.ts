declare global {
  interface Window { paypal?: any; }
}

let _promise: Promise<void> | null = null;

export function preloadPayPalSDK(): void {
  if (typeof window !== "undefined") getPayPalSDK().catch(() => {});
}

export function getPayPalSDK(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.paypal) return Promise.resolve();
  if (_promise) return _promise;

  _promise = new Promise<void>((resolve, reject) => {
    if (document.getElementById("nx-paypal-sdk")) {
      const t = setInterval(() => { if (window.paypal) { clearInterval(t); resolve(); } }, 50);
      setTimeout(() => { clearInterval(t); _promise = null; reject(new Error("PayPal timed out")); }, 15_000);
      return;
    }
    const s = document.createElement("script");
    s.id = "nx-paypal-sdk";
    s.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&intent=capture&components=buttons`;
    s.async = true;
    s.onload  = () => resolve();
    s.onerror = () => { _promise = null; reject(new Error("Failed to load PayPal")); };
    document.head.appendChild(s);
  });

  return _promise;
}
