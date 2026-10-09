# Traspaso · de qué se trata y qué se hizo

Este documento sirve para retomar el trabajo en un chat nuevo sin perder nada.
Las reglas permanentes están en `CLAUDE.md`; aquí está la historia, el estado y
lo que sigue. Al final hay un texto listo para pegar en el chat nuevo.

---

## 1 · De qué se trata

Zurich Chile participa en una licitación de Banco BICE. La propuesta es un
**mini sitio de seguros Zurich para los clientes de Banco BICE**, que vive en
un subdominio y se abre desde el espacio privado del banco. Reúne en un solo
lugar:

- los productos de Zurich, con su promoción o precio arriba;
- los cotizadores oficiales de Zurich, cargados dentro del sitio;
- los trámites (denunciar un siniestro, pedir un reembolso, pagar);
- las asesorías para los seguros de vida que no se contratan en línea;
- Mundo Zurich y la explicación de qué hace cada compañía en la alianza.

Zurich es quien vende, emite y atiende. Banco BICE facilita el acceso. La marca
que manda es Zurich; BICE aparece solo como aliado.

Quien pide el trabajo: **Andrés Gamonal** (Marketing y Ecommerce, Zurich
Chile). No es técnico. Se le habla en castellano y sin jerga.

## 2 · Con qué se construyó

| Fuente | Qué se tomó |
|---|---|
| Brief «Propuesta de contenidos · Estructura y contenidos del mini sitio de seguros Zurich para Banco BICE» (`Brief-Zurich-Bice.docx`, octubre 2026) | Estructura, secciones, textos de portada, acceso y alianza, reglas editoriales, medición, protocolo de revisión |
| Apunte `Como_se_construyo_el_ecommerce_de_seguros.docx` y repositorio `andresgamonalm/piloto-ecommerce-zurich` | La forma de construir: HTML estático sin dependencias, la carpeta es la dirección, una sola fuente de contenido, medición con `dataLayer`, verificación automática en tres anchos y auditoría de contraste |
| Skill `lineamientos-marca-zurich` (Brandbook Zurich 2024) | Colores, tipografía, logo, formas, fotografía, contraste |
| Drive · Marca Zurich (`15qA06PcR7EkiX0kHCWfHbZZD_2IUMG7Y`) | Logos Zurich y fotos (`assets/img/marca`, `assets/img/fotos`) |
| Drive · Marca BICE (`11zs7uQlMxJeL-QCbJ9ex0srMRVKjzJDG`) | Logo de Banco BICE (solo existe azul sobre blanco) |
| Páginas oficiales de zurich.cl, leídas el 9 de octubre de 2026 | Todo el contenido de productos: coberturas, precios «desde», promociones y sus bases, preguntas. Nada se redactó |

## 3 · Lo que Andrés decidió (no se reabre)

1. **Cabecera blanca con los logos a color.** Es la versión secundaria de la
   marca, por excepción: el logo de BICE solo existe azul sobre blanco.
2. **Promoción de Auto Digital:** él dejó la decisión a criterio. Se usan las
   bases oficiales («2 cuotas gratis + gift card de $60.000», del 1 al 10 de
   octubre de 2026). La página del producto dice «3 cuotas»; mandan las bases.
3. **Entrega en el repositorio.** Él conecta Cloudflare Pages cuando quiera.
   Antes quiere verlo en su computador: para eso están los lanzadores.
4. **Repositorio público.** Los logos y fotos vienen de sus carpetas de Drive.
5. **Lógica promocional:** en cada producto, el gancho (promoción o precio) va
   arriba, junto al nombre y al botón.
6. **Cotizadores y trámites dentro del sitio** (9 de octubre de 2026): pidió
   intentar cargarlos dentro del mini sitio y, después, **usar solo la parte
   del formulario o del flujo**, para que el resto de la propuesta se mantenga:
   **el flujo a un lado y, al otro, una promoción o un aviso**.

## 4 · Qué se construyó

Repositorio `andresgamonalm/propuesta-zurich`, rama
`claude/magical-newton-n0tjyb`. No se ha abierto solicitud de cambios ni se ha
publicado.

**34 páginas** (más la 404):

| | Dirección |
|---|---|
| Acceso | `/login/` (cualquier correo entra como cliente; `hola@andresgamonal.com` entra como administrador) |
| Portada | `/home/` |
| Catálogo y 4 ramos | `/personas/`, `/personas/auto/`, `/personas/hogar/`, `/personas/vida-y-salud/`, `/personas/bienes-y-viaje/` |
| 8 productos | Auto Digital, SOAP 2026, Celular Protegido, Hogar Fácil Plus, Protección Urgencias, Oncológico Familiar, Temporal Plus, Mi Vida + Salud |
| 5 cotizadores integrados | `/personas/auto/cotizador/auto-digital/datos/`, `…/soap/patente/`, `/personas/bienes-y-viaje/cotizador/celular-protegido/equipo/`, `/personas/hogar/cotizador/hogar-facil-plus/datos/`, `/personas/vida-y-salud/cotizador/proteccion-urgencias/datos/` |
| 3 asesorías y su confirmación | `/personas/vida-y-salud/asesoria/<producto>/` y `…/enviada/` |
| 4 trámites integrados | `/servicios/denuncia-vehiculo/`, `/servicios/denuncia-vida/`, `/servicios/reembolso/`, `/servicios/pago/` |
| Otras | `/servicios/`, `/alianza/`, `/mundo-zurich/`, `/configuracion/` (solo administrador) |

**Cómo funciona por dentro**

- `assets/js/catalogo.js` es la única fuente de contenido.
- `assets/js/estado.js` guarda solo lo que el administrador cambia: mostrar u
  ocultar, cambiar la dirección de destino y activar la carga dentro del sitio.
- `assets/js/paginas/integracion.js` es el marco de los cotizadores y
  trámites.
- `assets/js/medicion.js` registra los eventos con el formato
  `<ámbito>_<verbo>_<objeto>`.
- **Configuración** (solo administrador) tiene cuatro pestañas: Contenidos,
  Solicitudes de asesoría, Medición con descarga CSV y Pendientes (43
  definiciones antes de producción).
- **Seguridad:** `_headers` lleva la política de seguridad. Solo se pueden
  cargar dentro del sitio los dominios de Zurich, y esa lista se cambia junto
  con `ORIGENES_PERMITIDOS` en `assets/js/paginas/configuracion.js`.

**Entregables** en `_entregables/`:

- documentación general y técnica (Word, 7 páginas);
- descripción publicitaria (Word, 4 páginas);
- 6 capturas de pantalla y una portada de presentación;
- íconos (`.ico` y PNG de 1000 px).

## 5 · Cómo verlo y comprobarlo

- **Verlo:** doble clic en `Abrir-el-sitio.cmd` (Windows) o
  `Abrir-el-sitio.command` (Mac). Abre `http://127.0.0.1:5178/login/`.
- **Comprobarlo:** `node _herramientas/verificar.mjs` (en esta máquina, con
  `PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright/index.mjs`).
  Recorre todas las páginas en 1440, 820 y 390 px, prueba los flujos y mide el
  contraste. Debe terminar en 0 fallas. Registro en `REVISION.md`.

## 6 · Cronología de la conversación

1. **Encargo inicial:** armar la propuesta con el brief, el apunte del
   cotizador, el repositorio piloto, el skill de marca y los materiales de
   Drive. Antes de construir se le presentó el plan y se pidió su OK.
2. **Respuestas de Andrés:**
   - cabecera blanca con logos a color;
   - la promoción queda a criterio;
   - entrega en el repositorio, con versión local para verla antes;
   - repositorio público.
3. **A mitad de la construcción** pidió visitar las páginas de zurich.cl para
   ordenar el contenido con lógica promocional. Se leyeron todas y el gancho
   de cada producto pasó arriba.
4. **Construcción y revisión integral** con 622 comprobaciones y 0 fallas.
   Los defectos encontrados y corregidos están en `REVISION.md`. Se entregaron
   los documentos, las capturas y los íconos (commit `ed3e12b`).
5. **«¿No puedes tratar de embeber los cotizadores o las herramientas de
   siniestro?»** Se revisó, herramienta por herramienta, si los sitios de
   Zurich permiten cargarse dentro de otro sitio (detalle en la sección 7).
6. **«Usa solo la parte de los formularios o los flujos… El flujo a un lado y
   al otro una promoción o un aviso.»** Hecho: sección 8.
7. **«Deja escrito de qué se trata y todo lo que hiciste para abrir luego otro
   chat»:** este documento.

## 7 · ¿Se pueden cargar las herramientas de Zurich dentro del sitio?

Revisión del 9 de octubre de 2026, hecha con las cabeceras públicas de cada
dirección (escaneos de securityheaders.com). Un sitio puede impedir que lo
carguen dentro de otro con `X-Frame-Options` o `frame-ancestors`; ninguna de
estas direcciones lo hace.

| Herramienta | Dirección revisada | Resultado |
|---|---|---|
| Auto Digital, SOAP, Celular Protegido, Hogar Fácil Plus, Protección Urgencias | páginas de producto en `www.zurich.cl` | Se pueden cargar. La política de seguridad de zurich.cl está solo en modo informe. **No se usan:** traen el menú y el pie de zurich.cl |
| Cotizador de Celular Protegido | `celularprotegido.zurich.cl/cl/` (lleva a un recorrido nuevo en cada visita) | Se puede cargar. Es solo el flujo |
| Denuncia de vehículo | `clientes.zurich.cl/Portalclientes/denuncios/motors` | Se puede cargar. Sus cookies no declaran `SameSite`: puede perder la sesión dentro del marco |
| Siniestro de vida | `www9.zurich.cl/vida/web/Portal/productos/life/reembolso/0` | Se puede cargar |
| Reembolso (PDF) | `edge.sitecorecloud.io/…/formulario-reembolso-asistencia-gi-zchnov2022.pdf` | Se puede cargar. En iPhone un PDF dentro de un marco se ve mal: se mantiene el botón de descarga |
| Pago | La página `www.zurich.cl/conocenos/pago-en-linea` informa. El formulario real de pago está en `www9.chilena.cl/vida/web/Portal/pagoexpress/ingreso` | Ambas se pueden cargar |
| Portal de compra del SOAP | `soap.zurich.cl` (arranca pidiendo la patente) | No se pudo revisar: su filtro de seguridad (Imperva) bloqueó el escáner. Se carga igual; si no aparece, se apaga en Configuración |

**Límites de esta revisión**

- Desde el entorno de trabajo no se puede abrir zurich.cl: la red lo bloquea.
  Por eso no se vio ninguna herramienta funcionando dentro del marco. Hay que
  probarlo en el computador de Andrés con el lanzador.
- **Riesgos que tiene que confirmar TI de Zurich:**
  - Safari y las cookies de terceros, junto con el desafío anti-robots de
    Imperva, pueden cortar un flujo a mitad de camino.
  - Puede haber código que intente sacar la página del marco. El marco lo
    bloquea porque no tiene permiso para navegar la página principal.
  - Falta la dirección directa del cotizador de Auto Digital, Hogar Fácil
    Plus y Protección Urgencias, sin la página de producto alrededor.
  - Si un flujo lleva el pago a otro dominio (Webpay u otro), ese paso no
    carga dentro del marco hasta agregar ese dominio o abrirlo aparte.
  - El contrato de eventos por paso (`postMessage`) tiene que implementarlo
    Zurich.

## 8 · En qué quedó

**Lo que se pidió:** dentro del sitio, mostrar **solo el formulario o el flujo**
de Zurich, no la página completa con su menú y su pie, para que la cabecera,
los pasos y el pie de la propuesta se mantengan. Al lado del flujo va una
promoción o un aviso.

**La limitación técnica, dicha en simple:** una página de otro dominio cargada
en un marco no se puede recortar desde fuera. «Solo el formulario» exige la
dirección que ya es solo el formulario. Recortar por posición se descartó: se
rompe cuando Zurich cambia su página o el ancho de la pantalla y puede tapar
textos legales.

**Lo que se hizo (9 de octubre de 2026):**

| Herramienta | Qué se ve dentro del marco | Al lado |
|---|---|---|
| SOAP 2026 | Portal de compra `soap.zurich.cl` | Promoción «Tu SOAP 2026 desde $5.690*» |
| Celular Protegido | Cotizador `celularprotegido.zurich.cl/cl/` | Promoción «Protege tu celular desde $29.990*» |
| Auto Digital | Vista referencial (primera pantalla): falta la dirección del formulario | Oferta Zurich Days, hasta el 10-10-2026 |
| Hogar Fácil Plus | Vista referencial: falta la dirección del formulario | Gancho «5 planes · Incendio, sismo y robo» |
| Protección Urgencias | Vista referencial: falta la dirección del formulario | Concurso «Año de supermercado» y «Desde $13.900*» |
| Denuncia de vehículo | Formulario del Portal de Clientes | Aviso «Antes de denunciar» y Mundo Zurich |
| Denuncia de vida | Formulario de `www9.zurich.cl` | Mundo Zurich |
| Reembolso | El PDF oficial, con botón de descarga siempre a la vista | Aviso «Cómo se envía» y Mundo Zurich |
| Pago | Formulario de pago de `www9.chilena.cl` | Aviso «Antes de pagar» y Mundo Zurich |

- En celular, el flujo va primero y la promoción o el aviso debajo.
- **El marco tiene tres ayudas:**
  - un aviso «Cargando…» mientras llega el formulario;
  - un enlace para abrirlo en una pestaña nueva;
  - si a los 15 segundos no cargó, el aviso deja de tapar y ofrece la
    pestaña nueva.
- **Desde Configuración** el administrador puede pegar otra dirección de
  formulario o volver a la vista referencial. Es lo que hay que hacer cuando
  TI de Zurich entregue las tres direcciones que faltan.
- **Verificación:** 637 comprobaciones, 0 fallas. El verificador sirve el
  sitio con la misma política de seguridad que se publica. Así encontró un
  choque real: el permiso de pago solo se delegaba a `www.zurich.cl`. Ya está
  corregido.

**Lo que queda pendiente:**

1. **Andrés** prueba en su computador con el lanzador. Esto no se pudo ver
   desde el entorno de trabajo porque la red bloquea zurich.cl.
   - Revisar que carguen SOAP, Celular Protegido, la denuncia de vehículo, la
     denuncia de vida, el reembolso y el pago.
   - Si alguno sale en blanco, se apaga en Configuración › Contenidos.
2. **Pedir a TI de Zurich:**
   - la dirección del formulario de Auto Digital, Hogar Fácil Plus y
     Protección Urgencias;
   - la pasarela de pago de cada flujo;
   - si la sesión se mantiene dentro del marco en Safari;
   - si implementan el aviso de pasos (`postMessage`).
3. **Lo demás está en Configuración › Pendientes:** 50 definiciones antes de
   producción.

## 9 · Registro de cambios posteriores

| Fecha | Cambio |
|---|---|
| 9-10-2026 | Se crea este traspaso (antes de implementar la sección 8) |
| 9-10-2026 | Solo el formulario dentro del marco, con promoción o aviso al lado; verificador con las cabeceras de `_headers`; documentos y captura actualizados |

## 10 · Para empezar el próximo chat

Pegar esto:

> Retomamos la propuesta del mini sitio de seguros Zurich para Banco BICE.
> El repositorio es `andresgamonalm/propuesta-zurich`, rama
> `claude/magical-newton-n0tjyb`. Lee primero `CLAUDE.md` y `TRASPASO.md`:
> ahí están las reglas, las decisiones que ya tomé, lo construido y en qué
> quedó. Sigue desde la sección «En qué quedó» y el registro de cambios.
> Antes de cada commit corre `node _herramientas/verificar.mjs` y deja 0
> fallas.
