/* =====================================================================
   Comprobante · póliza contratada
   ---------------------------------------------------------------------
   Última pantalla del recorrido y primera de la relación. Aquí no se
   vende: se confirma, se dice qué pasa después y se deja claro qué
   tiene que hacer el cliente. Los dos datos que la medición necesita
   —número de póliza y monto— se emiten aquí.
   ===================================================================== */

import { planPorId } from './datos.js';
import {
  $, estado, ev, exigir, montarComun, pintarPasos, escapar, reiniciar
} from './comun.js';
import { clp } from './cotizacion.js';
import { promocionAuto, numerosTxt } from './promocion.js';

if (!exigir('poliza')) throw new Error('sin poliza');

pintarPasos('pagar');
montarComun();

const p = estado.persona, v = estado.vehiculo, pol = estado.poliza;
const nombre = escapar((p.nombres || '').split(' ')[0]);

/* Duración y cuotas se leen de la póliza emitida, no del estado en vivo:
   lo que se imprime tiene que ser lo que se contrató. Las pólizas viejas
   no traen estos campos, así que caen a doce. */
const mesesPoliza  = Number(pol.meses) === 24 ? 24 : 12;
const cuotasPoliza = Number(pol.cuotas) || estado.pago.cuotas || 12;
/* La promoción de la póliza emitida: si tuvo descuento, fue con la vigencia contratada. */
const promo = Number(pol.descuento) > 0 ? promocionAuto(mesesPoliza) : null;

/* La barra de pasos queda con los cinco hechos */
document.querySelectorAll('.paso-item').forEach(li => li.dataset.estado = 'hecho');

$('#titulo-exito').textContent = `${nombre}, tu auto quedó asegurado`;
$('#bajada-exito').innerHTML =
  `Te enviamos la póliza y el comprobante a <strong>${escapar(p.correo)}</strong>. ` +
  `El número de tu póliza es <strong>${escapar(pol.numero)}</strong>.`;

$('#comprobante').innerHTML = `
  <div class="boleta__cabeza">
    <div>
      <h3>Póliza ${escapar(pol.numero)}</h3>
      <span>Emitida el ${escapar(pol.fecha)}</span>
    </div>
    <span>Seguro de Auto Digital</span>
  </div>
  <div class="boleta__cuerpo">
    <div class="boleta__linea"><span>Asegurado</span><strong>${escapar(p.nombres)} ${escapar(p.apellidos)}</strong></div>
    <div class="boleta__linea"><span>RUT</span><strong>${escapar(estado.rut)}</strong></div>
    <div class="boleta__linea"><span>Vehículo</span><strong>${escapar(v.marca)} ${escapar(v.modelo)} ${v.anio} · ${escapar(v.patente)}</strong></div>
    <div class="boleta__linea"><span>Plan</span><strong>${escapar(planPorId(estado.plan).nombre)} · deducible ${estado.deducible} UF</strong></div>
    <div class="boleta__linea"><span>Forma de pago</span><strong>${cuotasPoliza === 1 ? 'Contado' : cuotasPoliza + ' cuotas de ' + clp(pol.valorCuota)}${estado.pago.diaCargo ? ' · día ' + estado.pago.diaCargo : ''}</strong></div>
    ${promo?.activa ? `<div class="boleta__linea boleta__linea--beneficio"><span>${escapar(promo.etiqueta)} · cuotas ${numerosTxt(promo.numeros)} sin pago</span><strong>− ${clp(pol.descuento)}</strong></div>
    <div class="boleta__linea boleta__linea--beneficio"><span>${escapar(promo.beneficio)}</span><strong>Incluida</strong></div>` : ''}
    <div class="boleta__total">
      <span>Total ${mesesPoliza === 24 ? 'de los dos años' : 'del año'}</span>
      <strong>${clp(pol.total)}</strong>
    </div>
  </div>`;

/* Textos de zurich.cl (ficha y preguntas de Auto Digital), no del piloto. */
const pasos = v.nuevo
  ? [
      ['Revisa tu correo', 'Ahí llegan la póliza y el comprobante.'],
      ['Ya estás cubierto', 'Tu auto es nuevo: las coberturas comienzan desde el momento de la contratación, sin inspección.'],
      ['Guarda los teléfonos', 'Asistencia 600 600 1515 · Siniestros 600 600 9090. También puedes denunciar desde la app Zurich Chile.'],
      ['Entra a Mundo Zurich', 'Por contratar tu seguro tienes acceso a beneficios y servicios exclusivos, sin costo.']
    ]
  : [
      ['Revisa tu WhatsApp', 'Te enviamos el enlace para hacer la inspección desde tu celular.'],
      ['Cuando se apruebe la inspección', 'Las coberturas se activan una vez que la autoinspección es aprobada por la Compañía.'],
      ['Guarda los teléfonos', 'Asistencia 600 600 1515 · Siniestros 600 600 9090. También puedes denunciar desde la app Zurich Chile.'],
      ['Entra a Mundo Zurich', 'Por contratar tu seguro tienes acceso a beneficios y servicios exclusivos, sin costo.']
    ];

$('#que-sigue').innerHTML = `
  <h2 class="el-10">Qué pasa ahora</h2>
  <ol class="pila pila--5 mt-6">
    ${pasos.map(([t, d], i) => `
      <li class="el-11">
        <span class="el-12">${i + 1}</span>
        <span><strong class="el-13">${t}</strong>
        <span class="el-14">${d}</span></span>
      </li>`).join('')}
  </ol>`;

/* El comprobante se descarga como texto: en producción es el PDF que
   genera el sistema de emisión. */
$('#descargar').addEventListener('click', () => {
  const lineas = [
    'ZURICH CHILE SEGUROS GENERALES S.A.',
    'Comprobante de contratación — Seguro de Auto Digital',
    '',
    `Póliza: ${pol.numero}`,
    `Fecha: ${pol.fecha}`,
    `Asegurado: ${p.nombres} ${p.apellidos} (${estado.rut})`,
    `Correo: ${p.correo}`,
    `Vehículo: ${v.marca} ${v.modelo} ${v.anio}, patente ${v.patente}`,
    `Plan: ${planPorId(estado.plan).nombre} · deducible ${estado.deducible} UF`,
    `Prima mensual: ${clp(pol.mensual)}`,
    ...(promo?.activa ? [`Promoción: ${promo.etiqueta}, cuotas ${numerosTxt(promo.numeros)} sin pago (− ${clp(pol.descuento)})`,
                         `${promo.beneficio}. ${promo.entrega}`] : []),
    `Total ${mesesPoliza === 24 ? 'de los dos años' : 'del año'}: ${clp(pol.total)}`,
    `Forma de pago: ${cuotasPoliza} cuota(s) de ${clp(pol.valorCuota)}`,
    '',
    'Cotizador de demostración. Datos ficticios, sin validez comercial.'
  ];
  const url = URL.createObjectURL(new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = `comprobante-${pol.numero}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  ev('auto_p7_click_descargar_comprobante');
});

$('#volver-inicio').addEventListener('click', () => reiniciar());

ev('auto_p7_pag_poliza_contratada', { producto: 'auto_digital', poliza: pol.numero });
