/* =====================================================================
   Paso 1 · Datos de la persona
   ---------------------------------------------------------------------
   Lo que ya sabemos viene puesto y marcado como «lo trajimos nosotros».
   Cada campo que sí pedimos dice para qué lo pedimos: es la diferencia
   entre un formulario que interroga y uno que explica.
   ===================================================================== */

import { CONSENTIMIENTO, formateaRut, rutValido } from './datos.js';
import {
  $, $$, estado, guardar, ev, montarComun, montarModal,
  pintarPasos, validarFormulario, marcarDeBase, formateaCelular, correoDelSitio
} from './comun.js';

/* Este paso no exige nada: es el primero. Antes exigía un RUT en el estado
   y no lo pedía en ninguna parte, así que quien llegaba sin él —por el
   enlace del asistente para quien prefiere escribir sus datos— rebotaba al
   inicio. Ahora el RUT es un campo más de esta pantalla. */

pintarPasos('datos');
montarComun();

/* ── Pre-llenado ──────────────────────────────────────────────────── */
const campos = {
  rut:       { input: $('#rut'),       campo: $('#c-rut') },
  nombres:   { input: $('#nombres'),   campo: $('#c-nombres') },
  apellidos: { input: $('#apellidos'), campo: $('#c-apellidos') },
  correo:    { input: $('#correo'),    campo: $('#c-correo') },
  celular:   { input: $('#celular'),   campo: $('#c-celular') }
};

for (const [clave, { input, campo }] of Object.entries(campos)) {
  if (clave === 'rut') continue;
  const valor = estado.persona[clave];
  if (!valor) continue;
  input.value = clave === 'celular' ? formateaCelular(valor) : valor;
  if (estado.origen === 'base') marcarDeBase(campo);
}

/* El RUT viene del estado si se ingresó antes. En ese caso queda de solo
   lectura: cambiarlo aquí dejaría los datos precargados apuntando a otra
   persona. Quien llega sin RUT lo escribe.

   Y si el RUT que escribe está en la base, NO se precarga nada: eso es
   exactamente lo que la regla del segundo factor prohíbe. Mostrar el
   nombre de alguien a partir de solo su RUT necesita un dato más, y esta
   pantalla no lo pide. Quien quiera la precarga entra por la home o por
   el asistente, que sí lo piden. */
if (estado.rut) {
  /* El valor se queda en el formulario —oculto, pero puesto— porque de
     ahí lo leen la validación y el guardado. Lo que cambia es dónde se
     ve: un RUT que la persona ya escribió no necesita un campo de ancho
     completo recordándoselo. Va de texto junto al título, que es donde
     uno mira para confirmar que entró como quien creía. */
  campos.rut.input.value = formateaRut(estado.rut);
  campos.rut.input.readOnly = true;
  campos.rut.campo.hidden = true;

  const visto = $('#rut-visto');
  if (visto) {
    visto.textContent = `RUT ${formateaRut(estado.rut)}`;
    visto.hidden = false;
  }
} else {
  campos.rut.input.addEventListener('input', e => {
    const bruto = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    e.target.value = bruto.length > 1 ? formateaRut(bruto) : bruto;
  });
}

if (estado.origen === 'base') {
  const nombre = (estado.persona.nombres || '').split(' ')[0];
  $('#titulo-datos').textContent = `${nombre}, confirma tus datos`;
  $('#bajada-datos').textContent =
    'Los trajimos de nuestra base para que no los escribas de nuevo. Revisa que estén bien, corrige lo que quieras y seguimos.';
} else {
  $('#titulo-datos').textContent = 'Tus datos';
  $('#bajada-datos').textContent =
    'Cinco datos y pasamos a tu auto. Cada uno dice para qué lo usamos, y no pedimos ninguno que no ocupemos.';
}

/* El correo con que entró al sitio, si todavía no hay otro. */
if (!campos.correo.input.value) campos.correo.input.value = correoDelSitio();

campos.celular.input.addEventListener('input', e => {
  e.target.value = formateaCelular(e.target.value);
});


/* ── Consentimiento ───────────────────────────────────────────────── */
const modal = montarModal('modal-consentimiento');
const casilla = $('#consentimiento');
casilla.checked = !!estado.consentimiento;

$('#cuerpo-consentimiento').innerHTML = `
  <p>${CONSENTIMIENTO.intro}</p>
  <p>${CONSENTIMIENTO.marco}</p>
  <ul>${CONSENTIMIENTO.finalidades.map(f => `<li>${f}</li>`).join('')}</ul>
  <p>${CONSENTIMIENTO.derechos}</p>
  <p>${CONSENTIMIENTO.prioridad}</p>`;

$('#abrir-consentimiento').addEventListener('click', e => {
  modal.abrir(e.currentTarget);
  ev('auto_p1_pag_modal_consentimiento');
});
$('#aceptar-consentimiento').addEventListener('click', () => {
  casilla.checked = true;
  $('#pista-consentimiento').textContent = '';
  modal.cerrar();
  ev('auto_p1_click_aceptar_consentimiento');
});

/* ── Envío ────────────────────────────────────────────────────────── */
const correoValido = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
const celularValido = v => v.replace(/\D/g, '').replace(/^56/, '').length === 9;

$('#form-datos').addEventListener('submit', e => {
  e.preventDefault();

  const ok = validarFormulario([
    { campo: campos.rut.campo,       input: campos.rut.input,
      valido: rutValido, mensaje: 'Revisa tu RUT: no calza el dígito verificador.',
      pistaBase: 'Sin puntos y con guion.' },
    { campo: campos.nombres.campo,   input: campos.nombres.input,
      valido: v => v.length >= 2, mensaje: 'Escribe tu nombre.' },
    { campo: campos.apellidos.campo, input: campos.apellidos.input,
      valido: v => v.length >= 2, mensaje: 'Escribe tus apellidos.' },
    { campo: campos.correo.campo,    input: campos.correo.input,
      valido: correoValido, mensaje: 'Revisa tu correo: ahí te llega la póliza.' },
    { campo: campos.celular.campo,   input: campos.celular.input,
      valido: celularValido, mensaje: 'Necesitamos nueve dígitos, partiendo por el 9.' }
  ]);

  /* La casilla no detiene el paso. Mismo cambio y mismo motivo que en
     hogar; el razonamiento completo está en h-datos.js. */
  $('#pista-consentimiento').style.color = '';
  $('#pista-consentimiento').textContent = casilla.checked ? ''
    : 'Seguimos igual. Sin tu autorización no te vamos a escribir si dejas la contratación a medias.';

  if (!ok) return;

  guardar({
    persona: {
      nombres:   campos.nombres.input.value.trim(),
      apellidos: campos.apellidos.input.value.trim(),
      correo:    campos.correo.input.value.trim(),
      celular:   campos.celular.input.value.replace(/\D/g, ''),
      /* La comuna se dejó de pedir aquí: el domicilio completo se pide
         en el paso del vehículo, que es donde se ocupa. Si venía de la
         base se conserva, para no perder un dato que ya teníamos. */
      comuna:    estado.persona.comuna || ''
    },
    /* Lo que de verdad marcó, no un `true` fijo. Mismo motivo que en
       hogar; el razonamiento está en h-datos.js. */
    consentimiento: casilla.checked,
    rut: formateaRut(campos.rut.input.value.trim())
  });

  ev('auto_p1_click_continuar');
  location.href = '/herramientas/auto-digital/vehiculo/';
});

/* Sin barra de precio: en este paso todavía no se han visto los
   planes, así que cualquier cifra sería una que nadie eligió. La
   promoción va al costado, en el sitio. */

ev('auto_p1_pag_datos_dueno', { producto: 'auto_digital' });
void $$;
