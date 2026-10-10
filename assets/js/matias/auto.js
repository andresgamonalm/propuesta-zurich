// @ts-check
/**
 * MatIAs · Seguro de Auto Digital.
 *
 * Viene del asesor de auto del piloto (asesor.js), con una diferencia de
 * fondo: aquí no se escribe ni una cobertura. Lo que MatIAs dice del
 * seguro sale del catálogo (zurich.cl › Auto Digital) y lo que dice del
 * precio sale de la cotización que la persona tiene en pantalla (el marco
 * la cuenta con { tipo: 'contexto' }). Si no hay cotización a la vista, no
 * inventa un precio: ofrece llevar a la persona a sus precios.
 *
 * Del piloto se dejaron fuera las respuestas que no están publicadas en
 * zurich.cl (listas de asistencias, exclusiones, el detalle del deducible
 * inteligente): mejor decir «eso lo explica la póliza» que inventarlo.
 */
import { producto } from '../catalogo.js';
import { esc, fechaLarga } from '../ui.js';
import { promoActiva } from '../piezas.js';
import { clp, dato, respuestaAyuda, FUENTE_PRODUCTO, FUENTE_COTIZACION, LLAMAR, accionTramite, FUENTE_AYUDA, ayuda } from './comun.js';

const P = /** @type {any} */ (producto('auto-digital'));
const FUENTE = FUENTE_PRODUCTO('Seguro de Auto Digital');
const COL = /** @type {Record<string, number>} */ ({ basico: 1, estandar: 2, premium: 3 });
const filas = /** @type {any[][]} */ (P.coberturas.filas);
const fila = (/** @type {string} */ inicio) => filas.find((f) => String(f[0]).startsWith(inicio)) || [];

/** Coberturas con ✓ en ese plan (o en los tres, si no hay plan). @param {string} [planId] */
const incluidas = (planId) => filas.filter((f) => (planId ? f[COL[planId]] === true : f[1] === true && f[2] === true && f[3] === true)).map((f) => esc(f[0]));
const soloPremium = () => filas.filter((f) => f[1] === false && f[3] === true).map((f) => esc(String(f[0]).toLowerCase()));

/** Tabla de cuotas por deducible del plan que se mira. @param {any} ctx */
const tablaDeducibles = (ctx) => ({
  encabezados: ['Deducible', 'Cuota al mes'],
  filas: ctx.deducibles.map((/** @type {number} */ d) => [`${d} UF`, clp(ctx.plan.precios[d])]),
  filaDestacada: ctx.deducibles.indexOf(ctx.deducible),
});

/** Diferencias entre planes: lo de las tarjetas del cotizador, o la tabla de zurich.cl. @param {any} ctx */
function comparativa(ctx) {
  if (ctx?.vivo) {
    return {
      encabezados: ['', ...ctx.planes.map((/** @type {any} */ p) => p.corto)],
      filas: [
        ['Taller', ...ctx.planes.map((/** @type {any} */ p) => p.taller)],
        ['Reemplazo', ...ctx.planes.map((/** @type {any} */ p) => p.reemplazo)],
        ['Resp. civil', ...ctx.planes.map((/** @type {any} */ p) => p.rc)],
        ['Asistencia', ...ctx.planes.map((/** @type {any} */ p) => p.asistencia)],
        [`Al mes (${ctx.deducible} UF)`, ...ctx.planes.map((/** @type {any} */ p) => clp(p.precios[ctx.deducible]))],
      ],
      colDestacada: ctx.planes.findIndex((/** @type {any} */ p) => p.id === ctx.plan.id) + 1,
    };
  }
  return {
    encabezados: ['', 'Básico', 'Estándar', 'Premium'],
    filas: ['Responsabilidad civil', 'Asistencia', 'Taller'].map((t) => [t === 'Responsabilidad civil' ? 'Resp. civil' : t, ...fila(t).slice(1).map(String)]),
  };
}

const sinPrecio = () => ({
  parrafos: [esc(P.precio), `Si quieres, te llevo a tus precios con dos datos: tu ${dato('RUT')} y la ${dato('patente')} de tu auto.`],
  fuente: FUENTE,
  sugerencias: ['auto_cotizar', 'auto_cubre', 'auto_promocion'],
});

/** @param {any} ctx */
function lineaPromo(ctx) {
  const pr = ctx.promo;
  if (!pr?.disponible) return '';
  if (pr.activa) return `Con ${esc(pr.etiqueta)}, las cuotas ${esc(pr.numeros.join(' y '))} no se pagan: ahorras ${dato(clp(ctx.plan.descuento))} y recibes una ${esc(pr.beneficio.replace(/^Gift/, 'gift'))}.`;
  return `Si eliges vigencia de ${dato('24 meses')}, con ${esc(pr.etiqueta)} las cuotas ${esc(pr.numeros.join(' y '))} no se pagan y recibes una ${esc(pr.beneficio.replace(/^Gift/, 'gift'))}.`;
}

/** @type {Record<string, any>} */
export const nodosAuto = {
  auto_cubre: {
    etiqueta: '¿Qué cubre?', modo: 'contratar', tema: 'auto',
    terminos: [['cubre', 4], ['cobertura', 4], ['coberturas', 4], ['que incluye', 4], ['incluye', 3], ['protege', 3], ['que trae', 3]],
    penaliza: [['no cubre', 6], ['no incluye', 6], ['excluye', 5]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: [
        ctx?.vivo ? `En el ${dato(ctx.plan.nombre)} tu auto tiene:` : 'Estas coberturas vienen en los tres planes de Auto Digital (Básico, Estándar y Premium):',
        null,
        ctx?.vivo
          ? `Responsabilidad civil (daño emergente, lucro cesante y daño moral): ${dato(ctx.plan.rc)}. Asistencia ${esc(ctx.plan.asistencia)} y taller ${esc(ctx.plan.taller.toLowerCase())}.`
          : `La responsabilidad civil depende del plan: ${esc(fila('Responsabilidad civil').slice(1).join(', '))}.`,
        ...(ctx?.vivo && ctx.plan.id === 'premium' ? [] : [`Solo en el Plan Premium: ${soloPremium().join(', ')}.`]),
      ],
      lista: incluidas(ctx?.vivo ? ctx.plan.id : undefined),
      fuente: ctx?.vivo ? `${FUENTE} · y tu cotización en pantalla` : FUENTE,
      sugerencias: ['auto_precio', 'auto_diferencias', 'auto_no_cubre'],
    }),
  },

  auto_no_cubre: {
    etiqueta: '¿Qué debo saber antes?', modo: 'contratar', tema: 'auto',
    terminos: [['no cubre', 5], ['no incluye', 5], ['excluye', 5], ['exclusiones', 5], ['letra chica', 5], ['condiciones', 4], ['antes de contratar', 5]],
    respuesta: () => ({
      parrafos: ['Antes de contratar conviene que sepas esto:', null, esc(P.documentos[0])],
      lista: P.antes.condiciones.map((/** @type {string} */ t) => esc(t)),
      fuente: FUENTE,
      sugerencias: ['auto_cubre', 'auto_inspeccion', 'auto_precio'],
    }),
  },

  auto_precio: {
    etiqueta: '¿Cuánto sale?', modo: 'contratar', tema: 'auto',
    terminos: [['cuanto sale', 5], ['cuanto cuesta', 5], ['cuanto vale', 5], ['precio', 5], ['cuanto pago', 5], ['cuota', 3], ['al mes', 4], ['mensual', 4], ['cuanto', 3]],
    respuesta: (/** @type {any} */ ctx) => !ctx?.vivo ? sinPrecio() : ({
      parrafos: [
        `El ${dato(ctx.plan.nombre)} con deducible ${esc(ctx.deducible)} UF queda en ${dato(`${clp(ctx.precio)} al mes`)}, para tu ${esc(ctx.vehiculo)}${ctx.meses === 24 ? ', con vigencia de 24 meses' : ''}.`,
        ...(lineaPromo(ctx) ? [lineaPromo(ctx)] : []),
        'Si quieres bajarla, el deducible es lo que más mueve la cuota.',
      ],
      fuente: FUENTE_COTIZACION,
      sugerencias: ['auto_ahorrar', 'auto_diferencias', 'auto_elegir'],
    }),
  },

  auto_ahorrar: {
    etiqueta: '¿Cómo pago menos?', modo: 'contratar', tema: 'auto',
    terminos: [['pagar menos', 6], ['pago menos', 6], ['mas barato', 5], ['mas economico', 5], ['bajar la cuota', 6], ['ahorrar', 5], ['subir el deducible', 6], ['muy caro', 5], ['esta caro', 5]],
    respuesta: (/** @type {any} */ ctx) => !ctx?.vivo ? sinPrecio() : ({
      parrafos: [
        `Así cambia la cuota del ${dato(ctx.plan.nombre)} con cada deducible:`,
        null,
        `Entre deducible ${esc(ctx.deducibles[0])} UF y ${esc(ctx.deducibles[ctx.deducibles.length - 1])} UF hay ${dato(clp(ctx.plan.precios[ctx.deducibles[0]] - ctx.plan.precios[ctx.deducibles[ctx.deducibles.length - 1]]))} al mes de diferencia. Dime cuál quieres ver y lo elijo en la pantalla.`,
      ],
      tabla: tablaDeducibles(ctx),
      fuente: FUENTE_COTIZACION,
      sugerencias: ['auto_deducible', 'auto_precio', 'auto_elegir'],
    }),
  },

  auto_deducible: {
    etiqueta: '¿Qué es el deducible?', modo: 'contratar', tema: 'auto',
    terminos: [['deducible', 4], ['deducibles', 4], ['que es el deducible', 6], ['franquicia', 4]],
    penaliza: [['inteligente', 6]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: [
        esc(P.antes.condiciones[0]),
        ...(ctx?.vivo ? [`Tú tienes elegido ${dato(`deducible ${ctx.deducible} UF`)}, y tu cuota es ${dato(`${clp(ctx.precio)} al mes`)}.`] : []),
      ],
      fuente: FUENTE,
      sugerencias: ctx?.vivo ? ['auto_ahorrar', 'auto_deducible_inteligente', 'auto_precio'] : ['auto_deducible_inteligente', 'auto_cotizar'],
    }),
  },

  auto_deducible_inteligente: {
    etiqueta: 'Deducible inteligente', modo: 'contratar', tema: 'auto',
    terminos: [['deducible inteligente', 8], ['inteligente', 5], ['no pago deducible', 6], ['culpa del otro', 5], ['no fue mi culpa', 5]],
    respuesta: () => ({
      parrafos: [
        `El ${dato('Deducible inteligente')} viene incluido en los tres planes de Auto Digital: Básico, Estándar y Premium.`,
        'Cómo opera en cada caso lo dicen las condiciones de la póliza. Si quieres que te lo expliquen con tu caso, llama a Zurich.',
      ],
      acciones: [LLAMAR],
      fuente: FUENTE,
      sugerencias: ['auto_deducible', 'auto_cubre', 'auto_precio'],
    }),
  },

  auto_promocion: {
    etiqueta: '¿Hay promoción?', modo: 'contratar', tema: 'auto',
    terminos: [['promocion', 5], ['promo', 5], ['oferta', 4], ['zurich days', 7], ['gift card', 6], ['cuotas gratis', 6], ['descuento', 4], ['regalo', 4]],
    respuesta: (/** @type {any} */ ctx) => {
      if (!promoActiva(P)) {
        return { parrafos: ['Hoy no hay una promoción vigente para Auto Digital. Igual puedes cotizar y contratar 100% en línea.'], fuente: FUENTE, sugerencias: ['auto_precio', 'auto_cubre'] };
      }
      const pr = P.promocion;
      return {
        parrafos: [
          `${dato(`${P.gancho.etiqueta}: ${pr.titulo}`)}.`,
          esc(pr.detalle),
          `Válido hasta el ${esc(fechaLarga(pr.hasta))}. ${esc(pr.entregaBeneficio)}`,
          ...(ctx?.vivo ? [ctx.meses === 24 ? 'Tu cotización ya está en 24 meses: la promoción está aplicada en el precio que ves.' : `Tu cotización está en 12 meses. Para tener la promoción, elige ${dato('Bienal, 24 meses')} arriba de los planes.`] : []),
        ],
        micro: 'Las bases de la promoción están al pie de la página del producto.',
        fuente: FUENTE,
        sugerencias: ['auto_precio', 'auto_cubre', 'auto_elegir'],
      };
    },
  },

  auto_diferencias: {
    etiqueta: '¿En qué se diferencian?', modo: 'contratar', tema: 'auto',
    terminos: [['diferencia', 5], ['diferencian', 5], ['comparar', 5], ['comparacion', 5], ['versus', 4], ['entre los planes', 5], ['que cambia', 4], ['otros planes', 4]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: ['Las coberturas del auto son las mismas en los tres planes. Lo que cambia es esto:', null,
        ...(ctx?.vivo ? [] : [`Y solo el Premium suma ${soloPremium().join(', ')}.`])],
      tabla: comparativa(ctx),
      fuente: ctx?.vivo ? FUENTE_COTIZACION : FUENTE,
      sugerencias: ['auto_cual_conviene', 'auto_precio', 'auto_elegir'],
    }),
  },

  auto_cual_conviene: {
    etiqueta: '¿Cuál me conviene?', modo: 'contratar', tema: 'auto',
    terminos: [['cual me conviene', 6], ['cual conviene', 6], ['cual es mejor', 5], ['que me recomiendas', 6], ['cual elijo', 5], ['recomiendame', 5], ['cual es el mejor', 5]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: ['Esa decisión es tuya, y no te la voy a tomar yo. Pero te la dejo clara:', null],
      tabla: comparativa(ctx),
      gancho: 'Si prefieres conversarlo con una persona, Zurich te atiende por teléfono.',
      acciones: [LLAMAR],
      fuente: ctx?.vivo ? FUENTE_COTIZACION : FUENTE,
      sugerencias: ['auto_elegir', 'auto_precio', 'auto_cubre'],
    }),
  },

  auto_taller: {
    etiqueta: '¿Dónde reparan mi auto?', modo: 'contratar', tema: 'auto',
    terminos: [['taller', 5], ['donde reparan', 5], ['donde lo arreglan', 5], ['multimarca', 4], ['servicio tecnico', 4], ['de la marca', 3]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: ctx?.vivo
        ? [`Con el ${dato(ctx.plan.nombre)}, el taller es ${dato(ctx.plan.taller.toLowerCase())}.`]
        : [`Según el plan: ${esc(fila('Taller').slice(1).map((v, i) => `${['Básico', 'Estándar', 'Premium'][i]}, ${String(v).toLowerCase()}`).join('; '))}.`],
      fuente: ctx?.vivo ? FUENTE_COTIZACION : FUENTE,
      sugerencias: ['auto_diferencias', 'auto_reemplazo', 'auto_precio'],
    }),
  },

  auto_reemplazo: {
    etiqueta: '¿Me dan auto de reemplazo?', modo: 'contratar', tema: 'auto',
    terminos: [['auto de reemplazo', 6], ['reemplazo', 4], ['me dan otro auto', 5], ['me quedo sin auto', 5], ['auto mientras', 5]],
    respuesta: (/** @type {any} */ ctx) => ctx?.vivo ? ({
      parrafos: [`Con el ${dato(ctx.plan.nombre)}, el auto de reemplazo es por ${dato(ctx.plan.reemplazo.toLowerCase())}, según tu cotización.`],
      fuente: FUENTE_COTIZACION,
      sugerencias: ['auto_diferencias', 'auto_asistencias', 'auto_elegir'],
    }) : ({
      parrafos: ['Depende del plan, y lo ves en cada tarjeta al cotizar. ¿Te llevo a tus planes?'],
      fuente: '',
      sugerencias: ['auto_cotizar', 'auto_diferencias'],
    }),
  },

  auto_asistencias: {
    etiqueta: '¿Qué asistencia trae?', modo: 'contratar', tema: 'auto',
    terminos: [['asistencia', 4], ['asistencias', 4], ['grua', 4], ['panne', 4], ['remolque', 4]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: [
        ctx?.vivo ? `El ${dato(ctx.plan.nombre)} trae asistencia ${dato(ctx.plan.asistencia)}.` : `La asistencia depende del plan: ${esc(fila('Asistencia').slice(1).map((v, i) => `${['Básico', 'Estándar', 'Premium'][i]}, ${String(v).toLowerCase()}`).join('; '))}.`,
        ...(ayuda('asistencia')?.r.map((t) => esc(t)) || []),
      ],
      fuente: FUENTE_AYUDA,
      sugerencias: ['auto_diferencias', 'auto_cubre', 'auto_precio'],
    }),
  },

  auto_inspeccion: {
    etiqueta: '¿Desde cuándo estoy cubierto?', modo: 'contratar', tema: 'auto',
    terminos: [['inspeccion', 5], ['inspeccionar', 5], ['desde cuando', 5], ['cuando empieza', 5], ['cuando comienza', 5], ['auto nuevo', 4], ['auto usado', 4]],
    respuesta: () => ({
      parrafos: ['Así funciona la inspección y desde cuándo quedas cubierto:', null],
      lista: P.antes.requisitos.map((/** @type {string} */ t) => esc(t)),
      fuente: FUENTE,
      sugerencias: ['auto_cubre', 'auto_precio', 'auto_no_cubre'],
    }),
  },

  auto_extranjero: {
    etiqueta: '¿Me cubre fuera del país?', modo: 'contratar', tema: 'auto',
    terminos: [['extranjero', 6], ['fuera del pais', 6], ['argentina', 5], ['viaje', 3], ['viajar', 3]],
    respuesta: () => ({ parrafos: [esc(P.antes.condiciones[2])], fuente: FUENTE, sugerencias: ['auto_diferencias', 'auto_cubre'] }),
  },

  auto_perdida_total: {
    etiqueta: '¿Y si hay pérdida total?', modo: 'contratar', tema: 'auto',
    terminos: [['perdida total', 7], ['se destruye', 5], ['me lo roban', 4]],
    respuesta: () => respuestaAyuda('perdida-total', { sugerencias: ['auto_cubre', 'auto_precio'] }),
  },

  auto_gps: {
    etiqueta: '¿Me dan GPS?', modo: 'contratar', tema: 'auto',
    terminos: [['gps', 7], ['antiportonazo', 7], ['ley 21170', 7]],
    respuesta: () => respuestaAyuda('gps', { sugerencias: ['auto_cubre', 'auto_precio'] }),
  },

  auto_siniestro: {
    etiqueta: '¿Qué hago si choco?', modo: 'contratar', tema: 'auto',
    terminos: [['si choco', 6], ['que pasa si choco', 7], ['si tengo un accidente', 6], ['como se activa', 5], ['como activo', 5]],
    respuesta: () => ({ ...respuestaAyuda('siniestro-auto'), acciones: [accionTramite('denuncia-vehiculo')].filter(Boolean), sugerencias: ['auto_cubre', 'auto_deducible_inteligente'] }),
  },

  auto_elegir: {
    etiqueta: 'Elegir este plan', modo: 'contratar', tema: 'auto', cta: true,
    terminos: [['lo quiero', 6], ['quiero contratar', 6], ['contratar', 4], ['me lo llevo', 6], ['quiero este', 6], ['elijo este', 6], ['me quedo con', 6], ['lo tomo', 6]],
    respuesta: (/** @type {any} */ ctx) => !ctx?.vivo ? nodosAuto.auto_precio.respuesta(ctx) : ({
      parrafos: [
        `Listo: quedó elegido el ${dato(ctx.plan.nombre)} con deducible ${esc(ctx.deducible)} UF, a ${dato(`${clp(ctx.precio)} al mes`)}.`,
        `Cuando quieras, aprieta ${dato('Continuar')} en el cotizador y sigues con la confirmación.`,
      ],
      elegir: { plan: ctx.plan.id },
      fuente: FUENTE_COTIZACION,
      sugerencias: ['auto_promocion', 'auto_cubre', 'ejecutivo'],
    }),
  },
};

/** @param {any} ctx */
export function aperturaAuto(ctx) {
  if (ctx?.vivo) {
    return {
      parrafos: [
        `Estás mirando el ${dato(ctx.plan.nombre)} para tu ${esc(ctx.vehiculo)}, a ${dato(`${clp(ctx.precio)} al mes`)} con deducible ${esc(ctx.deducible)} UF.`,
        'Pregúntame con tus palabras: qué cubre, cuánto sale con otro deducible o en qué se diferencia de los otros planes. Si me dices «¿y el premium?», lo elijo en la pantalla.',
      ],
      micro: 'Te doy información sobre este seguro, no asesoría: la decisión es tuya.',
      fuente: '',
      sugerencias: ['auto_cubre', 'auto_ahorrar', 'auto_promocion', 'auto_cual_conviene'],
    };
  }
  return {
    parrafos: [
      `Te cuento del ${dato(P.nombre)}: ${esc(P.bajada.charAt(0).toLowerCase() + P.bajada.slice(1))}`,
      ...(promoActiva(P) ? [`Hasta el ${esc(fechaLarga(P.promocion.hasta))}: ${dato(P.promocion.titulo)} con vigencia de 24 meses.`] : []),
      `Con tu ${dato('RUT')} y la ${dato('patente')} te llevo directo a tus precios. O pregúntame lo que quieras.`,
    ],
    micro: 'Te doy información sobre este seguro, no asesoría: la decisión es tuya.',
    fuente: '',
    sugerencias: ['auto_cotizar', 'auto_cubre', 'auto_promocion', 'auto_inspeccion'],
  };
}

/** Cuando la pantalla cambia el plan o el deducible. @param {any} ctx */
export const cambioAuto = (ctx) => ({
  parrafos: [`Ahora estamos viendo el ${dato(ctx.plan.nombre)} con deducible ${esc(ctx.deducible)} UF: ${dato(`${clp(ctx.precio)} al mes`)}. Pregúntame lo que quieras de este.`],
  fuente: '',
});

/** Planes que se reconocen en la frase. @param {string} texto */
export function planAuto(texto) {
  if (/(^|\s)(premium|el completo|el mejor)(\s|$)/.test(texto)) return 'premium';
  if (/(^|\s)(estandar|standard|el del medio|intermedio)(\s|$)/.test(texto)) return 'estandar';
  if (/(^|\s)(basico|basic|el mas barato|el economico)(\s|$)/.test(texto)) return 'basico';
  return undefined;
}

