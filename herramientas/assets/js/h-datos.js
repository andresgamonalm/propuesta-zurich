/* =====================================================================
   Hogar · Paso 1 · Datos de la persona
   ---------------------------------------------------------------------
   Es la misma pantalla que /herramientas/auto-digital/datos/ en el recorrido de auto, con el mismo
   marcado y los mismos componentes. Cambian dos cosas: para qué decimos
   que ocupamos el celular —aquí es el número de la asistencia de hogar,
   no el de la inspección del auto— y el texto de la cabecera.

   El cotizador de referencia pide RUT, celular y correo en el modal de
   entrada y vuelve a pedir celular y correo en el paso 3. Aquí se piden
   una vez.
   ===================================================================== */

import { CONSENTIMIENTO, formateaRut, rutValido } from './datos.js';
import { PRODUCTO } from './datos-hogar.js';
import {
  $, estadoHogar, guardarHogar, ev, montarComun, montarModal,
  pintarPasosHogar, validarFormulario, marcarDeBase, formateaCelular, correoDelSitio
} from './comun-hogar.js';

/* Este paso no exige nada: es el primero. Ver el comentario equivalente en
   p-datos.js; el RUT es un campo de esta pantalla y no un requisito que se
   pedía en otra. */

pintarPasosHogar('datos');
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
  const valor = estadoHogar.persona[clave];
  if (!valor) continue;
  input.value = clave === 'celular' ? formateaCelular(valor) : valor;
  if (estadoHogar.origen === 'base') marcarDeBase(campo);
}

/* Mismo criterio que en auto: si el RUT ya se ingresó, queda de solo
   lectura —cambiarlo aquí dejaría los datos precargados apuntando a otra
   persona—. Quien llega sin RUT lo escribe, y escribir un RUT de la base
   aquí NO precarga nada: eso necesita el segundo factor, y esta pantalla
   no lo pide. */
if (estadoHogar.rut) {
  /* El valor se queda en el formulario —oculto, pero puesto— porque de
     ahí lo leen la validación y el guardado. Lo que cambia es dónde se
     ve: un RUT que la persona ya escribió no necesita un campo de ancho
     completo recordándoselo. Va de texto junto al título, que es donde
     uno mira para confirmar que entró como quien creía. */
  campos.rut.input.value = formateaRut(estadoHogar.rut);
  campos.rut.input.readOnly = true;
  campos.rut.campo.hidden = true;

  const visto = $('#rut-visto');
  if (visto) {
    visto.textContent = `RUT ${formateaRut(estadoHogar.rut)}`;
    visto.hidden = false;
  }
} else {
  campos.rut.input.addEventListener('input', e => {
    const bruto = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    e.target.value = bruto.length > 1 ? formateaRut(bruto) : bruto;
  });
}

if (estadoHogar.origen === 'base') {
  const nombre = (estadoHogar.persona.nombres || '').split(' ')[0];
  $('#titulo-datos').textContent = `${nombre}, confirma tus datos`;
  $('#bajada-datos').textContent =
    'Los trajimos de nuestra base para que no los escribas de nuevo. Revisa que estén bien, corrige lo que quieras y seguimos.';
} else {
  $('#titulo-datos').textContent = 'Tus datos';
  $('#bajada-datos').textContent =
    'Cuatro datos y pasamos a tu vivienda. Cada uno dice para qué lo usamos, y no pedimos ninguno que no ocupemos.';
}

/* El correo con que entró al sitio, si todavía no hay otro. */
if (!campos.correo.input.value) campos.correo.input.value = correoDelSitio();

campos.celular.input.addEventListener('input', e => {
  e.target.value = formateaCelular(e.target.value);
});

/* ── Consentimiento ───────────────────────────────────────────────────
   La cláusula es la misma: es de la compañía, no del producto. */
const modal = montarModal('modal-consentimiento');
const casilla = $('#consentimiento');
casilla.checked = !!estadoHogar.consentimiento;

$('#cuerpo-consentimiento').innerHTML = `
  <p>${CONSENTIMIENTO.intro}</p>
  <p>${CONSENTIMIENTO.marco}</p>
  <ul>${CONSENTIMIENTO.finalidades.map(f => `<li>${f}</li>`).join('')}</ul>
  <p>${CONSENTIMIENTO.derechos}</p>
  <p>${CONSENTIMIENTO.prioridad}</p>`;

$('#abrir-consentimiento').addEventListener('click', e => {
  modal.abrir(e.currentTarget);
  ev('hogar_p1_pag_modal_consentimiento');
});
$('#aceptar-consentimiento').addEventListener('click', () => {
  casilla.checked = true;
  $('#pista-consentimiento').textContent = '';
  modal.cerrar();
  ev('hogar_p1_click_aceptar_consentimiento');
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

  /* La casilla NO detiene el paso, y antes sí lo hacía. La cláusula
     autoriza usos adicionales de los datos —comunicación comercial,
     perfilamiento, compartir dentro del grupo—; la cotización y la
     emisión se ejecutan por el contrato que la propia persona está
     pidiendo. Decirle «sin esto no podemos emitir la póliza» no era
     cierto, y además convertía la autorización en un peaje: un
     consentimiento que se marca para poder seguir no es libre.

     Lo único que cambia si no la marca es que no le escribimos para
     ayudarle a retomar. Eso ya estaba bien resuelto en abandono.js,
     que solo manda mensaje cuando `consentimiento` es verdadero. */
  $('#pista-consentimiento').style.color = '';
  $('#pista-consentimiento').textContent = casilla.checked ? ''
    : 'Seguimos igual. Sin tu autorización no te vamos a escribir si dejas la contratación a medias.';

  if (!ok) return;

  guardarHogar({
    persona: {
      nombres:   campos.nombres.input.value.trim(),
      apellidos: campos.apellidos.input.value.trim(),
      correo:    campos.correo.input.value.trim(),
      celular:   campos.celular.input.value.replace(/\D/g, '')
    },
    /* Lo que de verdad marcó, no un `true` fijo. Mientras la casilla era
       obligatoria para pasar, dar por hecho el sí era inofensivo porque
       no existía el otro camino. Desde que se puede avanzar sin marcarla,
       un `true` fijo le mandaría WhatsApp justamente a quien lo rechazó. */
    consentimiento: casilla.checked,
    rut: formateaRut(campos.rut.input.value.trim())
  });

  ev('hogar_p1_click_continuar');
  location.href = '/herramientas/hogar-facil-plus/vivienda/';
});


ev('hogar_p1_pag_datos_persona', { producto: 'hogar_facil_plus' });
void PRODUCTO;
