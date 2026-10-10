# Reglas de este proyecto

Memoria del proyecto: lo que hay que saber **antes** de tocar nada.
La historia, el estado y lo que sigue están en `TRASPASO.md`: leerlo al
retomar en un chat nuevo y agregar una línea a su registro con cada cambio.

## Con quién se trabaja

Andrés Gamonal (`hola@andresgamonal.com`), Marketing y Ecommerce en Zurich
Chile. **No es técnico.** Decide qué quiere el producto; las decisiones
técnicas se toman aquí y se le muestran resueltas. Se le habla en castellano y
sin jerga. Razonar a fondo, sin atajos. **No empezar un aplicativo nuevo sin su
OK**; para correcciones y continuaciones de lo acordado, avanzar.

## Qué es

Propuesta de mini sitio para la licitación Zurich–Banco BICE. El brief es el
documento «Propuesta de contenidos · Estructura y contenidos del mini sitio de
seguros Zurich para Banco BICE» (octubre 2026).

## Precedencia (del brief)

Obligaciones legales → skill `lineamientos-marca-zurich` → brief → recursos de
Banco BICE. Si la marca no resuelve algo, no se improvisa: queda pendiente.

## Decisiones ya tomadas con él (no reabrir)

- **Cabecera blanca con los logos a color** (versión secundaria del skill).
  Excepción por la alianza: el logo de Banco BICE solo existe azul sobre blanco.
- **Bloqueo de co-branding** arriba a la izquierda: Zurich, divisoria y BICE a
  la altura de la palabra «Zurich», no de la Z (`marco.js › bloqueo`).
- **Pie:** franja de la alianza (blanca, logo BICE, rol de cada compañía) +
  pie Zurich en azul oscuro con logo blanco.
- **Promoción Auto Digital:** se usan las bases oficiales («2 cuotas gratis +
  gift card $60.000», 1 al 10 de octubre de 2026). Él dejó la decisión a
  criterio; la página del producto dice «3 cuotas» y las bases mandan.
- **Entrega:** en el repositorio. Él conecta Cloudflare Pages. Repositorio
  público: los logos y fotos vienen de sus carpetas de Drive.
- **Contenido con lógica promocional:** en cada producto, el gancho (precio o
  promoción) va arriba junto al nombre y al botón.
- **Cotizadores y trámites dentro del sitio:** en el marco va **solo el
  formulario o el flujo** de Zurich, nunca la página completa de zurich.cl
  (su menú taparía la propuesta). Al lado: la promoción (cotizadores) o el
  aviso (trámites). Sin dirección de formulario (`formulario` en
  `catalogo.js`), el marco queda en vista referencial.
- **Cotizadores de demostración** (10-10-2026, «Sí, y suma Urgencias»): como
  es una maqueta, quiere que los cotizadores funcionen de punta a punta. Auto
  Digital y Hogar Fácil Plus usan **el flujo del piloto de ecommerce**
  (`piloto-ecommerce-zurich`), vestido de Zurich; Protección Urgencias se armó
  con las mismas piezas. Viven en `/herramientas/` y se rotulan
  «Demostración»: datos ficticios, precios simulados o referenciales, sin
  cobro. En producción se reemplazan por la herramienta oficial de Zurich. El
  repositorio del piloto **no se toca**.
- **MatIAs, tu IA de seguros** (10-10-2026, «Sí, avanza así»): solo Matías,
  del piloto. Botón abajo a la derecha en todas las páginas privadas, con dos
  espacios: **Contratar un seguro** (vende Auto y Hogar: reconoce con RUT +
  patente o RUT + comuna, autorización opcional, deja a la persona en sus
  precios y conversa del plan que está en pantalla) y **Ayuda con mi
  seguro** (reembolsos, siniestros, asistencias, pagos, póliza, con el
  Centro de Ayuda de zurich.cl y botón al trámite). **No usa un modelo
  generativo:** elige entre respuestas aprobadas y nunca redacta coberturas.
- **Diseño** (10-10-2026): gris de bandas y tarjetas **`#f5f5f5`**
  (`--superficie`), no el Blanco de Zúrich; **nada translúcido** (ni tarjetas
  sobre azul, ni rellenos, ni bordes con transparencia): colores sólidos;
  alturas y fotos contenidas; los trámites de la portada son una franja bajo
  el carrusel, con estado al pasar el mouse, y los controles del carrusel van
  dentro del panel azul.
- **Datos para probar a la vista** (10-10-2026, «que la persona los vea»):
  botón fijo abajo a la izquierda en todas las páginas (también el acceso),
  una franja **dentro del marco del cotizador, sobre el formulario**, con el
  paso en que va y «Completar este paso», y datos que se escriben con un clic
  en el acceso y en MatIAs. Todo se copia. Se apaga en Configuración. **El
  costado del cotizador es de la promoción:** los datos no van ahí («le
  estás quitando el espacio a lo que será la publicidad»). **Nunca marca por
  la persona** una autorización, una declaración ni la lectura de documentos.
- **Toques de la paleta secundaria** (10-10-2026, «que no quede tan azul y
  tan aburrido»; el brandbook permite en web aumentar los secundarios): se
  eligieron dos, **Cerceta `#19BAB6`** (servicio, beneficios y el trazo antes
  de cada antetítulo) y **Durazno `#FF7569`** (la promoción: punto de
  «Oferta del mes», círculo del regalo, borde del gancho). Las formas llevan
  dos azules y estos dos acentos. Solo toques: el Azul de Zúrich sigue
  mandando. Encima solo azul oscuro (Cerceta 4,78:1; Durazno 4,38:1, solo
  íconos), nunca texto blanco, nunca fondo completo sobre foto.

## Lo que nunca se hace

- **No redactar coberturas, beneficios, precios ni condiciones.** Todo sale de
  zurich.cl y se anota la fecha (`catalogo.js`, cabecera).
- **No inventar textos legales ni campos de consentimiento.** Se muestran como
  pendientes.
- **No reconstruir cotizadores, pagos ni denuncias:** se integran en el marco.
  Única excepción, decidida por él: los tres cotizadores de demostración de
  `/herramientas/`. Tampoco ahí se redacta contenido: coberturas, precios y
  promoción salen del catálogo.
- **No publicar datos de personas reales** (el repositorio es público): los
  clientes de prueba de `/herramientas/` son ficticios.
- **No usar colores de BICE** fuera del identificador de la alianza.
- **No usar transparencias** sobre color (`rgba` en fondos, bordes o textos,
  `opacity` en piezas visibles). Las sombras sí llevan transparencia.
- **Sobre el Azul de Zúrich `#2167AE` solo va texto blanco** (5,81:1). El
  `--texto-invertido-suave` da 4,36:1 ahí y no cumple: es solo para azul oscuro.
- **No tocar GitHub, Cloudflare ni dominios** sin que él lo pida.

## Cómo está hecho

- HTML estático y módulos ES nativos, **sin dependencias**. La carpeta es la
  dirección. Cada `index.html` declara `data-pagina` y `data-id`; todo arranca
  en `assets/js/entrada.js`.
- **Una sola fuente de contenido:** `assets/js/catalogo.js`. Para cambiar un
  texto, un precio o una promoción, se cambia ahí.
- Lo que decide el administrador se guarda **solo como diferencia** sobre el
  catálogo (`estado.js`).
- Orígenes que pueden cargarse en el marco: `ORIGENES_PERMITIDOS` en
  `paginas/configuracion.js`, `frame-src` **y** `payment` de
  `Permissions-Policy` en `_headers`. Se cambian juntos. Hoy: `*.zurich.cl`,
  `*.chilena.cl` (formulario de pago) y `edge.sitecorecloud.io` (PDF), más
  `'self'` en `frame-src` para los cotizadores de demostración.
- Sin estilos ni scripts en línea: la política de seguridad los bloquea.
- **Cotizadores de demostración** (`/herramientas/<producto>/<paso>/`): mismo
  sitio, por eso `frame-src` lleva `'self'` y su marco va sin `sandbox`.
  Hablan con el sitio por `postMessage` (`herramientas/assets/js/marco.js`):
  el paso (nombre de la carpeta, igual a los `pasos` del catálogo), el fin, el
  alto y el foco. Leen el catálogo (`/assets/js/catalogo.js`) para coberturas,
  precios y la promoción Zurich Days (`promocion.js`: solo a 24 meses y solo
  en las fechas de sus bases), y la sesión del sitio para precargar el correo.
  Una sola UF para toda la maqueta (`datos.js › UF`), la que publica zurich.cl.
  En planes cuentan además el contexto (`tipo: 'contexto'`: plan, deducible y
  precios) y aceptan `{ fuente: 'zurich-sitio', tipo: 'elegir' }` del sitio.
  `?paso=<paso>` en la página del cotizador abre la demostración en ese paso.
- **MatIAs** (`assets/js/matias/`): `lanzador.js` (siempre, liviano),
  `panel.js` (se carga al abrir), `motor.js` (interpreta y pinta; sin modelo
  generativo), bibliotecas `inicio.js` (conserje), `auto.js`, `hogar.js`,
  `servicio.js`, y `puente.js` (contexto del marco). Lo que dice sale del
  catálogo: productos, y `AYUDA`/`CANALES` (Centro de Ayuda de zurich.cl,
  leído el 10-10-2026). Para que responda algo nuevo: el texto va al
  catálogo y los disparadores a la biblioteca. Se apaga en Configuración.
- **Datos para probar** (`assets/js/datos-prueba.js`): los datos de cada paso
  están en **una sola tabla**, `herramientas/assets/js/prueba-pasos.js`, que
  leen el sitio (para mostrarlos) y el cotizador (para «Completar este paso»,
  `{ fuente: 'zurich-sitio', tipo: 'rellenar' }` → responde
  `{ tipo: 'rellenado', campos }`). Los clientes salen de `clientes-demo.js`.
  Si un paso cambia sus campos, se cambia esa tabla.

## Antes de cada commit

```
node _herramientas/verificar.mjs
```

Debe terminar en 0 fallas. Recorre todo de forma recursiva (nunca una lista
escrita a mano), en 1440, 820 y 390 px, prueba los flujos y mide el contraste
de lo pintado. Si se agrega una página, se agrega sola al recorrido. Sirve el
sitio con las cabeceras de `_headers` y reemplaza las herramientas de Zurich
por una página simulada (desde aquí zurich.cl está bloqueado). Hace las tres
compras completas dentro del sitio (Auto, Hogar y Urgencias). En esta
máquina: `PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright/index.mjs`.

## Trampas conocidas

- `[hidden]` necesita `display: none !important` (ya está en el CSS).
- Textos `.sr` dentro de un contenedor con desplazamiento escapan y ensanchan
  la página en el celular si el contenedor no tiene `position: relative`.
- `aspect-ratio` + `min-height` en una foto fuerza un ancho mínimo y desborda
  en el celular.
- Las columnas de una rejilla de una sola pista van en `minmax(0, 1fr)`, no
  `1fr`: con `1fr` un contenido largo empuja la página.
- Un `allow="payment"` en un marco cuyo dominio no está en `payment` de
  `Permissions-Policy` hace que el navegador avise en consola.
- Chrome no muestra un PDF dentro de un marco con `sandbox`: el del reembolso
  va sin aislar.
- Una página de otro dominio no se puede recortar desde fuera. Para «solo el
  formulario» se necesita la dirección del formulario, no un truco de
  posición.
- Las pantallas de `/herramientas/` necesitan estado: sin `?demo=1` rebotan al
  primer paso. El verificador las recorre con `?demo=1`.
- La barra de pasos del sitio ya marca el primer paso antes de que el
  cotizador cargue: para saber que el cotizador corrió, esperar el alto
  (`.marco__lienzo[data-alto="auto"]`), no el primer paso.
- Un botón que el módulo marca al cargar (volver a un paso) hacía un fundido
  que el medidor de contraste pillaba a medias: `temprano.js` pone `cargando`
  y el CSS apaga las transiciones hasta dos cuadros después de `load`.
- El lanzador de MatIAs se monta después de pintar la página: en las pruebas,
  esperarlo (`waitForSelector('#matias-lanzador')`), no darlo por puesto.
- En el celular MatIAs no se abre solo sobre los precios (los taparía): la
  conversación sigue cuando la persona toca el botón.
- Las respuestas de MatIAs se cuentan en todo el panel
  (`.matias .burbuja--bot`): una pregunta de servicio cambia de espacio y su
  respuesta aparece en la otra conversación.
- «Completar este paso» es asíncrono: esperar su aviso
  (`.caja-prueba [data-prueba-estado]`) antes de leer los campos.
- En el CSS, una regla de celular para una pieza tiene que ir **después** de
  su regla base: con la misma especificidad gana la última (las fichas de
  datos para probar no se apilaban por eso).
- En el celular, con la barra de «Cotizar» abajo (ficha del producto), el
  botón fijo de datos para probar no se muestra: taparía la página.
