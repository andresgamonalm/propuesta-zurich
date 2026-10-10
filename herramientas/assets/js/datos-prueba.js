/* =====================================================================
   Datos de prueba, al lado del campo que los pide
   ---------------------------------------------------------------------
   Antes esto era una tabla plegable en la franja de arriba. Funcionaba,
   pero estaba lejos del campo: había que abrirla, leerla, recordar un
   RUT y bajar a escribirlo. Ahora los valores van debajo del propio
   campo, que es donde hacen falta.

   Se pueden usar de dos maneras, y las dos importan:
   · Un clic los escribe en el campo. Es lo rápido.
   · Un doble clic los selecciona enteros para copiar a mano, porque
     `user-select: all` hace que la selección tome el valor completo y no
     media palabra. Es lo que sirve para pegarlos en otra parte.

   Hogar no lleva patentes: no hay vehículo. La vivienda tampoco va,
   porque se deriva del propio RUT.

   Solo es del piloto. No va a un sitio de verdad.
   ===================================================================== */

import { CLIENTES } from './datos.js';

/** Dos basta. Con seis, elegir uno ya es una decisión. */
const CUANTOS = 2;

const esc = s => String(s ?? '').replace(/[&<>"]/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Pinta los ejemplos debajo de un campo.
    @param {string} selector Dónde se pinta.
    @param {{patentes?: boolean, campo?: string}} [opciones]
      patentes  si además de los RUT van las patentes (auto sí, hogar no)
      campo     el id del input que llena el clic */
export function montarDatosPrueba(selector = '#rut-ejemplos', opciones = {}) {
  const caja = document.querySelector(selector);
  if (!caja) return;
  const { patentes = true, campo = 'rut' } = opciones;

  const muestra = CLIENTES.slice(0, CUANTOS);
  const ficha = (valor, que) =>
    `<button type="button" class="prueba__dato" data-valor="${esc(valor)}"
             title="Clic para escribirlo · doble clic para copiarlo">${esc(valor)}</button>`;

  caja.innerHTML = `
    <p class="prueba">
      <span class="prueba__rotulo">Para probar:</span>
      ${muestra.map(c => ficha(c.rut, 'rut')).join('')}
      ${patentes ? '<span class="prueba__o">o con patente</span>' +
                   muestra.map(c => ficha(c.patente, 'patente')).join('') : ''}
    </p>`;

  caja.addEventListener('click', e => {
    const b = e.target instanceof Element ? e.target.closest('.prueba__dato') : null;
    if (!(b instanceof HTMLElement)) return;
    const destino = /** @type {HTMLInputElement|null} */ (document.getElementById(campo));
    if (!destino) return;
    destino.value = b.dataset.valor || '';
    /* El evento a mano: el formulario escucha `input` para validar y
       autocompletar, y asignar .value no lo dispara solo. */
    destino.dispatchEvent(new Event('input', { bubbles: true }));
    destino.focus();
  });
}
