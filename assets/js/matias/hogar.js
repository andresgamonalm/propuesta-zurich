// @ts-check
/**
 * MatIAs · Seguro Hogar Fácil Plus.
 *
 * Viene del asesor de hogar del piloto, con el mismo criterio que auto.js:
 * del seguro, solo lo que publica zurich.cl (catálogo); del precio, solo lo
 * que la persona tiene en pantalla. Sin cotización a la vista, ofrece
 * llevarla a su vivienda con dos datos.
 */
import { producto } from '../catalogo.js';
import { esc } from '../ui.js';
import { clp, dato, respuestaAyuda, FUENTE_PRODUCTO, FUENTE_COTIZACION, LLAMAR, ayuda } from './comun.js';

const P = /** @type {any} */ (producto('hogar-facil-plus'));
const PAUTO = /** @type {any} */ (producto('auto-digital'));
const FUENTE = FUENTE_PRODUCTO('Seguro Hogar Fácil Plus');

/** @param {any} ctx */
const tablaDeducibles = (ctx) => ({
  encabezados: ['Deducible', 'Cuota al mes'],
  filas: ctx.deducibles.map((/** @type {number} */ d) => [`${d} UF`, clp(ctx.plan.precios[d])]),
  filaDestacada: ctx.deducibles.indexOf(ctx.deducible),
});

/** @param {any} ctx */
const comparativa = (ctx) => ({
  encabezados: ['', ...ctx.planes.map((/** @type {any} */ p) => p.corto)],
  filas: [
    ['Qué asegura', ...ctx.planes.map((/** @type {any} */ p) => p.materia)],
    ['Asistencia', ...ctx.planes.map((/** @type {any} */ p) => p.asistencia)],
    ['Sin deducible', ...ctx.planes.map((/** @type {any} */ p) => p.sinDeducibleEn.length ? `En ${p.sinDeducibleEn.length} coberturas` : '—')],
    [`Al mes (${ctx.deducible} UF)`, ...ctx.planes.map((/** @type {any} */ p) => clp(p.precios[ctx.deducible]))],
  ],
  colDestacada: ctx.planes.findIndex((/** @type {any} */ p) => p.id === ctx.plan.id) + 1,
});

const sinPrecio = () => ({
  parrafos: [esc(P.precio), `Si quieres, te llevo a tu cotización con dos datos: tu ${dato('RUT')} y la ${dato('comuna')} de tu vivienda.`],
  fuente: FUENTE,
  sugerencias: ['hogar_cotizar', 'hogar_cubre', 'hogar_requisitos'],
});

/** @type {Record<string, any>} */
export const nodosHogar = {
  hogar_cubre: {
    etiqueta: '¿Qué cubre?', modo: 'contratar', tema: 'hogar',
    terminos: [['cubre', 4], ['cobertura', 4], ['coberturas', 4], ['que incluye', 4], ['incluye', 3], ['protege', 3]],
    penaliza: [['no cubre', 6], ['no incluye', 6]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: [
        `Las principales características y coberturas de ${dato(P.nombre)}:`,
        null,
        ...(ctx?.vivo ? [`En tu cotización estás mirando el ${dato(ctx.plan.corto)}: asegura ${esc(ctx.plan.materia.toLowerCase())}${ctx.plan.cubreContenido ? `, con tus cosas hasta ${dato(ctx.contenido)}` : ''}.`] : []),
      ],
      lista: P.coberturas.lista.map((/** @type {string} */ t) => esc(t)),
      fuente: ctx?.vivo ? `${FUENTE} · y tu cotización en pantalla` : FUENTE,
      sugerencias: ['hogar_planes', 'hogar_asistencias', 'hogar_precio'],
    }),
  },

  hogar_planes: {
    etiqueta: '¿Qué planes hay?', modo: 'contratar', tema: 'hogar',
    terminos: [['planes', 4], ['que planes', 6], ['vacacional', 6], ['rural', 6], ['hipotecario', 6], ['casa de veraneo', 6]],
    respuesta: () => ({
      parrafos: [
        `${dato(P.nombre)} tiene cinco planes: ${esc(P.gancho.nota)}`,
        'En este cotizador eliges en línea entre Estándar (solo la estructura, o estructura y contenido) y Premium, para vivienda urbana de uso permanente. Vacacional, Rural e Hipotecario los ve un ejecutivo de Zurich.',
      ],
      acciones: [LLAMAR],
      fuente: FUENTE,
      sugerencias: ['hogar_diferencias', 'hogar_requisitos', 'hogar_cotizar'],
    }),
  },

  hogar_diferencias: {
    etiqueta: '¿En qué se diferencian?', modo: 'contratar', tema: 'hogar',
    terminos: [['diferencia', 5], ['diferencian', 5], ['comparar', 5], ['entre los planes', 5], ['que cambia', 4], ['cual me conviene', 5], ['cual es mejor', 5]],
    respuesta: (/** @type {any} */ ctx) => ctx?.vivo ? ({
      parrafos: ['La decisión es tuya. Esto es lo que cambia entre los planes de tu cotización:', null,
        `El Premium va sin deducible en ${esc(ctx.planes.find((/** @type {any} */ p) => p.id === 'premium')?.sinDeducibleEn.join(', ').toLowerCase())}.`],
      tabla: comparativa(ctx),
      fuente: FUENTE_COTIZACION,
      sugerencias: ['hogar_precio', 'hogar_asistencias', 'hogar_elegir'],
    }) : nodosHogar.hogar_planes.respuesta(),
  },

  hogar_asistencias: {
    etiqueta: '¿Qué asistencias trae?', modo: 'contratar', tema: 'hogar',
    terminos: [['asistencia', 4], ['asistencias', 4], ['gasfiter', 5], ['gasfiteria', 5], ['cerrajero', 5], ['cerrajeria', 5], ['electricista', 5], ['mascota', 5], ['mascotas', 5], ['sos', 4]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: [
        ctx?.vivo ? `Tu plan trae ${dato(ctx.plan.asistencia)}. Estas son las tres asistencias de ${esc(P.nombre)}, según el plan que contrates:` : `${esc(P.nombre)} tiene tres tipos de asistencia, según el plan que contrates:`,
        null,
        ...(ayuda('asistencia')?.r.slice(0, 1).map((t) => esc(t)) || []),
      ],
      lista: P.asistencias.map((/** @type {any} */ a) => `<strong>${esc(a.titulo)}:</strong> ${esc(a.items.join(', ').toLowerCase())}.`),
      fuente: FUENTE,
      sugerencias: ['hogar_cubre', 'hogar_diferencias', 'hogar_precio'],
    }),
  },

  hogar_requisitos: {
    etiqueta: '¿Qué viviendas se aseguran?', modo: 'contratar', tema: 'hogar',
    terminos: [['requisitos', 5], ['que viviendas', 6], ['se puede asegurar', 6], ['antiguedad', 5], ['material', 4], ['adobe', 5], ['departamento', 3], ['arriendo', 3]],
    respuesta: () => ({
      parrafos: [`${esc(P.antes.titulo)}`, null],
      lista: [...P.antes.requisitos, ...P.antes.condiciones].map((/** @type {string} */ t) => esc(t)),
      fuente: FUENTE,
      sugerencias: ['hogar_cubre', 'hogar_planes', 'hogar_cotizar'],
    }),
  },

  hogar_precio: {
    etiqueta: '¿Cuánto sale?', modo: 'contratar', tema: 'hogar',
    terminos: [['cuanto sale', 5], ['cuanto cuesta', 5], ['cuanto vale', 5], ['precio', 5], ['cuanto pago', 5], ['cuota', 3], ['al mes', 4], ['cuanto', 3]],
    respuesta: (/** @type {any} */ ctx) => !ctx?.vivo ? sinPrecio() : ({
      parrafos: [
        `El ${dato(ctx.plan.corto)} con deducible ${esc(ctx.deducible)} UF queda en ${dato(`${clp(ctx.precio)} al mes`)}, para ${esc(ctx.vivienda)} (${esc(ctx.estructura)} asegurados).`,
        'Hogar Fácil Plus no tiene una promoción publicada hoy. Si quieres bajar la cuota, el deducible la mueve.',
      ],
      fuente: FUENTE_COTIZACION,
      sugerencias: ['hogar_ahorrar', 'hogar_diferencias', 'hogar_elegir'],
    }),
  },

  hogar_ahorrar: {
    etiqueta: '¿Cómo pago menos?', modo: 'contratar', tema: 'hogar',
    terminos: [['pagar menos', 6], ['pago menos', 6], ['mas barato', 5], ['bajar la cuota', 6], ['ahorrar', 5], ['subir el deducible', 6], ['muy caro', 5]],
    respuesta: (/** @type {any} */ ctx) => !ctx?.vivo ? sinPrecio() : ({
      parrafos: [`Así cambia la cuota del ${dato(ctx.plan.corto)} con cada deducible:`, null, 'Dime cuál quieres ver y lo elijo en la pantalla.'],
      tabla: tablaDeducibles(ctx),
      fuente: FUENTE_COTIZACION,
      sugerencias: ['hogar_deducible', 'hogar_precio', 'hogar_elegir'],
    }),
  },

  hogar_deducible: {
    etiqueta: '¿Qué es el deducible?', modo: 'contratar', tema: 'hogar',
    terminos: [['deducible', 4], ['deducibles', 4], ['que es el deducible', 6]],
    penaliza: [['sin deducible', 5]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: [
        esc(PAUTO.antes.condiciones[0]),
        ...(ctx?.vivo ? [`Tú tienes elegido ${dato(`deducible ${ctx.deducible} UF`)}: ${dato(`${clp(ctx.precio)} al mes`)}.`] : []),
      ],
      fuente: 'Preguntas frecuentes de zurich.cl',
      sugerencias: ['hogar_sin_deducible', 'hogar_ahorrar', 'hogar_precio'],
    }),
  },

  hogar_sin_deducible: {
    etiqueta: '¿Hay plan sin deducible?', modo: 'contratar', tema: 'hogar',
    terminos: [['sin deducible', 7], ['canerias', 6], ['cristales', 6], ['naturaleza', 4]],
    respuesta: () => ({
      parrafos: [esc(P.coberturas.lista.find((/** @type {string} */ t) => t.startsWith('Sin deducible')) || '')],
      fuente: FUENTE,
      sugerencias: ['hogar_diferencias', 'hogar_precio'],
    }),
  },

  hogar_contenido: {
    etiqueta: '¿Cubre mis cosas?', modo: 'contratar', tema: 'hogar',
    terminos: [['mis cosas', 6], ['contenido', 5], ['muebles', 5], ['electrodomesticos', 5], ['robo', 3]],
    respuesta: (/** @type {any} */ ctx) => ({
      parrafos: ctx?.vivo
        ? [ctx.plan.cubreContenido
          ? `Sí: el ${dato(ctx.plan.corto)} asegura la estructura y el contenido, con tus cosas hasta ${dato(ctx.contenido)}.`
          : `El ${dato(ctx.plan.corto)} asegura solo la estructura. Para cubrir tus cosas, mira el Completo o el Premium.`]
        : ['Según zurich.cl:', null],
      lista: ctx?.vivo ? undefined : P.coberturas.lista.filter((/** @type {string} */ t) => /Estructura y Contenido|Incendio, Sismo y Robo|aparatos/.test(t)).map((/** @type {string} */ t) => esc(t)),
      fuente: ctx?.vivo ? FUENTE_COTIZACION : FUENTE,
      sugerencias: ['hogar_diferencias', 'hogar_precio'],
    }),
  },

  hogar_siniestro: {
    etiqueta: '¿Qué hago si tengo un daño?', modo: 'contratar', tema: 'hogar',
    terminos: [['si se quema', 6], ['si tengo un dano', 6], ['que pasa si', 4], ['como se activa', 5]],
    respuesta: () => respuestaAyuda('siniestro-hogar', { sugerencias: ['hogar_cubre', 'hogar_asistencias'] }),
  },

  hogar_elegir: {
    etiqueta: 'Elegir este plan', modo: 'contratar', tema: 'hogar', cta: true,
    terminos: [['lo quiero', 6], ['quiero contratar', 6], ['contratar', 4], ['me lo llevo', 6], ['quiero este', 6], ['elijo este', 6], ['me quedo con', 6]],
    respuesta: (/** @type {any} */ ctx) => !ctx?.vivo ? sinPrecio() : ({
      parrafos: [
        `Listo: quedó elegido el ${dato(ctx.plan.corto)} con deducible ${esc(ctx.deducible)} UF, a ${dato(`${clp(ctx.precio)} al mes`)}.`,
        `Cuando quieras, aprieta ${dato('Continuar')} en el cotizador y sigues con la confirmación.`,
      ],
      elegir: { plan: ctx.plan.id },
      fuente: FUENTE_COTIZACION,
      sugerencias: ['hogar_cubre', 'hogar_asistencias', 'ejecutivo'],
    }),
  },
};

/** @param {any} ctx */
export function aperturaHogar(ctx) {
  if (ctx?.vivo) {
    return {
      parrafos: [
        `Estás mirando el ${dato(ctx.plan.corto)} para ${esc(ctx.vivienda)}, a ${dato(`${clp(ctx.precio)} al mes`)} con deducible ${esc(ctx.deducible)} UF.`,
        'Pregúntame con tus palabras: qué cubre, qué asistencias trae o en qué se diferencia de los otros planes. Si me dices «¿y el premium?», lo elijo en la pantalla.',
      ],
      micro: 'Te doy información sobre este seguro, no asesoría: la decisión es tuya.',
      fuente: '',
      sugerencias: ['hogar_cubre', 'hogar_diferencias', 'hogar_asistencias', 'hogar_ahorrar'],
    };
  }
  return {
    parrafos: [
      `Te cuento del ${dato(P.nombre)}: ${esc(P.bajada.charAt(0).toLowerCase() + P.bajada.slice(1))}`,
      `Con tu ${dato('RUT')} y la ${dato('comuna')} de tu vivienda te dejo los datos cargados. O pregúntame lo que quieras.`,
    ],
    micro: 'Te doy información sobre este seguro, no asesoría: la decisión es tuya.',
    fuente: '',
    sugerencias: ['hogar_cotizar', 'hogar_cubre', 'hogar_planes', 'hogar_requisitos'],
  };
}

/** @param {any} ctx */
export const cambioHogar = (ctx) => ({
  parrafos: [`Ahora estamos viendo el ${dato(ctx.plan.corto)} con deducible ${esc(ctx.deducible)} UF: ${dato(`${clp(ctx.precio)} al mes`)}. Pregúntame lo que quieras de este.`],
  fuente: '',
});

/** @param {string} texto */
export function planHogar(texto) {
  if (/(^|\s)premium(\s|$)/.test(texto)) return 'premium';
  if (/(^|\s)(completo|el completo|estructura y contenido)(\s|$)/.test(texto)) return 'completo';
  if (/(^|\s)(solo estructura|el de estructura|estructura sola)(\s|$)/.test(texto)) return 'estructura';
  return undefined;
}

