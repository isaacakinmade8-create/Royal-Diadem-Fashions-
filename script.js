const C = window.RD_CONFIG || {};
const wa = C.WHATSAPP || "447467508756";
const cur = C.CURRENCY || "£";
const sb = (C.SUPABASE_URL && window.supabase) ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const catNames = {clothing:"Clothing", jewellery:"Jewellery", bags:"Bags"};

const nav = document.querySelector(".nav");
document.querySelector(".menu-toggle").addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

let currentFilter = "all";
function filterProducts(filter) {
  currentFilter = filter;
  document.querySelectorAll(".category").forEach(c => c.classList.toggle("active", c.dataset.filter === filter));
  const info = document.getElementById("bespokeInfo");
  if (info) info.hidden = filter !== "bespoke";
  document.querySelectorAll(".product-card").forEach(card => {
    card.style.display = (filter !== "bespoke" && (filter === "all" || card.dataset.category === filter)) ? "" : "none";
  });
}
document.querySelectorAll(".category").forEach(b => b.addEventListener("click", () => filterProducts(b.dataset.filter)));
document.querySelector(".filter-reset").addEventListener("click", () => filterProducts("all"));

// Load products added in the admin dashboard (falls back to the built-in samples if none / not configured)
async function loadProducts() {
  if (!sb) return;
  const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
  if (error || !data || !data.length) return;
  // Keep the built-in jewellery cards only if they have not been imported into the database yet (avoids duplicates)
  const dbImages = new Set(data.map(p => p.image_url));
  const localJewellery = [...document.querySelectorAll("#productGrid .product-card")].filter(card => { const src = card.querySelector("img")?.getAttribute("src"); return src?.startsWith("assets/jewellery/") && !dbImages.has(src); });
  document.getElementById("productGrid").innerHTML = data.map(p => `
    <article class="product-card" data-category="${esc(p.category)}">
      <div class="product-image">${p.video_url ? `<video src="${esc(p.video_url)}" poster="${esc(p.image_url || "")}" controls playsinline preload="metadata"></video>` : `<img src="${esc(p.image_url || "assets/royal-diadem-showcase.jpg")}" alt="${esc(p.name)}" loading="lazy">`}</div>
      <div class="product-info"><span>${esc(catNames[p.category] || p.category)}</span><h3>${esc(p.name)}</h3>
        ${p.price != null ? `<p class="price">${esc(cur)}${Number(p.price).toLocaleString()}</p>` : ""}
        ${p.in_stock ? `<button class="order-btn" data-id="${esc(p.id)}" data-product="${esc(p.name)}" data-price="${p.price ?? ""}">Buy now</button>` : `<button class="order-btn" disabled>Sold out</button>`}
      </div></article>`).join("");
  localJewellery.forEach(card => document.getElementById("productGrid").appendChild(card));
  filterProducts(currentFilter);
}

// Product detail modal: big image/video on the left, order form on the right
const modal = document.createElement("div");
modal.className = "order-modal";
modal.innerHTML = `<div class="pd-box"><button type="button" class="pd-close" id="pdClose" aria-label="Close">×</button>
  <div class="pd-media" id="pdMedia"></div>
  <form class="pd-form"><span id="pdCat"></span><h3 id="pdName"></h3><p class="pd-price" id="pdPrice"></p>
    <label>Your name<input id="omName" required></label>
    <label>Quantity<input id="omQty" type="number" min="1" value="1" required></label>
    <label>Size / colour / notes<textarea id="omNotes" rows="3"></textarea></label>
    <button type="submit" class="buy-now">Buy now</button><small>You'll continue on WhatsApp to confirm your order.</small></form></div>`;
document.body.appendChild(modal);
let pending = null;
const $m = id => document.getElementById(id);
function openProduct(card) {
  const btn = card.querySelector(".order-btn");
  const price = card.querySelector(".price");
  const vid = card.querySelector("video"), img = card.querySelector("img");
  pending = { id: btn?.dataset.id || null, name: card.querySelector("h3").textContent,
    price: btn?.dataset.price ? Number(btn.dataset.price) : null, soldOut: !!btn?.disabled };
  $m("pdMedia").innerHTML = vid ? `<video src="${esc(vid.getAttribute("src"))}" poster="${esc(vid.getAttribute("poster") || "")}" controls playsinline autoplay muted></video>` : `<img src="${esc(img?.getAttribute("src"))}" alt="${esc(pending.name)}">`;
  $m("pdCat").textContent = card.querySelector(".product-info span").textContent;
  $m("pdName").textContent = pending.name;
  $m("pdPrice").textContent = price ? price.textContent : "";
  const buy = modal.querySelector(".buy-now");
  buy.disabled = pending.soldOut; buy.textContent = pending.soldOut ? "Sold out" : "Buy now";
  modal.classList.add("show");
}
function closeProduct() { modal.classList.remove("show"); $m("pdMedia").innerHTML = ""; }
document.addEventListener("click", e => {
  const card = e.target.closest(".product-card");
  if (card && !e.target.closest("video")) openProduct(card);
});
$m("pdClose").onclick = closeProduct;
modal.addEventListener("click", e => { if (e.target === modal) closeProduct(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeProduct(); });
modal.querySelector("form").addEventListener("submit", e => {
  e.preventDefault();
  const name = omName.value.trim(), qty = Number(omQty.value) || 1, notes = omNotes.value.trim();
  if (sb) sb.from("orders").insert({ customer_name: name, product_id: pending.id, product_name: pending.name, price: pending.price, quantity: qty, notes }).then(() => {});
  const total = pending.price != null ? `\nTotal: ${cur}${(pending.price * qty).toLocaleString()}` : "";
  const msg = `Hello Royal Diadem, I would like to order:\n\nProduct: ${pending.name}\nQuantity: ${qty}${total}${notes ? `\nNotes: ${notes}` : ""}\nName: ${name}`;
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
  closeProduct(); e.target.reset();
});

document.getElementById("year").textContent = new Date().getFullYear();
loadProducts();
