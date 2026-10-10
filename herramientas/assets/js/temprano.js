/* =====================================================================
   Antes de pintar · cotizadores de demostración
   ---------------------------------------------------------------------
   Script clásico, sin `type="module"`, cargado en el <head>: corre antes
   del primer pintado. Si esperara a los módulos, la cabecera propia del
   cotizador alcanzaría a verse un instante dentro del marco del sitio.

   · `js`        el CSS sabe que hay JavaScript.
   · `en-marco`  el cotizador está dentro del marco del mini sitio: sin
                 cabecera, pasos ni pie propios, porque esos los pone el
                 sitio, y con el alto que pida su contenido.
   · `cargando`  sin transiciones mientras la pantalla se arma. Al volver
                 a un paso, los módulos marcan lo que ya estaba elegido
                 (un botón «Sí, ahora», un plan) y, con la transición
                 encendida, se vería un fundido desde el valor de partida.
                 Se quita dos cuadros después de `load`, que llega cuando
                 los módulos ya corrieron.
   ===================================================================== */
(function () {
  var raiz = document.documentElement;
  raiz.classList.add('js', 'cargando');
  window.addEventListener('load', function () {
    requestAnimationFrame(function () { requestAnimationFrame(function () { raiz.classList.remove('cargando'); }); });
  });
  var enMarco = true;
  try { enMarco = window.self !== window.top; } catch (e) { enMarco = true; }
  if (enMarco) raiz.classList.add('en-marco');
})();
