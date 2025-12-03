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

// ============================================================
// SECTION 0: CONFIG & HELPERS (Non-destructive additions)
// ============================================================
// NOTE: Existing logic remains untouched. New helpers live alongside
// the legacy PWA routes to enable D1-powered admin tooling.

const CONFIG = {
  ADMIN_USERNAME: "Sardar",
  ADMIN_PASSWORD: "Sardar2266",
  ADMIN_SESSION_COOKIE: "admin_session",
  SESSION_VALUE: "galaxyzone-admin",
  COOKIE_MAX_AGE: 60 * 60 * 24, // 1 day
  DEFAULT_META_DESCRIPTION: "فروش ویژه بازی‌ها و اکانت‌های PS4/PS5 با تحویل فوری و ضمانت.",
};

// Example wrangler.toml binding for D1 (comment only, keep env.DB)
// [[d1_databases]]
// binding = "DB"
// database_name = "games-db"
// database_id = "<your-database-id>"

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=UTF-8", ...headers },
  });
}

function htmlResponse(html, status = 200, headers = {}) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html;charset=UTF-8", ...headers },
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
  if (filters.platform) {
    conditions.push("platform = ?");
    params.push(filters.platform);
  }
  if (filters.region) {
    conditions.push("region = ?");
    params.push(filters.region);
  }
  if (filters.capacity) {
    conditions.push("capacity = ?");
    params.push(filters.capacity);
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
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const stmt = env.DB.prepare(`SELECT * FROM games ${where} ORDER BY id DESC`);
  const result = await stmt.bind(...params).all();
  return result.results || [];
}

async function getGameById(env, id) {
  const stmt = env.DB.prepare("SELECT * FROM games WHERE id = ? LIMIT 1");
  const result = await stmt.bind(id).first();
  return result || null;
}

async function createGame(env, data) {
  const stmt = env.DB.prepare(`
    INSERT INTO games (
      title, platform, region, capacity, is_plus, price, stock, active,
      image_url, description, seo_title, seo_description, seo_tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  await stmt.bind(
    data.title,
    data.platform,
    data.region,
    data.capacity,
    data.is_plus ? 1 : 0,
    data.price,
    data.stock,
    data.active ? 1 : 0,
    data.image_url || null,
    data.description || null,
    data.seo_title || null,
    data.seo_description || null,
    data.seo_tags || null,
  ).run();
}

async function updateGame(env, id, data) {
  const stmt = env.DB.prepare(`
    UPDATE games SET
      title = ?, platform = ?, region = ?, capacity = ?, is_plus = ?, price = ?,
      stock = ?, active = ?, image_url = ?, description = ?, seo_title = ?,
      seo_description = ?, seo_tags = ?
    WHERE id = ?
  `);
  await stmt.bind(
    data.title,
    data.platform,
    data.region,
    data.capacity,
    data.is_plus ? 1 : 0,
    data.price,
    data.stock,
    data.active ? 1 : 0,
    data.image_url || null,
    data.description || null,
    data.seo_title || null,
    data.seo_description || null,
    data.seo_tags || null,
    id,
  ).run();
}

async function softDeleteGame(env, id) {
  const stmt = env.DB.prepare("UPDATE games SET active = 0 WHERE id = ?");
  await stmt.bind(id).run();
}

async function updateStock(env, id, newStock) {
  const stmt = env.DB.prepare("UPDATE games SET stock = ? WHERE id = ?");
  await stmt.bind(newStock, id).run();
}

// ============================================================
// SECTION 2: SERVICE / BUSINESS LOGIC
// ============================================================

function normalizeGamePayload(data) {
  const requiredFields = ["title", "platform", "region", "capacity", "price", "stock"];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  const capacityNumber = Number(data.capacity);
  const priceNumber = Number(data.price);
  const stockNumber = Number(data.stock);
  return {
    title: data.title,
    platform: data.platform,
    region: data.region,
    capacity: Number.isNaN(capacityNumber) ? 0 : capacityNumber,
    is_plus: parseBoolean(data.is_plus),
    price: Number.isNaN(priceNumber) ? 0 : priceNumber,
    stock: Number.isNaN(stockNumber) ? 0 : stockNumber,
    active: parseBoolean(data.active ?? true),
    image_url: data.image_url || "",
    description: data.description || "",
    seo_title: data.seo_title || data.title,
    seo_description: data.seo_description || data.description || CONFIG.DEFAULT_META_DESCRIPTION,
    seo_tags: data.seo_tags || "",
  };
}

async function listPublicGames(env, filters = {}) {
  const games = await getAllGames(env, { ...filters, active: true });
  return games.map((g) => ({
    ...g,
    is_plus: Boolean(g.is_plus),
    out_of_stock: Number(g.stock) <= 0,
    display_price: formatPrice(g.price),
    seo_title: g.seo_title || g.title,
    seo_description: g.seo_description || g.description || CONFIG.DEFAULT_META_DESCRIPTION,
  }));
}

async function listAdminGames(env, filters = {}) {
  const games = await getAllGames(env, filters);
  return games.map((g) => ({ ...g, is_plus: Boolean(g.is_plus) }));
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
      maxAge: CONFIG.COOKIE_MAX_AGE,
    });
    return redirectResponse("/admin", 302, { "Set-Cookie": cookie });
  }
  return htmlResponse(renderAdminLoginPage("نام کاربری یا رمز عبور اشتباه است"), 401);
}

function handleLogout() {
  const cookie = serializeCookie(CONFIG.ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return redirectResponse("/admin/login", 302, { "Set-Cookie": cookie });
}

// ============================================================
// SECTION 4: HTML RENDER HELPERS
// ============================================================

function renderLayout(content, { title = "GalaxyZone Admin", metaDescription = CONFIG.DEFAULT_META_DESCRIPTION } = {}) {
  return `<!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${metaDescription}" />
    <style>
      body { font-family: 'Vazirmatn', sans-serif; background:#0b0d1a; color:#e9ecf5; margin:0; padding:0; }
      header { background:#101531; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:10; }
      a { color:#6be1ff; text-decoration:none; }
      table { width:100%; border-collapse:collapse; margin-top:12px; }
      th, td { border:1px solid #1f2a55; padding:8px; text-align:right; }
      th { background:#151a3d; }
      tr:nth-child(even) { background:#111633; }
      .container { max-width:1200px; margin:0 auto; padding:16px; }
      .btn { display:inline-block; padding:8px 12px; background:#1e88e5; color:#fff; border-radius:6px; border:none; cursor:pointer; }
      .btn-secondary { background:#3949ab; }
      .btn-danger { background:#e53935; }
      .btn-ghost { background:transparent; color:#fff; border:1px solid #6be1ff; }
      form { margin-top:12px; }
      label { display:block; margin-top:8px; }
      input, select, textarea { width:100%; padding:8px; margin-top:4px; border-radius:6px; border:1px solid #2a335e; background:#0f142d; color:#fff; }
      textarea { min-height:80px; }
      .grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px; }
      .badge { display:inline-block; padding:2px 8px; border-radius:8px; background:#2e7d32; color:#fff; font-size:12px; }
      .plus { background:#c2185b; }
      .muted { color:#9ea7c6; font-size:12px; }
      .alert { padding:10px; border-radius:8px; background:#18204a; border:1px solid #2f3d75; margin-top:10px; }
    </style>
  </head>
  <body>
    <header>
      <div><strong>GalaxyZone Admin</strong></div>
      <nav>
        <a href="/admin" style="margin-left:10px;">داشبورد</a>
        <form method="POST" action="/admin/logout" style="display:inline;">
          <button class="btn btn-ghost" type="submit">خروج</button>
        </form>
      </nav>
    </header>
    <div class="container">${content}</div>
  </body>
  </html>`;
}

function renderAdminLoginPage(errorMessage = "") {
  const errorBlock = errorMessage ? `<div class="alert">${errorMessage}</div>` : "";
  return `<!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ورود ادمین</title>
    <style>
      body { font-family: 'Vazirmatn', sans-serif; background:#0b0d1a; color:#e9ecf5; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
      .card { background:#101531; padding:24px; border-radius:12px; width:320px; box-shadow:0 10px 40px rgba(0,0,0,0.4); }
      label { display:block; margin-top:12px; }
      input { width:100%; padding:10px; margin-top:6px; border-radius:8px; border:1px solid #1f2a55; background:#0f142d; color:#fff; }
      button { width:100%; padding:12px; margin-top:16px; border:none; border-radius:8px; background:#1e88e5; color:#fff; cursor:pointer; }
      .muted { color:#9ea7c6; font-size:12px; }
      .alert { padding:10px; border-radius:8px; background:#18204a; border:1px solid #2f3d75; margin-top:10px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>ورود مدیریت</h2>
      ${errorBlock}
      <form method="POST" action="/admin/login">
        <label>نام کاربری
          <input required name="username" />
        </label>
        <label>رمز عبور
          <input required name="password" type="password" />
        </label>
        <button type="submit">ورود</button>
        <p class="muted">یوزرنیم: ${CONFIG.ADMIN_USERNAME} | پسورد: ${CONFIG.ADMIN_PASSWORD}</p>
      </form>
    </div>
  </body>
  </html>`;
}

function renderAdminDashboard(games, filters = {}) {
  const rows = games
    .map(
      (g) => `<tr>
        <td>${g.id}</td>
        <td>${g.title}</td>
        <td>${g.platform}</td>
        <td>${g.region}</td>
        <td>${g.capacity}</td>
        <td>${g.is_plus ? '<span class="badge plus">+Plus</span>' : ''}</td>
        <td>${formatPrice(g.price)}</td>
        <td>
          <form method="POST" action="/admin/games/${g.id}/stock" style="display:flex; gap:6px; align-items:center;">
            <input type="number" name="stock" value="${g.stock}" style="width:90px;" />
            <button class="btn btn-secondary" type="submit">بروزرسانی</button>
          </form>
        </td>
        <td>${g.active ? '<span class="badge">فعال</span>' : '<span class="badge" style="background:#c62828;">غیرفعال</span>'}</td>
        <td>${g.image_url ? '<a href="' + g.image_url + '" target="_blank">لینک</a>' : '-'}</td>
        <td>${truncate(g.description, 50)}</td>
        <td>${g.seo_title || '-'}</td>
        <td>${truncate(g.seo_description, 60)}</td>
        <td>${g.seo_tags || '-'}</td>
        <td>
          <a class="btn btn-secondary" href="/admin/games/${g.id}">ویرایش</a>
          <form method="POST" action="/admin/games/${g.id}/delete" style="display:inline;">
            <button class="btn btn-danger" type="submit">حذف نرم</button>
          </form>
          <form method="POST" action="/admin/games/${g.id}" style="display:inline;">
            <input type="hidden" name="title" value="${g.title}" />
            <input type="hidden" name="platform" value="${g.platform}" />
            <input type="hidden" name="region" value="${g.region}" />
            <input type="hidden" name="capacity" value="${g.capacity}" />
            <input type="hidden" name="is_plus" value="${g.is_plus ? 1 : 0}" />
            <input type="hidden" name="price" value="${g.price}" />
            <input type="hidden" name="stock" value="${g.stock}" />
            <input type="hidden" name="active" value="${g.active ? 0 : 1}" />
            <input type="hidden" name="image_url" value="${g.image_url || ''}" />
            <input type="hidden" name="description" value="${g.description || ''}" />
            <input type="hidden" name="seo_title" value="${g.seo_title || ''}" />
            <input type="hidden" name="seo_description" value="${g.seo_description || ''}" />
            <input type="hidden" name="seo_tags" value="${g.seo_tags || ''}" />
            <button class="btn" type="submit">${g.active ? 'Deactivate' : 'Activate'}</button>
          </form>
        </td>
      </tr>`
    )
    .join("");

  const filterTitle = filters.title || "";
  const filterPlatform = filters.platform || "";
  const filterActive = filters.active ?? "";

  const content = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <h2>مدیریت بازی‌ها</h2>
      <a class="btn" href="/admin/games/new">ایجاد بازی جدید</a>
    </div>
    <form method="GET" action="/admin" class="grid" style="align-items:end;">
      <div>
        <label>عنوان
          <input name="title" value="${filterTitle}" />
        </label>
      </div>
      <div>
        <label>پلتفرم
          <select name="platform">
            <option value="">همه</option>
            <option value="PS4" ${filterPlatform === 'PS4' ? 'selected' : ''}>PS4</option>
            <option value="PS5" ${filterPlatform === 'PS5' ? 'selected' : ''}>PS5</option>
          </select>
        </label>
      </div>
      <div>
        <label>وضعیت نمایش
          <select name="active">
            <option value="" ${filterActive === '' ? 'selected' : ''}>همه</option>
            <option value="1" ${filterActive === '1' ? 'selected' : ''}>فعال</option>
            <option value="0" ${filterActive === '0' ? 'selected' : ''}>غیرفعال</option>
          </select>
        </label>
      </div>
      <div>
        <button class="btn" type="submit">اعمال فیلتر</button>
      </div>
    </form>
    <div class="muted">${games.length} نتیجه</div>
    <div style="overflow:auto;">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>عنوان</th><th>پلتفرم</th><th>ریجن</th><th>ظرفیت</th><th>Plus</th><th>قیمت</th><th>موجودی</th><th>فعال</th><th>تصویر</th><th>توضیح</th><th>SEO Title</th><th>SEO Description</th><th>SEO Tags</th><th>اقدام</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  return renderLayout(content, { title: "Admin | Games" });
}

function renderAdminGameForm(game = null) {
  const isEdit = Boolean(game);
  const action = isEdit ? `/admin/games/${game.id}` : "/admin/games";
  return renderLayout(`
    <h2>${isEdit ? "ویرایش بازی" : "ایجاد بازی"}</h2>
    <form method="POST" action="${action}">
      <div class="grid">
        <label>عنوان
          <input required name="title" value="${game?.title || ""}" />
        </label>
        <label>پلتفرم
          <select name="platform" required>
            <option value="PS4" ${game?.platform === "PS4" ? "selected" : ""}>PS4</option>
            <option value="PS5" ${game?.platform === "PS5" ? "selected" : ""}>PS5</option>
          </select>
        </label>
        <label>ریجن
          <input required name="region" value="${game?.region || ""}" />
        </label>
        <label>ظرفیت
          <input required type="number" name="capacity" value="${game?.capacity || 2}" />
        </label>
        <label>+Plus
          <input type="checkbox" name="is_plus" ${game?.is_plus ? "checked" : ""} />
        </label>
        <label>قیمت
          <input required type="number" name="price" value="${game?.price || 0}" />
        </label>
        <label>موجودی
          <input required type="number" name="stock" value="${game?.stock || 0}" />
        </label>
        <label>فعال
          <input type="checkbox" name="active" ${game?.active ? "checked" : ""} />
        </label>
        <label>لینک تصویر
          <input name="image_url" value="${game?.image_url || ""}" />
        </label>
        <label>SEO Title
          <input name="seo_title" value="${game?.seo_title || ""}" />
        </label>
        <label>SEO Description
          <textarea name="seo_description">${game?.seo_description || ""}</textarea>
        </label>
        <label>SEO Tags (comma-separated)
          <input name="seo_tags" value="${game?.seo_tags || ""}" />
        </label>
      </div>
      <label>توضیح کامل
        <textarea name="description">${game?.description || ""}</textarea>
      </label>
      <button class="btn" type="submit">${isEdit ? "ثبت تغییرات" : "ایجاد"}</button>
      <a class="btn btn-secondary" href="/admin">بازگشت</a>
    </form>
  `, { title: isEdit ? `Edit ${game.title}` : "Create Game" });
}

function renderStorefront(games) {
  const cards = games
    .map(
      (g) => `<article style="background:#0f132b; border:1px solid #1f2a55; padding:12px; border-radius:12px;">
        <h3>${g.title} ${g.is_plus ? '<span class="badge plus">+Plus</span>' : ''}</h3>
        <div class="muted">${g.platform} | ${g.region} | ظرفیت ${g.capacity}</div>
        ${g.image_url ? `<img src="${g.image_url}" alt="${g.title}" style="max-width:100%; border-radius:10px; margin:8px 0;" />` : ''}
        <p>${truncate(g.description, 120)}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${g.display_price} تومان</strong>
          ${g.out_of_stock ? '<span class="badge" style="background:#c62828;">ناموجود</span>' : '<span class="badge">موجود</span>'}
        </div>
        <div class="muted">برچسب‌ها: ${g.seo_tags || '---'}</div>
      </article>`
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>فروشگاه بازی | GalaxyZone</title>
    <meta name="description" content="${CONFIG.DEFAULT_META_DESCRIPTION}" />
    <style>
      body { font-family:'Vazirmatn', sans-serif; background:#0b0d1a; color:#e9ecf5; margin:0; }
      .container { max-width:1100px; margin:0 auto; padding:16px; }
      h1 { margin:0 0 12px 0; }
      .grid { display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); }
      .badge { display:inline-block; padding:2px 8px; border-radius:8px; background:#2e7d32; color:#fff; font-size:12px; }
      .plus { background:#c2185b; }
      .muted { color:#9ea7c6; font-size:12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>فروشگاه بازی‌ها</h1>
      <p class="muted">داده‌ها مستقیماً از Cloudflare D1 بارگذاری می‌شوند.</p>
      <div class="grid">${cards}</div>
    </div>
  </body>
  </html>`;
}

function renderGameDetail(game) {
  return `<!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${game.seo_title || game.title}</title>
    <meta name="description" content="${game.seo_description || game.description || CONFIG.DEFAULT_META_DESCRIPTION}" />
    <style>
      body { font-family:'Vazirmatn', sans-serif; background:#0b0d1a; color:#e9ecf5; margin:0; }
      .container { max-width:800px; margin:0 auto; padding:16px; }
      img { max-width:100%; border-radius:12px; }
      .badge { display:inline-block; padding:2px 8px; border-radius:8px; background:#2e7d32; color:#fff; font-size:12px; }
      .plus { background:#c2185b; }
      .muted { color:#9ea7c6; font-size:12px; }
      .tag { display:inline-block; margin:2px; padding:4px 8px; background:#0f142d; border:1px solid #1f2a55; border-radius:6px; }
    </style>
  </head>
  <body>
    <div class="container">
      <a href="/store" class="muted">بازگشت به فروشگاه</a>
      <h1>${game.title} ${game.is_plus ? '<span class="badge plus">+Plus</span>' : ''}</h1>
      <div class="muted">${game.platform} | ${game.region} | ظرفیت ${game.capacity}</div>
      ${game.image_url ? `<img src="${game.image_url}" alt="${game.title}" />` : ''}
      <p>${game.description || ''}</p>
      <div><strong>قیمت:</strong> ${formatPrice(game.price)} تومان</div>
      <div class="muted">${game.out_of_stock ? 'ناموجود' : 'موجود'}</div>
      <div>${(game.seo_tags || '').split(',').filter(Boolean).map((t) => `<span class="tag">${t.trim()}</span>`).join('')}</div>
    </div>
  </body>
  </html>`;
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
      return htmlResponse(renderAdminDashboard(games, filters));
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
      return htmlResponse(renderAdminGameForm(game));
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

    // Soft delete
    const deleteMatch = url.pathname.match(/^\/admin\/games\/(\d+)\/delete$/);
    if (deleteMatch && request.method === "POST") {
      await softDeleteGame(env, deleteMatch[1]);
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
      platform: url.searchParams.get("platform") || undefined,
      region: url.searchParams.get("region") || undefined,
      capacity: url.searchParams.get("capacity") || undefined,
      is_plus: url.searchParams.get("is_plus") ? url.searchParams.get("is_plus") === "1" : undefined,
    };
    const games = await listPublicGames(env, filters);
    return jsonResponse({ games });
  }

  // Storefront page
  if (url.pathname === "/store" && request.method === "GET") {
    const games = await listPublicGames(env);
    return htmlResponse(renderStorefront(games));
  }

  // Game detail
  const gameDetailMatch = url.pathname.match(/^\/game\/(\d+)$/);
  if (gameDetailMatch && request.method === "GET") {
    const game = await getGameById(env, gameDetailMatch[1]);
    if (!game || !game.active) return null; // fall back to legacy 404
    const enriched = {
      ...game,
      is_plus: Boolean(game.is_plus),
      out_of_stock: Number(game.stock) <= 0,
      seo_title: game.seo_title || game.title,
      seo_description: game.seo_description || game.description || CONFIG.DEFAULT_META_DESCRIPTION,
    };
    return htmlResponse(renderGameDetail(enriched));
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
    games: [
        { 
            id: 1, 
            title: "God of War Ragnarök", 
            platform: "PS5", 
            price: 1350000, 
            capacity: 2, 
            stock: 8, 
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop", 
            region: "TR", 
            isPlusIncluded: false,
            isFeatured: true,
            desc: "پایان حماسی نورس. کریتوس و آترئوس باید برای هر گزینه‌ای آماده باشند. گرافیک خیره‌کننده و گیم‌پلی بهبود یافته."
        },
        { 
            id: 2, 
            title: "Elden Ring", 
            platform: "PS5", 
            price: 1100000, 
            capacity: 3, 
            stock: 3, 
            image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop", 
            region: "US", 
            isPlusIncluded: false,
            isFeatured: true,
            desc: "برنده جایزه بهترین بازی سال. در سرزمین‌های میانه کاوش کنید و الدن رینگ را تصاحب کنید. ساخته میازاکی."
        },
        { 
            id: 3, 
            title: "FC 24 (FIFA)", 
            platform: "PS4", 
            price: 950000, 
            capacity: 2, 
            stock: 0, 
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop", 
            region: "UAE", 
            isPlusIncluded: false,
            isFeatured: false,
            desc: "واقع‌گرایانه‌ترین تجربه فوتبال با تکنولوژی HyperMotion V و لایسنس‌های کامل لیگ‌های جهانی."
        },
        { 
            id: 4, 
            title: "Spider-Man 2", 
            platform: "PS5", 
            price: 1600000, 
            capacity: 1, 
            stock: 12, 
            image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=800&auto=format&fit=crop", 
            region: "US", 
            isPlusIncluded: true,
            isFeatured: true,
            desc: "پیتر پارکر و مایلز مورالز در برابر ونوم. تاب‌خوردن در نیویورک با سرعت SSD پلی‌استیشن ۵."
        },
        { 
            id: 5, 
            title: "The Last of Us Part I", 
            platform: "PS5", 
            price: 1250000, 
            capacity: 2, 
            stock: 5, 
            image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800&auto=format&fit=crop", 
            region: "US", 
            isPlusIncluded: false,
            isFeatured: false,
            desc: "بازسازی کامل نسخه اول. تجربه‌ای احساسی از سفر جوئل و الی در دنیایی نابود شده."
        },
        { 
            id: 6, 
            title: "Red Dead Redemption 2", 
            platform: "PS4", 
            price: 400000, 
            capacity: 3, 
            stock: 10, 
            image: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=800&auto=format&fit=crop", 
            region: "TR", 
            isPlusIncluded: false,
            isFeatured: true,
            desc: "شاهکار راک‌استار. زندگی در غرب وحشی و داستان آرتور مورگان در دوران افول یاغی‌گری."
        },
        {
            id: 7,
            title: "Call of Duty: MW3",
            platform: "PS5",
            price: 1800000,
            capacity: 2,
            stock: 4,
            image: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=800&auto=format&fit=crop",
            region: "US",
            isPlusIncluded: true,
            isFeatured: false,
            desc: "جنگ مدرن با گرافیک نسل نهم. کمپین داستانی هیجان‌انگیز و بخش مولتی‌پلیر محبوب."
        },
        {
            id: 8,
            title: "Assassin's Creed Mirage",
            platform: "PS4",
            price: 850000,
            capacity: 2,
            stock: 7,
            image: "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?q=80&w=800&auto=format&fit=crop",
            region: "EU",
            isPlusIncluded: false,
            isFeatured: false,
            desc: "بازگشت به ریشه‌ها در بغداد. مخفی‌کاری و پارکور به سبک کلاسیک اساسینز کرید."
        }
    ],
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
        this.cart = JSON.parse(localStorage.getItem('gz_cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('gz_wishlist')) || [];
    }

    init() {
        this.applyFilters();
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

    applyFilters() {
        const pFilter = document.getElementById('filter-platform').value;
        const cFilter = document.getElementById('filter-capacity').value;
        const sort = document.getElementById('sort-order').value;
        const stockOnly = document.getElementById('filter-stock').checked;
        const plusOnly = document.getElementById('filter-plus').checked;

        let filtered = [...DB.games];

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
        this.ui.renderFeatured(DB.games.filter(g => g.isFeatured));
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
        const results = DB.games.filter(g => g.title.toLowerCase().includes(lowerQ));

        this.ui.renderSearchResults(results);
    }

    addToCart(id, type) {
        const source = type === 'game' ? DB.games : DB.plus;
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
            msg += \`\${index + 1}. \${item.title} (\${item.platform || item.duration}) - \${item.price.toLocaleString()}\%0A\`;
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
        
        const div = document.createElement('div');
        div.className = 'game-card';
        div.innerHTML = \`
            <div class="card-image-wrapper" onclick="window.app.ui.openProductModal(\${game.id})">
                <img src="\${game.image}" alt="\${game.title}" class="card-img" loading="lazy">
                <div class="card-overlay"></div>
                <div class="card-badges">
                    <span class="badge-item badge-stock \${inStock ? 'in' : 'out'}">
                        \${inStock ? 'موجود: ' + game.stock : 'ناموجود'}
                    </span>
                    \${game.isPlusIncluded ? '<span class="badge-item badge-plus">+Plus</span>' : ''}
                </div>
            </div>
            <div class="card-content">
                <h4 class="card-title">\${game.title}</h4>
                <div class="card-meta">
                    <span><i class="fab fa-playstation"></i> \${game.platform}</span>
                    <span><i class="fas fa-globe"></i> \${game.region}</span>
                    <span>\${game.capacity === 2 ? 'ظرفیت ۲' : 'ظرفیت ۳'}</span>
                </div>
                <div class="card-footer">
                    <span class="card-price">\${game.price.toLocaleString()}</span>
                    <div class="card-actions">
                        <button class="btn-icon btn-fav \${isLiked ? 'active' : ''}" onclick="window.app.inventory.toggleWishlist(\${game.id})">
                            <i class="\${isLiked ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="btn-icon btn-cart" \${!inStock ? 'disabled style="opacity:0.5"' : ''} onclick="window.app.inventory.addToCart(\${game.id}, 'game')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        \`;
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
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = \`
                    <img src="\${item.image}" alt="">
                    <div>
                        <div style="font-weight:bold">\${item.title}</div>
                        <div style="font-size:0.8rem;color:#aaa">\${item.platform} | \${item.price.toLocaleString()}</div>
                    </div>
                \`;
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
            const item = DB.games.find(g => g.id === id);
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
        const item = DB.games.find(g => g.id === id);
        if(!item) return;

        this.elems.modalDetails.innerHTML = \`
            <img src="\${item.image}" class="modal-hero">
            <div class="modal-info">
                <h2 class="modal-title">\${item.title}</h2>
                <div class="modal-tags">
                    <span class="tag">\${item.platform}</span>
                    <span class="tag">Region \${item.region}</span>
                    <span class="tag">Capacity \${item.capacity}</span>
                </div>
                <p class="modal-desc">\${item.desc}</p>
                <div class="modal-price-box">
                    <span style="font-size:1.5rem;font-weight:bold;color:#00f3ff">\${item.price.toLocaleString()} تومان</span>
                    <button class="btn-primary" onclick="window.app.inventory.addToCart(\${item.id}, 'game');window.app.ui.closeModal()">
                        <i class="fas fa-shopping-cart"></i> خرید کنید
                    </button>
                </div>
            </div>
        \`;
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