// @ts-check
/**
 * Punto de entrada de todas las páginas.
 *
 * Cada index.html declara qué es en <body data-pagina="…" data-id="…"> y
 * carga solo este archivo. Aquí se resuelve, en orden: sesión → perfil →
 * marco común → módulo de la página → vista medida.
 *
 * La carpeta es la dirección: /personas/auto/auto-digital/ es esa carpeta
 * con su index.html. Sin enrutador y sin reglas de servidor.
 */
import { consultar, rutaActual } from './sesion.js';
import { cabecera, pie, activarMarco, accesoRestringido } from './marco.js';
import { registrar, escucharClics, fijarPerfil, normalizar } from './medicion.js';
import { esc } from './ui.js';

const cuerpo = document.body;
const pagina = cuerpo.dataset.pagina || 'error';
const id = cuerpo.dataset.id || '';
const publica = pagina === 'login';

/** Ámbito de medición: la página y, si tiene, su producto o servicio. */
const ambito = normalizar(cuerpo.dataset.ambito || (id ? `${pagina}_${id}` : pagina));

async function arrancar() {
  const main = /** @type {HTMLElement} */ (document.getElementById('contenido'));

  if (!publica) {
    const r = consultar();
    if (r.estado !== 'activa') {
      const motivo = r.estado === 'vencida' ? '&motivo=vencida' : '';
      location.replace(`/login/?vuelta=${encodeURIComponent(rutaActual())}${motivo}`);
      return;
    }
    const s = r.sesion;
    fijarPerfil(s.perfil);
    document.getElementById('marco-cabecera')?.insertAdjacentHTML('afterbegin', cabecera(s));
    document.getElementById('marco-pie')?.insertAdjacentHTML('afterbegin', pie());
    activarMarco();

    if (cuerpo.dataset.soloAdmin === 'si' && s.perfil !== 'administrador') {
      main.innerHTML = accesoRestringido();
      main.removeAttribute('aria-busy');
      registrar(`${ambito}_pag_restringida`);
      return;
    }
    escucharClics(ambito);
    const mod = await import(`./paginas/${pagina}.js`);
    await mod.render({ main, id, sesion: s, ambito });
  } else {
    escucharClics(ambito);
    const mod = await import(`./paginas/${pagina}.js`);
    await mod.render({ main, id, ambito });
  }
  registrar(`${ambito}_pag_vista`);
  main.removeAttribute('aria-busy');
}

arrancar().catch((error) => {
  console.error(error);
  const main = document.getElementById('contenido');
  if (main) {
    main.innerHTML = `<section class="seccion"><div class="contenedor"><div class="vacio">
      <h1>No pudimos cargar esta página</h1>
      <p>Intenta recargarla. Si el problema sigue, vuelve al inicio.</p>
      <p class="texto-suave">${esc(error?.message || '')}</p>
      <a class="btn btn--primario" href="/home/">Volver al inicio</a></div></div></section>`;
    main.removeAttribute('aria-busy');
  }
});
