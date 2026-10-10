# Seguros Zurich para clientes de Banco BICE

Propuesta de mini sitio para la licitación Zurich–Banco BICE: productos,
cotizadores y servicios de Zurich en un solo espacio, dentro del entorno
privado del banco, con roles de marca claramente diferenciados.

**Estado:** prototipo navegable, listo para revisión. No publicado.

## Abrirlo en tu equipo

- **Windows:** doble clic en `Abrir-el-sitio.cmd`
- **Mac:** doble clic en `Abrir-el-sitio.command`

Se abre `http://127.0.0.1:5178/login/`. Para entrar como administrador usa
`hola@andresgamonal.com`; cualquier otro correo entra como cliente. Necesita
Python o Node instalados en el equipo (el lanzador lo resuelve solo).

## Qué hay

| | |
|---|---|
| 34 páginas | Acceso, portada, catálogo y 4 ramos, 8 productos, 5 cotizadores y 4 trámites integrados, 3 asesorías con su confirmación, alianza, Mundo Zurich, configuración y 404 |
| MatIAs, tu IA de seguros | Botón en todas las páginas: vende Auto y Hogar (reconoce al cliente y lo lleva a sus precios, conversa del plan en pantalla) y responde dudas de servicio con el Centro de Ayuda de zurich.cl. No inventa: elige entre respuestas aprobadas |
| 3 cotizadores de demostración | Auto Digital y Hogar Fácil Plus (flujo del piloto de ecommerce) y Protección Urgencias: 17 pantallas en `/herramientas/` que funcionan de punta a punta dentro del sitio, con datos ficticios y sin cobro |
| Contenido | Tomado de las páginas oficiales de zurich.cl el 9 de octubre de 2026 (`assets/js/catalogo.js`) |
| Marca | `lineamientos-marca-zurich`, con cabecera blanca y bloqueo de co-branding Zurich–Banco BICE; toques de la paleta secundaria (Cerceta y Durazno) |
| Medición | Eventos `pag` / `click` / `rec` en `window.dataLayer`, visibles en Configuración › Medición |
| Integraciones | Dentro del marco va solo el formulario, con la promoción o el aviso al lado. Seis herramientas cargan el formulario real de Zurich; Auto Digital, Hogar Fácil Plus y Protección Urgencias cargan su cotizador de demostración hasta que Zurich entregue la dirección del suyo |
| Para probar | A la vista en el propio sitio: botón «Datos para probar» abajo a la izquierda (también en el acceso), dentro de cada cotizador, sobre el formulario, el paso en que vas con «Completar este paso», y en el acceso y en MatIAs los datos se escriben con un clic. Clientes ficticios: RUT `10111222-5` (patente `AAAA11`) o `20111222-2` (patente `BBBB22`); la cédula acepta nueve dígitos cualesquiera |
| Pendientes | 60 definiciones antes de producción, listadas en Configuración › Pendientes |

## Verificar

```
node _herramientas/verificar.mjs
```

Recorre todas las rutas en escritorio, tablet y celular, prueba los flujos
(incluidas las tres compras completas dentro del sitio y las conversaciones
de MatIAs) y audita el contraste,
con las mismas cabeceras de seguridad que se publican.
Última ejecución: **1.062 comprobaciones, 0 fallas**.
Detalle en `REVISION.md`.

## Publicar

Cloudflare Pages, sin comando de compilación, con la raíz del repositorio como
salida. Las cabeceras de seguridad están en `_headers`.

## Retomar el trabajo

`TRASPASO.md` explica de qué se trata, qué se decidió, qué se hizo y en qué
quedó. Sirve para abrir otro chat sin perder nada.

## Documentos

En `_entregables/`: documentación general y técnica, descripción
publicitaria (Word), capturas, portada de presentación e íconos.
