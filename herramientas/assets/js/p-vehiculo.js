/* =====================================================================
   Paso 2 · Vehículo
   ---------------------------------------------------------------------
   La patente es el atajo: con seis caracteres completamos marca, modelo
   y año. Es el único campo de esta pantalla que el cliente escribe si
   el auto está en la base.
   ===================================================================== */

import {
  MARCAS, modelosDe, COLORES_AUTO, buscaPorPatente,
  patenteValida, formateaPatente, normalizaPatente
} from './datos.js';
import {
  $, $$, estado, guardar, ev, exigir, montarComun,
  pintarPasos, validarFormulario, marcarDeBase, desmarcarDeBase, pista
} from './comun.js';

/* El consentimiento ya no está entre los requisitos para entrar: la
   cláusula autoriza usos adicionales de los datos, no la cotización.
   Mismo cambio y mismo motivo que en hogar; ver h-vivienda.js. */
if (!exigir('rut', 'persona')) throw new Error('faltan pasos');

pintarPasos('vehiculo');
montarComun();

const elMarca = $('#marca'), elModelo = $('#modelo'), elAnio = $('#anio'), elColor = $('#color');
const elPatente = $('#patente');

/* ── Catálogos ────────────────────────────────────────────────────── */
const ANIOS = [];
for (let a = 2026; a >= 2010; a--) ANIOS.push(a);

const opciones = (el, lista, vacio) => {
  el.innerHTML = (vacio ? `<option value="">${vacio}</option>` : '') +
    lista.map(v => `<option value="${v}">${v}</option>`).join('');
};

opciones(elMarca, MARCAS, 'Elige tu marca');
opciones(elAnio, ANIOS, 'Elige el año');
opciones(elColor, COLORES_AUTO, 'Elige el color');
opciones(elModelo, [], 'Primero elige la marca');

function refrescaModelos(seleccionar) {
  const lista = elMarca.value ? modelosDe(elMarca.value) : [];
  opciones(elModelo, lista, lista.length ? 'Elige tu modelo' : 'Primero elige la marca');
  if (seleccionar && lista.includes(seleccionar)) elModelo.value = seleccionar;
}

elMarca.addEventListener('change', () => {
  refrescaModelos();
  desmarcarDeBase($('#c-marca'));
  desmarcarDeBase($('#c-modelo'));
});

/* ── Auto nuevo ───────────────────────────────────────────────────────
   Pastilla en vez de dos tarjetas. El estado vive en aria-pressed, que es
   lo que además lee un lector de pantalla. */
const selNuevo = $('#sel-nuevo');

function marcaNuevo(valor) {
  $$('[data-nuevo]', selNuevo).forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.nuevo === valor)));
}

selNuevo.addEventListener('click', e => {
  const b = e.target.closest('[data-nuevo]');
  if (!b) return;
  marcaNuevo(b.dataset.nuevo);
  ev('auto_p2_rec_auto_nuevo', { auto_nuevo: b.dataset.nuevo });
});

marcaNuevo(estado.vehiculo.nuevo ? 'si' : 'no');

/* ── Patente: el atajo ────────────────────────────────────────────── */
const cargando = $('#patente-cargando');
let ultimaBuscada = '';

elPatente.addEventListener('input', () => {
  elPatente.value = formateaPatente(elPatente.value);
  delete $('#c-patente').dataset.estado;

  const limpia = normalizaPatente(elPatente.value);
  if (limpia.length < 6 || limpia === ultimaBuscada) return;
  ultimaBuscada = limpia;
  if (!patenteValida(limpia)) return;

  cargando.hidden = false;
  // Latencia simulada: en producción es la consulta al registro.
  setTimeout(() => {
    cargando.hidden = true;
    const c = buscaPorPatente(limpia);
    if (!c) {
      pista($('#c-patente'), 'No la encontramos. Completa marca, modelo y año a mano.', null);
      return;
    }
    elMarca.value = c.marca;
    refrescaModelos(c.modelo);
    elAnio.value = String(c.anio);
    ['#c-marca', '#c-modelo', '#c-anio'].forEach(s => marcarDeBase($(s)));
    pista($('#c-patente'), `Es un ${c.marca} ${c.modelo} ${c.anio}. Si no es tu auto, cámbialo abajo.`, 'ok');
    ev('auto_p2_rec_patente_reconocida', { reconocida: true });
  }, 520);
});

/* ── Valores guardados ────────────────────────────────────────────── */
const v = estado.vehiculo;
if (v.patente) { elPatente.value = formateaPatente(v.patente); ultimaBuscada = normalizaPatente(v.patente); }
if (v.marca)  { elMarca.value = v.marca; refrescaModelos(v.modelo); }
if (v.anio)   elAnio.value = String(v.anio);
if (v.color)  elColor.value = v.color;

if (estado.origen === 'base' && v.marca) {
  ['#c-patente', '#c-marca', '#c-modelo', '#c-anio'].forEach(s => marcarDeBase($(s)));
  pista($('#c-patente'), 'La trajimos de tu registro. Si cambiaste de auto, escríbela de nuevo.', 'ok');
}

/* ── Envío ────────────────────────────────────────────────────────── */
$('#form-vehiculo').addEventListener('submit', e => {
  e.preventDefault();

  const ok = validarFormulario([
    { campo: $('#c-patente'), input: elPatente,
      valido: patenteValida,
      mensaje: 'Revisa la patente: cuatro letras y dos números, o dos letras y cuatro números.' },
    { campo: $('#c-marca'),  input: elMarca,  valido: x => !!x, mensaje: 'Elige la marca.' },
    { campo: $('#c-modelo'), input: elModelo, valido: x => !!x, mensaje: 'Elige el modelo.' },
    { campo: $('#c-anio'),   input: elAnio,   valido: x => !!x, mensaje: 'Elige el año.' },
    { campo: $('#c-color'),  input: elColor,  valido: x => !!x, mensaje: 'Elige el color.' }
  ]);
  if (!ok) return;

  const nuevo = $('[data-nuevo][aria-pressed="true"]', selNuevo)?.dataset.nuevo === 'si';

  guardar({
    vehiculo: {
      ...estado.vehiculo,
      nuevo,
      patente: normalizaPatente(elPatente.value),
      marca: elMarca.value,
      modelo: elModelo.value,
      anio: Number(elAnio.value),
      color: elColor.value
    }
  });

  ev('auto_p2_rec_marca',  { marca: elMarca.value });
  ev('auto_p2_rec_modelo', { modelo: elModelo.value });
  ev('auto_p2_rec_ano',    { ano: Number(elAnio.value) });
  ev('auto_p2_click_continuar');
  location.href = '/herramientas/auto-digital/planes/';
});

/* ── Lateral y barra ──────────────────────────────────────────────── */
function refrescaLateral() {
  /* Sin precio en esta pantalla: los planes se ven en el paso
     siguiente, así que cualquier cifra sería una que nadie eligió. */
}
[elMarca, elModelo, elAnio].forEach(el => el.addEventListener('change', () => {
  guardar({ vehiculo: { ...estado.vehiculo, marca: elMarca.value, modelo: elModelo.value, anio: Number(elAnio.value) || null } });
  refrescaLateral();
}));
refrescaLateral();

ev('auto_p2_pag_datos_vehiculo', { producto: 'auto_digital' });
