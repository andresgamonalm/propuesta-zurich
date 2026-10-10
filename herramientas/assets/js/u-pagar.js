// @ts-check
/* =====================================================================
   Protección Urgencias · Paso 4 · Pago
   ---------------------------------------------------------------------
   La misma secuencia que Auto y Hogar, que es la del cotizador real:
   día de cargo → contratos → firma digital → pagar. Aquí no hay cuotas:
   la prima es mensual y se cobra cada mes.
   ===================================================================== */
import { clp } from './datos.js';
import { PRODUCTO, ENTIDAD, planPorId, NOTA_PRECIO, ufPublicada } from './datos-urgencias.js';
import {
  $, $$, estadoU, guardarU, ev, exigirU, montarComun, montarModal, pintarPasosU,
  validarFormulario, escapar, fechaLarga
} from './comun-urgencias.js';

if (!exigirU('persona', 'plan')) throw new Error('faltan pasos');

pintarPasosU('pagar');
montarComun();

const plan = planPorId(estadoU.plan);
const modal = montarModal('modal-documento');
const paso = { modalidad: false, contratos: false, firmado: false };
const elDia = /** @type {HTMLSelectElement} */ ($('#dia'));

elDia.innerHTML = '<option value="">Elige un día</option>' + [1, 5, 10, 15, 20, 25]
  .map((d) => `<option value="${d}"${String(d) === String(estadoU.pago.diaCargo) ? ' selected' : ''}>Día ${d} de cada mes</option>`).join('');
/** @type {HTMLInputElement} */ ($('#rut-firma')).value = estadoU.rut;

/* ── Boleta ────────────────────────────────────────────────────────── */
const b = estadoU.beneficiarios;
$('#boleta').innerHTML = `
  <div class="boleta__cabeza">
    <div>
      <h3>${escapar(PRODUCTO)} · ${escapar(plan.nombre)}</h3>
      <span>${escapar(estadoU.persona.nombres)} ${escapar(estadoU.persona.apellidos)} · RUT ${escapar(estadoU.rut)}</span>
    </div>
    <span>Cobertura desde la contratación · ${fechaLarga()}</span>
  </div>
  <div class="boleta__cuerpo">
    <div class="boleta__linea"><span>Monto asegurado por fallecimiento</span><strong>${escapar(plan.monto)}</strong></div>
    <div class="boleta__linea"><span>Acto quirúrgico por urgencia</span><strong>${escapar(plan.urgencia)}</strong></div>
    <div class="boleta__linea"><span>Sala de urgencia y descuentos en farmacias</span><strong>Incluidos</strong></div>
    <div class="boleta__linea"><span>Beneficiarios</span><strong>${b.designar ? b.lista.map((x) => `${escapar(x.nombre)} (${x.porcentaje}%)`).join(', ') : 'Por designar en el Portal de Clientes'}</strong></div>
    <div class="boleta__total">
      <span>Prima mensual referencial · ${ufPublicada(plan.primaUF)}</span>
      <strong>${clp(plan.primaPesos)}*</strong>
    </div>
    <p class="boleta__nota">${escapar(NOTA_PRECIO)}</p>
  </div>`;
$('#valor-cuota').textContent = `${clp(plan.primaPesos)}*`;
$('#valor-cuota-uf').textContent = `${ufPublicada(plan.primaUF)} al mes.`;
$('#barra-precio').textContent = `${clp(plan.primaPesos)} al mes`;

/* ── Contratos ─────────────────────────────────────────────────────── */
const CONTRATOS = [
  { id: 'propuesta', titulo: 'Propuesta de seguro', bajada: 'Tu plan, tu prima y tus beneficiarios.', dependeDeModalidad: true },
  { id: 'condiciones', titulo: 'Condiciones generales y cláusulas adicionales', bajada: 'Los textos depositados en la CMF que rigen tu póliza.', dependeDeModalidad: false },
  { id: 'privacidad', titulo: 'Aviso de privacidad', bajada: 'Cómo se tratan tus datos y qué derechos tienes.', dependeDeModalidad: false },
];
const vistos = new Set();
const ICONO = {
  visto: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>',
  bloqueado: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  pendiente: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
};

function pintarContratos() {
  $('#contratos').innerHTML = CONTRATOS.map((c) => {
    const bloqueado = c.dependeDeModalidad && !paso.modalidad;
    const visto = vistos.has(c.id);
    const estado = bloqueado ? 'bloqueado' : visto ? 'visto' : 'pendiente';
    return `<li class="contrato" data-estado="${estado}">
      <span class="contrato__icono" aria-hidden="true">${ICONO[estado]}</span>
      <span class="contrato__texto"><strong>${c.titulo}</strong>
        <span>${bloqueado ? 'Elige el día de cargo para habilitarlo.' : visto ? 'Revisado' : c.bajada}</span></span>
      <button class="btn ${visto ? 'btn--fantasma' : 'btn--linea'} btn--sm" type="button" id="ver-documento-${c.id}" data-doc="${c.id}"${bloqueado ? ' aria-disabled="true"' : ''}>${visto ? 'Ver de nuevo' : 'Ver documento'}</button>
    </li>`;
  }).join('');
  $$('[data-doc]').forEach((boton) => boton.addEventListener('click', () => {
    if (boton.getAttribute('aria-disabled') === 'true') return;
    abrirDocumento(/** @type {HTMLElement} */ (boton).dataset.doc || '', /** @type {HTMLElement} */ (boton));
  }));
}

/** @param {string} id @param {HTMLElement} origen */
function abrirDocumento(id, origen) {
  const doc = CONTRATOS.find((x) => x.id === id);
  if (!doc) return;
  const p = estadoU.persona;
  const cuerpos = {
    propuesta: `
      <p><strong class="el-7">Asegurado.</strong> ${escapar(p.nombres)} ${escapar(p.apellidos)}, RUT ${escapar(estadoU.rut)}, nacido el ${escapar(estadoU.nacimiento)}.</p>
      <p><strong class="el-7">Plan.</strong> ${escapar(plan.nombre)}: fallecimiento, muerte accidental e invalidez accidental ${escapar(plan.monto)}; acto quirúrgico por urgencia ${escapar(plan.urgencia)}; sala de urgencia y descuentos en farmacias.</p>
      <p><strong class="el-7">Beneficiarios.</strong> ${b.designar ? b.lista.map((x) => `${escapar(x.nombre)}, RUT ${escapar(x.rut)}, ${escapar(x.parentesco.toLowerCase())}, ${x.porcentaje}%`).join('; ') : 'Por designar desde el Portal de Clientes'}.</p>
      <p><strong class="el-7">Prima.</strong> ${clp(plan.primaPesos)} mensuales (${ufPublicada(plan.primaUF)}), con cargo el día ${escapar(elDia.value || '—')} de cada mes. ${escapar(NOTA_PRECIO)}</p>`,
    condiciones: `
      <p>La Compañía que asegura el riesgo es ${escapar(ENTIDAD)}. Condiciones generales y cláusulas adicionales incorporadas en el Depósito de Pólizas de la Comisión para el Mercado Financiero.</p>`,
    privacidad: `
      <p>Zurich trata tus datos para cotizar, emitir y administrar tu póliza, y para cumplir obligaciones legales y regulatorias. Con tu consentimiento, también para los usos que describe la cláusula de consentimiento.</p>
      <p><strong class="el-7">Tus derechos.</strong> Puedes acceder a tus datos, corregirlos, cancelarlos, oponerte a su uso o trasladarlos, en virtud de la ley o según corresponda.</p>`,
  };
  $('#tit-doc').textContent = doc.titulo;
  $('#cuerpo-documento').innerHTML = cuerpos[/** @type {'propuesta'|'condiciones'|'privacidad'} */ (id)] +
    '<p class="el-8">Documento de demostración. En producción es el PDF que genera el sistema de emisión; los textos legales se validan con Zurich.</p>';
  modal.abrir(origen);
  ev('urgencias_p4_click_ver_documento', { documento: id });
  vistos.add(id);
  revisarSecuencia();
}

function revisarSecuencia() {
  paso.modalidad = !!elDia.value;
  const requeridos = CONTRATOS.filter((c) => !c.dependeDeModalidad || paso.modalidad).map((c) => c.id);
  paso.contratos = paso.modalidad && requeridos.every((id) => vistos.has(id));
  pintarContratos();
  /** @type {HTMLElement} */ ($('#bloque-firma')).classList.toggle('bloque-apagado', !paso.contratos);
  /** @type {HTMLInputElement} */ ($('#cedula')).disabled = !paso.contratos;
  $('#validar').setAttribute('aria-disabled', String(!paso.contratos || paso.firmado));
  $('#btn-pagar').setAttribute('aria-disabled', String(!paso.firmado));
}

elDia.addEventListener('change', () => {
  guardarU({ pago: { diaCargo: elDia.value } });
  vistos.delete('propuesta');
  ev('urgencias_p4_rec_dia_cargo', { dia: elDia.value });
  revisarSecuencia();
});

$('#validar').addEventListener('click', () => {
  const btn = $('#validar');
  if (btn.getAttribute('aria-disabled') === 'true') return;
  const ok = validarFormulario([{ campo: '#c-cedula', input: '#cedula',
    valido: (v) => /^\d{8,10}$/.test(v.replace(/\D/g, '')),
    mensaje: 'Son los nueve dígitos del frente de tu cédula, arriba a la derecha.', pistaBase: 'Nueve dígitos, sin puntos.' }]);
  if (!ok) return;
  btn.setAttribute('aria-disabled', 'true');
  btn.textContent = 'Validando…';
  setTimeout(() => {
    paso.firmado = true;
    btn.textContent = 'Validado';
    /** @type {HTMLInputElement} */ ($('#cedula')).readOnly = true;
    /** @type {HTMLElement} */ ($('#firma-ok')).hidden = false;
    $('#firma-sello').textContent = `Firmada el ${fechaLarga()} por ${estadoU.persona.nombres} ${estadoU.persona.apellidos}, RUT ${estadoU.rut}.`;
    ev('urgencias_p4_rec_firma', { firmado: true });
    revisarSecuencia();
  }, 900);
});

$('#form-pago').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!paso.modalidad) {
    validarFormulario([{ campo: '#c-dia', input: '#dia', valido: () => false, mensaje: 'Elige el día en que se cobra la prima.' }]);
    return;
  }
  if (!paso.contratos) { $('#contratos').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  if (!paso.firmado) {
    validarFormulario([{ campo: '#c-cedula', input: '#cedula', valido: () => false, mensaje: 'Valida el número de tu cédula para firmar la propuesta.' }]);
    return;
  }
  const boton = $('#btn-pagar');
  boton.setAttribute('aria-disabled', 'true');
  boton.textContent = 'Conectando con Webpay…';
  ev('urgencias_p4_click_pagar');
  setTimeout(() => {
    const numero = 'PU-' + String(Date.now()).slice(-8);
    guardarU({ poliza: { numero, fecha: fechaLarga(), prima: plan.primaPesos, primaUF: plan.primaUF } });
    ev('urgencias_p4_rec_poliza', { poliza: numero, monto: plan.primaPesos, moneda: 'CLP' });
    location.href = '/herramientas/proteccion-urgencias/listo/';
  }, 1400);
});

revisarSecuencia();
ev('urgencias_p4_pag_pago', { producto: 'proteccion_urgencias' });
