/**
 * GitHub Pages 展示用原型設定。
 * mode: "pages-demo" — 無後端，訂單僅存在此瀏覽器 localStorage。
 * 正式營業：店內 PC 跑 pingri-order-api，再填 apiBase（例如 "http://192.168.x.x:8787"）。
 */
window.PINGRI_ORDER = {
  mode: "pages-demo",
  apiBase: "", // 未來店內主機：填區網 API 位址
  orderPageBase: "", // 空則用目前 origin + 本目錄
  demoPin: "1234",
  banner: "展示原型｜訂單僅存在此瀏覽器｜正式版需店內主機"
};
