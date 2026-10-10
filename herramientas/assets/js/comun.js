/* =====================================================================
   Cotizador de demostración · Seguro de Auto Digital — comun.js
   Lo que comparten las pantallas del recorrido (también las de hogar y
   Protección Urgencias, que lo reexportan).
   ---------------------------------------------------------------------
   · ESTADO      un solo objeto en localStorage con caducidad de siete
                 días (almacen.js), con guardas por paso
   · PASOS       la barra de progreso, calculada, no escrita a mano
   · CAMPOS      validación, «por qué te lo pedimos» y autocompletado
   · MEDICIÓN    nomenclatura auto_pN_grupo_qué, ya acordada
   Nada de esto sale del navegador. La búsqueda por RUT se resuelve
   contra un índice en memoria.
   ===================================================================== */

/* datos.js no importa a nadie, así que traerlo aquí no arma un ciclo.
   cotizacion.js sí importa este módulo: por eso la cuenta de la póliza
   de la semilla se repite abajo en vez de pedírsela a él. */
import { buscaCliente, primaUF, pesos } from './datos.js';
import { montarDatosPrueba } from './datos-prueba.js';
import { leerAlmacen, guardarAlmacen, borrarAlmacen } from './almacen.js';
import { avisarPaso, avisarFoco, vigilarAlto, pasoActual } from './marco.js';
import { promocionAuto } from './promocion.js';
import { leer as leerSitio } from '/assets/js/almacen.js';

export const $  = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ── ESTADO ───────────────────────────────────────────────────────── */
const LLAVE = 'zurich_demo_auto';

const VACIO = {
  rut: '', origen: null,
  persona:    { nombres: '', apellidos: '', correo: '', celular: '', comuna: '' },
  consentimiento: false,
  vehiculo:   { nuevo: false, patente: '', marca: '', modelo: '', anio: null,
                motor: '', chasis: '', color: '' },
  domicilio:  { direccion: '', numero: '', tipo: '', depto: '', comuna: '' },
  plan: 'estandar', deducible: 5,
  /* Duración de la cobertura: uno o dos años. Dos años son 24 cuotas del
     mismo valor; con Zurich Days vigente, la de 24 meses lleva la
     promoción (promocion.js). */
  meses: 12,
  pago: { cuotas: 12, diaCargo: '' },
  poliza: null
};

const clonar = o => JSON.parse(JSON.stringify(o));

function leer() {
  const sobre = leerAlmacen(LLAVE);
  return sobre ? { ...clonar(VACIO), ...sobre.datos } : clonar(VACIO);
}

/** Cuándo se guardó lo que hay, o null si no hay nada vigente. Lo usa el
    aviso de «tenías algo a medias» para decir cuántos días le quedan. */
export function guardadoEn() {
  return leerAlmacen(LLAVE)?.guardadoEn ?? null;
}

/** El elemento del que salió un evento, o null si no salió de uno.

   `e.target` es un EventTarget, que no tiene `closest`: puede ser el
   documento, una ventana o un nodo de texto. Escribir `e.target.closest`
   funciona casi siempre y falla en los casos raros, que son justo los que
   nadie prueba. Este ayudante lo estrecha en un solo lugar en vez de
   repetir la comprobación en cada escucha.

   @param {Event} e
   @returns {Element|null} */
export const elementoDe = e => (e.target instanceof Element ? e.target : null);

/** El estado de esta cotización.

   Se declara su forma con JSDoc porque `leer()` termina en un
   `JSON.parse`, que devuelve `any`: sin la anotación, el verificador no
   sabe qué contiene y no puede avisar de un campo mal escrito. La forma
   está en tipos.js, que es un archivo de solo tipos y no viaja al
   navegador.

   Es `const` pero mutable por dentro, a propósito: las pantallas lo
   modifican con `guardar()`, que además lo persiste. Reasignarlo rompería
   la referencia que ya tienen los módulos importados.

   @type {import('./tipos.js').EstadoAuto} */
export const estado = leer();

export function guardar(parcial = {}) {
  Object.assign(estado, parcial);
  guardarAlmacen(LLAVE, estado);
  return estado;
}

export function reiniciar() {
  borrarAlmacen(LLAVE);
  Object.assign(estado, clonar(VACIO));
}

/* Semilla de demostración. Con ?demo en la URL, cualquier pantalla del
   recorrido se abre con el estado ya completo: sirve para revisar el
   paso 4 o el 5 sin recorrer el formulario entero en cada iteración.
   El RUT se puede fijar con ?demo=30517786-5. */
function semillaDemo(rut) {
  const parametros = new URLSearchParams(location.search);
  const meses = parametros.get('meses') === '24' ? 24 : 12;
  const base = {
    rut: '30517786-5', origen: 'base',
    persona: { nombres: 'Sofía Belén', apellidos: 'Navarro Mella',
               correo: 'sofia.navarro.001@datos-ficticios.test',
               celular: '56900000001', comuna: 'Las Condes' },
    consentimiento: true,
    vehiculo: { nuevo: false, patente: 'ZZBB01', marca: 'Toyota', modelo: 'RAV4',
                anio: 2026, motor: 'SQR371FBHJG50564', chasis: 'LVVDB12B9KB010829',
                color: 'Blanco' },
    domicilio: { direccion: 'Avenida Prueba de Datos', numero: '110',
                 tipo: 'Departamento', depto: 'Depto. 101', comuna: 'Las Condes' },
    plan: 'estandar', deducible: 5, meses,
    pago: { cuotas: 12, diaCargo: '5' },
    poliza: null
  };
  /* Con ?demo=<rut> la semilla es la de esa persona, si está en la base. */
  if (rut && rut !== '1' && /^[\d.\-kK]+$/.test(rut)) {
    const c = buscaCliente(rut.replace(/\./g, ''));
    if (c) {
      base.rut = c.rut.replace(/\./g, '');
      base.persona = { nombres: c.nombres, apellidos: c.apellidos,
                       correo: c.correo, celular: String(c.celular), comuna: c.comuna };
      base.vehiculo = { ...base.vehiculo, patente: c.patente, marca: c.marca,
                        modelo: c.modelo, anio: c.anio };
      base.domicilio = { direccion: c.direccion, numero: String(c.numero),
                         tipo: /depto/i.test(c.depto) ? 'Departamento' : 'Casa',
                         depto: c.depto, comuna: c.comunaDom };
    }
  }
  /* ?plan= sirve para revisar los tres planes sin recorrer el formulario. */
  const plan = parametros.get('plan');
  if (plan && ['basico', 'estandar', 'premium'].includes(plan)) base.plan = plan;

  /* La póliza se calcula con la misma aritmética que cotizacion.js (no se
     importa de ahí porque ese módulo importa este). */
  const mensual = pesos(primaUF(base.vehiculo.marca, base.vehiculo.anio, base.deducible, base.plan));
  const promo = promocionAuto(meses);
  const descuento = mensual * promo.cuotasGratis;
  const total = mensual * meses - descuento;
  const cuotas = meses === 24 ? 24 : 12;
  base.poliza = { numero: 'AD-00000001', fecha: fechaLarga(), total, mensual, descuento,
                  valorCuota: Math.round(total / cuotas), meses, cuotas };
  guardar(base);
}

/* Guarda de paso: si alguien entra directo a /pagar sin haber pasado por
   el formulario, vuelve al inicio en vez de mostrar una pantalla rota. */
export function exigir(...requisitos) {
  const demo = new URLSearchParams(location.search).get('demo');
  if (demo !== null) semillaDemo(demo);
  const cumple = {
    rut:       () => !!estado.rut,
    persona:   () => !!estado.persona.nombres && !!estado.persona.correo,
    consentimiento: () => estado.consentimiento === true,
    vehiculo:  () => !!estado.vehiculo.marca && !!estado.vehiculo.anio,
    domicilio: () => !!estado.domicilio.direccion,
    plan:      () => !!estado.plan,
    poliza:    () => !!estado.poliza
  };
  /* Sin lo necesario, vuelve al primer paso: el cotizador no tiene portada. */
  for (const r of requisitos) {
    if (cumple[r] && !cumple[r]()) { location.replace(PASOS[0].url); return false; }
  }
  return true;
}

/* ── MEDICIÓN ─────────────────────────────────────────────────────── */
/* Nomenclatura acordada: minúsculas, guion bajo, sin tildes,
   producto_paso_grupo_qué. La home es el paso 0. */
window.dataLayer = window.dataLayer || [];
const DEPURA = new URLSearchParams(location.search).has('debug');

/* Dentro del marco, lo que mide el sitio son los pasos (marco.js): estos
   eventos quedan en la capa de datos del propio cotizador. */
export function ev(evento, datos = {}) {
  window.dataLayer.push({ event: evento, ...datos });
  if (DEPURA) console.log('▸', evento, datos);
}

/* ── PASOS ────────────────────────────────────────────────────────── */
export const PASOS = [
  { id: 'datos',     n: 1, rotulo: 'Tus datos',    url: '/herramientas/auto-digital/datos/' },
  { id: 'vehiculo',  n: 2, rotulo: 'Tu auto',      url: '/herramientas/auto-digital/vehiculo/' },
  { id: 'planes',    n: 3, rotulo: 'Tu plan',      url: '/herramientas/auto-digital/planes/' },
  { id: 'confirmar', n: 4, rotulo: 'Confirmación', url: '/herramientas/auto-digital/confirmacion/' },
  { id: 'pagar',     n: 5, rotulo: 'Pago',         url: '/herramientas/auto-digital/pago/' }
];

/* `pasos` entra por parámetro para que el recorrido de hogar use la misma
   barra con su propia lista. Por omisión sigue siendo la de auto, así que
   las cinco pantallas de auto llaman igual que antes. */
export function pintarPasos(actual, pasos = PASOS) {
  const cont = $('#pasos');
  if (!cont) return;
  const iActual = pasos.findIndex(p => p.id === actual);

  /* En pantallas angostas cinco rótulos no caben, y forzarlos abre scroll
     horizontal. Ahí la barra se reemplaza por «Paso N de 5» con una línea
     de avance: la misma información, en el espacio que hay. */
  const actualPaso = pasos[iActual] || pasos[0];
  const avance = Math.round(((iActual + 1) / pasos.length) * 100);
  const compacto = `<li class="pasos__compacto">
      <span class="pasos__compacto-r">Paso ${actualPaso.n} de ${pasos.length} · ${actualPaso.rotulo}</span>
      <span class="pasos__barra"><i data-avance="${avance}"></i></span>
    </li>`;

  cont.innerHTML = compacto + pasos.map((p, i) => {
    const estadoPaso = i < iActual ? 'hecho' : i === iActual ? 'actual' : 'pendiente';
    const marca = estadoPaso === 'hecho'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>'
      : p.n;
    const rotulo = estadoPaso === 'hecho'
      ? `<a class="paso-item__r" href="${p.url}">${p.rotulo}</a>`
      : `<span class="paso-item__r">${p.rotulo}</span>`;
    return `<li class="paso-item" data-estado="${estadoPaso}"${estadoPaso === 'actual' ? ' aria-current="step"' : ''}>
        <span class="paso-item__n">${marca}</span>${rotulo}
        ${i < pasos.length - 1 ? '<span class="paso-item__linea"></span>' : ''}
      </li>`;
  }).join('');
  /* El ancho por CSSOM: la política de seguridad no admite estilos en línea. */
  const barra = /** @type {HTMLElement|null} */ (cont.querySelector('[data-avance]'));
  if (barra) barra.style.width = barra.dataset.avance + '%';
}

/* ── CAMPOS ───────────────────────────────────────────────────────── */
export function pista(campo, texto, estadoCampo) {
  const p = $('.campo__pista', campo);
  if (p) p.textContent = texto;
  if (estadoCampo) campo.dataset.estado = estadoCampo;
  else delete campo.dataset.estado;
}

/* Marca un campo como traído de la base, no escrito por el cliente.

   Antes esto además colgaba una pastilla «Ya lo teníamos» al lado de
   cada rótulo. Se sacó: con cinco campos pre-llenados eran cinco
   pastillas repitiendo lo mismo, y lo que querían decir ya lo dice la
   bajada de la pantalla en una sola frase. El campo se sigue marcando,
   y el fondo verde suave basta para distinguir lo que trajimos de lo
   que escribió la persona. */
export function marcarDeBase(campo) {
  if (!campo) return;
  campo.dataset.origen = 'base';
}

export function desmarcarDeBase(campo) {
  if (!campo) return;
  delete campo.dataset.origen;
}

/* Validación declarativa. Cada campo trae su regla y su mensaje;
   la función devuelve si el formulario completo puede avanzar. */
export function validarFormulario(reglas) {
  let ok = true, primerError = null;
  for (const { campo, input, valido, mensaje, pistaBase } of reglas) {
    const c = typeof campo === 'string' ? $(campo) : campo;
    const i = typeof input === 'string' ? $(input) : input;
    if (!c || !i) continue;
    if (valido(i.value.trim(), i)) {
      pista(c, pistaBase || '', i.value.trim() ? 'ok' : null);
    } else {
      pista(c, mensaje, 'error');
      ok = false;
      if (!primerError) primerError = i;
    }
  }
  if (primerError) {
    primerError.focus();
    primerError.closest('.campo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    avisarFoco(primerError.closest('.campo'));
  }
  return ok;
}

/* Autocompletado tipo Places. En producción esto es Google Places
   Autocomplete restringido a Chile; aquí resuelve contra la lista local
   para que el prototipo funcione sin clave de API ni red. */
export function autocompletar(input, opciones, alElegir) {
  const campo = input.closest('.campo');
  const lista = document.createElement('ul');
  lista.className = 'sugeridor';
  lista.setAttribute('role', 'listbox');
  campo.appendChild(lista);

  let activo = -1, visibles = [];

  const cerrar = () => { lista.dataset.abierto = 'false'; activo = -1; input.setAttribute('aria-expanded', 'false'); };

  const pintar = () => {
    const q = input.value.trim().toLowerCase();
    visibles = q.length < 1 ? [] : opciones
      .filter(o => o.toLowerCase().includes(q))
      .sort((a, b) => a.toLowerCase().indexOf(q) - b.toLowerCase().indexOf(q))
      .slice(0, 8);
    if (!visibles.length) { cerrar(); return; }
    lista.innerHTML = visibles.map((o, i) => {
      const k = o.toLowerCase().indexOf(q);
      const marcado = o.slice(0, k) + '<mark>' + o.slice(k, k + q.length) + '</mark>' + o.slice(k + q.length);
      return `<li role="option" data-i="${i}" aria-selected="false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          ${marcado}</li>`;
    }).join('');
    lista.dataset.abierto = 'true';
    input.setAttribute('aria-expanded', 'true');
  };

  const elegir = i => {
    if (!visibles[i]) return;
    input.value = visibles[i];
    cerrar();
    alElegir?.(visibles[i]);
  };

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.addEventListener('input', pintar);
  input.addEventListener('focus', () => { if (input.value.trim()) pintar(); });
  input.addEventListener('blur', () => setTimeout(cerrar, 140));
  input.addEventListener('keydown', e => {
    if (lista.dataset.abierto !== 'true') return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      activo = (activo + (e.key === 'ArrowDown' ? 1 : -1) + visibles.length) % visibles.length;
      $$('li', lista).forEach((li, i) => li.setAttribute('aria-selected', String(i === activo)));
    } else if (e.key === 'Enter' && activo >= 0) { e.preventDefault(); elegir(activo); }
    else if (e.key === 'Escape') cerrar();
  });
  lista.addEventListener('mousedown', e => {
    const li = elementoDe(e)?.closest('li');
    if (li) { e.preventDefault(); elegir(Number(li.dataset.i)); }
  });
}

/* ── INTERFAZ COMÚN ───────────────────────────────────────────────── */
export function montarComun() {
  /* Los datos de prueba, si la pantalla dejó el hueco bajo el campo de
     RUT. Solo Auto lleva patentes: Hogar y Urgencias no tienen vehículo
     que buscar. El producto va en la ruta: /herramientas/<producto>/<paso>/. */
  montarDatosPrueba('#rut-ejemplos', {
    patentes: location.pathname.split('/')[2] === 'auto-digital'
  });

  // Dentro del marco del sitio: el paso, el fin y el alto.
  avisarPaso(pasoActual() === 'listo');
  vigilarAlto();

  // Cabecera con sombra al desplazar
  const cab = $('#cabecera');
  if (cab) {
    const alScroll = () => cab.classList.toggle('cabecera--flotante', scrollY > 8);
    addEventListener('scroll', alScroll, { passive: true });
    alScroll();
  }

  // Menú móvil
  const btn = $('.menu-btn'), menu = $('#menu-movil');
  btn?.addEventListener('click', () => {
    const abierto = menu.dataset.abierto === 'true';
    menu.dataset.abierto = String(!abierto);
    btn.setAttribute('aria-expanded', String(!abierto));
  });
  $$('#menu-movil a').forEach(a => a.addEventListener('click', () => {
    menu.dataset.abierto = 'false';
    btn?.setAttribute('aria-expanded', 'false');
  }));

  // «Por qué te lo pedimos»
  document.addEventListener('click', e => {
    const btnPq = elementoDe(e)?.closest('.porque__btn');
    $$('.porque').forEach(p => {
      if (!(p instanceof HTMLElement)) return;
      if (!btnPq || p !== btnPq.parentElement) p.dataset.abierto = 'false';
    });
    if (btnPq) {
      const p = btnPq.parentElement;
      if (!(p instanceof HTMLElement)) return;
      const abierto = p.dataset.abierto === 'true';
      p.dataset.abierto = String(!abierto);
      btnPq.setAttribute('aria-expanded', String(!abierto));
      if (!abierto) ev('auto_click_porque', { campo: p.dataset.campo || '' });
    }
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.porque').forEach(p => p.dataset.abierto = 'false');
  });

  // Aparición al desplazar
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (en.isIntersecting) { en.target.dataset.visible = 'true'; io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.revela').forEach(el => io.observe(el));
  } else {
    $$('.revela').forEach(el => el.dataset.visible = 'true');
  }

  // Eventos declarativos
  document.addEventListener('click', e => {
    const el = elementoDe(e)?.closest('[data-ev]');
    if (!el || !(el instanceof HTMLElement)) return;
    const extra = {};
    if (el.dataset.producto) extra.producto = el.dataset.producto;
    ev(el.dataset.ev, extra);
  });
}

/* ── MODAL ────────────────────────────────────────────────────────── */
export function montarModal(id) {
  const modal = $('#' + id);
  if (!modal) return { abrir(){}, cerrar(){} };
  let devolverFoco = null;

  const cerrar = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    devolverFoco?.focus();
  };
  const abrir = origen => {
    devolverFoco = origen || null;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal__caja', modal)?.focus();
    avisarFoco($('.modal__caja', modal));
  };

  $$('[data-cerrar-modal]', modal).forEach(b => b.addEventListener('click', cerrar));
  $('.modal__fondo', modal)?.addEventListener('click', cerrar);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });

  return { abrir, cerrar, el: modal };
}

/* ── UTILIDADES ───────────────────────────────────────────────────── */
export const escapar = s =>
  String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

/* +56 9 1234 5678 — el formato en que un chileno lee su propio numero */
export function formateaCelular(v) {
  const d = String(v || '').replace(/\D/g, '').replace(/^56/, '').slice(0, 9);
  if (!d) return '';
  return '+56 ' + d.replace(/^(\d)(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(' '));
}

/** El correo con que la persona entró al sitio, para no pedírselo de nuevo. */
export function correoDelSitio() {
  try { return /** @type {any} */ (leerSitio('sesion', null))?.correo || ''; } catch { return ''; }
}

export const nombreCorto = () =>
  (estado.persona.nombres || '').trim().split(' ')[0] || '';

export const irA = url => { location.href = url; };

/* Fecha en texto, para la póliza y la vigencia */
export function fechaLarga(d = new Date()) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                 'agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}
