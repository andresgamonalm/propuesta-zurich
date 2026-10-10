// @ts-check
/**
 * Datos para probar la maqueta, a la vista.
 *
 * Pedido de Andrés (10-10-2026): «agregar los datos para probar en el mismo
 * aplicativo, pero que la persona los vea». Hasta ahora estaban en la
 * documentación y en una pista chica bajo el campo de RUT.
 *
 * Dónde aparecen, todos con la misma fuente:
 *   1. Un botón fijo «Datos para probar», abajo a la izquierda en todas las
 *      páginas (también en el acceso). Abre un panel con todo.
 *   2. Al lado de cada cotizador de demostración, los datos del paso en que
 *      va la persona y el botón «Completar este paso», que los escribe en el
 *      cotizador. En el celular va arriba del cotizador, no al final.
 *   3. En el acceso, dos botones que escriben el correo de prueba.
 *   4. En MatIAs, los dos clientes ficticios para que la reconozca
 *      (matias/inicio.js).
 * Cada dato tiene su botón «Copiar». Todo se apaga en Configuración.
 *
 * Los datos por paso salen de la tabla del cotizador
 * (/herramientas/assets/js/prueba-pasos.js) y los clientes de su base
 * (clientes-demo.js): si cambian allá, cambian aquí. Son ficticios.
 */
import { CLIENTES_DEMO } from '/herramientas/assets/js/clientes-demo.js';
import { PASOS_PRUEBA, CEDULA } from '/herramientas/assets/js/prueba-pasos.js';
import { CORREO_ADMIN } from './sesion.js';
import { esVisible } from './estado.js';
import { esc, icono } from './ui.js';
import { registrar } from './medicion.js';

export const ID = 'datos-prueba';
export const CORREO_CLIENTE = 'cliente@correo.cl';

/** ¿Se muestran? Se apagan en Configuración. */
export const activos = () => esVisible(ID);

/** Nombre corto de un cliente ficticio. @param {any} c */
export const nombreCorto = (c) => `${c.nombres.split(' ')[0]} ${c.apellidos.split(' ')[0]}`;

/** Un dato con su botón de copiar. @param {string} rotulo @param {string} valor @param {string} [nota] */
export function copiable(rotulo, valor, nota = '') {
  return `<div class="prueba-dato">
    <div class="prueba-dato__texto"><span class="prueba-dato__rotulo">${esc(rotulo)}</span>
      <code class="prueba-dato__valor">${esc(valor)}</code>${nota ? `<span class="prueba-dato__nota">${esc(nota)}</span>` : ''}</div>
    <button type="button" class="prueba-dato__copiar" data-copiar="${esc(valor)}" aria-label="Copiar ${esc(rotulo)}: ${esc(valor)}">${icono('copiar')}<span>Copiar</span></button>
  </div>`;
}

/* ── 1 · El botón fijo y su panel ──────────────────────────────────────── */

/** @param {any} c */
const cliente = (c) => `<div class="prueba-cliente">
    <strong>${esc(nombreCorto(c))}</strong>
    ${copiable('RUT', c.rut)}
    ${copiable('Patente', c.patente, `${c.marca} ${c.modelo} ${c.anio}`)}
    ${copiable('Comuna', c.comunaDom, 'para Hogar')}
  </div>`;

function contenidoPanel() {
  return `
    <section><h3>Para entrar</h3>
      ${copiable('Como cliente', CORREO_CLIENTE, 'o cualquier correo')}
      ${copiable('Como administrador', CORREO_ADMIN, 'además ve Configuración')}
    </section>
    <section><h3>Clientes ficticios</h3>
      <p>Sirven en los cotizadores de Auto, Hogar y Urgencias, y para que MatIAs te reconozca: RUT y patente (Auto) o RUT y comuna (Hogar).</p>
      ${CLIENTES_DEMO.map(cliente).join('')}
    </section>
    <section><h3>En los cotizadores</h3>
      <p>Al lado de cada cotizador verás los datos del paso en que vas y el botón <strong>«Completar este paso»</strong>, que los escribe por ti.</p>
      ${copiable('Cédula para firmar', CEDULA, 'nueve dígitos cualesquiera')}
      <p>El pago es simulado: no se cobra nada.</p>
    </section>
    <section><h3>Para conversar con MatIAs</h3>
      <ul class="prueba-frases">
        <li>Mirando los planes: «¿y el premium?» o «con deducible 10 UF»</li>
        <li>«¿Cómo pido un reembolso dental?»</li>
        <li>«Me chocaron el auto»</li>
      </ul>
    </section>`;
}

/** Copiar al portapapeles, con aviso. Un solo oyente para todo el sitio. */
function escucharCopiar() {
  const aviso = document.createElement('p');
  aviso.className = 'sr';
  aviso.setAttribute('aria-live', 'polite');
  document.body.appendChild(aviso);
  document.addEventListener('click', async (e) => {
    const b = /** @type {HTMLElement|null} */ (e.target instanceof Element ? e.target.closest('[data-copiar]') : null);
    if (!b) return;
    const valor = b.dataset.copiar || '';
    let ok = false;
    try { await navigator.clipboard.writeText(valor); ok = true; } catch { ok = false; }
    if (!ok) {
      /* Sin permiso para el portapapeles: queda seleccionado para copiarlo a mano. */
      const codigo = b.closest('.prueba-dato')?.querySelector('code');
      if (codigo) { const r = document.createRange(); r.selectNodeContents(codigo); getSelection()?.removeAllRanges(); getSelection()?.addRange(r); }
    }
    const t = b.querySelector('span');
    if (t) {
      t.textContent = ok ? 'Copiado' : 'Selecciónalo';
      b.dataset.copiado = ok ? 'si' : 'no';
      setTimeout(() => { t.textContent = 'Copiar'; delete b.dataset.copiado; }, 1800);
    }
    aviso.textContent = ok ? `Copiado: ${valor}` : `Quedó seleccionado: ${valor}`;
    registrar('prueba_click_copiar');
  });
}

/** El botón fijo abajo a la izquierda y su panel, en todas las páginas. */
export function montar() {
  if (!activos() || document.getElementById('prueba-lanzador')) return;
  escucharCopiar();
  const caja = document.createElement('div');
  caja.className = 'prueba';
  if (document.querySelector('.barra-accion')) caja.dataset.sobreBarra = 'si';
  /* El botón va primero (orden de foco); el CSS dibuja el panel encima. */
  caja.innerHTML = `
    <button type="button" class="prueba__boton" id="prueba-lanzador" aria-expanded="false" aria-controls="prueba-panel">${icono('matraz')}<span>Datos para probar</span></button>
    <div class="prueba__panel" id="prueba-panel" role="dialog" aria-labelledby="prueba-titulo" hidden>
      <div class="prueba__cabeza">
        <div><h2 id="prueba-titulo">Datos para probar</h2><p>Todo es ficticio: no se guarda nada real ni se cobra.</p></div>
        <button type="button" class="prueba__cerrar" aria-label="Cerrar los datos para probar">${icono('cerrar')}</button>
      </div>
      <div class="prueba__cuerpo">${contenidoPanel()}</div>
    </div>`;
  document.body.appendChild(caja);
  const boton = /** @type {HTMLButtonElement} */ (caja.querySelector('.prueba__boton'));
  const panel = /** @type {HTMLElement} */ (caja.querySelector('.prueba__panel'));
  const abrir = (/** @type {boolean} */ si) => {
    panel.hidden = !si;
    boton.setAttribute('aria-expanded', String(si));
    caja.dataset.abierto = si ? 'si' : 'no';
    if (si) { registrar('prueba_click_abrir'); /** @type {HTMLElement|null} */ (panel.querySelector('.prueba__cerrar'))?.focus(); }
  };
  boton.addEventListener('click', () => abrir(panel.hidden));
  caja.querySelector('.prueba__cerrar')?.addEventListener('click', () => { abrir(false); boton.focus(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { abrir(false); boton.focus(); } });
  /* Un clic fuera lo cierra, como cualquier menú. */
  document.addEventListener('click', (e) => { if (!panel.hidden && e.target instanceof Node && !caja.contains(e.target)) abrir(false); });
}

/* ── 2 · Al lado del cotizador, paso por paso ──────────────────────────── */

/**
 * El recuadro del cotizador. Va dos veces: al lado (escritorio) y arriba
 * del cotizador (celular); el CSS muestra uno.
 * @param {string} producto @param {string[]} pasos @param {string[]} etiquetas @param {string} inicial
 * @param {'lateral'|'arriba'} donde
 */
export function cajaPrueba(producto, pasos, etiquetas, inicial, donde) {
  const tabla = PASOS_PRUEBA[producto];
  if (!activos() || !tabla) return '';
  const grupos = pasos.map((paso) => {
    const p = tabla[paso] ?? { datos: [], nota: '' };
    return `<div class="caja-prueba__grupo" data-prueba-paso="${esc(paso)}"${paso === inicial ? '' : ' hidden'}>
      ${p.datos.length ? `<button type="button" class="btn btn--linea btn--chico btn--bloque" data-rellenar>${icono('check')} Completar este paso</button>
        <details class="caja-prueba__datos"${donde === 'lateral' ? ' open' : ''}><summary>Los datos de este paso ${icono('chevron')}</summary>
          ${p.datos.map((d) => copiable(d.rotulo, d.valor, d.nota)).join('')}</details>` : ''}
      ${p.nota ? `<p class="caja-prueba__nota">${esc(p.nota)}</p>` : ''}
    </div>`;
  }).join('');
  const i = Math.max(0, pasos.indexOf(inicial));
  return `<section class="caja-prueba caja-prueba--${donde}" aria-labelledby="caja-prueba-${donde}">
    <div class="caja-prueba__cabeza">
      <span class="caja-prueba__icono">${icono('matraz')}</span>
      <div><h2 id="caja-prueba-${donde}">Datos para probar</h2>
        <p class="caja-prueba__paso" data-prueba-rotulo>Paso ${i + 1} de ${pasos.length} · ${esc(etiquetas[i] ?? '')}</p></div>
    </div>
    ${grupos}
    <p class="caja-prueba__estado" role="status" data-prueba-estado></p>
  </section>`;
}

/**
 * Da vida a los recuadros: «Completar este paso» le pide al cotizador que
 * escriba los datos, y cada aviso de paso muestra los del paso nuevo.
 * @param {HTMLElement} main @param {HTMLIFrameElement|null} marco @param {string[]} pasos @param {string[]} etiquetas @param {string} producto
 */
export function activarCajas(main, marco, pasos, etiquetas, producto) {
  const cajas = /** @type {HTMLElement[]} */ ([...main.querySelectorAll('.caja-prueba')]);
  if (!cajas.length) return { paso: (/** @type {string} */ _p) => {}, rellenado: (/** @type {any} */ _d) => {} };
  const estados = cajas.map((c) => /** @type {HTMLElement} */ (c.querySelector('[data-prueba-estado]')));
  const decir = (/** @type {string} */ t) => estados.forEach((e) => { e.textContent = t; });
  main.addEventListener('click', (e) => {
    const b = e.target instanceof Element ? e.target.closest('[data-rellenar]') : null;
    if (!b || !marco?.contentWindow) return;
    decir('');
    marco.contentWindow.postMessage({ fuente: 'zurich-sitio', tipo: 'rellenar' }, location.origin);
    registrar('prueba_click_completar', { producto });
  });
  return {
    /** El cotizador avisó un paso nuevo. @param {string} paso */
    paso(paso) {
      const i = pasos.indexOf(paso);
      if (i < 0) return;
      cajas.forEach((c) => {
        c.querySelectorAll('[data-prueba-paso]').forEach((g) => { /** @type {HTMLElement} */ (g).hidden = g.getAttribute('data-prueba-paso') !== paso; });
        const r = c.querySelector('[data-prueba-rotulo]');
        if (r) r.textContent = `Paso ${i + 1} de ${pasos.length} · ${etiquetas[i] ?? ''}`;
      });
      decir('');
    },
    /** El cotizador terminó de escribir. @param {{ campos?: number }} d */
    rellenado(d) {
      const n = Number(d.campos) || 0;
      decir(n === 1 ? 'Listo: completamos un dato. Revísalo y sigue en el cotizador.'
        : n ? `Listo: completamos ${n} datos. Revísalos y sigue en el cotizador.`
          : 'No hay campos a la vista para completar en esta pantalla.');
    },
  };
}

/* ── 3 · En el acceso ───────────────────────────────────────────────────── */

/** Bajo el campo de correo: los dos correos de prueba, que se escriben con un clic. */
export function accesosPrueba() {
  if (!activos()) return '';
  return `<div class="acceso-prueba">
    <span class="acceso-prueba__rotulo">${icono('matraz')} Para probar, entra como:</span>
    <button type="button" class="chip-prueba" data-correo="${esc(CORREO_CLIENTE)}">Cliente · ${esc(CORREO_CLIENTE)}</button>
    <button type="button" class="chip-prueba" data-correo="${esc(CORREO_ADMIN)}">Administrador · ${esc(CORREO_ADMIN)}</button>
  </div>`;
}
