/* =====================================================================
   Cotizador de demostración · Hogar Fácil Plus — cotizacion-hogar.js
   El precio, en un solo lugar.
   ---------------------------------------------------------------------
   Misma regla que en auto: si la tarjeta del plan, la boleta y el asesor
   calcularan cada uno por su lado, algún día mostrarían números
   distintos en la misma sesión.

   ARITMÉTICA, EN DOS CAPAS Y EN ESTE ORDEN

   1 · CUOTAS SIN COSTO
       Hogar Fácil Plus no tiene una promoción de cuotas publicada en
       zurich.cl, así que no hay descuento (SIN_PROMOCION). La aritmética
       queda lista para el día que la haya:
       prima mensual × meses − prima × cuotas sin costo = total a pagar

   2 · REPARTO
       total ÷ número de cuotas        valor de cada cuota

   Hubo una capa antes de estas dos: un descuento por medidas de
   seguridad de la vivienda, con sus porcentajes, y un recargo por uso.
   Se retiró por decisión del negocio. Los porcentajes eran simulados y
   el bloque alargaba el formulario antes de llegar a lo que de verdad
   mueve el precio, que son los metros, el material y el año.

   VIGENCIA ANUAL Y BIENAL
   Igual que en auto: la bienal duplica los meses cubiertos, el precio de
   lista y las cuotas sin costo —dos este año y dos el próximo—, de modo
   que la cuota mensual queda idéntica. Hasta ahora hogar no tenía esta
   opción y la cobertura corría doce meses siempre.

   La prima está expresada en UF y se cobra al valor del día. El cálculo
   corre en UF y el paso a pesos ocurre al final: en una vigencia de dos
   años eso importa, porque la UF sube en ese plazo.
   ===================================================================== */

import { clp, ufTxt } from './datos.js';
import { PLANES_HOGAR, planHogarPorId, COBERTURAS_HOGAR, ASISTENCIAS,
         primaAnualUF, desglosePrima, UF, pesos } from './datos-hogar.js';
import { SIN_PROMOCION } from './promocion.js';
import { estadoHogar, $ } from './comun-hogar.js';

export const MESES_COBERTURA = 12;

/* El que manda es estadoHogar.meses. Solo se aceptan doce o veinticuatro:
   cualquier otro valor cae a doce, así que un estado corrupto no puede
   inventar una vigencia que no existe. */
export const mesesActualesHogar = () => Number(estadoHogar.meses) === 24 ? 24 : 12;

/* Los parámetros de tarificación que salen del estado. Un solo sitio
   arma el objeto, así que ninguna pantalla puede olvidarse de uno. */
export function parametros(planId = estadoHogar.plan, deducibleUF = estadoHogar.deducible) {
  const v = estadoHogar.vivienda;
  return {
    planId, deducibleUF,
    estructura: Number(estadoHogar.montoEstructura) || 0,
    contenido: Number(estadoHogar.montoContenido) || 0,
    materialId: v.material, tipoViviendaId: v.tipo, anio: v.anio
  };
}

export function cotizacionHogar(planId = estadoHogar.plan,
                                deducibleUF = estadoHogar.deducible,
                                cuotas = estadoHogar.pago?.cuotas || 12) {
  const plan = planHogarPorId(planId);
  const p = parametros(planId, deducibleUF);

  const anualUF = primaAnualUF(p);
  const mensual = pesos(anualUF / 12);

  /* Capa 1 · cuotas sin costo: sin promoción publicada, cero. */
  const promo = SIN_PROMOCION;
  const meses = mesesActualesHogar();
  const anios = meses / MESES_COBERTURA;          // 1 en anual, 2 en bienal
  const gratis = promo.cuotasGratis;
  const lista = mensual * meses;
  const descuento = mensual * gratis;
  const total = lista - descuento;

  /* Capa 2 · reparto. En bienal el cobro se reparte en las 24 cuotas; el
     selector de cuotas del paso de pago sigue mandando dentro del año. */
  const cuotasReales = meses === 24 ? 24 : (cuotas || 12);
  const valorCuota = Math.round(total / cuotasReales);

  return {
    plan, promo, deducibleUF, meses, anios, cuotasGratis: gratis,
    cuotas: cuotasReales,
    montoEstructura: p.estructura,
    montoContenido: plan.cubreContenido ? p.contenido : 0,
    anualUF, mensual,
    lista, listaAnual: lista, descuento, total, valorCuota,
    totalUF: total / UF,
    /* Las tres líneas que exige una cotización de seguros: prima afecta,
       prima exenta e IVA. Se abre hacia atrás desde el total, así que el
       precio que ve la persona no cambia por mostrarlo. */
    desglose: desglosePrima(total / UF),
    beneficio: null
  };
}

/* ── COBERTURAS RESUELTAS ─────────────────────────────────────────────
   Los sublímites salen del monto asegurado, no de una tabla fija. Es lo
   que hace de verdad una póliza —Demoliciones UF 245 sobre un monto de
   UF 4.900 es el 5%— solo que normalmente no se nota y aquí sí: al mover
   el monto, la tabla se mueve. */
export function coberturasResueltas(planId = estadoHogar.plan) {
  const plan = planHogarPorId(planId);
  const estructura = Number(estadoHogar.montoEstructura) || 0;
  const contenido = plan.cubreContenido ? (Number(estadoHogar.montoContenido) || 0) : 0;

  return COBERTURAS_HOGAR.map(c => {
    const incluida = c.planes.includes(plan.id);
    let monto = '—';
    if (incluida) {
      if (c.base === 'estructura')   monto = ufTxt(estructura);
      else if (c.base === 'contenido') monto = ufTxt(contenido);
      else if (c.base === 'pct')     monto = ufTxt(estructura * (c.pct ?? 0));
      else if (c.base === 'fijo')    monto = ufTxt(c.uf);
      else                           monto = 'Incluida';
    }
    return {
      nombre: c.nombre, incluida, monto,
      codigo: c.codigo || '',
      deducible: c.deducible || '',
      derivada: incluida && c.base === 'pct' ? `${Math.round((c.pct ?? 0) * 100)}% del edificio` : '',
      sinDeducible: !!(c.sinDeduciblePremium && plan.sinDeducibleEn.length)
    };
  })
  /* Lo incluido primero y lo que no, al final. Una tabla de coberturas
     que abre con dos «—» se lee como un producto pobre aunque no lo sea:
     la segunda fila es la que decide si la persona sigue leyendo. El
     orden relativo de cada grupo se conserva, así que la lista sigue
     yendo de lo grande a lo accesorio. */
  .sort((a, b) => Number(b.incluida) - Number(a.incluida));
}

/* Lo que el plan trae de asistencia, resuelto a su contenido real. */
export const asistenciaDe = planId => ASISTENCIAS[planHogarPorId(planId).asistencia];

/* ── BARRA INFERIOR ───────────────────────────────────────────────────
   Misma pieza que en auto: el precio siempre a la vista mientras se
   completa el formulario. */
export function pintarBarraHogar(etiqueta, valor) {
  const et = $('#barra-etiqueta'), pr = $('#barra-precio');
  if (!et || !pr) return;
  if (etiqueta !== undefined) { et.textContent = etiqueta; pr.textContent = valor; return; }

  const c = cotizacionHogar();
  et.textContent = `${c.plan.corto} · deducible ${c.deducibleUF} UF`;
  pr.textContent = `${clp(c.mensual)} al mes`;
}

export { clp, ufTxt, pesos, UF, PLANES_HOGAR };
