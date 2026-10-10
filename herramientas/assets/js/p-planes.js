/* =====================================================================
   Paso 3 · Elige tu plan
   ---------------------------------------------------------------------
   Cuatro diferencias arriba, el precio grande y las veinte coberturas
   restantes plegadas para quien las quiera. La promoción, solo si la
   hay: Zurich Days con vigencia de 24 meses (promocion.js).
   ===================================================================== */

import { DEDUCIBLES, PLANES, COBERTURAS, MESES_OPCIONES,
         primaUF, pesos, ufTxt } from './datos.js';
import { $, $$, estado, guardar, ev, exigir, montarComun, pintarPasos } from './comun.js';
import { pintarBarra, cotizacion, clp } from './cotizacion.js';
import { numerosTxt, enFrase } from './promocion.js';
import { avisarContexto } from './marco.js';

/* Sin el consentimiento entre los requisitos: ver p-vehiculo.js. */
if (!exigir('rut', 'persona', 'vehiculo')) throw new Error('faltan pasos');

pintarPasos('planes');
montarComun();

const v = estado.vehiculo;

/* ── Cobertura ────────────────────────────────────────────────────────
   Uno o dos años. Dos años son 24 cuotas del mismo valor —la prima
   mensual no cambia—. Con Zurich Days vigente, la de 24 meses lleva la
   promoción (promocion.js). */
const selMeses = $('#sel-meses');
/* «Anual» y «Bienal» dicen lo que se contrata; «12 meses» y «24 meses»
   solo dicen cuánto dura. El número va igual, en chico, porque es el
   dato que la gente compara. */
const ROTULO_VIGENCIA = { 12: ['Anual', '12 meses'], 24: ['Bienal', '24 meses'] };
selMeses.innerHTML = MESES_OPCIONES.map(m => {
  const [nombre, plazo] = ROTULO_VIGENCIA[m] || [`${m} meses`, ''];
  return `<button type="button" class="js-ev" id="meses-${m}" data-meses="${m}"
           aria-pressed="${m === (estado.meses || 12)}"
           aria-label="Vigencia ${nombre}, ${plazo}"
    >${nombre}<small>${plazo}</small></button>`;
}).join('');

selMeses.addEventListener('click', e => {
  const b = e.target.closest('[data-meses]');
  if (!b || Number(b.dataset.meses) === Number(estado.meses)) return;
  guardar({ meses: Number(b.dataset.meses) });
  $$('[data-meses]', selMeses).forEach(x =>
    x.setAttribute('aria-pressed', String(Number(x.dataset.meses) === Number(estado.meses))));
  ev('auto_p3_click_cobertura');
  ev('auto_p3_rec_cobertura', { meses: estado.meses });
  pintar();
});

/* ── Deducible ────────────────────────────────────────────────────── */
const sel = $('#sel-deducible');
sel.innerHTML = DEDUCIBLES.map(d =>
  `<button type="button" class="js-ev" id="deducible-${d}" data-deducible="${d}" aria-pressed="${d === estado.deducible}">${d} UF</button>`
).join('');

sel.addEventListener('click', e => {
  const b = e.target.closest('[data-deducible]');
  if (!b) return;
  cambiaDeducible(Number(b.dataset.deducible));
  ev('auto_p3_click_deducible');
  ev('auto_p3_rec_deducible', { deducible: estado.deducible });
});

function cambiaDeducible(d) {
  guardar({ deducible: d });
  $$('[data-deducible]', sel).forEach(x =>
    x.setAttribute('aria-pressed', String(Number(x.dataset.deducible) === d)));
  pintar();
}

/* ── Los tres precios ─────────────────────────────────────────────────
   Una fila compacta con los tres, no tres torres de quince líneas. Cada
   una trae lo suyo: nombre, precio grande y las cuatro diferencias que
   la separan de las otras dos —que aquí sí tienen sentido, porque están
   las tres al lado—. Un solo botón por tarjeta.

   Si hay promoción (Zurich Days con 24 meses), aquí van las cuotas sin
   pago, que son las que bajan el precio que se está mirando; la gift
   card se descubre en la confirmación. */
function pintar() {
  const cont = $('#precios-tres');

  cont.innerHTML = PLANES.map(p => {
    const c = cotizacion(p.id, estado.deducible);
    const elegido = estado.plan === p.id;
    return `
      <article class="precio-col" data-plan="${p.id}" data-elegido="${elegido}" data-recomendado="${!!p.recomendado}">
        <div class="precio-col__tapa">
          <h3>${p.corto}</h3>
          ${p.recomendado ? '<span class="precio-col__cinta">El más completo</span>' : ''}
        </div>

        <p class="precio-col__monto"><sup>$</sup>${clp(c.mensual).slice(1)}</p>
        <!-- La prima está expresada en UF y se cobra al valor del día. El
             peso va grande porque es lo que la gente compara, y la UF al
             lado porque es lo que realmente se firma. En vigencia bienal
             deja de ser un tecnicismo: la UF sube en esos dos años. -->
        <p class="precio-col__periodo">
          ${ufTxt(c.mensualUF)} al mes · ${c.cuotas} cuotas
        </p>

        <!-- El ahorro, solo si hay promoción: Zurich Days con 24 meses. -->
        ${c.promo.activa ? `<p class="precio-col__ahorro">
          <strong>Ahorras ${clp(c.descuento)}</strong>
          <span>${c.promo.etiqueta} · cuotas ${numerosTxt(c.promo.numeros)} sin pago</span>
        </p>` : ''}

        <ul class="precio-col__lista">
          ${p.destacados.map(([k, val]) => `<li><span>${k}</span><strong>${val}</strong></li>`).join('')}
        </ul>

        <button class="btn ${elegido ? 'btn--primario' : 'btn--linea'} btn--bloque js-ev"
                type="button" id="elegir-${p.id}" data-elegir="${p.id}" data-plan="${p.id}">
          ${elegido ? 'Plan elegido' : 'Elegir este plan'}
        </button>
      </article>`;
  }).join('');

  $$('[data-elegir]', cont).forEach(b =>
    b.addEventListener('click', () => elegirPlan(b.dataset.elegir)));

  $('#rotulo-vehiculo').textContent = `${v.marca} ${v.modelo} ${v.anio}`;

  const c = cotizacion(estado.plan, estado.deducible);
  const pr = c.promo;
  $('#nota-meses').innerHTML = !pr.disponible
    ? 'Con vigencia bienal son 24 meses cubiertos, con la misma cuota mensual.'
    : c.meses === 24
      ? `<strong>${pr.etiqueta}</strong>: con 24 meses, las cuotas ${numerosTxt(pr.numeros)} no se pagan y recibes una ${enFrase(pr.beneficio)}.`
      : `<strong>${pr.etiqueta}</strong>: con vigencia bienal (24 meses), las cuotas ${numerosTxt(pr.numeros)} no se pagan y recibes una ${enFrase(pr.beneficio)}.`;

  const nota = $('#nota-deducible');
  const ahorro = pesosDif(0, estado.deducible);
  nota.innerHTML = estado.deducible === 0
    ? 'Cubierto desde el primer peso. Es la prima más alta.'
    : `<strong>Ahorras ${clp(ahorro)} al mes</strong> frente a deducible 0 UF. Asumes hasta ${estado.deducible} UF por siniestro con culpa.`;

  pintarBarra();
  contarContexto();
}

/* Lo que MatIAs necesita para hablar de esta pantalla: el plan y el
   deducible elegidos, y el precio de cada plan con cada deducible. Los
   números salen de la misma cuenta que pintan las tarjetas. */
function contarContexto() {
  const c = cotizacion(estado.plan, estado.deducible);
  avisarContexto({
    producto: 'auto-digital',
    plan: estado.plan, deducible: estado.deducible, meses: c.meses, cuotas: c.cuotas,
    vehiculo: `${v.marca} ${v.modelo} ${v.anio}`,
    promo: { activa: c.promo.activa, disponible: c.promo.disponible, etiqueta: c.promo.etiqueta,
             numeros: c.promo.numeros, beneficio: c.promo.beneficio, cuotasGratis: c.cuotasGratis },
    deducibles: DEDUCIBLES,
    planes: PLANES.map(p => ({
      id: p.id, nombre: p.nombre, corto: p.corto, taller: p.taller, reemplazo: p.reemplazo,
      rc: p.rc, asistencia: p.asistencia, exclusivas: p.exclusivas,
      precios: Object.fromEntries(DEDUCIBLES.map(d => [d, cotizacion(p.id, d).mensual])),
      descuento: cotizacion(p.id, estado.deducible).descuento
    }))
  });
}

function pesosDif(dA, dB) {
  const val = d => primaUF(v.marca, v.anio, d, 'estandar');
  return pesos(val(dA) - val(dB));
}

function elegirPlan(id) {
  guardar({ plan: id });
  const c = cotizacion(id, estado.deducible);
  ev('auto_p3_click_seleccionar_plan');
  ev('auto_p3_rec_plan',   { plan: id });
  ev('auto_p3_rec_precio', { precio: c.mensual, moneda: 'CLP' });
  pintar();
  /* Ya no hay a dónde desplazarse: el precio está al lado del mando que
     se acaba de tocar y cambia a la vista. */
}

/* ── Comparador ───────────────────────────────────────────────────── */
$('#tabla-coberturas').innerHTML = COBERTURAS.map(([nombre, b, e, p]) => `
  <tr>
    <th class="el-5" scope="row">${nombre}</th>
    <td class="${b === '—' ? 'no' : ''}">${b}</td>
    <td class="${e === '—' ? 'no' : ''}">${e}</td>
    <td class="${p === '—' ? 'no' : ''}">${p}</td>
  </tr>`).join('');

$('#comparador').addEventListener('toggle', e => {
  if (e.target.open) ev('auto_p3_click_ver_mas');
});

$('#abrir-deducible').addEventListener('click', () => {
  const d = $('#que-es-deducible');
  d.open = true;
  d.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ── Continuar ────────────────────────────────────────────────────── */
$('#continuar').addEventListener('click', () => {
  ev('auto_p3_click_continuar');
  location.href = '/herramientas/auto-digital/confirmacion/';
});

pintar();
ev('auto_p3_pag_planes', { producto: 'auto_digital' });
