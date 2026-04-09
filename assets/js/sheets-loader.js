/* ============================================================
   NOT ORDINARY — Google Sheets Loader

   Reemplaza products.js leyendo los productos desde Google Sheets.

   CONFIGURACIÓN:
   1. Publica tu hoja: Archivo → Compartir → Publicar en la web → CSV
   2. Pega la URL en SHEET_CSV_URL
   ============================================================ */

const INSTAGRAM_URL = 'https://www.instagram.com/not_ordinary_pe';

// ← Pega aquí la URL CSV de tu hoja publicada
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRM_o54V4RRLRLm7GFgkGAyXoQU2KbhHs_UPaI-cfcveyx_VZ5OCfiMHrMpUbX4Qf2V3gKM0RpdR6J4/pub?gid=1818658440&single=true&output=csv';

// Agrega optimizaciones automáticas a URLs de Cloudinary
function optimizeCloudinary(url) {
  if (!url.includes('res.cloudinary.com')) return url;
  // Si ya tiene transformaciones, no agregar de nuevo
  if (url.includes('/f_webp')) return url;
  return url.replace('/upload/', '/upload/f_webp,q_auto,w_600/');
}

async function loadCatalog() {
  const res  = await fetch(SHEET_CSV_URL);
  const text = await res.text();
  return parseCSV(text);
}

function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim());

  const rows = lines
    .map(line => {
      // Maneja comas dentro de comillas
      const values = [];
      let current = '';
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
        current += ch;
      }
      values.push(current.trim());

      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    })
    .filter(row => row.id); // descarta filas vacías

  // Agrupar por categoría
  const categoryMap = new Map();

  rows.forEach(row => {
    const catId = row.category_id;

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        id:      catId,
        name:    row.category_name,
        visible: row.category_visible.toUpperCase() !== 'FALSE',
        products: [],
      });
    }

    const imgs = [row.img1, row.img2, row.img3].filter(Boolean).map(optimizeCloudinary);

    categoryMap.get(catId).products.push({
      id:          Number(row.id) || row.id,
      name:        row.name,
      description: row.description,
      sizes:       row.sizes  ? row.sizes.split(',').map(s => s.trim())  : [],
      colors:      row.colors ? row.colors.split(',').map(c => c.trim()) : [],
      price:       row.price,
      imgs,
      igPost:      row.igPost || '',
      visible:     row.visible.toUpperCase() !== 'FALSE',
    });
  });

  return [...categoryMap.values()];
}
