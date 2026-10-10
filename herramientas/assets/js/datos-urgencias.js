// @ts-check
/* =====================================================================
   Cotizador de demostración · Seguro Protección Urgencias — datos
   ---------------------------------------------------------------------
   Este no viene del piloto: se armó para la maqueta con las mismas
   piezas que Auto y Hogar. Todo el contenido sale del catálogo del sitio
   (assets/js/catalogo.js), que a su vez sale de zurich.cl, leído el 9 de
   octubre de 2026. Aquí no se escribe ni una cobertura ni un precio.

   EL PRECIO
   zurich.cl publica un precio «desde» por plan (UF 0,339 · 0,369 ·
   0,420; $13.900 · $15.122 · $17.213 a la UF del 21/09/2026). Como el
   sitio no dice de qué depende el precio final, la demostración cobra
   ese mismo valor publicado y lo dice: «precio referencial publicado».
   ===================================================================== */
import { producto, ENTIDADES } from '/assets/js/catalogo.js';

const P = /** @type {any} */ (producto('proteccion-urgencias'));

export const PRODUCTO = P.nombre;                // Seguro Protección Urgencias
export const ENTIDAD = ENTIDADES.vida;           // Zurich Chile Seguros de Vida S.A.

/** «Desde UF 0,339» → 0.339 · «Desde $13.900*» → 13900 · @param {string} t */
const numero = (t) => Number(String(t).replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'));

const filas = /** @type {any[][]} */ (P.coberturas.filas);
const fila = (/** @type {string} */ nombre) => filas.find((f) => f[0] === nombre) || [];
const precioUF = fila('Precio UF');
const precioPesos = fila('Precio $');

/** Las coberturas que se comparan (sin las dos filas de precio). */
export const COBERTURAS = filas.filter((f) => !String(f[0]).startsWith('Precio'));

/** Los tres planes, en el orden del catálogo. */
export const PLANES = ['basico', 'estandar', 'premium'].map((id, i) => ({
  id,
  nombre: P.coberturas.columnas[i],                       // «Plan Básico»…
  corto: String(P.coberturas.columnas[i]).replace('Plan ', ''),
  monto: fila('Fallecimiento')[i + 1],                    // «UF 150»…
  urgencia: fila('Acto quirúrgico por urgencia')[i + 1],  // «UF 10»…
  primaUF: numero(precioUF[i + 1]),
  primaPesos: numero(precioPesos[i + 1]),
}));

export const planPorId = (/** @type {string} */ id) => PLANES.find((p) => p.id === id) || PLANES[1];

/** «(*) Precio referencial equivalente al valor de la UF al 21/09/2026 por $40.983,58.» */
export const NOTA_PRECIO = String(P.precio).slice(String(P.precio).indexOf('(*)'));

/** Lo que zurich.cl dice antes de contratar: requisitos y condiciones. */
export const ANTES = { requisitos: P.antes.requisitos, condiciones: P.antes.condiciones };

/** Lo que dice zurich.cl sobre designar beneficiarios (preguntas frecuentes). */
export const DESIGNAR_DESPUES = P.preguntas
  .find((/** @type {any} */ q) => /beneficiarios/i.test(q.p))?.r?.[0] || '';

/** Beneficios del producto, textuales (telemedicina, montos, planes). */
export const BENEFICIOS = P.beneficios;

/** «UF 0,339»: tres decimales, como lo publica zurich.cl. @param {number} n */
export const ufPublicada = (n) => 'UF ' + n.toLocaleString('es-CL', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** Parentescos para designar beneficiarios. */
export const PARENTESCOS = ['Cónyuge o conviviente civil', 'Hijo o hija', 'Padre o madre', 'Hermano o hermana', 'Otra persona'];

/** Hasta cuántos beneficiarios se designan en este paso. */
export const MAX_BENEFICIARIOS = 4;
