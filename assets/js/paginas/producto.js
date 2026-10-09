// @ts-check
/**
 * /personas/<ramo>/<producto>/ · Página de producto.
 *
 * Sigue el modelo del brief (nombre oficial → descripción → beneficios →
 * coberturas → exclusiones y requisitos → precio → documentación → llamado
 * → continuación) con una licencia de lógica promocional: el precio o la
 * promoción suben a la cabecera, junto al nombre y al botón, porque es el
 * dato que decide si se sigue leyendo. Las exclusiones quedan visibles antes
 * de iniciar la contratación, como pide el brief.
 */
import { producto, ramo, FECHA_FUENTES, MUNDO_ZURICH, asesoriaRuta } from '../catalogo.js';
import { esVisible } from '../estado.js';
import { migas, formas, noDisponible } from '../marco.js';
import { esc, icono, foto, celda, porValidar, promoVigente } from '../ui.js';
import { marcaModalidad, marcaOculto, ganchoDe, promoActiva, mundos, encabezado, pendientesAdmin } from '../piezas.js';
import { normalizar } from '../medicion.js';

/** @param {{ main: HTMLElement, id: string, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, id, sesion }) {
  const admin = sesion.perfil === 'administrador';
  const p = /** @type {any} */ (producto(id));
  if (!p || (!admin && !esVisible(p.id))) { main.innerHTML = noDisponible(); return; }
  const r = ramo(p.ramo);
  const amb = normalizar(p.id);
  const g = ganchoDe(p);
  const promo = promoActiva(p);
  const concurso = p.concurso && promoVigente(p.concurso) ? p.concurso : null;

  const accion = p.modalidad === 'asesoria'
    ? { href: asesoriaRuta(p.id), texto: 'Solicitar asesoría', medir: 'solicitar_asesoria' }
    : { href: p.flujo.ruta, texto: p.ctaFlujo || p.cta, medir: 'cotizar' };
  const boton = (/** @type {string} */ clase) => `<a class="btn ${clase}" href="${accion.href}" data-medir="${accion.medir}" data-ambito="${amb}">${esc(accion.texto)}</a>`;

  const anclas = [
    ['beneficios', 'Beneficios'],
    ['coberturas', 'Coberturas'],
    ...(p.pasosPrevios ? [['previos', p.pasosPrevios.titulo.startsWith('Exámenes') ? 'Exámenes preventivos' : 'Antes de cotizar']] : []),
    ...(p.asistencias ? [['asistencias', 'Asistencias']] : []),
    ['condiciones', 'Antes de contratar'],
    ['precio', 'Precio y documentos'],
    ['preguntas', 'Preguntas frecuentes'],
  ];

  main.classList.add('con-barra-accion');
  main.innerHTML = `
  ${migas([{ texto: 'Seguros', href: '/personas/' }, { texto: r?.nombre ?? '', href: r?.ruta }, { texto: p.nombre }])}

  <section class="producto-cabeza con-formas" aria-labelledby="titulo-producto">
    <div class="contenedor producto-cabeza__rejilla">
      <div class="producto-cabeza__texto">
        <div class="chips">${marcaModalidad(p)}${marcaOculto(p.id, admin)}</div>
        <h1 id="titulo-producto">${esc(p.nombre)}</h1>
        <p>${esc(p.bajada)}</p>
        ${g ? `<div class="gancho">
          <span class="gancho__etiqueta">${esc(g.etiqueta)}</span>
          <span class="gancho__valor">${esc(g.valor)}</span>
          <span class="gancho__nota">${esc(g.nota)}${(promo || g.valor.includes('*')) ? ` ${porValidar()}` : ''}</span>
        </div>` : ''}
        <div class="acciones">${boton('btn--primario')}<a class="btn btn--fantasma" href="#coberturas" data-medir="ver_coberturas">Ver coberturas</a></div>
        ${pendientesAdmin(p.porValidar, admin)}
      </div>
      <div class="producto-cabeza__foto">${foto(p.foto, '', { grande: true, prioridad: true })}</div>
    </div>
    ${formas()}
  </section>

  <nav class="anclas" aria-label="En esta página"><div class="contenedor"><ul>${anclas.map(([h, t]) => `<li><a href="#${h}">${esc(t)}</a></li>`).join('')}</ul></div></nav>

  <section class="seccion banda-blanco" id="beneficios" aria-labelledby="titulo-beneficios">
    <div class="contenedor">
      ${encabezado('Beneficios', '¿Por qué elegir este seguro?', '', 'titulo-beneficios')}
      <div class="beneficios">${p.beneficios.map((/** @type {any} */ b) => `<div class="beneficio"><span class="beneficio__icono">${icono(b.icono)}</span><h3>${esc(b.titulo)}</h3><p>${esc(b.texto)}</p></div>`).join('')}</div>
      ${promo ? bandaPromo(p.promocion.etiqueta, p.promocion.titulo, p.promocion.detalle, boton('btn--invertido')) : ''}
      ${concurso ? bandaPromo(concurso.etiqueta, concurso.titulo, concurso.detalle, '<a class="btn btn--linea-invertida" href="#notas" data-medir="ver_bases">Ver bases</a>') : ''}
    </div>
  </section>

  <section class="seccion" id="coberturas" aria-labelledby="titulo-coberturas">
    <div class="contenedor">
      ${encabezado('Coberturas', p.coberturas.titulo, '', 'titulo-coberturas')}
      ${coberturas(p)}
    </div>
  </section>

  ${p.pasosPrevios ? `<section class="seccion banda-blanco" id="previos" aria-labelledby="titulo-previos">
    <div class="contenedor">
      ${encabezado('Prepárate', p.pasosPrevios.titulo, p.pasosPrevios.bajada, 'titulo-previos')}
      <ol class="pasos-lista">${p.pasosPrevios.pasos.map((/** @type {any} */ x) => `<li><h3>${esc(x.titulo)}</h3><p>${esc(x.texto)}</p></li>`).join('')}</ol>
    </div>
  </section>` : ''}

  ${p.asistencias ? `<section class="seccion banda-blanco" id="asistencias" aria-labelledby="titulo-asistencias">
    <div class="contenedor">
      ${encabezado('Asistencias', 'Principales asistencias', 'Además de las coberturas, cuentas con asistencias para simplificar tu vida. Dependen del plan que contrates.', 'titulo-asistencias')}
      <div class="beneficios">${p.asistencias.map((/** @type {any} */ a) => `<div class="beneficio"><h3>${esc(a.titulo)}</h3><ul class="lista-check">${a.items.map((/** @type {string} */ i) => `<li>${icono('check')}<span>${esc(i)}</span></li>`).join('')}</ul></div>`).join('')}</div>
    </div>
  </section>` : ''}

  <section class="seccion" id="condiciones" aria-labelledby="titulo-condiciones">
    <div class="contenedor">
      ${encabezado(p.antes.titulo === 'Antes de contratar' ? 'Condiciones' : 'Antes de contratar', p.antes.titulo, 'Revisa los requisitos y las condiciones relevantes antes de iniciar la contratación.', 'titulo-condiciones')}
      <div class="dos-columnas">
        <div class="caja caja--borde"><h3>Requisitos</h3><ul class="lista-check">${p.antes.requisitos.map((/** @type {string} */ t) => `<li>${icono('check')}<span>${esc(t)}</span></li>`).join('')}</ul></div>
        <div class="caja caja--borde"><h3>Condiciones y exclusiones</h3><ul class="lista-check lista-check--aviso">${p.antes.condiciones.map((/** @type {string} */ t) => `<li>${icono('info')}<span>${esc(t)}</span></li>`).join('')}</ul></div>
      </div>
    </div>
  </section>

  <section class="seccion banda-blanco" id="precio" aria-labelledby="titulo-precio">
    <div class="contenedor">
      ${encabezado('Precio', 'Precio y documentación', '', 'titulo-precio')}
      <div class="dos-columnas">
      <div class="caja caja--borde">
        <h3>¿Cuánto cuesta?</h3>
        <p>${esc(p.precio)}</p>
      </div>
      <div class="caja caja--borde">
        <h3>Documentación contractual</h3>
        ${p.documentos.length ? `<ul>${p.documentos.map((/** @type {string} */ d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
        <p>La ficha del producto, las condiciones generales y la póliza se publican en zurich.cl. ${porValidar('Enlace por integrar')}</p>
        ${p.entidad ? `<p>Compañía que asegura el riesgo: ${esc(p.entidad)}</p>` : ''}
      </div>
      </div>
    </div>
  </section>

  ${esVisible(MUNDO_ZURICH.id) ? `<section class="seccion banda-oscura" aria-labelledby="titulo-mundo-p">
    <div class="contenedor">
      ${encabezado('Beneficios al contratar', 'Por contratar, accedes a Mundo Zurich', 'Beneficios y servicios exclusivos sin costo para ti y tu familia.', 'titulo-mundo-p')}
      ${mundos()}
    </div>
  </section>` : ''}

  <section class="seccion" id="preguntas" aria-labelledby="titulo-preguntas">
    <div class="contenedor">
      ${encabezado('Ayuda', 'Preguntas frecuentes', '', 'titulo-preguntas')}
      <div class="preguntas">${p.preguntas.map((/** @type {any} */ q) => `<details class="pregunta"><summary>${esc(q.p)}${icono('chevron')}</summary><div class="pregunta__cuerpo">${q.r.map((/** @type {string} */ t) => `<p>${esc(t)}</p>`).join('')}</div></details>`).join('')}</div>
    </div>
  </section>

  <section class="seccion seccion--compacta banda-azul" aria-labelledby="titulo-cierre">
    <div class="contenedor cierre-cta">
      <div>
        <h2 id="titulo-cierre">${p.modalidad === 'asesoria' ? '¿Quieres que un asesor te oriente?' : `Contrata ${esc(p.corto)} desde aquí`}</h2>
        <p>${p.modalidad === 'asesoria' ? 'Déjanos tus datos y un asesor de Zurich te contactará para continuar con la contratación.' : 'Sin salir de este espacio: la herramienta oficial de Zurich se abre aquí mismo.'}</p>
      </div>
      ${boton('btn--invertido')}
    </div>
  </section>

  <section class="contenedor notas-legales" id="notas" aria-label="Notas y bases">
    ${notas(p, promo, concurso)}
    <p>Información tomada de <a href="${p.referencia}" target="_blank" rel="noopener">la página oficial del producto en zurich.cl</a> el ${FECHA_FUENTES}.</p>
  </section>

  <div class="barra-accion" role="region" aria-label="Acción principal">
    <strong>${esc(p.corto)}${g ? `<span>${esc(g.valor)}</span>` : ''}</strong>
    <a class="btn btn--primario btn--chico" href="${accion.href}" data-medir="${accion.medir}" data-ambito="${amb}">${p.modalidad === 'asesoria' ? 'Solicitar asesoría' : (p.ctaFlujo ? 'Contratar' : 'Cotizar')}</a>
  </div>`;
}

/** @param {string} etiqueta @param {string} titulo @param {string} detalle @param {string} accion */
function bandaPromo(etiqueta, titulo, detalle, accion) {
  return `<div class="promo-banda mt-6">
    <span class="promo-banda__icono">${icono('regalo')}</span>
    <div><span class="lamina__etiqueta">${esc(etiqueta)}</span><h3 class="mt-2">${esc(titulo)}</h3><p>${esc(detalle)} ${porValidar('Vigencia por validar')}</p></div>
    ${accion}
  </div>`;
}

/** @param {any} p */
function coberturas(p) {
  const c = p.coberturas;
  if (c.filas) {
    return `${c.columnas.length > 1 ? `<p class="desliza">${icono('flecha-der')}Desliza para ver todos los planes</p>` : ''}<div class="tabla-envoltura"><table class="tabla">
      <caption class="sr">${esc(c.titulo)}</caption>
      <thead><tr><th scope="col">Cobertura</th>${c.columnas.map((/** @type {string} */ x) => `<th scope="col" class="centro">${esc(x)}</th>`).join('')}</tr></thead>
      <tbody>${c.filas.map((/** @type {any[]} */ f) => `<tr><th scope="row">${esc(f[0])}</th>${f.slice(1).map((v) => `<td class="centro">${celda(v)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>${c.notas ? `<div class="notas-legales">${c.notas.map((/** @type {string} */ n) => `<p>${esc(n)}</p>`).join('')}</div>` : ''}`;
  }
  return `<ul class="lista-check">${c.lista.map((/** @type {string} */ t) => `<li>${icono('check')}<span>${esc(t)}</span></li>`).join('')}</ul>`;
}

/** @param {any} p @param {boolean} promo @param {any} concurso */
function notas(p, promo, concurso) {
  const lista = [];
  if (p.promocion?.bases && (promo || p.id !== 'auto-digital')) lista.push(p.promocion.bases);
  if (concurso) lista.push(concurso.bases);
  if (p.id === 'proteccion-urgencias') lista.push('(*) Precio referencial equivalente al valor de la UF al 21/09/2026 por $40.983,58.');
  return lista.map((t) => `<p>${esc(t)}</p>`).join('');
}
