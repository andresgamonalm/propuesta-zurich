/* =====================================================================
   Paso 4 · Confirmación
   ---------------------------------------------------------------------
   Dos trabajos a la vez, y ese es el punto:

   1. El cliente firma sus datos. Todo viene desde atrás y todo se puede
      corregir aquí mismo, sin volver a una pantalla anterior.
   2. Es el momento de máxima intención de compra: si hay promoción
      vigente (Zurich Days con 24 meses), la gift card se descubre aquí.
   ===================================================================== */

import { COMUNAS, COLORES_AUTO, patenteValida } from './datos.js';
import {
  $, $$, estado, guardar, ev, exigir, montarComun, pintarPasos,
  validarFormulario, autocompletar, escapar, pista, formateaCelular
} from './comun.js';
import { cotizacion, clp } from './cotizacion.js';

/* Sin el consentimiento entre los requisitos: ver p-vehiculo.js. */
if (!exigir('rut', 'persona', 'vehiculo', 'plan')) throw new Error('faltan pasos');

pintarPasos('confirmar');
montarComun();

const c = cotizacion();

/* ── Revisión en desplegables ─────────────────────────────────────────
   Los tres bloques eran tres cajas chicas, una al lado de la otra, con
   trece datos en letra pequeña. Ahora son desplegables: al llegar solo
   se abre el primero y los otros dos se abren si la persona quiere
   revisarlos. Cerrado, cada uno muestra su dato principal, que es lo que
   basta para saber si hay que abrirlo.

   Abrir uno no cierra los demás: si alguien quiere comparar dos, puede. */
function pintarRevision() {
  const p = estado.persona, v = estado.vehiculo;
  const dato = (rot, val) => `<div><dt>${rot}</dt><dd>${escapar(val || '—')}</dd></div>`;

  const bloque = ({ id, icono, titulo, resumen, url, enlace, filas, abierto }) => `
    <details class="revision__caja" id="caja-${id}"${abierto ? ' open' : ''}>
      <summary>
        ${icono}
        <span class="revision__titulo">${titulo}</span>
        <span class="revision__resumen">${escapar(resumen)}</span>
        <svg class="revision__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </summary>
      <div class="revision__cuerpo">
        <dl class="revision__lista">${filas}</dl>
        ${url
          ? `<a class="enlace js-ev" id="corregir-${id}" href="${url}" data-ev="auto_p4_click_editar" data-seccion="${id}">${enlace}</a>`
          : `<button type="button" class="enlace js-ev" id="corregir-${id}" data-editar="${id}">${enlace}</button>`}
      </div>
    </details>`;

  $('#revision').innerHTML = [
    bloque({
      id: 'datos', abierto: true,
      icono: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      titulo: 'Tus datos', resumen: `${p.nombres} ${p.apellidos}`,
      url: null, enlace: 'Corregir mis datos',
      filas: dato('Nombre', p.nombres + ' ' + p.apellidos) +
             dato('RUT', estado.rut) +
             dato('Correo', p.correo) +
             dato('Celular', formateaCelular(p.celular))
    }),
    bloque({
      id: 'vehiculo', abierto: false,
      icono: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5h14l2 5v3a2 2 0 0 1-2 2M7 17v2M17 17v2"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/></svg>',
      titulo: 'Tu auto', resumen: `${v.marca} ${v.modelo} ${v.anio} · ${v.patente}`,
      url: null, enlace: 'Corregir mi auto',
      filas: dato('Patente', v.patente) +
             dato('Marca y modelo', v.marca + ' ' + v.modelo) +
             dato('Año', v.anio) +
             dato('Color', v.color) +
             dato('Condición', v.nuevo ? 'Nuevo · sin inspección' : 'Usado · con inspección')
    }),
    bloque({
      id: 'plan', abierto: false,
      icono: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
      titulo: 'Tu plan', resumen: `${c.plan.nombre} · ${clp(c.mensual)} al mes`,
      url: '/herramientas/auto-digital/planes/', enlace: 'Cambiar de plan',
      filas: dato('Plan', c.plan.nombre) +
             dato('Deducible', c.deducible + ' UF') +
             dato('Prima mensual', clp(c.mensual)) +
             dato('Vigencia', c.meses === 24 ? 'Dos años, renovable' : 'Anual, renovable')
    })
  ].join('');

  /* Abrir un bloque es una señal de que algo no cuadra: vale medirlo. */
  $$('#revision details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) ev('auto_p4_click_abrir_revision', { seccion: d.id.replace('caja-', '') });
  }));
}
pintarRevision();

/* ── Corregir sin salir de la pantalla ────────────────────────────────
   Antes «Corregir» era un enlace que volvía dos pasos atrás y obligaba a
   recorrer el formulario de nuevo. Ahora abre los campos ahí mismo.

   El plan es la excepción y se queda con el enlace: cambiarlo cambia el
   precio, y el precio se elige mirando los tres juntos. Eso es la
   pantalla de planes, no un campo dentro de un desplegable.

   El auto tiene la misma frontera por dentro: patente, color y condición
   se corrigen aquí porque no mueven la prima; marca, modelo y año no,
   porque sí la mueven y habría que volver a mostrar los tres precios. */
const CAMPOS_EDITABLES = {
  datos: [
    { id: 'ed-nombres',   rot: 'Nombres',   val: () => estado.persona.nombres },
    { id: 'ed-apellidos', rot: 'Apellidos', val: () => estado.persona.apellidos },
    { id: 'ed-correo',    rot: 'Correo',    val: () => estado.persona.correo, tipo: 'email' },
    { id: 'ed-celular',   rot: 'Celular',   val: () => formateaCelular(estado.persona.celular) }
  ],
  vehiculo: [
    { id: 'ed-patente', rot: 'Patente', val: () => estado.vehiculo.patente },
    { id: 'ed-color',   rot: 'Color',   val: () => estado.vehiculo.color, opciones: COLORES_AUTO }
  ]
};

function abrirEdicion(seccion) {
  const caja = $('#caja-' + seccion);
  const cuerpo = $('.revision__cuerpo', caja);
  if (cuerpo.dataset.editando === 'true') return;
  cuerpo.dataset.editando = 'true';

  const campos = CAMPOS_EDITABLES[seccion];
  cuerpo.innerHTML = `
    <div class="revision__editor">
      ${campos.map(c => `
        <div class="campo">
          <label class="campo__rotulo" for="${c.id}">${c.rot}</label>
          <div class="campo__caja${c.opciones ? ' campo__caja--select' : ''}">
            ${c.opciones
              ? `<select id="${c.id}">${c.opciones.map(o => `<option${o === c.val() ? ' selected' : ''}>${o}</option>`).join('')}</select>`
              : `<input id="${c.id}" type="${c.tipo || 'text'}" size="1" value="${escapar(c.val() || '')}">`}
          </div>
          <p class="campo__pista"></p>
        </div>`).join('')}
    </div>
    <p class="campo__pista el-6" id="error-${seccion}"></p>
    <div class="revision__acciones">
      <button type="button" class="btn btn--fantasma btn--sm js-ev" id="cancelar-${seccion}">Cancelar</button>
      <button type="button" class="btn btn--primario btn--sm js-ev" id="guardar-${seccion}">Guardar</button>
    </div>`;

  $('#cancelar-' + seccion).addEventListener('click', () => { pintarRevision(); caja.open = true; });
  $('#guardar-' + seccion).addEventListener('click', () => guardarEdicion(seccion));
  ev('auto_p4_click_editar', { seccion, modo: 'en_sitio' });
}

function guardarEdicion(seccion) {
  const error = txt => { $('#error-' + seccion).textContent = txt; return false; };
  $('#error-' + seccion).textContent = '';

  if (seccion === 'datos') {
    const nom = $('#ed-nombres').value.trim();
    const ape = $('#ed-apellidos').value.trim();
    const cor = $('#ed-correo').value.trim();
    const cel = $('#ed-celular').value.replace(/\D/g, '');
    if (nom.length < 2)  return error('Escribe tus nombres.');
    if (ape.length < 2)  return error('Escribe tus apellidos.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cor)) return error('Revisa tu correo: ahí te llega la póliza.');
    if (!/^(56)?9\d{8}$/.test(cel)) return error('Necesitamos nueve dígitos, partiendo por el 9.');
    guardar({ persona: { ...estado.persona, nombres: nom, apellidos: ape, correo: cor, celular: cel } });
  } else {
    const pat = $('#ed-patente').value.trim().toUpperCase();
    if (!patenteValida(pat)) return error('Revisa la patente: cuatro letras y dos números, o dos y cuatro.');
    guardar({ vehiculo: { ...estado.vehiculo, patente: pat, color: $('#ed-color').value } });
  }

  ev('auto_p4_rec_correccion', { seccion });
  pintarRevision();
  $('#caja-' + seccion).open = true;
}

$('#revision').addEventListener('click', e => {
  const b = e.target.closest('[data-editar]');
  if (b) { e.preventDefault(); abrirEdicion(b.dataset.editar); }
});

/* ── Campos para emitir ───────────────────────────────────────────── */
/* «Tipo de domicilio» se eliminó del formulario: repetía lo que ya dice
   «N° casa o depto». El dato se sigue guardando en la póliza, deducido de
   ese mismo campo, para no perderlo. */
const tipoDesde = txt => /depto|departamento|of\.|oficina/i.test(txt) ? 'Departamento' : 'Casa';

const d = estado.domicilio;
$('#direccion').value = d.direccion || '';
$('#numero').value = d.numero || '';
$('#depto').value = d.depto || '';
$('#comuna-dom').value = d.comuna || estado.persona.comuna || '';
$('#motor').value = estado.vehiculo.motor || '';
$('#chasis').value = estado.vehiculo.chasis || '';

/* Sugeridor de direcciones. En producción esto es Google Places
   Autocomplete restringido a Chile; aquí resuelve contra la lista local
   para que el prototipo funcione sin clave de API. */
const CALLES = ['Avenida', 'Calle', 'Pasaje', 'Camino', 'Costanera'];
const DIRECCIONES = COMUNAS.flatMap(com => CALLES.map(t => `${t} ${com}`));
autocompletar($('#direccion'), DIRECCIONES.slice(0, 400), valor => {
  const com = COMUNAS.find(x => valor.endsWith(x));
  if (com && !$('#comuna-dom').value) $('#comuna-dom').value = com;
});
autocompletar($('#comuna-dom'), COMUNAS, () => pista($('#c-comuna-dom'), '', 'ok'));

/* ── La franja del beneficio, tapada ─────────────────────────────────
   Anunciar «Cupón de $50.000» de entrada gasta la sorpresa en una línea
   que nadie estaba esperando. Tapada, la franja hace una pregunta —«¿lo
   descubres?»— y la respuesta cuesta un clic.

   La carta se da vuelta de verdad, con rotación en 3D sobre las dos
   caras. Con movimiento reducido no gira: cambia de una a otra. */
const franja = $('#franja-beneficio');
const beneficio = { titular: c.promo.beneficio, detalle: `${c.promo.etiqueta}. ${c.promo.entrega}` };
/* Sin promoción no hay carta que dar vuelta. */
if (!c.promo.activa) franja.hidden = true;

franja.innerHTML = `
  <button type="button" class="carta js-ev" id="abrir-beneficio"
          aria-live="polite" aria-label="Descubre el beneficio de tu promoción">
    <span class="carta__giro">
      <span class="carta__cara carta__cara--tapa">
        <span class="carta__regalo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
        </span>
        <span class="carta__texto">
          <b>Tenemos un beneficio para ti</b>
          <em>Descúbrelo aquí</em>
        </span>
      </span>

      <span class="carta__cara carta__cara--fondo">
        <span class="carta__regalo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 13 4 4L19 7"/></svg>
        </span>
        <span class="carta__texto">
          <b>${escapar(beneficio.titular)}</b>
          <em>${escapar(beneficio.detalle)}</em>
        </span>
        <span class="carta__cinta">Incluido</span>
      </span>
    </span>
  </button>`;

$('#abrir-beneficio').addEventListener('click', () => {
  if (franja.dataset.abierto === 'true') return;
  franja.dataset.abierto = 'true';

  /* El giro lo hace la regla de CSS del atributo data-abierto. Esta
     línea lo repite en el estilo del elemento por una sola razón: si
     alguien llega con el beneficio ya revelado —volviendo del pago, por
     ejemplo— la carta tiene que estar dada vuelta sin animación previa,
     y el estilo en línea lo garantiza. */
  const giro = $('.carta__giro', franja);
  if (giro) giro.style.transform = 'rotateY(180deg)';

  ev('auto_p4_click_ver_beneficio');
  ev('auto_p4_rec_beneficio', { beneficio: c.promo.beneficio });
});

/* ── Envío ────────────────────────────────────────────────────────── */
$('#form-confirmar').addEventListener('submit', e => {
  e.preventDefault();

  const ok = validarFormulario([
    { campo: $('#c-motor'),  input: $('#motor'),
      valido: v => v.length >= 5, mensaje: 'Está en tu padrón y en el permiso de circulación.' },
    { campo: $('#c-chasis'), input: $('#chasis'),
      valido: v => v.length >= 5, mensaje: 'Está en tu padrón y en el permiso de circulación.' },
    { campo: $('#c-direccion'), input: $('#direccion'),
      valido: v => v.length >= 4, mensaje: 'Escribe tu calle o avenida.' },
    { campo: $('#c-numero'), input: $('#numero'),
      valido: v => /^\d+$/.test(v), mensaje: 'Solo el número.' },
    { campo: $('#c-comuna-dom'), input: $('#comuna-dom'),
      valido: v => COMUNAS.some(x => x.toLowerCase() === v.toLowerCase()),
      mensaje: 'Elige una comuna de la lista.' }
  ]);
  if (!ok) return;

  guardar({
    vehiculo: {
      ...estado.vehiculo,
      motor: $('#motor').value.trim().toUpperCase(),
      chasis: $('#chasis').value.trim().toUpperCase()
    },
    domicilio: {
      direccion: $('#direccion').value.trim(),
      numero: $('#numero').value.trim(),
      tipo: tipoDesde($('#depto').value),
      depto: $('#depto').value.trim(),
      comuna: $('#comuna-dom').value.trim()
    }
  });

  ev('auto_p4_rec_tipo_domicilio', { tipo: tipoDesde($('#depto').value) });
  ev('auto_p4_click_continuar');
  location.href = '/herramientas/auto-digital/pago/';
});

ev('auto_p4_pag_confirmacion', { producto: 'auto_digital' });
void $$;
