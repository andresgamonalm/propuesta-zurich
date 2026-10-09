// @ts-check
/**
 * /personas/vida-y-salud/asesoria/<producto>/ · Solicitud de asesoría.
 *
 * Venta asistida (brief §Comportamiento por modalidad): página informativa →
 * formulario o canal de agente → «Solicitar asesoría».
 *
 * Lo que este formulario NO inventa: el texto de consentimiento. El brief lo
 * deja como «definición necesaria» y aquí se muestra como pendiente, sin
 * casilla, hasta que exista un texto aprobado por legal.
 *
 * Prototipo: la solicitud se guarda en este navegador y aparece en
 * Configuración › Solicitudes. En producción va al canal de agentes de Zurich.
 */
import { producto, ramo } from '../catalogo.js';
import { esVisible, agregarSolicitud } from '../estado.js';
import { migas, noDisponible } from '../marco.js';
import { esc, icono, foto, porValidar } from '../ui.js';
import { ganchoDe, pendientesAdmin } from '../piezas.js';
import { registrar, normalizar } from '../medicion.js';

/** @param {{ main: HTMLElement, id: string, sesion: import('../sesion.js').Sesion }} ctx */
export function render({ main, id, sesion }) {
  const admin = sesion.perfil === 'administrador';
  const p = /** @type {any} */ (producto(id));
  if (!p || p.modalidad !== 'asesoria' || (!admin && !esVisible(p.id))) { main.innerHTML = noDisponible(); return; }
  const r = ramo(p.ramo);
  const amb = normalizar(p.id);
  const g = ganchoDe(p);

  main.innerHTML = `
  ${migas([{ texto: 'Seguros', href: '/personas/' }, { texto: r?.nombre ?? '', href: r?.ruta }, { texto: p.nombre, href: p.ruta }, { texto: 'Solicitar asesoría' }])}
  <section class="seccion seccion--compacta">
    <div class="contenedor rejilla">
      <div class="c-7">
        <div class="encabezado-seccion">
          <span class="antetitulo">Con asesoría</span>
          <h1>Solicita asesoría para ${esc(p.nombre)}</h1>
          <p>Déjanos tus datos y un asesor de Zurich te contactará para orientarte y continuar con la contratación.</p>
        </div>
        <form class="formulario" novalidate>
          <div class="campo" data-campo="nombre">
            <label for="nombre">Nombre y apellido</label>
            <input id="nombre" name="nombre" autocomplete="name" required aria-describedby="e-nombre">
            <p class="campo__error" id="e-nombre">${icono('alerta')}<span></span></p>
          </div>
          <div class="dos-campos">
            <div class="campo" data-campo="correo">
              <label for="correo">Correo electrónico</label>
              <input id="correo" name="correo" type="email" autocomplete="email" value="${esc(sesion.correo)}" required aria-describedby="a-correo e-correo">
              <span class="campo__precargado" id="a-correo">${icono('check')}Lo tomamos de tu ingreso. Puedes cambiarlo.</span>
              <p class="campo__error" id="e-correo">${icono('alerta')}<span></span></p>
            </div>
            <div class="campo" data-campo="celular">
              <label for="celular">Celular</label>
              <input id="celular" name="celular" type="tel" autocomplete="tel-national" inputmode="numeric" placeholder="9 1234 5678" required aria-describedby="h-celular e-celular">
              <span class="ayuda" id="h-celular">9 dígitos, empieza con 9.</span>
              <p class="campo__error" id="e-celular">${icono('alerta')}<span></span></p>
            </div>
          </div>
          <fieldset class="campo" data-campo="horario" aria-describedby="e-horario">
            <legend>¿Cuándo prefieres que te contactemos?</legend>
            <div class="opciones mt-2">
              <label class="opcion"><input type="radio" name="horario" value="manana"><span>En la mañana</span></label>
              <label class="opcion"><input type="radio" name="horario" value="tarde"><span>En la tarde</span></label>
            </div>
            <p class="campo__error" id="e-horario">${icono('alerta')}<span></span></p>
          </fieldset>
          <div class="campo">
            <label for="comentario">¿Algo que quieras contarnos? <span class="texto-suave">(opcional)</span></label>
            <textarea id="comentario" name="comentario" maxlength="300" aria-describedby="c-comentario"></textarea>
            <span class="ayuda" id="c-comentario">Quedan 300 caracteres.</span>
          </div>
          <div class="aviso aviso--aviso" role="note">${icono('info')}<div><strong>Autorización de contacto y tratamiento de datos</strong>El texto legal está en definición con Zurich y Banco BICE. ${porValidar('Pendiente de aprobación legal')}</div></div>
          <div class="acciones">
            <button class="btn btn--primario" type="submit" data-medir="enviar_solicitud" data-ambito="${amb}">Solicitar asesoría</button>
            <a class="btn btn--fantasma" href="${p.ruta}">Volver al seguro</a>
          </div>
          <p class="aviso aviso--error" role="alert" hidden id="error-general">${icono('alerta')}<span>Revisa los campos marcados para continuar.</span></p>
        </form>
      </div>
      <aside class="c-5" aria-label="Resumen del seguro">
        <div class="tarjeta">
          <div class="tarjeta__foto">${foto(p.foto, '', { sizes: '(max-width: 960px) 100vw, 40vw' })}</div>
          <div class="tarjeta__cuerpo">
            <h2 class="h-lg">${esc(p.nombre)}</h2>
            ${g ? `<p class="tarjeta__gancho">${esc(g.valor)}</p>` : ''}
            <ul class="lista-check">${p.beneficios.map((/** @type {any} */ b) => `<li>${icono('check')}<span><strong>${esc(b.titulo)}.</strong> ${esc(b.texto)}</span></li>`).join('')}</ul>
          </div>
        </div>
        ${pendientesAdmin(p.porValidar, admin)}
      </aside>
    </div>
  </section>`;

  const form = /** @type {HTMLFormElement} */ (main.querySelector('form'));
  const val = (/** @type {string} */ n) => /** @type {HTMLInputElement} */ (form.elements.namedItem(n))?.value?.trim() ?? '';
  const comentario = /** @type {HTMLTextAreaElement} */ (form.querySelector('#comentario'));
  const contador = /** @type {HTMLElement} */ (form.querySelector('#c-comentario'));
  comentario.addEventListener('input', () => { contador.textContent = `Quedan ${300 - comentario.value.length} caracteres.`; });

  /** @param {string} campo @param {string} texto */
  const error = (campo, texto) => {
    const c = /** @type {HTMLElement} */ (form.querySelector(`[data-campo="${campo}"]`));
    if (texto) { c.dataset.estado = 'error'; c.querySelector('input')?.setAttribute('aria-invalid', 'true'); }
    else { delete c.dataset.estado; c.querySelectorAll('input').forEach((i) => i.removeAttribute('aria-invalid')); }
    const span = c.querySelector('.campo__error span'); if (span) span.textContent = texto;
  };
  form.addEventListener('input', (e) => {
    const c = /** @type {HTMLElement|null} */ (e.target instanceof Element ? e.target.closest('[data-campo]') : null);
    if (c?.dataset.estado === 'error') error(/** @type {string} */ (c.dataset.campo), '');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const celular = val('celular').replace(/\D/g, '').replace(/^56/, '');
    const horario = /** @type {HTMLInputElement|null} */ (form.querySelector('input[name="horario"]:checked'))?.value ?? '';
    const fallas = {
      nombre: val('nombre').length < 3 ? 'Escribe tu nombre y apellido.' : '',
      correo: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('correo')) ? '' : 'Revisa el correo: falta la @ o el dominio.',
      celular: /^9\d{8}$/.test(celular) ? '' : 'Escribe un celular de 9 dígitos que empiece con 9.',
      horario: horario ? '' : 'Elige si prefieres que te contactemos en la mañana o en la tarde.',
    };
    Object.entries(fallas).forEach(([c, t]) => error(c, t));
    const primera = Object.entries(fallas).find(([, t]) => t);
    const general = /** @type {HTMLElement} */ (form.querySelector('#error-general'));
    if (primera) {
      general.hidden = false;
      /** @type {HTMLElement|null} */ (form.querySelector(`[data-campo="${primera[0]}"] input`))?.focus();
      registrar(`${amb}_rec_error_formulario`, { campo: primera[0] });
      return;
    }
    general.hidden = true;
    const boton = /** @type {HTMLButtonElement} */ (form.querySelector('button[type="submit"]'));
    boton.disabled = true;
    boton.innerHTML = '<span class="girador" aria-hidden="true"></span><span>Enviando…</span>';
    const s = agregarSolicitud({ producto: p.id, nombre: val('nombre'), correo: val('correo'), celular, horario, comentario: comentario.value.trim() });
    registrar(`${amb}_rec_solicitud_asesoria`, { horario });
    location.assign(`${location.pathname}enviada/?n=${s.id}`);
  });
}
