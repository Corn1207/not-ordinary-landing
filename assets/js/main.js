/* ============================================================
   NOT ORDINARY — main.js
   ============================================================ */

/* ── NAV: sombra al hacer scroll ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── NAV: menú burger mobile ── */
const burger = document.querySelector('.nav-burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

/* ── CATÁLOGO: renderizado dinámico ── */
const filtersEl = document.getElementById('filters');
const gridEl    = document.getElementById('productsGrid');

// Solo categorías visibles con al menos 1 producto visible
const visibleCategories = categories.filter(
  cat => cat.visible && cat.products.some(p => p.visible)
);

// Generar botones de filtro
visibleCategories.forEach(cat => {
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.dataset.category = cat.id;
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', 'false');
  btn.textContent = cat.name;
  filtersEl.appendChild(btn);
});

const IG_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;

// Generar cards de producto
function createCard(product, categoryName) {
  const card = document.createElement('div');
  card.className = 'product-card fade-in';
  card.dataset.category = getCategoryId(product);

  const imgs = product.imgs || [];
  const hasMultiple = imgs.length > 1;

  // Imágenes apiladas
  const imgsHTML = imgs.map((src, i) =>
    `<img src="${src}" alt="${product.name}" loading="lazy" class="${i === 0 ? 'active' : ''}" />`
  ).join('');

  // Dots solo si hay más de 1 imagen
  const dotsHTML = hasMultiple
    ? `<div class="card-dots">${imgs.map((_, i) =>
        `<span class="card-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
      ).join('')}</div>`
    : '';

  card.innerHTML = `
    <div class="product-card-img">
      ${imgsHTML}
      <span class="product-card-category">${categoryName}</span>
      ${dotsHTML}
    </div>
    <div class="product-card-body">
      <div class="product-card-name">${product.name}</div>
      <div class="product-card-desc">${product.description}</div>
      <div class="product-card-sizes">
        ${product.sizes.map(s => `<span class="size-chip">${s}</span>`).join('')}
      </div>
      ${product.colors && product.colors.length
        ? `<div class="product-card-colors">
            ${product.colors.map(c => `<span class="color-chip">${c}</span>`).join('')}
           </div>`
        : ''
      }
      <div class="product-card-footer">
        <span class="product-card-price">${product.price}</span>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener" class="product-card-cta" aria-label="Ver en Instagram">
          ${IG_ICON} Ver en IG
        </a>
      </div>
    </div>
  `;

  // Carrusel automático solo si tiene múltiples imágenes
  if (hasMultiple) {
    initCarousel(card, imgs.length);
  }

  return card;
}

// ── CARRUSEL ──
function initCarousel(card, total) {
  let current = 0;

  function goTo(index) {
    const cardImgs = card.querySelectorAll('.product-card-img img');
    const dots     = card.querySelectorAll('.card-dot');
    cardImgs[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index % total;
    cardImgs[current].classList.add('active');
    dots[current].classList.add('active');
  }

  // Auto-avance cada 4 segundos
  const interval = setInterval(() => goTo(current + 1), 4000);

  // Click en dots para navegar manualmente
  card.querySelectorAll('.card-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      goTo(Number(dot.dataset.index));
    });
  });
}

// Mapa id producto → categoria id (para filtrar)
const productCategoryMap = new Map();

visibleCategories.forEach(cat => {
  cat.products.filter(p => p.visible).forEach(p => {
    productCategoryMap.set(p.id, cat.id);
  });
});

function getCategoryId(product) {
  return productCategoryMap.get(product.id) || '';
}

// Renderizar todos los productos
visibleCategories.forEach(cat => {
  cat.products.filter(p => p.visible).forEach(p => {
    gridEl.appendChild(createCard(p, cat.name));
  });
});

// ── FILTRADO ──
let activeCategory = 'all';

filtersEl.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  activeCategory = btn.dataset.category;

  filtersEl.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b === btn);
    b.setAttribute('aria-selected', b === btn);
  });

  gridEl.querySelectorAll('.product-card').forEach(card => {
    const match = activeCategory === 'all' || card.dataset.category === activeCategory;
    card.style.display = match ? '' : 'none';
  });
});

/* ── ANIMACIONES DE ENTRADA ── */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Observar cards que se agregan dinámicamente
const gridObserver = new MutationObserver(mutations => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node.classList && node.classList.contains('fade-in')) {
        observer.observe(node);
      }
    });
  });
});

gridObserver.observe(gridEl, { childList: true });
