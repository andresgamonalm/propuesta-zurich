// @ts-check
/** 404 · Página no encontrada. */
import { icono } from '../ui.js';

/** @param {{ main: HTMLElement }} ctx */
export function render({ main }) {
  main.innerHTML = `<section class="seccion"><div class="contenedor"><div class="vacio">
    ${icono('lupa')}
    <h1>No encontramos esta página</h1>
    <p>Puede que la dirección esté incompleta o que el contenido ya no esté disponible. Desde aquí puedes volver a los seguros o a los trámites.</p>
    <div class="acciones"><a class="btn btn--primario" href="/home/">Ir al inicio</a><a class="btn btn--fantasma" href="/servicios/">Ver trámites</a></div>
  </div></div></section>`;
}
