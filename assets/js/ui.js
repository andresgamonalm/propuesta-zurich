// @ts-check
/**
 * Piezas compartidas de interfaz: escape de texto, íconos, fotos y fechas.
 *
 * Íconos: una sola familia de trazo, 24 px, `currentColor` [C]. La
 * biblioteca oficial de íconos de Zurich (delineado y relleno) no está entre
 * los materiales entregados; reemplazarla es un pendiente de marca.
 */

/** Escapa texto para insertarlo en HTML. Todo lo que no es literal pasa por aquí. */
export function esc(/** @type {unknown} */ valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const TRAZOS = {
  'flecha-der': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'flecha-izq': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  'chevron': '<path d="M6 9l6 6 6-6"/>',
  'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
  'cerrar': '<path d="M6 6l12 12M18 6L6 18"/>',
  'auto': '<path d="M5 16h14M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v4a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-11v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="13" r=".8"/><circle cx="16.5" cy="13" r=".8"/>',
  'casa': '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  'corazon': '<path d="M12 20s-7-4.5-9-9a4.6 4.6 0 0 1 9-3 4.6 4.6 0 0 1 9 3c-2 4.5-9 9-9 9z"/>',
  'salud': '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
  'celular': '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  'documento': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  'tarjeta': '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
  'escudo': '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  'ahorro': '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.1-.5-2.6-1.3M12 6.5V8M12 16v1.5"/>',
  'ajustes': '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  'estrella': '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  'herramienta': '<path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17v3h3l5.5-5.5a4 4 0 0 0 5.2-5.2l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  'lupa': '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  'personas': '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.4 5 2.8 5 5.8"/>',
  'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'x': '<path d="M7 7l10 10M17 7L7 17"/>',
  'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  'alerta': '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  'telefono': '<path d="M5 3.5h3.5l2 5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
  'usuario': '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c0-4.1 3.6-7 8-7s8 2.9 8 7"/>',
  'salir': '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  'engranaje': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  'externo': '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  'candado': '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  'pausa': '<path d="M9 5v14M15 5v14"/>',
  'play': '<path d="M7 4.5l12 7.5-12 7.5z"/>',
  'regalo': '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3.5-5.5-3.5-5.5-1S10 8 12 8zm0 0c1.5-3.5 5.5-3.5 5.5-1S14 8 12 8z"/>',
  'reloj': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'descarga': '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  'marco': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  'globo': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
  'basura': '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  'copiar': '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
  'matraz': '<path d="M9.5 3h5M10.5 3v6L5.2 18.2A1.9 1.9 0 0 0 6.9 21h10.2a1.9 1.9 0 0 0 1.7-2.8L13.5 9V3"/><path d="M7.6 14.5h8.8"/>',
};

/** @param {keyof typeof TRAZOS|string} nombre @param {string} [clase] */
export function icono(nombre, clase = '') {
  const trazo = /** @type {Record<string,string>} */ (TRAZOS)[nombre] ?? TRAZOS.info;
  return `<svg${clase ? ` class="${clase}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${trazo}</svg>`;
}

/**
 * Foto con dos tamaños. `alt` vacío cuando la foto es ambiente y el texto
 * vecino ya dice lo importante.
 * @param {string} clave @param {string} alt @param {{ grande?: boolean, prioridad?: boolean, sizes?: string }} [op]
 */
export function foto(clave, alt, op = {}) {
  const base = `/assets/img/fotos/${clave}`;
  const sizes = op.sizes ?? (op.grande ? '(max-width: 960px) 100vw, 50vw' : '(max-width: 600px) 100vw, 33vw');
  return `<img src="${base}-720.webp" srcset="${base}-720.webp 720w, ${base}-1400.webp 1400w" sizes="${sizes}" alt="${esc(alt)}" ${op.prioridad ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

/** Hoy, a medianoche local, como texto AAAA-MM-DD. */
export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * ¿La promoción está vigente hoy? Sin fecha de término = vigente.
 * @param {{ desde?: string, hasta?: string }|undefined} promo
 */
export function promoVigente(promo) {
  if (!promo) return false;
  const hoy = hoyISO();
  if (promo.desde && hoy < promo.desde) return false;
  if (promo.hasta && hoy > promo.hasta) return false;
  return true;
}

/** @param {string} iso */
export function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Marca de propuesta: contenido que el brief exige validar antes de publicar. */
export function porValidar(texto = 'Por validar') {
  return `<span class="por-validar">${icono('reloj')}${esc(texto)}</span>`;
}

/** Aviso breve que se va solo. @param {string} texto */
export function avisar(texto) {
  document.querySelector('.aviso-flotante')?.remove();
  const n = document.createElement('div');
  n.className = 'aviso-flotante';
  n.setAttribute('role', 'status');
  n.innerHTML = `${icono('check')}<span>${esc(texto)}</span>`;
  document.body.append(n);
  setTimeout(() => n.remove(), 2600);
}

/** Valor de celda: true → ✓ Incluido, false → ✕ No incluye, texto → texto. */
export function celda(/** @type {unknown} */ v) {
  if (v === true) return `<span class="si">${icono('check')}<span class="sr">Incluido</span></span>`;
  if (v === false) return `<span class="no">${icono('x')}<span class="sr">No incluye</span></span>`;
  return esc(v);
}
