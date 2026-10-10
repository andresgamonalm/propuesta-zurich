// @ts-check
/* =====================================================================
   El cotizador dentro del marco del mini sitio
   ---------------------------------------------------------------------
   Es el contrato que el sitio le propone a TI de Zurich, cumplido por
   este cotizador de demostración. Todo va por postMessage, con la marca
   `fuente: 'zurich'`:

     { tipo: 'paso', paso: '<carpeta del paso>' }   al abrir cada pantalla
     { tipo: 'fin' }                                 con la póliza emitida
     { tipo: 'alto', alto: <px> }                    cada vez que cambia el alto
     { tipo: 'foco', y: <px>, alto: <px> }           algo que la persona tiene
                                                     que ver: un modal, un error
     { tipo: 'contexto', ... }                       en la pantalla de planes: el
                                                     plan, el deducible y los
                                                     precios que está mirando,
                                                     para que MatIAs hable de eso
   Y uno de vuelta, del sitio al cotizador (marca `fuente: 'zurich-sitio'`):
     { tipo: 'elegir', plan?, deducible? }           MatIAs elige por la persona
                                                     lo que ella le pidió («¿y el
                                                     premium?»). Se hace con los
                                                     mismos botones de la pantalla.

   Con `alto`, el sitio ajusta el marco al contenido y no hay una segunda
   barra de desplazamiento. Con `foco`, el sitio desplaza su página hasta
   lo que se abrió: dentro de un marco tan alto como su contenido, un
   modal centrado quedaría centrado en el marco, no en la pantalla.

   Fuera del marco (abriendo la dirección directo) no se envía nada.
   ===================================================================== */

const enMarco = document.documentElement.classList.contains('en-marco');

/* El origen del sitio que lo contiene. Si es el mismo, se lee directo; si
   no, sale de la página que lo abrió. Sin origen conocido no se envía:
   un postMessage a '*' le contaría los pasos a cualquiera. */
const ORIGEN_SITIO = (() => {
  if (!enMarco) return '';
  try { return window.parent.location.origin; } catch { /* otro origen */ }
  try { return document.referrer ? new URL(document.referrer).origin : ''; } catch { return ''; }
})();

/** @param {Record<string, unknown>} datos */
function enviar(datos) {
  if (!ORIGEN_SITIO) return;
  window.parent.postMessage({ fuente: 'zurich', ...datos }, ORIGEN_SITIO);
}

/** La carpeta del paso es el nombre que el sitio conoce: /herramientas/<producto>/<paso>/ */
export const pasoActual = () => location.pathname.split('/').filter(Boolean)[2] || '';

/** Avisa en qué paso va y, si es el último, que terminó. */
export function avisarPaso(fin = false) {
  enviar({ tipo: 'paso', paso: pasoActual() });
  if (fin) enviar({ tipo: 'fin' });
}

/** El alto del contenido, cada vez que cambia. */
export function vigilarAlto() {
  if (!ORIGEN_SITIO) return;
  let ultimo = 0;
  const medir = () => {
    const alto = Math.ceil(document.documentElement.getBoundingClientRect().height);
    if (Math.abs(alto - ultimo) < 2) return;
    ultimo = alto;
    enviar({ tipo: 'alto', alto });
  };
  new ResizeObserver(medir).observe(document.documentElement);
  addEventListener('load', medir);
  medir();
}

/** Pide al sitio que muestre este elemento. @param {Element | null | undefined} el */
export function avisarFoco(el) {
  if (!ORIGEN_SITIO || !el) return;
  const r = el.getBoundingClientRect();
  enviar({ tipo: 'foco', y: Math.round(r.top), alto: Math.round(r.height) });
}

/** El plan, el deducible y los precios que la persona está mirando. @param {Record<string, unknown>} datos */
export function avisarContexto(datos) {
  enviar({ tipo: 'contexto', ...datos });
}

/* Del sitio al cotizador: MatIAs elige con los mismos botones de la
   pantalla, así la medición y el repintado son los de siempre. Solo se
   escucha al sitio que contiene el marco. */
if (ORIGEN_SITIO) {
  addEventListener('message', (e) => {
    const d = e.data;
    if (e.origin !== ORIGEN_SITIO || !d || d.fuente !== 'zurich-sitio' || d.tipo !== 'elegir') return;
    if (d.deducible !== undefined && d.deducible !== null) {
      /** @type {HTMLElement|null} */ (document.querySelector(`[data-deducible="${Number(d.deducible)}"]`))?.click();
    }
    if (typeof d.plan === 'string' && /^[a-z]+$/.test(d.plan)) {
      /** @type {HTMLElement|null} */ (document.querySelector(`[data-elegir="${d.plan}"]`))?.click();
    }
  });
}

export { enMarco };
