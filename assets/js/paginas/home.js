// @ts-check
/**
 * /home · Portada.
 *
 * Orden con lógica promocional, sobre la estructura del brief:
 * 1. Encabezado + carrusel de promociones, juntos arriba: quien llega ve la
 *    oferta sin desplazarse.
 * 2. Accesos rápidos a trámites: quien ya es cliente y viene por un siniestro
 *    lo resuelve antes de ver el catálogo (brief §Acciones rápidas). Es una
 *    franja pegada al carrusel, no una sección: ocupa una fila.
 * 3. Seguros en línea: Auto Digital destacado (oferta del mes), luego el resto.
 * 4. Seguros con asesoría.
 * 5. Mundo Zurich: el valor agregado que se lleva el cliente al contratar.
 * 6. La alianza.
 *
 * Decisión documentada: el brief repite los mismos cuatro trámites en
 * «Acciones rápidas» y en «Servicios en línea». En la portada quedan una sola
 * vez, arriba; la sección completa vive en /servicios.
 */
import { PROMOCIONES, EN_LINEA, CON_ASESORIA, ALIANZA, MUNDO_ZURICH, producto } from '../catalogo.js';
import { esVisible } from '../estado.js';
import { formas } from '../marco.js';
import { esc, icono, foto, fechaLarga, porValidar } from '../ui.js';
import { tarjetaProducto, filaAsesoria, accionesRapidas, mundos, encabezado, promoActiva, filtrar } from '../piezas.js';
import { registrar, normalizar } from '../medicion.js';

/** @param {{ main: HTMLElement, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, sesion }) {
  const admin = sesion.perfil === 'administrador';
  const enLinea = filtrar(EN_LINEA.map(producto), admin);
  const asesoria = filtrar(CON_ASESORIA.map(producto), admin);
  const laminas = PROMOCIONES.map(producto).filter((p) => p && esVisible(p.id));

  main.innerHTML = `
  <section class="portada con-formas" aria-labelledby="titulo-portada">
    <div class="contenedor portada__rejilla">
      <div class="portada__texto">
        <span class="antetitulo">Clientes Banco BICE</span>
        <h1 id="titulo-portada">Seguros Zurich para clientes de Banco BICE</h1>
        <p>Conoce los seguros disponibles, inicia una cotización y accede a servicios en línea sin salir de este espacio.</p>
        <div class="acciones">
          <a class="btn btn--primario" href="/personas/" data-medir="ver_seguros">Ver seguros ${icono('flecha-der')}</a>
          <a class="btn btn--fantasma" href="/servicios/" data-medir="denunciar_siniestro">Denunciar un siniestro</a>
        </div>
      </div>
      ${laminas.length ? carrusel(laminas) : ''}
    </div>
    <div class="contenedor">${accionesRapidas(admin)}</div>
    ${formas()}
  </section>

  <section class="seccion" aria-labelledby="titulo-en-linea" id="en-linea">
    <div class="contenedor">
      ${encabezado('Contratación en línea', 'Seguros que puedes contratar en línea', 'Revisa la información de cada producto e inicia la contratación desde este espacio.', 'titulo-en-linea')}
      <div class="productos productos--destacado">${enLinea.map((p, i) => tarjetaProducto(p, { admin, destacado: i === 0 })).join('')}</div>
    </div>
  </section>

  ${asesoria.length ? `<section class="seccion banda-blanco" aria-labelledby="titulo-asesoria">
    <div class="contenedor">
      ${encabezado('Con asesoría', 'Seguros con apoyo de un asesor', 'Conoce estas alternativas y solicita orientación para continuar con la contratación.', 'titulo-asesoria')}
      <div class="asesoria-portada">
        <div class="asesoria-portada__foto">${foto('asesoria-ejecutiva', 'Una asesora revisa alternativas de seguro junto a una clienta.', { sizes: '(max-width: 960px) 100vw, 40vw' })}</div>
        <div class="lista-asesoria">${asesoria.map((p) => filaAsesoria(p, admin)).join('')}</div>
      </div>
    </div>
  </section>` : ''}

  ${esVisible(MUNDO_ZURICH.id) ? `<section class="seccion banda-oscura" aria-labelledby="titulo-mundo">
    <div class="contenedor">
      ${encabezado('Beneficios al contratar', 'Mundo Zurich', MUNDO_ZURICH.bajada, 'titulo-mundo')}
      ${mundos()}
    </div>
  </section>` : ''}

  <section class="seccion" aria-labelledby="titulo-alianza">
    <div class="contenedor dos-columnas">
      <div class="encabezado-seccion">
        <span class="antetitulo">La alianza</span>
        <h2 id="titulo-alianza">${esc(ALIANZA.titulo)}</h2>
        <p>${esc(ALIANZA.texto)}</p>
        <p><a class="enlace-flecha" href="/alianza/" data-medir="alianza">Conoce el rol de cada compañía ${icono('flecha-der')}</a></p>
      </div>
      <div class="foto-apaisada">${foto('alianza-amigos', 'Un grupo de amigos conversa alrededor de una mesa con sus computadores.', { sizes: '(max-width: 860px) 100vw, 50vw' })}</div>
    </div>
  </section>

  ${notas(laminas)}`;

  if (laminas.length) activarCarrusel(main);
}

/** @param {any[]} lista */
function carrusel(lista) {
  const total = lista.length;
  return `<div class="carrusel" aria-roledescription="carrusel" aria-label="Promociones destacadas">
    <div class="carrusel__marco"><div class="carrusel__pista" id="pista" aria-live="off">
      ${lista.map((p, i) => lamina(p, i, total)).join('')}
    </div></div>
    <div class="carrusel__controles">
      <div class="carrusel__puntos">${lista.map((p, i) => `<button class="carrusel__punto" type="button" data-ir="${i}" aria-label="Ver promoción ${i + 1}: ${esc(p.corto)}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
      <div class="carrusel__flechas">
        <button class="boton-icono" type="button" data-pausa aria-label="Pausar el cambio automático">${icono('pausa')}</button>
        <button class="boton-icono" type="button" data-paso="-1" aria-label="Promoción anterior">${icono('flecha-izq')}</button>
        <button class="boton-icono" type="button" data-paso="1" aria-label="Promoción siguiente">${icono('flecha-der')}</button>
      </div>
    </div>
  </div>`;
}

/** @param {any} p @param {number} i @param {number} total */
function lamina(p, i, total) {
  const activa = promoActiva(p);
  const promo = p.promocion;
  const etiqueta = activa ? promo.etiqueta : 'Contrata en línea';
  const titular = activa ? promo.titulo : p.nombre;
  const bajada = activa ? promo.detalle : p.tarjeta;
  const boton = activa ? promo.boton : 'Conocer seguro';
  const vigencia = activa && promo.hasta ? `Válido hasta el ${fechaLarga(promo.hasta)}.` : '';
  return `<div class="lamina" role="group" aria-roledescription="lámina" aria-label="${i + 1} de ${total}"${i ? ' aria-hidden="true" inert' : ''}>
    <div class="lamina__foto">${foto(p.foto, '', { prioridad: i === 0, sizes: '(max-width: 700px) 100vw, 30vw' })}</div>
    <div class="lamina__texto">
      <span class="lamina__etiqueta">${esc(etiqueta)}</span>
      <span class="lamina__producto">${esc(p.nombre)}</span>
      <p class="lamina__titular">${esc(titular)}</p>
      <p class="lamina__bajada">${esc(bajada)}</p>
      ${activa ? `<p class="lamina__nota">${esc(vigencia)} Bases y condiciones al pie. ${porValidar('Condiciones por validar')}</p>` : ''}
      <a class="btn btn--invertido" href="${p.ruta}" data-medir="promocion" data-ambito="${normalizar(p.id)}">${esc(boton)}</a>
    </div>
  </div>`;
}

/** Bases de las promociones que se están mostrando. @param {any[]} lista */
function notas(lista) {
  const conBases = lista.filter((p) => promoActiva(p) && p.promocion.bases);
  if (!conBases.length) return '';
  return `<section class="contenedor notas-legales" aria-label="Bases y condiciones">${conBases.map((p) => `<p>${esc(p.promocion.bases)}</p>`).join('')}</section>`;
}

/**
 * Carrusel: avanza solo cada 7 s, pero se detiene para siempre en cuanto la
 * persona toca un control (un carrusel que cambia bajo las manos manda al
 * producto equivocado). Con movimiento reducido no avanza solo.
 * @param {HTMLElement} main
 */
function activarCarrusel(main) {
  const pista = /** @type {HTMLElement} */ (main.querySelector('#pista'));
  const laminas = /** @type {HTMLElement[]} */ ([...pista.children]);
  const puntos = /** @type {HTMLElement[]} */ ([...main.querySelectorAll('[data-ir]')]);
  const pausa = /** @type {HTMLButtonElement} */ (main.querySelector('[data-pausa]'));
  const carrusel = /** @type {HTMLElement} */ (main.querySelector('.carrusel'));
  let actual = 0;
  let detenido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let encima = false;

  const ir = (/** @type {number} */ n) => {
    actual = (n + laminas.length) % laminas.length;
    pista.style.transform = `translateX(-${actual * 100}%)`;
    laminas.forEach((l, i) => {
      const oculta = i !== actual;
      l.toggleAttribute('inert', oculta);
      if (oculta) l.setAttribute('aria-hidden', 'true'); else l.removeAttribute('aria-hidden');
    });
    puntos.forEach((p, i) => (i === actual ? p.setAttribute('aria-current', 'true') : p.removeAttribute('aria-current')));
  };
  const detener = () => {
    detenido = true;
    pausa.innerHTML = icono('play');
    pausa.setAttribute('aria-label', 'Reanudar el cambio automático');
  };
  if (detenido) { pausa.innerHTML = icono('play'); pausa.setAttribute('aria-label', 'Reanudar el cambio automático'); }

  main.querySelectorAll('[data-paso]').forEach((b) => b.addEventListener('click', () => {
    detener(); ir(actual + Number(/** @type {HTMLElement} */ (b).dataset.paso));
    registrar('home_click_carrusel_flecha');
  }));
  puntos.forEach((b) => b.addEventListener('click', () => { detener(); ir(Number(b.dataset.ir)); registrar('home_click_carrusel_punto'); }));
  pausa.addEventListener('click', () => {
    if (detenido) {
      detenido = false; pausa.innerHTML = icono('pausa'); pausa.setAttribute('aria-label', 'Pausar el cambio automático');
    } else detener();
  });
  carrusel.addEventListener('mouseenter', () => { encima = true; });
  carrusel.addEventListener('mouseleave', () => { encima = false; });
  carrusel.addEventListener('focusin', () => { encima = true; });
  carrusel.addEventListener('focusout', () => { encima = false; });

  setInterval(() => { if (!detenido && !encima && !document.hidden) ir(actual + 1); }, 7000);
}

