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
