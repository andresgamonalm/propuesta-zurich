// @ts-check
/**
 * /personas/ y /personas/<ramo>/ · Catálogo de seguros.
 *
 * Una sola plantilla para el catálogo completo y para cada ramo: la ruta
 * comunica segmento y ramo (brief §Estructura de rutas) y la miga «Auto»
 * lleva a una página real, no a un ancla.
 */
import { RAMOS, PRODUCTOS, ramo, productosDeRamo } from '../catalogo.js';
import { esVisible } from '../estado.js';
import { migas, formas, noDisponible } from '../marco.js';
import { esc, icono, foto } from '../ui.js';
import { tarjetaProducto, filtrar, encabezado } from '../piezas.js';

/** @param {{ main: HTMLElement, id: string, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, id, sesion }) {
  const admin = sesion.perfil === 'administrador';
  const r = id ? ramo(id) : undefined;
  if (id && !r) { main.innerHTML = noDisponible(); return; }

  const lista = filtrar(r ? productosDeRamo(r.id) : PRODUCTOS, admin);
  const digitales = lista.filter((p) => p.modalidad === 'digital');
  const asistidos = lista.filter((p) => p.modalidad === 'asesoria');
  const ramosVisibles = RAMOS.filter((x) => productosDeRamo(x.id).some((p) => admin || esVisible(p.id)));

  main.innerHTML = `
  ${migas(r ? [{ texto: 'Seguros', href: '/personas/' }, { texto: r.nombre }] : [{ texto: 'Seguros' }])}
  <section class="cabeza-pagina con-formas" aria-labelledby="titulo-seguros">
    <div class="contenedor cabeza-pagina__rejilla">
      <div class="cabeza-pagina__texto">
        <span class="antetitulo">${r ? 'Seguros Zurich' : 'Clientes Banco BICE'}</span>
        <h1 id="titulo-seguros">${r ? `Seguros de ${esc(r.nombre.toLowerCase())}` : 'Seguros Zurich para clientes de Banco BICE'}</h1>
        <p>${r ? esc(r.bajada) : 'Elige el ramo o revisa todos los seguros disponibles: los que puedes contratar en línea y los que cuentan con apoyo de un asesor.'}</p>
      </div>
      <div class="cabeza-pagina__foto">${foto(r ? r.foto : 'auto-familia-viaje', '', { grande: true, prioridad: true })}</div>
    </div>
    ${formas()}
  </section>

  <section class="seccion seccion--compacta banda-blanco" aria-label="Ramos">
    <div class="contenedor"><nav class="ramos" aria-label="Ramos">
      ${ramosVisibles.map((x) => `<a class="ramo" href="${x.ruta}"${r?.id === x.id ? ' aria-current="page"' : ''} data-medir="ramo_${x.id}">${icono(x.icono)}<strong>${esc(x.nombre)}</strong><span>${productosDeRamo(x.id).filter((p) => admin || esVisible(p.id)).length} seguros</span></a>`).join('')}
    </nav></div>
  </section>

  ${digitales.length ? `<section class="seccion" aria-labelledby="t-digitales"><div class="contenedor">
    ${encabezado('Contratación en línea', 'Seguros que puedes contratar en línea', 'Revisa la información de cada producto e inicia la contratación desde este espacio.', 't-digitales')}
    <div class="productos">${digitales.map((p) => tarjetaProducto(p, { admin })).join('')}</div>
  </div></section>` : ''}

  ${asistidos.length ? `<section class="seccion ${digitales.length ? 'banda-blanco' : ''}" aria-labelledby="t-asesoria"><div class="contenedor">
    ${encabezado('Con asesoría', 'Seguros con apoyo de un asesor', 'Conoce estas alternativas y solicita orientación para continuar con la contratación.', 't-asesoria')}
    <div class="productos">${asistidos.map((p) => tarjetaProducto(p, { admin })).join('')}</div>
  </div></section>` : ''}

  ${!lista.length ? `<section class="seccion"><div class="contenedor"><div class="vacio">${icono('info')}<h2>No hay seguros disponibles en este ramo por ahora</h2><p>Revisa los demás ramos o vuelve más tarde.</p><a class="btn btn--primario" href="/personas/">Ver todos los seguros</a></div></div></section>` : ''}`;
}
