// @ts-check
/**
 * Lo que el administrador decide sobre cada contenido, encima del catálogo.
 *
 * El catálogo trae los valores de la propuesta; aquí se guardan solo las
 * diferencias. Así «Restablecer» es borrar un objeto, y un cambio en el
 * catálogo no queda tapado por una copia vieja.
 *
 * Regla del brief que esto hace cumplir: «Ocultar botones, tarjetas o
 * secciones mientras no tengan un destino activo».
 *
 * Prototipo: se guarda en este navegador. En producción es un servicio.
 */
import { guardar, leer, borrar } from './almacen.js';
import { PRODUCTOS, SERVICIOS, MUNDO_ZURICH } from './catalogo.js';

const CLAVE = 'contenidos';
const CLAVE_SOLICITUDES = 'solicitudes';

/** @typedef {{ visible: boolean, destino: string, embebido: boolean }} Ajuste */

/** Valores de la propuesta para cada contenido configurable. */
function porOmision(/** @type {string} */ id) {
  const p = PRODUCTOS.find((x) => x.id === id);
  if (p) return { visible: true, destino: p.flujo?.referencia ?? p.referencia, embebido: false };
  const s = SERVICIOS.find((x) => x.id === id);
  if (s) return { visible: true, destino: s.referencia, embebido: false };
  if (id === MUNDO_ZURICH.id) return { visible: true, destino: MUNDO_ZURICH.referencia, embebido: false };
  if (id.startsWith('promo:')) return { visible: true, destino: '', embebido: false };
  return { visible: true, destino: '', embebido: false };
}

/** @returns {Record<string, Partial<Ajuste>>} */
function todos() { return leer(CLAVE, {}) || {}; }

/** @param {string} id @returns {Ajuste} */
export function ajuste(id) {
  return { ...porOmision(id), ...(todos()[id] || {}) };
}

/** @param {string} id @param {Partial<Ajuste>} cambios */
export function guardarAjuste(id, cambios) {
  const actuales = todos();
  actuales[id] = { ...(actuales[id] || {}), ...cambios };
  guardar(CLAVE, actuales, 365);
}

/** @param {string} id */
export function esVisible(id) { return ajuste(id).visible; }

export function restablecer() { borrar(CLAVE); }

/** ¿Hay algún cambio respecto de la propuesta? */
export function hayCambios() { return Object.keys(todos()).length > 0; }

/* ---- Solicitudes de asesoría -------------------------------------------- */

/**
 * @typedef {{ id: string, producto: string, nombre: string, correo: string,
 *   celular: string, horario: string, comentario: string, fecha: number }} Solicitud
 */

/** @returns {Solicitud[]} */
export function solicitudes() { return leer(CLAVE_SOLICITUDES, []) || []; }

/** @param {Omit<Solicitud, 'id'|'fecha'>} datos @returns {Solicitud} */
export function agregarSolicitud(datos) {
  const nueva = { ...datos, id: Math.random().toString(36).slice(2, 10), fecha: Date.now() };
  guardar(CLAVE_SOLICITUDES, [nueva, ...solicitudes()].slice(0, 200), 90);
  return nueva;
}

/** @param {string} id */
export function solicitud(id) { return solicitudes().find((s) => s.id === id); }

export function borrarSolicitudes() { borrar(CLAVE_SOLICITUDES); }
