// @ts-check
/**
 * Almacenamiento local con fecha de vencimiento.
 *
 * Tres reglas, heredadas del piloto de ecommerce:
 * 1. Caduca sola: pasado el plazo, leer devuelve vacío y la borra.
 * 2. Se puede borrar a mano.
 * 3. Si el navegador no deja (ventana privada, cuota llena), no se cae:
 *    se atrapa la excepción y el recorrido sigue en memoria.
 */

const PREFIJO = 'zb:';
/** @type {Map<string, string>} respaldo en memoria si localStorage falla */
const memoria = new Map();

/** @param {string} clave @param {unknown} valor @param {number} [diasVigencia] */
export function guardar(clave, valor, diasVigencia = 30) {
  const paquete = JSON.stringify({ v: valor, vence: Date.now() + diasVigencia * 864e5 });
  try {
    localStorage.setItem(PREFIJO + clave, paquete);
  } catch {
    memoria.set(PREFIJO + clave, paquete);
  }
}

/** @template T @param {string} clave @param {T} [porOmision] @returns {T} */
export function leer(clave, porOmision) {
  let crudo = null;
  try {
    crudo = localStorage.getItem(PREFIJO + clave);
  } catch {
    crudo = memoria.get(PREFIJO + clave) ?? null;
  }
  if (crudo === null) crudo = memoria.get(PREFIJO + clave) ?? null;
  if (crudo === null) return /** @type {T} */ (porOmision);
  try {
    const { v, vence } = JSON.parse(crudo);
    if (typeof vence === 'number' && vence < Date.now()) {
      borrar(clave);
      return /** @type {T} */ (porOmision);
    }
    return v;
  } catch {
    borrar(clave);
    return /** @type {T} */ (porOmision);
  }
}

/** @param {string} clave */
export function borrar(clave) {
  memoria.delete(PREFIJO + clave);
  try { localStorage.removeItem(PREFIJO + clave); } catch { /* sin almacenamiento: nada que borrar */ }
}
