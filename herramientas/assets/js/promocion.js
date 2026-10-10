// @ts-check
/* =====================================================================
   La promoción dentro del cotizador
   ---------------------------------------------------------------------
   Solo se aplica una promoción publicada por Zurich, con sus bases, y se
   lee del mismo catálogo del sitio: la tarjeta del costado y la boleta
   no pueden decir cosas distintas, ni seguir vigente una y vencida la
   otra. Si el administrador la oculta en Configuración, aquí tampoco
   corre.

   Zurich Days (bases oficiales, 1 al 10 de octubre de 2026): con
   vigencia de 24 meses, las cuotas 3 y 6 no se pagan y se entrega una
   gift card Apprecio de $60.000. Con 12 meses no hay promoción.

   Hogar y Protección Urgencias no tienen promoción de cuotas publicada:
   sus cotizadores usan SIN_PROMOCION.
   ===================================================================== */
import { producto } from '/assets/js/catalogo.js';
import { ajuste } from '/assets/js/estado.js';
import { promoVigente } from '/assets/js/ui.js';

/**
 * @typedef {{ activa: boolean, disponible: boolean, etiqueta: string,
 *   titulo: string, cuotasGratis: number, numeros: number[], meses: number,
 *   beneficio: string, entrega: string, bases: string }} Promocion
 */

/** @type {Promocion} */
export const SIN_PROMOCION = {
  activa: false, disponible: false, etiqueta: '', titulo: '', cuotasGratis: 0,
  numeros: [], meses: 0, beneficio: '', entrega: '', bases: '',
};

/**
 * La promoción de Auto Digital para la vigencia elegida.
 * `disponible`: hay promoción hoy. `activa`: además aplica a esta vigencia.
 * @param {number} meses
 * @returns {Promocion}
 */
export function promocionAuto(meses) {
  const p = /** @type {any} */ (producto('auto-digital'))?.promocion;
  if (!p || !promoVigente(p) || !ajuste(`promo:${p.id}`).visible) return SIN_PROMOCION;
  const base = {
    disponible: true, etiqueta: 'Zurich Days', titulo: p.titulo, numeros: p.cuotasGratis,
    meses: p.vigenciaMeses, beneficio: p.beneficio, entrega: p.entregaBeneficio, bases: p.bases,
  };
  return Number(meses) === p.vigenciaMeses
    ? { ...base, activa: true, cuotasGratis: p.cuotasGratis.length }
    : { ...base, activa: false, cuotasGratis: 0 };
}

/** «3 y 6» · @param {number[]} n */
export const numerosTxt = (n) => n.length > 1 ? `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}` : String(n[0] ?? '');

/** «Gift card Apprecio…» → «gift card Apprecio…»: solo la primera letra. @param {string} t */
export const enFrase = (t) => t.charAt(0).toLowerCase() + t.slice(1);
