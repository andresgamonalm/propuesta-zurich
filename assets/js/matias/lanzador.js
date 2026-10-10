// @ts-check
/**
 * MatIAs · el lanzador, en todas las páginas privadas.
 *
 * Es lo único que se carga siempre, y es liviano: un botón abajo a la
 * derecha. El panel con las bibliotecas (panel.js) se pide recién cuando
 * alguien lo abre.
 *
 * Abre donde corresponde a la página:
 *   cotizador de Auto o de Hogar      → «Contratar», hablando de ese seguro
 *   página de Auto o de Hogar         → «Contratar», con ese seguro
 *   trámites y Servicios en línea     → «Ayuda con mi seguro»
 *   el resto                          → «Contratar», con el conserje
 *
 * Si la persona viene de que MatIAs la reconociera (conserje → «Ver mis
 * precios»), en la pantalla siguiente la conversación sigue sola: en
 * escritorio el panel se abre con el plan que está mirando; en el celular
 * no, porque taparía justo los precios, y el lanzador lo avisa.
 */
import { esVisible } from '../estado.js';
import { MATIAS } from '../catalogo.js';
import { esc } from '../ui.js';
import { alCambiar, contexto } from './puente.js';

const SERVICIOS = ['denuncia-vehiculo', 'denuncia-vida', 'reembolso', 'pago'];
const RAMO = /** @type {Record<string, string>} */ ({ 'auto-digital': 'auto', 'hogar-facil-plus': 'hogar' });

/** En qué abre, según la página. */
function dondeAbre() {
  const { pagina = '', id = '' } = document.body.dataset;
  if (pagina === 'servicios' || (pagina === 'integracion' && SERVICIOS.includes(id))) return { modo: 'ayuda', tema: 'servicio', bandera: '¿Dudas con tu seguro?' };
  if ((pagina === 'integracion' || pagina === 'producto') && RAMO[id]) {
    return { modo: 'contratar', tema: RAMO[id], bandera: pagina === 'integracion' ? 'Te explico este plan' : 'Te ayudo a cotizar' };
  }
  return { modo: 'contratar', tema: 'inicio', bandera: 'Contrata conmigo' };
}

/** @param {{ perfil: string }} _sesion */
export function montar(_sesion) {
  const { pagina = '' } = document.body.dataset;
  if (pagina === 'login' || pagina === 'configuracion' || !esVisible(MATIAS.id) || document.getElementById('matias-lanzador')) return;
  const donde = dondeAbre();

  const caja = document.createElement('div');
  caja.className = 'matias-lanzador';
  caja.id = 'matias-lanzador';
  if (document.querySelector('.barra-accion')) caja.dataset.sobreBarra = 'si';
  caja.innerHTML = `<span class="matias-lanzador__bandera" aria-hidden="true">${esc(donde.bandera)}</span>
    <button type="button" class="matias-lanzador__boton" aria-label="${esc(donde.bandera)}. Abrir a MatIAs, tu IA de seguros">
      <img src="/assets/img/matias.svg" alt="" width="40" height="40">
      <span class="matias-lanzador__rotulo"><strong>MatIAs</strong><span>tu IA de seguros</span></span>
    </button>`;
  document.body.appendChild(caja);
  const boton = /** @type {HTMLButtonElement} */ (caja.querySelector('button'));

  /** @param {{ modo: string, tema: string }} op */
  const abrir = (op) => import('./panel.js').then((m) => m.abrir({ ...op, origen: boton }));
  boton.addEventListener('click', () => { abrir(donde); });

  /* La conversación sigue después del salto a los precios. */
  let seguir = '';
  try {
    seguir = JSON.parse(sessionStorage.getItem('zb:matias') || '{}').seguir || '';
    sessionStorage.removeItem('zb:matias');
  } catch { seguir = ''; }
  if (!seguir || donde.tema !== seguir) return;
  const bandera = /** @type {HTMLElement} */ (caja.querySelector('.matias-lanzador__bandera'));
  bandera.textContent = 'Sigo aquí si tienes dudas';
  if (!matchMedia('(min-width: 900px)').matches) return;
  const producto = seguir === 'hogar' ? 'hogar-facil-plus' : 'auto-digital';
  /* Se abre cuando el marco cuenta el plan que se mira: en Auto, al llegar;
     en Hogar, cuando la persona completa su vivienda y ve los planes. */
  if (contexto(producto)) { abrir(donde); return; }
  const quitar = alCambiar((p) => { if (p === producto) { quitar(); abrir(donde); } });
}
