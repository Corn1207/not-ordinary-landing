/* ============================================================
   NOT ORDINARY — main-sheets.js
   Versión que carga productos desde Google Sheets
   ============================================================ */

/* ── NAV ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

const burger   = document.querySelector('.nav-burger');
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

/* ── CATÁLOGO ── */
const filtersEl = document.getElementById('filters');
const gridEl    = document.getElementById('productsGrid');

const IG_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;

function createCard(product, categoryName, categoryId) {
  const card = document.createElement('div');
  card.className = 'product-card fade-in';
  card.dataset.category = categoryId;
  card.dataset.novedad  = product.novedad ? 'true' : 'false';

  const imgs = product.imgs || [];
  const hasMultiple = imgs.length > 1;

  const imgsHTML = imgs.map((src, i) =>
    `<img src="${src}" alt="${product.name}" loading="lazy" class="${i === 0 ? 'active' : ''}" />`
  ).join('');

  const dotsHTML = hasMultiple
    ? `<div class="card-dots">${imgs.map((_, i) =>
        `<span class="card-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
      ).join('')}</div>`
    : '';

  card.innerHTML = `
    <div class="product-card-img">
      ${imgsHTML}
      <div class="product-card-badges">
        <span class="product-card-category">${categoryName}</span>
        ${product.novedad ? `<span class="badge-novedad">✦ Novedad</span>` : ''}
      </div>
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
        ${product.igPost
          ? `<a href="${product.igPost}" target="_blank" rel="noopener" class="product-card-cta">
              ${IG_ICON} <span class="cta-label">Ver en IG</span>
             </a>`
          : ''
        }
      </div>
    </div>
  `;

  if (hasMultiple) initCarousel(card, imgs.length);
  if (imgs.length) {
    attachLightbox(card, imgs);
    card.querySelector('.product-card-img').addEventListener('click', e => {
      if (e.target.closest('.card-dot') || e.target.closest('.product-card-cta')) return;
      track('product_photo_click', { product: product.name, category: categoryId });
    });
  }

  if (product.igPost) {
    card.querySelector('.product-card-cta')?.addEventListener('click', () => {
      track('ver_en_ig_click', { product: product.name, category: categoryId });
    });
  }

  return card;
}

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
  const interval = setInterval(() => goTo(current + 1), 4000);
  card.querySelectorAll('.card-dot').forEach(dot => {
    dot.addEventListener('click', () => { clearInterval(interval); goTo(Number(dot.dataset.index)); });
  });
}

function renderCatalog(categories) {
  const visibleCategories = categories.filter(
    cat => cat.visible && cat.products.some(p => p.visible)
  );

  // Filtros
  const hasNovedades = visibleCategories.some(cat => cat.products.some(p => p.visible && p.novedad));
  if (hasNovedades) {
    const btnNov = document.createElement('button');
    btnNov.className = 'filter-btn filter-btn--novedad';
    btnNov.dataset.category = 'novedad';
    btnNov.setAttribute('role', 'tab');
    btnNov.setAttribute('aria-selected', 'false');
    btnNov.textContent = '✦ Novedad';
    filtersEl.appendChild(btnNov);
  }

  visibleCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat.id;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = cat.name;
    filtersEl.appendChild(btn);
  });

  // Cards agrupadas por categoría — novedades primero dentro de cada grupo
  visibleCategories.forEach(cat => {
    const heading = document.createElement('h3');
    heading.className = 'catalog-category-heading';
    heading.dataset.category = cat.id;
    heading.textContent = cat.name;
    gridEl.appendChild(heading);

    const visible = cat.products.filter(p => p.visible);
    const sorted  = [...visible.filter(p => p.novedad), ...visible.filter(p => !p.novedad)];
    sorted.forEach(p => gridEl.appendChild(createCard(p, cat.name, cat.id)));
  });

  // Filtrado
  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filtersEl.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', b === btn);
    });
    const cat = btn.dataset.category;
    const showAll     = cat === 'all';
    const showNovedad = cat === 'novedad';

    gridEl.querySelectorAll('.product-card').forEach(card => {
      const matchCat = showAll || card.dataset.category === cat;
      const matchNov = showNovedad && card.dataset.novedad === 'true';
      card.style.display = (matchCat || matchNov) ? '' : 'none';
    });
    gridEl.querySelectorAll('.catalog-category-heading').forEach(h => {
      if (showNovedad) {
        h.style.display = 'none';
      } else {
        h.style.display = (showAll || h.dataset.category === cat) ? '' : 'none';
      }
    });
  });

  // Animaciones
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ── LOADING STATE ── */
function showLoading() {
  gridEl.innerHTML = `<div class="catalog-loading">Cargando productos...</div>`;
}

function showError() {
  gridEl.innerHTML = `<div class="catalog-loading">Error al cargar productos. Intenta de nuevo.</div>`;
}

/* ── INIT ── */
showLoading();

// Defer catalog fetch until after first paint so LCP is not blocked
function initCatalog() {
  loadCatalog()
    .then(categories => {
      gridEl.innerHTML = '';
      renderCatalog(categories);
    })
    .catch(err => {
      console.error('Error cargando catálogo:', err);
      showError();
    });
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(initCatalog, { timeout: 3000 });
} else {
  setTimeout(initCatalog, 200);
}
