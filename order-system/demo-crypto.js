/**
 * 展示用自描述 Token（非真實資安）。
 * 格式: d1.<base64url(JSON)>.<hmac16>
 * 任何裝置只要有 DEMO_SECRET 即可驗證，無需共享 localStorage。
 */
(function (global) {
  const DEMO_SECRET = "pingri-pages-demo-secret-v1-NOT-PRODUCTION";
  const PREFIX = "d1";
  const SIG_LEN = 16;

  function b64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function b64urlDecode(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  async function hmacHex(message) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(DEMO_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    return [...new Uint8Array(sig)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, SIG_LEN);
  }

  function randomNonce() {
    const a = new Uint8Array(6);
    crypto.getRandomValues(a);
    return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function mintToken({ kind, table }) {
    const payload = {
      v: 1,
      kind: kind === "takeout" ? "takeout" : "table",
      table: kind === "takeout" ? 0 : Number(table) || 1,
      n: randomNonce()
    };
    const body = b64urlEncode(JSON.stringify(payload));
    const sig = await hmacHex(body);
    return PREFIX + "." + body + "." + sig;
  }

  async function verifyToken(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== PREFIX) return null;
    const [, body, sig] = parts;
    const expect = await hmacHex(body);
    if (sig !== expect) return null;
    let payload;
    try {
      payload = JSON.parse(b64urlDecode(body));
    } catch {
      return null;
    }
    if (!payload || payload.v !== 1) return null;
    if (payload.kind !== "table" && payload.kind !== "takeout") return null;
    const table = payload.kind === "takeout" ? 0 : Number(payload.table);
    if (payload.kind === "table" && (!table || table < 1)) return null;
    const label = payload.kind === "takeout" ? "外帶" : "桌 " + table;
    return { kind: payload.kind, table, label, token };
  }

  function orderOriginBase() {
    const cfg = global.PINGRI_ORDER || {};
    if (cfg.orderPageBase) return cfg.orderPageBase.replace(/\/$/, "");
    const path = location.pathname.replace(/\/[^/]*$/, "");
    return location.origin + path;
  }

  function orderUrlForToken(token) {
    return orderOriginBase() + "/order.html?t=" + encodeURIComponent(token);
  }

  const TOKENS_KEY = "pingri_demo_tokens_v1";

  function loadTokenList() {
    try {
      const raw = localStorage.getItem(TOKENS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTokenList(list) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
  }

  async function rotateTokens(tableCount) {
    const n = Math.min(40, Math.max(1, Number(tableCount) || 5));
    const list = [];
    for (let i = 1; i <= n; i++) {
      const token = await mintToken({ kind: "table", table: i });
      list.push({
        token,
        kind: "table",
        table: i,
        label: "桌 " + i,
        orderUrl: orderUrlForToken(token)
      });
    }
    const tToken = await mintToken({ kind: "takeout", table: 0 });
    list.push({
      token: tToken,
      kind: "takeout",
      table: 0,
      label: "外帶",
      orderUrl: orderUrlForToken(tToken)
    });
    saveTokenList(list);
    return list;
  }

  async function ensureTokens(tableCount) {
    let list = loadTokenList();
    if (!list.length) list = await rotateTokens(tableCount || 5);
    else {
      // refresh orderUrl to current origin
      list = list.map((row) => ({
        ...row,
        orderUrl: orderUrlForToken(row.token)
      }));
      saveTokenList(list);
    }
    return list;
  }

  global.PingriDemoCrypto = {
    mintToken,
    verifyToken,
    rotateTokens,
    ensureTokens,
    loadTokenList,
    saveTokenList,
    orderUrlForToken,
    orderOriginBase,
    TOKENS_KEY,
    DEMO_PIN_FALLBACK: "1234"
  };
})(window);
