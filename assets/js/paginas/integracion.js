// @ts-check
/**
 * Marco de integración · cotizadores y trámites dentro del mini sitio.
 *
 * Brief: «No volver a desarrollar los cotizadores ni crear copias de sus
 * flujos. Integrar con las herramientas oficiales de Zurich, con una ruta
 * propia y midiendo cada paso».
 *
 * Dos modos, y ninguno finge lo que no es:
 * - EMBEBIDO: el administrador activó la integración y hay una URL. Se carga
 *   la herramienta oficial en un marco. Si el dominio de origen no permite
 *   cargarse dentro de otro sitio, el navegador lo bloquea: es una de las
 *   condiciones técnicas que el brief pide validar con Zurich.
 * - REFERENCIAL (por omisión): se muestra el marco con una vista de la
 *   primera pantalla, rotulada como referencial, y la URL de origen.
 *
 * Contrato de eventos para TI (postMessage desde la herramienta embebida):
 *   { fuente: 'zurich', tipo: 'paso', paso: '<nombre>' }   → avance de paso
 *   { fuente: 'zurich', tipo: 'fin' }                       → finalización
 * Solo se aceptan mensajes del origen exacto de la URL configurada.
 * Cada paso se registra además como vista virtual de la ruta
 * /…/cotizador/<producto>/<paso>/, que es la nomenclatura propuesta.
 */
import { producto, servicio, ramo, TELEFONO_ZURICH } from '../catalogo.js';
import { ajuste, esVisible } from '../estado.js';
import { migas, noDisponible } from '../marco.js';
import { esc, icono, porValidar } from '../ui.js';
import { pendientesAdmin } from '../piezas.js';
import { registrar, normalizar } from '../medicion.js';

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
      ${embebido ? marcoActivo(a.destino, titulo) : referencial(item, datos, esCotizador, admin)}
    </div>

    <aside class="lateral" aria-label="Ayuda">
      <div class="caja"><h2>Lo que necesitas</h2><ul>${datos.necesitas.map((/** @type {string} */ t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="caja caja--borde"><h2>¿Necesitas ayuda?</h2><p>Llama a Zurich al <a href="${TELEFONO_ZURICH.enlace}" data-medir="telefono">${TELEFONO_ZURICH.visible}</a>.</p><p>Zurich es quien ${esCotizador ? 'cotiza, emite la póliza y cobra' : 'gestiona este trámite'}. Banco BICE facilita el acceso a este espacio.</p></div>
      <a class="enlace-flecha" href="${esCotizador ? p.ruta : '/servicios/'}" data-medir="volver">${icono('flecha-izq')} ${esCotizador ? `Volver a ${esc(p.corto)}` : 'Ver todos los trámites'}</a>
      ${pendientesAdmin(item.porValidar, admin)}
    </aside>
  </div>`;

  registrar(`${amb}_rec_inicio_flujo`, { modo: embebido ? 'embebido' : 'referencial', ruta_virtual: `${base}${datos.pasos[0]}/` });

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

/** @param {string} url @param {string} titulo */
function marcoActivo(url, titulo) {
  return `<iframe src="${esc(url)}" title="${esc(titulo)} · herramienta oficial de Zurich" loading="eager"
      referrerpolicy="strict-origin-when-cross-origin" allow="payment; camera"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"></iframe>
    <p class="aviso aviso--info aviso--plano">${icono('info')}<span>Si el recuadro aparece en blanco o con un mensaje de error, el sitio de origen no permite cargarse dentro de otro sitio. Es una condición técnica que se valida con Zurich.</span></p>`;
}

/** @param {any} item @param {any} datos @param {boolean} esCotizador @param {boolean} admin */
function referencial(item, datos, esCotizador, admin) {
  const doc = item.documento;
  const previa = datos.previa?.length
    ? `<div class="campos-previa">${datos.previa.map((/** @type {any} */ c, /** @type {number} */ i) => `<div class="campo"><label for="previa-${i}">${esc(c.etiqueta)}</label><input id="previa-${i}" type="${c.tipo}" disabled${c.ayuda ? ` aria-describedby="previa-ayuda-${i}"` : ''}>${c.ayuda ? `<span class="ayuda" id="previa-ayuda-${i}">${esc(c.ayuda)}</span>` : ''}</div>`).join('')}</div>
       <button class="btn btn--primario" type="button" disabled aria-disabled="true">Continuar</button>`
    : '';
  return `<div class="marco__referencial">
    <div>
      <h2 class="h-lg">Aquí se abre la herramienta oficial de Zurich</h2>
      <p class="texto-suave mt-2">${esCotizador ? 'El cotizador oficial carga en este recuadro, con su contenido y funcionamiento originales. La persona no sale de este espacio y cada paso queda medido.' : 'El trámite oficial carga en este recuadro, sin una página informativa intermedia y sin salir de este espacio.'}</p>
    </div>
    ${doc ? `<div class="caja caja--borde"><h3>${icono('documento')} ${esc(doc.titulo)}</h3><p>Formulario oficial en ${esc(doc.formato)}. Se completa, se firma y se envía con los comprobantes.</p>
      <p><a class="btn btn--linea" href="${esc(item.referencia)}" target="_blank" rel="noopener" data-medir="descargar_formulario">${icono('descarga')} Descargar formulario (${esc(doc.formato)})</a></p></div>` : ''}
    ${previa ? `<div class="vista-previa" aria-label="Primera pantalla, vista referencial">
      <div class="vista-previa__titulo"><strong>Primera pantalla</strong><span class="chip chip--neutro">Vista referencial · no envía datos</span></div>
      ${previa}
    </div>` : ''}
    <div class="acciones">
      <a class="enlace-flecha" href="${esc(item.referencia)}" target="_blank" rel="noopener" data-medir="abrir_referencia">Ver la herramienta actual en zurich.cl ${icono('externo')}</a>
      ${porValidar('Integración por validar con TI de Zurich')}
    </div>
    ${admin ? `<div class="aviso aviso--info">${icono('engranaje')}<div><strong>Administrador</strong>Activa la carga dentro del sitio en <a href="/configuracion/">Configuración › Contenidos</a>. Para mostrar cómo se mide cada paso, simula los eventos que enviará la herramienta:
      <p class="mt-2"><button class="btn btn--fantasma btn--chico" type="button" data-probar>Simular avance de paso</button></p></div></div>` : ''}
  </div>`;
}
