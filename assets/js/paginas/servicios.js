// @ts-check
/** /servicios/ · Servicios en línea (brief §Servicios en línea). */
import { SERVICIOS, TELEFONO_ZURICH } from '../catalogo.js';
import { esVisible } from '../estado.js';
import { migas, formas } from '../marco.js';
import { esc, icono, foto } from '../ui.js';
import { marcaOculto } from '../piezas.js';
import { normalizar } from '../medicion.js';

/** @param {{ main: HTMLElement, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, sesion }) {
  const admin = sesion.perfil === 'administrador';
  const lista = SERVICIOS.filter((s) => admin || esVisible(s.id));
  main.innerHTML = `
  ${migas([{ texto: 'Servicios en línea' }])}
  <section class="cabeza-pagina con-formas" aria-labelledby="titulo-servicios">
    <div class="contenedor cabeza-pagina__rejilla">
      <div class="cabeza-pagina__texto">
        <span class="antetitulo">Trámites</span>
        <h1 id="titulo-servicios">Servicios en línea</h1>
        <p>Accede directamente al trámite que necesitas. Cada opción abre el flujo oficial de Zurich dentro de este espacio.</p>
        <p>¿Prefieres hablar con alguien? Llama al <a href="${TELEFONO_ZURICH.enlace}">${TELEFONO_ZURICH.visible}</a>.</p>
      </div>
      <div class="cabeza-pagina__foto">${foto('denuncia-foto-choque', 'Una persona fotografía con su celular los daños de un choque.', { grande: true, prioridad: true })}</div>
    </div>
    ${formas()}
  </section>
  <section class="seccion banda-blanco" aria-label="Trámites disponibles">
    <div class="contenedor">
      ${lista.length ? `<div class="productos">${lista.map((s) => `<article class="tarjeta">
        <div class="tarjeta__cuerpo">
          <div class="chips"><span class="rapida__icono">${icono(s.icono)}</span>${marcaOculto(s.id, admin)}</div>
          <h2 class="h-lg"><a href="${s.ruta}" data-medir="tarjeta" data-ambito="${normalizar(s.id)}">${esc(s.nombre)}</a></h2>
          <p>${esc(s.bajada)}</p>
        </div>
        <div class="tarjeta__pie"><a class="btn btn--linea btn--bloque" href="${s.ruta}" data-medir="iniciar" data-ambito="${normalizar(s.id)}">${esc(s.cta)}</a></div>
      </article>`).join('')}</div>` : `<div class="vacio">${icono('info')}<h2>No hay trámites habilitados por ahora</h2><p>Llama a Zurich al ${TELEFONO_ZURICH.visible} para resolver tu trámite.</p></div>`}
    </div>
  </section>`;
}
