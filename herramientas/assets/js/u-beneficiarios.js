// @ts-check
/* =====================================================================
   Protección Urgencias · Paso 3 · Beneficiarios
   ---------------------------------------------------------------------
   Opcional. zurich.cl dice que se designan o modifican desde el Portal
   de Clientes, con su porcentaje de distribución: por eso «Después» es
   una respuesta válida y no un error, y es la opción marcada al llegar.

   Si se designan ahora: nombre, RUT, parentesco y porcentaje, hasta
   cuatro personas, y los porcentajes suman 100. Las reglas legales de
   designación no se redactan aquí: quedan por validar con Zurich.
   ===================================================================== */
import { rutValido, formateaRut } from './datos.js';
import { PARENTESCOS, MAX_BENEFICIARIOS, DESIGNAR_DESPUES, planPorId } from './datos-urgencias.js';
import { clp } from './datos.js';
import { $, $$, estadoU, guardarU, ev, exigirU, montarComun, pintarPasosU, escapar } from './comun-urgencias.js';
import { avisarFoco } from './marco.js';

if (!exigirU('persona', 'plan')) throw new Error('faltan pasos');

pintarPasosU('beneficiarios');
montarComun();

/** @type {{ nombre: string, rut: string, parentesco: string, porcentaje: number }[]} */
let lista = estadoU.beneficiarios.lista.length
  ? estadoU.beneficiarios.lista.map((b) => ({ ...b }))
  : [{ nombre: '', rut: '', parentesco: '', porcentaje: 100 }];
let designar = estadoU.beneficiarios.designar;

$('#despues').innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <span><strong>Puedes hacerlo después.</strong> ${escapar(DESIGNAR_DESPUES)}</span>`;

function marcarModo() {
  $$('[data-designar]').forEach((b) => b.setAttribute('aria-pressed', String((b.getAttribute('data-designar') === 'si') === designar)));
  /** @type {HTMLElement} */ ($('#bloque-lista')).hidden = !designar;
  /** @type {HTMLElement} */ ($('#despues')).hidden = designar;
  $('#error-beneficiarios').textContent = '';
}

/** Lee los campos a la lista, para no perder lo escrito al repintar. */
function leerCampos() {
  lista = lista.map((b, i) => ({
    nombre: /** @type {HTMLInputElement} */ ($(`#b-nombre-${i}`))?.value.trim() ?? b.nombre,
    rut: /** @type {HTMLInputElement} */ ($(`#b-rut-${i}`))?.value.trim() ?? b.rut,
    parentesco: /** @type {HTMLSelectElement} */ ($(`#b-parentesco-${i}`))?.value ?? b.parentesco,
    porcentaje: Number(/** @type {HTMLInputElement} */ ($(`#b-porcentaje-${i}`))?.value ?? b.porcentaje) || 0,
  }));
}

function pintarLista() {
  $('#lista-beneficiarios').innerHTML = lista.map((b, i) => `
    <li class="beneficiario">
      <div class="beneficiario__cabeza">
        <strong>Beneficiario</strong>
        ${lista.length > 1 ? `<button type="button" class="enlace" data-quitar="${i}">Quitar</button>` : ''}
      </div>
      <div class="beneficiario__campos">
        <div class="campo" id="c-b-nombre-${i}">
          <label class="campo__rotulo" for="b-nombre-${i}">Nombre completo</label>
          <div class="campo__caja"><input id="b-nombre-${i}" type="text" size="1" value="${escapar(b.nombre)}" autocomplete="off"></div>
          <p class="campo__pista"></p>
        </div>
        <div class="campo" id="c-b-rut-${i}">
          <label class="campo__rotulo" for="b-rut-${i}">RUT</label>
          <div class="campo__caja"><input id="b-rut-${i}" type="text" size="1" value="${escapar(b.rut)}" placeholder="12345678-9" maxlength="12" autocomplete="off"></div>
          <p class="campo__pista"></p>
        </div>
        <div class="campo" id="c-b-parentesco-${i}">
          <label class="campo__rotulo" for="b-parentesco-${i}">Parentesco</label>
          <div class="campo__caja campo__caja--select"><select id="b-parentesco-${i}">
            <option value="">Elige</option>
            ${PARENTESCOS.map((x) => `<option${x === b.parentesco ? ' selected' : ''}>${escapar(x)}</option>`).join('')}
          </select></div>
          <p class="campo__pista"></p>
        </div>
        <div class="campo campo--chico" id="c-b-porcentaje-${i}">
          <label class="campo__rotulo" for="b-porcentaje-${i}">Porcentaje</label>
          <div class="campo__caja"><input id="b-porcentaje-${i}" type="number" min="1" max="100" step="1" size="1" value="${b.porcentaje || ''}" inputmode="numeric"></div>
          <p class="campo__pista"></p>
        </div>
      </div>
    </li>`).join('');
  /** @type {HTMLButtonElement} */ ($('#agregar')).hidden = lista.length >= MAX_BENEFICIARIOS;
  pintarSuma();
}

function pintarSuma() {
  leerCampos();
  const suma = lista.reduce((n, b) => n + b.porcentaje, 0);
  $('#suma').textContent = `Suma: ${suma}% de 100%`;
  if (suma === 100) $('#error-beneficiarios').textContent = '';
}

$('#sel-designar').addEventListener('click', (e) => {
  const b = /** @type {Element} */ (e.target).closest('[data-designar]');
  if (!b) return;
  designar = b.getAttribute('data-designar') === 'si';
  marcarModo();
  ev('urgencias_p3_rec_designar', { designar });
});

$('#agregar').addEventListener('click', () => {
  leerCampos();
  const usado = lista.reduce((n, b) => n + b.porcentaje, 0);
  lista.push({ nombre: '', rut: '', parentesco: '', porcentaje: Math.max(0, 100 - usado) });
  pintarLista();
  /** @type {HTMLInputElement} */ ($(`#b-nombre-${lista.length - 1}`)).focus();
});

$('#lista-beneficiarios').addEventListener('click', (e) => {
  const b = /** @type {Element} */ (e.target).closest('[data-quitar]');
  if (!b) return;
  leerCampos();
  lista.splice(Number(b.getAttribute('data-quitar')), 1);
  pintarLista();
});
$('#lista-beneficiarios').addEventListener('input', (e) => {
  const t = /** @type {HTMLInputElement} */ (e.target);
  if (t.id.startsWith('b-rut-')) {
    const bruto = t.value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    t.value = bruto.length > 1 ? formateaRut(bruto) : bruto;
  }
  pintarSuma();
});

/** Marca un campo con error y devuelve false. @param {string} id @param {string} texto */
function error(id, texto) {
  const campo = /** @type {HTMLElement} */ ($('#c-' + id));
  campo.dataset.estado = 'error';
  const pista = campo.querySelector('.campo__pista');
  if (pista) pista.textContent = texto;
  return false;
}

$('#form-beneficiarios').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#error-beneficiarios').textContent = '';
  if (designar) {
    leerCampos();
    $$('.beneficiario .campo').forEach((c) => {
      delete /** @type {HTMLElement} */ (c).dataset.estado;
      const pista = c.querySelector('.campo__pista');
      if (pista) pista.textContent = '';
    });
    let ok = true;
    lista.forEach((b, i) => {
      if (b.nombre.length < 5) ok = error(`b-nombre-${i}`, 'Escribe nombre y apellido.');
      if (!rutValido(b.rut)) ok = error(`b-rut-${i}`, 'Revisa el RUT: no calza el dígito verificador.');
      if (!b.parentesco) ok = error(`b-parentesco-${i}`, 'Elige el parentesco.');
      if (!(b.porcentaje >= 1 && b.porcentaje <= 100)) ok = error(`b-porcentaje-${i}`, 'Entre 1 y 100.');
    });
    const suma = lista.reduce((n, b) => n + b.porcentaje, 0);
    if (ok && suma !== 100) {
      ok = false;
      $('#error-beneficiarios').textContent = `Los porcentajes suman ${suma}%: tienen que sumar 100%.`;
    }
    if (!ok) {
      const primero = /** @type {HTMLElement|null} */ ($('.beneficiario [data-estado="error"] input, .beneficiario [data-estado="error"] select')) || $('#error-beneficiarios');
      primero?.focus?.();
      avisarFoco(primero);
      return;
    }
  }
  guardarU({ beneficiarios: { designar, lista: designar ? lista.map((b) => ({ ...b, rut: formateaRut(b.rut) })) : [] } });
  ev('urgencias_p3_click_continuar', { designar, cuantos: designar ? lista.length : 0 });
  location.href = '/herramientas/proteccion-urgencias/pago/';
});

const plan = planPorId(estadoU.plan);
$('#barra-etiqueta').textContent = `${plan.nombre} · monto ${plan.monto}`;
$('#barra-precio').textContent = `${clp(plan.primaPesos)} al mes`;

marcarModo();
pintarLista();
ev('urgencias_p3_pag_beneficiarios', { producto: 'proteccion_urgencias' });
