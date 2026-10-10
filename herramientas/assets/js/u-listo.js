// @ts-check
/* =====================================================================
   Protección Urgencias · Póliza contratada
   ---------------------------------------------------------------------
   Se confirma y se dice qué pasa después, con los textos de zurich.cl:
   desde cuándo hay cobertura, la carencia de Sala de Urgencia, cómo se
   suma el grupo familiar y Mundo Zurich. Nada que el producto no diga.
   ===================================================================== */
import { clp } from './datos.js';
import { PRODUCTO, ENTIDAD, planPorId, ANTES, BENEFICIOS, ufPublicada } from './datos-urgencias.js';
import { $, estadoU, ev, exigirU, montarComun, pintarPasosU, escapar, reiniciarU } from './comun-urgencias.js';

if (!exigirU('poliza')) throw new Error('sin poliza');

pintarPasosU('pagar');
montarComun();
document.querySelectorAll('.paso-item').forEach((li) => { /** @type {HTMLElement} */ (li).dataset.estado = 'hecho'; });

const p = estadoU.persona, pol = /** @type {NonNullable<typeof estadoU.poliza>} */ (estadoU.poliza);
const plan = planPorId(estadoU.plan);
const b = estadoU.beneficiarios;

$('#titulo-exito').textContent = `${(p.nombres || '').split(' ')[0]}, tu seguro quedó contratado`;
$('#bajada-exito').innerHTML = `Te enviamos la póliza y el comprobante a <strong>${escapar(p.correo)}</strong>. El número de tu póliza es <strong>${escapar(pol.numero)}</strong>.`;

$('#comprobante').innerHTML = `
  <div class="boleta__cabeza">
    <div><h3>Póliza ${escapar(pol.numero)}</h3><span>Emitida el ${escapar(pol.fecha)}</span></div>
    <span>${escapar(PRODUCTO)}</span>
  </div>
  <div class="boleta__cuerpo">
    <div class="boleta__linea"><span>Asegurado</span><strong>${escapar(p.nombres)} ${escapar(p.apellidos)}</strong></div>
    <div class="boleta__linea"><span>RUT</span><strong>${escapar(estadoU.rut)}</strong></div>
    <div class="boleta__linea"><span>Plan</span><strong>${escapar(plan.nombre)} · ${escapar(plan.monto)}</strong></div>
    <div class="boleta__linea"><span>Beneficiarios</span><strong>${b.designar ? b.lista.map((x) => `${escapar(x.nombre)} (${x.porcentaje}%)`).join(', ') : 'Por designar en el Portal de Clientes'}</strong></div>
    <div class="boleta__linea"><span>Cargo</span><strong>Día ${escapar(estadoU.pago.diaCargo || '—')} de cada mes</strong></div>
    <div class="boleta__total"><span>Prima mensual · ${ufPublicada(pol.primaUF)}</span><strong>${clp(pol.prima)}</strong></div>
  </div>`;

const telemedicina = BENEFICIOS.find((/** @type {any} */ x) => /telemedicina/i.test(x.titulo));
const pasos = [
  ['Ya estás cubierto', ANTES.requisitos[0]],
  ['Sala de Urgencia', ANTES.condiciones[0]],
  ['Tu grupo familiar', `${ANTES.requisitos[1]} ${ANTES.condiciones[2]}`],
  ...(telemedicina ? [['Telemedicina', telemedicina.texto]] : []),
  ['Entra a Mundo Zurich', 'Por contratar tu seguro tienes acceso a beneficios y servicios exclusivos, sin costo.'],
];
$('#que-sigue').innerHTML = `
  <h2 class="el-10">Qué pasa ahora</h2>
  <ol class="pila pila--5 mt-6">
    ${pasos.map(([t, d], i) => `<li class="el-11"><span class="el-12">${i + 1}</span>
      <span><strong class="el-13">${escapar(t)}</strong><span class="el-14">${escapar(d)}</span></span></li>`).join('')}
  </ol>`;

$('#descargar').addEventListener('click', () => {
  const lineas = [
    ENTIDAD.toUpperCase(),
    `Comprobante de contratación — ${PRODUCTO}`,
    '',
    `Póliza: ${pol.numero}`,
    `Fecha: ${pol.fecha}`,
    `Asegurado: ${p.nombres} ${p.apellidos} (${estadoU.rut})`,
    `Correo: ${p.correo}`,
    `Plan: ${plan.nombre} · ${plan.monto}`,
    `Beneficiarios: ${b.designar ? b.lista.map((x) => `${x.nombre} (${x.porcentaje}%)`).join(', ') : 'por designar en el Portal de Clientes'}`,
    `Prima mensual: ${clp(pol.prima)} (${ufPublicada(pol.primaUF)})`,
    '',
    'Cotizador de demostración. Datos ficticios, sin validez comercial.',
  ];
  const url = URL.createObjectURL(new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = `comprobante-${pol.numero}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  ev('urgencias_p5_click_descargar_comprobante');
});

$('#volver-inicio').addEventListener('click', () => reiniciarU());

ev('urgencias_p5_pag_poliza_contratada', { producto: 'proteccion_urgencias', poliza: pol.numero });
