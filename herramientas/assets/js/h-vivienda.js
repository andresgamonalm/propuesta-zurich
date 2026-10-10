/* =====================================================================
   Hogar · Paso 2 · La vivienda
   ---------------------------------------------------------------------
   Dos bloques y nada más: dónde está la vivienda y cómo es. El objetivo
   declarado es que esta pantalla no se sienta un formulario.

   TRES DECISIONES

   1 · LA DIRECCIÓN YA ESTÁ. Viene de la misma base que el cotizador de
       auto, sin el vehículo. Es el activo del piloto: el RUT como llave.
       Llega llena y marcada, para que se revise en vez de escribirse.

   2 · EL MONTO ASEGURADO SE ESTIMA. Pedir la tasación bancaria es el
       punto exacto donde se cae una cotización: el cliente tendría que
       colgar y llamar al banco. Aquí sale de los metros por el costo de
       reposición del material, y queda editable por si la tiene.

   3 · SOLO SE PREGUNTA LO QUE MUEVE EL PRECIO. Hubo dos bloques más: un
       descuento por medidas de seguridad y dos preguntas de riesgo con
       recargo. Se retiraron por decisión del negocio. Sus porcentajes
       eran simulados y alargaban la pantalla antes de llegar a los
       metros, el material y el año, que es lo que de verdad tarifica.
   ===================================================================== */

import { COMUNAS } from './datos.js';
import {
  TIPOS_VIVIENDA, MATERIALES, materialPorId, regionDe,
  ANIO_ACTUAL, ANIO_MINIMO, ANTIGUEDAD_MAXIMA,
  USOS, usoPorId, esIsla,
  REQUISITOS, DERIVACIONES, estructuraUF, contenidoSugerido,
  acotaContenido, contenidoMin, contenidoMax, UF
} from './datos-hogar.js';
import {
  $, $$, estadoHogar, guardarHogar, ev, exigirHogar, montarComun,
  pintarPasosHogar, validarFormulario, marcarDeBase, autocompletar,
  pista, escapar
} from './comun-hogar.js';
import { clp, ufTxt } from './cotizacion-hogar.js';

/* El consentimiento ya no está entre los requisitos para entrar. La
   cláusula autoriza usos adicionales de los datos —comunicación
   comercial, perfilamiento, compartir dentro del grupo—, no la
   cotización: condicionar el precio a marcarla la convertía en peaje.
   Lo que sí sigue dependiendo de ella es el mensaje de recuperación,
   y eso está respetado en abandono.js. */
if (!exigirHogar('rut', 'persona')) throw new Error('faltan pasos');

pintarPasosHogar('vivienda');
montarComun();

const v = estadoHogar.vivienda;
const deBase = estadoHogar.origen === 'base';

/* ── Tipo de vivienda ─────────────────────────────────────────────────
   Dos tarjetas grandes con dibujo, no un desplegable. El elegido cambia
   borde, fondo y peso tipográfico a la vez: un borde de 1 px como única
   señal no se ve en un monitor con el brillo bajo. */
const ICONOS = {
  casa: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  departamento: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="3" width="15" height="18" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2"/><path d="M10.5 21v-4h3v4"/></svg>'
};

const selTipo = $('#sel-tipo');
selTipo.innerHTML = TIPOS_VIVIENDA.map(t => `
  <button type="button" class="opcion-tarjeta js-ev" id="tipo-${t.id}" role="radio"
          data-tipo="${t.id}" aria-checked="${v.tipo === t.id}">
    ${ICONOS[t.id]}<span>${t.rotulo}</span>
  </button>`).join('');

selTipo.addEventListener('click', e => {
  const b = e.target.closest('[data-tipo]');
  if (!b) return;
  v.tipo = b.dataset.tipo;
  $$('[data-tipo]', selTipo).forEach(x =>
    x.setAttribute('aria-checked', String(x.dataset.tipo === v.tipo)));
  ev('hogar_p2_rec_tipo_vivienda', { tipo: v.tipo });
  refrescar();
});

/* ── Cómo se usa la vivienda ──────────────────────────────────────────
   Las tres respuestas son las tres del catálogo real —permanente,
   vacacional y rural—, preguntadas por el uso y no por el producto.
   Dos de ellas no se cotizan acá y lo dicen de inmediato: el objetivo es
   que el camino sin salida aparezca en el primer clic y no después de
   escribir la dirección, los metros y el año.

   Que queden medidas importa: son la demanda que este canal está
   derivando, y es con ese número con el que se decide si vale la pena
   abrirlos. */
const selUso = $('#sel-uso');
if (!v.uso) v.uso = 'permanente';

selUso.innerHTML = USOS.map(u => `
  <button type="button" class="opcion-tarjeta js-ev" id="uso-${u.id}" role="radio"
          data-uso="${u.id}" aria-checked="${v.uso === u.id}">
    <span>${u.rotulo}</span>
    <span class="opcion-tarjeta__detalle">${u.detalle}</span>
  </button>`).join('');

selUso.addEventListener('click', e => {
  const b = e.target.closest('[data-uso]');
  if (!b) return;
  v.uso = b.dataset.uso;
  $$('[data-uso]', selUso).forEach(x =>
    x.setAttribute('aria-checked', String(x.dataset.uso === v.uso)));
  ev('hogar_p2_rec_uso_vivienda', { uso: v.uso });
  refrescar();
});

/* ── Dónde está ───────────────────────────────────────────────────────
   Lo que trajimos de la base va marcado, igual que en auto: hace visible
   el trabajo que le ahorramos e invita a revisarlo en vez de escribirlo. */
const cDireccion = $('#c-direccion'), iDireccion = $('#direccion');
const cNumero = $('#c-numero'), iNumero = $('#numero');
const iDepto = $('#depto');
const cComuna = $('#c-comuna'), iComuna = $('#comuna');
let region = '';

iDireccion.value = v.direccion || '';
iNumero.value = v.numero || '';
iDepto.value = v.depto || '';
iComuna.value = v.comuna || '';

if (deBase && v.direccion) { marcarDeBase(cDireccion); marcarDeBase(cNumero); marcarDeBase(cComuna); }

/* La región no se pregunta ni ocupa un campo: se deduce de la comuna y
   se confirma bajo ella, que es donde el cliente acaba de escribir. */
function pintarRegion() {
  region = regionDe(iComuna.value.trim());
  pista(cComuna, region ? `Región ${region}` : 'Elige una comuna de la lista.');
}
pintarRegion();

autocompletar(iComuna, COMUNAS, () => { pintarRegion(); refrescar(); });

/* Al escribir también se recalcula, no solo al elegir de la lista. Antes
   este oyente solo repintaba la región, y entonces quien escribía
   «Castro» completo sin tocar la sugerencia no veía la derivación por
   isla: el botón lo dejaba seguir a una pantalla de precios de una
   vivienda que este canal no asegura. Es el mismo trato que ya tienen
   la dirección, el número y el departamento. */
iComuna.addEventListener('input', () => { pintarRegion(); refrescar(); });

/* ── Cómo es ──────────────────────────────────────────────────────────
   Los tres datos con los que se calcula el monto asegurado. Sólido,
   Ligero y Mixto son las categorías de la ficha de Hogar Fácil Plus: si
   el cotizador usa un vocabulario y la póliza otro, el cliente no puede
   comprobar que contrató lo que cotizó. */
const iM2 = $('#m2'), cM2 = $('#c-m2');
const selMaterial = $('#material'), selAnio = $('#anio'), cAnio = $('#c-anio');

iM2.value = v.m2 || '';
iM2.addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  refrescar();
});

/* El adobe va en la lista aunque no se cotice. Si no estuviera, quien
   vive en una casa de adobe elegiría «sólido» —que es a lo que se
   parece— y el problema saldría recién al liquidar un siniestro. Acá se
   declara, se avisa y se deriva. */
selMaterial.innerHTML = MATERIALES.map(m =>
  `<option value="${m.id}"${m.id === v.material ? ' selected' : ''}>${m.rotulo}</option>`).join('');
selMaterial.addEventListener('change', () => {
  v.materialTipo = '';
  ev('hogar_p2_rec_material', { material: selMaterial.value });
  pintarTipoMaterial();
  refrescar();
});

/* El material exacto —ladrillo, hormigón, metalcón, madera—. No mueve el
   precio: hace que lo declarado y lo que dirá la póliza sean la misma
   palabra. Por eso es opcional y no bloquea el paso. */
const cajaTipoMaterial = $('#caja-material-tipo'), selTipoMaterial = $('#material-tipo');

function pintarTipoMaterial() {
  const m = materialPorId(selMaterial.value);
  const tipos = m.tipos || [];
  if (!tipos.length) { cajaTipoMaterial.hidden = true; return; }
  cajaTipoMaterial.hidden = false;
  selTipoMaterial.innerHTML =
    `<option value="">¿Cuál exactamente? (opcional)</option>` +
    tipos.map(t => `<option value="${t}"${t === v.materialTipo ? ' selected' : ''}>${t}</option>`).join('');
}

selTipoMaterial.addEventListener('change', () => {
  v.materialTipo = selTipoMaterial.value;
  ev('hogar_p2_rec_material_tipo', { tipo: selTipoMaterial.value });
  refrescar();
});
pintarTipoMaterial();

/* Del año actual hacia atrás hasta el límite de asegurabilidad, que son
   los 75 años publicados en la ficha del producto. */
const anios = [];
for (let a = ANIO_ACTUAL; a >= ANIO_MINIMO; a--) anios.push(a);
selAnio.innerHTML = '<option value="">Elige…</option>' + anios.map(a =>
  `<option value="${a}"${Number(v.anio) === a ? ' selected' : ''}>${a}</option>`).join('');
selAnio.addEventListener('change', () => {
  ev('hogar_p2_rec_anio_construccion', { anio: selAnio.value });
  refrescar();
});

/* ── El monto asegurado ───────────────────────────────────────────────
   La pieza que reemplaza al campo de la tasación bancaria. */
const cajaEstimado = $('#estimado');
let montoEditado = Number(estadoHogar.montoEstructura) > 0 && !!v.m2;

function pintarEstimado() {
  const m2 = Number(iM2.value) || 0;
  const material = materialPorId(selMaterial.value);
  const calculado = estructuraUF(m2, material.id);
  const estructura = montoEditado && Number(estadoHogar.montoEstructura) > 0
    ? Number(estadoHogar.montoEstructura) : calculado;

  if (!m2) {
    cajaEstimado.innerHTML = `
      <p class="estimado__rotulo">Monto asegurado</p>
      <p class="estimado__equivalente">Escribe los metros construidos y lo calculamos. No hace falta que se lo preguntes al banco.</p>`;
    return;
  }

  /* Con una derivación en curso no se muestra ninguna cifra. Un «UF 0»
     se lee como un error del sitio; y un monto calculado para una
     vivienda que este canal no asegura es una promesa que no se puede
     cumplir. */
  if (causaDerivacion()) {
    cajaEstimado.innerHTML = `
      <p class="estimado__rotulo">Monto asegurado</p>
      <p class="estimado__equivalente">Esta vivienda la cotiza un ejecutivo, así que acá no calculamos el monto.</p>`;
    return;
  }

  cajaEstimado.innerHTML = `
    <div class="estimado__fila">
      <div>
        <p class="estimado__rotulo">Monto asegurado · estructura</p>
        <p class="estimado__monto">${ufTxt(estructura)}</p>
        <p class="estimado__equivalente">${clp(estructura * UF)} al valor UF de hoy</p>
      </div>
      <div class="estimado__editar">
        <label for="monto-manual">¿Tienes la tasación?</label>
        <div class="campo__caja">
          <input id="monto-manual" type="text" inputmode="numeric" size="1"
                 value="${estructura}" aria-label="Monto asegurado en UF">
          <span class="campo__sufijo">UF</span>
        </div>
      </div>
    </div>
    <p class="estimado__nota">
      Son <strong>${m2} m²</strong> por el costo de reponer un metro construido de material
      <strong>${escapar(material.rotulo.toLowerCase())}</strong>. Es lo que costaría levantarla de nuevo,
      no lo que vale la propiedad: el terreno no se asegura porque no se quema ni se cae.
      ${montoEditado && calculado !== estructura ? '<br><strong>Lo cambiaste tú.</strong> Nuestra estimación era ' + ufTxt(calculado) + '.' : ''}
    </p>`;

  const manual = $('#monto-manual');
  manual.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
  });
  manual.addEventListener('change', e => {
    const val = Number(e.target.value) || 0;
    if (val > 0) {
      montoEditado = true;
      guardarHogar({ montoEstructura: val });
      ev('hogar_p2_rec_monto_editado', { monto_uf: val });
      refrescar();
    }
  });
}

/* ── Requisitos de asegurabilidad ───────────────────────────────────
   Quedan como referencia desplegable, no como un muro con un botón de
   «sí, cumplo». Lo que de verdad se declara son las tres preguntas de la
   confirmación; lo demás el sistema ya lo sabe por la comuna, el año y
   el material. */
$('#lista-requisitos').innerHTML = REQUISITOS.map(r => `<li>${r}</li>`).join('');
$('#nota-requisitos').textContent =
  'La antigüedad, la zona y el material los comprobamos con lo que ya nos dijiste. ' +
  'Lo que solo tú sabes te lo preguntamos al final, antes de firmar.';

/* ── Refresco ─────────────────────────────────────────────────────────
   Un solo sitio recalcula todo lo que depende de los campos: el monto,
   el descuento, la barra de abajo y los avisos de derivación. */
function refrescar() {
  Object.assign(v, {
    tipo: v.tipo, direccion: iDireccion.value.trim(), numero: iNumero.value.trim(),
    depto: iDepto.value.trim(), comuna: iComuna.value.trim(), region,
    material: selMaterial.value, anio: Number(selAnio.value) || null,
    m2: Number(iM2.value) || null
  });

  const m = materialPorId(selMaterial.value);
  pista($('#c-material'), m.detalle);

  if (!montoEditado) {
    const est = estructuraUF(v.m2, v.material);
    guardarHogar({ montoEstructura: est, montoContenido: contenidoSugerido(est) });
  } else {
    const est = Number(estadoHogar.montoEstructura) || 0;
    guardarHogar({ montoContenido: acotaContenido(estadoHogar.montoContenido || contenidoSugerido(est), est) });
  }
  guardarHogar({ vivienda: v });

  pintarEstimado();

  /* La barra de abajo lleva el monto asegurado y no un precio: en este
     paso todavía no se eligió plan, y una cifra que nadie eligió
     confunde. El monto sí es suyo, acaba de calcularlo, y es el número
     del que cuelga todo lo que verá en la pantalla siguiente. */
  const et = $('#barra-etiqueta'), pr = $('#barra-precio');
  if (et && pr) {
    const monto = Number(estadoHogar.montoEstructura) || 0;
    et.textContent = 'Monto asegurado';
    pr.textContent = causaDerivacion() ? 'Lo ve un ejecutivo'
      : monto > 0 ? `${ufTxt(monto)} · ${clp(monto * UF)}` : 'Falta los metros';
  }

  avisoDerivacion();
}

/* ── Derivaciones ─────────────────────────────────────────────────────
   Decir «esto lo ve un ejecutivo» es mejor que cotizar mal. Son cuatro
   causas y las cuatro se detectan con lo que la persona ya escribió, sin
   preguntarle nada de más:

     uso       · segunda vivienda o sector rural → otro plan
     material  · adobe, excluido de la póliza
     comuna    · isla
     año       · sobre los 75 de antigüedad

   Mientras haya una, el botón no avanza. Antes el aviso aparecía y el
   botón seguía funcionando: la persona llegaba a la pantalla de precios
   de un producto que no podía contratar. */
function causaDerivacion() {
  const uso = usoPorId(v.uso);
  if (!uso.cotiza) return uso.deriva || '';
  if (materialPorId(selMaterial.value).excluido) return 'adobe';
  if (esIsla(iComuna.value.trim())) return 'isla';
  if (v.anio && ANIO_ACTUAL - v.anio > ANTIGUEDAD_MAXIMA) return 'antigua';
  return '';
}

let aviso = null;
let causaAvisada = '';
function avisoDerivacion() {
  const causa = causaDerivacion();
  const texto = causa ? DERIVACIONES[causa] : '';
  const btn = $('#continuar-p2');

  if (btn) {
    btn.setAttribute('aria-disabled', String(!!texto));
    btn.textContent = texto ? 'Lo cotiza un ejecutivo' : 'Ver mi precio';
  }

  if (!texto) { aviso?.remove(); aviso = null; causaAvisada = ''; return; }

  if (!aviso) {
    aviso = document.createElement('div');
    aviso.className = 'mensaje mensaje--aviso mt-4';
    $('#requisitos').before(aviso);
  }
  /* El piloto dejaba aquí a la persona sin salida. La salida es el teléfono de Zurich. */
  aviso.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span>${texto} <a class="enlace" href="tel:6006009090">Llama a Zurich al 600 600 9090</a>.</span>`;

  /* Una medición por causa, no una por tecla: `refrescar` corre en cada
     pulsación y si no se filtra, escribir la dirección dispara treinta
     eventos iguales. */
  if (causa !== causaAvisada) {
    causaAvisada = causa;
    ev('hogar_p2_rec_derivacion', { causa });
  }
}

[iDireccion, iNumero, iDepto].forEach(i =>
  i.addEventListener('input', refrescar));

refrescar();

/* ── Envío ────────────────────────────────────────────────────────── */
$('#form-vivienda').addEventListener('submit', e => {
  e.preventDefault();

  /* Si hay derivación, acá se termina: no hay precio que mostrar. */
  const causa = causaDerivacion();
  if (causa) {
    ev('hogar_p2_click_continuar_derivado', { causa });
    $('#requisitos').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const ok = validarFormulario([
    { campo: cDireccion, input: iDireccion,
      valido: v2 => v2.length >= 3, mensaje: 'Escribe la calle o avenida de tu vivienda.' },
    { campo: cNumero, input: iNumero,
      valido: v2 => /^\d{1,6}$/.test(v2), mensaje: 'Falta el número.' },
    { campo: cComuna, input: iComuna,
      valido: v2 => COMUNAS.includes(v2), mensaje: 'Elige una comuna de la lista.' },
    { campo: cM2, input: iM2,
      valido: v2 => Number(v2) >= 20 && Number(v2) <= 2000,
      mensaje: 'Escribe los metros construidos, entre 20 y 2.000.' },
    { campo: cAnio, input: selAnio,
      valido: v2 => !!v2, mensaje: 'Elige el año de construcción.' }
  ]);

  if (!ok) return;

  refrescar();
  const est = Number(estadoHogar.montoEstructura) || 0;
  guardarHogar({
    montoContenido: acotaContenido(estadoHogar.montoContenido || contenidoSugerido(est), est)
  });

  ev('hogar_p2_rec_vivienda', {
    tipo: v.tipo, material: v.material, m2: v.m2,
    monto_uf: estadoHogar.montoEstructura,
    anio: v.anio
  });
  ev('hogar_p2_click_continuar');
  location.href = '/herramientas/hogar-facil-plus/planes/';
});

ev('hogar_p2_pag_vivienda', { producto: 'hogar_facil_plus' });
void [contenidoMin, contenidoMax];

