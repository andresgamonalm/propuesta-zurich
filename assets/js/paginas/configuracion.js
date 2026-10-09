// @ts-check
/**
 * /configuracion · Vista de administración (brief §Perfiles: «Mantener
 * promociones, productos, enlaces, textos legales e integraciones sin
 * exponer controles al usuario final»).
 *
 * Cuatro pestañas, cada una con su ancla para poder enlazarla:
 *   #contenidos   qué ve el cliente y a dónde lleva cada integración
 *   #solicitudes  las solicitudes de asesoría recibidas
 *   #medicion     los eventos registrados y los cuatro indicadores clave
 *   #pendientes   todo lo que el brief y la lectura de fuentes dejan por validar
 */
import { PRODUCTOS, SERVICIOS, PROMOCIONES, MUNDO_ZURICH, ALIANZA, producto } from '../catalogo.js';
import { ajuste, guardarAjuste, restablecer, hayCambios, solicitudes, borrarSolicitudes } from '../estado.js';
import { registros, borrarRegistros, CLAVES, registrar } from '../medicion.js';
import { migas } from '../marco.js';
import { esc, icono, avisar, promoVigente, fechaLarga, hoyISO } from '../ui.js';

/** Orígenes que la política de seguridad permite cargar en un marco. */
const ORIGENES_PERMITIDOS = [/\.zurich\.cl$/, /^zurich\.cl$/, /^edge\.sitecorecloud\.io$/];

const PESTANAS = [
  { id: 'contenidos', texto: 'Contenidos' },
  { id: 'solicitudes', texto: 'Solicitudes' },
  { id: 'medicion', texto: 'Medición' },
  { id: 'pendientes', texto: 'Pendientes' },
];

/** Decisiones del brief §Decisiones necesarias antes de producción. */
const DECISIONES = [
  { grupo: 'Acceso y administración', items: ['Método definitivo de autenticación (correo, sesión privada de Banco BICE o inicio de sesión único).', 'Alcance del perfil administrador y vigencia del correo indicado.', 'Relación entre la sesión privada de Banco BICE y las herramientas de Zurich.'] },
  { grupo: 'Marca y asuntos legales', items: ['Manual vigente de Banco BICE y excepciones aprobadas para esta experiencia.', 'Validación conjunta de los usos de la paleta referencial de Banco BICE.', 'Composición definitiva de los identificadores de ambas compañías.', 'Biblioteca oficial de íconos de Zurich (hoy se usa una familia de trazo propia).'] },
  { grupo: 'Integraciones y operación', items: ['Permisos para cargar cada herramienta dentro de un marco embebido y encabezados de seguridad de los dominios de origen.', 'Comunicación de eventos entre el mini sitio y los contenidos embebidos (contrato postMessage propuesto).', 'Herramienta de analítica y nomenclatura de eventos.', 'Responsables de actualizar productos, promociones y textos legales.'] },
  { grupo: 'Arquitectura', items: ['Dominio y nombre del segmento del mini sitio (hoy: /personas).', 'Nomenclatura definitiva de pasos y reglas de seguimiento por flujo.', 'Integración futura del portal de clientes de Zurich.'] },
];

/** @param {{ main: HTMLElement }} ctx */
export function render({ main }) {
  const inicial = PESTANAS.some((p) => `#${p.id}` === location.hash) ? location.hash.slice(1) : 'contenidos';
  main.innerHTML = `
  ${migas([{ texto: 'Configuración' }])}
  <section class="seccion seccion--compacta">
    <div class="contenedor">
      <div class="encabezado-seccion">
        <span class="antetitulo">Administración</span>
        <h1>Configuración</h1>
        <p>Decide qué ve el cliente, a dónde lleva cada integración y revisa lo que está pasando. Los cambios se guardan solos en este navegador.</p>
      </div>
      <div class="pestanas" role="tablist" aria-label="Secciones de configuración">
        ${PESTANAS.map((p) => `<button class="pestana" role="tab" id="tab-${p.id}" aria-controls="panel-${p.id}" aria-selected="${p.id === inicial}" tabindex="${p.id === inicial ? 0 : -1}" data-tab="${p.id}">${p.texto}<span class="contador" data-contador="${p.id}"></span></button>`).join('')}
      </div>
      ${PESTANAS.map((p) => `<div role="tabpanel" id="panel-${p.id}" aria-labelledby="tab-${p.id}" tabindex="0"${p.id === inicial ? '' : ' hidden'}></div>`).join('')}
    </div>
  </section>`;

  const pintar = () => {
    /** @type {HTMLElement} */ (main.querySelector('#panel-contenidos')).innerHTML = panelContenidos();
    /** @type {HTMLElement} */ (main.querySelector('#panel-solicitudes')).innerHTML = panelSolicitudes();
    /** @type {HTMLElement} */ (main.querySelector('#panel-medicion')).innerHTML = panelMedicion();
    /** @type {HTMLElement} */ (main.querySelector('#panel-pendientes')).innerHTML = panelPendientes();
    contadores(main);
  };
  pintar();

  /* Pestañas: clic y flechas, como pide el patrón de tablist. */
  const tabs = /** @type {HTMLElement[]} */ ([...main.querySelectorAll('[role="tab"]')]);
  const elegir = (/** @type {string} */ id, foco = false) => {
    tabs.forEach((t) => {
      const si = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(si)); t.tabIndex = si ? 0 : -1;
      /** @type {HTMLElement} */ (main.querySelector(`#panel-${t.dataset.tab}`)).hidden = !si;
      if (si && foco) t.focus();
    });
    history.replaceState(null, '', `#${id}`);
    registrar(`configuracion_click_pestana_${id}`);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => elegir(/** @type {string} */ (t.dataset.tab)));
    t.addEventListener('keydown', (e) => {
      const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (n === null) return;
      e.preventDefault();
      elegir(/** @type {string} */ (tabs[(n + tabs.length) % tabs.length].dataset.tab), true);
    });
  });

  /* Cambios en contenidos: se guardan al momento. */
  main.addEventListener('change', (e) => {
    const t = /** @type {HTMLInputElement} */ (e.target);
    const id = t.dataset.id;
    if (!id) return;
    if (t.dataset.campo === 'visible') guardarAjuste(id, { visible: t.checked });
    if (t.dataset.campo === 'embebido') guardarAjuste(id, { embebido: t.checked });
    if (t.dataset.campo === 'destino') {
      const valor = t.value.trim();
      const problema = validarDestino(valor);
      const aviso = /** @type {HTMLElement|null} */ (t.parentElement?.querySelector('.campo__error'));
      const caja = /** @type {HTMLElement|null} */ (t.closest('.campo'));
      if (problema) {
        if (caja) caja.dataset.estado = 'error';
        if (aviso) /** @type {HTMLElement} */ (aviso.querySelector('span')).textContent = problema;
        return;
      }
      if (caja) delete caja.dataset.estado;
      guardarAjuste(id, { destino: valor });
    }
    registrar('configuracion_rec_cambio', { campo: t.dataset.campo || '' });
    avisar('Cambios guardados');
    const abierta = main.querySelector('[role="tabpanel"]:not([hidden])')?.id;
    pintar();
    if (abierta) /** @type {HTMLElement} */ (main.querySelector(`#${abierta}`)).hidden = false;
  });

  /* Acciones: restablecer, descargas y borrados (con confirmación en dos pasos). */
  main.addEventListener('click', (e) => {
    const b = /** @type {HTMLElement|null} */ (e.target instanceof Element ? e.target.closest('[data-accion]') : null);
    if (!b) return;
    const accion = b.dataset.accion;
    if (b.dataset.confirmar && b.dataset.armado !== 'si') {
      b.dataset.armado = 'si';
      b.textContent = b.dataset.confirmar;
      setTimeout(() => { if (b.isConnected) { b.dataset.armado = ''; b.textContent = b.dataset.original || b.textContent; } }, 4000);
      return;
    }
    if (accion === 'restablecer') { restablecer(); avisar('Se restablecieron los valores de la propuesta'); }
    if (accion === 'borrar-solicitudes') { borrarSolicitudes(); avisar('Solicitudes borradas'); }
    if (accion === 'borrar-medicion') { borrarRegistros(); avisar('Registro de medición borrado'); }
    if (accion === 'csv-solicitudes') descargarCSV('solicitudes_asesoria.csv', [['fecha', 'producto', 'nombre', 'correo', 'celular', 'horario', 'comentario'], ...solicitudes().map((s) => [new Date(s.fecha).toISOString(), s.producto, s.nombre, s.correo, s.celular, s.horario, s.comentario])]);
    if (accion === 'csv-medicion') descargarCSV('registro_medicion.csv', [['fecha', 'evento', 'pagina', 'detalle'], ...registros().map((r) => [new Date(r.fecha).toISOString(), r.evento, r.pagina, JSON.stringify(r.detalle || {})])]);
    if (accion?.startsWith('csv')) return;
    const abierta = main.querySelector('[role="tabpanel"]:not([hidden])')?.id;
    pintar();
    if (abierta) /** @type {HTMLElement} */ (main.querySelector(`#${abierta}`)).hidden = false;
  });

  main.addEventListener('input', (e) => {
    const t = /** @type {HTMLInputElement} */ (e.target);
    if (t.id !== 'filtro-eventos') return;
    const q = t.value.trim().toLowerCase();
    main.querySelectorAll('#tabla-eventos tbody tr').forEach((tr) => {
      /** @type {HTMLElement} */ (tr).hidden = Boolean(q) && !(tr.textContent || '').toLowerCase().includes(q);
    });
  });
}

/** @param {string} url */
function validarDestino(url) {
  if (!url) return '';
  let u;
  try { u = new URL(url); } catch { return 'Escribe una dirección completa, que empiece con https://'; }
  if (u.protocol !== 'https:') return 'La dirección debe empezar con https://';
  if (!ORIGENES_PERMITIDOS.some((r) => r.test(u.hostname))) return 'Este dominio no está entre los orígenes permitidos (zurich.cl). Agregarlo exige actualizar la política de seguridad.';
  return '';
}

/** @param {HTMLElement} main */
function contadores(main) {
  const n = { solicitudes: solicitudes().length, medicion: registros().length, pendientes: totalPendientes(), contenidos: 0 };
  main.querySelectorAll('[data-contador]').forEach((c) => {
    const k = /** @type {keyof typeof n} */ (/** @type {HTMLElement} */ (c).dataset.contador);
    c.textContent = n[k] ? String(n[k]) : '';
    /** @type {HTMLElement} */ (c).hidden = !n[k];
  });
}

/* ---- Contenidos ------------------------------------------------------------ */

function panelContenidos() {
  const hoy = hoyISO();
  const promos = PROMOCIONES.map(producto).filter(Boolean).map((p) => {
    const pr = /** @type {any} */ (p).promocion;
    const a = ajuste(`promo:${pr.id}`);
    const estado = promoVigente(pr) ? '<span class="chip chip--exito">Vigente</span>' : (pr.desde && hoy < pr.desde ? '<span class="chip chip--info">Programada</span>' : '<span class="chip chip--aviso">Vencida · se muestra el producto sin la oferta</span>');
    return `<div class="fila-config">
      <div class="fila-config__nombre"><strong>${esc(pr.titulo)}</strong><small>${esc(p?.nombre)} · ${esc(pr.etiqueta)}</small><div class="chips">${estado}</div></div>
      <div class="fila-config__destino"><small class="texto-suave">${pr.desde ? `Desde el ${esc(fechaLarga(pr.desde))}` : ''}${pr.hasta ? ` hasta el ${esc(fechaLarga(pr.hasta))}` : ' · sin fecha de término'}</small></div>
      <div class="fila-config__controles">${interruptor(`promo:${pr.id}`, 'visible', a.visible, 'Visible en la portada')}</div>
    </div>`;
  }).join('');

  const fila = (/** @type {any} */ item, /** @type {boolean} */ integrable) => {
    const a = ajuste(item.id);
    const chips = [
      a.visible ? '<span class="chip chip--exito">Visible</span>' : '<span class="chip chip--aviso">Oculto para clientes</span>',
      integrable ? (a.embebido && a.destino ? '<span class="chip chip--info">Integración activa</span>' : '<span class="chip chip--neutro">Vista referencial</span>') : '<span class="chip chip--neutro">Con asesoría</span>',
      item.porValidar?.length ? `<span class="chip chip--aviso">${item.porValidar.length} por validar</span>` : '',
    ].join('');
    return `<div class="fila-config">
      <div class="fila-config__nombre"><strong><a href="${item.ruta}">${esc(item.nombre)}</a></strong><small>${esc(item.ruta)}</small><div class="chips">${chips}</div></div>
      <div class="fila-config__destino">
        ${integrable ? `<div class="campo"><label for="d-${item.id}" class="sr">Dirección de la herramienta a embeber</label>
          <input id="d-${item.id}" type="url" value="${esc(a.destino)}" data-id="${item.id}" data-campo="destino" placeholder="https://…" aria-describedby="de-${item.id}">
          <p class="campo__error" id="de-${item.id}">${icono('alerta')}<span></span></p></div>` : `<small class="texto-suave">Página de referencia: <a href="${esc(item.referencia)}" target="_blank" rel="noopener">${esc(item.referencia.replace('https://', ''))}</a></small>`}
      </div>
      <div class="fila-config__controles">
        ${interruptor(item.id, 'visible', a.visible, 'Visible para clientes')}
        ${integrable ? interruptor(item.id, 'embebido', a.embebido, 'Cargar dentro del sitio') : ''}
      </div>
    </div>`;
  };

  return `
  <div class="aviso aviso--info">${icono('info')}<div><strong>Regla del brief</strong>Lo que no tiene un destino activo se oculta en lugar de publicarse incompleto. «Cargar dentro del sitio» carga la herramienta oficial en un marco: si el dominio de origen no lo permite, el recuadro queda en blanco y es una condición a validar con Zurich.</div></div>
  <div class="grupo-config mt-6"><h2>Promociones de portada</h2><p>Una promoción vencida se retira sola: el carrusel muestra el producto sin la oferta.</p>${promos}</div>
  <div class="grupo-config"><h2>Seguros</h2><p>Los de contratación en línea cargan su cotizador; los de asesoría llevan a la solicitud de contacto.</p>${PRODUCTOS.map((p) => fila(p, p.modalidad === 'digital')).join('')}</div>
  <div class="grupo-config"><h2>Servicios en línea</h2><p>Acceso directo al trámite, sin página informativa intermedia.</p>${SERVICIOS.map((s) => fila(s, true)).join('')}</div>
  <div class="grupo-config"><h2>Secciones</h2>
    <div class="fila-config"><div class="fila-config__nombre"><strong><a href="${MUNDO_ZURICH.ruta}">${MUNDO_ZURICH.nombre}</a></strong><small>${MUNDO_ZURICH.ruta}</small></div><div class="fila-config__destino"><small class="texto-suave">Contenido oficial de zurich.cl/mundo-zurich.</small></div><div class="fila-config__controles">${interruptor(MUNDO_ZURICH.id, 'visible', ajuste(MUNDO_ZURICH.id).visible, 'Visible para clientes')}</div></div>
  </div>
  <div class="acciones">${hayCambios() ? '<span class="chip chip--info">Hay cambios respecto de la propuesta</span>' : ''}
    <button class="btn btn--fantasma btn--chico" type="button" data-accion="restablecer" data-confirmar="¿Seguro? Toca de nuevo para restablecer" data-original="Restablecer valores de la propuesta">Restablecer valores de la propuesta</button></div>`;
}

/** @param {string} id @param {string} campo @param {boolean} valor @param {string} texto */
function interruptor(id, campo, valor, texto) {
  return `<label class="interruptor"><input type="checkbox" role="switch" data-id="${esc(id)}" data-campo="${campo}"${valor ? ' checked' : ''}><span>${esc(texto)}</span></label>`;
}

/* ---- Solicitudes ----------------------------------------------------------- */

function panelSolicitudes() {
  const lista = solicitudes();
  if (!lista.length) return `<div class="vacio">${icono('personas')}<h2>Aún no hay solicitudes de asesoría</h2><p>Cuando un cliente pida asesoría para Oncológico Familiar Directo, Temporal Plus o Mi Vida + Salud, su solicitud aparecerá aquí.</p><a class="btn btn--linea" href="/personas/vida-y-salud/">Ver seguros con asesoría</a></div>`;
  return `<div class="aviso aviso--info">${icono('info')}<div><strong>Prototipo</strong>Las solicitudes se guardan en este navegador. En producción llegan al canal de agentes de Zurich.</div></div>
  <div class="tabla-envoltura mt-4"><table class="tabla">
    <caption>Solicitudes de asesoría (${lista.length})</caption>
    <thead><tr><th scope="col">Fecha</th><th scope="col">Seguro</th><th scope="col">Nombre</th><th scope="col">Contacto</th><th scope="col">Horario</th><th scope="col">Comentario</th></tr></thead>
    <tbody>${lista.map((s) => `<tr><td>${esc(new Date(s.fecha).toLocaleString('es-CL'))}</td><td>${esc(producto(s.producto)?.corto ?? s.producto)}</td><td>${esc(s.nombre)}</td><td>${esc(s.correo)}<br>+56 ${esc(s.celular)}</td><td>${s.horario === 'manana' ? 'Mañana' : 'Tarde'}</td><td>${esc(s.comentario || '—')}</td></tr>`).join('')}</tbody>
  </table></div>
  <div class="acciones mt-4"><button class="btn btn--linea btn--chico" type="button" data-accion="csv-solicitudes">${icono('descarga')} Descargar CSV</button>
  <button class="btn btn--fantasma btn--chico" type="button" data-accion="borrar-solicitudes" data-confirmar="¿Seguro? Toca de nuevo para borrar" data-original="Borrar solicitudes">Borrar solicitudes</button></div>`;
}

/* ---- Medición -------------------------------------------------------------- */

function panelMedicion() {
  const lista = registros();
  const reales = lista.filter((r) => !(r.detalle && r.detalle.simulado));
  const indicadores = CLAVES.map((c) => `<div class="indicador"><strong>${reales.filter((r) => r.evento.endsWith(c.sufijo)).length}</strong><span><b>${esc(c.titulo)}</b><br>${esc(c.ayuda)}</span></div>`).join('');
  return `
  <div class="encabezado-seccion"><h2 class="h-lg">Los cuatro eventos que responden la pregunta del negocio</h2><p>¿Cuántos clientes de Banco BICE pasan de mirar un seguro a contratarlo? Se cuentan en este navegador; las simulaciones para TI no suman.</p></div>
  <div class="indicadores">${indicadores}</div>
  <div class="caja caja--borde"><h3>Convención de nombres</h3><p><code>&lt;ámbito&gt;_&lt;verbo&gt;_&lt;objeto&gt;</code> con tres verbos: <strong>pag</strong> (se vio una página), <strong>click</strong> (la persona hizo algo) y <strong>rec</strong> (quedó registrado un resultado: inicio, avance de paso o fin de un flujo). Ningún evento lleva datos personales. Todos se envían a <code>window.dataLayer</code>, listos para la herramienta de analítica que se defina.</p></div>
  <div class="acciones mt-6">
    <div class="campo"><label for="filtro-eventos">Filtrar eventos</label><input id="filtro-eventos" type="search" placeholder="Ej.: auto_digital, rec, pag"></div>
  </div>
  ${lista.length ? `<div class="tabla-envoltura mt-4"><table class="tabla" id="tabla-eventos">
    <caption>Últimos ${Math.min(lista.length, 150)} de ${lista.length} eventos</caption>
    <thead><tr><th scope="col">Hora</th><th scope="col">Evento</th><th scope="col">Página</th><th scope="col">Detalle</th></tr></thead>
    <tbody>${lista.slice(0, 150).map((r) => `<tr><td>${esc(new Date(r.fecha).toLocaleTimeString('es-CL'))}</td><td><code>${esc(r.evento)}</code></td><td>${esc(r.pagina)}</td><td>${esc(Object.entries(r.detalle || {}).map(([k, v]) => `${k}: ${v}`).join(' · '))}</td></tr>`).join('')}</tbody>
  </table></div>` : `<div class="vacio mt-4">${icono('info')}<h2>Sin eventos registrados</h2><p>Navega por el sitio y vuelve: cada página, clic y flujo quedará aquí.</p></div>`}
  <div class="acciones mt-4"><button class="btn btn--linea btn--chico" type="button" data-accion="csv-medicion">${icono('descarga')} Descargar CSV</button>
  <button class="btn btn--fantasma btn--chico" type="button" data-accion="borrar-medicion" data-confirmar="¿Seguro? Toca de nuevo para borrar" data-original="Borrar registro">Borrar registro</button></div>`;
}

/* ---- Pendientes ------------------------------------------------------------ */

function totalPendientes() {
  return [...PRODUCTOS, ...SERVICIOS].reduce((n, x) => n + (/** @type {any} */ (x).porValidar?.length || 0), 0)
    + MUNDO_ZURICH.porValidar.length + ALIANZA.porValidar.length + DECISIONES.reduce((n, d) => n + d.items.length, 0);
}

function panelPendientes() {
  const bloque = (/** @type {string} */ titulo, /** @type {string[]} */ items, /** @type {string} */ enlace = '') => `<div class="caja caja--borde">
    <h3>${enlace ? `<a href="${enlace}">${esc(titulo)}</a>` : esc(titulo)}</h3><ul>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  return `
  <div class="aviso aviso--aviso">${icono('reloj')}<div><strong>${totalPendientes()} definiciones antes de producción</strong>Mientras exista un pendiente material, el trabajo no se declara terminado (brief, protocolo de revisión integral).</div></div>
  <h2 class="h-lg mt-6">Por contenido</h2>
  <div class="dos-columnas mt-4">
    ${[...PRODUCTOS, ...SERVICIOS].filter((x) => /** @type {any} */ (x).porValidar?.length).map((x) => bloque(x.nombre, /** @type {any} */ (x).porValidar, x.ruta)).join('')}
    ${bloque('Mundo Zurich', MUNDO_ZURICH.porValidar, MUNDO_ZURICH.ruta)}
    ${bloque('La alianza y avisos legales', ALIANZA.porValidar, '/alianza/')}
  </div>
  <h2 class="h-lg mt-8">Decisiones generales del brief</h2>
  <div class="dos-columnas mt-4">${DECISIONES.map((d) => bloque(d.grupo, d.items)).join('')}</div>`;
}

/** @param {string} nombre @param {string[][]} filas */
function descargarCSV(nombre, filas) {
  const csv = filas.map((f) => f.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  registrar('configuracion_rec_descarga', { archivo: nombre });
}
