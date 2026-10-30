/**
 * ⚔️ GALAXY ZONE: GOD OF WAR EDITION ⚔️
 * Version: 4.0.0 (Ultimate Spartan)
 *
 * This Worker serves a highly optimized Single Page Application (PWA).
 * Architecture: Server-Side Rendering (SSR) Shell + Client-Side Hydration.
 * Tech Stack: Vanilla JS (ES6+), Three.js, CSS3 Variables.
 *
 * FEATURES:
 * - 3D Interactive Background (Three.js)
 * - Event-Driven Architecture
 * - Persistent Cart & Wishlist (LocalStorage)
 * - Advanced Filtering & Search
 * - Fully Responsive & Touch Optimized
 */

// the legacy PWA routes to enable D1-powered admin tooling.

const CONFIG = {
  ADMIN_USERNAME: "Sardar",
  ADMIN_PASSWORD: "Sardar2266",
  ADMIN_SESSION_COOKIE: "admin_session",
  SESSION_VALUE: "galaxyzone-admin",
  COOKIE_MAX_AGE: 60 * 60 * 24, // 1 day
  DEFAULT_META_DESCRIPTION: "فروش ویژه بازی‌ها و اکانت‌های PS4/PS5 با تحویل فوری و ضمانت.",
};

const PLATFORM_CAPACITY_MATRIX = [
  { platform: "PS4", capacity: 1 },
  { platform: "PS4", capacity: 2 },
  { platform: "PS4", capacity: 3 },
  { platform: "PS5", capacity: 1 },
  { platform: "PS5", capacity: 2 },
  { platform: "PS5", capacity: 3 },
];

// Example wrangler.toml binding for D1 (comment only, keep env.DB)
// [[d1_databases]]
// binding = "DB"
// database_name = "games-db"
// database_id = "<your-database-id>"

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      ...SECURITY_HEADERS,
      ...headers,
    },
  });
}

function htmlResponse(html, status = 200, headers = {}) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html;charset=UTF-8", ...SECURITY_HEADERS, ...headers },
  });
}

function redirectResponse(location, status = 302, headers = {}) {
  return new Response(null, {
    status,
    headers: { Location: location, ...headers },
  });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }).filter(([k]) => k)
  );
  return cookies[name];
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}

function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("fa-IR");
}

function truncate(text, length = 80) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function parseBoolean(input) {
  if (typeof input === "boolean") return input;
  if (typeof input === "number") return Boolean(input);
  if (typeof input === "string") {
    return ["1", "true", "on", "yes"].includes(input.toLowerCase());
  }
  return false;
}

async function parseFormData(request) {
  const formData = await request.formData();
  const obj = {};
  for (const [key, value] of formData.entries()) {
    obj[key] = value;
  }
  return obj;
}

// ============================================================
// SECTION 1: DATABASE LAYER (D1 helpers)
// ============================================================

async function getAllGames(env, filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.region) {
    conditions.push("region = ?");
    params.push(filters.region);
  }
  if (filters.is_plus !== undefined) {
    conditions.push("is_plus = ?");
    params.push(filters.is_plus ? 1 : 0);
  }
  if (filters.active !== undefined) {
    conditions.push("active = ?");
    params.push(filters.active ? 1 : 0);
  }
  if (filters.title) {
    conditions.push("title LIKE ?");
    params.push(`%${filters.title}%`);
  }
  if (filters.platform) {
    conditions.push(
      "EXISTS (SELECT 1 FROM game_variants gv WHERE gv.game_id = games.id AND gv.platform = ?" +
        (filters.includeInactiveVariants ? ")" : " AND gv.is_active = 1)")
    );
    params.push(filters.platform);
  }
  if (filters.capacity) {
    conditions.push(
      "EXISTS (SELECT 1 FROM game_variants gv WHERE gv.game_id = games.id AND gv.capacity = ?" +
        (filters.includeInactiveVariants ? ")" : " AND gv.is_active = 1)")
    );
    params.push(filters.capacity);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const stmt = env.DB.prepare(`SELECT * FROM games ${where} ORDER BY id DESC`);
  const result = await stmt.bind(...params).all();
  return result.results || [];
}

async function getVariantsForGames(env, gameIds, { includeInactive = false } = {}) {
  if (!gameIds || gameIds.length === 0) return {};
  const placeholders = gameIds.map(() => "?").join(",");
  const activeClause = includeInactive ? "" : "AND is_active = 1";
  const stmt = env.DB.prepare(
    `SELECT * FROM game_variants WHERE game_id IN (${placeholders}) ${activeClause} ORDER BY platform, capacity`
  );
  const result = await stmt.bind(...gameIds).all();
  const map = {};
  for (const row of result.results || []) {
    map[row.game_id] = map[row.game_id] || [];
    map[row.game_id].push(row);
  }
  return map;
}

async function upsertGameVariant(env, variant) {
  const stmt = env.DB.prepare(`
    INSERT INTO game_variants (game_id, platform, capacity, price, old_price, stock, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(game_id, platform, capacity) DO UPDATE SET
      price = excluded.price,
      old_price = excluded.old_price,
      stock = excluded.stock,
      is_active = excluded.is_active
  `);
  await stmt
    .bind(
      variant.game_id,
      variant.platform,
      variant.capacity,
      variant.price,
      variant.old_price || null,
      variant.stock ?? 0,
      variant.is_active ? 1 : 0
    )
    .run();
}

async function upsertGameVariantsBatch(env, variants = []) {
  if (!variants.length) return;
  const statement = (v) =>
    env.DB.prepare(`
      INSERT INTO game_variants (game_id, platform, capacity, price, old_price, stock, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(game_id, platform, capacity) DO UPDATE SET
        price = excluded.price,
        old_price = excluded.old_price,
        stock = excluded.stock,
        is_active = excluded.is_active
    `).bind(v.game_id, v.platform, v.capacity, v.price, v.old_price || null, v.stock ?? 0, v.is_active ? 1 : 0);

  await env.DB.batch(variants.map(statement));
}

async function getGameById(env, id) {
  const stmt = env.DB.prepare("SELECT * FROM games WHERE id = ? LIMIT 1");
  const result = await stmt.bind(id).first();
  return result || null;
}

async function createGame(env, payload) {
  const data = payload.game || payload;
  const variants = payload.variants || [];
  const summary = summarizeVariants(variants);
  const anchorVariant = summary.cheapest || variants[0] || { platform: data.platform || "PS4", capacity: 1, price: 0 };
  const totalStock = summary.totalStock ?? data.stock ?? 0;
  const stmt = env.DB.prepare(`
    INSERT INTO games (
      title, platform, region, capacity, is_plus, price, stock, active,
      image_url, description, seo_title, seo_description, seo_tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = await stmt.bind(
    data.title,
    data.platform || anchorVariant.platform,
    data.region,
    data.capacity ?? anchorVariant.capacity,
    data.is_plus ? 1 : 0,
    data.price ?? anchorVariant.price,
    totalStock,
    data.active ? 1 : 0,
    data.image_url || null,
    data.description || null,
    data.seo_title || null,
    data.seo_description || null,
    data.seo_tags || null,
  ).run();
  const gameId = result.meta?.last_row_id;
  if (gameId) {
    await upsertGameVariantsBatch(env, variants.map((v) => ({ ...v, game_id: gameId })));
  }
}

async function updateGame(env, id, payload) {
  const data = payload.game || payload;
  const variants = payload.variants || [];
  const summary = summarizeVariants(variants);
  const anchorVariant = summary.cheapest || variants[0] || { platform: data.platform || "PS4", capacity: 1, price: 0 };
  const totalStock = summary.totalStock ?? data.stock ?? 0;
  const stmt = env.DB.prepare(`
    UPDATE games SET
      title = ?, platform = ?, region = ?, capacity = ?, is_plus = ?, price = ?,
      stock = ?, active = ?, image_url = ?, description = ?, seo_title = ?,
      seo_description = ?, seo_tags = ?
    WHERE id = ?
  `);
  await stmt.bind(
    data.title,
    data.platform || anchorVariant.platform,
    data.region,
    data.capacity ?? anchorVariant.capacity,
    data.is_plus ? 1 : 0,
    data.price ?? anchorVariant.price,
    totalStock,
    data.active ? 1 : 0,
    data.image_url || null,
    data.description || null,
    data.seo_title || null,
    data.seo_description || null,
    data.seo_tags || null,
    id,
  ).run();
  await upsertGameVariantsBatch(env, variants.map((v) => ({ ...v, game_id: Number(id) })));
}

async function softDeleteGame(env, id) {
  const stmt = env.DB.prepare("UPDATE games SET active = 0 WHERE id = ?");
  await stmt.bind(id).run();
}

async function updateStock(env, id, newStock) {
  const stmt = env.DB.prepare("UPDATE games SET stock = ? WHERE id = ?");
  await stmt.bind(newStock, id).run();
}

async function restoreGame(env, id) {
  const stmt = env.DB.prepare("UPDATE games SET active = 1 WHERE id = ?");
  await stmt.bind(id).run();
}

async function hardDeleteGame(env, id) {
  // Cascade: remove variants first so no orphan pricing rows are left behind.
  await env.DB.prepare("DELETE FROM game_variants WHERE game_id = ?").bind(id).run();
  const stmt = env.DB.prepare("DELETE FROM games WHERE id = ?");
  await stmt.bind(id).run();
}

async function getDashboardSummary(env) {
  const gameAggregate =
    (await env.DB.prepare(
      `SELECT
        COUNT(*) AS total_games,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active_games,
        SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactive_games,
        SUM(CASE WHEN is_plus = 1 THEN 1 ELSE 0 END) AS plus_games
      FROM games`
    ).first()) || {};

  const variantAggregate =
    (await env.DB.prepare(
      `SELECT
        SUM(stock) AS total_stock,
        SUM(price * stock) AS inventory_value,
        SUM(CASE WHEN stock <= 3 THEN 1 ELSE 0 END) AS low_stock_games,
        MIN(price) AS min_price,
        MAX(price) AS max_price,
        ROUND(AVG(price), 0) AS avg_price
      FROM game_variants
      WHERE is_active = 1`
    ).first()) || {};

  const recent = await env.DB.prepare(
    `SELECT g.id, g.title, MIN(gv.price) AS price, SUM(gv.stock) AS stock, g.active
     FROM games g
     LEFT JOIN game_variants gv ON gv.game_id = g.id AND gv.is_active = 1
     GROUP BY g.id
     ORDER BY g.id DESC
     LIMIT 6`
  ).all();

  const platformBreakdown = await env.DB.prepare(
    `SELECT
      platform,
      COUNT(*) AS total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active,
      SUM(stock) AS stock
    FROM game_variants
    GROUP BY platform`
  ).all();

  return {
    total_games: gameAggregate.total_games || 0,
    active_games: gameAggregate.active_games || 0,
    inactive_games: gameAggregate.inactive_games || 0,
    plus_games: gameAggregate.plus_games || 0,
    total_stock: variantAggregate.total_stock || 0,
    inventory_value: variantAggregate.inventory_value || 0,
    low_stock_games: variantAggregate.low_stock_games || 0,
    min_price: variantAggregate.min_price || 0,
    max_price: variantAggregate.max_price || 0,
    avg_price: variantAggregate.avg_price || 0,
    recent_games: recent.results || [],
    platform_breakdown: platformBreakdown.results || [],
  };
}

// ============================================================
// SECTION 2: SERVICE / BUSINESS LOGIC
// ============================================================

function normalizeGamePayload(data) {
  if (!data.title) throw new Error("Missing required field: title");
  if (!data.region) throw new Error("Missing required field: region");

  const variants = PLATFORM_CAPACITY_MATRIX.map(({ platform, capacity }) => {
    const rawPrice = data[`variant_price_${platform}_${capacity}`];
    const price = Number(rawPrice);
    const stock = Number(data[`variant_stock_${platform}_${capacity}`]);
    // A variant without a positive price is not for sale: auto-inactivate so it
    // can never hijack the anchor (cheapest) price with a zero.
    const hasPrice = rawPrice !== undefined && rawPrice !== "" && !Number.isNaN(price) && price > 0;
    const is_active = hasPrice ? parseBoolean(data[`variant_active_${platform}_${capacity}`] ?? true) : false;
    return {
      platform,
      capacity,
      price: Number.isNaN(price) ? 0 : price,
      old_price: null,
      stock: Number.isNaN(stock) ? 0 : stock,
      is_active,
    };
  });

  const summary = summarizeVariants(variants);
  const anchorVariant = summary.cheapest || variants[0];
  const totalStock = summary.totalStock || 0;

  return {
    game: {
      title: data.title,
      platform: anchorVariant.platform,
      region: data.region,
      capacity: anchorVariant.capacity,
      is_plus: parseBoolean(data.is_plus),
      price: anchorVariant.price,
      old_price: null,
      stock: totalStock,
      active: parseBoolean(data.active ?? true),
      image_url: data.image_url || "",
      description: data.description || "",
      seo_title: data.seo_title || data.title,
      seo_description: data.seo_description || data.description || CONFIG.DEFAULT_META_DESCRIPTION,
      seo_tags: data.seo_tags || "",
    },
    variants,
  };
}

function summarizeVariants(variants = []) {
  if (!variants.length) {
    return { totalStock: 0, cheapest: null };
  }
  const active = variants.filter((v) => parseBoolean(v.is_active) !== false);
  const pool = active.length ? active : variants;
  let cheapest = pool[0];
  let totalStock = 0;
  for (const v of pool) {
    if (v.price < cheapest.price) cheapest = v;
    totalStock += Number(v.stock || 0);
  }
  return { totalStock, cheapest };
}

async function listPublicGames(env, filters = {}) {
  const games = await getAllGames(env, { ...filters, active: true });
  const variantsMap = await getVariantsForGames(env, games.map((g) => g.id));
  return games.map((g) => {
    const variants = (variantsMap[g.id] || []).map((v) => ({ ...v, is_active: Boolean(v.is_active) }));
    const summary = summarizeVariants(variants);
    const cheapestPrice = summary.cheapest?.price ?? g.price ?? 0;
    const cheapestPlatform = summary.cheapest?.platform ?? g.platform;
    const cheapestCapacity = summary.cheapest?.capacity ?? g.capacity;
    const totalStock = summary.totalStock || g.stock || 0;
    return {
      ...g,
      platform: cheapestPlatform,
      capacity: cheapestCapacity,
      price: cheapestPrice,
      stock: totalStock,
      variants: variants.filter((v) => v.is_active),
      is_plus: Boolean(g.is_plus),
      out_of_stock: Number(totalStock) <= 0,
      display_price: formatPrice(cheapestPrice),
      seo_title: g.seo_title || g.title,
      seo_description: g.seo_description || g.description || CONFIG.DEFAULT_META_DESCRIPTION,
    };
  });
}

async function listAdminGames(env, filters = {}) {
  const games = await getAllGames(env, filters);
  const variantsMap = await getVariantsForGames(env, games.map((g) => g.id), {
    includeInactive: true,
  });
  return games.map((g) => {
    const variants = variantsMap[g.id] || [];
    const summary = summarizeVariants(variants);
    const cheapestPrice = summary.cheapest?.price ?? g.price ?? 0;
    const totalStock = summary.totalStock || g.stock || 0;
    return {
      ...g,
      price: cheapestPrice,
      stock: totalStock,
      variants,
      is_plus: Boolean(g.is_plus),
    };
  });
}

async function createGameFromForm(env, request) {
  const payload = normalizeGamePayload(await parseFormData(request));
  await createGame(env, payload);
}

async function updateGameFromForm(env, id, request) {
  const payload = normalizeGamePayload(await parseFormData(request));
  await updateGame(env, id, payload);
}

// ============================================================
// SECTION 3: AUTHENTICATION LAYER
// ============================================================

function isAuthenticated(request) {
  const cookie = getCookie(request, CONFIG.ADMIN_SESSION_COOKIE);
  return cookie === CONFIG.SESSION_VALUE;
}

async function handleLogin(request) {
  if (request.method !== "POST") return null;
  const data = await parseFormData(request);
  if (data.username === CONFIG.ADMIN_USERNAME && data.password === CONFIG.ADMIN_PASSWORD) {
    const cookie = serializeCookie(CONFIG.ADMIN_SESSION_COOKIE, CONFIG.SESSION_VALUE, {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      maxAge: CONFIG.COOKIE_MAX_AGE,
    });
    return redirectResponse("/admin", 302, { "Set-Cookie": cookie });
  }
  return htmlResponse(renderAdminLoginPage("نام کاربری یا رمز عبور اشتباه است"), 401);
}

function handleLogout() {
  const cookie = serializeCookie(CONFIG.ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0, secure: true });
  return redirectResponse("/admin/login", 302, { "Set-Cookie": cookie });
}

// ============================================================
// SECTION 4: HTML RENDER HELPERS (Pro UI Kit)
// Design system: shared tokens, RTL Persian typography, icons,
// public storefront shell and admin shell. API-first: every page
// is rendered from the same service layer that powers /games and
// /admin/api/* JSON endpoints.
// ============================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNumber(value) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "۰";
  return num.toLocaleString("fa-IR");
}

function escapeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

// --- Inline SVG icon set (stroke-based, inherits currentColor) ---
const ICONS = {
  gamepad: `<path d="M6 12h4M8 10v4"/><circle cx="15.5" cy="11" r="0.8" fill="currentColor" stroke="none"/><circle cx="18" cy="13.5" r="0.8" fill="currentColor" stroke="none"/><path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59c-.24 2.13-.51 4.6-.66 6.36A3 3 0 0 0 5 18.1a3.2 3.2 0 0 0 2.63-1.28l.83-1.13h7.08l.83 1.13A3.2 3.2 0 0 0 19 18.1a3 3 0 0 0 2.96-3.15c-.15-1.76-.42-4.23-.66-6.36A4 4 0 0 0 17.32 5Z"/>`,
  search: `<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>`,
  store: `<path d="M4 8.5 6 4h12l2 4.5"/><path d="M4 8.5h16V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5Z"/><path d="M9.5 20v-5.5h5V20"/>`,
  shield: `<path d="M12 3 5 6v5c0 4.5 3 8.4 7 10 4-1.6 7-5.5 7-10V6l-7-3Z"/><path d="m9.5 12 1.8 1.8 3.5-3.7"/>`,
  star: `<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>`,
  box: `<path d="M21 8.5v7a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 15.5v-7a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4a2 2 0 0 1 1 1.73Z"/><path d="m3.3 7.5 8.7 5 8.7-5"/><path d="M12 21.5v-9"/>`,
  coins: `<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.66 2.69 3 6 3s6-1.34 6-3V7"/><path d="M9 15v3c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/><path d="M15 5.5c3.6.3 6 1.4 6 2.5v5"/>`,
  wallet: `<path d="M20 8V6.5A1.5 1.5 0 0 0 18.5 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-1"/><path d="M21 8.5h-5a2.5 2.5 0 0 0 0 5h5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5Z"/>`,
  alert: `<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r="0.7" fill="currentColor" stroke="none"/>`,
  code: `<path d="m8 8-4.5 4L8 16"/><path d="m16 8 4.5 4L16 16"/><path d="m13 5-2.5 14"/>`,
  pencil: `<path d="M14.5 5.5 18 9"/><path d="M4 20l1-4.5L16.5 4a1.4 1.4 0 0 1 2 0L21 6.5a1.4 1.4 0 0 1 0 2L9.5 20 4 20Z"/>`,
  trash: `<path d="M4 6h16"/><path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6"/><path d="M6.5 6 7 19a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9l.5-13"/><path d="M10 10.5v6M14 10.5v6"/>`,
  rotate: `<path d="M3.5 8A9.5 9.5 0 1 1 3 13.5"/><path d="M3 3.5V8h4.5"/>`,
  power: `<path d="M12 3v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>`,
  check: `<path d="m4.5 12.5 5 5L20 7"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  lock: `<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>`,
  arrow: `<path d="m11 5-7 7 7 7"/><path d="M4 12h16"/>`,
  zap: `<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>`,
  tag: `<path d="m3 11 9-8h8.5v8.5L12 20a2 2 0 0 1-2.8 0l-6.2-6a2 2 0 0 1 0-3Z"/><circle cx="16" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>`,
  image: `<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m3.5 17.5 5-5 4 4 3.5-3.5 4.5 4.5"/>`,
  filter: `<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>`,
  chart: `<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>`,
  eye: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>`,
  "eye-off": `<path d="M3 3l18 18"/><path d="M10.6 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.5 17.5 0 0 1-2.2 3.1"/><path d="M6.6 6.6A16.8 16.8 0 0 0 2.5 12S6 18.5 12 18.5a9.9 9.9 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>`,
  cart: `<circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h3l2.5 12h10l2.5-9H7"/>`,
  external: `<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V6.5A1.5 1.5 0 0 1 5.5 5H10"/>`,
};

function icon(name, size = 20) {
  const path = ICONS[name] || ICONS.gamepad;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

// --- Shared design tokens + primitive styles (public & admin) ---
const BASE_STYLES = `
  :root {
    --bg: #060a17;
    --bg-soft: #0a1024;
    --surface: #0e1531;
    --surface-2: #131c40;
    --border: #223059;
    --border-soft: #1a2450;
    --text: #edf1fd;
    --text-muted: #97a3c9;
    --primary: #4f8bff;
    --accent: #8b5cf6;
    --cyan: #43e5ff;
    --success: #2fd571;
    --warning: #f5a524;
    --danger: #f04b4b;
    --plus: #f055b4;
    --radius-sm: 10px;
    --radius: 14px;
    --radius-lg: 20px;
    --shadow-sm: 0 2px 12px rgba(2, 6, 18, 0.4);
    --shadow: 0 16px 44px rgba(2, 6, 18, 0.5);
    --grad-brand: linear-gradient(135deg, #4f8bff 0%, #8b5cf6 55%, #43e5ff 130%);
    --font: 'Vazirmatn', 'Segoe UI', Tahoma, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    line-height: 1.75;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background:
      radial-gradient(52rem 30rem at 85% -10%, rgba(139, 92, 246, 0.14), transparent 60%),
      radial-gradient(44rem 28rem at 0% 0%, rgba(79, 139, 255, 0.12), transparent 55%),
      radial-gradient(40rem 30rem at 50% 120%, rgba(67, 229, 255, 0.07), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
  body > * { position: relative; z-index: 1; }
  img { max-width: 100%; display: block; }
  a { color: var(--cyan); text-decoration: none; transition: color 0.15s ease; }
  a:hover { color: #8ceeff; }
  h1, h2, h3 { line-height: 1.4; margin: 0 0 10px 0; }
  .container { max-width: 1200px; margin-inline: auto; padding-inline: 18px; }
  .muted { color: var(--text-muted); font-size: 13px; }
  .grad-text {
    background: var(--grad-brand);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .icon { flex-shrink: 0; vertical-align: middle; }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    background: var(--primary);
    color: #fff;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    white-space: nowrap;
  }
  .btn:hover { transform: translateY(-1px); color: #fff; box-shadow: 0 8px 24px rgba(79, 139, 255, 0.35); }
  .btn:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
    outline: 2px solid var(--cyan);
    outline-offset: 2px;
  }
  .btn--accent { background: var(--accent); }
  .btn--accent:hover { box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35); }
  .btn--danger { background: var(--danger); }
  .btn--danger:hover { box-shadow: 0 8px 24px rgba(240, 75, 75, 0.3); }
  .btn--ghost {
    background: rgba(79, 139, 255, 0.08);
    border-color: rgba(79, 139, 255, 0.4);
    color: #bcd4ff;
  }
  .btn--ghost:hover { background: rgba(79, 139, 255, 0.16); box-shadow: none; color: #dbe8ff; }
  .btn--danger-ghost {
    background: rgba(240, 75, 75, 0.08);
    border-color: rgba(240, 75, 75, 0.35);
    color: #ffb1b1;
  }
  .btn--danger-ghost:hover { background: rgba(240, 75, 75, 0.16); box-shadow: none; color: #ffd3d3; }
  .btn--sm { padding: 6px 12px; font-size: 12.5px; border-radius: 9px; }
  .btn--block { width: 100%; }
  .btn[disabled] { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* Chips & badges */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(151, 163, 201, 0.1);
    border: 1px solid rgba(151, 163, 201, 0.22);
    color: #c6d0ef;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.7;
  }
  .chip--platform { background: rgba(67, 229, 255, 0.09); border-color: rgba(67, 229, 255, 0.3); color: #8ceeff; direction: ltr; }
  .chip--capacity { background: rgba(139, 92, 246, 0.12); border-color: rgba(139, 92, 246, 0.35); color: #cbb6ff; }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.7;
  }
  .badge--success { background: rgba(47, 213, 113, 0.14); border: 1px solid rgba(47, 213, 113, 0.35); color: #7fe9ab; }
  .badge--danger { background: rgba(240, 75, 75, 0.14); border: 1px solid rgba(240, 75, 75, 0.4); color: #ffa1a1; }
  .badge--warning { background: rgba(245, 165, 36, 0.13); border: 1px solid rgba(245, 165, 36, 0.4); color: #ffd48a; }
  .badge--plus {
    background: linear-gradient(120deg, rgba(240, 85, 180, 0.2), rgba(139, 92, 246, 0.2));
    border: 1px solid rgba(240, 85, 180, 0.45);
    color: #ffa8dc;
  }
  .badge--ghost { background: rgba(151, 163, 201, 0.08); border: 1px dashed var(--border); color: var(--text-muted); }

  /* Forms */
  label { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; font-weight: 600; font-size: 13px; color: #c9d3f2; }
  input, select, textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: rgba(10, 16, 36, 0.8);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  input::placeholder, textarea::placeholder { color: #5e6c96; }
  input:focus, select:focus, textarea:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(79, 139, 255, 0.18); }
  input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }
  textarea { min-height: 90px; resize: vertical; }
  select { cursor: pointer; }
  input[dir="ltr"], textarea[dir="ltr"], code { direction: ltr; text-align: left; }

  .alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    background: rgba(245, 165, 36, 0.08);
    border: 1px solid rgba(245, 165, 36, 0.35);
    color: #ffd48a;
    margin: 12px 0;
    font-size: 14px;
  }
  .alert--error { background: rgba(240, 75, 75, 0.09); border-color: rgba(240, 75, 75, 0.4); color: #ffb1b1; }
  .divider { border-top: 1px solid var(--border-soft); margin: 16px 0; opacity: 0.7; }

  /* Cards */
  .card {
    background: linear-gradient(165deg, var(--surface-2), var(--surface) 65%);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-sm);
  }
  .card--glow { box-shadow: 0 0 0 1px rgba(79, 139, 255, 0.18), var(--shadow); }
  .card h3 { margin-top: 0; }

  /* Stat cards */
  .stat-card {
    background: linear-gradient(165deg, var(--surface-2), var(--surface) 70%);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }
  .stat-card::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--grad-brand);
    opacity: 0.75;
  }
  .stat-card__head { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 12.5px; font-weight: 700; }
  .stat-card__head .icon { color: var(--primary); }
  .stat-card__value { font-size: 26px; font-weight: 800; margin-top: 6px; display: flex; align-items: baseline; gap: 6px; }
  .stat-card__value small { font-size: 13px; font-weight: 600; color: var(--text-muted); }
  .stat-card__meta { margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted); }

  /* Tables */
  .table-wrapper {
    overflow-x: auto;
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }
  table { width: 100%; border-collapse: collapse; min-width: 720px; }
  th, td { padding: 12px 14px; text-align: right; font-size: 13.5px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
  thead th {
    background: rgba(19, 28, 64, 0.9);
    color: #aeb9dd;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    position: sticky;
    top: 0;
  }
  tbody tr { transition: background 0.12s ease; }
  tbody tr:hover { background: rgba(79, 139, 255, 0.05); }
  tbody tr:last-child td { border-bottom: none; }

  /* Grids */
  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; align-items: start; }
  .full-width { grid-column: 1 / -1; }

  .code-pill {
    display: block;
    direction: ltr;
    text-align: left;
    background: rgba(2, 6, 18, 0.55);
    border: 1px solid var(--border-soft);
    border-radius: 9px;
    padding: 7px 12px;
    font-family: "Cascadia Code", Consolas, monospace;
    font-size: 12.5px;
    color: #9be8ff;
    margin-top: 8px;
  }
  .method-pill {
    display: inline-block;
    direction: ltr;
    padding: 1px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
    font-family: monospace;
    background: rgba(47, 213, 113, 0.14);
    border: 1px solid rgba(47, 213, 113, 0.35);
    color: #7fe9ab;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
    html { scroll-behavior: auto; }
  }
`;

const FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
`;

// --- Storefront product card (shared by grid & related section) ---
function renderGameCard(g) {
  const variantChips = (g.variants || [])
    .slice(0, 4)
    .map(
      (v) =>
        `<span class="chip chip--platform">${escapeHtml(v.platform)} · ${formatNumber(v.capacity)} کاربره</span>`
    )
    .join("");
  const extraCount = Math.max((g.variants?.length || 0) - 4, 0);
  const image = g.image_url
    ? `<img src="${escapeHtml(g.image_url)}" alt="${escapeHtml(g.title)}" loading="lazy" />`
    : `<div class="game-card__placeholder">${icon("gamepad", 44)}</div>`;
  const multiVariant = (g.variants?.length || 0) > 1;

  return `<article class="game-card">
    <a class="game-card__media" href="/game/${Number(g.id)}" aria-label="${escapeHtml(g.title)}">
      ${image}
      ${g.is_plus ? '<span class="badge badge--plus game-card__plus">' + icon("star", 13) + " پلاس</span>" : ""}
      <span class="chip chip--region game-card__region">${escapeHtml(g.region || "—")}</span>
    </a>
    <div class="game-card__body">
      <h3 class="game-card__title"><a href="/game/${Number(g.id)}">${escapeHtml(g.title)}</a></h3>
      <div class="game-card__chips">${variantChips}${extraCount > 0 ? `<span class="chip">+${formatNumber(extraCount)}</span>` : ""}</div>
      ${g.description ? `<p class="game-card__desc">${escapeHtml(truncate(g.description, 90))}</p>` : ""}
      <div class="game-card__foot">
        <div class="price">
          <small>${multiVariant ? "شروع از" : "قیمت"}</small>
          <strong>${formatPrice(g.price)}</strong>
          <span class="price__unit">تومان</span>
        </div>
        ${g.out_of_stock ? '<span class="badge badge--danger">ناموجود</span>' : '<span class="badge badge--success">موجود</span>'}
      </div>
      <a class="btn btn--primary btn--block game-card__cta" href="/game/${Number(g.id)}">
        ${icon("cart", 17)} مشاهده و خرید
      </a>
    </div>
  </article>`;
}

// --- Public storefront shell (header, footer, shared public CSS) ---
function renderPublicShell(inner, { title, metaDescription, ogImage, jsonLd, canonical } = {}) {
  const ogTags = `
    <meta property="og:site_name" content="GalaxyZone" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription || CONFIG.DEFAULT_META_DESCRIPTION)}" />
    <meta property="og:locale" content="fa_IR" />
    ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ""}
    <meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}" />
    <meta name="theme-color" content="#060a17" />
    ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : ""}
  `;
  const jsonLdBlock = jsonLd
    ? `<script type="application/ld+json">${escapeJsonLd(jsonLd)}</script>`
    : "";

  return `<!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(metaDescription || CONFIG.DEFAULT_META_DESCRIPTION)}" />
    ${ogTags}
    ${FONT_LINKS}
    <style>
      ${BASE_STYLES}
      /* ===== Public storefront ===== */
      .site-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(6, 10, 23, 0.78);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--border-soft);
      }
      .site-header__inner { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-block: 12px; }
      .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--text); }
      .brand__mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--grad-brand);
        color: #fff;
        box-shadow: 0 6px 18px rgba(79, 139, 255, 0.4);
      }
      .brand__text { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; direction: ltr; }
      .brand__text b { color: var(--cyan); font-weight: 800; }
      .site-nav { display: flex; align-items: center; gap: 18px; }
      .site-nav__link { color: #c9d3f2; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
      .site-nav__link:hover { color: #fff; }
      .site-nav__link.is-active { color: var(--cyan); }
      @media (max-width: 560px) { .site-nav__link--text { display: none; } }

      .hero { padding: 54px 0 26px; text-align: center; }
      .hero__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid rgba(67, 229, 255, 0.3);
        background: rgba(67, 229, 255, 0.07);
        color: #8ceeff;
        font-size: 13px;
        font-weight: 600;
      }
      .hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; margin: 18px 0 10px; }
      .hero p { max-width: 620px; margin: 0 auto; color: var(--text-muted); font-size: 15.5px; }
      .hero__stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        max-width: 720px;
        margin: 30px auto 0;
      }
      .hero__stat {
        background: rgba(14, 21, 49, 0.75);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius);
        padding: 14px;
      }
      .hero__stat strong { display: block; font-size: 21px; font-weight: 800; }
      .hero__stat span { font-size: 12px; color: var(--text-muted); }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: flex-end;
        background: rgba(14, 21, 49, 0.7);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-lg);
        padding: 16px;
        margin: 26px 0 22px;
        box-shadow: var(--shadow-sm);
      }
      .toolbar__field { flex: 1 1 170px; }
      .toolbar__field--grow { flex: 2 1 260px; }
      .toolbar__actions { display: flex; gap: 8px; }

      .store-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); margin-block: 8px 40px; }
      .game-card {
        display: flex;
        flex-direction: column;
        background: linear-gradient(170deg, var(--surface-2), var(--surface) 60%);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .game-card:hover { transform: translateY(-4px); border-color: rgba(79, 139, 255, 0.45); box-shadow: var(--shadow); }
      .game-card__media { position: relative; display: block; aspect-ratio: 16 / 9; background: #0a1024; overflow: hidden; }
      .game-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
      .game-card:hover .game-card__media img { transform: scale(1.05); }
      .game-card__placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #2c3a6e;
        background: radial-gradient(24rem 12rem at 50% 120%, rgba(79, 139, 255, 0.14), transparent 65%);
      }
      .game-card__plus { position: absolute; top: 10px; inset-inline-start: 10px; backdrop-filter: blur(6px); }
      .game-card__region { position: absolute; bottom: 10px; inset-inline-end: 10px; backdrop-filter: blur(6px); background: rgba(6, 10, 23, 0.7); }
      .game-card__body { display: flex; flex-direction: column; gap: 10px; padding: 14px 16px 16px; flex: 1; }
      .game-card__title { font-size: 16.5px; font-weight: 800; margin: 0; }
      .game-card__title a { color: var(--text); }
      .game-card__title a:hover { color: var(--cyan); }
      .game-card__chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .game-card__desc { margin: 0; color: var(--text-muted); font-size: 13px; flex: 1; }
      .game-card__foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .price { display: flex; align-items: baseline; gap: 6px; }
      .price small { color: var(--text-muted); font-size: 11.5px; }
      .price strong { font-size: 19px; font-weight: 800; }
      .price__unit { color: var(--text-muted); font-size: 12px; }
      .game-card__cta { margin-top: 4px; }

      .empty-state {
        text-align: center;
        padding: 70px 20px;
        border: 1px dashed var(--border);
        border-radius: var(--radius-lg);
        background: rgba(14, 21, 49, 0.4);
        margin-block: 10px 50px;
      }
      .empty-state .icon { color: #35437a; }
      .empty-state h3 { margin: 12px 0 4px; }

      /* Detail page */
      .breadcrumb { display: flex; align-items: center; gap: 8px; padding: 20px 0 0; font-size: 13px; color: var(--text-muted); flex-wrap: wrap; }
      .detail { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 26px; margin: 18px 0 30px; align-items: start; }
      @media (max-width: 820px) { .detail { grid-template-columns: 1fr; } }
      .detail__media {
        position: relative;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--border-soft);
        aspect-ratio: 16 / 10;
        background: #0a1024;
        box-shadow: var(--shadow);
      }
      .detail__media img { width: 100%; height: 100%; object-fit: cover; }
      .detail__media .game-card__placeholder { height: 100%; }
      .detail__badges { position: absolute; top: 12px; inset-inline-start: 12px; display: flex; gap: 8px; }
      .detail__info h1 { font-size: clamp(24px, 4vw, 34px); font-weight: 900; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .detail__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
      .detail__desc { color: #c9d3f2; font-size: 15px; white-space: pre-line; }
      .detail__price {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin: 18px 0;
        padding: 14px 18px;
        border-radius: var(--radius);
        background: rgba(79, 139, 255, 0.07);
        border: 1px solid rgba(79, 139, 255, 0.25);
      }
      .detail__price small { color: var(--text-muted); }
      .detail__price strong { font-size: 30px; font-weight: 900; background: var(--grad-brand); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .detail__price span { color: var(--text-muted); font-size: 13px; }
      .detail__cta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
      .trust-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
      .trust-list li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #c9d3f2;
        background: rgba(14, 21, 49, 0.6);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-sm);
        padding: 9px 12px;
      }
      .trust-list .icon { color: var(--success); }
      .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
      .tag {
        display: inline-block;
        padding: 3px 11px;
        background: rgba(14, 21, 49, 0.8);
        border: 1px solid var(--border-soft);
        border-radius: 999px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .section-title { display: flex; align-items: center; gap: 10px; margin: 34px 0 16px; font-size: 19px; font-weight: 800; }
      .section-title .icon { color: var(--primary); }
      .variants-table { min-width: 640px; }
      .price--old { color: var(--text-muted); text-decoration: line-through; font-size: 12.5px; margin-inline-start: 8px; }
      .related-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); margin-bottom: 46px; }

      .site-footer { border-top: 1px solid var(--border-soft); background: rgba(6, 10, 23, 0.7); margin-top: 30px; }
      .site-footer__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding-block: 20px;
        color: var(--text-muted);
        font-size: 13px;
      }
      .site-footer__links { display: flex; align-items: center; gap: 16px; }
    </style>
    ${jsonLdBlock}
  </head>
  <body>
    <header class="site-header">
      <div class="container site-header__inner">
        <a class="brand" href="/store">
          <span class="brand__mark">${icon("gamepad", 21)}</span>
          <span class="brand__text">GALAXY<b>ZONE</b></span>
        </a>
        <nav class="site-nav" aria-label="ناوبری اصلی">
          <a class="site-nav__link is-active" href="/store">${icon("store", 17)}<span class="site-nav__link--text">فروشگاه</span></a>
          <a class="site-nav__link" href="/games" title="REST API"><span class="site-nav__link--text">API</span>${icon("code", 17)}</a>
          <a class="btn btn--ghost btn--sm" href="/admin/login">${icon("user", 15)} ورود مدیر</a>
        </nav>
      </div>
    </header>
    <main>${inner}</main>
    <footer class="site-footer">
      <div class="container site-footer__inner">
        <div>${icon("shield", 15)} GalaxyZone — فروشگاه اکانت و بازی‌های PS4 / PS5 با تحویل فوری و ضمانت</div>
        <div class="site-footer__links">
          <a href="/games">API فروشگاه</a>
          <a href="/store">همه بازی‌ها</a>
        </div>
      </div>
    </footer>
  </body>
  </html>`;
}

function renderStorefront(games, filters = {}, origin = "") {
  const activeVariants = games.reduce((acc, g) => acc + (g.variants?.length || 0), 0);
  const pricePoints = games.map((g) => Number(g.price) || 0).filter((p) => p > 0);
  const minPrice = pricePoints.length ? Math.min(...pricePoints) : 0;
  const titleSuffix = filters.platform ? ` ${filters.platform}` : "";
  const pageTitle = `فروشگاه بازی${titleSuffix} | GalaxyZone`;

  const filterToolbar = `
    <form class="toolbar" method="GET" action="/store" role="search" aria-label="فیلتر بازی‌ها">
      <div class="toolbar__field toolbar__field--grow">
        <label for="f-title">جستجو</label>
        <input id="f-title" type="search" name="title" value="${escapeHtml(filters.title || "")}" placeholder="نام بازی… مثلاً God of War" />
      </div>
      <div class="toolbar__field">
        <label for="f-platform">پلتفرم</label>
        <select id="f-platform" name="platform">
          <option value="">همه</option>
          <option value="PS4" ${filters.platform === "PS4" ? "selected" : ""}>PS4</option>
          <option value="PS5" ${filters.platform === "PS5" ? "selected" : ""}>PS5</option>
        </select>
      </div>
      <div class="toolbar__field">
        <label for="f-capacity">ظرفیت اکانت</label>
        <select id="f-capacity" name="capacity">
          <option value="">همه</option>
          <option value="1" ${filters.capacity === "1" ? "selected" : ""}>۱ کاربره</option>
          <option value="2" ${filters.capacity === "2" ? "selected" : ""}>۲ کاربره</option>
          <option value="3" ${filters.capacity === "3" ? "selected" : ""}>۳ کاربره</option>
        </select>
      </div>
      <div class="toolbar__field">
        <label for="f-plus">نوع</label>
        <select id="f-plus" name="is_plus">
          <option value="">همه</option>
          <option value="1" ${filters.is_plus === "1" ? "selected" : ""}>فقط پلاس</option>
          <option value="0" ${filters.is_plus === "0" ? "selected" : ""}>بدون پلاس</option>
        </select>
      </div>
      <div class="toolbar__actions">
        <button class="btn" type="submit">${icon("filter", 16)} اعمال فیلتر</button>
        <a class="btn btn--ghost" href="/store">حذف فیلترها</a>
      </div>
    </form>`;

  const cardsGrid = games.length
    ? `<div class="store-grid">${games.map(renderGameCard).join("")}</div>`
    : `<div class="empty-state">
        ${icon("search", 46)}
        <h3>موردی مطابق فیلترها پیدا نشد</h3>
        <p class="muted">فیلترها را تغییر دهید یا همه بازی‌ها را ببینید.</p>
        <a class="btn btn--ghost" href="/store" style="margin-top:12px;">نمایش همه بازی‌ها</a>
      </div>`;

  const inner = `
    <section class="hero">
      <div class="container">
        <span class="hero__eyebrow">${icon("zap", 15)} تحویل فوری · ضمانت بازگشت وجه · پشتیبانی مستقیم</span>
        <h1>فروشگاه <span class="grad-text">اکانت و بازی</span> PS4 / PS5</h1>
        <p>اکانت‌های قانونی با گارانتی، گیفت‌کارت پلاس و بازی‌های دیجیتال — قیمت شفاف برای هر پلتفرم و هر ظرفیت.</p>
        <div class="hero__stats">
          <div class="hero__stat"><strong>${formatNumber(games.length)}</strong><span>عنوان فعال</span></div>
          <div class="hero__stat"><strong>${formatNumber(activeVariants)}</strong><span>واریانت قابل خرید</span></div>
          <div class="hero__stat"><strong>${minPrice ? formatPrice(minPrice) : "—"}</strong><span>شروع قیمت (تومان)</span></div>
        </div>
      </div>
    </section>
    <div class="container">
      ${filterToolbar}
      ${cardsGrid}
    </div>`;

  return renderPublicShell(inner, {
    title: pageTitle,
    metaDescription: CONFIG.DEFAULT_META_DESCRIPTION,
    canonical: origin ? `${origin}/store` : "",
  });
}

function renderGameDetail(game, related = [], origin = "") {
  const variants = game.variants || [];
  const availableVariants = variants.filter((v) => Number(v.stock) > 0);
  const pricePoints = variants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
  const minPrice = pricePoints.length ? Math.min(...pricePoints) : Number(game.price) || 0;
  const maxPrice = pricePoints.length ? Math.max(...pricePoints) : minPrice;
  const tags = (game.seo_tags || "").split(",").map((t) => t.trim()).filter(Boolean);

  const variantRows = variants
    .map((v) => {
      const outOfStock = Number(v.stock) <= 0;
      return `<tr>
        <td><span class="chip chip--platform">${escapeHtml(v.platform)}</span></td>
        <td><span class="chip chip--capacity">${formatNumber(v.capacity)} کاربره</span></td>
        <td>
          <strong>${formatPrice(v.price)}</strong> <span class="muted">تومان</span>
          ${v.old_price && Number(v.old_price) > Number(v.price) ? `<span class="price--old">${formatPrice(v.old_price)}</span>` : ""}
        </td>
        <td>${formatNumber(v.stock)}</td>
        <td>${outOfStock ? '<span class="badge badge--danger">ناموجود</span>' : '<span class="badge badge--success">آماده تحویل</span>'}</td>
      </tr>`;
    })
    .join("");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: game.title,
    description: (game.seo_description || game.description || CONFIG.DEFAULT_META_DESCRIPTION).slice(0, 300),
    ...(game.image_url ? { image: [game.image_url] } : {}),
    brand: { "@type": "Brand", name: "GalaxyZone" },
    sku: `GZ-${game.id}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IRR",
      lowPrice: minPrice,
      highPrice: maxPrice || minPrice,
      offerCount: variants.length || 1,
      availability: availableVariants.length
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const inner = `
    <div class="container">
      <nav class="breadcrumb" aria-label="مسیر صفحه">
        <a href="/store">فروشگاه</a>
        ${icon("arrow", 14)}
        <span>${escapeHtml(game.title)}</span>
      </nav>

      <div class="detail">
        <div class="detail__media">
          ${game.image_url
            ? `<img src="${escapeHtml(game.image_url)}" alt="${escapeHtml(game.title)}" />`
            : `<div class="game-card__placeholder">${icon("gamepad", 56)}</div>`}
          <div class="detail__badges">
            ${game.is_plus ? '<span class="badge badge--plus">' + icon("star", 13) + " پلاس</span>" : ""}
            ${game.out_of_stock ? '<span class="badge badge--danger">ناموجود</span>' : '<span class="badge badge--success">موجود</span>'}
          </div>
        </div>
        <div class="detail__info">
          <h1>${escapeHtml(game.title)}${game.is_plus ? '<span class="badge badge--plus">' + icon("star", 13) + " پلاس</span>" : ""}</h1>
          <div class="detail__chips">
            <span class="chip chip--region">${icon("store", 13)} ریجن ${escapeHtml(game.region || "—")}</span>
            <span class="chip">${icon("box", 13)} ${formatNumber(game.stock || 0)} عدد موجودی کل</span>
          </div>
          ${game.description ? `<p class="detail__desc">${escapeHtml(game.description)}</p>` : '<p class="muted">توضیحاتی برای این محصول ثبت نشده است.</p>'}
          <div class="detail__price">
            <small>شروع قیمت</small>
            <strong>${formatPrice(minPrice)}</strong>
            <span>تومان${variants.length > 1 ? ` (تا ${formatPrice(maxPrice)} بسته به پلتفرم و ظرفیت)` : ""}</span>
          </div>
          <div class="detail__cta">
            ${availableVariants.length
              ? `<a class="btn btn--primary" href="#variants">${icon("cart", 17)} انتخاب واریانت و خرید</a>`
              : '<span class="btn" style="opacity:0.55; cursor:not-allowed;" aria-disabled="true">به‌زودی — موجود نیست</span>'}
            <a class="btn btn--ghost" href="/store">${icon("arrow", 16)} بازگشت به فروشگاه</a>
          </div>
          <ul class="trust-list">
            <li>${icon("zap", 15)} تحویل آنی پس از پرداخت</li>
            <li>${icon("shield", 15)} گارانتی مادام‌العمر</li>
            <li>${icon("user", 15)} پشتیبانی مستقیم</li>
          </ul>
          ${tags.length ? `<div class="tag-list">${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        </div>
      </div>

      <h2 class="section-title" id="variants">${icon("tag", 20)} جدول قیمت واریانت‌ها</h2>
      ${variants.length
        ? `<div class="table-wrapper">
            <table class="variants-table">
              <thead>
                <tr><th scope="col">پلتفرم</th><th scope="col">ظرفیت</th><th scope="col">قیمت</th><th scope="col">موجودی</th><th scope="col">وضعیت</th></tr>
              </thead>
              <tbody>${variantRows}</tbody>
            </table>
          </div>`
        : '<p class="muted">هنوز واریانتی برای این محصول ثبت نشده است.</p>'}
      ${
        related.length
          ? `<h2 class="section-title">${icon("gamepad", 20)} بازی‌های مشابه</h2>
             <div class="related-grid">${related.map(renderGameCard).join("")}</div>`
          : ""
      }
    </div>`;

  return renderPublicShell(inner, {
    title: game.seo_title || game.title,
    metaDescription: truncate(game.seo_description || game.description || CONFIG.DEFAULT_META_DESCRIPTION, 160),
    ogImage: game.image_url || undefined,
    jsonLd,
    canonical: origin ? `${origin}/game/${Number(game.id)}` : "",
  });
}

// --- Admin shell ---
function renderAdminShell(content, { title = "GalaxyZone Admin", activeNav = "", script = "" } = {}) {
  const navLink = (href, label, key, iconName) =>
    `<a class="admin-nav__link ${activeNav === key ? "is-active" : ""}" href="${href}">${icon(iconName, 16)} ${label}</a>`;

  return `<!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="پنل مدیریت GalaxyZone" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#060a17" />
    ${FONT_LINKS}
    <style>
      ${BASE_STYLES}
      /* ===== Admin panel ===== */
      body { background: var(--bg); }
      .admin-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(6, 10, 23, 0.82);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--border-soft);
      }
      .admin-header__inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-block: 11px; flex-wrap: wrap; }
      .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--text); }
      .brand__mark {
        display: inline-flex; align-items: center; justify-content: center;
        width: 34px; height: 34px; border-radius: 11px;
        background: var(--grad-brand); color: #fff;
        box-shadow: 0 6px 16px rgba(79, 139, 255, 0.35);
      }
      .brand__text { font-size: 15.5px; font-weight: 800; direction: ltr; }
      .brand__text b { color: var(--cyan); }
      .brand__env { font-size: 11px; color: var(--text-muted); border: 1px solid var(--border-soft); border-radius: 6px; padding: 1px 8px; }
      .admin-nav { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .admin-nav__link {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 7px 13px; border-radius: 10px;
        color: #c9d3f2; font-size: 13.5px; font-weight: 600;
      }
      .admin-nav__link:hover { color: #fff; background: rgba(79, 139, 255, 0.1); }
      .admin-nav__link.is-active { color: #dbe8ff; background: rgba(79, 139, 255, 0.16); box-shadow: inset 0 0 0 1px rgba(79, 139, 255, 0.35); }
      .admin-main { padding-block: 26px 50px; }
      .admin-footer { border-top: 1px solid var(--border-soft); padding-block: 16px; text-align: center; color: var(--text-muted); font-size: 12.5px; }
      .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 22px; }
      .page-head h1 { font-size: 24px; font-weight: 900; margin: 0; }
      .page-head__sub { color: var(--text-muted); font-size: 13.5px; margin-top: 4px; }
      .page-head__actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

      .stats-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(172px, 1fr)); margin-bottom: 18px; }

      .platform-row { display: grid; grid-template-columns: 70px 1fr auto; align-items: center; gap: 12px; margin-top: 12px; }
      .platform-row__bar { height: 9px; border-radius: 999px; background: rgba(151, 163, 201, 0.12); overflow: hidden; }
      .platform-row__fill { height: 100%; border-radius: 999px; background: var(--grad-brand); }
      .api-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
      .api-row code { flex: 1; min-width: 200px; }

      .toolbar-form { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
      .toolbar-form > div { flex: 1 1 170px; }
      .toolbar-form__actions { display: flex; gap: 8px; }

      .actions-cell { display: flex; gap: 6px; flex-wrap: wrap; }
      .actions-cell form { display: inline-flex; }
      .game-cell { display: flex; align-items: center; gap: 10px; min-width: 190px; }
      .game-cell__thumb {
        width: 44px; height: 44px; border-radius: 10px; overflow: hidden; flex-shrink: 0;
        background: var(--surface-2); border: 1px solid var(--border-soft);
        display: flex; align-items: center; justify-content: center; color: #35437a;
      }
      .game-cell__thumb img { width: 100%; height: 100%; object-fit: cover; }
      .game-cell__title { font-weight: 700; font-size: 13.5px; color: var(--text); }
      .game-cell__meta { font-size: 11.5px; color: var(--text-muted); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
      .variant-chips { display: flex; flex-wrap: wrap; gap: 5px; max-width: 300px; }
      .variant-chips .chip { font-size: 11px; padding: 2px 8px; }
      .result-count { display: inline-flex; align-items: center; gap: 6px; margin: 14px 0 10px; }

      .form-actions {
        position: sticky;
        bottom: 0;
        z-index: 40;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
        padding: 14px 18px;
        margin-top: 20px;
        background: rgba(10, 16, 36, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow);
      }

      .variant-card {
        border: 1px solid var(--border-soft);
        border-radius: var(--radius);
        background: rgba(10, 16, 36, 0.6);
        padding: 13px;
        display: grid;
        gap: 10px;
        transition: opacity 0.2s ease, border-color 0.2s ease;
      }
      .variant-card.is-off { opacity: 0.55; border-style: dashed; }
      .variant-card__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 800; font-size: 13.5px; }
      .variant-card__head .chips { display: flex; gap: 6px; }
      .variant-card__toggle { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-muted); cursor: pointer; flex-direction: row; font-weight: 600; }
      .image-preview {
        margin-top: 10px;
        border: 1px dashed var(--border);
        border-radius: var(--radius);
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        color: #35437a;
        background: rgba(10, 16, 36, 0.6);
      }
      .image-preview img { max-height: 220px; width: 100%; object-fit: contain; }
    </style>
  </head>
  <body>
    <header class="admin-header">
      <div class="container admin-header__inner">
        <div class="brand">
          <span class="brand__mark">${icon("shield", 18)}</span>
          <span class="brand__text">GALAXY<b>ZONE</b></span>
          <span class="brand__env">پنل مدیریت</span>
        </div>
        <nav class="admin-nav" aria-label="ناوبری مدیریت">
          ${navLink("/admin", "داشبورد", "dashboard", "gamepad")}
          ${navLink("/admin/games/new", "بازی جدید", "new", "plus")}
          ${navLink("/store", "فروشگاه", "store", "store")}
          <form method="POST" action="/admin/logout" style="display:inline-flex;">
            <button class="btn btn--danger-ghost btn--sm" type="submit">${icon("power", 15)} خروج</button>
          </form>
        </nav>
      </div>
    </header>
    <main class="container admin-main">${content}</main>
    <footer class="admin-footer">GalaxyZone Admin · API-first · داده‌ها از Cloudflare D1</footer>
    ${script ? `<script>${script}</script>` : ""}
  </body>
  </html>`;
}

function renderAdminLoginPage(errorMessage = "") {
  const errorBlock = errorMessage
    ? `<div class="alert alert--error" role="alert">${icon("alert", 18)} ${escapeHtml(errorMessage)}</div>`
    : "";
  return `<!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ورود مدیر | GalaxyZone</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#060a17" />
    ${FONT_LINKS}
    <style>
      ${BASE_STYLES}
      body { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
      .login-card {
        width: 100%;
        max-width: 400px;
        background: linear-gradient(165deg, var(--surface-2), var(--surface) 70%);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-lg);
        padding: 34px 30px;
        box-shadow: var(--shadow);
      }
      .login-card__brand { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 24px; text-align: center; }
      .login-card__brand .brand__mark { width: 56px; height: 56px; border-radius: 18px; box-shadow: 0 10px 30px rgba(79, 139, 255, 0.45); }
      .login-card__brand h1 { font-size: 19px; font-weight: 800; margin: 0; }
      .login-card__brand p { margin: 0; color: var(--text-muted); font-size: 12.5px; }
      .field { margin-bottom: 15px; }
      .input-wrap { position: relative; }
      .input-wrap .icon { position: absolute; inset-inline-start: 12px; top: 50%; transform: translateY(-50%); color: #5e6c96; pointer-events: none; }
      .input-wrap input { padding-inline-start: 40px; }
      .input-wrap--toggle input { padding-inline-end: 44px; }
      .toggle-pass {
        position: absolute; inset-inline-end: 8px; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: var(--text-muted); cursor: pointer;
        display: inline-flex; padding: 6px; border-radius: 8px;
      }
      .toggle-pass:hover { color: #fff; background: rgba(79, 139, 255, 0.12); }
      .login-card__submit { width: 100%; margin-top: 8px; padding-block: 12px; font-size: 15px; }
      .login-card__foot { text-align: center; margin-top: 20px; font-size: 12px; color: var(--text-muted); }
      .login-card__foot a { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; }
    </style>
  </head>
  <body>
    <main class="login-card">
      <div class="login-card__brand">
        <span class="brand__mark">${icon("shield", 26)}</span>
        <h1>ورود به پنل مدیریت</h1>
        <p>GalaxyZone · دسترسی فقط برای مدیران مجاز است</p>
      </div>
      ${errorBlock}
      <form method="POST" action="/admin/login" autocomplete="on">
        <div class="field">
          <label for="username">نام کاربری</label>
          <div class="input-wrap">
            ${icon("user", 17)}
            <input id="username" name="username" required autocomplete="username" placeholder="نام کاربری مدیر" />
          </div>
        </div>
        <div class="field">
          <label for="password">رمز عبور</label>
          <div class="input-wrap input-wrap--toggle">
            ${icon("lock", 17)}
            <input id="password" name="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
            <button class="toggle-pass" type="button" id="togglePass" aria-label="نمایش/پنهان‌سازی رمز">${icon("eye", 17)}</button>
          </div>
        </div>
        <button class="btn login-card__submit" type="submit">${icon("power", 17)} ورود به داشبورد</button>
      </form>
      <div class="login-card__foot">
        <a href="/store">${icon("arrow", 14)} بازگشت به فروشگاه</a>
      </div>
    </main>
    <script>
      (function () {
        var btn = document.getElementById("togglePass");
        var input = document.getElementById("password");
        var show = '${icon("eye", 17)}';
        var hide = '${icon("eye-off", 17)}';
        btn.addEventListener("click", function () {
          var visible = input.type === "text";
          input.type = visible ? "password" : "text";
          btn.innerHTML = visible ? show : hide;
          btn.setAttribute("aria-label", visible ? "نمایش رمز" : "پنهان‌سازی رمز");
        });
      })();
    </script>
  </body>
  </html>`;
}

function renderAdminDashboard(games, filters = {}, summary = {}) {
  const rows = games
    .map((g) => {
      const variantChips = (g.variants || [])
        .map(
          (v) => `<span class="chip chip--platform">${escapeHtml(v.platform)}·${formatNumber(v.capacity)} · ${formatPrice(v.price)}${!v.is_active ? " · خاموش" : ""}</span>`
        )
        .join("") || '<span class="muted">—</span>';
      const toggleForm = `
        <form method="POST" action="/admin/games/${Number(g.id)}" title="${g.active ? "غیرفعال‌سازی" : "فعال‌سازی"}">
          <input type="hidden" name="title" value="${escapeHtml(g.title)}" />
          <input type="hidden" name="platform" value="${escapeHtml(g.platform || "")}" />
          <input type="hidden" name="region" value="${escapeHtml(g.region || "")}" />
          <input type="hidden" name="capacity" value="${Number(g.capacity || 0)}" />
          <input type="hidden" name="is_plus" value="${g.is_plus ? 1 : 0}" />
          <input type="hidden" name="price" value="${Number(g.price || 0)}" />
          <input type="hidden" name="stock" value="${Number(g.stock || 0)}" />
          <input type="hidden" name="active" value="${g.active ? 0 : 1}" />
          <input type="hidden" name="image_url" value="${escapeHtml(g.image_url || "")}" />
          <input type="hidden" name="description" value="${escapeHtml(g.description || "")}" />
          <input type="hidden" name="seo_title" value="${escapeHtml(g.seo_title || "")}" />
          <input type="hidden" name="seo_description" value="${escapeHtml(g.seo_description || "")}" />
          <input type="hidden" name="seo_tags" value="${escapeHtml(g.seo_tags || "")}" />
          <button class="btn btn--ghost btn--sm" type="submit" title="${g.active ? "غیرفعال‌سازی" : "فعال‌سازی"}">${icon(g.active ? "power" : "check", 15)}</button>
        </form>`;
      return `<tr>
        <td class="muted" dir="ltr">${Number(g.id)}</td>
        <td>
          <div class="game-cell">
            <span class="game-cell__thumb">${g.image_url ? `<img src="${escapeHtml(g.image_url)}" alt="" loading="lazy" />` : icon("gamepad", 20)}</span>
            <span>
              <span class="game-cell__title">${escapeHtml(g.title)}</span>
              <span class="game-cell__meta">${escapeHtml(g.region || "—")}${g.is_plus ? ' · <span class="badge badge--plus" style="font-size:10px; padding:0 7px;">پلاس</span>' : ""}</span>
            </span>
          </div>
        </td>
        <td><div class="variant-chips">${variantChips}</div></td>
        <td><strong>${formatPrice(g.price)}</strong> <span class="muted">تومان</span></td>
        <td>${formatNumber(g.stock)}</td>
        <td>${g.active ? '<span class="badge badge--success">فعال</span>' : '<span class="badge badge--danger">غیرفعال</span>'}</td>
        <td>
          <div class="actions-cell">
            <a class="btn btn--ghost btn--sm" href="/admin/games/${Number(g.id)}" title="ویرایش">${icon("pencil", 15)}</a>
            ${toggleForm}
            <form method="POST" action="/admin/games/${Number(g.id)}/delete" onsubmit="return confirm('بازی غیرفعال می‌شود. ادامه می‌دهید؟');">
              <button class="btn btn--danger-ghost btn--sm" type="submit" title="حذف نرم">${icon("trash", 15)}</button>
            </form>
            ${
              !g.active
                ? `<form method="POST" action="/admin/games/${Number(g.id)}/restore">
                    <button class="btn btn--sm" type="submit" title="بازگردانی">${icon("rotate", 15)}</button>
                  </form>`
                : ""
            }
            <form method="POST" action="/admin/games/${Number(g.id)}/purge" onsubmit="return confirm('حذف دائمی و غیرقابل بازگشت است. مطمئن هستید؟');">
              <button class="btn btn--danger btn--sm" type="submit" title="حذف دائمی">${icon("alert", 15)}</button>
            </form>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  const filterTitle = filters.title || "";
  const filterPlatform = filters.platform || "";
  const filterActive = filters.active ?? "";

  const platformMax = Math.max(1, ...(summary.platform_breakdown || []).map((p) => Number(p.total) || 0));
  const platformRows = (summary.platform_breakdown || [])
    .map(
      (p) => `<div class="platform-row">
        <span class="chip chip--platform">${escapeHtml(p.platform)}</span>
        <div class="platform-row__bar"><div class="platform-row__fill" style="width:${Math.round(((Number(p.total) || 0) / platformMax) * 100)}%"></div></div>
        <span class="muted">${formatNumber(p.total)} واریانت · ${formatNumber(p.active)} فعال · موجودی ${formatNumber(p.stock)}</span>
      </div>`
    )
    .join("") || '<p class="muted">داده‌ای برای نمایش وجود ندارد.</p>';

  const recentGames = (summary.recent_games || [])
    .map(
      (item) => `<div class="chip" style="padding:8px 12px;">
        <strong style="color:var(--text);">${escapeHtml(item.title)}</strong>
        <span class="muted">${formatPrice(item.price)} · ${formatNumber(item.stock || 0)} عدد</span>
        ${item.active ? '<span class="badge badge--success" style="font-size:10px; padding:0 7px;">فعال</span>' : '<span class="badge badge--danger" style="font-size:10px; padding:0 7px;">معلق</span>'}
      </div>`
    )
    .join("") || '<p class="muted">هنوز بازی ثبت نشده است.</p>';

  const content = `
    <div class="page-head">
      <div>
        <h1>مرکز کنترل GalaxyZone</h1>
        <p class="page-head__sub">مدیریت بازی‌ها، قیمت‌گذاری واریانت‌ها و مانیتورینگ موجودی — داده زنده از D1</p>
      </div>
      <div class="page-head__actions">
        <span class="chip">${icon("code", 14)} API-first</span>
        <a class="btn" href="/admin/games/new">${icon("plus", 16)} ایجاد بازی جدید</a>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__head">${icon("gamepad", 16)} کل بازی‌ها</div>
        <div class="stat-card__value">${formatNumber(summary.total_games ?? 0)}</div>
        <p class="stat-card__meta">فعال: ${formatNumber(summary.active_games ?? 0)} · غیرفعال: ${formatNumber(summary.inactive_games ?? 0)}</p>
      </div>
      <div class="stat-card">
        <div class="stat-card__head">${icon("star", 16)} بازی‌های پلاس</div>
        <div class="stat-card__value">${formatNumber(summary.plus_games ?? 0)}</div>
        <p class="stat-card__meta">اشتراک‌های ویژه اعضا</p>
      </div>
      <div class="stat-card">
        <div class="stat-card__head">${icon("box", 16)} موجودی کل</div>
        <div class="stat-card__value">${formatNumber(summary.total_stock ?? 0)}</div>
        <p class="stat-card__meta">میانگین قیمت: ${formatPrice(summary.avg_price ?? 0)} تومان</p>
      </div>
      <div class="stat-card">
        <div class="stat-card__head">${icon("coins", 16)} بازه قیمت</div>
        <div class="stat-card__value"><small>از</small> ${formatPrice(summary.min_price ?? 0)} <small>تا</small> ${formatPrice(summary.max_price ?? 0)}</div>
        <p class="stat-card__meta">تومان — روی واریانت‌های فعال</p>
      </div>
      <div class="stat-card">
        <div class="stat-card__head">${icon("wallet", 16)} ارزش موجودی</div>
        <div class="stat-card__value">${formatPrice(summary.inventory_value ?? 0)} <small>تومان</small></div>
        <p class="stat-card__meta">جمع (قیمت × موجودی)</p>
      </div>
      <div class="stat-card">
        <div class="stat-card__head">${icon("alert", 16)} هشدار موجودی کم</div>
        <div class="stat-card__value" style="color:${Number(summary.low_stock_games ?? 0) > 0 ? "var(--warning)" : "var(--success)"};">${formatNumber(summary.low_stock_games ?? 0)}</div>
        <p class="stat-card__meta">واریانت با موجودی ۳ یا کمتر</p>
      </div>
    </div>

    <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); margin-bottom:18px;">
      <div class="card">
        <h3>${icon("chart", 18)} سهم پلتفرم‌ها</h3>
        <p class="muted" style="margin-top:-6px;">توزیع واریانت‌های PS4 و PS5 بر اساس داده D1</p>
        ${platformRows}
      </div>
      <div class="card card--glow">
        <h3>${icon("code", 18)} APIهای مدیریتی</h3>
        <p class="muted" style="margin-top:-6px;">دسترسی JSON امن برای ابزارهای شخص ثالث و اتوماسیون</p>
        <div class="api-row"><span class="method-pill">GET</span><code class="code-pill" style="margin-top:0;">/admin/api/health</code></div>
        <div class="api-row"><span class="method-pill">GET</span><code class="code-pill" style="margin-top:0;">/admin/api/summary</code></div>
        <div class="api-row"><span class="method-pill">GET</span><code class="code-pill" style="margin-top:0;">/admin/api/games?platform=PS5</code></div>
        <div class="divider"></div>
        <p class="muted" style="margin:0 0 8px;">آخرین بازی‌های ثبت‌شده</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">${recentGames}</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:6px;">
      <form method="GET" action="/admin" class="toolbar-form">
        <div>
          <label for="af-title">جستجوی عنوان</label>
          <input id="af-title" name="title" value="${escapeHtml(filterTitle)}" placeholder="مثال: God of War" />
        </div>
        <div>
          <label for="af-platform">پلتفرم</label>
          <select id="af-platform" name="platform">
            <option value="">همه</option>
            <option value="PS4" ${filterPlatform === "PS4" ? "selected" : ""}>PS4</option>
            <option value="PS5" ${filterPlatform === "PS5" ? "selected" : ""}>PS5</option>
          </select>
        </div>
        <div>
          <label for="af-active">وضعیت</label>
          <select id="af-active" name="active">
            <option value="" ${filterActive === "" ? "selected" : ""}>همه</option>
            <option value="1" ${filterActive === "1" ? "selected" : ""}>فعال</option>
            <option value="0" ${filterActive === "0" ? "selected" : ""}>غیرفعال</option>
          </select>
        </div>
        <div class="toolbar-form__actions">
          <button class="btn" type="submit">${icon("filter", 15)} اعمال</button>
          <a class="btn btn--ghost" href="/admin">${icon("rotate", 15)} پاک‌سازی</a>
        </div>
      </form>
    </div>

    <span class="result-count muted">${icon("gamepad", 14)} ${formatNumber(games.length)} نتیجه</span>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">بازی</th>
            <th scope="col">واریانت‌ها</th>
            <th scope="col">قیمت پایه</th>
            <th scope="col">موجودی</th>
            <th scope="col">وضعیت</th>
            <th scope="col">اقدامات</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center; padding:34px;" class="muted">بازی‌ای یافت نشد — اولین بازی را ایجاد کنید.</td></tr>'}</tbody>
      </table>
    </div>
  `;
  return renderAdminShell(content, { title: "داشبورد | GalaxyZone Admin", activeNav: "dashboard" });
}

function renderAdminGameForm(game = null, variants = []) {
  const isEdit = Boolean(game);
  const action = isEdit ? `/admin/games/${Number(game.id)}` : "/admin/games";
  const existingVariants = {};
  (variants || []).forEach((v) => {
    existingVariants[`${v.platform?.toUpperCase?.() || v.platform}_${v.capacity}`] = v;
  });

  const variantRows = PLATFORM_CAPACITY_MATRIX.map(({ platform, capacity }) => {
    const key = `${platform}_${capacity}`;
    const v = existingVariants[key] || {};
    const activeChecked = v.is_active === undefined ? true : Boolean(v.is_active);
    return `<div class="variant-card" data-variant="${escapeHtml(platform)}_${capacity}">
      <div class="variant-card__head">
        <span class="chips">
          <span class="chip chip--platform">${escapeHtml(platform)}</span>
          <span class="chip chip--capacity">${formatNumber(capacity)} کاربره</span>
        </span>
        <label class="variant-card__toggle" style="margin-top:0;">
          <input type="hidden" name="variant_active_${platform}_${capacity}" value="0" />
          <input type="checkbox" name="variant_active_${platform}_${capacity}" ${activeChecked ? "checked" : ""} />
          فعال برای فروش
        </label>
      </div>
      <label>قیمت (تومان)
        <input type="number" min="0" step="1000" inputmode="numeric" name="variant_price_${platform}_${capacity}" value="${v.price ?? ""}" placeholder="— ارائه نشده" />
      </label>
      <label>موجودی
        <input type="number" min="0" inputmode="numeric" name="variant_stock_${platform}_${capacity}" value="${v.stock ?? ""}" placeholder="0" />
      </label>
    </div>`;
  }).join("");

  const formScript = `
    (function () {
      var input = document.getElementById("imageUrlInput");
      var preview = document.getElementById("imagePreview");
      if (input && preview) {
        var placeholder = preview.innerHTML;
        var render = function () {
          var url = input.value.trim();
          preview.innerHTML = "";
          if (url) {
            var img = document.createElement("img");
            img.alt = "پیش‌نمایش کاور";
            img.onerror = function () {
              preview.innerHTML = "⚠️ تصویر بارگذاری نشد";
            };
            img.src = url;
            preview.appendChild(img);
          } else {
            preview.innerHTML = placeholder;
          }
        };
        input.addEventListener("input", render);
        render();
      }
      // Smart variant toggles: clearing a price auto-deactivates the variant,
      // filling one auto-activates it (manual overrides stay until price changes).
      document.querySelectorAll("input[name^='variant_price_']").forEach(function (priceInput) {
        var name = priceInput.name.replace("variant_price_", "variant_active_");
        var checkbox = document.querySelector("input[name='" + name + "']:not([type='hidden'])");
        var card = priceInput.closest(".variant-card");
        if (!checkbox) return;
        var lastFilled = !!priceInput.value;
        var sync = function () {
          var filled = priceInput.value !== "" && Number(priceInput.value) > 0;
          if (filled !== lastFilled) {
            checkbox.checked = filled;
            lastFilled = filled;
          }
          if (card) card.classList.toggle("is-off", !checkbox.checked || !filled);
        };
        priceInput.addEventListener("input", sync);
        checkbox.addEventListener("change", function () {
          if (card) card.classList.toggle("is-off", !checkbox.checked || !priceInput.value);
        });
        if (card) card.classList.toggle("is-off", !checkbox.checked || !priceInput.value);
      });
    })();`;

  return renderAdminShell(
    `
    <div class="page-head">
      <div>
        <h1>${isEdit ? `ویرایش «${escapeHtml(game.title)}»` : "ایجاد بازی جدید"}</h1>
        <p class="page-head__sub">اطلاعات محصول و ماتریس قیمت‌گذاری PS4/PS5 را در یک فرم مدیریت کنید</p>
      </div>
      ${isEdit ? `<a class="btn btn--ghost" href="/game/${Number(game.id)}" target="_blank" rel="noopener">${icon("external", 15)} مشاهده در فروشگاه</a>` : ""}
    </div>

    <form method="POST" action="${action}">
      <div class="card" style="margin-bottom:16px;">
        <h3>${icon("gamepad", 18)} اطلاعات کلی</h3>
        <div class="form-grid">
          <label>عنوان بازی
            <input required name="title" value="${escapeHtml(game?.title || "")}" placeholder="مثال: God of War Ragnarök" />
          </label>
          <label>ریجن
            <input required name="region" value="${escapeHtml(game?.region || "")}" placeholder="مثال: EU / US" />
          </label>
          <label style="justify-content:flex-end;">اشتراک پلاس
            <span style="display:flex; align-items:center; gap:8px; color:var(--text-muted); font-weight:600;">
              <input type="checkbox" name="is_plus" ${game?.is_plus ? "checked" : ""} style="width:18px; height:18px;" />
              این محصول پلاس است
            </span>
          </label>
          <label style="justify-content:flex-end;">وضعیت انتشار
            <span style="display:flex; align-items:center; gap:8px; color:var(--text-muted); font-weight:600;">
              <input type="checkbox" name="active" ${game?.active ?? true ? "checked" : ""} style="width:18px; height:18px;" />
              نمایش در فروشگاه
            </span>
          </label>
          <label class="full-width">لینک تصویر کاور
            <input name="image_url" dir="ltr" value="${escapeHtml(game?.image_url || "")}" placeholder="https://…" id="imageUrlInput" />
          </label>
          <div class="full-width image-preview" id="imagePreview">${icon("image", 30)}</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3>${icon("coins", 18)} ماتریس قیمت‌گذاری</h3>
        <p class="muted" style="margin-top:-6px;">برای هر پلتفرم (PS4 / PS5) و هر ظرفیت (۱، ۲، ۳ کاربره) قیمت، موجودی و وضعیت فعال را مشخص کنید. ارزان‌ترین واریانت فعال، قیمت پایه محصول خواهد بود.</p>
        <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(230px, 1fr));">${variantRows}</div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3>${icon("tag", 18)} سئو و توضیحات</h3>
        <div class="form-grid">
          <label>عنوان سئو
            <input name="seo_title" value="${escapeHtml(game?.seo_title || "")}" placeholder="${escapeHtml(game?.title || "عنوان صفحه در نتایج جستجو")}" />
          </label>
          <label>برچسب‌ها (با کاما جدا کنید)
            <input name="seo_tags" dir="ltr" value="${escapeHtml(game?.seo_tags || "")}" placeholder="action, adventure" />
          </label>
          <label class="full-width">توضیح متای سئو
            <textarea name="seo_description" maxlength="300">${escapeHtml(game?.seo_description || "")}</textarea>
          </label>
          <label class="full-width">توضیح کامل محصول
            <textarea name="description" style="min-height:130px;">${escapeHtml(game?.description || "")}</textarea>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn" type="submit">${icon("check", 16)} ${isEdit ? "ثبت تغییرات" : "ایجاد بازی"}</button>
        <a class="btn btn--ghost" href="/admin">${icon("arrow", 15)} بازگشت به داشبورد</a>
        <span class="muted">${isEdit ? `شناسه محصول: ${Number(game.id)}` : "قیمت پایه به‌صورت خودکار از ارزان‌ترین واریانت فعال محاسبه می‌شود."}</span>
      </div>
    </form>
    `,
    {
      title: isEdit ? `ویرایش ${game.title} | GalaxyZone Admin` : "بازی جدید | GalaxyZone Admin",
      activeNav: isEdit ? "" : "new",
      script: formScript,
    }
  );
}
// ============================================================
// SECTION 5: ROUTING (New paths layered before legacy router)
// ============================================================

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Admin authentication routes
  if (url.pathname === "/admin/login") {
    if (request.method === "GET") return htmlResponse(renderAdminLoginPage());
    return await handleLogin(request);
  }

  if (url.pathname === "/admin/logout" && request.method === "POST") {
    return handleLogout();
  }

  // All /admin* (except /admin/login) require auth
  if (url.pathname.startsWith("/admin")) {
    if (!isAuthenticated(request)) {
      return redirectResponse("/admin/login");
    }

    if (url.pathname === "/admin/api/health" && request.method === "GET") {
      return jsonResponse({ status: "ok", uptime: Date.now(), region: env?.CF_REGION || "global" });
    }

    if (url.pathname === "/admin/api/summary" && request.method === "GET") {
      const summary = await getDashboardSummary(env);
      return jsonResponse({ summary, generated_at: new Date().toISOString() });
    }

    if (url.pathname === "/admin/api/games" && request.method === "GET") {
      const filters = {
        title: url.searchParams.get("title") || undefined,
        platform: url.searchParams.get("platform") || undefined,
        region: url.searchParams.get("region") || undefined,
        active: url.searchParams.get("active") === null || url.searchParams.get("active") === ""
          ? undefined
          : url.searchParams.get("active") === "1",
      };
      const games = await listAdminGames(env, filters);
      return jsonResponse({ total: games.length, games });
    }

    // Admin dashboard listing
    if (url.pathname === "/admin" && request.method === "GET") {
      const filters = {
        title: url.searchParams.get("title") || undefined,
        platform: url.searchParams.get("platform") || undefined,
        active: url.searchParams.get("active") === null || url.searchParams.get("active") === ""
          ? undefined
          : url.searchParams.get("active") === "1",
      };
      const games = await listAdminGames(env, filters);
      const summary = await getDashboardSummary(env);
      return htmlResponse(renderAdminDashboard(games, filters, summary));
    }

    // New game form
    if (url.pathname === "/admin/games/new" && request.method === "GET") {
      return htmlResponse(renderAdminGameForm());
    }

    // Create game
    if (url.pathname === "/admin/games" && request.method === "POST") {
      try {
        await createGameFromForm(env, request);
        return redirectResponse("/admin");
      } catch (err) {
        return htmlResponse(renderLayout(`<div class="alert">${err.message}</div>`));
      }
    }

    // Edit form
    const gameIdMatch = url.pathname.match(/^\/admin\/games\/(\d+)$/);
    if (gameIdMatch && request.method === "GET") {
      const game = await getGameById(env, gameIdMatch[1]);
      if (!game) return htmlResponse(renderLayout("بازی یافت نشد", { title: "404" }), 404);
      const variantMap = await getVariantsForGames(env, [game.id], { includeInactive: true });
      return htmlResponse(renderAdminGameForm(game, variantMap[game.id] || []));
    }

    // Update game
    if (gameIdMatch && request.method === "POST") {
      try {
        await updateGameFromForm(env, gameIdMatch[1], request);
        return redirectResponse("/admin");
      } catch (err) {
        return htmlResponse(renderLayout(`<div class=\"alert\">${err.message}</div>`));
      }
    }

    const variantMatch = url.pathname.match(/^\/admin\/games\/(\d+)\/variants$/);
    if (variantMatch && request.method === "POST") {
      const data = await parseFormData(request);
      await upsertGameVariant(env, {
        game_id: Number(variantMatch[1]),
        platform: data.platform,
        capacity: Number(data.capacity || 0),
        price: Number(data.price || 0),
        old_price: data.old_price ? Number(data.old_price) : null,
        stock: Number(data.stock || 0),
        is_active: parseBoolean(data.is_active ?? true),
      });
      return redirectResponse(`/admin/games/${variantMatch[1]}`);
    }

    // Soft delete
    const deleteMatch = url.pathname.match(/^\/admin\/games\/(\d+)\/delete$/);
    if (deleteMatch && request.method === "POST") {
      await softDeleteGame(env, deleteMatch[1]);
      return redirectResponse("/admin");
    }

    // Restore
    const restoreMatch = url.pathname.match(/^\/admin\/games\/(\d+)\/restore$/);
    if (restoreMatch && request.method === "POST") {
      await restoreGame(env, restoreMatch[1]);
      return redirectResponse("/admin");
    }

    // Hard delete
    const purgeMatch = url.pathname.match(/^\/admin\/games\/(\d+)\/purge$/);
    if (purgeMatch && request.method === "POST") {
      await hardDeleteGame(env, purgeMatch[1]);
      return redirectResponse("/admin");
    }

    // Update stock
    const stockMatch = url.pathname.match(/^\/admin\/games\/(\d+)\/stock$/);
    if (stockMatch && request.method === "POST") {
      const data = await parseFormData(request);
      const newStock = Number(data.stock || 0);
      await updateStock(env, stockMatch[1], newStock);
      return redirectResponse("/admin");
    }
  }

  // Public API list
  if (url.pathname === "/games" && request.method === "GET") {
    const filters = {
      title: url.searchParams.get("title") || undefined,
      platform: url.searchParams.get("platform") || undefined,
      region: url.searchParams.get("region") || undefined,
      capacity: url.searchParams.get("capacity") || undefined,
      is_plus: url.searchParams.get("is_plus") ? url.searchParams.get("is_plus") === "1" : undefined,
    };
    const games = await listPublicGames(env, filters);
    return jsonResponse({ total: games.length, filters, games });
  }

  // Storefront page (filters mirror the /games JSON API contract)
  if (url.pathname === "/store" && request.method === "GET") {
    const rawFilters = {
      title: url.searchParams.get("title") || "",
      platform: url.searchParams.get("platform") || "",
      capacity: url.searchParams.get("capacity") || "",
      is_plus: url.searchParams.get("is_plus") || "",
    };
    const apiFilters = {
      title: rawFilters.title || undefined,
      platform: rawFilters.platform || undefined,
      capacity: rawFilters.capacity || undefined,
      is_plus: rawFilters.is_plus ? rawFilters.is_plus === "1" : undefined,
    };
    const games = await listPublicGames(env, apiFilters);
    return htmlResponse(renderStorefront(games, rawFilters, url.origin));
  }

  // Game detail
  const gameDetailMatch = url.pathname.match(/^\/game\/(\d+)$/);
  if (gameDetailMatch && request.method === "GET") {
    const game = await getGameById(env, gameDetailMatch[1]);
    if (!game || !game.active) return null; // fall back to legacy 404
    const variantsMap = await getVariantsForGames(env, [game.id]);
    const variants = variantsMap[game.id] || [];
    // Related games: cheapest-platform siblings, exclude self
    const relatedPool = await listPublicGames(env, { platform: game.platform });
    const related = relatedPool.filter((g) => g.id !== game.id).slice(0, 4);
    const summary = summarizeVariants(variants);
    const enriched = {
      ...game,
      variants,
      price: summary.cheapest?.price ?? game.price ?? 0,
      stock: summary.totalStock || game.stock || 0,
      is_plus: Boolean(game.is_plus),
      out_of_stock: Number(summary.totalStock || game.stock || 0) <= 0,
      seo_title: game.seo_title || game.title,
      seo_description: game.seo_description || game.description || CONFIG.DEFAULT_META_DESCRIPTION,
    };
    return htmlResponse(renderGameDetail(enriched, related, url.origin));
  }

  return null; // allow legacy router to respond
}

export default {
  async fetch(request, env, ctx) {
    // NEW: attempt to serve admin/storefront/API routes first
    const advancedResponse = await handleRequest(request, env, ctx);
    if (advancedResponse) {
      return advancedResponse;
    }

    const url = new URL(request.url);

    // ============================================================
    // SERVER ROUTING LOGIC (Router)
    // ============================================================

    // 1. Root: Serve the Main Application Shell
    if (url.pathname === '/') {
      return new Response(htmlContent, {
        headers: { 
            'Content-Type': 'text/html;charset=UTF-8',
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
      });
    }

    // 2. CSS: Serve Enhanced Stylesheet
    if (url.pathname === '/styles.css') {
      return new Response(cssContent, {
        headers: { 
            'Content-Type': 'text/css;charset=UTF-8',
            'Cache-Control': 'public, max-age=86400' 
        },
      });
    }

    // 3. JavaScript: Serve The Core Engine
    if (url.pathname === '/app.js') {
      return new Response(jsContent, {
        headers: { 
            'Content-Type': 'application/javascript;charset=UTF-8',
            'Cache-Control': 'no-cache' // Ensure latest logic is always fetched during dev
        },
      });
    }

    // 4. Manifest: PWA Configuration
    if (url.pathname === '/manifest.webmanifest') {
      return new Response(manifestContent, {
        headers: { 'Content-Type': 'application/manifest+json;charset=UTF-8' },
      });
    }

    // 5. Service Worker: Offline Capabilities
    if (url.pathname === '/sw.js') {
      return new Response(swContent, {
        headers: { 
            'Content-Type': 'application/javascript;charset=UTF-8',
            'Service-Worker-Allowed': '/' 
        },
      });
    }

    // 6. Robots.txt: SEO Management
    if (url.pathname === '/robots.txt') {
      return new Response("User-agent: *\nAllow: /", { headers: {'Content-Type': 'text/plain'} });
    }

    // 7. Favicon Fallback (SVG)
    if (url.pathname === '/favicon.ico') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎮</text></svg>`;
        return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
    }

    // 404 Fallback
    return new Response(
        `<html><body style="background:#050508;color:#fff;text-align:center;font-family:sans-serif;margin-top:50px;display:flex;flex-direction:column;align-items:center;">
            <h1 style="font-size:3rem;color:#ff3c3c">404</h1>
            <p>این قلمرو وجود ندارد.</p>
            <a href="/" style="color:#00f3ff;text-decoration:none;border:1px solid #00f3ff;padding:10px 20px;border-radius:5px;">بازگشت به میدگارد</a>
        </body></html>`, 
        { status: 404, headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
    );
  }
};

// ============================================================
// SECTION 1: HTML STRUCTURE (index.html)
// Structure designed for Semantic SEO and Accessibility
// ============================================================
const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>GalaxyZone | مرجع تخصصی اکانت‌های گیمینگ</title>
    <meta name="description" content="خرید اکانت قانونی PS5 و PS4، گیفت کارت پلاس و بازی‌های دیجیتال با گارانتی مادام‌العمر و تحویل فوری.">
    <meta name="theme-color" content="#050508">
    <meta name="mobile-web-app-capable" content="yes">
    
    <!-- PWA Setup -->
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="apple-touch-icon" href="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=192&auto=format&fit=crop">
    <link rel="icon" type="image/svg+xml" href="/favicon.ico">

    <!-- CSS Link -->
    <link rel="stylesheet" href="/styles.css">
    
    <!-- External Dependencies -->
    <!-- Three.js for 3D Background -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>
    <!-- Vazirmatn Font -->
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="loading">

    <!-- Preloader -->
    <div id="preloader">
        <div class="loader-content">
            <div class="axe-spinner"><i class="fas fa-gavel"></i></div>
            <p class="loading-text">در حال ورود به دنیای بازی...</p>
        </div>
    </div>

    <!-- 3D Background Canvas -->
    <canvas id="gow-canvas"></canvas>
    <div class="vignette-overlay"></div>

    <!-- Notification Toasts -->
    <div id="toast-container"></div>

    <!-- Navigation Bar -->
    <header class="main-header">
        <div class="container header-inner">
            <div class="logo-area" onclick="window.scrollTo(0,0)">
                <i class="fas fa-gamepad logo-icon"></i>
                <h1>GALAXY<span class="highlight">ZONE</span></h1>
            </div>

            <!-- Global Search -->
            <div class="search-box">
                <input type="text" id="global-search" placeholder="جستجو (مثلاً: Fifa, God of War...)" autocomplete="off">
                <i class="fas fa-search search-icon"></i>
                <button id="clear-search" class="hidden">&times;</button>
                <div id="search-results" class="search-dropdown"></div>
            </div>
            
            <nav class="desktop-nav">
                <a href="#hero" class="nav-item active">خانه</a>
                <a href="#games-container" class="nav-item">فروشگاه</a>
                <a href="#plus-container" class="nav-item">پلاس</a>
                
                <div class="nav-icons">
                    <button class="nav-icon-btn" onclick="window.app.ui.toggleWishlist()" aria-label="علاقه‌مندی‌ها">
                        <i class="far fa-heart"></i>
                        <span id="wishlist-badge" class="badge hidden">0</span>
                    </button>
                    <button class="nav-icon-btn cart-btn" onclick="window.app.ui.toggleCart()" aria-label="سبد خرید">
                        <i class="fas fa-shopping-bag"></i>
                        <span id="cart-badge" class="badge hidden">0</span>
                    </button>
                </div>
            </nav>

            <button class="mobile-toggle" onclick="window.app.ui.toggleMobileMenu()">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div id="mobile-menu" class="mobile-menu-overlay">
        <div class="mobile-menu-content">
            <button class="close-menu" onclick="window.app.ui.toggleMobileMenu()">&times;</button>
            <div class="mobile-logo">GALAXY<span class="highlight">ZONE</span></div>
            <a href="#hero" onclick="window.app.ui.toggleMobileMenu()"><i class="fas fa-home"></i> خانه</a>
            <a href="#games-container" onclick="window.app.ui.toggleMobileMenu()"><i class="fas fa-gamepad"></i> بازی‌ها</a>
            <a href="#plus-container" onclick="window.app.ui.toggleMobileMenu()"><i class="fab fa-playstation"></i> پلاس</a>
            <hr class="mobile-divider">
            <a href="#" onclick="window.app.ui.toggleWishlist(); window.app.ui.toggleMobileMenu()"><i class="fas fa-heart"></i> لیست علاقه</a>
            <button onclick="window.app.pwa.install()" id="mobile-install-btn" class="btn-primary mobile-install hidden">
                <i class="fas fa-download"></i> نصب اپلیکیشن
            </button>
        </div>
    </div>

    <!-- Sidebar: Shopping Cart -->
    <aside id="cart-sidebar" class="sidebar">
        <div class="sidebar-header">
            <h3><i class="fas fa-shopping-cart"></i> سبد خرید</h3>
            <button onclick="window.app.ui.toggleCart()" class="close-sidebar-btn"><i class="fas fa-times"></i></button>
        </div>
        <div id="cart-content" class="sidebar-content">
            <!-- Injected via JS -->
        </div>
        <div class="sidebar-footer">
            <div class="summary-row">
                <span>تعداد اقلام:</span>
                <span id="cart-count-total">0</span>
            </div>
            <div class="summary-row total">
                <span>مبلغ قابل پرداخت:</span>
                <span id="cart-total" class="price-text">0 تومان</span>
            </div>
            <button onclick="window.app.inventory.checkout()" class="btn-checkout">
                <i class="fab fa-whatsapp"></i> تکمیل خرید در واتساپ
            </button>
            <button onclick="window.app.inventory.clearCart()" class="btn-clear-cart">خالی کردن سبد</button>
        </div>
    </aside>

    <!-- Sidebar: Wishlist -->
    <aside id="wishlist-sidebar" class="sidebar left-sidebar">
        <div class="sidebar-header">
            <h3><i class="fas fa-heart"></i> لیست علاقه‌مندی‌ها</h3>
            <button onclick="window.app.ui.toggleWishlist()" class="close-sidebar-btn"><i class="fas fa-times"></i></button>
        </div>
        <div id="wishlist-content" class="sidebar-content">
            <!-- Injected via JS -->
        </div>
    </aside>

    <div id="overlay" onclick="window.app.ui.closeAllSidebars()"></div>

    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section id="hero" class="hero">
            <div class="container hero-content">
                <div class="hero-badge"><i class="fas fa-fire"></i> جشنواره زمستانی</div>
                <h2 class="hero-title glitch" data-text="دنیای بی‌نهایت بازی">دنیای بی‌نهایت بازی</h2>
                <p class="hero-desc">خرید امن اکانت‌های قانونی PS4 و PS5 با گارانتی مادام‌العمر و تحویل آنی. تجربه گیمینگ بدون محدودیت را با GalaxyZone آغاز کنید.</p>
                <div class="cta-group">
                    <a href="#games-container" class="btn-primary glow-effect">مشاهده بازی‌ها</a>
                    <button id="pwa-install-desktop" class="btn-secondary hidden" onclick="window.app.pwa.install()">
                        <i class="fas fa-download"></i> دانلود اپلیکیشن
                    </button>
                </div>
                
                <!-- Stats Row -->
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-num">+1000</span>
                        <span class="stat-label">بازی موجود</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-num">24/7</span>
                        <span class="stat-label">پشتیبانی</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-num">100%</span>
                        <span class="stat-label">گارانتی</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Filters & Sorting -->
        <section class="filters container">
            <div class="filter-container glass-panel">
                <div class="filter-header">
                    <h3><i class="fas fa-sliders-h"></i> فیلتر و جستجو</h3>
                </div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label>پلتفرم</label>
                        <select id="filter-platform" onchange="window.app.inventory.applyFilters()">
                            <option value="all">همه پلتفرم‌ها</option>
                            <option value="PS5">PlayStation 5</option>
                            <option value="PS4">PlayStation 4</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>ظرفیت اکانت</label>
                        <select id="filter-capacity" onchange="window.app.inventory.applyFilters()">
                            <option value="all">همه ظرفیت‌ها</option>
                            <option value="2">ظرفیت ۲ (آفلاین/آنلاین)</option>
                            <option value="3">ظرفیت ۳ (آنلاین)</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>مرتب‌سازی</label>
                        <select id="sort-order" onchange="window.app.inventory.applyFilters()">
                            <option value="newest">جدیدترین‌ها</option>
                            <option value="price-asc">ارزان‌ترین</option>
                            <option value="price-desc">گران‌ترین</option>
                        </select>
                    </div>
                </div>
                <div class="filter-toggles">
                    <label class="checkbox-container">
                        <input type="checkbox" id="filter-stock" onchange="window.app.inventory.applyFilters()">
                        <span class="checkmark"></span>
                        فقط کالاهای موجود
                    </label>
                    <label class="checkbox-container">
                        <input type="checkbox" id="filter-plus" onchange="window.app.inventory.applyFilters()">
                        <span class="checkmark"></span>
                        دارای اشتراک پلاس
                    </label>
                </div>
            </div>
        </section>

        <!-- Featured Section -->
        <section id="featured-container" class="container section-gap hidden">
            <div class="section-header">
                <h3 class="section-title"><span>پیشنهادهای ویژه</span> <i class="fas fa-bolt highlight"></i></h3>
            </div>
            <div id="featured-grid" class="games-grid"></div>
        </section>

        <!-- Games Catalog -->
        <section id="games-container" class="container section-gap">
            <div class="section-header">
                <h3 class="section-title"><span>کاتالوگ بازی‌ها</span></h3>
            </div>
            <div id="games-grid" class="games-grid">
                <!-- Javascript will inject games here -->
            </div>
            <div id="no-results" class="no-results hidden">
                <i class="fas fa-ghost"></i>
                <p>هیچ بازی‌ای با این مشخصات پیدا نشد!</p>
            </div>
        </section>

        <!-- PS Plus Plans -->
        <section id="plus-container" class="container section-gap">
            <div class="section-header center-header">
                <h3 class="section-title"><span>اشتراک‌های PlayStation Plus</span></h3>
                <p>دسترسی به صدها بازی رایگان و امکان بازی آنلاین</p>
            </div>
            <div id="plus-grid" class="plus-grid">
                <!-- Javascript will inject plus cards here -->
            </div>
        </section>
    </main>

    <!-- Product Detail Modal -->
    <div id="product-modal" class="modal">
        <div class="modal-content glass-panel">
            <span class="close-modal" onclick="window.app.ui.closeModal()">&times;</span>
            <div class="modal-body" id="modal-details">
                <!-- Content injected via JS -->
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col about">
                    <h4>درباره GalaxyZone</h4>
                    <p>ما تیمی از گیمرهای حرفه‌ای هستیم که با هدف ارائه اکانت‌های قانونی و ارزان قیمت فعالیت می‌کنیم. امنیت کنسول شما اولویت ماست.</p>
                </div>
                <div class="footer-col links">
                    <h4>دسترسی سریع</h4>
                    <ul>
                        <li><a href="#hero">خانه</a></li>
                        <li><a href="#games-container">فروشگاه</a></li>
                        <li><a href="#">قوانین و مقررات</a></li>
                        <li><a href="#">سوالات متداول</a></li>
                    </ul>
                </div>
                <div class="footer-col contact">
                    <h4>ارتباط با ما</h4>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-telegram"></i></a>
                        <a href="#"><i class="fab fa-discord"></i></a>
                        <a href="#"><i class="fab fa-whatsapp"></i></a>
                    </div>
                    <p><i class="fas fa-envelope"></i> support@galaxyzone.ir</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2024 GalaxyZone. تمامی حقوق محفوظ است.</p>
                <div class="trust-icons">
                    <i class="fas fa-shield-alt"></i>
                    <i class="fas fa-lock"></i>
                    <i class="fab fa-cc-visa"></i>
                </div>
            </div>
        </div>
    </footer>

    <script src="/app.js"></script>
</body>
</html>
`;

// ============================================================
// SECTION 2: CSS STYLES (styles.css)
// Professional UI/UX with CSS Variables and Animations
// ============================================================
const cssContent = `
:root {
    /* Color Palette */
    --bg-deep: #050508;
    --bg-dark: #0a0a12;
    --bg-panel: rgba(22, 22, 35, 0.85);
    --bg-card: rgba(30, 30, 45, 0.6);
    
    --primary-neon: #00f3ff;  /* Cyan */
    --secondary-neon: #9d00ff; /* Purple */
    --accent-red: #ff3c3c;    /* Kratos Red */
    --accent-lime: #ccff00;   /* Lime Green */
    
    --text-main: #ffffff;
    --text-muted: #a0a0b0;
    --border-light: rgba(255, 255, 255, 0.08);
    
    /* Layout */
    --header-height: 70px;
    --border-radius: 12px;
    
    /* Fonts */
    --font-primary: 'Vazirmatn', sans-serif;
}

/* Reset & Base Styles */
* { box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
    background-color: var(--bg-deep);
    color: var(--text-main);
    font-family: var(--font-primary);
    overflow-x: hidden;
    line-height: 1.6;
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--primary-neon); }

/* --- Components --- */

/* Glassmorphism Panel */
.glass-panel {
    background: var(--bg-panel);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius);
}

/* Buttons */
.btn-primary {
    background: linear-gradient(135deg, var(--secondary-neon), #6a00ff);
    color: white; padding: 12px 28px; border-radius: 8px; border: none;
    font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex;
    align-items: center; gap: 8px; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 15px rgba(157, 0, 255, 0.3);
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(157, 0, 255, 0.5); }
.btn-primary:active { transform: scale(0.98); }

.btn-secondary {
    background: transparent; border: 2px solid var(--primary-neon); color: var(--primary-neon);
    padding: 10px 25px; border-radius: 8px; font-weight: 700; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px; transition: 0.3s;
}
.btn-secondary:hover { background: var(--primary-neon); color: #000; box-shadow: 0 0 15px var(--primary-neon); }

.glow-effect { animation: glowPulse 2s infinite; }
@keyframes glowPulse {
    0% { box-shadow: 0 0 5px var(--secondary-neon); }
    50% { box-shadow: 0 0 20px var(--secondary-neon); }
    100% { box-shadow: 0 0 5px var(--secondary-neon); }
}

/* --- Preloader --- */
#preloader {
    position: fixed; inset: 0; background: #000; z-index: 9999;
    display: flex; justify-content: center; align-items: center;
    transition: opacity 0.6s ease-out, visibility 0.6s;
}
.loading #preloader { opacity: 1; visibility: visible; }
body:not(.loading) #preloader { opacity: 0; visibility: hidden; pointer-events: none; }
.loader-content { text-align: center; }
.axe-spinner { 
    font-size: 4rem; color: var(--accent-red); margin-bottom: 20px;
    animation: spinAxe 1.5s infinite linear; filter: drop-shadow(0 0 10px var(--accent-red));
}
@keyframes spinAxe { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1); } }
.loading-text { font-size: 1.1rem; color: var(--text-muted); animation: pulse 1s infinite; }

/* --- 3D Canvas --- */
#gow-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; }
.vignette-overlay {
    position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background: radial-gradient(circle at center, transparent 0%, #050508 90%);
}

/* --- Header --- */
.main-header {
    position: sticky; top: 0; z-index: 1000; height: var(--header-height);
    background: rgba(5, 5, 8, 0.9); backdrop-filter: blur(15px);
    border-bottom: 1px solid var(--border-light);
    display: flex; align-items: center;
}
.container { max-width: 1300px; margin: 0 auto; padding: 0 20px; width: 100%; }
.header-inner { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.logo-area { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo-area h1 { font-size: 1.5rem; font-weight: 900; letter-spacing: 1px; }
.logo-icon { color: var(--secondary-neon); font-size: 1.8rem; }
.highlight { color: var(--primary-neon); text-shadow: 0 0 10px rgba(0,243,255,0.4); }

/* Search Bar */
.search-box { position: relative; flex: 1; max-width: 450px; }
.search-box input {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-light);
    color: white; padding: 10px 45px 10px 15px; border-radius: 50px;
    font-family: inherit; transition: 0.3s;
}
.search-box input:focus { border-color: var(--primary-neon); background: rgba(0,0,0,0.6); box-shadow: 0 0 10px rgba(0,243,255,0.1); }
.search-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
#clear-search {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;
}
.search-dropdown {
    position: absolute; top: 110%; left: 0; width: 100%;
    background: #151520; border: 1px solid var(--border-light);
    border-radius: 10px; overflow: hidden; max-height: 0; transition: max-height 0.3s;
    z-index: 1001; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.search-dropdown.active { max-height: 350px; overflow-y: auto; }
.search-item {
    display: flex; align-items: center; gap: 15px; padding: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.2s;
}
.search-item:hover { background: rgba(255,255,255,0.1); }
.search-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }

/* Navigation */
.desktop-nav { display: flex; gap: 25px; align-items: center; }
.nav-item { color: var(--text-muted); text-decoration: none; font-weight: 500; transition: 0.3s; position: relative; }
.nav-item:hover, .nav-item.active { color: var(--primary-neon); }
.nav-item::after {
    content: ''; position: absolute; bottom: -5px; right: 0; width: 0; height: 2px;
    background: var(--primary-neon); transition: 0.3s;
}
.nav-item:hover::after { width: 100%; }

.nav-icons { display: flex; gap: 15px; }
.nav-icon-btn {
    background: rgba(255,255,255,0.05); border: 1px solid var(--border-light);
    color: white; width: 40px; height: 40px; border-radius: 10px;
    cursor: pointer; position: relative; transition: 0.3s;
    display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.nav-icon-btn:hover { background: var(--primary-neon); color: black; border-color: var(--primary-neon); }
.badge {
    position: absolute; top: -5px; right: -5px;
    background: var(--accent-red); color: white;
    font-size: 0.7rem; padding: 2px 6px; border-radius: 10px;
    border: 2px solid var(--bg-deep); font-weight: bold;
}

.mobile-toggle { display: none; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }

/* --- Hero Section --- */
.hero { 
    min-height: 85vh; display: flex; align-items: center; justify-content: center; 
    text-align: center; position: relative; padding: 40px 20px;
}
.hero-content { z-index: 2; max-width: 900px; }
.hero-badge {
    display: inline-block; background: rgba(255,60,60,0.15); color: var(--accent-red);
    padding: 6px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px;
    border: 1px solid rgba(255,60,60,0.3);
}
.hero-title {
    font-size: 4rem; font-weight: 900; margin-bottom: 20px; line-height: 1.2;
    background: linear-gradient(to right, #fff, #b3b3b3); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-desc { font-size: 1.25rem; color: var(--text-muted); margin-bottom: 30px; max-width: 700px; margin-left: auto; margin-right: auto; }
.cta-group { display: flex; gap: 15px; justify-content: center; margin-bottom: 50px; }

.hero-stats {
    display: flex; justify-content: center; gap: 40px; border-top: 1px solid var(--border-light);
    padding-top: 30px; margin-top: 30px;
}
.stat-item { display: flex; flex-direction: column; }
.stat-num { font-size: 1.8rem; font-weight: 900; color: var(--primary-neon); }
.stat-label { font-size: 0.9rem; color: var(--text-muted); }

/* --- Filters --- */
.filter-container { padding: 25px; margin-bottom: 20px; }
.filter-header { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-light); }
.filter-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-group label { font-size: 0.9rem; color: var(--primary-neon); font-weight: bold; }
select {
    background: #0f0f15; color: white; border: 1px solid #333;
    padding: 12px; border-radius: 8px; font-family: inherit; cursor: pointer;
    transition: 0.3s;
}
select:hover { border-color: var(--primary-neon); }

.filter-toggles { margin-top: 20px; display: flex; gap: 20px; flex-wrap: wrap; }
.checkbox-container {
    display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;
}
.checkbox-container input { display: none; }
.checkmark {
    width: 20px; height: 20px; background: #222; border: 1px solid #444; border-radius: 4px;
    position: relative; transition: 0.2s;
}
.checkbox-container input:checked ~ .checkmark { background: var(--primary-neon); border-color: var(--primary-neon); }
.checkbox-container input:checked ~ .checkmark::after {
    content: '✔'; position: absolute; left: 4px; top: -2px; color: black; font-size: 14px;
}

/* --- Games Grid --- */
.section-gap { padding: 40px 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; }
.center-header { flex-direction: column; text-align: center; justify-content: center; }
.center-header p { color: var(--text-muted); margin-top: 10px; }
.section-title { font-size: 2rem; position: relative; padding-right: 15px; }
.section-title::before {
    content: ''; position: absolute; right: 0; top: 10%; height: 80%; width: 4px;
    background: var(--secondary-neon); border-radius: 2px; box-shadow: 0 0 10px var(--secondary-neon);
}

.games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
.no-results { text-align: center; grid-column: 1/-1; padding: 50px; background: var(--bg-panel); border-radius: 10px; }
.no-results i { font-size: 4rem; color: #333; margin-bottom: 20px; }

/* Game Card */
.game-card {
    background: var(--bg-card); border-radius: 16px; overflow: hidden;
    border: 1px solid var(--border-light); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex; flex-direction: column; position: relative;
}
.game-card:hover {
    transform: translateY(-10px); border-color: var(--primary-neon);
    box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 20px rgba(0, 243, 255, 0.1);
}
.card-image-wrapper { position: relative; height: 320px; overflow: hidden; cursor: pointer; }
.card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
.game-card:hover .card-img { transform: scale(1.1); }
.card-overlay {
    position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
    opacity: 0.8;
}

/* Card Badges */
.card-badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 2; }
.badge-item {
    padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;
    backdrop-filter: blur(5px);
}
.badge-stock { background: rgba(0,0,0,0.7); border: 1px solid; }
.badge-stock.in { color: var(--accent-lime); border-color: var(--accent-lime); }
.badge-stock.out { color: var(--accent-red); border-color: var(--accent-red); }
.badge-plus { background: #ffcc00; color: black; }

.card-content { padding: 15px; display: flex; flex-direction: column; flex: 1; border-top: 1px solid var(--border-light); }
.card-title { font-size: 1.1rem; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-meta { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; }
.card-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.card-price { font-size: 1.2rem; font-weight: 800; color: var(--primary-neon); }

.card-actions { display: flex; gap: 8px; }
.btn-icon {
    width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: 0.2s;
}
.btn-cart { background: var(--bg-deep); color: white; border: 1px solid #333; }
.btn-cart:hover { background: var(--secondary-neon); border-color: var(--secondary-neon); }
.btn-fav { background: transparent; color: #666; border: 1px solid #333; }
.btn-fav:hover { color: var(--accent-red); border-color: var(--accent-red); }
.btn-fav.active { color: var(--accent-red); background: rgba(255,60,60,0.1); border-color: var(--accent-red); }

/* --- Plus Plans --- */
.plus-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; }
.plus-card {
    border-radius: 16px; padding: 30px 20px; text-align: center; position: relative; overflow: hidden;
    transition: 0.3s; display: flex; flex-direction: column;
}
.plus-card:hover { transform: translateY(-10px); }

/* Plus Variants */
.plus-essential { background: linear-gradient(135deg, #a0a0a0, #e0e0e0); color: #222; }
.plus-extra { background: linear-gradient(135deg, #ffd700, #ffaa00); color: #222; }
.plus-premium { background: linear-gradient(135deg, #222, #444); color: white; border: 1px solid #ffd700; }
.plus-premium .price { color: #ffd700; }

.plus-icon { font-size: 3rem; margin-bottom: 15px; }
.plus-title { font-size: 1.5rem; font-weight: 900; margin-bottom: 5px; }
.plus-duration { font-size: 1.1rem; opacity: 0.8; margin-bottom: 20px; }
.plus-price { font-size: 1.8rem; font-weight: 900; margin-bottom: 20px; }
.btn-plus {
    width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
    background: rgba(0,0,0,0.8); color: white; transition: 0.3s;
}
.plus-premium .btn-plus { background: #ffd700; color: black; }
.btn-plus:hover { transform: scale(1.05); }

/* --- Sidebars --- */
.sidebar {
    position: fixed; top: 0; bottom: 0; width: 380px; background: #12121a; z-index: 2000;
    display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 0 50px rgba(0,0,0,0.8);
}
#cart-sidebar { left: 0; transform: translateX(-100%); border-right: 1px solid #333; }
#wishlist-sidebar { right: 0; transform: translateX(100%); border-left: 1px solid #333; }
.sidebar.active { transform: translateX(0); }

.sidebar-header {
    padding: 20px; background: #1a1a25; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #333;
}
.sidebar-content { flex: 1; overflow-y: auto; padding: 20px; }
.sidebar-footer { padding: 25px; background: #1a1a25; border-top: 1px solid #333; }

.cart-item {
    display: flex; gap: 15px; background: rgba(255,255,255,0.03); padding: 10px;
    border-radius: 10px; margin-bottom: 15px; position: relative;
}
.cart-item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; }
.cart-item-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.cart-item-title { font-size: 0.95rem; font-weight: bold; color: white; }
.cart-item-price { color: var(--primary-neon); font-size: 0.9rem; }
.cart-remove {
    background: none; border: none; color: #666; cursor: pointer; font-size: 1.1rem;
    position: absolute; left: 10px; top: 10px;
}
.cart-remove:hover { color: var(--accent-red); }

.summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-muted); }
.summary-row.total { color: white; font-weight: bold; font-size: 1.2rem; margin-top: 15px; padding-top: 15px; border-top: 1px solid #333; }
.price-text { color: var(--accent-lime); }
.btn-checkout {
    width: 100%; background: #25D366; color: white; border: none; padding: 14px;
    border-radius: 8px; font-weight: bold; margin-bottom: 10px; cursor: pointer;
    display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 1rem;
}
.btn-clear-cart {
    width: 100%; background: transparent; border: 1px solid #444; color: #888;
    padding: 10px; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.btn-clear-cart:hover { border-color: var(--accent-red); color: var(--accent-red); }

#overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1500;
    opacity: 0; pointer-events: none; transition: 0.3s; backdrop-filter: blur(4px);
}
#overlay.active { opacity: 1; pointer-events: auto; }

/* --- Mobile Menu --- */
.mobile-menu-overlay {
    position: fixed; inset: 0; background: rgba(10,10,15,0.98); z-index: 2500;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: 0.3s;
}
.mobile-menu-overlay.active { opacity: 1; pointer-events: auto; }
.mobile-menu-content { display: flex; flex-direction: column; align-items: center; gap: 25px; width: 100%; }
.mobile-logo { font-size: 2rem; font-weight: 900; margin-bottom: 20px; }
.mobile-menu-content a { color: white; text-decoration: none; font-size: 1.4rem; font-weight: 500; display: flex; align-items: center; gap: 10px; }
.mobile-menu-content a:hover { color: var(--primary-neon); }
.close-menu { position: absolute; top: 20px; left: 20px; background: none; border: none; color: white; font-size: 2rem; }
.mobile-divider { width: 50%; border: 0; border-top: 1px solid #333; }
.mobile-install { margin-top: 20px; }

/* --- Modal --- */
.modal {
    display: none; position: fixed; z-index: 3000; inset: 0;
    background-color: rgba(0,0,0,0.9); align-items: center; justify-content: center;
    padding: 20px; animation: fadeIn 0.3s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content {
    width: 100%; max-width: 700px; padding: 0; border-radius: 16px; position: relative;
    max-height: 90vh; overflow-y: auto;
}
.close-modal {
    position: absolute; left: 15px; top: 15px; color: white; font-size: 2rem; z-index: 10; cursor: pointer;
    background: rgba(0,0,0,0.5); width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
}
.modal-body { display: flex; flex-direction: column; }
.modal-hero { width: 100%; height: 300px; object-fit: cover; }
.modal-info { padding: 25px; }
.modal-title { font-size: 1.8rem; margin-bottom: 10px; }
.modal-tags { display: flex; gap: 10px; margin-bottom: 20px; }
.tag { padding: 5px 10px; background: #222; border-radius: 5px; font-size: 0.8rem; border: 1px solid #444; }
.modal-desc { color: #ccc; margin-bottom: 25px; line-height: 1.7; }
.modal-price-box {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;
}

/* --- Toasts --- */
#toast-container { position: fixed; bottom: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 15px; }
.toast {
    background: #1a1a25; color: white; padding: 16px 20px; border-radius: 8px;
    display: flex; align-items: center; gap: 12px; min-width: 300px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-right: 4px solid;
    animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.toast.success { border-color: var(--accent-lime); }
.toast.error { border-color: var(--accent-red); }
.toast i { font-size: 1.2rem; }
.toast.success i { color: var(--accent-lime); }
.toast.error i { color: var(--accent-red); }

/* --- Footer --- */
.footer { background: #020203; border-top: 1px solid #111; padding: 60px 0 20px; margin-top: 60px; }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px; }
.footer h4 { color: white; margin-bottom: 20px; font-size: 1.2rem; position: relative; padding-bottom: 10px; }
.footer h4::after { content: ''; position: absolute; right: 0; bottom: 0; width: 40px; height: 3px; background: var(--secondary-neon); }
.footer p, .footer a { color: #777; line-height: 1.8; text-decoration: none; transition: 0.3s; }
.footer a:hover { color: var(--primary-neon); padding-right: 5px; }
.footer ul { list-style: none; }
.footer ul li { margin-bottom: 10px; }
.social-links { display: flex; gap: 15px; margin-bottom: 15px; }
.social-links a { font-size: 1.5rem; color: #fff; background: #111; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.social-links a:hover { background: var(--secondary-neon); color: white; transform: translateY(-5px); }

.footer-bottom { border-top: 1px solid #111; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
.trust-icons { font-size: 1.5rem; color: #444; display: flex; gap: 15px; }

/* Responsive adjustments */
@media (max-width: 992px) {
    .desktop-nav, .search-box { display: none; }
    .mobile-toggle { display: block; }
    .hero-title { font-size: 3rem; }
    .sidebar { width: 90%; }
}
@media (max-width: 600px) {
    .hero-title { font-size: 2.5rem; }
    .hero-stats { gap: 20px; }
    .section-header { flex-direction: column; text-align: center; gap: 10px; }
    .section-title::before { display: none; }
}
`;

// ============================================================
// SECTION 3: JAVASCRIPT CORE (app.js)
// Modular OOP Architecture
// ============================================================
const jsContent = `
/**
 * GALAXY ZONE ENGINE
 * 
 * Modules:
 * 1. Database: Static product data
 * 2. VisualEngine: Three.js background logic
 * 3. InventoryManager: Cart & Wishlist logic with LocalStorage
 * 4. UIManager: DOM manipulation, rendering, and interaction
 * 5. PWAManager: Installation handling
 */

// --- 1. Database (Product Data) ---
const DB = {
    games: [], // Populated at runtime from the secure /games API endpoint
    plus: [
        { id: 101, title: "PS Plus Essential", duration: "1 ماهه", price: 350000, type: "Essential", icon: "fa-star" },
        { id: 102, title: "PS Plus Extra", duration: "3 ماهه", price: 1400000, type: "Extra", icon: "fa-star-half-alt" },
        { id: 103, title: "PS Plus Premium", duration: "12 ماهه", price: 5200000, type: "Premium", icon: "fa-crown" }
    ]
};

// --- 2. Visual Engine (Three.js Background) ---
class VisualEngine {
    constructor() {
        this.canvas = document.getElementById('gow-canvas');
        if (!this.canvas) return;
        this.init();
    }

    init() {
        // Scene Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize perf
        this.camera.position.z = 15;

        // Particles 1: Fimbulwinter Snow (Cyan/White)
        const snowGeo = new THREE.BufferGeometry();
        const snowCount = 1500;
        const snowPos = new Float32Array(snowCount * 3);
        const snowVel = [];

        for(let i=0; i<snowCount*3; i++) {
            snowPos[i] = (Math.random() - 0.5) * 80;
        }
        for(let i=0; i<snowCount; i++) {
            snowVel.push({
                x: (Math.random() - 0.5) * 0.05,
                y: -(Math.random() * 0.1 + 0.05), // Falling down
                z: (Math.random() - 0.5) * 0.05
            });
        }
        snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
        const snowMat = new THREE.PointsMaterial({
            color: 0x00f3ff, size: 0.1, transparent: true, opacity: 0.6
        });
        this.snowSystem = new THREE.Points(snowGeo, snowMat);
        this.scene.add(this.snowSystem);

        // Particles 2: Chaos Embers (Red/Orange)
        const ashGeo = new THREE.BufferGeometry();
        const ashCount = 400;
        const ashPos = new Float32Array(ashCount * 3);
        const ashVel = [];

        for(let i=0; i<ashCount*3; i+=3) {
            ashPos[i] = (Math.random() - 0.5) * 50;
            ashPos[i+1] = -25 + Math.random() * 20; // Bottom area
            ashPos[i+2] = (Math.random() - 0.5) * 30;
        }
        for(let i=0; i<ashCount; i++) {
            ashVel.push({
                x: (Math.random() - 0.5) * 0.02,
                y: Math.random() * 0.08 + 0.02, // Rising up
                z: (Math.random() - 0.5) * 0.02
            });
        }
        ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPos, 3));
        const ashMat = new THREE.PointsMaterial({
            color: 0xff3c3c, size: 0.15, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        this.ashSystem = new THREE.Points(ashGeo, ashMat);
        this.scene.add(this.ashSystem);

        this.snowVel = snowVel;
        this.ashVel = ashVel;
        
        // Mouse Parallax
        this.mouseX = 0;
        this.mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => this.onResize());
        
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update Snow
        const sPos = this.snowSystem.geometry.attributes.position.array;
        for(let i=0; i<this.snowVel.length; i++) {
            sPos[i*3] += this.snowVel[i].x;
            sPos[i*3+1] += this.snowVel[i].y;
            sPos[i*3+2] += this.snowVel[i].z;
            
            // Reset if out of bounds
            if(sPos[i*3+1] < -25) {
                sPos[i*3+1] = 25;
            }
        }
        this.snowSystem.geometry.attributes.position.needsUpdate = true;

        // Update Ash
        const aPos = this.ashSystem.geometry.attributes.position.array;
        for(let i=0; i<this.ashVel.length; i++) {
            aPos[i*3] += this.ashVel[i].x;
            aPos[i*3+1] += this.ashVel[i].y;
            
            if(aPos[i*3+1] > 25) {
                aPos[i*3+1] = -25;
            }
        }
        this.ashSystem.geometry.attributes.position.needsUpdate = true;

        // Parallax Camera
        this.camera.position.x += (this.mouseX * 1 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouseY * 1 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// --- 3. Inventory Manager (Logic) ---
class InventoryManager {
    constructor(ui) {
        this.ui = ui;
        this.games = []; // Always hydrated from the backend API to avoid stale/static data
        this.cart = JSON.parse(localStorage.getItem('gz_cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('gz_wishlist')) || [];
    }

    init() {
        // Securely hydrate products from the Worker API instead of static JSON
        this.loadGamesFromApi();
        this.ui.updateCartUI(this.cart);
        this.ui.updateWishlistUI(this.wishlist);
        
        // Setup Search
        const searchInput = document.getElementById('global-search');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('clear-search').addEventListener('click', () => {
            searchInput.value = '';
            this.handleSearch('');
        });
    }

    async loadGamesFromApi() {
        try {
            const response = await fetch('/games', { headers: { 'Accept': 'application/json' } });
            if (!response.ok) throw new Error('Failed to load games');

            const { games = [] } = await response.json();

            const flattened = [];
            games.forEach((g) => {
                const variants = g.variants && g.variants.length
                    ? g.variants
                    : [{ id: g.id, platform: g.platform, capacity: g.capacity, price: g.price, stock: g.stock }];

                variants.forEach((v) => {
                    const rawId = v.id || (g.id + '-' + v.platform + '-' + v.capacity);
                    flattened.push({
                        id: Number(String(rawId).replace(/\D/g, '')),
                        gameId: Number(g.id),
                        title: g.title,
                        platform: v.platform,
                        region: g.region,
                        capacity: Number(v.capacity),
                        stock: Number(v.stock),
                        price: Number(v.price),
                        oldPrice: v.old_price ? Number(v.old_price) : null,
                        image: g.image_url || 'https://via.placeholder.com/800x600?text=No+Image',
                        isPlusIncluded: Boolean(g.is_plus),
                        isFeatured: Boolean(g.is_plus),
                        desc: g.description || g.seo_description || CONFIG.DEFAULT_META_DESCRIPTION,
                        variantLabel: v.platform + ' ظرفیت ' + v.capacity,
                    });
                });
            });

            this.games = flattened;

            // Keep legacy access points in sync for UI helpers
            DB.games = this.games;
            this.applyFilters();
        } catch (err) {
            console.error('Game fetch failed', err);
            this.ui.showToast('خطا در بارگذاری بازی‌ها. لطفاً دوباره تلاش کنید.', 'error');
        }
    }

    applyFilters() {
        const pFilter = document.getElementById('filter-platform').value;
        const cFilter = document.getElementById('filter-capacity').value;
        const sort = document.getElementById('sort-order').value;
        const stockOnly = document.getElementById('filter-stock').checked;
        const plusOnly = document.getElementById('filter-plus').checked;

        let filtered = [...this.games];

        // Filters
        if (pFilter !== 'all') filtered = filtered.filter(g => g.platform === pFilter);
        if (cFilter !== 'all') filtered = filtered.filter(g => g.capacity.toString() === cFilter);
        if (stockOnly) filtered = filtered.filter(g => g.stock > 0);
        if (plusOnly) filtered = filtered.filter(g => g.isPlusIncluded);

        // Sorting
        if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        else if (sort === 'newest') filtered.reverse(); // Simplified newest logic

        // Render
        this.ui.renderGames(filtered);
        this.ui.renderFeatured(this.games.filter(g => g.isFeatured));
        this.ui.renderPlus(DB.plus);
    }

    handleSearch(query) {
        const resultsBox = document.getElementById('search-results');
        const clearBtn = document.getElementById('clear-search');
        
        if (!query.trim()) {
            resultsBox.classList.remove('active');
            clearBtn.classList.add('hidden');
            return;
        }

        clearBtn.classList.remove('hidden');
        const lowerQ = query.toLowerCase();
        const results = this.games.filter(g => g.title.toLowerCase().includes(lowerQ));

        this.ui.renderSearchResults(results);
    }

    addToCart(id, type) {
        const source = type === 'game' ? this.games : DB.plus;
        const item = source.find(x => x.id === id);
        
        if (!item) return;
        if (type === 'game' && item.stock <= 0) {
            this.ui.showToast('موجودی این محصول به پایان رسیده است.', 'error');
            return;
        }

        const existing = this.cart.find(x => x.id === id && x.type === type);
        if (existing) {
            this.ui.showToast('این محصول قبلاً در سبد خرید وجود دارد.', 'error');
        } else {
            this.cart.push({ ...item, type, qty: 1 });
            this.saveData();
            this.ui.updateCartUI(this.cart);
            this.ui.toggleCart(true);
            this.ui.showToast(\`\${item.title} به سبد اضافه شد.\`, 'success');
        }
    }

    removeFromCart(id) {
        this.cart = this.cart.filter(x => x.id !== id);
        this.saveData();
        this.ui.updateCartUI(this.cart);
        this.ui.showToast('محصول حذف شد.', 'error');
    }

    clearCart() {
        if(this.cart.length === 0) return;
        if(confirm("آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟")) {
            this.cart = [];
            this.saveData();
            this.ui.updateCartUI(this.cart);
            this.ui.showToast('سبد خرید خالی شد.', 'success');
        }
    }

    toggleWishlist(id) {
        const index = this.wishlist.indexOf(id);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.ui.showToast('از لیست علاقه حذف شد.');
        } else {
            this.wishlist.push(id);
            this.ui.showToast('به لیست علاقه اضافه شد.', 'success');
        }
        this.saveData();
        this.ui.updateWishlistUI(this.wishlist);
        this.applyFilters(); // Re-render to update icons
    }

    saveData() {
        localStorage.setItem('gz_cart', JSON.stringify(this.cart));
        localStorage.setItem('gz_wishlist', JSON.stringify(this.wishlist));
    }

    checkout() {
        if (this.cart.length === 0) {
            this.ui.showToast('سبد خرید خالی است!', 'error');
            return;
        }
        
        let msg = "سلام GalaxyZone، درخواست خرید موارد زیر را دارم:%0A%0A";
        let total = 0;
        this.cart.forEach((item, index) => {
            msg += \`\${index + 1}. \${item.title} (\${item.variantLabel || item.platform || item.duration}) - \${item.price.toLocaleString()}\%0A\`;
            total += item.price;
        });
        
        msg += \`%0A🔹 جمع کل: \${total.toLocaleString()} تومان\`;
        
        // Whatsapp Link
        const phone = "989123456789"; 
        window.open(\`https://wa.me/\${phone}?text=\${msg}\`, '_blank');
    }
}

// --- 4. UI Manager (DOM) ---
class UIManager {
    constructor() {
        // Elements
        this.elems = {
            gameGrid: document.getElementById('games-grid'),
            featuredGrid: document.getElementById('featured-grid'),
            featuredContainer: document.getElementById('featured-container'),
            plusGrid: document.getElementById('plus-grid'),
            cartContent: document.getElementById('cart-content'),
            cartBadge: document.getElementById('cart-badge'),
            cartTotal: document.getElementById('cart-total'),
            cartCountTotal: document.getElementById('cart-count-total'),
            wishContent: document.getElementById('wishlist-content'),
            wishBadge: document.getElementById('wishlist-badge'),
            searchResults: document.getElementById('search-results'),
            productModal: document.getElementById('product-modal'),
            modalDetails: document.getElementById('modal-details'),
            overlay: document.getElementById('overlay'),
            noResults: document.getElementById('no-results')
        };
        
        this.inventory = null; // Will be linked later
    }

    linkInventory(inv) {
        this.inventory = inv;
    }

    renderGames(games) {
        this.elems.gameGrid.innerHTML = '';
        
        if (games.length === 0) {
            this.elems.noResults.classList.remove('hidden');
        } else {
            this.elems.noResults.classList.add('hidden');
            games.forEach(game => {
                const card = this.createGameCard(game);
                this.elems.gameGrid.appendChild(card);
            });
        }
    }

    renderFeatured(games) {
        this.elems.featuredGrid.innerHTML = '';
        if(games.length > 0) {
            this.elems.featuredContainer.classList.remove('hidden');
            games.forEach(game => {
                const card = this.createGameCard(game);
                this.elems.featuredGrid.appendChild(card);
            });
        } else {
            this.elems.featuredContainer.classList.add('hidden');
        }
    }

    createGameCard(game) {
        const isLiked = this.inventory.wishlist.includes(game.id);
        const inStock = game.stock > 0;
        const capacityLabel = 'ظرفیت ' + game.capacity;

        const div = document.createElement('div');
        div.className = 'game-card';
        div.innerHTML =
            '<div class="card-image-wrapper" onclick="window.app.ui.openProductModal(' + game.id + ')">' +
                '<img src="' + game.image + '" alt="' + game.title + '" class="card-img" loading="lazy">' +
                '<div class="card-overlay"></div>' +
                '<div class="card-badges">' +
                    '<span class="badge-item badge-stock ' + (inStock ? 'in' : 'out') + '">' +
                        (inStock ? 'موجود: ' + game.stock : 'ناموجود') +
                    '</span>' +
                    (game.isPlusIncluded ? '<span class="badge-item badge-plus">+Plus</span>' : '') +
                '</div>' +
            '</div>' +
            '<div class="card-content">' +
                '<h4 class="card-title">' + game.title + '</h4>' +
                '<div class="card-meta">' +
                    '<span><i class="fab fa-playstation"></i> ' + game.platform + '</span>' +
                    '<span><i class="fas fa-globe"></i> ' + game.region + '</span>' +
                    '<span>' + capacityLabel + '</span>' +
                '</div>' +
                '<div class="card-footer">' +
                    '<span class="card-price">' + game.price.toLocaleString() + '</span>' +
                    '<div class="card-actions">' +
                        '<button class="btn-icon btn-fav ' + (isLiked ? 'active' : '') + '" onclick="window.app.inventory.toggleWishlist(' + game.id + ')">' +
                            '<i class="' + (isLiked ? 'fas' : 'far') + ' fa-heart"></i>' +
                        '</button>' +
                        '<button class="btn-icon btn-cart" ' + (!inStock ? 'disabled style="opacity:0.5"' : '') + ' onclick="window.app.inventory.addToCart(' + game.id + ', \"game\")">' +
                            '<i class="fas fa-plus"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        return div;
    }

    renderPlus(plans) {
        this.elems.plusGrid.innerHTML = '';
        plans.forEach(plan => {
            const div = document.createElement('div');
            // Determine class based on type
            const typeClass = plan.type === 'Premium' ? 'plus-premium' : (plan.type === 'Extra' ? 'plus-extra' : 'plus-essential');
            
            div.className = \`plus-card \${typeClass}\`;
            div.innerHTML = \`
                <div class="plus-icon"><i class="fas \${plan.icon}"></i></div>
                <h3 class="plus-title">\${plan.title}</h3>
                <span class="plus-duration">\${plan.duration}</span>
                <div class="plus-price">\${plan.price.toLocaleString()}</div>
                <button class="btn-plus" onclick="window.app.inventory.addToCart(\${plan.id}, 'plus')">افزودن به سبد</button>
            \`;
            this.elems.plusGrid.appendChild(div);
        });
    }

    renderSearchResults(results) {
        this.elems.searchResults.innerHTML = '';

        if (results.length > 0) {
            this.elems.searchResults.classList.add('active');
            results.forEach(item => {
                const variantLabel = item.variantLabel || item.platform + ' | ظرفیت ' + item.capacity;
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML =
                    '<img src="' + item.image + '" alt="">' +
                    '<div>' +
                        '<div style="font-weight:bold">' + item.title + '</div>' +
                        '<div style="font-size:0.8rem;color:#aaa">' + variantLabel + ' | ' + item.price.toLocaleString() + '</div>' +
                    '</div>';
                div.onclick = () => {
                    this.openProductModal(item.id);
                    this.elems.searchResults.classList.remove('active');
                };
                this.elems.searchResults.appendChild(div);
            });
        } else {
            this.elems.searchResults.classList.remove('active');
        }
    }

    updateCartUI(cart) {
        this.elems.cartBadge.innerText = cart.length;
        this.elems.cartBadge.classList.toggle('hidden', cart.length === 0);
        this.elems.cartCountTotal.innerText = cart.length;

        this.elems.cartContent.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            this.elems.cartContent.innerHTML = '<div style="text-align:center;padding:20px;color:#666"><i class="fas fa-shopping-basket" style="font-size:3rem;margin-bottom:10px"></i><p>سبد شما خالی است</p></div>';
        }

        cart.forEach(item => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = \`
                <img src="\${item.image || 'https://via.placeholder.com/60'}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">\${item.title}</div>
                    <div class="cart-item-price">\${item.price.toLocaleString()} تومان</div>
                    <div style="font-size:0.8rem;color:#888">\${item.platform || item.duration}</div>
                </div>
                <button class="cart-remove" onclick="window.app.inventory.removeFromCart(\${item.id})"><i class="fas fa-trash-alt"></i></button>
            \`;
            this.elems.cartContent.appendChild(div);
        });

        this.elems.cartTotal.innerText = total.toLocaleString() + ' تومان';
    }

    updateWishlistUI(wishlist) {
        this.elems.wishBadge.innerText = wishlist.length;
        this.elems.wishBadge.classList.toggle('hidden', wishlist.length === 0);
        
        this.elems.wishContent.innerHTML = '';
        if(wishlist.length === 0) {
            this.elems.wishContent.innerHTML = '<div style="text-align:center;padding:20px;color:#666"><p>لیست علاقه خالی است</p></div>';
        }

        wishlist.forEach(id => {
            const item = (this.inventory?.games || []).find(g => g.id === id);
            if(item) {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = \`
                    <img src="\${item.image}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">\${item.title}</div>
                        <button class="btn-secondary" style="font-size:0.8rem;padding:5px 10px;margin-top:5px" onclick="window.app.inventory.addToCart(\${item.id}, 'game');window.app.ui.toggleWishlist()">افزودن به سبد</button>
                    </div>
                    <button class="cart-remove" onclick="window.app.inventory.toggleWishlist(\${item.id})"><i class="fas fa-times"></i></button>
                \`;
                this.elems.wishContent.appendChild(div);
            }
        });
    }

    // --- Interaction Methods ---
    toggleCart(forceOpen) {
        const sidebar = document.getElementById('cart-sidebar');
        this.toggleSidebar(sidebar, forceOpen);
        document.getElementById('wishlist-sidebar').classList.remove('active');
    }

    toggleWishlist(forceOpen) {
        const sidebar = document.getElementById('wishlist-sidebar');
        this.toggleSidebar(sidebar, forceOpen);
        document.getElementById('cart-sidebar').classList.remove('active');
    }

    toggleSidebar(el, forceOpen) {
        if(forceOpen === true) {
            el.classList.add('active');
            this.elems.overlay.classList.add('active');
        } else {
            el.classList.toggle('active');
            this.elems.overlay.classList.toggle('active');
        }
    }

    closeAllSidebars() {
        document.getElementById('cart-sidebar').classList.remove('active');
        document.getElementById('wishlist-sidebar').classList.remove('active');
        this.elems.overlay.classList.remove('active');
        document.getElementById('mobile-menu').classList.remove('active');
        this.elems.searchResults.classList.remove('active');
    }

    toggleMobileMenu() {
        document.getElementById('mobile-menu').classList.toggle('active');
    }

    openProductModal(id) {
        const item = (this.inventory?.games || []).find(g => g.id === id);
        if(!item) return;

        const modalCapacity = item.variantLabel || ('Capacity ' + item.capacity);
        this.elems.modalDetails.innerHTML =
            '<img src="' + item.image + '" class="modal-hero">' +
            '<div class="modal-info">' +
                '<h2 class="modal-title">' + item.title + '</h2>' +
                '<div class="modal-tags">' +
                    '<span class="tag">' + item.platform + '</span>' +
                    '<span class="tag">Region ' + item.region + '</span>' +
                    '<span class="tag">' + modalCapacity + '</span>' +
                '</div>' +
                '<p class="modal-desc">' + item.desc + '</p>' +
                '<div class="modal-price-box">' +
                    '<span style="font-size:1.5rem;font-weight:bold;color:#00f3ff">' + item.price.toLocaleString() + ' تومان</span>' +
                    '<button class="btn-primary" onclick="window.app.inventory.addToCart(' + item.id + ', \"game\");window.app.ui.closeModal()">' +
                        '<i class="fas fa-shopping-cart"></i> خرید کنید' +
                    '</button>' +
                '</div>' +
            '</div>';
        this.elems.productModal.style.display = 'flex';
    }

    closeModal() {
        this.elems.productModal.style.display = 'none';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = \`toast \${type}\`;
        
        let icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        if(type === 'error') icon = 'fa-exclamation-triangle';

        toast.innerHTML = \`<i class="fas \${icon}"></i> <span>\${message}</span>\`;
        container.appendChild(toast);
        
        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
}

// --- 5. PWA Manager ---
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        // Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW Registered'))
                    .catch(err => console.log('SW Failed', err));
            });
        }

        // Install Prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            // Show buttons
            document.getElementById('pwa-install-desktop').classList.remove('hidden');
            document.getElementById('mobile-install-btn').classList.remove('hidden');
        });

        window.addEventListener('appinstalled', () => {
            console.log('App Installed');
            this.deferredPrompt = null;
            document.getElementById('pwa-install-desktop').classList.add('hidden');
            document.getElementById('mobile-install-btn').classList.add('hidden');
        });
    }

    install() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted install');
                }
                this.deferredPrompt = null;
            });
        }
    }
}

// --- 6. Bootstrapper ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Instantiate Core Modules
    const ui = new UIManager();
    const inventory = new InventoryManager(ui);
    const vfx = new VisualEngine();
    const pwa = new PWAManager();

    // 2. Link Dependencies
    ui.linkInventory(inventory);

    // 3. Initialize App
    inventory.init();

    // 4. Global Access for HTML Event Handlers
    window.app = { ui, inventory, pwa, vfx };

    // 5. Remove Preloader
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 800);
});
`;

// ============================================================
// SECTION 4: MANIFEST (manifest.webmanifest)
// ============================================================
const manifestContent = JSON.stringify({
    "name": "GalaxyZone | Gaming Store",
    "short_name": "GalaxyZone",
    "description": "Buy PS5/PS4 Accounts & PS Plus.",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "background_color": "#050508",
    "theme_color": "#00f3ff",
    "orientation": "portrait-primary",
    "icons": [
        {
            "src": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=192&auto=format&fit=crop",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=512&auto=format&fit=crop",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
});

// ============================================================
// SECTION 5: SERVICE WORKER (sw.js)
// Stale-While-Revalidate Strategy for best performance
// ============================================================
const swContent = `
const CACHE_NAME = 'galaxy-zone-v4-spartan';
const ASSETS_TO_CACHE = [
    '/',
    '/styles.css',
    '/app.js',
    '/manifest.webmanifest',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;300;400;500;700;900&display=swap'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching Assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Strategy: Stale-While-Revalidate
            // Return cached response immediately if available
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Update the cache with the fresh response
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If network fails and no cache, just return undefined (browser handles error)
            });

            return cachedResponse || fetchPromise;
        })
    );
});
`;
