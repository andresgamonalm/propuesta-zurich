// @ts-check
/* =====================================================================
   Protección Urgencias · Paso 1 · Tus datos
   ---------------------------------------------------------------------
   El mismo formulario que Auto y Hogar, más la fecha de nacimiento, que
   va en la póliza. El correo llega puesto desde el sitio.
   ===================================================================== */
import { CONSENTIMIENTO, formateaRut, rutValido } from './datos.js';
import { montarDatosPrueba } from './datos-prueba.js';
import {
  $, estadoU, guardarU, ev, montarComun, montarModal, pintarPasosU,
  validarFormulario, formateaCelular, correoDelSitio, escapar, edadDe
} from './comun-urgencias.js';

pintarPasosU('datos');
montarComun();
montarDatosPrueba('#rut-ejemplos', { patentes: false });

const i = (/** @type {string} */ id) => /** @type {HTMLInputElement} */ ($('#' + id));
const c = (/** @type {string} */ id) => /** @type {HTMLElement} */ ($('#c-' + id));

/* ── Lo que ya hay ─────────────────────────────────────────────────── */
const p = estadoU.persona;
i('rut').value = estadoU.rut ? formateaRut(estadoU.rut) : '';
i('nombres').value = p.nombres;
i('apellidos').value = p.apellidos;
i('correo').value = p.correo || correoDelSitio();
i('celular').value = p.celular ? formateaCelular(p.celular) : '';
i('nacimiento').value = estadoU.nacimiento;

/* La fecha no puede ser futura: el selector del navegador lo respeta. */
i('nacimiento').max = new Date().toISOString().slice(0, 10);

i('rut').addEventListener('input', (e) => {
  const t = /** @type {HTMLInputElement} */ (e.target);
  const bruto = t.value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
  t.value = bruto.length > 1 ? formateaRut(bruto) : bruto;
});
i('celular').addEventListener('input', (e) => {
  const t = /** @type {HTMLInputElement} */ (e.target);
  t.value = formateaCelular(t.value);
});

/* ── Consentimiento: el mismo de Auto y Hogar, opcional ──────────────── */
const modal = montarModal('modal-consentimiento');
const casilla = i('consentimiento');
casilla.checked = !!estadoU.consentimiento;
$('#cuerpo-consentimiento').innerHTML = `
  <p>${escapar(CONSENTIMIENTO.intro)}</p>
  <p>${escapar(CONSENTIMIENTO.marco)}</p>
  <ul>${CONSENTIMIENTO.finalidades.map((f) => `<li>${escapar(f)}</li>`).join('')}</ul>
  <p>${escapar(CONSENTIMIENTO.derechos)}</p>
  <p>${escapar(CONSENTIMIENTO.prioridad)}</p>
  <p class="el-8">Texto por validar con el área legal de Zurich.</p>`;
$('#abrir-consentimiento').addEventListener('click', (e) => {
  modal.abrir(/** @type {HTMLElement} */ (e.currentTarget));
  ev('urgencias_p1_pag_modal_consentimiento');
});
$('#aceptar-consentimiento').addEventListener('click', () => {
  casilla.checked = true;
  modal.cerrar();
  ev('urgencias_p1_click_aceptar_consentimiento');
});

/* ── Envío ─────────────────────────────────────────────────────────── */
$('#form-datos').addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = validarFormulario([
    { campo: c('rut'), input: i('rut'), valido: rutValido,
      mensaje: 'Revisa tu RUT: no calza el dígito verificador.', pistaBase: 'Sin puntos y con guion.' },
    { campo: c('nacimiento'), input: i('nacimiento'), valido: (v) => edadDe(v) >= 18,
      mensaje: 'Revisa la fecha: el contratante tiene que ser mayor de edad.' },
    { campo: c('nombres'), input: i('nombres'), valido: (v) => v.length >= 2, mensaje: 'Escribe tu nombre.' },
    { campo: c('apellidos'), input: i('apellidos'), valido: (v) => v.length >= 2, mensaje: 'Escribe tus apellidos.' },
    { campo: c('celular'), input: i('celular'), valido: (v) => v.replace(/\D/g, '').replace(/^56/, '').length === 9,
      mensaje: 'Necesitamos nueve dígitos, partiendo por el 9.' },
    { campo: c('correo'), input: i('correo'), valido: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v),
      mensaje: 'Revisa tu correo: ahí te llega la póliza.' },
  ]);
  if (!ok) return;

  guardarU({
    rut: formateaRut(i('rut').value.trim()),
    nacimiento: i('nacimiento').value,
    persona: {
      nombres: i('nombres').value.trim(),
      apellidos: i('apellidos').value.trim(),
      correo: i('correo').value.trim(),
      celular: i('celular').value.replace(/\D/g, ''),
    },
    consentimiento: casilla.checked,
  });
  ev('urgencias_p1_click_continuar');
  location.href = '/herramientas/proteccion-urgencias/planes/';
});

ev('urgencias_p1_pag_datos', { producto: 'proteccion_urgencias' });
