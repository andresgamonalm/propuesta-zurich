// @ts-check
/** / · La raíz no tiene contenido propio: con sesión activa, lleva a la portada. */
/** @param {{ main: HTMLElement }} ctx */
export function render({ main }) {
  main.innerHTML = '<div class="cargando">Abriendo el espacio de seguros…</div>';
  location.replace('/home/');
}
