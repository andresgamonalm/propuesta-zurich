// @ts-check
/** /mundo-zurich/ · Programa de fidelización (contenido oficial de zurich.cl/mundo-zurich). */
import { MUNDO_ZURICH, FECHA_FUENTES } from '../catalogo.js';
import { esVisible } from '../estado.js';
import { migas, formas, noDisponible } from '../marco.js';
import { esc, foto, porValidar } from '../ui.js';
import { mundos, pendientesAdmin } from '../piezas.js';

/** @param {{ main: HTMLElement, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, sesion }) {
  const admin = sesion.perfil === 'administrador';
  if (!admin && !esVisible(MUNDO_ZURICH.id)) { main.innerHTML = noDisponible(); return; }
  main.innerHTML = `
  ${migas([{ texto: 'Mundo Zurich' }])}
  <section class="cabeza-pagina con-formas" aria-labelledby="titulo-mundo">
    <div class="contenedor cabeza-pagina__rejilla">
      <div class="cabeza-pagina__texto">
        <span class="antetitulo">Programa de fidelización</span>
        <h1 id="titulo-mundo">Mundo Zurich</h1>
        <p>${esc(MUNDO_ZURICH.bajada)}</p>
        <p class="texto-suave">${esc(MUNDO_ZURICH.acceso)} ${porValidar('Acceso con el Portal de Clientes · etapa futura')}</p>
        ${pendientesAdmin(MUNDO_ZURICH.porValidar, admin)}
      </div>
      <div class="cabeza-pagina__foto">${foto(MUNDO_ZURICH.foto, 'Una familia de tres generaciones pasea junta bajo los árboles.', { grande: true, prioridad: true })}</div>
    </div>
    ${formas()}
  </section>
  <section class="seccion banda-oscura" aria-labelledby="titulo-siete">
    <div class="contenedor">
      <div class="encabezado-seccion"><span class="antetitulo">Siete mundos</span><h2 id="titulo-siete">Beneficios para la vida misma</h2><p>Concursos, descuentos, servicios y asistencias sin costo si eres cliente Zurich.</p></div>
      ${mundos(false)}
      <p class="mt-6"><a class="btn btn--invertido" href="/personas/" data-medir="ver_seguros">Ver seguros disponibles</a></p>
    </div>
  </section>
  <section class="contenedor notas-legales" aria-label="Condiciones del programa">
    <p>${esc(MUNDO_ZURICH.legal)}</p>
    <p>Información tomada de zurich.cl el ${FECHA_FUENTES}.</p>
  </section>`;
}
