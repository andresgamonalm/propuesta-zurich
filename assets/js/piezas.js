// @ts-check
/**
 * Piezas de contenido que se repiten entre páginas. Se escriben una vez para
 * que una tarjeta de producto se vea igual en la portada, en el catálogo y
 * en la página de su ramo.
 */
import { SERVICIOS, MUNDO_ZURICH, MUNDOS, asesoriaRuta } from './catalogo.js';
import { ajuste, esVisible } from './estado.js';
import { esc, icono, foto, promoVigente, porValidar } from './ui.js';
import { normalizar } from './medicion.js';

/** @typedef {import('./catalogo.js').PRODUCTOS[number]} Producto */

/** ¿La promoción del producto se muestra hoy? Vigente y no apagada por el administrador. */
export function promoActiva(/** @type {any} */ p) {
  return Boolean(p.promocion && promoVigente(p.promocion) && ajuste(`promo:${p.promocion.id}`).visible);
}

/** El dato que decide, según si la promoción sigue en pie. */
export function ganchoDe(/** @type {any} */ p) {
  if (p.promocion && !promoActiva(p) && p.ganchoBase) return p.ganchoBase;
  return p.gancho;
}

/** Destino del botón de acción de un producto. */
export function accionDe(/** @type {any} */ p) {
  if (p.modalidad === 'asesoria') return { href: asesoriaRuta(p.id), texto: p.cta, medir: 'solicitar_asesoria' };
  if (p.ctaFlujo) return { href: p.ruta, texto: p.cta, medir: 'conocer' };
  return { href: p.flujo.ruta, texto: p.cta, medir: 'cotizar' };
}

export function marcaModalidad(/** @type {any} */ p) {
  return p.modalidad === 'asesoria'
    ? `<span class="marca-modalidad marca-modalidad--asesoria">${icono('personas')}Con asesoría</span>`
    : `<span class="marca-modalidad">${icono('celular')}Contratación en línea</span>`;
}

/** Para el administrador: lo que el cliente no ve, marcado. */
export function marcaOculto(/** @type {string} */ id, /** @type {boolean} */ admin) {
  return admin && !esVisible(id) ? `<span class="marca-modalidad marca-oculto">${icono('info')}Oculto para clientes</span>` : '';
}

/** Productos que se muestran: el cliente ve los visibles; el administrador, todos. */
export function filtrar(/** @type {any[]} */ lista, /** @type {boolean} */ admin) {
  return lista.filter((p) => admin || esVisible(p.id));
}

/** @param {any} p @param {{ admin?: boolean, destacado?: boolean }} [op] */
export function tarjetaProducto(p, op = {}) {
  const g = ganchoDe(p);
  const a = accionDe(p);
  const amb = normalizar(p.id);
  return `<article class="tarjeta">
    <div class="tarjeta__foto">${foto(p.foto, '', { sizes: op.destacado ? '(max-width: 960px) 100vw, 66vw' : undefined })}</div>
    <div class="tarjeta__cuerpo">
      <div class="chips">${marcaModalidad(p)}${marcaOculto(p.id, Boolean(op.admin))}</div>
      <h3><a href="${p.ruta}" data-medir="tarjeta" data-ambito="${amb}">${esc(p.nombre)}</a></h3>
      ${g ? `<p class="tarjeta__gancho">${esc(g.valor)}</p>` : ''}
      <p>${esc(p.tarjeta)}</p>
    </div>
    <div class="tarjeta__pie"><a class="btn btn--linea btn--bloque" href="${a.href}" data-medir="${a.medir}" data-ambito="${amb}">${esc(a.texto)}</a></div>
  </article>`;
}

/** @param {any} p @param {boolean} admin */
export function filaAsesoria(p, admin) {
  const amb = normalizar(p.id);
  return `<div class="fila-asesoria">
    <div><div class="chips">${marcaOculto(p.id, admin)}</div><h3><a href="${p.ruta}" data-medir="fila" data-ambito="${amb}">${esc(p.nombre)}</a></h3><p>${esc(p.tarjeta)}</p></div>
    <a class="btn btn--linea" href="${asesoriaRuta(p.id)}" data-medir="solicitar_asesoria" data-ambito="${amb}">Solicitar asesoría</a>
  </div>`;
}

/** Accesos directos a trámites: sin página informativa intermedia (brief). */
export function accionesRapidas(/** @type {boolean} */ admin) {
  const lista = SERVICIOS.filter((s) => admin || esVisible(s.id));
  if (!lista.length) return '';
  return `<div class="rapidas">${lista.map((s) => `<a class="rapida" href="${s.ruta}" data-medir="acceso_rapido" data-ambito="${normalizar(s.id)}">
      <span class="rapida__icono">${icono(s.icono)}</span><strong>${esc(s.nombre)}</strong>${icono('flecha-der')}</a>`).join('')}</div>`;
}

/** Los siete mundos. @param {boolean} [conEnlace] */
export function mundos(conEnlace = true) {
  return `<div class="mundos">${MUNDOS.map((m) => `<div class="mundo"><strong>${esc(m.nombre)}</strong><span>${esc(m.texto)}</span></div>`).join('')}</div>
  ${conEnlace && esVisible(MUNDO_ZURICH.id) ? `<p class="mt-6"><a class="btn btn--invertido" href="${MUNDO_ZURICH.ruta}" data-medir="mundo_zurich">Conoce Mundo Zurich</a></p>` : ''}`;
}

/** @param {string} antetitulo @param {string} titulo @param {string} [texto] @param {string} [id] */
export function encabezado(antetitulo, titulo, texto = '', id = '') {
  return `<div class="encabezado-seccion">${antetitulo ? `<span class="antetitulo">${esc(antetitulo)}</span>` : ''}<h2${id ? ` id="${id}"` : ''}>${esc(titulo)}</h2>${texto ? `<p>${esc(texto)}</p>` : ''}</div>`;
}

/** Lista de pendientes, visible solo al administrador. @param {string[]} lista @param {boolean} admin */
export function pendientesAdmin(lista, admin) {
  if (!admin || !lista?.length) return '';
  return `<div class="aviso aviso--aviso mt-4" role="note">${icono('reloj')}<div><strong>Por validar antes de publicar (solo lo ve el administrador)</strong><ul class="validaciones">${lista.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`;
}

export { porValidar };
