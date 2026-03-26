/* ============================================================
   NOT ORDINARY — Korean Fashion
   main.js
   ============================================================ */

/* ── NAV: sombra al hacer scroll ── */
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── NAV: cerrar menú mobile al hacer click en un link ── */
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    const mobileMenu = document.querySelector('.nav-links');
    mobileMenu.classList.remove('open');
  });
});

/* ── ANIMACIÓN de entrada al hacer scroll ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.outfit-card, .vibe-card, .featured-look').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});
