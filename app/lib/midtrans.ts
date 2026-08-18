// ── Midtrans Config ──

export const midtransConfig = {
  get isProduction() {
    return process.env.MIDTRANS_IS_PRODUCTION === "true";
  },
  get serverKey() {
    return process.env.MIDTRANS_SERVER_KEY ?? "";
  },
  get clientKey() {
    return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
  },
  get apiUrl() {
    return this.isProduction
      ? "https://app.midtrans.com/snap/v1"
      : "https://app.sandbox.midtrans.com/snap/v1";
  },
  get snapUrl() {
    return this.isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
  },
};

// ── Snap Script Loader (client-side) ──

export function loadMidtransScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Client only"));
    if (typeof (window as Window & { snap?: unknown }).snap !== "undefined") return resolve();

    const script = document.createElement("script");
    script.src = midtransConfig.snapUrl;
    script.setAttribute("data-client-key", midtransConfig.clientKey);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal load Midtrans Snap"));
    document.head.appendChild(script);
  });
}
