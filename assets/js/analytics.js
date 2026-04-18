/* ============================================================
   NOT ORDINARY — Analytics Events (GA4)
   Trackea interacciones clave del usuario
   ============================================================ */

function track(eventName, params = {}) {
  if (typeof gtag !== 'function') return;
  gtag('event', eventName, params);
}

/* ── WHATSAPP ── */
document.addEventListener('click', e => {
  const wa = e.target.closest('a[href*="wa.me"]');
  if (!wa) return;
  track('whatsapp_click', { location: wa.classList.contains('whatsapp-fab') ? 'fab' : 'catalogo' });
});

/* ── INSTAGRAM ── */
document.addEventListener('click', e => {
  const ig = e.target.closest('a[href*="instagram.com"]');
  if (!ig) return;
  let location = 'otro';
  if (ig.closest('nav'))            location = 'nav';
  else if (ig.closest('.hero'))     location = 'hero';
  else if (ig.closest('.product-card')) location = 'producto';
  else if (ig.closest('.cta-section'))  location = 'cta_banner';
  else if (ig.closest('.about-section')) location = 'nosotros';
  else if (ig.closest('footer'))    location = 'footer';
  track('instagram_click', { location });
});

/* ── FILTROS DE CATEGORÍA ── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  track('filter_click', { category: btn.dataset.category, label: btn.textContent.trim() });
});

/* ── FAQ ── */
document.addEventListener('toggle', e => {
  const item = e.target.closest('.faq-item');
  if (!item) return;
  const question = item.querySelector('summary')?.textContent.trim();
  if (e.target.open) {
    track('faq_open', { question });
  }
}, true);

/* ── LIGHTBOX (foto de producto) ── */
window.addEventListener('pswp:open', () => {
  track('product_photo_zoom');
});

/* ── SCROLL DEPTH ── */
const depths = [25, 50, 75, 100];
const reached = new Set();
window.addEventListener('scroll', () => {
  const pct = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
  depths.forEach(d => {
    if (pct >= d && !reached.has(d)) {
      reached.add(d);
      track('scroll_depth', { percent: d });
    }
  });
}, { passive: true });
