# 平日食器｜官網與點餐

靜態官網（Landing v2）部署於 GitHub Pages：`https://coojiin.github.io/pingri-shiqiu/`

## 點餐

### 展示用原型（目前公開）

`/order-system/` 為 **Pages 客戶端展示原型**（localStorage + 自描述 Token），給店長驗收 UI／流程：

- 展示中心：`/order-system/`
- 客人：`/order-system/order.html?t=TOKEN`
- 桌碼 QR：`/order-system/tables.html`（PIN 1234）
- 廚房：`/order-system/kitchen.html`（PIN 1234）
- 流程說明：`/order-system/flow.html`

**限制：** 訂單只存在該瀏覽器；跨手機不同步。頁首皆標「展示原型｜訂單僅存在此瀏覽器｜正式版需店內主機」。

### 正式版（店內主機）

正式點餐在**店內電腦**跑私有專案 `pingri-order-api`（不在本公開 repo）：

- 客人掃 QR → `http://<店內IP>:8787/order.html?t=TOKEN`
- 店員：`/staff/kitchen.html`、`/staff/tables.html`
- 多裝置即時同步需此 API

本站 `config.js` 的 `mode: "pages-demo"`；之後若 API 上雲／店內，可改 `apiBase`。

## 公開路徑

- 官網：`/`
- 點餐展示：`/order-system/`（index / order / tables / kitchen / flow）

## 請勿公開

`.env`、真實 PIN／金鑰、店內 API 私有目錄勿推上本 repo。展示 PIN `1234` 僅前端常數。

## 部署

推送 `main` 至 origin 即更新 GitHub Pages。
