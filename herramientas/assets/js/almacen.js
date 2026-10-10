/* =====================================================================
   El almacén de la cotización, con caducidad
   ---------------------------------------------------------------------
   Hasta ahora la cotización vivía en sessionStorage: cerrabas la pestaña
   y desaparecía. Eso es privado, pero también significa que nadie puede
   retomar lo que dejó a medias, y un carrito abandonado que no se puede
   recuperar no es un carrito, es una estadística.

   Ahora vive en localStorage con fecha de vencimiento. Tres reglas:

   1. CADUCA SOLA. Siete días desde la última vez que se tocó. Pasado ese
      plazo, leerla devuelve vacío Y la borra del equipo. No queda un
      resto esperando a que alguien lo encuentre.

   2. SE PUEDE BORRAR A MANO, y el botón está a la vista, no escondido en
      un menú. Es el equipo de la persona.

   3. SI EL NAVEGADOR NO DEJA, no se cae. En una ventana privada, con el
      almacenamiento bloqueado o lleno, escribir lanza excepción. Aquí se
      atrapa y el recorrido sigue funcionando como antes: en memoria,
      hasta cerrar la pestaña.

   POR QUÉ NO sessionStorage CON UNA COPIA
   Se evaluó dejar sessionStorage como está y agregar una copia en
   localStorage. Serían dos verdades del mismo dato, y la pregunta «cuál
   manda» no tiene buena respuesta el día que difieren.
   ===================================================================== */

/** Días que sobrevive una cotización sin tocarse. */
export const DIAS_VIGENCIA = 7;
const MS_VIGENCIA = DIAS_VIGENCIA * 24 * 60 * 60 * 1000;

/** Lee lo guardado, o null si no hay, está vencido o ilegible.
    Si estaba vencido, además lo borra.
    @param {string} llave
    @returns {{datos: any, guardadoEn: number} | null} */
export function leerAlmacen(llave) {
  let crudo = null;
  try { crudo = localStorage.getItem(llave); } catch { return null; }
  if (!crudo) return null;

  let sobre;
  try { sobre = JSON.parse(crudo); } catch { borrarAlmacen(llave); return null; }

  /* Un sobre sin fecha viene de la versión anterior, que guardaba el
     estado pelado. Se descarta: no hay forma de saber de cuándo es, y
     tratarlo como recién guardado le regalaría siete días. */
  if (!sobre || typeof sobre.guardadoEn !== 'number' || !sobre.datos) {
    borrarAlmacen(llave); return null;
  }
  if (Date.now() - sobre.guardadoEn > MS_VIGENCIA) { borrarAlmacen(llave); return null; }
  return sobre;
}

/** Guarda y renueva el plazo. Devuelve false si el navegador no dejó.
    @param {string} llave @param {any} datos */
export function guardarAlmacen(llave, datos) {
  try {
    localStorage.setItem(llave, JSON.stringify({ guardadoEn: Date.now(), datos }));
    return true;
  } catch { return false; }
}

/* LA MARCA DE PASO VA EN SU PROPIA LLAVE
   No dentro del estado, y es por una razón concreta: los cotizadores
   reescriben el estado entero cada vez que guardan, a partir de un
   objeto en memoria que no sabe nada de esta marca. Metida ahí, se
   perdía en el guardado siguiente —y eso era justo lo que pasaba en la
   pantalla de vivienda—. En su propia llave, nadie la pisa. */
const llavePaso = llave => llave + ':paso';

/** Anota en qué pantalla del recorrido va la persona, para poder
    devolverla ahí si se cae.

    No renueva el plazo a propósito: es una marca de posición, no
    actividad nueva. Si renovara, tener la pestaña abierta estiraría los
    siete días para siempre y lo guardado no vencería nunca.
    @param {string} llave @param {string} url  la ruta completa del paso
    @returns {boolean} */
export function anotarPaso(llave, url) {
  try { localStorage.setItem(llavePaso(llave), url); return true; }
  catch { return false; }
}

/** El último paso anotado, o null. El plazo lo controla el estado: sin
    estado no hay aviso, así que una marca huérfana nunca se lee.
    @param {string} llave @returns {string | null} */
export function leerPaso(llave) {
  try { return localStorage.getItem(llavePaso(llave)); } catch { return null; }
}

/** @param {string} llave */
export function borrarAlmacen(llave) {
  try {
    localStorage.removeItem(llave);
    localStorage.removeItem(llavePaso(llave));   // la marca se va con el estado
  } catch { /* nada que hacer */ }
}

/** Cuántos días le quedan a lo guardado, para poder decirlo en pantalla.
    @param {number} guardadoEn @returns {number} */
export const diasQueQuedan = guardadoEn =>
  Math.max(0, Math.ceil((guardadoEn + MS_VIGENCIA - Date.now()) / (24 * 60 * 60 * 1000)));
