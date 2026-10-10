// @ts-check
/* =====================================================================
   Protección Urgencias · Paso 2 · Tu plan
   ---------------------------------------------------------------------
   Los tres planes con su precio publicado, la misma tarjeta que Auto y
   Hogar. Las coberturas y lo que hay que saber antes de contratar salen
   del catálogo (zurich.cl), sin una palabra propia.
   ===================================================================== */
import { clp } from './datos.js';
import { PLANES, COBERTURAS, NOTA_PRECIO, ANTES, planPorId, ufPublicada } from './datos-urgencias.js';
import { $, $$, estadoU, guardarU, ev, exigirU, montarComun, pintarPasosU, escapar } from './comun-urgencias.js';

if (!exigirU('persona')) throw new Error('faltan pasos');

pintarPasosU('planes');
montarComun();

const CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';
const celda = (/** @type {unknown} */ v) => v === true ? 'Incluida' : v === false ? '—' : escapar(String(v));

function pintar() {
  $('#precios-tres').innerHTML = PLANES.map((p) => {
    const elegido = estadoU.plan === p.id;
    return `
      <article class="precio-col" data-plan="${p.id}" data-elegido="${elegido}">
        <div class="precio-col__tapa"><h3>${escapar(p.corto)}</h3></div>
        <p class="precio-col__monto"><sup>$</sup>${clp(p.primaPesos).slice(1)}*</p>
        <p class="precio-col__periodo">${ufPublicada(p.primaUF)} al mes · precio referencial publicado</p>
        <ul class="precio-col__lista">
          <li><span>Fallecimiento</span><strong>${escapar(p.monto)}</strong></li>
          <li><span>Acto quirúrgico por urgencia</span><strong>${escapar(p.urgencia)}</strong></li>
          <li><span>Sala de urgencia</span><strong>Incluida</strong></li>
          <li><span>Descuentos en farmacias</span><strong>Incluidos</strong></li>
        </ul>
        <button class="btn ${elegido ? 'btn--primario' : 'btn--linea'} btn--bloque" type="button"
                id="elegir-${p.id}" data-elegir="${p.id}">${elegido ? 'Plan elegido' : 'Elegir este plan'}</button>
      </article>`;
  }).join('');
  $$('[data-elegir]').forEach((b) => b.addEventListener('click', () => {
    guardarU({ plan: /** @type {HTMLElement} */ (b).dataset.elegir || 'estandar' });
    ev('urgencias_p2_rec_plan', { plan: estadoU.plan });
    pintar();
  }));
  const p = planPorId(estadoU.plan);
  $('#barra-etiqueta').textContent = `${p.nombre} · monto ${p.monto}`;
  $('#barra-precio').textContent = `${clp(p.primaPesos)} al mes`;
}

$('#nota-precio').textContent = NOTA_PRECIO;
$('#tabla-coberturas').innerHTML = COBERTURAS.map(([nombre, ...v]) => `
  <tr><th scope="row">${escapar(nombre)}</th>${v.map((x) => `<td class="${x === false ? 'no' : ''}">${celda(x)}</td>`).join('')}</tr>`).join('');
$('#cuerpo-antes').innerHTML = `
  <ul class="lista-check">${[...ANTES.requisitos, ...ANTES.condiciones].map((t) => `<li>${CHECK}<span>${escapar(t)}</span></li>`).join('')}</ul>`;

$('#continuar').addEventListener('click', () => {
  ev('urgencias_p2_click_continuar', { plan: estadoU.plan });
  location.href = '/herramientas/proteccion-urgencias/beneficiarios/';
});

pintar();
ev('urgencias_p2_pag_planes', { producto: 'proteccion_urgencias' });
