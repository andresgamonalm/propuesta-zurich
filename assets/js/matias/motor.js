// @ts-check
/**
 * MatIAs · motor y panel.
 *
 * Viene del piloto de ecommerce (asesor-motor.js) con su regla de fondo
 * intacta: NO HAY MODELO GENERATIVO. El motor solo decide CUÁL de las
 * respuestas aprobadas corresponde; el texto que ve la persona sale siempre
 * de una biblioteca (inicio.js, auto.js, hogar.js, servicio.js), y esas
 * bibliotecas leen del catálogo, que sale de zurich.cl. Por eso se puede
 * auditar: cada respuesta dice de dónde viene.
 *
 * Lo nuevo respecto del piloto:
 * - Dos espacios en el mismo panel, cada uno con su conversación:
 *   «Contratar un seguro» (Auto y Hogar, con el conserje que reconoce a la
 *   persona) y «Ayuda con mi seguro» (reembolsos, siniestros, pagos…, con
 *   el Centro de Ayuda de zurich.cl). Si alguien pregunta por un reembolso
 *   mientras cotiza, MatIAs pasa solo al espacio de ayuda.
 * - Un tema por respuesta (inicio, auto, hogar, servicio): «¿qué cubre?»
 *   se responde del seguro que la persona está mirando.
 * - Botones de acción dentro de la respuesta: llevan al trámite dentro del
 *   sitio o al teléfono, sin escribir direcciones en el texto.
 * - Medición del sitio (`matias_*`), sin texto libre: viaja qué intención
 *   se reconoció, nunca lo que la persona escribió.
 */
import { esc } from '../ui.js';
import { registrar } from '../medicion.js';

/* ── Interpretación ──────────────────────────────────────────────────────
   Determinista y local, la misma del piloto. En producción esta capa puede
   reemplazarse por un clasificador, pero la regla no cambia: el modelo
   clasifica, nunca redacta. */
const UMBRAL_ALTO = 3.5;
const UMBRAL_BAJO = 1.5;
/** Cuánto pesa estar hablando ya de ese seguro, o nombrarlo en la frase. */
const PESO_TEMA = 1.5;
const PESO_RAMO_NOMBRADO = 3;

/** @param {string} t */
export const normalizarTexto = (t) => ' ' + String(t).toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[¿?¡!.,;:()"']/g, ' ')
  .replace(/\s+/g, ' ').trim() + ' ';

/** @param {string} texto @param {string} termino */
export function contiene(texto, termino) {
  if (termino.includes(' ')) return texto.includes(' ' + termino);
  /* Seis letras o más aceptan hasta tres de sufijo: «reembolso» también
     reconoce «reembolsos» y «reembolsar». */
  const cola = termino.length >= 6 ? '[a-z]{0,3}' : 's?';
  return new RegExp('(^|\\s)' + termino + cola + '(\\s|$)').test(texto);
}

/**
 * @param {{ nodos: Record<string, any>, entidades: (texto: string) => any, casosParticulares: string[] }} op
 */
export function crearInterprete({ nodos, entidades, casosParticulares }) {
  /** @param {string} texto @param {(n: any) => boolean} filtro @param {string} tema @param {string} [ramo] */
  function puntuar(texto, filtro, tema, ramo) {
    /** @type {{ id: string, s: number }[]} */
    const puntajes = [];
    for (const id of Object.keys(nodos)) {
      const n = nodos[id];
      if (!n.terminos || !filtro(n)) continue;
      let s = 0;
      for (const [t, peso] of n.terminos) if (contiene(texto, t)) s += peso;
      if (n.penaliza) for (const [t, peso] of n.penaliza) if (contiene(texto, t)) s -= peso;
      if (s <= 0) continue;
      if (ramo && n.tema === ramo) s += PESO_RAMO_NOMBRADO;
      else if (!ramo && n.tema === tema) s += PESO_TEMA;
      puntajes.push({ id, s });
    }
    return puntajes.sort((a, b) => b.s - a.s);
  }

  /** @param {{ id: string, s: number }[]} p */
  function decidir(p) {
    const [top, segundo] = p;
    if (top && top.s >= UMBRAL_ALTO && (!segundo || top.s - segundo.s >= 1.5)) return { tipo: 'directo', id: top.id, score: top.s };
    if (top && top.s >= UMBRAL_BAJO) return { tipo: 'ambiguo', opciones: p.slice(0, 3).map((x) => x.id), score: top.s };
    return { tipo: 'ninguno', score: top ? top.s : 0 };
  }

  /** @param {string} bruto @param {{ modo: string, tema: string }} donde */
  return function interpretar(bruto, { modo, tema }) {
    const texto = normalizarTexto(bruto);
    const ent = entidades(texto) || {};
    /* Lo personal nunca recibe una respuesta de catálogo al contratar: va a
       una persona. En «Ayuda» no aplica: ahí «mi hijo» es parte de la pregunta. */
    if (modo === 'contratar') for (const caso of casosParticulares) {
      if (texto.includes(' ' + caso)) return { tipo: 'directo', id: 'caso_particular', score: 9, entidades: ent, modo };
    }
    /* Primero en el espacio donde está la persona; si ahí no hay nada, en
       el otro (una pregunta de reembolso mientras cotiza se responde igual). */
    const otro = modo === 'ayuda' ? 'contratar' : 'ayuda';
    let r = decidir(puntuar(texto, (n) => n.modo === modo || n.modo === 'ambos', tema, ent.ramo));
    if (r.tipo === 'ninguno') {
      const r2 = decidir(puntuar(texto, (n) => n.modo === otro, tema, ent.ramo));
      if (r2.tipo === 'directo') r = { ...r2 };
    }
    return { ...r, entidades: ent };
  };
}

/* ── Panel ──────────────────────────────────────────────────────────── */
const ICONO = '<img src="/assets/img/matias.svg" alt="" width="40" height="40">';
const ENVIAR = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.2 20.4 21.5 12 3.2 3.6l.1 6.5L15 12 3.3 13.9z"/></svg>';
const CERRAR = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/* Cuánto tarda en contestar. Sin ninguna pausa el texto aparece de golpe y
   no se lee como una respuesta; con demasiada, estorba. */
const RITMO = { base: 220, porCaracter: 0.3, tope: 650 };

/**
 * @param {{
 *   CONTENIDO: any,
 *   interpretar: (texto: string, donde: { modo: string, tema: string }) => any,
 *   contexto: (tema: string) => any,
 *   rotulo: (modo: string, tema: string, ctx: any) => string,
 *   alElegir?: (tema: string, eleccion: { plan?: string, deducible?: number }) => void,
 * }} op
 */
export function montarPanel({ CONTENIDO, interpretar, contexto, rotulo, alElegir }) {
  const host = document.createElement('div');
  host.innerHTML = `
<section class="matias" id="matias" hidden role="dialog" aria-modal="false" aria-labelledby="matias-titulo" data-ambito="matias">
  <header class="matias__cabeza">
    ${ICONO}
    <div class="matias__ident">
      <h2 id="matias-titulo"><strong>MatIAs</strong>, tu IA de seguros</h2>
      <p class="matias__contexto" id="matias-contexto"></p>
    </div>
    <button class="matias__cerrar" type="button" id="matias-cerrar" aria-label="Cerrar MatIAs">${CERRAR}</button>
  </header>
  <div class="matias__modos" role="group" aria-label="Qué necesitas">
    <button type="button" data-modo="contratar" aria-pressed="true">Contratar un seguro</button>
    <button type="button" data-modo="ayuda" aria-pressed="false">Ayuda con mi seguro</button>
  </div>
  <div class="matias__hilo" id="matias-hilo-contratar" data-hilo="contratar" role="log" aria-live="polite" aria-label="Conversación para contratar" tabindex="0"></div>
  <div class="matias__hilo" id="matias-hilo-ayuda" data-hilo="ayuda" role="log" aria-live="polite" aria-label="Conversación de ayuda" tabindex="0" hidden></div>
  <div class="matias__sugerencias" id="matias-sugerencias" role="group" aria-label="Preguntas sugeridas"></div>
  <form class="matias__compositor" id="matias-compositor" autocomplete="off">
    <label for="matias-entrada" class="sr">Escribe tu pregunta</label>
    <input id="matias-entrada" type="text" placeholder="Escribe tu pregunta…" maxlength="180">
    <button type="submit" aria-label="Enviar pregunta">${ENVIAR}</button>
  </form>
  <p class="matias__pie"><span>Te doy información, no asesoría.</span><span>Contenido v${esc(CONTENIDO.version)}</span></p>
</section>`;
  document.body.append(...host.children);

  const q = (/** @type {string} */ s) => /** @type {HTMLElement} */ (document.querySelector(s));
  const panel = q('#matias');
  const sugerencias = q('#matias-sugerencias');
  const entrada = /** @type {HTMLInputElement} */ (q('#matias-entrada'));
  /** @type {Record<string, HTMLElement>} */
  const hilos = { contratar: q('#matias-hilo-contratar'), ayuda: q('#matias-hilo-ayuda') };

  const local = {
    abierto: false, modo: 'contratar', tema: 'inicio', ocupado: false,
    /** @type {HTMLElement|null} */ origen: null,
    /** @type {Record<string, string[]>} */ vistos: { contratar: [], ayuda: [] },
    /** @type {Record<string, string|null>} */ ultima: { contratar: null, ayuda: null },
    /** @type {Record<string, string[]|undefined>} */ chips: { contratar: undefined, ayuda: undefined },
    /** @type {Record<string, boolean>} */ iniciado: { contratar: false, ayuda: false },
    anunciado: '',
  };

  const hilo = () => hilos[local.modo];
  const bajar = () => { const h = hilo(); h.scrollTop = h.scrollHeight; };

  /** @param {string} tipo @param {string} html */
  function burbuja(tipo, html) {
    const d = document.createElement('div');
    d.className = `burbuja burbuja--${tipo}`;
    d.innerHTML = html;
    hilo().appendChild(d);
    bajar();
    return d;
  }

  /** @param {boolean} si */
  function escribiendo(si) {
    hilo().querySelector('.escribiendo')?.remove();
    if (!si) return;
    const d = document.createElement('div');
    d.className = 'escribiendo';
    d.setAttribute('aria-label', 'MatIAs está escribiendo');
    d.innerHTML = '<i></i><i></i><i></i>';
    hilo().appendChild(d);
    bajar();
  }

  /** @param {any} t */
  function tabla(t) {
    const th = t.encabezados.map((/** @type {string} */ h, /** @type {number} */ j) => `<th scope="col"${t.colDestacada === j ? ' class="destaca"' : ''}>${esc(h)}</th>`).join('');
    const tr = t.filas.map((/** @type {string[]} */ f, /** @type {number} */ i) => '<tr>' + f.map((c, j) => {
      const marca = t.colDestacada === j || (t.filaDestacada === i && j > 0);
      return j === 0 ? `<th scope="row"${marca ? ' class="destaca"' : ''}>${esc(c)}</th>` : `<td${marca ? ' class="destaca"' : ''}>${esc(c)}</td>`;
    }).join('') + '</tr>').join('');
    return `<div class="mini-tabla"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
  }

  /** Arma la respuesta. Los textos llegan ya escapados de la biblioteca. @param {any} r @param {any} ctx */
  function componer(r, ctx) {
    const partes = [];
    const lista = typeof r.lista === 'function' ? r.lista(ctx) : r.lista;
    const t = typeof r.tabla === 'function' ? r.tabla(ctx) : r.tabla;
    for (const p of r.parrafos || []) {
      if (p === null) {
        if (lista?.length) partes.push('<ul>' + lista.map((/** @type {string} */ i) => `<li>${i}</li>`).join('') + '</ul>');
        if (t) partes.push(tabla(t));
      } else partes.push(`<p>${p}</p>`);
    }
    if (r.cierre) for (const p of r.cierre) partes.push(`<p>${p}</p>`);
    if (r.gancho) partes.push(`<p class="gancho">${r.gancho}</p>`);
    if (r.formulario) partes.push(`<div class="matias-form">${r.formulario}</div>`);
    if (r.acciones?.length) {
      partes.push(`<div class="matias-acciones">${r.acciones.map((/** @type {any} */ a) =>
        `<a class="btn ${a.primario ? 'btn--primario' : 'btn--linea'} btn--chico" href="${esc(a.href)}" data-medir="${esc(a.medir)}" data-ambito="matias"${a.externo ? ' target="_blank" rel="noopener"' : ''}>${esc(a.texto)}</a>`).join('')}</div>`);
    }
    if (r.micro) partes.push(`<span class="fuente">${r.micro}</span>`);
    const fuente = r.fuente ?? CONTENIDO.fuente[local.modo];
    if (fuente) partes.push(`<span class="fuente">${fuente}</span>`);
    return partes.join('');
  }

  const api = { responder, burbuja, actualiza: actualizaRotulo, cambiarModo };

  /** @param {string} id @param {{ silencioso?: boolean }} [op] */
  function responder(id, { silencioso = false } = {}) {
    const n = CONTENIDO.nodos[id];
    if (!n) return;
    if (n.modo !== 'ambos' && n.modo !== local.modo) cambiarModo(n.modo, { sinApertura: true });
    if (n.tema && n.tema !== 'comun') local.tema = n.tema;
    const ctx = contexto(local.tema);
    const r = n.respuesta(ctx);
    const html = componer(r, ctx);
    if (r.elegir && ctx?.vivo) alElegir?.(local.tema, r.elegir);
    escribiendo(true);
    local.ocupado = true;
    const demora = silencioso ? 0 : Math.min(RITMO.tope, RITMO.base + html.length * RITMO.porCaracter);
    setTimeout(() => {
      escribiendo(false);
      const b = burbuja('bot', html);
      b.dataset.nodo = id;
      r.alMontar?.(b, api);
      local.ultima[local.modo] = id;
      if (!local.vistos[local.modo].includes(id)) local.vistos[local.modo].push(id);
      local.ocupado = false;
      pintarSugerencias(r.sugerencias);
      actualizaRotulo();
    }, demora);
  }

  /** @param {string[]} [ids] */
  function pintarSugerencias(ids) {
    /* Una lista vacía es una decisión («aquí no van chips»); sin lista,
       el menú del espacio sin lo ya conversado. */
    let lista = ids;
    if (!lista) lista = CONTENIDO.menu[local.modo](local.tema).filter((/** @type {string} */ id) => !local.vistos[local.modo].includes(id)).slice(0, 4);
    lista = [...new Set(lista.filter((id) => CONTENIDO.nodos[id]))].slice(0, 4);
    local.chips[local.modo] = lista;
    sugerencias.innerHTML = lista.map((id) => {
      const n = CONTENIDO.nodos[id];
      return `<button type="button" class="chip-matias${n.cta ? ' chip-matias--cta' : ''}" id="matias-chip-${id}" data-nodo="${id}">${esc(n.etiqueta)}</button>`;
    }).join('');
  }

  /** @param {string} bruto */
  function turno(bruto) {
    const texto = String(bruto).trim();
    if (!texto || local.ocupado) return;
    const r = interpretar(texto, { modo: local.modo, tema: local.tema });
    /* Si la respuesta es del otro espacio, la pregunta se va con ella. */
    const destino = r.tipo === 'directo' ? CONTENIDO.nodos[r.id]?.modo : null;
    if (destino && destino !== 'ambos' && destino !== local.modo) cambiarModo(destino, { sinApertura: true });
    burbuja('usuario', esc(texto));

    /* «¿Y el premium?», «¿y con deducible 10?»: cambia lo que se mira, en la
       pantalla y en la conversación. */
    const ramo = r.entidades.ramo || local.tema;
    /** @type {{ plan?: string, deducible?: number }} */
    const eleccion = {};
    const ctx = contexto(ramo);
    const plan = ramo === 'auto' ? r.entidades.planAuto : ramo === 'hogar' ? r.entidades.planHogar : undefined;
    if (plan && ctx?.vivo && plan !== ctx.plan.id) eleccion.plan = plan;
    if (r.entidades.deducible !== undefined && ctx?.vivo && ctx.deducibles.includes(r.entidades.deducible) && r.entidades.deducible !== ctx.deducible) eleccion.deducible = r.entidades.deducible;
    const cambia = Object.keys(eleccion).length > 0;
    if (cambia) { local.tema = ramo; alElegir?.(ramo, eleccion); }

    registrar('matias_rec_pregunta', {
      modo: local.modo, tema: local.tema, resultado: r.tipo, nodo: r.id || '', puntaje: Math.round((r.score || 0) * 10) / 10,
    });

    if (r.tipo === 'directo') { responder(r.id); return; }
    if (cambia || ((plan || r.entidades.deducible !== undefined) && ctx?.vivo)) {
      const ultima = local.ultima[local.modo];
      responder(ultima && CONTENIDO.nodos[ultima]?.tema === local.tema ? ultima : `${local.tema}_precio`);
      return;
    }
    escribiendo(true); local.ocupado = true;
    setTimeout(() => {
      escribiendo(false); local.ocupado = false;
      if (r.tipo === 'ambiguo') {
        burbuja('bot', componer(CONTENIDO.ambiguo(), null));
        pintarSugerencias(r.opciones);
      } else {
        const d = CONTENIDO.sinCoincidencia(local.modo, local.tema);
        burbuja('bot', componer({ ...d, fuente: 'Sin coincidencia en las respuestas aprobadas' }, null));
        pintarSugerencias(d.sugerencias);
      }
    }, 380);
  }

  function actualizaRotulo() {
    q('#matias-contexto').textContent = rotulo(local.modo, local.tema, contexto(local.tema));
  }

  /** @param {string} modo @param {{ sinApertura?: boolean }} [op] */
  function cambiarModo(modo, { sinApertura = false } = {}) {
    if (modo !== 'contratar' && modo !== 'ayuda') return;
    local.modo = modo;
    panel.querySelectorAll('[data-modo]').forEach((b) => b.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (b).dataset.modo === modo)));
    Object.entries(hilos).forEach(([m, h]) => { h.hidden = m !== modo; });
    if (modo === 'ayuda' && local.tema !== 'servicio') local.tema = 'servicio';
    if (modo === 'contratar' && local.tema === 'servicio') local.tema = 'inicio';
    if (!local.iniciado[modo]) {
      local.iniciado[modo] = true;
      if (!sinApertura) apertura();
    } else pintarSugerencias(local.chips[modo]);
    actualizaRotulo();
  }

  function apertura() {
    const ctx = contexto(local.tema);
    const r = CONTENIDO.apertura[local.modo](local.tema, ctx);
    const b = burbuja('bot', componer(r, ctx));
    r.alMontar?.(b, api);
    pintarSugerencias(r.sugerencias);
  }

  /**
   * @param {{ modo?: string, tema?: string, origen?: HTMLElement|null }} [op]
   */
  function abrir({ modo = 'contratar', tema = 'inicio', origen = null } = {}) {
    local.origen = origen;
    if (!local.abierto) {
      local.abierto = true;
      local.tema = tema;
      panel.hidden = false;
      panel.classList.add('matias--entrando');
      setTimeout(() => panel.classList.remove('matias--entrando'), 320);
      document.getElementById('matias-lanzador')?.setAttribute('hidden', '');
      registrar('matias_click_abrir', { modo, tema });
    }
    if (modo !== local.modo || !local.iniciado[modo]) cambiarModo(modo);
    actualizaRotulo();
    local.anunciado = rotulo(local.modo, local.tema, contexto(local.tema));
    setTimeout(() => entrada.focus(), 60);
  }

  function cerrar() {
    if (!local.abierto) return;
    local.abierto = false;
    panel.hidden = true;
    const lanzador = document.getElementById('matias-lanzador');
    lanzador?.removeAttribute('hidden');
    registrar('matias_click_cerrar', { modo: local.modo, tema: local.tema });
    (local.origen && document.body.contains(local.origen) ? local.origen : lanzador?.querySelector('button'))?.focus();
  }

  /**
   * La pantalla cambió lo que se mira (otro plan, otro deducible): se dice.
   * Si el cambio lo pidió MatIAs, ya lo dijo en su respuesta: solo se
   * actualiza el rótulo. @param {{ propio?: boolean }} [op]
   */
  function avisarCambio({ propio = false } = {}) {
    const ctx = contexto(local.tema);
    const r = rotulo(local.modo, local.tema, ctx);
    actualizaRotulo();
    if (propio || !local.abierto || local.modo !== 'contratar' || r === local.anunciado || !ctx?.vivo) { local.anunciado = r; return; }
    local.anunciado = r;
    if (!CONTENIDO.cambioDePlan) return;
    burbuja('bot', componer(CONTENIDO.cambioDePlan(local.tema, ctx), ctx));
    local.vistos.contratar = [];
  }

  q('#matias-cerrar').addEventListener('click', cerrar);
  panel.querySelector('.matias__modos')?.addEventListener('click', (e) => {
    const b = e.target instanceof Element ? e.target.closest('[data-modo]') : null;
    if (!b) return;
    const modo = /** @type {HTMLElement} */ (b).dataset.modo || 'contratar';
    if (modo === local.modo) return;
    cambiarModo(modo);
    registrar('matias_click_modo', { modo });
  });
  sugerencias.addEventListener('click', (e) => {
    const b = e.target instanceof Element ? e.target.closest('[data-nodo]') : null;
    if (!b || local.ocupado) return;
    const id = /** @type {HTMLElement} */ (b).dataset.nodo || '';
    burbuja('usuario', esc(b.textContent || ''));
    registrar('matias_click_sugerencia', { nodo: id });
    responder(id);
  });
  q('#matias-compositor').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = entrada.value;
    entrada.value = '';
    turno(v);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && local.abierto) cerrar(); });

  return { abrir, cerrar, avisarCambio, responder, cambiarModo, estado: () => ({ ...local }) };
}
