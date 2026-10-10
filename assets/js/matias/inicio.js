// @ts-check
/**
 * MatIAs · el conserje de «Contratar un seguro».
 *
 * Viene del conserje de la portada del piloto (asesor-inicio.js), con sus
 * tres decisiones de fondo intactas:
 *
 * 1 · PIDE DOS DATOS, NO UNO. RUT y patente (auto) o RUT y comuna (hogar).
 *     Con el RUT solo, cualquiera que lo supiera vería el nombre y el auto
 *     de otra persona.
 * 2 · EL RUT NO VIAJA COMO TEXTO EN EL HILO. Entra por un campo de verdad
 *     dentro del panel, no escrito en una burbuja.
 * 3 · LA AUTORIZACIÓN LA DA LA PERSONA, NO EL ROBOT. Es la misma cláusula
 *     del cotizador, completa, y es opcional: se puede seguir sin darla.
 *     Hasta ese clic MatIAs no guardó nada: solo miró.
 *
 * Y una de negocio: el conserje NO dice el precio. Lleva a la persona a su
 * cotización, dentro del sitio, con sus datos cargados.
 *
 * La base de clientes es la del cotizador de demostración: FICTICIA
 * (10111222-5 con AAAA11, 20111222-2 con BBBB22, y el resto de la base).
 * Los datos se guardan con las mismas funciones que usa el cotizador, así
 * que la pantalla siguiente los encuentra donde siempre.
 */
import { producto, EN_LINEA, CON_ASESORIA, MUNDO_ZURICH, asesoriaRuta } from '../catalogo.js';
import { consultar } from '../sesion.js';
import { esc } from '../ui.js';
import { promoActiva, ganchoDe } from '../piezas.js';
import { registrar } from '../medicion.js';
import { buscaCliente, rutValido, formateaRut, formateaPatente, normalizaPatente, COMUNAS, CONSENTIMIENTO } from '/herramientas/assets/js/datos.js';
import { guardar, reiniciar } from '/herramientas/assets/js/comun.js';
import { guardarHogar, reiniciarHogar } from '/herramientas/assets/js/comun-hogar.js';
import { regionDe } from '/herramientas/assets/js/datos-hogar.js';
import { dato, LLAMAR, respuestaCanales, FUENTE_PRODUCTO } from './comun.js';

const AUTO = /** @type {any} */ (producto('auto-digital'));
const HOGAR = /** @type {any} */ (producto('hogar-facil-plus'));

/** A dónde lleva el conserje y hasta qué paso salta (ver integracion.js › ?paso=). */
export const DESTINO = {
  auto: `${AUTO.flujo.ruta}?paso=planes`,
  hogar: `${HOGAR.flujo.ruta}?paso=vivienda`,
};
export const FORMULARIO = { auto: AUTO.flujo.ruta, hogar: HOGAR.flujo.ruta };

const SEGUNDO = {
  auto: {
    campo: 'patente', rotulo: 'Patente de tu auto', ejemplo: 'ABCD12', ayuda: 'Cuatro letras y dos números, o dos y cuatro.',
    verifica: (/** @type {any} */ c, /** @type {string} */ v) => normalizaPatente(c.patente) === normalizaPatente(v),
  },
  hogar: {
    campo: 'comuna', rotulo: 'Comuna de tu vivienda', ejemplo: 'Las Condes', ayuda: 'La comuna donde está la casa o el departamento.',
    verifica: (/** @type {any} */ c, /** @type {string} */ v) => String(c.comunaDom || '').toLowerCase().trim() === String(v || '').toLowerCase().trim(),
  },
};

/** Lo que el conserje sabe de esta conversación. Nada sale del navegador ni se guarda hasta que la persona acepta. */
const sesion = { /** @type {'auto'|'hogar'|null} */ ramo: null, rut: '', /** @type {any} */ cliente: null, listo: false };
let nFormulario = 0;

/** El correo con que entró al sitio: es el de la persona, no el de la base. */
const correoSitio = () => { try { return /** @type {any} */ (consultar()).sesion?.correo || ''; } catch { return ''; } };

/* ── Escribir el estado del cotizador, con sus propias funciones ─────── */
/** @param {any} c @param {boolean} consentimiento */
function cargarAuto(c, consentimiento) {
  reiniciar();
  guardar({
    rut: formateaRut(c.rut), origen: 'base',
    persona: { nombres: c.nombres, apellidos: c.apellidos, correo: correoSitio() || c.correo, celular: String(c.celular), comuna: c.comuna },
    vehiculo: { nuevo: false, patente: c.patente, marca: c.marca, modelo: c.modelo, anio: c.anio, motor: '', chasis: '', color: '' },
    domicilio: { direccion: c.direccion, numero: String(c.numero), tipo: /depto/i.test(c.depto || '') ? 'Departamento' : 'Casa', depto: c.depto || '', comuna: c.comunaDom },
    consentimiento,
  });
}
/** @param {any} c @param {boolean} consentimiento */
function cargarHogar(c, consentimiento) {
  reiniciarHogar();
  guardarHogar({
    rut: formateaRut(c.rut), origen: 'base',
    persona: { nombres: c.nombres, apellidos: c.apellidos, correo: correoSitio() || c.correo, celular: String(c.celular) },
    vivienda: {
      tipo: /depto/i.test(c.depto || '') ? 'departamento' : 'casa', direccion: c.direccion, numero: String(c.numero),
      depto: c.depto || '', comuna: c.comunaDom, region: regionDe(c.comunaDom), material: 'solido', anio: null, m2: null,
    },
    consentimiento,
  });
}

/** Lo que se le muestra para que se reconozca: ni correo ni celular. @param {'auto'|'hogar'} ramo @param {any} c */
const resumen = (ramo, c) => ramo === 'hogar'
  ? { nombre: `${c.nombres} ${c.apellidos}`, rotulo: 'Vivienda', bien: `${c.direccion} ${c.numero}${c.depto ? ', ' + c.depto : ''}, ${c.comunaDom}` }
  : { nombre: `${c.nombres} ${c.apellidos}`, rotulo: 'Vehículo', bien: `${c.marca} ${c.modelo} ${c.anio}, patente ${c.patente}` };

/* ── El formulario dentro de la burbuja ───────────────────────────────── */
/** @param {'auto'|'hogar'} ramo */
function formulario(ramo) {
  const f = SEGUNDO[ramo];
  const n = ++nFormulario;
  const error = '<span class="campo__error" role="alert"></span>';
  return `
    <div class="campo" data-campo="rut">
      <label for="matias-rut-${n}">RUT</label>
      <input id="matias-rut-${n}" type="text" inputmode="text" autocomplete="off" placeholder="12345678-9" maxlength="12" aria-describedby="matias-rut-ayuda-${n}">
      <span class="ayuda" id="matias-rut-ayuda-${n}">Sin puntos y con guion. Para probar: 10111222-5 o 20111222-2.</span>${error}
    </div>
    <div class="campo" data-campo="factor">
      <label for="matias-factor-${n}">${esc(f.rotulo)}</label>
      <input id="matias-factor-${n}" type="text" autocomplete="off" placeholder="${esc(f.ejemplo)}" aria-describedby="matias-factor-ayuda-${n}">
      <span class="ayuda" id="matias-factor-ayuda-${n}">${esc(f.ayuda)}${ramo === 'auto' ? ' Para probar: AAAA11 o BBBB22.' : ' Para probar: Providencia o Las Condes.'}</span>${error}
    </div>
    <button class="btn btn--primario btn--bloque btn--chico" type="button" data-accion="buscar">Buscar mis datos</button>`;
}

/** @param {HTMLElement} raiz @param {string} sel @param {string} texto */
function marcar(raiz, sel, texto) {
  const c = /** @type {HTMLElement|null} */ (raiz.querySelector(sel));
  if (!c) return;
  c.dataset.estado = 'error';
  const e = c.querySelector('.campo__error');
  if (e) e.textContent = texto;
  c.querySelector('input')?.setAttribute('aria-invalid', 'true');
}
/** @param {HTMLElement} raiz @param {string} sel */
function limpiar(raiz, sel) {
  const c = /** @type {HTMLElement|null} */ (raiz.querySelector(sel));
  if (!c || c.dataset.estado !== 'error') return;
  delete c.dataset.estado;
  c.querySelector('input')?.removeAttribute('aria-invalid');
}

/** @param {'auto'|'hogar'} ramo @param {HTMLElement} burbuja @param {any} api */
function montarCaptura(ramo, burbuja, api) {
  sesion.ramo = ramo; sesion.cliente = null; sesion.listo = false;
  api.actualiza();
  const iRut = /** @type {HTMLInputElement} */ (burbuja.querySelector('[data-campo="rut"] input'));
  const iFactor = /** @type {HTMLInputElement} */ (burbuja.querySelector('[data-campo="factor"] input'));
  const boton = /** @type {HTMLButtonElement} */ (burbuja.querySelector('[data-accion="buscar"]'));
  const f = SEGUNDO[ramo];

  iRut.addEventListener('input', () => {
    const bruto = iRut.value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    iRut.value = bruto.length > 1 ? formateaRut(bruto) : bruto;
    limpiar(burbuja, '[data-campo="rut"]');
  });
  iFactor.addEventListener('input', () => {
    if (ramo === 'auto') iFactor.value = formateaPatente(iFactor.value);
    limpiar(burbuja, '[data-campo="factor"]');
  });

  const enviar = () => {
    if (boton.getAttribute('aria-disabled') === 'true') return;
    const rut = iRut.value.trim();
    const factor = iFactor.value.trim();
    if (!rutValido(rut)) { marcar(burbuja, '[data-campo="rut"]', rut ? 'Ese RUT no es válido: revisa el dígito verificador.' : 'Escribe tu RUT.'); iRut.focus(); return; }
    if (!factor) { marcar(burbuja, '[data-campo="factor"]', `Falta la ${f.campo}.`); iFactor.focus(); return; }
    if (ramo === 'hogar' && !COMUNAS.some((c) => c.toLowerCase() === factor.toLowerCase())) {
      marcar(burbuja, '[data-campo="factor"]', 'Escribe el nombre de la comuna tal como aparece en tu dirección.'); iFactor.focus(); return;
    }
    if (ramo === 'auto' && !/^[A-Z]{4}[0-9]{2}$|^[A-Z]{2}[0-9]{4}$/.test(normalizaPatente(factor))) {
      marcar(burbuja, '[data-campo="factor"]', 'Revisa la patente: cuatro letras y dos números, o dos y cuatro.'); iFactor.focus(); return;
    }
    boton.setAttribute('aria-disabled', 'true');
    boton.textContent = 'Buscando…';
    iRut.readOnly = true; iFactor.readOnly = true;
    /* El formulario usado queda en el hilo, pero su botón dice qué pasó. */
    const cerrarBoton = (/** @type {string} */ t) => { boton.textContent = t; boton.classList.replace('btn--primario', 'btn--fantasma'); };
    setTimeout(() => {
      const c = buscaCliente(rut);
      sesion.rut = formateaRut(rut);
      if (!c) { cerrarBoton('Sin registro'); registrar('matias_rec_captura', { ramo, resultado: 'sin_registro' }); api.responder('no_encontrado'); return; }
      if (!f.verifica(c, factor)) { cerrarBoton('No coincide'); registrar('matias_rec_captura', { ramo, resultado: 'no_coincide' }); api.responder('no_coincide'); return; }
      cerrarBoton('Datos encontrados');
      sesion.cliente = c;
      registrar('matias_rec_captura', { ramo, resultado: 'reconocido' });
      api.responder('reconocido');
    }, 260);
  };
  boton.addEventListener('click', enviar);
  [iRut, iFactor].forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); enviar(); } }));
  setTimeout(() => iRut.focus(), 80);
}

/** @param {HTMLElement} burbuja @param {any} api */
function montarConsentimiento(burbuja, api) {
  burbuja.querySelector('[data-accion="ver-clausula"]')?.addEventListener('click', () => {
    registrar('matias_click_ver_clausula', { ramo: sesion.ramo || '' });
    api.burbuja('bot', `<p><strong>${esc(CONSENTIMIENTO.titulo)}</strong></p><p>${esc(CONSENTIMIENTO.intro)}</p><p>${esc(CONSENTIMIENTO.marco)}</p>
      <ul>${CONSENTIMIENTO.finalidades.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p>${esc(CONSENTIMIENTO.derechos)}</p><p>${esc(CONSENTIMIENTO.prioridad)}</p>`);
  });
  /** @param {boolean} acepta */
  const decidir = (acepta) => (/** @type {Event} */ e) => {
    const b = /** @type {HTMLElement} */ (e.currentTarget);
    if (b.getAttribute('aria-disabled') === 'true' || !sesion.cliente || !sesion.ramo) return;
    burbuja.querySelectorAll('[data-accion="acepto"], [data-accion="sin-autorizar"]').forEach((x) => x.setAttribute('aria-disabled', 'true'));
    b.textContent = acepta ? 'Autorizado' : 'Sigo sin autorizar';
    /* Aquí, y no antes, se escribe el estado. */
    if (sesion.ramo === 'hogar') cargarHogar(sesion.cliente, acepta); else cargarAuto(sesion.cliente, acepta);
    sesion.listo = true;
    api.actualiza();
    registrar('matias_click_consentimiento', { ramo: sesion.ramo, acepta });
    api.responder('listo');
  };
  burbuja.querySelector('[data-accion="acepto"]')?.addEventListener('click', decidir(true));
  burbuja.querySelector('[data-accion="sin-autorizar"]')?.addEventListener('click', decidir(false));
}

/** @param {HTMLElement} burbuja */
function montarSalida(burbuja) {
  const enlace = /** @type {HTMLAnchorElement|null} */ (burbuja.querySelector('[data-accion="ir"]'));
  enlace?.addEventListener('click', () => {
    enlace.setAttribute('aria-busy', 'true');
    enlace.textContent = sesion.ramo === 'hogar' ? 'Abriendo tu cotización…' : 'Abriendo tus precios…';
    registrar('matias_click_ir', { ramo: sesion.ramo || '', destino: enlace.getAttribute('href') || '' });
    /* En la pantalla siguiente MatIAs sigue la conversación (lanzador.js). */
    try { sessionStorage.setItem('zb:matias', JSON.stringify({ seguir: sesion.ramo })); } catch { /* sin almacenamiento: no se reabre solo */ }
  });
}

/** Las ofertas como botones: se eligen donde se leen. */
function ofertas() {
  const items = [
    { nodo: 'auto_cotizar', nombre: AUTO.nombre, gancho: promoActiva(AUTO) ? `${AUTO.gancho.etiqueta}: ${AUTO.promocion.titulo}` : ganchoDe(AUTO).valor },
    { nodo: 'hogar_cotizar', nombre: HOGAR.nombre, gancho: `${HOGAR.gancho.etiqueta}: ${HOGAR.gancho.valor}` },
    { nodo: 'otros_seguros', nombre: 'Otros seguros en línea', gancho: 'SOAP, Celular Protegido y Protección Urgencias' },
  ];
  return `<div class="matias-temas">${items.map((o) => `<button type="button" class="matias-tema" data-nodo="${o.nodo}" id="matias-oferta-${o.nodo}">
    <span class="matias-tema__nombre">${esc(o.nombre)}</span><span class="matias-tema__bajada">${esc(o.gancho)}</span></button>`).join('')}</div>`;
}

/** @param {HTMLElement} burbuja @param {any} api */
const enlazar = (burbuja, api) => burbuja.querySelectorAll('[data-nodo]').forEach((b) => b.addEventListener('click', () => {
  const n = /** @type {HTMLElement} */ (b);
  api.burbuja('usuario', esc(n.querySelector('.matias-tema__nombre')?.textContent || ''));
  api.responder(n.dataset.nodo);
}));

/** @param {'auto'|'hogar'} ramo @param {any} ctx */
function capturar(ramo, ctx) {
  if (ctx?.vivo) {
    return {
      parrafos: [`Ya estás en tus precios: el ${dato(ctx.plan.nombre || ctx.plan.corto)} sale ${dato(`${'$' + Math.round(ctx.precio).toLocaleString('es-CL')} al mes`)}. Pregúntame lo que quieras de él.`],
      fuente: '',
      sugerencias: ramo === 'auto' ? ['auto_cubre', 'auto_ahorrar', 'auto_diferencias'] : ['hogar_cubre', 'hogar_ahorrar', 'hogar_diferencias'],
    };
  }
  const p = ramo === 'auto' ? AUTO : HOGAR;
  return {
    parrafos: [
      `Muy bien: ${dato(p.nombre)}. Para llevarte directo a ${ramo === 'auto' ? 'tus precios' : 'tu cotización'} necesito dos datos: tu ${dato('RUT')} y ${ramo === 'auto' ? `la ${dato('patente')} de tu auto` : `la ${dato('comuna')} de tu vivienda`}.`,
    ],
    formulario: formulario(ramo),
    alMontar: (/** @type {HTMLElement} */ b, /** @type {any} */ api) => montarCaptura(ramo, b, api),
    micro: `Te pido ${ramo === 'auto' ? 'la patente' : 'la comuna'} para confirmar que eres tú y no mostrarle tus datos a nadie más. Los clientes de esta demostración son ficticios.`,
    fuente: '',
    sugerencias: [],
  };
}

/** @type {Record<string, any>} */
export const nodosInicio = {
  auto_cotizar: {
    etiqueta: 'Ver mis precios de Auto', modo: 'contratar', tema: 'auto', cta: true,
    terminos: [['seguro de auto', 7], ['asegurar mi auto', 7], ['cotizar auto', 7], ['cotizar mi auto', 7], ['quiero cotizar', 4], ['cotizar', 3], ['mi auto', 4], ['auto digital', 6]],
    respuesta: (/** @type {any} */ ctx) => capturar('auto', ctx),
  },
  hogar_cotizar: {
    etiqueta: 'Cotizar Hogar', modo: 'contratar', tema: 'hogar', cta: true,
    terminos: [['seguro de hogar', 7], ['seguro de casa', 7], ['asegurar mi casa', 7], ['asegurar mi depto', 7], ['cotizar hogar', 7], ['quiero cotizar', 4], ['cotizar', 3], ['mi casa', 4], ['hogar facil', 6]],
    respuesta: (/** @type {any} */ ctx) => capturar('hogar', ctx),
  },

  reconocido: {
    etiqueta: 'Confirmar mis datos', modo: 'contratar', tema: 'inicio',
    respuesta: () => {
      if (!sesion.cliente || !sesion.ramo) return nodosInicio.no_encontrado.respuesta();
      const r = resumen(sesion.ramo, sesion.cliente);
      return {
        parrafos: [`Gracias, ${dato(r.nombre.split(' ')[0])}. Esto es lo que tenemos registrado a tu nombre:`, null, '¿Me confirmas que los datos son correctos?'],
        lista: [`<strong>Nombre:</strong> ${esc(r.nombre)}`, `<strong>${esc(r.rotulo)}:</strong> ${esc(r.bien)}`],
        fuente: 'Base de clientes de la demostración · ficticia',
        sugerencias: ['si_soy_yo', 'no_soy_yo'],
      };
    },
  },
  si_soy_yo: {
    etiqueta: 'Sí, soy yo', modo: 'contratar', tema: 'inicio',
    respuesta: () => ({
      parrafos: [
        'Gracias. Antes de mostrarte tus planes te pido autorización para tratar tus datos. Es la misma cláusula del cotizador, y es opcional: si prefieres no darla, seguimos igual.',
        'Zurich la usa, entre otras cosas, para:', null,
      ],
      lista: CONSENTIMIENTO.finalidades.slice(0, 3).map((t) => esc(t)),
      formulario: `<p class="matias-form__legal">${esc(CONSENTIMIENTO.derechos)}</p>
        <button class="btn btn--fantasma btn--bloque btn--chico" type="button" data-accion="ver-clausula">Leer la cláusula completa</button>
        <button class="btn btn--primario btn--bloque btn--chico" type="button" data-accion="acepto">Autorizo y sigamos</button>
        <button class="btn btn--linea btn--bloque btn--chico" type="button" data-accion="sin-autorizar">Seguir sin autorizar</button>`,
      alMontar: montarConsentimiento,
      micro: 'La autorización la das tú, no yo. Queda registrada con tu clic.',
      fuente: 'Cláusula del cotizador · por validar con Legal de Zurich',
      sugerencias: [],
    }),
  },
  no_soy_yo: {
    etiqueta: 'No soy yo', modo: 'contratar', tema: 'inicio',
    respuesta: () => ({
      parrafos: [
        'Entendido: no seguimos con esos datos, no son tuyos y no corresponde dejarlos cargados.',
        'Si quieres, revisamos el RUT e intentamos de nuevo. O completas el formulario tú, con calma.',
      ],
      fuente: '',
      sugerencias: ['reintentar', 'formulario', 'ejecutivo'],
    }),
  },
  listo: {
    etiqueta: 'Ver mis precios', modo: 'contratar', tema: 'inicio', cta: true,
    respuesta: () => ({
      parrafos: sesion.ramo === 'hogar'
        ? [`${dato('Listo.')} Dejé cargados tus datos y la dirección de tu vivienda.`,
          `Solo faltan ${dato('tres datos')} que no tenemos: los metros construidos, el material y el año de tu vivienda. Con eso se calcula cuánto cuesta asegurarla.`]
        : [`${dato('Listo.')} Dejé cargados tus datos y tu auto. Ahora ves tus planes, tus precios y la promoción que te corresponde.`],
      formulario: `<a class="btn btn--primario btn--bloque btn--chico" data-accion="ir" href="${DESTINO[sesion.ramo === 'hogar' ? 'hogar' : 'auto']}">${sesion.ramo === 'hogar' ? 'Seguir con mi vivienda' : 'Ver mis precios'}</a>`,
      alMontar: montarSalida,
      micro: 'Vas a poder revisar y corregir todo antes de contratar. Nada queda cerrado aquí.',
      fuente: '',
      sugerencias: [],
    }),
  },
  no_encontrado: {
    etiqueta: 'No te encontré', modo: 'contratar', tema: 'inicio',
    respuesta: () => ({
      parrafos: ['No encuentro ese RUT en los registros, así que no puedo adelantarte nada. No es problema: igual puedes cotizar, solo que los datos los escribes tú.'],
      fuente: '',
      sugerencias: ['formulario', 'reintentar', 'ejecutivo'],
    }),
  },
  no_coincide: {
    etiqueta: 'No coincide', modo: 'contratar', tema: 'inicio',
    respuesta: () => ({
      parrafos: [`Ese RUT está en los registros, pero la ${esc(SEGUNDO[sesion.ramo === 'hogar' ? 'hogar' : 'auto'].campo)} no coincide. Te pido los dos datos justamente para no mostrarle a nadie la información de otra persona.`],
      fuente: '',
      sugerencias: ['reintentar', 'formulario', 'ejecutivo'],
    }),
  },
  reintentar: {
    etiqueta: 'Probar de nuevo', modo: 'contratar', tema: 'inicio',
    terminos: [['de nuevo', 5], ['otra vez', 5], ['reintentar', 6]],
    respuesta: () => {
      const ramo = sesion.ramo === 'hogar' ? 'hogar' : 'auto';
      return { parrafos: ['Por supuesto. Los dos datos otra vez:'], formulario: formulario(ramo), alMontar: (/** @type {HTMLElement} */ b, /** @type {any} */ api) => montarCaptura(ramo, b, api), fuente: '', sugerencias: [] };
    },
  },
  formulario: {
    etiqueta: 'Prefiero el formulario', modo: 'contratar', tema: 'inicio',
    terminos: [['formulario', 5], ['lo lleno yo', 6], ['prefiero escribir', 6]],
    respuesta: () => ({
      parrafos: ['Por supuesto. Te dejo en el cotizador y lo completas a tu ritmo.'],
      acciones: [{ texto: 'Ir al cotizador', href: FORMULARIO[sesion.ramo === 'hogar' ? 'hogar' : 'auto'], medir: 'ir_formulario', primario: true }],
      fuente: '',
      sugerencias: [],
    }),
  },
  por_que_dos_datos: {
    etiqueta: '¿Por qué dos datos?', modo: 'contratar', tema: 'inicio',
    terminos: [['por que dos', 7], ['por que el rut', 6], ['para que el rut', 6], ['por que la patente', 7], ['es seguro', 5], ['privacidad', 5], ['que hacen con mis datos', 7]],
    respuesta: () => ({
      parrafos: [
        'Porque con el RUT solo, cualquiera que lo supiera podría ver tu nombre y tu auto. Te pido un segundo dato que tienes a mano y que un desconocido no.',
        'No se crea ninguna cuenta y nada se guarda hasta que tú confirmas.',
      ],
      fuente: '',
      sugerencias: ['auto_cotizar', 'hogar_cotizar', 'sin_rut'],
    }),
  },
  sin_rut: {
    etiqueta: 'No quiero dar mi RUT', modo: 'contratar', tema: 'inicio',
    terminos: [['no quiero dar', 6], ['sin rut', 6], ['no doy mi rut', 7], ['desconfio', 5]],
    respuesta: () => ({
      parrafos: ['Está bien, y es razonable. Sin RUT no puedo dejarte nada cargado, pero igual puedes cotizar: el cotizador te pide los datos y los escribes tú. Y puedes preguntarme lo que quieras sin darme nada.'],
      fuente: '',
      sugerencias: ['formulario', 'por_que_dos_datos'],
    }),
  },
  cuanto_sale: {
    etiqueta: '¿Cuánto sale?', modo: 'contratar', tema: 'inicio',
    terminos: [['cuanto sale', 5], ['precio', 5], ['cuanto cuesta', 5], ['cuanto vale', 5], ['cuanto', 3]],
    respuesta: () => ({
      parrafos: [
        'Depende de lo que asegures, y prefiero no tirarte un número al aire: tu precio sale de tus datos, no de un promedio. Lo que sí te puedo adelantar:', null,
        'Dame dos datos y te llevo a tu precio.',
      ],
      lista: EN_LINEA.map((id) => /** @type {any} */ (producto(id))).filter(Boolean).map((p) => `<strong>${esc(p.nombre)}</strong>: ${esc(ganchoDe(p).etiqueta)} · ${esc(ganchoDe(p).valor)}`),
      fuente: 'zurich.cl · precios «desde» y promociones vigentes',
      sugerencias: ['auto_cotizar', 'hogar_cotizar', 'otros_seguros'],
    }),
  },
  otros_seguros: {
    etiqueta: 'Otros seguros en línea', modo: 'contratar', tema: 'inicio',
    terminos: [['otros seguros', 6], ['soap', 6], ['celular', 6], ['urgencias', 6], ['que seguros', 5], ['que mas tienen', 5]],
    respuesta: () => {
      const otros = EN_LINEA.filter((id) => id !== 'auto-digital' && id !== 'hogar-facil-plus').map((id) => /** @type {any} */ (producto(id))).filter(Boolean);
      return {
        parrafos: ['Estos también se contratan en línea, dentro de este espacio:', null],
        lista: otros.map((p) => `<strong>${esc(p.nombre)}</strong>: ${esc(ganchoDe(p).valor)}`),
        acciones: otros.map((p) => ({ texto: p.corto, href: p.ruta, medir: `ver_${p.id.replace(/-/g, '_')}` })),
        fuente: 'zurich.cl · productos en línea',
        sugerencias: ['con_asesor', 'auto_cotizar', 'hogar_cotizar'],
      };
    },
  },
  con_asesor: {
    etiqueta: 'Seguros con asesoría', modo: 'contratar', tema: 'inicio',
    terminos: [['seguro de vida', 6], ['oncologico', 6], ['temporal', 5], ['vida y salud', 6], ['asesor', 4], ['asesoria', 5]],
    respuesta: () => {
      const items = CON_ASESORIA.map((id) => /** @type {any} */ (producto(id))).filter(Boolean);
      return {
        parrafos: ['Estos seguros de vida y salud se contratan con apoyo de un asesor. Dejas tus datos y te contactan:', null],
        lista: items.map((p) => `<strong>${esc(p.nombre)}</strong>: ${esc(p.tarjeta || p.bajada)}`),
        acciones: items.map((p) => ({ texto: `Asesoría ${p.corto}`, href: asesoriaRuta(p.id), medir: `asesoria_${p.id.replace(/-/g, '_')}` })),
        fuente: 'zurich.cl · seguros con asesoría',
        sugerencias: ['otros_seguros', 'auto_cotizar'],
      };
    },
  },
  mundo_zurich: {
    etiqueta: '¿Qué es Mundo Zurich?', modo: 'contratar', tema: 'comun',
    terminos: [['mundo zurich', 8], ['beneficios', 4], ['club', 3], ['que mas gano', 5]],
    respuesta: () => ({
      parrafos: [esc(MUNDO_ZURICH.bajada), `<em>${esc(MUNDO_ZURICH.legal.split('. ').slice(-1)[0])}</em>`],
      acciones: [{ texto: 'Conocer Mundo Zurich', href: MUNDO_ZURICH.ruta, medir: 'mundo_zurich' }],
      fuente: FUENTE_PRODUCTO('Mundo Zurich'),
    }),
  },

  /* ── Comunes a los dos espacios ─────────────────────────────────── */
  ejecutivo: {
    etiqueta: 'Hablar con una persona', modo: 'ambos', tema: 'comun',
    terminos: [['ejecutivo', 6], ['persona', 4], ['humano', 5], ['hablar con alguien', 6], ['que me llamen', 6], ['asesor real', 5]],
    respuesta: () => ({ ...respuestaCanales(), parrafos: ['Con gusto. Zurich te atiende por estos canales:', null], sugerencias: [] }),
  },
  caso_particular: {
    etiqueta: 'Mi caso es particular', modo: 'ambos', tema: 'comun',
    respuesta: () => ({
      parrafos: [
        'Eso depende de tu situación puntual, y prefiero no darte una respuesta a medias en algo que después es tu póliza.',
        'Un ejecutivo de Zurich lo revisa contigo antes de que contrates.',
      ],
      acciones: [LLAMAR],
      fuente: '',
      sugerencias: [],
    }),
  },
  saludo: {
    etiqueta: 'Hola', modo: 'ambos', tema: 'comun',
    terminos: [['hola', 5], ['buenas', 4], ['buenos dias', 5], ['buenas tardes', 5], ['que tal', 4]],
    respuesta: () => ({ parrafos: ['¡Hola! Cuéntame qué necesitas: contratar un seguro o ayuda con el que ya tienes.'], fuente: '' }),
  },
  gracias: {
    etiqueta: 'Gracias', modo: 'ambos', tema: 'comun',
    terminos: [['gracias', 5], ['muchas gracias', 5], ['genial', 3], ['perfecto', 3]],
    respuesta: () => ({ parrafos: ['De nada. Si te queda alguna duda, pregúntame.'], fuente: '' }),
  },
};

/** Apertura de «Contratar un seguro» cuando no hay un seguro a la vista. */
export const aperturaInicio = () => ({
  parrafos: [
    `Hola, soy ${dato('MatIAs')}, tu IA de seguros. Te ayudo a contratar en línea, sin salir de este espacio. ¿Qué quieres asegurar?`,
  ],
  formulario: ofertas(),
  alMontar: enlazar,
  micro: '¿Ya tienes un seguro y necesitas ayuda? Usa «Ayuda con mi seguro», arriba. Te doy información, no asesoría: la decisión es tuya.',
  fuente: '',
  sugerencias: [],
});

/** Casos que nunca reciben respuesta de catálogo al contratar: van a una persona. */
export const CASOS_PARTICULARES = [
  'le presto', 'lo presto', 'lo maneja otro', 'otra persona maneja', 'menor de edad', 'licencia nueva',
  'uber', 'cabify', 'didi', 'taxi', 'hago fletes', 'reparto', 'trabajo con el auto', 'auto de trabajo',
  'no soy el dueno', 'no soy dueno', 'esta a nombre de', 'auto embargado', 'prenda',
  'la tengo arrendada', 'soy arrendatario', 'local comercial', 'es una parcela', 'la uso de oficina',
];

/** Qué ramo nombra la frase. @param {string} texto */
export function ramoDe(texto) {
  if (/(^|\s)(auto|autos|vehiculo|camioneta|patente|carro|automotriz)(\s|$)/.test(texto)) return 'auto';
  if (/(^|\s)(casa|hogar|depto|departamento|vivienda)(\s|$)/.test(texto)) return 'hogar';
  return undefined;
}

/** El rótulo bajo el nombre: en qué va el conserje. */
export const rotuloInicio = () => sesion.listo ? 'Listo · te llevo a tu cotización'
  : sesion.cliente ? `Te reconocí · ${sesion.ramo === 'hogar' ? HOGAR.corto : AUTO.corto}`
    : 'Contratar un seguro';
