// @ts-check
/**
 * MatIAs · piezas comunes de las bibliotecas.
 *
 * Aquí no hay contenido de seguros: hay cómo se convierte una pregunta del
 * Centro de Ayuda (catalogo.js › AYUDA) en una respuesta, y los botones que
 * llevan a un trámite o a hablar con Zurich. Lo que se dice sale del
 * catálogo; lo único escrito aquí son los conectores de la conversación.
 */
import { AYUDA, CANALES, EMERGENCIAS, FECHA_AYUDA, FECHA_FUENTES, servicio } from '../catalogo.js';
import { esc } from '../ui.js';

export const FUENTE_AYUDA = `Centro de Ayuda de zurich.cl · leído el ${FECHA_AYUDA}`;
export const FUENTE_ZURICH = `zurich.cl · leído el ${FECHA_AYUDA}`;
export const FUENTE_EMERGENCIAS = `Números de emergencia: gob.cl · leído el ${FECHA_AYUDA}`;
export const FUENTE_PRODUCTO = (/** @type {string} */ nombre) => `${nombre} en zurich.cl · leído el ${FECHA_FUENTES}`;
export const FUENTE_COTIZACION = 'Tu cotización en pantalla · demostración, precios simulados';

/** $41.842 @param {number} n */
export const clp = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-CL');

/** Un dato destacado dentro de una respuesta. @param {unknown} t */
export const dato = (t) => `<span class="dato">${esc(t)}</span>`;

/** @param {string} id */
export const ayuda = (id) => AYUDA.find((a) => a.id === id);

export const LLAMAR = { texto: `Llamar al ${CANALES.telefono}`, href: CANALES.telefonoEnlace, medir: 'llamar' };
export const WHATSAPP = { texto: 'Escribir por WhatsApp', href: `https://wa.me/${CANALES.whatsapp.replace(/\D/g, '')}`, medir: 'whatsapp', externo: true };

/** Los números de emergencia, en una línea, antes de la respuesta de Zurich. */
export const lineaEmergencia = () => `<strong>¿Hay heridos o peligro?</strong> Llama de inmediato: ${EMERGENCIAS.lista.map((e) => `${esc(e.nombre)} ${dato(e.numero)}`).join(' · ')}.`;

/** Un botón por número de emergencia. */
export const accionesEmergencia = () => EMERGENCIAS.lista.map((e) => ({ texto: `Llamar al ${e.numero}`, href: `tel:${e.numero}`, medir: `emergencia_${e.numero}`, primario: true }));

/** El botón al trámite de este sitio, si la respuesta tiene uno. @param {string|undefined} id */
export function accionTramite(id) {
  const s = id ? /** @type {any} */ (servicio(id)) : null;
  return s ? { texto: s.cta, href: s.ruta, medir: `tramite_${id.replace(/-/g, '_')}`, primario: true } : null;
}

/**
 * Una pregunta del Centro de Ayuda como respuesta de MatIAs: los párrafos,
 * la lista y el cierre tal cual, el botón al trámite y la fuente.
 * @param {string} id @param {{ sugerencias?: string[], intro?: string }} [op]
 */
export function respuestaAyuda(id, { sugerencias, intro } = {}) {
  const a = ayuda(id);
  if (!a) return { parrafos: [] };
  /** @type {any[]} */
  const acciones = [accionTramite(a.tramite)].filter(Boolean);
  /* El formulario oficial que este sitio no integra: en otra pestaña. */
  if (a.denuncia) acciones.push({ texto: 'Denunciar en zurich.cl', href: a.denuncia, medir: 'denuncia_zurich', externo: true, primario: !a.tramite });
  if (!a.tramite && ['siniestros', 'seguimiento', 'pagos'].includes(a.tema)) acciones.push(LLAMAR);
  return {
    parrafos: [...(a.emergencia ? [lineaEmergencia()] : []), ...(intro ? [intro] : []), ...a.r.map((t) => esc(t)), ...(a.lista ? [null] : [])],
    lista: a.lista?.map((t) => esc(t)),
    cierre: a.cierre?.map((t) => esc(t)),
    acciones,
    micro: a.emergencia ? FUENTE_EMERGENCIAS : undefined,
    fuente: a.fuente.includes('/centro-de-ayuda/') ? FUENTE_AYUDA : FUENTE_ZURICH,
    sugerencias,
  };
}

/** Canales de Atención Remota, como respuesta. */
export function respuestaCanales() {
  return {
    parrafos: ['Puedes hablar con Zurich por estos canales:', null],
    lista: [
      `Call Center ${dato(CANALES.telefono)}, ${esc(CANALES.horarioTelefono)}`,
      `WhatsApp ${dato(CANALES.whatsapp)}, ${esc(CANALES.horarioWhatsapp)}.`,
      'El formulario de contacto de zurich.cl.',
    ],
    acciones: [LLAMAR, WHATSAPP],
    fuente: `Canales de Atención Remota de zurich.cl · leído el ${FECHA_AYUDA}`,
  };
}
