// @ts-check
/**
 * Marco común: cabecera, menús, cajón móvil, migas, pie y estados de acceso.
 *
 * Cabecera en la versión secundaria del skill de marca: fondo blanco, logos
 * a color y filete azul de 2 px. Es la excepción acordada para esta alianza:
 * el logo de Banco BICE solo existe en azul sobre blanco.
 */
import { PRODUCTOS, RAMOS, SERVICIOS, MUNDO_ZURICH, ENTIDADES, TELEFONO_ZURICH, productosDeRamo } from './catalogo.js';
import { esVisible } from './estado.js';
import { esc, icono } from './ui.js';
import { cerrar, iniciales } from './sesion.js';
import { registrar } from './medicion.js';

/** @typedef {import('./sesion.js').Sesion} Sesion */

const LOGO_ZURICH = '/assets/img/marca/zurich_logo_horizontal.png';
const LOGO_ZURICH_BLANCO = '/assets/img/marca/zurich_logo_horizontal_blanco.png';
const LOGO_BICE = '/assets/img/marca/bice_logo.png';

/** Bloqueo de co-branding: Zurich primero, divisoria, BICE a la altura de «Zurich». */
export function bloqueo(enlace = '/home/') {
  return `<a class="bloqueo" href="${enlace}" aria-label="Inicio · Seguros Zurich para clientes de Banco BICE">
    <img class="bloqueo__zurich" src="${LOGO_ZURICH}" alt="Zurich" width="155" height="36">
    <span class="bloqueo__division" aria-hidden="true"></span>
    <img class="bloqueo__bice" src="${LOGO_BICE}" alt="Banco BICE" width="170" height="18">
  </a>`;
}

/**
 * Lenguaje de formas: cuatro formas, tres escalas, sin superponerse, sin dos
 * colores iguales juntos y apoyadas sobre la línea de base [Brandbook].
 * Dos azules de marca y dos acentos de la paleta secundaria, Durazno y
 * Cerceta (pedido de Andrés, 10-10-2026: que no quede todo azul) [C].
 */
export function formas(clase = '') {
  return `<div class="formas ${clase}" aria-hidden="true"><svg viewBox="0 0 440 150" focusable="false">
    <path d="M14 150a70 70 0 0 1 140 0z" fill="#91bfe3"/>
    <path d="M166 150V52a98 98 0 0 1 98 98z" fill="#2167ae"/>
    <circle cx="298" cy="128" r="22" fill="#ff7569"/>
    <path d="M336 150V74a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16v76z" fill="#19bab6"/>
  </svg></div>`;
}

const visibles = () => PRODUCTOS.filter((p) => esVisible(p.id));

/** @param {string} ruta */
function seccionActual(ruta) {
  if (ruta.startsWith('/personas')) return 'seguros';
  if (ruta.startsWith('/servicios/denuncia')) return 'denuncias';
  if (ruta.startsWith('/servicios')) return 'servicios';
  if (ruta.startsWith('/mundo-zurich')) return 'mundo';
  if (ruta.startsWith('/alianza')) return 'alianza';
  return '';
}

function menuSeguros() {
  const grupos = RAMOS.map((r) => {
    const items = productosDeRamo(r.id).filter((p) => esVisible(p.id));
    if (!items.length) return '';
    return `<li><a href="${r.ruta}" data-medir="menu_ramo_${r.id}">${esc(r.nombre)}<span>${items.map((p) => esc(p.corto)).join(' · ')}</span></a></li>`;
  }).join('');
  return `<ul class="menu" id="menu-seguros" hidden>${grupos}
    <li class="menu__pie"><a href="/personas/" data-medir="menu_todos_los_seguros">Ver todos los seguros<span>Contratación en línea y con asesoría</span></a></li></ul>`;
}

function menuDenuncias() {
  const items = SERVICIOS.filter((s) => s.id.startsWith('denuncia') && esVisible(s.id))
    .map((s) => `<li><a href="${s.ruta}" data-medir="menu_${s.id}">${esc(s.nombre)}<span>${esc(s.bajada)}</span></a></li>`).join('');
  return items ? `<ul class="menu" id="menu-denuncias" hidden>${items}</ul>` : '';
}

/** @param {Sesion} s */
function menuUsuario(s) {
  return `<ul class="menu" id="menu-usuario" hidden>
    <li class="usuario__correo">${esc(s.correo)}<br><span class="etiqueta-perfil">${s.perfil === 'administrador' ? 'Administrador' : 'Usuario'}</span></li>
    ${s.perfil === 'administrador' ? `<li><a href="/configuracion/" data-medir="menu_configuracion">Configuración<span>Contenidos, solicitudes y medición</span></a></li>` : ''}
    <li><a href="/login/" data-salir data-medir="menu_salir">Salir<span>Cerrar sesión en este equipo</span></a></li>
  </ul>`;
}

/** @param {Sesion} s */
export function cabecera(s) {
  const actual = seccionActual(location.pathname);
  const marca = (/** @type {string} */ id) => (actual === id ? ' es-actual' : '');
  const denuncias = menuDenuncias();
  return `<a class="salto" href="#contenido">Saltar al contenido</a>
  <header class="cabecera">
    <div class="contenedor cabecera__fila">
      ${bloqueo()}
      <nav class="nav" aria-label="Principal">
        <ul class="nav__lista">
          <li class="nav__item"><button class="nav__enlace${marca('seguros')}" type="button" aria-expanded="false" aria-controls="menu-seguros">Seguros ${icono('chevron')}</button>${menuSeguros()}</li>
          ${denuncias ? `<li class="nav__item"><button class="nav__enlace${marca('denuncias')}" type="button" aria-expanded="false" aria-controls="menu-denuncias">Denunciar un siniestro ${icono('chevron')}</button>${denuncias}</li>` : ''}
          <li class="nav__item"><a class="nav__enlace${marca('servicios')}" href="/servicios/" data-medir="nav_servicios">Servicios en línea</a></li>
          ${esVisible(MUNDO_ZURICH.id) ? `<li class="nav__item"><a class="nav__enlace${marca('mundo')}" href="/mundo-zurich/" data-medir="nav_mundo_zurich">Mundo Zurich</a></li>` : ''}
          <li class="nav__item"><a class="nav__enlace${marca('alianza')}" href="/alianza/" data-medir="nav_alianza">La alianza</a></li>
        </ul>
      </nav>
      <div class="usuario">
        <button class="usuario__boton" type="button" aria-expanded="false" aria-controls="menu-usuario" aria-label="Mi cuenta: ${esc(s.correo)}">
          <span class="usuario__avatar" aria-hidden="true">${esc(iniciales(s))}</span><span class="usuario__texto">${s.perfil === 'administrador' ? 'Administrador' : 'Mi cuenta'}</span>${icono('chevron')}
        </button>${menuUsuario(s)}
      </div>
      <button class="boton-menu" type="button" aria-expanded="false" aria-controls="cajon" aria-label="Abrir menú">${icono('menu')}</button>
    </div>
  </header>
  <div class="cajon" id="cajon" hidden>
    <div class="cajon__panel" role="dialog" aria-modal="true" aria-label="Menú">
      <div class="cajon__cabeza">${bloqueo()}<button class="boton-icono" type="button" data-cerrar-cajon aria-label="Cerrar menú">${icono('cerrar')}</button></div>
      <div class="cajon__grupo"><h2>Seguros</h2>
        ${RAMOS.filter((r) => productosDeRamo(r.id).some((p) => esVisible(p.id))).map((r) => `<a href="${r.ruta}">${esc(r.nombre)}</a>`).join('')}
        <a href="/personas/">Ver todos los seguros</a>
      </div>
      <div class="cajon__grupo"><h2>Trámites</h2>
        ${SERVICIOS.filter((x) => esVisible(x.id)).map((x) => `<a href="${x.ruta}">${esc(x.nombre)}</a>`).join('')}
      </div>
      <div class="cajon__grupo"><h2>Zurich y Banco BICE</h2>
        ${esVisible(MUNDO_ZURICH.id) ? '<a href="/mundo-zurich/">Mundo Zurich</a>' : ''}
        <a href="/alianza/">La alianza y contacto</a>
      </div>
      <div class="cajon__grupo"><h2>Mi cuenta</h2>
        <p class="texto-suave">${esc(s.correo)}</p>
        ${s.perfil === 'administrador' ? '<a href="/configuracion/">Configuración</a>' : ''}
        <a href="/login/" data-salir>Salir</a>
      </div>
    </div>
  </div>`;
}

export function pie() {
  const prod = visibles();
  return `<div class="pie-alianza"><div class="contenedor pie-alianza__fila">
      <img class="pie-alianza__logo" src="${LOGO_BICE}" alt="Banco BICE" width="170" height="18">
      <p><strong>Zurich es el proveedor de los seguros y Banco BICE facilita el acceso a la oferta para sus clientes.</strong> Los productos conservan su nombre e identidad Zurich.</p>
      <a class="enlace-flecha" href="/alianza/" data-medir="pie_alianza">Conoce la alianza ${icono('flecha-der')}</a>
    </div></div>
  <footer class="pie">
    <div class="contenedor">
      <div class="pie__rejilla">
        <div class="pie__marca">
          <img class="pie__logo" src="${LOGO_ZURICH_BLANCO}" alt="Zurich" width="138" height="32">
          <p>Seguros Zurich para clientes de Banco BICE. Información, cotizadores y trámites en un solo espacio.</p>
        </div>
        <div><h2>Seguros</h2><ul>${prod.slice(0, 6).map((p) => `<li><a href="${p.ruta}">${esc(p.corto)}</a></li>`).join('')}<li><a href="/personas/">Ver todos</a></li></ul></div>
        <div><h2>Trámites</h2><ul>${SERVICIOS.filter((x) => esVisible(x.id)).map((x) => `<li><a href="${x.ruta}">${esc(x.nombre)}</a></li>`).join('')}</ul></div>
        <div><h2>Ayuda Zurich</h2><ul>
          <li><a class="pie__telefono" href="${TELEFONO_ZURICH.enlace}" data-medir="pie_telefono">${TELEFONO_ZURICH.visible}</a></li>
          <li><a href="/alianza/#contacto">Canales de atención</a></li>
          <li><a href="/alianza/#legal">Bases de promociones vigentes</a></li>
        </ul></div>
      </div>
      <div class="pie__legal">
        <p>Los seguros son ofrecidos por ${ENTIDADES.generales} y ${ENTIDADES.vida}, según el producto. Banco BICE facilita el acceso a la oferta para sus clientes.</p>
        <p>Privacidad y tratamiento de datos, términos de uso y cookies: en validación con las áreas legales de Zurich y Banco BICE.</p>
      </div>
    </div>
  </footer>`;
}

/**
 * Migas: la ruta comunica segmento, ramo y producto (brief §Estructura de rutas).
 * @param {{ texto: string, href?: string }[]} pasos
 */
export function migas(pasos) {
  const todos = [{ texto: 'Inicio', href: '/home/' }, ...pasos];
  return `<nav class="migas contenedor" aria-label="Estás en"><ol>${todos.map((p, i) =>
    i === todos.length - 1 ? `<li><span aria-current="page">${esc(p.texto)}</span></li>` : `<li><a href="${p.href}">${esc(p.texto)}</a></li>`).join('')}</ol></nav>`;
}

/** Menús desplegables, cajón y salida. Un solo juego de oyentes. */
export function activarMarco() {
  /** @param {HTMLElement} boton @param {boolean} abrir */
  const alternar = (boton, abrir) => {
    const id = boton.getAttribute('aria-controls');
    const panel = id ? document.getElementById(id) : null;
    if (!panel) return;
    boton.setAttribute('aria-expanded', String(abrir));
    panel.hidden = !abrir;
  };
  const cerrarTodos = (/** @type {Element|null} */ excepto = null) => {
    document.querySelectorAll('.nav__enlace[aria-expanded="true"], .usuario__boton[aria-expanded="true"]').forEach((b) => {
      if (b !== excepto) alternar(/** @type {HTMLElement} */ (b), false);
    });
  };
  document.querySelectorAll('.nav__enlace[aria-controls], .usuario__boton').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const abrir = b.getAttribute('aria-expanded') !== 'true';
      cerrarTodos(b);
      alternar(/** @type {HTMLElement} */ (b), abrir);
    });
  });
  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element) || !e.target.closest('.menu')) cerrarTodos();
  });

  const cajon = document.getElementById('cajon');
  const abreCajon = /** @type {HTMLElement|null} */ (document.querySelector('.boton-menu'));
  const cierraCajon = () => { if (cajon) cajon.hidden = true; abreCajon?.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; abreCajon?.focus(); };
  abreCajon?.addEventListener('click', () => {
    if (!cajon) return;
    cajon.hidden = false; abreCajon.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
    /** @type {HTMLElement|null} */ (cajon.querySelector('[data-cerrar-cajon]'))?.focus();
  });
  cajon?.addEventListener('click', (e) => { if (e.target === cajon) cierraCajon(); });
  cajon?.querySelector('[data-cerrar-cajon]')?.addEventListener('click', cierraCajon);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const abierto = /** @type {HTMLElement|null} */ (document.querySelector('[aria-expanded="true"][aria-controls^="menu-"]'));
    cerrarTodos();
    abierto?.focus();
    if (cajon && !cajon.hidden) cierraCajon();
  });

  document.querySelectorAll('[data-salir]').forEach((a) => a.addEventListener('click', () => {
    registrar('sesion_rec_salida');
    cerrar();
  }));
}

/* ---- Estados de página -------------------------------------------------- */

/** Contenido oculto por el administrador: no se muestra roto, se explica. */
export function noDisponible(titulo = 'Este contenido no está disponible') {
  return `<section class="seccion"><div class="contenedor"><div class="vacio">
    ${icono('info')}<h1 class="sr">${esc(titulo)}</h1><h2>${esc(titulo)}</h2>
    <p>Por ahora este seguro o trámite no está habilitado en este espacio. Revisa los seguros disponibles o vuelve al inicio.</p>
    <div class="acciones"><a class="btn btn--primario" href="/personas/">Ver seguros disponibles</a><a class="btn btn--fantasma" href="/home/">Volver al inicio</a></div>
  </div></div></section>`;
}

export function accesoRestringido() {
  return `<section class="seccion"><div class="contenedor"><div class="vacio">
    ${icono('candado')}<h1>Acceso restringido</h1>
    <p>Esta sección es solo para el perfil administrador. Si necesitas acceso, solicítalo al equipo que administra este espacio.</p>
    <a class="btn btn--primario" href="/home/">Volver al inicio</a>
  </div></div></section>`;
}
