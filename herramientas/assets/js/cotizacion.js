/* =====================================================================
   Cotizador de demostración · Seguro de Auto Digital — cotizacion.js
   El precio, en un solo lugar.
   ---------------------------------------------------------------------
   Todas las pantallas leen de aquí. Si el asesor, la tarjeta del plan y
   la boleta calcularan cada uno por su lado, algún día mostrarían
   números distintos en la misma sesión.

   ARITMÉTICA DE LA PROMOCIÓN
   Prima mensual × meses       = lo que costaría a precio de lista
   − prima × cuotas sin costo  = lo que cubre la promoción
   = total a pagar             = lo que efectivamente se cobra
   ÷ número de cuotas          = valor de cada cuota

   VIGENCIA ANUAL Y BIENAL
   La bienal es el doble de meses cubiertos y de precio de lista, con la
   misma cuota mensual. La promoción sale de las bases oficiales (Zurich
   Days): solo con 24 meses, las cuotas 3 y 6 sin pago y la gift card.
   Con 12 meses, o fuera de fecha, no hay descuento.

   POR QUÉ TODO SE CALCULA EN UF
   La prima del seguro está expresada en UF, no en pesos, y se cobra al
   valor del día. Aquí el cálculo entero corre en UF y el paso a pesos
   ocurre al final, una sola vez. En una vigencia bienal eso no es un
   detalle contable: la UF sube durante esos veinticuatro meses, así que
   un precio en pesos fijos sería sencillamente falso. Los pesos que se
   muestran son referenciales, al valor de UF declarado en datos.js.
   ===================================================================== */

import { planPorId, primaUF, pesos, clp, ufTxt, UF } from './datos.js';
import { estado, $, escapar } from './comun.js';
import { promocionAuto, numerosTxt, enFrase } from './promocion.js';

/* Duración por defecto. El que manda es estado.meses: la cobertura se
   contrata por uno o por dos años y eso cambia cuántas cuotas hay, no
   cuánto vale cada una. */
export const MESES_COBERTURA = 12;
export const mesesActuales = () => Number(estado.meses) === 24 ? 24 : 12;

/* La promoción que corresponde a la vigencia elegida, hoy. Todas las
   pantallas piden esta: la boleta y la póliza no pueden prometer algo
   que el paso de planes no mostró. */
export const promocionActual = () => promocionAuto(mesesActuales());

export const vehiculoActual = () => ({
  marca: estado.vehiculo.marca || 'Hyundai',
  modelo: estado.vehiculo.modelo || 'Accent',
  anio: estado.vehiculo.anio || 2019
});

export function primaMensualUF(planId = estado.plan, deducible = estado.deducible) {
  const v = vehiculoActual();
  return primaUF(v.marca, v.anio, deducible, planId);
}

export function cotizacion(planId = estado.plan, deducible = estado.deducible,
                           cuotas = estado.pago?.cuotas || 12) {
  const plan = planPorId(planId);
  const mensualUF = primaMensualUF(planId, deducible);
  const mensual = pesos(mensualUF);

  /* La promoción depende de la vigencia, no del plan (bases Zurich Days). */
  const meses = mesesActuales();
  const anios = meses / MESES_COBERTURA;          // 1 en anual, 2 en bienal
  const promo = promocionAuto(meses);
  const gratis = promo.cuotasGratis;              // 2 (cuotas 3 y 6) o 0
  const lista = mensual * meses;
  const descuento = mensual * gratis;
  const total = lista - descuento;
  /* Al contratar dos años, el cobro se reparte en las 24 cuotas. El
     selector de cuotas del paso de pago sigue mandando dentro del año. */
  const cuotasReales = meses === 24 ? 24 : cuotas;
  const valorCuota = Math.round(total / cuotasReales);

  return {
    plan, promo, deducible, meses, anios, cuotasGratis: gratis,
    cuotas: cuotasReales,
    mensualUF, mensual, lista, listaAnual: lista, descuento, total, valorCuota,
    beneficio: promo.activa ? promo.beneficio : '',
    totalUF: total / UF
  };
}

/* ── RESUMEN LATERAL ──────────────────────────────────────────────── */
export function pintarResumen(selector = '#resumen', opciones = {}) {
  const cont = typeof selector === 'string' ? $(selector) : selector;
  if (!cont) return;

  const v = vehiculoActual();
  const c = cotizacion();
  const hayPlan = !!estado.plan;
  const tienePersona = !!estado.persona.nombres;

  cont.innerHTML = `
    <div class="resumen__uf">
      <span>UF de hoy</span>
      <strong>${clp(UF)}</strong>
    </div>

    ${tienePersona ? `
    <div class="resumen__caja">
      <h3>Asegurado</h3>
      <ul>
        <li><span>Nombre</span><strong>${escapar(estado.persona.nombres.split(' ')[0])} ${escapar(estado.persona.apellidos.split(' ')[0] || '')}</strong></li>
        <li><span>RUT</span><strong>${escapar(estado.rut)}</strong></li>
      </ul>
    </div>` : ''}

    <div class="resumen__caja">
      <h3>Vehículo</h3>
      <ul>
        <li><span>Marca</span><strong>${escapar(v.marca)}</strong></li>
        <li><span>Modelo</span><strong>${escapar(v.modelo)}</strong></li>
        <li><span>Año</span><strong>${v.anio}</strong></li>
        ${estado.vehiculo.patente ? `<li><span>Patente</span><strong>${escapar(estado.vehiculo.patente)}</strong></li>` : ''}
      </ul>
    </div>

    ${hayPlan && opciones.conPrecio !== false ? `
    <div class="resumen__caja">
      <h3>Tu plan</h3>
      <ul>
        <li><span>Plan</span><strong>${c.plan.corto}</strong></li>
        <li><span>Deducible</span><strong>${c.deducible} UF</strong></li>
        <li><span>Prima mensual</span><strong>${clp(c.mensual)}</strong></li>
      </ul>
    </div>` : ''}

    ${hayPlan && opciones.conPromo !== false && c.promo.activa ? `
    <div class="promo-caja el-1">
      <p class="etiqueta el-2">${escapar(c.promo.etiqueta)}</p>
      <p class="el-3">Cuotas ${numerosTxt(c.promo.numeros)} sin pago</p>
      <p class="el-4">Y ${escapar(enFrase(c.promo.beneficio))}. ${escapar(c.promo.entrega)}</p>
    </div>` : ''}`;
}

/* ── BARRA INFERIOR ───────────────────────────────────────────────── */
export function pintarBarra(etiqueta, valor) {
  const et = $('#barra-etiqueta'), pr = $('#barra-precio');
  if (!et || !pr) return;
  if (etiqueta !== undefined) { et.textContent = etiqueta; pr.textContent = valor; return; }

  const c = cotizacion();
  et.textContent = `${c.plan.corto} · deducible ${c.deducible} UF`;
  pr.textContent = `${clp(c.mensual)} al mes`;
}

export { clp, ufTxt, pesos };
