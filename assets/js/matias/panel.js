// @ts-check
/**
 * MatIAs · el panel armado.
 *
 * Junta las cuatro bibliotecas (inicio, auto, hogar, servicio) en un solo
 * contenido, le da al motor el contexto en vivo de la cotización (puente.js)
 * y decide en qué tema abre según la página. Se carga recién cuando alguien
 * abre a MatIAs (lanzador.js): las páginas no pagan este peso si nadie
 * conversa.
 */
import { crearInterprete, montarPanel } from './motor.js';
import { nodosInicio, aperturaInicio, CASOS_PARTICULARES, ramoDe, rotuloInicio } from './inicio.js';
import { nodosAuto, aperturaAuto, cambioAuto, planAuto } from './auto.js';
import { nodosHogar, aperturaHogar, cambioHogar, planHogar } from './hogar.js';
import { nodosServicio, aperturaAyuda, menuAyuda, sinCoincidenciaAyuda } from './servicio.js';
import { contexto as contextoMarco, alCambiar, pedirAlMarco } from './puente.js';
import { clp } from './comun.js';

const PRODUCTO = { auto: 'auto-digital', hogar: 'hogar-facil-plus' };

/* Lo que MatIAs eligió por la persona y el marco aún no confirma. */
/** @type {Record<string, { plan?: string, deducible?: number }>} */
const pedido = { auto: {}, hogar: {} };

/** El contexto de la cotización en pantalla, con lo pedido encima. @param {string} tema */
function contexto(tema) {
  if (tema !== 'auto' && tema !== 'hogar') return { vivo: false };
  const m = contextoMarco(PRODUCTO[tema]);
  if (!m?.planes?.length) return { vivo: false };
  const planId = pedido[tema].plan || m.plan;
  const deducible = pedido[tema].deducible ?? m.deducible;
  const plan = m.planes.find((/** @type {any} */ p) => p.id === planId) || m.planes[0];
  return { ...m, vivo: true, plan, deducible, precio: plan.precios[deducible] };
}

const CONTENIDO = {
  version: '1.0.0',
  fuente: { contratar: '', ayuda: '' },
  nodos: { ...nodosInicio, ...nodosAuto, ...nodosHogar, ...nodosServicio },
  apertura: {
    contratar: (/** @type {string} */ tema, /** @type {any} */ ctx) => tema === 'auto' ? aperturaAuto(ctx) : tema === 'hogar' ? aperturaHogar(ctx) : aperturaInicio(),
    ayuda: () => aperturaAyuda(),
  },
  menu: {
    contratar: (/** @type {string} */ tema) => tema === 'auto'
      ? ['auto_cubre', 'auto_precio', 'auto_promocion', 'auto_diferencias', 'auto_deducible', 'auto_inspeccion', 'auto_asistencias', 'auto_elegir']
      : tema === 'hogar'
        ? ['hogar_cubre', 'hogar_precio', 'hogar_asistencias', 'hogar_diferencias', 'hogar_requisitos', 'hogar_planes', 'hogar_elegir']
        : ['auto_cotizar', 'hogar_cotizar', 'otros_seguros', 'con_asesor', 'mundo_zurich'],
    ayuda: menuAyuda,
  },
  ambiguo: () => ({ parrafos: ['Puede ser una de estas. ¿Cuál te sirve?'], fuente: '' }),
  sinCoincidencia: (/** @type {string} */ modo, /** @type {string} */ tema) => modo === 'ayuda' ? sinCoincidenciaAyuda() : ({
    parrafos: [
      'Esa no te la puedo responder bien con lo que tengo, y prefiero no inventarte nada en algo que después es tu póliza.',
      tema === 'auto' || tema === 'hogar'
        ? 'Te puedo ayudar con coberturas, precio, deducible, asistencias y diferencias entre planes. Si es algo de tu caso, te dejo con Zurich.'
        : 'Lo que sí puedo hacer es llevarte a tus precios: dime si es para tu auto o para tu casa.',
    ],
    fuente: '',
    sugerencias: tema === 'auto' ? ['auto_cubre', 'auto_precio', 'ejecutivo'] : tema === 'hogar' ? ['hogar_cubre', 'hogar_precio', 'ejecutivo'] : ['auto_cotizar', 'hogar_cotizar', 'ejecutivo'],
  }),
  cambioDePlan: (/** @type {string} */ tema, /** @type {any} */ ctx) => tema === 'hogar' ? cambioHogar(ctx) : cambioAuto(ctx),
};

/** @param {string} texto ya normalizado */
function entidades(texto) {
  const ramo = ramoDe(texto);
  const m = texto.match(/(\d{1,2})\s*uf(\s|$)/) || texto.match(/deducible\s+(?:de\s+)?(\d{1,2})(\s|$)/);
  return {
    ramo, planAuto: planAuto(texto), planHogar: planHogar(texto),
    deducible: m ? Number(m[1]) : /(deducible cero|cero deducible|deducible 0)/.test(texto) ? 0 : undefined,
  };
}

const interpretar = crearInterprete({ nodos: CONTENIDO.nodos, entidades, casosParticulares: CASOS_PARTICULARES });

/** @param {string} modo @param {string} tema @param {any} ctx */
function rotulo(modo, tema, ctx) {
  if (modo === 'ayuda') return 'Ayuda con tu seguro';
  if (ctx?.vivo) return `${tema === 'hogar' ? 'Hogar Fácil Plus' : 'Auto Digital'} · ${ctx.plan.corto} · ${clp(ctx.precio)} al mes`;
  if (tema === 'auto') return 'Seguro de Auto Digital';
  if (tema === 'hogar') return 'Seguro Hogar Fácil Plus';
  return rotuloInicio();
}

let panel = /** @type {ReturnType<typeof montarPanel> | null} */ (null);

/** @param {string} tema @param {{ plan?: string, deducible?: number }} eleccion */
function alElegir(tema, eleccion) {
  pedido[tema] = { ...pedido[tema], ...eleccion };
  pedirAlMarco(eleccion);
}

/** Abre a MatIAs. @param {{ modo?: string, tema?: string, origen?: HTMLElement|null }} [op] */
export function abrir(op = {}) {
  if (!panel) {
    panel = montarPanel({ CONTENIDO, interpretar, contexto, rotulo, alElegir });
    /* La pantalla confirmó lo pedido o la persona cambió algo a mano: se
       limpia lo pedido y, si cambió lo que se mira, MatIAs lo dice. */
    alCambiar((producto) => {
      const tema = producto === PRODUCTO.hogar ? 'hogar' : 'auto';
      const m = contextoMarco(producto);
      const p = pedido[tema];
      const habiaPedido = Boolean(p.plan) || p.deducible !== undefined;
      const cumplido = (!p.plan || p.plan === m.plan) && (p.deducible === undefined || p.deducible === m.deducible);
      if (cumplido) pedido[tema] = {};
      panel?.avisarCambio({ propio: habiaPedido && cumplido });
    });
  }
  panel.abrir(op);
}

export const cerrar = () => panel?.cerrar();
