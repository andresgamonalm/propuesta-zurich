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
