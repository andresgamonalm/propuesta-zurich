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
    await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
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
  await p.goto(`${BASE}/personas/auto/cotizador/auto-digital/datos/`); await listo(p);
  await p.click('[data-probar]'); await p.click('[data-probar]'); await p.waitForTimeout(150);
  ok(await p.getAttribute('.pasos-flujo li[aria-current="step"]', 'data-paso') === 'planes', 'la medición por paso no avanza');
  await p.goto(`${BASE}/configuracion/#medicion`); await listo(p);
  ok(await p.locator('td code:text("auto_digital_rec_avance_paso")').count() >= 2, 'los avances de paso no quedan registrados');
  const [d] = await Promise.all([p.waitForEvent('download'), p.click('[data-accion="csv-medicion"]')]);
  ok(d.suggestedFilename() === 'registro_medicion.csv', 'no se descarga el CSV');
  await p.evaluate(() => localStorage.removeItem('zb:sesion'));
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
  ok(await p.locator('.marco iframe').count() === 0, 'sin dirección de formulario se carga la página completa del producto');
  ok(await p.isVisible('.lateral .promo-lateral'), 'la vista referencial no muestra la promoción al lado');
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
  await p.fill('#correo', ADMIN); await p.click('button[type=submit]'); await p.waitForURL('**/home/');
  for (const ruta of [...RUTAS, '/configuracion/#solicitudes', '/configuracion/#medicion', '/configuracion/#pendientes']) {
    await p.goto(BASE + ruta); await listo(p);
    await p.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    const r = await auditar();
    ok(r.url === ruta.split('#')[0], `contraste: pedí ${ruta} y medí ${r.url}`);
    ok(r.malos.length === 0, `contraste en ${ruta}: ${r.malos.join(' | ')}`);
    medidos += r.n;
  }
  console.log(`  ${medidos} textos medidos`);
  await ctx.close();
}

await navegador.close();
servidor.close();
console.log(`\n${correctas} comprobaciones correctas · ${fallas.length} fallas`);
fallas.forEach((f) => console.log('  ✗', f));
process.exit(fallas.length ? 1 : 0);
