// @ts-check
/** /login · Ingreso al espacio de seguros (brief §Ingreso al mini sitio). */
import { bloqueo, formas } from '../marco.js';
import { correoValido, iniciar, consultar, vueltaSegura } from '../sesion.js';
import { registrar } from '../medicion.js';
import { icono, foto } from '../ui.js';
import { TELEFONO_ZURICH } from '../catalogo.js';

/** @param {{ main: HTMLElement }} ctx */
export function render({ main }) {
  const params = new URLSearchParams(location.search);
  const vuelta = vueltaSegura(params.get('vuelta'));
  const motivo = params.get('motivo');

  // Quien ya tiene sesión no necesita ver la puerta.
  const r = consultar();
  if (r.estado === 'activa' && !motivo) { location.replace(vuelta); return; }

  const aviso = motivo === 'vencida'
    ? `<div class="aviso aviso--info" role="status">${icono('reloj')}<div><strong>Tu sesión venció por inactividad.</strong>Ingresa nuevamente para continuar donde estabas.</div></div>`
    : '';

  main.innerHTML = `<div class="acceso">
    <div class="acceso__panel">
      ${bloqueo('/login/')}
      <form class="acceso__formulario" novalidate>
        <div class="formulario">
          <span class="antetitulo">Clientes Banco BICE</span>
          <h1>Ingresa al espacio de seguros</h1>
          <p class="texto-suave">Usa tu correo electrónico registrado para acceder a los seguros y servicios disponibles para clientes de Banco BICE.</p>
          ${aviso}
          <div class="campo" id="campo-correo">
            <label for="correo">Correo electrónico</label>
            <input id="correo" name="correo" type="email" autocomplete="email" inputmode="email" required aria-describedby="error-correo" placeholder="nombre@correo.cl">
            <p class="campo__error" id="error-correo" aria-live="polite">${icono('alerta')}<span></span></p>
          </div>
          <button class="btn btn--primario btn--bloque" type="submit" data-medir="ingresar">Ingresar</button>
        </div>
      </form>
      <div class="acceso__pie">
        <p>¿Problemas para ingresar? Llama a Zurich al <a href="${TELEFONO_ZURICH.enlace}">${TELEFONO_ZURICH.visible}</a>.</p>
        <p>Acceso de demostración de la propuesta. En producción, el ingreso se resuelve con la sesión privada de Banco BICE.</p>
      </div>
    </div>
    <div class="acceso__visual">
      ${foto('login-pareja-laptop', 'Una pareja revisa sus seguros en un computador portátil desde su casa.', { grande: true, prioridad: true, sizes: '(max-width: 900px) 100vw, 58vw' })}
      <div class="acceso__mensaje con-formas">
        <strong>Seguros Zurich para clientes de Banco BICE</strong>
        <p>Conoce los seguros disponibles, inicia una cotización y accede a servicios en línea sin salir de este espacio.</p>
        ${formas()}
      </div>
    </div>
  </div>`;

  const form = /** @type {HTMLFormElement} */ (main.querySelector('form'));
  const input = /** @type {HTMLInputElement} */ (main.querySelector('#correo'));
  const campo = /** @type {HTMLElement} */ (main.querySelector('#campo-correo'));
  const error = /** @type {HTMLElement} */ (main.querySelector('#error-correo span'));
  const boton = /** @type {HTMLButtonElement} */ (form.querySelector('button[type="submit"]'));

  const mostrarError = (/** @type {string} */ texto) => {
    campo.dataset.estado = 'error';
    input.setAttribute('aria-invalid', 'true');
    error.textContent = texto;
  };
  input.addEventListener('input', () => {
    if (campo.dataset.estado === 'error') { delete campo.dataset.estado; input.removeAttribute('aria-invalid'); error.textContent = ''; }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = input.value.trim();
    if (!valor) { mostrarError('Escribe tu correo electrónico.'); input.focus(); registrar('login_rec_error', { causa: 'vacio' }); return; }
    if (!correoValido(valor)) { mostrarError('Revisa el correo: falta la @ o el dominio (por ejemplo, nombre@correo.cl).'); input.focus(); registrar('login_rec_error', { causa: 'formato' }); return; }
    boton.disabled = true;
    boton.innerHTML = `<span class="girador" aria-hidden="true"></span><span>Ingresando…</span>`;
    const s = iniciar(valor);
    registrar('login_rec_ingreso', { perfil: s.perfil });
    location.assign(vuelta);
  });
  input.focus();
}
