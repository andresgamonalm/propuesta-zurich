/* =====================================================================
   Hogar · Paso 3 · Elige tu plan
   ---------------------------------------------------------------------
   Misma pantalla que /herramientas/auto-digital/planes/ en auto, pieza por pieza: los mandos
   arriba, los tres precios a la vista y el comparador plegado
   anclado al costado leyendo el precio en vivo.

   Lo que cambia respecto del cotizador de referencia, que es la
   pantalla donde más se nota:

   · EL PRECIO ES MENSUAL. Allá la caja grande dice «PRECIO ANUAL
     $685.686». En Chile la decisión de un seguro se toma con la cuota.
     El anual queda abajo, en letra chica, que es su lugar.

   · LA TABLA ESTÁ PLEGADA. Allá las 24 filas están desplegadas en la
     misma pantalla donde hay que decidir. Aquí van cuatro diferencias
     reales arriba y la tabla completa para quien la quiera.

   · LA TABLA ES VIVA. Los sublímites son porcentajes del monto
     asegurado —Demoliciones UF 245 sobre UF 4.900 es el 5%— pero en el
     cotizador de referencia la tabla parece fija. La nuestra se mueve al
     mover el contenido, y lo dice.
   ===================================================================== */

import { PLANES_HOGAR, DEDUCIBLES_HOGAR, ASISTENCIAS,
         EXCLUSIONES, DEFINICIONES, AVISOS, UF,
         numeroCotizacion, venceEl,
         contenidoMin, contenidoMax, CONTENIDO_MIN_PCT, CONTENIDO_MAX_PCT,
         acotaContenido } from './datos-hogar.js';
import { $, $$, estadoHogar, guardarHogar, ev, exigirHogar, montarComun,
         pintarPasosHogar, escapar, fechaLarga } from './comun-hogar.js';
import { cotizacionHogar, coberturasResueltas, pintarBarraHogar,
         clp, ufTxt } from './cotizacion-hogar.js';
import { avisarContexto } from './marco.js';

/* Sin el consentimiento entre los requisitos: ver h-vivienda.js. */
if (!exigirHogar('rut', 'persona', 'vivienda', 'monto')) {
  throw new Error('faltan pasos');
}

pintarPasosHogar('planes');
montarComun();

const v = estadoHogar.vivienda;

/* ── Vigencia ─────────────────────────────────────────────────────────
   Hogar no tenía esta opción: la cobertura corría doce meses y punto.
   La bienal duplica los meses, el precio de lista y las cuotas sin costo,
   de modo que la cuota mensual queda igual. Va junto al título y no en la
   fila del deducible porque define el contrato entero, no un parámetro.

   «Anual» y «Bienal» dicen lo que se contrata; el plazo va debajo, en
   chico, porque es el número que la gente compara. */
const VIGENCIAS = [12, 24];
const ROTULO_VIGENCIA = { 12: ['Anual', '12 meses'], 24: ['Bienal', '24 meses'] };
const selMeses = $('#sel-meses');
selMeses.innerHTML = VIGENCIAS.map(m => {
  const [nombre, plazo] = ROTULO_VIGENCIA[m];
  return `<button type="button" class="js-ev" id="meses-${m}" data-meses="${m}"
           aria-pressed="${m === (Number(estadoHogar.meses) || 12)}"
           aria-label="Vigencia ${nombre}, ${plazo}"
    >${nombre}<small>${plazo}</small></button>`;
}).join('');

selMeses.addEventListener('click', e => {
  const b = e.target.closest('[data-meses]');
  if (!b || Number(b.dataset.meses) === Number(estadoHogar.meses)) return;
  guardarHogar({ meses: Number(b.dataset.meses) });
  $$('[data-meses]', selMeses).forEach(x =>
    x.setAttribute('aria-pressed', String(Number(x.dataset.meses) === Number(estadoHogar.meses))));
  ev('hogar_p3_click_vigencia');
  ev('hogar_p3_rec_vigencia', { meses: estadoHogar.meses });
  pintar();
});

/* ── Deducible ────────────────────────────────────────────────────────
   En hogar va en UF por evento, no en tramos como en auto. */
const selDeducible = $('#sel-deducible');
selDeducible.innerHTML = DEDUCIBLES_HOGAR.map(d =>
  `<button type="button" class="js-ev" id="deducible-${d.uf}" data-deducible="${d.uf}"
           aria-pressed="${d.uf === estadoHogar.deducible}">${d.uf} UF</button>`).join('');

selDeducible.addEventListener('click', e => {
  const b = e.target.closest('[data-deducible]');
  if (!b) return;
  guardarHogar({ deducible: Number(b.dataset.deducible) });
  $$('[data-deducible]', selDeducible).forEach(x =>
    x.setAttribute('aria-pressed', String(Number(x.dataset.deducible) === estadoHogar.deducible)));
  ev('hogar_p3_click_deducible');
  ev('hogar_p3_rec_deducible', { deducible: estadoHogar.deducible });
  pintar();
});

/* ── Contenido asegurado ──────────────────────────────────────────────
   Los topes no son inventados: el contenido se asegura entre el 10% y el
   60% del edificio. Es criterio de suscripción del ramo, y por eso el
   mando no deja salirse de ahí. Es «Personalizar cotización», que en el
   cotizador de referencia es un paso entero, resuelto aquí en un control
   de cuatro pastillas. */
const estructura = Number(estadoHogar.montoEstructura) || 0;
const OPCIONES_CONTENIDO = [0.10, 0.25, 0.40, 0.60]
  .map(p => ({ pct: p, uf: Math.round(estructura * p) }));

const selContenido = $('#sel-contenido');
function pintarContenido() {
  selContenido.innerHTML = OPCIONES_CONTENIDO.map(o =>
    `<button type="button" class="js-ev" id="contenido-${Math.round(o.pct * 100)}"
             data-contenido="${o.uf}"
             aria-pressed="${o.uf === Number(estadoHogar.montoContenido)}">UF ${o.uf.toLocaleString('es-CL')}</button>`).join('');
}
pintarContenido();

selContenido.addEventListener('click', e => {
  const b = e.target.closest('[data-contenido]');
  if (!b) return;
  guardarHogar({ montoContenido: acotaContenido(Number(b.dataset.contenido), estructura) });
  pintarContenido();
  ev('hogar_p3_click_contenido');
  ev('hogar_p3_rec_contenido', { contenido_uf: estadoHogar.montoContenido });
  pintar();
});

/* ── Los tres precios ─────────────────────────────────────────────────
   Misma tarjeta que en auto, hasta en la clase CSS: si las dos pantallas
   se ven iguales es porque son la misma pieza, no porque se copiaron. */
function pintar() {
  const cont = $('#precios-tres');

  cont.innerHTML = PLANES_HOGAR.map(p => {
    const c = cotizacionHogar(p.id, estadoHogar.deducible);
    const elegido = estadoHogar.plan === p.id;
    return `
      <article class="precio-col" data-plan="${p.id}" data-elegido="${elegido}" data-recomendado="${!!p.recomendado}">
        <div class="precio-col__tapa">
          <h3>${p.corto}</h3>
          ${p.recomendado ? '<span class="precio-col__cinta">Recomendado</span>' : ''}
        </div>

        <p class="precio-col__monto"><sup>$</sup>${clp(c.mensual).slice(1)}</p>
        <!-- La prima está expresada en UF y se cobra al valor del día.
             El peso va grande porque es lo que se compara; la UF al lado
             porque es lo que se firma. -->
        <p class="precio-col__periodo">
          ${ufTxt(c.anualUF / 12)} al mes · ${c.cuotas} cuotas · ${clp(c.lista)} en ${c.meses} meses
        </p>

        <!-- Sin promoción publicada para Hogar Fácil Plus: no hay ahorro que mostrar. -->
        ${c.promo.activa ? `<p class="precio-col__ahorro"><strong>Ahorras ${clp(c.descuento)}</strong></p>` : ''}

        <ul class="precio-col__lista">
          ${p.destacados.map(([k, val]) => `<li><span>${k}</span><strong>${val}</strong></li>`).join('')}
        </ul>
        <p class="precio-col__nota-plan">${p.gancho}</p>

        <button class="btn ${elegido ? 'btn--primario' : 'btn--linea'} btn--bloque js-ev"
                type="button" id="elegir-${p.id}" data-elegir="${p.id}" data-plan="${p.id}">
          ${elegido ? 'Plan elegido' : 'Elegir este plan'}
        </button>
      </article>`;
  }).join('');

  $$('[data-elegir]', cont).forEach(b =>
    b.addEventListener('click', () => elegirPlan(b.dataset.elegir)));

  const tipo = v.tipo === 'departamento' ? 'un departamento' : 'una casa';
  $('#rotulo-vivienda').textContent =
    `${tipo} de ${v.m2} m² en ${v.comuna}, ${ufTxt(estructura)} asegurados`;

  /* Notas de los dos mandos */
  const c = cotizacionHogar(estadoHogar.plan, estadoHogar.deducible);
  const dMin = cotizacionHogar(estadoHogar.plan, 1).mensual;
  const dMax = cotizacionHogar(estadoHogar.plan, 5).mensual;
  $('#nota-deducible').innerHTML = estadoHogar.deducible === 5
    ? `<strong>Ahorras ${clp(dMin - dMax)} al mes</strong> frente al deducible de 1 UF. Asumes hasta 5 UF por siniestro.`
    : estadoHogar.deducible === 1
      ? 'Cubierto casi desde el primer peso. Es la prima más alta.'
      : `Subiendo a 5 UF ahorras ${clp(c.mensual - dMax)} al mes.`;

  const pctContenido = estructura ? Math.round((estadoHogar.montoContenido / estructura) * 100) : 0;
  $('#nota-contenido').innerHTML = estadoHogar.plan === 'estructura'
    ? 'El plan <strong>Estructura</strong> no cubre contenido. El mando mueve el precio de los otros dos.'
    : `Tus cosas quedan cubiertas hasta <strong>${ufTxt(estadoHogar.montoContenido)}</strong>, el ${pctContenido}% del edificio. Se asegura entre el ${Math.round(CONTENIDO_MIN_PCT * 100)}% y el ${Math.round(CONTENIDO_MAX_PCT * 100)}%.`;

  $('#nota-meses').innerHTML = c.meses === 24
    ? '<strong>Vigencia bienal</strong>: 24 meses cubiertos, con la misma cuota mensual que el plan anual.'
    : 'Con vigencia bienal son 24 meses cubiertos, con la misma cuota mensual.';

  pintarTabla();
  pintarBarraHogar();
  contarContexto();
}

/* Lo que MatIAs necesita para hablar de esta pantalla (ver p-planes.js). */
function contarContexto() {
  const c = cotizacionHogar(estadoHogar.plan, estadoHogar.deducible);
  const tipo = v.tipo === 'departamento' ? 'un departamento' : 'una casa';
  avisarContexto({
    producto: 'hogar-facil-plus',
    plan: estadoHogar.plan, deducible: estadoHogar.deducible, meses: c.meses, cuotas: c.cuotas,
    vivienda: `${tipo} de ${v.m2} m² en ${v.comuna}`,
    estructura: ufTxt(estructura), contenido: ufTxt(Number(estadoHogar.montoContenido) || 0),
    deducibles: DEDUCIBLES_HOGAR.map(d => d.uf),
    planes: PLANES_HOGAR.map(p => ({
      id: p.id, nombre: p.nombre, corto: p.corto, materia: p.materia,
      cubreContenido: p.cubreContenido, sinDeducibleEn: p.sinDeducibleEn,
      asistencia: ASISTENCIAS[p.asistencia]?.nombre || '',
      precios: Object.fromEntries(DEDUCIBLES_HOGAR.map(d => [d.uf, cotizacionHogar(p.id, d.uf).mensual]))
    }))
  });
}

function elegirPlan(id) {
  guardarHogar({ plan: id });
  const c = cotizacionHogar(id, estadoHogar.deducible);
  ev('hogar_p3_click_seleccionar_plan');
  ev('hogar_p3_rec_plan',   { plan: id });
  ev('hogar_p3_rec_precio', { precio: c.mensual, moneda: 'CLP' });
  pintar();
}

/* ── Comparador ───────────────────────────────────────────────────────
   Las tres columnas se resuelven con el mismo motor, cada una con su
   plan. Así la fila «Demoliciones» dice UF distinta en cada columna solo
   si el plan cambia la base, que es la verdad. */
function pintarTabla() {
  const porPlan = PLANES_HOGAR.map(p => coberturasResueltas(p.id));
  $('#tabla-coberturas').innerHTML = porPlan[0].map((fila, i) => {
    const celdas = porPlan.map(col => {
      const c = col[i];
      const marca = c.sinDeducible && col === porPlan[2] ? ' <small>sin deducible</small>' : '';
      return `<td class="${c.incluida ? '' : 'no'}">${c.monto}${c.incluida ? marca : ''}</td>`;
    }).join('');
    const derivada = fila.derivada ? ` <small>(${fila.derivada})</small>` : '';
    /* El código de la condición general depositada en la CMF y el
       deducible, cobertura por cobertura. Es lo que permite leer en
       cmfchile.cl exactamente lo que se contrató; con un solo código al
       pie no se puede. */
    const letra = [fila.codigo, fila.deducible && `Deducible: ${fila.deducible}`]
      .filter(Boolean).join(' · ');
    const pieFila = letra ? `<small class="tabla__codigo">${letra}</small>` : '';
    return `<tr><th class="el-5" scope="row">${fila.nombre}${derivada}${pieFila}</th>${celdas}</tr>`;
  }).join('');

  $('#nota-derivadas').innerHTML =
    `Los montos salen de tu monto asegurado: <strong>${ufTxt(estructura)}</strong> de estructura y <strong>${ufTxt(estadoHogar.montoContenido)}</strong> de contenido. Cambia el contenido arriba y esta tabla se mueve con él.`;
}

$('#comparador').addEventListener('toggle', e => {
  if (e.target.open) ev('hogar_p3_click_ver_mas');
});

/* ── Lo que no cubre y cómo se paga ───────────────────────────────── */
$('#lista-exclusiones').innerHTML = EXCLUSIONES.map(x => `<li>${escapar(x)}</li>`).join('');

$('#cuerpo-definiciones').innerHTML = DEFINICIONES.map(d =>
  `<p class="el-15"><strong class="el-7">${escapar(d.titulo)}</strong></p>
   <p>${escapar(d.texto)}</p>`).join('');

$('#exclusiones').addEventListener('toggle', e => {
  if (e.target.open) ev('hogar_p3_click_ver_exclusiones');
});
$('#como-se-paga').addEventListener('toggle', e => {
  if (e.target.open) ev('hogar_p3_click_ver_indemnizacion');
});

/* El número de cotización, su vigencia, el valor de la UF y los dos
   avisos que acompañan a un precio de seguros.

   El número no es burocracia: le da a la persona algo que nombrar si
   llama, y le pone fecha al mensaje de recuperación —«tu cotización
   N° HD-412387 vence el 22»— en vez de un «no olvides terminar». */
$('#nota-precios').innerHTML =
  `<strong class="el-7">Cotización N° ${escapar(numeroCotizacion(estadoHogar.rut))}</strong> · `
  + `válida hasta el ${escapar(fechaLarga(venceEl()))}. `
  + `Valor UF de hoy: ${escapar(clp(UF))}. ${escapar(AVISOS.tarificacion)} ${escapar(AVISOS.oferta)}`;

/* ── Las asistencias, con su contenido real ───────────────────────── */
$('#cuerpo-asistencias').innerHTML = ['hogar', 'sos', 'mascotas'].map(k => {
  const a = ASISTENCIAS[k];
  return `<p class="el-15"><strong class="el-7">${a.nombre}</strong> · ${a.detalle}</p>
          <p>${a.servicios.join(' · ')}</p>`;
}).join('');

$('#que-trae-asistencia').addEventListener('toggle', e => {
  if (e.target.open) ev('hogar_p3_click_ver_asistencias');
});

$('#abrir-deducible').addEventListener('click', () => {
  const d = $('#que-es-deducible');
  d.open = true;
  d.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

$('#abrir-contenido').addEventListener('click', () => {
  const d = $('#comparador');
  d.open = true;
  d.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ── Continuar ────────────────────────────────────────────────────── */
$('#continuar-p3').addEventListener('click', () => {
  ev('hogar_p3_click_continuar');
  location.href = '/herramientas/hogar-facil-plus/confirmacion/';
});

pintar();
ev('hogar_p3_pag_planes', { producto: 'hogar_facil_plus' });
void [contenidoMin, contenidoMax];
