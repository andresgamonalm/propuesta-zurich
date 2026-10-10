/* =====================================================================
   Hogar · Paso 5 · Pago
   ---------------------------------------------------------------------
   Misma secuencia de cinco bloques que en auto, con las mismas
   dependencias. Es la pantalla donde más importa que se vea que la
   logística es la misma:

     1. Método de pago
     2. Modalidad — cuotas y día de cargo
     3. Contratos — se habilitan cuando (2) está resuelto
     4. Firma digital — se habilita cuando los contratos están vistos
     5. Pagar — se enciende cuando la propuesta está firmada

   Cambian los documentos, porque el condicionado es otro, y cambia el
   bien asegurado. La mecánica no cambia ni una línea: cambiar las cuotas
   o el día sigue invalidando la propuesta ya revisada, porque lleva el
   monto adentro.

   El cotizador de referencia salta a Webpay desde un resumen sin
   contratos ni firma. Aquí el cliente lee y firma antes de pagar, que es
   como se emite de verdad.
   ===================================================================== */

import { ufTxt } from './datos.js';
import { CONDICIONADO, PRODUCTO, ASISTENCIAS, AVISOS,
         materialPorId, tipoViviendaPorId, pesos,
         EXCLUSIONES, DEFINICIONES, DECLARACIONES,
         numeroCotizacion, venceEl, VALIDEZ_COTIZACION_DIAS } from './datos-hogar.js';
import {
  $, $$, estadoHogar, guardarHogar, ev, exigirHogar, montarComun, montarModal,
  pintarPasosHogar, validarFormulario, escapar, fechaLarga, vigenciaAnual
} from './comun-hogar.js';
import { pintarBarraHogar, cotizacionHogar, mesesActualesHogar, clp } from './cotizacion-hogar.js';

/* Sin el consentimiento entre los requisitos: ver h-vivienda.js. */
if (!exigirHogar('rut', 'persona', 'vivienda', 'monto', 'plan')) {
  throw new Error('faltan pasos');
}

pintarPasosHogar('pagar');
montarComun();

const vigencia = estadoHogar.vigencia
  || vigenciaAnual(new Date(), mesesActualesHogar() === 24 ? 2 : 1);
const modal = montarModal('modal-documento');

const paso = { modalidad: false, contratos: false, firmado: false };

/* ═══ 1 · Modalidad ══════════════════════════════════════════════════ */
const OPCIONES_CUOTAS = [12, 6, 3, 1];
const elCuotas = $('#cuotas'), elDia = $('#dia');

elCuotas.innerHTML = OPCIONES_CUOTAS.map(n =>
  `<option value="${n}"${n === (estadoHogar.pago.cuotas || 12) ? ' selected' : ''}>${n === 1 ? 'Pago al contado' : n + ' cuotas'}</option>`
).join('');

elDia.innerHTML = '<option value="">Elige un día</option>' +
  [1, 5, 10, 15, 20, 25].map(d =>
    `<option value="${d}"${String(d) === String(estadoHogar.pago.diaCargo) ? ' selected' : ''}>Día ${d} de cada mes</option>`
  ).join('');

$('#rut-firma').value = estadoHogar.rut;

/* El aviso de retracto se escribe desde AVISOS y no en el HTML, para que
   exista un solo texto: si alguna vez cambia la norma, cambia en un
   lugar y no en cinco pantallas. */
const elRetracto = $('#aviso-retracto');
if (elRetracto) elRetracto.textContent = AVISOS.retracto;

/* ═══ 2 · Contratos ══════════════════════════════════════════════════ */
const CONTRATOS = [
  {
    id: 'propuesta', titulo: 'Propuesta de seguro',
    bajada: 'Tu vivienda, tus coberturas, tu prima y tus condiciones particulares.',
    dependeDeModalidad: true
  },
  {
    id: 'condicionado', titulo: `Condicionado general ${CONDICIONADO}`,
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
  const c = cotizacionHogar(estadoHogar.plan, estadoHogar.deducible, Number(elCuotas.value));
  const p = estadoHogar.persona, v = estadoHogar.vivienda;
  /* `find` devuelve undefined si el id no existe. Hoy los tres ids salen
     de botones que escribimos nosotros, pero un id mal escrito abriría un
     modal vacío sin decir por qué. Mejor no abrirlo. */
  const doc = CONTRATOS.find(x => x.id === id);
  if (!doc) return;
  const material = materialPorId(v.material), tipo = tipoViviendaPorId(v.tipo);
  const asistencia = ASISTENCIAS[c.plan.asistencia];

  const pagador = estadoHogar.pagador;
  const cuerpos = {
    propuesta: `
      <p><strong class="el-7">Cotización N° ${numeroCotizacion(estadoHogar.rut)}.</strong> ${PRODUCTO}. Válida por ${VALIDEZ_COTIZACION_DIAS} días desde su emisión: hasta el ${fechaLarga(venceEl())}.</p>
      <p><strong class="el-7">Contratante.</strong> ${escapar(p.nombres)} ${escapar(p.apellidos)}, RUT ${escapar(estadoHogar.rut)}.</p>
      ${pagador && pagador.quien === 'otro'
        ? `<p><strong class="el-7">Pagador.</strong> ${escapar(pagador.nombre)}, RUT ${escapar(pagador.rut)}.</p>`
        : ''}
      <p><strong class="el-7">Vivienda asegurada.</strong> ${escapar(tipo.rotulo)} de ${v.m2} m², material ${escapar(material.rotulo.toLowerCase())}, construida el ${v.anio}, en ${escapar(v.direccion)} ${escapar(v.numero)}${v.depto ? ', ' + escapar(v.depto) : ''}, ${escapar(v.comuna)}, Región ${escapar(v.region)}.</p>
      <p><strong class="el-7">Monto asegurado.</strong> Estructura ${ufTxt(c.montoEstructura)}${c.plan.cubreContenido ? ` · Contenido ${ufTxt(c.montoContenido)}` : ' · sin cobertura de contenido'}.</p>
      <p><strong class="el-7">Plan.</strong> ${c.plan.nombre}, con deducible de ${c.deducibleUF} UF por evento.${c.plan.sinDeducibleEn.length ? ` Sin deducible en ${c.plan.sinDeducibleEn.join(', ').toLowerCase()}.` : ''} Incluye ${asistencia.nombre} · ${asistencia.detalle.toLowerCase()}.</p>
      <p><strong class="el-7">Prima.</strong> ${clp(c.mensual)} mensuales: total ${clp(c.total)} en ${c.cuotas} ${c.cuotas === 1 ? 'cargo' : 'cargos'} de ${clp(c.valorCuota)}, con cargo el día ${elDia.value || '—'} de cada mes.</p>
      <p><strong class="el-7">Vigencia.</strong> ${c.meses === 24 ? 'De dos años' : 'Anual'} y renovable, del ${vigencia.inicioTxt} al ${vigencia.terminoTxt}.</p>
      <p><strong class="el-7">Desglose.</strong> Prima afecta ${ufTxt(c.desglose.afecta)} · exenta ${ufTxt(c.desglose.exenta)} · IVA ${ufTxt(c.desglose.iva)} · total ${ufTxt(c.desglose.total)}.</p>
      ${estadoHogar.declaraciones ? `<p><strong class="el-7">Declaración del contratante.</strong> ${DECLARACIONES.map(d => escapar(d.afirmativa)).join(' ')}</p>` : ''}`,
    condicionado: `
      <p><strong class="el-7">${CONDICIONADO} · Póliza de Seguro de Incendio para el Hogar.</strong> Texto depositado en la Comisión para el Mercado Financiero, consultable en www.cmfchile.cl junto a cada cláusula adicional de tu plan.</p>
      <p>La materia asegurada es el edificio y/o el contenido, y puede contratarse por separado o en conjunto. El edificio incluye rejas, portones, cierros, veredas, pavimentos, piscinas, quinchos, bodega y garaje, además de muros de contención y conexiones a servicios públicos. Árboles, plantas, jardines, obras de drenaje y pozos quedan incluidos hasta un 10% del monto asegurado por ubicación. El contenido son los muebles y objetos comunes dentro del inmueble, incluidos los depositados en la bodega del edificio.</p>
      <p>Cubre daños materiales a la vivienda y al contenido por incendio, sismo, incendio a consecuencia de sismo, riesgos de la naturaleza, explosión, colapso, choque de vehículos, aeronaves y rotura de cañerías; robo con fuerza en las cosas y violencia en las personas; rotura de cristales; y responsabilidad civil familiar.</p>
      <p><strong class="el-7">Cómo se indemniza.</strong> ${DEFINICIONES.slice(0, 2).map(d => `${escapar(d.titulo)}: ${escapar(d.texto)}`).join(' ')}</p>
      <p><strong class="el-7">Principales exclusiones.</strong> ${escapar(EXCLUSIONES[0])} ${escapar(EXCLUSIONES[1])} ${escapar(EXCLUSIONES[2])} ${escapar(EXCLUSIONES[3])} ${escapar(EXCLUSIONES[4])}</p>
      <p><strong class="el-7">Si tienes un reclamo.</strong> ${escapar(AVISOS.autorregulacion)}</p>
      <p>${escapar(AVISOS.reclamos)}</p>`,
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
  ev('hogar_p5_click_ver_documento', { documento: id });

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

/* ═══ 4 · Detalle ════════════════════════════════════════════════════
   La boleta: montos asegurados, prima, total y su desglose. Sin
   promoción publicada para Hogar Fácil Plus, no hay líneas de descuento. */
function pintarBoleta() {
  const c = cotizacionHogar(estadoHogar.plan, estadoHogar.deducible, Number(elCuotas.value));
  const v = estadoHogar.vivienda;
  const tipo = tipoViviendaPorId(v.tipo);

  $('#boleta').innerHTML = `
    <div class="boleta__cabeza">
      <div>
        <h3>${PRODUCTO} · ${c.plan.corto}</h3>
        <span>${escapar(tipo.rotulo)} de ${v.m2} m² · ${escapar(v.direccion)} ${escapar(v.numero)}, ${escapar(v.comuna)}</span>
      </div>
      <span>Vigencia ${c.meses === 24 ? 'de dos años' : 'anual'} · del ${vigencia.inicioTxt} al ${vigencia.terminoTxt}</span>
    </div>
    <div class="boleta__cuerpo">
      <div class="boleta__linea">
        <span>Monto asegurado · estructura</span>
        <strong>${ufTxt(c.montoEstructura)}</strong>
      </div>
      ${c.plan.cubreContenido ? `
      <div class="boleta__linea">
        <span>Monto asegurado · contenido</span>
        <strong>${ufTxt(c.montoContenido)}</strong>
      </div>` : ''}
      <div class="boleta__linea">
        <span>Prima mensual · deducible ${c.deducibleUF} UF</span>
        <strong>${clp(c.mensual)}</strong>
      </div>
      <div class="boleta__linea">
        <span>Cobertura contratada</span>
        <strong>${c.meses} meses</strong>
      </div>

      <div class="boleta__total">
        <span>
          Total a pagar ${c.meses === 24 ? 'los dos años' : 'el año'} · ${ufTxt(c.totalUF)}
        </span>
        <strong>${clp(c.total)}</strong>
      </div>

      <div class="boleta__desglose">
        <span class="boleta__desglose-titulo">Detalle de la prima</span>
        <div class="boleta__linea boleta__linea--fina">
          <span>Prima afecta a IVA</span>
          <span>${ufTxt(c.desglose.afecta)} · ${clp(pesos(c.desglose.afecta))}</span>
        </div>
        <div class="boleta__linea boleta__linea--fina">
          <span>Prima exenta · sismo e incendio a consecuencia de sismo</span>
          <span>${ufTxt(c.desglose.exenta)} · ${clp(pesos(c.desglose.exenta))}</span>
        </div>
        <div class="boleta__linea boleta__linea--fina">
          <span>IVA 19% sobre la prima afecta</span>
          <span>${ufTxt(c.desglose.iva)} · ${clp(pesos(c.desglose.iva))}</span>
        </div>
        <div class="boleta__linea boleta__linea--fina boleta__linea--suma">
          <span>Prima total</span>
          <span>${ufTxt(c.desglose.total)} · ${clp(c.total)}</span>
        </div>
        <p class="boleta__nota">${escapar(AVISOS.uf)}</p>
      </div>

    </div>`;

  $('#valor-cuota').textContent = clp(c.valorCuota);
  $('#valor-cuota-uf').textContent = c.cuotas === 1
    ? 'Un solo cargo.'
    : `${c.cuotas} cargos · ${ufTxt(c.totalUF / c.cuotas)} cada uno.`;
  $('#pista-cuotas').textContent = c.cuotas === 1
    ? 'Un solo cargo.'
    : 'La cobertura corre los 12 meses igual.';

  pintarBarraHogar('Hoy pagas', clp(c.valorCuota));
  return c;
}

/* ═══ 5 · Eventos ════════════════════════════════════════════════════ */
elCuotas.addEventListener('change', () => {
  guardarHogar({ pago: { ...estadoHogar.pago, cuotas: Number(elCuotas.value) } });
  ev('hogar_p5_rec_cuotas', { cuotas: Number(elCuotas.value) });
  /* Cambiar la modalidad invalida la propuesta ya revisada: lleva el monto. */
  vistos.delete('propuesta');
  pintarBoleta();
  revisarSecuencia();
});

elDia.addEventListener('change', () => {
  guardarHogar({ pago: { ...estadoHogar.pago, diaCargo: elDia.value } });
  ev('hogar_p5_rec_dia_cargo', { dia: elDia.value });
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

  /* Validación simulada: en producción es el servicio de firma digital. */
  setTimeout(() => {
    paso.firmado = true;
    btn.textContent = 'Validado';
    $('#cedula').readOnly = true;
    $('#firma-ok').hidden = false;
    $('#firma-sello').textContent =
      `Firmada el ${fechaLarga()} por ${estadoHogar.persona.nombres} ${estadoHogar.persona.apellidos}, RUT ${estadoHogar.rut}.`;
    ev('hogar_p5_click_validar');
    ev('hogar_p5_rec_firma', { firmado: true });
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
  ev('hogar_p5_click_pagar');

  /* Salida al portal de pagos. En producción esto abandona el dominio;
     aquí simulamos el retorno para poder mostrar el comprobante. */
  setTimeout(() => {
    const c = cotizacionHogar(estadoHogar.plan, estadoHogar.deducible, Number(elCuotas.value));
    const numero = 'HF-' + String(Date.now()).slice(-8);
    guardarHogar({
      pago: { cuotas: c.cuotas, diaCargo: elDia.value },
      vigencia,
      poliza: {
        numero, fecha: fechaLarga(),
        total: c.total, valorCuota: c.valorCuota,
        descuento: c.descuento, mensual: c.mensual,
        cuotas: c.cuotas,
        montoEstructura: c.montoEstructura, montoContenido: c.montoContenido
      }
    });
    ev('hogar_p5_rec_poliza', { poliza: numero, monto: c.total, moneda: 'CLP' });
    location.href = '/herramientas/hogar-facil-plus/listo/';
  }, 1400);
});

/* ── Arranque ─────────────────────────────────────────────────────── */
pintarBoleta();
revisarSecuencia();
ev('hogar_p5_pag_modalidad_pago', { producto: 'hogar_facil_plus' });
