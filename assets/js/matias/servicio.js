// @ts-check
/**
 * MatIAs · «Ayuda con mi seguro».
 *
 * El espacio de servicio que pidió Andrés (10-10-2026): la gente pregunta
 * siempre cómo pedir un reembolso, cómo denunciar un siniestro, cómo pagar.
 * Cada respuesta es una pregunta del Centro de Ayuda de zurich.cl, textual
 * (catalogo.js › AYUDA), con el botón al trámite dentro de este sitio
 * cuando lo hay. Aquí solo viven los disparadores: qué palabras llevan a
 * cada respuesta.
 */
import { AYUDA } from '../catalogo.js';
import { esc } from '../ui.js';
import { respuestaAyuda, respuestaCanales, accionesEmergencia, dato, FUENTE_AYUDA, FUENTE_EMERGENCIAS, LLAMAR } from './comun.js';
import { EMERGENCIAS } from '../catalogo.js';

/** id de nodo de una pregunta del Centro de Ayuda. @param {string} id */
export const nodoDe = (id) => `srv_${id.replace(/-/g, '_')}`;

/* Los temas. Reembolsos y Siniestros además responden a la palabra sola
   («reembolso», «denunciar un siniestro»): muestran sus preguntas. Si la
   frase ya dice de qué (médico, auto, casa…), pierden puntos y responde
   la pregunta precisa. */
const TEMAS = [
  { id: 'srv_reembolsos', tema: 'reembolsos', etiqueta: 'Reembolsos', bajada: 'Médicos, dentales y de asistencias',
    terminos: [['reembolso', 4], ['reembolsar', 4]],
    penaliza: [['medico', 4], ['dental', 4], ['dentista', 4], ['estado', 4], ['asistencia', 4], ['grua', 4], ['rechazado', 4], ['rechazaron', 4], ['liquidacion', 4]] },
  { id: 'srv_siniestros', tema: 'siniestros', etiqueta: 'Siniestros', bajada: 'Qué hacer y cómo denunciar: auto, hogar, vida, SOAP, celular',
    terminos: [['siniestro', 4], ['denunciar', 4], ['denuncia', 4], ['denuncio', 4]],
    penaliza: [['auto', 4], ['choque', 4], ['chocaron', 4], ['casa', 4], ['hogar', 4], ['vida', 4], ['soap', 4], ['celular', 4], ['incendio', 4], ['robo', 3], ['robaron', 3], ['liquidador', 4],
      ['estado', 4], ['como va', 4], ['en que va', 4], ['requisitos', 4], ['documentos', 4], ['colectivo', 4], ['reemplazo', 4], ['reparacion', 4]] },
  { id: 'srv_seguimiento', tema: 'seguimiento', etiqueta: 'Después de denunciar', bajada: 'Estado, liquidador, reparación y auto de reemplazo',
    terminos: [['despues de denunciar', 8], ['ya denuncie', 7], ['ya hice la denuncia', 8]] },
  { id: 'srv_asistencias', tema: 'asistencias', etiqueta: 'Asistencias', bajada: 'Grúa, gasfitería, cerrajería…' },
  { id: 'srv_pagos', tema: 'pagos', etiqueta: 'Pagos', bajada: 'Cuotas, pago automático, cuota impaga' },
  { id: 'srv_poliza', tema: 'poliza', etiqueta: 'Mi póliza', bajada: 'Descargarla, Portal de Clientes, término' },
  { id: 'srv_contacto', tema: 'contacto', etiqueta: 'Hablar con Zurich', bajada: 'Teléfono y WhatsApp' },
];

/** Qué palabras llevan a cada pregunta. [término, peso] */
const TERMINOS = {
  'reembolso-medico': [['medico', 3], ['gastos medicos', 4], ['salud', 2], ['consulta medica', 4], ['bono', 2], ['ambulatorio', 4], ['hospitalario', 4], ['complementario', 3], ['app', 1]],
  'reembolso-dental': [['dental', 6], ['dentista', 6], ['reembolso dental', 7]],
  'reembolso-estado': [['estado de mi reembolso', 8], ['estado del reembolso', 8], ['como va mi reembolso', 8], ['revisar mi reembolso', 7], ['liquidacion', 3], ['rechazaron', 4], ['rechazado', 4]],
  'reembolso-asistencia': [['reembolso de asistencia', 8], ['reembolso de la grua', 8], ['asistencia vehicular', 5], ['asistencia de viaje', 5], ['formulario de reembolso', 7], ['pague la grua', 7]],
  'siniestro-auto': [['choque', 5], ['chocaron', 5], ['me choco', 5], ['accidente de auto', 6], ['accidente', 3], ['robaron el auto', 7], ['robo del auto', 7], ['me robaron', 4], ['denunciar', 2], ['siniestro de auto', 7], ['siniestro', 2], ['carabineros', 2], ['auto', 1]],
  'siniestro-auto-requisitos': [['requisitos para denunciar', 8], ['que necesito para denunciar', 8], ['necesito para denunciar', 7], ['documentos para denunciar', 8], ['que documentos', 5], ['padron', 5], ['parte policial', 6], ['constancia', 4], ['licencia de conducir', 6]],
  'siniestro-hogar': [['dano en mi hogar', 8], ['dano en mi casa', 8], ['incendio', 5], ['inundacion', 5], ['se inundo', 6], ['inundo', 6], ['inundada', 6], ['filtracion', 5], ['se quemo', 5], ['robo en mi casa', 7], ['entraron a robar', 7], ['siniestro de hogar', 7], ['hogar', 2], ['casa', 2], ['departamento', 2], ['bomberos', 3]],
  'siniestro-vida': [['seguro de vida', 6], ['fallecio', 6], ['fallecimiento', 6], ['murio', 6], ['cobrar un seguro de vida', 8], ['indemnizacion de vida', 7], ['proteccion familiar', 5], ['beneficiario', 3]],
  'siniestro-vida-colectivo': [['seguro colectivo', 8], ['colectivo', 6], ['seguro de la empresa', 7], ['contratado por la empresa', 8]],
  'siniestro-soap': [['soap', 4], ['siniestro soap', 7], ['denuncio soap', 7], ['denunciar el soap', 7]],
  'soap-indemnizacion': [['indemnizacion del soap', 8], ['cobrar el soap', 8], ['cobrar soap', 8]],
  'siniestro-celular': [['celular', 5], ['telefono robado', 7], ['me robaron el celular', 8], ['se me rompio el celular', 8], ['pantalla', 3]],
  'siniestro-estado': [['estado de mi siniestro', 9], ['estado del siniestro', 9], ['estado de mi denuncia', 9], ['estado de la denuncia', 9], ['como va mi siniestro', 9], ['en que va mi siniestro', 9], ['como va mi denuncia', 9], ['en que va mi denuncia', 9], ['seguimiento', 4]],
  'liquidador': [['liquidador', 7], ['cambiar de liquidador', 8]],
  'reparacion-demora': [['demora la reparacion', 9], ['se demora la reparacion', 9], ['reparacion de mi auto', 7], ['repuestos', 6], ['no me entregan el auto', 8], ['sigue en el taller', 8], ['taller', 2]],
  'vehiculo-reemplazo': [['auto de reemplazo', 9], ['vehiculo de reemplazo', 9], ['reemplazo', 5]],
  'asistencia': [['asistencia', 4], ['grua', 5], ['gasfiter', 5], ['gasfiteria', 5], ['cerrajero', 5], ['cerrajeria', 5], ['electricista', 5], ['pedir una asistencia', 8], ['numero de mi asistencia', 8]],
  'pago-opciones': [['pagar', 4], ['pago', 3], ['como pago', 6], ['pagar mi seguro', 7], ['pagar la cuota', 7], ['webpay', 5], ['servipag', 5], ['transferencia', 3]],
  'pago-atrasada': [['atrasada', 6], ['cuota atrasada', 8], ['atrasado', 5], ['me atrase', 7], ['vencida', 4]],
  'pago-impaga': [['impaga', 7], ['sigue impaga', 8], ['aparece impaga', 8], ['no aparece mi pago', 8], ['no se refleja', 6]],
  'pago-estado': [['esta pagada', 7], ['cuota pagada', 6], ['proximo vencimiento', 7], ['cuando vence', 6], ['vencimiento', 4]],
  'pago-automatico': [['pac', 7], ['pat', 7], ['pago automatico', 8], ['cargo automatico', 8], ['tarjeta de credito', 4]],
  'pago-no-puedo': [['no puedo pagar', 8], ['no tengo plata', 7], ['dificultades para pagar', 8]],
  'poliza-duplicado': [['duplicado', 7], ['descargar mi poliza', 8], ['copia de mi poliza', 8], ['mi poliza', 4], ['certificado', 3], ['coberturas contratadas', 5]],
  'portal-clave': [['portal de clientes', 7], ['portal', 4], ['clave', 5], ['contrasena', 5], ['acceso clientes', 7], ['olvide mi clave', 8]],
  'terminar-auto': [['terminar mi poliza', 8], ['anular', 6], ['dar de baja', 6], ['cancelar el seguro', 7], ['cancelar mi seguro', 7], ['renunciar', 4]],
};

/** @param {string} tema */
const idsDeTema = (tema) => AYUDA.filter((a) => a.tema === tema && TERMINOS[a.id]).map((a) => nodoDe(a.id));

/** Botones de temas o de preguntas: se eligen donde se leen. @param {{ id: string, etiqueta: string, bajada?: string }[]} items */
const botones = (items) => `<div class="matias-temas">${items.map((t) => `<button type="button" class="matias-tema" data-nodo="${t.id}" id="matias-tema-${t.id}">
  <span class="matias-tema__nombre">${esc(t.etiqueta)}</span>${t.bajada ? `<span class="matias-tema__bajada">${esc(t.bajada)}</span>` : ''}</button>`).join('')}</div>`;

/** @param {HTMLElement} burbuja @param {any} api */
const enlazar = (burbuja, api) => burbuja.querySelectorAll('[data-nodo]').forEach((b) => b.addEventListener('click', () => {
  const n = /** @type {HTMLElement} */ (b);
  api.burbuja('usuario', esc(n.querySelector('.matias-tema__nombre')?.textContent || n.textContent || ''));
  api.responder(n.dataset.nodo);
}));

/** @type {Record<string, any>} */
export const nodosServicio = {};

for (const a of AYUDA) {
  if (!TERMINOS[a.id]) continue;
  nodosServicio[nodoDe(a.id)] = {
    etiqueta: a.p, modo: 'ayuda', tema: 'servicio', terminos: TERMINOS[a.id],
    respuesta: () => respuestaAyuda(a.id, {
      sugerencias: [...(a.sugerir ?? []).map(nodoDe), ...idsDeTema(a.tema).filter((x) => x !== nodoDe(a.id))].slice(0, 2).concat('srv_contacto'),
    }),
  };
}

/* Heridos o peligro: primero los números de emergencia, después Zurich.
   Pesos altos para ganarle a la pregunta del siniestro («me chocaron y hay
   heridos»); se descuenta cuando la frase pregunta por una cobertura
   («¿cubre si atropello a alguien?»), que no es una emergencia. Los
   números no son de Zurich: gob.cl (catalogo.js › EMERGENCIAS). */
nodosServicio.srv_emergencia = {
  etiqueta: 'Hay heridos o peligro', modo: 'ayuda', tema: 'servicio',
  terminos: [['herido', 9], ['lesionado', 9], ['lesiones', 9], ['ambulancia', 9], ['atropellado', 9], ['atropellaron', 9], ['atropello', 9],
    ['sangrando', 9], ['inconsciente', 9], ['no respira', 9], ['hay fuego', 9], ['se esta quemando', 9], ['incendiando', 9], ['accidente grave', 9], ['emergencia', 3]],
  penaliza: [['cubre', 9], ['cobertura', 9], ['si atropello', 9], ['que pasa si', 6], ['seguro de', 5]],
  respuesta: () => ({
    parrafos: ['Si hay personas heridas o en peligro, lo primero es pedir ayuda:', null],
    lista: EMERGENCIAS.lista.map((e) => `${esc(e.nombre)}: ${dato(e.numero)}`),
    cierre: ['Cuando todos estén a salvo, te ayudo a dar aviso a Zurich.'],
    acciones: accionesEmergencia(),
    fuente: FUENTE_EMERGENCIAS,
    sugerencias: ['srv_siniestro_auto', 'srv_siniestro_hogar', 'srv_contacto'],
  }),
};

for (const t of TEMAS) {
  if (t.tema === 'contacto') continue;
  const preguntas = idsDeTema(t.tema);
  nodosServicio[t.id] = {
    etiqueta: t.etiqueta, modo: 'ayuda', tema: 'servicio', terminos: t.terminos, penaliza: t.penaliza,
    respuesta: () => ({
      parrafos: [`${esc(t.etiqueta)}: esto es lo que más se pregunta. Elige una:`],
      formulario: botones(preguntas.map((id) => ({ id, etiqueta: nodosServicio[id].etiqueta }))),
      alMontar: enlazar,
      fuente: FUENTE_AYUDA,
      sugerencias: [],
    }),
  };
}

nodosServicio.srv_contacto = {
  etiqueta: 'Hablar con Zurich', modo: 'ayuda', tema: 'servicio',
  terminos: [['hablar con zurich', 8], ['contacto', 5], ['telefono', 4], ['whatsapp', 6], ['llamar', 4], ['call center', 7], ['horario', 4]],
  respuesta: () => ({ ...respuestaCanales(), sugerencias: ['srv_siniestros', 'srv_pagos'] }),
};

/** Apertura del espacio de ayuda: los temas, como botones. */
export const aperturaAyuda = () => ({
  parrafos: ['Te ayudo con tu seguro Zurich. Elige un tema o escríbeme tu pregunta con tus palabras.'],
  formulario: botones(TEMAS),
  alMontar: enlazar,
  micro: 'Te respondo con el Centro de Ayuda de zurich.cl. Para lo que dependa de tu póliza, te dejo con Zurich.',
  fuente: '',
  sugerencias: [],
});

export const menuAyuda = () => ['srv_reembolsos', 'srv_siniestros', 'srv_seguimiento', 'srv_pagos', 'srv_asistencias', 'srv_poliza', 'srv_contacto'];

export const sinCoincidenciaAyuda = () => ({
  parrafos: [
    'Esa no la tengo entre las respuestas del Centro de Ayuda, y prefiero no inventarte nada.',
    'Te puedo ayudar con reembolsos, siniestros, asistencias, pagos y tu póliza. Si es algo de tu caso puntual, habla con Zurich.',
  ],
  acciones: [LLAMAR],
  sugerencias: ['srv_reembolsos', 'srv_siniestros', 'srv_pagos', 'srv_contacto'],
});
