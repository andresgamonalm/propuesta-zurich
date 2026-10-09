// @ts-check
/**
 * Medición de la experiencia (brief §Medición de la experiencia).
 *
 * Convención heredada del piloto, adaptada al mini sitio:
 *
 *     <ámbito>_<verbo>_<objeto>        auto_digital_click_cotizar
 *
 * Tres verbos y nada más:
 *   pag    se vio una página o pantalla            (vista de página)
 *   click  la persona hizo algo                     (clic en acción)
 *   rec    quedó registrado un resultado            (inicio, avance, fin)
 *
 * Ningún evento lleva datos de la persona ni texto libre: viaja el
 * resultado, no lo escrito. El perfil (usuario/administrador) sí viaja,
 * para poder excluir las demostraciones del equipo de los informes.
 *
 * Los eventos van a `window.dataLayer` (listo para Google Tag Manager, que
 * no está instalado: la herramienta de analítica es una decisión pendiente)
 * y a un registro local que se ve en Configuración › Medición.
 *
 * Las cuatro que responden la pregunta del negocio —¿cuántos clientes de
 * Banco BICE pasan de mirar un seguro a contratarlo?— son las de CLAVES.
 */
import { guardar, leer, borrar } from './almacen.js';

const CLAVE = 'medicion';
const MAXIMO = 400;

/** Sufijos de los cuatro eventos clave. */
export const CLAVES = [
  { sufijo: '_click_cotizar', titulo: 'Intención de cotizar', ayuda: 'Clics en «Cotizar» o «Contratar»' },
  { sufijo: '_rec_inicio_flujo', titulo: 'Flujos iniciados', ayuda: 'Cotizadores y trámites abiertos' },
  { sufijo: '_rec_fin_flujo', titulo: 'Flujos completados', ayuda: 'Compras o trámites terminados' },
  { sufijo: '_rec_solicitud_asesoria', titulo: 'Solicitudes de asesoría', ayuda: 'Formularios enviados' },
];

let perfil = 'anonimo';
/** @param {string} p */
export function fijarPerfil(p) { perfil = p; }

/** @param {string} texto */
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/**
 * @typedef {{ evento: string, fecha: number, pagina: string, detalle?: Record<string, string|number|boolean> }} Registro
 */

/** @param {string} evento @param {Record<string, string|number|boolean>} [detalle] */
export function registrar(evento, detalle = {}) {
  const pagina = location.pathname;
  const w = /** @type {any} */ (window);
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: evento, pagina, perfil, ...detalle });

  /** @type {Registro[]} */
  const lista = leer(CLAVE, []) || [];
  lista.unshift({ evento, fecha: Date.now(), pagina, detalle: { perfil, ...detalle } });
  guardar(CLAVE, lista.slice(0, MAXIMO), 30);
}

/** @returns {Registro[]} */
export function registros() { return leer(CLAVE, []) || []; }
export function borrarRegistros() { borrar(CLAVE); }

/**
 * Clics medidos por atributo: data-medir="objeto". El ámbito sale del
 * cuerpo de la página. Un solo oyente para todo el sitio.
 * @param {string} ambito
 */
export function escucharClics(ambito) {
  document.addEventListener('click', (e) => {
    const t = /** @type {HTMLElement|null} */ (e.target instanceof Element ? e.target.closest('[data-medir]') : null);
    if (!t) return;
    const objeto = t.dataset.medir || 'accion';
    const propio = t.dataset.ambito || ambito;
    registrar(`${propio}_click_${normalizar(objeto)}`);
  }, { capture: true });
}
