/* ============================================================
   NOT ORDINARY — Lightbox con PhotoSwipe v5
   Pan/zoom suave, swipe en móvil, teclado
   ============================================================ */

import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5/dist/photoswipe-lightbox.esm.min.js';
import PhotoSwipe         from 'https://cdn.jsdelivr.net/npm/photoswipe@5/dist/photoswipe.esm.min.js';

// Expone la función globalmente para que main-sheets.js (no-módulo) la use
window.attachLightbox = function attachLightbox(cardEl, imgs) {
  if (!imgs.length) return;

  const imgWrap = cardEl.querySelector('.product-card-img');
  imgWrap.style.cursor = 'pointer';

  imgWrap.addEventListener('click', e => {
    if (e.target.closest('.card-dot') || e.target.closest('.product-card-cta')) return;

    // Detecta cuál imagen está activa en el carrusel
    const activeImg  = imgWrap.querySelector('img.active') || imgWrap.querySelector('img');
    const startIndex = Math.max(0, imgs.indexOf(activeImg?.src));

    // URLs de alta calidad para el lightbox (w_1200 en vez de w_600)
    const slides = imgs.map(src => ({
      src:    src.includes('res.cloudinary.com')
                ? src.replace(/\/w_\d+\//, '/w_1200/')
                : src,
      width:  1200,
      height: 1600,
    }));

    const pswp = new PhotoSwipe({
      dataSource:          slides,
      index:               startIndex,
      bgOpacity:           0.92,
      pinchToClose:        true,
      closeOnVerticalDrag: true,
      maxZoomLevel:        4,
      initialZoomLevel:    'fit',
      secondaryZoomLevel:  1.3,
    });

    pswp.init();
  });
};
