/* =====================================================================
   Paso 5 · Pago — la última pantalla antes de la póliza
   ---------------------------------------------------------------------
   Reproduce la secuencia real del cotizador, que tiene dependencias y
   no es un formulario plano:

     1. Método de pago
     2. Modalidad — cuotas y día de cargo
     3. Contratos — se habilitan recién cuando (2) está resuelto
     4. Firma digital — se habilita cuando los contratos están vistos
     5. Pagar — se enciende cuando la propuesta está firmada

   Encima de esa secuencia, un detalle que se lee como boleta: si hay
   promoción, el precio de lista tachado y la promoción dentro del mismo
   documento. El cliente ve lo que se ahorró donde ve lo que paga.
   ===================================================================== */

import { ufTxt } from './datos.js';
import {
  $, $$, estado, guardar, ev, exigir, montarComun, montarModal,
  pintarPasos, validarFormulario, escapar, fechaLarga
} from './comun.js';
import { pintarBarra, cotizacion, clp } from './cotizacion.js';
import { numerosTxt } from './promocion.js';

/* Sin el consentimiento entre los requisitos: ver p-vehiculo.js. */
if (!exigir('rut', 'persona', 'vehiculo', 'domicilio', 'plan')) {
  throw new Error('faltan pasos');
}

pintarPasos('pagar');
montarComun();

const modal = montarModal('modal-documento');

/* Estado local de la secuencia */
const paso = { modalidad: false, contratos: false, firmado: false };

/* ═══ 1 · Modalidad ══════════════════════════════════════════════════ */
const OPCIONES_CUOTAS = [12, 6, 3, 1];
const elCuotas = $('#cuotas'), elDia = $('#dia');

elCuotas.innerHTML = OPCIONES_CUOTAS.map(n =>
  `<option value="${n}"${n === (estado.pago.cuotas || 12) ? ' selected' : ''}>${n === 1 ? 'Pago al contado' : n + ' cuotas'}</option>`
).join('');

elDia.innerHTML = '<option value="">Elige un día</option>' +
  [1, 5, 10, 15, 20, 25].map(d =>
    `<option value="${d}"${String(d) === String(estado.pago.diaCargo) ? ' selected' : ''}>Día ${d} de cada mes</option>`
  ).join('');

$('#rut-firma').value = estado.rut;

/* ═══ 2 · Contratos ══════════════════════════════════════════════════
   Tres documentos. La propuesta depende de la modalidad de pago —es la
   que lleva el monto de la cuota—; los otros dos están siempre. */
const CONTRATOS = [
  {
    id: 'propuesta', titulo: 'Propuesta de seguro',
    bajada: 'Tus coberturas, tu prima y tus condiciones particulares.',
    dependeDeModalidad: true
  },
  {
    id: 'condicionado', titulo: 'Condicionado general POL 1 2016 0279',
    bajada: 'El texto depositado en la CMF que rige tu póliza.',
    dependeDeModalidad: false
  },
  {
    id: 'privacidad', titulo: 'Aviso de privacidad',
    bajada: 'Cómo tratamos tus datos y qué derechos tienes sobre ellos.',
    dependeDeModalidad: false
  }
];

const vistos = new Set();

function pintarContratos() {
  $('#contratos').innerHTML = CONTRATOS.map(c => {
    const bloqueado = c.dependeDeModalidad && !paso.modalidad;
    const visto = vistos.has(c.id);
    const estadoDoc = bloqueado ? 'bloqueado' : visto ? 'visto' : 'pendiente';
    const icono = visto
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>'
      : bloqueado
        ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>';
    return `
      <li class="contrato" data-estado="${estadoDoc}">
        <span class="contrato__icono" aria-hidden="true">${icono}</span>
        <span class="contrato__texto">
          <strong>${c.titulo}</strong>
          <span>${bloqueado ? 'Elige cuotas y día de cargo para habilitarlo.' : visto ? 'Revisado' : c.bajada}</span>
        </span>
        <button class="btn ${visto ? 'btn--fantasma' : 'btn--linea'} btn--sm js-ev" type="button"
                id="ver-documento-${c.id}" data-doc="${c.id}"${bloqueado ? ' aria-disabled="true"' : ''}>
          ${visto ? 'Ver de nuevo' : 'Ver documento'}
        </button>
      </li>`;
  }).join('');

  $$('[data-doc]', $('#contratos')).forEach(b => b.addEventListener('click', () => {
    if (b.getAttribute('aria-disabled') === 'true') return;
    abrirDocumento(b.dataset.doc, b);
  }));
}

function abrirDocumento(id, origen) {
  const c = cotizacion(estado.plan, estado.deducible, Number(elCuotas.value));
  const p = estado.persona, v = estado.vehiculo, d = estado.domicilio;
  /* `find` devuelve undefined si el id no existe. Hoy los tres ids salen
     de botones que escribimos nosotros, pero un id mal escrito abriría un
     modal vacío sin decir por qué. Mejor no abrirlo. */
  const doc = CONTRATOS.find(x => x.id === id);
  if (!doc) return;

  const cuerpos = {
    propuesta: `
      <p><strong class="el-7">Asegurado.</strong> ${escapar(p.nombres)} ${escapar(p.apellidos)}, RUT ${escapar(estado.rut)}, domiciliado en ${escapar(d.direccion)} ${escapar(d.numero)}${d.depto ? ', ' + escapar(d.depto) : ''}, ${escapar(d.comuna)}.</p>
      <p><strong class="el-7">Bien asegurado.</strong> ${escapar(v.marca)} ${escapar(v.modelo)} año ${v.anio}, color ${escapar(v.color)}, patente ${escapar(v.patente)}, motor ${escapar(v.motor)}, chasis ${escapar(v.chasis)}.</p>
      <p><strong class="el-7">Plan.</strong> ${c.plan.nombre} con deducible ${c.deducible} UF. Taller ${c.plan.taller.toLowerCase()}, auto de reemplazo ${c.plan.reemplazo.toLowerCase()}, responsabilidad civil hasta ${c.plan.rc}, asistencia ${c.plan.asistencia.toLowerCase()}.</p>
      <p><strong class="el-7">Prima.</strong> ${clp(c.mensual)} mensuales.${c.promo.activa ? ` Con ${escapar(c.promo.etiqueta)} se pagan ${c.meses - c.promo.cuotasGratis} de las ${c.meses} cuotas (las cuotas ${numerosTxt(c.promo.numeros)} no se pagan).` : ''} Total ${clp(c.total)} en ${c.cuotas} ${c.cuotas === 1 ? 'cargo' : 'cargos'} de ${clp(c.valorCuota)}, con cargo el día ${elDia.value || '—'} de cada mes.</p>
      ${c.promo.activa ? `<p><strong class="el-7">${escapar(c.promo.etiqueta)}.</strong> ${escapar(c.promo.beneficio)}. ${escapar(c.promo.entrega)}</p>` : ''}
      <p><strong class="el-7">Vigencia.</strong> ${c.meses === 24 ? 'De dos años' : 'Anual'} y renovable, desde la aceptación de la propuesta y la aprobación de la inspección${v.nuevo ? ' —que no aplica por tratarse de un vehículo nuevo—' : ''}.</p>`,
    condicionado: `
      <p><strong class="el-7">POL 1 2016 0279 · Póliza de Seguro para Vehículos Motorizados.</strong> Texto depositado en la Comisión para el Mercado Financiero.</p>
      <p>Cubre daños materiales al vehículo asegurado por choque, riesgos de la naturaleza, granizo, sismo, huelga, terrorismo y actos maliciosos; robo, hurto o uso no autorizado; y pérdida total, todos por valor comercial.</p>
      <p><strong class="el-7">Principales exclusiones.</strong> Conducción en estado de ebriedad o bajo efecto de drogas; huida del lugar del accidente; desgaste, uso normal o falla mecánica; carreras y competencias; uso distinto al declarado; conducción sin licencia vigente o suspendida.</p>
      <p>Además rigen los condicionados adicionales CAD 1 2016 0086 a CAD 1 2016 0131 asociados a las coberturas contratadas.</p>`,
    privacidad: `
      <p>Zurich trata tus datos para cotizar, emitir y administrar tu póliza, y para cumplir obligaciones legales y regulatorias.</p>
      <p>Con tu consentimiento, también los usa para ofrecerte productos, mantener tu información al día, compartirla dentro del grupo y con proveedores bajo confidencialidad, y elaborar análisis y estudios estadísticos.</p>
      <p><strong class="el-7">Tus derechos.</strong> Puedes acceder a tus datos, corregirlos, cancelarlos, oponerte a su uso o trasladarlos, en virtud de la ley o según corresponda.</p>
      <p>Este aviso no anula consentimientos anteriores; si hay conflicto, este documento tiene prioridad.</p>`
  };

  $('#tit-doc').textContent = doc.titulo;
  $('#cuerpo-documento').innerHTML = cuerpos[id] +
    '<p class="el-8">Documento de demostración. En producción es el PDF que genera el sistema de emisión.</p>';
  modal.abrir(origen);
  ev('auto_p6_click_ver_documento', { documento: id });

  vistos.add(id);
  revisarSecuencia();
}

/* ═══ 3 · Secuencia ══════════════════════════════════════════════════ */
function revisarSecuencia() {
  paso.modalidad = !!elDia.value;
  const requeridos = CONTRATOS.filter(c => !c.dependeDeModalidad || paso.modalidad).map(c => c.id);
  paso.contratos = paso.modalidad && requeridos.every(id => vistos.has(id));

  pintarContratos();

  $('#bloque-firma').style.opacity = paso.contratos ? '1' : '.5';
  $('#cedula').disabled = !paso.contratos;
  $('#validar').setAttribute('aria-disabled', String(!paso.contratos || paso.firmado));
  $('#btn-pagar').setAttribute('aria-disabled', String(!paso.firmado));
}

/* ═══ 4 · Detalle ════════════════════════════════════════════════════ */
function pintarBoleta() {
  const c = cotizacion(estado.plan, estado.deducible, Number(elCuotas.value));
  const v = estado.vehiculo;

  $('#boleta').innerHTML = `
    <div class="boleta__cabeza">
      <div>
        <h3>Seguro de Auto Digital · ${c.plan.nombre}</h3>
        <span>${escapar(v.marca)} ${escapar(v.modelo)} ${v.anio} · patente ${escapar(v.patente)}</span>
      </div>
      <span>Vigencia ${c.meses === 24 ? 'por dos años' : 'anual'} desde el ${fechaLarga()}</span>
    </div>
    <div class="boleta__cuerpo">
      <div class="boleta__linea">
        <span>Prima mensual · deducible ${c.deducible} UF</span>
        <strong>${clp(c.mensual)}</strong>
      </div>
      <div class="boleta__linea">
        <span>Cobertura contratada</span>
        <strong>${c.meses} meses</strong>
      </div>
      <div class="boleta__linea">
        <span>Precio de lista ${c.meses === 24 ? 'de los dos años' : 'del año'}</span>
        <strong>${clp(c.listaAnual)}</strong>
      </div>
      ${c.promo.activa ? `<div class="boleta__linea boleta__linea--beneficio">
        <span>${escapar(c.promo.etiqueta)} · cuotas ${numerosTxt(c.promo.numeros)} sin pago</span>
        <strong>− ${clp(c.descuento)}</strong>
      </div>
      <div class="boleta__linea boleta__linea--beneficio">
        <span>${escapar(c.promo.beneficio)}</span>
        <strong>Incluida</strong>
      </div>` : ''}

      <div class="boleta__total">
        <span>
          ${c.promo.activa ? `<span class="tachado">${clp(c.listaAnual)}</span>` : ''}
          Total a pagar ${c.meses === 24 ? 'los dos años' : 'el año'} · ${ufTxt(c.totalUF)}
        </span>
        <strong>${clp(c.total)}</strong>
      </div>

      ${c.promo.activa ? `<div class="boleta__sello">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>
        <span>Ahorras ${clp(c.descuento)} sobre el precio de lista, y la promoción queda escrita en la propuesta antes de que pagues.</span>
      </div>` : ''}
    </div>`;

  $('#valor-cuota').textContent = clp(c.valorCuota);
  $('#valor-cuota-uf').textContent = c.cuotas === 1
    ? 'Un solo cargo.'
    : `${c.cuotas} cargos · ${ufTxt(c.totalUF / c.cuotas)} cada uno.`;
  $('#pista-cuotas').textContent = c.cuotas === 1
    ? 'Un solo cargo.'
    : `La cobertura corre los ${c.meses} meses igual.`;

  pintarBarra('Hoy pagas', clp(c.valorCuota));
  return c;
}

/* ═══ 5 · Eventos ════════════════════════════════════════════════════ */
elCuotas.addEventListener('change', () => {
  guardar({ pago: { ...estado.pago, cuotas: Number(elCuotas.value) } });
  ev('auto_p6_rec_cuotas', { cuotas: Number(elCuotas.value) });
  // Cambiar la modalidad invalida la propuesta ya revisada: lleva el monto.
  vistos.delete('propuesta');
  pintarBoleta();
  revisarSecuencia();
});

elDia.addEventListener('change', () => {
  guardar({ pago: { ...estado.pago, diaCargo: elDia.value } });
  ev('auto_p6_rec_dia_cargo', { dia: elDia.value });
  vistos.delete('propuesta');
  revisarSecuencia();
});

$('#validar').addEventListener('click', () => {
  const btn = $('#validar');
  if (btn.getAttribute('aria-disabled') === 'true') return;

  const ok = validarFormulario([
    { campo: $('#c-cedula'), input: $('#cedula'),
      valido: v => /^\d{8,10}$/.test(v.replace(/\D/g, '')),
      mensaje: 'Son los nueve dígitos del frente de tu cédula, arriba a la derecha.',
      pistaBase: 'Nueve dígitos, sin puntos.' }
  ]);
  if (!ok) return;

  btn.setAttribute('aria-disabled', 'true');
  btn.innerHTML = '<span class="cargando el-9" aria-hidden="true"></span>';

  // Validación simulada: en producción es el servicio de firma digital.
  setTimeout(() => {
    paso.firmado = true;
    btn.textContent = 'Validado';
    $('#cedula').readOnly = true;
    $('#firma-ok').hidden = false;
    $('#firma-sello').textContent =
      `Firmada el ${fechaLarga()} por ${estado.persona.nombres} ${estado.persona.apellidos}, RUT ${estado.rut}.`;
    ev('auto_p6_click_validar');
    ev('auto_p6_rec_firma', { firmado: true });
    revisarSecuencia();
    $('#firma-ok').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 900);
});

$('#form-pago').addEventListener('submit', e => {
  e.preventDefault();

  if (!paso.modalidad) {
    validarFormulario([{ campo: $('#c-dia'), input: elDia, valido: () => false,
                         mensaje: 'Elige el día en que se cobra la cuota.' }]);
    return;
  }
  if (!paso.contratos) {
    $('#contratos').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!paso.firmado) {
    validarFormulario([{ campo: $('#c-cedula'), input: $('#cedula'), valido: () => false,
                         mensaje: 'Valida el número de tu cédula para firmar la propuesta.' }]);
    return;
  }

  const boton = $('#btn-pagar');
  boton.setAttribute('aria-disabled', 'true');
  boton.innerHTML = '<span class="cargando" aria-hidden="true"></span> Conectando con Webpay…';
  ev('auto_p6_click_pagar');

  // Salida al portal de pagos. En producción esto abandona el dominio;
  // aquí simulamos el retorno para poder mostrar el comprobante.
  setTimeout(() => {
    const c = cotizacion(estado.plan, estado.deducible, Number(elCuotas.value));
    const numero = 'AD-' + String(Date.now()).slice(-8);
    guardar({
      pago: { cuotas: c.cuotas, diaCargo: elDia.value },
      poliza: {
        numero, fecha: fechaLarga(),
        total: c.total, valorCuota: c.valorCuota,
        descuento: c.descuento, mensual: c.mensual,
        /* La duración y el número de cuotas se guardan en la póliza. Sin
           esto, la pantalla final leía estado.pago.cuotas —que es el
           selector de cuotas del año— y una cobertura de 24 meses
           terminaba impresa como doce. */
        meses: c.meses, cuotas: c.cuotas
      }
    });
    ev('auto_p6_rec_poliza', { poliza: numero, monto: c.total, moneda: 'CLP' });
    location.href = '/herramientas/auto-digital/listo/';
  }, 1400);
});

/* ── Arranque ─────────────────────────────────────────────────────── */
pintarBoleta();
revisarSecuencia();
ev('auto_p6_pag_modalidad_pago', { producto: 'auto_digital' });
