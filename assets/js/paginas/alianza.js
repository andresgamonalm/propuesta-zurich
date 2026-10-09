// @ts-check
/** /alianza/ · La alianza y contacto (brief §Sección La alianza y §Pie de página). */
import { ALIANZA, ENTIDADES, TELEFONO_ZURICH, PRODUCTOS } from '../catalogo.js';
import { migas, formas } from '../marco.js';
import { esc, icono, foto, porValidar } from '../ui.js';
import { promoActiva, pendientesAdmin } from '../piezas.js';

/** @param {{ main: HTMLElement, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, sesion }) {
  const admin = sesion.perfil === 'administrador';
  const bases = PRODUCTOS.filter((p) => promoActiva(p) && /** @type {any} */ (p).promocion.bases).map((p) => /** @type {any} */ (p).promocion.bases);
  const concursos = [...new Set(PRODUCTOS.map((p) => /** @type {any} */ (p).concurso?.bases).filter(Boolean))];

  main.innerHTML = `
  ${migas([{ texto: 'La alianza' }])}
  <section class="cabeza-pagina con-formas" aria-labelledby="titulo-alianza">
    <div class="contenedor cabeza-pagina__rejilla">
      <div class="cabeza-pagina__texto">
        <span class="antetitulo">La alianza</span>
        <h1 id="titulo-alianza">${esc(ALIANZA.titulo)}</h1>
        <p>${esc(ALIANZA.texto)}</p>
        ${pendientesAdmin(ALIANZA.porValidar, admin)}
      </div>
      <div class="cabeza-pagina__foto">${foto('alianza-amigos', 'Un grupo de amigos conversa alrededor de una mesa con sus computadores.', { grande: true, prioridad: true })}</div>
    </div>
    ${formas()}
  </section>

  <section class="seccion banda-blanco" aria-labelledby="titulo-roles">
    <div class="contenedor">
      <div class="encabezado-seccion"><span class="antetitulo">Quién hace qué</span><h2 id="titulo-roles">Dos compañías, funciones distintas</h2><p>Zurich y Banco BICE colaboran, pero no son una sola entidad.</p></div>
      <div class="dos-columnas">${ALIANZA.roles.map((r) => `<div class="beneficio"><span class="beneficio__icono">${icono(r.quien === 'Zurich' ? 'escudo' : 'personas')}</span><h3>${esc(r.quien)}</h3><p>${esc(r.rol)}</p></div>`).join('')}</div>
      <p class="mt-4 texto-suave">Texto legal sobre la función y responsabilidad de cada compañía. ${porValidar('Pendiente de aprobación legal')}</p>
    </div>
  </section>

  <section class="seccion" id="contacto" aria-labelledby="titulo-contacto">
    <div class="contenedor dos-columnas">
      <div class="caja caja--borde">
        <h2 id="titulo-contacto" class="h-lg">Canales de atención Zurich</h2>
        <p class="pie__telefono"><a href="${TELEFONO_ZURICH.enlace}" data-medir="telefono">${TELEFONO_ZURICH.visible}</a></p>
        <p>Cotizaciones, pagos, siniestros y asistencias de tus seguros Zurich.</p>
      </div>
      <div class="caja caja--borde">
        <h2 class="h-lg">Canales de Banco BICE</h2>
        <p>Los canales de Banco BICE para esta experiencia se definen con el banco. ${porValidar('Por definir')}</p>
      </div>
    </div>
  </section>

  <section class="seccion banda-blanco" id="legal" aria-labelledby="titulo-legal">
    <div class="contenedor">
      <div class="encabezado-seccion"><span class="antetitulo">Información legal</span><h2 id="titulo-legal">Entidades, bases y avisos</h2></div>
      <div class="preguntas">
        <details class="pregunta" open><summary>Compañías que ofrecen los seguros${icono('chevron')}</summary><div class="pregunta__cuerpo">
          <p>${esc(ENTIDADES.generales)}: seguros generales, como Auto Digital.</p><p>${esc(ENTIDADES.vida)}: seguros de vida y salud, como Protección Urgencias y Oncológico Familiar Directo.</p>
          <p>La compañía de cada producto se indica en su página.</p></div></details>
        <details class="pregunta"><summary>Bases y condiciones de promociones vigentes${icono('chevron')}</summary><div class="pregunta__cuerpo">
          ${[...bases, ...concursos].map((t) => `<p>${esc(t)}</p>`).join('') || '<p>No hay promociones vigentes en este momento.</p>'}</div></details>
        <details class="pregunta"><summary>Privacidad, tratamiento de datos, términos de uso y cookies${icono('chevron')}</summary><div class="pregunta__cuerpo">
          <p>Estos avisos se definen con las áreas legales, de seguridad y de atención de Zurich y Banco BICE antes de publicar. ${porValidar('En validación')}</p></div></details>
      </div>
    </div>
  </section>`;
}
