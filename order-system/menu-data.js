window.PINGRI_MENU = [
  { id: "taxiang", cat: "招牌", name: "塔香一丼", sub: "三杯雞", price: 170 },
  { id: "weixi", cat: "招牌", name: "味噌巷口", sub: "滷肉飯", price: 165 },
  { id: "congian", cat: "定食／丼", name: "蔥鹽午後", sub: "雞腿丼", price: 165 },
  { id: "maxi", cat: "定食／丼", name: "麻香紅油", sub: "豆腐丼", price: 155 },
  { id: "suanhuo", cat: "定食／丼", name: "蒜火慢烤", sub: "排骨定食", price: 190 },
  { id: "zhaoshao", cat: "定食／丼", name: "照燒厚切", sub: "豬排飯", price: 200 },
  { id: "congyou", cat: "麵／炒", name: "蔥油細浪", sub: "雞絲麵", price: 160 },
  { id: "hongshao", cat: "麵／炒", name: "紅燒湯韻", sub: "牛肉拉麵", price: 220 },
  { id: "yanchi", cat: "麵／炒", name: "蔭豉海蚵", sub: "炒烏龍", price: 220 },
  { id: "zhengyun", cat: "蒸湯", name: "蒸雲雞盅", sub: "蛋豆腐雞湯", price: 55 },
  { id: "shanshu", cat: "蒸湯", name: "山蔬竹笙盅", sub: "香菇竹笙湯", price: 60 },
  { id: "suansiang", cat: "蒸湯", name: "蒜香蛤蜊盅", sub: "蛤蜊蒸湯", price: 85 },
  { id: "tangxin", cat: "小菜", name: "半熟溏心", sub: "蛋", price: 30 },
  { id: "ziwu", cat: "小菜", name: "日常漬物", sub: "小菜", price: 30 },
  { id: "huanggua", cat: "小菜", name: "青爽黃瓜", sub: "涼拌", price: 35 },
  { id: "bento-lurou", cat: "外帶便當", name: "巷口滷肉", sub: "便當", price: 160 },
  { id: "bento-shaorou", cat: "外帶便當", name: "炭火燒肉", sub: "便當（升級）", price: 165 }
];

/**
 * 展示用訂單庫：localStorage + BroadcastChannel（同瀏覽器多頁籤同步）
 * 跨手機不同瀏覽器不會同步 —— 正式版需店內主機 API。
 */
(function (global) {
  const ORDERS_KEY = "pingri_demo_orders_v1";
  const CHANNEL = "pingri_demo_orders";
  let seq = 0;
  let pickupSeq = 100;

  function readAll() {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const data = raw ? JSON.parse(raw) : { orders: [], seq: 0, pickupSeq: 100 };
      seq = data.seq || 0;
      pickupSeq = data.pickupSeq || 100;
      return data.orders || [];
    } catch {
      return [];
    }
  }

  function writeAll(orders) {
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify({ orders, seq, pickupSeq, updatedAt: Date.now() })
    );
    try {
      if (global.__pingriOrdersBc) {
        global.__pingriOrdersBc.postMessage({ type: "orders", at: Date.now() });
      }
    } catch {}
  }

  try {
    global.__pingriOrdersBc = new BroadcastChannel(CHANNEL);
  } catch {
    global.__pingriOrdersBc = null;
  }

  function nextId() {
    seq += 1;
    const t = new Date();
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    return "D" + hh + mm + "-" + String(seq).padStart(3, "0");
  }

  function nextPickup() {
    pickupSeq = (pickupSeq % 999) + 1;
    return "T-" + String(pickupSeq).padStart(3, "0");
  }

  const listeners = new Set();

  function notify() {
    const orders = readAll();
    listeners.forEach((fn) => {
      try { fn(orders); } catch {}
    });
  }

  if (global.__pingriOrdersBc) {
    global.__pingriOrdersBc.onmessage = () => notify();
  }
  global.addEventListener("storage", (e) => {
    if (e.key === ORDERS_KEY) notify();
  });

  global.PingriOrders = {
    list() {
      return readAll().slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },
    get(id) {
      return readAll().find((o) => o.id === id) || null;
    },
    add({ kind, table, label, items, note, token }) {
      const orders = readAll();
      const total = (items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
      const order = {
        id: nextId(),
        kind: kind === "takeout" ? "takeout" : "table",
        mode: kind === "takeout" ? "takeout" : "dinein",
        table: kind === "takeout" ? 0 : Number(table) || 0,
        label: label || (kind === "takeout" ? "外帶" : "桌 " + table),
        items: items || [],
        note: note || "",
        total,
        status: "pending",
        pickupCode: kind === "takeout" ? nextPickup() : null,
        token: token || "",
        createdAt: Date.now()
      };
      orders.unshift(order);
      writeAll(orders);
      notify();
      return order;
    },
    update(id, patch) {
      const orders = readAll();
      const i = orders.findIndex((o) => o.id === id);
      if (i < 0) return null;
      if (patch.status === "remove") {
        orders.splice(i, 1);
        writeAll(orders);
        notify();
        return null;
      }
      orders[i] = { ...orders[i], ...patch, updatedAt: Date.now() };
      writeAll(orders);
      notify();
      return orders[i];
    },
    callStaff({ orderId, kind, table, label, token }) {
      if (orderId) {
        const o = this.update(orderId, { status: "call" });
        if (o) return o;
      }
      return this.add({
        kind: kind || "table",
        table,
        label: (label || "桌 " + table) + " · 叫店員",
        items: [{ id: "call", name: "叫店員", sub: "服務鈴", price: 0, qty: 1 }],
        note: "客人呼叫",
        token
      });
    },
    clearAll() {
      seq = 0;
      pickupSeq = 100;
      writeAll([]);
      notify();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
})(window);
