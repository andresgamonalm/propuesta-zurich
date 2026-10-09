// @ts-check
/**
 * Marco de integración · cotizadores y trámites dentro del mini sitio.
 *
 * Brief: «No volver a desarrollar los cotizadores ni crear copias de sus
 * flujos. Integrar con las herramientas oficiales de Zurich, con una ruta
 * propia y midiendo cada paso».
 *
 * Composición (pedido de Andrés, 9 de octubre de 2026): la cabecera, los
 * pasos y el pie son de la propuesta; dentro del marco va SOLO el formulario
 * o el flujo de Zurich, nunca la página completa de zurich.cl con su menú y
 * su pie. Al lado, la promoción del producto (cotizadores) o el aviso del
 * trámite (servicios).
 *
 * Dos modos, y ninguno finge lo que no es:
 * - EMBEBIDO: hay una dirección que es solo el formulario (`formulario` en el
 *   catálogo, o la que fije el administrador) y la carga está activa. Una
 *   página de otro dominio no se puede recortar desde fuera: por eso se usa
 *   la dirección del formulario y no la del producto.
 * - REFERENCIAL: aún no hay esa dirección. Se muestra la primera pantalla,
 *   rotulada como referencial, y el enlace a la herramienta actual.
 *
 * Contrato de eventos para TI (postMessage desde la herramienta embebida):
 *   { fuente: 'zurich', tipo: 'paso', paso: '<nombre>' }   → avance de paso
 *   { fuente: 'zurich', tipo: 'fin' }                       → finalización
 * Solo se aceptan mensajes del origen exacto de la URL configurada.
 * Cada paso se registra además como vista virtual de la ruta
 * /…/cotizador/<producto>/<paso>/, que es la nomenclatura propuesta.
 */
import { producto, servicio, ramo, TELEFONO_ZURICH, MUNDO_ZURICH } from '../catalogo.js';
import { ajuste, esVisible } from '../estado.js';
import { migas, noDisponible } from '../marco.js';
import { esc, icono, porValidar, promoVigente, fechaLarga } from '../ui.js';
import { pendientesAdmin, promoActiva, ganchoDe } from '../piezas.js';
import { registrar, normalizar } from '../medicion.js';

/** Si a los 15 s el marco no avisó que cargó, se ofrece la pestaña nueva. */
const ESPERA_LENTA = 15000;

/** @param {{ main: HTMLElement, id: string, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, id, sesion }) {
  const admin = sesion.perfil === 'administrador';
  const p = /** @type {any} */ (producto(id));
  const s = /** @type {any} */ (servicio(id));
  const item = p || s;
  if (!item || (!admin && !esVisible(item.id))) { main.innerHTML = noDisponible(); return; }

  const esCotizador = Boolean(p);
  const datos = esCotizador ? p.flujo : s;
  const amb = normalizar(item.id);
  const a = ajuste(item.id);
  const embebido = Boolean(a.embebido && a.destino);
  const titulo = esCotizador ? p.flujo.titulo : s.nombre;
  const base = location.pathname.replace(/[^/]+\/$/, '');
  let origen = '';
  try { origen = new URL(a.destino || datos.referencia).origin; } catch { origen = ''; }

  const camino = esCotizador
    ? [{ texto: 'Seguros', href: '/personas/' }, { texto: ramo(p.ramo)?.nombre ?? '', href: ramo(p.ramo)?.ruta }, { texto: p.nombre, href: p.ruta }, { texto: p.modalidad === 'digital' ? 'Cotizar' : 'Contratar' }]
    : [{ texto: 'Servicios en línea', href: '/servicios/' }, { texto: s.nombre }];

  main.innerHTML = `
  ${migas(camino)}
  <section class="cabeza-pagina" aria-labelledby="titulo-flujo">
    <div class="contenedor cabeza-flujo">
      <h1 id="titulo-flujo">${esc(titulo)}</h1>
      <p class="texto-suave">${esCotizador ? 'La herramienta oficial de Zurich, dentro de este espacio: cotiza y contrata sin salir de aquí.' : esc(s.bajada)}</p>
      <ol class="pasos-flujo" aria-label="Pasos">${datos.etiquetas.map((/** @type {string} */ e, /** @type {number} */ i) => `<li data-paso="${datos.pasos[i]}"${i === 0 ? ' aria-current="step"' : ''}>${esc(e)}</li>`).join('')}</ol>
    </div>
  </section>

  <div class="contenedor integracion">
    <div class="marco">
      <div class="marco__barra">
        <span class="marco__origen">${icono('candado')}<span>Herramienta oficial de Zurich · <code>${esc(origen.replace(/^https?:\/\//, '') || 'origen por definir')}</code></span></span>
        ${embebido ? '<span class="chip chip--exito">' + icono('check') + 'Integración activa</span>' : '<span class="chip chip--aviso">' + icono('reloj') + 'Vista referencial</span>'}
      </div>
      ${embebido ? marcoActivo(a.destino, titulo, item) : referencial(item, datos, esCotizador)}
    </div>

    <aside class="lateral" aria-label="${esCotizador ? 'Promoción y ayuda' : 'Aviso y ayuda'}">
      ${esCotizador ? promocion(p) : avisoTramite(s)}
      <div class="caja"><h2>Lo que necesitas</h2><ul>${datos.necesitas.map((/** @type {string} */ t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      ${esCotizador ? '' : mundo()}
      <div class="caja caja--borde"><h2>¿Necesitas ayuda?</h2><p>Llama a Zurich al <a href="${TELEFONO_ZURICH.enlace}" data-medir="telefono">${TELEFONO_ZURICH.visible}</a>.</p><p>Zurich es quien ${esCotizador ? 'cotiza, emite la póliza y cobra' : 'gestiona este trámite'}. Banco BICE facilita el acceso a este espacio.</p></div>
      <a class="enlace-flecha" href="${esCotizador ? p.ruta : '/servicios/'}" data-medir="volver">${icono('flecha-izq')} ${esCotizador ? `Volver a ${esc(p.corto)}` : 'Ver todos los trámites'}</a>
      ${admin ? herramientasAdmin(embebido) : ''}
      ${pendientesAdmin(item.porValidar, admin)}
    </aside>
  </div>`;

  registrar(`${amb}_rec_inicio_flujo`, { modo: embebido ? 'embebido' : 'referencial', ruta_virtual: `${base}${datos.pasos[0]}/` });

  /* ---- Carga del marco: aviso mientras llega y salida si tarda ---- */
  const lienzo = /** @type {HTMLElement|null} */ (main.querySelector('.marco__lienzo'));
  if (lienzo) {
    const marco = /** @type {HTMLIFrameElement} */ (lienzo.querySelector('iframe'));
    const espera = setTimeout(() => {
      if (lienzo.dataset.estado !== 'cargando') return;
      lienzo.dataset.estado = 'lento';
      const t = lienzo.querySelector('[data-carga-texto]');
      if (t) t.textContent = 'Está tardando más de lo normal. Si no aparece, ábrela en una pestaña nueva.';
    }, ESPERA_LENTA);
    marco.addEventListener('load', () => { clearTimeout(espera); lienzo.dataset.estado = 'listo'; });
  }

  /* ---- Medición por paso: contrato postMessage ---- */
  const lista = /** @type {HTMLElement[]} */ ([...main.querySelectorAll('.pasos-flujo li')]);
  const marcar = (/** @type {string} */ paso) => {
    const i = datos.pasos.indexOf(paso);
    if (i < 0) return false;
    lista.forEach((li, j) => {
      li.classList.toggle('hecho', j < i);
      if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    return true;
  };
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.fuente !== 'zurich') return;
    const simulado = d.simulado === true && e.origin === location.origin && admin;
    if (e.origin !== origen && !simulado) return;
    const extra = simulado ? { simulado: true } : {};
    if (d.tipo === 'paso' && typeof d.paso === 'string' && marcar(d.paso)) {
      registrar(`${amb}_rec_avance_paso`, { paso: d.paso, ruta_virtual: `${base}${d.paso}/`, ...extra });
    } else if (d.tipo === 'fin') {
      marcar(datos.pasos[datos.pasos.length - 1]);
      lista.forEach((li) => li.classList.add('hecho'));
      registrar(`${amb}_rec_fin_flujo`, extra);
    }
  });

  /* Prueba del contrato para TI: solo administrador, marcado como simulación. */
  const probar = main.querySelector('[data-probar]');
  let k = 0;
  probar?.addEventListener('click', () => {
    k += 1;
    if (k < datos.pasos.length) window.postMessage({ fuente: 'zurich', tipo: 'paso', paso: datos.pasos[k], simulado: true }, location.origin);
    else { window.postMessage({ fuente: 'zurich', tipo: 'fin', simulado: true }, location.origin); k = 0; }
  });
}

/**
 * Solo el formulario de Zurich, en un marco aislado.
 * @param {string} url @param {string} titulo @param {any} item
 */
function marcoActivo(url, titulo, item) {
  const pdf = Boolean(item.documento);
  // Chrome no muestra un PDF dentro de un marco aislado: el formulario en PDF
  // va sin aislar. El origen igual queda limitado por frame-src (_headers).
  const aislado = pdf ? '' : ' allow="payment; camera" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"';
  const descarga = pdf ? `<a class="btn btn--linea btn--chico" href="${esc(url)}" target="_blank" rel="noopener" data-medir="descargar_formulario">${icono('descarga')} Descargar formulario (${esc(item.documento.formato)})</a>` : '';
  return `<div class="marco__lienzo" data-estado="cargando">
      <iframe src="${esc(url)}" title="${esc(titulo)} · herramienta oficial de Zurich" loading="eager"
        referrerpolicy="strict-origin-when-cross-origin"${aislado}></iframe>
      <div class="marco__carga" role="status"><span class="marco__giro" aria-hidden="true"></span><span data-carga-texto>Cargando la herramienta oficial de Zurich…</span></div>
    </div>
    <div class="marco__pie">
      <p>${icono('info')}<span>${pdf ? 'En el celular, descarga el formulario para verlo completo.' : 'Si el formulario no aparece, ábrelo en una pestaña nueva.'}</span></p>
      <div class="acciones">${descarga}<a class="enlace-flecha" href="${esc(url)}" target="_blank" rel="noopener" data-medir="abrir_pestana">Abrir en una pestaña nueva ${icono('externo')}</a></div>
    </div>`;
}

/** @param {any} item @param {any} datos @param {boolean} esCotizador */
function referencial(item, datos, esCotizador) {
  const doc = item.documento;
  const previa = datos.previa?.length
    ? `<div class="campos-previa">${datos.previa.map((/** @type {any} */ c, /** @type {number} */ i) => `<div class="campo"><label for="previa-${i}">${esc(c.etiqueta)}</label><input id="previa-${i}" type="${c.tipo}" disabled${c.ayuda ? ` aria-describedby="previa-ayuda-${i}"` : ''}>${c.ayuda ? `<span class="ayuda" id="previa-ayuda-${i}">${esc(c.ayuda)}</span>` : ''}</div>`).join('')}</div>
       <button class="btn btn--primario" type="button" disabled aria-disabled="true">Continuar</button>`
    : '';
  return `<div class="marco__referencial">
    <div>
      <h2 class="h-lg">Aquí se abre la herramienta oficial de Zurich</h2>
      <p class="texto-suave mt-2">${esCotizador ? 'El cotizador oficial carga en este recuadro: solo el formulario, sin la página del producto alrededor. La persona no sale de este espacio y cada paso queda medido.' : 'El trámite oficial carga en este recuadro, sin una página informativa intermedia y sin salir de este espacio.'}</p>
    </div>
    ${doc ? `<div class="caja caja--borde"><h3>${icono('documento')} ${esc(doc.titulo)}</h3><p>Formulario oficial en ${esc(doc.formato)}. Se completa, se firma y se envía con los comprobantes.</p>
      <p><a class="btn btn--linea" href="${esc(item.referencia)}" target="_blank" rel="noopener" data-medir="descargar_formulario">${icono('descarga')} Descargar formulario (${esc(doc.formato)})</a></p></div>` : ''}
    ${previa ? `<div class="vista-previa" aria-label="Primera pantalla, vista referencial">
      <div class="vista-previa__titulo"><strong>Primera pantalla</strong><span class="chip chip--neutro">Vista referencial · no envía datos</span></div>
      ${previa}
    </div>` : ''}
    <div class="acciones">
      <a class="enlace-flecha" href="${esc(item.referencia)}" target="_blank" rel="noopener" data-medir="abrir_referencia">Ver la herramienta actual en zurich.cl ${icono('externo')}</a>
      ${porValidar('Falta la dirección del formulario · TI de Zurich')}
    </div>
  </div>`;
}

/**
 * Al lado del cotizador: la promoción vigente; si no hay, el concurso; si
 * tampoco, el gancho del producto. Mismo dato y misma prioridad que su página.
 * @param {any} p
 */
function promocion(p) {
  const concurso = p.concurso && promoVigente(p.concurso) ? p.concurso : null;
  const promo = promoActiva(p) ? p.promocion : concurso;
  const g = ganchoDe(p);
  const etiqueta = promo ? promo.etiqueta : g.etiqueta;
  const titular = promo ? promo.titulo : g.valor;
  const texto = promo ? promo.detalle : g.nota;
  const vigencia = promo?.hasta ? `Vigente hasta el ${fechaLarga(promo.hasta)}.` : '';
  const marca = promo ? porValidar('Vigencia por validar') : (titular.includes('*') ? porValidar() : '');
  // Un concurso no dice el precio: el gancho del producto va debajo.
  const precio = promo && promo === concurso && g ? `<p class="promo-lateral__precio">${esc(g.etiqueta)} · <strong>${esc(g.valor)}</strong></p>` : '';
  return `<section class="promo-lateral" aria-labelledby="promo-lateral-titulo">
      <span class="promo-lateral__etiqueta">${icono('regalo')}${esc(etiqueta)}</span>
      <h2 id="promo-lateral-titulo" class="promo-lateral__titulo${titular.length > 42 ? ' promo-lateral__titulo--largo' : ''}">${esc(titular)}</h2>
      ${texto ? `<p>${esc(texto)}</p>` : ''}
      ${precio}
      <p class="promo-lateral__vigencia">${esc(vigencia)} ${marca}</p>
    </section>
    ${promo?.bases ? `<details class="bases-lateral"><summary>Bases de la ${promo === concurso ? 'campaña' : 'promoción'} ${icono('chevron')}</summary><p>${esc(promo.bases)}</p></details>` : ''}`;
}

/** Al lado del trámite: lo que hay que saber antes de empezar. @param {any} s */
function avisoTramite(s) {
  if (!s.aviso) return '';
  return `<div class="aviso aviso--aviso" role="note">${icono('alerta')}<div><strong>${esc(s.aviso.titulo)}</strong>${esc(s.aviso.texto)}</div></div>`;
}

/** Beneficio para quien ya es cliente: Mundo Zurich, si está publicado. */
function mundo() {
  if (!esVisible(MUNDO_ZURICH.id)) return '';
  return `<section class="promo-lateral promo-lateral--suave" aria-labelledby="mundo-lateral-titulo">
      <span class="promo-lateral__etiqueta">${icono('estrella')}Para clientes Zurich</span>
      <h2 id="mundo-lateral-titulo" class="promo-lateral__titulo">${esc(MUNDO_ZURICH.nombre)}</h2>
      <p>${esc(MUNDO_ZURICH.bajada)}</p>
      <a class="enlace-flecha" href="${MUNDO_ZURICH.ruta}" data-medir="mundo_zurich">Conocer los beneficios ${icono('flecha-der')}</a>
    </section>`;
}

/** @param {boolean} embebido */
function herramientasAdmin(embebido) {
  return `<div class="aviso aviso--info">${icono('engranaje')}<div><strong>Administrador</strong>${embebido
    ? 'La herramienta carga dentro del sitio. Puedes volver a la vista referencial'
    : 'Cuando Zurich entregue la dirección del formulario, actívala'} en <a href="/configuracion/">Configuración › Contenidos</a>. Para mostrar cómo se mide cada paso, simula los eventos que enviará la herramienta:
      <p class="mt-2"><button class="btn btn--fantasma btn--chico" type="button" data-probar>Simular avance de paso</button></p></div></div>`;
}
