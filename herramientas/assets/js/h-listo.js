/* =====================================================================
   Hogar · Comprobante · póliza contratada
   ---------------------------------------------------------------------
   Última pantalla del recorrido y primera de la relación. Aquí no se
   vende: se confirma, se dice qué pasa después y se deja claro qué tiene
   que hacer el cliente.

   «Qué pasa ahora» es distinto que en auto y tiene que serlo: allá el
   paso siguiente es la inspección del vehículo; aquí la póliza queda
   emitida y lo que sigue es saber a qué número llamar cuando se rompa
   una cañería un domingo. Esa es la promesa que se acaba de comprar.
   ===================================================================== */

import { PRODUCTO, ASISTENCIAS, planHogarPorId,
         tipoViviendaPorId, concuerda, ufTxt } from './datos-hogar.js';
import {
  $, estadoHogar, ev, exigirHogar, montarComun, pintarPasosHogar,
  escapar, reiniciarHogar
} from './comun-hogar.js';
import { clp } from './cotizacion-hogar.js';

if (!exigirHogar('poliza')) throw new Error('sin poliza');

pintarPasosHogar('pagar');
montarComun();

const p = estadoHogar.persona, v = estadoHogar.vivienda, pol = estadoHogar.poliza;
const plan = planHogarPorId(estadoHogar.plan);
const asistencia = ASISTENCIAS[plan.asistencia];
const vig = estadoHogar.vigencia || {};
const nombre = escapar((p.nombres || '').split(' ')[0]);
const tipo = tipoViviendaPorId(v.tipo);

const cuotasPoliza = Number(pol.cuotas) || estadoHogar.pago.cuotas || 12;

/* La barra de pasos queda con los cinco hechos */
document.querySelectorAll('.paso-item').forEach(li => li.dataset.estado = 'hecho');

$('#titulo-exito').textContent =
  `${nombre}, tu ${tipo.rotulo.toLowerCase()} quedó ${concuerda(v.tipo, 'asegurad')}`;
$('#bajada-exito').innerHTML =
  `Te enviamos la póliza y el comprobante a <strong>${escapar(p.correo)}</strong>. ` +
  `El número de tu póliza es <strong>${escapar(pol.numero)}</strong>.`;

$('#comprobante').innerHTML = `
  <div class="boleta__cabeza">
    <div>
      <h3>Póliza ${escapar(pol.numero)}</h3>
      <span>Emitida el ${escapar(pol.fecha)}</span>
    </div>
    <span>${PRODUCTO}</span>
  </div>
  <div class="boleta__cuerpo">
    <div class="boleta__linea"><span>Contratante</span><strong>${escapar(p.nombres)} ${escapar(p.apellidos)}</strong></div>
    <div class="boleta__linea"><span>RUT</span><strong>${escapar(estadoHogar.rut)}</strong></div>
    <div class="boleta__linea"><span>Vivienda</span><strong>${escapar(tipo.rotulo)} de ${v.m2} m² · ${escapar(v.direccion)} ${escapar(v.numero)}, ${escapar(v.comuna)}</strong></div>
    <div class="boleta__linea"><span>Monto asegurado</span><strong>Estructura ${ufTxt(pol.montoEstructura)}${plan.cubreContenido ? ` · Contenido ${ufTxt(pol.montoContenido)}` : ''}</strong></div>
    <div class="boleta__linea"><span>Plan</span><strong>${escapar(plan.nombre)} · deducible ${estadoHogar.deducible} UF</strong></div>
    <div class="boleta__linea"><span>Vigencia</span><strong>Del ${escapar(vig.inicioTxt || pol.fecha)} al ${escapar(vig.terminoTxt || '—')}</strong></div>
    <div class="boleta__linea"><span>Forma de pago</span><strong>${cuotasPoliza === 1 ? 'Contado' : cuotasPoliza + ' cuotas de ' + clp(pol.valorCuota)}${estadoHogar.pago.diaCargo ? ' · día ' + estadoHogar.pago.diaCargo : ''}</strong></div>
    <div class="boleta__total">
      <span>Total ${Number(pol.cuotas) === 24 ? 'de los dos años' : 'del año'}</span>
      <strong>${clp(pol.total)}</strong>
    </div>
  </div>`;

/* Qué pasa ahora. Solo lo que se sabe: la vigencia escrita, el correo, el
   teléfono de Zurich y Mundo Zurich (zurich.cl). */
const pasos = [
  ['Tu vigencia', `Tu póliza corre del ${escapar(vig.inicioTxt || pol.fecha)} al ${escapar(vig.terminoTxt || '—')}.`],
  ['Revisa tu correo', 'Ahí llegan la póliza y el condicionado.'],
  ['Guarda el teléfono', 'Zurich te atiende en el 600 600 9090.'],
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
  </ol>
  <p class="campo__pista mt-6"><strong class="el-7">Tu ${asistencia.nombre.toLowerCase()} cubre:</strong> ${asistencia.servicios.join(' · ').toLowerCase()}.</p>`;

/* El comprobante se descarga como texto: en producción es el PDF que
   genera el sistema de emisión. */
$('#descargar').addEventListener('click', () => {
  const lineas = [
    'ZURICH CHILE SEGUROS GENERALES S.A.',
    `Comprobante de contratación — ${PRODUCTO}`,
    '',
    `Póliza: ${pol.numero}`,
    `Fecha de emisión: ${pol.fecha}`,
    `Contratante: ${p.nombres} ${p.apellidos} (${estadoHogar.rut})`,
    `Correo: ${p.correo}`,
    `Vivienda: ${tipo.rotulo} de ${v.m2} m², ${v.direccion} ${v.numero}${v.depto ? ', ' + v.depto : ''}, ${v.comuna}, Región ${v.region}`,
    `Monto asegurado: estructura ${ufTxt(pol.montoEstructura)}${plan.cubreContenido ? `, contenido ${ufTxt(pol.montoContenido)}` : ''}`,
    `Plan: ${plan.nombre} · deducible ${estadoHogar.deducible} UF`,
    `Asistencia: ${asistencia.nombre} (${asistencia.detalle})`,
    `Vigencia: del ${vig.inicioTxt || pol.fecha} al ${vig.terminoTxt || '—'}`,
    `Prima mensual: ${clp(pol.mensual)}`,
    `Total ${Number(pol.cuotas) === 24 ? 'de los dos años' : 'del año'}: ${clp(pol.total)}`,
    `Forma de pago: ${cuotasPoliza} cuota(s) de ${clp(pol.valorCuota)}`,
    '',
    'Cotizador de demostración. Datos ficticios, sin validez comercial.'
  ];
  const url = URL.createObjectURL(new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = `comprobante-${pol.numero}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  ev('hogar_p6_click_descargar_comprobante');
});

$('#volver-inicio').addEventListener('click', () => reiniciarHogar());

ev('hogar_p6_pag_poliza_contratada', { producto: 'hogar_facil_plus', poliza: pol.numero });
