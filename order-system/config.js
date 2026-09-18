/**
 * 公開 GitHub Pages 備援設定。
 * 店內正式點餐請用 LAN API 主機上的 order.html（掃桌上 QR）。
 * 若之後 API 上雲，再填 apiBase，例如 "https://order-api.example.com"
 */
window.PINGRI_ORDER = {
  apiBase: "",
  orderPageBase: "",
  mode: "pages-fallback"
};
