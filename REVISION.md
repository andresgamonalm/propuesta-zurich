# Registro de revisión integral

Exigido por el brief (§Protocolo obligatorio de revisión integral). Cada
revisión registra qué se recorrió, con qué fuente de marca y qué se corrigió.

## Revisión 1 · 9 de octubre de 2026

**Fuente de marca:** skill `lineamientos-marca-zurich` (Brandbook Zurich 2024),
consultado el 9 de octubre de 2026 en la copia sincronizada de la sesión
(`.claude/skills/synced/…/lineamientos-marca-zurich`: `SKILL.md`,
`references/identidad-visual.md`, `cabecera-y-medidas.md`,
`contraste-y-accesibilidad.md`, `activos-y-rutas.md`).

**Contenido:** páginas oficiales de zurich.cl leídas el 9 de octubre de 2026:
auto-digital, soap, celular-protegido, hogar-facil-plus,
proteccion-urgencias, oncologico-familiar-directo, temporal-plus,
vida-mas-salud, mundo-zurich, ayudas, pago-en-linea y la portada (bases de
campañas vigentes).

### 1 · Inventario

| | |
|---|---|
| Páginas | 34 (33 privadas + acceso) y 404 |
| Plantillas | acceso, portada, catálogo/ramo, producto, integración (cotizador y trámite), asesoría, confirmación, servicios, alianza, Mundo Zurich, configuración, error |
| Perfiles | usuario (cualquier correo) y administrador (`hola@andresgamonal.com`) |
| Integraciones | 5 cotizadores y 4 trámites, en modo referencial y en modo embebido |
| Estados | carga, vacío, error de validación, envío, éxito, deshabilitado, foco, contenido oculto, acceso restringido, sesión vencida, promoción vencida, 404 |
| Anchos | 1440 (escritorio), 820 (tablet), 390 (celular); cabecera además en 1320, 1200 y 1170 |

### 2 · Verificación automática

`node _herramientas/verificar.mjs` → **622 comprobaciones correctas, 0 fallas.**

- 34 páginas × 3 anchos: sin errores de consola, sin recursos rotos, sin
  desborde horizontal, cabecera sin desborde y un solo `h1` por página.
- 31 destinos internos: todos existen.
- Flujos: acceso con vuelta a la ruta pedida, errores de correo, acceso
  restringido, sesión vencida, asesoría (validación, envío, confirmación, URL
  sin datos personales), carrusel, cajón móvil, menús con Escape, ocultar un
  trámite y su efecto en la vista de cliente, rechazo de dominio no permitido,
  medición por paso, descarga CSV y promoción vencida.
- Contraste AA de lo pintado: 2.901 textos en todas las páginas y pestañas.
  El auditor comprueba que midió la página que pidió.

### 3 · Revisión visual

Capturas completas de todas las páginas en los tres anchos, revisadas a ojo.

### 4 · Defectos encontrados y corregidos

| Defecto | Corrección |
|---|---|
| El menú se partía en dos líneas en escritorio | Textos sin corte, texto de la cuenta solo desde 1480 px, menú móvil bajo 1160 px |
| Círculo de iniciales recortado | El avatar no se encoge |
| Formas de marca sobre el texto en el acceso | Espacio reservado y formas más chicas |
| Tarjeta destacada con hueco vertical | Tarjeta horizontal de dos columnas |
| Precio de tarjetas sin el azul | Especificidad del selector |
| Desborde en celular por tablas | Los textos para lector de pantalla escapaban del contenedor con desplazamiento |
| Desborde en celular por foto | `aspect-ratio` + `min-height` forzaba un ancho mínimo |
| Columnas de una pista que empujaban la página | `minmax(0, 1fr)` |
| Texto secundario sobre el azul héroe a 4,36:1 | Blanco (5,81:1) |
| Etiqueta «Oferta del mes» a 4,18:1 | Fondo azul oscuro |
| Ícono del documento gigante en Reembolso | Tamaño fijo para íconos en títulos |
| Página de acceso restringido marcada «cargando» | Se retira `aria-busy` |
| Vista previa con ayuda duplicada y campos de altura distinta | Sin marcador repetido; campos alineados arriba |

### 5 · Pendientes materiales

43 definiciones antes de producción, listadas en Configuración › Pendientes.
Mientras existan, el sitio es una propuesta y no se declara listo para
publicar. Las que más pesan:

- Autenticación definitiva y relación con la sesión privada de Banco BICE.
- Permiso de cada herramienta de Zurich para cargarse en un marco.
- Herramienta de analítica.
- Textos legales: rol de cada compañía, privacidad, consentimiento, cookies.
- Nombres oficiales: Protección Urgencias, Oncológico Familiar Directo, Mi Vida + Salud.
- Destino de «Denunciar un siniestro de vida»: la URL entregada es de reembolsos.
- Destino de «Solicitar un reembolso»: el PDF entregado es de asistencias.
- Vigencia de las promociones para clientes de Banco BICE.

## Revisión 2 · 9 de octubre de 2026

**Pedido:** cargar los cotizadores y los trámites dentro del sitio usando
**solo el formulario o el flujo** de Zurich, no la página completa de
zurich.cl, con el flujo a un lado y una promoción o un aviso al otro.

**Fuentes revisadas el 9 de octubre de 2026:** cabeceras públicas de cada
herramienta (escaneos de securityheaders.com) y páginas de zurich.cl para
encontrar las direcciones que son solo el formulario.

### 1 · Qué cambió

| | |
|---|---|
| Cargan su formulario dentro del sitio | SOAP (`soap.zurich.cl`), Celular Protegido (`celularprotegido.zurich.cl/cl/`), denuncia de vehículo, denuncia de vida, reembolso (PDF) y pago (`www9.chilena.cl/…/pagoexpress/ingreso`) |
| Vista referencial | Auto Digital, Hogar Fácil Plus y Protección Urgencias: su dirección de formulario no es pública. Cargar la página del producto taparía la propuesta con el menú de zurich.cl |
| Al lado del flujo | Cotizadores: la promoción vigente, el concurso con el precio o el gancho del producto. Trámites: el aviso de qué hacer antes de empezar y Mundo Zurich |
| Marco | Aviso de carga, salida a pestaña nueva, y si a los 15 s no cargó, el aviso deja de tapar y ofrece la pestaña nueva |
| Seguridad | `frame-src` y `ORIGENES_PERMITIDOS` suman `*.chilena.cl`. `Permissions-Policy` delega el pago solo a `*.zurich.cl` y `*.chilena.cl` |

### 2 · Verificación automática

`node _herramientas/verificar.mjs` → **637 comprobaciones correctas, 0 fallas.**
Contraste AA de lo pintado: 2.911 textos.

Novedades del verificador:

- Sirve el sitio con las mismas cabeceras de `_headers` que publica
  Cloudflare. Así, un choque con la política de seguridad falla aquí y no en
  producción.
- Reemplaza las herramientas de Zurich por una página simulada, porque desde
  el entorno de trabajo no se puede abrir zurich.cl.
- Prueba:
  - que se carga solo el formulario;
  - que la promoción queda al lado en escritorio;
  - que sin dirección de formulario no se carga la página del producto;
  - que la política de seguridad deja cargar el pago;
  - que el PDF no va aislado;
  - el aviso de demora.

### 3 · Defectos encontrados y corregidos

| Defecto | Corrección |
|---|---|
| El permiso de pago solo se delegaba a `www.zurich.cl`: el navegador avisaba en cada marco de otro dominio | Delegado a `*.zurich.cl` y `*.chilena.cl`; el marco del PDF no pide permisos |
| Chrome no muestra un PDF dentro de un marco aislado | El PDF va sin aislar; el origen sigue limitado por `frame-src` |
| En Protección Urgencias el concurso tapaba el precio | El precio va debajo del concurso |
| «Bases de la promoción» no parecía desplegable | Flecha que gira al abrir |

### 4 · Lo que no se pudo comprobar

- Ninguna herramienta real se vio funcionando dentro del marco: la red del
  entorno de trabajo bloquea zurich.cl. Hay que probarlo con el lanzador en un
  computador.
- `soap.zurich.cl` no se pudo revisar: su filtro de seguridad bloqueó el
  escáner.
- Pendientes: 50 definiciones en Configuración › Pendientes (antes 43). Las
  nuevas son:
  - la dirección del formulario de tres cotizadores;
  - la sesión dentro del marco en Safari;
  - las pasarelas de pago dentro del marco.

## Revisión 3 · 10 de octubre de 2026

**Pedido:** que los cotizadores funcionen de punta a punta. Auto Digital y
Hogar Fácil Plus con el flujo del piloto de ecommerce; se suma Protección
Urgencias, armado con las mismas piezas.

**Fuentes:** el repositorio del piloto (`piloto-ecommerce-zurich`, solo
lectura) y el catálogo del sitio (zurich.cl, leído el 9 de octubre de 2026).
Marca: skill `lineamientos-marca-zurich`.

### 1 · Qué cambió

| | |
|---|---|
| Cotizadores de demostración | 17 pantallas en `/herramientas/`: Auto (6), Hogar (6) y Urgencias (5). Se cargan en el marco con la promoción o el gancho al lado, y se rotulan «Demostración» |
| Contenido | Coberturas, precios publicados y la promoción salen del catálogo. Zurich Days solo a 24 meses y solo del 1 al 10 de octubre. Hogar y Urgencias sin promoción, porque no hay una publicada |
| Datos | Clientes de prueba ficticios. Se retiraron del código portado cuatro filas con nombres reales y las promociones por persona del piloto (no son públicas) |
| Marco | Dentro del sitio el cotizador esconde su cabecera, pasos y pie; avisa el paso, el fin, el alto y el foco. El sitio avanza su barra de pasos y mide cada paso |
| Seguridad | `frame-src` suma `'self'`. El marco de un cotizador del mismo sitio va sin `sandbox` (con `allow-same-origin` no aislaría nada y el navegador avisa) |
| Configuración | Desmarcar «Cargar dentro del sitio» vuelve a la vista referencial |

### 2 · Verificación automática

`node _herramientas/verificar.mjs` → **996 comprobaciones correctas, 0 fallas.**
51 páginas y pantallas × 3 anchos. Contraste AA de lo pintado: 4.525 textos.

Novedades del verificador:

- recorre y mide el contraste de las 17 pantallas de los cotizadores (con
  `?demo=1`, que las abre con estado completo), y además las de Auto con la
  promoción a 24 meses;
- hace **las tres compras completas dentro del sitio**: Auto a 1440, Hogar a
  820 y Urgencias a 390. Comprueba que la barra de pasos de arriba llegue a
  cada paso, que el marco tome el alto, que el correo llegue precargado, que
  la compra quede medida, sin errores y sin desborde;
- comprueba que Urgencias rechace beneficiarios que no suman 100%;
- comprueba que Zurich Days aparezca el 5 de octubre y no el 15;
- comprueba que apagar la carga vuelva a la vista referencial.

### 3 · Defectos encontrados y corregidos

| Defecto | Corrección |
|---|---|
| La política de seguridad no dejaba cargar el cotizador del propio sitio | `frame-src` suma `'self'` |
| Aviso del navegador por `sandbox` con `allow-scripts` y `allow-same-origin` | El cotizador del mismo sitio va sin aislar |
| Los planes se apilaban dentro del marco en escritorio | Tres columnas entre 681 y 900 px |
| Tarjeta dentro de tarjeta en el marco | El panel del cotizador va sin borde dentro del marco |
| «gift card apprecio» en minúscula | Respeta las mayúsculas de la marca |
| Quedaba el error «suman 90%» después de corregir | Se limpia al llegar a 100 |
| «ya estás protegido» (con género) | «tu seguro quedó contratado» |
| UF con dos decimales en Urgencias | Tres, como la publica zurich.cl |
| Textos heredados del piloto («Este prototipo», «oferta ya descontada», plazos no publicados) y «El más elegido» sin respaldo | Retirados o cambiados por «El más completo» y «Recomendado» |
| Hogar y Urgencias ofrecían «probar con patente» | Las patentes de prueba solo en Auto |
| Al volver a Beneficiarios, «Sí, ahora» hacía un fundido desde «Después» | Sin transiciones mientras la pantalla se arma |
| Dos valores de UF distintos entre cotizadores | Una sola UF: la que publica zurich.cl ($40.983,58) |
| La prueba de Hogar fallaba a veces: marcaba la casilla con un clic forzado en un punto que la cabecera fija del sitio podía tapar | La prueba toca el texto visible de la casilla, como una persona, y comprueba que quede marcada (8 de 8 repeticiones) |

### 4 · Revisión visual

Hogar a 1440 y Urgencias a 390, dentro del sitio, pantalla por pantalla.
Auto a 1440 y 390. Sin cortes, sin superposiciones; el modal de documentos
queda a la vista dentro del marco.

### 5 · Lo que no se pudo comprobar

- Los precios son simulados (Auto y Hogar) o referenciales publicados
  (Urgencias): no son tarifa.
- SOAP, Celular Protegido, las denuncias, el reembolso y el pago siguen
  cargando las herramientas reales de Zurich, que no se pueden abrir desde el
  entorno de trabajo.
- Pendientes: 54 definiciones en Configuración › Pendientes.
