// Verificación integral del mini sitio · un solo comando.
//
//   node _herramientas/verificar.mjs
//
// Requiere Playwright con Chromium. Si no está instalado como paquete del
// proyecto, se indica su ubicación: PLAYWRIGHT_MODULE=/ruta/a/playwright/index.mjs
//
// Qué hace, en orden:
//   1. Levanta su propio servidor estático (no depende de Python), con las
//      mismas cabeceras de seguridad que publica Cloudflare (`_headers`): si
//      algo choca con la política de seguridad, falla aquí y no en producción.
//      Las herramientas de Zurich se reemplazan por una página simulada: la
//      verificación no depende de la red ni de que zurich.cl responda.
//   2. Recorre TODAS las rutas (búsqueda recursiva de index.html, nunca una
//      lista escrita a mano ni un patrón de profundidad fija) en tres anchos:
//      escritorio 1440, tablet 820 y celular 390. Revisa errores de consola,
//      recursos rotos, desborde horizontal, cabecera que no cabe y un solo h1.
//   3. Comprueba que cada enlace interno lleve a una página que existe.
//   4. Prueba los flujos: acceso, perfiles, asesoría, configuración, medición
//      por paso, sesión vencida, menús, cajón móvil, promoción vencida y los
//      marcos de integración (solo el formulario, al lado de la promoción).
//      Hace las tres compras completas DENTRO del sitio, en los cotizadores
//      de demostración (Auto, Hogar y Protección Urgencias), y comprueba que
//      los pasos de arriba avancen, que el marco tome el alto y que quede
//      medida la compra.
//
// Las pantallas de /herramientas/ se recorren con ?demo=1: así cada una abre
// con el estado completo y no rebota al primer paso.
//   5. Audita el contraste de lo que se pinta (no de lo declarado) en todas las
//      páginas, y comprueba que midió la página que creía medir.
//
// Sale con código 1 si algo falla.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUERTO = 5199;
const BASE = `http://127.0.0.1:${PUERTO}`;
const ADMIN = 'hola@andresgamonal.com';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

/* ---- Servidor estático mínimo ------------------------------------------- */
/* Cabeceras del bloque /* de _headers, tal como las aplica Cloudflare Pages. */
const CABECERAS = (() => {
  const salida = {}; let dentro = false;
  for (const linea of fs.readFileSync(path.join(RAIZ, '_headers'), 'utf8').split(/\r?\n/)) {
    if (!linea.trim() || linea.startsWith('#')) continue;
    if (!/^\s/.test(linea)) { dentro = linea.trim() === '/*'; continue; }
    if (dentro) { const i = linea.indexOf(':'); salida[linea.slice(0, i).trim()] = linea.slice(i + 1).trim(); }
  }
  return salida;
})();
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };
const servidor = http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, BASE).pathname);
  let archivo = path.join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(archivo) && fs.statSync(archivo).isDirectory()) archivo = path.join(archivo, 'index.html');
  if (!fs.existsSync(archivo)) { res.writeHead(404, { ...CABECERAS, 'content-type': 'text/html' }); fs.createReadStream(path.join(RAIZ, '404.html')).pipe(res); return; }
  res.writeHead(200, { ...CABECERAS, 'content-type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(archivo).pipe(res);
});
await new Promise((r) => servidor.listen(PUERTO, '127.0.0.1', r));

/* ---- Rutas: recorrido recursivo ----------------------------------------- */
function rutas(dir = RAIZ, base = '/') {
  const salida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('.') || e.name.startsWith('_') || e.name === 'assets') continue;
    const sub = path.join(dir, e.name);
    if (fs.existsSync(path.join(sub, 'index.html'))) salida.push(`${base}${e.name}/`);
    salida.push(...rutas(sub, `${base}${e.name}/`));
  }
  return salida.sort();
}
const RUTAS = rutas().filter((r) => r !== '/login/');
/* Las pantallas de los cotizadores necesitan estado: ?demo=1 lo siembra. */
const conEstado = (r) => (r.startsWith('/herramientas/') ? `${r}?demo=1` : r);

let correctas = 0; const fallas = [];
const ok = (cond, texto) => { if (cond) correctas++; else fallas.push(texto); };
const navegador = await chromium.launch();
const listo = (p) => p.waitForFunction(() => !document.getElementById('contenido')?.hasAttribute('aria-busy'), null, { timeout: 10000 });
const SIMULADA = '<!doctype html><meta charset="utf-8"><title>Herramienta simulada</title><p>Formulario oficial de Zurich (simulado en la verificación)</p>';
async function contexto(viewport) {
  const ctx = await navegador.newContext({ viewport, locale: 'es-CL', acceptDownloads: true });
  await ctx.route((u) => u.origin !== BASE, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: SIMULADA }));
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  p.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('.html') && !r.url().includes('favicon')) errores.push(`HTTP ${r.status()} ${r.url()}`); });
  return { ctx, p, errores };
}
async function entrar(p, correo) {
  await p.goto(`${BASE}/login/`); await p.fill('#correo', correo); await p.click('button[type=submit]');
  await p.waitForURL('**/home/'); await listo(p);
}

/* ---- 2 y 3 · Recorrido en tres anchos ----------------------------------- */
console.log(`Recorrido: ${RUTAS.length + 1} páginas × 3 anchos`);
const enlaces = new Set();
for (const ancho of [1440, 820, 390]) {
  const { ctx, p, errores } = await contexto({ width: ancho, height: 900 });
  await entrar(p, ADMIN);
  for (const ruta of RUTAS) {
    errores.length = 0;
    await p.goto(BASE + conEstado(ruta), { waitUntil: 'networkidle' });
    await listo(p).catch(() => errores.push('no terminó de cargar'));
    const d = await p.evaluate(() => ({
      url: location.pathname,
      desborde: document.documentElement.scrollWidth - innerWidth,
      cabecera: (() => { const f = document.querySelector('.cabecera__fila'); return f ? f.scrollWidth - f.clientWidth : 0; })(),
      h1: document.querySelectorAll('h1').length,
      enlaces: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href').split(/[?#]/)[0]),
    }));
    d.enlaces.forEach((e) => enlaces.add(e));
    ok(d.url === ruta, `[${ancho}] ${ruta}: terminó en ${d.url}`);
    ok(errores.length === 0, `[${ancho}] ${ruta}: ${errores.join(' | ')}`);
    ok(d.desborde <= 1, `[${ancho}] ${ruta}: desborde horizontal de ${d.desborde}px`);
    ok(d.cabecera <= 1, `[${ancho}] ${ruta}: la cabecera no cabe (${d.cabecera}px)`);
    ok(d.h1 === 1, `[${ancho}] ${ruta}: ${d.h1} títulos h1`);
  }
  await ctx.close();
}
for (const e of enlaces) {
  const r = await fetch(BASE + e);
  ok(r.status < 400, `enlace interno roto: ${e} (${r.status})`);
}
console.log(`  ${enlaces.size} destinos internos comprobados`);

/* ---- 4 · Flujos --------------------------------------------------------- */
console.log('Flujos');
{
  const { ctx, p, errores } = await contexto({ width: 1440, height: 900 });
  await p.goto(`${BASE}/personas/auto/soap/`); await p.waitForURL('**/login/**');
  ok(p.url().includes('vuelta=%2Fpersonas%2Fauto%2Fsoap%2F'), 'sin sesión no lleva a /login con vuelta');
  await p.click('button[type=submit]');
  ok(await p.isVisible('text=Escribe tu correo'), 'correo vacío no muestra error');
  await p.fill('#correo', 'nombre.correo'); await p.click('button[type=submit]');
  ok(await p.isVisible('text=falta la @'), 'correo mal escrito no explica la causa');
  await p.fill('#correo', 'cliente@correo.cl'); await p.click('button[type=submit]');
  await p.waitForURL('**/personas/auto/soap/'); await listo(p);
  await p.goto(`${BASE}/configuracion/`); await listo(p);
  ok(await p.isVisible('h1:text("Acceso restringido")'), 'un usuario entra a /configuracion');
  await p.evaluate(() => { const k = 'zb:sesion'; const x = JSON.parse(localStorage.getItem(k)); x.v.ultimo = Date.now() - 3 * 3600e3; localStorage.setItem(k, JSON.stringify(x)); });
  await p.goto(`${BASE}/home/`); await p.waitForURL('**/login/**'); await listo(p);
  ok(await p.isVisible('text=Tu sesión venció'), 'sesión vencida sin aviso');
  ok(errores.length === 0, `errores en acceso: ${errores.join(' | ')}`);
  await ctx.close();
}
{
  const { ctx, p, errores } = await contexto({ width: 390, height: 800 });
  await entrar(p, 'cliente@correo.cl');
  await p.goto(`${BASE}/personas/vida-y-salud/asesoria/temporal-plus/`); await listo(p);
  ok(await p.inputValue('#correo') === 'cliente@correo.cl', 'el correo no llega precargado');
  await p.click('button[type=submit]');
  ok(await p.locator('[data-estado="error"]').count() === 3, 'el formulario vacío no marca los tres campos');
  await p.fill('#nombre', 'Camila Rojas'); await p.fill('#celular', '9 8765 4321'); await p.check('input[value="tarde"]', { force: true });
  await p.click('button[type=submit]'); await p.waitForURL('**/enviada/**'); await listo(p);
  ok(await p.isVisible('text=Recibimos tu solicitud'), 'la solicitud no llega a la confirmación');
  ok(!/Camila|8765/.test(p.url()), 'la URL lleva datos personales');
  await p.goto(`${BASE}/home/`); await listo(p);
  await p.click('[data-paso="1"]');
  ok(await p.getAttribute('[data-ir="1"]', 'aria-current') === 'true', 'el carrusel no avanza');
  await p.click('.boton-menu'); ok(await p.isVisible('#cajon'), 'el cajón móvil no abre');
  await p.keyboard.press('Escape'); ok(await p.isHidden('#cajon'), 'Escape no cierra el cajón');
  ok(errores.length === 0, `errores en asesoría: ${errores.join(' | ')}`);
  await ctx.close();
}
{
  const { ctx, p, errores } = await contexto({ width: 1440, height: 900 });
  await entrar(p, ADMIN);
  await p.click('.nav__enlace[aria-controls="menu-seguros"]'); ok(await p.isVisible('#menu-seguros'), 'el menú Seguros no abre');
  await p.keyboard.press('Escape'); ok(await p.isHidden('#menu-seguros'), 'Escape no cierra el menú');
  await p.goto(`${BASE}/configuracion/`); await listo(p);
  await p.locator('input[data-id="pago"][data-campo="visible"]').uncheck(); await p.waitForSelector('.aviso-flotante');
  await p.fill('#d-pago', 'https://ejemplo.com/pago'); await p.locator('#d-pago').dispatchEvent('change');
  ok(await p.isVisible('text=no está entre los orígenes permitidos'), 'se acepta un dominio no permitido');
  /* La simulación del contrato, en un marco que no envía pasos propios (SOAP). */
  await p.goto(`${BASE}/personas/auto/cotizador/soap/patente/`); await listo(p);
  await p.click('[data-probar]'); await p.click('[data-probar]'); await p.waitForTimeout(150);
  ok(await p.getAttribute('.pasos-flujo li[aria-current="step"]', 'data-paso') === 'pago', 'la medición por paso no avanza');
  await p.goto(`${BASE}/configuracion/#medicion`); await listo(p);
  ok(await p.locator('td code:text("soap_rec_avance_paso")').count() >= 2, 'los avances de paso no quedan registrados');
  const [d] = await Promise.all([p.waitForEvent('download'), p.click('[data-accion="csv-medicion"]')]);
  ok(d.suggestedFilename() === 'registro_medicion.csv', 'no se descarga el CSV');
  /* Apagar «Cargar dentro del sitio» vuelve a la vista referencial. */
  await p.goto(`${BASE}/configuracion/`); await listo(p);
  await p.locator('input[data-id="hogar-facil-plus"][data-campo="embebido"]').uncheck(); await p.waitForSelector('.aviso-flotante');
  await p.goto(`${BASE}/personas/hogar/cotizador/hogar-facil-plus/datos/`); await listo(p);
  ok(await p.locator('.marco iframe').count() === 0 && await p.isVisible('.marco__referencial'), 'apagar la carga no vuelve a la vista referencial');
  ok(await p.isVisible('.lateral .promo-lateral'), 'la vista referencial no muestra la promoción al lado');
  /* Apagar a MatIAs lo saca de todas las páginas. */
  await p.goto(`${BASE}/configuracion/`); await listo(p);
  await p.locator('input[data-id="matias"][data-campo="visible"]').uncheck(); await p.waitForSelector('.aviso-flotante');
  await p.goto(`${BASE}/home/`); await listo(p); await p.waitForTimeout(300);
  ok(await p.locator('#matias-lanzador').count() === 0, 'MatIAs sigue visible después de apagarlo en Configuración');
  /* Apagar los datos para probar los saca del sitio, de los cotizadores y del acceso. */
  await p.goto(`${BASE}/configuracion/`); await listo(p);
  await p.locator('input[data-id="datos-prueba"][data-campo="visible"]').uncheck(); await p.waitForSelector('.aviso-flotante');
  await p.goto(`${BASE}/personas/auto/cotizador/auto-digital/datos/`); await listo(p); await p.waitForTimeout(300);
  ok(await p.locator('#prueba-lanzador, .caja-prueba').count() === 0, 'los datos para probar siguen a la vista después de apagarlos');
  await p.evaluate(() => localStorage.removeItem('zb:sesion'));
  await p.goto(`${BASE}/login/`); await listo(p); await p.waitForTimeout(300);
  ok(await p.locator('.acceso-prueba, #prueba-lanzador').count() === 0, 'el acceso sigue ofreciendo los datos para probar apagados');
  await entrar(p, 'cliente@correo.cl');
  ok(!(await p.locator('.rapida[href="/servicios/pago/"]').count()), 'el trámite oculto sigue visible');
  await p.goto(`${BASE}/servicios/pago/`); await listo(p);
  ok(await p.isVisible('text=Este contenido no está disponible'), 'un contenido oculto no muestra su estado');
  ok(errores.length === 0, `errores en configuración: ${errores.join(' | ')}`);
  await ctx.close();
}
{
  /* Marcos de integración: solo el formulario de Zurich, y al lado la
     promoción (cotizadores) o el aviso (trámites). */
  const { ctx, p, errores } = await contexto({ width: 1440, height: 900 });
  await entrar(p, 'cliente@correo.cl');
  const CELULAR = 'https://celularprotegido.zurich.cl/cl/';
  await p.goto(`${BASE}/personas/bienes-y-viaje/cotizador/celular-protegido/equipo/`); await listo(p);
  ok(await p.getAttribute('.marco iframe', 'src') === CELULAR, 'Celular Protegido no carga su formulario');
  await p.waitForSelector('.marco__lienzo[data-estado="listo"]', { timeout: 10000 }).catch(() => {});
  ok(await p.getAttribute('.marco__lienzo', 'data-estado') === 'listo', 'el aviso de carga no se retira cuando el formulario carga');
  ok(await p.isVisible('.lateral .promo-lateral'), 'el cotizador no muestra la promoción al lado');
  ok(await p.getAttribute('.marco__pie [data-medir="abrir_pestana"]', 'href') === CELULAR, 'falta la salida a una pestaña nueva');
  const [m, l] = [await p.locator('.marco').boundingBox(), await p.locator('.lateral').boundingBox()];
  ok(l.x >= m.x + m.width, 'en escritorio la promoción no queda al lado del flujo');
  await p.goto(`${BASE}/personas/auto/cotizador/auto-digital/datos/`); await listo(p);
  ok(await p.getAttribute('.marco iframe', 'src') === '/herramientas/auto-digital/datos/', 'Auto Digital no carga su cotizador de demostración');
  ok((await p.textContent('.marco__barra')).includes('Demostración'), 'el cotizador de demostración no se rotula como tal');
  ok(await p.getAttribute('.marco iframe', 'sandbox') === null, 'el cotizador del mismo sitio va aislado sin necesidad');
  await p.goto(`${BASE}/servicios/pago/`); await listo(p);
  ok((await p.getAttribute('.marco iframe', 'src')).startsWith('https://www9.chilena.cl/'), 'el pago no carga su formulario');
  await p.waitForSelector('.marco__lienzo[data-estado="listo"]', { timeout: 10000 }).catch(() => {});
  ok(await p.getAttribute('.marco__lienzo', 'data-estado') === 'listo', 'la política de seguridad no deja cargar el formulario de pago');
  ok(await p.isVisible('.lateral .aviso--aviso'), 'el trámite no muestra su aviso al lado');
  await p.goto(`${BASE}/servicios/reembolso/`); await listo(p);
  ok(await p.getAttribute('.marco iframe', 'sandbox') === null, 'el PDF va en un marco aislado: Chrome no lo mostraría');
  ok(await p.isVisible('.marco__pie [data-medir="descargar_formulario"]'), 'falta la descarga del formulario');
  ok(errores.length === 0, `errores en integración: ${errores.join(' | ')}`);
  await ctx.close();
}
{
  /* Si la herramienta no responde, el aviso deja de tapar y ofrece la salida. */
  const { ctx, p } = await contexto({ width: 390, height: 800 });
  await entrar(p, 'cliente@correo.cl');
  await ctx.route('https://celularprotegido.zurich.cl/**', () => { /* nunca responde */ });
  await p.clock.install();
  await p.goto(`${BASE}/personas/bienes-y-viaje/cotizador/celular-protegido/equipo/`, { waitUntil: 'domcontentloaded' }); await listo(p);
  await p.clock.runFor(16000);
  ok(await p.getAttribute('.marco__lienzo', 'data-estado') === 'lento', 'una herramienta que no responde no ofrece la pestaña nueva');
  ok(await p.isVisible('text=Está tardando más de lo normal'), 'el aviso de demora no se ve');
  await ctx.close();
}
/* ---- Datos para probar: a la vista, se copian y completan el paso ------ */
{
  const { ctx, p, errores } = await contexto({ width: 1440, height: 900 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await p.goto(`${BASE}/login/`); await listo(p);
  ok(await p.locator('.acceso-prueba [data-correo]').count() === 2, 'el acceso no ofrece los correos de prueba');
  await p.click(`.acceso-prueba [data-correo="${ADMIN}"]`);
  ok(await p.inputValue('#correo') === ADMIN, 'el correo de prueba no se escribe con un clic');
  ok(await p.waitForSelector('#prueba-lanzador', { timeout: 5000 }).then(() => true).catch(() => false), 'el acceso no tiene el botón de datos para probar');
  await p.click('#prueba-lanzador');
  ok(await p.isVisible('#prueba-panel') && await p.locator('#prueba-panel .prueba-cliente').count() === 2, 'el panel no abre o no muestra los dos clientes ficticios');
  await p.click('#prueba-panel [data-copiar="10111222-5"]');
  ok(await p.evaluate(() => navigator.clipboard.readText()) === '10111222-5', 'copiar no deja el dato en el portapapeles');
  ok((await p.textContent('#prueba-panel [data-copiar="10111222-5"]')).includes('Copiado'), 'copiar no avisa que copió');
  await p.keyboard.press('Escape');
  ok(await p.isHidden('#prueba-panel'), 'Escape no cierra los datos para probar');
  await p.fill('#correo', 'cliente@correo.cl'); await p.click('button[type=submit]'); await p.waitForURL('**/home/'); await listo(p);
  ok(await p.waitForSelector('#prueba-lanzador', { timeout: 5000 }).then(() => true).catch(() => false), 'las páginas no tienen el botón de datos para probar');
  /* En el marco, sobre el formulario: el paso en que va y «Completar este
     paso». El costado queda para la promoción. */
  await p.goto(`${BASE}/personas/auto/cotizador/auto-digital/datos/`); await listo(p);
  await p.waitForSelector('.marco__lienzo[data-alto="auto"]', { timeout: 10000 });
  const [cp, lz] = [await p.locator('.marco .caja-prueba').boundingBox(), await p.locator('.marco__lienzo').boundingBox()];
  ok(cp && lz && cp.y + cp.height <= lz.y + 1, 'los datos para probar no van en el marco, sobre el cotizador');
  ok(await p.locator('.lateral .caja-prueba').count() === 0 && await p.locator('.lateral > :first-child').evaluate((e) => e.classList.contains('promo-lateral')), 'los datos para probar le quitan el primer lugar del costado a la promoción');
  await p.click('.caja-prueba [data-copiar="10111222-5"]');
  ok(await p.evaluate(() => navigator.clipboard.readText()) === '10111222-5', 'las fichas del cotizador no copian el dato');
  const f = p.frameLocator('.marco iframe');
  const completar = async () => {
    await p.click('.caja-prueba [data-rellenar]');
    return p.waitForFunction(() => document.querySelector('.caja-prueba [data-prueba-estado]').textContent.includes('completamos'), null, { timeout: 5000 }).then(() => true).catch(() => false);
  };
  ok(await completar(), '«Completar este paso» no avisa lo que completó');
  ok(await f.locator('#rut').inputValue() === '10111222-5' && await f.locator('#nombres').inputValue() === 'Daniela', '«Completar este paso» no escribe los datos en el cotizador');
  await f.locator('#continuar-p1').click();
  ok(await p.waitForFunction(() => !document.querySelector('.caja-prueba [data-prueba-paso="vehiculo"]').hidden, null, { timeout: 8000 }).then(() => true).catch(() => false), 'los datos para probar no siguen al paso nuevo');
  ok((await p.textContent('.caja-prueba [data-prueba-rotulo]')).startsWith('Paso 2 de 6'), 'los datos para probar no dicen en qué paso va');
  await completar();
  ok(await f.locator('#c-patente[data-estado="ok"]').waitFor({ timeout: 5000 }).then(() => true).catch(() => false), 'la patente de prueba no se encuentra al completar el paso');
  ok(errores.length === 0, `[datos para probar] errores: ${errores.join(' | ')}`);
  await ctx.close();
}
{
  /* En el celular, también en el marco; y el botón fijo no choca con MatIAs. */
  const { ctx, p, errores } = await contexto({ width: 390, height: 844 });
  await entrar(p, 'cliente@correo.cl');
  await p.waitForSelector('#prueba-lanzador'); await p.waitForSelector('#matias-lanzador');
  const [a, m] = [await p.locator('.prueba__boton').boundingBox(), await p.locator('.matias-lanzador__boton').boundingBox()];
  ok(a.x + a.width <= m.x, 'en el celular el botón de datos para probar choca con MatIAs');
  await p.goto(`${BASE}/personas/hogar/cotizador/hogar-facil-plus/datos/`); await listo(p);
  await p.waitForSelector('.marco__lienzo[data-alto="auto"]', { timeout: 10000 });
  const [c, lc] = [await p.locator('.marco .caja-prueba').boundingBox(), await p.locator('.marco__lienzo').boundingBox()];
  ok(c && lc && c.y + c.height <= lc.y + 1, 'en el celular los datos para probar no van sobre el cotizador');
  await p.click('.caja-prueba [data-rellenar]');
  await p.waitForFunction(() => document.querySelector('.caja-prueba [data-prueba-estado]').textContent.includes('completamos'), null, { timeout: 5000 }).catch(() => {});
  ok(await p.frameLocator('.marco iframe').locator('#rut').inputValue().then((v) => v === '20111222-2'), 'en el celular «Completar este paso» no escribe en el cotizador');
  ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, '[datos para probar celular] desborde horizontal');
  ok(errores.length === 0, `[datos para probar celular] errores: ${errores.join(' | ')}`);
  await ctx.close();
}
console.log('  Datos para probar: acceso, panel, copiar y completar el paso');

/* ---- Las tres compras completas, dentro del sitio ---------------------- */
const enPaso = (p, paso) => p.waitForSelector(`.pasos-flujo li[aria-current="step"][data-paso="${paso}"]`, { timeout: 10000 }).then(() => true).catch(() => false);
async function comprar(nombre, ancho, ruta, amb, pasos, recorrer) {
  const { ctx, p, errores } = await contexto({ width: ancho, height: 900 });
  await entrar(p, 'cliente@correo.cl');
  await p.goto(BASE + ruta); await listo(p);
  const f = p.frameLocator('.marco iframe');
  /* El alto llega cuando el cotizador ya corrió: recién ahí se mira. */
  ok(await p.waitForSelector('.marco__lienzo[data-alto="auto"]', { timeout: 10000 }).then(() => true).catch(() => false), `[${nombre}] el marco no recibe el alto del cotizador`);
  ok(await enPaso(p, pasos[0]), `[${nombre}] el marco no avisa el primer paso`);
  ok(await f.locator('#correo').inputValue() === 'cliente@correo.cl', `[${nombre}] el correo del sitio no llega precargado`);
  ok(await f.locator('#rut-ejemplos').textContent().then((t) => t.includes('patente')) === (nombre === 'auto'), `[${nombre}] los datos de prueba ofrecen patentes donde no corresponde`);
  try {
    await recorrer(f, async (paso) => ok(await enPaso(p, paso), `[${nombre}] la barra de pasos no llega a «${paso}»`));
  } catch (e) { ok(false, `[${nombre}] la compra se cortó: ${e.message.split('\n')[0]}`); }
  ok(await enPaso(p, pasos[pasos.length - 1]), `[${nombre}] no llega a la póliza emitida`);
  ok(await p.locator('.pasos-flujo li.hecho').count() === pasos.length, `[${nombre}] los pasos no quedan todos hechos`);
  ok(await p.getAttribute('.marco__lienzo', 'data-alto') === 'auto', `[${nombre}] el marco no toma el alto del contenido`);
  const eventos = await p.evaluate(() => (window.dataLayer || []).map((x) => x.event));
  ok(eventos.includes(`${amb}_rec_fin_flujo`), `[${nombre}] la compra no queda medida`);
  ok(eventos.filter((x) => x === `${amb}_rec_avance_paso`).length >= pasos.length - 1, `[${nombre}] faltan avances de paso medidos`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, `[${nombre}] desborde horizontal`);
  ok(errores.length === 0, `[${nombre}] errores: ${errores.join(' | ')}`);
  await ctx.close();
}
const firmarYPagar = async (f, docs) => {
  await f.locator('#dia').selectOption('5');
  for (const id of docs) { await f.locator(`#ver-documento-${id}`).click(); await f.locator('#modal-documento [data-cerrar-modal] >> nth=0').click(); }
  await f.locator('#cedula').fill('123456789'); await f.locator('#validar').click();
  await f.locator('#firma-ok').waitFor();
  await f.locator('#btn-pagar').click();
};
await comprar('auto', 1440, '/personas/auto/cotizador/auto-digital/datos/', 'auto_digital',
  ['datos', 'vehiculo', 'planes', 'confirmacion', 'pago', 'listo'], async (f, paso) => {
    await f.locator('#rut').fill('10111222-5'); await f.locator('#nombres').fill('Daniela'); await f.locator('#apellidos').fill('Fuentes');
    await f.locator('#celular').fill('912345678'); await f.locator('#continuar-p1').click(); await paso('vehiculo');
    await f.locator('#patente').fill('AAAA11'); await f.locator('#c-patente[data-estado="ok"]').waitFor();
    await f.locator('#color').selectOption('Blanco'); await f.locator('#continuar-p2').click(); await paso('planes');
    await f.locator('#meses-24').click(); await f.locator('#continuar').click(); await paso('confirmacion');
    await f.locator('#motor').fill('MOTOR12345'); await f.locator('#chasis').fill('CHASIS12345');
    await f.locator('#direccion').fill('Avenida Providencia'); await f.locator('#numero').fill('1234'); await f.locator('#comuna-dom').fill('Providencia');
    await f.locator('#form-confirmar [type=submit]').click(); await paso('pago');
    await firmarYPagar(f, ['propuesta', 'condicionado', 'privacidad']);
  });
await comprar('hogar', 820, '/personas/hogar/cotizador/hogar-facil-plus/datos/', 'hogar_facil_plus',
  ['datos', 'vivienda', 'planes', 'confirmacion', 'pago', 'listo'], async (f, paso) => {
    await f.locator('#rut').fill('20111222-2'); await f.locator('#nombres').fill('Ignacio'); await f.locator('#apellidos').fill('Muñoz');
    await f.locator('#celular').fill('987654321'); await f.locator('#continuar-p1').click(); await paso('vivienda');
    await f.locator('#direccion').fill('Calle del Ensayo'); await f.locator('#numero').fill('200'); await f.locator('#comuna').fill('Las Condes');
    await f.locator('#m2').fill('90'); await f.locator('#anio').selectOption({ index: 5 });
    await f.locator('#continuar-p2').click(); await paso('planes');
    await f.locator('#continuar-p3').click(); await paso('confirmacion');
    /* Se toca el texto de la casilla, como una persona: la casilla real es
       invisible, y un clic forzado en su punto puede caer en la cabecera
       fija del sitio, que queda encima al desplazar. */
    await f.locator('#nacimiento').fill('1985-05-20'); await f.locator('label:has(#declaro)').click();
    ok(await f.locator('#declaro').isChecked(), '[hogar] la declaración no queda marcada');
    await f.locator('#continuar-p4').click(); await paso('pago');
    const docs = await f.locator('[data-doc]').evaluateAll((bs) => bs.map((x) => x.dataset.doc));
    await firmarYPagar(f, docs);
  });
await comprar('urgencias', 390, '/personas/vida-y-salud/cotizador/proteccion-urgencias/datos/', 'proteccion_urgencias',
  ['datos', 'planes', 'beneficiarios', 'pago', 'listo'], async (f, paso) => {
    await f.locator('#rut').fill('10111222-5'); await f.locator('#nacimiento').fill('1985-05-20');
    await f.locator('#nombres').fill('Daniela'); await f.locator('#apellidos').fill('Fuentes'); await f.locator('#celular').fill('912345678');
    await f.locator('#continuar').click(); await paso('planes');
    await f.locator('#elegir-premium').click(); await f.locator('#continuar').click(); await paso('beneficiarios');
    await f.locator('#designar-si').click();
    await f.locator('#b-nombre-0').fill('Tomás Fuentes'); await f.locator('#b-rut-0').fill('20111222-2');
    await f.locator('#b-parentesco-0').selectOption('Hijo o hija'); await f.locator('#b-porcentaje-0').fill('60');
    await f.locator('#continuar').click();
    ok((await f.locator('#error-beneficiarios').textContent()).includes('100%'), '[urgencias] acepta porcentajes que no suman 100');
    await f.locator('#b-porcentaje-0').fill('100'); await f.locator('#continuar').click(); await paso('pago');
    await firmarYPagar(f, ['propuesta', 'condiciones', 'privacidad']);
  });
console.log('  3 compras completas dentro del sitio');

/* ---- MatIAs: vende, lleva a los precios, conversa del plan y ayuda ---- */
const respuestas = (p) => p.locator('.matias .burbuja--bot').count();
const ultimaRespuesta = (p) => p.locator('.matias__hilo:not([hidden]) .burbuja--bot').last();
async function esperarRespuesta(p, antes) {
  await p.waitForFunction((n) => document.querySelectorAll('.matias .burbuja--bot').length > n, antes, { timeout: 6000 });
}
async function conversar(p, texto) {
  const antes = await respuestas(p);
  await p.fill('#matias-entrada', texto); await p.press('#matias-entrada', 'Enter');
  await esperarRespuesta(p, antes);
  return (await ultimaRespuesta(p).textContent()) || '';
}
async function tocar(p, selector) {
  const antes = await respuestas(p);
  await p.click(selector);
  await esperarRespuesta(p, antes);
}
{
  const { ctx, p, errores } = await contexto({ width: 1440, height: 900 });
  await entrar(p, 'cliente@correo.cl');
  ok(await p.waitForSelector('#matias-lanzador', { timeout: 5000 }).then(() => true).catch(() => false), 'MatIAs no aparece en la portada');
  await p.click('#matias-lanzador button'); await p.waitForSelector('#matias:not([hidden]) .burbuja--bot');
  ok(await p.locator('#matias-oferta-auto_cotizar, #matias-oferta-hogar_cotizar, #matias-oferta-otros_seguros').count() === 3, 'MatIAs no ofrece Auto, Hogar y otros seguros al abrir');
  ok(await p.getAttribute('[data-modo="contratar"]', 'aria-pressed') === 'true', 'MatIAs no abre en «Contratar un seguro» en la portada');
  try {
    await tocar(p, '#matias-oferta-auto_cotizar');
    const hilo = '.matias__hilo:not([hidden])';
    await p.locator(`${hilo} [data-campo="rut"] input`).last().fill('10111222-5');
    await p.locator(`${hilo} [data-campo="factor"] input`).last().fill('ZZZZ99');
    await tocar(p, `${hilo} [data-accion="buscar"] >> nth=-1`);
    ok((await ultimaRespuesta(p).textContent()).includes('no coincide'), 'MatIAs reconoce a alguien con una patente que no es la suya');
    await tocar(p, '#matias-chip-reintentar');
    await p.locator(`${hilo} [data-campo="rut"] input`).last().fill('10111222-5');
    await p.locator(`${hilo} [data-campo="factor"] input`).last().fill('AAAA11');
    await tocar(p, `${hilo} [data-accion="buscar"] >> nth=-1`);
    ok((await ultimaRespuesta(p).textContent()).includes('Daniela'), 'MatIAs no reconoce al cliente de prueba');
    await tocar(p, '#matias-chip-si_soy_yo');
    ok(await p.locator(`${hilo} [data-accion="sin-autorizar"]`).count() === 1, 'la autorización de datos no es opcional');
    await tocar(p, `${hilo} [data-accion="acepto"]`);
    await p.click(`${hilo} [data-accion="ir"]`);
    await p.waitForURL('**/cotizador/auto-digital/datos/?paso=planes');
    ok(await enPaso(p, 'planes'), 'el salto de MatIAs no deja a la persona en los planes');
    ok((await p.getAttribute('.marco iframe', 'src')) === '/herramientas/auto-digital/planes/', 'el marco no abre en el paso de planes');
    await p.waitForSelector('#matias:not([hidden]) .burbuja--bot', { timeout: 8000 });
    ok((await p.textContent('#matias-contexto')).startsWith('Auto Digital ·'), 'MatIAs no sabe qué plan está en pantalla');
    ok((await ultimaRespuesta(p).textContent()).includes('Toyota RAV4'), 'MatIAs no habla del auto de la persona');
    const f = p.frameLocator('.marco iframe');
    await conversar(p, '¿y el premium?');
    await f.locator('.precio-col[data-plan="premium"][data-elegido="true"]').waitFor({ timeout: 5000 });
    ok((await ultimaRespuesta(p).textContent()).includes('Plan Premium'), 'MatIAs no responde por el plan que se pidió');
    await conversar(p, 'cuanto sale con deducible 10 uf');
    await f.locator('#deducible-10[aria-pressed="true"]').waitFor({ timeout: 5000 });
    const precioPantalla = (await f.locator('.precio-col[data-plan="premium"] .precio-col__monto').textContent()).replace(/\D/g, '');
    ok((await ultimaRespuesta(p).textContent()).replace(/\./g, '').includes(precioPantalla), 'el precio que dice MatIAs no es el de la pantalla');
    const ayuda = await conversar(p, '¿cómo pido un reembolso dental?');
    ok(await p.getAttribute('[data-modo="ayuda"]', 'aria-pressed') === 'true' && ayuda.includes('dentales'), 'una pregunta de servicio no pasa al espacio de ayuda');
    await conversar(p, 'me chocaron el auto');
    ok(await ultimaRespuesta(p).locator('a[href="/servicios/denuncia-vehiculo/"]').count() === 1, 'la respuesta de un choque no lleva a la denuncia');
    await p.click('[data-modo="contratar"]');
    ok((await conversar(p, 'lo uso para uber')).includes('situación puntual'), 'un caso particular recibe una respuesta de catálogo');
    ok((await conversar(p, 'qwerty asdfgh')).includes('no inventarte nada'), 'MatIAs inventa una respuesta a algo que no sabe');
    await p.keyboard.press('Escape');
    ok(await p.isHidden('#matias') && await p.isVisible('#matias-lanzador'), 'Escape no cierra a MatIAs');
    const eventos = await p.evaluate(() => (window.dataLayer || []));
    ok(eventos.some((x) => x.event === 'auto_digital_rec_inicio_flujo' && x.via === 'matias'), 'no queda medido que la persona llegó por MatIAs');
    ok(eventos.some((x) => x.event === 'matias_rec_pregunta' && x.resultado === 'directo') && !eventos.some((x) => x.event === 'matias_rec_pregunta' && 'texto' in x), 'la medición de MatIAs falta o lleva el texto escrito');
  } catch (e) { ok(false, `[matias] la conversación se cortó: ${e.message.split('\n')[0]}`); }
  ok(errores.length === 0, `[matias] errores: ${errores.join(' | ')}`);
  await ctx.close();
}
{
  const { ctx, p, errores } = await contexto({ width: 390, height: 844 });
  await entrar(p, 'cliente@correo.cl');
  await p.goto(`${BASE}/servicios/`); await listo(p);
  await p.click('#matias-lanzador button'); await p.waitForSelector('#matias:not([hidden]) .burbuja--bot');
  ok(await p.getAttribute('[data-modo="ayuda"]', 'aria-pressed') === 'true', 'en Servicios en línea MatIAs no abre en «Ayuda»');
  const caja = await p.locator('#matias').boundingBox();
  ok(caja && caja.width >= 389 && caja.x <= 1, 'en el celular MatIAs no ocupa la pantalla completa');
  try {
    await tocar(p, '#matias-tema-srv_siniestros');
    await tocar(p, '#matias-tema-srv_siniestro_hogar');
    ok((await ultimaRespuesta(p).textContent()).includes('Bomberos'), 'la respuesta de un daño en el hogar no es la del Centro de Ayuda');
    ok(await ultimaRespuesta(p).locator('a[href^="tel:"]').count() === 1, 'la respuesta de un siniestro sin trámite no ofrece llamar');
    /* Hogar: RUT y comuna, sin autorizar (la autorización es opcional). */
    await p.click('[data-modo="contratar"]'); await p.waitForSelector('#matias-oferta-hogar_cotizar');
    await tocar(p, '#matias-oferta-hogar_cotizar');
    /* Con los datos para probar: el cliente ficticio se escribe con un clic. */
    await p.click('.matias__hilo:not([hidden]) .matias-prueba [data-rut="20111222-2"] >> nth=-1');
    ok(await p.locator('.matias__hilo:not([hidden]) [data-campo="factor"] input').last().inputValue() === 'Las Condes', 'el cliente ficticio de MatIAs no escribe RUT y comuna');
    await tocar(p, '.matias__hilo:not([hidden]) [data-accion="buscar"] >> nth=-1');
    await tocar(p, '#matias-chip-si_soy_yo');
    await tocar(p, '.matias__hilo:not([hidden]) [data-accion="sin-autorizar"]');
    ok(await ultimaRespuesta(p).locator('[data-accion="ir"]').getAttribute('href') === '/personas/hogar/cotizador/hogar-facil-plus/datos/?paso=vivienda', 'MatIAs no lleva a la vivienda en Hogar');
    const guardado = await p.evaluate(() => JSON.parse(localStorage.getItem('zurich_demo_hogar') || '{}').datos || {});
    ok(guardado.vivienda?.direccion === 'Calle del Ensayo' && guardado.consentimiento === false, 'MatIAs no deja cargada la vivienda o marca una autorización que no se dio');
  } catch (e) { ok(false, `[matias celular] ${e.message.split('\n')[0]}`); }
  ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, '[matias celular] desborde horizontal');
  ok(errores.length === 0, `[matias celular] errores: ${errores.join(' | ')}`);
  await ctx.close();
}
console.log('  MatIAs: venta, salto a los precios, conversación del plan y ayuda');

/* ---- La promoción del cotizador respeta las fechas de sus bases -------- */
for (const [fecha, debe] of [['2026-10-05T12:00:00', true], ['2026-10-15T12:00:00', false]]) {
  const { ctx, p } = await contexto({ width: 1280, height: 900 });
  await p.clock.setFixedTime(new Date(fecha));
  await p.goto(`${BASE}/herramientas/auto-digital/planes/?demo=1&meses=24`);
  await p.waitForSelector('.precio-col');
  ok((await p.locator('.precio-col__ahorro').count() > 0) === debe, `Zurich Days ${debe ? 'no aparece en fecha' : 'sigue después de vencer'} (${fecha.slice(0, 10)})`);
  await ctx.close();
}
{
  const { ctx, p } = await contexto({ width: 1440, height: 900 });
  await p.clock.setFixedTime(new Date('2026-10-15T12:00:00'));
  await entrar(p, 'cliente@correo.cl');
  ok((await p.textContent('.lamina:first-child .lamina__titular')).includes('Seguro de Auto Digital'), 'una promoción vencida sigue en el carrusel');
  await ctx.close();
}

/* ---- 5 · Contraste ------------------------------------------------------ */
console.log('Contraste');
{
  const { ctx, p } = await contexto({ width: 1280, height: 900 });
  const auditar = () => p.evaluate(() => {
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map((x) => Number(x.trim())); return [v[0], v[1], v[2], v[3] ?? 1]; };
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const razon = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const mezcla = (f, b) => (f[3] >= 1 ? f : [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])));
    const fondo = (el) => { const capas = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { capas.push(c); if (c[3] >= 1) break; } } let b = [255, 255, 255]; for (const c of capas.reverse()) b = mezcla(c, b); return b; };
    const malos = []; let n = 0;
    for (const el of document.querySelectorAll('body *')) {
      if (![...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getBoundingClientRect().width || el.closest('[hidden],.sr,[inert]') || el.closest(':disabled,[aria-disabled="true"]')) continue;
      const f = parse(cs.color); if (!f) continue;
      const b = fondo(el); const c = razon(mezcla(f, b), b);
      const t = parseFloat(cs.fontSize); const grande = t >= 24 || (t >= 18.66 && Number(cs.fontWeight) >= 700);
      n++; if (c < (grande ? 3 : 4.5)) malos.push(`${c.toFixed(2)} «${el.textContent.trim().slice(0, 40)}»`);
    }
    return { url: location.pathname, n, malos };
  });
  await p.goto(`${BASE}/login/`);
  let medidos = (await auditar()).n;
  /* Los datos para probar, abiertos. */
  await p.waitForSelector('#prueba-lanzador'); await p.click('#prueba-lanzador');
  {
    const r = await auditar();
    ok(r.malos.length === 0, `contraste de los datos para probar: ${r.malos.join(' | ')}`); medidos += r.n;
  }
  await p.keyboard.press('Escape');
  await p.fill('#correo', ADMIN); await p.click('button[type=submit]'); await p.waitForURL('**/home/');
  const promoAuto = ['/herramientas/auto-digital/planes/?demo=1&meses=24', '/herramientas/auto-digital/confirmacion/?demo=1&meses=24', '/herramientas/auto-digital/pago/?demo=1&meses=24', '/herramientas/auto-digital/listo/?demo=1&meses=24'];
  for (const ruta of [...RUTAS.map(conEstado), ...promoAuto, '/configuracion/#solicitudes', '/configuracion/#medicion', '/configuracion/#pendientes']) {
    await p.goto(BASE + ruta); await listo(p);
    await p.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    const r = await auditar();
    ok(r.url === ruta.split(/[?#]/)[0], `contraste: pedí ${ruta} y medí ${r.url}`);
    ok(r.malos.length === 0, `contraste en ${ruta}: ${r.malos.join(' | ')}`);
    medidos += r.n;
  }
  /* MatIAs abierto, en sus dos espacios y con una tabla de planes. */
  await p.goto(`${BASE}/herramientas/auto-digital/planes/?demo=1`); await p.waitForSelector('.precio-col');
  await p.goto(`${BASE}/personas/auto/cotizador/auto-digital/datos/?paso=planes`); await listo(p);
  await p.waitForSelector('.marco__lienzo[data-alto="auto"]');
  await p.click('#matias-lanzador button'); await p.waitForSelector('#matias:not([hidden]) .burbuja--bot');
  await conversar(p, '¿en qué se diferencian los planes?');
  let r = await auditar();
  ok(r.malos.length === 0, `contraste de MatIAs (contratar): ${r.malos.join(' | ')}`); medidos += r.n;
  await p.click('[data-modo="ayuda"]'); await p.waitForSelector('#matias-hilo-ayuda .burbuja--bot');
  await tocar(p, '#matias-tema-srv_pagos'); await tocar(p, '#matias-tema-srv_pago_impaga');
  r = await auditar();
  ok(r.malos.length === 0, `contraste de MatIAs (ayuda): ${r.malos.join(' | ')}`); medidos += r.n;
  console.log(`  ${medidos} textos medidos`);
  await ctx.close();
}

await navegador.close();
servidor.close();
console.log(`\n${correctas} comprobaciones correctas · ${fallas.length} fallas`);
fallas.forEach((f) => console.log('  ✗', f));
process.exit(fallas.length ? 1 : 0);
