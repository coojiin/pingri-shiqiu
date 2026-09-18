# 平日食器｜官網與點餐

靜態官網（Landing v2）部署於 GitHub Pages：`https://coojiin.github.io/pingri-shiqiu/`

## 點餐（店內 LAN 優先）

正式點餐在**店內電腦**跑 `pingri-order-api`（不在本公開 repo）：

- 客人掃 QR → `http://<店內IP>:8787/order.html?t=TOKEN`
- 店員：`/staff/kitchen.html`、`/staff/tables.html`

本站 `/order-system/` 僅備援說明：「請連店內 Wi‑Fi 後掃 QR」。  
**已停用**公開 `?table=N`、無 Token 的 `?mode=takeout`。

## 公開路徑

- 官網：`/`
- 點餐備援：`/order-system/order.html`、`config.js`、`menu-data.js`

## 請勿公開

廚房／桌碼／API（含預設 PIN）留在店內私有目錄，勿推上本 repo。

## 部署

推送 `main` 至 origin 即更新 GitHub Pages。
