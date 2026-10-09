// @ts-check
/** /personas/vida-y-salud/asesoria/<producto>/enviada/ · Confirmación de la solicitud. */
import { producto, ramo, asesoriaRuta } from '../catalogo.js';
import { solicitud } from '../estado.js';
import { migas } from '../marco.js';
import { esc, icono, porValidar } from '../ui.js';

/** @param {{ main: HTMLElement, id: string }} ctx */
export function render({ main, id }) {
  const p = /** @type {any} */ (producto(id));
  const n = new URLSearchParams(location.search).get('n') || '';
  const s = n ? solicitud(n) : undefined;
  const r = p ? ramo(p.ramo) : undefined;
  const camino = p ? [{ texto: 'Seguros', href: '/personas/' }, { texto: r?.nombre ?? '', href: r?.ruta }, { texto: p.nombre, href: p.ruta }, { texto: 'Solicitud enviada' }] : [];

  if (!p || !s || s.producto !== p.id) {
    main.innerHTML = `${migas(camino)}<section class="seccion"><div class="contenedor"><div class="vacio">
      ${icono('info')}<h1>No encontramos una solicitud reciente</h1>
      <p>Puede que ya la hayas enviado desde otro equipo o que el enlace no esté completo. Puedes enviar una nueva solicitud.</p>
      ${p ? `<a class="btn btn--primario" href="${asesoriaRuta(p.id)}">Solicitar asesoría</a>` : '<a class="btn btn--primario" href="/personas/">Ver seguros</a>'}
    </div></div></section>`;
    return;
  }

  const celular = `+56 9 •••• ${s.celular.slice(-4)}`;
  main.innerHTML = `${migas(camino)}
  <section class="seccion seccion--compacta"><div class="contenedor">
    <div class="vacio" role="status">
      <span class="beneficio__icono">${icono('check')}</span>
      <h1>Recibimos tu solicitud</h1>
      <p>Un asesor de Zurich se pondrá en contacto contigo para orientarte sobre el ${esc(p.nombre)}. ${porValidar('Plazo y canal de contacto por definir')}</p>
    </div>
    <div class="dos-columnas mt-6">
      <div class="caja caja--borde">
        <h2 class="h-lg">Resumen de tu solicitud</h2>
        <ul class="lista-check">
          <li>${icono('escudo')}<span><strong>Seguro:</strong> ${esc(p.nombre)}</span></li>
          <li>${icono('reloj')}<span><strong>Horario preferido:</strong> ${s.horario === 'manana' ? 'En la mañana' : 'En la tarde'}</span></li>
          <li>${icono('telefono')}<span><strong>Te contactaremos al:</strong> ${esc(celular)} o ${esc(s.correo)}</span></li>
        </ul>
      </div>
      <div class="caja">
        <h2 class="h-lg">Mientras tanto</h2>
        <p>Revisa las coberturas y condiciones del seguro para preparar tus preguntas.</p>
        <div class="acciones mt-2">
          <a class="btn btn--primario" href="/personas/" data-medir="ver_otros_seguros">Ver otros seguros</a>
          <a class="btn btn--fantasma" href="/home/" data-medir="volver_inicio">Volver al inicio</a>
        </div>
      </div>
    </div>
  </div></section>`;
}
