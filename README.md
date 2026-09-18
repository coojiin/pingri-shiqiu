# 平日食器｜官網與點餐

靜態官網（Landing v2）與每桌／外帶 QR 點餐原型。

部署於 GitHub Pages：`https://coojiin.github.io/pingri-shiqiu/`

## 公開路徑（僅這些）

- 官網：`/`
- 點餐頁（客人）：`/order-system/order.html`
  - 內用：`/order-system/order.html?table=1`（桌 1–5，由桌上 QR 帶入）
  - 外帶：`/order-system/order.html?mode=takeout`
- 公開 stub：`/order-system/`（引導掃描 QR；可選外帶連結）

公開站**只**服務 `order.html` 與 `menu-data.js`。客人應透過桌上或櫃檯 QR 進入點餐。

## 請勿公開

廚房／桌碼／流程等**店內工具**不在本 repo，請留在私有目錄本機使用：

- `kitchen.html` — 廚房出單
- `tables.html` — 產生桌貼／櫃檯 QR
- `flow.html` — 店內流程說明

**請勿**在官網、README、或對外文件刊登上述頁面的公開 URL。

## 部署

推送 `main` 至 origin 即更新 GitHub Pages。
