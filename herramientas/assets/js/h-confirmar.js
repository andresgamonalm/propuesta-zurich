/* =====================================================================
   Hogar · Paso 4 · Confirmación
   ---------------------------------------------------------------------
   Misma pantalla que /herramientas/auto-digital/confirmacion/ en auto, con el mismo componente de
   revisión en desplegables y la misma carta que gira.

   La frontera de qué se corrige aquí es la misma regla que allá: lo que
   NO mueve la prima se corrige en sitio; lo que sí la mueve vuelve a su
   pantalla, porque un precio se elige mirando los tres juntos.

   Y aquí se ve la otra diferencia con el cotizador de referencia: su
   paso 3 vuelve a pedir
   nombres, dos apellidos, fecha de nacimiento, sexo, celular y correo
   —cuatro de esos ya los había pedido en el modal de entrada— más dos
   fechas de vigencia. Son nueve campos. Aquí son dos.
   ===================================================================== */

import { formateaRut, rutValido } from './datos.js';
import { materialPorId, tipoViviendaPorId,
         ASISTENCIAS, DECLARACIONES } from './datos-hogar.js';
import {
  $, $$, estadoHogar, guardarHogar, ev, exigirHogar, montarComun,
  pintarPasosHogar, validarFormulario, escapar, formateaCelular,
  vigenciaAnual, fechaLarga
} from './comun-hogar.js';
import { cotizacionHogar, mesesActualesHogar, clp, ufTxt } from './cotizacion-hogar.js';

/* Sin el consentimiento entre los requisitos: ver h-vivienda.js. */
if (!exigirHogar('rut', 'persona', 'vivienda', 'monto', 'plan')) {
  throw new Error('faltan pasos');
}

pintarPasosHogar('confirmar');
montarComun();

const c = cotizacionHogar();

/* ── Revisión en desplegables ─────────────────────────────────────── */
function pintarRevision() {
  const p = estadoHogar.persona, v = estadoHogar.vivienda;
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
          ? `<a class="enlace js-ev" id="corregir-${id}" href="${url}" data-ev="hogar_p4_click_editar" data-seccion="${id}">${enlace}</a>`
          : `<button type="button" class="enlace js-ev" id="corregir-${id}" data-editar="${id}">${enlace}</button>`}
      </div>
    </details>`;

  const material = materialPorId(v.material);
  const tipo = tipoViviendaPorId(v.tipo);
  const direccion = `${v.direccion} ${v.numero}${v.depto ? ', ' + v.depto : ''}, ${v.comuna}`;

  $('#revision').innerHTML = [
    bloque({
      id: 'datos', abierto: true,
      icono: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      titulo: 'Tus datos', resumen: `${p.nombres} ${p.apellidos}`,
      url: null, enlace: 'Corregir mis datos',
      filas: dato('Nombre', p.nombres + ' ' + p.apellidos) +
             dato('RUT', estadoHogar.rut) +
             dato('Correo', p.correo) +
             dato('Celular', formateaCelular(p.celular))
    }),
    bloque({
      id: 'vivienda', abierto: false,
      icono: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
      titulo: 'Tu vivienda', resumen: `${tipo.rotulo} de ${v.m2} m² en ${v.comuna}`,
      url: '/herramientas/hogar-facil-plus/vivienda/', enlace: 'Corregir mi vivienda',
      filas: dato('Dirección', direccion) +
             dato('Región', v.region) +
             dato('Tipo', tipo.rotulo) +
             dato('Material', material.rotulo) +
             dato('Año de construcción', v.anio) +
             dato('Metros construidos', v.m2 + ' m²') +
             dato('Monto asegurado · estructura', ufTxt(c.montoEstructura)) +
             (c.plan.cubreContenido ? dato('Monto asegurado · contenido', ufTxt(c.montoContenido)) : '')
    }),
    bloque({
      id: 'plan', abierto: false,
      icono: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
      titulo: 'Tu plan', resumen: `${c.plan.corto} · ${clp(c.mensual)} al mes`,
      url: '/herramientas/hogar-facil-plus/planes/', enlace: 'Cambiar de plan',
      filas: dato('Plan', c.plan.nombre) +
             dato('Qué asegura', c.plan.materia) +
             dato('Deducible', c.deducibleUF + ' UF') +
             (c.plan.sinDeducibleEn.length ? dato('Sin deducible en', c.plan.sinDeducibleEn.join(', ')) : '') +
             dato('Asistencia', ASISTENCIAS[c.plan.asistencia].nombre) +
             dato('Prima mensual', clp(c.mensual))
    })
  ].join('');

  $$('#revision details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) ev('hogar_p4_click_abrir_revision', { seccion: d.id.replace('caja-', '') });
  }));
}
pintarRevision();

/* ── Corregir sin salir de la pantalla ────────────────────────────────
   Solo los datos de la persona: no mueven la prima. La vivienda y el
   plan vuelven a su pantalla, porque los dos la mueven. */
const CAMPOS_EDITABLES = {
  datos: [
    { id: 'ed-nombres',   rot: 'Nombres',   val: () => estadoHogar.persona.nombres },
    { id: 'ed-apellidos', rot: 'Apellidos', val: () => estadoHogar.persona.apellidos },
    { id: 'ed-correo',    rot: 'Correo',    val: () => estadoHogar.persona.correo, tipo: 'email' },
    { id: 'ed-celular',   rot: 'Celular',   val: () => formateaCelular(estadoHogar.persona.celular) }
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
      ${campos.map(f => `
        <div class="campo">
          <label class="campo__rotulo" for="${f.id}">${f.rot}</label>
          <div class="campo__caja">
            <input id="${f.id}" type="${f.tipo || 'text'}" size="1" value="${escapar(f.val() || '')}">
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
  ev('hogar_p4_click_editar', { seccion, modo: 'en_sitio' });
}

function guardarEdicion(seccion) {
  const error = txt => { $('#error-' + seccion).textContent = txt; return false; };
  $('#error-' + seccion).textContent = '';

  const nom = $('#ed-nombres').value.trim();
  const ape = $('#ed-apellidos').value.trim();
  const cor = $('#ed-correo').value.trim();
  const cel = $('#ed-celular').value.replace(/\D/g, '');
  if (nom.length < 2) return error('Escribe tus nombres.');
  if (ape.length < 2) return error('Escribe tus apellidos.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cor)) return error('Revisa tu correo: ahí te llega la póliza.');
  if (!/^(56)?9\d{8}$/.test(cel)) return error('Necesitamos nueve dígitos, partiendo por el 9.');

  guardarHogar({ persona: { ...estadoHogar.persona, nombres: nom, apellidos: ape, correo: cor, celular: cel } });
  ev('hogar_p4_rec_correccion', { seccion });
  pintarRevision();
  $('#caja-' + seccion).open = true;
}

$('#revision').addEventListener('click', e => {
  const b = e.target.closest('[data-editar]');
  if (b) { e.preventDefault(); abrirEdicion(b.dataset.editar); }
});

/* ── Sin franja de beneficio ─────────────────────────────────────────
   El piloto descubría aquí un beneficio de bienvenida. Hogar Fácil Plus
   no tiene una promoción publicada en zurich.cl, así que no hay nada que
   descubrir y la franja no se muestra. */
$('#franja-beneficio').hidden = true;

/* ── Los dos datos que faltan ─────────────────────────────────────────
   La vigencia es de hogar y no de auto: una póliza de hogar corre doce
   meses con fecha de inicio y de término escritas. El cotizador de
   referencia las muestra en su resumen y tiene razón. */
const hoy = new Date();
const iInicio = $('#inicio'), iNacimiento = $('#nacimiento');

const aISO = d => d.toISOString().slice(0, 10);
iInicio.min = aISO(hoy);
iInicio.max = aISO(new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate()));
iInicio.value = estadoHogar.vigencia?.inicio || aISO(hoy);

iNacimiento.max = aISO(new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()));
iNacimiento.value = estadoHogar.nacimiento || '';

function pintarVigencia() {
  const desde = iInicio.value ? new Date(iInicio.value + 'T12:00:00') : hoy;
  const vig = vigenciaAnual(desde, mesesActualesHogar() === 24 ? 2 : 1);
  $('#pista-vigencia').textContent = `Cubierto hasta el ${vig.terminoTxt}.`;
  return vig;
}
pintarVigencia();
iInicio.addEventListener('change', pintarVigencia);

/* ── Envío ────────────────────────────────────────────────────────── */
/* ── Quién paga ───────────────────────────────────────────────────────
   El titular casi siempre paga lo suyo, así que la opción viene elegida
   y la pregunta se responde sola para la mayoría. Cuando no, se piden
   dos datos y nada más: RUT y nombre de quien paga. */
const OPCIONES_PAGADOR = [
  { id: 'titular', rotulo: 'Sí, pago yo' },
  { id: 'otro',    rotulo: 'No, paga otra persona' }
];

const selPagador = $('#sel-pagador');
const cajaPagador = $('#datos-pagador');
const iPagRut = $('#pagador-rut'), iPagNombre = $('#pagador-nombre');

let quienPaga = estadoHogar.pagador?.quien || 'titular';
iPagRut.value = estadoHogar.pagador?.rut || '';
iPagNombre.value = estadoHogar.pagador?.nombre || '';

selPagador.innerHTML = OPCIONES_PAGADOR.map(o => `
  <button type="button" class="opcion-tarjeta js-ev" role="radio"
          data-pagador="${o.id}" aria-checked="${quienPaga === o.id}">
    <span>${o.rotulo}</span>
  </button>`).join('');

function pintarPagador() {
  $$('[data-pagador]', selPagador).forEach(x =>
    x.setAttribute('aria-checked', String(x.dataset.pagador === quienPaga)));
  cajaPagador.hidden = quienPaga !== 'otro';
}
pintarPagador();

selPagador.addEventListener('click', e => {
  const b = e.target.closest('[data-pagador]');
  if (!b) return;
  quienPaga = b.dataset.pagador || 'titular';
  pintarPagador();
  ev('hogar_p4_rec_pagador', { quien: quienPaga });
});

/* ── La declaración del riesgo ────────────────────────────────────────
   Tres afirmaciones y una casilla. Las otras nueve condiciones de
   asegurabilidad ya se comprobaron solas con la comuna, el año y el
   material; estas tres solo las sabe quien vive ahí.

   Esta casilla sí detiene el paso, al revés que la del consentimiento:
   aquella autoriza usos de datos, esta es la base del contrato. El
   artículo 524 del Código de Comercio pide declarar sinceramente lo que
   se pregunta, y una declaración que no se puede no dar no vale. Por eso
   hay salida: «alguna no se cumple» lleva a un ejecutivo. */
$('#lista-declaraciones').innerHTML =
  DECLARACIONES.map(d => `<li>${escapar(d.afirmativa)}</li>`).join('');

const casillaDeclaro = $('#declaro');
casillaDeclaro.checked = estadoHogar.declaraciones === true;

$('#no-cumplo').addEventListener('click', () => {
  ev('hogar_p4_click_no_cumplo');
  casillaDeclaro.checked = false;
  $('#pista-declaro').innerHTML =
    'Entonces esta vivienda la revisa un ejecutivo: con una de estas tres sin cumplir, la póliza no se puede emitir por este canal. ' +
    'Deja la cotización hasta aquí y te contactamos.';
});

$('#form-confirmar').addEventListener('submit', e => {
  e.preventDefault();

  const ok = validarFormulario([
    { campo: $('#c-nacimiento'), input: iNacimiento,
      valido: v => !!v && new Date(v) < new Date(iNacimiento.max),
      mensaje: 'Necesitamos tu fecha de nacimiento. El contratante tiene que ser mayor de edad.' },
    { campo: $('#c-inicio'), input: iInicio,
      valido: v => !!v && v >= iInicio.min && v <= iInicio.max,
      mensaje: 'Elige desde cuándo quieres estar cubierto. Puede ser hoy.' },
    ...(quienPaga === 'otro' ? [
      { campo: $('#c-pagador-rut'), input: iPagRut,
        valido: v => rutValido(v), mensaje: 'Escribe el RUT de quien paga, con guion y dígito verificador.' },
      { campo: $('#c-pagador-nombre'), input: iPagNombre,
        valido: v => v.trim().length >= 3, mensaje: 'Falta el nombre de quien paga.' }
    ] : [])
  ]);
  if (!ok) return;

  if (!casillaDeclaro.checked) {
    $('#pista-declaro').textContent =
      'Falta tu declaración sobre la vivienda. Sin ella no se puede emitir la póliza.';
    casillaDeclaro.focus();
    return;
  }

  const vig = pintarVigencia();
  guardarHogar({
    nacimiento: iNacimiento.value, vigencia: vig,
    declaraciones: true,
    pagador: quienPaga === 'otro'
      ? { quien: 'otro', rut: formateaRut(iPagRut.value), nombre: iPagNombre.value.trim() }
      : { quien: 'titular', rut: '', nombre: '' }
  });

  ev('hogar_p4_rec_vigencia', { inicio: vig.inicio });
  ev('hogar_p4_rec_declaracion', { declarado: true });
  ev('hogar_p4_click_continuar');
  location.href = '/herramientas/hogar-facil-plus/pago/';
});

ev('hogar_p4_pag_confirmacion', { producto: 'hogar_facil_plus' });
void fechaLarga;
