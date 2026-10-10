// @ts-check
/**
 * Puente entre el cotizador del marco y MatIAs.
 *
 * El cotizador de demostración, en su pantalla de planes, cuenta qué plan,
 * qué deducible y qué precios está mirando la persona ({ tipo: 'contexto' },
 * ver herramientas/assets/js/marco.js). integracion.js lo recibe y lo deja
 * aquí; MatIAs lo lee para hablar de lo que está en pantalla y no de un
 * ejemplo. De vuelta, MatIAs puede pedirle al marco que elija un plan o un
 * deducible: lo hace con los mismos botones de la pantalla.
 *
 * Solo con el cotizador del mismo sitio. Con la herramienta oficial de
 * Zurich, este contexto es parte del contrato que se propone a TI.
 */

/** @type {Map<string, any>} */
const contextos = new Map();
/** @type {Set<(producto: string) => void>} */
const oyentes = new Set();

/** @param {string} producto @param {any} datos */
export function recibir(producto, datos) {
  contextos.set(producto, { ...datos, recibido: Date.now() });
  oyentes.forEach((f) => f(producto));
}

/** El último contexto de ese producto, o null si el marco no ha contado nada. @param {string} producto */
export const contexto = (producto) => contextos.get(producto) || null;

/** @param {(producto: string) => void} f */
export function alCambiar(f) { oyentes.add(f); return () => oyentes.delete(f); }

/** Le pide al cotizador del marco que elija un plan o un deducible. @param {{ plan?: string, deducible?: number }} datos */
export function pedirAlMarco(datos) {
  const marco = /** @type {HTMLIFrameElement|null} */ (document.querySelector('.marco iframe'));
  if (!marco?.contentWindow) return false;
  marco.contentWindow.postMessage({ fuente: 'zurich-sitio', tipo: 'elegir', ...datos }, location.origin);
  return true;
}
